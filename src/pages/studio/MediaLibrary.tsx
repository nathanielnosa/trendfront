import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyNotice, ErrorNotice } from "../../components/StateMessage";
import { Button, Card, Pagination, Skeleton, useToast } from "../../components/ui";
import { errorMessage } from "../../lib/api/errors";
import {
  useDeleteMedia,
  useMediaLibrary,
  useUploadMedia,
  type MediaItem,
} from "../../lib/api/media";
import { formatDate } from "../../lib/format";
import { usePageParam } from "../../lib/usePageParam";
import "../Listing.css";
import "./MediaLibrary.css";
import { StudioNav } from "../../components/studio/StudioNav";

/** Pictures per page (matches the server). */
const PAGE_SIZE = 24;

/** Show a byte count as KB or MB. */
function fileSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** The writer's picture library: upload, copy a link, or delete. */
export function MediaLibrary() {
  const [, setParams] = useSearchParams();
  const [page] = usePageParam();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const { data, isPending, error, refetch } = useMediaLibrary(page);
  const upload = useUploadMedia();
  const remove = useDeleteMedia();

  /** Upload the chosen picture and tell the writer how it went. */
  function onPick(file: File | undefined) {
    if (!file) return;
    upload.mutate(file, {
      onSuccess: () => toast.success("Picture uploaded."),
      onError: (caught) => toast.error(errorMessage(caught, "Could not upload that picture.")),
    });
    if (fileInput.current) fileInput.current.value = "";
  }

  /** Copy a picture's address so it can be pasted into a post. */
  async function copy(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(item.url);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy. Select the address by hand.");
    }
  }

  /** Delete a picture after the writer confirms. */
  function onDelete(item: MediaItem) {
    if (!window.confirm("Delete this picture? This cannot be undone.")) return;
    remove.mutate(item.id, {
      onSuccess: () => toast.success("Picture deleted."),
      onError: (caught) => toast.error(errorMessage(caught, "Could not delete that picture.")),
    });
  }

  /** Change page through the address bar. */
  const onPageChange = (next: number) => {
    setParams(next <= 1 ? {} : { page: String(next) });
    window.scrollTo({ top: 0 });
  };

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  return (
    <div className="listing">
      <StudioNav />
      <header className="listing__header">
        <h1>Media library</h1>
        <p className="listing__lead">Pictures you uploaded. Copy a link to use one in a post.</p>
        <div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="sr-only"
            id="media-file"
            onChange={(event) => onPick(event.target.files?.[0])}
          />
          <Button onClick={() => fileInput.current?.click()} loading={upload.isPending}>
            Upload a picture
          </Button>
        </div>
      </header>

      {isPending && (
        <div className="media-grid" aria-busy="true">
          {[0, 1, 2, 3].map((n) => (
            <Skeleton key={n} height="12rem" />
          ))}
        </div>
      )}

      {error && (
        <ErrorNotice message="We could not load your pictures." onRetry={() => void refetch()} />
      )}

      {data && data.results.length === 0 && (
        <EmptyNotice title="No pictures yet">
          Upload one here, or add one from the post editor. It will appear in this library.
        </EmptyNotice>
      )}

      {data && data.results.length > 0 && (
        <ul className="media-grid">
          {data.results.map((item) => (
            <li key={item.id}>
              <Card className="media-card">
                <img src={item.url} alt="" loading="lazy" className="media-card__image" />
                <p className="muted media-card__meta">
                  {formatDate(item.created_at)} · {fileSize(item.size)}
                </p>
                <div className="media-card__buttons">
                  <Button size="sm" variant="secondary" onClick={() => void copy(item)}>
                    Copy link
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(item)}
                    disabled={remove.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}
