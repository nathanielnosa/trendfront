import { paginationItems } from "./paginationItems";
import "./Pagination.css";

/**
 * Previous, numbered pages and Next. Renders nothing when there is only one
 * page. The current page is marked for screen readers with aria-current.
 */
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__step"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <span aria-hidden="true">←</span> Previous
      </button>

      <ul className="pagination__pages">
        {paginationItems(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} className="pagination__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className="pagination__page"
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="pagination__step"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
