"use client";

import { useEffect, useMemo, useState } from "react";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import { firebaseApp, SIGNUPS } from "@/lib/firebase";

type Row = {
  id: string; created: string; full_name: string; hospital_name: string; role: string; email: string;
  phone: string; city: string; state: string; bed_capacity: string; monthly_claims: string; language: string;
};
const COLS: [keyof Row, string][] = [
  ["created", "Date"], ["full_name", "Name"], ["hospital_name", "Hospital"], ["role", "Role"], ["email", "Email"],
  ["phone", "Phone"], ["city", "City"], ["state", "State"], ["bed_capacity", "Beds"], ["monthly_claims", "Claims/mo"], ["language", "Lang"],
];
const PAGE = 50;

function csvCell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // spreadsheet formula-injection guard
  return `"${s.replace(/"/g, '""')}"`;
}

export default function AdminClient() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => onAuthStateChanged(getAuth(firebaseApp()), setUser), []);

  useEffect(() => {
    if (!user) { setIsAdmin(null); setRows([]); return; }
    (async () => {
      try {
        const db = getFirestore(firebaseApp());
        const ok = (await getDoc(doc(db, "admins", user.uid))).exists();
        setIsAdmin(ok);
        if (!ok) return;
        const snap = await getDocs(query(collection(db, SIGNUPS), orderBy("created_at", "desc")));
        setRows(snap.docs.map((d) => {
          const x = d.data();
          const t = x.created_at?.toDate?.() as Date | undefined;
          return {
            id: d.id, created: t ? t.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "",
            full_name: x.full_name, hospital_name: x.hospital_name, role: x.role, email: x.email, phone: x.phone,
            city: x.city, state: x.state, bed_capacity: x.bed_capacity, monthly_claims: x.monthly_claims, language: x.language,
          };
        }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load sign-ups.");
      }
    })();
  }, [user]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return rows;
    return rows.filter((r) => ["full_name", "hospital_name", "email", "phone", "city", "state"].some((k) => String(r[k as keyof Row] ?? "").toLowerCase().includes(n)));
  }, [rows, q]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const shown = filtered.slice((page - 1) * PAGE, page * PAGE);

  function exportCsv() {
    const csv = [COLS.map((c) => c[1]).join(","), ...filtered.map((r) => COLS.map(([k]) => csvCell(r[k])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `vardaan-waitlist-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (user === undefined) return <main className="wrap admin"><p>Loading…</p></main>;

  if (!user) {
    return (
      <main className="wrap login">
        <div className="form-card">
          <h3>Waitlist admin</h3>
          <p className="form-sub">Sign in with the Google account you added as an admin.</p>
          <button className="btn primary full" onClick={() => signInWithPopup(getAuth(firebaseApp()), new GoogleAuthProvider()).catch((e) => setError(e.message))}>Sign in with Google</button>
          {error && <p className="server-error" style={{ marginTop: 14 }}>{error}</p>}
        </div>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="wrap login">
        <div className="form-card">
          <h3>Not an admin yet</h3>
          <p className="form-sub">Signed in as {user.email}. To give this account access, open Firebase console → Firestore → start collection <code>admins</code> → document ID:</p>
          <p><code style={{ wordBreak: "break-all" }}>{user.uid}</code></p>
          <p className="form-sub">Add any field (for example <code>name</code> = your name), save, then reload this page.</p>
          <button className="btn ghost full" onClick={() => signOut(getAuth(firebaseApp()))}>Sign out</button>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap admin">
      <div className="admin-bar">
        <h2 style={{ margin: 0 }}>Waitlist</h2>
        <form onSubmit={(e) => e.preventDefault()} role="search">
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, hospital, email, city…" aria-label="Search" />
        </form>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn small primary" onClick={exportCsv} disabled={!filtered.length}>Export CSV</button>
          <button className="btn small ghost" onClick={() => signOut(getAuth(firebaseApp()))}>Log out</button>
        </div>
      </div>
      {error && <p className="server-error">Could not load sign-ups: {error}</p>}
      <div className="admin-stats"><div><span>{q ? "Matching" : "Total sign-ups"}</span><strong>{isAdmin === null ? "…" : filtered.length}</strong></div></div>
      <div className="table-wrap">
        <table>
          <thead><tr>{COLS.map(([, h]) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {shown.length === 0 ? (
              <tr><td colSpan={COLS.length}>{isAdmin === null ? "Loading…" : "No sign-ups yet."}</td></tr>
            ) : shown.map((r) => <tr key={r.id}>{COLS.map(([k]) => <td key={k}>{r[k]}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
          <button className="btn small ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button className="btn small ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </main>
  );
}
