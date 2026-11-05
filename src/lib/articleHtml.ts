import DOMPurify from "dompurify";

/** True when the text already contains HTML tags. */
function looksLikeHtml(text: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

/** Turn plain text into paragraphs: blank lines split paragraphs, single lines become <br>. */
function textToHtml(text: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escape(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * Make a post body safe to show. Authors can type anything, so the HTML is
 * cleaned (scripts, event handlers and the like are removed) before it reaches
 * the page. Links open in a new tab, and images load lazily.
 */
export function prepareArticleHtml(content: string): string {
  const html = looksLikeHtml(content) ? content : textToHtml(content);
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

  const doc = new DOMParser().parseFromString(clean, "text/html");
  doc.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (/^https?:\/\//i.test(href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
  doc.querySelectorAll("img").forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
  });
  return doc.body.innerHTML;
}