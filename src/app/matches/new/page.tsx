"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { AuthGate } from "@/components/auth-gate";
import { useMyCompetitions, useMyTeams, useTeams } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";

const DURATIONS = [
  { value: 40, label: "20 min halves (U10)" },
  { value: 50, label: "25 min halves (U12)" },
  { value: 60, label: "30 min halves (U14)" },
  { value: 70, label: "35 min halves (U16)" },
  { value: 80, label: "40 min halves (U18)" },
  { value: 90, label: "45 min halves (Senior)" },
];

function defaultDateTime() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export default function NewMatchPage() {
  return (
    <AuthGate>
      <NewMatchPageInner />
    </AuthGate>
  );
}

function NewMatchPageInner() {
  const router = useRouter();
  const teams = useMyTeams();
  const allTeams = useTeams();
  const competitions = useMyCompetitions();
  const createMatch = useZyraStore((s) => s.createMatch);

  const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id ?? "");
  const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id ?? "");
  const [date, setDate] = useState(defaultDateTime());
  const [venue, setVenue] = useState(teams[0]?.homeGround ?? "");
  const [duration, setDuration] = useState(70);
  const [competitionId, setCompetitionId] = useState<string>(competitions[0]?.id ?? "");

  const sameTeam = homeTeamId === awayTeamId;
  const isFriendly = !competitionId;
  const awayOptions = isFriendly ? allTeams.filter((t) => t.id !== homeTeamId) : teams;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sameTeam || !homeTeamId || !awayTeamId) return;
    const matchId = createMatch({
      homeTeamId,
      awayTeamId,
      date: new Date(date).toISOString(),
      venue: venue || "TBD",
      durationMinutes: duration,
      competitionId: competitionId || null,
    });
    router.push(`/matches/${matchId}/setup`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader title="Start a Match" subtitle="Set the fixture, then build your lineups" backHref="/matches" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Home team</Label>
                <Select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)}>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Away team</Label>
                <Select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
                  {awayOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {isFriendly && !teams.some((mine) => mine.id === t.id) ? ` (${t.city})` : ""}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {sameTeam && (
              <p className="text-xs font-medium text-cardred">Home and away teams must be different.</p>
            )}
            {isFriendly && (
              <p className="text-xs text-ink-500">
                Friendly — the away team can be any registered team on Zyra, not just your own.
              </p>
            )}

            <div>
              <Label>Competition</Label>
              <Select value={competitionId} onChange={(e) => setCompetitionId(e.target.value)}>
                <option value="">Friendly (no competition)</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.season}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date &amp; kick-off</Label>
                <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label>Match format</Label>
                <Select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  {DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label>Venue</Label>
              <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Ground name" />
            </div>
          </CardBody>
        </Card>

        <Button type="submit" size="lg" disabled={sameTeam} className="w-full">
          Continue to Lineups
        </Button>
      </form>
    </div>
  );
}
