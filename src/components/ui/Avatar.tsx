import { useState } from "react";
import "./Avatar.css";

/** Up to two capital letters from a name: "Ada Obi" becomes "AO". */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * A round profile picture. If there is no image, or it fails to load, it
 * shows the person's initials on the brand gradient.
 */
export function Avatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src?: string | null;
  /** Width and height in pixels. */
  size?: number;
}) {
  // Remember which address failed, so a new address gets a fresh try.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && src !== failedSrc;

  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      role="img"
      aria-label={name}
    >
      {showImage ? (
        <img src={src ?? ""} alt="" onError={() => setFailedSrc(src ?? null)} />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}
