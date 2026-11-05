import { Link } from "react-router-dom";
import "./ChipNav.css";

/** One chip: its label, where it goes, and whether it is the current filter. */
export interface Chip {
  label: string;
  to: string;
  active: boolean;
}

/** A wrapping row of filter chips. The active one is filled and marked for screen readers. */
export function ChipNav({ label, chips }: { label: string; chips: Chip[] }) {
  return (
    <nav className="chip-nav" aria-label={label}>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          to={chip.to}
          className={chip.active ? "chip-nav__chip is-active" : "chip-nav__chip"}
          aria-current={chip.active ? "true" : undefined}
        >
          {chip.label}
        </Link>
      ))}
    </nav>
  );
}
