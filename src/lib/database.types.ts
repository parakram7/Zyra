// Hand-authored types mirroring supabase/migrations/*.sql.
// If you regenerate this from a live project, prefer:
//   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
// and then re-apply the Functions block below (RPCs aren't always inferred cleanly).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "donor" | "volunteer" | "admin";
export type VerificationStatus = "pending" | "verified" | "rejected" | "suspended";
export type TransportTypeEnum =
  | "no_vehicle" | "bicycle" | "two_wheeler" | "car" | "suv" | "van" | "commercial_vehicle" | "other";
export type DonorType =
  | "wedding_event" | "restaurant" | "hotel" | "caterer" | "household"
  | "corporate_event" | "institution" | "other";
export type DonorTrust = "trusted" | "standard" | "flagged";
export type FoodCategory =
  | "rice" | "roti_bread" | "dal" | "vegetable_sabzi" | "curry" | "snacks"
  | "desserts" | "packaged_food" | "beverages" | "mixed_meal" | "other";
export type FoodUnit = "kg" | "litres" | "trays" | "containers" | "packets" | "servings" | "other";
export type StorageCondition = "refrigerated" | "hot_holding" | "room_temperature" | "unknown";
export type ServedStatus = "yes" | "no" | "partially";
export type ContaminationStatus = "no" | "yes" | "unsure";
export type PackedStatus = "completely_packed" | "partially_packed" | "not_packed";
export type AvailabilityTri = "yes" | "no" | "some";
export type DonorTransportAvailability = "yes_completely" | "partially" | "no";
export type LoadSize = "small" | "medium" | "large" | "very_large";
export type TransportStatusEnum =
  | "not_required" | "needed" | "volunteer_offered" | "arranged" | "driver_en_route" | "completed";
export type RescueStatus =
  | "submitted" | "awaiting_verification" | "open" | "volunteer_assigned" | "team_forming"
  | "en_route" | "at_pickup" | "food_inspected" | "collection_in_progress" | "collected"
  | "en_route_to_distribution" | "distributed" | "completed"
  | "cancelled" | "rejected" | "food_unsuitable" | "donor_unavailable" | "duplicate_request";
export type AssignmentRole = "rescue_lead" | "volunteer" | "driver" | "distribution_lead";
export type AssignmentStatus = "joined" | "en_route" | "at_pickup" | "completed" | "cancelled";
export type AssessmentOutcome = "suitable" | "needs_review" | "do_not_collect";
export type TemperatureCondition = "hot" | "cold" | "room_temperature" | "unknown";
export type NotificationType =
  | "new_urgent_rescue" | "rescue_updated" | "transport_needed" | "volunteer_joined"
  | "deadline_approaching" | "rescue_cancelled" | "admin_message";

export type Chapter = {
  id: string;
  name: string;
  code: string;
  contact_phone: string | null;
  meals_per_kg: number;
  pickup_warning_minutes: number;
  transport_base_charge: number;
  transport_per_km: number;
  transport_size_multiplier: Json;
  food_assessment_disclaimer: string;
  created_at: string;
  updated_at: string;
}

export type Zone = {
  id: string;
  chapter_id: string;
  name: string;
  sort_order: number;
  active: boolean;
}

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  email: string | null;
  chapter_id: string | null;
  preferred_zone_ids: string[];
  has_transport: boolean;
  transport_type: TransportTypeEnum;
  verification_status: VerificationStatus;
  verification_note: string | null;
  rescues_completed: number;
  meals_rescued: number;
  kg_rescued: number;
  hours_volunteered: number;
  transport_contributions: number;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DonorProfile = {
  id: string;
  phone: string;
  name: string | null;
  organisation_name: string | null;
  donor_type: DonorType | null;
  trust_status: DonorTrust;
  total_requests: number;
  successful_rescues: number;
  cancelled_requests: number;
  last_donation_at: string | null;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export type TransportContact = {
  id: string;
  chapter_id: string;
  name: string;
  phone: string;
  vehicle_type: TransportTypeEnum;
  preferred_zones: string[];
  pricing_notes: string | null;
  availability_notes: string | null;
  active: boolean;
  created_at: string;
}

export type SavedDistributionLocation = {
  id: string;
  chapter_id: string;
  name: string;
  area: string | null;
  category: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export type Rescue = {
  id: string;
  code: string;
  tracking_token: string;
  chapter_id: string;
  zone_id: string | null;
  donor_profile_id: string | null;
  created_by: string | null;

  contact_name: string;
  organisation_name: string | null;
  phone: string;
  email: string | null;
  donor_type: DonorType;

  venue_name: string;
  address: string;
  area: string;
  landmark: string | null;
  maps_link: string | null;
  floor_building: string | null;
  pickup_contact_name: string | null;
  pickup_contact_phone: string | null;
  latitude: number | null;
  longitude: number | null;

  estimated_meals: number | null;
  meals_basis: "auto" | "manual";

  prepared_at: string | null;
  serving_ended_at: string | null;
  kept_covered: boolean | null;
  storage_condition: StorageCondition;
  previously_served: ServedStatus;
  contamination_reported: ContaminationStatus;
  safety_acknowledged: boolean;

  collection_deadline: string;

  packed_status: PackedStatus;
  containers_available: AvailabilityTri;
  disposables_available: AvailabilityTri;
  serving_utensils_available: AvailabilityTri;
  volunteers_bring_containers: boolean;
  packaging_notes: string | null;

  donor_transport_availability: DonorTransportAvailability;
  donor_vehicle_type: string | null;
  donor_driver_contact: string | null;
  donor_vehicle_range_km: number | null;
  load_size: LoadSize;

  volunteers_needed: number;

  status: RescueStatus;
  urgent_override: boolean;

  phone_verified: boolean;
  donor_confirmed_at: string | null;
  donor_confirmed_by: string | null;
  admin_verified: boolean;
  admin_verified_by: string | null;
  admin_verified_at: string | null;
  requires_verification: boolean;

  cancelled_by: string | null;
  cancellation_reason: string | null;

  actual_quantity_kg: number | null;

  submitted_at: string;
  claimed_at: string | null;
  en_route_at: string | null;
  at_pickup_at: string | null;
  collected_at: string | null;
  distributed_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;
}

export type RescueFoodItem = {
  id: string;
  rescue_id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  created_at: string;
}

export type RescueAssignment = {
  id: string;
  rescue_id: string;
  profile_id: string;
  role: AssignmentRole;
  status: AssignmentStatus;
  transport_contribution: string | null;
  joined_at: string;
  left_at: string | null;
  leave_reason: string | null;
}

export type RescueStatusHistory = {
  id: string;
  rescue_id: string;
  previous_status: RescueStatus | null;
  new_status: RescueStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export type RescueActivity = {
  id: string;
  rescue_id: string;
  actor_id: string | null;
  message: string;
  created_at: string;
}

export type RescuePhoto = {
  id: string;
  rescue_id: string;
  url: string;
  caption: string | null;
  stage: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export type TransportRequest = {
  id: string;
  rescue_id: string;
  status: TransportStatusEnum;
  recommended_vehicle: string | null;
  assigned_offer_id: string | null;
  assigned_contact_id: string | null;
  estimated_charge_low: number | null;
  estimated_charge_high: number | null;
  actual_charge: number | null;
  paid_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TransportOffer = {
  id: string;
  rescue_id: string;
  profile_id: string;
  vehicle_type: TransportTypeEnum;
  notes: string | null;
  status: "offered" | "assigned" | "declined" | "completed";
  created_at: string;
}

export type FoodAssessment = {
  id: string;
  rescue_id: string;
  assessed_by: string | null;
  covered_ok: boolean | null;
  unusual_smell: boolean | null;
  visible_contamination: boolean | null;
  packaging_ok: boolean | null;
  storage_matches_description: boolean | null;
  temperature_condition: TemperatureCondition;
  concerns: string | null;
  notes: string | null;
  photo_urls: string[];
  outcome: AssessmentOutcome;
  do_not_collect_reason: string | null;
  created_at: string;
}

export type DistributionRecord = {
  id: string;
  rescue_id: string;
  location_name: string;
  area: string | null;
  people_served: number | null;
  meals_distributed: number;
  distributed_at: string;
  distribution_lead: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

export type RescueFeedback = {
  id: string;
  rescue_id: string;
  submitted_by: string | null;
  rating: number | null;
  biggest_delay: string | null;
  info_needed: string | null;
  feature_request: string | null;
  field_notes_worked_well: string | null;
  field_notes_delays: string | null;
  field_notes_future: string | null;
  created_at: string;
}

export type Notification = {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  rescue_id: string | null;
  read: boolean;
  created_at: string;
}

export type AdminAction = {
  id: string;
  admin_id: string | null;
  action_type: string;
  target_table: string;
  target_id: string | null;
  details: Json;
  created_at: string;
}

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      chapters: TableDef<Chapter>;
      zones: TableDef<Zone>;
      profiles: TableDef<Profile>;
      donor_profiles: TableDef<DonorProfile>;
      transport_contacts: TableDef<TransportContact>;
      saved_distribution_locations: TableDef<SavedDistributionLocation>;
      rescues: TableDef<Rescue>;
      rescue_food_items: TableDef<RescueFoodItem>;
      rescue_assignments: TableDef<RescueAssignment>;
      rescue_status_history: TableDef<RescueStatusHistory>;
      rescue_activity: TableDef<RescueActivity>;
      rescue_photos: TableDef<RescuePhoto>;
      transport_requests: TableDef<TransportRequest>;
      transport_offers: TableDef<TransportOffer>;
      food_assessments: TableDef<FoodAssessment>;
      distribution_records: TableDef<DistributionRecord>;
      rescue_feedback: TableDef<RescueFeedback>;
      notifications: TableDef<Notification>;
      admin_actions: TableDef<AdminAction>;
    };
    Views: Record<string, never>;
    Functions: {
      claim_rescue: { Args: { p_rescue_id: string }; Returns: Rescue };
      join_rescue: {
        Args: { p_rescue_id: string; p_role?: AssignmentRole; p_transport_note?: string | null };
        Returns: Rescue;
      };
      leave_rescue: { Args: { p_rescue_id: string; p_reason: string }; Returns: void };
      update_my_assignment_status: {
        Args: { p_rescue_id: string; p_status: AssignmentStatus };
        Returns: void;
      };
      confirm_donor_by_phone: { Args: { p_rescue_id: string }; Returns: void };
      advance_rescue_status: {
        Args: { p_rescue_id: string; p_new_status: RescueStatus; p_note?: string | null };
        Returns: Rescue;
      };
      submit_food_assessment: {
        Args: {
          p_rescue_id: string;
          p_covered_ok: boolean;
          p_unusual_smell: boolean;
          p_visible_contamination: boolean;
          p_packaging_ok: boolean;
          p_storage_matches: boolean;
          p_temp: TemperatureCondition;
          p_concerns: string | null;
          p_notes: string | null;
          p_photo_urls: string[];
          p_outcome: AssessmentOutcome;
          p_reason: string | null;
        };
        Returns: FoodAssessment;
      };
      record_distribution: {
        Args: {
          p_rescue_id: string;
          p_location: string;
          p_area: string | null;
          p_people: number | null;
          p_meals: number;
          p_notes: string | null;
          p_photo_url: string | null;
        };
        Returns: DistributionRecord;
      };
      complete_rescue: { Args: { p_rescue_id: string }; Returns: Rescue };
      admin_set_rescue_verification: {
        Args: { p_rescue_id: string; p_verified: boolean; p_status: RescueStatus };
        Returns: void;
      };
      admin_set_volunteer_verification: {
        Args: { p_profile_id: string; p_status: VerificationStatus; p_note?: string | null };
        Returns: void;
      };
      cancel_rescue_by_token: { Args: { p_token: string; p_reason: string }; Returns: void };
      cancel_rescue: { Args: { p_rescue_id: string; p_reason: string }; Returns: void };
      get_tracking_status: {
        Args: { p_token: string };
        Returns: {
          code: string;
          venue_name: string;
          area: string;
          status: RescueStatus;
          collection_deadline: string;
          submitted_at: string;
          claimed_at: string | null;
          en_route_at: string | null;
          collected_at: string | null;
          distributed_at: string | null;
          completed_at: string | null;
          lead_first_name: string | null;
          estimated_meals: number | null;
        }[];
      };
      upsert_donor_profile: {
        Args: {
          p_phone: string;
          p_name: string | null;
          p_org: string | null;
          p_donor_type: DonorType;
          p_auth_user: string | null;
        };
        Returns: string;
      };
      estimate_meals_for_rescue: { Args: { p_rescue_id: string }; Returns: number };
      offer_transport: {
        Args: { p_rescue_id: string; p_vehicle_type: TransportTypeEnum; p_notes?: string | null };
        Returns: TransportOffer;
      };
      assign_transport_offer: { Args: { p_rescue_id: string; p_offer_id: string }; Returns: void };
      assign_transport_contact: {
        Args: {
          p_rescue_id: string;
          p_contact_id: string;
          p_estimated_charge?: number | null;
          p_paid_by?: string | null;
        };
        Returns: void;
      };
      set_transport_status: { Args: { p_rescue_id: string; p_status: TransportStatusEnum }; Returns: void };
      submit_rescue_feedback: {
        Args: {
          p_rescue_id: string;
          p_rating: number;
          p_biggest_delay: string;
          p_info_needed: string | null;
          p_feature_request: string | null;
          p_worked_well?: string | null;
          p_delays?: string | null;
          p_future_notes?: string | null;
        };
        Returns: RescueFeedback;
      };
      mark_notifications_read: { Args: { p_ids: string[] }; Returns: void };
      mark_all_notifications_read: { Args: Record<string, never>; Returns: void };
    };
    Enums: {
      user_role: UserRole;
      verification_status: VerificationStatus;
      transport_type: TransportTypeEnum;
      donor_type: DonorType;
      rescue_status: RescueStatus;
      assignment_role: AssignmentRole;
      assignment_status: AssignmentStatus;
    };
  };
}
