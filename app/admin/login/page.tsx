import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default function AdminLogin({ searchParams }: { searchParams: { error?: string } }) {
  const error =
    searchParams.error === "locked"
      ? "Too many attempts. Try again in 15 minutes."
      : searchParams.error
      ? "Incorrect password."
      : "";
  return (
    <main className="wrap">
      <form className="form-card login" method="post" action="/api/admin/login">
        <h3>Vardaan admin</h3>
        <label>
          Password
          <input type="password" name="password" autoComplete="current-password" required minLength={10} />
        </label>
        {error && <p className="server-error" role="alert">{error}</p>}
        <button className="btn primary full" type="submit">Sign in</button>
      </form>
    </main>
  );
}
