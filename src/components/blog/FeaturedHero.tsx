import type { Post } from "../../lib/api/blog";
import { mediaUrl } from "../../lib/media";
import { ButtonLink, Card, Skeleton, SkeletonText, Tag } from "../ui";
import { PostMeta } from "./PostMeta";
import "./FeaturedHero.css";

/**
 * The big story at the top of the home page: headline and summary on the left,
 * a tilting picture card on the right (a gradient when there is no picture).
 */
export function FeaturedHero({ post }: { post: Post }) {
  const image = mediaUrl(post.featured_image);
  const category = post.category_details;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__text">
        <p className="hero__eyebrow">{post.is_featured ? "Featured story" : "Latest story"}</p>
        <h1 id="hero-title" className="hero__title">
          {post.title}
        </h1>
        <p className="hero__excerpt">{post.excerpt}</p>
        <PostMeta post={post} />
        <div className="hero__actions">
          <ButtonLink to={`/posts/${post.slug}`} size="lg">
            Read the story
          </ButtonLink>
          {category && <Tag to={`/category/${category.slug}`}>{category.name}</Tag>}
        </div>
      </div>

      <Card tilt className="hero__visual" aria-hidden="true">
        {image ? (
          <img src={image} alt="" decoding="async" fetchPriority="high" />
        ) : (
          <div className="hero__mesh">
            <span className="hero__chip">{category?.name ?? "TrendArchive"}</span>
          </div>
        )}
      </Card>
    </section>
  );
}

/** Grey stand-in for the hero while the featured post loads. */
export function FeaturedHeroSkeleton() {
  return (
    <section className="hero" aria-hidden="true">
      <div className="hero__text">
        <Skeleton width={120} height="1rem" />
        <Skeleton width="90%" height="3rem" />
        <SkeletonText lines={3} />
        <Skeleton width={160} height="3.25rem" radius="var(--radius-pill)" />
      </div>
      <Skeleton height={340} radius="var(--radius-lg)" />
    </section>
  );
}
