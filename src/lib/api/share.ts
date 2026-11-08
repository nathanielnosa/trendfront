import { api } from "./client";

/** Where a story can be shared. The type names match the ones the API accepts. */
export type SharePlatform = "whatsapp" | "twitter" | "facebook" | "linkedin" | "telegram" | "copy_link";

/**
 * Tell the API a story was shared (it feeds the analytics). This is a bonus:
 * it only works when logged in, and a failure must never get in the way.
 */
export function recordShare(postId: string, platform: SharePlatform): void {
  api.post<unknown>(`/engagements/posts/${postId}/share/`, { platform }).catch(() => {
    // Ignored on purpose.
  });
}

/** The address to open on each platform's share screen. */
export function shareUrl(platform: Exclude<SharePlatform, "copy_link">, link: string, title: string): string {
  const url = encodeURIComponent(link);
  const text = encodeURIComponent(title);
  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${text}%20${url}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    case "telegram":
      return `https://t.me/share/url?url=${url}&text=${text}`;
  }
}