"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TeamCrest } from "@/components/ui/avatar";
import { useMatches, useTeams } from "@/lib/hooks";
import { computeTeamStats } from "@/lib/stats";

export default function TeamsPage() {
  const teams = useTeams();
  const matches = useMatches();

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Teams" subtitle="Squads across the Metro Youth League" />

      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map((team) => {
          const stats = computeTeamStats(matches, team.id);
          return (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="flex items-center gap-4 rounded-2xl border border-ink-700/40 bg-ink-850 p-4 transition-colors hover:border-ink-500/60"
            >
              <TeamCrest team={team} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-semibold text-ink-50">{team.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
                  <MapPin size={11} /> {team.city} · {team.category}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  {stats.played} played · {stats.wins}W {stats.draws}D {stats.losses}L
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
