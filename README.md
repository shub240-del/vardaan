# Vardaan waitlist

Next.js 14 site with a secure server-side signup API (Supabase Postgres), a private admin dashboard, and English/Hindi copy.

Vercel project: `vardaan-waitlist` (team shub240-del's projects), functions in Mumbai (`bom1`).

## Finish setup (in this order)

1. **Supabase:** create a project (Mumbai region if offered). Open SQL Editor, paste `supabase/schema.sql`, and run it.
2. **Vercel env vars** (Project → Settings → Environment Variables → Production + Preview):
   - `SUPABASE_URL`: from Supabase → Project Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY`: same page. Mark it **Sensitive**. Never prefix it with `NEXT_PUBLIC_`.
   - `ADMIN_PASSWORD`: at least 10 characters
   - `ADMIN_SESSION_SECRET`: at least 32 random characters (`openssl rand -hex 32`)
   - `NEXT_PUBLIC_SITE_URL`: `https://yourdomain`
3. **Privacy policy:** replace the three `[...]` placeholders in `app/privacy/page.tsx`.
4. **Domain:** Vercel → Project → Settings → Domains → add your domain, then add the DNS records Vercel shows at your registrar.
5. **Redeploy** so the env vars take effect.
6. **Verify:** submit a real test signup on the custom domain, confirm the row in Supabase (Table Editor → `waitlist_signups`), then log in at `/admin` and export the CSV.

## Security notes
- The service-role key is only read in server code (`lib/supabase.ts`, marked `server-only`). The build was checked for leaks into client bundles.
- Row-level security is on with no policies, so the anon and authenticated roles have no access.
- Spam protection: honeypot field, minimum fill time, same-origin check, per-IP limits (in memory and in the database, 5 per hour), and a disposable-email block.
- Duplicate protection: unique email and phone in the database, plus a client-side in-flight guard.
- Admin: an HMAC-signed, httpOnly, SameSite=strict cookie with an 8-hour expiry, and login limited to 5 attempts per 15 minutes.

## Local dev
```
cp .env.example .env.local   # fill in values
npm install
npm run dev
```
