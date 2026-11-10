import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import "../blog/ArticleBody.css";
import "./RichTextEditor.css";

/**
 * The writing area. It starts from `value` (HTML) and reports every change
 * through onChange. The text looks the way it will on the post page.
 * onUploadImage must upload a file and answer with its address.
 */
export function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  onError,
}: {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onError: (message: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Tell your story…" }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "article-body rte__content", "aria-label": "Story text" },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  if (!editor) return null;

  /** Ask for an address and put it on the selected text (or remove the link if left empty). */
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const address = window.prompt("Link address", previous ?? "https://");
    if (address === null) return;
    if (address.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: address.trim() }).run();
  };

  /** Upload the chosen picture and place it in the text where the cursor is. */
  async function addImage(file: File | undefined) {
    if (!file || !editor) return;
    try {
      const src = await onUploadImage(file);
      editor.chain().focus().setImage({ src, alt: "" }).run();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not upload the picture.");
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  /** One toolbar button; it lights up when its style is active at the cursor. */
  const button = (
    label: string,
    title: string,
    active: boolean,
    run: () => void,
    disabled = false,
  ) => (
    <button
      type="button"
      className={active ? "rte__button rte__button--active" : "rte__button"}
      aria-label={title}
      title={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={run}
    >
      {label}
    </button>
  );

  return (
    <div className="rte">
      <div className="rte__toolbar" role="toolbar" aria-label="Text formatting">
        {button("B", "Bold", editor.isActive("bold"), () =>
          editor.chain().focus().toggleBold().run(),
        )}
        {button("I", "Italic", editor.isActive("italic"), () =>
          editor.chain().focus().toggleItalic().run(),
        )}
        {button("H2", "Heading", editor.isActive("heading", { level: 2 }), () =>
          editor.chain().focus().toggleHeading({ level: 2 }).run(),
        )}
        {button("H3", "Subheading", editor.isActive("heading", { level: 3 }), () =>
          editor.chain().focus().toggleHeading({ level: 3 }).run(),
        )}
        {button("•", "Bulleted list", editor.isActive("bulletList"), () =>
          editor.chain().focus().toggleBulletList().run(),
        )}
        {button("1.", "Numbered list", editor.isActive("orderedList"), () =>
          editor.chain().focus().toggleOrderedList().run(),
        )}
        {button("❝", "Quote", editor.isActive("blockquote"), () =>
          editor.chain().focus().toggleBlockquote().run(),
        )}
        {button("Link", "Add or edit a link", editor.isActive("link"), setLink)}
        {button("Image", "Insert a picture", false, () => fileInput.current?.click())}
        <span className="rte__spacer" />
        {button(
          "↶",
          "Undo",
          false,
          () => editor.chain().focus().undo().run(),
          !editor.can().undo(),
        )}
        {button(
          "↷",
          "Redo",
          false,
          () => editor.chain().focus().redo().run(),
          !editor.can().redo(),
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void addImage(event.target.files?.[0])}
      />

      <EditorContent editor={editor} />
    </div>
  );
}
