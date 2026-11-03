import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastKind } from "./ToastContext";
import "./Toast.css";

/** One message on screen. */
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

/** How long each kind stays visible, in milliseconds. */
const DURATION: Record<ToastKind, number> = {
  success: 4000,
  info: 4000,
  error: 7000,
};

/** Small icon for each kind of message. */
function ToastIcon({ kind }: { kind: ToastKind }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (kind === "success") {
    return (
      <svg {...common}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    );
  }
  if (kind === "error") {
    return (
      <svg {...common}>
        <path d="M12 6v7M12 17.5v.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 11v6M12 7v.01" />
    </svg>
  );
}

/** Keeps the list of toasts, shows them, and removes each after a few seconds. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  // Timers by toast id, so they can be cancelled.
  const timers = useRef(new Map<number, number>());

  /** Remove one toast and cancel its timer. */
  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  /** Add a toast and schedule its removal. */
  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      // Keep at most four on screen; the oldest goes first.
      setItems((current) => [...current.slice(-3), { id, kind, message }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), DURATION[kind]),
      );
    },
    [dismiss],
  );

  // Cancel any pending timers when the provider goes away.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      success: (message: string) => push("success", message),
      error: (message: string) => push("error", message),
      info: (message: string) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite">
        {items.map((item) => (
          <div
            key={item.id}
            className={`toast toast--${item.kind}`}
            role={item.kind === "error" ? "alert" : "status"}
          >
            <span className="toast__icon">
              <ToastIcon kind={item.kind} />
            </span>
            <p className="toast__message">{item.message}</p>
            <button
              type="button"
              className="toast__close"
              aria-label="Dismiss message"
              onClick={() => dismiss(item.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
