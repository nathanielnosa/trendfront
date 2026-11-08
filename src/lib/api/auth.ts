import { api } from "./client";
import { getTokens } from "./tokens";
import type { LoginResponse, User } from "./types";

/** What the sign-up form sends. The API checks that both passwords match. */
export interface RegisterInput {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirmation: string;
}

/** What the API answers after sign-up. email_sent is false if the email could not go out. */
export interface RegisterResponse {
  message: string;
  email_sent?: boolean;
  user: Pick<User, "id" | "email" | "username" | "first_name" | "last_name">;
}

/** What the reset-password form sends. */
export interface ResetPasswordInput {
  token: string;
  new_password: string;
  new_password_confirmation: string;
}

/** What the change-password form sends. */
export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const authApi = {
  // auth: false because an old token in the header makes even login answer 401.
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login/", { email, password }, { auth: false }),

  /** Create an account. The person must then verify their email before logging in. */
  register: (input: RegisterInput) =>
    api.post<RegisterResponse>("/auth/register/", input, { auth: false }),

  /** Confirm an email address with the token from the email link. */
  verifyEmail: (token: string) =>
    api.post<{ message: string }>("/auth/verify-email/", { token }, { auth: false }),

  /** Ask for a new verification email. The answer is the same whether or not the address exists. */
  resendVerification: (email: string) =>
    api.post<{ message: string }>("/auth/resend-verification/", { email }, { auth: false }),

  /** Email a password-reset link. The answer is the same whether or not the address exists. */
  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password/", { email }, { auth: false }),

  /** Set a new password using the token from the reset email. */
  resetPassword: (input: ResetPasswordInput) =>
    api.post<{ message: string }>("/auth/reset-password/", input, { auth: false }),

  /** Change the password of the logged-in person. */
  changePassword: (input: ChangePasswordInput) =>
    api.post<{ message: string }>("/auth/change-password/", input),

  me: () => api.get<User>("/auth/me/"),
    /** Save profile changes. Send FormData so a picture can be included. */
  updateProfile: (data: FormData) => api.patch<unknown>("/auth/me/", data),

  // The body is a function so a retry after a token refresh sends the NEW
  // refresh token, not the one that has just been used up.
  logout: () =>
    api.post<{ message: string }>("/auth/logout/", () => ({ refresh: getTokens()?.refresh })),
};
