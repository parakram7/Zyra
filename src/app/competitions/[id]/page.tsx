"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { MatchCard } from "@/components/match-card";
import { KnockoutBracket, type BracketRound } from "@/components/knockout-bracket";
import { StatsTable } from "@/components/stats-table";
import { TeamCrest } from "@/components/ui/avatar";
import { useCompetitions, useMatches, usePlayers, useTeams } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/supabase/auth";
import { computeStandings, type StandingsRow } from "@/lib/stats";
import { roundLabel, slotKey } from "@/lib/knockout";
import { cn } from "@/lib/cn";
import type { Competition, KnockoutSlot, Match, Team } from "@/lib/types";

const TABS = ["Standings", "Fixtures", "Stats"] as const;
type Tab = (typeof TABS)[number];

export default function CompetitionDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <CompetitionDetailPageInner params={params} />
    </Suspense>
  );
}

function CompetitionDetailPageInner({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const initialTab = TABS.find((t) => t.toLowerCase() === searchParams.get("tab")) ?? "Standings";

  const competitions = useCompetitions();
  const teams = useTeams();
  const players = usePlayers();
  const matches = useMatches();
  const generateGroupFixtures = useZyraStore((s) => s.generateGroupFixtures);
  const user = useAuthUser();
  const canEdit = !isSupabaseConfigured() || !!user;
  const [tab, setTab] = useState<Tab>(initialTab);
  const [groupFilter, setGroupFilter] = useState<string>("all");

  const competition = competitions.find((c) => c.id === params.id);
  if (!competition) {
    return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-sm text-ink-500">Competition not found.</div>;
  }

  const compMatches = matches.filter((m) => m.competitionId === competition.id);
  const compPlayers = players.filter((p) => competition.teamIds.includes(p.teamId));
  const standings = computeStandings(compMatches, teams, competition.teamIds);

  function groupOf(match: Match): string | null {
    if (!competition!.groups) return null;
    const g = competition!.groups.find(
      (grp) => grp.teamIds.includes(match.homeTeamId) && grp.teamIds.includes(match.awayTeamId)
    );
    return g?.label ?? null;
  }

  const visibleMatches = compMatches
    .filter((m) => groupFilter === "all" || groupOf(m) === groupFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title={competition.name} subtitle={competition.season} backHref="/competitions" />

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

      {tab === "Standings" && competition.format !== "groups" && (
        <StandingsTable rows={standings} />
      )}

      {tab === "Standings" && competition.format === "groups" && (
        <GroupsAndKnockout competition={competition} teams={teams} matches={compMatches} />
      )}

      {tab === "Fixtures" && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {competition.format === "groups" && competition.groups && competition.groups.length > 0 ? (
              <Select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="!w-auto"
              >
                <option value="all">All Groups</option>
                {competition.groups.map((g) => (
                  <option key={g.label} value={g.label}>
                    Group {g.label}
                  </option>
                ))}
              </Select>
            ) : (
              <span />
            )}
            {canEdit && competition.format === "groups" && (
              <Button size="sm" variant="outline" onClick={() => generateGroupFixtures(competition.id)}>
                <Shuffle size={14} /> Generate Fixtures
              </Button>
            )}
          </div>

          {visibleMatches.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-700 py-16 text-center">
              <p className="text-sm text-ink-500">
                {compMatches.length === 0 ? "No fixtures scheduled yet." : "No fixtures in this group yet."}
              </p>
              {canEdit && compMatches.length === 0 && (
                <p className="max-w-xs text-xs text-ink-600">
                  {competition.format === "groups"
                    ? "Tap “Generate Fixtures” above to round-robin every group automatically, or add matches one at a time from Matches → New."
                    : "Add matches for this competition from Matches → New."}
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Stats" && <StatsTable players={compPlayers} matches={compMatches} teams={teams} />}
    </div>
  );
}

function StandingsTable({ rows }: { rows: StandingsRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-700/40 bg-ink-850">
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
          {rows.map((row, i) => (
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
              <td className="py-3 pr-4 text-center font-display font-bold tabular-nums text-brand-400">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupsAndKnockout({
  competition,
  teams,
  matches,
}: {
  competition: Competition;
  teams: Team[];
  matches: Match[];
}) {
  const groups = competition.groups ?? [];

  function slotTeam(slot: KnockoutSlot): Team | undefined {
    const g = groups.find((x) => x.label === slot.group);
    const teamId = g?.teamIds[slot.rank - 1];
    return teamId ? teams.find((t) => t.id === teamId) : undefined;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-ink-50">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-400/15 text-[11px] font-extrabold text-sky-400">
                {g.label}
              </span>
              Group {g.label}
            </p>
            <StandingsTable rows={computeStandings(matches, teams, g.teamIds)} />
          </div>
        ))}
      </div>

      {(competition.knockoutPairs?.length ?? 0) > 0 && (
        <div>
          <p className="mb-4 font-display text-sm font-bold text-ink-50">Knockout Draw</p>
          <KnockoutBracket rounds={buildBracketRounds(competition.knockoutPairs!, slotTeam)} />
        </div>
      )}
    </div>
  );
}

function bracketSide(team: Team | undefined, slot: KnockoutSlot) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {team ? <TeamCrest team={team} size="xs" /> : <div className="h-5 w-5 shrink-0 rounded-md bg-ink-700" />}
      <span className="truncate">{team ? team.name : `${slotKey(slot)} · TBD`}</span>
    </div>
  );
}

function buildBracketRounds(
  pairs: Competition["knockoutPairs"],
  slotTeam: (slot: KnockoutSlot) => Team | undefined
): BracketRound[] {
  if (!pairs || pairs.length === 0) return [];

  const rounds: BracketRound[] = [
    {
      title: roundLabel(pairs.length),
      matches: pairs.map((pair) => ({
        top: bracketSide(slotTeam(pair.home), pair.home),
        bottom: bracketSide(slotTeam(pair.away), pair.away),
      })),
    },
  ];

  let count = pairs.length / 2;
  let prevPrefix = "M";
  while (count >= 1) {
    const label = roundLabel(count);
    rounds.push({
      title: label,
      matches: Array.from({ length: count }).map((_, i) => ({
        top: <span className="text-ink-400">Winner {prevPrefix}{i * 2 + 1}</span>,
        bottom: <span className="text-ink-400">Winner {prevPrefix}{i * 2 + 2}</span>,
      })),
    });
    prevPrefix = label === "Final" ? "F" : label.slice(0, 2).toUpperCase();
    if (count === 1) break;
    count = count / 2;
  }

  return rounds;
}
