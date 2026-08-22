-- Zyra database schema.
-- Paste this whole file into the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- and click "Run" once. Safe to re-run: every statement is guarded.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Organizations — a school or club. Every team/competition/match belongs to
-- one. This is what makes Zyra multi-tenant: anyone can register their own
-- school and it's fully separate from everyone else's data.
-- ---------------------------------------------------------------------------
create table if not exists organizations (
  id text primary key,
  name text not null,
  city text,
  logo_url text,
  created_at timestamptz not null default now()
);

-- Who can manage which organization's data.
create table if not exists org_members (
  org_id text not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

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
alter table teams add column if not exists org_id text references organizations(id);
create index if not exists teams_org_id_idx on teams(org_id);

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
  format text not null default 'league' check (format in ('league', 'cup', 'groups')),
  groups jsonb, -- [{ label: "A", teamIds: [...] }, ...] — only set when format = 'groups'
  knockout_pairs jsonb, -- [{ home: { group, rank }, away: { group, rank } }, ...] — first knockout round draw
  created_at timestamptz not null default now()
);

-- Re-running this file against a database created before the "groups" format
-- existed: widen the format check and add the two new columns.
alter table competitions add column if not exists groups jsonb;
alter table competitions add column if not exists knockout_pairs jsonb;
alter table competitions drop constraint if exists competitions_format_check;
alter table competitions add constraint competitions_format_check check (format in ('league', 'cup', 'groups'));
alter table competitions add column if not exists org_id text references organizations(id);
create index if not exists competitions_org_id_idx on competitions(org_id);

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
alter table matches add column if not exists org_id text references organizations(id);
create index if not exists matches_org_id_idx on matches(org_id);

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
-- Following — a signed-in user following a team (any team, any org). Powers
-- the "Following" tab.
-- ---------------------------------------------------------------------------
create table if not exists team_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id text not null references teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, team_id)
);

-- ---------------------------------------------------------------------------
-- One-time backfill: if there's existing data with no organization yet
-- (i.e. this database predates multi-tenancy), create a single organization
-- for it and make every existing user an admin of it, so nothing already
-- live loses its owner. Rename it from the Supabase dashboard afterwards.
-- ---------------------------------------------------------------------------
do $$
declare
  default_org_id text;
begin
  if exists (select 1 from teams where org_id is null) then
    default_org_id := 'org-' || substr(md5(random()::text), 1, 10);
    insert into organizations (id, name, city) values (default_org_id, 'My School', '');
    update teams set org_id = default_org_id where org_id is null;
    update competitions set org_id = default_org_id where org_id is null;
    update matches set org_id = default_org_id where org_id is null;
    insert into org_members (org_id, user_id, role)
      select default_org_id, id, 'admin' from auth.users
      on conflict do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Anyone can VIEW every organization's teams/competitions/matches (it's a
-- public discovery platform, like browsing tournaments in a cricket app).
-- Only a signed-in member of an organization can create or change that
-- organization's data.
-- ---------------------------------------------------------------------------
alter table organizations enable row level security;
alter table org_members enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table competitions enable row level security;
alter table competition_teams enable row level security;
alter table matches enable row level security;
alter table match_events enable row level security;
alter table team_follows enable row level security;

do $$
begin
  -- organizations: public read, any signed-in user may create one, only its
  -- own members may edit/delete it.
  if not exists (select 1 from pg_policies where tablename = 'organizations' and policyname = 'public read') then
    create policy "public read" on organizations for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'organizations' and policyname = 'authenticated create') then
    create policy "authenticated create" on organizations for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'organizations' and policyname = 'members update') then
    create policy "members update" on organizations for update
      using (exists (select 1 from org_members where org_id = organizations.id and user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'organizations' and policyname = 'members delete') then
    create policy "members delete" on organizations for delete
      using (exists (select 1 from org_members where org_id = organizations.id and user_id = auth.uid()));
  end if;

  -- org_members: you can always see your own memberships (so the app can
  -- work out which org(s) you belong to); you may add yourself as the
  -- founding member of a brand new org, but not join an org that already
  -- has members (no invite system yet).
  if not exists (select 1 from pg_policies where tablename = 'org_members' and policyname = 'read own membership') then
    create policy "read own membership" on org_members for select using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'org_members' and policyname = 'found new org') then
    create policy "found new org" on org_members for insert
      with check (
        user_id = auth.uid()
        and not exists (select 1 from org_members om2 where om2.org_id = org_members.org_id)
      );
  end if;
end $$;

drop policy if exists "authenticated write" on teams;
drop policy if exists "authenticated write" on players;
drop policy if exists "authenticated write" on competitions;
drop policy if exists "authenticated write" on competition_teams;
drop policy if exists "authenticated write" on matches;
drop policy if exists "authenticated write" on match_events;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'teams' and policyname = 'public read') then
    create policy "public read" on teams for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'teams' and policyname = 'org members write') then
    create policy "org members write" on teams for all
      using (org_id is not null and exists (select 1 from org_members where org_id = teams.org_id and user_id = auth.uid()))
      with check (org_id is not null and exists (select 1 from org_members where org_id = teams.org_id and user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'players' and policyname = 'public read') then
    create policy "public read" on players for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'players' and policyname = 'org members write') then
    create policy "org members write" on players for all
      using (exists (
        select 1 from teams t join org_members om on om.org_id = t.org_id
        where t.id = players.team_id and om.user_id = auth.uid()
      ))
      with check (exists (
        select 1 from teams t join org_members om on om.org_id = t.org_id
        where t.id = players.team_id and om.user_id = auth.uid()
      ));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'competitions' and policyname = 'public read') then
    create policy "public read" on competitions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'competitions' and policyname = 'org members write') then
    create policy "org members write" on competitions for all
      using (org_id is not null and exists (select 1 from org_members where org_id = competitions.org_id and user_id = auth.uid()))
      with check (org_id is not null and exists (select 1 from org_members where org_id = competitions.org_id and user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'competition_teams' and policyname = 'public read') then
    create policy "public read" on competition_teams for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'competition_teams' and policyname = 'org members write') then
    create policy "org members write" on competition_teams for all
      using (exists (
        select 1 from competitions c join org_members om on om.org_id = c.org_id
        where c.id = competition_teams.competition_id and om.user_id = auth.uid()
      ))
      with check (exists (
        select 1 from competitions c join org_members om on om.org_id = c.org_id
        where c.id = competition_teams.competition_id and om.user_id = auth.uid()
      ));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matches' and policyname = 'public read') then
    create policy "public read" on matches for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'matches' and policyname = 'org members write') then
    create policy "org members write" on matches for all
      using (org_id is not null and exists (select 1 from org_members where org_id = matches.org_id and user_id = auth.uid()))
      with check (org_id is not null and exists (select 1 from org_members where org_id = matches.org_id and user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'match_events' and policyname = 'public read') then
    create policy "public read" on match_events for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'match_events' and policyname = 'org members write') then
    create policy "org members write" on match_events for all
      using (exists (
        select 1 from matches m join org_members om on om.org_id = m.org_id
        where m.id = match_events.match_id and om.user_id = auth.uid()
      ))
      with check (exists (
        select 1 from matches m join org_members om on om.org_id = m.org_id
        where m.id = match_events.match_id and om.user_id = auth.uid()
      ));
  end if;

  -- team_follows: anyone can see who follows what (used for follower
  -- counts); a user may only create/remove their own follow rows.
  if not exists (select 1 from pg_policies where tablename = 'team_follows' and policyname = 'public read') then
    create policy "public read" on team_follows for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'team_follows' and policyname = 'own follows write') then
    create policy "own follows write" on team_follows for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
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
