import { useEffect } from "react";

/** Set (or create) one <meta> tag in the page head. Returns a function that restores it. */
function setMeta(attr: "name" | "property", key: string, value: string): () => void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  const created = !tag;
  const previous = tag?.getAttribute("content") ?? null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
  return () => {
    if (created) tag?.remove();
    else if (previous !== null) tag?.setAttribute("content", previous);
  };
}

/**
 * Give the browser tab a title and the page a description while this screen is
 * open, then put the old ones back. (Link-preview cards on social sites need
 * server-side tags; that comes in the launch phase.)
 */
export function useDocumentMeta(title: string | undefined, description?: string) {
  useEffect(() => {
    if (!title) return;
    const oldTitle = document.title;
    document.title = title;
    const restores = [setMeta("property", "og:title", title)];
    if (description) {
      restores.push(setMeta("name", "description", description));
      restores.push(setMeta("property", "og:description", description));
    }
    return () => {
      document.title = oldTitle;
      restores.forEach((restore) => restore());
    };
  }, [title, description]);
}