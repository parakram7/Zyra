"use client";

import { ArrowLeftRight } from "lucide-react";
import { CardIcon, FootballIcon } from "@/components/icons";

export type EventButtonType = "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "OWN_GOAL";

export function EventButtons({ onOpen, disabled }: { onOpen: (t: EventButtonType) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        onClick={() => onOpen("GOAL")}
        disabled={disabled}
        className="tap-target flex h-20 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-volt-300 to-volt-400 text-ink-950 shadow-glow transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        <FootballIcon size={26} />
        <span className="font-display text-xl font-extrabold tracking-tight">GOAL</span>
      </button>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onOpen("YELLOW_CARD")}
          disabled={disabled}
          className="tap-target flex h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-ink-800/80 text-ink-100 transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          <CardIcon type="YELLOW_CARD" size={18} />
          <span className="text-xs font-bold">Yellow</span>
        </button>
        <button
          onClick={() => onOpen("RED_CARD")}
          disabled={disabled}
          className="tap-target flex h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-ink-800/80 text-ink-100 transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          <CardIcon type="RED_CARD" size={18} />
          <span className="text-xs font-bold">Red</span>
        </button>
        <button
          onClick={() => onOpen("SUBSTITUTION")}
          disabled={disabled}
          className="tap-target flex h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-ink-800/80 text-ink-100 transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          <ArrowLeftRight size={18} className="text-sky-400" />
          <span className="text-xs font-bold">Substitution</span>
        </button>
        <button
          onClick={() => onOpen("OWN_GOAL")}
          disabled={disabled}
          className="tap-target flex h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-ink-800/80 text-ink-100 transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          <FootballIcon size={18} className="text-ink-400" />
          <span className="text-xs font-bold">Own Goal</span>
        </button>
      </div>
    </div>
  );
}
