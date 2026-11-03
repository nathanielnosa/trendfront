import { Outlet } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

/** The frame around every page: skip link, header, page content, footer. */
export function RootLayout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="container page">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
