import { useState, type FormEvent } from "react";
import { FormAlert } from "../FormErrors";
import { RetryNotice } from "../RetryNotice";
import { Button, TextField, useToast } from "../ui";
import { authApi } from "../../lib/api/auth";
import { toApiError, type ApiError } from "../../lib/api/errors";

const EMPTY = { current_password: "", new_password: "", new_password_confirmation: "" };

/** Change the password of the logged-in person. */
export function PasswordForm() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<ApiError | null>(null);
  // Counts failed tries, so each rate-limit notice restarts its countdown.
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);

  /** Returns the props that connect one password field to the form state. */
  const bind = (name: keyof typeof form) => ({
    name,
    type: "password",
    value: form[name],
    error,
    required: true,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((previous) => ({ ...previous, [name]: event.target.value })),
  });

  /** Send the passwords; on success empty the form and confirm with a toast. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await authApi.changePassword(form);
      setForm(EMPTY);
      toast.success("Password changed.");
    } catch (caught) {
      setError(toApiError(caught));
      setAttempt((count) => count + 1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form" noValidate>
      <FormAlert error={error} />
      {error?.isRateLimited && <RetryNotice key={attempt} seconds={error.retryAfter} />}
      <TextField label="Current password" autoComplete="current-password" {...bind("current_password")} />
      <TextField label="New password" autoComplete="new-password" {...bind("new_password")} />
      <TextField
        label="Confirm new password"
        autoComplete="new-password"
        {...bind("new_password_confirmation")}
      />
      <Button type="submit" loading={saving}>
        {saving ? "Saving" : "Change password"}
      </Button>
    </form>
  );
}
