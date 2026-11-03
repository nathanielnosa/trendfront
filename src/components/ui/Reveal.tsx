import { useEffect, useRef, useState, type ReactNode } from "react";
import "./Reveal.css";

/**
 * Fades its content up into place the first time it scrolls into view.
 * `delay` (in milliseconds) lets neighbours arrive one after another.
 * With reduced motion, or no browser support, the content simply shows.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible when the browser cannot watch scrolling.
  const [visible, setVisible] = useState(
    () => typeof window === "undefined" || !("IntersectionObserver" in window),
  );

  // Watch the element and reveal it once, a little before it is fully in view.
  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  const classes = ["reveal", visible ? "reveal--visible" : "", className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes} style={{ transitionDelay: visible ? `${delay}ms` : undefined }}>
      {children}
    </div>
  );
}
