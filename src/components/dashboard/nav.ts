import { EDITOR_ROLES, MODERATOR_ROLES, WRITER_ROLES, hasRole } from "../../auth/roles";
import type { User } from "../../lib/api/types";
import type { NavIconName } from "./NavIcon";

/** One link in the dashboard menu. */
export interface NavItem {
  label: string;
  to: string;
  icon: NavIconName;
  /** Decides whether this link is the current page (default: the address starts with `to`). */
  isActive?: (pathname: string) => boolean;
  /** Show a number badge on this link (the count is supplied by the layout). */
  badge?: "notifications";
}

/** A titled group of links. */
export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Is the address `to` itself, or a page below it? */
const within = (to: string) => (pathname: string) =>
  pathname === to || pathname.startsWith(`${to}/`);

/**
 * Work out which menu groups this person sees. Each group is shown only to the
 * roles that may use it, matching the routes in router.tsx and the backend rules.
 * When a new page is built, add its link here.
 */
export function navFor(user: User): NavGroup[] {
  const groups: NavGroup[] = [];

  if (hasRole(user, WRITER_ROLES)) {
    groups.push({
      title: "Writing",
      items: [
        {
          label: "My posts",
          to: "/studio",
          icon: "posts",
          // Also current while editing a post, but not on the New post or Media pages.
          isActive: (pathname) =>
            pathname === "/studio" || /^\/studio\/[^/]+\/edit$/.test(pathname),
        },
        {
          label: "New post",
          to: "/studio/new",
          icon: "new",
          isActive: (pathname) => pathname === "/studio/new",
        },
        { label: "Media", to: "/studio/media", icon: "media", isActive: within("/studio/media") },
      ],
    });
  }

  if (hasRole(user, EDITOR_ROLES)) {
    groups.push({
      title: "Editorial",
      items: [
        {
          label: "Review queue",
          to: "/desk/review",
          icon: "review",
          isActive: within("/desk/review"),
        },
        {
          label: "Analytics",
          to: "/desk/analytics",
          icon: "analytics",
          isActive: within("/desk/analytics"),
        },
      ],
    });
  }

  if (hasRole(user, MODERATOR_ROLES)) {
    groups.push({
      title: "Community",
      items: [
        {
          label: "Comments",
          to: "/desk/comments",
          icon: "comments",
          isActive: within("/desk/comments"),
        },
      ],
    });
  }

  groups.push({
    title: "Me",
    items: [
      {
        label: "Notifications",
        to: "/notifications",
        icon: "bell",
        badge: "notifications",
        isActive: within("/notifications"),
      },
      { label: "Bookmarks", to: "/bookmarks", icon: "bookmark", isActive: within("/bookmarks") },
      { label: "Account", to: "/account", icon: "account", isActive: within("/account") },
    ],
  });

  return groups;
}

/** Where /dashboard sends a person: the most useful page for their role. */
export function homeFor(user: User): string {
  if (hasRole(user, EDITOR_ROLES)) return "/desk/review";
  if (hasRole(user, WRITER_ROLES)) return "/studio";
  return "/bookmarks";
}
