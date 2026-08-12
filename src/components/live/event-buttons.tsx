"use client";

import { ArrowLeftRight } from "lucide-react";
import { CardIcon, FootballIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export type EventButtonType = "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "OWN_GOAL";

function SecondaryEventButton({
  onClick,
  disabled,
  label,
  iconBg,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="tap-target flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-ink-700/50 bg-ink-850 text-ink-100 transition-colors hover:border-ink-600 active:scale-[0.98] disabled:opacity-40"
    >
      <span className={cn("flex h-6 w-6 items-center justify-center rounded-full", iconBg)}>
        {children}
      </span>
      <span className="text-[12.5px] font-medium">{label}</span>
    </button>
  );
}

export function EventButtons({ onOpen, disabled }: { onOpen: (t: EventButtonType) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        onClick={() => onOpen("GOAL")}
        disabled={disabled}
        className="tap-target flex h-20 items-center justify-center gap-3 rounded-2xl bg-brand-600 text-white shadow-card transition-colors hover:bg-brand-500 active:scale-[0.98] disabled:opacity-40"
      >
        <FootballIcon size={24} />
        <span className="font-display text-xl font-bold tracking-tight">GOAL</span>
      </button>

      <div className="grid grid-cols-2 gap-2.5">
        <SecondaryEventButton
          onClick={() => onOpen("YELLOW_CARD")}
          disabled={disabled}
          label="Yellow Card"
          iconBg="bg-cardyellow/15"
        >
          <CardIcon type="YELLOW_CARD" size={14} />
        </SecondaryEventButton>
        <SecondaryEventButton
          onClick={() => onOpen("RED_CARD")}
          disabled={disabled}
          label="Red Card"
          iconBg="bg-cardred/15"
        >
          <CardIcon type="RED_CARD" size={14} />
        </SecondaryEventButton>
        <SecondaryEventButton
          onClick={() => onOpen("SUBSTITUTION")}
          disabled={disabled}
          label="Substitution"
          iconBg="bg-sky-500/15"
        >
          <ArrowLeftRight size={13} className="text-sky-400" />
        </SecondaryEventButton>
        <SecondaryEventButton
          onClick={() => onOpen("OWN_GOAL")}
          disabled={disabled}
          label="Own Goal"
          iconBg="bg-ink-600/40"
        >
          <FootballIcon size={13} className="text-ink-300" />
        </SecondaryEventButton>
      </div>
    </div>
  );
}
