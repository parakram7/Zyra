// Core domain types for Zyra.
// This layer is intentionally storage-agnostic: nothing here knows about
// Zustand, localStorage, or Supabase. Repositories in `lib/data` and the
// store in `lib/store.ts` depend on these types, not the other way round,
// so the persistence layer can be swapped for Supabase later without
// touching UI or stats code.

export type Position = "GK" | "DF" | "MF" | "FW";

export const POSITION_LABELS: Record<Position, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
};

export type PreferredFoot = "Left" | "Right" | "Both";

export interface Player {
  id: string;
  name: string;
  shortName?: string;
  teamId: string;
  shirtNumber: number;
  position: Position;
  preferredFoot: PreferredFoot;
  dateOfBirth: string; // ISO date
  category: string; // e.g. "U16", "Senior"
  nationality: string;
  photoUrl?: string | null;
  bio?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  crestColorFrom: string; // tailwind-esque hex for crest gradient
  crestColorTo: string;
  foundedYear: number;
  homeGround: string;
  city: string;
  category: string; // e.g. "U16 Boys", "Senior Men"
}

export type CompetitionFormat = "league" | "cup";

export interface Competition {
  id: string;
  name: string;
  season: string;
  format: CompetitionFormat;
  teamIds: string[];
}

export type MatchStatus = "SCHEDULED" | "LIVE" | "COMPLETED";

export type MatchHalf = 1 | 2 | "HT" | "FT";

export interface LineupSlot {
  playerId: string;
  position: Position;
}

export interface TeamLineup {
  startingXI: LineupSlot[];
  substitutes: string[]; // player ids
  captainId: string | null;
  goalkeeperId: string | null;
}

export type MatchEventType =
  | "GOAL"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION"
  | "OWN_GOAL"
  | "HALF_TIME"
  | "FULL_TIME"
  | "KICK_OFF";

export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  half: 1 | 2;
  teamId: string | null; // team the event is attributed to (scoring team, carded player's team, etc.)
  playerId: string | null; // primary player (scorer, carded player, player coming off)
  secondaryPlayerId: string | null; // assist player, or player coming on
  createdAt: number; // epoch ms, used for ordering + undo
  note?: string;
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface Match {
  id: string;
  competitionId: string | null;
  homeTeamId: string;
  awayTeamId: string;
  date: string; // ISO datetime
  venue: string;
  status: MatchStatus;
  durationMinutes: number; // total match length e.g. 70
  halfLengthMinutes: number;
  currentMinute: number;
  currentHalf: 1 | 2 | "HT" | "FT" | null;
  score: MatchScore;
  homeLineup: TeamLineup | null;
  awayLineup: TeamLineup | null;
  events: MatchEvent[];
  clockRunning: boolean;
  clockStartedAt: number | null; // epoch ms when clock last started, for computing elapsed
  clockBaseMinute: number; // minute value clock was at when last started/paused
}

export interface PlayerMatchStats {
  appearances: number;
  starts: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  ownGoals: number;
}

export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}
