import "server-only";
import { createHash, createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET missing or shorter than 32 characters.");
  return s;
}

/** One-way hash of the client IP, salted with the session secret. We never store raw IPs. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${secret()}:${ip}`).digest("hex").slice(0, 32);
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/* ---------- In-memory rate limit (first line; per server instance) ---------- */
const hits = new Map<string, number[]>();
export function memoryRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > limit;
}

/* ---------- Admin session (HMAC-signed cookie) ---------- */
export const ADMIN_COOKIE = "vd_admin";
const SESSION_MS = 8 * 60 * 60 * 1000;

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionToken(): { token: string; maxAge: number } {
  const exp = String(Date.now() + SESSION_MS);
  return { token: `${exp}.${sign(exp)}`, maxAge: SESSION_MS / 1000 };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  const expected = sign(exp);
  if (expected.length !== sig.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  return Number(exp) > Date.now();
}

export function passwordMatches(input: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || real.length < 10) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(real).digest();
  return timingSafeEqual(a, b);
}
