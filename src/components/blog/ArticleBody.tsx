import { useMemo } from "react";
import { prepareArticleHtml } from "../../lib/articleHtml";
import "./ArticleBody.css";

/** The text of a post, cleaned of anything unsafe and styled for comfortable reading. */
export function ArticleBody({ content }: { content: string }) {
  // Cleaning is slow-ish, so only redo it when the text changes.
  const html = useMemo(() => prepareArticleHtml(content), [content]);
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
