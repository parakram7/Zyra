"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useCompetitions, useTeams } from "@/lib/hooks";

export default function CompetitionsPage() {
  const competitions = useCompetitions();
  const teams = useTeams();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Competitions" subtitle="Leagues and tournaments" />

      <div className="grid gap-3 sm:grid-cols-2">
        {competitions.map((comp) => (
          <Link
            key={comp.id}
            href={`/competitions/${comp.id}`}
            className="flex items-center gap-4 rounded-2xl border border-ink-700/40 bg-ink-850 p-5 transition-colors hover:border-ink-500/60"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-300/15">
              <Trophy size={22} className="text-brand-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-ink-50">{comp.name}</p>
              <p className="text-xs text-ink-400">
                {comp.season} · {comp.teamIds.length} teams
              </p>
              <p className="mt-1 truncate text-xs text-ink-500">
                {comp.teamIds
                  .map((id) => teams.find((t) => t.id === id)?.shortName)
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
