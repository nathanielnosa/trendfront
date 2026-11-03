import { useState } from "react";
import { Avatar, Button, ButtonLink, Card, Skeleton, SkeletonText, Tag, useToast } from "../components/ui";

/** Developer-only page that shows every building block. Not linked anywhere. */
export function StyleGuide() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  /** Pretend to save something for two seconds, then confirm with a toast. */
  const fakeSave = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast.success("Saved. Nice work.");
    }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem", paddingBlock: "2rem" }}>
      <h1>Style guide</h1>

      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2>Buttons</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={fakeSave}>
            {loading ? "Saving" : "Click to save"}
          </Button>
          <ButtonLink to="/posts" variant="secondary">
            Link button
          </ButtonLink>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2>Tags and avatars</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <Tag>Music</Tag>
          <Tag tone="neutral">Neutral</Tag>
          <Tag to="/posts">Link tag</Tag>
          <Avatar name="Ada Obi" size={32} />
          <Avatar name="Ada Obi" size={48} />
          <Avatar name="Tunde" size={64} />
          <Avatar name="Broken image" src="/does-not-exist.png" size={48} />
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2>Cards</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
          <Card style={{ padding: "1.5rem" }}>
            <Tag>Plain card</Tag>
            <h3 style={{ marginTop: "0.75rem" }}>Resting state</h3>
          </Card>
          <Card tilt style={{ padding: "1.5rem" }}>
            <Tag>Tilt card</Tag>
            <h3 style={{ marginTop: "0.75rem" }}>Hover me</h3>
          </Card>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2>Loading placeholders</h2>
        <Card style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Skeleton height={160} radius="var(--radius-md)" />
          <Skeleton width="40%" height="1.5rem" />
          <SkeletonText lines={3} />
        </Card>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2>Toasts</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <Button variant="secondary" onClick={() => toast.success("Post published.")}>
            Success
          </Button>
          <Button variant="secondary" onClick={() => toast.error("Could not save. Try again.")}>
            Error
          </Button>
          <Button variant="secondary" onClick={() => toast.info("Your draft was restored.")}>
            Info
          </Button>
        </div>
      </section>
    </div>
  );
}
