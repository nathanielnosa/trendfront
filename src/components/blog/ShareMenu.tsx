import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaLink,
  FaTelegram,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import { useAuth } from "../../auth/useAuth";
import { recordShare, shareUrl, type SharePlatform } from "../../lib/api/share";
import { useToast } from "../ui";
import "./ShareMenu.css";

/** The platforms in the menu, in order, each with its icon. */
const PLATFORMS: {
  id: Exclude<SharePlatform, "copy_link">;
  label: string;
  Icon: ComponentType<{ size?: number }>;
}[] = [
  { id: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
  { id: "twitter", label: "X (Twitter)", Icon: FaXTwitter },
  { id: "facebook", label: "Facebook", Icon: FaFacebookF },
  { id: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { id: "telegram", label: "Telegram", Icon: FaTelegram },
];

/** A Share button that opens a small menu: copy the link, or send it to a platform. */
export function ShareMenu({ postId, title }: { postId: string; title: string }) {
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Close the menu on Escape or a click outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onClick = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  /** The address people will open: the page they are on now, without the hash. */
  const link = () => `${window.location.origin}${window.location.pathname}`;

  /** Count the share, but only for logged-in people (the API needs a login). */
  const count = (platform: SharePlatform) => {
    if (user) recordShare(postId, platform);
  };

  /** Copy the link to the clipboard and say so. */
  async function copy() {
    try {
      await navigator.clipboard.writeText(link());
      toast.success("Link copied.");
      count("copy_link");
    } catch {
      toast.error("Could not copy. Copy the address from the browser bar instead.");
    }
    setOpen(false);
  }

  return (
    <div className="share-menu" ref={box}>
      <button
        type="button"
        className="save-button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
        </svg>
        Share
      </button>

      {open && (
        <ul className="share-menu__list" aria-label="Share this story">
          <li>
            <button type="button" onClick={copy} aria-label="Copy link" title="Copy link">
              <FaLink size={18} />
            </button>
          </li>
          {PLATFORMS.map(({ id, label, Icon }) => (
            <li key={id}>
              <a
                href={shareUrl(id, link(), title)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${label}`}
                title={label}
                onClick={() => {
                  count(id);
                  setOpen(false);
                }}
              >
                <Icon size={18} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
