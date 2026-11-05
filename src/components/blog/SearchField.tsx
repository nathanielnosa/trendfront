import { useState, type FormEvent } from "react";
import "./SearchField.css";

/**
 * A search box. It searches when the form is sent (Enter or the button), not on
 * every key, so the server is not hit while the visitor is still typing.
 */
export function SearchField({
  value,
  onSearch,
}: {
  /** The search currently applied; the box starts with it. */
  value: string;
  onSearch: (text: string) => void;
}) {
  const [text, setText] = useState(value);

  /** Send the search, trimmed. */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(text.trim());
  };

  /** Empty the box and drop the search. */
  const clear = () => {
    setText("");
    onSearch("");
  };

  return (
    <form className="search-field" role="search" onSubmit={submit}>
      <label htmlFor="post-search" className="sr-only">
        Search stories
      </label>
      <input
        id="post-search"
        type="search"
        className="search-field__input"
        placeholder="Search stories"
        value={text}
        onChange={(event) => setText(event.target.value)}
        autoComplete="off"
      />
      {value && (
        <button type="button" className="search-field__clear" onClick={clear} aria-label="Clear search">
          ×
        </button>
      )}
      <button type="submit" className="search-field__submit">
        Search
      </button>
    </form>
  );
}
