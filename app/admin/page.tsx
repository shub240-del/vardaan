import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getSupabase, supabaseConfigured, TABLE } from "@/lib/supabase";

export const metadata: Metadata = { title: "Waitlist admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Row = {
  id: string; created_at: string; full_name: string; hospital_name: string; role: string;
  email: string; phone: string; city: string; state: string; bed_capacity: string;
  monthly_claims: string; language: string;
};

const PAGE = 50;

export default async function AdminPage({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  if (!isAdmin()) redirect("/admin/login");

  if (!supabaseConfigured()) {
    return (
      <main className="wrap admin">
        <h2>Waitlist</h2>
        <p className="server-error">Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.</p>
      </main>
    );
  }

  const q = (searchParams.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = getSupabase();

  let query = supabase
    .from(TABLE)
    .select("id,created_at,full_name,hospital_name,role,email,phone,city,state,bed_capacity,monthly_claims,language", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);

  if (q) {
    const safe = q.replace(/[%,()]/g, " ");
    query = query.or(
      ["full_name", "hospital_name", "email", "phone", "city", "state"].map((c) => `${c}.ilike.%${safe}%`).join(",")
    );
  }

  const { data, count, error } = await query;
  const rows = (data ?? []) as Row[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <main className="wrap admin">
      <div className="admin-bar">
        <h2 style={{ margin: 0 }}>Waitlist</h2>
        <form method="get" action="/admin" role="search">
          <input name="q" defaultValue={q} placeholder="Search name, hospital, email, city…" aria-label="Search" />
          <button className="btn small ghost" type="submit">Search</button>
        </form>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn small primary" href="/api/admin/export">Export CSV</a>
          <form method="post" action="/api/admin/logout"><button className="btn small ghost" type="submit">Log out</button></form>
        </div>
      </div>

      {error && <p className="server-error">Could not load sign-ups: {error.message}</p>}

      <div className="admin-stats">
        <div><span>{q ? "Matching" : "Total sign-ups"}</span><strong>{total}</strong></div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Name</th><th>Hospital</th><th>Role</th><th>Email</th><th>Phone</th>
              <th>City</th><th>State</th><th>Beds</th><th>Claims/mo</th><th>Lang</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={11} style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>No sign-ups yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</td>
                  <td>{r.full_name}</td><td>{r.hospital_name}</td><td>{r.role}</td>
                  <td><a href={`mailto:${r.email}`}>{r.email}</a></td><td>{r.phone}</td>
                  <td>{r.city}</td><td>{r.state}</td><td>{r.bed_capacity}</td>
                  <td>{r.monthly_claims === "not_sure" ? "Not sure" : r.monthly_claims}</td><td>{r.language}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <p style={{ marginTop: 16, display: "flex", gap: 12 }}>
          {page > 1 && <a href={`/admin?q=${encodeURIComponent(q)}&page=${page - 1}`}>← Previous</a>}
          <span>Page {page} of {pages}</span>
          {page < pages && <a href={`/admin?q=${encodeURIComponent(q)}&page=${page + 1}`}>Next →</a>}
        </p>
      )}
    </main>
  );
}
