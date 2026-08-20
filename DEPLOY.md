# Deploying Zyra with a real backend

Without any setup, Zyra runs in **local demo mode** — sample data lives only
in your browser's local storage, with nothing shared between devices. This
guide connects it to a real, shared Supabase database and puts it on the
public internet via Vercel.

Total time: about 10 minutes, almost all of it clicking through two free
signup flows.

## 1. Create the database (Supabase)

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is enough).
2. Click **New Project**. Pick any name/region/password (the password is
   only for direct Postgres access — the app doesn't need it).
3. Once the project finishes provisioning, open the **SQL Editor** tab.
4. Paste in the entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
   and click **Run**. This creates all the tables.
5. New query → paste in the entire contents of
   [`supabase/seed.sql`](./supabase/seed.sql) → **Run**. This loads the
   sample teams, players, competition and matches (safe to skip if you'd
   rather start empty).
6. Go to **Settings → API**. Copy two values:
   - **Project URL**
   - **`anon` `public` key**

   Both are safe to use in a public app — they're not secret keys.

## 2. Configure the app

Create a file named `.env.local` in the project root (copy
`.env.local.example`) and fill in the two values from step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server. The app now reads and writes to Supabase instead of
local storage — scores logged on one device appear live on every other
device watching the same match.

### Creating a coach/scorer account

Anyone can view the app without an account. To create or score matches,
open **Profile → Sign in → Create one** and sign up with an email and
password. (Supabase sends a confirmation email by default — you can turn
that off in Supabase under **Authentication → Providers → Email → Confirm
email** if you'd rather skip it for a small trusted group of coaches.)

## 3. Deploy it publicly (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.
2. **Add New… → Project**, then import the `parakram7/zyra` repository.
3. Vercel auto-detects Next.js — no build configuration needed.
4. Before deploying, add the same two environment variables from step 1
   under **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. A couple of minutes later you'll have a public
   `https://your-project.vercel.app` URL that works from any phone, tablet,
   or laptop — no install required.

From then on, every push to the branch Vercel is watching redeploys
automatically.

## What's still manual for v1

- Every signed-in account can edit every team/match — there's no
  "this coach can only score their own match" restriction yet.
- New teams/players for the real tournament can now be added straight from
  the app: "Teams" tab → "New" to add a team, then "Player" on a team's page
  to add someone to its squad. Sign in first — these are coach-only actions.
  Delete Team / the trash icon next to a player removes demo data the same
  way.
- Competitions can also be created in-app: "Competitions" tab → "New".
  Choose "League" for a single table, or "Groups + Knockout" for a
  UCL-style tournament — pick the number of groups and teams per group,
  assign teams to each (existing or brand new), then set the knockout draw
  (e.g. Group A's 1st vs Group B's 2nd) with editable dropdowns. This adds
  two columns (`groups`, `knockout_pairs`) to the `competitions` table —
  re-run the latest `supabase/schema.sql` in the Supabase SQL editor once
  to pick them up (it's safe to re-run; every statement is guarded).
