"use client";

import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useMyCompetitions, useTeams } from "@/lib/hooks";

export default function CompetitionsPage() {
  const competitions = useMyCompetitions();
  const teams = useTeams();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader
        title="Competitions"
        subtitle="Leagues and tournaments"
        action={
          <Link href="/competitions/new">
            <Button size="sm">
              <Plus size={15} /> New
            </Button>
          </Link>
        }
      />

      <Link
        href="/discover"
        className="mb-5 flex items-center justify-between rounded-2xl border border-ink-700/40 bg-ink-850 px-4 py-3.5 text-sm transition-colors hover:border-ink-500/60"
      >
        <span className="font-medium text-ink-100">Discover tournaments from other schools</span>
        <span className="text-brand-400">Browse →</span>
      </Link>

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
                {comp.season} · {comp.format === "groups" ? "Groups + Knockout" : "League"} · {comp.teamIds.length} teams
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
