"use client";

import { Minus, Plus } from "lucide-react";
import { PlayerAvatar, TeamCrest } from "@/components/ui/avatar";
import { useTeam } from "@/lib/hooks";
import type { Player, Team } from "@/lib/types";
import { cn } from "@/lib/cn";

export function TeamPicker({
  homeTeamId,
  awayTeamId,
  value,
  onChange,
}: {
  homeTeamId: string;
  awayTeamId: string;
  value: string | null;
  onChange: (teamId: string) => void;
}) {
  const home = useTeam(homeTeamId);
  const away = useTeam(awayTeamId);
  if (!home || !away) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {[home, away].map((t: Team) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-colors tap-target",
            value === t.id
              ? "border-brand-300 bg-brand-300/10"
              : "border-ink-700/60 bg-ink-800/40 hover:border-ink-500"
          )}
        >
          <TeamCrest team={t} size="lg" />
          <span className="text-sm font-semibold text-ink-50">{t.shortName}</span>
        </button>
      ))}
    </div>
  );
}

export function PlayerGrid({
  players,
  value,
  onChange,
  excludeId,
  emptyLabel = "No players available.",
}: {
  players: Player[];
  value: string | null;
  onChange: (playerId: string) => void;
  excludeId?: string | null;
  emptyLabel?: string;
}) {
  const list = players.filter((p) => p.id !== excludeId);
  if (list.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-500">{emptyLabel}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {list.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors tap-target",
            value === p.id
              ? "border-brand-300 bg-brand-300/10"
              : "border-ink-700/50 bg-ink-800/40 hover:border-ink-500"
          )}
        >
          <PlayerAvatar name={p.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink-50">{p.name}</p>
            <p className="text-[10px] text-ink-500">
              #{p.shirtNumber} · {p.position}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

export function MinuteStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="tap-target flex h-11 w-11 items-center justify-center rounded-full bg-ink-800 text-ink-200 active:scale-95"
      >
        <Minus size={18} />
      </button>
      <div className="flex flex-col items-center">
        <span className="font-display text-3xl font-bold tabular-nums text-ink-50">{value}&apos;</span>
        <span className="text-[10px] uppercase tracking-wide text-ink-500">Minute</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="tap-target flex h-11 w-11 items-center justify-center rounded-full bg-ink-800 text-ink-200 active:scale-95"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
