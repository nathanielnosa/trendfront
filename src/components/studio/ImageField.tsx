import { useRef, useState } from "react";
import { Button } from "../ui";
import "./ImageField.css";

/** Biggest picture the browser will try to send (the server checks again). */
const MAX_BYTES = 5 * 1024 * 1024;

/** Pick, upload, preview and remove the story's main picture. */
export function ImageField({
  value,
  onChange,
  onUpload,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  /** Check the chosen file, upload it, and keep the address it returns. */
  async function pick(file: File | undefined) {
    if (!file) return;
    setProblem(null);
    if (!file.type.startsWith("image/")) return setProblem("Please choose an image file.");
    if (file.size > MAX_BYTES) return setProblem("That picture is over 5 MB. Please choose a smaller one.");

    setBusy(true);
    try {
      onChange(await onUpload(file));
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Could not upload the picture.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="image-field">
      <p className="field__label">Main picture</p>
      {value ? (
        <img className="image-field__preview" src={value} alt="" />
      ) : (
        <div className="image-field__empty muted">No picture yet</div>
      )}
      <div className="image-field__buttons">
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => void pick(event.target.files?.[0])}
        />
        <Button variant="secondary" size="sm" onClick={() => input.current?.click()} loading={busy}>
          {value ? "Change picture" : "Upload picture"}
        </Button>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
      {problem && (
        <p role="alert" className="field-error">
          {problem}
        </p>
      )}
    </div>
  );
}
