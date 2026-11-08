import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../../auth/useAuth";
import { FieldError, FormAlert } from "../FormErrors";
import { Avatar, Button, TextField, useToast } from "../ui";
import { authApi } from "../../lib/api/auth";
import { toApiError, type ApiError } from "../../lib/api/errors";
import { mediaUrl } from "../../lib/media";
import "./AccountForms.css";

/** Biggest picture we let the browser send (the server has the final say). */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/** Edit name, username, bio and profile picture, then save them together. */
export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    username: user?.username ?? "",
    bio: user?.bio ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  // Address of the picked picture, so it can be previewed before saving.
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [pictureProblem, setPictureProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  const fullName = `${form.first_name} ${form.last_name}`.trim() || user.username;

  /** Returns the props that connect one text field to the form state. */
  const bind = (name: keyof typeof form) => ({
    name,
    value: form[name],
    error,
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setForm((previous) => ({ ...previous, [name]: event.target.value })),
  });

  /** Take the chosen picture if it is an image of a sensible size, and preview it. */
  function pickPicture(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    setPictureProblem(null);
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      setPictureProblem("Please choose an image file.");
      return;
    }
    if (picked.size > MAX_AVATAR_BYTES) {
      setPictureProblem("That picture is over 5 MB. Please choose a smaller one.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  /** Send the changes, refresh the logged-in user, and confirm with a toast. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // FormData is needed because a picture may be included.
      const data = new FormData();
      data.append("first_name", form.first_name.trim());
      data.append("last_name", form.last_name.trim());
      data.append("username", form.username.trim());
      data.append("bio", form.bio);
      if (file) data.append("avatar", file);

      await authApi.updateProfile(data);
      await refreshUser();
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      toast.success("Profile saved.");
    } catch (caught) {
      setError(toApiError(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form" noValidate>
      <FormAlert error={error} />

      <div className="account-picture">
        <Avatar name={fullName} src={preview ?? mediaUrl(user.avatar)} size={80} />
        <div className="account-picture__actions">
          <input
            ref={fileInput}
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            onChange={pickPicture}
            className="sr-only"
          />
          <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
            {user.avatar || file ? "Change picture" : "Upload picture"}
          </Button>
          <p className="muted account-hint">JPG or PNG, up to 5 MB.</p>
          {pictureProblem && (
            <p role="alert" className="field-error">
              {pictureProblem}
            </p>
          )}
          <FieldError error={error} name="avatar" />
        </div>
      </div>

      <div className="account-row">
        <TextField label="First name" autoComplete="given-name" required {...bind("first_name")} />
        <TextField label="Last name" autoComplete="family-name" required {...bind("last_name")} />
      </div>
      <TextField label="Username" autoComplete="username" required {...bind("username")} />

      <div className="field">
        <label htmlFor="bio" className="field__label">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          className="field__input"
          value={form.bio}
          onChange={(event) => setForm((previous) => ({ ...previous, bio: event.target.value }))}
          aria-invalid={Boolean(error?.fieldErrors.bio)}
        />
        <FieldError error={error} name="bio" />
        <p className="muted account-hint">Shown on your author page and under your stories.</p>
      </div>

      <Button type="submit" loading={saving}>
        {saving ? "Saving" : "Save profile"}
      </Button>
    </form>
  );
}
