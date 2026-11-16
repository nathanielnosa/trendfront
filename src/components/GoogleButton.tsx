import { useEffect, useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { errorMessage } from "../lib/api/errors";
import { useToast } from "./ui";
import "./GoogleButton.css";

/** The little part of Google's sign-in library this button uses. */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCRIPT_URL = "https://accounts.google.com/gsi/client";

/** Load Google's sign-in script once, however many times this is called. */
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Could not load Google sign-in.")));

    if (!existing) {
      script.src = SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

/**
 * "Continue with Google". Shows nothing when no client id is configured,
 * so the site works fine before Google sign-in is set up.
 */
export function GoogleButton() {
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const holder = useRef<HTMLDivElement>(null);

  // Keep the newest versions in refs so the Google button is drawn only once.
  const handlers = useRef({ loginWithGoogle, toast });
  useEffect(() => {
    handlers.current = { loginWithGoogle, toast };
  });

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript().then(
      () => {
        if (cancelled || !holder.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          // Google hands us a signed token; our server checks it and logs the person in.
          callback: (response) => {
            handlers.current.loginWithGoogle(response.credential).catch((caught: unknown) =>
              handlers.current.toast.error(errorMessage(caught, "Google sign-in failed. Please try again.")),
            );
          },
        });
        window.google.accounts.id.renderButton(holder.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
        });
      },
      () => handlers.current.toast.error("Could not load Google sign-in."),
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="google">
      <div ref={holder} className="google__button" />
      <p className="google__divider muted">
        <span>or</span>
      </p>
    </div>
  );
}
