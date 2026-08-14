"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Link from "next/link";
import { LiveHeader } from "@/components/live/live-header";
import { EventButtons, type EventButtonType } from "@/components/live/event-buttons";
import { LiveTimeline } from "@/components/live/live-timeline";
import { GoalSheet } from "@/components/live/goal-sheet";
import { CardSheet } from "@/components/live/card-sheet";
import { SubSheet } from "@/components/live/sub-sheet";
import { OwnGoalSheet } from "@/components/live/own-goal-sheet";
import { EditEventSheet } from "@/components/live/edit-event-sheet";
import { AuthGate } from "@/components/auth-gate";
import { useLiveMinute, useMatch, usePlayers } from "@/lib/hooks";
import type { MatchEvent } from "@/lib/types";

export default function LiveMatchPage({ params }: { params: { id: string } }) {
  return (
    <AuthGate>
      <LiveMatchPageInner params={params} />
    </AuthGate>
  );
}

function LiveMatchPageInner({ params }: { params: { id: string } }) {
  const router = useRouter();
  const match = useMatch(params.id);
  const players = usePlayers();
  const liveMinute = useLiveMinute(match);
  const [activeSheet, setActiveSheet] = useState<EventButtonType | null>(null);
  const [editEvent, setEditEvent] = useState<MatchEvent | null>(null);

  useEffect(() => {
    if (!match) return;
    if (match.status === "SCHEDULED") router.replace(`/matches/${match.id}/setup`);
    if (match.status === "COMPLETED") router.replace(`/matches/${match.id}`);
  }, [match, router]);

  if (!match || match.status !== "LIVE") {
    return (
      <div className="mx-auto max-w-xl px-4 pt-10 text-center text-sm text-ink-500">Loading match…</div>
    );
  }

  const controlsDisabled = match.currentHalf === "HT" || match.currentHalf === "FT";

  return (
    <div className="mx-auto max-w-2xl pb-8 md:px-8 md:pt-6">
      <div className="mb-4 flex items-center justify-between px-4 pt-3 md:hidden">
        <Link href={`/matches/${match.id}`} className="tap-target flex h-9 w-9 items-center justify-center rounded-full bg-ink-800/80 text-ink-200">
          <X size={18} />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Live Scoring</span>
        <div className="w-9" />
      </div>

      <LiveHeader match={match} />

      <div className="px-4 pt-5 md:px-0">
        <EventButtons onOpen={setActiveSheet} disabled={controlsDisabled} />

        <h2 className="mb-3 mt-7 font-display text-sm font-bold uppercase tracking-wide text-ink-400">
          Timeline
        </h2>
        <LiveTimeline match={match} onEdit={setEditEvent} />
      </div>

      <GoalSheet
        match={match}
        players={players}
        open={activeSheet === "GOAL"}
        onClose={() => setActiveSheet(null)}
        currentMinute={liveMinute}
      />
      <CardSheet
        match={match}
        players={players}
        open={activeSheet === "YELLOW_CARD" || activeSheet === "RED_CARD"}
        onClose={() => setActiveSheet(null)}
        currentMinute={liveMinute}
        initialType={activeSheet === "RED_CARD" ? "RED_CARD" : "YELLOW_CARD"}
      />
      <SubSheet
        match={match}
        players={players}
        open={activeSheet === "SUBSTITUTION"}
        onClose={() => setActiveSheet(null)}
        currentMinute={liveMinute}
      />
      <OwnGoalSheet
        match={match}
        players={players}
        open={activeSheet === "OWN_GOAL"}
        onClose={() => setActiveSheet(null)}
        currentMinute={liveMinute}
      />
      <EditEventSheet match={match} event={editEvent} onClose={() => setEditEvent(null)} />
    </div>
  );
}
