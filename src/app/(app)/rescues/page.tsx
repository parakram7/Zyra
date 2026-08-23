import { Search as SearchIcon } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchRescueFeed, OPEN_FEED_STATUSES } from "@/lib/queries/rescues";
import { RescueCard } from "@/components/rescue/rescue-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";
import { FilterBar } from "./filter-bar";
import { getUrgency } from "@/lib/urgency";

export default async function RescuesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter = "all", q } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();

  let feed = await fetchRescueFeed(supabase, profile.chapter_id!, {
    statuses: OPEN_FEED_STATUSES,
    search: q,
  });

  if (filter === "my-areas" && profile.preferred_zone_ids.length) {
    const { data: zones } = await supabase.from("zones").select("name").in("id", profile.preferred_zone_ids);
    const names = new Set((zones ?? []).map((z) => z.name));
    feed = feed.filter((r) => names.has(r.area));
  }
  if (filter === "urgent") {
    feed = feed.filter((r) => ["critical", "urgent"].includes(getUrgency(r.collection_deadline).level));
  }
  if (filter === "transport") {
    feed = feed.filter(
      (r) => r.transport_requests && !["not_required", "completed"].includes(r.transport_requests.status)
    );
  }
  if (filter === "unclaimed") {
    feed = feed.filter((r) => r.status === "open");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <RealtimeRefresher tables={["rescues", "rescue_assignments"]} />
      <h1 className="text-2xl font-semibold tracking-tight">Rescues</h1>
      <FilterBar active={filter} search={q} />

      {feed.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No rescues match this filter"
          description="Try a different filter, or check back shortly as new calls come in."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {feed.map((rescue) => (
            <RescueCard key={rescue.id} rescue={rescue} />
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Showing {feed.length} active calls in your chapter.</p>
    </div>
  );
}
