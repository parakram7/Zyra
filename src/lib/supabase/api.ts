import { getSupabase } from "./client";
import {
  competitionFromRow,
  matchEventFromRow,
  matchEventToRow,
  matchFromRow,
  matchToRow,
  organizationFromRow,
  organizationToRow,
  playerFromRow,
  playerProfileFromRow,
  playerProfileToRow,
  playerToRow,
  teamFromRow,
  teamToRow,
} from "./mappers";
import type { Competition, Match, MatchEvent, Organization, Player, PlayerProfile, Team, TeamLineup } from "@/lib/types";

export interface CompetitionAdmin {
  competitionId: string;
  userId: string;
}

export interface RemoteData {
  organizations: Organization[];
  teams: Team[];
  players: Player[];
  playerProfiles: PlayerProfile[];
  competitions: Competition[];
  competitionAdmins: CompetitionAdmin[];
  matches: Match[];
  followedTeamIds: string[];
}

export async function fetchAllData(userId: string | null): Promise<RemoteData> {
  const sb = getSupabase();
  const [
    orgsRes,
    teamsRes,
    playersRes,
    profilesRes,
    competitionsRes,
    competitionTeamsRes,
    competitionAdminsRes,
    matchesRes,
    eventsRes,
    followsRes,
  ] = await Promise.all([
    sb.from("organizations").select("*"),
    sb.from("teams").select("*"),
    sb.from("players").select("*"),
    sb.from("player_profiles").select("*"),
    sb.from("competitions").select("*"),
    sb.from("competition_teams").select("*"),
    sb.from("competition_admins").select("*"),
    sb.from("matches").select("*"),
    sb.from("match_events").select("*"),
    userId ? sb.from("team_follows").select("team_id").eq("user_id", userId) : Promise.resolve({ data: [], error: null }),
  ]);

  for (const res of [
    orgsRes,
    teamsRes,
    playersRes,
    profilesRes,
    competitionsRes,
    competitionTeamsRes,
    competitionAdminsRes,
    matchesRes,
    eventsRes,
    followsRes,
  ]) {
    if (res.error) throw res.error;
  }

  const organizations = (orgsRes.data ?? []).map(organizationFromRow);
  const teams = (teamsRes.data ?? []).map(teamFromRow);
  const players = (playersRes.data ?? []).map(playerFromRow);
  const playerProfiles = (profilesRes.data ?? []).map(playerProfileFromRow);
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
  const pendingTeamIdsByCompetition = new Map<string, string[]>();
  for (const row of competitionTeamsRes.data ?? []) {
    const target = row.status === "approved" ? teamIdsByCompetition : pendingTeamIdsByCompetition;
    const list = target.get(row.competition_id) ?? [];
    list.push(row.team_id);
    target.set(row.competition_id, list);
  }
  const competitions = (competitionsRes.data ?? []).map((row) =>
    competitionFromRow(row, teamIdsByCompetition.get(row.id) ?? [], pendingTeamIdsByCompetition.get(row.id) ?? [])
  );

  const competitionAdmins = ((competitionAdminsRes.data ?? []) as { competition_id: string; user_id: string }[]).map(
    (r) => ({ competitionId: r.competition_id, userId: r.user_id })
  );

  const followedTeamIds = ((followsRes.data ?? []) as { team_id: string }[]).map((r) => r.team_id);

  return {
    organizations,
    teams,
    players,
    playerProfiles,
    competitions,
    competitionAdmins,
    matches,
    followedTeamIds,
  };
}

export async function fetchMyOrgId(userId: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .limit(1);
  if (error) throw error;
  return (data?.[0] as { org_id: string } | undefined)?.org_id ?? null;
}

export async function insertOrganization(org: Organization) {
  const { error } = await getSupabase().from("organizations").insert(organizationToRow(org));
  if (error) throw error;
}

export async function joinAsFoundingMember(orgId: string, userId: string) {
  const { error } = await getSupabase()
    .from("org_members")
    .insert({ org_id: orgId, user_id: userId, role: "admin" });
  if (error) throw error;
}

export async function followTeam(userId: string, teamId: string) {
  const { error } = await getSupabase().from("team_follows").insert({ user_id: userId, team_id: teamId });
  if (error) throw error;
}

export async function unfollowTeam(userId: string, teamId: string) {
  const { error } = await getSupabase()
    .from("team_follows")
    .delete()
    .eq("user_id", userId)
    .eq("team_id", teamId);
  if (error) throw error;
}

export async function insertTeam(team: Team) {
  const { error } = await getSupabase().from("teams").insert(teamToRow(team));
  if (error) throw error;
}

export async function insertPlayer(player: Player) {
  const { error } = await getSupabase().from("players").insert(playerToRow(player));
  if (error) throw error;
}

export async function insertCompetitionRow(competition: Competition) {
  const { error } = await getSupabase().from("competitions").insert({
    id: competition.id,
    org_id: competition.orgId,
    name: competition.name,
    season: competition.season,
    format: competition.format,
    groups: competition.groups ?? null,
    knockout_pairs: competition.knockoutPairs ?? null,
  });
  if (error) throw error;
}

export async function linkTeamsToCompetition(competitionId: string, teamIds: string[]) {
  if (teamIds.length === 0) return;
  const { error } = await getSupabase()
    .from("competition_teams")
    .insert(teamIds.map((teamId) => ({ competition_id: competitionId, team_id: teamId, status: "approved" })));
  if (error) throw error;
}

// Convenience wrapper for the common (org-owned) case, where team links
// can be inserted in the same breath as the competition itself.
export async function insertCompetition(competition: Competition) {
  await insertCompetitionRow(competition);
  await linkTeamsToCompetition(competition.id, competition.teamIds);
}

export async function becomeCompetitionHead(competitionId: string, userId: string) {
  const { error } = await getSupabase()
    .from("competition_admins")
    .insert({ competition_id: competitionId, user_id: userId, role: "head" });
  if (error) throw error;
}

export async function requestTeamJoinCompetition(competitionId: string, teamId: string, userId: string) {
  const { error } = await getSupabase()
    .from("competition_teams")
    .insert({ competition_id: competitionId, team_id: teamId, status: "pending", requested_by: userId });
  if (error) throw error;
}

export async function setCompetitionTeamStatus(
  competitionId: string,
  teamId: string,
  status: "approved" | "rejected"
) {
  const { error } = await getSupabase()
    .from("competition_teams")
    .update({ status })
    .eq("competition_id", competitionId)
    .eq("team_id", teamId);
  if (error) throw error;
}

export async function insertPlayerProfile(profile: PlayerProfile, createdBy: string | null) {
  const { error } = await getSupabase().from("player_profiles").insert(playerProfileToRow(profile, createdBy));
  if (error) throw error;
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
    .insert({ competition_id: competitionId, team_id: teamId, status: "approved" });
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
