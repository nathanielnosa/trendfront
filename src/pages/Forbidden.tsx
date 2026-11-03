import { ButtonLink, Card } from "../components/ui";

/** Shown when someone opens an area their role does not include. */
export function Forbidden() {
  return (
    <section className="screen">
      <Card className="panel">
        <h1>You do not have access to this page</h1>
        <p className="muted">Your account role does not include this area.</p>
        <div className="screen-actions">
          <ButtonLink to="/">Back to the home page</ButtonLink>
        </div>
      </Card>
    </section>
  );
}
