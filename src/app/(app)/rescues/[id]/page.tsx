import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Phone, ExternalLink, Utensils, ThermometerSun, PackageOpen, Truck, Users, ShieldCheck, History as HistoryIcon,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { normalizeRescueRow, RESCUE_FEED_SELECT } from "@/lib/queries/rescues";
import { StatusBadge } from "@/components/rescue/status-badge";
import { UrgencyBadge } from "@/components/rescue/urgency-badge";
import { SectionCard, InfoRow } from "@/components/shared/section-card";
import { RescueActions } from "@/components/rescue/detail/rescue-actions";
import { TeamSection } from "@/components/rescue/detail/team-section";
import { VerificationSection } from "@/components/rescue/detail/verification-section";
import { TransportSection } from "@/components/rescue/detail/transport-section";
import { StatusTimeline } from "@/components/rescue/detail/status-timeline";
import { ActivityFeed } from "@/components/rescue/detail/activity-feed";
import { CompletionSummary } from "@/components/rescue/detail/completion-summary";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";
import { Button } from "@/components/ui/button";
import {
  DONOR_TYPE_LABELS, STORAGE_CONDITION_LABELS, SERVED_STATUS_LABELS, CONTAMINATION_LABELS,
  PACKED_STATUS_LABELS, AVAILABILITY_TRI_LABELS,
} from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import { buildMapsLink } from "@/lib/integrations/maps";
import type { AssignmentWithProfile, TransportOfferWithProfile } from "@/lib/types";

export default async function RescueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();

  const { data: rescueRow } = await supabase
    .from("rescues")
    .select(RESCUE_FEED_SELECT)
    .eq("id", id)
    .single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .overrideTypes<any, { merge: false }>();
  if (!rescueRow) notFound();
  const rescue = normalizeRescueRow(rescueRow);

  const [
    { data: assignments },
    { data: statusHistory },
    { data: activity },
    { data: transportOffers },
    { data: transportContacts },
    { data: donor },
    { data: savedLocations },
    { data: chapter },
    { data: distributionRecords },
  ] = await Promise.all([
    supabase
      .from("rescue_assignments")
      .select("*, profiles(full_name, phone, transport_type)")
      .eq("rescue_id", id)
      .order("joined_at")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .overrideTypes<any[], { merge: false }>(),
    supabase.from("rescue_status_history").select("*").eq("rescue_id", id).order("created_at"),
    supabase.from("rescue_activity").select("*").eq("rescue_id", id).order("created_at"),
    supabase
      .from("transport_offers")
      .select("*, profiles(full_name, phone)")
      .eq("rescue_id", id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .overrideTypes<any[], { merge: false }>(),
    supabase.from("transport_contacts").select("*").eq("chapter_id", rescue.chapter_id).eq("active", true),
    rescue.donor_profile_id
      ? supabase.from("donor_profiles").select("*").eq("id", rescue.donor_profile_id).single()
      : Promise.resolve({ data: null }),
    supabase.from("saved_distribution_locations").select("*").eq("chapter_id", rescue.chapter_id).eq("active", true),
    supabase.from("chapters").select("*").eq("id", rescue.chapter_id).single(),
    supabase.from("distribution_records").select("*").eq("rescue_id", id),
  ]);

  const myAssignment = (assignments ?? []).find((a) => a.profile_id === profile.id && a.status !== "cancelled");
  const isAssigned = Boolean(myAssignment) || profile.role === "admin";
  const isTeamEmpty = (assignments ?? []).every((a) => a.status === "cancelled");
  const canManageTransport = isAssigned;

  const { data: transportRequest } = await supabase
    .from("transport_requests")
    .select("*")
    .eq("rescue_id", id)
    .maybeSingle();

  const mapsLink = buildMapsLink({
    mapsLink: rescue.maps_link,
    latitude: rescue.latitude,
    longitude: rescue.longitude,
    address: `${rescue.address}, ${rescue.area}`,
  });

  const mealsDistributed = (distributionRecords ?? []).reduce((s, d) => s + (d.meals_distributed ?? 0), 0);
  const volunteerCount = (assignments ?? []).filter((a) => a.status !== "cancelled" && a.role !== "distribution_lead").length;
  const vehicleCount = (transportOffers ?? []).filter((o) => o.status === "assigned").length + (transportRequest?.assigned_contact_id ? 1 : 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-40 pt-6 md:pb-10">
      <RealtimeRefresher tables={["rescues", "rescue_assignments", "rescue_activity", "transport_requests", "transport_offers"]} />

      <div>
        <Link href="/rescues" className="text-sm text-muted-foreground hover:underline">
          ← Back to rescues
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{rescue.code}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{rescue.venue_name}</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {rescue.area}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={rescue.status} />
            {!["completed", "cancelled", "rejected", "food_unsuitable", "donor_unavailable", "duplicate_request"].includes(rescue.status) && (
              <UrgencyBadge deadline={rescue.collection_deadline} />
            )}
          </div>
        </div>
      </div>

      {rescue.status === "completed" && (
        <CompletionSummary
          rescue={rescue}
          mealsDistributed={mealsDistributed}
          volunteerCount={volunteerCount}
          vehicleCount={vehicleCount}
        />
      )}

      <div
        className="fixed inset-x-0 bottom-16 z-30 border-t bg-background/95 p-3 backdrop-blur md:static md:inset-auto md:z-auto md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
      >
        <RescueActions
          rescue={rescue}
          isAssigned={isAssigned}
          isTeamEmpty={isTeamEmpty}
          savedLocations={savedLocations ?? []}
          disclaimer={chapter?.food_assessment_disclaimer ?? "This is a volunteer field assessment and does not replace professional food-safety testing."}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Pickup"
          icon={MapPin}
          action={
            mapsLink ? (
              <Button variant="ghost" size="sm" asChild>
                <a href={mapsLink} target="_blank" rel="noreferrer"><ExternalLink /> Maps</a>
              </Button>
            ) : undefined
          }
        >
          <InfoRow label="Venue" value={rescue.venue_name} />
          <InfoRow label="Address" value={<span className="max-w-56 text-right">{rescue.address}</span>} />
          {rescue.landmark && <InfoRow label="Landmark" value={rescue.landmark} />}
          {rescue.floor_building && <InfoRow label="Floor / building" value={rescue.floor_building} />}
          <InfoRow label="Contact" value={rescue.pickup_contact_name ?? rescue.contact_name} />
          <InfoRow
            label="Contact phone"
            value={
              <a href={`tel:${rescue.pickup_contact_phone ?? rescue.phone}`} className="flex items-center gap-1 text-primary">
                <Phone className="size-3.5" /> {rescue.pickup_contact_phone ?? rescue.phone}
              </a>
            }
          />
          <InfoRow label="Donor type" value={DONOR_TYPE_LABELS[rescue.donor_type]} />
        </SectionCard>

        <SectionCard title="Food" icon={Utensils}>
          <ul className="space-y-1.5">
            {rescue.rescue_food_items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-muted-foreground">Approx. {item.quantity} {item.unit}</span>
              </li>
            ))}
          </ul>
          <InfoRow
            label="Estimated meals"
            value={rescue.estimated_meals != null ? `~${rescue.estimated_meals} (${rescue.meals_basis === "auto" ? "auto-estimated" : "donor estimate"})` : "Not estimated"}
          />
        </SectionCard>

        <SectionCard title="Preparation Information" icon={ThermometerSun}>
          <InfoRow label="Prepared at" value={formatDateTime(rescue.prepared_at)} />
          <InfoRow label="Serving ended" value={formatDateTime(rescue.serving_ended_at)} />
          <InfoRow label="Storage condition" value={STORAGE_CONDITION_LABELS[rescue.storage_condition]} />
          <InfoRow label="Kept covered?" value={rescue.kept_covered ? "Yes" : "No / unknown"} />
          <InfoRow label="Previously served?" value={SERVED_STATUS_LABELS[rescue.previously_served]} />
          <InfoRow label="Known contamination?" value={CONTAMINATION_LABELS[rescue.contamination_reported]} />
        </SectionCard>

        <SectionCard title="Packaging" icon={PackageOpen}>
          <InfoRow label="Packed?" value={PACKED_STATUS_LABELS[rescue.packed_status]} />
          <InfoRow label="Containers available?" value={AVAILABILITY_TRI_LABELS[rescue.containers_available]} />
          <InfoRow label="Disposables available?" value={AVAILABILITY_TRI_LABELS[rescue.disposables_available]} />
          <InfoRow label="Serving utensils available?" value={AVAILABILITY_TRI_LABELS[rescue.serving_utensils_available]} />
          <InfoRow label="Volunteers bring containers?" value={rescue.volunteers_bring_containers ? "Yes" : "No"} />
          {rescue.packaging_notes && <p className="text-sm text-muted-foreground">&ldquo;{rescue.packaging_notes}&rdquo;</p>}
        </SectionCard>

        <SectionCard title="Transportation" icon={Truck}>
          <TransportSection
            rescue={rescue}
            request={transportRequest ?? null}
            offers={(transportOffers ?? []) as TransportOfferWithProfile[]}
            contacts={transportContacts ?? []}
            canManage={canManageTransport}
          />
        </SectionCard>

        <SectionCard title="Team" icon={Users}>
          <TeamSection assignments={(assignments ?? []) as AssignmentWithProfile[]} />
          {rescue.volunteers_needed > 0 && (
            <p className="text-xs text-muted-foreground">Need {rescue.volunteers_needed} volunteers in total.</p>
          )}
        </SectionCard>

        <SectionCard title="Request Verification" icon={ShieldCheck}>
          <VerificationSection rescue={rescue} donor={donor ?? null} />
        </SectionCard>

        <SectionCard title="Status timeline" icon={HistoryIcon}>
          <StatusTimeline history={statusHistory ?? []} />
        </SectionCard>

        <SectionCard title="Activity" icon={HistoryIcon}>
          <ActivityFeed activity={activity ?? []} />
        </SectionCard>
      </div>
    </div>
  );
}
