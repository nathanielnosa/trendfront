import type { Post } from "../../lib/api/blog";
import { formatDate, formatReadingTime } from "../../lib/format";
import "./PostMeta.css";

/** The small line under a headline: author, date and reading time. */
export function PostMeta({ post }: { post: Post }) {
  const date = formatDate(post.published_at ?? post.created_at);

  return (
    <p className="post-meta">
      <span className="post-meta__author">{post.author_name}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.published_at ?? post.created_at}>{date}</time>
      <span aria-hidden="true">·</span>
      <span>{formatReadingTime(post.reading_time)}</span>
    </p>
  );
}
