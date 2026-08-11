// Pure derivation functions: all statistics are computed from raw match
// events rather than stored redundantly. Nothing here mutates state.

import type {
  Match,
  MatchEvent,
  Player,
  PlayerMatchStats,
  Team,
  TeamStats,
} from "./types";

export function emptyPlayerStats(): PlayerMatchStats {
  return {
    appearances: 0,
    starts: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    minutesPlayed: 0,
    ownGoals: 0,
  };
}

function wasInSquad(match: Match, playerId: string): "starter" | "sub" | null {
  for (const lineup of [match.homeLineup, match.awayLineup]) {
    if (!lineup) continue;
    if (lineup.startingXI.some((s) => s.playerId === playerId)) return "starter";
    if (lineup.substitutes.includes(playerId)) return "sub";
  }
  return null;
}

function minutesForPlayer(match: Match, playerId: string): number {
  const squadStatus = wasInSquad(match, playerId);
  if (!squadStatus) return 0;

  const matchLength =
    match.status === "COMPLETED" ? match.durationMinutes : match.currentMinute;

  const subOnEvent = match.events.find(
    (e) => e.type === "SUBSTITUTION" && e.secondaryPlayerId === playerId
  );
  const subOffEvent = match.events.find(
    (e) => e.type === "SUBSTITUTION" && e.playerId === playerId
  );
  const redCardEvent = match.events.find(
    (e) => e.type === "RED_CARD" && e.playerId === playerId
  );

  if (squadStatus === "starter") {
    let end = matchLength;
    if (subOffEvent) end = Math.min(end, subOffEvent.minute);
    if (redCardEvent) end = Math.min(end, redCardEvent.minute);
    return Math.max(0, end);
  }

  // came on as substitute
  if (subOnEvent) {
    let end = matchLength;
    if (redCardEvent) end = Math.min(end, redCardEvent.minute);
    return Math.max(0, end - subOnEvent.minute);
  }

  return 0;
}

export function computePlayerStatsForMatch(
  match: Match,
  playerId: string
): PlayerMatchStats {
  const stats = emptyPlayerStats();
  const squadStatus = wasInSquad(match, playerId);
  if (!squadStatus) return stats;

  if (squadStatus === "starter") {
    stats.starts = 1;
    stats.appearances = 1;
  } else {
    const cameOn = match.events.some(
      (e) => e.type === "SUBSTITUTION" && e.secondaryPlayerId === playerId
    );
    if (cameOn) stats.appearances = 1;
  }

  for (const e of match.events) {
    if (e.type === "GOAL" && e.playerId === playerId) stats.goals++;
    if (e.type === "GOAL" && e.secondaryPlayerId === playerId) stats.assists++;
    if (e.type === "OWN_GOAL" && e.playerId === playerId) stats.ownGoals++;
    if (e.type === "YELLOW_CARD" && e.playerId === playerId) stats.yellowCards++;
    if (e.type === "RED_CARD" && e.playerId === playerId) stats.redCards++;
  }

  stats.minutesPlayed = minutesForPlayer(match, playerId);
  return stats;
}

export function computePlayerCareerStats(
  matches: Match[],
  playerId: string
): PlayerMatchStats {
  const total = emptyPlayerStats();
  for (const match of matches) {
    if (match.status === "SCHEDULED") continue;
    const s = computePlayerStatsForMatch(match, playerId);
    total.appearances += s.appearances;
    total.starts += s.starts;
    total.goals += s.goals;
    total.assists += s.assists;
    total.yellowCards += s.yellowCards;
    total.redCards += s.redCards;
    total.minutesPlayed += s.minutesPlayed;
    total.ownGoals += s.ownGoals;
  }
  return total;
}

export function emptyTeamStats(): TeamStats {
  return { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
}

export function computeTeamStats(matches: Match[], teamId: string): TeamStats {
  const stats = emptyTeamStats();
  for (const match of matches) {
    if (match.status !== "COMPLETED") continue;
    const isHome = match.homeTeamId === teamId;
    const isAway = match.awayTeamId === teamId;
    if (!isHome && !isAway) continue;

    const gf = isHome ? match.score.home : match.score.away;
    const ga = isHome ? match.score.away : match.score.home;

    stats.played++;
    stats.goalsFor += gf;
    stats.goalsAgainst += ga;
    if (gf > ga) {
      stats.wins++;
      stats.points += 3;
    } else if (gf === ga) {
      stats.draws++;
      stats.points += 1;
    } else {
      stats.losses++;
    }
  }
  return stats;
}

export interface StandingsRow extends TeamStats {
  team: Team;
  goalDifference: number;
}

export function computeStandings(
  matches: Match[],
  teams: Team[],
  teamIds: string[]
): StandingsRow[] {
  const rows = teamIds.map((id) => {
    const team = teams.find((t) => t.id === id)!;
    const stats = computeTeamStats(matches, id);
    return { team, ...stats, goalDifference: stats.goalsFor - stats.goalsAgainst };
  });
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.name.localeCompare(b.team.name);
  });
  return rows;
}

export interface LeaderboardRow {
  player: Player;
  team: Team | undefined;
  value: number;
}

export function computeTopScorers(
  matches: Match[],
  players: Player[],
  teams: Team[],
  limit = 10
): LeaderboardRow[] {
  return leaderboard(matches, players, teams, "goals", limit);
}

export function computeTopAssists(
  matches: Match[],
  players: Player[],
  teams: Team[],
  limit = 10
): LeaderboardRow[] {
  return leaderboard(matches, players, teams, "assists", limit);
}

function leaderboard(
  matches: Match[],
  players: Player[],
  teams: Team[],
  key: "goals" | "assists",
  limit: number
): LeaderboardRow[] {
  const rows: LeaderboardRow[] = players.map((player) => {
    const stats = computePlayerCareerStats(matches, player.id);
    return {
      player,
      team: teams.find((t) => t.id === player.teamId),
      value: stats[key],
    };
  });
  return rows
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function getCurrentSquad(
  match: Match,
  teamId: string
): { onPitch: string[]; bench: string[] } {
  const isHome = match.homeTeamId === teamId;
  const lineup = isHome ? match.homeLineup : match.awayLineup;
  if (!lineup) return { onPitch: [], bench: [] };

  const onPitch = new Set(lineup.startingXI.map((s) => s.playerId));
  const bench = new Set(lineup.substitutes);

  for (const e of match.events) {
    if (e.type === "SUBSTITUTION" && e.teamId === teamId) {
      if (e.playerId && onPitch.has(e.playerId)) onPitch.delete(e.playerId);
      if (e.secondaryPlayerId) {
        onPitch.add(e.secondaryPlayerId);
        bench.delete(e.secondaryPlayerId);
      }
    }
    if (e.type === "RED_CARD" && e.teamId === teamId && e.playerId) {
      onPitch.delete(e.playerId);
    }
  }

  return { onPitch: Array.from(onPitch), bench: Array.from(bench) };
}

export function sortedTimeline(events: MatchEvent[]): MatchEvent[] {
  return [...events].sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute;
    return a.createdAt - b.createdAt;
  });
}
