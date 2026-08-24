"use client";

import Link from "next/link";
import { MapPin, Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TeamCrest } from "@/components/ui/avatar";
import { useCompetitions, useOrganization, useTeams } from "@/lib/hooks";

export default function DiscoverOrgPage({ params }: { params: { orgId: string } }) {
  const org = useOrganization(params.orgId);
  const teams = useTeams().filter((t) => t.orgId === params.orgId);
  const competitions = useCompetitions().filter((c) => c.orgId === params.orgId);

  if (!org) {
    return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-sm text-ink-500">Organization not found.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title={org.name} subtitle={org.city || undefined} backHref="/discover" />

      <div className="mb-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-50">Competitions</h2>
        {competitions.length === 0 ? (
          <p className="text-sm text-ink-500">No competitions yet.</p>
        ) : (
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
                    {comp.season} · {comp.format === "groups" ? "Groups + Knockout" : "League"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-50">Teams</h2>
        {teams.length === 0 ? (
          <p className="text-sm text-ink-500">No teams yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {teams.map((team) => (
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
