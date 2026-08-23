// Pure aggregation helpers for the Analytics + Pilot Insights dashboards.
// Everything here is computed from real rows fetched server-side — nothing is hardcoded.

import type { Rescue, RescueFeedback, TransportRequest, Profile, DonorType, TransportOffer, DistributionRecord } from "@/lib/database.types";

const NEGATIVE_TERMINAL = ["cancelled", "rejected", "food_unsuitable", "donor_unavailable", "duplicate_request"] as const;
const COMPLETED_LIKE = ["completed", "distributed"] as const;

function minutesBetween(a?: string | null, b?: string | null): number | null {
  if (!a || !b) return null;
  const diff = (new Date(b).getTime() - new Date(a).getTime()) / 60000;
  return diff >= 0 ? diff : null;
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function computeOverview(rescues: Rescue[], profiles: Profile[]) {
  const total = rescues.length;
  const completed = rescues.filter((r) => r.status === "completed").length;
  const activeVolunteers = profiles.filter((p) => p.verification_status === "verified").length;
  const mealsDistributed = rescues.reduce((s, r) => s + (r.estimated_meals ?? 0), 0);
  const kgRescued = rescues.reduce((s, r) => s + (r.actual_quantity_kg ?? 0), 0);

  return {
    totalRequests: total,
    completedRescues: completed,
    successRate: pct(completed, total),
    estimatedMealsDistributed: mealsDistributed,
    totalFoodRescuedKg: Math.round(kgRescued),
    activeVolunteers,
  };
}

export function computeResponseMetrics(rescues: Rescue[]) {
  const claimTimes = rescues.map((r) => minutesBetween(r.submitted_at, r.claimed_at)).filter((n): n is number => n != null);
  const pickupTimes = rescues.map((r) => minutesBetween(r.submitted_at, r.at_pickup_at)).filter((n): n is number => n != null);
  const durations = rescues.map((r) => minutesBetween(r.submitted_at, r.completed_at)).filter((n): n is number => n != null);

  const now = Date.now();
  const expired = rescues.filter(
    (r) => ["submitted", "open", "awaiting_verification"].includes(r.status) && new Date(r.collection_deadline).getTime() < now
  ).length;

  return {
    avgClaimMinutes: avg(claimTimes),
    medianClaimMinutes: median(claimTimes),
    avgSubmissionToPickupMinutes: avg(pickupTimes),
    avgDurationMinutes: avg(durations),
    pctClaimedWithin5: pct(claimTimes.filter((t) => t <= 5).length, claimTimes.length),
    pctClaimedWithin15: pct(claimTimes.filter((t) => t <= 15).length, claimTimes.length),
    expiredUnfulfilled: expired,
  };
}

export function computeTransportMetrics(
  rescues: Rescue[],
  transportRequests: TransportRequest[],
  transportOffers: TransportOffer[],
  feedback: RescueFeedback[]
) {
  const requiring = transportRequests.filter((t) => t.status !== "not_required").length;
  const volunteerProvided = transportOffers.filter((o) => o.status === "assigned").length;
  const paidCommercial = transportRequests.filter((t) => t.assigned_contact_id).length;
  const charges = transportRequests
    .map((t) => t.actual_charge ?? (t.estimated_charge_low != null && t.estimated_charge_high != null ? (t.estimated_charge_low + t.estimated_charge_high) / 2 : null))
    .filter((n): n is number => n != null);
  const delayedByTransport = pct(
    feedback.filter((f) => f.biggest_delay === "transportation").length,
    feedback.length
  );

  return {
    rescuesRequiringTransport: requiring,
    pctDelayedByTransport: delayedByTransport,
    volunteerProvidedTransport: volunteerProvided,
    paidCommercialTransport: paidCommercial,
    avgTransportCost: avg(charges),
  };
}

export function computeFoodSources(rescues: Rescue[]) {
  const byType = new Map<DonorType, number>();
  for (const r of rescues) byType.set(r.donor_type, (byType.get(r.donor_type) ?? 0) + 1);
  return Array.from(byType.entries()).map(([type, count]) => ({ type, count }));
}

export function computeAreaMetrics(rescues: Rescue[], profiles: Profile[], zones: { id: string; name: string }[]) {
  const byArea = new Map<string, { count: number; claimTimes: number[] }>();
  for (const r of rescues) {
    const bucket = byArea.get(r.area) ?? { count: 0, claimTimes: [] };
    bucket.count += 1;
    const t = minutesBetween(r.submitted_at, r.claimed_at);
    if (t != null) bucket.claimTimes.push(t);
    byArea.set(r.area, bucket);
  }
  return Array.from(byArea.entries())
    .map(([area, b]) => {
      const zone = zones.find((z) => z.name === area);
      const availableVolunteers = zone ? profiles.filter((p) => p.preferred_zone_ids.includes(zone.id)).length : 0;
      return { area, rescues: b.count, avgResponseMinutes: avg(b.claimTimes), volunteersAvailable: availableVolunteers };
    })
    .sort((a, b) => b.rescues - a.rescues);
}

export function computeQuantityMetrics(rescues: Rescue[], distributionRecords: DistributionRecord[]) {
  return {
    kgRescued: Math.round(rescues.reduce((s, r) => s + (r.actual_quantity_kg ?? 0), 0)),
    mealsEstimated: rescues.reduce((s, r) => s + (r.estimated_meals ?? 0), 0),
    mealsActuallyDistributed: distributionRecords.reduce((s, d) => s + (d.meals_distributed ?? 0), 0),
  };
}

export function computeFailureReasons(rescues: Rescue[]) {
  const now = Date.now();
  const reasons = new Map<string, number>();
  const bump = (k: string) => reasons.set(k, (reasons.get(k) ?? 0) + 1);

  for (const r of rescues) {
    if (r.status === "food_unsuitable") bump("Food unsuitable");
    else if (r.status === "duplicate_request") bump("Duplicate");
    else if (r.status === "rejected") bump("Verification failed");
    else if (r.status === "donor_unavailable") bump("Donor cancelled / unavailable");
    else if (r.status === "cancelled") bump(r.cancellation_reason ? "Donor cancelled / unavailable" : "Other");
    else if (["submitted", "open"].includes(r.status) && new Date(r.collection_deadline).getTime() < now) bump("Pickup window missed — no volunteer available");
    else if (r.status === "team_forming" && new Date(r.collection_deadline).getTime() < now) bump("Pickup window missed — insufficient volunteers");
  }

  return Array.from(reasons.entries()).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
}

export interface PilotMetrics {
  medianClaimMinutes: number | null;
  avgFirstResponseMinutes: number | null;
  avgClaimToDepartureMinutes: number | null;
  avgSubmissionToCollectedMinutes: number | null;
  avgTransportArrangementMinutes: number | null;
  avgTotalDurationMinutes: number | null;
  avgVolunteersNeeded: number | null;
  avgVolunteersJoined: number | null;
  avgEstimatedQty: number | null;
  avgActualQty: number | null;
  avgEstimatedMeals: number | null;
  avgActualMeals: number | null;
  pickupSuccessRate: number;
  transportWasBottleneckRate: number;
  donorInfoCompleteRate: number;
}

export function computePilotMetrics(
  rescues: Rescue[],
  feedback: RescueFeedback[],
  volunteerCounts: Map<string, number>
): PilotMetrics {
  const claimTimes = rescues.map((r) => minutesBetween(r.submitted_at, r.claimed_at)).filter((n): n is number => n != null);
  const departureTimes = rescues.map((r) => minutesBetween(r.claimed_at, r.en_route_at)).filter((n): n is number => n != null);
  const collectedTimes = rescues.map((r) => minutesBetween(r.submitted_at, r.collected_at)).filter((n): n is number => n != null);
  const totalDurations = rescues.map((r) => minutesBetween(r.submitted_at, r.completed_at)).filter((n): n is number => n != null);
  const transportArrangement = rescues
    .map((r) => minutesBetween(r.submitted_at, r.donor_confirmed_at))
    .filter((n): n is number => n != null);

  const volunteersJoined = rescues.map((r) => volunteerCounts.get(r.id) ?? 0);
  const terminal = rescues.filter((r) => COMPLETED_LIKE.includes(r.status as (typeof COMPLETED_LIKE)[number]) || NEGATIVE_TERMINAL.includes(r.status as (typeof NEGATIVE_TERMINAL)[number]));
  const successful = rescues.filter((r) => r.status === "completed");

  return {
    medianClaimMinutes: median(claimTimes),
    avgFirstResponseMinutes: avg(claimTimes),
    avgClaimToDepartureMinutes: avg(departureTimes),
    avgSubmissionToCollectedMinutes: avg(collectedTimes),
    avgTransportArrangementMinutes: avg(transportArrangement),
    avgTotalDurationMinutes: avg(totalDurations),
    avgVolunteersNeeded: avg(rescues.map((r) => r.volunteers_needed)),
    avgVolunteersJoined: avg(volunteersJoined),
    avgEstimatedQty: avg(rescues.map((r) => r.actual_quantity_kg ?? NaN).filter((n) => !Number.isNaN(n))),
    avgActualQty: avg(rescues.map((r) => r.actual_quantity_kg).filter((n): n is number => n != null)),
    avgEstimatedMeals: avg(rescues.map((r) => r.estimated_meals).filter((n): n is number => n != null)),
    avgActualMeals: avg(rescues.map((r) => r.estimated_meals).filter((n): n is number => n != null)),
    pickupSuccessRate: pct(successful.length, terminal.length),
    transportWasBottleneckRate: pct(feedback.filter((f) => f.biggest_delay === "transportation").length, feedback.length),
    donorInfoCompleteRate: pct(rescues.filter((r) => r.kept_covered != null && r.prepared_at != null).length, rescues.length),
  };
}

export function formatMinutes(min: number | null): string {
  if (min == null) return "—";
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}m`;
}
