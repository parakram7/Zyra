"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TeamPicker, PlayerGrid, MinuteStepper } from "@/components/live/pickers";
import { usePlayers } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";
import type { Match, MatchEvent } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  GOAL: "Edit Goal",
  OWN_GOAL: "Edit Own Goal",
  YELLOW_CARD: "Edit Yellow Card",
  RED_CARD: "Edit Red Card",
  SUBSTITUTION: "Edit Substitution",
};

export function EditEventSheet({
  match,
  event,
  onClose,
}: {
  match: Match;
  event: MatchEvent | null;
  onClose: () => void;
}) {
  const players = usePlayers();
  const updateEvent = useZyraStore((s) => s.updateEvent);
  const deleteEvent = useZyraStore((s) => s.deleteEvent);

  const [teamId, setTeamId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [secondaryId, setSecondaryId] = useState<string | null>(null);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (event) {
      setTeamId(event.teamId);
      setPlayerId(event.playerId);
      setSecondaryId(event.secondaryPlayerId);
      setMinute(event.minute);
    }
  }, [event]);

  if (!event) return null;

  const teamPlayers = players.filter((p) => p.teamId === teamId);
  const isGoal = event.type === "GOAL";
  const isSub = event.type === "SUBSTITUTION";
  const hasSecondary = isGoal || isSub;

  function handleSave() {
    if (!event) return;
    updateEvent(match.id, event.id, {
      teamId,
      playerId,
      secondaryPlayerId: hasSecondary ? secondaryId : null,
      minute,
    });
    onClose();
  }

  function handleDelete() {
    if (!event) return;
    deleteEvent(match.id, event.id);
    onClose();
  }

  return (
    <Sheet open={!!event} onClose={onClose} title={TYPE_LABEL[event.type] ?? "Edit Event"}>
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Team</p>
          <TeamPicker
            homeTeamId={match.homeTeamId}
            awayTeamId={match.awayTeamId}
            value={teamId}
            onChange={(id) => {
              setTeamId(id);
              setPlayerId(null);
              setSecondaryId(null);
            }}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            {isSub ? "Player OFF" : event.type === "OWN_GOAL" ? "Player" : isGoal ? "Scorer" : "Player"}
          </p>
          <PlayerGrid players={teamPlayers} value={playerId} onChange={setPlayerId} />
        </div>

        {hasSecondary && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {isSub ? "Player ON" : "Assist (optional)"}
            </p>
            {isGoal && (
              <button
                type="button"
                onClick={() => setSecondaryId(null)}
                className="mb-2 w-full rounded-xl border border-ink-700/60 bg-ink-800/40 py-2.5 text-sm font-semibold text-ink-300 hover:border-ink-500"
              >
                No Assist
              </button>
            )}
            <PlayerGrid
              players={teamPlayers}
              value={secondaryId}
              excludeId={playerId}
              onChange={setSecondaryId}
            />
          </div>
        )}

        <MinuteStepper value={minute} onChange={setMinute} />

        <div className="flex gap-2">
          <Button onClick={handleDelete} variant="danger" size="lg" className="flex-1">
            <Trash2 size={16} /> Delete
          </Button>
          <Button onClick={handleSave} size="lg" className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
