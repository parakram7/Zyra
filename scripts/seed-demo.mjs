// Seeds demo auth accounts + a realistic set of Jaipur rescues across every status.
// Requires the Supabase service role key (server-only — never ship this to the client).
//
//   npm run seed:demo
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
// Safe-ish to re-run: it looks up existing auth users/donors by email/phone before creating.

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local — copy .env.example first."
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CHAPTER_ID = "a0000000-0000-0000-0000-000000000001";
const DEMO_PASSWORD = "Demo@1234";

const ZONES = {
  cScheme: "b0000000-0000-0000-0000-000000000001",
  malviyaNagar: "b0000000-0000-0000-0000-000000000002",
  mansarovar: "b0000000-0000-0000-0000-000000000003",
  vaishaliNagar: "b0000000-0000-0000-0000-000000000004",
  rajaPark: "b0000000-0000-0000-0000-000000000005",
  jagatpura: "b0000000-0000-0000-0000-000000000006",
  tonkRoad: "b0000000-0000-0000-0000-000000000007",
  civilLines: "b0000000-0000-0000-0000-000000000008",
  baniPark: "b0000000-0000-0000-0000-000000000009",
  vidhyadharNagar: "b0000000-0000-0000-0000-000000000010",
  ajmerRoad: "b0000000-0000-0000-0000-000000000011",
  miRoad: "b0000000-0000-0000-0000-000000000012",
  sodala: "b0000000-0000-0000-0000-000000000013",
  pratapNagar: "b0000000-0000-0000-0000-000000000014",
};

const TRANSPORT_CONTACT_IQBAL = "c0000000-0000-0000-0000-000000000003";

function hoursFromNow(h) {
  return new Date(Date.now() + h * 3600 * 1000).toISOString();
}
function hoursAgo(h) {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

const VOLUNTEERS = [
  { name: "Parakram Singh", email: "parakram@rescuelink.demo", phone: "+91 98290 10001", zone: ZONES.vaishaliNagar, transport: "car", role: "volunteer" },
  { name: "Rahul Sharma", email: "rahul@rescuelink.demo", phone: "+91 98290 10002", zone: ZONES.cScheme, transport: "two_wheeler", role: "volunteer" },
  { name: "Arjun Rathore", email: "arjun@rescuelink.demo", phone: "+91 98290 10003", zone: ZONES.malviyaNagar, transport: "two_wheeler", role: "volunteer" },
  { name: "Priya Agarwal", email: "priya@rescuelink.demo", phone: "+91 98290 10004", zone: ZONES.tonkRoad, transport: "no_vehicle", role: "volunteer" },
  { name: "Kavita Choudhary", email: "kavita@rescuelink.demo", phone: "+91 98290 10005", zone: ZONES.mansarovar, transport: "car", role: "volunteer" },
  { name: "Rohit Meena", email: "rohit@rescuelink.demo", phone: "+91 98290 10006", zone: ZONES.vaishaliNagar, transport: "van", role: "volunteer" },
  { name: "Sanjana Gupta", email: "sanjana@rescuelink.demo", phone: "+91 98290 10007", zone: ZONES.rajaPark, transport: "no_vehicle", role: "volunteer" },
  { name: "Vikram Shekhawat", email: "vikram@rescuelink.demo", phone: "+91 98290 10008", zone: ZONES.civilLines, transport: "suv", role: "volunteer" },
  { name: "Neha Kapoor", email: "neha@rescuelink.demo", phone: "+91 98290 10009", zone: ZONES.baniPark, transport: "two_wheeler", role: "volunteer" },
  { name: "Aditya Jain", email: "aditya@rescuelink.demo", phone: "+91 98290 10010", zone: ZONES.jagatpura, transport: "car", role: "volunteer" },
  { name: "Pooja Sharma", email: "pooja@rescuelink.demo", phone: "+91 98290 10011", zone: ZONES.malviyaNagar, transport: "no_vehicle", role: "volunteer" },
  { name: "Karan Chouhan", email: "karan@rescuelink.demo", phone: "+91 98290 10012", zone: ZONES.sodala, transport: "two_wheeler", role: "volunteer", verification: "suspended", note: "Reported for repeated no-shows on assigned rescues." },
  { name: "Ishita Bansal", email: "ishita@rescuelink.demo", phone: "+91 98290 10013", zone: ZONES.ajmerRoad, transport: "car", role: "volunteer" },
  { name: "Manish Yadav", email: "manish@rescuelink.demo", phone: "+91 98290 10014", zone: ZONES.pratapNagar, transport: "no_vehicle", role: "volunteer" },
  { name: "Divya Saxena", email: "divya@rescuelink.demo", phone: "+91 98290 10015", zone: ZONES.vidhyadharNagar, transport: "two_wheeler", role: "volunteer", verification: "pending" },
];

const ADMIN = { name: "Meera Sharma", email: "coordinator@rescuelink.demo", phone: "+91 98290 00001", role: "admin" };

async function upsertAuthUser(person) {
  const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users?.find((u) => u.email === person.email);
  if (existing) return existing.id;

  const { data, error } = await db.auth.admin.createUser({
    email: person.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: person.name,
      phone: person.phone,
      role: person.role,
      chapter_id: CHAPTER_ID,
      preferred_zone_ids: person.zone ? [person.zone] : [],
      has_transport: person.transport && person.transport !== "no_vehicle",
      transport_type: person.transport || "no_vehicle",
    },
  });
  if (error) throw error;
  return data.user.id;
}

async function seedPeople() {
  console.log("Creating demo auth accounts...");
  const adminId = await upsertAuthUser(ADMIN);
  await db.from("profiles").update({ verification_status: "verified" }).eq("id", adminId);

  const volunteerIds = {};
  for (const v of VOLUNTEERS) {
    const id = await upsertAuthUser(v);
    volunteerIds[v.email] = id;
    await db
      .from("profiles")
      .update({ verification_status: v.verification || "verified", verification_note: v.note || null })
      .eq("id", id);
  }
  console.log(`Created/verified ${VOLUNTEERS.length} volunteers + 1 coordinator.`);
  return { adminId, volunteerIds };
}

async function upsertDonor({ phone, name, org, type }) {
  const { data: existing } = await db.from("donor_profiles").select("id").eq("phone", phone).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await db
    .from("donor_profiles")
    .insert({ phone, name, organisation_name: org, donor_type: type })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function createRescue(fields, items) {
  const { data: rescue, error } = await db.from("rescues").insert(fields).select("*").single();
  if (error) throw error;
  if (items?.length) {
    const { error: itemErr } = await db
      .from("rescue_food_items")
      .insert(items.map((i) => ({ ...i, rescue_id: rescue.id })));
    if (itemErr) throw itemErr;
    const { data: est } = await db.rpc("estimate_meals_for_rescue", { p_rescue_id: rescue.id });
    if (rescue.meals_basis === "auto") {
      await db.from("rescues").update({ estimated_meals: est }).eq("id", rescue.id);
    }
  }
  return rescue;
}

async function setStatus(rescueId, status, extra = {}) {
  const { error } = await db.from("rescues").update({ status, ...extra }).eq("id", rescueId);
  if (error) throw error;
}

async function addAssignment(rescueId, profileId, role, status = "joined") {
  const { error } = await db
    .from("rescue_assignments")
    .upsert({ rescue_id: rescueId, profile_id: profileId, role, status }, { onConflict: "rescue_id,profile_id" });
  if (error) throw error;
}

async function addActivity(rescueId, actorId, message) {
  await db.from("rescue_activity").insert({ rescue_id: rescueId, actor_id: actorId, message });
}

async function main() {
  const { adminId, volunteerIds } = await seedPeople();
  const V = (email) => volunteerIds[`${email}@rescuelink.demo`];

  console.log("Seeding donors...");
  const donorSharma = await upsertDonor({ phone: "+91 99000 00001", name: "Vikas Sharma", org: "Sharma Wedding Gardens", type: "wedding_event" });
  const donorSpiceRoute = await upsertDonor({ phone: "+91 99000 00002", name: "Mohit Bhatia", org: "Spice Route Restaurant", type: "restaurant" });
  const donorClarks = await upsertDonor({ phone: "+91 99000 00003", name: "Ananya Rao", org: "Hotel Clarks Amer", type: "hotel" });
  const donorRoyalCaterers = await upsertDonor({ phone: "+91 99000 00004", name: "Deepak Soni", org: "Royal Caterers", type: "caterer" });
  const donorTcs = await upsertDonor({ phone: "+91 99000 00005", name: "Anjali Mehta", org: "TCS Jaipur — Corporate Event", type: "corporate_event" });
  const donorAgarwal = await upsertDonor({ phone: "+91 99000 00006", name: "Suman Agarwal", org: "Agarwal Wedding", type: "wedding_event" });
  const donorVerma = await upsertDonor({ phone: "+91 99000 00007", name: "Kalpana Verma", org: null, type: "household" });
  const donorSchool = await upsertDonor({ phone: "+91 99000 00008", name: "Ramesh Tiwari", org: "Jaipur Public School", type: "institution" });
  const donorNewIndividual = await upsertDonor({ phone: "+91 99000 00009", name: "Farhan Ali", org: null, type: "household" });
  const donorNewCaterer = await upsertDonor({ phone: "+91 99000 00010", name: "Om Prakash", org: "Om Caterers", type: "caterer" });

  console.log("Seeding rescues...");

  // ---------------------------------------------------------------
  // R1 — Flagship completed scenario: Wedding surplus, Vaishali Nagar
  // ---------------------------------------------------------------
  const r1 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.vaishaliNagar,
      donor_profile_id: donorSharma,
      contact_name: "Vikas Sharma",
      organisation_name: "Sharma Wedding Gardens",
      phone: "+91 99000 00001",
      donor_type: "wedding_event",
      venue_name: "Sharma Wedding Gardens — Sharma Function",
      address: "Plot 14, Nirman Nagar Extension, Vaishali Nagar",
      area: "Vaishali Nagar",
      landmark: "Near Vaishali Nagar Circle",
      pickup_contact_name: "Vikas Sharma",
      pickup_contact_phone: "+91 99000 00001",
      estimated_meals: null,
      meals_basis: "auto",
      prepared_at: hoursAgo(6),
      serving_ended_at: hoursAgo(4),
      kept_covered: true,
      storage_condition: "room_temperature",
      previously_served: "yes",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursAgo(2),
      packed_status: "partially_packed",
      containers_available: "some",
      disposables_available: "yes",
      serving_utensils_available: "yes",
      volunteers_bring_containers: true,
      packaging_notes: "Sweets already boxed; curries need containers.",
      donor_transport_availability: "no",
      load_size: "very_large",
      volunteers_needed: 3,
      phone_verified: true,
      admin_verified: true,
      admin_verified_by: adminId,
      admin_verified_at: hoursAgo(6.5),
      status: "submitted",
      actual_quantity_kg: 72,
      submitted_at: hoursAgo(7),
    },
    [
      { name: "Paneer Butter Masala", category: "curry", quantity: 15, unit: "kg" },
      { name: "Steamed Rice", category: "rice", quantity: 20, unit: "kg" },
      { name: "Dal Makhani", category: "dal", quantity: 15, unit: "kg" },
      { name: "Mixed Sweets", category: "desserts", quantity: 10, unit: "kg" },
      { name: "Tandoori Roti", category: "roti_bread", quantity: 40, unit: "packets" },
    ]
  );
  await setStatus(r1.id, "open", { requires_verification: false });
  await addAssignment(r1.id, V("parakram"), "rescue_lead");
  await setStatus(r1.id, "volunteer_assigned", { claimed_at: hoursAgo(6.3) });
  await addActivity(r1.id, V("parakram"), "Parakram Singh claimed this rescue.");
  await addAssignment(r1.id, V("arjun"), "volunteer");
  await addAssignment(r1.id, V("priya"), "volunteer");
  await setStatus(r1.id, "team_forming");
  await addAssignment(r1.id, V("rohit"), "driver", "completed");
  await db
    .from("transport_offers")
    .insert({ rescue_id: r1.id, profile_id: V("rohit"), vehicle_type: "van", notes: "Have a van, can travel anywhere in Jaipur.", status: "assigned" });
  const { data: tr1 } = await db.from("transport_requests").select("id").eq("rescue_id", r1.id).single();
  await db
    .from("transport_requests")
    .update({ status: "completed", assigned_offer_id: null })
    .eq("id", tr1.id);
  await setStatus(r1.id, "en_route", {
    donor_confirmed_at: hoursAgo(6),
    donor_confirmed_by: V("parakram"),
    en_route_at: hoursAgo(5.5),
  });
  await setStatus(r1.id, "at_pickup", { at_pickup_at: hoursAgo(5) });
  await db.from("food_assessments").insert({
    rescue_id: r1.id,
    assessed_by: V("parakram"),
    covered_ok: true,
    unusual_smell: false,
    visible_contamination: false,
    packaging_ok: true,
    storage_matches_description: true,
    temperature_condition: "room_temperature",
    concerns: null,
    notes: "Food looks freshly served, well within safe window. Sweets already boxed.",
    outcome: "suitable",
  });
  await setStatus(r1.id, "food_inspected");
  await setStatus(r1.id, "collection_in_progress");
  await setStatus(r1.id, "collected", { collected_at: hoursAgo(4.3) });
  await db.from("distribution_records").insert({
    rescue_id: r1.id,
    location_name: "Sanjay Nagar Community Kitchen",
    area: "Sanjay Nagar",
    people_served: 150,
    meals_distributed: 150,
    distributed_at: hoursAgo(2.5),
    distribution_lead: V("parakram"),
    notes: "Distributed quickly, families were waiting. Sweets were a big hit.",
  });
  await setStatus(r1.id, "distributed", { distributed_at: hoursAgo(2.5) });
  await setStatus(r1.id, "completed", { completed_at: hoursAgo(2.3) });
  await db.from("rescue_feedback").insert({
    rescue_id: r1.id,
    submitted_by: V("parakram"),
    rating: 5,
    biggest_delay: "transportation",
    info_needed: "Exact number of containers needed would help us prepare in advance.",
    feature_request: "A way to message the whole team at once when plans change.",
    field_notes_worked_well: "Rohit's van made the large pickup easy. Team coordination was smooth.",
    field_notes_delays: "Took 20 extra minutes to find containers for curries.",
    field_notes_future: "Ask donor to keep containers ready if we have advance notice.",
  });
  console.log(`  R1 ${r1.code} — completed flagship scenario`);

  // ---------------------------------------------------------------
  // R2 — Open, unclaimed, urgent: Restaurant surplus, C-Scheme
  // ---------------------------------------------------------------
  const r2 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.cScheme,
      donor_profile_id: donorSpiceRoute,
      contact_name: "Mohit Bhatia",
      organisation_name: "Spice Route Restaurant",
      phone: "+91 99000 00002",
      donor_type: "restaurant",
      venue_name: "Spice Route Restaurant",
      address: "Shop 4, Ashok Marg, C-Scheme",
      area: "C-Scheme",
      landmark: "Opposite Central Park",
      pickup_contact_name: "Mohit Bhatia",
      pickup_contact_phone: "+91 99000 00002",
      meals_basis: "auto",
      prepared_at: hoursAgo(2),
      serving_ended_at: hoursAgo(0.5),
      kept_covered: true,
      storage_condition: "hot_holding",
      previously_served: "no",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursFromNow(0.7),
      packed_status: "completely_packed",
      containers_available: "yes",
      disposables_available: "yes",
      serving_utensils_available: "yes",
      volunteers_bring_containers: false,
      donor_transport_availability: "partially",
      donor_vehicle_type: "Two-wheeler (small loads only)",
      load_size: "small",
      volunteers_needed: 1,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      submitted_at: hoursAgo(0.4),
    },
    [
      { name: "Veg Biryani", category: "rice", quantity: 12, unit: "kg" },
      { name: "Butter Naan", category: "roti_bread", quantity: 30, unit: "packets" },
    ]
  );
  await setStatus(r2.id, "open");
  console.log(`  R2 ${r2.code} — open / unclaimed / urgent`);

  // ---------------------------------------------------------------
  // R3 — Volunteer assigned: Corporate event, Malviya Nagar
  // ---------------------------------------------------------------
  const r3 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.malviyaNagar,
      donor_profile_id: donorTcs,
      contact_name: "Anjali Mehta",
      organisation_name: "TCS Jaipur — Corporate Event",
      phone: "+91 99000 00005",
      donor_type: "corporate_event",
      venue_name: "TCS Malviya Nagar Campus — Annual Day",
      address: "TCS Campus, Gopalpura Bypass, Malviya Nagar",
      area: "Malviya Nagar",
      pickup_contact_name: "Security Desk",
      pickup_contact_phone: "+91 99000 00005",
      meals_basis: "auto",
      prepared_at: hoursAgo(3),
      serving_ended_at: hoursAgo(1),
      kept_covered: true,
      storage_condition: "refrigerated",
      previously_served: "partially",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursFromNow(1.5),
      packed_status: "partially_packed",
      containers_available: "some",
      disposables_available: "yes",
      serving_utensils_available: "some",
      volunteers_bring_containers: true,
      donor_transport_availability: "no",
      load_size: "medium",
      volunteers_needed: 4,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      submitted_at: hoursAgo(0.9),
    },
    [
      { name: "Mixed Sandwiches", category: "snacks", quantity: 8, unit: "trays" },
      { name: "Cold Drinks", category: "beverages", quantity: 40, unit: "packets" },
    ]
  );
  await setStatus(r3.id, "open");
  await addAssignment(r3.id, V("arjun"), "rescue_lead");
  await setStatus(r3.id, "volunteer_assigned", { claimed_at: hoursAgo(0.6) });
  await addActivity(r3.id, V("arjun"), "Arjun Rathore claimed this rescue. Need 3 more volunteers.");
  console.log(`  R3 ${r3.code} — volunteer assigned`);

  // ---------------------------------------------------------------
  // R4 — Team forming, transport needed: Wedding, Tonk Road
  // ---------------------------------------------------------------
  const r4 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.tonkRoad,
      donor_profile_id: donorAgarwal,
      contact_name: "Suman Agarwal",
      organisation_name: "Agarwal Wedding",
      phone: "+91 99000 00006",
      donor_type: "wedding_event",
      venue_name: "Celebration Point Banquet Hall",
      address: "Near Durgapura Flyover, Tonk Road",
      area: "Tonk Road",
      pickup_contact_name: "Suman Agarwal",
      pickup_contact_phone: "+91 99000 00006",
      meals_basis: "manual",
      estimated_meals: 220,
      prepared_at: hoursAgo(4),
      serving_ended_at: hoursAgo(1.5),
      kept_covered: true,
      storage_condition: "room_temperature",
      previously_served: "yes",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursFromNow(2),
      packed_status: "not_packed",
      containers_available: "no",
      disposables_available: "some",
      serving_utensils_available: "no",
      volunteers_bring_containers: true,
      packaging_notes: "Nothing packed yet — will need containers for curries and rice.",
      donor_transport_availability: "no",
      load_size: "large",
      volunteers_needed: 4,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      submitted_at: hoursAgo(1.3),
    },
    [
      { name: "Mix Veg Curry", category: "vegetable_sabzi", quantity: 25, unit: "kg" },
      { name: "Jeera Rice", category: "rice", quantity: 30, unit: "kg" },
      { name: "Gulab Jamun", category: "desserts", quantity: 12, unit: "kg" },
    ]
  );
  await setStatus(r4.id, "open");
  await addAssignment(r4.id, V("priya"), "rescue_lead");
  await setStatus(r4.id, "volunteer_assigned", { claimed_at: hoursAgo(1) });
  await addAssignment(r4.id, V("sanjana"), "volunteer");
  await setStatus(r4.id, "team_forming");
  console.log(`  R4 ${r4.code} — team forming, transport still needed`);

  // ---------------------------------------------------------------
  // R5 — En route: Catering surplus, Mansarovar
  // ---------------------------------------------------------------
  const r5 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.mansarovar,
      donor_profile_id: donorRoyalCaterers,
      contact_name: "Deepak Soni",
      organisation_name: "Royal Caterers",
      phone: "+91 99000 00004",
      donor_type: "caterer",
      venue_name: "Royal Caterers Kitchen",
      address: "Sector 7, Mansarovar",
      area: "Mansarovar",
      pickup_contact_name: "Deepak Soni",
      pickup_contact_phone: "+91 99000 00004",
      meals_basis: "auto",
      prepared_at: hoursAgo(3),
      serving_ended_at: hoursAgo(1),
      kept_covered: true,
      storage_condition: "hot_holding",
      previously_served: "no",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursFromNow(1),
      packed_status: "completely_packed",
      containers_available: "yes",
      disposables_available: "yes",
      serving_utensils_available: "yes",
      volunteers_bring_containers: false,
      donor_transport_availability: "yes_completely",
      donor_vehicle_type: "Tempo",
      donor_driver_contact: "+91 99000 00004",
      load_size: "medium",
      volunteers_needed: 2,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      submitted_at: hoursAgo(1.6),
    },
    [{ name: "Kadhi Chawal (surplus event order)", category: "mixed_meal", quantity: 35, unit: "kg" }]
  );
  await setStatus(r5.id, "open");
  await addAssignment(r5.id, V("kavita"), "rescue_lead");
  await setStatus(r5.id, "volunteer_assigned", { claimed_at: hoursAgo(1.2) });
  await addAssignment(r5.id, V("vikram"), "volunteer");
  await setStatus(r5.id, "team_forming");
  await setStatus(r5.id, "en_route", {
    donor_confirmed_at: hoursAgo(1),
    donor_confirmed_by: V("kavita"),
    en_route_at: hoursAgo(0.3),
  });
  console.log(`  R5 ${r5.code} — en route`);

  // ---------------------------------------------------------------
  // R6 — At pickup: Household, Raja Park
  // ---------------------------------------------------------------
  const r6 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.rajaPark,
      donor_profile_id: donorVerma,
      contact_name: "Kalpana Verma",
      organisation_name: null,
      phone: "+91 99000 00007",
      donor_type: "household",
      venue_name: "Verma Residence — Birthday Celebration",
      address: "B-12, Raja Park",
      area: "Raja Park",
      pickup_contact_name: "Kalpana Verma",
      pickup_contact_phone: "+91 99000 00007",
      meals_basis: "auto",
      prepared_at: hoursAgo(5),
      serving_ended_at: hoursAgo(2),
      kept_covered: true,
      storage_condition: "refrigerated",
      previously_served: "yes",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursFromNow(0.5),
      packed_status: "completely_packed",
      containers_available: "yes",
      disposables_available: "yes",
      serving_utensils_available: "yes",
      volunteers_bring_containers: false,
      donor_transport_availability: "no",
      load_size: "small",
      volunteers_needed: 1,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      submitted_at: hoursAgo(2.2),
    },
    [{ name: "Assorted Birthday Snacks", category: "snacks", quantity: 6, unit: "kg" }]
  );
  await setStatus(r6.id, "open");
  await addAssignment(r6.id, V("neha"), "rescue_lead");
  await setStatus(r6.id, "volunteer_assigned", { claimed_at: hoursAgo(1.8) });
  await setStatus(r6.id, "en_route", {
    donor_confirmed_at: hoursAgo(1.5),
    donor_confirmed_by: V("neha"),
    en_route_at: hoursAgo(1),
  });
  await setStatus(r6.id, "at_pickup", { at_pickup_at: hoursAgo(0.2) });
  console.log(`  R6 ${r6.code} — at pickup`);

  // ---------------------------------------------------------------
  // R7 — Food inspected, suitable: Institution, Jagatpura
  // ---------------------------------------------------------------
  const r7 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.jagatpura,
      donor_profile_id: donorSchool,
      contact_name: "Ramesh Tiwari",
      organisation_name: "Jaipur Public School",
      phone: "+91 99000 00008",
      donor_type: "institution",
      venue_name: "Jaipur Public School — Annual Function",
      address: "Vidhani Circle, Jagatpura",
      area: "Jagatpura",
      pickup_contact_name: "Ramesh Tiwari",
      pickup_contact_phone: "+91 99000 00008",
      meals_basis: "auto",
      prepared_at: hoursAgo(4),
      serving_ended_at: hoursAgo(1),
      kept_covered: true,
      storage_condition: "room_temperature",
      previously_served: "yes",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursFromNow(1),
      packed_status: "partially_packed",
      containers_available: "some",
      disposables_available: "yes",
      serving_utensils_available: "yes",
      volunteers_bring_containers: true,
      donor_transport_availability: "partially",
      load_size: "medium",
      volunteers_needed: 2,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      submitted_at: hoursAgo(1.9),
    },
    [
      { name: "Poha", category: "mixed_meal", quantity: 10, unit: "kg" },
      { name: "Samosa", category: "snacks", quantity: 200, unit: "packets" },
    ]
  );
  await setStatus(r7.id, "open");
  await addAssignment(r7.id, V("aditya"), "rescue_lead");
  await setStatus(r7.id, "volunteer_assigned", { claimed_at: hoursAgo(1.5) });
  await setStatus(r7.id, "en_route", {
    donor_confirmed_at: hoursAgo(1.2),
    donor_confirmed_by: V("aditya"),
    en_route_at: hoursAgo(0.7),
  });
  await setStatus(r7.id, "at_pickup", { at_pickup_at: hoursAgo(0.3) });
  await db.from("food_assessments").insert({
    rescue_id: r7.id,
    assessed_by: V("aditya"),
    covered_ok: true,
    unusual_smell: false,
    visible_contamination: false,
    packaging_ok: true,
    storage_matches_description: true,
    temperature_condition: "room_temperature",
    notes: "Looks good, school kitchen kept it covered.",
    outcome: "suitable",
  });
  await setStatus(r7.id, "food_inspected");
  console.log(`  R7 ${r7.code} — food inspected, ready to collect`);

  // ---------------------------------------------------------------
  // R8 — Collection in progress: Hotel Clarks, Malviya Nagar
  // ---------------------------------------------------------------
  const r8 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.malviyaNagar,
      donor_profile_id: donorClarks,
      contact_name: "Ananya Rao",
      organisation_name: "Hotel Clarks Amer",
      phone: "+91 99000 00003",
      donor_type: "hotel",
      venue_name: "Hotel Clarks Amer — Banquet Kitchen",
      address: "Jawahar Lal Nehru Marg, Malviya Nagar",
      area: "Malviya Nagar",
      pickup_contact_name: "Banquet Manager",
      pickup_contact_phone: "+91 99000 00003",
      meals_basis: "auto",
      prepared_at: hoursAgo(3.5),
      serving_ended_at: hoursAgo(1),
      kept_covered: true,
      storage_condition: "refrigerated",
      previously_served: "partially",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursFromNow(1.2),
      packed_status: "completely_packed",
      containers_available: "yes",
      disposables_available: "yes",
      serving_utensils_available: "yes",
      volunteers_bring_containers: false,
      donor_transport_availability: "no",
      load_size: "large",
      volunteers_needed: 3,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      submitted_at: hoursAgo(2.1),
    },
    [
      { name: "Continental Buffet Leftovers", category: "mixed_meal", quantity: 28, unit: "kg" },
      { name: "Assorted Desserts", category: "desserts", quantity: 8, unit: "kg" },
    ]
  );
  await setStatus(r8.id, "open");
  await addAssignment(r8.id, V("pooja"), "rescue_lead");
  await setStatus(r8.id, "volunteer_assigned", { claimed_at: hoursAgo(1.7) });
  await addAssignment(r8.id, V("ishita"), "volunteer");
  await setStatus(r8.id, "team_forming");
  await setStatus(r8.id, "en_route", {
    donor_confirmed_at: hoursAgo(1.4),
    donor_confirmed_by: V("pooja"),
    en_route_at: hoursAgo(0.9),
  });
  await setStatus(r8.id, "at_pickup", { at_pickup_at: hoursAgo(0.4) });
  await db.from("food_assessments").insert({
    rescue_id: r8.id,
    assessed_by: V("pooja"),
    covered_ok: true,
    unusual_smell: false,
    visible_contamination: false,
    packaging_ok: true,
    storage_matches_description: true,
    temperature_condition: "cold",
    outcome: "suitable",
  });
  await setStatus(r8.id, "food_inspected");
  await setStatus(r8.id, "collection_in_progress");
  await db
    .from("transport_requests")
    .update({ status: "arranged", assigned_contact_id: TRANSPORT_CONTACT_IQBAL })
    .eq("rescue_id", r8.id);
  await addActivity(r8.id, V("pooja"), "Trusted transporter Iqbal (Pickup owner) arranged for this large pickup.");
  console.log(`  R8 ${r8.code} — collection in progress`);

  // ---------------------------------------------------------------
  // R9 — Collected: Wedding surplus #2, Civil Lines (repeat donor)
  // ---------------------------------------------------------------
  const r9 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.civilLines,
      donor_profile_id: donorSharma,
      contact_name: "Vikas Sharma",
      organisation_name: "Sharma Wedding Gardens (Civil Lines branch)",
      phone: "+91 99000 00001",
      donor_type: "wedding_event",
      venue_name: "Sharma Function Point — Civil Lines",
      address: "Civil Lines Marg",
      area: "Civil Lines",
      pickup_contact_name: "Vikas Sharma",
      pickup_contact_phone: "+91 99000 00001",
      meals_basis: "auto",
      prepared_at: hoursAgo(5),
      serving_ended_at: hoursAgo(2),
      kept_covered: true,
      storage_condition: "room_temperature",
      previously_served: "yes",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursAgo(0.5),
      packed_status: "completely_packed",
      containers_available: "yes",
      disposables_available: "yes",
      serving_utensils_available: "yes",
      volunteers_bring_containers: false,
      donor_transport_availability: "no",
      load_size: "large",
      volunteers_needed: 3,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      actual_quantity_kg: 45,
      submitted_at: hoursAgo(3.5),
    },
    [
      { name: "Rajma Chawal", category: "mixed_meal", quantity: 30, unit: "kg" },
      { name: "Salad & Raita", category: "vegetable_sabzi", quantity: 15, unit: "kg" },
    ]
  );
  await setStatus(r9.id, "open");
  await addAssignment(r9.id, V("manish"), "rescue_lead");
  await setStatus(r9.id, "volunteer_assigned", { claimed_at: hoursAgo(3) });
  await setStatus(r9.id, "en_route", {
    donor_confirmed_at: hoursAgo(2.7),
    donor_confirmed_by: V("manish"),
    en_route_at: hoursAgo(2.2),
  });
  await setStatus(r9.id, "at_pickup", { at_pickup_at: hoursAgo(1.8) });
  await db.from("food_assessments").insert({
    rescue_id: r9.id,
    assessed_by: V("manish"),
    covered_ok: true,
    unusual_smell: false,
    visible_contamination: false,
    packaging_ok: true,
    storage_matches_description: true,
    temperature_condition: "room_temperature",
    outcome: "suitable",
  });
  await setStatus(r9.id, "food_inspected");
  await setStatus(r9.id, "collection_in_progress");
  await setStatus(r9.id, "collected", { collected_at: hoursAgo(1.2) });
  console.log(`  R9 ${r9.code} — collected, distribution pending (repeat donor)`);

  // ---------------------------------------------------------------
  // R10 — Distributed (not yet completed): Restaurant #2, MI Road
  // ---------------------------------------------------------------
  const r10 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.miRoad,
      donor_profile_id: donorSpiceRoute,
      contact_name: "Mohit Bhatia",
      organisation_name: "Spice Route Restaurant — MI Road outlet",
      phone: "+91 99000 00002",
      donor_type: "restaurant",
      venue_name: "Spice Route Restaurant — MI Road",
      address: "MI Road, near Panch Batti",
      area: "MI Road",
      pickup_contact_name: "Mohit Bhatia",
      pickup_contact_phone: "+91 99000 00002",
      meals_basis: "auto",
      prepared_at: hoursAgo(6),
      serving_ended_at: hoursAgo(3),
      kept_covered: true,
      storage_condition: "hot_holding",
      previously_served: "no",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursAgo(1),
      packed_status: "completely_packed",
      containers_available: "yes",
      disposables_available: "yes",
      serving_utensils_available: "yes",
      volunteers_bring_containers: false,
      donor_transport_availability: "partially",
      load_size: "small",
      volunteers_needed: 1,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      actual_quantity_kg: 14,
      submitted_at: hoursAgo(4.5),
    },
    [{ name: "Veg Thali Portions", category: "mixed_meal", quantity: 14, unit: "kg" }]
  );
  await setStatus(r10.id, "open");
  await addAssignment(r10.id, V("divya"), "rescue_lead");
  await setStatus(r10.id, "volunteer_assigned", { claimed_at: hoursAgo(4) });
  await setStatus(r10.id, "en_route", {
    donor_confirmed_at: hoursAgo(3.7),
    donor_confirmed_by: V("divya"),
    en_route_at: hoursAgo(3.2),
  });
  await setStatus(r10.id, "at_pickup", { at_pickup_at: hoursAgo(2.8) });
  await db.from("food_assessments").insert({
    rescue_id: r10.id,
    assessed_by: V("divya"),
    covered_ok: true,
    unusual_smell: false,
    visible_contamination: false,
    packaging_ok: true,
    storage_matches_description: true,
    temperature_condition: "hot",
    outcome: "suitable",
  });
  await setStatus(r10.id, "food_inspected");
  await setStatus(r10.id, "collection_in_progress");
  await setStatus(r10.id, "collected", { collected_at: hoursAgo(2.3) });
  await setStatus(r10.id, "en_route_to_distribution");
  await db.from("distribution_records").insert({
    rescue_id: r10.id,
    location_name: "Ghat Gate Night Shelter",
    area: "Ghat Gate",
    people_served: 30,
    meals_distributed: 32,
    distributed_at: hoursAgo(1.5),
    distribution_lead: V("divya"),
    notes: "Distributed to the night shelter, well received.",
  });
  await setStatus(r10.id, "distributed", { distributed_at: hoursAgo(1.5) });
  console.log(`  R10 ${r10.code} — distributed, awaiting completion review`);

  // ---------------------------------------------------------------
  // R11 — Awaiting verification: new/unverified individual donor, Bani Park
  // ---------------------------------------------------------------
  const r11 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.baniPark,
      donor_profile_id: donorNewIndividual,
      contact_name: "Farhan Ali",
      organisation_name: null,
      phone: "+91 99000 00009",
      donor_type: "household",
      venue_name: "Ali Residence — Family Gathering",
      address: "C-45, Bani Park",
      area: "Bani Park",
      pickup_contact_name: "Farhan Ali",
      pickup_contact_phone: "+91 99000 00009",
      meals_basis: "auto",
      prepared_at: hoursAgo(1),
      serving_ended_at: hoursAgo(0.3),
      kept_covered: false,
      storage_condition: "unknown",
      previously_served: "yes",
      contamination_reported: "unsure",
      safety_acknowledged: true,
      collection_deadline: hoursFromNow(2),
      packed_status: "not_packed",
      containers_available: "no",
      disposables_available: "no",
      serving_utensils_available: "no",
      volunteers_bring_containers: true,
      donor_transport_availability: "no",
      load_size: "small",
      volunteers_needed: 1,
      phone_verified: false,
      admin_verified: false,
      requires_verification: true,
      status: "submitted",
      submitted_at: hoursAgo(0.2),
    },
    [{ name: "Mixed Home-cooked Food", category: "mixed_meal", quantity: 5, unit: "kg" }]
  );
  await setStatus(r11.id, "awaiting_verification");
  console.log(`  R11 ${r11.code} — awaiting verification (first-time donor, no cover info)`);

  // ---------------------------------------------------------------
  // R12 — Cancelled: donor unavailable, Sodala
  // ---------------------------------------------------------------
  const r12 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.sodala,
      donor_profile_id: donorAgarwal,
      contact_name: "Suman Agarwal",
      organisation_name: "Agarwal Family Function",
      phone: "+91 99000 00006",
      donor_type: "wedding_event",
      venue_name: "Sodala Community Hall",
      address: "Sodala Chauraha",
      area: "Sodala",
      pickup_contact_name: "Suman Agarwal",
      pickup_contact_phone: "+91 99000 00006",
      meals_basis: "manual",
      estimated_meals: 60,
      prepared_at: hoursAgo(5),
      serving_ended_at: hoursAgo(2),
      kept_covered: true,
      storage_condition: "room_temperature",
      previously_served: "yes",
      contamination_reported: "no",
      safety_acknowledged: true,
      collection_deadline: hoursAgo(1),
      packed_status: "not_packed",
      containers_available: "no",
      disposables_available: "some",
      serving_utensils_available: "no",
      volunteers_bring_containers: true,
      donor_transport_availability: "no",
      load_size: "medium",
      volunteers_needed: 2,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      submitted_at: hoursAgo(4.5),
    },
    [{ name: "Leftover Snacks", category: "snacks", quantity: 10, unit: "kg" }]
  );
  await setStatus(r12.id, "open");
  await setStatus(r12.id, "donor_unavailable", {
    cancelled_by: "donor",
    cancellation_reason: "Donor stopped responding to calls; venue was closed by the time a volunteer arrived.",
  });
  console.log(`  R12 ${r12.code} — donor unavailable (cancelled)`);

  // ---------------------------------------------------------------
  // R13 — Food unsuitable: Caterer, Ajmer Road
  // ---------------------------------------------------------------
  const r13 = await createRescue(
    {
      chapter_id: CHAPTER_ID,
      zone_id: ZONES.ajmerRoad,
      donor_profile_id: donorNewCaterer,
      contact_name: "Om Prakash",
      organisation_name: "Om Caterers",
      phone: "+91 99000 00010",
      donor_type: "caterer",
      venue_name: "Om Caterers Storage Unit",
      address: "Ajmer Road, near 200 Feet Bypass",
      area: "Ajmer Road",
      pickup_contact_name: "Om Prakash",
      pickup_contact_phone: "+91 99000 00010",
      meals_basis: "auto",
      prepared_at: hoursAgo(14),
      serving_ended_at: hoursAgo(10),
      kept_covered: false,
      storage_condition: "room_temperature",
      previously_served: "yes",
      contamination_reported: "unsure",
      safety_acknowledged: true,
      collection_deadline: hoursAgo(0.5),
      packed_status: "not_packed",
      containers_available: "no",
      disposables_available: "no",
      serving_utensils_available: "no",
      volunteers_bring_containers: true,
      donor_transport_availability: "no",
      load_size: "medium",
      volunteers_needed: 2,
      phone_verified: true,
      admin_verified: true,
      status: "submitted",
      submitted_at: hoursAgo(3),
    },
    [{ name: "Leftover Catering Order", category: "mixed_meal", quantity: 20, unit: "kg" }]
  );
  await setStatus(r13.id, "open");
  await addAssignment(r13.id, V("karan"), "rescue_lead");
  await setStatus(r13.id, "volunteer_assigned", { claimed_at: hoursAgo(2) });
  await setStatus(r13.id, "en_route", {
    donor_confirmed_at: hoursAgo(1.7),
    donor_confirmed_by: V("karan"),
    en_route_at: hoursAgo(1.3),
  });
  await setStatus(r13.id, "at_pickup", { at_pickup_at: hoursAgo(0.8) });
  await db.from("food_assessments").insert({
    rescue_id: r13.id,
    assessed_by: V("karan"),
    covered_ok: false,
    unusual_smell: true,
    visible_contamination: false,
    packaging_ok: false,
    storage_matches_description: false,
    temperature_condition: "room_temperature",
    concerns: "Food left uncovered overnight at room temperature; slightly sour smell noticed.",
    notes: "Declined collection out of caution.",
    outcome: "do_not_collect",
    do_not_collect_reason: "Food was left uncovered for over 10 hours at room temperature with a noticeable odour.",
  });
  await setStatus(r13.id, "food_unsuitable");
  console.log(`  R13 ${r13.code} — food unsuitable (declined at pickup)`);

  console.log("\nDone. Demo login password for every seeded account: " + DEMO_PASSWORD);
  console.log("Coordinator/admin: coordinator@rescuelink.demo");
  console.log("Volunteer (lead persona): parakram@rescuelink.demo");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
