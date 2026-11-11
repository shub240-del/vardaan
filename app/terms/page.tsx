import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <main className="wrap page">
      <a className="back" href="/">← Back to Vardaan</a>
      <article className="prose">
        <h1>Terms of use</h1>
        <p><em>Last updated: 12 November 2026</em></p>
        <p>By using this website or joining the Vardaan waitlist, you agree to these terms.</p>
        <h2>The waitlist</h2>
        <p>Joining the waitlist does not create a contract for services. Vardaan is in early development; features, availability and pricing may change. Any paid service will be offered under a separate written agreement.</p>
        <h2>Information you provide</h2>
        <p>You confirm that the details you submit are accurate and that you are authorised to share them on behalf of your hospital. Do not submit patient information through this website.</p>
        <h2>No professional advice</h2>
        <p>Content on this website is general information. It is not medical, legal, insurance or financial advice.</p>
        <h2>Acceptable use</h2>
        <p>Do not misuse the website, including automated submissions, attempts to gain unauthorised access, or submitting someone else's details without permission.</p>
        <h2>Contact</h2>
        <p>Questions about these terms can be sent to the contact listed in our <a href="/privacy">privacy policy</a>.</p>
      </article>
    </main>
  );
}
