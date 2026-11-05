import { useRef } from "react";
import { useParams } from "react-router-dom";
import { usePost } from "../lib/api/queries";
import { formatCount, formatDate, formatReadingTime } from "../lib/format";
import { mediaUrl } from "../lib/media";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { ErrorNotice } from "../components/StateMessage";
import { ArticleBody } from "../components/blog/ArticleBody";
import { AuthorBox } from "../components/blog/AuthorBox";
import { ReadingProgress } from "../components/blog/ReadingProgress";
import { RelatedPosts } from "../components/blog/RelatedPosts";
import { Skeleton, SkeletonText, Tag } from "../components/ui";
import { NotFound } from "./NotFound";
import "./PostPage.css";

/** Grey stand-in shown while the post loads. */
function PostSkeleton() {
  return (
    <div className="post-page__column" aria-hidden="true">
      <Skeleton width={90} height="1.5rem" radius="var(--radius-pill)" />
      <Skeleton width="90%" height="3rem" />
      <Skeleton width="50%" height="1rem" />
      <Skeleton height="22rem" radius="var(--radius-lg, 16px)" />
      <SkeletonText lines={8} />
    </div>
  );
}

/** One full story, found by the slug in the address (/posts/:slug). */
export function PostPage() {
  const { slug } = useParams();
  const { data: post, error, isPending, refetch } = usePost(slug);
  const articleRef = useRef<HTMLElement>(null);

  // Tab title and description follow the post (SEO fields win when the author set them).
  useDocumentMeta(
    post ? post.seo_title || post.title : undefined,
    post ? post.seo_description || post.excerpt : undefined,
  );

  if (isPending) return <PostSkeleton />;
  if (error) {
    const notFound = (error as { isNotFound?: boolean }).isNotFound;
    if (notFound) return <NotFound />;
    return <ErrorNotice message="We could not load this story." onRetry={() => void refetch()} />;
  }

  const image = mediaUrl(post.featured_image);
  const category = post.category_details;
  const date = post.published_at ?? post.created_at;

  return (
    <div className="post-page">
      <ReadingProgress targetRef={articleRef} />

      <article ref={articleRef}>
        <header className="post-page__column post-page__header">
          {category && <Tag to={`/category/${category.slug}`}>{category.name}</Tag>}
          <h1 className="post-page__title">{post.title}</h1>
          {post.excerpt && <p className="post-page__excerpt">{post.excerpt}</p>}
          <p className="post-page__meta">
            <span className="post-page__author">{post.author_name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={date}>{formatDate(date)}</time>
            <span aria-hidden="true">·</span>
            <span>{formatReadingTime(post.reading_time)}</span>
            <span aria-hidden="true">·</span>
            <span>{formatCount(post.views)} views</span>
          </p>
        </header>

        {image && (
          <figure className="post-page__image">
            <img src={image} alt="" decoding="async" />
          </figure>
        )}

        <div className="post-page__column">
          <ArticleBody content={post.content} />

          {post.tags_details.length > 0 && (
            <ul className="post-page__tags" aria-label="Tags">
              {post.tags_details.map((tag) => (
                <li key={tag.id}>
                  <Tag to={`/tag/${tag.slug}`}>#{tag.name}</Tag>
                </li>
              ))}
            </ul>
          )}

          <AuthorBox name={post.author_name} username={post.author_username} />
        </div>
      </article>

      <RelatedPosts post={post} />
    </div>
  );
}
