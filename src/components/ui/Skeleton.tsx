import "./Skeleton.css";

/**
 * A grey shimmering block that stands in for content while it loads.
 * Hidden from screen readers; the page should announce loading itself.
 */
export function Skeleton({
  width = "100%",
  height = "1rem",
  radius = "var(--radius-sm)",
}: {
  width?: string | number;
  height?: string | number;
  radius?: string;
}) {
  return <span className="skeleton" style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}

/** Several skeleton lines, the last one shorter, like a paragraph. */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <span className="skeleton-text" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} width={index === lines - 1 ? "60%" : "100%"} />
      ))}
    </span>
  );
}
