import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./buttonClass";
import "./Button.css";

/** Options shared by both button kinds. */
interface LookProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/** A real <button>. While `loading` it shows a spinner and ignores clicks. */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: LookProps & { loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = [buttonClass(variant, size, fullWidth), className].filter(Boolean).join(" ");

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

/** A link that looks like a button, for moving to another page. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...rest
}: LookProps & LinkProps) {
  const classes = [buttonClass(variant, size, fullWidth), className].filter(Boolean).join(" ");

  return (
    <Link {...rest} className={classes}>
      {children}
    </Link>
  );
}
