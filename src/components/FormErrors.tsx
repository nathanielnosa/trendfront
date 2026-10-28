import type { ApiError } from "../lib/api/errors";

/**
 * The message at the top of a form. Field problems are listed under their own
 * inputs with <FieldError>, so here they only get a short pointer.
 */
export function FormAlert({ error }: { error: ApiError | null }) {
  if (!error || error.isRateLimited) return null; // <RetryNotice> handles 429

  const fields = error.fieldErrors;
  const general =
    fields.non_field_errors ??
    (Object.keys(fields).length > 0 ? ["Please check the highlighted fields."] : [error.message]);

  return (
    <div role="alert" className="form-alert">
      {general.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  );
}

/** The problem with one input, shown right under it. */
export function FieldError({ error, name }: { error: ApiError | null; name: string }) {
  const messages = error?.fieldErrors[name];
  if (!messages || messages.length === 0) return null;
  return (
    <p id={`${name}-error`} role="alert" className="field-error">
      {messages[0]}
    </p>
  );
}
