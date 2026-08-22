// Converts between Supabase's snake_case row shape and the app's camelCase
// domain types (lib/types.ts). Keeping this in one place means the rest of
// the app never has to know the database's column naming.

import type {
  Competition,
  LineupSlot,
  Match,
  MatchEvent,
  MatchHalf,
  Organization,
  Player,
  Team,
  TeamLineup,
} from "@/lib/types";

export function organizationFromRow(row: any): Organization {
  return {
    id: row.id,
    name: row.name,
    city: row.city ?? "",
    logoUrl: row.logo_url ?? undefined,
  };
}

export function organizationToRow(org: Organization) {
  return {
    id: org.id,
    name: org.name,
    city: org.city,
    logo_url: org.logoUrl ?? null,
  };
}

export function teamFromRow(row: any): Team {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    shortName: row.short_name,
    crestColorFrom: row.crest_color_from,
    crestColorTo: row.crest_color_to,
    foundedYear: row.founded_year,
    homeGround: row.home_ground,
    city: row.city,
    category: row.category,
  };
}

export function teamToRow(team: Team) {
  return {
    id: team.id,
    org_id: team.orgId,
    name: team.name,
    short_name: team.shortName,
    crest_color_from: team.crestColorFrom,
    crest_color_to: team.crestColorTo,
    founded_year: team.foundedYear,
    home_ground: team.homeGround,
    city: team.city,
    category: team.category,
  };
}

export function playerFromRow(row: any): Player {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    shortName: row.short_name ?? undefined,
    shirtNumber: row.shirt_number,
    position: row.position,
    preferredFoot: row.preferred_foot,
    dateOfBirth: row.date_of_birth,
    category: row.category,
    nationality: row.nationality,
    photoUrl: row.photo_url,
    bio: row.bio ?? undefined,
  };
}

export function playerToRow(player: Player) {
  return {
    id: player.id,
    team_id: player.teamId,
    name: player.name,
    short_name: player.shortName ?? null,
    shirt_number: player.shirtNumber,
    position: player.position,
    preferred_foot: player.preferredFoot,
    date_of_birth: player.dateOfBirth,
    category: player.category,
    nationality: player.nationality,
    photo_url: player.photoUrl ?? null,
    bio: player.bio ?? null,
  };
}

export function competitionFromRow(row: any, teamIds: string[]): Competition {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    season: row.season,
    format: row.format,
    teamIds,
    groups: row.groups ?? undefined,
    knockoutPairs: row.knockout_pairs ?? undefined,
  };
}

export function matchEventFromRow(row: any): MatchEvent {
  return {
    id: row.id,
    matchId: row.match_id,
    type: row.type,
    minute: row.minute,
    half: row.half,
    teamId: row.team_id,
    playerId: row.player_id,
    secondaryPlayerId: row.secondary_player_id,
    createdAt: new Date(row.created_at).getTime(),
    note: row.note ?? undefined,
  };
}

export function matchEventToRow(event: MatchEvent) {
  return {
    id: event.id,
    match_id: event.matchId,
    type: event.type,
    minute: event.minute,
    half: event.half,
    team_id: event.teamId,
    player_id: event.playerId,
    secondary_player_id: event.secondaryPlayerId,
    note: event.note ?? null,
  };
}

function halfFromRow(value: string | null): MatchHalf | null {
  if (value === "1") return 1;
  if (value === "2") return 2;
  if (value === "HT") return "HT";
  if (value === "FT") return "FT";
  return null;
}

function halfToRow(value: MatchHalf | null): string | null {
  if (value === null) return null;
  return String(value);
}

export function matchFromRow(row: any, events: MatchEvent[]): Match {
  return {
    id: row.id,
    orgId: row.org_id,
    competitionId: row.competition_id,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    date: row.date,
    venue: row.venue ?? "",
    status: row.status,
    durationMinutes: row.duration_minutes,
    halfLengthMinutes: row.half_length_minutes,
    currentMinute: row.current_minute,
    currentHalf: halfFromRow(row.current_half) as Match["currentHalf"],
    score: { home: row.home_score, away: row.away_score },
    homeLineup: (row.home_lineup as TeamLineup | null) ?? null,
    awayLineup: (row.away_lineup as TeamLineup | null) ?? null,
    events,
    clockRunning: row.clock_running,
    clockStartedAt: row.clock_started_at ? new Date(row.clock_started_at).getTime() : null,
    clockBaseMinute: row.clock_base_minute,
  };
}

export function matchToRow(match: Match) {
  return {
    id: match.id,
    org_id: match.orgId,
    competition_id: match.competitionId,
    home_team_id: match.homeTeamId,
    away_team_id: match.awayTeamId,
    date: match.date,
    venue: match.venue,
    status: match.status,
    duration_minutes: match.durationMinutes,
    half_length_minutes: match.halfLengthMinutes,
    current_minute: match.currentMinute,
    current_half: halfToRow(match.currentHalf),
    home_score: match.score.home,
    away_score: match.score.away,
    home_lineup: match.homeLineup,
    away_lineup: match.awayLineup,
    clock_running: match.clockRunning,
    clock_started_at: match.clockStartedAt ? new Date(match.clockStartedAt).toISOString() : null,
    clock_base_minute: match.clockBaseMinute,
  };
}

export type { LineupSlot };
