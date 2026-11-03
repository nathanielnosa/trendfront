import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Tag.css";

/**
 * A small pill for a category or tag.
 * Give it `to` and it becomes a link; leave `to` out and it is plain text.
 */
export function Tag({
  to,
  tone = "primary",
  children,
}: {
  to?: string;
  tone?: "primary" | "neutral";
  children: ReactNode;
}) {
  const classes = `tag tag--${tone}`;

  if (to) {
    return (
      <Link to={to} className={`${classes} tag--link`}>
        {children}
      </Link>
    );
  }
  return <span className={classes}>{children}</span>;
}
