import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  computeAreaMetrics, computeFailureReasons, computeFoodSources, computeOverview,
  computeQuantityMetrics, computeResponseMetrics, computeTransportMetrics, formatMinutes,
} from "@/lib/analytics";
import { DONOR_TYPE_LABELS } from "@/lib/labels";
import { StatCard } from "@/components/shared/stat-card";
import { SimpleBarChart } from "@/components/analytics/simple-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, PackageCheck, Utensils, Weight, CheckCircle2, Clock, Truck, AlertTriangle,
} from "lucide-react";

export default async function AnalyticsPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const [{ data: rescues }, { data: profiles }, { data: zones }] = await Promise.all([
    supabase.from("rescues").select("*").eq("chapter_id", admin.chapter_id!),
    supabase.from("profiles").select("*").eq("chapter_id", admin.chapter_id!),
    supabase.from("zones").select("id, name").eq("chapter_id", admin.chapter_id!),
  ]);

  const rescueIds = (rescues ?? []).map((r) => r.id);
  const [{ data: transportRequests }, { data: transportOffers }, { data: feedback }, { data: distributionRecords }] =
    rescueIds.length
      ? await Promise.all([
          supabase.from("transport_requests").select("*").in("rescue_id", rescueIds),
          supabase.from("transport_offers").select("*").in("rescue_id", rescueIds),
          supabase.from("rescue_feedback").select("*").in("rescue_id", rescueIds),
          supabase.from("distribution_records").select("*").in("rescue_id", rescueIds),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const R = rescues ?? [];
  const overview = computeOverview(R, profiles ?? []);
  const response = computeResponseMetrics(R);
  const transport = computeTransportMetrics(R, transportRequests ?? [], transportOffers ?? [], feedback ?? []);
  const foodSources = computeFoodSources(R).map((f) => ({ label: DONOR_TYPE_LABELS[f.type], value: f.count }));
  const areas = computeAreaMetrics(R, profiles ?? [], zones ?? []);
  const quantity = computeQuantityMetrics(R, distributionRecords ?? []);
  const failures = computeFailureReasons(R);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total requests" value={overview.totalRequests} icon={PackageCheck} />
          <StatCard label="Completed" value={overview.completedRescues} icon={CheckCircle2} tone="success" />
          <StatCard label="Success rate" value={`${overview.successRate}%`} icon={CheckCircle2} />
          <StatCard label="Meals distributed" value={overview.estimatedMealsDistributed} icon={Utensils} />
          <StatCard label="Food rescued (kg)" value={overview.totalFoodRescuedKg} icon={Weight} />
          <StatCard label="Active volunteers" value={overview.activeVolunteers} icon={Users} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Response metrics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Avg time to claim" value={formatMinutes(response.avgClaimMinutes)} icon={Clock} />
          <StatCard label="Median time to claim" value={formatMinutes(response.medianClaimMinutes)} icon={Clock} />
          <StatCard label="Avg submission → pickup" value={formatMinutes(response.avgSubmissionToPickupMinutes)} icon={Clock} />
          <StatCard label="Avg rescue duration" value={formatMinutes(response.avgDurationMinutes)} icon={Clock} />
          <StatCard label="Claimed within 5 min" value={`${response.pctClaimedWithin5}%`} icon={CheckCircle2} tone="success" />
          <StatCard label="Claimed within 15 min" value={`${response.pctClaimedWithin15}%`} icon={CheckCircle2} tone="success" />
        </div>
        {response.expiredUnfulfilled > 0 && (
          <p className="text-sm text-warning">{response.expiredUnfulfilled} request(s) currently past their pickup deadline, unfulfilled.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Transportation</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Rescues needing transport" value={transport.rescuesRequiringTransport} icon={Truck} />
          <StatCard label="Delayed by transport" value={`${transport.pctDelayedByTransport}%`} icon={AlertTriangle} tone="warning" />
          <StatCard label="Volunteer-provided transport" value={transport.volunteerProvidedTransport} icon={Truck} />
          <StatCard label="Paid commercial transport" value={transport.paidCommercialTransport} icon={Truck} />
          <StatCard
            label="Avg transport cost"
            value={transport.avgTransportCost != null ? `₹${Math.round(transport.avgTransportCost)}` : "—"}
            icon={Truck}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Food sources</CardTitle></CardHeader>
          <CardContent><SimpleBarChart data={foodSources} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Failure reasons</CardTitle></CardHeader>
          <CardContent><SimpleBarChart data={failures.map((f) => ({ label: f.reason, value: f.count }))} layout="vertical" color="var(--color-chart-4)" /></CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Areas</h2>
        <Card>
          <CardContent className="overflow-x-auto pt-5">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-1.5">Area</th>
                  <th className="py-1.5">Rescues</th>
                  <th className="py-1.5">Avg response time</th>
                  <th className="py-1.5">Volunteers available</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a.area} className="border-t">
                    <td className="py-1.5 font-medium">{a.area}</td>
                    <td className="py-1.5">{a.rescues}</td>
                    <td className="py-1.5">{formatMinutes(a.avgResponseMinutes)}</td>
                    <td className="py-1.5">{a.volunteersAvailable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Quantity</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Kg rescued" value={quantity.kgRescued} icon={Weight} />
          <StatCard label="Meals estimated" value={quantity.mealsEstimated} icon={Utensils} />
          <StatCard label="Meals actually distributed" value={quantity.mealsActuallyDistributed} icon={Utensils} tone="success" />
        </div>
      </section>
    </div>
  );
}
