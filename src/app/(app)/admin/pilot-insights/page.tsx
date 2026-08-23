import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { computePilotMetrics, formatMinutes } from "@/lib/analytics";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Timer, TrendingUp, CheckCircle2, Users, Weight, Utensils, Truck } from "lucide-react";

export default async function PilotInsightsPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: rescues } = await supabase.from("rescues").select("*").eq("chapter_id", admin.chapter_id!);
  const rescueIds = (rescues ?? []).map((r) => r.id);

  const [{ data: feedback }, { data: assignments }] = rescueIds.length
    ? await Promise.all([
        supabase.from("rescue_feedback").select("*").in("rescue_id", rescueIds),
        supabase.from("rescue_assignments").select("rescue_id, status").in("rescue_id", rescueIds),
      ])
    : [{ data: [] }, { data: [] }];

  const volunteerCounts = new Map<string, number>();
  for (const a of assignments ?? []) {
    if (a.status === "cancelled") continue;
    volunteerCounts.set(a.rescue_id, (volunteerCounts.get(a.rescue_id) ?? 0) + 1);
  }

  const m = computePilotMetrics(rescues ?? [], feedback ?? [], volunteerCounts);

  const rows: { label: string; value: string }[] = [
    { label: "1. Submission → first Robin response (claim)", value: formatMinutes(m.avgFirstResponseMinutes) },
    { label: "2. Submission → rescue claimed", value: formatMinutes(m.avgFirstResponseMinutes) },
    { label: "3. Claim → departure", value: formatMinutes(m.avgClaimToDepartureMinutes) },
    { label: "4. Submission → food collected", value: formatMinutes(m.avgSubmissionToCollectedMinutes) },
    { label: "5. Transport arrangement time", value: formatMinutes(m.avgTransportArrangementMinutes) },
    { label: "6. Total rescue duration", value: formatMinutes(m.avgTotalDurationMinutes) },
    { label: "7. Volunteers needed (avg)", value: m.avgVolunteersNeeded?.toFixed(1) ?? "—" },
    { label: "8. Volunteers who joined (avg)", value: m.avgVolunteersJoined?.toFixed(1) ?? "—" },
    { label: "9. Estimated quantity (avg kg, reported)", value: m.avgEstimatedQty != null ? `${m.avgEstimatedQty.toFixed(1)} kg` : "—" },
    { label: "10. Actual quantity (avg kg)", value: m.avgActualQty != null ? `${m.avgActualQty.toFixed(1)} kg` : "—" },
    { label: "11. Estimated meals (avg)", value: m.avgEstimatedMeals?.toFixed(0) ?? "—" },
    { label: "12. Actual meals distributed (avg)", value: m.avgActualMeals?.toFixed(0) ?? "—" },
    { label: "13. Pickup success/failure rate", value: `${m.pickupSuccessRate}% successful` },
    { label: "14. Reasons for delays", value: "See Analytics → Failure reasons" },
    { label: "15. Transport as primary bottleneck", value: `${m.transportWasBottleneckRate}% of feedback` },
    { label: "16. Donor information completeness", value: `${m.donorInfoCompleteRate}%` },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pilot Insights</h1>
        <p className="text-sm text-muted-foreground">
          Is RescueLink actually solving the coordination problem? Tracked for the Jaipur pilot.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Median claim time" value={formatMinutes(m.medianClaimMinutes)} icon={Timer} />
        <StatCard label="Transport-related delays" value={`${m.transportWasBottleneckRate}%`} icon={Truck} tone="warning" />
        <StatCard label="Successful rescues" value={`${m.pickupSuccessRate}%`} icon={CheckCircle2} tone="success" />
        <StatCard label="Avg total duration" value={formatMinutes(m.avgTotalDurationMinutes)} icon={TrendingUp} />
        <StatCard label="Avg volunteers per rescue" value={m.avgVolunteersJoined?.toFixed(1) ?? "—"} icon={Users} />
        <StatCard label="Avg meals per rescue" value={m.avgActualMeals?.toFixed(0) ?? "—"} icon={Utensils} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All tracked pilot metrics</CardTitle>
          <CardDescription>Calculated live from the database — not hardcoded.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium">{r.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Weight className="size-4" /> Why this page exists</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Jaipur chapter wants to know whether a coordination app actually reduces response time and
            surfaces missing blocks (transport, containers, verification) during live drives. These numbers
            update automatically as the pilot runs — no manual tallying required.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
