"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { AuthGate } from "@/components/auth-gate";
import { useTeam } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";
import type { Position, PreferredFoot } from "@/lib/types";

export default function NewPlayerPage({ params }: { params: { id: string } }) {
  return (
    <AuthGate>
      <NewPlayerPageInner teamId={params.id} />
    </AuthGate>
  );
}

function NewPlayerPageInner({ teamId }: { teamId: string }) {
  const router = useRouter();
  const team = useTeam(teamId);
  const addPlayer = useZyraStore((s) => s.addPlayer);

  const [name, setName] = useState("");
  const [shirtNumber, setShirtNumber] = useState(1);
  const [position, setPosition] = useState<Position>("MF");
  const [preferredFoot, setPreferredFoot] = useState<PreferredFoot>("Right");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");

  if (!team) {
    return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-sm text-ink-500">Team not found.</div>;
  }

  const canSubmit = name.trim().length > 0 && shirtNumber > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !team) return;
    addPlayer({
      teamId: team.id,
      name: name.trim(),
      shirtNumber,
      position,
      preferredFoot,
      dateOfBirth: dateOfBirth || new Date().toISOString().slice(0, 10),
      category: team.category,
      nationality: nationality.trim() || "—",
    });
    router.push(`/teams/${team.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Add Player" subtitle={`New squad member for ${team.name}`} backHref={`/teams/${team.id}`} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div>
              <Label>Player name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun Mehta" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Shirt number</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={shirtNumber}
                  onChange={(e) => setShirtNumber(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Select value={position} onChange={(e) => setPosition(e.target.value as Position)}>
                  <option value="GK">Goalkeeper</option>
                  <option value="DF">Defender</option>
                  <option value="MF">Midfielder</option>
                  <option value="FW">Forward</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Preferred foot</Label>
                <Select value={preferredFoot} onChange={(e) => setPreferredFoot(e.target.value as PreferredFoot)}>
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Both">Both</option>
                </Select>
              </div>
              <div>
                <Label>Date of birth</Label>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Nationality</Label>
              <Input value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. India" />
            </div>
          </CardBody>
        </Card>

        <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
          Add to Squad
        </Button>
      </form>
    </div>
  );
}
