import { usePosts } from "../../lib/api/queries";
import type { Post } from "../../lib/api/blog";
import { PostCard } from "./PostCard";
import { SectionHeader } from "./SectionHeader";
import "./RelatedPosts.css";

/**
 * Up to three other stories from the same category. Shows nothing while loading,
 * on error, or when there are none, since it is only a bonus under the article.
 */
export function RelatedPosts({ post }: { post: Post }) {
  const slug = post.category_details?.slug;
  const { data } = usePosts({ category: slug, page_size: 4 });

  if (!slug || !data) return null;
  const related = data.results.filter((item) => item.id !== post.id).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section className="related-posts">
      <SectionHeader title="Keep reading" linkTo={`/category/${slug}`} linkLabel="More in this category" />
      <div className="related-posts__grid">
        {related.map((item) => (
          <PostCard key={item.id} post={item} />
        ))}
      </div>
    </section>
  );
}
