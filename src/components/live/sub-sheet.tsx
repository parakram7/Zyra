"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, ChevronLeft } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TeamPicker, PlayerGrid, MinuteStepper } from "@/components/live/pickers";
import { getCurrentSquad } from "@/lib/stats";
import { useZyraStore } from "@/lib/store";
import type { Match, Player } from "@/lib/types";

type Step = "team" | "off" | "on" | "confirm";

export function SubSheet({
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
  const addSubstitutionEvent = useZyraStore((s) => s.addSubstitutionEvent);
  const [step, setStep] = useState<Step>("team");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [offId, setOffId] = useState<string | null>(null);
  const [onId, setOnId] = useState<string | null>(null);
  const [minute, setMinute] = useState(currentMinute);

  useEffect(() => {
    if (open) {
      setStep("team");
      setTeamId(null);
      setOffId(null);
      setOnId(null);
      setMinute(currentMinute);
    }
  }, [open, currentMinute]);

  const squad = teamId ? getCurrentSquad(match, teamId) : { onPitch: [], bench: [] };
  const onPitchPlayers = players.filter((p) => p.teamId === teamId && squad.onPitch.includes(p.id));
  const benchPlayers = players.filter((p) => p.teamId === teamId && squad.bench.includes(p.id));

  function handleSave() {
    if (!teamId || !offId || !onId) return;
    addSubstitutionEvent(match.id, { teamId, offId, onId, minute });
    onClose();
  }

  const titles: Record<Step, string> = {
    team: "Which team?",
    off: "Player coming OFF",
    on: "Player coming ON",
    confirm: "Confirm Substitution",
  };

  return (
    <Sheet open={open} onClose={onClose} title={titles[step]}>
      <div className="flex flex-col gap-5">
        {step !== "team" && (
          <button
            onClick={() => setStep(step === "off" ? "team" : step === "on" ? "off" : "on")}
            className="flex items-center gap-1 self-start text-xs font-semibold text-ink-400 hover:text-white"
          >
            <ChevronLeft size={14} /> Back
          </button>
        )}

        {step === "team" && (
          <TeamPicker
            homeTeamId={match.homeTeamId}
            awayTeamId={match.awayTeamId}
            value={teamId}
            onChange={(id) => {
              setTeamId(id);
              setStep("off");
            }}
          />
        )}

        {step === "off" && (
          <PlayerGrid
            players={onPitchPlayers}
            value={offId}
            onChange={(id) => {
              setOffId(id);
              setStep("on");
            }}
            emptyLabel="No players on the pitch for this team."
          />
        )}

        {step === "on" && (
          <PlayerGrid
            players={benchPlayers}
            value={onId}
            onChange={(id) => {
              setOnId(id);
              setStep("confirm");
            }}
            emptyLabel="No substitutes remaining on the bench."
          />
        )}

        {step === "confirm" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/[0.06] py-6">
              <ArrowLeftRight size={24} className="text-sky-400" />
              <p className="text-center text-sm text-ink-300">
                <span className="font-bold text-white">
                  {players.find((p) => p.id === onId)?.name}
                </span>{" "}
                on for{" "}
                <span className="font-bold text-white">
                  {players.find((p) => p.id === offId)?.name}
                </span>
              </p>
            </div>
            <MinuteStepper value={minute} onChange={setMinute} />
            <Button onClick={handleSave} size="lg" className="w-full">
              Save Substitution
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
