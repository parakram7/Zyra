import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "my-areas", label: "My areas" },
  { key: "nearby", label: "Nearby" },
  { key: "urgent", label: "Urgent" },
  { key: "transport", label: "Transport needed" },
  { key: "unclaimed", label: "Unclaimed" },
] as const;

export function FilterBar({ active, search }: { active: string; search?: string }) {
  return (
    <div className="space-y-3">
      <form action="/rescues" className="flex gap-2">
        <input type="hidden" name="filter" value={active} />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={search}
            placeholder="Search locality, rescue ID, donor..."
            className="h-10 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
      </form>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={{ pathname: "/rescues", query: { filter: f.key, ...(search ? { q: search } : {}) } }}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input text-foreground hover:bg-accent"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
