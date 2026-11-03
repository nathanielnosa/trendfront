/** Look of a button: solid brand colour, outlined, or text only. */
export type ButtonVariant = "primary" | "secondary" | "ghost";

/** Height and padding of a button. */
export type ButtonSize = "sm" | "md" | "lg";

/** Build the CSS class string for a button, shared by Button and ButtonLink. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  fullWidth = false,
): string {
  const parts = ["btn", `btn--${variant}`, `btn--${size}`];
  if (fullWidth) parts.push("btn--full");
  return parts.join(" ");
}