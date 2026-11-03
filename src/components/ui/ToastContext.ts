import { createContext } from "react";

/** The kind of message; sets the icon and colour. */
export type ToastKind = "success" | "error" | "info";

/** What the toast functions share with the rest of the app. */
export interface ToastContextValue {
  /** Show a green confirmation. */
  success: (message: string) => void;
  /** Show a red error. Stays a little longer. */
  error: (message: string) => void;
  /** Show a neutral note. */
  info: (message: string) => void;
}

/** The context object; components read it through the useToast hook. */
export const ToastContext = createContext<ToastContextValue | null>(null);