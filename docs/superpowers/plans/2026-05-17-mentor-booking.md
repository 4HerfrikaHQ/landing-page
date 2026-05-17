# Mentor Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the end-to-end mentor booking flow: public application + admin review + mentor onboarding + Calendly-style slot picker + Google Meet generation + email lifecycle (confirmation, reminders, feedback) + cancel/reschedule + mentor dashboard.

**Architecture:** Server actions wrapped by `next-safe-action` (Zod-validated, auth-gated). Slots computed on demand from weekly availability templates − existing bookings − buffer/lead/horizon. Google Meet links minted via Google Calendar API using a single org account's refresh token. Resend for transactional email + `.ics` attachments. Vercel Cron (`*/5 * * * *`) drives reminders/feedback emails idempotently via `*_sent_at` columns. Signed HMAC tokens power public cancel/reschedule/feedback/onboard pages (no mentee login).

**Tech Stack:** Next.js 16 (App Router), Drizzle ORM + Supabase Postgres, `next-safe-action`, `react-hook-form`, `zod`, `date-fns` + `date-fns-tz`, `googleapis`, `resend`, `ical-generator`, `@tanstack/react-query`, `vitest` (new — for pure-logic unit tests).

**Spec:** [`docs/superpowers/specs/2026-05-17-mentor-booking-design.md`](../specs/2026-05-17-mentor-booking-design.md)

**Branch:** `feat/mentor-booking` (off `main`)

## Plan revisions (2026-05-17, applied during execution)

These supersede anything below that conflicts with them. When dispatching tasks, apply these changes:

**R1. No vitest.** Task 0.2 is dropped. The `*.test.ts` artifacts in Tasks 0.5 (booking-tokens) and 4.1 (slots) are skipped. We implement those files carefully and verify via the dev server. The Task 0.1 install drops `vitest` and `@vitest/ui` from the dev-deps list. Phase 11's `bun test` step is removed.

**R3. Route-folder convention.** All page-specific server actions, schemas, and components are colocated in their route folder, not in global `src/db/actions/<feature>/` or `src/lib/`. Each route looks like:

```
some-route/
├── page.tsx        # thin coordinator
├── _actions.ts     # all server actions for this route
├── _schema.ts      # zod schemas; types via z.infer
├── _components/    # route-specific components
└── _hooks/         # route-specific hooks (if any)
```

Helpers go into `src/lib/` (or another global location) **only when ≥3 unique routes import them**. Two callers = keep colocated with the primary route and import from the secondary. For this feature, the global helpers are:
- `src/lib/safe-action.ts` (used by every action route)
- `src/lib/booking-tokens.ts` (apply page → onboard, manage, feedback, cron = ≥3)
- `src/lib/google-calendar.ts` (create, cancel, reschedule = 3)
- `src/lib/ics.ts` (create, cancel, reschedule, cron-cancel = ≥3)
- `src/lib/email/booking.ts` (create, cancel, reschedule, cron = ≥3)
- `src/lib/slots.ts` (mentor detail page action, manage/reschedule action, create action = 3)
- `components/booking/slot-picker.tsx` (component reused by mentor detail + manage pages — components live in `components/` per existing pattern, OK even at 2 callers)

Everything else moves to the route folder. Concrete remap (replaces the per-task file paths below):

| Original plan path | New colocated path |
|---|---|
| `src/db/actions/applications/{schemas,submit}.ts` | `app/[locale]/(website)/careers-corner/apply/_schema.ts` + `_actions.ts` |
| `src/db/actions/applications/{approve,reject}.ts` | `app/(dashboard)/dashboard/admin/applications/_actions.ts` (+ `_schema.ts` for inputs) |
| `src/db/actions/mentor-onboarding/{schemas,complete}.ts` | `app/[locale]/(website)/careers-corner/onboard/[token]/_schema.ts` + `_actions.ts` |
| `src/db/actions/bookings/list-slots.ts` | `app/[locale]/(website)/careers-corner/[slug]/_actions.ts` (slot fetcher lives with the mentor detail page; manage page imports from here) |
| `src/db/actions/bookings/{schemas,create}.ts` | `app/[locale]/(website)/careers-corner/[slug]/_schema.ts` + `_actions.ts` |
| `src/db/actions/bookings/{cancel,reschedule}.ts` | `app/[locale]/(website)/bookings/[token]/_actions.ts` (+ `_schema.ts`) |
| `src/db/actions/feedback/{schemas,submit}.ts` | `app/[locale]/(website)/bookings/[token]/feedback/_schema.ts` + `_actions.ts` |
| `src/db/actions/mentor-booking-settings/*` | Mentor dashboard route folder when we wire that screen |

**Zod conventions:**
- Choices/discriminants use `z.enum([...])` and export both the enum **and** `z.infer` type: `export const StatusEnum = z.enum(['a','b']); export type Status = z.infer<typeof StatusEnum>;`
- Form types derive from schemas: `export type FormInput = z.infer<typeof FormSchema>`. Never hand-type a parallel TS shape.

**Awaited return types:** Any client component that receives data fetched by a server function types its prop as `Awaited<ReturnType<typeof getX>>`. No hand-typed DB-mirror interfaces.

**R2. Mentor surfaces extend `/careers-corner`, not a parallel `/mentors`.** Path remap (apply globally to every file path, import path, route reference, and revalidatePath call in the plan):
- `app/[locale]/(website)/mentors/` → `app/[locale]/(website)/careers-corner/`
- The new "mentors directory page" task (Task 4.4) **modifies** the existing `careers-corner/page.tsx` to add search/filter + slug-based links; it does not create a new page file.
- All `/mentors/[slug]`, `/mentors/apply`, `/mentors/onboard/[token]` references → `/careers-corner/...`.

**PR split (stacked branches):**
- PR 1 on `feat/mentor-booking` (off `main`): Phases 0, 1, 2 — foundation, schema, application flow.
- PR 2 on `feat/mentor-booking-core` (off PR 1): Phases 3, 4, 5 — onboarding, booking creation, Google Meet, confirmation emails.
- PR 3 on `feat/mentor-booking-lifecycle` (off PR 2): Phases 6–10 — cron, cancel/reschedule, feedback, dashboards.

**Testing convention:** The codebase has no test framework today. We add `vitest` and use it **only** for pure-logic modules where bugs are silent and dangerous — slot computation, token sign/verify, `.ics` generation. Everything else is verified via `bunx tsc --noEmit` + manual smoke through the dev server. The plan calls this out per task.

---

## Phase 0 — Foundation

### Task 0.1: Install new dependencies

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`

- [ ] **Step 1: Install runtime dependencies**

```bash
bun add next-safe-action react-hook-form @hookform/resolvers @next-safe-action/adapter-react-hook-form date-fns-tz ical-generator googleapis
```

- [ ] **Step 2: Install dev dependencies**

```bash
bun add -d vitest @vitest/ui
```

- [ ] **Step 3: Verify install**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add deps for mentor booking (next-safe-action, rhf, date-fns-tz, googleapis, vitest)"
```

### Task 0.2: Add vitest config + test script

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Create vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 2: Add scripts in `package.json`**

Under `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Verify**

```bash
bun test
```

Expected: `No test files found, exiting with code 0` (or similar — vitest finds nothing yet, which is fine).

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts package.json
git commit -m "chore: add vitest for pure-logic unit tests"
```

### Task 0.3: Document new env vars

**Files:**
- Modify: `.env.example` (create if missing — check first with `ls .env.example`)

- [ ] **Step 1: Append new vars**

```bash
# Google Calendar / Meet (org account)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
GOOGLE_ORG_CALENDAR_ID=bookings@4herfrika.org

# Booking signed-link HMAC secret (any high-entropy string, 32+ bytes)
BOOKING_TOKEN_SECRET=

# Vercel Cron auth (provided by Vercel automatically in production; for local dev set any value)
CRON_SECRET=
```

- [ ] **Step 2: Verify** — `cat .env.example | grep BOOKING_TOKEN_SECRET` should print the line.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: document env vars for mentor booking"
```

### Task 0.4: Create the project-wide safe-action client

**Files:**
- Create: `src/lib/safe-action.ts`

- [ ] **Step 1: Write the file**

```ts
// src/lib/safe-action.ts
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { auth } from '@/src/auth';

class ActionError extends Error {}

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) return e.message;
    console.error('[action error]', e);
    return 'Something went wrong. Please try again.';
  },
  defineMetadataSchema() {
    return z.object({ actionName: z.string().optional() });
  },
});

export const adminAction = actionClient.use(async ({ next }) => {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new ActionError('Unauthorized');
  }
  return next({ ctx: { user: session.user } });
});

export const mentorAction = actionClient.use(async ({ next }) => {
  const session = await auth();
  if (!session?.user || session.user.role !== 'mentor') {
    throw new ActionError('Unauthorized');
  }
  return next({ ctx: { user: session.user } });
});

export { ActionError };
```

**Note:** if `@/src/auth` exposes a different API (e.g. `getSession()`), adapt the imports. Check `src/auth.ts` and align.

- [ ] **Step 2: Verify** — `bunx tsc --noEmit` succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/safe-action.ts
git commit -m "feat(booking): add safe-action client with admin + mentor variants"
```

### Task 0.5: Booking signed-token helper

**Files:**
- Create: `src/lib/booking-tokens.ts`
- Create: `src/lib/booking-tokens.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/booking-tokens.test.ts
import { describe, expect, it, beforeAll } from 'vitest';
import { signBookingToken, verifyBookingToken } from './booking-tokens';

beforeAll(() => {
  process.env.BOOKING_TOKEN_SECRET = 'test-secret-must-be-long-enough-32-bytes';
});

describe('booking tokens', () => {
  it('round-trips a valid token', () => {
    const expiresAt = Date.now() + 60_000;
    const token = signBookingToken({ bookingId: 'abc', action: 'manage', expiresAt });
    const result = verifyBookingToken(token);
    expect(result).toEqual({ ok: true, bookingId: 'abc', action: 'manage', expiresAt });
  });

  it('rejects a tampered token', () => {
    const token = signBookingToken({ bookingId: 'abc', action: 'manage', expiresAt: Date.now() + 60_000 });
    const tampered = `${token.slice(0, -2)}xx`;
    expect(verifyBookingToken(tampered)).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('rejects an expired token', () => {
    const token = signBookingToken({ bookingId: 'abc', action: 'manage', expiresAt: Date.now() - 1 });
    expect(verifyBookingToken(token)).toEqual({ ok: false, reason: 'expired' });
  });
});
```

- [ ] **Step 2: Run test — should fail (module missing)**

```bash
bun test src/lib/booking-tokens.test.ts
```

Expected: import error.

- [ ] **Step 3: Implement**

```ts
// src/lib/booking-tokens.ts
import { createHmac, timingSafeEqual } from 'node:crypto';

export type BookingTokenAction = 'manage' | 'feedback' | 'mentor_onboard';

type Payload = {
  bookingId: string;
  action: BookingTokenAction;
  expiresAt: number; // epoch ms
};

type VerifyResult =
  | ({ ok: true } & Payload)
  | { ok: false; reason: 'malformed' | 'bad_signature' | 'expired' };

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function b64urlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

function secret(): Buffer {
  const s = process.env.BOOKING_TOKEN_SECRET;
  if (!s) throw new Error('BOOKING_TOKEN_SECRET not set');
  return Buffer.from(s);
}

export function signBookingToken(payload: Payload): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret()).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

export function verifyBookingToken(token: string): VerifyResult {
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const [body, sigB64] = parts;
  const expectedSig = createHmac('sha256', secret()).update(body).digest();
  const givenSig = b64urlDecode(sigB64);
  if (expectedSig.length !== givenSig.length) return { ok: false, reason: 'bad_signature' };
  if (!timingSafeEqual(expectedSig, givenSig)) return { ok: false, reason: 'bad_signature' };

  let payload: Payload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString('utf8'));
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (Date.now() > payload.expiresAt) return { ok: false, reason: 'expired' };
  return { ok: true, ...payload };
}
```

- [ ] **Step 4: Run test — should pass**

```bash
bun test src/lib/booking-tokens.test.ts
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/booking-tokens.ts src/lib/booking-tokens.test.ts
git commit -m "feat(booking): HMAC signed-token helper for public booking links"
```

---

## Phase 1 — Schema migration

### Task 1.1: Add `slug` to `mentors` + `mentor_applications` table

**Files:**
- Modify: `src/db/schema/tables/mentors.ts`
- Create: `src/db/schema/tables/mentor-applications.ts`
- Modify: `src/db/schema/tables/index.ts`

- [ ] **Step 1: Add slug to mentors**

In `src/db/schema/tables/mentors.ts`, add inside the `pgTable` definition (after `nickname`):

```ts
slug: text("slug").notNull().unique(),
```

- [ ] **Step 2: Create `mentor-applications.ts`**

```ts
// src/db/schema/tables/mentor-applications.ts
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { mentors } from './mentors';

export const mentorApplicationStatus = pgEnum('mentor_application_status', [
  'pending',
  'approved',
  'rejected',
]);

export const mentorApplications = pgTable('mentor_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  linkedin_url: text('linkedin_url'),
  country: text('country'),
  position: text('position').notNull(),
  bio: text('bio'),
  gender: text('gender'),
  expertise_areas: text('expertise_areas').array(),
  motivation: text('motivation').notNull(),
  status: mentorApplicationStatus('status').notNull().default('pending'),
  reviewed_by: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewed_at: timestamp('reviewed_at', { withTimezone: true }),
  reject_reason: text('reject_reason'),
  mentor_id: uuid('mentor_id').references(() => mentors.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type DbMentorApplication = typeof mentorApplications.$inferSelect;
export type DbMentorApplicationInsert = typeof mentorApplications.$inferInsert;
```

- [ ] **Step 3: Export from index**

In `src/db/schema/tables/index.ts`, add:

```ts
export { mentorApplications, mentorApplicationStatus } from './mentor-applications';
export type { DbMentorApplication, DbMentorApplicationInsert } from './mentor-applications';
```

- [ ] **Step 4: Verify**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/db/schema/tables/mentors.ts src/db/schema/tables/mentor-applications.ts src/db/schema/tables/index.ts
git commit -m "feat(db): mentor slug + mentor_applications table"
```

### Task 1.2: `mentor_booking_settings` table

**Files:**
- Create: `src/db/schema/tables/mentor-booking-settings.ts`
- Modify: `src/db/schema/tables/index.ts`

- [ ] **Step 1: Create table**

```ts
// src/db/schema/tables/mentor-booking-settings.ts
import { pgTable, uuid, integer } from 'drizzle-orm/pg-core';
import { mentors } from './mentors';

export const mentorBookingSettings = pgTable('mentor_booking_settings', {
  mentor_id: uuid('mentor_id')
    .primaryKey()
    .references(() => mentors.id, { onDelete: 'cascade' }),
  session_duration_minutes: integer('session_duration_minutes').notNull().default(30),
  min_lead_hours: integer('min_lead_hours').notNull().default(24),
  max_horizon_days: integer('max_horizon_days').notNull().default(30),
  buffer_minutes: integer('buffer_minutes').notNull().default(15),
  max_active_bookings_per_mentee: integer('max_active_bookings_per_mentee').notNull().default(1),
});

export type DbMentorBookingSettings = typeof mentorBookingSettings.$inferSelect;
export type DbMentorBookingSettingsInsert = typeof mentorBookingSettings.$inferInsert;
```

- [ ] **Step 2: Export from index**

In `src/db/schema/tables/index.ts`:

```ts
export { mentorBookingSettings } from './mentor-booking-settings';
export type { DbMentorBookingSettings, DbMentorBookingSettingsInsert } from './mentor-booking-settings';
```

- [ ] **Step 3: Commit**

```bash
git add src/db/schema/tables/mentor-booking-settings.ts src/db/schema/tables/index.ts
git commit -m "feat(db): mentor_booking_settings table"
```

### Task 1.3: `bookings` + `booking_feedback` tables

**Files:**
- Create: `src/db/schema/tables/bookings.ts`
- Create: `src/db/schema/tables/booking-feedback.ts`
- Modify: `src/db/schema/tables/index.ts`

- [ ] **Step 1: Create bookings table**

```ts
// src/db/schema/tables/bookings.ts
import {
  pgTable, uuid, text, timestamp, integer, pgEnum, index,
} from 'drizzle-orm/pg-core';
import { mentors } from './mentors';

export const bookingStatus = pgEnum('booking_status', [
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
]);

export const careerStage = pgEnum('career_stage', [
  'student',
  'early_career',
  'mid_career',
  'founder',
  'other',
]);

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mentor_id: uuid('mentor_id')
      .notNull()
      .references(() => mentors.id, { onDelete: 'cascade' }),

    mentee_name: text('mentee_name').notNull(),
    mentee_email: text('mentee_email').notNull(),
    mentee_gender: text('mentee_gender'),
    purpose: text('purpose').notNull(),
    mentee_phone: text('mentee_phone'),
    mentee_linkedin: text('mentee_linkedin'),
    mentee_country: text('mentee_country'),
    mentee_career_stage: careerStage('mentee_career_stage'),

    start_at: timestamp('start_at', { withTimezone: true }).notNull(),
    end_at: timestamp('end_at', { withTimezone: true }).notNull(),
    mentee_timezone: text('mentee_timezone').notNull(),

    meet_url: text('meet_url').notNull(),
    google_event_id: text('google_event_id').notNull(),

    status: bookingStatus('status').notNull().default('confirmed'),
    cancel_reason: text('cancel_reason'),
    reschedule_count: integer('reschedule_count').notNull().default(0),

    confirmation_sent_at: timestamp('confirmation_sent_at', { withTimezone: true }),
    reminder_24h_sent_at: timestamp('reminder_24h_sent_at', { withTimezone: true }),
    reminder_1h_sent_at: timestamp('reminder_1h_sent_at', { withTimezone: true }),
    feedback_email_sent_at: timestamp('feedback_email_sent_at', { withTimezone: true }),
    mentor_followup_sent_at: timestamp('mentor_followup_sent_at', { withTimezone: true }),

    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    cancelled_at: timestamp('cancelled_at', { withTimezone: true }),
  },
  (t) => ({
    mentorStartIdx: index('bookings_mentor_start_idx').on(t.mentor_id, t.start_at),
    menteeEmailIdx: index('bookings_mentee_email_idx').on(t.mentee_email),
  }),
);

export type DbBooking = typeof bookings.$inferSelect;
export type DbBookingInsert = typeof bookings.$inferInsert;
```

- [ ] **Step 2: Create booking_feedback**

```ts
// src/db/schema/tables/booking-feedback.ts
import { pgTable, uuid, integer, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { bookings } from './bookings';

export const callHappened = pgEnum('call_happened', [
  'yes',
  'mentor_no_show',
  'mentee_no_show',
  'rescheduled_externally',
]);

export const bookingFeedback = pgTable('booking_feedback', {
  booking_id: uuid('booking_id')
    .primaryKey()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  rating: integer('rating'),
  call_happened: callHappened('call_happened').notNull(),
  comment: text('comment'),
  testimonial_consent: boolean('testimonial_consent').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type DbBookingFeedback = typeof bookingFeedback.$inferSelect;
export type DbBookingFeedbackInsert = typeof bookingFeedback.$inferInsert;
```

- [ ] **Step 3: Export from index**

```ts
export { bookings, bookingStatus, careerStage } from './bookings';
export type { DbBooking, DbBookingInsert } from './bookings';
export { bookingFeedback, callHappened } from './booking-feedback';
export type { DbBookingFeedback, DbBookingFeedbackInsert } from './booking-feedback';
```

- [ ] **Step 4: Commit**

```bash
git add src/db/schema/tables/bookings.ts src/db/schema/tables/booking-feedback.ts src/db/schema/tables/index.ts
git commit -m "feat(db): bookings + booking_feedback tables"
```

### Task 1.4: Generate + run migration

**Files:**
- Create: `src/db/migrations/0002_*.sql` (generated)

- [ ] **Step 1: Generate migration**

```bash
bun run db:generate
```

Expected: a new `0002_*.sql` file appears under `src/db/migrations/`.

- [ ] **Step 2: Apply migration to local Supabase**

```bash
bun run supabase:start
bun run db:migrate
```

Expected: "[✓] All migrations applied successfully."

- [ ] **Step 3: Inspect schema**

```bash
bun run db:studio
```

Open studio; verify the four new tables (`mentor_applications`, `mentor_booking_settings`, `bookings`, `booking_feedback`) and the new enums exist. Confirm `mentors.slug` exists.

- [ ] **Step 4: Backfill slug for any existing mentors** (run as a one-off SQL in studio or `psql`):

```sql
UPDATE mentors SET slug = lower(regexp_replace(coalesce(nickname, name), '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
```

(If migration fails because `slug NOT NULL` is added to a non-empty table, generate with `NOT NULL` default, apply data backfill, then add the NOT NULL constraint. The clean way: run the backfill SQL between `db:generate` and `db:migrate`, or temporarily make slug nullable in the schema, migrate, backfill, then flip it.)

- [ ] **Step 5: Commit**

```bash
git add src/db/migrations/
git commit -m "feat(db): migration for booking schema"
```

---

## Phase 2 — Mentor application flow

### Task 2.1: Application schema (Zod) + server action

**Files:**
- Create: `src/db/actions/applications/schemas.ts`
- Create: `src/db/actions/applications/submit.ts`

- [ ] **Step 1: Schema**

```ts
// src/db/actions/applications/schemas.ts
import { z } from 'zod';

export const submitApplicationSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  country: z.string().max(80).optional().or(z.literal('')),
  position: z.string().min(2).max(120),
  bio: z.string().max(1000).optional().or(z.literal('')),
  gender: z.enum(['female', 'male', 'non_binary', 'prefer_not_to_say']).optional(),
  expertise_areas: z.array(z.string().min(1).max(60)).max(10).default([]),
  motivation: z.string().min(40, 'Tell us a bit more — at least 40 characters.').max(2000),
});

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;
```

- [ ] **Step 2: Action**

```ts
// src/db/actions/applications/submit.ts
'use server';

import { actionClient, ActionError } from '@/src/lib/safe-action';
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import { submitApplicationSchema } from './schemas';
import { sendMentorApplicationReceivedEmail } from '@/src/lib/email/mentor-application';

export const submitMentorApplication = actionClient
  .schema(submitApplicationSchema)
  .action(async ({ parsedInput }) => {
    const existing = await db
      .select({ id: schema.mentorApplications.id, status: schema.mentorApplications.status })
      .from(schema.mentorApplications)
      .where(eq(schema.mentorApplications.email, parsedInput.email))
      .limit(1);

    if (existing[0]?.status === 'pending') {
      throw new ActionError('You already have a pending application — we will be in touch soon.');
    }

    const [row] = await db
      .insert(schema.mentorApplications)
      .values({
        name: parsedInput.name,
        email: parsedInput.email,
        phone: parsedInput.phone || null,
        linkedin_url: parsedInput.linkedin_url || null,
        country: parsedInput.country || null,
        position: parsedInput.position,
        bio: parsedInput.bio || null,
        gender: parsedInput.gender ?? null,
        expertise_areas: parsedInput.expertise_areas,
        motivation: parsedInput.motivation,
      })
      .returning({ id: schema.mentorApplications.id });

    await sendMentorApplicationReceivedEmail({ applicationId: row.id, name: parsedInput.name, email: parsedInput.email });

    return { applicationId: row.id };
  });
```

- [ ] **Step 3: Stub email helper (will be fleshed out in Phase 5)**

```ts
// src/lib/email/mentor-application.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_INBOX = process.env.ADMIN_EMAIL ?? 'team@4herfrika.org';
const FROM = process.env.RESEND_FROM ?? '4HerFrika <no-reply@4herfrika.org>';

export async function sendMentorApplicationReceivedEmail(params: {
  applicationId: string;
  name: string;
  email: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_INBOX,
    subject: `New mentor application: ${params.name}`,
    text: `${params.name} (${params.email}) applied. Review: ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/applications/${params.applicationId}`,
  });
}
```

- [ ] **Step 4: Verify**

```bash
bunx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/db/actions/applications src/lib/email/mentor-application.ts
git commit -m "feat(applications): submit action + admin notification email"
```

### Task 2.2: Public application page

**Files:**
- Create: `app/[locale]/(website)/mentors/apply/page.tsx`
- Create: `app/[locale]/(website)/mentors/apply/_components/application-form.tsx`

- [ ] **Step 1: Page**

```tsx
// app/[locale]/(website)/mentors/apply/page.tsx
import type { Metadata } from 'next';
import { ApplicationForm } from './_components/application-form';

export const metadata: Metadata = {
  title: 'Become a mentor — 4HerFrika',
  description: 'Share your time and experience with young African women in tech and business.',
};

export default function ApplyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Become a 4HerFrika mentor</h1>
      <p className="mt-3 text-muted-foreground">
        Tell us a bit about you. Our team reviews each application and reaches out within a few days.
      </p>
      <div className="mt-10">
        <ApplicationForm />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Form component (react-hook-form + next-safe-action adapter)**

```tsx
// app/[locale]/(website)/mentors/apply/_components/application-form.tsx
'use client';

import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { submitMentorApplication } from '@/src/db/actions/applications/submit';
import { submitApplicationSchema } from '@/src/db/actions/applications/schemas';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function ApplicationForm() {
  const { form, handleSubmitWithAction, action } = useHookFormAction(
    submitMentorApplication,
    zodResolver(submitApplicationSchema),
    {
      formProps: {
        defaultValues: {
          name: '', email: '', phone: '', linkedin_url: '', country: '',
          position: '', bio: '', expertise_areas: [], motivation: '',
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success('Application received. We will be in touch.');
          form.reset();
        },
        onError: ({ error }) => toast.error(error.serverError ?? 'Failed to submit.'),
      },
    },
  );

  return (
    <form onSubmit={handleSubmitWithAction} className="space-y-5">
      <Field label="Full name" error={form.formState.errors.name?.message}>
        <Input {...form.register('name')} />
      </Field>
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" {...form.register('email')} />
      </Field>
      <Field label="Position / role" error={form.formState.errors.position?.message}>
        <Input placeholder="e.g. Senior PM at Stripe" {...form.register('position')} />
      </Field>
      <Field label="LinkedIn URL (optional)">
        <Input type="url" {...form.register('linkedin_url')} />
      </Field>
      <Field label="Phone / WhatsApp (optional)">
        <Input {...form.register('phone')} />
      </Field>
      <Field label="Country (optional)">
        <Input {...form.register('country')} />
      </Field>
      <Field label="Short bio (optional)">
        <Textarea rows={3} {...form.register('bio')} />
      </Field>
      <Field label="Why do you want to mentor?" error={form.formState.errors.motivation?.message}>
        <Textarea rows={5} {...form.register('motivation')} />
      </Field>

      <Button type="submit" disabled={action.isPending} className="w-full">
        {action.isPending ? 'Submitting…' : 'Submit application'}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

If `components/ui/textarea.tsx` doesn't exist, run `bunx shadcn@latest add textarea`.

- [ ] **Step 3: Smoke test**

```bash
bun dev
```

Visit `http://localhost:3000/en/mentors/apply`, submit a row. Verify it lands in `mentor_applications` via `bun run db:studio`.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/\(website\)/mentors/apply
git commit -m "feat(applications): public application form"
```

### Task 2.3: Admin review list + approve/reject actions

**Files:**
- Create: `src/db/actions/applications/approve.ts`
- Create: `src/db/actions/applications/reject.ts`
- Create: `app/(dashboard)/dashboard/admin/applications/page.tsx`
- Create: `app/(dashboard)/dashboard/admin/applications/_components/applications-table.tsx`
- Create: `app/(dashboard)/dashboard/admin/applications/_components/row-actions.tsx`

- [ ] **Step 1: Approve action**

```ts
// src/db/actions/applications/approve.ts
'use server';

import { adminAction, ActionError } from '@/src/lib/safe-action';
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { signBookingToken } from '@/src/lib/booking-tokens';
import { sendMentorApplicationApprovedEmail } from '@/src/lib/email/mentor-application';

function slugify(input: string): string {
  return input.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const approveMentorApplication = adminAction
  .schema(z.object({ applicationId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const [app] = await db.select().from(schema.mentorApplications).where(eq(schema.mentorApplications.id, parsedInput.applicationId)).limit(1);
    if (!app) throw new ActionError('Application not found');
    if (app.status !== 'pending') throw new ActionError('Application is not pending');

    const baseSlug = slugify(app.name);
    // ensure unique
    let slug = baseSlug;
    let n = 1;
    while (true) {
      const exists = await db.select({ id: schema.mentors.id }).from(schema.mentors).where(eq(schema.mentors.slug, slug)).limit(1);
      if (exists.length === 0) break;
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const result = await db.transaction(async (tx) => {
      const [mentor] = await tx
        .insert(schema.mentors)
        .values({
          user_id: ctx.user.id, // placeholder owner — admin owns until mentor self-onboards / supabase auth account is wired
          name: app.name,
          position: app.position,
          bio: app.bio,
          linkedin_url: app.linkedin_url,
          slug,
          active: false,
        })
        .returning({ id: schema.mentors.id });

      await tx.insert(schema.mentorBookingSettings).values({ mentor_id: mentor.id });

      await tx
        .update(schema.mentorApplications)
        .set({
          status: 'approved',
          reviewed_at: new Date(),
          reviewed_by: ctx.user.id,
          mentor_id: mentor.id,
        })
        .where(eq(schema.mentorApplications.id, app.id));

      return { mentorId: mentor.id };
    });

    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const token = signBookingToken({ bookingId: result.mentorId, action: 'mentor_onboard', expiresAt });
    await sendMentorApplicationApprovedEmail({ to: app.email, name: app.name, onboardToken: token });

    revalidatePath('/dashboard/admin/applications');
    return { mentorId: result.mentorId };
  });
```

**Note:** `user_id` on `mentors` is `NOT NULL`. We set it to the admin's user id as a placeholder owner. When the mentor self-onboards through the signed link, they're identified by the token (not Supabase auth); we don't need a real auth user for them. If that constraint is impractical, the alternative is to make `mentors.user_id` nullable in a separate prior migration. Decision: keep the constraint, use admin as owner — re-evaluate when we wire mentor login.

- [ ] **Step 2: Reject action**

```ts
// src/db/actions/applications/reject.ts
'use server';

import { adminAction, ActionError } from '@/src/lib/safe-action';
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { sendMentorApplicationRejectedEmail } from '@/src/lib/email/mentor-application';

export const rejectMentorApplication = adminAction
  .schema(z.object({ applicationId: z.string().uuid(), reason: z.string().max(500).optional() }))
  .action(async ({ parsedInput, ctx }) => {
    const [app] = await db.select().from(schema.mentorApplications).where(eq(schema.mentorApplications.id, parsedInput.applicationId)).limit(1);
    if (!app) throw new ActionError('Application not found');
    if (app.status !== 'pending') throw new ActionError('Application is not pending');

    await db
      .update(schema.mentorApplications)
      .set({
        status: 'rejected',
        reject_reason: parsedInput.reason ?? null,
        reviewed_at: new Date(),
        reviewed_by: ctx.user.id,
      })
      .where(eq(schema.mentorApplications.id, app.id));

    await sendMentorApplicationRejectedEmail({ to: app.email, name: app.name, reason: parsedInput.reason });

    revalidatePath('/dashboard/admin/applications');
    return { ok: true };
  });
```

- [ ] **Step 3: Extend email helper**

Add to `src/lib/email/mentor-application.ts`:

```ts
export async function sendMentorApplicationApprovedEmail(params: {
  to: string; name: string; onboardToken: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/mentors/onboard/${params.onboardToken}`;
  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: 'Welcome to 4HerFrika — finish setting up your mentor profile',
    text: `Hi ${params.name},\n\nYour mentor application was approved! Finish your profile and set your availability here:\n${url}\n\nThis link expires in 30 days.\n\n— 4HerFrika`,
  });
}

export async function sendMentorApplicationRejectedEmail(params: {
  to: string; name: string; reason?: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: 'Update on your 4HerFrika mentor application',
    text: `Hi ${params.name},\n\nThank you for applying. We're unable to move forward at this time.${params.reason ? `\n\n${params.reason}` : ''}\n\n— 4HerFrika`,
  });
}
```

- [ ] **Step 4: Admin list page**

```tsx
// app/(dashboard)/dashboard/admin/applications/page.tsx
import { db, schema } from '@/src/db';
import { desc } from 'drizzle-orm';
import { ApplicationsTable } from './_components/applications-table';

export default async function ApplicationsPage() {
  const rows = await db
    .select()
    .from(schema.mentorApplications)
    .orderBy(desc(schema.mentorApplications.created_at));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Mentor applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">Review and approve new mentor signups.</p>
      <div className="mt-6">
        <ApplicationsTable rows={rows} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Applications table component**

```tsx
// app/(dashboard)/dashboard/admin/applications/_components/applications-table.tsx
'use client';

import { useState } from 'react';
import type { DbMentorApplication } from '@/src/db/schema/tables';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RowActions } from './row-actions';

type Status = 'pending' | 'approved' | 'rejected';

export function ApplicationsTable({ rows }: { rows: DbMentorApplication[] }) {
  const [tab, setTab] = useState<Status>('pending');
  const filtered = rows.filter((r) => r.status === tab);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
      <TabsList>
        <TabsTrigger value="pending">Pending ({rows.filter((r) => r.status === 'pending').length})</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>
      {(['pending', 'approved', 'rejected'] as Status[]).map((s) => (
        <TabsContent key={s} value={s}>
          <div className="mt-4 space-y-3">
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No applications.</p>}
            {filtered.map((row) => (
              <article key={row.id} className="rounded-lg border p-4">
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium">{row.name}</h3>
                    <p className="text-sm text-muted-foreground">{row.email} · {row.position}</p>
                  </div>
                  <Badge variant={row.status === 'pending' ? 'default' : 'secondary'}>{row.status}</Badge>
                </header>
                <p className="mt-3 text-sm whitespace-pre-wrap">{row.motivation}</p>
                {row.status === 'pending' && (
                  <div className="mt-4">
                    <RowActions applicationId={row.id} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

- [ ] **Step 6: Row actions**

```tsx
// app/(dashboard)/dashboard/admin/applications/_components/row-actions.tsx
'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { approveMentorApplication } from '@/src/db/actions/applications/approve';
import { rejectMentorApplication } from '@/src/db/actions/applications/reject';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function RowActions({ applicationId }: { applicationId: string }) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');

  const approve = useAction(approveMentorApplication, {
    onSuccess: () => toast.success('Approved. Onboarding email sent.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Failed'),
  });
  const reject = useAction(rejectMentorApplication, {
    onSuccess: () => { toast.success('Rejected.'); setShowReject(false); },
    onError: ({ error }) => toast.error(error.serverError ?? 'Failed'),
  });

  if (showReject) {
    return (
      <div className="space-y-2">
        <Textarea placeholder="Optional message to applicant…" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => reject.execute({ applicationId, reason: reason || undefined })} disabled={reject.isPending}>
            Confirm reject
          </Button>
          <Button variant="ghost" onClick={() => setShowReject(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => approve.execute({ applicationId })} disabled={approve.isPending}>
        {approve.isPending ? 'Approving…' : 'Approve'}
      </Button>
      <Button variant="outline" onClick={() => setShowReject(true)}>Reject</Button>
    </div>
  );
}
```

- [ ] **Step 7: Verify**

`bunx tsc --noEmit`. Smoke: log in as admin, navigate to `/dashboard/admin/applications`, approve a pending row. Verify the mentor row + settings row are created, the application is flagged approved with `mentor_id` linked, and the email lands in Resend logs.

- [ ] **Step 8: Commit**

```bash
git add src/db/actions/applications app/\(dashboard\)/dashboard/admin/applications src/lib/email/mentor-application.ts
git commit -m "feat(applications): admin review queue + approve/reject"
```

---

## Phase 3 — Mentor self-serve onboarding

### Task 3.1: Onboarding schema + action

**Files:**
- Create: `src/db/actions/mentor-onboarding/schemas.ts`
- Create: `src/db/actions/mentor-onboarding/complete.ts`

- [ ] **Step 1: Schema**

```ts
// src/db/actions/mentor-onboarding/schemas.ts
import { z } from 'zod';

const slot = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
});

export const completeMentorOnboardingSchema = z.object({
  token: z.string(),
  bio: z.string().min(20).max(1000),
  nickname: z.string().max(60).optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  timezone: z.string().min(1),
  slots: z.array(slot).min(1, 'Add at least one availability slot.'),
});
export type CompleteMentorOnboardingInput = z.infer<typeof completeMentorOnboardingSchema>;
```

- [ ] **Step 2: Action**

```ts
// src/db/actions/mentor-onboarding/complete.ts
'use server';

import { actionClient, ActionError } from '@/src/lib/safe-action';
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import { completeMentorOnboardingSchema } from './schemas';
import { verifyBookingToken } from '@/src/lib/booking-tokens';
import { revalidatePath } from 'next/cache';

export const completeMentorOnboarding = actionClient
  .schema(completeMentorOnboardingSchema)
  .action(async ({ parsedInput }) => {
    const verified = verifyBookingToken(parsedInput.token);
    if (!verified.ok) throw new ActionError(`Invalid link: ${verified.reason}`);
    if (verified.action !== 'mentor_onboard') throw new ActionError('Invalid link');

    const mentorId = verified.bookingId; // we reuse the bookingId field; rename later if it gets confusing

    const [mentor] = await db.select().from(schema.mentors).where(eq(schema.mentors.id, mentorId)).limit(1);
    if (!mentor) throw new ActionError('Mentor not found');

    await db.transaction(async (tx) => {
      await tx
        .update(schema.mentors)
        .set({
          bio: parsedInput.bio,
          nickname: parsedInput.nickname || null,
          image: parsedInput.image || null,
          active: true,
        })
        .where(eq(schema.mentors.id, mentorId));

      await tx.delete(schema.availability).where(eq(schema.availability.mentor_id, mentorId));
      await tx.insert(schema.availability).values(
        parsedInput.slots.map((s) => ({
          mentor_id: mentorId,
          day: s.day,
          start_time: s.start_time,
          end_time: s.end_time,
          timezone: parsedInput.timezone,
        })),
      );
    });

    revalidatePath('/mentors');
    revalidatePath(`/mentors/${mentor.slug}`);
    return { ok: true };
  });
```

- [ ] **Step 3: Commit**

```bash
git add src/db/actions/mentor-onboarding
git commit -m "feat(onboarding): mentor self-serve completion action"
```

### Task 3.2: Onboarding page (signed link)

**Files:**
- Create: `app/[locale]/(website)/mentors/onboard/[token]/page.tsx`
- Create: `app/[locale]/(website)/mentors/onboard/[token]/_components/onboarding-form.tsx`

- [ ] **Step 1: Page (server) validates token and loads mentor**

```tsx
// app/[locale]/(website)/mentors/onboard/[token]/page.tsx
import { notFound } from 'next/navigation';
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import { verifyBookingToken } from '@/src/lib/booking-tokens';
import { OnboardingForm } from './_components/onboarding-form';

export default async function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const verified = verifyBookingToken(token);
  if (!verified.ok || verified.action !== 'mentor_onboard') {
    return <ErrorBox reason={verified.ok ? 'wrong_action' : verified.reason} />;
  }

  const [mentor] = await db.select().from(schema.mentors).where(eq(schema.mentors.id, verified.bookingId)).limit(1);
  if (!mentor) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Welcome, {mentor.name}</h1>
      <p className="mt-2 text-muted-foreground">Set your bio, photo, and weekly availability. You can edit this anytime.</p>
      <div className="mt-8">
        <OnboardingForm token={token} mentor={mentor} />
      </div>
    </main>
  );
}

function ErrorBox({ reason }: { reason: string }) {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">This link can't be used</h1>
      <p className="mt-2 text-sm text-muted-foreground">Reason: {reason}. Reach out to the 4HerFrika team to get a new link.</p>
    </main>
  );
}
```

- [ ] **Step 2: Onboarding form**

```tsx
// app/[locale]/(website)/mentors/onboard/[token]/_components/onboarding-form.tsx
'use client';

import { useState } from 'react';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { completeMentorOnboarding } from '@/src/db/actions/mentor-onboarding/complete';
import { completeMentorOnboardingSchema } from '@/src/db/actions/mentor-onboarding/schemas';
import type { DbMentor } from '@/src/db/schema/tables';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AvailabilityEditor } from '@/components/availability-editor';

export function OnboardingForm({ token, mentor }: { token: string; mentor: DbMentor }) {
  const router = useRouter();
  const detectedTz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

  const { form, handleSubmitWithAction, action } = useHookFormAction(
    completeMentorOnboarding,
    zodResolver(completeMentorOnboardingSchema),
    {
      formProps: {
        defaultValues: {
          token,
          bio: mentor.bio ?? '',
          nickname: mentor.nickname ?? '',
          image: mentor.image ?? '',
          timezone: detectedTz,
          slots: [],
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success('All set! Your profile is live.');
          router.push(`/mentors/${mentor.slug}`);
        },
        onError: ({ error }) => toast.error(error.serverError ?? 'Failed'),
      },
    },
  );

  return (
    <form onSubmit={handleSubmitWithAction} className="space-y-5">
      <input type="hidden" {...form.register('token')} />

      <div className="space-y-1.5">
        <Label>Bio</Label>
        <Textarea rows={4} {...form.register('bio')} />
        {form.formState.errors.bio && <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Nickname (optional)</Label>
        <Input {...form.register('nickname')} />
      </div>
      <div className="space-y-1.5">
        <Label>Profile photo URL (optional)</Label>
        <Input type="url" {...form.register('image')} />
        <p className="text-xs text-muted-foreground">Tip: ask the team to upload an image and paste the URL here. Native upload coming soon.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Timezone</Label>
        <Input {...form.register('timezone')} />
      </div>

      <div className="space-y-2">
        <Label>Weekly availability</Label>
        <AvailabilityEditor
          value={form.watch('slots')}
          onChange={(slots) => form.setValue('slots', slots, { shouldValidate: true })}
        />
        {form.formState.errors.slots && <p className="text-sm text-destructive">{form.formState.errors.slots.message as string}</p>}
      </div>

      <Button type="submit" disabled={action.isPending} className="w-full">
        {action.isPending ? 'Saving…' : 'Save & go live'}
      </Button>
    </form>
  );
}
```

**Note:** `components/availability-editor.tsx` exists. Inspect it to confirm the prop shape (`value` + `onChange`) — if different, adapt the wrapper above. If the editor manages its own DB writes (rather than emitting controlled values), wrap it in a thin controlled adapter.

- [ ] **Step 3: Smoke test**

Approve a fresh application, copy the onboarding link from the Resend logs (or temporarily log it), visit it, fill the form, submit. Verify mentor flips to `active=true` and availability rows are saved.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/\(website\)/mentors/onboard
git commit -m "feat(onboarding): mentor self-serve onboarding page (signed link)"
```

---

## Phase 4 — Slot computation & mentee booking UI

### Task 4.1: Pure slot computation

**Files:**
- Create: `src/lib/slots.ts`
- Create: `src/lib/slots.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/slots.test.ts
import { describe, expect, it } from 'vitest';
import { computeSlots } from './slots';

const mentorTz = 'Africa/Lagos';

describe('computeSlots', () => {
  it('expands a weekly template into 30-min slots', () => {
    const slots = computeSlots({
      availabilityTemplates: [
        { day: 'Monday', start_time: '11:00', end_time: '12:00', timezone: mentorTz },
      ],
      existingBookings: [],
      settings: { session_duration_minutes: 30, min_lead_hours: 0, max_horizon_days: 30, buffer_minutes: 0 },
      fromUtc: new Date('2026-05-18T00:00:00Z'),
      toUtc: new Date('2026-05-19T00:00:00Z'),
      now: new Date('2026-05-01T00:00:00Z'),
    });
    expect(slots).toHaveLength(2);
    // 11:00 Lagos = 10:00 UTC
    expect(slots[0].startUtc).toBe('2026-05-18T10:00:00.000Z');
    expect(slots[1].startUtc).toBe('2026-05-18T10:30:00.000Z');
  });

  it('respects min_lead_hours', () => {
    const slots = computeSlots({
      availabilityTemplates: [
        { day: 'Monday', start_time: '11:00', end_time: '12:00', timezone: mentorTz },
      ],
      existingBookings: [],
      settings: { session_duration_minutes: 30, min_lead_hours: 24, max_horizon_days: 30, buffer_minutes: 0 },
      fromUtc: new Date('2026-05-18T00:00:00Z'),
      toUtc: new Date('2026-05-19T00:00:00Z'),
      now: new Date('2026-05-18T09:00:00Z'),
    });
    expect(slots).toHaveLength(0);
  });

  it('excludes slots overlapping a booking + buffer', () => {
    const slots = computeSlots({
      availabilityTemplates: [
        { day: 'Monday', start_time: '11:00', end_time: '13:00', timezone: mentorTz },
      ],
      existingBookings: [
        { startUtc: new Date('2026-05-18T10:30:00Z'), endUtc: new Date('2026-05-18T11:00:00Z') },
      ],
      settings: { session_duration_minutes: 30, min_lead_hours: 0, max_horizon_days: 30, buffer_minutes: 15 },
      fromUtc: new Date('2026-05-18T00:00:00Z'),
      toUtc: new Date('2026-05-19T00:00:00Z'),
      now: new Date('2026-05-01T00:00:00Z'),
    });
    // 11:00 Lagos = 10:00 UTC. Booking 10:30-11:00 UTC blocks 10:00 (overlap inside 15m buffer) and 10:30 (direct).
    // 11:00 UTC = 12:00 Lagos slot remains; 11:30 UTC = 12:30 Lagos also.
    expect(slots.map((s) => s.startUtc)).toEqual([
      '2026-05-18T11:30:00.000Z',
      '2026-05-18T12:00:00.000Z',
    ]);
  });

  it('respects max_horizon_days', () => {
    const slots = computeSlots({
      availabilityTemplates: [
        { day: 'Monday', start_time: '11:00', end_time: '12:00', timezone: mentorTz },
      ],
      existingBookings: [],
      settings: { session_duration_minutes: 30, min_lead_hours: 0, max_horizon_days: 7, buffer_minutes: 0 },
      fromUtc: new Date('2026-05-01T00:00:00Z'),
      toUtc: new Date('2026-06-01T00:00:00Z'),
      now: new Date('2026-05-01T00:00:00Z'),
    });
    // only the May 4 Monday (within 7d) — May 11 Monday is exactly 10d out, excluded
    expect(slots.every((s) => new Date(s.startUtc).getTime() <= new Date('2026-05-08T00:00:00Z').getTime())).toBe(true);
  });
});
```

- [ ] **Step 2: Run — should fail (module missing)**

```bash
bun test src/lib/slots.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/lib/slots.ts
import { addMinutes, addDays, startOfDay, isBefore, isAfter, isEqual } from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import type { DayOfWeek } from '@/src/db/schema/tables';

const DAY_INDEX: Record<DayOfWeek, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

type Template = { day: DayOfWeek; start_time: string; end_time: string; timezone: string };
type Booking = { startUtc: Date; endUtc: Date };
type Settings = {
  session_duration_minutes: number;
  min_lead_hours: number;
  max_horizon_days: number;
  buffer_minutes: number;
};

export type ComputedSlot = {
  startUtc: string; // ISO
  endUtc: string;
};

export function computeSlots(opts: {
  availabilityTemplates: Template[];
  existingBookings: Booking[];
  settings: Settings;
  fromUtc: Date;
  toUtc: Date;
  now: Date;
}): ComputedSlot[] {
  const { availabilityTemplates, existingBookings, settings, fromUtc, toUtc, now } = opts;

  const earliest = addMinutes(now, settings.min_lead_hours * 60);
  const latest = addDays(now, settings.max_horizon_days);

  const candidates: ComputedSlot[] = [];

  // Iterate every day in [fromUtc, toUtc).
  for (let d = startOfDay(fromUtc); isBefore(d, toUtc); d = addDays(d, 1)) {
    for (const tpl of availabilityTemplates) {
      // Interpret the day-of-week in the mentor's local TZ.
      const localDateStr = formatInTimeZone(d, tpl.timezone, 'yyyy-MM-dd');
      const localDayName = formatInTimeZone(d, tpl.timezone, 'EEEE');
      if (DAY_INDEX[localDayName as DayOfWeek] !== DAY_INDEX[tpl.day]) continue;

      const startUtc = fromZonedTime(`${localDateStr}T${tpl.start_time}:00`, tpl.timezone);
      const endUtc = fromZonedTime(`${localDateStr}T${tpl.end_time}:00`, tpl.timezone);

      for (
        let s = startUtc;
        !isAfter(addMinutes(s, settings.session_duration_minutes), endUtc);
        s = addMinutes(s, settings.session_duration_minutes)
      ) {
        const slotEnd = addMinutes(s, settings.session_duration_minutes);
        if (isBefore(s, earliest)) continue;
        if (isAfter(s, latest)) continue;

        const blocked = existingBookings.some((b) =>
          overlaps(
            s,
            slotEnd,
            addMinutes(b.startUtc, -settings.buffer_minutes),
            addMinutes(b.endUtc, settings.buffer_minutes),
          ),
        );
        if (blocked) continue;

        candidates.push({ startUtc: s.toISOString(), endUtc: slotEnd.toISOString() });
      }
    }
  }

  // Sort and dedupe (two templates could overlap).
  const unique = new Map(candidates.map((c) => [c.startUtc, c]));
  return Array.from(unique.values()).sort((a, b) => a.startUtc.localeCompare(b.startUtc));
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return isBefore(aStart, bEnd) && isBefore(bStart, aEnd) ||
    isEqual(aStart, bStart) || isEqual(aEnd, bEnd);
}
```

- [ ] **Step 4: Run tests — should pass**

```bash
bun test src/lib/slots.test.ts
```

Expected: 4 passed. If any fail, iterate on `computeSlots` (especially the buffer math — the test for overlapping booking encodes the expected semantics: only slots that don't overlap booking ± buffer survive).

- [ ] **Step 5: Commit**

```bash
git add src/lib/slots.ts src/lib/slots.test.ts
git commit -m "feat(booking): pure slot-computation with TZ + buffer + lead/horizon"
```

### Task 4.2: Slot fetch action

**Files:**
- Create: `src/db/actions/bookings/list-slots.ts`

- [ ] **Step 1: Action**

```ts
// src/db/actions/bookings/list-slots.ts
'use server';

import { actionClient, ActionError } from '@/src/lib/safe-action';
import { z } from 'zod';
import { db, schema } from '@/src/db';
import { and, eq, gte, lt, ne } from 'drizzle-orm';
import { computeSlots } from '@/src/lib/slots';

export const listMentorSlots = actionClient
  .schema(z.object({
    mentorSlug: z.string().min(1),
    fromUtc: z.string().datetime(),
    toUtc: z.string().datetime(),
  }))
  .action(async ({ parsedInput }) => {
    const [mentor] = await db
      .select()
      .from(schema.mentors)
      .where(and(eq(schema.mentors.slug, parsedInput.mentorSlug), eq(schema.mentors.active, true)))
      .limit(1);
    if (!mentor) throw new ActionError('Mentor not found');

    const [settings] = await db
      .select()
      .from(schema.mentorBookingSettings)
      .where(eq(schema.mentorBookingSettings.mentor_id, mentor.id))
      .limit(1);
    if (!settings) throw new ActionError('Mentor booking settings missing');

    const templates = await db
      .select()
      .from(schema.availability)
      .where(eq(schema.availability.mentor_id, mentor.id));

    const fromUtc = new Date(parsedInput.fromUtc);
    const toUtc = new Date(parsedInput.toUtc);

    const existing = await db
      .select({ startUtc: schema.bookings.start_at, endUtc: schema.bookings.end_at })
      .from(schema.bookings)
      .where(and(
        eq(schema.bookings.mentor_id, mentor.id),
        ne(schema.bookings.status, 'cancelled'),
        gte(schema.bookings.start_at, fromUtc),
        lt(schema.bookings.start_at, toUtc),
      ));

    const slots = computeSlots({
      availabilityTemplates: templates,
      existingBookings: existing,
      settings,
      fromUtc, toUtc, now: new Date(),
    });

    return { mentorId: mentor.id, mentorTimezone: templates[0]?.timezone ?? 'UTC', slots };
  });
```

- [ ] **Step 2: Verify** — `bunx tsc --noEmit`.

- [ ] **Step 3: Commit**

```bash
git add src/db/actions/bookings/list-slots.ts
git commit -m "feat(booking): listMentorSlots action"
```

### Task 4.3: Slot picker component

**Files:**
- Create: `components/booking/slot-picker.tsx`

- [ ] **Step 1: Write component**

```tsx
// components/booking/slot-picker.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { addDays, startOfWeek, endOfWeek, format, isSameDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useAction } from 'next-safe-action/hooks';
import { listMentorSlots } from '@/src/db/actions/bookings/list-slots';
import { Button } from '@/components/ui/button';

type Slot = { startUtc: string; endUtc: string };

export function SlotPicker({
  mentorSlug,
  selectedStartUtc,
  onSelect,
}: {
  mentorSlug: string;
  selectedStartUtc: string | null;
  onSelect: (startUtc: string) => void;
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [tz, setTz] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  const fromUtc = useMemo(() => weekStart.toISOString(), [weekStart]);
  const toUtc = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }).toISOString(), [weekStart]);

  const { execute } = useAction(listMentorSlots);

  const query = useQuery({
    queryKey: ['slots', mentorSlug, fromUtc, toUtc],
    queryFn: async () => {
      const res = await execute({ mentorSlug, fromUtc, toUtc });
      if (!res?.data) throw new Error(res?.serverError ?? 'Failed to load');
      return res.data;
    },
    staleTime: 30_000,
  });

  const slotsByDay = useMemo(() => {
    const groups = new Map<string, Slot[]>();
    (query.data?.slots ?? []).forEach((s) => {
      const dayKey = formatInTimeZone(new Date(s.startUtc), tz, 'yyyy-MM-dd');
      if (!groups.has(dayKey)) groups.set(dayKey, []);
      groups.get(dayKey)!.push(s);
    });
    return groups;
  }, [query.data, tz]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekStart((w) => addDays(w, -7))}>← Prev</Button>
          <span className="text-sm font-medium">{format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}</span>
          <Button variant="outline" size="sm" onClick={() => setWeekStart((w) => addDays(w, 7))}>Next →</Button>
        </div>
        <TimezoneSelect value={tz} onChange={setTz} />
      </div>

      {query.isPending && <p className="text-sm text-muted-foreground">Loading availability…</p>}
      {query.isError && <p className="text-sm text-destructive">Failed to load slots.</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {days.map((day) => {
          const dayKey = formatInTimeZone(day, tz, 'yyyy-MM-dd');
          const slots = slotsByDay.get(dayKey) ?? [];
          return (
            <div key={dayKey} className="rounded-md border p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {formatInTimeZone(day, tz, 'EEE')}
              </p>
              <p className="text-sm">{formatInTimeZone(day, tz, 'MMM d')}</p>
              <div className="mt-2 space-y-1.5">
                {slots.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
                {slots.map((s) => {
                  const isSelected = s.startUtc === selectedStartUtc;
                  return (
                    <button
                      key={s.startUtc}
                      type="button"
                      onClick={() => onSelect(s.startUtc)}
                      className={`block w-full rounded border px-2 py-1 text-sm transition ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                      }`}
                    >
                      {formatInTimeZone(new Date(s.startUtc), tz, 'HH:mm')}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">All times shown in {tz}.</p>
    </div>
  );
}

const COMMON_TZS = [
  'Africa/Lagos', 'Africa/Nairobi', 'Africa/Johannesburg', 'Africa/Cairo', 'Africa/Accra',
  'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Asia/Dubai', 'UTC',
];

function TimezoneSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tzs = Array.from(new Set([value, ...COMMON_TZS]));
  return (
    <select className="rounded border px-2 py-1 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      {tzs.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/booking/slot-picker.tsx
git commit -m "feat(booking): slot picker component (TZ aware, week navigator)"
```

### Task 4.4: Mentor list + detail public pages

**Files:**
- Create: `app/[locale]/(website)/mentors/page.tsx`
- Create: `app/[locale]/(website)/mentors/[slug]/page.tsx`
- Create: `app/[locale]/(website)/mentors/[slug]/_components/booking-section.tsx`

- [ ] **Step 1: Mentors directory page**

```tsx
// app/[locale]/(website)/mentors/page.tsx
import Link from 'next/link';
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import Image from 'next/image';

export default async function MentorsListPage() {
  const mentors = await db.select().from(schema.mentors).where(eq(schema.mentors.active, true));
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Meet our mentors</h1>
      <p className="mt-2 text-muted-foreground">Book a free 30-minute call with one of our mentors.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mentors.map((m) => (
          <Link key={m.id} href={`/mentors/${m.slug}`} className="block rounded-lg border p-4 transition hover:shadow-md">
            <div className="flex items-center gap-3">
              {m.image && <Image src={m.image} alt={m.name} width={48} height={48} className="rounded-full" />}
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.position}</p>
              </div>
            </div>
            {m.bio && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{m.bio}</p>}
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Mentor detail page**

```tsx
// app/[locale]/(website)/mentors/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { db, schema } from '@/src/db';
import { and, eq } from 'drizzle-orm';
import Image from 'next/image';
import { BookingSection } from './_components/booking-section';

export default async function MentorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [mentor] = await db.select().from(schema.mentors).where(and(eq(schema.mentors.slug, slug), eq(schema.mentors.active, true))).limit(1);
  if (!mentor) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="flex items-center gap-4">
        {mentor.image && <Image src={mentor.image} alt={mentor.name} width={80} height={80} className="rounded-full" />}
        <div>
          <h1 className="text-2xl font-semibold">{mentor.name}</h1>
          <p className="text-muted-foreground">{mentor.position}</p>
        </div>
      </header>
      {mentor.bio && <p className="mt-6 text-sm whitespace-pre-wrap">{mentor.bio}</p>}

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Book a 30-minute call</h2>
        <div className="mt-4">
          <BookingSection mentorSlug={mentor.slug} mentorId={mentor.id} mentorName={mentor.name} />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Booking section (client) — slot picker + form drawer**

```tsx
// app/[locale]/(website)/mentors/[slug]/_components/booking-section.tsx
'use client';

import { useState } from 'react';
import { SlotPicker } from '@/components/booking/slot-picker';
import { BookingForm } from '@/components/booking/booking-form';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { formatInTimeZone } from 'date-fns-tz';

export function BookingSection({ mentorSlug, mentorId, mentorName }: { mentorSlug: string; mentorId: string; mentorName: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

  return (
    <>
      <SlotPicker
        mentorSlug={mentorSlug}
        selectedStartUtc={selected}
        onSelect={(s) => { setSelected(s); setOpen(true); }}
      />
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              Book with {mentorName}
              {selected && <span className="block text-sm font-normal text-muted-foreground">
                {formatInTimeZone(new Date(selected), tz, 'EEE, MMM d • HH:mm zzz')}
              </span>}
            </DrawerTitle>
          </DrawerHeader>
          {selected && (
            <div className="px-4 pb-8">
              <BookingForm mentorSlug={mentorSlug} startAtUtc={selected} menteeTimezone={tz} onSuccess={() => setOpen(false)} />
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
```

If `Drawer` is not in `components/ui/`, run `bunx shadcn@latest add drawer`.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/\(website\)/mentors
git commit -m "feat(booking): public /mentors directory + detail page with slot picker"
```

---

## Phase 5 — Booking creation (Google Calendar + emails + .ics)

### Task 5.1: Google Calendar wrapper

**Files:**
- Create: `src/lib/google-calendar.ts`

- [ ] **Step 1: Implement**

```ts
// src/lib/google-calendar.ts
import { google } from 'googleapis';

function getCalendar() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth: oauth2 });
}

export async function createMeetEvent(params: {
  summary: string;
  description: string;
  startAtUtc: Date;
  endAtUtc: Date;
  mentorEmail: string;
  menteeEmail: string;
}): Promise<{ eventId: string; meetUrl: string }> {
  const calendar = getCalendar();
  const calendarId = process.env.GOOGLE_ORG_CALENDAR_ID!;

  const res = await calendar.events.insert({
    calendarId,
    sendUpdates: 'all',
    conferenceDataVersion: 1,
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startAtUtc.toISOString() },
      end: { dateTime: params.endAtUtc.toISOString() },
      attendees: [{ email: params.mentorEmail }, { email: params.menteeEmail }],
      conferenceData: {
        createRequest: {
          requestId: `4hf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const eventId = res.data.id;
  const meetUrl = res.data.hangoutLink ?? res.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri;
  if (!eventId || !meetUrl) throw new Error('Failed to create Meet event');
  return { eventId, meetUrl };
}

export async function deleteMeetEvent(eventId: string) {
  const calendar = getCalendar();
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_ORG_CALENDAR_ID!,
    eventId,
    sendUpdates: 'all',
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/google-calendar.ts
git commit -m "feat(booking): Google Calendar + Meet wrapper"
```

### Task 5.2: .ics generator

**Files:**
- Create: `src/lib/ics.ts`

- [ ] **Step 1: Implement**

```ts
// src/lib/ics.ts
import ical, { ICalCalendarMethod } from 'ical-generator';

export function buildBookingIcs(params: {
  uid: string;
  method: 'REQUEST' | 'CANCEL';
  summary: string;
  description: string;
  startAtUtc: Date;
  endAtUtc: Date;
  meetUrl: string;
  mentorName: string;
  mentorEmail: string;
  menteeName: string;
  menteeEmail: string;
}): string {
  const cal = ical({
    name: '4HerFrika mentorship',
    method: params.method === 'REQUEST' ? ICalCalendarMethod.REQUEST : ICalCalendarMethod.CANCEL,
  });
  cal.createEvent({
    id: params.uid,
    start: params.startAtUtc,
    end: params.endAtUtc,
    summary: params.summary,
    description: params.description,
    location: params.meetUrl,
    url: params.meetUrl,
    organizer: { name: '4HerFrika', email: process.env.RESEND_FROM_EMAIL ?? 'bookings@4herfrika.org' },
    attendees: [
      { name: params.mentorName, email: params.mentorEmail, rsvp: true },
      { name: params.menteeName, email: params.menteeEmail, rsvp: true },
    ],
  });
  return cal.toString();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ics.ts
git commit -m "feat(booking): .ics generator"
```

### Task 5.3: Email helpers (booking lifecycle)

**Files:**
- Create: `src/lib/email/booking.ts`

- [ ] **Step 1: Implement**

```ts
// src/lib/email/booking.ts
import { Resend } from 'resend';
import { formatInTimeZone } from 'date-fns-tz';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? '4HerFrika <bookings@4herfrika.org>';

type Common = {
  mentorName: string;
  menteeName: string;
  menteeEmail: string;
  mentorEmail: string;
  startAtUtc: Date;
  endAtUtc: Date;
  meetUrl: string;
  menteeTimezone: string;
};

function fmt(date: Date, tz: string) {
  return formatInTimeZone(date, tz, "EEEE, MMM d, yyyy 'at' HH:mm zzz");
}

export async function sendBookingConfirmationMentee(
  p: Common & { icsAttachment: string; manageUrl: string; purpose: string },
) {
  await resend.emails.send({
    from: FROM,
    to: p.menteeEmail,
    subject: `Confirmed: your call with ${p.mentorName}`,
    text: `Hi ${p.menteeName},

Your 30-minute call with ${p.mentorName} is confirmed for ${fmt(p.startAtUtc, p.menteeTimezone)}.

Join here: ${p.meetUrl}

Need to cancel or reschedule? ${p.manageUrl}

— 4HerFrika`,
    attachments: [{ filename: 'invite.ics', content: Buffer.from(p.icsAttachment).toString('base64') }],
  });
}

export async function sendBookingConfirmationMentor(
  p: Common & { icsAttachment: string; mentorTimezone: string; purpose: string; intake: Record<string, string | null | undefined> },
) {
  const intakeLines = Object.entries(p.intake).filter(([, v]) => v).map(([k, v]) => `- ${k}: ${v}`).join('\n');
  await resend.emails.send({
    from: FROM,
    to: p.mentorEmail,
    subject: `New booking: ${p.menteeName} on ${fmt(p.startAtUtc, p.mentorTimezone)}`,
    text: `Hi ${p.mentorName},

You have a new mentee booking.

When: ${fmt(p.startAtUtc, p.mentorTimezone)}
Meet: ${p.meetUrl}

Mentee: ${p.menteeName} <${p.menteeEmail}>
Purpose: ${p.purpose}

${intakeLines}

— 4HerFrika`,
    attachments: [{ filename: 'invite.ics', content: Buffer.from(p.icsAttachment).toString('base64') }],
  });
}

export async function sendReminder24h(p: Common & { manageUrl: string }) {
  await resend.emails.send({
    from: FROM,
    to: p.menteeEmail,
    subject: `Tomorrow: your call with ${p.mentorName}`,
    text: `Hi ${p.menteeName},\n\nQuick reminder — your call with ${p.mentorName} is tomorrow at ${fmt(p.startAtUtc, p.menteeTimezone)}.\n\nJoin: ${p.meetUrl}\nReschedule: ${p.manageUrl}\n\n— 4HerFrika`,
  });
}

export async function sendReminder1hMentee(p: Common) {
  await resend.emails.send({
    from: FROM, to: p.menteeEmail,
    subject: `Starting soon: your call with ${p.mentorName}`,
    text: `Hi ${p.menteeName},\n\nYour call starts at ${fmt(p.startAtUtc, p.menteeTimezone)}. Join here: ${p.meetUrl}\n\n— 4HerFrika`,
  });
}

export async function sendReminder1hMentor(p: Common & { mentorTimezone: string }) {
  await resend.emails.send({
    from: FROM, to: p.mentorEmail,
    subject: `In ~1 hour: call with ${p.menteeName}`,
    text: `Hi ${p.mentorName},\n\nYour call with ${p.menteeName} starts at ${fmt(p.startAtUtc, p.mentorTimezone)}. Join here: ${p.meetUrl}\n\n— 4HerFrika`,
  });
}

export async function sendFeedbackRequest(p: { menteeName: string; menteeEmail: string; mentorName: string; feedbackUrl: string }) {
  await resend.emails.send({
    from: FROM, to: p.menteeEmail,
    subject: `How was your call with ${p.mentorName}?`,
    text: `Hi ${p.menteeName},\n\nThanks for booking with 4HerFrika. Would you take a minute to share how the call went?\n\n${p.feedbackUrl}\n\n— 4HerFrika`,
  });
}

export async function sendMentorFollowup(p: { mentorName: string; mentorEmail: string; menteeName: string }) {
  await resend.emails.send({
    from: FROM, to: p.mentorEmail,
    subject: `Follow-up: your call with ${p.menteeName}`,
    text: `Hi ${p.mentorName},\n\nThanks again for showing up. If there's anything you wanted to follow up with ${p.menteeName} about, now's a good time. You can see your past sessions in your dashboard.\n\n— 4HerFrika`,
  });
}

export async function sendBookingCancelled(p: Common & { reason?: string; icsAttachment: string }) {
  for (const recipient of [{ email: p.menteeEmail, name: p.menteeName, tz: p.menteeTimezone }, { email: p.mentorEmail, name: p.mentorName, tz: p.menteeTimezone }]) {
    await resend.emails.send({
      from: FROM, to: recipient.email,
      subject: `Cancelled: call on ${fmt(p.startAtUtc, recipient.tz)}`,
      text: `Hi ${recipient.name},\n\nThe call on ${fmt(p.startAtUtc, recipient.tz)} has been cancelled.${p.reason ? `\n\nReason: ${p.reason}` : ''}\n\n— 4HerFrika`,
      attachments: [{ filename: 'cancel.ics', content: Buffer.from(p.icsAttachment).toString('base64') }],
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/booking.ts
git commit -m "feat(email): booking lifecycle email helpers"
```

### Task 5.4: createBooking action

**Files:**
- Create: `src/db/actions/bookings/schemas.ts`
- Create: `src/db/actions/bookings/create.ts`
- Create: `components/booking/booking-form.tsx`

- [ ] **Step 1: Schema**

```ts
// src/db/actions/bookings/schemas.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  mentorSlug: z.string().min(1),
  startAtUtc: z.string().datetime(),
  menteeTimezone: z.string().min(1),

  mentee_name: z.string().min(2).max(120),
  mentee_email: z.string().email(),
  mentee_gender: z.enum(['female', 'male', 'non_binary', 'prefer_not_to_say']),
  purpose: z.string().min(20, 'Tell the mentor a bit more — at least 20 characters.').max(2000),

  mentee_phone: z.string().max(40).optional().or(z.literal('')),
  mentee_linkedin: z.string().url().optional().or(z.literal('')),
  mentee_country: z.string().max(80).optional().or(z.literal('')),
  mentee_career_stage: z.enum(['student', 'early_career', 'mid_career', 'founder', 'other']).optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
```

- [ ] **Step 2: Action**

```ts
// src/db/actions/bookings/create.ts
'use server';

import { actionClient, ActionError } from '@/src/lib/safe-action';
import { db, schema } from '@/src/db';
import { and, eq, gte, lt, ne, sql } from 'drizzle-orm';
import { createBookingSchema } from './schemas';
import { computeSlots } from '@/src/lib/slots';
import { createMeetEvent } from '@/src/lib/google-calendar';
import { buildBookingIcs } from '@/src/lib/ics';
import { signBookingToken } from '@/src/lib/booking-tokens';
import { sendBookingConfirmationMentee, sendBookingConfirmationMentor } from '@/src/lib/email/booking';
import { revalidatePath } from 'next/cache';

const SESSION_DURATION_FALLBACK = 30;

export const createBooking = actionClient
  .schema(createBookingSchema)
  .action(async ({ parsedInput }) => {
    const [mentor] = await db.select().from(schema.mentors).where(and(eq(schema.mentors.slug, parsedInput.mentorSlug), eq(schema.mentors.active, true))).limit(1);
    if (!mentor) throw new ActionError('Mentor not found');

    const [mentorUser] = await db.select().from(schema.users).where(eq(schema.users.id, mentor.user_id)).limit(1);
    const mentorEmail = mentorUser?.email;
    if (!mentorEmail) throw new ActionError('Mentor email missing');

    const [settings] = await db.select().from(schema.mentorBookingSettings).where(eq(schema.mentorBookingSettings.mentor_id, mentor.id)).limit(1);
    if (!settings) throw new ActionError('Mentor booking settings missing');

    const startAt = new Date(parsedInput.startAtUtc);
    const endAt = new Date(startAt.getTime() + (settings.session_duration_minutes ?? SESSION_DURATION_FALLBACK) * 60_000);

    // per-mentee active cap
    const activeForMentee = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(schema.bookings)
      .where(and(
        eq(schema.bookings.mentee_email, parsedInput.mentee_email),
        eq(schema.bookings.status, 'confirmed'),
      ));
    if ((activeForMentee[0]?.c ?? 0) >= settings.max_active_bookings_per_mentee) {
      throw new ActionError('You already have an active booking. Please cancel it before booking a new one.');
    }

    // re-check availability
    const dayStart = new Date(startAt); dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart); dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const templates = await db.select().from(schema.availability).where(eq(schema.availability.mentor_id, mentor.id));
    const existing = await db
      .select({ startUtc: schema.bookings.start_at, endUtc: schema.bookings.end_at })
      .from(schema.bookings)
      .where(and(
        eq(schema.bookings.mentor_id, mentor.id),
        ne(schema.bookings.status, 'cancelled'),
        gte(schema.bookings.start_at, dayStart),
        lt(schema.bookings.start_at, dayEnd),
      ));

    const slots = computeSlots({
      availabilityTemplates: templates,
      existingBookings: existing,
      settings,
      fromUtc: dayStart, toUtc: dayEnd, now: new Date(),
    });
    if (!slots.some((s) => s.startUtc === startAt.toISOString())) {
      throw new ActionError('That slot is no longer available. Please pick another time.');
    }

    // Google
    const { eventId, meetUrl } = await createMeetEvent({
      summary: `4HerFrika: ${parsedInput.mentee_name} ↔ ${mentor.name}`,
      description: `Purpose: ${parsedInput.purpose}\n\nMentee: ${parsedInput.mentee_name} <${parsedInput.mentee_email}>`,
      startAtUtc: startAt,
      endAtUtc: endAt,
      mentorEmail,
      menteeEmail: parsedInput.mentee_email,
    });

    // Insert
    const [booking] = await db.insert(schema.bookings).values({
      mentor_id: mentor.id,
      mentee_name: parsedInput.mentee_name,
      mentee_email: parsedInput.mentee_email,
      mentee_gender: parsedInput.mentee_gender,
      purpose: parsedInput.purpose,
      mentee_phone: parsedInput.mentee_phone || null,
      mentee_linkedin: parsedInput.mentee_linkedin || null,
      mentee_country: parsedInput.mentee_country || null,
      mentee_career_stage: parsedInput.mentee_career_stage,
      start_at: startAt,
      end_at: endAt,
      mentee_timezone: parsedInput.menteeTimezone,
      meet_url: meetUrl,
      google_event_id: eventId,
    }).returning();

    // Side effects — after commit
    const manageToken = signBookingToken({ bookingId: booking.id, action: 'manage', expiresAt: startAt.getTime() });
    const manageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/bookings/${manageToken}`;
    const mentorTz = templates[0]?.timezone ?? 'UTC';

    const icsCommon = {
      uid: booking.id,
      method: 'REQUEST' as const,
      summary: `4HerFrika mentorship with ${mentor.name}`,
      description: parsedInput.purpose,
      startAtUtc: startAt,
      endAtUtc: endAt,
      meetUrl,
      mentorName: mentor.name,
      mentorEmail,
      menteeName: parsedInput.mentee_name,
      menteeEmail: parsedInput.mentee_email,
    };
    const ics = buildBookingIcs(icsCommon);

    try {
      await Promise.all([
        sendBookingConfirmationMentee({
          mentorName: mentor.name, menteeName: parsedInput.mentee_name, menteeEmail: parsedInput.mentee_email, mentorEmail,
          startAtUtc: startAt, endAtUtc: endAt, meetUrl, menteeTimezone: parsedInput.menteeTimezone,
          icsAttachment: ics, manageUrl, purpose: parsedInput.purpose,
        }),
        sendBookingConfirmationMentor({
          mentorName: mentor.name, menteeName: parsedInput.mentee_name, menteeEmail: parsedInput.mentee_email, mentorEmail,
          startAtUtc: startAt, endAtUtc: endAt, meetUrl,
          menteeTimezone: parsedInput.menteeTimezone, mentorTimezone: mentorTz,
          icsAttachment: ics, purpose: parsedInput.purpose,
          intake: {
            Phone: parsedInput.mentee_phone, LinkedIn: parsedInput.mentee_linkedin,
            Country: parsedInput.mentee_country, 'Career stage': parsedInput.mentee_career_stage, Gender: parsedInput.mentee_gender,
          },
        }),
      ]);
      await db.update(schema.bookings).set({ confirmation_sent_at: new Date() }).where(eq(schema.bookings.id, booking.id));
    } catch (e) {
      console.error('[booking] confirmation email failed', e);
      // leave confirmation_sent_at null; cron can retry. Booking itself is committed.
    }

    revalidatePath(`/mentors/${mentor.slug}`);
    return { bookingId: booking.id, manageUrl };
  });
```

- [ ] **Step 3: Booking form component**

```tsx
// components/booking/booking-form.tsx
'use client';

import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { createBooking } from '@/src/db/actions/bookings/create';
import { createBookingSchema } from '@/src/db/actions/bookings/schemas';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function BookingForm({
  mentorSlug, startAtUtc, menteeTimezone, onSuccess,
}: { mentorSlug: string; startAtUtc: string; menteeTimezone: string; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const { form, handleSubmitWithAction, action } = useHookFormAction(
    createBooking,
    zodResolver(createBookingSchema),
    {
      formProps: {
        defaultValues: {
          mentorSlug, startAtUtc, menteeTimezone,
          mentee_name: '', mentee_email: '', mentee_gender: 'female',
          purpose: '', mentee_phone: '', mentee_linkedin: '', mentee_country: '',
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success('Booked! Check your email for the calendar invite.');
          queryClient.invalidateQueries({ queryKey: ['slots', mentorSlug] });
          onSuccess();
        },
        onError: ({ error }) => toast.error(error.serverError ?? 'Failed to book.'),
      },
    },
  );

  return (
    <form onSubmit={handleSubmitWithAction} className="space-y-4">
      <input type="hidden" {...form.register('mentorSlug')} />
      <input type="hidden" {...form.register('startAtUtc')} />
      <input type="hidden" {...form.register('menteeTimezone')} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input {...form.register('mentee_name')} />
          {form.formState.errors.mentee_name && <p className="text-xs text-destructive">{form.formState.errors.mentee_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" {...form.register('mentee_email')} />
        </div>
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <select className="w-full rounded border px-2 py-1.5" {...form.register('mentee_gender')}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Career stage (optional)</Label>
          <select className="w-full rounded border px-2 py-1.5" {...form.register('mentee_career_stage')}>
            <option value="">—</option>
            <option value="student">Student</option>
            <option value="early_career">Early career</option>
            <option value="mid_career">Mid career</option>
            <option value="founder">Founder</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Country (optional)</Label>
          <Input {...form.register('mentee_country')} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone / WhatsApp (optional)</Label>
          <Input {...form.register('mentee_phone')} />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label>LinkedIn / portfolio URL (optional)</Label>
          <Input type="url" {...form.register('mentee_linkedin')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>What do you want to discuss?</Label>
        <Textarea rows={4} {...form.register('purpose')} />
        {form.formState.errors.purpose && <p className="text-xs text-destructive">{form.formState.errors.purpose.message}</p>}
      </div>

      <Button type="submit" disabled={action.isPending} className="w-full">
        {action.isPending ? 'Booking…' : 'Confirm booking'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Smoke test**

Set the Google + Resend env vars (use test creds). Boot dev. Apply → approve → onboard a mentor with a known availability window. Visit `/mentors/<slug>`, pick a slot, fill the form, submit. Verify:
- `bookings` row created with `meet_url` and `google_event_id` set
- Confirmation emails received by mentor + mentee with .ics attachment
- Google Calendar event exists in the org calendar
- Re-visiting the slot picker shows that slot greyed out

- [ ] **Step 5: Commit**

```bash
git add src/db/actions/bookings/schemas.ts src/db/actions/bookings/create.ts components/booking/booking-form.tsx
git commit -m "feat(booking): createBooking action + booking form"
```

---

## Phase 6 — Cron + scheduled emails

### Task 6.1: Cron route handler

**Files:**
- Create: `app/api/cron/booking-emails/route.ts`
- Modify: `vercel.ts`

- [ ] **Step 1: Vercel cron config**

In `vercel.ts`, add to the existing config (read the file first to merge correctly):

```ts
crons: [
  { path: '/api/cron/booking-emails', schedule: '*/5 * * * *' },
],
```

- [ ] **Step 2: Cron handler**

```ts
// app/api/cron/booking-emails/route.ts
import { NextResponse } from 'next/server';
import { db, schema } from '@/src/db';
import { and, eq, gte, isNull, lt, lte, ne } from 'drizzle-orm';
import { sendReminder24h, sendReminder1hMentee, sendReminder1hMentor, sendFeedbackRequest, sendMentorFollowup } from '@/src/lib/email/booking';
import { signBookingToken } from '@/src/lib/booking-tokens';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const now = Date.now();
  const counts = { reminder24h: 0, reminder1h: 0, feedback: 0, mentorFollowup: 0 };

  // 24h reminders
  {
    const lower = new Date(now + 23 * 3600_000);
    const upper = new Date(now + 25 * 3600_000);
    const rows = await loadDueBookings({ field: 'reminder_24h_sent_at', lower, upper });
    for (const b of rows) {
      const manageToken = signBookingToken({ bookingId: b.id, action: 'manage', expiresAt: b.start_at.getTime() });
      await sendReminder24h({
        mentorName: b.mentorName, menteeName: b.mentee_name, menteeEmail: b.mentee_email, mentorEmail: b.mentorEmail,
        startAtUtc: b.start_at, endAtUtc: b.end_at, meetUrl: b.meet_url, menteeTimezone: b.mentee_timezone,
        manageUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings/${manageToken}`,
      });
      await db.update(schema.bookings).set({ reminder_24h_sent_at: new Date() }).where(eq(schema.bookings.id, b.id));
      counts.reminder24h += 1;
    }
  }

  // 1h reminders
  {
    const lower = new Date(now + 45 * 60_000);
    const upper = new Date(now + 75 * 60_000);
    const rows = await loadDueBookings({ field: 'reminder_1h_sent_at', lower, upper });
    for (const b of rows) {
      await Promise.all([
        sendReminder1hMentee({
          mentorName: b.mentorName, menteeName: b.mentee_name, menteeEmail: b.mentee_email, mentorEmail: b.mentorEmail,
          startAtUtc: b.start_at, endAtUtc: b.end_at, meetUrl: b.meet_url, menteeTimezone: b.mentee_timezone,
        }),
        sendReminder1hMentor({
          mentorName: b.mentorName, menteeName: b.mentee_name, menteeEmail: b.mentee_email, mentorEmail: b.mentorEmail,
          startAtUtc: b.start_at, endAtUtc: b.end_at, meetUrl: b.meet_url, menteeTimezone: b.mentee_timezone,
          mentorTimezone: b.mentorTimezone,
        }),
      ]);
      await db.update(schema.bookings).set({ reminder_1h_sent_at: new Date() }).where(eq(schema.bookings.id, b.id));
      counts.reminder1h += 1;
    }
  }

  // Feedback
  {
    const rows = await db
      .select({
        id: schema.bookings.id, mentee_name: schema.bookings.mentee_name, mentee_email: schema.bookings.mentee_email,
        mentorName: schema.mentors.name,
      })
      .from(schema.bookings)
      .innerJoin(schema.mentors, eq(schema.bookings.mentor_id, schema.mentors.id))
      .where(and(
        eq(schema.bookings.status, 'confirmed'),
        isNull(schema.bookings.feedback_email_sent_at),
        lt(schema.bookings.end_at, new Date(now - 30 * 60_000)),
      ))
      .limit(100);
    for (const b of rows) {
      const token = signBookingToken({ bookingId: b.id, action: 'feedback', expiresAt: now + 14 * 24 * 3600_000 });
      await sendFeedbackRequest({
        menteeName: b.mentee_name, menteeEmail: b.mentee_email, mentorName: b.mentorName,
        feedbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings/${token}/feedback`,
      });
      await db.update(schema.bookings).set({ feedback_email_sent_at: new Date(), status: 'completed' }).where(eq(schema.bookings.id, b.id));
      counts.feedback += 1;
    }
  }

  // Mentor follow-up
  {
    const rows = await db
      .select({
        id: schema.bookings.id, mentee_name: schema.bookings.mentee_name,
        mentorName: schema.mentors.name, mentorEmail: schema.users.email,
      })
      .from(schema.bookings)
      .innerJoin(schema.mentors, eq(schema.bookings.mentor_id, schema.mentors.id))
      .innerJoin(schema.users, eq(schema.mentors.user_id, schema.users.id))
      .where(and(
        ne(schema.bookings.status, 'cancelled'),
        isNull(schema.bookings.mentor_followup_sent_at),
        lt(schema.bookings.end_at, new Date(now - 2 * 3600_000)),
      ))
      .limit(100);
    for (const b of rows) {
      if (!b.mentorEmail) continue;
      await sendMentorFollowup({ mentorName: b.mentorName, mentorEmail: b.mentorEmail, menteeName: b.mentee_name });
      await db.update(schema.bookings).set({ mentor_followup_sent_at: new Date() }).where(eq(schema.bookings.id, b.id));
      counts.mentorFollowup += 1;
    }
  }

  return NextResponse.json({ ok: true, counts });
}

async function loadDueBookings(opts: { field: 'reminder_24h_sent_at' | 'reminder_1h_sent_at'; lower: Date; upper: Date }) {
  const sentAtCol = opts.field === 'reminder_24h_sent_at' ? schema.bookings.reminder_24h_sent_at : schema.bookings.reminder_1h_sent_at;
  return db
    .select({
      id: schema.bookings.id, mentee_name: schema.bookings.mentee_name, mentee_email: schema.bookings.mentee_email,
      mentee_timezone: schema.bookings.mentee_timezone, start_at: schema.bookings.start_at, end_at: schema.bookings.end_at,
      meet_url: schema.bookings.meet_url,
      mentorName: schema.mentors.name, mentorEmail: schema.users.email,
      mentorTimezone: schema.availability.timezone,
    })
    .from(schema.bookings)
    .innerJoin(schema.mentors, eq(schema.bookings.mentor_id, schema.mentors.id))
    .innerJoin(schema.users, eq(schema.mentors.user_id, schema.users.id))
    .leftJoin(schema.availability, eq(schema.availability.mentor_id, schema.mentors.id))
    .where(and(
      eq(schema.bookings.status, 'confirmed'),
      isNull(sentAtCol),
      gte(schema.bookings.start_at, opts.lower),
      lte(schema.bookings.start_at, opts.upper),
    ))
    .limit(100);
}
```

**Note:** the `availability.timezone` left-join may return duplicates if mentor has multiple availability rows. Acceptable because we only need *a* mentor timezone for display; deduplicate in JS if it matters, or replace with `mentor_booking_settings` once we add a `timezone` column there. For this iteration the simplification is fine — flag in the rollout for later cleanup.

- [ ] **Step 3: Smoke test**

Local: hit `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/booking-emails`. Expected: `{"ok":true,"counts":{...}}` — counts should reflect any seeded bookings whose timestamps fall in the windows. Seed a booking with `start_at = now() + 24h` to test the 24h path.

- [ ] **Step 4: Commit**

```bash
git add app/api/cron/booking-emails vercel.ts
git commit -m "feat(booking): cron handler for reminders + feedback + mentor follow-up"
```

---

## Phase 7 — Cancel / reschedule

### Task 7.1: Cancel action

**Files:**
- Create: `src/db/actions/bookings/cancel.ts`

- [ ] **Step 1: Implement**

```ts
// src/db/actions/bookings/cancel.ts
'use server';

import { actionClient, ActionError } from '@/src/lib/safe-action';
import { z } from 'zod';
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import { verifyBookingToken } from '@/src/lib/booking-tokens';
import { deleteMeetEvent } from '@/src/lib/google-calendar';
import { buildBookingIcs } from '@/src/lib/ics';
import { sendBookingCancelled } from '@/src/lib/email/booking';
import { revalidatePath } from 'next/cache';

export const cancelBooking = actionClient
  .schema(z.object({ token: z.string(), reason: z.string().max(500).optional() }))
  .action(async ({ parsedInput }) => {
    const verified = verifyBookingToken(parsedInput.token);
    if (!verified.ok || verified.action !== 'manage') throw new ActionError('Invalid link');

    const [booking] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, verified.bookingId)).limit(1);
    if (!booking) throw new ActionError('Booking not found');
    if (booking.status === 'cancelled') return { ok: true };

    const [mentor] = await db.select().from(schema.mentors).where(eq(schema.mentors.id, booking.mentor_id)).limit(1);
    const [mentorUser] = mentor ? await db.select().from(schema.users).where(eq(schema.users.id, mentor.user_id)).limit(1) : [];

    try { await deleteMeetEvent(booking.google_event_id); } catch (e) { console.warn('[cancel] google delete failed', e); }

    await db.update(schema.bookings).set({
      status: 'cancelled', cancel_reason: parsedInput.reason ?? null, cancelled_at: new Date(),
    }).where(eq(schema.bookings.id, booking.id));

    if (mentor && mentorUser?.email) {
      const ics = buildBookingIcs({
        uid: booking.id, method: 'CANCEL',
        summary: `4HerFrika mentorship with ${mentor.name}`,
        description: booking.purpose,
        startAtUtc: booking.start_at, endAtUtc: booking.end_at,
        meetUrl: booking.meet_url, mentorName: mentor.name, mentorEmail: mentorUser.email,
        menteeName: booking.mentee_name, menteeEmail: booking.mentee_email,
      });
      await sendBookingCancelled({
        mentorName: mentor.name, menteeName: booking.mentee_name, menteeEmail: booking.mentee_email, mentorEmail: mentorUser.email,
        startAtUtc: booking.start_at, endAtUtc: booking.end_at, meetUrl: booking.meet_url, menteeTimezone: booking.mentee_timezone,
        reason: parsedInput.reason, icsAttachment: ics,
      });
    }

    revalidatePath(`/mentors/${mentor?.slug ?? ''}`);
    return { ok: true };
  });
```

- [ ] **Step 2: Commit**

```bash
git add src/db/actions/bookings/cancel.ts
git commit -m "feat(booking): cancel action (signed link)"
```

### Task 7.2: Reschedule action

**Files:**
- Create: `src/db/actions/bookings/reschedule.ts`

- [ ] **Step 1: Implement**

```ts
// src/db/actions/bookings/reschedule.ts
'use server';

import { actionClient, ActionError } from '@/src/lib/safe-action';
import { z } from 'zod';
import { db, schema } from '@/src/db';
import { and, eq, gte, lt, ne } from 'drizzle-orm';
import { verifyBookingToken } from '@/src/lib/booking-tokens';
import { computeSlots } from '@/src/lib/slots';
import { deleteMeetEvent, createMeetEvent } from '@/src/lib/google-calendar';
import { buildBookingIcs } from '@/src/lib/ics';
import { sendBookingConfirmationMentee, sendBookingConfirmationMentor } from '@/src/lib/email/booking';
import { signBookingToken } from '@/src/lib/booking-tokens';
import { revalidatePath } from 'next/cache';

export const rescheduleBooking = actionClient
  .schema(z.object({ token: z.string(), newStartAtUtc: z.string().datetime() }))
  .action(async ({ parsedInput }) => {
    const verified = verifyBookingToken(parsedInput.token);
    if (!verified.ok || verified.action !== 'manage') throw new ActionError('Invalid link');

    const [booking] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, verified.bookingId)).limit(1);
    if (!booking || booking.status === 'cancelled') throw new ActionError('Booking not active');

    const [mentor] = await db.select().from(schema.mentors).where(eq(schema.mentors.id, booking.mentor_id)).limit(1);
    if (!mentor) throw new ActionError('Mentor missing');
    const [mentorUser] = await db.select().from(schema.users).where(eq(schema.users.id, mentor.user_id)).limit(1);
    if (!mentorUser?.email) throw new ActionError('Mentor email missing');

    const [settings] = await db.select().from(schema.mentorBookingSettings).where(eq(schema.mentorBookingSettings.mentor_id, mentor.id)).limit(1);
    if (!settings) throw new ActionError('Settings missing');

    const newStart = new Date(parsedInput.newStartAtUtc);
    const newEnd = new Date(newStart.getTime() + settings.session_duration_minutes * 60_000);

    const dayStart = new Date(newStart); dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart); dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const templates = await db.select().from(schema.availability).where(eq(schema.availability.mentor_id, mentor.id));
    const existing = await db
      .select({ startUtc: schema.bookings.start_at, endUtc: schema.bookings.end_at })
      .from(schema.bookings)
      .where(and(
        eq(schema.bookings.mentor_id, mentor.id),
        ne(schema.bookings.status, 'cancelled'),
        ne(schema.bookings.id, booking.id),
        gte(schema.bookings.start_at, dayStart),
        lt(schema.bookings.start_at, dayEnd),
      ));
    const slots = computeSlots({ availabilityTemplates: templates, existingBookings: existing, settings, fromUtc: dayStart, toUtc: dayEnd, now: new Date() });
    if (!slots.some((s) => s.startUtc === newStart.toISOString())) throw new ActionError('That slot is not available.');

    // delete old, create new
    try { await deleteMeetEvent(booking.google_event_id); } catch (e) { console.warn('[reschedule] google delete failed', e); }
    const { eventId, meetUrl } = await createMeetEvent({
      summary: `4HerFrika: ${booking.mentee_name} ↔ ${mentor.name}`,
      description: `Purpose: ${booking.purpose}`,
      startAtUtc: newStart, endAtUtc: newEnd,
      mentorEmail: mentorUser.email, menteeEmail: booking.mentee_email,
    });

    await db.update(schema.bookings).set({
      start_at: newStart, end_at: newEnd, meet_url: meetUrl, google_event_id: eventId,
      reschedule_count: booking.reschedule_count + 1, updated_at: new Date(),
      // reset reminder flags so they re-fire for the new time
      reminder_24h_sent_at: null, reminder_1h_sent_at: null,
    }).where(eq(schema.bookings.id, booking.id));

    const manageToken = signBookingToken({ bookingId: booking.id, action: 'manage', expiresAt: newStart.getTime() });
    const ics = buildBookingIcs({
      uid: booking.id, method: 'REQUEST',
      summary: `4HerFrika mentorship with ${mentor.name}`,
      description: booking.purpose,
      startAtUtc: newStart, endAtUtc: newEnd, meetUrl,
      mentorName: mentor.name, mentorEmail: mentorUser.email,
      menteeName: booking.mentee_name, menteeEmail: booking.mentee_email,
    });

    await Promise.all([
      sendBookingConfirmationMentee({
        mentorName: mentor.name, menteeName: booking.mentee_name, menteeEmail: booking.mentee_email, mentorEmail: mentorUser.email,
        startAtUtc: newStart, endAtUtc: newEnd, meetUrl, menteeTimezone: booking.mentee_timezone,
        icsAttachment: ics, manageUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings/${manageToken}`,
        purpose: booking.purpose,
      }),
      sendBookingConfirmationMentor({
        mentorName: mentor.name, menteeName: booking.mentee_name, menteeEmail: booking.mentee_email, mentorEmail: mentorUser.email,
        startAtUtc: newStart, endAtUtc: newEnd, meetUrl,
        menteeTimezone: booking.mentee_timezone, mentorTimezone: templates[0]?.timezone ?? 'UTC',
        icsAttachment: ics, purpose: booking.purpose,
        intake: { Phone: booking.mentee_phone, LinkedIn: booking.mentee_linkedin, Country: booking.mentee_country, Gender: booking.mentee_gender, 'Career stage': booking.mentee_career_stage },
      }),
    ]);

    revalidatePath(`/mentors/${mentor.slug}`);
    return { ok: true };
  });
```

- [ ] **Step 2: Commit**

```bash
git add src/db/actions/bookings/reschedule.ts
git commit -m "feat(booking): reschedule action (signed link)"
```

### Task 7.3: Manage page

**Files:**
- Create: `app/[locale]/(website)/bookings/[token]/page.tsx`
- Create: `app/[locale]/(website)/bookings/[token]/_components/manage-actions.tsx`

- [ ] **Step 1: Server page**

```tsx
// app/[locale]/(website)/bookings/[token]/page.tsx
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import { formatInTimeZone } from 'date-fns-tz';
import { verifyBookingToken } from '@/src/lib/booking-tokens';
import { ManageActions } from './_components/manage-actions';

export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const verified = verifyBookingToken(token);
  if (!verified.ok || verified.action !== 'manage') return <ErrorBox reason={verified.ok ? 'wrong_action' : verified.reason} />;

  const [booking] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, verified.bookingId)).limit(1);
  if (!booking) return <ErrorBox reason="not_found" />;
  if (booking.status === 'cancelled') return <ErrorBox reason="already_cancelled" />;

  const [mentor] = await db.select().from(schema.mentors).where(eq(schema.mentors.id, booking.mentor_id)).limit(1);

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Manage your booking</h1>
      <div className="mt-6 rounded-lg border p-4 text-sm">
        <p><strong>With:</strong> {mentor?.name}</p>
        <p><strong>When:</strong> {formatInTimeZone(booking.start_at, booking.mentee_timezone, "EEE, MMM d, yyyy 'at' HH:mm zzz")}</p>
        <p><strong>Meet:</strong> <a className="underline" href={booking.meet_url} target="_blank">{booking.meet_url}</a></p>
      </div>
      <div className="mt-6">
        <ManageActions token={token} mentorSlug={mentor?.slug ?? ''} />
      </div>
    </main>
  );
}

function ErrorBox({ reason }: { reason: string }) {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">This booking link isn't valid</h1>
      <p className="mt-2 text-sm text-muted-foreground">Reason: {reason}</p>
    </main>
  );
}
```

- [ ] **Step 2: Manage actions**

```tsx
// app/[locale]/(website)/bookings/[token]/_components/manage-actions.tsx
'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { cancelBooking } from '@/src/db/actions/bookings/cancel';
import { rescheduleBooking } from '@/src/db/actions/bookings/reschedule';
import { SlotPicker } from '@/components/booking/slot-picker';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ManageActions({ token, mentorSlug }: { token: string; mentorSlug: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'cancel' | 'reschedule'>('idle');
  const [reason, setReason] = useState('');
  const [newStart, setNewStart] = useState<string | null>(null);

  const cancel = useAction(cancelBooking, {
    onSuccess: () => { toast.success('Cancelled'); router.refresh(); },
    onError: ({ error }) => toast.error(error.serverError ?? 'Failed'),
  });
  const reschedule = useAction(rescheduleBooking, {
    onSuccess: () => { toast.success('Rescheduled'); router.refresh(); },
    onError: ({ error }) => toast.error(error.serverError ?? 'Failed'),
  });

  if (mode === 'cancel') {
    return (
      <div className="space-y-3">
        <Textarea placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => cancel.execute({ token, reason: reason || undefined })} disabled={cancel.isPending}>Confirm cancel</Button>
          <Button variant="ghost" onClick={() => setMode('idle')}>Back</Button>
        </div>
      </div>
    );
  }

  if (mode === 'reschedule') {
    return (
      <div className="space-y-3">
        <SlotPicker mentorSlug={mentorSlug} selectedStartUtc={newStart} onSelect={setNewStart} />
        <div className="flex gap-2">
          <Button disabled={!newStart || reschedule.isPending} onClick={() => newStart && reschedule.execute({ token, newStartAtUtc: newStart })}>
            Confirm new time
          </Button>
          <Button variant="ghost" onClick={() => setMode('idle')}>Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setMode('reschedule')}>Reschedule</Button>
      <Button variant="destructive" onClick={() => setMode('cancel')}>Cancel</Button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\[locale\]/\(website\)/bookings src/db/actions/bookings/cancel.ts src/db/actions/bookings/reschedule.ts
git commit -m "feat(booking): manage page (cancel + reschedule via signed link)"
```

---

## Phase 8 — Feedback flow

### Task 8.1: Feedback schema + action

**Files:**
- Create: `src/db/actions/feedback/schemas.ts`
- Create: `src/db/actions/feedback/submit.ts`

- [ ] **Step 1: Schema**

```ts
// src/db/actions/feedback/schemas.ts
import { z } from 'zod';

export const submitFeedbackSchema = z.object({
  token: z.string(),
  call_happened: z.enum(['yes', 'mentor_no_show', 'mentee_no_show', 'rescheduled_externally']),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional().or(z.literal('')),
  testimonial_consent: z.boolean().default(false),
});
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
```

- [ ] **Step 2: Action**

```ts
// src/db/actions/feedback/submit.ts
'use server';

import { actionClient, ActionError } from '@/src/lib/safe-action';
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import { verifyBookingToken } from '@/src/lib/booking-tokens';
import { submitFeedbackSchema } from './schemas';

export const submitFeedback = actionClient
  .schema(submitFeedbackSchema)
  .action(async ({ parsedInput }) => {
    const verified = verifyBookingToken(parsedInput.token);
    if (!verified.ok || verified.action !== 'feedback') throw new ActionError('Invalid link');

    const [existing] = await db.select({ id: schema.bookingFeedback.booking_id }).from(schema.bookingFeedback).where(eq(schema.bookingFeedback.booking_id, verified.bookingId)).limit(1);
    if (existing) throw new ActionError('Feedback already submitted');

    await db.insert(schema.bookingFeedback).values({
      booking_id: verified.bookingId,
      call_happened: parsedInput.call_happened,
      rating: parsedInput.rating ?? null,
      comment: parsedInput.comment || null,
      testimonial_consent: parsedInput.testimonial_consent,
    });

    if (parsedInput.call_happened === 'mentor_no_show' || parsedInput.call_happened === 'mentee_no_show') {
      await db.update(schema.bookings).set({ status: 'no_show' }).where(eq(schema.bookings.id, verified.bookingId));
    }

    return { ok: true };
  });
```

- [ ] **Step 3: Commit**

```bash
git add src/db/actions/feedback
git commit -m "feat(feedback): submit feedback action"
```

### Task 8.2: Feedback page

**Files:**
- Create: `app/[locale]/(website)/bookings/[token]/feedback/page.tsx`
- Create: `app/[locale]/(website)/bookings/[token]/feedback/_components/feedback-form.tsx`

- [ ] **Step 1: Server page**

```tsx
// app/[locale]/(website)/bookings/[token]/feedback/page.tsx
import { db, schema } from '@/src/db';
import { eq } from 'drizzle-orm';
import { verifyBookingToken } from '@/src/lib/booking-tokens';
import { FeedbackForm } from './_components/feedback-form';

export default async function FeedbackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const verified = verifyBookingToken(token);
  if (!verified.ok || verified.action !== 'feedback') return <Error reason={verified.ok ? 'wrong_action' : verified.reason} />;

  const [existing] = await db.select().from(schema.bookingFeedback).where(eq(schema.bookingFeedback.booking_id, verified.bookingId)).limit(1);
  if (existing) return <Done />;

  const [booking] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, verified.bookingId)).limit(1);
  if (!booking) return <Error reason="not_found" />;
  const [mentor] = await db.select().from(schema.mentors).where(eq(schema.mentors.id, booking.mentor_id)).limit(1);

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold">How was your call with {mentor?.name}?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your feedback helps us match mentors better and improve the program.</p>
      <div className="mt-8">
        <FeedbackForm token={token} />
      </div>
    </main>
  );
}

function Done() { return <main className="mx-auto max-w-md py-16 text-center"><h1 className="text-xl font-semibold">Thanks — we already have your feedback.</h1></main>; }
function Error({ reason }: { reason: string }) { return <main className="mx-auto max-w-md py-16 text-center"><h1 className="text-xl font-semibold">This link isn't valid ({reason})</h1></main>; }
```

- [ ] **Step 2: Feedback form**

```tsx
// app/[locale]/(website)/bookings/[token]/feedback/_components/feedback-form.tsx
'use client';

import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { submitFeedback } from '@/src/db/actions/feedback/submit';
import { submitFeedbackSchema } from '@/src/db/actions/feedback/schemas';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function FeedbackForm({ token }: { token: string }) {
  const { form, handleSubmitWithAction, action } = useHookFormAction(
    submitFeedback,
    zodResolver(submitFeedbackSchema),
    {
      formProps: {
        defaultValues: { token, call_happened: 'yes', rating: 5, comment: '', testimonial_consent: false },
      },
      actionProps: {
        onSuccess: () => toast.success('Thanks for the feedback!'),
        onError: ({ error }) => toast.error(error.serverError ?? 'Failed'),
      },
    },
  );

  const happened = form.watch('call_happened');

  return (
    <form onSubmit={handleSubmitWithAction} className="space-y-5">
      <input type="hidden" {...form.register('token')} />

      <div className="space-y-1.5">
        <Label>Did the call happen?</Label>
        <select className="w-full rounded border px-2 py-1.5" {...form.register('call_happened')}>
          <option value="yes">Yes</option>
          <option value="mentor_no_show">No — mentor didn't show</option>
          <option value="mentee_no_show">No — I didn't make it</option>
          <option value="rescheduled_externally">We rescheduled outside the platform</option>
        </select>
      </div>

      {happened === 'yes' && (
        <div className="space-y-1.5">
          <Label>Rating (1–5)</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => form.setValue('rating', n)}
                className={`h-9 w-9 rounded border ${form.watch('rating') === n ? 'bg-primary text-primary-foreground' : ''}`}
              >{n}</button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Anything else? (optional)</Label>
        <Textarea rows={4} {...form.register('comment')} />
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" {...form.register('testimonial_consent')} className="mt-0.5" />
        <span>Allow 4HerFrika to share my comment publicly as a testimonial.</span>
      </label>

      <Button type="submit" disabled={action.isPending} className="w-full">
        {action.isPending ? 'Submitting…' : 'Submit feedback'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\[locale\]/\(website\)/bookings/\[token\]/feedback
git commit -m "feat(feedback): public feedback page"
```

---

## Phase 9 — Mentor dashboard tabs

### Task 9.1: Upcoming + past bookings views

**Files:**
- Create: `app/(dashboard)/dashboard/mentor/bookings/page.tsx`
- Create: `app/(dashboard)/dashboard/mentor/bookings/_components/bookings-tabs.tsx`

- [ ] **Step 1: Page (server)**

```tsx
// app/(dashboard)/dashboard/mentor/bookings/page.tsx
import { auth } from '@/src/auth';
import { db, schema } from '@/src/db';
import { and, asc, desc, eq, gte, lt } from 'drizzle-orm';
import { BookingsTabs } from './_components/bookings-tabs';

export default async function MentorBookingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [mentor] = await db.select().from(schema.mentors).where(eq(schema.mentors.user_id, session.user.id)).limit(1);
  if (!mentor) return <p className="p-6 text-sm text-muted-foreground">No mentor profile linked to your account.</p>;

  const now = new Date();
  const upcoming = await db.select().from(schema.bookings).where(and(eq(schema.bookings.mentor_id, mentor.id), gte(schema.bookings.start_at, now))).orderBy(asc(schema.bookings.start_at));
  const past = await db.select().from(schema.bookings).where(and(eq(schema.bookings.mentor_id, mentor.id), lt(schema.bookings.start_at, now))).orderBy(desc(schema.bookings.start_at)).limit(50);
  const feedbackRows = await db.select().from(schema.bookingFeedback);
  const feedbackByBooking = new Map(feedbackRows.map((f) => [f.booking_id, f]));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Bookings</h1>
      <div className="mt-6">
        <BookingsTabs upcoming={upcoming} past={past} feedbackByBooking={Object.fromEntries(feedbackByBooking)} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Tabs component**

```tsx
// app/(dashboard)/dashboard/mentor/bookings/_components/bookings-tabs.tsx
'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { DbBooking, DbBookingFeedback } from '@/src/db/schema/tables';
import { formatInTimeZone } from 'date-fns-tz';

export function BookingsTabs({ upcoming, past, feedbackByBooking }: {
  upcoming: DbBooking[]; past: DbBooking[]; feedbackByBooking: Record<string, DbBookingFeedback>;
}) {
  return (
    <Tabs defaultValue="upcoming">
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
        <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming"><List rows={upcoming} /></TabsContent>
      <TabsContent value="past"><List rows={past} feedbackByBooking={feedbackByBooking} showFeedback /></TabsContent>
    </Tabs>
  );
}

function List({ rows, feedbackByBooking, showFeedback }: { rows: DbBooking[]; feedbackByBooking?: Record<string, DbBookingFeedback>; showFeedback?: boolean }) {
  if (rows.length === 0) return <p className="mt-4 text-sm text-muted-foreground">Nothing here yet.</p>;
  return (
    <div className="mt-4 space-y-3">
      {rows.map((b) => {
        const fb = showFeedback ? feedbackByBooking?.[b.id] : undefined;
        return (
          <article key={b.id} className="rounded-lg border p-4">
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{b.mentee_name} <span className="text-sm font-normal text-muted-foreground">{b.mentee_email}</span></p>
                <p className="text-sm text-muted-foreground">
                  {formatInTimeZone(b.start_at, b.mentee_timezone, "EEE, MMM d, yyyy 'at' HH:mm zzz")} · {b.status}
                </p>
              </div>
              <a className="text-sm underline" href={b.meet_url} target="_blank">Meet link</a>
            </header>
            <p className="mt-3 whitespace-pre-wrap text-sm"><strong>Purpose:</strong> {b.purpose}</p>
            {(b.mentee_phone || b.mentee_linkedin || b.mentee_country || b.mentee_career_stage) && (
              <p className="mt-2 text-xs text-muted-foreground">
                {[b.mentee_country, b.mentee_career_stage, b.mentee_phone, b.mentee_linkedin].filter(Boolean).join(' · ')}
              </p>
            )}
            {fb && (
              <div className="mt-3 rounded bg-muted p-3 text-sm">
                <p><strong>Feedback:</strong> {fb.call_happened}{fb.rating ? ` · ${fb.rating}/5` : ''}</p>
                {fb.comment && <p className="mt-1 whitespace-pre-wrap">{fb.comment}</p>}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/dashboard/mentor/bookings
git commit -m "feat(mentor): upcoming + past bookings tab with feedback"
```

### Task 9.2: Mentees (CRM-lite) + stats

**Files:**
- Create: `app/(dashboard)/dashboard/mentor/mentees/page.tsx`
- Create: `app/(dashboard)/dashboard/mentor/stats/page.tsx`

- [ ] **Step 1: Mentees**

```tsx
// app/(dashboard)/dashboard/mentor/mentees/page.tsx
import { auth } from '@/src/auth';
import { db, schema } from '@/src/db';
import { desc, eq, sql } from 'drizzle-orm';
import { formatInTimeZone } from 'date-fns-tz';

export default async function MenteesPage() {
  const session = await auth();
  if (!session?.user) return null;
  const [mentor] = await db.select().from(schema.mentors).where(eq(schema.mentors.user_id, session.user.id)).limit(1);
  if (!mentor) return null;

  const rows = await db
    .select({
      email: schema.bookings.mentee_email,
      name: sql<string>`max(${schema.bookings.mentee_name})`,
      total: sql<number>`count(*)::int`,
      lastAt: sql<Date>`max(${schema.bookings.start_at})`,
    })
    .from(schema.bookings)
    .where(eq(schema.bookings.mentor_id, mentor.id))
    .groupBy(schema.bookings.mentee_email)
    .orderBy(desc(sql`max(${schema.bookings.start_at})`));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Mentees</h1>
      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <article key={r.email} className="rounded-lg border p-4 text-sm">
            <p className="font-medium">{r.name} <span className="font-normal text-muted-foreground">{r.email}</span></p>
            <p className="text-muted-foreground">{r.total} session{r.total === 1 ? '' : 's'} · last: {formatInTimeZone(new Date(r.lastAt), 'UTC', 'MMM d, yyyy')}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Stats**

```tsx
// app/(dashboard)/dashboard/mentor/stats/page.tsx
import { auth } from '@/src/auth';
import { db, schema } from '@/src/db';
import { and, eq, sql } from 'drizzle-orm';

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user) return null;
  const [mentor] = await db.select().from(schema.mentors).where(eq(schema.mentors.user_id, session.user.id)).limit(1);
  if (!mentor) return null;

  const [counts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${schema.bookings.status} = 'completed')::int`,
      noShow: sql<number>`count(*) filter (where ${schema.bookings.status} = 'no_show')::int`,
      cancelled: sql<number>`count(*) filter (where ${schema.bookings.status} = 'cancelled')::int`,
    })
    .from(schema.bookings)
    .where(eq(schema.bookings.mentor_id, mentor.id));

  const [rating] = await db
    .select({ avg: sql<number>`coalesce(avg(${schema.bookingFeedback.rating}), 0)::float` })
    .from(schema.bookingFeedback)
    .innerJoin(schema.bookings, eq(schema.bookings.id, schema.bookingFeedback.booking_id))
    .where(and(eq(schema.bookings.mentor_id, mentor.id)));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Stats</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total bookings" value={counts.total} />
        <Stat label="Completed" value={counts.completed} />
        <Stat label="No-shows" value={counts.noShow} />
        <Stat label="Cancelled" value={counts.cancelled} />
        <Stat label="Avg rating" value={rating.avg ? rating.avg.toFixed(1) : '—'} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-lg border p-4"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/dashboard/mentor/mentees app/\(dashboard\)/dashboard/mentor/stats
git commit -m "feat(mentor): mentees CRM-lite + stats"
```

---

## Phase 10 — Admin bookings overview

### Task 10.1: Admin bookings page

**Files:**
- Create: `app/(dashboard)/dashboard/admin/bookings/page.tsx`

- [ ] **Step 1: Page**

```tsx
// app/(dashboard)/dashboard/admin/bookings/page.tsx
import { db, schema } from '@/src/db';
import { desc, eq } from 'drizzle-orm';
import { formatInTimeZone } from 'date-fns-tz';
import { Badge } from '@/components/ui/badge';

export default async function AdminBookingsPage() {
  const rows = await db
    .select({
      id: schema.bookings.id,
      mentee_name: schema.bookings.mentee_name,
      mentee_email: schema.bookings.mentee_email,
      start_at: schema.bookings.start_at,
      status: schema.bookings.status,
      mentee_timezone: schema.bookings.mentee_timezone,
      mentor_name: schema.mentors.name,
    })
    .from(schema.bookings)
    .innerJoin(schema.mentors, eq(schema.bookings.mentor_id, schema.mentors.id))
    .orderBy(desc(schema.bookings.start_at))
    .limit(200);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">All bookings</h1>
      <table className="mt-6 w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground">
          <tr><th className="py-2">When</th><th>Mentor</th><th>Mentee</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="py-2">{formatInTimeZone(r.start_at, r.mentee_timezone, 'MMM d HH:mm')}</td>
              <td>{r.mentor_name}</td>
              <td>{r.mentee_name} <span className="text-xs text-muted-foreground">{r.mentee_email}</span></td>
              <td><Badge variant="secondary">{r.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/dashboard/admin/bookings
git commit -m "feat(admin): all-bookings overview table"
```

---

## Phase 11 — Wrap-up

### Task 11.1: Final typecheck + manual end-to-end smoke

- [ ] **Step 1:** `bunx tsc --noEmit` — expected clean.
- [ ] **Step 2:** `bun test` — all unit tests green (`booking-tokens.test.ts`, `slots.test.ts`).
- [ ] **Step 3:** End-to-end manual smoke (dev server):
  1. Submit application at `/en/mentors/apply` → admin sees it pending.
  2. Admin approves → applicant email shows onboarding link.
  3. Visit onboarding link → fill bio/availability → mentor goes live.
  4. Visit `/en/mentors` → see new mentor.
  5. Visit `/en/mentors/[slug]` → pick a slot → submit booking form.
  6. Verify: `bookings` row, Google Calendar event, Resend confirmation emails to both addresses with `.ics`.
  7. Open mentee's manage link → reschedule to a different slot → verify old event deleted, new one created, emails sent.
  8. Cancel a booking → verify Google event removed and cancellation emails sent.
  9. Trigger cron locally: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/booking-emails` after seeding bookings at appropriate offsets; verify each path.
  10. Submit feedback via the feedback signed link → verify row + status change for no-show cases.
  11. Visit mentor dashboard → confirm bookings/mentees/stats tabs render.

### Task 11.2: PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/mentor-booking
```

- [ ] **Step 2: Open PR**

```bash
gh pr create --title "feat: mentor booking flow" --body "$(cat <<'EOF'
## Summary
- Public mentor application + admin review + signed-link self-serve onboarding
- Calendly-style slot picker with timezone support
- Booking creation with Google Meet via Calendar API + `.ics` attachments
- Vercel Cron-driven reminders (24h, 1h), feedback request, mentor follow-up
- Signed-link cancel / reschedule / feedback (no mentee login)
- Mentor dashboard: upcoming + past + mentees CRM + stats
- Admin: applications review queue + all-bookings overview

## Test plan
- [ ] All unit tests pass (`bun test`)
- [ ] Typecheck clean (`bunx tsc --noEmit`)
- [ ] Manual smoke per Phase 11 checklist
- [ ] Verify Resend logs show all expected sends in staging
EOF
)"
```

---

## Spec coverage check

Cross-referencing `2026-05-17-mentor-booking-design.md`:

| Spec section | Implemented in |
|---|---|
| §3 Tech additions | Task 0.1 (deps), 0.3 (env), 0.4 (safe-action client) |
| §5.1 mentor.slug + §5.2 `mentor_applications` | Task 1.1 |
| §5.3 `mentor_booking_settings` | Task 1.2 |
| §5.4 `bookings` | Task 1.3 |
| §5.5 `booking_feedback` | Task 1.3 |
| §6 Slot computation | Task 4.1 (pure), 4.2 (action) |
| §7 Server actions list | Phase 2/3/4/5/7/8 — every row covered |
| §8 Booking creation write path | Task 5.4 |
| §9 Cron | Task 6.1 |
| §10 Signed-link surfaces (manage, feedback, mentor_onboard) | Tasks 0.5, 3.2, 7.3, 8.2 |
| §11 Routes & UI | Phases 2, 3, 4, 7, 8, 9, 10 |
| §12 Form & data convention | All forms use `useHookFormAction` + RHF + Zod resolver; list views use TanStack Query |
| §13 Emails | Tasks 2.1, 2.3 (applications), 5.3 (booking lifecycle), 6.1 (scheduled) |
| §14 Folder layout | Followed throughout |
| §15 Testing strategy | Unit tests for `slots.ts` + `booking-tokens.ts`; ics generator covered by smoke. Server actions covered by Phase 11 manual smoke. |
| §16 Rollout | Phase ordering matches |
