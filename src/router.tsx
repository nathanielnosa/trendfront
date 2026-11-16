import { createBrowserRouter } from "react-router-dom";
import { GuestOnly, RequireAuth, RequireRole } from "./auth/guards";
import { EDITOR_ROLES, MODERATOR_ROLES, WRITER_ROLES } from "./auth/roles";
import { RouteError } from "./components/RouteError";
import { RootLayout } from "./layouts/RootLayout";
import { Account } from "./pages/Account";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
// import { Placeholder } from "./pages/Placeholder";
import { About, Contact, Cookies, Faqs, Privacy, Terms } from "./pages/info/InfoPages";
import { StyleGuide } from "./pages/StyleGuide";
import { Home } from "./pages/Home";
import { Posts } from "./pages/Posts";
import { PostPage } from "./pages/PostPage";
import { AuthorPage } from "./pages/AuthorPage";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { CategoryPage, TagPage } from "./pages/Taxonomy";
import { CheckEmail } from "./pages/CheckEmail";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ResetPassword } from "./pages/ResetPassword";
import { Bookmarks } from "./pages/Bookmarks";
import { MyPosts } from "./pages/studio/MyPosts";
import { PostEditor } from "./pages/studio/PostEditor";
import { ReviewQueue } from "./pages/desk/ReviewQueue";
import { ReviewPost } from "./pages/desk/ReviewPost";
import { CommentQueue } from "./pages/desk/CommentQueue";
import { Notifications } from "./pages/Notifications";
import { Analytics } from "./pages/desk/Analytics";
import { MediaLibrary } from "./pages/studio/MediaLibrary";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardHome } from "./pages/dashboard/DashboardHome";
// Every screen in the plan, who may open it, and the phase that builds it.
// Placeholders are replaced one by one as the phases land.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      // Everyone
      { path: "/", element: <Home /> },

      { path: "/posts", element: <Posts /> },
      { path: "/posts/:slug", element: <PostPage /> },
      { path: "/category/:slug", element: <CategoryPage /> },
      { path: "/tag/:slug", element: <TagPage /> },

      { path: "/author/:username", element: <AuthorPage /> },
      { path: "/verify-email", element: <VerifyEmail /> },
      { path: "/reset-password", element: <ResetPassword /> },

      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/faqs", element: <Faqs /> },
      { path: "/terms", element: <Terms /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/cookies", element: <Cookies /> },

      { path: "/styleguide", element: <StyleGuide /> },

      // Visitors only (logged-in people are sent away)
      {
        element: <GuestOnly />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
          { path: "/check-email", element: <CheckEmail /> },
          { path: "/forgot-password", element: <ForgotPassword /> },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },

  // The dashboard: everything for logged-in people, inside the menu layout
  {
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <DashboardHome /> },
          { path: "/account", element: <Account /> },
          { path: "/bookmarks", element: <Bookmarks /> },
          { path: "/notifications", element: <Notifications /> },

          // Writer studio
          {
            element: <RequireRole roles={WRITER_ROLES} />,
            children: [
              { path: "/studio", element: <MyPosts /> },
              { path: "/studio/new", element: <PostEditor /> },
              { path: "/studio/:id/edit", element: <PostEditor /> },
              { path: "/studio/media", element: <MediaLibrary /> },
            ],
          },

          // Moderation: editors, admins and authors (on their own posts)
          {
            element: <RequireRole roles={MODERATOR_ROLES} />,
            children: [{ path: "/desk/comments", element: <CommentQueue /> }],
          },

          // Editorial desk
          {
            element: <RequireRole roles={EDITOR_ROLES} />,
            children: [
              { path: "/desk/review", element: <ReviewQueue /> },
              { path: "/desk/review/:id", element: <ReviewPost /> },
              { path: "/desk/analytics", element: <Analytics /> },
            ],
          },
        ],
      },
    ],
  },
]);
