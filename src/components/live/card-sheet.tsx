"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CardIcon } from "@/components/icons";
import { TeamPicker, PlayerGrid, MinuteStepper } from "@/components/live/pickers";
import { getCurrentSquad } from "@/lib/stats";
import { useZyraStore } from "@/lib/store";
import type { Match, Player } from "@/lib/types";
import { cn } from "@/lib/cn";

export function CardSheet({
  match,
  players,
  open,
  onClose,
  currentMinute,
  initialType = "YELLOW_CARD",
}: {
  match: Match;
  players: Player[];
  open: boolean;
  onClose: () => void;
  currentMinute: number;
  initialType?: "YELLOW_CARD" | "RED_CARD";
}) {
  const addCardEvent = useZyraStore((s) => s.addCardEvent);
  const [cardType, setCardType] = useState<"YELLOW_CARD" | "RED_CARD">(initialType);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [minute, setMinute] = useState(currentMinute);

  useEffect(() => {
    if (open) {
      setCardType(initialType);
      setTeamId(null);
      setPlayerId(null);
      setMinute(currentMinute);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentMinute, initialType]);

  const onPitch = teamId ? getCurrentSquad(match, teamId).onPitch : [];
  const teamPlayers = players.filter((p) => p.teamId === teamId && onPitch.includes(p.id));

  function handleSave() {
    if (!teamId || !playerId) return;
    addCardEvent(match.id, { teamId, playerId, cardType, minute });
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Book a Card">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          {(["YELLOW_CARD", "RED_CARD"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCardType(type)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-colors tap-target",
                cardType === type
                  ? "border-current bg-current/10"
                  : "border-ink-700/60 text-ink-400"
              )}
              style={cardType === type ? { color: type === "YELLOW_CARD" ? "#ffc53d" : "#ff4d5e" } : undefined}
            >
              <CardIcon type={type} size={16} />
              {type === "YELLOW_CARD" ? "Yellow" : "Red"}
            </button>
          ))}
        </div>

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

        <MinuteStepper value={minute} onChange={setMinute} />

        <Button onClick={handleSave} disabled={!teamId || !playerId} size="lg" className="w-full">
          Save Card
        </Button>
      </div>
    </Sheet>
  );
}
