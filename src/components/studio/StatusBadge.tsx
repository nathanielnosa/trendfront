import { statusLabel } from "../../lib/api/studio";
import "./StatusBadge.css";

/** A small coloured pill showing where a post is in its life (draft, published, ...). */
export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-badge--${status}`}>{statusLabel(status)}</span>;
}
