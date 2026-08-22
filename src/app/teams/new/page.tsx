"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { AuthGate } from "@/components/auth-gate";
import { useMyCompetitions } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";

const CREST_PRESETS = [
  { from: "#22b378", to: "#0e8f5c", label: "Emerald" },
  { from: "#3b82f6", to: "#1d4ed8", label: "Blue" },
  { from: "#f59e0b", to: "#b45309", label: "Amber" },
  { from: "#ef4444", to: "#b91c1c", label: "Red" },
  { from: "#a855f7", to: "#6d28d9", label: "Violet" },
  { from: "#64748b", to: "#334155", label: "Slate" },
];

export default function NewTeamPage() {
  return (
    <AuthGate>
      <NewTeamPageInner />
    </AuthGate>
  );
}

function NewTeamPageInner() {
  const router = useRouter();
  const competitions = useMyCompetitions();
  const addTeam = useZyraStore((s) => s.addTeam);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [city, setCity] = useState("");
  const [homeGround, setHomeGround] = useState("");
  const [category, setCategory] = useState("U16 Boys");
  const [foundedYear, setFoundedYear] = useState(new Date().getFullYear());
  const [crest, setCrest] = useState(0);
  const [competitionId, setCompetitionId] = useState<string>(competitions[0]?.id ?? "");

  const canSubmit = name.trim().length > 0 && shortName.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const teamId = addTeam({
      name: name.trim(),
      shortName: shortName.trim().toUpperCase().slice(0, 4),
      crestColorFrom: CREST_PRESETS[crest].from,
      crestColorTo: CREST_PRESETS[crest].to,
      foundedYear,
      homeGround: homeGround.trim() || "TBD",
      city: city.trim() || "TBD",
      category,
      competitionId: competitionId || null,
    });
    router.push(`/teams/${teamId}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="New Team" subtitle="Add a team for your tournament" backHref="/teams" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div>
              <Label>Team name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riverside Academy" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Short name</Label>
                <Input
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. RIV"
                  maxLength={4}
                />
              </div>
              <div>
                <Label>Founded year</Label>
                <Input
                  type="number"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Riverside" />
              </div>
              <div>
                <Label>Home ground</Label>
                <Input
                  value={homeGround}
                  onChange={(e) => setHomeGround(e.target.value)}
                  placeholder="e.g. Riverside Turf"
                />
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>U10 Boys</option>
                <option>U12 Boys</option>
                <option>U14 Boys</option>
                <option>U16 Boys</option>
                <option>U18 Boys</option>
                <option>U16 Girls</option>
                <option>U18 Girls</option>
                <option>Senior Men</option>
                <option>Senior Women</option>
              </Select>
            </div>

            <div>
              <Label>Competition</Label>
              <Select value={competitionId} onChange={(e) => setCompetitionId(e.target.value)}>
                <option value="">None yet</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.season}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Crest colours</Label>
              <div className="flex gap-2">
                {CREST_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCrest(i)}
                    aria-label={preset.label}
                    className={`h-10 w-10 shrink-0 rounded-xl border-2 transition-all ${
                      crest === i ? "border-ink-50 scale-105" : "border-transparent opacity-70"
                    }`}
                    style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                  />
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
          Create Team
        </Button>
      </form>
    </div>
  );
}
