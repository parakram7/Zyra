"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat";
import { PlayerAvatar } from "@/components/ui/avatar";
import { MatchCard } from "@/components/match-card";
import { useTeam, useTeamMatches, useTeamPlayers } from "@/lib/hooks";
import { computePlayerCareerStats, computeTeamStats } from "@/lib/stats";
import { POSITION_LABELS, type Position } from "@/lib/types";
import { useZyraStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/supabase/auth";

const POSITION_ORDER: Position[] = ["GK", "DF", "MF", "FW"];

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const team = useTeam(params.id);
  const players = useTeamPlayers(params.id);
  const matches = useTeamMatches(params.id);
  const deleteTeam = useZyraStore((s) => s.deleteTeam);
  const deletePlayer = useZyraStore((s) => s.deletePlayer);
  const user = useAuthUser();
  const canEdit = !isSupabaseConfigured() || !!user;

  if (!team) {
    return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-sm text-ink-500">Team not found.</div>;
  }

  function handleDeleteTeam() {
    if (!team) return;
    if (!window.confirm(`Delete ${team.name} and all its players? This can't be undone.`)) return;
    deleteTeam(team.id);
    router.push("/teams");
  }

  function handleDeletePlayer(playerId: string, playerName: string) {
    if (!window.confirm(`Remove ${playerName} from the squad?`)) return;
    deletePlayer(playerId);
  }

  const stats = computeTeamStats(matches, team.id);
  const upcoming = matches
    .filter((m) => m.status === "SCHEDULED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const live = matches.filter((m) => m.status === "LIVE");
  const completed = matches
    .filter((m) => m.status === "COMPLETED")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader
        title={team.name}
        backHref="/teams"
        action={
          canEdit && (
            <Link href={`/teams/${team.id}/players/new`}>
              <Button size="sm">
                <Plus size={15} /> Player
              </Button>
            </Link>
          )
        }
      />

      <Card className="mb-6 overflow-hidden">
        <div
          className="h-24 w-full"
          style={{ background: `linear-gradient(135deg, ${team.crestColorFrom}, ${team.crestColorTo})` }}
        />
        <CardBody className="-mt-10">
          <div className="flex items-end gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-ink-900 font-display text-2xl font-extrabold text-ink-950 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${team.crestColorFrom}, ${team.crestColorTo})` }}
            >
              {team.shortName}
            </div>
            <div className="pb-1">
              <h2 className="font-display text-xl font-bold text-ink-50">{team.name}</h2>
              <p className="flex items-center gap-1 text-xs text-ink-400">
                <MapPin size={11} /> {team.city} · {team.homeGround}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-500">{team.category} · Founded {team.foundedYear}</p>
        </CardBody>
      </Card>

      <div className="mb-6 grid grid-cols-3 gap-3 md:grid-cols-6">
        <StatTile label="Played" value={stats.played} />
        <StatTile label="Won" value={stats.wins} accent />
        <StatTile label="Drawn" value={stats.draws} />
        <StatTile label="Lost" value={stats.losses} />
        <StatTile label="GF" value={stats.goalsFor} />
        <StatTile label="GA" value={stats.goalsAgainst} />
      </div>

      {(live.length > 0 || upcoming.length > 0) && (
        <div className="mb-6">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-50">Fixtures</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
            {upcoming.slice(0, 2).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <CardHeader className="mb-3 px-0">
          <CardTitle>Squad</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-5">
          {POSITION_ORDER.map((pos) => {
            const group = players
              .filter((p) => p.position === pos)
              .sort((a, b) => a.shirtNumber - b.shirtNumber);
            if (group.length === 0) return null;
            return (
              <div key={pos}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  {POSITION_LABELS[pos]}s
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.map((p) => {
                    const career = computePlayerCareerStats(matches, p.id);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-xl border border-ink-700/40 bg-ink-850 px-3 py-2.5 transition-colors hover:border-ink-600"
                      >
                        <Link href={`/players/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="w-5 text-center font-display text-xs font-bold text-ink-500">
                            {p.shirtNumber}
                          </span>
                          <PlayerAvatar name={p.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink-50">{p.name}</p>
                            <p className="text-[11px] text-ink-500">
                              {career.appearances} apps
                              {career.goals > 0 && ` · ${career.goals}G`}
                              {career.assists > 0 && ` · ${career.assists}A`}
                            </p>
                          </div>
                        </Link>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleDeletePlayer(p.id, p.name)}
                            aria-label={`Remove ${p.name}`}
                            className="tap-target flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-cardred/10 hover:text-cardred"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {completed.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink-50">
            <CalendarDays size={17} /> Recent Results
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {completed.slice(0, 4).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}

      {canEdit && (
        <div className="mb-10">
          <Button variant="danger" size="sm" onClick={handleDeleteTeam}>
            <Trash2 size={15} /> Delete Team
          </Button>
        </div>
      )}
    </div>
  );
}
