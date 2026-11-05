import { toApiError } from "../../lib/api/errors";
import type { PostFilters } from "../../lib/api/blog";
import { usePosts } from "../../lib/api/queries";
import { EmptyNotice, ErrorNotice } from "../StateMessage";
import { Button, Pagination, Reveal } from "../ui";
import { PostCard, PostCardSkeleton } from "./PostCard";
import "./PostFeed.css";

/** Posts per page. */
const PAGE_SIZE = 12;

/**
 * A page of posts with loading, empty and error states and a page bar.
 * The parent owns the page number (it lives in the address); this only shows it.
 */
export function PostFeed({
  filters,
  page,
  onPageChange,
  emptyText = "Try a different search or category.",
}: {
  filters: PostFilters;
  page: number;
  onPageChange: (page: number) => void;
  emptyText?: string;
}) {
  const query = usePosts({ ...filters, page, page_size: PAGE_SIZE });
  const count = query.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  /** Change page and jump back to the top of the list. */
  const goTo = (next: number) => {
    onPageChange(next);
    window.scrollTo({ top: 0 });
  };

  if (query.isPending) {
    return (
      <div className="feed__grid" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (query.isError) {
    const error = toApiError(query.error);
    // Asking for a page that does not exist (for example ?page=99) is a 404.
    if (error.isNotFound && page > 1) {
      return (
        <EmptyNotice title="That page does not exist" text="There are no more stories this far down.">
          <Button variant="secondary" size="sm" onClick={() => goTo(1)}>
            Back to page 1
          </Button>
        </EmptyNotice>
      );
    }
    return <ErrorNotice message={error.message} onRetry={() => void query.refetch()} />;
  }

  if (count === 0) {
    return <EmptyNotice title="No stories found" text={emptyText} />;
  }

  return (
    <div>
      <p className="feed__count" role="status">
        {count} {count === 1 ? "story" : "stories"}
      </p>
      <div className={query.isPlaceholderData ? "feed__grid is-fetching" : "feed__grid"}>
        {query.data.results.map((post, index) => (
          <Reveal key={post.id} delay={(index % 3) * 60}>
            <PostCard post={post} />
          </Reveal>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={goTo} />
    </div>
  );
}
