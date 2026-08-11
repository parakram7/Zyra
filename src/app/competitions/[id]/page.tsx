"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { MatchCard } from "@/components/match-card";
import { TeamCrest, PlayerAvatar } from "@/components/ui/avatar";
import { useCompetitions, useMatches, usePlayers, useTeams } from "@/lib/hooks";
import { computeStandings, computeTopAssists, computeTopScorers } from "@/lib/stats";
import { cn } from "@/lib/cn";

const TABS = ["Standings", "Fixtures", "Top Scorers", "Top Assists"] as const;
type Tab = (typeof TABS)[number];

export default function CompetitionDetailPage({ params }: { params: { id: string } }) {
  const competitions = useCompetitions();
  const teams = useTeams();
  const players = usePlayers();
  const matches = useMatches();
  const [tab, setTab] = useState<Tab>("Standings");

  const competition = competitions.find((c) => c.id === params.id);
  if (!competition) {
    return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-sm text-ink-500">Competition not found.</div>;
  }

  const compMatches = matches.filter((m) => m.competitionId === competition.id);
  const compPlayers = players.filter((p) => competition.teamIds.includes(p.teamId));
  const standings = computeStandings(compMatches, teams, competition.teamIds);
  const topScorers = computeTopScorers(compMatches, compPlayers, teams, 10);
  const topAssists = computeTopAssists(compMatches, compPlayers, teams, 10);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title={competition.name} subtitle={competition.season} backHref="/competitions" />

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors tap-target",
              tab === t ? "bg-volt-300 text-ink-950" : "bg-ink-800/70 text-ink-300 hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Standings" && (
        <div className="overflow-x-auto rounded-2xl border border-ink-700/50 bg-ink-900/60">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-[11px] uppercase tracking-wide text-ink-500">
                <th className="py-3 pl-4 font-semibold">#</th>
                <th className="py-3 font-semibold">Team</th>
                <th className="py-3 text-center font-semibold">P</th>
                <th className="py-3 text-center font-semibold">W</th>
                <th className="py-3 text-center font-semibold">D</th>
                <th className="py-3 text-center font-semibold">L</th>
                <th className="py-3 text-center font-semibold">GF</th>
                <th className="py-3 text-center font-semibold">GA</th>
                <th className="py-3 text-center font-semibold">GD</th>
                <th className="py-3 pr-4 text-center font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => (
                <tr key={row.team.id} className="border-b border-ink-800/60 last:border-none">
                  <td className="py-3 pl-4 text-ink-400">{i + 1}</td>
                  <td className="py-3">
                    <Link href={`/teams/${row.team.id}`} className="flex items-center gap-2.5">
                      <TeamCrest team={row.team} size="xs" />
                      <span className="font-medium text-ink-100">{row.team.name}</span>
                    </Link>
                  </td>
                  <td className="py-3 text-center tabular-nums text-ink-300">{row.played}</td>
                  <td className="py-3 text-center tabular-nums text-ink-300">{row.wins}</td>
                  <td className="py-3 text-center tabular-nums text-ink-300">{row.draws}</td>
                  <td className="py-3 text-center tabular-nums text-ink-300">{row.losses}</td>
                  <td className="py-3 text-center tabular-nums text-ink-300">{row.goalsFor}</td>
                  <td className="py-3 text-center tabular-nums text-ink-300">{row.goalsAgainst}</td>
                  <td className="py-3 text-center tabular-nums text-ink-300">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="py-3 pr-4 text-center font-display font-bold tabular-nums text-volt-300">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Fixtures" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {compMatches
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
        </div>
      )}

      {(tab === "Top Scorers" || tab === "Top Assists") && (
        <div className="rounded-2xl border border-ink-700/50 bg-ink-900/60 p-2">
          {(tab === "Top Scorers" ? topScorers : topAssists).length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-500">No data yet.</p>
          )}
          {(tab === "Top Scorers" ? topScorers : topAssists).map((row, i) => (
            <Link
              href={`/players/${row.player.id}`}
              key={row.player.id}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-ink-800/50"
            >
              <span className="w-5 text-center text-xs font-bold text-ink-500">{i + 1}</span>
              <PlayerAvatar name={row.player.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-100">{row.player.name}</p>
                <p className="text-[11px] text-ink-500">{row.team?.name}</p>
              </div>
              <span className="font-display text-lg font-extrabold tabular-nums text-volt-300">
                {row.value}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
