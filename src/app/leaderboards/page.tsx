"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PlayerAvatar } from "@/components/ui/avatar";
import { useMyMatches, useMyOrgId, useMyTeams, useOrganization, usePlayers } from "@/lib/hooks";
import { computePlayerCareerStats } from "@/lib/stats";
import { cn } from "@/lib/cn";

const TABS = ["Goals", "Assists", "Appearances", "Discipline"] as const;
type Tab = (typeof TABS)[number];

export default function LeaderboardsPage() {
  const [tab, setTab] = useState<Tab>("Goals");
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
        const value =
          tab === "Goals"
            ? career.goals
            : tab === "Assists"
              ? career.assists
              : tab === "Appearances"
                ? career.appearances
                : career.yellowCards + career.redCards * 2;
        return { player, team, career, value };
      })
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 25);
  }, [players, matches, teams, tab]);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Leaderboards" subtitle={org ? `Top performers at ${org.name}` : "Top performers"} backHref="/profile" />

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors tap-target",
              tab === t ? "bg-ink-100 text-ink-900" : "bg-ink-800/70 text-ink-300 hover:text-ink-50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-ink-700/40 bg-ink-850 p-2">
        {rows.length === 0 && <p className="px-3 py-10 text-center text-sm text-ink-500">No data yet.</p>}
        {rows.map((row, i) => (
          <Link
            href={`/players/${row.player.id}`}
            key={row.player.id}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-ink-800/50"
          >
            <span className="w-6 text-center text-sm font-bold text-ink-500">{i + 1}</span>
            <PlayerAvatar name={row.player.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-100">{row.player.name}</p>
              <p className="text-[11px] text-ink-500">{row.team?.name}</p>
            </div>
            <span className="font-display text-lg font-bold tabular-nums text-brand-400">{row.value}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
