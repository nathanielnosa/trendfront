import { useParams } from "react-router-dom";
import { useCategories, useTags } from "../lib/api/queries";
import { usePageParam } from "../lib/usePageParam";
import { PostFeed } from "../components/blog/PostFeed";
import { Skeleton } from "../components/ui";
import { NotFound } from "./NotFound";
import "./Listing.css";

/** Posts in one category, found by the slug in the address. */
export function CategoryPage() {
  const { slug = "" } = useParams();
  const [page, setPage] = usePageParam();
  const categories = useCategories();

  const category = categories.data?.find((item) => item.slug === slug);

  // Once the list is loaded and the slug is not in it, the page does not exist.
  if (categories.isSuccess && !category) return <NotFound />;

  return (
    <div className="listing">
      <header className="listing__header">
        <p className="listing__eyebrow">Category</p>
        {category ? <h1>{category.name}</h1> : <Skeleton width={260} height="2.5rem" />}
        {category?.description && <p className="listing__lead">{category.description}</p>}
      </header>
      <PostFeed
        filters={{ category: slug }}
        page={page}
        onPageChange={setPage}
        emptyText="There are no stories in this category yet."
      />
    </div>
  );
}

/** Posts with one tag, found by the slug in the address. */
export function TagPage() {
  const { slug = "" } = useParams();
  const [page, setPage] = usePageParam();
  const tags = useTags();

  const tag = tags.data?.find((item) => item.slug === slug);

  // Once the list is loaded and the slug is not in it, the page does not exist.
  if (tags.isSuccess && !tag) return <NotFound />;

  return (
    <div className="listing">
      <header className="listing__header">
        <p className="listing__eyebrow">Tag</p>
        {tag ? <h1>#{tag.name}</h1> : <Skeleton width={220} height="2.5rem" />}
      </header>
      <PostFeed
        filters={{ tag: slug }}
        page={page}
        onPageChange={setPage}
        emptyText="There are no stories with this tag yet."
      />
    </div>
  );
}
