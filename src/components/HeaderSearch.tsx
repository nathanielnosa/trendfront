import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./HeaderSearch.css";

/**
 * Small search box for the header. Sending it opens the posts page with the
 * search in the address (/posts?q=...), where the results are shown.
 */
export function HeaderSearch({ onDone }: { onDone?: () => void }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  /** Go to the results page for the typed text, then empty the box. */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = text.trim();
    if (!query) return;
    navigate(`/posts?q=${encodeURIComponent(query)}`);
    setText("");
    onDone?.();
  };

  return (
    <form className="header-search" role="search" onSubmit={submit}>
      <label htmlFor="header-search" className="sr-only">
        Search stories
      </label>
      <input
        id="header-search"
        type="search"
        className="header-search__input"
        placeholder="Search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        autoComplete="off"
      />
      <button type="submit" className="header-search__button" aria-label="Search">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
