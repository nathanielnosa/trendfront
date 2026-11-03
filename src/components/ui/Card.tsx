import type { HTMLAttributes } from "react";
import "./Card.css";

/**
 * A raised surface for grouping content.
 * `tilt` adds the 3D lift on hover (mouse devices only, off when the visitor
 * prefers reduced motion). Use it for featured posts, not for every card.
 */
export function Card({
  as: Tag = "div",
  tilt = false,
  className,
  children,
  ...rest
}: {
  as?: "div" | "article" | "section" | "li";
  tilt?: boolean;
} & HTMLAttributes<HTMLElement>) {
  const classes = ["card", tilt ? "card--tilt" : "", className].filter(Boolean).join(" ");

  return (
    <Tag {...rest} className={classes}>
      {children}
    </Tag>
  );
}
