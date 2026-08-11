"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FootballIcon } from "@/components/icons";
import { TeamPicker, PlayerGrid, MinuteStepper } from "@/components/live/pickers";
import { useTeam } from "@/lib/hooks";
import { getCurrentSquad } from "@/lib/stats";
import { useZyraStore } from "@/lib/store";
import type { Match, Player } from "@/lib/types";

type Step = "team" | "scorer" | "assist" | "confirm";

export function GoalSheet({
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
  const addGoalEvent = useZyraStore((s) => s.addGoalEvent);
  const [step, setStep] = useState<Step>("team");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [scorerId, setScorerId] = useState<string | null>(null);
  const [assistId, setAssistId] = useState<string | null>(null);
  const [minute, setMinute] = useState(currentMinute);
  const team = useTeam(teamId);

  useEffect(() => {
    if (open) {
      setStep("team");
      setTeamId(null);
      setScorerId(null);
      setAssistId(null);
      setMinute(currentMinute);
    }
  }, [open, currentMinute]);

  const onPitch = teamId ? getCurrentSquad(match, teamId).onPitch : [];
  const teamPlayers = players.filter((p) => p.teamId === teamId && onPitch.includes(p.id));

  function handleSave() {
    if (!teamId || !scorerId) return;
    addGoalEvent(match.id, { teamId, scorerId, assistId, minute });
    onClose();
  }

  const titles: Record<Step, string> = {
    team: "Who scored?",
    scorer: "Goalscorer",
    assist: "Assisted by",
    confirm: "Confirm Goal",
  };

  return (
    <Sheet open={open} onClose={onClose} title={titles[step]}>
      <div className="flex flex-col gap-5">
        {step !== "team" && (
          <button
            onClick={() =>
              setStep(step === "scorer" ? "team" : step === "assist" ? "scorer" : "assist")
            }
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
              setStep("scorer");
            }}
          />
        )}

        {step === "scorer" && (
          <PlayerGrid
            players={teamPlayers}
            value={scorerId}
            onChange={(id) => {
              setScorerId(id);
              setStep("assist");
            }}
            emptyLabel="No players currently on the pitch for this team."
          />
        )}

        {step === "assist" && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setAssistId(null);
                setStep("confirm");
              }}
              className="w-full rounded-xl border border-ink-700/60 bg-ink-800/40 py-3 text-sm font-semibold text-ink-300 hover:border-ink-500"
            >
              No Assist
            </button>
            <PlayerGrid
              players={teamPlayers}
              value={assistId}
              excludeId={scorerId}
              onChange={(id) => {
                setAssistId(id);
                setStep("confirm");
              }}
            />
          </div>
        )}

        {step === "confirm" && team && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-volt-300/30 bg-volt-300/[0.06] py-6">
              <FootballIcon size={28} className="text-volt-300" />
              <p className="text-center text-sm text-ink-300">
                <span className="font-bold text-white">
                  {players.find((p) => p.id === scorerId)?.name}
                </span>{" "}
                for {team.shortName}
                {assistId && (
                  <>
                    <br />
                    Assist: {players.find((p) => p.id === assistId)?.name}
                  </>
                )}
              </p>
            </div>
            <MinuteStepper value={minute} onChange={setMinute} />
            <Button onClick={handleSave} size="lg" className="w-full">
              Save Goal
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
