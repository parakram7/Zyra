"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { StatsTable } from "@/components/stats-table";
import { useMyMatches, useMyOrgId, useMyTeams, useOrganization, usePlayers } from "@/lib/hooks";

export default function LeaderboardsPage() {
  const teams = useMyTeams();
  const matches = useMyMatches();
  const allPlayers = usePlayers();
  const org = useOrganization(useMyOrgId());

  const teamIds = useMemo(() => new Set(teams.map((t) => t.id)), [teams]);
  const players = useMemo(() => allPlayers.filter((p) => teamIds.has(p.teamId)), [allPlayers, teamIds]);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Stats" subtitle={org ? `Every player at ${org.name}` : "Every player"} backHref="/profile" />
      <StatsTable players={players} matches={matches} teams={teams} />
    </div>
  );
}
