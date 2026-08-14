"use client";

import { AccountCard } from "@/components/account-card";
import { PlayerPassport } from "@/components/player-passport";
import { DEMO_PLAYER_ID } from "@/lib/seed-data";

export default function ProfilePage() {
  return <PlayerPassport playerId={DEMO_PLAYER_ID} title="My Passport" belowHeader={<AccountCard />} />;
}
