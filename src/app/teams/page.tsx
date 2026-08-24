"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TeamCrest } from "@/components/ui/avatar";
import {
  useFollowingTeams,
  useMatches,
  useMyOrgId,
  useMyTeams,
  useOpponentTeams,
  useOrganization,
} from "@/lib/hooks";
import { computeTeamStats } from "@/lib/stats";
import { cn } from "@/lib/cn";
import type { Team } from "@/lib/types";

const TABS = ["Your", "Opponents", "Following"] as const;
type Tab = (typeof TABS)[number];

export default function TeamsPage() {
  const [tab, setTab] = useState<Tab>("Your");
  const myTeams = useMyTeams();
  const opponentTeams = useOpponentTeams();
  const followingTeams = useFollowingTeams();
  const matches = useMatches();
  const org = useOrganization(useMyOrgId());

  const teams = tab === "Your" ? myTeams : tab === "Opponents" ? opponentTeams : followingTeams;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader
        title="Teams"
        subtitle={org ? `Squads at ${org.name}` : "Your squads"}
        action={
          <Link href="/teams/new">
            <Button size="sm">
              <Plus size={15} /> New
            </Button>
          </Link>
        }
      />

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors tap-target",
              tab === t ? "bg-ink-100 text-ink-900" : "bg-ink-800/70 text-ink-300 hover:text-ink-50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {teams.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-500">
          {tab === "Your" && "No teams yet — tap New to add one."}
          {tab === "Opponents" && "No opponents yet — play a match against another school's team."}
          {tab === "Following" && "You're not following any teams yet."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {teams.map((team) => (
            <TeamRow key={team.id} team={team} matches={matches} />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamRow({ team, matches }: { team: Team; matches: ReturnType<typeof useMatches> }) {
  const stats = computeTeamStats(matches, team.id);
  return (
    <Link
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
}
