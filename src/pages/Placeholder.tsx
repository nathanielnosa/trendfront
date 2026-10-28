import { useParams } from "react-router-dom";

/** Stands in for a screen that a later phase builds. */
export function Placeholder({ title, phase }: { title: string; phase: number }) {
  const params = useParams();
  const hasParams = Object.keys(params).length > 0;

  return (
    <section>
      <h1>{title}</h1>
      <p className="muted">This page is built in Phase {phase}.</p>
      {hasParams && <pre>{JSON.stringify(params)}</pre>}
    </section>
  );
}
