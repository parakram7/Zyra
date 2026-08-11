"use client";

import { Pause, Play, Undo2 } from "lucide-react";
import { TeamCrest } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLiveMinute, useTeam } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/cn";

export function LiveHeader({ match }: { match: Match }) {
  const home = useTeam(match.homeTeamId);
  const away = useTeam(match.awayTeamId);
  const minute = useLiveMinute(match);
  const pauseClock = useZyraStore((s) => s.pauseClock);
  const resumeClock = useZyraStore((s) => s.resumeClock);
  const goToHalfTime = useZyraStore((s) => s.goToHalfTime);
  const startSecondHalf = useZyraStore((s) => s.startSecondHalf);
  const endMatch = useZyraStore((s) => s.endMatch);
  const undoLastEvent = useZyraStore((s) => s.undoLastEvent);

  if (!home || !away) return null;

  const halfLabel =
    match.currentHalf === "HT"
      ? "Half-time"
      : match.currentHalf === "FT"
        ? "Full-time"
        : match.currentHalf === 2
          ? "2nd Half"
          : "1st Half";

  const canUndo = match.events.some((e) =>
    ["GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION", "OWN_GOAL"].includes(e.type)
  );

  return (
    <div className="rounded-b-3xl border-b border-ink-700/50 bg-gradient-to-b from-ink-900 to-ink-950 px-4 pb-5 pt-4 md:rounded-3xl md:border md:px-6 md:pt-6">
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-live" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-live">{halfLabel}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamCrest team={home} size="lg" />
          <span className="text-sm font-bold leading-tight text-white">{home.shortName}</span>
        </div>

        <div className="flex flex-col items-center gap-1 px-2">
          <span className="font-display text-5xl font-extrabold tabular-nums leading-none text-white">
            {match.score.home}–{match.score.away}
          </span>
          <button
            onClick={() => (match.clockRunning ? pauseClock(match.id) : resumeClock(match.id))}
            disabled={match.currentHalf === "HT" || match.currentHalf === "FT"}
            className="mt-1 flex items-center gap-1.5 rounded-full bg-ink-800 px-3 py-1 text-sm font-bold tabular-nums text-ink-100 disabled:opacity-40"
          >
            {match.currentHalf === "HT" || match.currentHalf === "FT" ? (
              minute + "'"
            ) : (
              <>
                {match.clockRunning ? <Pause size={12} /> : <Play size={12} />}
                {minute}&apos;
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <TeamCrest team={away} size="lg" />
          <span className="text-sm font-bold leading-tight text-white">{away.shortName}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {match.currentHalf === 1 && (
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => goToHalfTime(match.id)}>
            End 1st Half
          </Button>
        )}
        {match.currentHalf === "HT" && (
          <Button size="sm" className="flex-1" onClick={() => startSecondHalf(match.id)}>
            Start 2nd Half
          </Button>
        )}
        {match.currentHalf === 2 && (
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => endMatch(match.id)}>
            End Match
          </Button>
        )}
        <button
          onClick={() => canUndo && undoLastEvent(match.id)}
          disabled={!canUndo}
          className={cn(
            "flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-ink-800 px-3 text-xs font-semibold text-ink-300 disabled:opacity-30",
            canUndo && "hover:bg-ink-700 hover:text-white"
          )}
        >
          <Undo2 size={14} /> Undo
        </button>
      </div>
    </div>
  );
}
