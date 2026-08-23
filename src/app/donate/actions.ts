"use server";

import { donorSubmissionSchema, type DonorSubmissionInput } from "@/lib/schemas/rescue";
import { createClient } from "@/lib/supabase/server";

export interface SubmitRescueResult {
  ok: boolean;
  error?: string;
  trackingToken?: string;
  code?: string;
}

export async function submitRescue(raw: DonorSubmissionInput): Promise<SubmitRescueResult> {
  const parsed = donorSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Some details are missing or invalid. Please review the form." };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: chapter } = await supabase.from("chapters").select("id").limit(1).single();
  if (!chapter) {
    return { ok: false, error: "No chapter is configured yet. Please contact the coordination team." };
  }

  const { data: zoneRow } = await supabase
    .from("zones")
    .select("id")
    .eq("chapter_id", chapter.id)
    .eq("name", input.area)
    .maybeSingle();

  const { data: donorProfileId, error: donorErr } = await supabase.rpc("upsert_donor_profile", {
    p_phone: input.phone,
    p_name: input.contactName,
    p_org: input.organisationName || null,
    p_donor_type: input.donorType,
    p_auth_user: user?.id ?? null,
  });
  if (donorErr) {
    return { ok: false, error: "We couldn't process that. Please try again in a moment." };
  }

  // First-time / unverifiable donors are held for a quick coordinator check.
  const { data: donorHistory } = await supabase
    .from("donor_profiles")
    .select("total_requests, successful_rescues")
    .eq("id", donorProfileId)
    .single();
  const isFirstTime = (donorHistory?.total_requests ?? 1) <= 1;
  const looksIncomplete = !input.keptCovered || input.contaminationReported === "unsure";
  const requiresVerification = isFirstTime && looksIncomplete;

  const { data: rescue, error: rescueErr } = await supabase
    .from("rescues")
    .insert({
      chapter_id: chapter.id,
      zone_id: zoneRow?.id ?? null,
      donor_profile_id: donorProfileId,
      created_by: user?.id ?? null,

      contact_name: input.contactName,
      organisation_name: input.organisationName || null,
      phone: input.phone,
      email: input.email || null,
      donor_type: input.donorType,

      venue_name: input.venueName,
      address: input.address,
      area: input.area,
      landmark: input.landmark || null,
      maps_link: input.mapsLink || null,
      floor_building: input.floorBuilding || null,
      pickup_contact_name: input.pickupContactName || input.contactName,
      pickup_contact_phone: input.pickupContactPhone || input.phone,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,

      meals_basis: input.mealsBasis,
      estimated_meals: input.mealsBasis === "manual" ? input.estimatedMeals ?? null : null,

      prepared_at: input.preparedAt || null,
      serving_ended_at: input.servingEndedAt || null,
      kept_covered: input.keptCovered ?? null,
      storage_condition: input.storageCondition,
      previously_served: input.previouslyServed,
      contamination_reported: input.contaminationReported,
      safety_acknowledged: input.safetyAcknowledged,

      collection_deadline: input.collectionDeadline,

      packed_status: input.packedStatus,
      containers_available: input.containersAvailable,
      disposables_available: input.disposablesAvailable,
      serving_utensils_available: input.servingUtensilsAvailable,
      volunteers_bring_containers: input.volunteersBringContainers,
      packaging_notes: input.packagingNotes || null,

      donor_transport_availability: input.donorTransportAvailability,
      donor_vehicle_type: input.donorVehicleType || null,
      donor_driver_contact: input.donorDriverContact || null,
      donor_vehicle_range_km: input.donorVehicleRangeKm ?? null,
      load_size: input.loadSize,

      status: requiresVerification ? "awaiting_verification" : "open",
      requires_verification: requiresVerification,
      phone_verified: !isFirstTime,
    })
    .select("id, tracking_token, code")
    .single();

  if (rescueErr || !rescue) {
    return { ok: false, error: "We couldn't submit your request. Please try again." };
  }

  const { error: itemsErr } = await supabase.from("rescue_food_items").insert(
    input.items.map((item) => ({
      rescue_id: rescue.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
    }))
  );
  if (itemsErr) {
    return { ok: false, error: "Your food items couldn't be saved. Please try again." };
  }

  if (input.mealsBasis === "auto") {
    const { data: estimate } = await supabase.rpc("estimate_meals_for_rescue", { p_rescue_id: rescue.id });
    if (typeof estimate === "number") {
      await supabase.from("rescues").update({ estimated_meals: estimate }).eq("id", rescue.id);
    }
  }

  return { ok: true, trackingToken: rescue.tracking_token, code: rescue.code };
}
