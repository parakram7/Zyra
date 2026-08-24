import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import type { Team } from "@/lib/types";

const sizeMap = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export function PlayerAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-ink-600/60 bg-gradient-to-br from-ink-700 to-ink-800 font-display font-bold text-ink-200",
        sizeMap[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
}

export function TeamCrest({
  team,
  size = "md",
  className,
}: {
  team: Team;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-display font-extrabold text-ink-950",
        sizeMap[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${team.crestColorFrom}, ${team.crestColorTo})`,
      }}
    >
      {team.shortName}
    </div>
  );
}
