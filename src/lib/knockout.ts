// Shared helpers for the "Groups + Knockout" competition format — used by
// both the competition creation wizard and the competition detail page so
// the draw logic and round naming can't drift between the two.

import type { CompetitionGroup, KnockoutPair, KnockoutSlot } from "./types";

export function slotKey(s: KnockoutSlot): string {
  return `${s.group}${s.rank}`;
}

export function defaultKnockoutPairs(groups: CompetitionGroup[]): KnockoutPair[] {
  const firsts: KnockoutSlot[] = groups.map((g) => ({ group: g.label, rank: 1 }));
  const seconds: KnockoutSlot[] = groups.map((g) => ({ group: g.label, rank: 2 }));
  return firsts.map((f, i) => ({ home: f, away: seconds[(i + 1) % seconds.length] }));
}

export function roundLabel(matches: number): string {
  if (matches === 1) return "Final";
  if (matches === 2) return "Semi-finals";
  if (matches === 4) return "Quarter-finals";
  if (matches === 8) return "Round of 16";
  return `Round of ${matches * 2}`;
}

export function allSlots(groups: CompetitionGroup[]): KnockoutSlot[] {
  const slots: KnockoutSlot[] = [];
  groups.forEach((g) => {
    for (let rank = 1; rank <= 2; rank++) slots.push({ group: g.label, rank });
  });
  return slots;
}
