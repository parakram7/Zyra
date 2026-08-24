import { cn } from "@/lib/cn";
import type { MatchStatus } from "@/lib/types";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        className
      )}
    >
      {children}
    </span>
  );
}

export function MatchStatusBadge({ status, minuteLabel }: { status: MatchStatus; minuteLabel?: string }) {
  if (status === "LIVE") {
    return (
      <Badge className="bg-live/15 text-live">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-live" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
        </span>
        {minuteLabel ?? "LIVE"}
      </Badge>
    );
  }
  if (status === "COMPLETED") {
    return <Badge className="bg-ink-700/50 text-ink-300">FT</Badge>;
  }
  return <Badge className="bg-sky-500/15 text-sky-400">Upcoming</Badge>;
}
