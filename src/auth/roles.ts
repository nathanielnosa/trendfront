import type { Role, User } from "../lib/api/types";

// Who can use which part of the site. Change a list here and every guard follows.
// Check blog/permissions.py in the backend if you change who may write posts.

/** Can open the writer studio. */
export const WRITER_ROLES: readonly Role[] = ["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR"];

/** Can open the editorial desk (review queue, analytics). */
export const EDITOR_ROLES: readonly Role[] = ["ADMIN", "EDITOR"];

/** Can moderate comments: editors, plus authors on their own posts. */
export const MODERATOR_ROLES: readonly Role[] = ["ADMIN", "EDITOR", "AUTHOR"];

export function hasRole(user: User | null, roles: readonly Role[]): boolean {
  return user !== null && roles.includes(user.role);
}
