import { getSupabase } from "./client";
import {
  competitionFromRow,
  matchEventFromRow,
  matchEventToRow,
  matchFromRow,
  matchToRow,
  playerFromRow,
  playerToRow,
  teamFromRow,
  teamToRow,
} from "./mappers";
import type { Competition, Match, MatchEvent, Player, Team, TeamLineup } from "@/lib/types";

export interface RemoteData {
  teams: Team[];
  players: Player[];
  competitions: Competition[];
  matches: Match[];
}

export async function fetchAllData(): Promise<RemoteData> {
  const sb = getSupabase();
  const [teamsRes, playersRes, competitionsRes, competitionTeamsRes, matchesRes, eventsRes] =
    await Promise.all([
      sb.from("teams").select("*"),
      sb.from("players").select("*"),
      sb.from("competitions").select("*"),
      sb.from("competition_teams").select("*"),
      sb.from("matches").select("*"),
      sb.from("match_events").select("*"),
    ]);

  for (const res of [teamsRes, playersRes, competitionsRes, competitionTeamsRes, matchesRes, eventsRes]) {
    if (res.error) throw res.error;
  }

  const teams = (teamsRes.data ?? []).map(teamFromRow);
  const players = (playersRes.data ?? []).map(playerFromRow);
  const eventsByMatch = new Map<string, MatchEvent[]>();
  for (const row of eventsRes.data ?? []) {
    const event = matchEventFromRow(row);
    const list = eventsByMatch.get(event.matchId) ?? [];
    list.push(event);
    eventsByMatch.set(event.matchId, list);
  }
  const matches = (matchesRes.data ?? []).map((row) =>
    matchFromRow(row, eventsByMatch.get(row.id) ?? [])
  );

  const teamIdsByCompetition = new Map<string, string[]>();
  for (const row of competitionTeamsRes.data ?? []) {
    const list = teamIdsByCompetition.get(row.competition_id) ?? [];
    list.push(row.team_id);
    teamIdsByCompetition.set(row.competition_id, list);
  }
  const competitions = (competitionsRes.data ?? []).map((row) =>
    competitionFromRow(row, teamIdsByCompetition.get(row.id) ?? [])
  );

  return { teams, players, competitions, matches };
}

export async function insertTeam(team: Team) {
  const { error } = await getSupabase().from("teams").insert(teamToRow(team));
  if (error) throw error;
}

export async function insertPlayer(player: Player) {
  const { error } = await getSupabase().from("players").insert(playerToRow(player));
  if (error) throw error;
}

export async function insertCompetition(competition: Competition) {
  const sb = getSupabase();
  const { error } = await sb.from("competitions").insert({
    id: competition.id,
    name: competition.name,
    season: competition.season,
    format: competition.format,
    groups: competition.groups ?? null,
    knockout_pairs: competition.knockoutPairs ?? null,
  });
  if (error) throw error;
  if (competition.teamIds.length > 0) {
    const { error: linkError } = await sb
      .from("competition_teams")
      .insert(competition.teamIds.map((teamId) => ({ competition_id: competition.id, team_id: teamId })));
    if (linkError) throw linkError;
  }
}

export async function insertMatch(match: Match) {
  const { error } = await getSupabase().from("matches").insert(matchToRow(match));
  if (error) throw error;
}

export async function updateMatch(matchId: string, patch: Partial<Match>) {
  const sb = getSupabase();
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.currentHalf !== undefined) row.current_half = patch.currentHalf === null ? null : String(patch.currentHalf);
  if (patch.currentMinute !== undefined) row.current_minute = patch.currentMinute;
  if (patch.score !== undefined) {
    row.home_score = patch.score.home;
    row.away_score = patch.score.away;
  }
  if (patch.homeLineup !== undefined) row.home_lineup = patch.homeLineup;
  if (patch.awayLineup !== undefined) row.away_lineup = patch.awayLineup;
  if (patch.clockRunning !== undefined) row.clock_running = patch.clockRunning;
  if (patch.clockStartedAt !== undefined)
    row.clock_started_at = patch.clockStartedAt ? new Date(patch.clockStartedAt).toISOString() : null;
  if (patch.clockBaseMinute !== undefined) row.clock_base_minute = patch.clockBaseMinute;

  const { error } = await sb.from("matches").update(row).eq("id", matchId);
  if (error) throw error;
}

export async function setMatchLineup(matchId: string, side: "home" | "away", lineup: TeamLineup) {
  await updateMatch(matchId, side === "home" ? { homeLineup: lineup } : { awayLineup: lineup });
}

export async function insertMatchEvent(event: MatchEvent) {
  const { error } = await getSupabase().from("match_events").insert(matchEventToRow(event));
  if (error) throw error;
}

export async function updateMatchEvent(eventId: string, patch: Partial<MatchEvent>) {
  const row: Record<string, unknown> = {};
  if (patch.teamId !== undefined) row.team_id = patch.teamId;
  if (patch.playerId !== undefined) row.player_id = patch.playerId;
  if (patch.secondaryPlayerId !== undefined) row.secondary_player_id = patch.secondaryPlayerId;
  if (patch.minute !== undefined) row.minute = patch.minute;
  if (patch.half !== undefined) row.half = patch.half;

  const { error } = await getSupabase().from("match_events").update(row).eq("id", eventId);
  if (error) throw error;
}

export async function deleteMatchEvent(eventId: string) {
  const { error } = await getSupabase().from("match_events").delete().eq("id", eventId);
  if (error) throw error;
}

export async function addTeamToCompetition(competitionId: string, teamId: string) {
  const { error } = await getSupabase()
    .from("competition_teams")
    .insert({ competition_id: competitionId, team_id: teamId });
  if (error) throw error;
}

export async function deleteTeam(teamId: string) {
  const sb = getSupabase();
  // Matches reference teams without an ON DELETE CASCADE (a match needs
  // both teams to make sense), so clear out any matches involving this
  // team first — their events cascade automatically. Players and
  // competition links do cascade from the team delete itself.
  const { error: matchesError } = await sb
    .from("matches")
    .delete()
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
  if (matchesError) throw matchesError;

  const { error } = await sb.from("teams").delete().eq("id", teamId);
  if (error) throw error;
}

export async function deletePlayer(playerId: string) {
  const { error } = await getSupabase().from("players").delete().eq("id", playerId);
  if (error) throw error;
}
