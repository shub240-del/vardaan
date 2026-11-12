import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { allSignups } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = [
  "created_at", "full_name", "hospital_name", "role", "email", "phone",
  "city", "state", "bed_capacity", "monthly_claims", "language",
] as const;

function csvCell(v: unknown): string {
  let s = v == null ? "" : String(v);
  // Guard against spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ ok: false }, { status: 401 });
  let rows: Record<string, unknown>[];
  try {
    rows = (await allSignups()) as unknown as Record<string, unknown>[];
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : "export failed" }, { status: 500 });
  }
  const csv = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => csvCell(r[c])).join(","))].join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vardaan-waitlist-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
