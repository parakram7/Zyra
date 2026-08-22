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

// Platform-wide (every organization). Used for detail lookups, stats
// computations, and cross-org discovery — never filtered by org, so an
// opponent's team/player/competition page still resolves correctly.
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
export function useOrganizations() {
  return useZyraStore((s) => s.organizations);
}
export function useOrganization(orgId: string | null | undefined) {
  return useZyraStore((s) => s.organizations.find((o) => o.id === orgId));
}
export function useFollowedTeamIds() {
  return useZyraStore((s) => s.followedTeamIds);
}

// The organization the signed-in coach belongs to (or, when signed out /
// in local demo mode, the only organization there is). Falls back to the
// first known organization so nothing regresses for a single-org deployment.
function effectiveOrgId(s: ReturnType<typeof useZyraStore.getState>) {
  return s.currentOrgId ?? s.organizations[0]?.id ?? null;
}
export function useMyOrgId() {
  return useZyraStore(effectiveOrgId);
}

// "Your" scoped lists — what Home, the Teams/Matches/Competitions tabs, and
// the team/competition pickers in creation forms show by default.
export function useMyTeams() {
  return useZyraStore((s) => {
    const orgId = effectiveOrgId(s);
    return orgId ? s.teams.filter((t) => t.orgId === orgId) : s.teams;
  });
}
export function useMyCompetitions() {
  return useZyraStore((s) => {
    const orgId = effectiveOrgId(s);
    return orgId ? s.competitions.filter((c) => c.orgId === orgId) : s.competitions;
  });
}
export function useMyMatches() {
  return useZyraStore((s) => {
    const orgId = effectiveOrgId(s);
    return orgId ? s.matches.filter((m) => m.orgId === orgId) : s.matches;
  });
}

// Teams (from any organization) that my org's teams have actually played
// against — CricHeroes' "Opponents" sub-tab.
export function useOpponentTeams() {
  return useZyraStore((s) => {
    const orgId = effectiveOrgId(s);
    if (!orgId) return [];
    const myTeamIds = new Set(s.teams.filter((t) => t.orgId === orgId).map((t) => t.id));
    const opponentIds = new Set<string>();
    for (const m of s.matches) {
      if (myTeamIds.has(m.homeTeamId) && !myTeamIds.has(m.awayTeamId)) opponentIds.add(m.awayTeamId);
      if (myTeamIds.has(m.awayTeamId) && !myTeamIds.has(m.homeTeamId)) opponentIds.add(m.homeTeamId);
    }
    return s.teams.filter((t) => opponentIds.has(t.id));
  });
}

// Teams the signed-in user follows — CricHeroes' "Following" sub-tab.
export function useFollowingTeams() {
  return useZyraStore((s) => s.teams.filter((t) => s.followedTeamIds.includes(t.id)));
}
export function useIsFollowingTeam(teamId: string | null | undefined) {
  return useZyraStore((s) => !!teamId && s.followedTeamIds.includes(teamId));
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
