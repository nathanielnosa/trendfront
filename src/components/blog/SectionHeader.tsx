import { Link } from "react-router-dom";
import "./SectionHeader.css";

/** Title of a home page section, with an optional "view all" link on the right. */
export function SectionHeader({
  title,
  linkTo,
  linkLabel = "View all",
}: {
  title: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="section-header">
      <h2 className="section-header__title">{title}</h2>
      {linkTo && (
        <Link to={linkTo} className="section-header__link">
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
