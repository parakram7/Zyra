"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FootballIcon } from "@/components/icons";
import { TeamPicker, PlayerGrid, MinuteStepper } from "@/components/live/pickers";
import { getCurrentSquad } from "@/lib/stats";
import { useZyraStore } from "@/lib/store";
import type { Match, Player } from "@/lib/types";

export function OwnGoalSheet({
  match,
  players,
  open,
  onClose,
  currentMinute,
}: {
  match: Match;
  players: Player[];
  open: boolean;
  onClose: () => void;
  currentMinute: number;
}) {
  const addOwnGoalEvent = useZyraStore((s) => s.addOwnGoalEvent);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [minute, setMinute] = useState(currentMinute);

  useEffect(() => {
    if (open) {
      setTeamId(null);
      setPlayerId(null);
      setMinute(currentMinute);
    }
  }, [open, currentMinute]);

  const onPitch = teamId ? getCurrentSquad(match, teamId).onPitch : [];
  const teamPlayers = players.filter((p) => p.teamId === teamId && onPitch.includes(p.id));

  function handleSave() {
    if (!teamId || !playerId) return;
    addOwnGoalEvent(match.id, { teamId, playerId, minute });
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Own Goal">
      <div className="flex flex-col gap-5">
        <p className="rounded-xl bg-ink-800/50 px-3 py-2.5 text-xs text-ink-400">
          Select the team <span className="text-ink-200">whose player</span> put the ball into their
          own net. The goal will be credited to the opposition.
        </p>

        <TeamPicker
          homeTeamId={match.homeTeamId}
          awayTeamId={match.awayTeamId}
          value={teamId}
          onChange={(id) => {
            setTeamId(id);
            setPlayerId(null);
          }}
        />

        {teamId && (
          <PlayerGrid
            players={teamPlayers}
            value={playerId}
            onChange={setPlayerId}
            emptyLabel="No players currently on the pitch for this team."
          />
        )}

        {playerId && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-ink-600/50 bg-ink-800/40 py-4">
            <FootballIcon size={18} className="text-ink-400" />
            <span className="text-sm text-ink-300">
              Own goal — <span className="font-bold text-white">{players.find((p) => p.id === playerId)?.name}</span>
            </span>
          </div>
        )}

        <MinuteStepper value={minute} onChange={setMinute} />

        <Button onClick={handleSave} disabled={!teamId || !playerId} size="lg" variant="secondary" className="w-full">
          Save Own Goal
        </Button>
      </div>
    </Sheet>
  );
}
