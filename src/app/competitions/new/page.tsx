"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { TeamCrest } from "@/components/ui/avatar";
import { AuthGate } from "@/components/auth-gate";
import { useMyTeams } from "@/lib/hooks";
import { useZyraStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { allSlots as computeAllSlots, defaultKnockoutPairs, roundLabel, slotKey } from "@/lib/knockout";
import type { CompetitionFormat, CompetitionGroup, KnockoutPair, KnockoutSlot, Team } from "@/lib/types";

const CREST_PRESETS = [
  { from: "#22b378", to: "#0e8f5c" },
  { from: "#3b82f6", to: "#1d4ed8" },
  { from: "#f59e0b", to: "#b45309" },
  { from: "#ef4444", to: "#b91c1c" },
  { from: "#a855f7", to: "#6d28d9" },
  { from: "#64748b", to: "#334155" },
];

const GROUP_COUNT_OPTIONS = [2, 4, 8];
const PER_GROUP_OPTIONS = [3, 4, 5, 6];

type Step = "info" | "league-teams" | "group-setup" | "group-assign" | "knockout";

function StepHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={onBack}
        className="tap-target flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-800/80 text-ink-300 hover:text-ink-50"
      >
        <ChevronLeft size={18} />
      </button>
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-ink-50 md:text-2xl">{title}</h1>
        <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>
      </div>
    </div>
  );
}

function TeamChip({ team, onRemove }: { team: Team; onRemove?: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-ink-800 py-1 pl-1.5 pr-2.5 text-xs font-semibold text-ink-100">
      <TeamCrest team={team} size="xs" />
      {team.name}
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-ink-500 hover:text-ink-200">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

function CrestSwatches({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-2">
      {CREST_PRESETS.map((preset, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={cn(
            "h-9 w-9 shrink-0 rounded-xl border-2 transition-all",
            value === i ? "scale-105 border-ink-50" : "border-transparent opacity-70"
          )}
          style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
        />
      ))}
    </div>
  );
}

export default function NewCompetitionPage() {
  return (
    <AuthGate>
      <NewCompetitionPageInner />
    </AuthGate>
  );
}

function NewCompetitionPageInner() {
  const router = useRouter();
  const teams = useMyTeams();
  const addTeam = useZyraStore((s) => s.addTeam);
  const addCompetition = useZyraStore((s) => s.addCompetition);

  const [step, setStep] = useState<Step>("info");
  const [name, setName] = useState("");
  const [season, setSeason] = useState(String(new Date().getFullYear()));
  const [format, setFormat] = useState<CompetitionFormat>("league");

  // league mode
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  // groups mode
  const [numGroups, setNumGroups] = useState(4);
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [groups, setGroups] = useState<CompetitionGroup[]>([]);
  const [openGroupPicker, setOpenGroupPicker] = useState<string | null>(null);
  const [knockoutPairs, setKnockoutPairs] = useState<KnockoutPair[]>([]);

  // shared "add a brand new team" inline form
  const [newTeamOpenFor, setNewTeamOpenFor] = useState<"league" | string | null>(null);
  const [ntName, setNtName] = useState("");
  const [ntCode, setNtCode] = useState("");
  const [ntCity, setNtCity] = useState("");
  const [ntCrest, setNtCrest] = useState(0);

  function resetNewTeamForm() {
    setNtName("");
    setNtCode("");
    setNtCity("");
    setNtCrest(0);
    setNewTeamOpenFor(null);
  }

  function submitNewTeam(assign: (teamId: string) => void) {
    if (!ntName.trim()) return;
    const teamId = addTeam({
      name: ntName.trim(),
      shortName: (ntCode.trim() || ntName.trim().slice(0, 3)).toUpperCase().slice(0, 4),
      crestColorFrom: CREST_PRESETS[ntCrest].from,
      crestColorTo: CREST_PRESETS[ntCrest].to,
      foundedYear: new Date().getFullYear(),
      homeGround: "TBD",
      city: ntCity.trim() || "TBD",
      category: "U16 Boys",
      competitionId: null,
    });
    assign(teamId);
    resetNewTeamForm();
  }

  const canCreateInfo = name.trim().length > 0;

  function handleInfoContinue() {
    if (!canCreateInfo) return;
    if (format === "league") {
      setStep("league-teams");
    } else {
      setStep("group-setup");
    }
  }

  function toggleLeagueTeam(teamId: string) {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  }

  function finishLeague() {
    const compId = addCompetition({
      name: name.trim(),
      season: season.trim() || String(new Date().getFullYear()),
      format: "league",
      teamIds: selectedTeamIds,
    });
    router.push(`/competitions/${compId}`);
  }

  function groupLabels(n: number) {
    return "ABCDEFGH".slice(0, n).split("");
  }

  function enterGroupAssign() {
    setGroups(groupLabels(numGroups).map((label) => ({ label, teamIds: [] })));
    setOpenGroupPicker(null);
    setStep("group-assign");
  }

  const usedInGroups = new Set(groups.flatMap((g) => g.teamIds));

  function assignExistingToGroup(groupLabel: string, teamId: string) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.label !== groupLabel || g.teamIds.length >= teamsPerGroup) return g;
        return { ...g, teamIds: [...g.teamIds, teamId] };
      })
    );
    const g = groups.find((x) => x.label === groupLabel);
    if (g && g.teamIds.length + 1 >= teamsPerGroup) setOpenGroupPicker(null);
  }

  function removeFromGroup(groupLabel: string, teamId: string) {
    setGroups((prev) =>
      prev.map((g) => (g.label === groupLabel ? { ...g, teamIds: g.teamIds.filter((id) => id !== teamId) } : g))
    );
  }

  const totalGroupTeams = groups.reduce((sum, g) => sum + g.teamIds.length, 0);

  function enterKnockout() {
    setKnockoutPairs(defaultKnockoutPairs(groups));
    setStep("knockout");
  }

  function slotTeam(slot: KnockoutSlot): Team | undefined {
    const g = groups.find((x) => x.label === slot.group);
    const teamId = g?.teamIds[slot.rank - 1];
    return teamId ? teams.find((t) => t.id === teamId) : undefined;
  }

  function slotLabel(slot: KnockoutSlot): string {
    const t = slotTeam(slot);
    return `${slot.group}${slot.rank} · ${t ? t.name : "TBD"}`;
  }

  function setPairSlot(idx: number, side: "home" | "away", key: string) {
    const group = key.slice(0, -1);
    const rank = Number(key.slice(-1));
    setKnockoutPairs((prev) => prev.map((p, i) => (i === idx ? { ...p, [side]: { group, rank } } : p)));
  }

  function finishGroups() {
    const compId = addCompetition({
      name: name.trim(),
      season: season.trim() || String(new Date().getFullYear()),
      format: "groups",
      teamIds: groups.flatMap((g) => g.teamIds),
      groups,
      knockoutPairs,
    });
    router.push(`/competitions/${compId}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 pb-16 md:px-8 md:pt-10">
      {step === "info" && (
        <>
          <StepHeader title="New Competition" subtitle="Set the format, then build it out" onBack={() => router.push("/competitions")} />
          <Card>
            <CardBody className="flex flex-col gap-4">
              <div>
                <Label>Competition name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Metro U16 Championship" />
              </div>
              <div>
                <Label>Season</Label>
                <Input value={season} onChange={(e) => setSeason(e.target.value)} placeholder="e.g. 2026" />
              </div>
              <div>
                <Label>Format</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("league")}
                    className={cn(
                      "flex-1 rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-colors",
                      format === "league" ? "border-brand-400 bg-brand-500/10 text-brand-300" : "border-ink-700 bg-ink-800/50 text-ink-300"
                    )}
                  >
                    League
                    <span className="mt-0.5 block text-[10.5px] font-medium text-ink-500">One table, everyone plays everyone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("groups")}
                    className={cn(
                      "flex-1 rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-colors",
                      format === "groups" ? "border-brand-400 bg-brand-500/10 text-brand-300" : "border-ink-700 bg-ink-800/50 text-ink-300"
                    )}
                  >
                    Groups + Knockout
                    <span className="mt-0.5 block text-[10.5px] font-medium text-ink-500">Group stage, then a bracket</span>
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
          <Button size="lg" className="mt-5 w-full" disabled={!canCreateInfo} onClick={handleInfoContinue}>
            Continue
          </Button>
        </>
      )}

      {step === "league-teams" && (
        <>
          <StepHeader title="Add Teams" subtitle="Pick existing squads, or add a brand new one" onBack={() => setStep("info")} />

          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">Existing teams</p>
          <div className="mb-5 flex flex-col gap-2">
            {teams.map((t) => {
              const checked = selectedTeamIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleLeagueTeam(t.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                    checked ? "border-brand-400/60 bg-brand-500/[0.07]" : "border-ink-700 bg-ink-800/40 hover:border-ink-500"
                  )}
                >
                  <TeamCrest team={t} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-50">{t.name}</p>
                    <p className="text-[11px] text-ink-500">{t.city}</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px]",
                      checked ? "border-brand-500 bg-brand-500" : "border-ink-600"
                    )}
                  >
                    {checked && <div className="h-2 w-2 rounded-sm bg-ink-950" />}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">New team</p>
          {newTeamOpenFor === "league" ? (
            <NewTeamInlineForm
              name={ntName}
              code={ntCode}
              city={ntCity}
              crest={ntCrest}
              setName={setNtName}
              setCode={setNtCode}
              setCity={setNtCity}
              setCrest={setNtCrest}
              onSubmit={() => submitNewTeam((teamId) => setSelectedTeamIds((prev) => [...prev, teamId]))}
            />
          ) : (
            <button
              type="button"
              onClick={() => setNewTeamOpenFor("league")}
              className="mb-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-600 py-3 text-sm font-semibold text-ink-300 hover:border-brand-400 hover:text-brand-300"
            >
              <Plus size={15} /> Add a new team
            </button>
          )}

          <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wide text-ink-500">In this competition</p>
          <div className="mb-6 flex min-h-[24px] flex-wrap gap-2 rounded-xl border border-brand-400/20 bg-brand-500/5 p-3.5">
            {selectedTeamIds.length === 0 ? (
              <span className="text-xs text-ink-500">No teams added yet — tick an existing team above or add a new one.</span>
            ) : (
              selectedTeamIds.map((id) => {
                const t = teams.find((x) => x.id === id);
                if (!t) return null;
                return <TeamChip key={id} team={t} onRemove={() => toggleLeagueTeam(id)} />;
              })
            )}
          </div>

          <Button size="lg" className="w-full" disabled={selectedTeamIds.length === 0} onClick={finishLeague}>
            Create Competition
          </Button>
        </>
      )}

      {step === "group-setup" && (
        <>
          <StepHeader title="Group Stage Setup" subtitle="How many groups, how many teams in each" onBack={() => setStep("info")} />
          <Card>
            <CardBody className="flex flex-col gap-5">
              <div>
                <Label>Number of groups</Label>
                <div className="flex overflow-hidden rounded-xl border border-ink-700">
                  {GROUP_COUNT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumGroups(n)}
                      className={cn(
                        "flex-1 py-3 text-sm font-bold transition-colors",
                        numGroups === n ? "bg-brand-500/15 text-brand-300" : "bg-ink-800/50 text-ink-300"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Teams per group</Label>
                <div className="flex overflow-hidden rounded-xl border border-ink-700">
                  {PER_GROUP_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTeamsPerGroup(n)}
                      className={cn(
                        "flex-1 py-3 text-sm font-bold transition-colors",
                        teamsPerGroup === n ? "bg-brand-500/15 text-brand-300" : "bg-ink-800/50 text-ink-300"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
          <p className="mb-5 mt-3 text-xs text-ink-500">Top 2 from every group advance to the knockout stage.</p>
          <Button size="lg" className="w-full" onClick={enterGroupAssign}>
            Continue to Team Assignment
          </Button>
        </>
      )}

      {step === "group-assign" && (
        <>
          <StepHeader title="Assign Teams" subtitle="Add existing or brand new teams into each group" onBack={() => setStep("group-setup")} />

          <div className="mb-5 flex flex-col gap-4">
            {groups.map((g) => {
              const full = g.teamIds.length >= teamsPerGroup;
              const pickerOpen = openGroupPicker === g.label;
              const available = teams.filter((t) => !usedInGroups.has(t.id));
              return (
                <Card key={g.label}>
                  <CardBody>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-400/15 text-[11px] font-extrabold text-sky-400">
                          {g.label}
                        </div>
                        <p className="font-display text-sm font-bold text-ink-50">Group {g.label}</p>
                      </div>
                      <p className={cn("text-[11.5px] font-semibold", full ? "text-brand-400" : "text-ink-500")}>
                        {g.teamIds.length} / {teamsPerGroup}
                      </p>
                    </div>

                    <div className="mb-3 flex min-h-[20px] flex-wrap gap-2">
                      {g.teamIds.length === 0 ? (
                        <span className="text-xs text-ink-500">No teams yet.</span>
                      ) : (
                        g.teamIds.map((id) => {
                          const t = teams.find((x) => x.id === id);
                          if (!t) return null;
                          return <TeamChip key={id} team={t} onRemove={() => removeFromGroup(g.label, id)} />;
                        })
                      )}
                    </div>

                    {full ? (
                      <div className="rounded-xl border border-ink-700 py-2.5 text-center text-xs font-semibold text-ink-500">
                        Group full
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenGroupPicker(pickerOpen ? null : g.label);
                          resetNewTeamForm();
                        }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-600 py-2.5 text-xs font-semibold text-ink-300 hover:border-brand-400 hover:text-brand-300"
                      >
                        <Plus size={13} /> {pickerOpen ? "Close" : "Add team"}
                      </button>
                    )}

                    {pickerOpen && (
                      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-ink-700 bg-ink-900/40 p-3">
                        {available.length === 0 && newTeamOpenFor !== g.label && (
                          <p className="px-1 text-xs text-ink-500">Every existing team is already placed in a group.</p>
                        )}
                        {newTeamOpenFor !== g.label &&
                          available.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => assignExistingToGroup(g.label, t.id)}
                              className="flex items-center gap-2.5 rounded-lg border border-ink-700 bg-ink-800/50 px-3 py-2 text-left hover:border-ink-500"
                            >
                              <TeamCrest team={t} size="xs" />
                              <span className="truncate text-xs font-semibold text-ink-100">{t.name}</span>
                            </button>
                          ))}

                        {newTeamOpenFor === g.label ? (
                          <NewTeamInlineForm
                            name={ntName}
                            code={ntCode}
                            city={ntCity}
                            crest={ntCrest}
                            setName={setNtName}
                            setCode={setNtCode}
                            setCity={setNtCity}
                            setCrest={setNtCrest}
                            compact
                            onSubmit={() =>
                              submitNewTeam((teamId) => {
                                setGroups((prev) =>
                                  prev.map((grp) =>
                                    grp.label === g.label && grp.teamIds.length < teamsPerGroup
                                      ? { ...grp, teamIds: [...grp.teamIds, teamId] }
                                      : grp
                                  )
                                );
                                setOpenGroupPicker(null);
                              })
                            }
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setNewTeamOpenFor(g.label)}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-600 py-2 text-xs font-semibold text-ink-300 hover:border-brand-400 hover:text-brand-300"
                          >
                            <Plus size={12} /> New team for Group {g.label}
                          </button>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <Button size="lg" className="w-full" disabled={totalGroupTeams < 2} onClick={enterKnockout}>
            Continue to Knockout Draw
          </Button>
        </>
      )}

      {step === "knockout" && (
        <>
          <StepHeader
            title={`${roundLabel(knockoutPairs.length)} Draw`}
            subtitle="Set who plays who once the groups finish"
            onBack={() => setStep("group-assign")}
          />

          <div className="mb-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">
              {roundLabel(knockoutPairs.length)} — editable
            </p>
            <div className="flex flex-col gap-2">
              {knockoutPairs.map((pair, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-800/40 px-3 py-2.5">
                  <span className="w-6 shrink-0 text-[11px] font-bold text-ink-500">M{i + 1}</span>
                  <select
                    value={slotKey(pair.home)}
                    onChange={(e) => setPairSlot(i, "home", e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-ink-600 bg-ink-950/50 px-2 py-2 text-xs font-semibold text-ink-50 outline-none"
                  >
                    {computeAllSlots(groups).map((s) => (
                      <option key={slotKey(s)} value={slotKey(s)}>
                        {slotLabel(s)}
                      </option>
                    ))}
                  </select>
                  <span className="shrink-0 text-[10.5px] font-bold text-ink-500">vs</span>
                  <select
                    value={slotKey(pair.away)}
                    onChange={(e) => setPairSlot(i, "away", e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-ink-600 bg-ink-950/50 px-2 py-2 text-xs font-semibold text-ink-50 outline-none"
                  >
                    {computeAllSlots(groups).map((s) => (
                      <option key={slotKey(s)} value={slotKey(s)}>
                        {slotLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <SubsequentRounds firstRoundMatches={knockoutPairs.length} />

          <Button size="lg" className="w-full" onClick={finishGroups}>
            Create Competition
          </Button>
        </>
      )}
    </div>
  );
}

function NewTeamInlineForm({
  name,
  code,
  city,
  crest,
  setName,
  setCode,
  setCity,
  setCrest,
  onSubmit,
  compact,
}: {
  name: string;
  code: string;
  city: string;
  crest: number;
  setName: (v: string) => void;
  setCode: (v: string) => void;
  setCity: (v: string) => void;
  setCrest: (v: number) => void;
  onSubmit: () => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-ink-700 bg-ink-900/40 p-3.5", compact && "p-3")}>
      <div className="grid grid-cols-2 gap-2.5">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" className="py-2.5 text-xs" />
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" maxLength={4} className="py-2.5 text-xs" />
      </div>
      {!compact && <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="py-2.5 text-xs" />}
      <CrestSwatches value={crest} onChange={setCrest} />
      <Button variant="outline" size="sm" className="w-full justify-center" onClick={onSubmit}>
        Add This Team
      </Button>
    </div>
  );
}

function SubsequentRounds({ firstRoundMatches }: { firstRoundMatches: number }) {
  const rounds: { label: string; matches: number }[] = [];
  let m = firstRoundMatches / 2;
  while (m >= 1) {
    rounds.push({ label: roundLabel(m), matches: m });
    if (m === 1) break;
    m = m / 2;
  }
  if (rounds.length === 0) return null;

  let prevPrefix = "M";
  return (
    <div className="mb-6 flex flex-col gap-4">
      {rounds.map((round) => {
        const boxes = Array.from({ length: round.matches }).map((_, i) => {
          const a = `Winner ${prevPrefix}${i * 2 + 1}`;
          const b = `Winner ${prevPrefix}${i * 2 + 2}`;
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-ink-700 bg-ink-900/20 px-3 py-2.5 text-xs text-ink-400"
            >
              <span>{a}</span>
              <span className="text-[10.5px] font-bold text-ink-600">vs</span>
              <span>{b}</span>
            </div>
          );
        });
        const label = round.label;
        prevPrefix = label === "Final" ? "F" : label.slice(0, 2).toUpperCase();
        return (
          <div key={round.label}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">{round.label}</p>
            <div className="flex flex-col gap-2">{boxes}</div>
          </div>
        );
      })}
    </div>
  );
}
