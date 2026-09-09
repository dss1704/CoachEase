-- Run this entire file once in the Supabase SQL Editor before testing the tour.
-- Safe to rerun. Existing client records and accounts are unchanged.
begin;
create table if not exists public.coach_onboarding (
  coach_id uuid primary key references auth.users(id) on delete cascade,
  outcome text not null check (outcome in ('completed', 'skipped')),
  finished_at timestamptz not null default now()
);
alter table public.coach_onboarding enable row level security;
revoke all on public.coach_onboarding from public, anon, authenticated;
grant select, insert, update on public.coach_onboarding to authenticated;
drop policy if exists "Read own onboarding" on public.coach_onboarding;
create policy "Read own onboarding" on public.coach_onboarding for select to authenticated using ((select auth.uid()) = coach_id);
drop policy if exists "Insert own onboarding" on public.coach_onboarding;
create policy "Insert own onboarding" on public.coach_onboarding for insert to authenticated with check ((select auth.uid()) = coach_id);
drop policy if exists "Update own onboarding" on public.coach_onboarding;
create policy "Update own onboarding" on public.coach_onboarding for update to authenticated using ((select auth.uid()) = coach_id) with check ((select auth.uid()) = coach_id);
commit;
