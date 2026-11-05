import { API_ROOT } from "../config";

/**
 * Turn an image address from the API into one the browser can load.
 * Full addresses are kept; paths like "/media/x.jpg" get the backend address in
 * front. No image gives null, so the caller can show a placeholder.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${API_ROOT}${path.startsWith("/") ? "" : "/"}${path}`;
}