import type {
  Competition,
  Match,
  MatchEvent,
  Player,
  Position,
  Team,
  TeamLineup,
} from "./types";

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export const TEAM_RIVERSIDE = "team-riverside";
export const TEAM_LAKESIDE = "team-lakeside";
export const TEAM_EASTWOOD = "team-eastwood";
export const TEAM_NORTHGATE = "team-northgate";

export const teams: Team[] = [
  {
    id: TEAM_RIVERSIDE,
    name: "Riverside Academy",
    shortName: "RIV",
    crestColorFrom: "#34d399",
    crestColorTo: "#047857",
    foundedYear: 2011,
    homeGround: "Riverside Turf Ground",
    city: "Pune",
    category: "U16 Boys",
  },
  {
    id: TEAM_LAKESIDE,
    name: "Lakeside United",
    shortName: "LAK",
    crestColorFrom: "#60a5fa",
    crestColorTo: "#1d4ed8",
    foundedYear: 2008,
    homeGround: "Lakeside Community Ground",
    city: "Pune",
    category: "U16 Boys",
  },
  {
    id: TEAM_EASTWOOD,
    name: "Eastwood Rangers",
    shortName: "EWR",
    crestColorFrom: "#fb923c",
    crestColorTo: "#c2410c",
    foundedYear: 2014,
    homeGround: "Eastwood School Ground",
    city: "Pune",
    category: "U16 Boys",
  },
  {
    id: TEAM_NORTHGATE,
    name: "Northgate Warriors",
    shortName: "NGW",
    crestColorFrom: "#a78bfa",
    crestColorTo: "#6d28d9",
    foundedYear: 2016,
    homeGround: "Northgate Sports Complex",
    city: "Pimpri-Chinchwad",
    category: "U16 Boys",
  },
];

// ---------------------------------------------------------------------------
// Players — Riverside Academy is the fully fleshed-out "hero" demo team.
// ---------------------------------------------------------------------------

function player(p: Omit<Player, "teamId">, teamId: string): Player {
  return { ...p, teamId };
}

export const riversidePlayers: Player[] = [
  player(
    {
      id: "p-rohan-deshmukh",
      name: "Rohan Deshmukh",
      shortName: "Deshmukh",
      shirtNumber: 1,
      position: "GK",
      preferredFoot: "Right",
      dateOfBirth: "2009-03-14",
      category: "U16",
      nationality: "India",
      bio: "Commanding shot-stopper with excellent distribution off the deck.",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-kabir-nair",
      name: "Kabir Nair",
      shortName: "Nair",
      shirtNumber: 12,
      position: "GK",
      preferredFoot: "Right",
      dateOfBirth: "2009-11-02",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-yuvraj-chauhan",
      name: "Yuvraj Chauhan",
      shortName: "Chauhan",
      shirtNumber: 2,
      position: "DF",
      preferredFoot: "Right",
      dateOfBirth: "2009-06-21",
      category: "U16",
      nationality: "India",
      bio: "Reliable right-back who loves to overlap down the flank.",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-aditya-raut",
      name: "Aditya Raut",
      shortName: "Raut",
      shirtNumber: 3,
      position: "DF",
      preferredFoot: "Left",
      dateOfBirth: "2008-12-30",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-vihaan-kulkarni",
      name: "Vihaan Kulkarni",
      shortName: "Kulkarni",
      shirtNumber: 4,
      position: "DF",
      preferredFoot: "Right",
      dateOfBirth: "2009-01-18",
      category: "U16",
      nationality: "India",
      bio: "Vice-captain. Composed centre-back, strong in the air.",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-siddharth-menon",
      name: "Siddharth Menon",
      shortName: "Menon",
      shirtNumber: 5,
      position: "DF",
      preferredFoot: "Right",
      dateOfBirth: "2009-08-09",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-devansh-rathore",
      name: "Devansh Rathore",
      shortName: "Rathore",
      shirtNumber: 14,
      position: "DF",
      preferredFoot: "Left",
      dateOfBirth: "2009-05-27",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-arjun-pillai",
      name: "Arjun Pillai",
      shortName: "Pillai",
      shirtNumber: 15,
      position: "DF",
      preferredFoot: "Right",
      dateOfBirth: "2010-02-11",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-aryan-sharma",
      name: "Aryan Sharma",
      shortName: "Aryan",
      shirtNumber: 8,
      position: "MF",
      preferredFoot: "Right",
      dateOfBirth: "2009-04-05",
      category: "U16",
      nationality: "India",
      bio: "Creative playmaker — the engine of Riverside's midfield.",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-kartik-iyer",
      name: "Kartik Iyer",
      shortName: "Iyer",
      shirtNumber: 6,
      position: "MF",
      preferredFoot: "Right",
      dateOfBirth: "2009-09-16",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-rudra-singh",
      name: "Rudra Pratap Singh",
      shortName: "Rudra",
      shirtNumber: 16,
      position: "MF",
      preferredFoot: "Right",
      dateOfBirth: "2008-10-23",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-ishaan-bhatt",
      name: "Ishaan Bhatt",
      shortName: "Bhatt",
      shirtNumber: 17,
      position: "MF",
      preferredFoot: "Left",
      dateOfBirth: "2009-07-08",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-shaurya-malhotra",
      name: "Shaurya Malhotra",
      shortName: "Malhotra",
      shirtNumber: 18,
      position: "MF",
      preferredFoot: "Right",
      dateOfBirth: "2010-01-30",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-reyansh-joshi",
      name: "Reyansh Joshi",
      shortName: "Joshi",
      shirtNumber: 19,
      position: "MF",
      preferredFoot: "Right",
      dateOfBirth: "2009-12-19",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-parakram-baheti",
      name: "Parakram Baheti",
      shortName: "Baheti",
      shirtNumber: 9,
      position: "FW",
      preferredFoot: "Right",
      dateOfBirth: "2009-02-27",
      category: "U16",
      nationality: "India",
      bio: "Captain and top scorer. Clinical finisher with a fierce right foot.",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-vivaan-khanna",
      name: "Vivaan Khanna",
      shortName: "Khanna",
      shirtNumber: 11,
      position: "FW",
      preferredFoot: "Left",
      dateOfBirth: "2009-06-13",
      category: "U16",
      nationality: "India",
      bio: "Pacey inverted winger who cuts in from the left.",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-advik-trivedi",
      name: "Advik Trivedi",
      shortName: "Trivedi",
      shirtNumber: 10,
      position: "FW",
      preferredFoot: "Right",
      dateOfBirth: "2008-11-11",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-neel-kapadia",
      name: "Neel Kapadia",
      shortName: "Kapadia",
      shirtNumber: 20,
      position: "FW",
      preferredFoot: "Right",
      dateOfBirth: "2010-03-22",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-om-yadav",
      name: "Om Prakash Yadav",
      shortName: "Yadav",
      shirtNumber: 13,
      position: "DF",
      preferredFoot: "Right",
      dateOfBirth: "2010-04-04",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
  player(
    {
      id: "p-dhruv-saxena",
      name: "Dhruv Saxena",
      shortName: "Saxena",
      shirtNumber: 7,
      position: "MF",
      preferredFoot: "Left",
      dateOfBirth: "2009-10-01",
      category: "U16",
      nationality: "India",
    },
    TEAM_RIVERSIDE
  ),
];

// Deterministic generated squads for opposing teams, so lineups always have
// a full XI + bench without hand-authoring every bio.
const FIRST_NAMES = [
  "Aarav", "Vivan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
  "Krishna", "Ishaan", "Shaurya", "Atharv", "Advik", "Ranveer", "Ansh",
  "Dev", "Yash", "Karan", "Nikhil", "Harsh", "Manav", "Veer", "Pranav",
  "Raghav", "Samar", "Tanish", "Yug", "Zayn", "Kabir", "Laksh",
];
const LAST_NAMES = [
  "Verma", "Gupta", "Mehta", "Shah", "Patel", "Reddy", "Rao", "Deshpande",
  "Kapoor", "Chatterjee", "Sengupta", "Bose", "Dutta", "Banerjee", "Ghosh",
  "Naidu", "Pandey", "Mishra", "Tiwari", "Agarwal", "Bhardwaj", "Chopra",
  "Oberoi", "Sethi", "Grover", "Khurana", "Ahluwalia", "Bajwa",
];

function generateSquad(teamId: string, seedOffset: number): Player[] {
  const formation: { position: Position; count: number }[] = [
    { position: "GK", count: 2 },
    { position: "DF", count: 5 },
    { position: "MF", count: 4 },
    { position: "FW", count: 3 },
  ];
  const players: Player[] = [];
  let shirt = 1;
  let idx = seedOffset;
  for (const { position, count } of formation) {
    for (let i = 0; i < count; i++) {
      const first = FIRST_NAMES[idx % FIRST_NAMES.length];
      const last = LAST_NAMES[(idx * 7 + 3) % LAST_NAMES.length];
      const name = `${first} ${last}`;
      players.push({
        id: `${teamId}-p${shirt}`,
        name,
        shortName: last,
        teamId,
        shirtNumber: shirt,
        position,
        preferredFoot: idx % 5 === 0 ? "Left" : idx % 9 === 0 ? "Both" : "Right",
        dateOfBirth: `${2008 + (idx % 3)}-${String((idx % 12) + 1).padStart(2, "0")}-${String(
          (idx % 27) + 1
        ).padStart(2, "0")}`,
        category: "U16",
        nationality: "India",
      });
      shirt++;
      idx++;
    }
  }
  return players;
}

export const lakesidePlayers = generateSquad(TEAM_LAKESIDE, 2);
export const eastwoodPlayers = generateSquad(TEAM_EASTWOOD, 11);
export const northgatePlayers = generateSquad(TEAM_NORTHGATE, 20);

export const players: Player[] = [
  ...riversidePlayers,
  ...lakesidePlayers,
  ...eastwoodPlayers,
  ...northgatePlayers,
];

export const playersByTeam: Record<string, Player[]> = {
  [TEAM_RIVERSIDE]: riversidePlayers,
  [TEAM_LAKESIDE]: lakesidePlayers,
  [TEAM_EASTWOOD]: eastwoodPlayers,
  [TEAM_NORTHGATE]: northgatePlayers,
};

// ---------------------------------------------------------------------------
// Competition
// ---------------------------------------------------------------------------

export const COMPETITION_ID = "comp-metro-youth-league";

export const competitions: Competition[] = [
  {
    id: COMPETITION_ID,
    name: "Metro Youth League",
    season: "2025/26",
    format: "league",
    teamIds: [TEAM_RIVERSIDE, TEAM_LAKESIDE, TEAM_EASTWOOD, TEAM_NORTHGATE],
  },
];

// ---------------------------------------------------------------------------
// Matches + events
// ---------------------------------------------------------------------------

function daysFromNow(days: number, hour = 16, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// Builds an 11-player starting lineup for seed matches. `requiredIds` are
// players who must start (goalscorers, assist providers, players carded or
// subbed off in that match's events) — the captain and goalkeeper are
// always required too. `excludeIds` are players who must NOT start (e.g.
// someone who comes on as a substitute in this match's events). Remaining
// slots are filled from the rest of the squad, capping at one goalkeeper,
// so every seeded lineup is internally consistent with its match events.
function buildLineup(
  squad: Player[],
  requiredIds: string[],
  excludeIds: string[],
  captainId: string,
  goalkeeperId: string
): TeamLineup {
  const requiredIdSet = Array.from(new Set([goalkeeperId, captainId, ...requiredIds]));
  const requiredPlayers = requiredIdSet
    .map((id) => squad.find((p) => p.id === id))
    .filter((p): p is Player => !!p);
  const usedIds = new Set(requiredPlayers.map((p) => p.id));
  const gkAlreadyIncluded = requiredPlayers.some((p) => p.position === "GK");

  const fillers = squad.filter((p) => {
    if (usedIds.has(p.id) || excludeIds.includes(p.id)) return false;
    if (p.position === "GK" && gkAlreadyIncluded) return false;
    return true;
  });

  const starters = [...requiredPlayers];
  for (const p of fillers) {
    if (starters.length >= 11) break;
    starters.push(p);
  }

  const starterIds = new Set(starters.map((p) => p.id));
  const subs = squad.filter((p) => !starterIds.has(p.id));

  return {
    startingXI: starters.map((p) => ({ playerId: p.id, position: p.position })),
    substitutes: subs.map((p) => p.id),
    captainId,
    goalkeeperId,
  };
}

let eventIdCounter = 1;
function makeEvent(
  matchId: string,
  partial: Omit<MatchEvent, "id" | "matchId" | "createdAt">
): MatchEvent {
  return {
    ...partial,
    id: `evt-${matchId}-${eventIdCounter++}`,
    matchId,
    createdAt: Date.now(),
  };
}

// --- Match 1: Riverside 3-1 Lakeside (completed, 21 days ago) ---
const M1 = "match-riv-lak-1";
const m1HomeLineup = buildLineup(
  riversidePlayers,
  ["p-parakram-baheti", "p-aryan-sharma", "p-vivaan-khanna", "p-advik-trivedi"],
  ["p-neel-kapadia"],
  "p-parakram-baheti",
  "p-rohan-deshmukh"
);
const m1AwayLineup = buildLineup(
  lakesidePlayers,
  [lakesidePlayers[4].id, lakesidePlayers[9].id, lakesidePlayers[3].id],
  [],
  lakesidePlayers[2].id,
  lakesidePlayers[0].id
);
const m1Events: MatchEvent[] = [
  makeEvent(M1, {
    type: "KICK_OFF",
    minute: 0,
    half: 1,
    teamId: null,
    playerId: null,
    secondaryPlayerId: null,
  }),
  makeEvent(M1, {
    type: "GOAL",
    minute: 12,
    half: 1,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-parakram-baheti",
    secondaryPlayerId: "p-aryan-sharma",
  }),
  makeEvent(M1, {
    type: "YELLOW_CARD",
    minute: 24,
    half: 1,
    teamId: TEAM_LAKESIDE,
    playerId: lakesidePlayers[4].id,
    secondaryPlayerId: null,
  }),
  makeEvent(M1, {
    type: "GOAL",
    minute: 31,
    half: 1,
    teamId: TEAM_LAKESIDE,
    playerId: lakesidePlayers[9].id,
    secondaryPlayerId: lakesidePlayers[3].id,
  }),
  makeEvent(M1, {
    type: "GOAL",
    minute: 52,
    half: 2,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-vivaan-khanna",
    secondaryPlayerId: "p-aryan-sharma",
  }),
  makeEvent(M1, {
    type: "SUBSTITUTION",
    minute: 58,
    half: 2,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-advik-trivedi",
    secondaryPlayerId: "p-neel-kapadia",
  }),
  makeEvent(M1, {
    type: "GOAL",
    minute: 67,
    half: 2,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-parakram-baheti",
    secondaryPlayerId: null,
  }),
  makeEvent(M1, {
    type: "FULL_TIME",
    minute: 70,
    half: 2,
    teamId: null,
    playerId: null,
    secondaryPlayerId: null,
  }),
];

// --- Match 2: Eastwood 0-2 Riverside (completed, 14 days ago) ---
const M2 = "match-ewr-riv-1";
const m2HomeLineup = buildLineup(
  eastwoodPlayers,
  [eastwoodPlayers[6].id, eastwoodPlayers[10].id, eastwoodPlayers[3].id],
  [eastwoodPlayers[11].id],
  eastwoodPlayers[1].id,
  eastwoodPlayers[0].id
);
const m2AwayLineup = buildLineup(
  riversidePlayers,
  ["p-advik-trivedi", "p-dhruv-saxena", "p-kartik-iyer", "p-parakram-baheti", "p-vivaan-khanna"],
  [],
  "p-parakram-baheti",
  "p-rohan-deshmukh"
);
const m2Events: MatchEvent[] = [
  makeEvent(M2, { type: "KICK_OFF", minute: 0, half: 1, teamId: null, playerId: null, secondaryPlayerId: null }),
  makeEvent(M2, {
    type: "GOAL",
    minute: 19,
    half: 1,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-advik-trivedi",
    secondaryPlayerId: "p-dhruv-saxena",
  }),
  makeEvent(M2, {
    type: "YELLOW_CARD",
    minute: 38,
    half: 1,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-kartik-iyer",
    secondaryPlayerId: null,
  }),
  makeEvent(M2, {
    type: "YELLOW_CARD",
    minute: 44,
    half: 2,
    teamId: TEAM_EASTWOOD,
    playerId: eastwoodPlayers[6].id,
    secondaryPlayerId: null,
  }),
  makeEvent(M2, {
    type: "SUBSTITUTION",
    minute: 55,
    half: 2,
    teamId: TEAM_EASTWOOD,
    playerId: eastwoodPlayers[10].id,
    secondaryPlayerId: eastwoodPlayers[11].id,
  }),
  makeEvent(M2, {
    type: "GOAL",
    minute: 74,
    half: 2,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-parakram-baheti",
    secondaryPlayerId: "p-vivaan-khanna",
  }),
  makeEvent(M2, {
    type: "RED_CARD",
    minute: 81,
    half: 2,
    teamId: TEAM_EASTWOOD,
    playerId: eastwoodPlayers[3].id,
    secondaryPlayerId: null,
  }),
  makeEvent(M2, { type: "FULL_TIME", minute: 80, half: 2, teamId: null, playerId: null, secondaryPlayerId: null }),
];

// --- Match 3: Northgate 1-1 Lakeside (completed, 10 days ago, no Riverside) ---
const M3 = "match-ngw-lak-1";
const m3HomeLineup = buildLineup(
  northgatePlayers,
  [northgatePlayers[9].id, northgatePlayers[8].id],
  [],
  northgatePlayers[2].id,
  northgatePlayers[0].id
);
const m3AwayLineup = buildLineup(
  lakesidePlayers,
  [lakesidePlayers[9].id],
  [],
  lakesidePlayers[2].id,
  lakesidePlayers[0].id
);
const m3Events: MatchEvent[] = [
  makeEvent(M3, { type: "KICK_OFF", minute: 0, half: 1, teamId: null, playerId: null, secondaryPlayerId: null }),
  makeEvent(M3, {
    type: "GOAL",
    minute: 22,
    half: 1,
    teamId: TEAM_NORTHGATE,
    playerId: northgatePlayers[9].id,
    secondaryPlayerId: northgatePlayers[8].id,
  }),
  makeEvent(M3, {
    type: "GOAL",
    minute: 63,
    half: 2,
    teamId: TEAM_LAKESIDE,
    playerId: lakesidePlayers[9].id,
    secondaryPlayerId: null,
  }),
  makeEvent(M3, { type: "FULL_TIME", minute: 70, half: 2, teamId: null, playerId: null, secondaryPlayerId: null }),
];

// --- Match 4: Riverside 4-0 Northgate (completed, 5 days ago) ---
const M4 = "match-riv-ngw-1";
const m4HomeLineup = buildLineup(
  riversidePlayers,
  ["p-parakram-baheti", "p-aryan-sharma", "p-vivaan-khanna", "p-advik-trivedi"],
  ["p-dhruv-saxena"],
  "p-parakram-baheti",
  "p-rohan-deshmukh"
);
const m4AwayLineup = buildLineup(
  northgatePlayers,
  [northgatePlayers[4].id],
  [],
  northgatePlayers[2].id,
  northgatePlayers[0].id
);
const m4Events: MatchEvent[] = [
  makeEvent(M4, { type: "KICK_OFF", minute: 0, half: 1, teamId: null, playerId: null, secondaryPlayerId: null }),
  makeEvent(M4, {
    type: "GOAL",
    minute: 8,
    half: 1,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-parakram-baheti",
    secondaryPlayerId: "p-aryan-sharma",
  }),
  makeEvent(M4, {
    type: "GOAL",
    minute: 21,
    half: 1,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-vivaan-khanna",
    secondaryPlayerId: "p-parakram-baheti",
  }),
  makeEvent(M4, {
    type: "OWN_GOAL",
    minute: 35,
    half: 1,
    teamId: TEAM_NORTHGATE,
    playerId: northgatePlayers[4].id,
    secondaryPlayerId: null,
  }),
  makeEvent(M4, {
    type: "SUBSTITUTION",
    minute: 60,
    half: 2,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-aryan-sharma",
    secondaryPlayerId: "p-dhruv-saxena",
  }),
  makeEvent(M4, {
    type: "GOAL",
    minute: 69,
    half: 2,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-parakram-baheti",
    secondaryPlayerId: "p-advik-trivedi",
  }),
  makeEvent(M4, { type: "FULL_TIME", minute: 70, half: 2, teamId: null, playerId: null, secondaryPlayerId: null }),
];

// --- Match 5: Riverside vs Eastwood — LIVE right now (paused, in progress) ---
const M5 = "match-riv-ewr-live";
const m5HomeLineup = buildLineup(
  riversidePlayers,
  ["p-parakram-baheti", "p-aryan-sharma", "p-vivaan-khanna", "p-dhruv-saxena", "p-reyansh-joshi"],
  ["p-shaurya-malhotra"],
  "p-parakram-baheti",
  "p-rohan-deshmukh"
);
const m5AwayLineup = buildLineup(
  eastwoodPlayers,
  [eastwoodPlayers[5].id, eastwoodPlayers[9].id, eastwoodPlayers[8].id],
  [],
  eastwoodPlayers[1].id,
  eastwoodPlayers[0].id
);
const m5Events: MatchEvent[] = [
  makeEvent(M5, { type: "KICK_OFF", minute: 0, half: 1, teamId: null, playerId: null, secondaryPlayerId: null }),
  makeEvent(M5, {
    type: "GOAL",
    minute: 9,
    half: 1,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-parakram-baheti",
    secondaryPlayerId: "p-aryan-sharma",
  }),
  makeEvent(M5, {
    type: "YELLOW_CARD",
    minute: 26,
    half: 1,
    teamId: TEAM_EASTWOOD,
    playerId: eastwoodPlayers[5].id,
    secondaryPlayerId: null,
  }),
  makeEvent(M5, {
    type: "GOAL",
    minute: 33,
    half: 1,
    teamId: TEAM_EASTWOOD,
    playerId: eastwoodPlayers[9].id,
    secondaryPlayerId: eastwoodPlayers[8].id,
  }),
  makeEvent(M5, {
    type: "GOAL",
    minute: 51,
    half: 2,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-vivaan-khanna",
    secondaryPlayerId: "p-dhruv-saxena",
  }),
  makeEvent(M5, {
    type: "SUBSTITUTION",
    minute: 55,
    half: 2,
    teamId: TEAM_RIVERSIDE,
    playerId: "p-reyansh-joshi",
    secondaryPlayerId: "p-shaurya-malhotra",
  }),
];

// ---------------------------------------------------------------------------

function sumScore(events: MatchEvent[], teamId: string, otherTeamId: string) {
  let score = 0;
  for (const e of events) {
    if (e.type === "GOAL" && e.teamId === teamId) score++;
    if (e.type === "OWN_GOAL" && e.teamId === otherTeamId) score++;
  }
  return score;
}

export const matches: Match[] = [
  {
    id: M1,
    competitionId: COMPETITION_ID,
    homeTeamId: TEAM_RIVERSIDE,
    awayTeamId: TEAM_LAKESIDE,
    date: daysFromNow(-21),
    venue: "Riverside Turf Ground",
    status: "COMPLETED",
    durationMinutes: 70,
    halfLengthMinutes: 35,
    currentMinute: 70,
    currentHalf: "FT",
    score: {
      home: sumScore(m1Events, TEAM_RIVERSIDE, TEAM_LAKESIDE),
      away: sumScore(m1Events, TEAM_LAKESIDE, TEAM_RIVERSIDE),
    },
    homeLineup: m1HomeLineup,
    awayLineup: m1AwayLineup,
    events: m1Events,
    clockRunning: false,
    clockStartedAt: null,
    clockBaseMinute: 70,
  },
  {
    id: M2,
    competitionId: COMPETITION_ID,
    homeTeamId: TEAM_EASTWOOD,
    awayTeamId: TEAM_RIVERSIDE,
    date: daysFromNow(-14),
    venue: "Eastwood School Ground",
    status: "COMPLETED",
    durationMinutes: 80,
    halfLengthMinutes: 40,
    currentMinute: 80,
    currentHalf: "FT",
    score: {
      home: sumScore(m2Events, TEAM_EASTWOOD, TEAM_RIVERSIDE),
      away: sumScore(m2Events, TEAM_RIVERSIDE, TEAM_EASTWOOD),
    },
    homeLineup: m2HomeLineup,
    awayLineup: m2AwayLineup,
    events: m2Events,
    clockRunning: false,
    clockStartedAt: null,
    clockBaseMinute: 80,
  },
  {
    id: M3,
    competitionId: COMPETITION_ID,
    homeTeamId: TEAM_NORTHGATE,
    awayTeamId: TEAM_LAKESIDE,
    date: daysFromNow(-10),
    venue: "Northgate Sports Complex",
    status: "COMPLETED",
    durationMinutes: 70,
    halfLengthMinutes: 35,
    currentMinute: 70,
    currentHalf: "FT",
    score: {
      home: sumScore(m3Events, TEAM_NORTHGATE, TEAM_LAKESIDE),
      away: sumScore(m3Events, TEAM_LAKESIDE, TEAM_NORTHGATE),
    },
    homeLineup: m3HomeLineup,
    awayLineup: m3AwayLineup,
    events: m3Events,
    clockRunning: false,
    clockStartedAt: null,
    clockBaseMinute: 70,
  },
  {
    id: M4,
    competitionId: COMPETITION_ID,
    homeTeamId: TEAM_RIVERSIDE,
    awayTeamId: TEAM_NORTHGATE,
    date: daysFromNow(-5),
    venue: "Riverside Turf Ground",
    status: "COMPLETED",
    durationMinutes: 70,
    halfLengthMinutes: 35,
    currentMinute: 70,
    currentHalf: "FT",
    score: {
      home: sumScore(m4Events, TEAM_RIVERSIDE, TEAM_NORTHGATE),
      away: sumScore(m4Events, TEAM_NORTHGATE, TEAM_RIVERSIDE),
    },
    homeLineup: m4HomeLineup,
    awayLineup: m4AwayLineup,
    events: m4Events,
    clockRunning: false,
    clockStartedAt: null,
    clockBaseMinute: 70,
  },
  {
    id: M5,
    competitionId: COMPETITION_ID,
    homeTeamId: TEAM_RIVERSIDE,
    awayTeamId: TEAM_EASTWOOD,
    date: daysFromNow(0, 10, 0),
    venue: "Riverside Turf Ground",
    status: "LIVE",
    durationMinutes: 70,
    halfLengthMinutes: 35,
    currentMinute: 55,
    currentHalf: 2,
    score: {
      home: sumScore(m5Events, TEAM_RIVERSIDE, TEAM_EASTWOOD),
      away: sumScore(m5Events, TEAM_EASTWOOD, TEAM_RIVERSIDE),
    },
    homeLineup: m5HomeLineup,
    awayLineup: m5AwayLineup,
    events: m5Events,
    clockRunning: false,
    clockStartedAt: null,
    clockBaseMinute: 55,
  },
  // Upcoming fixtures
  {
    id: "match-lak-riv-upcoming",
    competitionId: COMPETITION_ID,
    homeTeamId: TEAM_LAKESIDE,
    awayTeamId: TEAM_RIVERSIDE,
    date: daysFromNow(4, 16, 0),
    venue: "Lakeside Community Ground",
    status: "SCHEDULED",
    durationMinutes: 70,
    halfLengthMinutes: 35,
    currentMinute: 0,
    currentHalf: null,
    score: { home: 0, away: 0 },
    homeLineup: null,
    awayLineup: null,
    events: [],
    clockRunning: false,
    clockStartedAt: null,
    clockBaseMinute: 0,
  },
  {
    id: "match-riv-ngw-upcoming",
    competitionId: COMPETITION_ID,
    homeTeamId: TEAM_RIVERSIDE,
    awayTeamId: TEAM_NORTHGATE,
    date: daysFromNow(11, 15, 30),
    venue: "Riverside Turf Ground",
    status: "SCHEDULED",
    durationMinutes: 70,
    halfLengthMinutes: 35,
    currentMinute: 0,
    currentHalf: null,
    score: { home: 0, away: 0 },
    homeLineup: null,
    awayLineup: null,
    events: [],
    clockRunning: false,
    clockStartedAt: null,
    clockBaseMinute: 0,
  },
  {
    id: "match-ewr-ngw-upcoming",
    competitionId: COMPETITION_ID,
    homeTeamId: TEAM_EASTWOOD,
    awayTeamId: TEAM_NORTHGATE,
    date: daysFromNow(18, 17, 0),
    venue: "Eastwood School Ground",
    status: "SCHEDULED",
    durationMinutes: 70,
    halfLengthMinutes: 35,
    currentMinute: 0,
    currentHalf: null,
    score: { home: 0, away: 0 },
    homeLineup: null,
    awayLineup: null,
    events: [],
    clockRunning: false,
    clockStartedAt: null,
    clockBaseMinute: 0,
  },
];

// The team & player the prototype treats as "the current user's context"
// (used on Home and the Profile tab, since there is no real auth yet).
export const DEMO_TEAM_ID = TEAM_RIVERSIDE;
export const DEMO_PLAYER_ID = "p-parakram-baheti";

export function getTeam(teamId: string): Team | undefined {
  return teams.find((t) => t.id === teamId);
}

export function getPlayer(playerId: string): Player | undefined {
  return players.find((p) => p.id === playerId);
}
