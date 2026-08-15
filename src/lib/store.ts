"use client";

// Client-side data layer for Zyra. Every mutation is exposed as a
// repository-style action (createMatch, addGoalEvent, etc.) so components
// never touch storage directly.
//
// Two backends, chosen automatically at runtime:
//  - Supabase configured (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY set): the
//    Postgres database is the source of truth. Every action below updates
//    local state immediately (so the UI never waits on the network) and
//    fires the matching Supabase write in the background. A realtime
//    subscription merges changes made by other devices/browsers back in.
//  - Not configured: falls back to the original local-only demo mode
//    (seed data + localStorage), unchanged from the prototype.

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
import { isSupabaseConfigured, getSupabase } from "./supabase/client";
import { fetchAllData } from "./supabase/api";
import * as remote from "./supabase/api";
import { matchEventFromRow, matchFromRow } from "./supabase/mappers";

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

export interface NewTeamInput {
  name: string;
  shortName: string;
  crestColorFrom: string;
  crestColorTo: string;
  foundedYear: number;
  homeGround: string;
  city: string;
  category: string;
  competitionId: string | null;
}

export interface NewPlayerInput {
  teamId: string;
  name: string;
  shortName?: string;
  shirtNumber: number;
  position: Player["position"];
  preferredFoot: Player["preferredFoot"];
  dateOfBirth: string;
  category: string;
  nationality: string;
}

interface ZyraState {
  teams: Team[];
  players: Player[];
  competitions: Competition[];
  matches: Match[];
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  loadFromSupabase: () => Promise<void>;
  subscribeRealtime: () => () => void;

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

  addTeam: (input: NewTeamInput) => string;
  deleteTeam: (teamId: string) => void;
  addPlayer: (input: NewPlayerInput) => string;
  deletePlayer: (playerId: string) => void;

  resetDemoData: () => void;
}

function applyToMatch(matches: Match[], matchId: string, fn: (m: Match) => Match): Match[] {
  return matches.map((m) => (m.id === matchId ? fn(m) : m));
}

function pushEvent(
  match: Match,
  partial: Omit<MatchEvent, "id" | "matchId" | "createdAt">
): { match: Match; event: MatchEvent } {
  const event: MatchEvent = {
    ...partial,
    id: id("evt"),
    matchId: match.id,
    createdAt: Date.now(),
  };
  const next = { ...match, events: [...match.events, event] };
  next.score = recalcScore(next);
  return { match: next, event };
}

function syncMatch(match: Match) {
  if (!isSupabaseConfigured()) return;
  remote.updateMatch(match.id, match).catch((err) => console.error("Zyra: failed to sync match", err));
}

function syncEvent(event: MatchEvent) {
  if (!isSupabaseConfigured()) return;
  remote.insertMatchEvent(event).catch((err) => console.error("Zyra: failed to sync event", err));
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

      loadFromSupabase: async () => {
        const data = await fetchAllData();
        set({
          teams: data.teams,
          players: data.players,
          competitions: data.competitions,
          matches: data.matches,
        });
      },

      subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => {};
        const sb = getSupabase();

        const channel = sb
          .channel("zyra-realtime")
          .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, (payload) => {
            if (payload.eventType === "DELETE") {
              const oldId = (payload.old as { id?: string }).id;
              if (!oldId) return;
              set({ matches: get().matches.filter((m) => m.id !== oldId) });
              return;
            }
            const row = payload.new as Record<string, unknown>;
            const existing = get().matches.find((m) => m.id === row.id);
            const updated = matchFromRow(row, existing?.events ?? []);
            const has = get().matches.some((m) => m.id === updated.id);
            set({
              matches: has
                ? applyToMatch(get().matches, updated.id, () => updated)
                : [...get().matches, updated],
            });
          })
          .on("postgres_changes", { event: "*", schema: "public", table: "match_events" }, (payload) => {
            if (payload.eventType === "DELETE") {
              const oldId = (payload.old as { id?: string; match_id?: string }).id;
              if (!oldId) return;
              set({
                matches: get().matches.map((m) => {
                  if (!m.events.some((e) => e.id === oldId)) return m;
                  const next = { ...m, events: m.events.filter((e) => e.id !== oldId) };
                  next.score = recalcScore(next);
                  return next;
                }),
              });
              return;
            }
            const event = matchEventFromRow(payload.new);
            set({
              matches: applyToMatch(get().matches, event.matchId, (m) => {
                const withoutDup = m.events.filter((e) => e.id !== event.id);
                const next = { ...m, events: [...withoutDup, event] };
                next.score = recalcScore(next);
                return next;
              }),
            });
          })
          .subscribe();

        return () => {
          sb.removeChannel(channel);
        };
      },

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
        if (isSupabaseConfigured()) {
          remote.insertMatch(match).catch((err) => console.error("Zyra: failed to sync new match", err));
        }
        return newId;
      },

      setLineup: (matchId, side, lineup) => {
        const matches = applyToMatch(get().matches, matchId, (m) => ({
          ...m,
          ...(side === "home" ? { homeLineup: lineup } : { awayLineup: lineup }),
        }));
        set({ matches });
        if (isSupabaseConfigured()) {
          remote
            .setMatchLineup(matchId, side, lineup)
            .catch((err) => console.error("Zyra: failed to sync lineup", err));
        }
      },

      startMatch: (matchId) => {
        let createdEvent: MatchEvent | null = null;
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const started: Match = {
            ...m,
            status: "LIVE",
            currentHalf: 1,
            currentMinute: 0,
            clockRunning: true,
            clockStartedAt: Date.now(),
            clockBaseMinute: 0,
          };
          const { match: next, event } = pushEvent(started, {
            type: "KICK_OFF",
            minute: 0,
            half: 1,
            teamId: null,
            playerId: null,
            secondaryPlayerId: null,
          });
          createdEvent = event;
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
        if (createdEvent) syncEvent(createdEvent);
      },

      pauseClock: (matchId) => {
        const matches = applyToMatch(get().matches, matchId, (m) => {
          if (!m.clockRunning || !m.clockStartedAt) return m;
          const elapsedMin = Math.floor((Date.now() - m.clockStartedAt) / 60000);
          return {
            ...m,
            clockRunning: false,
            clockBaseMinute: m.clockBaseMinute + elapsedMin,
            clockStartedAt: null,
          };
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
      },

      resumeClock: (matchId) => {
        const matches = applyToMatch(get().matches, matchId, (m) => ({
          ...m,
          clockRunning: true,
          clockStartedAt: Date.now(),
        }));
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
      },

      goToHalfTime: (matchId) => {
        let createdEvent: MatchEvent | null = null;
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const paused: Match = {
            ...m,
            currentHalf: "HT",
            clockRunning: false,
            clockStartedAt: null,
            clockBaseMinute: m.halfLengthMinutes,
          };
          const { match: next, event } = pushEvent(paused, {
            type: "HALF_TIME",
            minute: m.halfLengthMinutes,
            half: 1,
            teamId: null,
            playerId: null,
            secondaryPlayerId: null,
          });
          createdEvent = event;
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
        if (createdEvent) syncEvent(createdEvent);
      },

      startSecondHalf: (matchId) => {
        const matches = applyToMatch(get().matches, matchId, (m) => ({
          ...m,
          currentHalf: 2,
          clockRunning: true,
          clockStartedAt: Date.now(),
          clockBaseMinute: m.halfLengthMinutes,
        }));
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
      },

      endMatch: (matchId) => {
        let createdEvent: MatchEvent | null = null;
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const finished: Match = {
            ...m,
            status: "COMPLETED",
            currentHalf: "FT",
            currentMinute: m.durationMinutes,
            clockRunning: false,
            clockStartedAt: null,
            clockBaseMinute: m.durationMinutes,
          };
          const { match: next, event } = pushEvent(finished, {
            type: "FULL_TIME",
            minute: m.durationMinutes,
            half: 2,
            teamId: null,
            playerId: null,
            secondaryPlayerId: null,
          });
          createdEvent = event;
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
        if (createdEvent) syncEvent(createdEvent);
      },

      addGoalEvent: (matchId, input) => {
        let createdEvent: MatchEvent | null = null;
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const { match: next, event } = pushEvent(m, {
            type: "GOAL",
            minute: input.minute,
            half: m.currentHalf === 2 ? 2 : 1,
            teamId: input.teamId,
            playerId: input.scorerId,
            secondaryPlayerId: input.assistId,
          });
          createdEvent = event;
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
        if (createdEvent) syncEvent(createdEvent);
      },

      addCardEvent: (matchId, input) => {
        let createdEvent: MatchEvent | null = null;
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const { match: next, event } = pushEvent(m, {
            type: input.cardType,
            minute: input.minute,
            half: m.currentHalf === 2 ? 2 : 1,
            teamId: input.teamId,
            playerId: input.playerId,
            secondaryPlayerId: null,
          });
          createdEvent = event;
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
        if (createdEvent) syncEvent(createdEvent);
      },

      addSubstitutionEvent: (matchId, input) => {
        let createdEvent: MatchEvent | null = null;
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const { match: next, event } = pushEvent(m, {
            type: "SUBSTITUTION",
            minute: input.minute,
            half: m.currentHalf === 2 ? 2 : 1,
            teamId: input.teamId,
            playerId: input.offId,
            secondaryPlayerId: input.onId,
          });
          createdEvent = event;
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
        if (createdEvent) syncEvent(createdEvent);
      },

      addOwnGoalEvent: (matchId, input) => {
        let createdEvent: MatchEvent | null = null;
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const { match: next, event } = pushEvent(m, {
            type: "OWN_GOAL",
            minute: input.minute,
            half: m.currentHalf === 2 ? 2 : 1,
            teamId: input.teamId,
            playerId: input.playerId,
            secondaryPlayerId: null,
          });
          createdEvent = event;
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (updated) syncMatch(updated);
        if (createdEvent) syncEvent(createdEvent);
      },

      undoLastEvent: (matchId) => {
        let removedEventId: string | null = null;
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const idx = [...m.events].reverse().findIndex((e) => UNDOABLE_TYPES.includes(e.type));
          if (idx === -1) return m;
          const realIdx = m.events.length - 1 - idx;
          removedEventId = m.events[realIdx].id;
          const events = m.events.filter((_, i) => i !== realIdx);
          const next = { ...m, events };
          next.score = recalcScore(next);
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (removedEventId && isSupabaseConfigured()) {
          remote.deleteMatchEvent(removedEventId).catch((err) => console.error("Zyra: failed to sync undo", err));
          if (updated) syncMatch(updated);
        }
      },

      deleteEvent: (matchId, eventId) => {
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const next = { ...m, events: m.events.filter((e) => e.id !== eventId) };
          next.score = recalcScore(next);
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (isSupabaseConfigured()) {
          remote.deleteMatchEvent(eventId).catch((err) => console.error("Zyra: failed to sync delete", err));
          if (updated) syncMatch(updated);
        }
      },

      updateEvent: (matchId, eventId, changes) => {
        const matches = applyToMatch(get().matches, matchId, (m) => {
          const events = m.events.map((e) => (e.id === eventId ? { ...e, ...changes } : e));
          const next = { ...m, events };
          next.score = recalcScore(next);
          return next;
        });
        set({ matches });
        const updated = matches.find((m) => m.id === matchId);
        if (isSupabaseConfigured()) {
          remote.updateMatchEvent(eventId, changes).catch((err) => console.error("Zyra: failed to sync edit", err));
          if (updated) syncMatch(updated);
        }
      },

      addTeam: (input) => {
        const newId = id("team");
        const team: Team = {
          id: newId,
          name: input.name,
          shortName: input.shortName,
          crestColorFrom: input.crestColorFrom,
          crestColorTo: input.crestColorTo,
          foundedYear: input.foundedYear,
          homeGround: input.homeGround,
          city: input.city,
          category: input.category,
        };
        set({
          teams: [...get().teams, team],
          competitions: input.competitionId
            ? get().competitions.map((c) =>
                c.id === input.competitionId && !c.teamIds.includes(newId)
                  ? { ...c, teamIds: [...c.teamIds, newId] }
                  : c
              )
            : get().competitions,
        });
        if (isSupabaseConfigured()) {
          remote.insertTeam(team).catch((err) => console.error("Zyra: failed to sync new team", err));
          if (input.competitionId) {
            remote
              .addTeamToCompetition(input.competitionId, newId)
              .catch((err) => console.error("Zyra: failed to sync team into competition", err));
          }
        }
        return newId;
      },

      deleteTeam: (teamId) => {
        set({
          teams: get().teams.filter((t) => t.id !== teamId),
          players: get().players.filter((p) => p.teamId !== teamId),
          matches: get().matches.filter((m) => m.homeTeamId !== teamId && m.awayTeamId !== teamId),
          competitions: get().competitions.map((c) => ({
            ...c,
            teamIds: c.teamIds.filter((id_) => id_ !== teamId),
          })),
        });
        if (isSupabaseConfigured()) {
          remote.deleteTeam(teamId).catch((err) => console.error("Zyra: failed to sync team delete", err));
        }
      },

      addPlayer: (input) => {
        const newId = id("player");
        const player: Player = {
          id: newId,
          teamId: input.teamId,
          name: input.name,
          shortName: input.shortName,
          shirtNumber: input.shirtNumber,
          position: input.position,
          preferredFoot: input.preferredFoot,
          dateOfBirth: input.dateOfBirth,
          category: input.category,
          nationality: input.nationality,
        };
        set({ players: [...get().players, player] });
        if (isSupabaseConfigured()) {
          remote.insertPlayer(player).catch((err) => console.error("Zyra: failed to sync new player", err));
        }
        return newId;
      },

      deletePlayer: (playerId) => {
        set({ players: get().players.filter((p) => p.id !== playerId) });
        if (isSupabaseConfigured()) {
          remote.deletePlayer(playerId).catch((err) => console.error("Zyra: failed to sync player delete", err));
        }
      },

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
