"use client";

import { ArrowLeftRight, Flag, Timer } from "lucide-react";
import { CardIcon, FootballIcon } from "@/components/icons";
import { usePlayer, useTeam } from "@/lib/hooks";
import { sortedTimeline } from "@/lib/stats";
import type { Match, MatchEvent } from "@/lib/types";
import { cn } from "@/lib/cn";

function EventRow({ event, homeTeamId }: { event: MatchEvent; homeTeamId: string }) {
  const player = usePlayer(event.playerId);
  const secondaryPlayer = usePlayer(event.secondaryPlayerId);
  const team = useTeam(event.teamId);
  const isHome = event.teamId === homeTeamId;

  if (event.type === "KICK_OFF" || event.type === "HALF_TIME" || event.type === "FULL_TIME") {
    const label =
      event.type === "KICK_OFF" ? "Kick-off" : event.type === "HALF_TIME" ? "Half-time" : "Full-time";
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
        <Timer size={12} />
        {label}
      </div>
    );
  }

  const iconBg =
    event.type === "GOAL"
      ? "bg-brand-500/15"
      : event.type === "OWN_GOAL"
        ? "bg-ink-600/40"
        : event.type === "YELLOW_CARD"
          ? "bg-cardyellow/15"
          : event.type === "RED_CARD"
            ? "bg-cardred/15"
            : "bg-sky-500/15";

  const icon =
    event.type === "GOAL" ? (
      <FootballIcon size={12} className="text-brand-400" />
    ) : event.type === "OWN_GOAL" ? (
      <FootballIcon size={12} className="text-ink-300" />
    ) : event.type === "YELLOW_CARD" || event.type === "RED_CARD" ? (
      <CardIcon type={event.type} size={12} />
    ) : (
      <ArrowLeftRight size={12} className="text-sky-400" />
    );

  const content = (
    <>
      {event.type === "GOAL" && (
        <>
          <div className="font-semibold text-ink-50">Goal — {player?.name ?? "Unknown"}</div>
          {secondaryPlayer && (
            <div className="mt-0.5 text-[12px] text-ink-400">Assist: {secondaryPlayer.name}</div>
          )}
        </>
      )}
      {event.type === "OWN_GOAL" && (
        <div className="font-semibold text-ink-50">Own Goal — {player?.name ?? "Unknown"}</div>
      )}
      {(event.type === "YELLOW_CARD" || event.type === "RED_CARD") && (
        <div className="font-semibold text-ink-50">
          {event.type === "YELLOW_CARD" ? "Yellow Card" : "Red Card"} — {player?.name ?? "Unknown"}
        </div>
      )}
      {event.type === "SUBSTITUTION" && (
        <div className="font-semibold text-ink-50">
          Substitution{" "}
          <span className="font-normal text-ink-300">
            {secondaryPlayer?.name ?? "?"} <span className="text-ink-500">on for</span> {player?.name ?? "?"}
          </span>
        </div>
      )}
      <div className="mt-0.5 text-[11px] text-ink-500">{team?.shortName}</div>
    </>
  );

  return (
    <div className={cn("flex items-start gap-3", isHome ? "flex-row" : "flex-row-reverse text-right")}>
      <div className="flex w-10 shrink-0 flex-col items-center pt-0.5">
        <span className="font-display text-xs font-semibold tabular-nums text-ink-300">{event.minute}&apos;</span>
      </div>
      <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", iconBg)}>
        {icon}
      </span>
      <div className={cn("flex-1", !isHome && "flex flex-col items-end")}>{content}</div>
    </div>
  );
}

export function MatchTimeline({ match }: { match: Match }) {
  const events = sortedTimeline(match.events);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Flag size={22} className="text-ink-600" />
        <p className="text-sm text-ink-500">No events yet. Kick-off hasn&apos;t happened.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <EventRow key={event.id} event={event} homeTeamId={match.homeTeamId} />
      ))}
    </div>
  );
}
