import { NextResponse } from "next/server";
import { signupSchema, isDisposableEmail } from "@/lib/validation";
import { insertSignup, overIpLimit, storeConfigured } from "@/lib/store";
import { clientIp, hashIp, memoryRateLimited } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 3000; // humans take longer than 3s to fill 8 fields
const MAX_PER_IP_PER_HOUR = 5;

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

export async function POST(req: Request) {
  // Same-origin check: reject cross-site form posts.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return fail(403, "bad_origin", "Request not allowed.");
  }

  const ip = clientIp(req.headers);
  if (memoryRateLimited(`signup:${ip}`, MAX_PER_IP_PER_HOUR, 60 * 60 * 1000)) {
    return fail(429, "rate_limited", "Too many attempts. Please try again later.");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "bad_json", "Invalid request.");
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    // Honeypot or timing failures look like success to bots.
    if (fields.website) return NextResponse.json({ ok: true, status: "created" });
    return NextResponse.json({ ok: false, code: "invalid", message: "Please check the highlighted fields.", fields }, { status: 422 });
  }
  const d = parsed.data;

  if (Date.now() - d.startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true, status: "created" }); // silently drop bots
  }
  if (isDisposableEmail(d.email)) {
    return fail(422, "disposable_email", "Please use your work or regular email address.");
  }

  if (!storeConfigured()) {
    return fail(503, "not_configured", "Sign-ups are not open yet. Please try again soon.");
  }

  const ipHash = hashIp(ip);
  try {
    // Durable rate limit across server instances.
    if (await overIpLimit(ipHash, MAX_PER_IP_PER_HOUR)) {
      return fail(429, "rate_limited", "Too many sign-ups from your network. Please try again later.");
    }
    const result = await insertSignup({
      full_name: d.fullName,
      hospital_name: d.hospitalName,
      role: d.role,
      email: d.email,
      phone: d.phone,
      city: d.city,
      state: d.state,
      bed_capacity: d.bedCapacity,
      monthly_claims: d.monthlyClaims,
      language: d.language,
      consent: true,
      ip_hash: ipHash,
      user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
    });
    return NextResponse.json({ ok: true, status: result });
  } catch (e) {
    console.error("signup store failed", e instanceof Error ? e.message : e);
    return fail(500, "server_error", "Something went wrong. Please try again.");
  }
}
