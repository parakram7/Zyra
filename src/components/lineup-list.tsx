"use client";

import Link from "next/link";
import { Crown, Hand } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/avatar";
import { usePlayer } from "@/lib/hooks";
import type { LineupSlot, TeamLineup } from "@/lib/types";

const POSITION_ORDER = { GK: 0, DF: 1, MF: 2, FW: 3 };

function LineupPlayerRow({
  slot,
  isCaptain,
  isGoalkeeper,
}: {
  slot: LineupSlot;
  isCaptain: boolean;
  isGoalkeeper: boolean;
}) {
  const player = usePlayer(slot.playerId);
  if (!player) return null;
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-ink-800/60"
    >
      <span className="w-5 shrink-0 text-center text-[11px] font-semibold tabular-nums text-ink-500">
        {player.shirtNumber}
      </span>
      <PlayerAvatar name={player.name} size="xs" />
      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink-100">{player.name}</span>
      {isCaptain && <Crown size={12} className="shrink-0 text-brand-400" />}
      {isGoalkeeper && <Hand size={12} className="shrink-0 text-sky-400" />}
      <span className="w-8 shrink-0 rounded-md bg-ink-800 py-0.5 text-center text-[10px] font-semibold text-ink-400">
        {slot.position}
      </span>
    </Link>
  );
}

export function LineupList({ lineup, title }: { lineup: TeamLineup | null; title: string }) {
  if (!lineup) {
    return <p className="text-sm text-ink-500">Lineup not set yet.</p>;
  }
  const sortedXI = [...lineup.startingXI].sort(
    (a, b) => POSITION_ORDER[a.position] - POSITION_ORDER[b.position]
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          {title} · Starting XI
        </p>
        <div className="flex flex-col gap-0.5">
          {sortedXI.map((slot) => (
            <LineupPlayerRow
              key={slot.playerId}
              slot={slot}
              isCaptain={lineup.captainId === slot.playerId}
              isGoalkeeper={lineup.goalkeeperId === slot.playerId}
            />
          ))}
        </div>
      </div>
      {lineup.substitutes.length > 0 && (
        <div className="border-t border-ink-800 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Substitutes</p>
          <div className="flex flex-col gap-0.5">
            {lineup.substitutes.map((playerId) => (
              <LineupPlayerRow
                key={playerId}
                slot={{ playerId, position: "MF" }}
                isCaptain={false}
                isGoalkeeper={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
