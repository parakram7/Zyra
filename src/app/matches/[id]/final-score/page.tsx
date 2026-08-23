"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/field";
import { TeamCrest } from "@/components/ui/avatar";
import { AuthGate } from "@/components/auth-gate";
import { useMatch, useTeam, useTeamPlayers } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";

interface GoalRow {
  side: "home" | "away";
  scorerId: string;
  assistId: string;
}

export default function FinalScorePage({ params }: { params: { id: string } }) {
  return (
    <AuthGate>
      <FinalScorePageInner params={params} />
    </AuthGate>
  );
}

function FinalScorePageInner({ params }: { params: { id: string } }) {
  const router = useRouter();
  const match = useMatch(params.id);
  const homeTeam = useTeam(match?.homeTeamId);
  const awayTeam = useTeam(match?.awayTeamId);
  const homeSquad = useTeamPlayers(match?.homeTeamId);
  const awaySquad = useTeamPlayers(match?.awayTeamId);
  const startMatch = useZyraStore((s) => s.startMatch);
  const addGoalEvent = useZyraStore((s) => s.addGoalEvent);
  const endMatch = useZyraStore((s) => s.endMatch);

  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [saving, setSaving] = useState(false);

  if (!match || !homeTeam || !awayTeam) {
    return <div className="mx-auto max-w-xl px-4 pt-10 text-center text-sm text-ink-500">Match not found.</div>;
  }

  if (match.status === "COMPLETED") {
    return (
      <div className="mx-auto max-w-xl px-4 pt-10 text-center text-sm text-ink-500">
        This match is already finished — {match.score.home}-{match.score.away}.
      </div>
    );
  }

  const homeScore = goals.filter((g) => g.side === "home").length;
  const awayScore = goals.filter((g) => g.side === "away").length;

  function addGoal(side: "home" | "away") {
    const squad = side === "home" ? homeSquad : awaySquad;
    if (squad.length === 0) return;
    setGoals((prev) => [...prev, { side, scorerId: squad[0].id, assistId: "" }]);
  }

  function updateGoal(index: number, patch: Partial<GoalRow>) {
    setGoals((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function removeGoal(index: number) {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    if (match!.status === "SCHEDULED") startMatch(match!.id);
    goals.forEach((g, i) => {
      addGoalEvent(match!.id, {
        teamId: g.side === "home" ? match!.homeTeamId : match!.awayTeamId,
        scorerId: g.scorerId,
        assistId: g.assistId || null,
        minute: i + 1,
      });
    });
    endMatch(match!.id);
    router.push(`/matches/${match!.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader
        title="Enter Final Score"
        subtitle="No live tracking — just the result and who scored"
        backHref={`/matches/${match.id}`}
      />

      <Card className="mb-6">
        <CardBody className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <TeamCrest team={homeTeam} size="lg" />
            <span className="text-sm font-semibold text-ink-50">{homeTeam.shortName}</span>
          </div>
          <span className="font-display text-4xl font-bold tabular-nums text-ink-50">
            {homeScore}–{awayScore}
          </span>
          <div className="flex flex-col items-center gap-2">
            <TeamCrest team={awayTeam} size="lg" />
            <span className="text-sm font-semibold text-ink-50">{awayTeam.shortName}</span>
          </div>
        </CardBody>
      </Card>

      <div className="mb-6 flex flex-col gap-2">
        {goals.map((g, i) => {
          const squad = g.side === "home" ? homeSquad : awaySquad;
          return (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-800/40 px-3 py-2.5">
              <span className="w-11 shrink-0 text-xs font-bold text-ink-500">
                {g.side === "home" ? homeTeam.shortName : awayTeam.shortName}
              </span>
              <Select
                value={g.scorerId}
                onChange={(e) => updateGoal(i, { scorerId: e.target.value })}
                className="!py-2 text-xs"
              >
                {squad.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Select
                value={g.assistId}
                onChange={(e) => updateGoal(i, { assistId: e.target.value })}
                className="!py-2 text-xs"
              >
                <option value="">No assist</option>
                {squad.filter((p) => p.id !== g.scorerId).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => removeGoal(i)}
                className="tap-target flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-cardred/10 hover:text-cardred"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => addGoal("home")}>
          <Plus size={15} /> {homeTeam.shortName} Goal
        </Button>
        <Button variant="outline" onClick={() => addGoal("away")}>
          <Plus size={15} /> {awayTeam.shortName} Goal
        </Button>
      </div>

      <Button size="lg" className="w-full" disabled={saving} onClick={handleSave}>
        {saving ? "Saving…" : "Save Final Score"}
      </Button>
      <p className="mt-3 text-center text-xs text-ink-500">
        This marks the match as completed with the score above — no minute-by-minute timeline.
      </p>
    </div>
  );
}
