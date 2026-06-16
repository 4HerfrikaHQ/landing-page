# 4HerFrika — Mentor & Booking UI Redesign Plan

> Status: **Draft for review**
> Scope: Public booking flow, mentor onboarding/apply, mentor dashboard, admin dashboard.
> Out of scope (already polished, used as the reference): blog, home, landing marketing sections.

---

## 1. Why this work

The booking flow, mentor flow, and the dashboards are functional but visually plain — bare `border + bg-white` cards, text-only stats, no filtering, weak empty/loading states. Meanwhile the **blog and home pages already define a polished design language** (gradient heroes, motion, rounded hover cards, pill filters). 4HerFrika is used by **non-technical women**, so the booking/mentor surfaces — the parts that actually convert and retain — should feel at least as considered as the marketing pages.

This plan does **not** introduce a new design system or new framework. It extracts what already works on the blog and applies it consistently, fixes one structural bug (nested navbar), and adds the filtering the dashboards are missing.

### Principles

1. **Reuse, don't reinvent.** Lean on the existing tokens, `Button`, `BlogCard`-style cards, and the `motion/` components (`FadeIn`, `StaggerContainer`, `HoverCard`).
2. **One accent.** Pink `primary-500` (#ec008c) is the only accent. Deep blue `secondary-500` and the surface tints (`surface-pink`, `surface-indigo`, `surface-teal`) carry sections.
3. **Calm for non-tech users.** Generous whitespace, plain sentence-case copy, obvious primary action per screen, friendly empty states with a next step — never a blank page.
4. **Every list gets filters + a real empty state.** Use the blog's `nuqs` (`useQueryState`) pill pattern so filters are URL-shareable and consistent.
5. **No regressions.** Server actions, auth, zod schemas, timezone logic all stay. This is a presentation-layer pass.

---

## 2. Design language (the reference, codified)

Pulled from `blog/`, `components/blog-card.tsx`, `components/featured-story.tsx`, `components/motion/*`, and `globals.css`.

### Tokens (already defined — use them, stop hardcoding hex)
| Purpose | Token |
|---|---|
| Accent / CTA / active | `primary-500` `#ec008c` |
| Accent deep | `secondary-500` `#03065c` |
| Section tints | `surface-pink #fff4fc`, `surface-indigo #edeeff`, `surface-teal #d4eaea` |
| Text | `foreground #171717`, `muted-foreground #555` |
| Borders | `border #e5e5e5` |
| Radius | `--radius 0.625rem` → use `rounded-lg/xl/2xl/3xl` scale |

> Cleanup nit: dashboard code uses `bg-gray-50`, `text-gray-400/500/900`, `border-red-300` ad hoc. Migrate to tokens (`bg-muted`, `text-muted-foreground`, `text-destructive`) as we touch each file so theming stays consistent.

### Motion (already built in `components/motion/`)
- `FadeIn` — section entry (direction + 0.6s).
- `StaggerContainer` + `StaggerItem` — lists/grids cascade in.
- `HoverCard` — `y: -6` lift + soft shadow on hover for any clickable card.
- `AnimatedCounter` — for dashboard stat numbers.
- All already respect `prefers-reduced-motion`.

### Card recipe (the look to repeat)
```
rounded-2xl bg-white border border-border/60
shadow-[0_2px_12px_rgba(0,0,0,0.06)]
hover (clickable): -translate-y-1 + shadow-[0_10px_40px_rgba(0,0,0,0.10)]
image: rounded-[14px] overflow-hidden, group-hover:scale-105 (duration-500)
```

### Filter recipe (the blog pattern — `blog-section.tsx`)
Pill buttons backed by `useQueryState`:
```
active:   bg-primary-500 text-white
inactive: bg-white border border-[#E0E0E0] text-[#636363]
          hover:border-primary-500 hover:text-primary-500
rounded-full, transition-colors
```

---

## 3. Shared primitives to build first

Build these once so the rest of the work is assembly, not bespoke styling. (Per repo convention: global only because 3+ pages reuse them; no barrel files — import source directly.)

| Component | Path | Purpose |
|---|---|---|
| `PageHeader` | `components/dashboard/page-header.tsx` | Title + subtitle + optional action slot. Consistent spacing across every dashboard page. |
| `StatCard` | `components/dashboard/stat-card.tsx` | Icon chip + `AnimatedCounter` value + label + optional delta/“view all” link. Replaces the bare stat divs on overview/stats. |
| `DataCard` | `components/dashboard/data-card.tsx` | The card recipe above; wraps booking/mentee rows. |
| `EmptyState` | `components/dashboard/empty-state.tsx` | Icon + headline + one-line subtext + optional CTA. Kills every “Nothing here yet.” |
| `FilterBar` | `components/dashboard/filter-bar.tsx` | Search input + pill-group(s), `nuqs`-driven, responsive wrap. |
| `StatusBadge` | promote existing admin badge → `components/dashboard/status-badge.tsx` | Single source of truth for booking/application status colors. |
| `SkeletonRow` / `SkeletonCard` | `components/dashboard/skeleton.tsx` | Replace “Loading…” text with shape-matched skeletons. |

Icons: keep `lucide-react` (already the dep) but use it **deliberately** — a small icon chip per stat/section, consistent stroke. No new icon library (avoids a dependency change).

---

## 4. Structural fix — the nested navbar (do this first, it’s a bug)

**Problem:** `app/(dashboard)/dashboard/mentor/layout.tsx` renders `MentorHeader` (full 6-item nav). Then `bookings/page.tsx`, `mentees/page.tsx`, `stats/page.tsx` *each also* render `MentorSubpageHeader` — a second sticky bar with a partial, slightly-wrong nav (its “Profile” link points to `/dashboard/mentor`). Result: two stacked navbars on those three pages.

**Fix:**
1. Delete `app/(dashboard)/dashboard/mentor/_components/mentor-subpage-header.tsx`.
2. Remove its usage + the extra `min-h-screen` wrapper from `bookings`, `mentees`, `stats` pages (the layout already provides background + header).
3. Redesign the single `MentorHeader` into the shared dashboard shell (below).

### Dashboard shell redesign (`MentorHeader` + `AdminHeader`)
Both currently are an 11px-tall text-only bar. Upgrade to one shared shell:
- Brand mark (4HerFrika wordmark/logo) on the left, linking home.
- Nav items with a **small icon + label**, clear `data-active` pink underline/pill (token already supports `a[data-active="true"]`).
- **Mobile:** the current nav has no mobile menu — add a slide-over (`Sheet`, already in the codebase) triggered by a hamburger.
- Right: avatar + name, sign-out in a small menu rather than a bare text button.
- Admin keeps its breadcrumb but gains the same shell + mobile nav.

---

## 5. Public booking flow

### 5.1 Careers Corner — mentor directory (`careers-corner/page.tsx`)
Already the most decorated public page, but discovery is weak.
- **Add a `FilterBar`:** search by name/role + pill filters for **availability** (“Available this week”), **career focus / topic tags**, maybe **language**. URL-driven via `nuqs`.
- Standardize mentor cards on the `DataCard`/`BlogCard` recipe (consistent image ratio, hover lift, `UserRound` fallback in a tinted chip not a flat gray block).
- Featured mentor: reuse `featured-story.tsx` treatment (gradient overlay + badge).
- Empty/῾no match’ state via `EmptyState` (“No mentors match that filter yet — clear filters”).

### 5.2 Mentor profile + booking (`careers-corner/[slug]/page.tsx`)
Currently a bare `max-w-3xl` text column.
- Two-column hero on desktop: left = avatar (larger, ring/tinted backdrop), name, role, LinkedIn, topic tags; right = a sticky **“Book a 30-min call”** card.
- Bio in a readable measure (~65ch), section dividers.
- `FadeIn` on sections; breadcrumb back to directory (currently a dead-end).

### 5.3 Slot picker (`components/booking/slot-picker.tsx`)
Functionally good; visually a flat 7-col grid.
- Day columns as soft cards; **today** highlighted; selected slot uses `primary-500` (already does) but add hover/active press feedback.
- Replace “Loading availability…” with a **skeleton week grid**.
- Empty day shows a muted “—” chip, and a whole-week-empty state (“No slots this week — try next week →”).
- Keep timezone selector; restyle as a proper `Select` with a globe icon.

### 5.4 Booking form sheet (`careers-corner/[slug]/_components/booking-form.tsx`)
Works, looks like a raw form (native `<select>`s).
- Group into labeled sections: **About you** / **Your context** / **What to discuss**.
- Swap native selects for the shadcn `Select` for visual consistency.
- Sticky footer with the primary button; show selected mentor + time as a summary chip at top.
- Inline validation already exists (zod) — style errors with the `destructive` token, not raw red.

### 5.5 Manage booking (`bookings/[token]/page.tsx`) & feedback
- Turn the info box into a proper **booking summary card** (mentor avatar, when, Meet link as a button, status badge).
- `ManageActions`: reschedule/cancel as clearly distinct buttons; **confirmation step for cancel** (destructive styling). Reschedule embeds the restyled slot picker.
- Invalid/cancelled token states get the friendly `EmptyState` treatment with a route back to the mentor.
- Feedback form: show the booking it’s about (date + mentor), make the 1–5 rating tactile (larger tap targets, hover fill), confident copy (no exclamation marks).

---

## 6. Mentor onboarding & application (the plainest forms)

### 6.1 Apply (`careers-corner/apply` + `become-a-mentor-form.tsx`)
- Wrap in a centered card on a `surface-pink` gradient, brand mark at top.
- Section the fields (Contact / About you / Motivation), helper text under each.
- Polished submit + success state (a real “Application received — what happens next” panel, not just a toast).

### 6.2 Onboarding (`onboard/[token]` + forms + avatar upload)
- Make “1. Availability / 2. Profile” a real **stepper** with completion ticks.
- Avatar upload component is already nice — keep it, give it more prominence at the top.
- “Already active” → success panel with a button to view public profile.

---

## 7. Mentor dashboard

Shared: shell from §4, `PageHeader` on every page, `bg-muted` page background.

| Page | Redesign |
|---|---|
| **Overview** (`mentor/page.tsx`) | `StatCard` grid with icons + `AnimatedCounter`. “Next sessions” as `DataCard` list with avatars + Meet buttons. Friendly empty state with a link to set availability. |
| **Profile** (`profile-form.tsx`) | Card layout, sectioned fields, avatar prominent, inline “saved” confirmation. |
| **Availability** (`availability-editor.tsx`) | Keep validation logic. Restyle day blocks as cards, slots as removable chips, clearer add-slot affordance, a small **weekly preview** so mentors see their shape. |
| **Bookings** (`bookings-tabs.tsx`) | Beyond Upcoming/Past tabs, add a `FilterBar`: search mentee, filter by **status** and **career stage**. Booking rows → `DataCard` with mentee avatar, status badge, expandable details, feedback shown inline for past. |
| **Mentees** (`mentees/page.tsx`) | Card grid with avatar, session count, last session; search + sort (most sessions / most recent). Empty state. |
| **Stats** (`stats/page.tsx`) | `StatCard` grid + at least one simple **chart** (bookings over time, status breakdown) and a **time-range pill filter** (30d / 90d / all). See open question on chart lib. |

---

## 8. Admin dashboard — “more interesting filters”

Shared shell + `PageHeader` + `FilterBar` everywhere. This is where the filtering gap is biggest.

| Page | Filters / sort to add | Visual |
|---|---|---|
| **Overview** (`admin/page.tsx`) | — | `StatCard` grid with icons + counters; add a **recent activity** feed (latest bookings/applications) and an attention card (pending applications, no-shows this week). |
| **Mentors** (`admin/mentors`) | Status (all/active/inactive) ✓ exists + search ✓. **Add:** sort (name / joined / bookings), Featured filter, “has photo / missing photo”, joined date range. Optional bulk activate. | Keep table; add sortable headers, column for booking count, sticky toolbar. |
| **Bookings** (`admin/bookings`) | **Currently zero filters.** Add: status, mentor (combobox), date range, search mentee. Replace hard 200-row cap with **pagination** (or load-more) and surface the count. | Table + status badges; row click → detail slide-over. |
| **Applications** (`admin/applications`) | Tabs exist (pending/approved/rejected). Add search by name/email + date sort. | Cards already decent — standardize badge + actions, add empty states. |
| **Admins** (`admin/admins`) | Add search. | Minor: consistent table + confirm-delete dialog. |

All filters use the `nuqs` URL pattern so admin views are shareable/bookmarkable. Where data is server-fetched (bookings), filters become `searchParams` passed to the query — same pattern the mentors page already uses for `q`/`status`.

---

## 9. States checklist (apply to every screen touched)

- [ ] **Loading** → skeleton matching the layout (not spinner/text).
- [ ] **Empty** → `EmptyState` with one clear next action.
- [ ] **Error** → inline, `destructive` token, plain copy (“Couldn’t load bookings. Retry.”).
- [ ] **Hover/active** on every clickable element (lift / press).
- [ ] **Focus ring** visible (token `--ring` is already pink).
- [ ] **Mobile** verified (dashboards currently have no mobile nav).
- [ ] **Back navigation** present (several flows dead-end today).

---

## 10. Suggested phasing (each phase shippable on its own)

1. **Foundations** — shared primitives (§3) + nested-navbar fix + dashboard shell (§4). *Highest impact, unblocks everything.*
2. **Mentor dashboard** (§7) — internal users feel it immediately, low public risk.
3. **Admin dashboard + filters** (§8).
4. **Public booking flow** (§5) — most visible, do once the component vocabulary is proven.
5. **Onboarding & apply forms** (§6).
6. **States + mobile + a11y polish pass** (§9) across everything.

---

## 11. Decisions (resolved)

1. **Charts:** use **`recharts`** for mentor stats + admin overview analytics.
2. **Mentor tags/career-focus:** schema has **no** such field → **drop tag-based directory filters** (§5.1). Instead surface richer existing data: a neater mentor profile, and stronger **booking filters** (status, career stage, date, search) on mentor + admin. Directory filtering stays to name/role search + availability only.
3. **Typeface:** keep body font; optional single heading font is a nice-to-have, not blocking.
4. **Admin bookings:** add status/mentor/date/search filters now; pagination acceptable as load-more.

---

*Once you’ve marked this up, I’ll turn the approved sections into a step-by-step implementation plan and start with Phase 1.*
