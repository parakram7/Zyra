"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Plus, Radio, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat";
import { TeamCrest, PlayerAvatar } from "@/components/ui/avatar";
import { MatchCard } from "@/components/match-card";
import { FootballIcon } from "@/components/icons";
import { useMyCompetitions, useMyMatches, useMyTeams, usePlayers, useTeam, useTeamPlayers } from "@/lib/hooks";
import { computePlayerCareerStats, computeStandings, computeTeamStats } from "@/lib/stats";
import { formatMinute, getLiveMinute } from "@/lib/match-clock";

export default function HomePage() {
  const matches = useMyMatches();
  const teams = useMyTeams();
  const competitions = useMyCompetitions();
  const allPlayers = usePlayers();
  const primaryTeamId = teams[0]?.id;
  const team = useTeam(primaryTeamId);
  const teamPlayers = useTeamPlayers(primaryTeamId);

  if (!team) return null;

  // The tournament to send "Stats" to: whichever has a match live right
  // now, else whichever played most recently, else the org's first one.
  const activeCompetition = [...competitions].sort((a, b) => {
    const lastMatchTime = (compId: string) =>
      Math.max(0, ...matches.filter((m) => m.competitionId === compId).map((m) => new Date(m.date).getTime()));
    const aLive = matches.some((m) => m.competitionId === a.id && m.status === "LIVE") ? Infinity : lastMatchTime(a.id);
    const bLive = matches.some((m) => m.competitionId === b.id && m.status === "LIVE") ? Infinity : lastMatchTime(b.id);
    return bLive - aLive;
  })[0];
  const statsPlayers = activeCompetition
    ? allPlayers.filter((p) => activeCompetition.teamIds.includes(p.teamId))
    : teamPlayers;
  const statsMatches = activeCompetition
    ? matches.filter((m) => m.competitionId === activeCompetition.id)
    : matches;
  const statsHref = activeCompetition ? `/competitions/${activeCompetition.id}?tab=stats` : "/leaderboards";

  const liveMatch = matches.find((m) => m.status === "LIVE");
  const teamMatches = matches.filter(
    (m) => m.homeTeamId === primaryTeamId || m.awayTeamId === primaryTeamId
  );
  const upcoming = teamMatches
    .filter((m) => m.status === "SCHEDULED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);
  const recentCompleted = teamMatches
    .filter((m) => m.status === "COMPLETED")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const teamStats = computeTeamStats(matches, primaryTeamId);
  const topByGA = statsPlayers
    .map((p) => ({ player: p, career: computePlayerCareerStats(statsMatches, p.id) }))
    .filter((r) => r.career.goals + r.career.assists > 0)
    .sort((a, b) => b.career.goals + b.career.assists - (a.career.goals + a.career.assists))
    .slice(0, 3);
  const standings = computeStandings(
    matches,
    teams,
    teams.map((t) => t.id)
  );
  const leaguePosition = standings.findIndex((r) => r.team.id === primaryTeamId) + 1;

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
            {upcoming.length === 0 && recentCompleted.length === 0 && (
              <p className="text-sm text-ink-500">No matches yet.</p>
            )}
          </div>
        </div>

        <Link href={statsHref} className="block">
          <Card className="transition-colors hover:border-ink-500/60">
            <CardHeader>
              <CardTitle>{activeCompetition ? `${activeCompetition.name} Stats` : "Stats"}</CardTitle>
              <div className="flex items-center gap-1 text-brand-400">
                <TrendingUp size={16} />
                <ChevronRight size={15} />
              </div>
            </CardHeader>
            <CardBody className="pt-3">
              {topByGA.length === 0 ? (
                <p className="text-sm text-ink-500">No data yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {topByGA.map(({ player, career }, i) => (
                    <div key={player.id} className="flex items-center gap-3">
                      <span className="w-4 text-xs font-bold text-ink-500">{i + 1}</span>
                      <PlayerAvatar name={player.name} size="sm" />
                      <span className="flex-1 truncate text-sm font-medium text-ink-100">{player.name}</span>
                      <span className="font-display text-sm font-bold text-brand-400">
                        {career.goals + career.assists}
                        <span className="ml-0.5 text-[10px] text-ink-500">G+A</span>
                      </span>
                    </div>
                  ))}
                  <p className="mt-1 text-center text-[11px] font-semibold text-ink-500">See full stats →</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Link>
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

function ordinalSuffix(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
