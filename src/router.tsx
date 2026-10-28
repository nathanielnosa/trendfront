import { createBrowserRouter } from "react-router-dom";
import { GuestOnly, RequireAuth, RequireRole } from "./auth/guards";
import { EDITOR_ROLES, MODERATOR_ROLES, WRITER_ROLES } from "./auth/roles";
import { RouteError } from "./components/RouteError";
import { RootLayout } from "./layouts/RootLayout";
import { Account } from "./pages/Account";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Placeholder } from "./pages/Placeholder";

// Every screen in the plan, who may open it, and the phase that builds it.
// Placeholders are replaced one by one as the phases land.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      // Everyone
      { path: "/", element: <Placeholder title="Home" phase={3} /> },
      { path: "/posts", element: <Placeholder title="Posts" phase={3} /> },
      { path: "/posts/:slug", element: <Placeholder title="Post" phase={3} /> },
      { path: "/category/:slug", element: <Placeholder title="Category" phase={3} /> },
      { path: "/tag/:slug", element: <Placeholder title="Tag" phase={3} /> },
      { path: "/author/:username", element: <Placeholder title="Author" phase={3} /> },
      { path: "/verify-email", element: <Placeholder title="Verify email" phase={4} /> },
      { path: "/reset-password", element: <Placeholder title="Choose a new password" phase={4} /> },

      // Visitors only (logged-in people are sent away)
      {
        element: <GuestOnly />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Placeholder title="Create account" phase={4} /> },
          { path: "/forgot-password", element: <Placeholder title="Forgot password" phase={4} /> },
        ],
      },

      // Logged in
      {
        element: <RequireAuth />,
        children: [
          { path: "/account", element: <Account /> },
          { path: "/bookmarks", element: <Placeholder title="Bookmarks" phase={5} /> },
          { path: "/notifications", element: <Placeholder title="Notifications" phase={8} /> },
        ],
      },

      // Writer studio
      {
        element: <RequireRole roles={WRITER_ROLES} />,
        children: [
          { path: "/studio", element: <Placeholder title="My posts" phase={6} /> },
          { path: "/studio/new", element: <Placeholder title="New post" phase={6} /> },
          { path: "/studio/:id/edit", element: <Placeholder title="Edit post" phase={6} /> },
          { path: "/studio/media", element: <Placeholder title="Media library" phase={6} /> },
        ],
      },

      // Editorial desk
      {
        element: <RequireRole roles={MODERATOR_ROLES} />,
        children: [
          { path: "/desk/comments", element: <Placeholder title="Pending comments" phase={7} /> },
        ],
      },
      {
        element: <RequireRole roles={EDITOR_ROLES} />,
        children: [
          { path: "/desk/review", element: <Placeholder title="Review queue" phase={7} /> },
          { path: "/desk/analytics", element: <Placeholder title="Analytics" phase={8} /> },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
