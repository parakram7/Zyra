"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Radio, Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar, TeamCrest } from "@/components/ui/avatar";
import { MatchStatusBadge } from "@/components/ui/badge";
import { MatchTimeline } from "@/components/timeline";
import { LineupList } from "@/components/lineup-list";
import { useMatch, usePlayers, useTeam } from "@/lib/hooks";
import { computePlayerStatsForMatch } from "@/lib/stats";
import { formatMatchDateTime } from "@/lib/format";
import { formatKickoffCountdown, formatMinute, getLiveMinute } from "@/lib/match-clock";

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = useMatch(params.id);
  const home = useTeam(match?.homeTeamId);
  const away = useTeam(match?.awayTeamId);
  const allPlayers = usePlayers();

  if (!match || !home || !away) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-10 text-center text-sm text-ink-500">
        Match not found.
      </div>
    );
  }

  const matchPlayers = allPlayers.filter((p) => p.teamId === home.id || p.teamId === away.id);
  const potm =
    match.status === "COMPLETED"
      ? matchPlayers
          .map((p) => ({ player: p, stats: computePlayerStatsForMatch(match, p.id) }))
          .filter((r) => r.stats.appearances > 0)
          .sort((a, b) => {
            const scoreA = a.stats.goals * 3 + a.stats.assists * 2 - a.stats.redCards * 4 - a.stats.yellowCards;
            const scoreB = b.stats.goals * 3 + b.stats.assists * 2 - b.stats.redCards * 4 - b.stats.yellowCards;
            return scoreB - scoreA;
          })[0]
      : null;

  const readyForKickoff = !!match.homeLineup && !!match.awayLineup && match.status === "SCHEDULED";

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Match" backHref="/matches" />

      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-ink-700/50 px-5 py-3 text-center">
          <MatchStatusBadge
            status={match.status}
            minuteLabel={match.status === "LIVE" ? formatMinute(getLiveMinute(match), match.currentHalf) : undefined}
          />
        </div>
        <CardBody>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Link href={`/teams/${home.id}`} className="flex flex-col items-center gap-2.5 text-center">
              <TeamCrest team={home} size="xl" />
              <span className="text-sm font-semibold text-ink-50">{home.name}</span>
            </Link>

            <div className="flex flex-col items-center px-2">
              {match.status === "SCHEDULED" ? (
                <span className="font-display text-2xl font-bold text-ink-400">VS</span>
              ) : (
                <span className="font-display text-5xl font-bold tabular-nums text-ink-50">
                  {match.score.home}–{match.score.away}
                </span>
              )}
            </div>

            <Link href={`/teams/${away.id}`} className="flex flex-col items-center gap-2.5 text-center">
              <TeamCrest team={away} size="xl" />
              <span className="text-sm font-semibold text-ink-50">{away.name}</span>
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center gap-1.5 text-xs text-ink-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={12} /> {formatMatchDateTime(match.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {match.venue}
            </span>
            {match.status === "SCHEDULED" && (
              <span className="mt-1 font-semibold text-sky-400">{formatKickoffCountdown(match.date)}</span>
            )}
          </div>

          <div className="mt-6">
            {match.status === "LIVE" && (
              <Link href={`/matches/${match.id}/live`}>
                <Button size="lg" className="w-full">
                  <Radio size={16} /> Continue Live Scoring
                </Button>
              </Link>
            )}
            {match.status === "SCHEDULED" && !readyForKickoff && (
              <Link href={`/matches/${match.id}/setup`}>
                <Button size="lg" className="w-full">
                  Build Lineups
                </Button>
              </Link>
            )}
            {readyForKickoff && (
              <Link href={`/matches/${match.id}/setup`}>
                <Button size="lg" className="w-full">
                  Review Lineups &amp; Kick Off
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      {match.status === "COMPLETED" && potm && (
        <Card className="mb-6">
          <CardBody className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cardyellow/15">
              <Trophy size={20} className="text-cardyellow" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Player of the Match</p>
              <p className="truncate font-display text-base font-semibold text-ink-50">{potm.player.name}</p>
              <p className="text-xs text-ink-400">
                {potm.stats.goals > 0 && `${potm.stats.goals} goal${potm.stats.goals > 1 ? "s" : ""}`}
                {potm.stats.goals > 0 && potm.stats.assists > 0 && " · "}
                {potm.stats.assists > 0 && `${potm.stats.assists} assist${potm.stats.assists > 1 ? "s" : ""}`}
              </p>
            </div>
            <PlayerAvatar name={potm.player.name} size="md" />
          </CardBody>
        </Card>
      )}

      {(match.homeLineup || match.awayLineup) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Lineups</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <LineupList lineup={match.homeLineup} title={home.shortName} />
            <LineupList lineup={match.awayLineup} title={away.shortName} />
          </CardBody>
        </Card>
      )}

      {match.events.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Match Timeline</CardTitle>
          </CardHeader>
          <CardBody>
            <MatchTimeline match={match} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
