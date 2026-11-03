import { Link } from "react-router-dom";
import { BRAND_NAME, CONTACT_EMAIL } from "../../brand";
import { InfoPage } from "./InfoPage";

/** Date shown on the legal pages. Update it whenever the text changes. */
const LEGAL_UPDATED = "2 November 2026";

/** About page. */
export function About() {
  return (
    <InfoPage
      title={`About ${BRAND_NAME}`}
      intro="Trending entertainment and stories, kept in one place."
    >
      <p>
        {BRAND_NAME} is a blog about what people are watching, listening to and talking about. We
        publish stories from our team of writers and keep them in an archive you can search and
        come back to.
      </p>
      <h2>What you will find here</h2>
      <ul>
        <li>Fresh posts from our writers, reviewed by our editors before they go live.</li>
        <li>Categories and tags to help you follow the topics you care about.</li>
        <li>Accounts, so you can bookmark posts and join the conversation.</li>
      </ul>
      <p>
        Want to write for us? <Link to="/register">Create an account</Link> and{" "}
        <Link to="/contact">get in touch</Link>.
      </p>
    </InfoPage>
  );
}

/** Contact page. The email only shows once CONTACT_EMAIL is filled in. */
export function Contact() {
  return (
    <InfoPage title="Contact us" intro="Questions, ideas or corrections? We would like to hear from you.">
      {CONTACT_EMAIL ? (
        <p>
          Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to reply
          within a few working days.
        </p>
      ) : (
        <p>Our contact details will be published here soon.</p>
      )}
      <h2>Before you write</h2>
      <ul>
        <li>
          Forgot your password? Use <Link to="/forgot-password">password reset</Link>.
        </li>
        <li>
          Looking for answers? Check the <Link to="/faqs">FAQs</Link> first.
        </li>
      </ul>
    </InfoPage>
  );
}

/** Frequently asked questions, using native open and close. */
export function Faqs() {
  return (
    <InfoPage title="FAQs" intro="Quick answers to the most common questions.">
      <details className="info-faq">
        <summary>Do I need an account to read posts?</summary>
        <p>No. Every published post is free to read without an account.</p>
      </details>
      <details className="info-faq">
        <summary>What does an account give me?</summary>
        <p>
          You can save posts to your bookmarks and take part in the conversation on posts, and
          manage your profile.
        </p>
      </details>
      <details className="info-faq">
        <summary>I forgot my password. What now?</summary>
        <p>
          Open the <Link to="/forgot-password">password reset</Link> page, enter your email and
          follow the link we send you.
        </p>
      </details>
      <details className="info-faq">
        <summary>How can I write for {BRAND_NAME}?</summary>
        <p>
          Create an account, then <Link to="/contact">contact us</Link>. Writers get access to
          the studio, and every post is reviewed by an editor before it is published.
        </p>
      </details>
    </InfoPage>
  );
}

/*
 * The three pages below are plain-language STARTER DRAFTS that describe what
 * the site does today. Have a lawyer review and adjust them before launch.
 */

/** Terms of service. */
export function Terms() {
  return (
    <InfoPage title="Terms of Service" updated={LEGAL_UPDATED}>
      <p>
        By using {BRAND_NAME} you agree to these terms. If you do not agree, please do not use the
        site.
      </p>
      <h2>Your account</h2>
      <p>
        You are responsible for keeping your password safe and for what happens under your
        account. Give accurate details when you register.
      </p>
      <h2>Content you submit</h2>
      <p>
        You keep ownership of what you write. By submitting it you allow us to publish and display
        it on the site. Do not post anything unlawful, abusive, misleading or that you do not have
        the right to share. We may edit, reject or remove content and suspend accounts that break
        these rules.
      </p>
      <h2>Our content</h2>
      <p>
        Posts and design on the site belong to {BRAND_NAME} or its writers. You may share links and
        short quotes with credit, but please do not republish whole posts without permission.
      </p>
      <h2>No guarantees</h2>
      <p>
        We work to keep the site accurate and available, but it is provided as it is, without
        promises. We may change or stop parts of the site at any time.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows when they last changed.</p>
    </InfoPage>
  );
}

/** Privacy policy. */
export function Privacy() {
  return (
    <InfoPage title="Privacy Policy" updated={LEGAL_UPDATED}>
      <p>This page explains what {BRAND_NAME} collects and why.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details you give us: email address, username and a password (stored scrambled, never in plain text).</li>
        <li>Content you submit, such as comments, bookmarks and posts.</li>
        <li>Basic usage figures, such as how many times a post is viewed.</li>
      </ul>
      <h2>What is saved in your browser</h2>
      <p>
        We keep your login and your light or dark theme choice in your browser's storage so you
        stay signed in and the site looks the way you left it. See the{" "}
        <Link to="/cookies">Cookie Policy</Link>.
      </p>
      <h2>How we use it</h2>
      <p>
        To run your account, show your content, send account emails (such as verifying your
        address or resetting a password), keep the site safe and understand which posts are read.
        We do not sell your personal data.
      </p>
      <h2>Newsletter</h2>
      <p>The newsletter is not open yet. When it opens, we will only email you if you subscribe.</p>
      <h2>Your choices</h2>
      <p>
        You can update your details from your account page. To ask for your data to be deleted,
        please <Link to="/contact">contact us</Link>.
      </p>
    </InfoPage>
  );
}

/** Cookie policy. */
export function Cookies() {
  return (
    <InfoPage title="Cookie Policy" updated={LEGAL_UPDATED}>
      <p>
        We keep this simple: we use only what the site needs to work. We do not use advertising
        cookies.
      </p>
      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Login:</strong> your sign-in details, so you stay signed in. Removed when you
          log out.
        </li>
        <li>
          <strong>Theme:</strong> whether you chose light, dark or your device setting.
        </li>
      </ul>
      <h2>Clearing it</h2>
      <p>
        You can clear this at any time from your browser's settings. You will be signed out and
        the theme will reset.
      </p>
    </InfoPage>
  );
}
