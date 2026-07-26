-- Run this once in your Supabase project's SQL editor:
-- Dashboard -> SQL Editor -> New query -> paste this whole file -> Run.

create table if not exists public.profiles (
  uid uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  photo_url text default '',
  avatar_seed text not null,
  created_at timestamptz not null default now()
);

-- One profile per email too, so contact-matching by email always resolves
-- to a single person.
create unique index if not exists profiles_email_key on public.profiles (lower(email));

alter table public.profiles enable row level security;

-- Any signed-in person can read any profile — that's what lets a device
-- match its local address book against Hoox (lib/contacts.ts) without a
-- server in between.
create policy "profiles are readable by any signed-in user"
  on public.profiles for select
  to authenticated
  using (true);

-- You can only ever create/update your own row, and only with your own
-- auth account's email (stops someone from claiming to be reachable at an
-- email that isn't theirs).
create policy "users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (
    uid = auth.uid()
    and lower(email) = lower(auth.jwt() ->> 'email')
  );

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (uid = auth.uid())
  with check (
    uid = auth.uid()
    and lower(email) = lower(auth.jwt() ->> 'email')
  );

-- No delete policy on purpose — nobody (not even the owner) can delete a
-- profile through the API for now. Revisit this once account deletion is
-- an actual feature, not an oversight.
