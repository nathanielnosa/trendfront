import { Link } from "react-router-dom";
import type { Post } from "../../lib/api/blog";
import { formatCount } from "../../lib/format";
import { Card } from "../ui";
import "./TrendingList.css";

/** A numbered "what is hot now" list with big gradient numerals. */
export function TrendingList({ posts }: { posts: Post[] }) {
  return (
    <Card as="section" className="trending" aria-label="Trending posts">
      <ol className="trending__list">
        {posts.map((post, index) => (
          <li key={post.id} className="trending__item">
            <span className="trending__number" aria-hidden="true">
              {index + 1}
            </span>
            <div className="trending__text">
              <Link to={`/posts/${post.slug}`} className="trending__title">
                {post.title}
              </Link>
              <p className="trending__meta">
                {post.category_details?.name ?? "Story"} · {formatCount(post.views)} views
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
