import Link from "next/link";
import { Flame, Users, Activity, Utensils, ArrowRight } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchRescueFeed } from "@/lib/queries/rescues";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { RescueCard } from "@/components/rescue/rescue-card";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";
import { Button } from "@/components/ui/button";
import { daysAgoIso } from "@/lib/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();

  const [feed, { count: activeCount }, { count: waitingCount }, { count: progressCount }, { data: chapterRescueIds }] =
    await Promise.all([
      fetchRescueFeed(supabase, profile.chapter_id!),
      supabase
        .from("rescues")
        .select("id", { count: "exact", head: true })
        .eq("chapter_id", profile.chapter_id!)
        .not("status", "in", "(completed,cancelled,rejected,food_unsuitable,donor_unavailable,duplicate_request)"),
      supabase
        .from("rescues")
        .select("id", { count: "exact", head: true })
        .eq("chapter_id", profile.chapter_id!)
        .eq("status", "open"),
      supabase
        .from("rescues")
        .select("id", { count: "exact", head: true })
        .eq("chapter_id", profile.chapter_id!)
        .in("status", ["en_route", "at_pickup", "food_inspected", "collection_in_progress", "collected", "en_route_to_distribution"]),
      supabase.from("rescues").select("id").eq("chapter_id", profile.chapter_id!),
    ]);

  const { data: weekMeals } = await supabase
    .from("distribution_records")
    .select("meals_distributed")
    .in("rescue_id", (chapterRescueIds ?? []).map((r) => r.id))
    .gte("distributed_at", daysAgoIso(7));

  const mealsThisWeek = (weekMeals ?? []).reduce((sum, r) => sum + (r.meals_distributed ?? 0), 0);
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <RealtimeRefresher tables={["rescues", "rescue_assignments"]} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what needs attention right now.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active rescues" value={activeCount ?? 0} icon={Activity} />
        <StatCard label="Waiting for volunteer" value={waitingCount ?? 0} icon={Users} tone="urgent" />
        <StatCard label="In progress" value={progressCount ?? 0} icon={Flame} tone="warning" />
        <StatCard label="Meals rescued this week" value={mealsThisWeek} icon={Utensils} tone="success" />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Urgent food calls</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/rescues">
            See all <ArrowRight />
          </Link>
        </Button>
      </div>

      {feed.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No urgent rescues right now"
          description="All active food calls in your areas will appear here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {feed.slice(0, 6).map((rescue) => (
            <RescueCard key={rescue.id} rescue={rescue} />
          ))}
        </div>
      )}
    </div>
  );
}
