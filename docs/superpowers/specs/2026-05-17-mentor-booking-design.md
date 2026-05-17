# Mentor booking flow — design

**Date:** 2026-05-17
**Branch:** `feat/mentor-booking` (off `main`)
**Status:** Draft, awaiting review

## 1. Goal

Build the end-to-end booking experience around the existing `mentors` + `availability` tables:

1. A public **mentor application** flow (shareable link for LinkedIn/IG → admin approval).
2. An approved-mentor **self-serve onboarding** flow (alongside the existing admin-driven activation).
3. A **mentee booking** flow: Calendly-style slot picker, 30-min sessions, timezone aware.
4. **Calendar + email** notifications: real Google Meet links, `.ics` invites, reminders, post-call feedback, mentor follow-up.
5. **Mentor dashboard** views: upcoming bookings, past + feedback, mentee CRM-lite, stats.
6. **Cancel / reschedule** via signed links (no mentee login).
7. **Public feedback** capture with optional testimonial consent.

Out of scope for this spec: payments, mentor matching/recommendations, recurring bookings, group sessions, in-product chat, refactoring existing forms that aren't touched.

## 2. Non-goals / explicit decisions

- **No mentee accounts.** Guest booking only; cancel/reschedule via signed HMAC links.
- **Single org Google Workspace account** owns all Meet rooms. Mentors don't OAuth Google.
- **Slots are computed, not stored.** `availability` rows stay as weekly templates; bookable slots are derived per request from templates − existing bookings − buffer − lead-time − horizon.
- **Cron-driven reminders/feedback emails.** No queue system — a single 5-minute Vercel Cron tick, idempotent.
- **No refactor of existing forms in this PR.** New feature uses the new stack; legacy forms migrate when otherwise touched.

## 3. Tech additions

Already installed: `next` 16, `drizzle-orm`, `@supabase/ssr`, `resend`, `zod` 3.23, `@tanstack/react-query` 5, `date-fns`, `next-intl`.

To add:

| Package | Use |
|---|---|
| `next-safe-action` | Server-action wrapper with Zod validation, auth context, typed errors |
| `react-hook-form` | Client form state |
| `@hookform/resolvers` | Zod resolver for RHF |
| `@next-safe-action/adapter-react-hook-form` | Glue between RHF and `next-safe-action` |
| `date-fns-tz` | IANA timezone-aware date math for slot computation |
| `ical-generator` | `.ics` attachment generation |
| `googleapis` | Google Calendar + Meet API client |

New env vars (managed via `vercel env`):

- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN` — long-lived refresh token for the org Google account
- `GOOGLE_ORG_CALENDAR_ID` — calendar that owns the events (e.g. `bookings@4herfrika.org`)
- `BOOKING_TOKEN_SECRET` — HMAC secret for signed links
- `CRON_SECRET` — Vercel-injected cron auth

## 4. Architecture overview

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ Mentee (web) │────▶│ Server actions  │────▶│ Postgres / Drizzle│
└──────────────┘     │ (next-safe-     │     └──────────────────┘
                     │  action)        │              │
                     └────────┬────────┘              │
                              │                       ▼
                              ▼               ┌──────────────────┐
                     ┌────────────────┐       │ Vercel Cron      │
                     │ Google Calendar│       │ /api/cron/booking│
                     │ + Meet API     │       │ -emails (*/5min) │
                     └────────────────┘       └────────┬─────────┘
                              ▲                        │
                              │                        ▼
                     ┌────────┴────────────────────────────────┐
                     │ Resend (transactional email + .ics)     │
                     └─────────────────────────────────────────┘
```

## 5. Data model

### 5.1 Extend `mentors`

Add `slug` (text, unique, not null) for public URLs. Generated from `nickname` or slugified `name`; `mentor_applications` approval flow seeds it.

### 5.2 New `mentor_applications`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text not null | |
| `email` | text not null, unique | one application per email at a time |
| `phone` | text | |
| `linkedin_url` | text | |
| `country` | text | |
| `position` | text not null | |
| `bio` | text | |
| `gender` | text | |
| `expertise_areas` | text[] | tags / specialties |
| `motivation` | text not null | "why do you want to mentor?" |
| `status` | enum `pending \| approved \| rejected` | default `pending` |
| `reviewed_by` | uuid FK → users.id | nullable |
| `reviewed_at` | timestamptz | nullable |
| `reject_reason` | text | nullable |
| `mentor_id` | uuid FK → mentors.id | set on approval |
| `created_at` | timestamptz | default now |

### 5.3 New `mentor_booking_settings` (1:1 with mentor)

| Column | Type | Default |
|---|---|---|
| `mentor_id` | uuid PK FK → mentors.id | |
| `session_duration_minutes` | int | 30 |
| `min_lead_hours` | int | 24 |
| `max_horizon_days` | int | 30 |
| `buffer_minutes` | int | 15 |
| `max_active_bookings_per_mentee` | int | 1 |

Row is created with defaults when a mentor becomes active.

### 5.4 New `bookings`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `mentor_id` | uuid FK → mentors.id | |
| `mentee_name` | text not null | |
| `mentee_email` | text not null | |
| `mentee_gender` | text | |
| `purpose` | text not null | ≥ 20 chars |
| `mentee_phone` | text | optional |
| `mentee_linkedin` | text | optional |
| `mentee_country` | text | optional |
| `mentee_career_stage` | text | optional enum: `student \| early_career \| mid_career \| founder \| other` |
| `start_at` | timestamptz not null | UTC |
| `end_at` | timestamptz not null | UTC |
| `mentee_timezone` | text not null | IANA, e.g. `Africa/Lagos` |
| `meet_url` | text not null | |
| `google_event_id` | text not null | |
| `status` | enum `confirmed \| cancelled \| completed \| no_show` | default `confirmed` |
| `cancel_reason` | text | nullable |
| `reschedule_count` | int | default 0 |
| `confirmation_sent_at` | timestamptz | nullable |
| `reminder_24h_sent_at` | timestamptz | nullable |
| `reminder_1h_sent_at` | timestamptz | nullable |
| `feedback_email_sent_at` | timestamptz | nullable |
| `mentor_followup_sent_at` | timestamptz | nullable |
| `created_at` | timestamptz | default now |
| `updated_at` | timestamptz | default now |
| `cancelled_at` | timestamptz | nullable |

Indexes:
- `(mentor_id, start_at)` for slot conflict checks
- `(mentee_email)` for per-mentee cap & history
- Partial: `(start_at) where status='confirmed' and reminder_24h_sent_at is null` (and similar for the other reminder columns) — keeps cron queries cheap

### 5.5 New `booking_feedback` (1:1 with booking)

| Column | Type | Notes |
|---|---|---|
| `booking_id` | uuid PK FK → bookings.id, unique | one feedback per booking |
| `rating` | int | 1–5, nullable if `call_happened != yes` |
| `call_happened` | enum `yes \| mentor_no_show \| mentee_no_show \| rescheduled_externally` | not null |
| `comment` | text | nullable |
| `testimonial_consent` | boolean | default false |
| `created_at` | timestamptz | default now |

## 6. Slot computation

Pure function `getAvailableSlots(mentorId, fromDate, toDate, viewerTz)`:

1. Load mentor `availability` rows (weekly templates in mentor's TZ) + `mentor_booking_settings` + non-cancelled `bookings` in the date range.
2. For each day in `[fromDate, toDate]`:
   1. Find matching `availability` rows by `day` of week.
   2. Expand each row into `session_duration_minutes` slots in the mentor's TZ.
   3. Convert each slot's start/end to UTC via `date-fns-tz`.
3. Drop slots that:
   - start before `now + min_lead_hours`
   - start after `now + max_horizon_days`
   - overlap an existing booking inflated by `buffer_minutes` on both sides
4. Return `{ startUtc, endUtc, mentorTzLabel }[]`. The client renders in `viewerTz`.

Runs on the server (server component for initial paint; server action wrapped by React Query for week-nav refreshes).

## 7. Server actions (next-safe-action)

A single project-wide `actionClient` lives in `src/lib/safe-action.ts`. Auth-gated variants extend it: `adminAction` (requires admin), `mentorAction` (requires the mentor matching `mentor_id`). Public actions use the base client.

Per-feature schemas under `src/db/actions/<feature>/schemas.ts` are imported by both the action and the form resolver.

Actions:

| Action | Auth | Purpose |
|---|---|---|
| `submitMentorApplication` | public | Insert `mentor_applications` row, send admin notification |
| `approveMentorApplication` | admin | Flip status, create `mentors` (active=false), email signed onboarding link |
| `rejectMentorApplication` | admin | Flip status, optional reason, send rejection email |
| `completeMentorOnboarding` | signed-token (no login) | Update mentor profile + insert availability + flip `active=true` |
| `updateMentorBookingSettings` | mentor | Edit lead/horizon/buffer/duration |
| `createBooking` | public | The booking write path described in §8 |
| `cancelBooking` | signed-token | Delete Google event, flip status |
| `rescheduleBooking` | signed-token | Atomic cancel + create within tx |
| `submitFeedback` | signed-token | Insert `booking_feedback` |
| `markMentorFollowupComplete` | mentor | (Optional) mentor notes after their follow-up email |

## 8. Booking creation (write path)

`createBooking({ mentorSlug, startAtUtc, menteeFields })`:

1. **Validate** with Zod schema (required fields, email format, purpose ≥ 20 chars, gender + career_stage enums).
2. **Open a Postgres transaction:**
   1. Re-run availability check for `startAtUtc` against current DB state. If unavailable, abort with `SLOT_TAKEN`.
   2. Enforce per-mentee cap (`SELECT count(*) WHERE mentee_email = ? AND status = 'confirmed'`).
   3. Call Google Calendar `events.insert` with `conferenceData.createRequest` to mint a Meet link. Attendees: mentor + mentee. `sendUpdates: 'all'`. Retry once on transient errors.
   4. Insert the `bookings` row with `meet_url`, `google_event_id`, `status='confirmed'`.
   5. Commit.
3. **Post-commit side effects (best-effort):**
   1. Generate `.ics` (METHOD:REQUEST).
   2. Resend email → mentee (confirmation + .ics + manage-link signed URL).
   3. Resend email → mentor (intake details + .ics + Meet link + mentor dashboard URL).
   4. On success, `update bookings set confirmation_sent_at = now() where id = ?`. Failures are left null so cron retries.

If Google fails after retry, the whole transaction aborts and we return a clear error to the client — never create a booking without a Meet link.

## 9. Scheduled emails (cron)

Single endpoint `/api/cron/booking-emails`, configured in `vercel.ts`:

```ts
crons: [{ path: '/api/cron/booking-emails', schedule: '*/5 * * * *' }]
```

Auth: `Authorization: Bearer ${process.env.CRON_SECRET}` (Vercel injects this; reject any request without it).

Per tick, four bounded queries (each `LIMIT 100`):

1. **24h reminder (mentee):** `status='confirmed' AND reminder_24h_sent_at IS NULL AND start_at BETWEEN now()+'23h' AND now()+'25h'`
2. **1h reminder (both):** `status='confirmed' AND reminder_1h_sent_at IS NULL AND start_at BETWEEN now()+'45m' AND now()+'75m'`
3. **Mentee feedback:** `status='confirmed' AND feedback_email_sent_at IS NULL AND end_at < now() - '30m'`. Also flips `status` to `completed` opportunistically.
4. **Mentor follow-up:** `status IN ('confirmed','completed') AND mentor_followup_sent_at IS NULL AND end_at < now() - '2h'`.

For each row: send via Resend, then `UPDATE` the corresponding `*_sent_at` column. Failures leave the column null → retried next tick. Add an `*_attempts` int column for each reminder and surface in admin if it exceeds 5.

## 10. Signed-link surfaces

Helper `signBookingToken({ bookingId, action, expiresAt })` in `src/lib/booking-tokens.ts` using HMAC-SHA256 with `BOOKING_TOKEN_SECRET`. Encoded `base64url(payload).base64url(sig)`.

| Action | Page | Expiry |
|---|---|---|
| `manage` | `/bookings/[token]` — cancel / reschedule | `start_at` |
| `feedback` | `/bookings/[token]/feedback` | 14 days post `end_at` |
| `mentor_onboard` | `/mentors/onboard/[token]` | 30 days post approval |

Tokens are stateless. Revocation is implicit: cancelled bookings render a "this booking is cancelled" view from the manage page; submitted feedback short-circuits the feedback page.

## 11. Routes & UI surfaces

### Public (`app/[locale]/(website)/...`)

- `mentors/page.tsx` — directory of active mentors (cards).
- `mentors/[slug]/page.tsx` — profile + slot picker + booking form.
- `mentors/apply/page.tsx` — shareable application form (LinkedIn/IG link).
- `mentors/onboard/[token]/page.tsx` — approved-applicant self-serve onboarding (profile + availability).
- `bookings/[token]/page.tsx` — manage (cancel / reschedule).
- `bookings/[token]/feedback/page.tsx` — feedback form.

### Admin (`app/(dashboard)/dashboard/admin/...`)

- `applications/page.tsx` — review queue with pending/approved/rejected tabs; approve/reject actions.
- `bookings/page.tsx` — all bookings, filter by mentor/status/date.

### Mentor (`app/(dashboard)/dashboard/mentor/...`)

Extends existing dashboard. New tabs:
- Upcoming bookings — list sorted by `start_at`, expandable per-booking with mentee details + Meet link.
- Past bookings + feedback — completed sessions with their feedback.
- Mentees — CRM-lite: unique mentees, total sessions, last-contacted.
- Stats — counts: total, completed, no-shows, avg rating.

Existing profile + availability editors stay.

### Components

- `components/booking/slot-picker.tsx` — week navigator, TZ dropdown (default `Intl.DateTimeFormat().resolvedOptions().timeZone`), day-column time chips.
- `components/booking/booking-form.tsx` — mentee intake form (react-hook-form + Zod).
- `components/booking/manage-actions.tsx` — cancel/reschedule UI on the manage page.

## 12. Form & data convention

All client forms use `useHookFormAction` (RHF + next-safe-action adapter). No `useState` for field values, no `useActionState`, no manual `useTransition`.

All client list views use TanStack Query (`useQuery` for reads, `useMutation` only for non-form mutations). The slot picker invalidates `['slots', mentorId]` after a successful booking.

The `QueryProvider` at `components/providers/query-provider.tsx` is already in place.

## 13. Emails (Resend)

Templates live in `src/emails/`:

| Template | Trigger | Recipients |
|---|---|---|
| `mentor-application-received` | application submitted | admin team alias |
| `mentor-application-approved` | admin approves | applicant (with onboard link) |
| `mentor-application-rejected` | admin rejects | applicant |
| `booking-confirmation-mentee` | booking created | mentee (+ .ics attachment + manage link) |
| `booking-confirmation-mentor` | booking created | mentor (intake details, .ics, dashboard link) |
| `booking-reminder-24h` | cron tick 23–25h pre-call | mentee |
| `booking-reminder-1h` | cron tick 45–75m pre-call | mentee + mentor |
| `booking-cancelled` | cancel action | mentor + mentee (.ics METHOD:CANCEL) |
| `booking-rescheduled` | reschedule action | mentor + mentee (.ics METHOD:REQUEST with new time) |
| `booking-feedback-request` | cron, 30m post end | mentee (with feedback signed link) |
| `booking-mentor-followup` | cron, 2h post end | mentor |

## 14. Folder layout (new code)

```
app/[locale]/(website)/
  mentors/
    page.tsx
    apply/page.tsx
    [slug]/page.tsx
    onboard/[token]/page.tsx
  bookings/
    [token]/page.tsx
    [token]/feedback/page.tsx

app/(dashboard)/dashboard/
  admin/
    applications/
      page.tsx
      _components/
    bookings/
      page.tsx
      _components/
  mentor/
    bookings/page.tsx
    mentees/page.tsx
    stats/page.tsx

app/api/cron/booking-emails/route.ts

components/booking/
  slot-picker.tsx
  booking-form.tsx
  manage-actions.tsx

src/db/schema/tables/
  mentor-applications.ts
  mentor-booking-settings.ts
  bookings.ts
  booking-feedback.ts

src/db/actions/
  applications/{schemas.ts, submit.ts, approve.ts, reject.ts}
  bookings/{schemas.ts, create.ts, cancel.ts, reschedule.ts, list.ts}
  feedback/{schemas.ts, submit.ts}
  mentor-onboarding/{schemas.ts, complete.ts}
  mentor-booking-settings/{schemas.ts, update.ts}

src/lib/
  safe-action.ts        # actionClient + adminAction + mentorAction
  booking-tokens.ts     # HMAC sign/verify
  google-calendar.ts    # googleapis wrapper (create/cancel events with Meet)
  ics.ts                # ical-generator wrapper
  slots.ts              # pure slot-computation
  email/                # Resend send helpers per template

src/emails/             # React Email components (or plain HTML strings)
```

## 15. Testing strategy

- **Pure functions** (`slots.ts`, `booking-tokens.ts`, `.ics` generator): unit tests with vitest. Slot computation has the most edge cases — cover DST transitions, TZ conversions, buffer overlaps, lead/horizon bounds.
- **Server actions:** integration tests against a local Supabase, using next-safe-action's testable form. Mock `googleapis` and Resend at module level.
- **Cron endpoint:** integration test that seeds bookings at known offsets and asserts each query selects the right rows and updates the right `*_sent_at` column.

## 16. Rollout

1. Land migrations + schema (no UI yet).
2. Land mentor application + admin review + onboarding (shareable link is live).
3. Land booking flow behind a feature flag tied to mentor `active` flag (effectively gated: only active mentors are bookable).
4. Land cron + email templates.
5. Land mentor dashboard tabs.
6. Land cancel/reschedule/feedback signed-link pages.
7. Soft-launch to a few mentors; monitor Resend bounce rate and Google API errors.

## 17. Open questions

None outstanding — all design decisions are captured above. Implementation-time questions (copywriting, exact colors/spacing) handled inline.
