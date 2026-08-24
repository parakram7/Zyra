"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { TeamCrest } from "@/components/ui/avatar";
import { MatchStatusBadge } from "@/components/ui/badge";
import { useTeam } from "@/lib/hooks";
import { formatMatchDateTime } from "@/lib/format";
import { formatMinute, getLiveMinute } from "@/lib/match-clock";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/cn";

export function MatchCard({ match, className }: { match: Match; className?: string }) {
  const home = useTeam(match.homeTeamId);
  const away = useTeam(match.awayTeamId);
  if (!home || !away) return null;

  const minuteLabel =
    match.status === "LIVE" ? formatMinute(getLiveMinute(match), match.currentHalf) : undefined;

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        "block rounded-2xl border border-ink-700/40 bg-ink-850 p-4 shadow-card transition-colors hover:border-ink-600 active:scale-[0.99]",
        match.status === "LIVE" && "border-live/25 bg-gradient-to-b from-live/[0.06] to-ink-850",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
          {formatMatchDateTime(match.date)}
        </span>
        <MatchStatusBadge status={match.status} minuteLabel={minuteLabel} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamCrest team={home} size="md" />
          <span className="line-clamp-1 text-[13px] font-semibold text-ink-100">{home.shortName}</span>
        </div>

        <div className="flex flex-col items-center px-2">
          {match.status === "SCHEDULED" ? (
            <span className="font-display text-lg font-bold text-ink-400">VS</span>
          ) : (
            <span className="font-display text-2xl font-bold tabular-nums text-ink-50">
              {match.score.home}&nbsp;–&nbsp;{match.score.away}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <TeamCrest team={away} size="md" />
          <span className="line-clamp-1 text-[13px] font-semibold text-ink-100">{away.shortName}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-ink-500">
        <MapPin size={11} />
        <span className="line-clamp-1">{match.venue}</span>
      </div>
    </Link>
  );
}
