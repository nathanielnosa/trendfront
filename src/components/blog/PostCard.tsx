import { Link } from "react-router-dom";
import type { Post } from "../../lib/api/blog";
import { mediaUrl } from "../../lib/media";
import { Card, Skeleton, SkeletonText, Tag } from "../ui";
import { PostMeta } from "./PostMeta";
import "./PostCard.css";

/**
 * A post in a grid. The whole card is clickable through the title link; the
 * category tag sits above it so it stays a separate link.
 */
export function PostCard({ post }: { post: Post }) {
  const image = mediaUrl(post.featured_image);
  const category = post.category_details;

  return (
    <Card as="article" className="post-card">
      <div className="post-card__media">
        {image ? (
          <img src={image} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className="post-card__placeholder" aria-hidden="true">
            {category?.name ?? "TrendArchive"}
          </div>
        )}
      </div>

      <div className="post-card__body">
        {category && (
          <div className="post-card__tag">
            <Tag to={`/category/${category.slug}`}>{category.name}</Tag>
          </div>
        )}
        <h3 className="post-card__title">
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="post-card__excerpt">{post.excerpt}</p>
        <PostMeta post={post} />
      </div>
    </Card>
  );
}

/** Grey stand-in for a PostCard while posts load. */
export function PostCardSkeleton() {
  return (
    <Card className="post-card" aria-hidden="true">
      <div className="post-card__media">
        <Skeleton height="100%" radius="0" />
      </div>
      <div className="post-card__body">
        <Skeleton width={80} height="1.25rem" radius="var(--radius-pill)" />
        <Skeleton width="85%" height="1.5rem" />
        <SkeletonText lines={2} />
      </div>
    </Card>
  );
}
