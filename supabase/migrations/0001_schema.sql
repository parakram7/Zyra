-- RescueLink core schema
-- Surplus food rescue coordination platform (Jaipur pilot)
-- Run against a fresh Supabase Postgres database.

create extension if not exists "pgcrypto";

-- =========================================================================
-- ENUMS
-- =========================================================================

create type user_role as enum ('donor', 'volunteer', 'admin');

create type verification_status as enum ('pending', 'verified', 'rejected', 'suspended');

create type transport_type as enum (
  'no_vehicle', 'bicycle', 'two_wheeler', 'car', 'suv', 'van', 'commercial_vehicle', 'other'
);

create type donor_type as enum (
  'wedding_event', 'restaurant', 'hotel', 'caterer', 'household',
  'corporate_event', 'institution', 'other'
);

create type donor_trust as enum ('trusted', 'standard', 'flagged');

create type food_category as enum (
  'rice', 'roti_bread', 'dal', 'vegetable_sabzi', 'curry', 'snacks',
  'desserts', 'packaged_food', 'beverages', 'mixed_meal', 'other'
);

create type food_unit as enum (
  'kg', 'litres', 'trays', 'containers', 'packets', 'servings', 'other'
);

create type storage_condition as enum (
  'refrigerated', 'hot_holding', 'room_temperature', 'unknown'
);

create type served_status as enum ('yes', 'no', 'partially');

create type contamination_status as enum ('no', 'yes', 'unsure');

create type packed_status as enum ('completely_packed', 'partially_packed', 'not_packed');

create type availability_tri as enum ('yes', 'no', 'some');

create type donor_transport_availability as enum ('yes_completely', 'partially', 'no');

create type load_size as enum ('small', 'medium', 'large', 'very_large');

create type transport_status as enum (
  'not_required', 'needed', 'volunteer_offered', 'arranged', 'driver_en_route', 'completed'
);

create type rescue_status as enum (
  'submitted', 'awaiting_verification', 'open', 'volunteer_assigned', 'team_forming',
  'en_route', 'at_pickup', 'food_inspected', 'collection_in_progress', 'collected',
  'en_route_to_distribution', 'distributed', 'completed',
  'cancelled', 'rejected', 'food_unsuitable', 'donor_unavailable', 'duplicate_request'
);

create type assignment_role as enum ('rescue_lead', 'volunteer', 'driver', 'distribution_lead');

create type assignment_status as enum ('joined', 'en_route', 'at_pickup', 'completed', 'cancelled');

create type assessment_outcome as enum ('suitable', 'needs_review', 'do_not_collect');

create type temperature_condition as enum ('hot', 'cold', 'room_temperature', 'unknown');

create type notification_type as enum (
  'new_urgent_rescue', 'rescue_updated', 'transport_needed', 'volunteer_joined',
  'deadline_approaching', 'rescue_cancelled', 'admin_message'
);

-- =========================================================================
-- CORE REFERENCE TABLES
-- =========================================================================

create table chapters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,               -- e.g. 'JAI'
  contact_phone text,
  meals_per_kg numeric not null default 2.2,
  pickup_warning_minutes int not null default 60,
  transport_base_charge numeric not null default 150,
  transport_per_km numeric not null default 12,
  transport_size_multiplier jsonb not null default '{"small":1,"medium":1.4,"large":2,"very_large":3}',
  food_assessment_disclaimer text not null default
    'This is a volunteer field assessment and does not replace professional food-safety testing.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table zones (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  unique (chapter_id, name)
);

-- =========================================================================
-- PROFILES (extends auth.users)
-- =========================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'volunteer',
  full_name text not null,
  phone text not null,
  email text,
  chapter_id uuid references chapters(id) on delete set null,
  preferred_zone_ids uuid[] not null default '{}',
  has_transport boolean not null default false,
  transport_type transport_type not null default 'no_vehicle',
  verification_status verification_status not null default 'pending',
  verification_note text,
  rescues_completed int not null default 0,
  meals_rescued numeric not null default 0,
  kg_rescued numeric not null default 0,
  hours_volunteered numeric not null default 0,
  transport_contributions int not null default 0,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_chapter on profiles(chapter_id);
create index idx_profiles_role on profiles(role);

-- =========================================================================
-- DONORS
-- =========================================================================

create table donor_profiles (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  organisation_name text,
  donor_type donor_type,
  trust_status donor_trust not null default 'standard',
  total_requests int not null default 0,
  successful_rescues int not null default 0,
  cancelled_requests int not null default 0,
  last_donation_at timestamptz,
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_donor_profiles_phone on donor_profiles(phone);

-- =========================================================================
-- TRANSPORT CONTACTS (trusted transporters directory)
-- =========================================================================

create table transport_contacts (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  name text not null,
  phone text not null,
  vehicle_type transport_type not null default 'van',
  preferred_zones text[] not null default '{}',
  pricing_notes text,
  availability_notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_transport_contacts_chapter on transport_contacts(chapter_id);

-- =========================================================================
-- SAVED DISTRIBUTION LOCATIONS
-- =========================================================================

create table saved_distribution_locations (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  name text not null,
  area text,
  category text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_saved_dist_locations_chapter on saved_distribution_locations(chapter_id);

-- =========================================================================
-- RESCUES
-- =========================================================================

create table rescues (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  tracking_token text not null unique default encode(gen_random_bytes(9), 'base64'),

  chapter_id uuid not null references chapters(id) on delete restrict,
  zone_id uuid references zones(id) on delete set null,
  donor_profile_id uuid references donor_profiles(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,

  -- Step 1: contact
  contact_name text not null,
  organisation_name text,
  phone text not null,
  email text,
  donor_type donor_type not null default 'other',

  -- Step 2: pickup location
  venue_name text not null,
  address text not null,
  area text not null,
  landmark text,
  maps_link text,
  floor_building text,
  pickup_contact_name text,
  pickup_contact_phone text,
  latitude numeric,
  longitude numeric,

  -- Step 4/5: meals estimate
  estimated_meals int,
  meals_basis text not null default 'auto' check (meals_basis in ('auto', 'manual')),

  -- Step 5: preparation / safety information (objective, not a certification)
  prepared_at timestamptz,
  serving_ended_at timestamptz,
  kept_covered boolean,
  storage_condition storage_condition not null default 'unknown',
  previously_served served_status not null default 'no',
  contamination_reported contamination_status not null default 'no',
  safety_acknowledged boolean not null default false,

  -- Step 6: collection deadline
  collection_deadline timestamptz not null,

  -- Step 7: packaging / utensils
  packed_status packed_status not null default 'not_packed',
  containers_available availability_tri not null default 'no',
  disposables_available availability_tri not null default 'no',
  serving_utensils_available availability_tri not null default 'no',
  volunteers_bring_containers boolean not null default false,
  packaging_notes text,

  -- Step 8: transportation (donor side)
  donor_transport_availability donor_transport_availability not null default 'no',
  donor_vehicle_type text,
  donor_driver_contact text,
  donor_vehicle_range_km numeric,
  load_size load_size not null default 'medium',

  -- volunteer team sizing
  volunteers_needed int not null default 2,

  -- status + workflow
  status rescue_status not null default 'submitted',
  urgent_override boolean not null default false,

  -- verification / trust
  phone_verified boolean not null default false,
  donor_confirmed_at timestamptz,
  donor_confirmed_by uuid references profiles(id) on delete set null,
  admin_verified boolean not null default false,
  admin_verified_by uuid references profiles(id) on delete set null,
  admin_verified_at timestamptz,
  requires_verification boolean not null default false,

  -- terminal state reasons
  cancelled_by text,
  cancellation_reason text,

  -- actual reported figures (filled in as rescue progresses)
  actual_quantity_kg numeric,

  submitted_at timestamptz not null default now(),
  claimed_at timestamptz,
  en_route_at timestamptz,
  at_pickup_at timestamptz,
  collected_at timestamptz,
  distributed_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_rescues_chapter on rescues(chapter_id);
create index idx_rescues_status on rescues(status);
create index idx_rescues_deadline on rescues(collection_deadline);
create index idx_rescues_zone on rescues(zone_id);
create index idx_rescues_created_by on rescues(created_by);
create index idx_rescues_donor_profile on rescues(donor_profile_id);
create index idx_rescues_code on rescues(code);

create table rescue_food_items (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null references rescues(id) on delete cascade,
  name text not null,
  category food_category not null default 'other',
  quantity numeric not null,
  unit food_unit not null default 'kg',
  created_at timestamptz not null default now()
);

create index idx_rescue_food_items_rescue on rescue_food_items(rescue_id);

create table rescue_assignments (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null references rescues(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role assignment_role not null default 'volunteer',
  status assignment_status not null default 'joined',
  transport_contribution text,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  leave_reason text,
  unique (rescue_id, profile_id)
);

-- Only one active (non-cancelled) rescue lead per rescue
create unique index idx_one_lead_per_rescue on rescue_assignments (rescue_id)
  where role = 'rescue_lead' and status <> 'cancelled';

create index idx_rescue_assignments_rescue on rescue_assignments(rescue_id);
create index idx_rescue_assignments_profile on rescue_assignments(profile_id);

create table rescue_status_history (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null references rescues(id) on delete cascade,
  previous_status rescue_status,
  new_status rescue_status not null,
  changed_by uuid references profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index idx_rescue_status_history_rescue on rescue_status_history(rescue_id);

create table rescue_activity (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null references rescues(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create index idx_rescue_activity_rescue on rescue_activity(rescue_id, created_at);

create table rescue_photos (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null references rescues(id) on delete cascade,
  url text not null,
  caption text,
  stage text,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_rescue_photos_rescue on rescue_photos(rescue_id);

-- =========================================================================
-- TRANSPORT COORDINATION
-- =========================================================================

create table transport_requests (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null unique references rescues(id) on delete cascade,
  status transport_status not null default 'needed',
  recommended_vehicle text,
  assigned_offer_id uuid,
  assigned_contact_id uuid references transport_contacts(id) on delete set null,
  estimated_charge_low numeric,
  estimated_charge_high numeric,
  actual_charge numeric,
  paid_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table transport_offers (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null references rescues(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  vehicle_type transport_type not null,
  notes text,
  status text not null default 'offered' check (status in ('offered', 'assigned', 'declined', 'completed')),
  created_at timestamptz not null default now()
);

alter table transport_requests
  add constraint fk_transport_requests_offer
  foreign key (assigned_offer_id) references transport_offers(id) on delete set null;

create index idx_transport_offers_rescue on transport_offers(rescue_id);

-- =========================================================================
-- FIELD FOOD ASSESSMENT
-- =========================================================================

create table food_assessments (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null references rescues(id) on delete cascade,
  assessed_by uuid references profiles(id) on delete set null,
  covered_ok boolean,
  unusual_smell boolean,
  visible_contamination boolean,
  packaging_ok boolean,
  storage_matches_description boolean,
  temperature_condition temperature_condition not null default 'unknown',
  concerns text,
  notes text,
  photo_urls text[] not null default '{}',
  outcome assessment_outcome not null default 'needs_review',
  do_not_collect_reason text,
  created_at timestamptz not null default now()
);

create index idx_food_assessments_rescue on food_assessments(rescue_id);

-- =========================================================================
-- DISTRIBUTION
-- =========================================================================

create table distribution_records (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null references rescues(id) on delete cascade,
  location_name text not null,
  area text,
  people_served int,
  meals_distributed int not null,
  distributed_at timestamptz not null default now(),
  distribution_lead uuid references profiles(id) on delete set null,
  notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index idx_distribution_records_rescue on distribution_records(rescue_id);

-- =========================================================================
-- FEEDBACK
-- =========================================================================

create table rescue_feedback (
  id uuid primary key default gen_random_uuid(),
  rescue_id uuid not null references rescues(id) on delete cascade,
  submitted_by uuid references profiles(id) on delete set null,
  rating int check (rating between 1 and 5),
  biggest_delay text,
  info_needed text,
  feature_request text,
  field_notes_worked_well text,
  field_notes_delays text,
  field_notes_future text,
  created_at timestamptz not null default now()
);

create index idx_rescue_feedback_rescue on rescue_feedback(rescue_id);

-- =========================================================================
-- NOTIFICATIONS
-- =========================================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  rescue_id uuid references rescues(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_recipient on notifications(recipient_id, read, created_at desc);

-- =========================================================================
-- ADMIN ACTIONS AUDIT LOG
-- =========================================================================

create table admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id) on delete set null,
  action_type text not null,
  target_table text not null,
  target_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_admin_actions_admin on admin_actions(admin_id, created_at desc);
