/** One slot in the page bar: a page number, or "gap" for the "…" between. */
export type PageItem = number | "gap";

/** The whole numbers from `from` to `to`. */
function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

/**
 * Which page numbers to show, always the same number of slots so the bar
 * does not jump while paging: 1 … 4 5 6 … 10.
 */
export function paginationItems(current: number, total: number, siblings = 1): PageItem[] {
  // first + last + current + its neighbours + two gaps
  const slots = siblings * 2 + 5;
  if (total <= slots) return range(1, total);

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftGap = left > 2;
  const showRightGap = right < total - 1;
  const edgeCount = 3 + 2 * siblings;

  if (!showLeftGap && showRightGap) return [...range(1, edgeCount), "gap", total];
  if (showLeftGap && !showRightGap) return [1, "gap", ...range(total - edgeCount + 1, total)];
  return [1, "gap", ...range(left, right), "gap", total];
}