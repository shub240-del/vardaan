import "server-only";
import { createHash } from "crypto";
import { getSupabase, supabaseConfigured, TABLE } from "@/lib/supabase";

/**
 * Storage for waitlist sign-ups. Uses Firestore when FIREBASE_SERVICE_ACCOUNT is set,
 * otherwise Supabase. All access is server-side with admin credentials; browsers never
 * read or write the database directly.
 */

export type SignupRow = {
  id: string; created_at: string; full_name: string; hospital_name: string; role: string;
  email: string; phone: string; city: string; state: string; bed_capacity: string;
  monthly_claims: string; language: string;
};

export type NewSignup = Omit<SignupRow, "id" | "created_at"> & {
  consent: true; ip_hash: string; user_agent: string;
};

const COLLECTION = "waitlist_signups";
const SEARCH_FIELDS = ["full_name", "hospital_name", "email", "phone", "city", "state"] as const;

export function storeBackend(): "firestore" | "supabase" | null {
  if (process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_USE_ADC === "1") return "firestore";
  if (supabaseConfigured()) return "supabase";
  return null;
}

export function storeConfigured(): boolean {
  return storeBackend() !== null;
}

/* ---------------- Firestore ---------------- */

async function firestore() {
  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  if (!getApps().length && !process.env.FIREBASE_SERVICE_ACCOUNT) {
    initializeApp(); // Firebase App Hosting / Google Cloud: built-in service credentials
  } else if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT!.trim();
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const sa = JSON.parse(json);
    initializeApp({ credential: cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }) });
  }
  return getFirestore();
}

const key = (s: string) => createHash("sha256").update(s).digest("hex");

/* ---------------- API ---------------- */

/** Atomically counts this IP's sign-ups in the current hour. Returns true if over the limit. */
export async function overIpLimit(ipHash: string, max: number): Promise<boolean> {
  if (storeBackend() === "firestore") {
    const db = await firestore();
    const bucket = Math.floor(Date.now() / 3_600_000);
    const ref = db.collection("waitlist_rate").doc(`${ipHash}_${bucket}`);
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const n = (snap.exists ? (snap.data()!.n as number) : 0) + 1;
      tx.set(ref, { n, expires_at: new Date((bucket + 2) * 3_600_000) });
      return n > max;
    });
  }
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count, error } = await getSupabase()
    .from(TABLE).select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash).gte("created_at", since);
  if (error) throw new Error(error.message);
  return (count ?? 0) >= max;
}

/** Inserts a sign-up. Returns "duplicate" if the email or phone is already on the list. */
export async function insertSignup(s: NewSignup): Promise<"created" | "duplicate"> {
  if (storeBackend() === "firestore") {
    const db = await firestore();
    const ref = db.collection(COLLECTION).doc();
    const batch = db.batch();
    // Unique-key docs: create() fails if they exist, which makes the whole batch fail atomically.
    batch.create(db.collection("waitlist_unique").doc(`email_${key(s.email.toLowerCase())}`), { signup: ref.id });
    batch.create(db.collection("waitlist_unique").doc(`phone_${key(s.phone)}`), { signup: ref.id });
    batch.create(ref, { ...s, created_at: new Date().toISOString() });
    try {
      await batch.commit();
      return "created";
    } catch (e: unknown) {
      const code = (e as { code?: number | string }).code;
      if (code === 6 || code === "already-exists" || code === "ALREADY_EXISTS") return "duplicate";
      throw e;
    }
  }
  const { error } = await getSupabase().from(TABLE).insert(s);
  if (error) {
    if (error.code === "23505") return "duplicate";
    throw new Error(`${error.code} ${error.message}`);
  }
  return "created";
}

const PUBLIC_COLS = "id,created_at,full_name,hospital_name,role,email,phone,city,state,bed_capacity,monthly_claims,language";

async function allFirestore(): Promise<SignupRow[]> {
  const db = await firestore();
  const snap = await db.collection(COLLECTION).orderBy("created_at", "desc").limit(20000).get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id, created_at: x.created_at, full_name: x.full_name, hospital_name: x.hospital_name, role: x.role,
      email: x.email, phone: x.phone, city: x.city, state: x.state, bed_capacity: x.bed_capacity,
      monthly_claims: x.monthly_claims, language: x.language,
    };
  });
}

/** One page of sign-ups, newest first, optionally filtered by a search term. */
export async function listSignups(q: string, page: number, size: number): Promise<{ rows: SignupRow[]; total: number }> {
  if (storeBackend() === "firestore") {
    let rows = await allFirestore();
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter((r) => SEARCH_FIELDS.some((f) => String(r[f] ?? "").toLowerCase().includes(needle)));
    }
    return { rows: rows.slice((page - 1) * size, page * size), total: rows.length };
  }
  let query = getSupabase().from(TABLE).select(PUBLIC_COLS, { count: "exact" })
    .order("created_at", { ascending: false }).range((page - 1) * size, page * size - 1);
  if (q) {
    const safe = q.replace(/[%,()]/g, " ");
    query = query.or(SEARCH_FIELDS.map((c) => `${c}.ilike.%${safe}%`).join(","));
  }
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as unknown as SignupRow[], total: count ?? 0 };
}

/** Every sign-up, newest first (for CSV export). */
export async function allSignups(): Promise<SignupRow[]> {
  if (storeBackend() === "firestore") return allFirestore();
  const out: SignupRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await getSupabase().from(TABLE).select(PUBLIC_COLS)
      .order("created_at", { ascending: false }).range(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as unknown as SignupRow[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}
