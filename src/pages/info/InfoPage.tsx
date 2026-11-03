import type { ReactNode } from "react";
import "./InfoPage.css";

/** Shared frame for About, Contact, FAQs and the legal pages. */
export function InfoPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  /** Shown under the title, used by the legal pages. */
  updated?: string;
  children: ReactNode;
}) {
  return (
    <article className="info-page">
      <header className="info-page__header">
        <h1 className="info-page__title">{title}</h1>
        {intro && <p className="info-page__intro">{intro}</p>}
        {updated && <p className="info-page__updated">Last updated: {updated}</p>}
      </header>
      <div className="info-page__body">{children}</div>
    </article>
  );
}
