"use client";

import { ArrowLeftRight, Pencil, Timer } from "lucide-react";
import { CardIcon, FootballIcon } from "@/components/icons";
import { usePlayer, useTeam } from "@/lib/hooks";
import { sortedTimeline } from "@/lib/stats";
import type { Match, MatchEvent } from "@/lib/types";

const EDITABLE: MatchEvent["type"][] = ["GOAL", "OWN_GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION"];

function LiveEventRow({ event, onEdit }: { event: MatchEvent; onEdit: (e: MatchEvent) => void }) {
  const player = usePlayer(event.playerId);
  const secondaryPlayer = usePlayer(event.secondaryPlayerId);
  const team = useTeam(event.teamId);
  const editable = EDITABLE.includes(event.type);

  if (!editable) {
    const label =
      event.type === "KICK_OFF" ? "Kick-off" : event.type === "HALF_TIME" ? "Half-time" : "Full-time";
    return (
      <div className="flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
        <Timer size={11} />
        {label} · {event.minute}&apos;
      </div>
    );
  }

  return (
    <button
      onClick={() => onEdit(event)}
      className="flex w-full items-center gap-3 rounded-xl border border-ink-700/40 bg-ink-900/50 px-3.5 py-3 text-left transition-colors hover:border-ink-500/60 tap-target"
    >
      <span className="w-9 shrink-0 font-display text-sm font-bold tabular-nums text-ink-300">
        {event.minute}&apos;
      </span>

      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-800">
        {event.type === "GOAL" && <FootballIcon size={13} className="text-volt-300" />}
        {event.type === "OWN_GOAL" && <FootballIcon size={13} className="text-ink-400" />}
        {(event.type === "YELLOW_CARD" || event.type === "RED_CARD") && <CardIcon type={event.type} />}
        {event.type === "SUBSTITUTION" && <ArrowLeftRight size={13} className="text-sky-400" />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-50">
          {event.type === "GOAL" && `Goal — ${player?.name ?? "?"}`}
          {event.type === "OWN_GOAL" && `Own Goal — ${player?.name ?? "?"}`}
          {event.type === "YELLOW_CARD" && `Yellow Card — ${player?.name ?? "?"}`}
          {event.type === "RED_CARD" && `Red Card — ${player?.name ?? "?"}`}
          {event.type === "SUBSTITUTION" && `${secondaryPlayer?.name ?? "?"} ↔ ${player?.name ?? "?"}`}
        </p>
        <p className="truncate text-[11px] text-ink-500">
          {team?.shortName}
          {event.type === "GOAL" && secondaryPlayer && ` · Assist: ${secondaryPlayer.name}`}
        </p>
      </div>

      <Pencil size={13} className="shrink-0 text-ink-600" />
    </button>
  );
}

export function LiveTimeline({
  match,
  onEdit,
}: {
  match: Match;
  onEdit: (e: MatchEvent) => void;
}) {
  const events = [...sortedTimeline(match.events)].reverse();

  if (events.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-500">No events yet — kick off to begin.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => (
        <LiveEventRow key={event.id} event={event} onEdit={onEdit} />
      ))}
    </div>
  );
}
