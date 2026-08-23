import { UserCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RESCUE_FEED_SELECT, normalizeRescueRow } from "@/lib/queries/rescues";
import { RescueCard } from "@/components/rescue/rescue-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";

export default async function MyRescuesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("rescue_assignments")
    .select("rescue_id")
    .eq("profile_id", profile.id)
    .neq("status", "cancelled");

  const rescueIds = [...new Set((assignments ?? []).map((a) => a.rescue_id))];

  const { data } = rescueIds.length
    ? await supabase
        .from("rescues")
        .select(RESCUE_FEED_SELECT)
        .in("id", rescueIds)
        .not("status", "in", "(completed,cancelled,rejected,food_unsuitable,donor_unavailable,duplicate_request)")
        .order("collection_deadline", { ascending: true })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .overrideTypes<any[], { merge: false }>()
    : { data: [] };

  const feed = (data ?? []).map(normalizeRescueRow);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <RealtimeRefresher tables={["rescues", "rescue_assignments"]} />
      <h1 className="text-2xl font-semibold tracking-tight">My Rescues</h1>
      {feed.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="You haven't joined any active rescues"
          description="Claim or join a rescue from the feed to see it here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {feed.map((rescue) => (
            <RescueCard key={rescue.id} rescue={rescue} />
          ))}
        </div>
      )}
    </div>
  );
}
