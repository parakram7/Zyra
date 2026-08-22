"use client";

import Link from "next/link";
import { MapPin, School } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useCompetitions, useOrganizations, useTeams } from "@/lib/hooks";

export default function DiscoverPage() {
  const organizations = useOrganizations();
  const teams = useTeams();
  const competitions = useCompetitions();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Discover" subtitle="Every school and club running tournaments on Zyra" backHref="/competitions" />

      <div className="grid gap-3 sm:grid-cols-2">
        {organizations.map((org) => {
          const teamCount = teams.filter((t) => t.orgId === org.id).length;
          const compCount = competitions.filter((c) => c.orgId === org.id).length;
          return (
            <Link
              key={org.id}
              href={`/discover/${org.id}`}
              className="flex items-center gap-4 rounded-2xl border border-ink-700/40 bg-ink-850 p-5 transition-colors hover:border-ink-500/60"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-400/15">
                <School size={20} className="text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-ink-50">{org.name}</p>
                {org.city && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
                    <MapPin size={11} /> {org.city}
                  </p>
                )}
                <p className="mt-1 text-xs text-ink-500">
                  {teamCount} teams · {compCount} competitions
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {organizations.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-500">No organizations yet.</p>
      )}
    </div>
  );
}
