"use client";

// Client-side "database" for the Zyra prototype. Everything here is
// intentionally shaped like a repository layer (createMatch, addGoalEvent,
// etc.) so the internals can later be swapped for real Supabase calls
// without changing any component that consumes `useZyraStore`.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  teams as seedTeams,
  players as seedPlayers,
  competitions as seedCompetitions,
  matches as seedMatches,
} from "./seed-data";
import type {
  Competition,
  Match,
  MatchEvent,
  MatchEventType,
  Player,
  Team,
  TeamLineup,
} from "./types";

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function recalcScore(match: Match): Match["score"] {
  let home = 0;
  let away = 0;
  for (const e of match.events) {
    if (e.type === "GOAL") {
      if (e.teamId === match.homeTeamId) home++;
      else if (e.teamId === match.awayTeamId) away++;
    }
    if (e.type === "OWN_GOAL") {
      // event.teamId is the team OF the player who scored the own goal;
      // the goal is credited to the opposing side.
      if (e.teamId === match.homeTeamId) away++;
      else if (e.teamId === match.awayTeamId) home++;
    }
  }
  return { home, away };
}

export interface NewMatchInput {
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  venue: string;
  durationMinutes: number;
  competitionId: string | null;
}

export interface GoalInput {
  teamId: string;
  scorerId: string;
  assistId: string | null;
  minute: number;
}

export interface CardInput {
  teamId: string;
  playerId: string;
  cardType: "YELLOW_CARD" | "RED_CARD";
  minute: number;
}

export interface SubstitutionInput {
  teamId: string;
  offId: string;
  onId: string;
  minute: number;
}

export interface OwnGoalInput {
  teamId: string; // the team OF the player who scored the own goal
  playerId: string;
  minute: number;
}

interface ZyraState {
  teams: Team[];
  players: Player[];
  competitions: Competition[];
  matches: Match[];
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  createMatch: (input: NewMatchInput) => string;
  setLineup: (matchId: string, side: "home" | "away", lineup: TeamLineup) => void;
  startMatch: (matchId: string) => void;
  pauseClock: (matchId: string) => void;
  resumeClock: (matchId: string) => void;
  goToHalfTime: (matchId: string) => void;
  startSecondHalf: (matchId: string) => void;
  endMatch: (matchId: string) => void;

  addGoalEvent: (matchId: string, input: GoalInput) => void;
  addCardEvent: (matchId: string, input: CardInput) => void;
  addSubstitutionEvent: (matchId: string, input: SubstitutionInput) => void;
  addOwnGoalEvent: (matchId: string, input: OwnGoalInput) => void;
  undoLastEvent: (matchId: string) => void;
  deleteEvent: (matchId: string, eventId: string) => void;
  updateEvent: (matchId: string, eventId: string, changes: Partial<MatchEvent>) => void;

  resetDemoData: () => void;
}

function updateMatch(matches: Match[], matchId: string, fn: (m: Match) => Match): Match[] {
  return matches.map((m) => (m.id === matchId ? fn(m) : m));
}

function pushEvent(match: Match, partial: Omit<MatchEvent, "id" | "matchId" | "createdAt">): Match {
  const event: MatchEvent = {
    ...partial,
    id: id("evt"),
    matchId: match.id,
    createdAt: Date.now(),
  };
  const next = { ...match, events: [...match.events, event] };
  next.score = recalcScore(next);
  return next;
}

const UNDOABLE_TYPES: MatchEventType[] = [
  "GOAL",
  "YELLOW_CARD",
  "RED_CARD",
  "SUBSTITUTION",
  "OWN_GOAL",
];

export const useZyraStore = create<ZyraState>()(
  persist(
    (set, get) => ({
      teams: seedTeams,
      players: seedPlayers,
      competitions: seedCompetitions,
      matches: seedMatches,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      createMatch: (input) => {
        const newId = id("match");
        const match: Match = {
          id: newId,
          competitionId: input.competitionId,
          homeTeamId: input.homeTeamId,
          awayTeamId: input.awayTeamId,
          date: input.date,
          venue: input.venue,
          status: "SCHEDULED",
          durationMinutes: input.durationMinutes,
          halfLengthMinutes: Math.round(input.durationMinutes / 2),
          currentMinute: 0,
          currentHalf: null,
          score: { home: 0, away: 0 },
          homeLineup: null,
          awayLineup: null,
          events: [],
          clockRunning: false,
          clockStartedAt: null,
          clockBaseMinute: 0,
        };
        set({ matches: [...get().matches, match] });
        return newId;
      },

      setLineup: (matchId, side, lineup) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => ({
            ...m,
            ...(side === "home" ? { homeLineup: lineup } : { awayLineup: lineup }),
          })),
        }),

      startMatch: (matchId) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => {
            const started: Match = {
              ...m,
              status: "LIVE",
              currentHalf: 1,
              currentMinute: 0,
              clockRunning: true,
              clockStartedAt: Date.now(),
              clockBaseMinute: 0,
            };
            return pushEvent(started, {
              type: "KICK_OFF",
              minute: 0,
              half: 1,
              teamId: null,
              playerId: null,
              secondaryPlayerId: null,
            });
          }),
        }),

      pauseClock: (matchId) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => {
            if (!m.clockRunning || !m.clockStartedAt) return m;
            const elapsedMin = Math.floor((Date.now() - m.clockStartedAt) / 60000);
            return {
              ...m,
              clockRunning: false,
              clockBaseMinute: m.clockBaseMinute + elapsedMin,
              clockStartedAt: null,
            };
          }),
        }),

      resumeClock: (matchId) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => ({
            ...m,
            clockRunning: true,
            clockStartedAt: Date.now(),
          })),
        }),

      goToHalfTime: (matchId) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => {
            const paused: Match = {
              ...m,
              currentHalf: "HT",
              clockRunning: false,
              clockStartedAt: null,
              clockBaseMinute: m.halfLengthMinutes,
            };
            return pushEvent(paused, {
              type: "HALF_TIME",
              minute: m.halfLengthMinutes,
              half: 1,
              teamId: null,
              playerId: null,
              secondaryPlayerId: null,
            });
          }),
        }),

      startSecondHalf: (matchId) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => ({
            ...m,
            currentHalf: 2,
            clockRunning: true,
            clockStartedAt: Date.now(),
            clockBaseMinute: m.halfLengthMinutes,
          })),
        }),

      endMatch: (matchId) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => {
            const finished: Match = {
              ...m,
              status: "COMPLETED",
              currentHalf: "FT",
              currentMinute: m.durationMinutes,
              clockRunning: false,
              clockStartedAt: null,
              clockBaseMinute: m.durationMinutes,
            };
            return pushEvent(finished, {
              type: "FULL_TIME",
              minute: m.durationMinutes,
              half: 2,
              teamId: null,
              playerId: null,
              secondaryPlayerId: null,
            });
          }),
        }),

      addGoalEvent: (matchId, input) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) =>
            pushEvent(m, {
              type: "GOAL",
              minute: input.minute,
              half: m.currentHalf === 2 ? 2 : 1,
              teamId: input.teamId,
              playerId: input.scorerId,
              secondaryPlayerId: input.assistId,
            })
          ),
        }),

      addCardEvent: (matchId, input) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) =>
            pushEvent(m, {
              type: input.cardType,
              minute: input.minute,
              half: m.currentHalf === 2 ? 2 : 1,
              teamId: input.teamId,
              playerId: input.playerId,
              secondaryPlayerId: null,
            })
          ),
        }),

      addSubstitutionEvent: (matchId, input) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) =>
            pushEvent(m, {
              type: "SUBSTITUTION",
              minute: input.minute,
              half: m.currentHalf === 2 ? 2 : 1,
              teamId: input.teamId,
              playerId: input.offId,
              secondaryPlayerId: input.onId,
            })
          ),
        }),

      addOwnGoalEvent: (matchId, input) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) =>
            pushEvent(m, {
              type: "OWN_GOAL",
              minute: input.minute,
              half: m.currentHalf === 2 ? 2 : 1,
              teamId: input.teamId,
              playerId: input.playerId,
              secondaryPlayerId: null,
            })
          ),
        }),

      undoLastEvent: (matchId) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => {
            const idx = [...m.events]
              .reverse()
              .findIndex((e) => UNDOABLE_TYPES.includes(e.type));
            if (idx === -1) return m;
            const realIdx = m.events.length - 1 - idx;
            const events = m.events.filter((_, i) => i !== realIdx);
            const next = { ...m, events };
            next.score = recalcScore(next);
            return next;
          }),
        }),

      deleteEvent: (matchId, eventId) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => {
            const next = { ...m, events: m.events.filter((e) => e.id !== eventId) };
            next.score = recalcScore(next);
            return next;
          }),
        }),

      updateEvent: (matchId, eventId, changes) =>
        set({
          matches: updateMatch(get().matches, matchId, (m) => {
            const events = m.events.map((e) => (e.id === eventId ? { ...e, ...changes } : e));
            const next = { ...m, events };
            next.score = recalcScore(next);
            return next;
          }),
        }),

      resetDemoData: () =>
        set({
          teams: seedTeams,
          players: seedPlayers,
          competitions: seedCompetitions,
          matches: seedMatches,
        }),
    }),
    {
      name: "zyra-store-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        teams: state.teams,
        players: state.players,
        competitions: state.competitions,
        matches: state.matches,
      }),
    }
  )
);
