import { useEffect, useState } from "react";
import { useZyraStore } from "./store";
import { getLiveMinute } from "./match-clock";
import type { Match } from "./types";

export function useLiveMinute(match: Match | undefined) {
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!match || !match.clockRunning) return;
    const interval = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [match?.clockRunning, match?.clockStartedAt, match?.id]);
  return match ? getLiveMinute(match) : 0;
}

export function useTeams() {
  return useZyraStore((s) => s.teams);
}
export function usePlayers() {
  return useZyraStore((s) => s.players);
}
export function useMatches() {
  return useZyraStore((s) => s.matches);
}
export function useCompetitions() {
  return useZyraStore((s) => s.competitions);
}
export function useTeam(teamId: string | null | undefined) {
  return useZyraStore((s) => s.teams.find((t) => t.id === teamId));
}
export function usePlayer(playerId: string | null | undefined) {
  return useZyraStore((s) => s.players.find((p) => p.id === playerId));
}
export function useMatch(matchId: string | undefined) {
  return useZyraStore((s) => s.matches.find((m) => m.id === matchId));
}
export function useTeamPlayers(teamId: string | null | undefined) {
  return useZyraStore((s) => s.players.filter((p) => p.teamId === teamId));
}
export function useTeamMatches(teamId: string | null | undefined) {
  return useZyraStore((s) =>
    s.matches.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId)
  );
}
