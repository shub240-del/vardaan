import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

// TODO before launch: replace the bracketed placeholders with real details.
const CONTACT_NAME = "[Grievance officer name]";
const CONTACT_EMAIL = "[privacy@yourdomain]";
const CONTACT_CITY = "[City, State]";
const UPDATED = "12 November 2026";

export default function Privacy() {
  return (
    <main className="wrap page">
      <a className="back" href="/">← Back to Vardaan</a>
      <article className="prose">
        <h1>Privacy policy</h1>
        <p><em>Last updated: {UPDATED}</em></p>
        <p>This policy explains what information Vardaan collects through its waitlist, why, and how you can control it. Vardaan is at an early stage; this page covers the waitlist only.</p>

        <h2>What we collect</h2>
        <ul>
          <li>Your full name, role and hospital name</li>
          <li>Your work email and mobile number</li>
          <li>Your hospital's city, state, bed capacity and approximate monthly cashless claims</li>
          <li>Your language preference and the time you gave consent</li>
          <li>A one-way hashed version of your network address and your browser type, used only to prevent spam and abuse</li>
        </ul>
        <p>We do <strong>not</strong> collect any patient information through this website. Please do not enter patient details in the form.</p>

        <h2>Why we collect it</h2>
        <ul>
          <li>To contact you about the waitlist and your free deduction audit</li>
          <li>To understand which hospitals need Vardaan, so we can plan our launch</li>
          <li>To protect the form from spam and misuse</li>
        </ul>
        <p>We process this information on the basis of your consent, which you give by ticking the consent box. We do not sell your information or use it for third-party advertising.</p>

        <h2>Where it is stored and who sees it</h2>
        <p>Sign-ups are stored in Google Firebase Cloud Firestore. Security rules block anyone outside the Vardaan team from reading them. Our website is hosted on Google Firebase Hosting. These providers process data on our behalf under their own security and privacy terms.</p>

        <h2>Website analytics</h2>
        <p>We use Google Analytics for Firebase to understand how visitors use this website, such as which pages are viewed and roughly where visits come from. It uses cookies and similar identifiers. It does not receive the details you type into the waitlist form. You can block these cookies in your browser settings.</p>

        <h2>How long we keep it</h2>
        <p>We keep waitlist details for up to 24 months, or until you ask us to delete them, whichever is sooner.</p>

        <h2>Your rights</h2>
        <p>You can ask us to access, correct or delete your information, or withdraw your consent at any time, by writing to {CONTACT_EMAIL}. We will respond within 30 days. Withdrawing consent does not affect processing done before you withdrew it.</p>

        <h2>Grievance officer</h2>
        <p>{CONTACT_NAME}<br />Email: {CONTACT_EMAIL}<br />{CONTACT_CITY}</p>

        <h2>Changes</h2>
        <p>If we change this policy, we will update the date above. Significant changes will be shared with people on the waitlist.</p>
      </article>
    </main>
  );
}
