import Link from "next/link";
import { History, Utensils, Weight, Clock, Truck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/rescue/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export default async function HistoryPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("rescue_assignments")
    .select("rescue_id")
    .eq("profile_id", profile.id);

  const rescueIds = [...new Set((assignments ?? []).map((a) => a.rescue_id))];

  const { data: pastRescues } = rescueIds.length
    ? await supabase
        .from("rescues")
        .select("id, code, venue_name, area, status, completed_at, estimated_meals, actual_quantity_kg")
        .in("id", rescueIds)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">History</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Rescues completed" value={profile.rescues_completed} icon={History} />
        <StatCard label="Meals rescued" value={Math.round(profile.meals_rescued)} icon={Utensils} tone="success" />
        <StatCard label="Kg rescued" value={Math.round(profile.kg_rescued)} icon={Weight} />
        <StatCard label="Hours volunteered" value={Math.round(profile.hours_volunteered)} icon={Clock} />
        <StatCard label="Transport contributions" value={profile.transport_contributions} icon={Truck} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Past rescues</h2>
        {(pastRescues ?? []).length === 0 ? (
          <EmptyState icon={History} title="No completed rescues yet" description="Rescues you complete will show up here." />
        ) : (
          <div className="space-y-2">
            {pastRescues!.map((r) => (
              <Link key={r.id} href={`/rescues/${r.id}`}>
                <Card className="gap-1 py-3 transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center justify-between px-4">
                    <div>
                      <p className="text-sm font-medium">{r.venue_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.area} · {formatDateTime(r.completed_at)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
