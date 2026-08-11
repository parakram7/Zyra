import { cn } from "@/lib/cn";

export function StatTile({
  label,
  value,
  accent = false,
  className,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-2xl border border-ink-700/50 bg-ink-900/60 px-3 py-4 text-center",
        className
      )}
    >
      <span
        className={cn(
          "font-display text-2xl font-extrabold tabular-nums tracking-tight",
          accent ? "text-volt-300" : "text-white"
        )}
      >
        {value}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</span>
    </div>
  );
}
