"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Hand, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlayerAvatar, TeamCrest } from "@/components/ui/avatar";
import { Select } from "@/components/ui/field";
import { useMatch, useTeam, useTeamPlayers } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";
import type { Player, Position, TeamLineup } from "@/lib/types";
import { cn } from "@/lib/cn";

type SquadState = "out" | "starter" | "sub";

function buildDefaultLineup(squad: Player[]): {
  states: Record<string, SquadState>;
  positions: Record<string, Position>;
  captainId: string | null;
  goalkeeperId: string | null;
} {
  // Pick one goalkeeper plus the next ten outfield players (in squad order)
  // as a sensible default XI, rather than the first 11 by shirt number
  // (which can otherwise select two goalkeepers for squads that group
  // shirt numbers by position).
  const gk = squad.find((p) => p.position === "GK");
  const outfielders = squad.filter((p) => p.position !== "GK");
  const starterIds = new Set<string>(gk ? [gk.id, ...outfielders.slice(0, 10).map((p) => p.id)] : outfielders.slice(0, 11).map((p) => p.id));

  const states: Record<string, SquadState> = {};
  const positions: Record<string, Position> = {};
  squad.forEach((p) => {
    states[p.id] = starterIds.has(p.id) ? "starter" : "sub";
    positions[p.id] = p.position;
  });

  const starterOutfielders = outfielders.filter((p) => starterIds.has(p.id));
  return {
    states,
    positions,
    goalkeeperId: gk?.id ?? null,
    captainId: starterOutfielders[0]?.id ?? squad[0]?.id ?? null,
  };
}

function TeamLineupEditor({
  teamId,
  onSaved,
  savedLineup,
}: {
  teamId: string;
  onSaved: (lineup: TeamLineup) => void;
  savedLineup: TeamLineup | null;
}) {
  const team = useTeam(teamId);
  const squad = useTeamPlayers(teamId);
  const sorted = useMemo(
    () => [...squad].sort((a, b) => a.shirtNumber - b.shirtNumber),
    [squad]
  );

  const initial = useMemo(() => {
    if (savedLineup) {
      const states: Record<string, SquadState> = {};
      const positions: Record<string, Position> = {};
      sorted.forEach((p) => (states[p.id] = "out"));
      savedLineup.startingXI.forEach((s) => {
        states[s.playerId] = "starter";
        positions[s.playerId] = s.position;
      });
      savedLineup.substitutes.forEach((id) => (states[id] = "sub"));
      return {
        states,
        positions,
        captainId: savedLineup.captainId,
        goalkeeperId: savedLineup.goalkeeperId,
      };
    }
    return buildDefaultLineup(sorted);
  }, [savedLineup, sorted]);

  const [states, setStates] = useState(initial.states);
  const [positions, setPositions] = useState(initial.positions);
  const [captainId, setCaptainId] = useState(initial.captainId);
  const [goalkeeperId, setGoalkeeperId] = useState(initial.goalkeeperId);

  const starters = sorted.filter((p) => states[p.id] === "starter");
  const subs = sorted.filter((p) => states[p.id] === "sub");
  const startersFull = starters.length >= 11;

  function cyclePlayer(playerId: string) {
    setStates((prev) => {
      const cur = prev[playerId];
      let next: SquadState;
      if (cur === "out") next = startersFull ? "sub" : "starter";
      else if (cur === "starter") next = "sub";
      else next = "out";
      return { ...prev, [playerId]: next };
    });
  }

  const canSave = starters.length === 11 && !!captainId && !!goalkeeperId;

  function handleSave() {
    if (!canSave) return;
    onSaved({
      startingXI: starters.map((p) => ({ playerId: p.id, position: positions[p.id] ?? p.position })),
      substitutes: subs.map((p) => p.id),
      captainId,
      goalkeeperId,
    });
  }

  if (!team) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between rounded-2xl border border-ink-700/50 bg-ink-900/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <TeamCrest team={team} size="sm" />
          <span className="font-display text-sm font-bold text-white">{team.name}</span>
        </div>
        <span
          className={cn(
            "font-display text-sm font-bold tabular-nums",
            startersFull ? "text-volt-300" : "text-ink-400"
          )}
        >
          {starters.length}/11
        </span>
      </div>

      <p className="text-xs text-ink-500">
        Tap a player to cycle: <span className="text-ink-300">Out → Starting XI → Bench</span>
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {sorted.map((p) => {
          const state = states[p.id];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => cyclePlayer(p.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors tap-target",
                state === "starter" && "border-volt-300/50 bg-volt-300/[0.08]",
                state === "sub" && "border-sky-500/40 bg-sky-500/[0.06]",
                state === "out" && "border-ink-700/50 bg-ink-900/40 opacity-60"
              )}
            >
              <span className="w-5 shrink-0 text-center font-display text-xs font-bold text-ink-500">
                {p.shirtNumber}
              </span>
              <PlayerAvatar name={p.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-50">{p.name}</p>
                <p className="text-[11px] text-ink-500">{p.position}</p>
              </div>
              {state === "starter" && (
                <span className="rounded-full bg-volt-300/20 px-2 py-0.5 text-[10px] font-bold text-volt-300">
                  XI
                </span>
              )}
              {state === "sub" && (
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                  SUB
                </span>
              )}
            </button>
          );
        })}
      </div>

      {starters.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
            <Users size={15} /> Positions, Captain &amp; Goalkeeper
          </h3>
          <div className="flex flex-col gap-2">
            {starters.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-xl border border-ink-700/50 bg-ink-900/50 px-3 py-2"
              >
                <PlayerAvatar name={p.name} size="xs" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-100">
                  {p.name}
                </span>
                <Select
                  value={positions[p.id] ?? p.position}
                  onChange={(e) =>
                    setPositions((prev) => ({ ...prev, [p.id]: e.target.value as Position }))
                  }
                  className="!w-24 !py-1.5 text-xs"
                >
                  <option value="GK">GK</option>
                  <option value="DF">DF</option>
                  <option value="MF">MF</option>
                  <option value="FW">FW</option>
                </Select>
                <button
                  type="button"
                  onClick={() => setCaptainId(p.id)}
                  title="Set as captain"
                  className={cn(
                    "tap-target flex h-8 w-8 items-center justify-center rounded-full",
                    captainId === p.id ? "bg-volt-300 text-ink-950" : "bg-ink-800 text-ink-500"
                  )}
                >
                  <Crown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setGoalkeeperId(p.id)}
                  title="Set as goalkeeper"
                  className={cn(
                    "tap-target flex h-8 w-8 items-center justify-center rounded-full",
                    goalkeeperId === p.id ? "bg-sky-500 text-ink-950" : "bg-ink-800 text-ink-500"
                  )}
                >
                  <Hand size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={!canSave} size="lg" className="w-full">
        <Check size={17} /> Save {team.shortName} Lineup
      </Button>
      {!canSave && (
        <p className="text-center text-xs text-ink-500">
          Select exactly 11 starters, then set a captain and goalkeeper.
        </p>
      )}
    </div>
  );
}

export default function MatchSetupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const match = useMatch(params.id);
  const homeTeam = useTeam(match?.homeTeamId);
  const awayTeam = useTeam(match?.awayTeamId);
  const setLineup = useZyraStore((s) => s.setLineup);
  const startMatch = useZyraStore((s) => s.startMatch);
  const [activeTab, setActiveTab] = useState<"home" | "away">("home");

  if (!match || !homeTeam || !awayTeam) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-10 text-center text-sm text-ink-500">
        Match not found.
      </div>
    );
  }

  const bothReady = !!match.homeLineup && !!match.awayLineup;

  function handleKickOff() {
    startMatch(match!.id);
    router.push(`/matches/${match!.id}/live`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader
        title="Build Lineups"
        subtitle={`${homeTeam.name} vs ${awayTeam.name}`}
        backHref={`/matches/${match.id}`}
      />

      <div className="mb-5 flex gap-2">
        {(["home", "away"] as const).map((side) => {
          const t = side === "home" ? homeTeam : awayTeam;
          const ready = side === "home" ? !!match.homeLineup : !!match.awayLineup;
          return (
            <button
              key={side}
              onClick={() => setActiveTab(side)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-colors tap-target",
                activeTab === side ? "bg-ink-800 text-white" : "bg-ink-900/50 text-ink-400"
              )}
            >
              {t.shortName}
              {ready && <Check size={14} className="text-volt-300" />}
            </button>
          );
        })}
      </div>

      {activeTab === "home" ? (
        <TeamLineupEditor
          key={match.homeTeamId}
          teamId={match.homeTeamId}
          savedLineup={match.homeLineup}
          onSaved={(lineup) => {
            setLineup(match.id, "home", lineup);
            setActiveTab("away");
          }}
        />
      ) : (
        <TeamLineupEditor
          key={match.awayTeamId}
          teamId={match.awayTeamId}
          savedLineup={match.awayLineup}
          onSaved={(lineup) => setLineup(match.id, "away", lineup)}
        />
      )}

      {bothReady && (
        <div className="sticky bottom-20 mt-6 md:bottom-6">
          <Button onClick={handleKickOff} size="lg" className="w-full">
            Kick Off ⚽
          </Button>
        </div>
      )}
    </div>
  );
}
