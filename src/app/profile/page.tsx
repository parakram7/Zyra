"use client";

import { PlayerPassport } from "@/components/player-passport";
import { DEMO_PLAYER_ID } from "@/lib/seed-data";

export default function ProfilePage() {
  return <PlayerPassport playerId={DEMO_PLAYER_ID} title="My Passport" />;
}
