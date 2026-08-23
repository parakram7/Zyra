# RescueLink

**Surplus food. Faster coordination. More meals rescued.**

A pilot coordination platform for volunteer food-rescue networks, built for the Robin Hood Army Jaipur
chapter's pilot. It coordinates the full lifecycle of a surplus-food call — from a donor's submission,
through volunteer claiming/joining, transport arrangement, a field food assessment, collection, and
distribution — with live updates, an admin control centre, and pilot analytics.

This is not a UI mockup. Authentication, the database schema, row-level security, real-time updates, and
every workflow button described below are wired up end to end against Supabase.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + hand-authored shadcn/ui-style primitives (`src/components/ui`)
- Supabase (Postgres, Auth, Realtime, Storage)
- React Hook Form + Zod
- Recharts (Analytics / Pilot Insights)

## 1. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL**, **anon public key**, and **service_role key**.
3. Copy `.env.example` to `.env.local` and fill in those three values (plus `NEXT_PUBLIC_SITE_URL` if
   deploying somewhere other than `http://localhost:3000`).

```bash
cp .env.example .env.local
```

## 2. Apply the database schema

The SQL lives in `supabase/migrations/*.sql`, applied in filename order, and covers every table, enum,
index, trigger, RPC function, and RLS policy the app uses (see `supabase/migrations/0001_schema.sql` for
the full table list, or the "Database" section below).

**Option A — Supabase CLI** (recommended if you have Docker / the CLI installed):

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

**Option B — SQL editor**: open the Supabase dashboard's SQL editor and run each file in
`supabase/migrations/` in order (0001 → 0006), then run `supabase/seed.sql`.

Either way, also run `supabase/seed.sql` once — it seeds the chapter, Jaipur zones, trusted transport
contacts, and saved distribution locations that the rest of the app expects to exist.

## 3. Install dependencies and seed demo data

```bash
npm install
npm run seed:demo
```

`npm run seed:demo` (`scripts/seed-demo.mjs`) uses your **service role key** to create 15 volunteer
accounts + 1 chapter coordinator, 10 realistic donors, and 13 rescues spanning almost every status in the
workflow (including one fully completed end-to-end scenario — the "Wedding surplus, Vaishali Nagar" demo
described in the brief). It's safe to re-run.

**Demo logins** (password for every seeded account: `Demo@1234`):

| Role | Email |
|---|---|
| Chapter Coordinator (admin) | `coordinator@rescuelink.demo` |
| Volunteer (Rescue Lead persona) | `parakram@rescuelink.demo` |
| Volunteer (pending verification) | `divya@rescuelink.demo` |
| Volunteer (suspended) | `karan@rescuelink.demo` |

13 more volunteer accounts follow the same `firstname@rescuelink.demo` pattern (see `scripts/seed-demo.mjs`
for the full roster).

## 4. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`. Try:

- **`/donate`** — the public, no-login donor submission wizard.
- **`/track/<token>`** — the link shown after submitting (donor-safe status tracker).
- **`/login`** → sign in as `parakram@rescuelink.demo` to see the volunteer dashboard, claim/join rescues,
  arrange transport, run a field food assessment, record distribution, and complete a rescue.
- **`/login`** → sign in as `coordinator@rescuelink.demo` for the admin Control Centre, Analytics, Pilot
  Insights, Volunteer/Donor directories, Transport Partners, Distribution Locations, and Settings.

## Project structure

```
src/
  app/                     Next.js App Router routes
    (app)/                 Authenticated shell (sidebar + bottom nav) — dashboard, rescues,
                            transport, notifications, history, profile, admin/*
    donate/                Public donor submission wizard
    track/[token]/         Public tracking page
    login, signup, ...     Auth
  components/
    ui/                    Hand-authored shadcn/ui-style primitives
    rescue/                Rescue cards, status/urgency badges, the full detail-page workflow UI
    donate/                Donor wizard steps
    admin/                 Control centre, directories, settings widgets
    analytics/              Recharts wrappers
  lib/
    database.types.ts      Hand-mirrored Supabase schema types
    schemas/                Zod validation (auth, rescue submission)
    analytics.ts            Pure aggregation functions for Analytics / Pilot Insights
    status.ts, urgency.ts   Status metadata + deadline urgency logic
    integrations/           Adapter interfaces for Maps / Porter / WhatsApp (see below)
supabase/
  migrations/*.sql          Schema, RLS policies, and transactional RPC functions
  seed.sql                  Chapter, zones, transport contacts, distribution locations
scripts/seed-demo.mjs       Creates demo auth users + a full set of demo rescues
```

## Database

Everything is modelled directly in Postgres (`supabase/migrations/`):

- **Core tables**: `chapters`, `zones`, `profiles`, `donor_profiles`, `rescues`,
  `rescue_food_items`, `rescue_assignments`, `rescue_status_history`, `rescue_activity`,
  `rescue_photos`, `transport_requests`, `transport_offers`, `transport_contacts`,
  `food_assessments`, `distribution_records`, `saved_distribution_locations`, `rescue_feedback`,
  `notifications`, `admin_actions`.
- **Row Level Security** is enabled on every table (`0004_rls.sql`). Public donor tracking never touches
  the `rescues` table directly — it goes through a `SECURITY DEFINER` function
  (`get_tracking_status`) that returns only donor-safe columns (no phone numbers, no internal notes,
  no trust flags).
- **Workflow correctness lives in the database**, not just the UI: claiming a rescue
  (`claim_rescue`), joining, confirming a donor, advancing status, recording a field assessment,
  recording distribution, and completing a rescue are all `SECURITY DEFINER` RPC functions that check
  permissions, use row locking to make claiming race-safe (`SELECT ... FOR UPDATE` + a partial unique
  index so two volunteers can never both become Rescue Lead), and write to
  `rescue_status_history` / `rescue_activity` automatically via triggers.
- Chapter-level settings (meals-per-kg assumption, pickup warning window, transport cost assumptions,
  the field-assessment disclaimer) live in the `chapters` table and are editable from **Admin → Settings**
  — nothing operational is hardcoded in the frontend.

## What's real vs. placeholder

Per the brief's instruction not to fake integrations, a few things are intentionally left as clearly
labelled placeholders behind adapter interfaces (`src/lib/integrations/`), ready to swap in a real
provider without touching the rest of the app:

- **Maps**: pickup locations link out to a Google Maps search URL built from the typed address (or
  lat/long, if "Use current location" was used). Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` /
  `NEXT_PUBLIC_MAPBOX_TOKEN` later to upgrade to an embedded map.
- **Transport pricing**: shown as an "indicative estimate only", computed from configurable chapter
  settings (base charge + per-km + load-size multiplier) — never presented as a live quote.
- **"Open Porter"**: deep-links to Porter's own site with the address pre-filled. No Porter API is called
  or scraped.
- **WhatsApp**: uses `wa.me` deep links with a pre-filled message. No WhatsApp Business API is wired up
  yet (see `src/lib/integrations/messaging.ts`).
- **Push notifications / SMS**: not implemented — the in-app notification centre (`notifications` table +
  Supabase Realtime) is the current channel.

## Testing what you built

- `npm run lint` — ESLint.
- `npx tsc --noEmit` — TypeScript.
- `npm run build` — production build.
- Manually exercise the critical path end to end: submit at `/donate` → log in as a volunteer → claim →
  join with a second demo account → offer transport → confirm donor → advance through en route / at
  pickup / inspect food / collect / record distribution / complete → check `/admin/analytics` and
  `/admin/pilot-insights` update.

## Multi-chapter readiness

Every volunteer, rescue, zone, and admin action is scoped by `chapter_id`. Adding a second chapter (Delhi,
Mumbai, ...) is a matter of inserting a new `chapters` row and `zones` — no schema changes required. RLS
policies already scope reads to the caller's own chapter.
