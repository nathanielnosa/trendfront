import type { InputHTMLAttributes } from "react";
import { FieldError } from "../FormErrors";
import type { ApiError } from "../../lib/api/errors";
import "./TextField.css";

/**
 * A labelled text input with its server error underneath.
 * `name` doubles as the input id and as the key used to look up the error
 * the API returned for this field.
 */
export function TextField({
  label,
  name,
  error,
  ...input
}: {
  label: string;
  name: string;
  error: ApiError | null;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "id">) {
  const hasError = Boolean(error?.fieldErrors[name]);

  return (
    <div className="field">
      <label htmlFor={name} className="field__label">
        {label}
      </label>
      <input
        {...input}
        id={name}
        name={name}
        className="field__input"
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      <FieldError error={error} name={name} />
    </div>
  );
}
