"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PlayerAvatar } from "@/components/ui/avatar";
import { useMyMatches, useMyOrgId, useMyTeams, useOrganization, usePlayers } from "@/lib/hooks";
import { computePlayerCareerStats } from "@/lib/stats";
import { cn } from "@/lib/cn";

const SORTS = ["G", "A", "G+A", "Mins", "YC", "RC"] as const;
type Sort = (typeof SORTS)[number];

export default function LeaderboardsPage() {
  const [sort, setSort] = useState<Sort>("G+A");
  const teams = useMyTeams();
  const matches = useMyMatches();
  const allPlayers = usePlayers();
  const org = useOrganization(useMyOrgId());

  const teamIds = useMemo(() => new Set(teams.map((t) => t.id)), [teams]);
  const players = useMemo(() => allPlayers.filter((p) => teamIds.has(p.teamId)), [allPlayers, teamIds]);

  const rows = useMemo(() => {
    return players
      .map((player) => {
        const career = computePlayerCareerStats(matches, player.id);
        const team = teams.find((t) => t.id === player.teamId);
        const ga = career.goals + career.assists;
        return { player, team, career, ga };
      })
      .filter((r) => r.career.appearances > 0)
      .sort((a, b) => {
        const val =
          sort === "G"
            ? b.career.goals - a.career.goals
            : sort === "A"
              ? b.career.assists - a.career.assists
              : sort === "G+A"
                ? b.ga - a.ga
                : sort === "Mins"
                  ? b.career.minutesPlayed - a.career.minutesPlayed
                  : sort === "YC"
                    ? b.career.yellowCards - a.career.yellowCards
                    : b.career.redCards - a.career.redCards;
        return val !== 0 ? val : b.ga - a.ga;
      });
  }, [players, matches, teams, sort]);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Stats" subtitle={org ? `Every player at ${org.name}` : "Every player"} backHref="/profile" />

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

      <div className="table-wrap overflow-x-auto rounded-2xl border border-ink-700/40 bg-ink-850">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-800 text-[11px] uppercase tracking-wide text-ink-500">
              <th className="py-3 pl-4 font-semibold">#</th>
              <th className="py-3 font-semibold">Player</th>
              <th className="py-3 text-center font-semibold">MP</th>
              <th className="py-3 text-center font-semibold">G</th>
              <th className="py-3 text-center font-semibold">A</th>
              <th className="py-3 text-center font-semibold">G+A</th>
              <th className="py-3 text-center font-semibold">Mins</th>
              <th className="py-3 text-center font-semibold">YC</th>
              <th className="py-3 pr-4 text-center font-semibold">RC</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink-500">
                  No data yet.
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
                  {row.ga}
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
