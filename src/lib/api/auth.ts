import { api } from "./client";
import { getTokens } from "./tokens";
import type { LoginResponse, User } from "./types";

export const authApi = {
  // auth: false because an old token in the header makes even login answer 401.
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login/", { email, password }, { auth: false }),

  me: () => api.get<User>("/auth/me/"),

  // The body is a function so a retry after a token refresh sends the NEW
  // refresh token, not the one that has just been used up.
  logout: () =>
    api.post<{ message: string }>("/auth/logout/", () => ({ refresh: getTokens()?.refresh })),
};
