"use client";

import { PlayerPassport } from "@/components/player-passport";
import { usePlayer } from "@/lib/hooks";

export default function PlayerPassportPage({ params }: { params: { id: string } }) {
  const player = usePlayer(params.id);
  return (
    <PlayerPassport
      playerId={params.id}
      backHref={player ? `/teams/${player.teamId}` : "/teams"}
    />
  );
}
