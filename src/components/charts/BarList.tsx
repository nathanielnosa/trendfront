import { Link } from "react-router-dom";
import { formatCount } from "../../lib/format";
import "./Charts.css";

/** One row: a name, where it links, and its number. */
export interface BarRow {
  id: string;
  label: string;
  to?: string;
  value: number;
}

/** A ranked list where each row has a thin bar sized against the biggest value. */
export function BarList({ rows }: { rows: BarRow[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <ol className="barlist">
      {rows.map((row) => (
        <li key={row.id} className="barlist__row">
          <div className="barlist__head">
            {row.to ? <Link to={row.to}>{row.label}</Link> : <span>{row.label}</span>}
            <strong>{formatCount(row.value)}</strong>
          </div>
          <div className="barlist__track" aria-hidden="true">
            <div className="barlist__bar" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}
