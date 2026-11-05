import { useSearchParams } from "react-router-dom";
import { useCategories } from "../lib/api/queries";
import { usePageParam } from "../lib/usePageParam";
import { ChipNav, type Chip } from "../components/blog/ChipNav";
import { PostFeed } from "../components/blog/PostFeed";
import { SearchField } from "../components/blog/SearchField";
import "./Listing.css";

/**
 * All posts, with a search box and category chips. The search (?q=), category
 * (?category=) and page (?page=) all live in the address, so any view can be
 * bookmarked or shared.
 */
export function Posts() {
  const [params, setParams] = useSearchParams();
  const [page] = usePageParam();
  const categories = useCategories();

  const search = params.get("q") ?? "";
  const category = params.get("category") ?? "";

  /** Build an address for the given filters, always starting at page 1. */
  const hrefFor = (next: { q?: string; category?: string }) => {
    const updated = new URLSearchParams();
    const q = next.q ?? search;
    const cat = next.category ?? category;
    if (q) updated.set("q", q);
    if (cat) updated.set("category", cat);
    const text = updated.toString();
    return text ? `/posts?${text}` : "/posts";
  };

  /** Apply a new search and go back to page 1. */
  const onSearch = (text: string) => {
    setParams((previous) => {
      const updated = new URLSearchParams(previous);
      if (text) updated.set("q", text);
      else updated.delete("q");
      updated.delete("page");
      return updated;
    });
  };

  const chips: Chip[] = [
    { label: "All", to: hrefFor({ category: "" }), active: category === "" },
    ...(categories.data ?? []).map((item) => ({
      label: item.name,
      to: hrefFor({ category: item.slug }),
      active: category === item.slug,
    })),
  ];

  /** Change the page, keeping the search and category in the address. */
  const onPageChange = (next: number) => {
    setParams((previous) => {
      const updated = new URLSearchParams(previous);
      if (next <= 1) updated.delete("page");
      else updated.set("page", String(next));
      return updated;
    });
  };

  return (
    <div className="listing">
      <header className="listing__header">
        <h1>{search ? `Results for “${search}”` : "All posts"}</h1>
        <SearchField key={search} value={search} onSearch={onSearch} />
        <ChipNav label="Filter by category" chips={chips} />
      </header>

      <PostFeed
        filters={{ search: search || undefined, category: category || undefined }}
        page={page}
        onPageChange={onPageChange}
      />
    </div>
  );
}
