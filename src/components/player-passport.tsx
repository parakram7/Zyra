"use client";

import Link from "next/link";
import { Cake, Footprints, MapPin, ShieldHalf } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat";
import { PlayerAvatar, TeamCrest } from "@/components/ui/avatar";
import { CardIcon, FootballIcon } from "@/components/icons";
import { useCompetitions, useMatches, usePlayer, useTeam } from "@/lib/hooks";
import { computePlayerCareerStats, computePlayerStatsForMatch } from "@/lib/stats";
import { calculateAge, formatMatchDate } from "@/lib/format";
import { POSITION_LABELS } from "@/lib/types";

export function PlayerPassport({
  playerId,
  title = "Player Passport",
  backHref,
}: {
  playerId: string;
  title?: string;
  backHref?: string;
}) {
  const player = usePlayer(playerId);
  const team = useTeam(player?.teamId);
  const matches = useMatches();
  const competitions = useCompetitions();

  if (!player || !team) {
    return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-sm text-ink-500">Player not found.</div>;
  }

  const playerMatches = matches.filter(
    (m) =>
      (m.homeTeamId === player.teamId || m.awayTeamId === player.teamId) &&
      m.status !== "SCHEDULED" &&
      (m.homeLineup?.startingXI.some((s) => s.playerId === player.id) ||
        m.homeLineup?.substitutes.includes(player.id) ||
        m.awayLineup?.startingXI.some((s) => s.playerId === player.id) ||
        m.awayLineup?.substitutes.includes(player.id))
  );

  const career = computePlayerCareerStats(matches, player.id);

  const recentMatches = [...playerMatches]
    .filter((m) => m.status === "COMPLETED")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const seasonRows = competitions
    .map((comp) => {
      const compMatches = playerMatches.filter((m) => m.competitionId === comp.id);
      if (compMatches.length === 0) return null;
      const stats = computePlayerCareerStats(compMatches, player.id);
      return { competition: comp, stats };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title={title} backHref={backHref} />

      <Card className="mb-6 overflow-hidden">
        <div
          className="relative h-28 w-full"
          style={{ background: `linear-gradient(135deg, ${team.crestColorFrom}, ${team.crestColorTo})` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,0,0,0.25),transparent_60%)]" />
        </div>
        <CardBody className="-mt-14">
          <div className="flex items-end justify-between">
            <PlayerAvatar
              name={player.name}
              size="xl"
              className="border-4 border-ink-900 text-3xl shadow-xl"
            />
            <div className="mb-1 flex flex-col items-end gap-1">
              <span className="font-display text-4xl font-extrabold text-white/20">#{player.shirtNumber}</span>
            </div>
          </div>

          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white">
            {player.name}
          </h2>
          <Link href={`/teams/${team.id}`} className="mt-1 flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-200">
            <TeamCrest team={team} size="xs" /> {team.name}
          </Link>

          <div className="mt-4 flex flex-wrap gap-2">
            <Pill icon={<ShieldHalf size={12} />} label={POSITION_LABELS[player.position]} />
            <Pill icon={<Footprints size={12} />} label={`${player.preferredFoot} footed`} />
            <Pill icon={<Cake size={12} />} label={`${calculateAge(player.dateOfBirth)} yrs · ${player.category}`} />
            <Pill icon={<MapPin size={12} />} label={player.nationality} />
          </div>

          {player.bio && <p className="mt-4 text-sm leading-relaxed text-ink-300">{player.bio}</p>}
        </CardBody>
      </Card>

      <div className="mb-6 grid grid-cols-3 gap-3 md:grid-cols-6">
        <StatTile label="Apps" value={career.appearances} accent />
        <StatTile label="Starts" value={career.starts} />
        <StatTile label="Goals" value={career.goals} accent />
        <StatTile label="Assists" value={career.assists} />
        <StatTile label="Yellows" value={career.yellowCards} />
        <StatTile label="Reds" value={career.redCards} />
      </div>
      <div className="mb-6 grid grid-cols-1">
        <StatTile label="Minutes Played" value={career.minutesPlayed} />
      </div>

      {seasonRows.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Season by Season</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="pb-2 font-semibold">Competition</th>
                    <th className="pb-2 text-center font-semibold">Apps</th>
                    <th className="pb-2 text-center font-semibold">Goals</th>
                    <th className="pb-2 text-center font-semibold">Assists</th>
                    <th className="pb-2 text-center font-semibold">YC</th>
                    <th className="pb-2 text-center font-semibold">RC</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonRows.map(({ competition, stats }) => (
                    <tr key={competition.id} className="border-t border-ink-800">
                      <td className="py-2.5 font-medium text-ink-100">
                        {competition.name}
                        <span className="ml-1.5 text-ink-500">{competition.season}</span>
                      </td>
                      <td className="py-2.5 text-center tabular-nums text-ink-200">{stats.appearances}</td>
                      <td className="py-2.5 text-center tabular-nums font-bold text-volt-300">{stats.goals}</td>
                      <td className="py-2.5 text-center tabular-nums text-ink-200">{stats.assists}</td>
                      <td className="py-2.5 text-center tabular-nums text-ink-200">{stats.yellowCards}</td>
                      <td className="py-2.5 text-center tabular-nums text-ink-200">{stats.redCards}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-1">
          {recentMatches.length === 0 && <p className="text-sm text-ink-500">No matches played yet.</p>}
          {recentMatches.map((m) => {
            const stats = computePlayerStatsForMatch(m, player.id);
            const isHome = m.homeTeamId === player.teamId;
            const oppId = isHome ? m.awayTeamId : m.homeTeamId;
            return (
              <MatchStatRow key={m.id} matchId={m.id} date={m.date} oppTeamId={oppId} scoreLine={`${m.score.home}-${m.score.away}`} stats={stats} />
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-ink-800/70 px-3 py-1.5 text-xs font-medium text-ink-300">
      {icon}
      {label}
    </span>
  );
}

function MatchStatRow({
  matchId,
  date,
  oppTeamId,
  scoreLine,
  stats,
}: {
  matchId: string;
  date: string;
  oppTeamId: string;
  scoreLine: string;
  stats: ReturnType<typeof computePlayerStatsForMatch>;
}) {
  const opp = useTeam(oppTeamId);
  if (!opp) return null;
  return (
    <Link
      href={`/matches/${matchId}`}
      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-ink-800/50"
    >
      <TeamCrest team={opp} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-100">vs {opp.name}</p>
        <p className="text-[11px] text-ink-500">{formatMatchDate(date)} · {scoreLine}</p>
      </div>
      <div className="flex items-center gap-2">
        {stats.goals > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-volt-300">
            <FootballIcon size={11} /> {stats.goals}
          </span>
        )}
        {stats.assists > 0 && <span className="text-xs font-bold text-sky-400">{stats.assists}A</span>}
        {stats.yellowCards > 0 && <CardIcon type="YELLOW_CARD" size={13} />}
        {stats.redCards > 0 && <CardIcon type="RED_CARD" size={13} />}
      </div>
    </Link>
  );
}
