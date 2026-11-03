import { createContext } from "react";

/** What the visitor chose: follow their device, or force light or dark. */
export type ThemeChoice = "system" | "light" | "dark";

/** What the theme provider shares with the rest of the app. */
export interface ThemeContextValue {
  /** The saved choice. */
  choice: ThemeChoice;
  /** The theme actually showing right now, after resolving "system". */
  resolved: "light" | "dark";
  /** Save a new choice. */
  setChoice: (choice: ThemeChoice) => void;
}

/** The context object; components read it through the useTheme hook. */
export const ThemeContext = createContext<ThemeContextValue | null>(null);
