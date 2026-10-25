# Supabase: accounts, cloud sync, cross-account duplicate check

> **Status (26 Oct 2026): switched off in the interface.** Accounts, cloud backup and the cross-account duplicate check are built and tested but hidden for now: `ACCOUNTS_ENABLED = false` in `web/src/services/config.ts`. While off there is no Account page or link, nothing is ever uploaded (even if a session was left in the browser), and the duplicate check uses this device's records only. Set it to `true` (and add the Supabase variables to `web/.env.local`) to bring it back.

The app is **local-first**. Everything works on-device with no account. Supabase
adds optional sign-in, cloud backup of records, and a duplicate-photo check
across accounts.

## Verified, and what is not

This is the part to be honest about in a viva.

| Layer | Status |
|---|---|
| Database schema, row-level security, duplicate function, storage rules | **Tested** against a real Postgres engine: 22 tests (`supabase/tests`) |
| Key-safety guard and sync orchestration | **Tested**: 16 tests (`web/tests`), including failure injection |
| Local-first behaviour with Supabase *not* configured | **Verified in a browser**: saves locally, no cloud messaging, delete works |
| Account page, sign in / sign up, upload, remote delete, remote duplicate | **Written and type-checked, NOT run against a live Supabase project** |

I had no Supabase project or credentials, so the SDK wiring in
`web/src/services/cloud.ts` has not talked to a real server. The first live run
will likely surface small problems (a setting, a column name, a redirect).
Budget time to try it before demonstrating it.

## Setup

1. Create a Supabase project.
2. Run `supabase/migrations/20261025000000_core.sql` (SQL editor, or
   `supabase db push`). It is idempotent.
3. In the project's Auth settings choose whether email confirmation is required.
   The app handles both.
4. Put the project URL and the **public** key in `web/.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon / publishable key>
   ```

5. Restart the dev server. `/account` now shows a sign-in form instead of
   "Cloud sync is off".

**Never use the service-role or secret key.** It bypasses every row-level
security rule. The client refuses to start if it recognises one (JWT role
`service_role`, or an `sb_secret_` prefix), and says so, but that is a
seatbelt. If one was ever pasted into a `NEXT_PUBLIC_` variable, treat it as
leaked and rotate it.

## Security model

Access control lives in the database, not the app. Each table has row-level
security allowing a user to read and write only rows where `user_id` equals
their own id, so a bug or a hostile client in the app cannot widen access.

Tested properties (`supabase/tests/rls.test.mjs`):

- A user sees none of another user's records or sale prices.
- A user cannot update or delete another user's rows (0 rows affected).
- A user cannot insert a row owned by someone else.
- Upserting another user's record id cannot overwrite it.
- Anonymous visitors can read and write nothing.
- Images: a user can write only inside their own `<user_id>/` folder, and cannot
  see or delete anyone else's. The bucket is private, limited to 5 MB and to
  JPEG/PNG/WebP.
- Constraints reject out-of-range confidence, bad bands, malformed hashes,
  half a coordinate, prices outside ₹1,000–₹10,00,000, and future sale dates.
- **Synthetic demo sale prices are rejected by the database itself**, not just
  by the client, so they can never be mistaken for evidence in shared data.

Each of these tests was confirmed to **fail** when the corresponding rule was
deliberately weakened (reads opened to everyone, an id leaked from the duplicate
function, synthetic rows allowed).

## Cross-account duplicate check

The on-device check cannot see photos submitted from another account.
`check_duplicate_photo` closes that gap using a security-definer function that
returns **only** a Hamming distance, a tier (`same` / `similar`), whether the
match is the caller's own, and the date **only if it is the caller's own**.
Tested: it returns no record id, owner, image path or location.

It still compares pictures, not animals, and misses cropped or rotated copies
(see `duplicate-detection.md`).

**Privacy trade-off to be aware of:** the function does reveal that *someone* has
already submitted a near-identical photo. That is the point of the feature, but
it means a person holding a specific photo can test whether it exists in the
system. The 64-bit hash space makes guessing an unknown photo infeasible. There
is no rate limit on this function yet.

## What gets uploaded

When signed in and syncing: the photo (as the app already resized it), the
prediction and alternatives, model version, the perceptual hash, any duplicate
flag, the optional note, and **GPS coordinates if you attached them**. Real
sale prices are uploaded; demo prices never are. Location of a farm is personal
data: it is opt-in per record, as before, and nothing is uploaded without
signing in.

## Behaviour worth knowing

- **Sync is push-only.** It uploads from this device. Records made on another
  device do not appear here yet, so this is **backup, not multi-device sync.**
- **Idempotent and resumable.** Record ids are generated on the device, so a
  retry after a failure never duplicates anything. One bad record does not block
  the rest. Records upload oldest-first, each image before its row.
- **Deleting a synced record deletes the cloud copy first.** If that fails
  (offline, signed out), the deletion is refused with a message rather than
  leaving a cloud copy the user believes is gone.
- Saving while signed in triggers an automatic sync. A failure never blocks the
  save; the record simply stays pending.

## Known gaps

- Not exercised against a live project (above).
- **No pull / restore** from the cloud, and no conflict handling, because there
  are no edits.
- **Deleting an account does not remove its stored images.** Rows cascade;
  storage objects are not foreign-keyed to users and would need a cleanup job.
- No rate limiting on the duplicate-check function.
- The FastAPI backend and its SQLite database are separate and unchanged.
  `/api/classify` records to SQLite; the web app's cloud data lives in Supabase.
  They are not unified.
- The `mnpr` repository has its own `supabase/` folder with a different schema
  (profiles, detections, farmers, alerts). The two have not been reconciled and
  should not be applied to the same project without doing so.

## Running the tests

```bash
cd supabase/tests && npm install && npm test
```

```bash
cd web && npm test
```
