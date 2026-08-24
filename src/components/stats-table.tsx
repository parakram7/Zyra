"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/ui/avatar";
import { computePlayerCareerStats } from "@/lib/stats";
import { cn } from "@/lib/cn";
import type { Match, Player, Team } from "@/lib/types";

const SORTS = ["G", "A", "G+A", "Mins", "YC", "RC"] as const;
type Sort = (typeof SORTS)[number];

function statValue(career: ReturnType<typeof computePlayerCareerStats>, sort: Sort): number {
  switch (sort) {
    case "G":
      return career.goals;
    case "A":
      return career.assists;
    case "G+A":
      return career.goals + career.assists;
    case "Mins":
      return career.minutesPlayed;
    case "YC":
      return career.yellowCards;
    case "RC":
      return career.redCards;
  }
}

export function StatsTable({ players, matches, teams }: { players: Player[]; matches: Match[]; teams: Team[] }) {
  const [sort, setSort] = useState<Sort>("G+A");

  const rows = players
    .map((player) => {
      const career = computePlayerCareerStats(matches, player.id);
      const team = teams.find((t) => t.id === player.teamId);
      return { player, team, career, value: statValue(career, sort) };
    })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value || b.career.goals + b.career.assists - (a.career.goals + a.career.assists));

  return (
    <div>
      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {SORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors tap-target",
              sort === s ? "bg-ink-100 text-ink-900" : "bg-ink-800/70 text-ink-300 hover:text-ink-50"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-700/40 bg-ink-850">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-800 text-[11px] uppercase tracking-wide text-ink-500">
              <th className="py-3 pl-4 font-semibold">#</th>
              <th className="py-3 font-semibold">Player</th>
              <th className="py-3 text-center font-semibold">MP</th>
              <th className={cn("py-3 text-center font-semibold", sort === "G" && "text-ink-200")}>G</th>
              <th className={cn("py-3 text-center font-semibold", sort === "A" && "text-ink-200")}>A</th>
              <th className={cn("py-3 text-center font-semibold", sort === "G+A" && "text-ink-200")}>G+A</th>
              <th className={cn("py-3 text-center font-semibold", sort === "Mins" && "text-ink-200")}>Mins</th>
              <th className={cn("py-3 text-center font-semibold", sort === "YC" && "text-ink-200")}>YC</th>
              <th className={cn("py-3 pr-4 text-center font-semibold", sort === "RC" && "text-ink-200")}>RC</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink-500">
                  No {sort === "G+A" ? "goal or assist" : sort} data yet.
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.player.id} className="border-b border-ink-800/60 last:border-none">
                <td className="py-3 pl-4 text-ink-400">{i + 1}</td>
                <td className="py-3">
                  <Link href={`/players/${row.player.id}`} className="flex items-center gap-2.5">
                    <PlayerAvatar name={row.player.name} size="xs" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-100">{row.player.name}</p>
                      <p className="text-[10.5px] text-ink-500">{row.team?.name}</p>
                    </div>
                  </Link>
                </td>
                <td className="py-3 text-center tabular-nums text-ink-300">{row.career.appearances}</td>
                <td className={cn("py-3 text-center tabular-nums", sort === "G" ? "font-bold text-brand-400" : "text-ink-300")}>
                  {row.career.goals}
                </td>
                <td className={cn("py-3 text-center tabular-nums", sort === "A" ? "font-bold text-sky-400" : "text-ink-300")}>
                  {row.career.assists}
                </td>
                <td className={cn("py-3 text-center font-display tabular-nums", sort === "G+A" ? "font-bold text-brand-400" : "text-ink-300")}>
                  {row.career.goals + row.career.assists}
                </td>
                <td className={cn("py-3 text-center tabular-nums", sort === "Mins" ? "font-bold text-ink-100" : "text-ink-400")}>
                  {row.career.minutesPlayed}&apos;
                </td>
                <td className={cn("py-3 text-center tabular-nums", sort === "YC" ? "font-bold text-cardyellow" : "text-ink-400")}>
                  {row.career.yellowCards}
                </td>
                <td className={cn("py-3 pr-4 text-center tabular-nums", sort === "RC" ? "font-bold text-cardred" : "text-ink-400")}>
                  {row.career.redCards}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
