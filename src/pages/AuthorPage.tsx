import { useParams } from "react-router-dom";
import { useAuthor } from "../lib/api/author";
import { formatDate } from "../lib/format";
import { mediaUrl } from "../lib/media";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { PostFeed } from "../components/blog/PostFeed";
import { ErrorNotice } from "../components/StateMessage";
import { Avatar, Skeleton } from "../components/ui";
import { usePageParam } from "../lib/usePageParam";
import { NotFound } from "./NotFound";
import "./Listing.css";
import "./AuthorPage.css";

/** A writer's page (/author/:username): their picture, bio and all their stories. */
export function AuthorPage() {
  const { username } = useParams();
  const [page, setPage] = usePageParam();
  const { data: author, error, isPending, refetch } = useAuthor(username);

  useDocumentMeta(author ? `${author.name} · Author` : undefined, author?.bio || undefined);

  if (error) {
    if ((error as { isNotFound?: boolean }).isNotFound) return <NotFound />;
    return <ErrorNotice message="We could not load this author." onRetry={() => void refetch()} />;
  }

  return (
    <div className="listing">
      <header className="author-header">
        {isPending ? (
          <>
            <Skeleton width={96} height={96} radius="50%" />
            <Skeleton width={240} height="2.5rem" />
          </>
        ) : (
          <>
            <Avatar name={author.name} src={mediaUrl(author.avatar)} size={96} />
            <div className="author-header__text">
              <p className="listing__eyebrow">Author</p>
              <h1>{author.name}</h1>
              {author.bio && <p className="listing__lead">{author.bio}</p>}
              <p className="author-header__facts">
                {author.post_count} {author.post_count === 1 ? "story" : "stories"} · Joined{" "}
                {formatDate(author.date_joined)}
              </p>
            </div>
          </>
        )}
      </header>

      {author && (
        <PostFeed
          filters={{ author: author.id }}
          page={page}
          onPageChange={setPage}
          emptyText="This author has no stories yet."
        />
      )}
    </div>
  );
}
