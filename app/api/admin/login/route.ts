import { NextResponse } from "next/server";
import { ADMIN_COOKIE, clientIp, createSessionToken, memoryRateLimited, passwordMatches } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const url = new URL(req.url);
  if (memoryRateLimited(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.redirect(new URL("/admin/login?error=locked", url), 303);
  }
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  if (!passwordMatches(password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", url), 303);
  }
  const { token, maxAge } = createSessionToken();
  const res = NextResponse.redirect(new URL("/admin", url), 303);
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
  return res;
}
