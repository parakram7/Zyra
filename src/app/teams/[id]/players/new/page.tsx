"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { PlayerAvatar } from "@/components/ui/avatar";
import { AuthGate } from "@/components/auth-gate";
import { useTeam, usePlayerProfiles } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";
import { cn } from "@/lib/cn";
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
  const playerProfiles = usePlayerProfiles();
  const addPlayer = useZyraStore((s) => s.addPlayer);
  const createPlayerProfile = useZyraStore((s) => s.createPlayerProfile);

  const [query, setQuery] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New profile fields
  const [npName, setNpName] = useState("");
  const [npDob, setNpDob] = useState("");
  const [npNationality, setNpNationality] = useState("");
  const [npFoot, setNpFoot] = useState<PreferredFoot>("Right");

  // Team-specific fields
  const [shirtNumber, setShirtNumber] = useState(1);
  const [position, setPosition] = useState<Position>("MF");

  if (!team) {
    return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-sm text-ink-500">Team not found.</div>;
  }

  const selectedProfile = playerProfiles.find((p) => p.id === selectedProfileId);
  const matches =
    !selectedProfile && query.trim().length > 0
      ? playerProfiles.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
      : [];

  const canSubmit =
    shirtNumber > 0 && (!!selectedProfile || (showCreateForm && npName.trim().length > 0));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !team) return;

    let profileId = selectedProfile?.id ?? null;
    if (!profileId) {
      profileId = createPlayerProfile({
        name: npName.trim(),
        dateOfBirth: npDob || undefined,
        nationality: npNationality.trim() || undefined,
        preferredFoot: npFoot,
      });
    }

    addPlayer({
      teamId: team.id,
      profileId,
      shirtNumber,
      position,
      category: team.category,
    });
    router.push(`/teams/${team.id}`);
  }

  function clearSelection() {
    setSelectedProfileId(null);
    setQuery("");
    setShowCreateForm(false);
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Add Player" subtitle={`New squad member for ${team.name}`} backHref={`/teams/${team.id}`} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div>
              <Label>Player</Label>
              <p className="mb-2 -mt-0.5 text-[11.5px] text-ink-500">
                Search for a player already registered on Zyra, or create a new profile if this is their first team.
              </p>

              {selectedProfile ? (
                <div className="flex items-center gap-3 rounded-xl border border-brand-400/40 bg-brand-500/[0.07] px-3.5 py-3">
                  <PlayerAvatar name={selectedProfile.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-50">{selectedProfile.name}</p>
                    <p className="text-[11px] text-ink-500">
                      {[selectedProfile.nationality, selectedProfile.preferredFoot && `${selectedProfile.preferredFoot} footed`]
                        .filter(Boolean)
                        .join(" · ") || "No additional details"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="tap-target flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 hover:text-ink-100"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                    <Input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowCreateForm(false);
                      }}
                      placeholder="Search by name, e.g. Aarav"
                      className="pl-9"
                    />
                  </div>

                  {matches.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5 rounded-xl border border-ink-700 bg-ink-900/40 p-2">
                      {matches.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProfileId(p.id);
                            setShowCreateForm(false);
                          }}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-ink-800/60"
                        >
                          <PlayerAvatar name={p.name} size="xs" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-ink-100">{p.name}</p>
                            {p.nationality && <p className="text-[10.5px] text-ink-500">{p.nationality}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {query.trim().length > 0 && !showCreateForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(true);
                        setNpName(query.trim());
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-600 py-2.5 text-xs font-semibold text-ink-300 hover:border-brand-400 hover:text-brand-300"
                    >
                      <UserPlus size={14} />
                      {matches.length === 0 ? `Create new profile for "${query.trim()}"` : "Not them? Create a new profile"}
                    </button>
                  )}
                </>
              )}
            </div>

            {showCreateForm && !selectedProfile && (
              <div className={cn("flex flex-col gap-3 rounded-xl border border-ink-700 bg-ink-900/40 p-3.5")}>
                <div>
                  <Label>Full name</Label>
                  <Input value={npName} onChange={(e) => setNpName(e.target.value)} placeholder="e.g. Arjun Mehta" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Preferred foot</Label>
                    <Select value={npFoot} onChange={(e) => setNpFoot(e.target.value as PreferredFoot)}>
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Both">Both</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Date of birth</Label>
                    <Input type="date" value={npDob} onChange={(e) => setNpDob(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input value={npNationality} onChange={(e) => setNpNationality(e.target.value)} placeholder="e.g. India" />
                </div>
              </div>
            )}

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
          </CardBody>
        </Card>

        <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
          Add to Squad
        </Button>
      </form>
    </div>
  );
}
