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
        "flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-ink-700/40 bg-ink-850 px-3 py-5 text-center",
        className
      )}
    >
      <span
        className={cn(
          "font-display text-[26px] font-bold tabular-nums leading-none tracking-tight",
          accent ? "text-brand-400" : "text-ink-50"
        )}
      >
        {value}
      </span>
      <span className="text-[10.5px] font-medium uppercase tracking-wide text-ink-400">{label}</span>
    </div>
  );
}
