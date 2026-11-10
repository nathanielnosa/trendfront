import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { FieldError, FormAlert } from "../../components/FormErrors";
import { ErrorNotice } from "../../components/StateMessage";
import { ImageField } from "../../components/studio/ImageField";
import { RichTextEditor } from "../../components/studio/RichTextEditor";
import { StatusBadge } from "../../components/studio/StatusBadge";
import { WorkflowPanel } from "../../components/studio/WorkflowPanel";
import { Button, Skeleton, TextField, useToast } from "../../components/ui";
import type { Post } from "../../lib/api/blog";
import { useCategories, useTags } from "../../lib/api/queries";
import { toApiError, type ApiError } from "../../lib/api/errors";
import {
  studioApi,
  useDeletePost,
  useMyPost,
  useSavePost,
  useSubmitForReview,
  type PostInput,
} from "../../lib/api/studioPosts";
import "./PostEditor.css";

/** Wait this long after the last change before saving by itself. */
const AUTOSAVE_MS = 4000;

/** A post as the studio sees it: the writer may also see the editor's review notes. */
type StudioPost = Post & { review_notes?: string };

/** Make the form's starting values from an existing post, or empty ones for a new post. */
function initialForm(post: Post | null): PostInput {
  return {
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    featured_image: post?.featured_image ?? null,
    category: post?.category ?? null,
    tags: post?.tags ?? [],
    seo_title: post?.seo_title ?? "",
    seo_description: post?.seo_description ?? "",
    allow_comments: post?.allow_comments ?? true,
    visibility: post?.visibility === "private" ? "private" : "public",
  };
}

/** The page for /studio/new and /studio/:id/edit. It loads the post (when editing) and shows the form. */
export function PostEditor() {
  const { id } = useParams();
  // The id of a post this page just created. The form already holds its content,
  // so we keep it on screen instead of reloading it from the server.
  const [created, setCreated] = useState<string | null>(null);
  const justCreated = Boolean(id) && id === created;

  const { data: post, isPending, error, refetch } = useMyPost(justCreated ? undefined : id);

  if (id && !justCreated && isPending) {
    return (
      <div className="editor" aria-busy="true">
        <Skeleton height="3rem" />
        <Skeleton height="24rem" />
      </div>
    );
  }
  if (id && !justCreated && error) {
    return <ErrorNotice message="We could not open this post." onRetry={() => void refetch()} />;
  }

  // key restarts the form when you move to a different post (but not right after creating one).
  return (
    <EditorForm
      key={justCreated ? "new" : (id ?? "new")}
      post={id && !justCreated ? (post ?? null) : null}
      onCreated={setCreated}
    />
  );
}

/** The form itself: fields, the writing area, manual save and autosave. */
function EditorForm({
  post,
  onCreated,
}: {
  post: StudioPost | null;
  onCreated: (id: string) => void;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const categories = useCategories();
  const tags = useTags();
  const save = useSavePost();
  const submit = useSubmitForReview();
  const remove = useDeletePost();

  const [form, setForm] = useState<PostInput>(() => initialForm(post));
  const [postId, setPostId] = useState<string | undefined>(post?.id);
  const [status, setStatus] = useState<string>(post?.status ?? "draft");
  const [error, setError] = useState<ApiError | null>(null);
  const [slug, setSlug] = useState<string | null>(post?.slug ?? null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(post?.scheduled_at ?? null);
  const [reviewNotes, setReviewNotes] = useState(post?.review_notes ?? "");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // What was last saved, so we know when there are unsaved changes.
  const savedJson = useRef(JSON.stringify(initialForm(post)));
  const dirty = JSON.stringify(form) !== savedJson.current;
  // A copy readable inside event handlers and the navigation guard.
  const savedIdRef = useRef<string | undefined>(post?.id);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  /** Change one field of the form. */
  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  /** Save now. `quiet` is used by autosave, which does not show toasts or errors loudly. */
  async function persist(quiet: boolean): Promise<boolean> {
    if (!form.title.trim() || !form.content.trim() || form.content === "<p></p>") {
      if (!quiet)
        setError(toApiError(new Error("A title and some text are needed before saving.")));
      return false;
    }
    setError(null);
    const sending = JSON.stringify(form);
    try {
      const saved = await save.mutateAsync({ id: postId, input: form });
      savedJson.current = sending;
      setSavedAt(new Date());
      setStatus(saved.status);
      setSlug(saved.slug);
      setScheduledAt(saved.scheduled_at);
      if (!postId) {
        // First save of a new post: move to its edit address without losing the page.
        dirtyRef.current = false;
        setPostId(saved.id);
        savedIdRef.current = saved.id;
        onCreated(saved.id);
        navigate(`/studio/${saved.id}/edit`, { replace: true });
      }
      if (!quiet) toast.success("Saved.");
      return true;
    } catch (caught) {
      if (!quiet) setError(toApiError(caught));
      return false;
    }
  }

  /** Save any pending changes, then send the draft to the editors. */
  async function submitForReview() {
    if (dirtyRef.current || !postId) {
      const ok = await persist(false);
      if (!ok) return;
    }
    // After the first save the new id is in the address; read it from the saved state.
    const id = postId ?? savedIdRef.current;
    if (!id) return;
    try {
      const result = await submit.mutateAsync(id);
      setStatus(result.post.status);
      setReviewNotes("");
      toast.success("Sent to the editors for review.");
    } catch (caught) {
      setError(toApiError(caught));
    }
  }

  /** Delete the post for good and go back to the list. */
  async function deletePost() {
    if (!postId) return;
    try {
      await remove.mutateAsync(postId);
      dirtyRef.current = false;
      toast.success("Post deleted.");
      navigate("/studio", { replace: true });
    } catch (caught) {
      setError(toApiError(caught));
    }
  }

  /** Save by pressing the button or Enter in the title. */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persist(false);
  }

  // Autosave a few seconds after the last change.
  useEffect(() => {
    if (!dirty || save.isPending) return;
    const timer = window.setTimeout(() => void persist(true), AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before closing the tab or leaving the page with unsaved changes.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("You have unsaved changes. Leave without saving?")) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  /** Upload a picture and answer with its address. */
  const upload = async (file: File) => (await studioApi.uploadImage(file)).url;

  const live = status === "published";
  const statusText = save.isPending
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : savedAt
        ? `Saved at ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        : postId
          ? "All changes saved"
          : "Not saved yet";

  return (
    <form className="editor" onSubmit={handleSubmit} noValidate>
      <header className="editor__bar">
        <div className="editor__bar-left">
          <h1>{postId ? "Edit post" : "New post"}</h1>
          <StatusBadge status={status} />
          <span className="muted editor__saved" role="status">
            {statusText}
          </span>
        </div>
        <Button type="submit" loading={save.isPending}>
          {live ? "Save changes" : "Save draft"}
        </Button>
      </header>

      <WorkflowPanel
        status={status}
        scheduledAt={scheduledAt}
        reviewNotes={reviewNotes}
        slug={slug}
        isPublic={form.visibility === "public"}
        saved={Boolean(postId)}
        submitting={submit.isPending}
        deleting={remove.isPending}
        onSubmit={() => void submitForReview()}
        onDelete={() => void deletePost()}
      />
      <FormAlert error={error} />

      <TextField
        label="Title"
        name="title"
        value={form.title}
        onChange={(event) => set("title", event.target.value)}
        error={error}
        maxLength={255}
        required
      />

      <div className="field">
        <label htmlFor="excerpt" className="field__label">
          Short summary
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          className="field__input editor__textarea"
          value={form.excerpt}
          onChange={(event) => set("excerpt", event.target.value)}
        />
        <FieldError error={error} name="excerpt" />
        <p className="muted editor__hint">Shown on cards and in search results.</p>
      </div>

      <ImageField
        value={form.featured_image}
        onChange={(url) => set("featured_image", url)}
        onUpload={upload}
      />
      <FieldError error={error} name="featured_image" />

      <div className="field">
        <p className="field__label">Story</p>
        <RichTextEditor
          value={form.content}
          onChange={(html) => set("content", html)}
          onUploadImage={upload}
          onError={(message) => toast.error(message)}
        />
        <FieldError error={error} name="content" />
      </div>

      <div className="editor__row">
        <div className="field">
          <label htmlFor="category" className="field__label">
            Category
          </label>
          <select
            id="category"
            className="field__input"
            value={form.category ?? ""}
            onChange={(event) => set("category", event.target.value || null)}
          >
            <option value="">No category</option>
            {(categories.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <FieldError error={error} name="category" />
        </div>

        <div className="field">
          <label htmlFor="visibility" className="field__label">
            Who can read it
          </label>
          <select
            id="visibility"
            className="field__input"
            value={form.visibility}
            onChange={(event) =>
              set("visibility", event.target.value === "private" ? "private" : "public")
            }
          >
            <option value="public">Everyone</option>
            <option value="private">Only me</option>
          </select>
        </div>
      </div>

      <fieldset className="editor__tags">
        <legend className="field__label">Tags</legend>
        {tags.data && tags.data.length === 0 && (
          <p className="muted">No tags exist yet. An editor can create them.</p>
        )}
        <div className="editor__chips">
          {(tags.data ?? []).map((tag) => {
            const on = form.tags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                className={on ? "editor__chip editor__chip--on" : "editor__chip"}
                aria-pressed={on}
                onClick={() =>
                  set(
                    "tags",
                    on ? form.tags.filter((item) => item !== tag.id) : [...form.tags, tag.id],
                  )
                }
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="editor__check">
        <input
          type="checkbox"
          checked={form.allow_comments}
          onChange={(event) => set("allow_comments", event.target.checked)}
        />
        Allow comments
      </label>

      <details className="editor__seo">
        <summary>Search engine details (optional)</summary>
        <TextField
          label="SEO title"
          name="seo_title"
          value={form.seo_title}
          onChange={(event) => set("seo_title", event.target.value)}
          error={error}
          maxLength={255}
        />
        <div className="field">
          <label htmlFor="seo_description" className="field__label">
            SEO description
          </label>
          <textarea
            id="seo_description"
            name="seo_description"
            rows={3}
            className="field__input editor__textarea"
            value={form.seo_description}
            onChange={(event) => set("seo_description", event.target.value)}
          />
          <FieldError error={error} name="seo_description" />
        </div>
      </details>
    </form>
  );
}
