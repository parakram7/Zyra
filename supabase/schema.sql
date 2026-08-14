-- Zyra database schema.
-- Paste this whole file into the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- and click "Run" once. Safe to re-run: every statement is guarded.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Teams
-- ---------------------------------------------------------------------------
create table if not exists teams (
  id text primary key,
  name text not null,
  short_name text not null,
  crest_color_from text not null default '#22b378',
  crest_color_to text not null default '#0e8f5c',
  founded_year int,
  home_ground text,
  city text,
  category text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Players
-- ---------------------------------------------------------------------------
create table if not exists players (
  id text primary key,
  team_id text not null references teams(id) on delete cascade,
  name text not null,
  short_name text,
  shirt_number int not null,
  position text not null check (position in ('GK', 'DF', 'MF', 'FW')),
  preferred_foot text not null default 'Right' check (preferred_foot in ('Left', 'Right', 'Both')),
  date_of_birth date,
  category text,
  nationality text,
  photo_url text,
  bio text,
  created_at timestamptz not null default now()
);
create index if not exists players_team_id_idx on players(team_id);

-- ---------------------------------------------------------------------------
-- Competitions
-- ---------------------------------------------------------------------------
create table if not exists competitions (
  id text primary key,
  name text not null,
  season text not null,
  format text not null default 'league' check (format in ('league', 'cup')),
  created_at timestamptz not null default now()
);

create table if not exists competition_teams (
  competition_id text not null references competitions(id) on delete cascade,
  team_id text not null references teams(id) on delete cascade,
  primary key (competition_id, team_id)
);

-- ---------------------------------------------------------------------------
-- Matches
-- ---------------------------------------------------------------------------
create table if not exists matches (
  id text primary key,
  competition_id text references competitions(id) on delete set null,
  home_team_id text not null references teams(id),
  away_team_id text not null references teams(id),
  date timestamptz not null,
  venue text,
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED', 'LIVE', 'COMPLETED')),
  duration_minutes int not null default 70,
  half_length_minutes int not null default 35,
  current_minute int not null default 0,
  current_half text check (current_half in ('1', '2', 'HT', 'FT')),
  home_score int not null default 0,
  away_score int not null default 0,
  home_lineup jsonb,
  away_lineup jsonb,
  clock_running boolean not null default false,
  clock_started_at timestamptz,
  clock_base_minute int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists matches_competition_id_idx on matches(competition_id);

-- ---------------------------------------------------------------------------
-- Match events (goals, cards, subs, kick-off/half-time/full-time markers)
-- ---------------------------------------------------------------------------
create table if not exists match_events (
  id text primary key,
  match_id text not null references matches(id) on delete cascade,
  type text not null check (
    type in ('GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'OWN_GOAL', 'HALF_TIME', 'FULL_TIME', 'KICK_OFF')
  ),
  minute int not null,
  half int not null check (half in (1, 2)),
  team_id text references teams(id),
  player_id text references players(id),
  secondary_player_id text references players(id),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists match_events_match_id_idx on match_events(match_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Anyone can VIEW the tournament (it's a public results/stats site).
-- Only a signed-in coach/scorer can create or change data.
-- ---------------------------------------------------------------------------
alter table teams enable row level security;
alter table players enable row level security;
alter table competitions enable row level security;
alter table competition_teams enable row level security;
alter table matches enable row level security;
alter table match_events enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'teams' and policyname = 'public read') then
    create policy "public read" on teams for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'teams' and policyname = 'authenticated write') then
    create policy "authenticated write" on teams for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'players' and policyname = 'public read') then
    create policy "public read" on players for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'players' and policyname = 'authenticated write') then
    create policy "authenticated write" on players for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'competitions' and policyname = 'public read') then
    create policy "public read" on competitions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'competitions' and policyname = 'authenticated write') then
    create policy "authenticated write" on competitions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'competition_teams' and policyname = 'public read') then
    create policy "public read" on competition_teams for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'competition_teams' and policyname = 'authenticated write') then
    create policy "authenticated write" on competition_teams for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matches' and policyname = 'public read') then
    create policy "public read" on matches for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'matches' and policyname = 'authenticated write') then
    create policy "authenticated write" on matches for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'match_events' and policyname = 'public read') then
    create policy "public read" on match_events for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'match_events' and policyname = 'authenticated write') then
    create policy "authenticated write" on match_events for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Realtime — so a goal scored on one phone appears instantly on every other
-- device watching the match (coach's phone, spectators, the director's iPad).
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table matches;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'match_events'
  ) then
    alter publication supabase_realtime add table match_events;
  end if;
end $$;
