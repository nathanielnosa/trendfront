import { useSearchParams } from "react-router-dom";

/**
 * The current page number, kept in the address (?page=2) so a page can be
 * bookmarked and the Back button works. Page 1 has no ?page at all.
 * Other parts of the address, such as ?q= and ?category=, are left alone.
 */
export function usePageParam(): [number, (page: number) => void] {
  const [params, setParams] = useSearchParams();

  const raw = Number(params.get("page"));
  const page = Number.isInteger(raw) && raw > 0 ? raw : 1;

  /** Go to another page, keeping every other filter in the address. */
  const setPage = (next: number) => {
    setParams((previous) => {
      const updated = new URLSearchParams(previous);
      if (next <= 1) updated.delete("page");
      else updated.set("page", String(next));
      return updated;
    });
  };

  return [page, setPage];
}