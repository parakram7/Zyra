"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MatchCard } from "@/components/match-card";
import { Button } from "@/components/ui/button";
import { useMatches } from "@/lib/hooks";
import type { MatchStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const TABS: { key: MatchStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "LIVE", label: "Live" },
  { key: "SCHEDULED", label: "Upcoming" },
  { key: "COMPLETED", label: "Completed" },
];

export default function MatchesPage() {
  const matches = useMatches();
  const [tab, setTab] = useState<MatchStatus | "ALL">("ALL");

  const filtered = matches
    .filter((m) => tab === "ALL" || m.status === tab)
    .sort((a, b) => {
      if (a.status === "LIVE" && b.status !== "LIVE") return -1;
      if (b.status === "LIVE" && a.status !== "LIVE") return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
      <PageHeader
        title="Matches"
        subtitle="All fixtures, live games and results"
        action={
          <Link href="/matches/new">
            <Button size="sm">
              <Plus size={15} /> New
            </Button>
          </Link>
        }
      />

      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors tap-target",
              tab === t.key
                ? "bg-ink-100 text-ink-900"
                : "bg-ink-800/70 text-ink-300 hover:text-ink-50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm text-ink-500">No matches here yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
