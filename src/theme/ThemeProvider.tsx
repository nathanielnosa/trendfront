import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type ThemeChoice } from "./ThemeContext";

/** Browser storage key for the saved choice. */
const STORAGE_KEY = "trending-archive.theme";

/** Media query that is true when the device prefers a dark theme. */
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Read the saved choice, falling back to "system" if nothing valid is saved. */
function readChoice(): ThemeChoice {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // Storage can be blocked (private mode); just follow the device.
  }
  return "system";
}

/** Ask the device whether it currently prefers dark. */
function deviceIsDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

/** Keeps the theme choice, saves it, and writes it onto the <html> element. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(readChoice);
  const [systemDark, setSystemDark] = useState<boolean>(deviceIsDark);

  // Follow the device while the visitor has not forced light or dark.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    /** Update our copy of the device preference when it changes. */
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Put the choice on <html>: tokens.css reacts to data-theme.
  useEffect(() => {
    const root = document.documentElement;
    if (choice === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", choice);
  }, [choice]);

  /** Save and apply a new choice. */
  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not saved, but the theme still changes for this visit.
    }
  }, []);

  const resolved: "light" | "dark" =
    choice === "system" ? (systemDark ? "dark" : "light") : choice;

  const value = useMemo(
    () => ({ choice, resolved, setChoice }),
    [choice, resolved, setChoice],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
