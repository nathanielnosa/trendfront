import { Link, useSearchParams } from "react-router-dom";
import { ChipNav, type Chip } from "../../components/blog/ChipNav";
import { SearchField } from "../../components/blog/SearchField";
import { EmptyNotice, ErrorNotice } from "../../components/StateMessage";
import { StatusBadge } from "../../components/studio/StatusBadge";
import { ButtonLink, Card, Pagination, Skeleton } from "../../components/ui";
import { POST_STATUSES, useMyPosts } from "../../lib/api/studio";
import { formatCount, formatDate } from "../../lib/format";
import { usePageParam } from "../../lib/usePageParam";
import "../Listing.css";
import "./MyPosts.css";


/** Posts per page. */
const PAGE_SIZE = 10;

/**
 * The writer's studio home: every post they wrote, filtered by status and
 * searchable. Status (?status=), search (?q=) and page (?page=) live in the address.
 */
export function MyPosts() {
  const [params, setParams] = useSearchParams();
  const [page] = usePageParam();

  const status = params.get("status") ?? "";
  const search = params.get("q") ?? "";

  const { data, isPending, error, refetch } = useMyPosts({
    status: status || undefined,
    search: search || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  /** Build an address for the given filters, always starting at page 1. */
  const hrefFor = (next: { status?: string }) => {
    const updated = new URLSearchParams();
    const nextStatus = next.status ?? status;
    if (nextStatus) updated.set("status", nextStatus);
    if (search) updated.set("q", search);
    const text = updated.toString();
    return text ? `/studio?${text}` : "/studio";
  };

  const chips: Chip[] = [
    { label: "All", to: hrefFor({ status: "" }), active: status === "" },
    ...POST_STATUSES.map((item) => ({
      label: item.label,
      to: hrefFor({ status: item.value }),
      active: status === item.value,
    })),
  ];

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

  /** Change page, keeping the status and search. */
  const onPageChange = (next: number) => {
    setParams((previous) => {
      const updated = new URLSearchParams(previous);
      if (next <= 1) updated.delete("page");
      else updated.set("page", String(next));
      return updated;
    });
    window.scrollTo({ top: 0 });
  };

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  return (
    <div className="listing">
      <header className="listing__header">
        <div className="studio-head">
          <h1>My posts</h1>
          <ButtonLink to="/studio/new">New post</ButtonLink>
        </div>
        <SearchField key={search} value={search} onSearch={onSearch} />
        <ChipNav label="Filter by status" chips={chips} />
      </header>

      {isPending && (
        <div className="listing" aria-busy="true">
          <Skeleton height="5rem" />
          <Skeleton height="5rem" />
          <Skeleton height="5rem" />
        </div>
      )}

      {error && <ErrorNotice message="We could not load your posts." onRetry={() => void refetch()} />}

      {data && data.results.length === 0 && (
        <EmptyNotice title={search || status ? "No posts match" : "You have not written anything yet"}>
          {search || status ? "Try another status or search." : "Start with a draft. You can edit it as often as you like."}
          {!search && !status && (
            <div style={{ marginTop: "1rem" }}>
              <ButtonLink to="/studio/new">Write your first post</ButtonLink>
            </div>
          )}
        </EmptyNotice>
      )}

      {data && data.results.length > 0 && (
        <ul className="studio-list">
          {data.results.map((post) => (
            <li key={post.id}>
              <Card className="studio-row">
                <div className="studio-row__main">
                  <h2 className="studio-row__title">
                    <Link to={`/studio/${post.id}/edit`}>{post.title || "Untitled"}</Link>
                  </h2>
                  <p className="muted studio-row__meta">
                    Updated {formatDate(post.updated_at)}
                    {post.status === "published" && (
                      <>
                        {" "}
                        · {formatCount(post.views)} views · {formatCount(post.likes)} likes
                      </>
                    )}
                  </p>
                </div>
                <StatusBadge status={post.status} />
                <div className="studio-row__actions">
                  <Link to={`/studio/${post.id}/edit`}>Edit</Link>
                  {post.status === "published" && post.visibility === "public" && (
                    <Link to={`/posts/${post.slug}`}>View</Link>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}
