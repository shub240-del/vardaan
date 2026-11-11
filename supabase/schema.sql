-- Vardaan waitlist schema. Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create extension if not exists pgcrypto;

create table if not exists public.waitlist_signups (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  full_name       text not null check (char_length(full_name) between 2 and 120),
  hospital_name   text not null check (char_length(hospital_name) between 2 and 160),
  role            text not null check (char_length(role) between 2 and 80),
  email           text not null check (char_length(email) between 5 and 254),
  phone           text not null check (phone ~ '^\+91[6-9][0-9]{9}$'),
  city            text not null check (char_length(city) between 2 and 80),
  state           text not null check (char_length(state) between 2 and 80),
  bed_capacity    text not null check (bed_capacity in ('<10','10-29','30-49','50-100','100+')),
  monthly_claims  text not null check (monthly_claims in ('<15','15-40','40-100','100+','not_sure')),
  language        text not null default 'en' check (language in ('en','hi')),
  consent         boolean not null check (consent = true),
  consent_at      timestamptz not null default now(),
  ip_hash         text,
  user_agent      text
);

-- Duplicate protection: one signup per email and one per phone.
create unique index if not exists waitlist_email_unique on public.waitlist_signups (lower(email));
create unique index if not exists waitlist_phone_unique on public.waitlist_signups (phone);
create index if not exists waitlist_created_idx on public.waitlist_signups (created_at desc);
create index if not exists waitlist_ip_idx on public.waitlist_signups (ip_hash, created_at desc);

-- Lock the table down. Only the server (service-role key) can read or write.
alter table public.waitlist_signups enable row level security;
revoke all on public.waitlist_signups from anon, authenticated;
-- No policies are created on purpose: anon and authenticated users get no access.
