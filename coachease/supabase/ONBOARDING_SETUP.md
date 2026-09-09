# Enable tutorial memory

1. Open this project's Supabase dashboard → SQL Editor → New query.
2. Paste the complete contents of `migrations/20260909_coach_onboarding.sql` and click Run. It is safe to rerun.
3. Open the review version of CoachEase and sign in. Accounts with no onboarding row see the tour, including existing accounts.
4. Finish or skip. Refresh and then sign in on a second browser: the tour should not automatically repeat. Help & FAQ → Replay tutorial remains available.

The app remains usable before the migration. It disables automatic onboarding when status cannot be read and explains unavailable memory on Help & FAQ. A failed save keeps the tour open for retry; Close without saving is explicitly temporary.

## Changes to the database

Adds only `public.coach_onboarding`, with one row per authenticated account, an outcome (`completed` or `skipped`) and a timestamp. Existing client data is unchanged. Policies and grants allow authenticated accounts to read, insert and update only their own row. No anonymous access or client-side delete permission. No service-role key is needed. Policies follow the [Supabase row-level security guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

The migration has not been executed against the live project by Codex. Before merging, verify the following with the two coach accounts:

- Completing/skipping for account A does not dismiss the first-run tour for account B.
- Searching a client belonging only to A does not return it while logged in as B.
- Refresh and a second browser preserve completion. Replay remains available.
- Search `food`, `weight`, `overdue` and a client name; FAQ links open the corresponding expanded answer.
- Next, Back, Skip, Escape and keyboard focus work in the tour; search closes with Escape.

No registration page is introduced. The trigger is first authenticated workspace visit after the update. The original Getting started guide remains available alongside the popup tour.
