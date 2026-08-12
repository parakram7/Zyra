"use client";

import Link from "next/link";
import { ArrowRight, Plus, Radio, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat";
import { TeamCrest, PlayerAvatar } from "@/components/ui/avatar";
import { MatchCard } from "@/components/match-card";
import { FootballIcon } from "@/components/icons";
import { useMatches, useTeam, useTeamPlayers, useTeams } from "@/lib/hooks";
import {
  computePlayerStatsForMatch,
  computeStandings,
  computeTeamStats,
  computeTopAssists,
  computeTopScorers,
} from "@/lib/stats";
import { DEMO_TEAM_ID } from "@/lib/seed-data";
import { formatMinute, getLiveMinute } from "@/lib/match-clock";
import { formatMatchDateTime } from "@/lib/format";

export default function HomePage() {
  const matches = useMatches();
  const teams = useTeams();
  const team = useTeam(DEMO_TEAM_ID);
  const teamPlayers = useTeamPlayers(DEMO_TEAM_ID);

  if (!team) return null;

  const liveMatch = matches.find((m) => m.status === "LIVE");
  const teamMatches = matches.filter(
    (m) => m.homeTeamId === DEMO_TEAM_ID || m.awayTeamId === DEMO_TEAM_ID
  );
  const upcoming = teamMatches
    .filter((m) => m.status === "SCHEDULED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);
  const recentCompleted = teamMatches
    .filter((m) => m.status === "COMPLETED")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastMatch = recentCompleted[0];

  const teamStats = computeTeamStats(matches, DEMO_TEAM_ID);
  const topScorers = computeTopScorers(matches, teamPlayers, teams, 3);
  const topAssists = computeTopAssists(matches, teamPlayers, teams, 3);
  const standings = computeStandings(
    matches,
    teams,
    teams.map((t) => t.id)
  );
  const leaguePosition = standings.findIndex((r) => r.team.id === DEMO_TEAM_ID) + 1;

  const lastMatchPerformers = lastMatch
    ? teamPlayers
        .map((p) => ({ player: p, stats: computePlayerStatsForMatch(lastMatch, p.id) }))
        .filter((p) => p.stats.goals > 0 || p.stats.assists > 0)
        .sort((a, b) => b.stats.goals + b.stats.assists - (a.stats.goals + a.stats.assists))
        .slice(0, 3)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-400">Welcome back,</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-50">
            {team.name}
          </h1>
        </div>
        <Link href="/matches/new" className="hidden md:block">
          <Button size="md">
            <Plus size={16} /> Start Match
          </Button>
        </Link>
      </div>

      {/* Mobile start match CTA */}
      <Link
        href="/matches/new"
        className="mb-5 flex items-center justify-between rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-card active:scale-[0.99] md:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <FootballIcon size={20} />
          </div>
          <div>
            <p className="font-display text-base font-semibold leading-tight">Start Match</p>
            <p className="text-xs font-medium text-white/70">Set up lineups &amp; go live</p>
          </div>
        </div>
        <ArrowRight size={18} />
      </Link>

      {/* Live match banner */}
      {liveMatch && (
        <Link
          href={`/matches/${liveMatch.id}/live`}
          className="mb-6 block overflow-hidden rounded-2xl border border-live/30 bg-gradient-to-br from-live/[0.14] via-ink-900 to-ink-900 p-5 shadow-card active:scale-[0.99]"
        >
          <div className="mb-3 flex items-center gap-2">
            <Radio size={14} className="animate-pulse-live text-live" />
            <span className="text-xs font-bold uppercase tracking-widest text-live">
              Live now · {formatMinute(getLiveMinute(liveMatch), liveMatch.currentHalf)}
            </span>
          </div>
          <LiveScoreRow matchId={liveMatch.id} homeTeamId={liveMatch.homeTeamId} awayTeamId={liveMatch.awayTeamId} home={liveMatch.score.home} away={liveMatch.score.away} />
          <div className="mt-3 text-center text-xs font-semibold text-live">Tap to open live scoring →</div>
        </Link>
      )}

      {/* Team overview + quick stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="League Pos" value={leaguePosition ? `${leaguePosition}${ordinalSuffix(leaguePosition)}` : "—"} accent />
        <StatTile label="Played" value={teamStats.played} />
        <StatTile label="Won" value={teamStats.wins} />
        <StatTile label="Goal Diff" value={teamStats.goalsFor - teamStats.goalsAgainst > 0 ? `+${teamStats.goalsFor - teamStats.goalsAgainst}` : teamStats.goalsFor - teamStats.goalsAgainst} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {/* Upcoming / recent matches */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-50">Matches</h2>
            <Link href="/matches" className="text-xs font-semibold text-brand-400">
              See all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
            {recentCompleted.slice(0, 2).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>

          {/* Recent performances */}
          {lastMatchPerformers.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 font-display text-lg font-semibold text-ink-50">Recent Performances</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {lastMatchPerformers.map(({ player, stats }) => (
                  <Link
                    href={`/players/${player.id}`}
                    key={player.id}
                    className="flex items-center gap-3 rounded-2xl border border-ink-700/40 bg-ink-850 p-4 transition-colors hover:border-ink-500/60"
                  >
                    <PlayerAvatar name={player.name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-50">{player.name}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-400">
                        {stats.goals > 0 && <span className="text-brand-400">{stats.goals}G</span>}
                        {stats.assists > 0 && <span className="text-sky-400">{stats.assists}A</span>}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Scorers</CardTitle>
              <TrendingUp size={16} className="text-brand-400" />
            </CardHeader>
            <CardBody className="pt-3">
              <LeaderList rows={topScorers} suffix="G" />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Assists</CardTitle>
              <TrendingUp size={16} className="text-sky-400" />
            </CardHeader>
            <CardBody className="pt-3">
              <LeaderList rows={topAssists} suffix="A" />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LiveScoreRow({
  homeTeamId,
  awayTeamId,
  home,
  away,
}: {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  home: number;
  away: number;
}) {
  const homeTeam = useTeam(homeTeamId);
  const awayTeam = useTeam(awayTeamId);
  if (!homeTeam || !awayTeam) return null;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="flex flex-col items-center gap-2">
        <TeamCrest team={homeTeam} size="lg" />
        <span className="text-sm font-semibold text-ink-50">{homeTeam.shortName}</span>
      </div>
      <span className="font-display text-4xl font-bold tabular-nums text-ink-50">
        {home}–{away}
      </span>
      <div className="flex flex-col items-center gap-2">
        <TeamCrest team={awayTeam} size="lg" />
        <span className="text-sm font-semibold text-ink-50">{awayTeam.shortName}</span>
      </div>
    </div>
  );
}

function LeaderList({
  rows,
  suffix,
}: {
  rows: { player: { id: string; name: string }; value: number }[];
  suffix: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-ink-500">No data yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <Link
          href={`/players/${row.player.id}`}
          key={row.player.id}
          className="flex items-center gap-3"
        >
          <span className="w-4 text-xs font-bold text-ink-500">{i + 1}</span>
          <PlayerAvatar name={row.player.name} size="sm" />
          <span className="flex-1 truncate text-sm font-medium text-ink-100">{row.player.name}</span>
          <span className="font-display text-sm font-bold text-brand-400">
            {row.value}
            <span className="ml-0.5 text-[10px] text-ink-500">{suffix}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function ordinalSuffix(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
