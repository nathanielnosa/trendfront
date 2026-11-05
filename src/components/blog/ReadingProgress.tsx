import { useEffect, useRef } from "react";
import "./ReadingProgress.css";

/**
 * A thin bar at the top of the screen that fills as you read. It follows the
 * element passed in (the article), so the header and footer do not count.
 */
export function ReadingProgress({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    /** Work out how far through the article the reader is, and size the bar. */
    const update = () => {
      frame = 0;
      const article = targetRef.current;
      const bar = barRef.current;
      if (!article || !bar) return;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : rect.top < 0 ? 1 : 0;
      bar.style.transform = `scaleX(${done})`;
    };

    /** Batch scroll events into one update per frame. */
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetRef]);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div className="reading-progress__bar" ref={barRef} />
    </div>
  );
}
