-- ───────────────────────────────────────────────────────────────────────────
-- Ashok Sudhansu — Supabase schema + Row-Level Security
--
-- Paste this whole file into the Supabase dashboard → SQL Editor → New query →
-- Run. It creates the three tables and the security rules:
--   • Everyone can READ thoughts / reviews / likes.
--   • Anyone can POST a review and like/unlike.
--   • Only Ashok (his auth UID below) can create/edit/delete thoughts and
--     delete reviews.
--
-- ADMIN_UID is pinned to Ashok's user so that even if public signup is ever
-- enabled, new accounts still cannot write thoughts. If his user is ever
-- recreated, update the UID in all policies below.
-- ───────────────────────────────────────────────────────────────────────────

-- Ashok's user id (Auth → Users):
--   99131b13-2d7f-4c30-9923-5b4000683ac4

-- ── THOUGHTS ────────────────────────────────────────────────────────────────
create table if not exists public.thoughts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text not null,
  category    text not null,
  body        text not null,
  pub_date    timestamptz not null default now(),
  updated_at  timestamptz
);

alter table public.thoughts enable row level security;

create policy "thoughts_read_all" on public.thoughts
  for select using (true);

create policy "thoughts_admin_insert" on public.thoughts
  for insert with check (auth.uid() = '99131b13-2d7f-4c30-9923-5b4000683ac4'::uuid);

create policy "thoughts_admin_update" on public.thoughts
  for update using (auth.uid() = '99131b13-2d7f-4c30-9923-5b4000683ac4'::uuid);

create policy "thoughts_admin_delete" on public.thoughts
  for delete using (auth.uid() = '99131b13-2d7f-4c30-9923-5b4000683ac4'::uuid);

-- ── REVIEWS ─────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text,
  quote      text not null,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "reviews_read_all" on public.reviews
  for select using (true);

create policy "reviews_public_insert" on public.reviews
  for insert with check (true);

create policy "reviews_admin_delete" on public.reviews
  for delete using (auth.uid() = '99131b13-2d7f-4c30-9923-5b4000683ac4'::uuid);

-- ── LIKES ───────────────────────────────────────────────────────────────────
-- One row per (thought, visitor). voter_id is a random id kept in the visitor's
-- browser. Count = number of rows for a slug.
create table if not exists public.likes (
  thought_slug text not null,
  voter_id     text not null,
  created_at   timestamptz not null default now(),
  primary key (thought_slug, voter_id)
);

alter table public.likes enable row level security;

create policy "likes_read_all" on public.likes
  for select using (true);

create policy "likes_public_insert" on public.likes
  for insert with check (true);

create policy "likes_public_delete" on public.likes
  for delete using (true);
