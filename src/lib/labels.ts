import type {
  AssessmentOutcome,
  AvailabilityTri,
  ContaminationStatus,
  DonorTransportAvailability,
  DonorTrust,
  DonorType,
  FoodCategory,
  FoodUnit,
  LoadSize,
  PackedStatus,
  ServedStatus,
  StorageCondition,
  TemperatureCondition,
  TransportStatusEnum,
  TransportTypeEnum,
  VerificationStatus,
} from "@/lib/database.types";

export const DONOR_TYPE_LABELS: Record<DonorType, string> = {
  wedding_event: "Wedding / Event",
  restaurant: "Restaurant",
  hotel: "Hotel",
  caterer: "Caterer",
  household: "Household",
  corporate_event: "Corporate event",
  institution: "Institution",
  other: "Other",
};

export const TRANSPORT_TYPE_LABELS: Record<TransportTypeEnum, string> = {
  no_vehicle: "No vehicle",
  bicycle: "Bicycle",
  two_wheeler: "Two-wheeler",
  car: "Car",
  suv: "SUV",
  van: "Van",
  commercial_vehicle: "Commercial vehicle",
  other: "Other",
};

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  rice: "Rice",
  roti_bread: "Roti / Bread",
  dal: "Dal",
  vegetable_sabzi: "Vegetable / Sabzi",
  curry: "Curry",
  snacks: "Snacks",
  desserts: "Desserts",
  packaged_food: "Packaged food",
  beverages: "Beverages",
  mixed_meal: "Mixed meal",
  other: "Other",
};

export const FOOD_UNIT_LABELS: Record<FoodUnit, string> = {
  kg: "kg",
  litres: "litres",
  trays: "trays",
  containers: "containers",
  packets: "packets",
  servings: "servings",
  other: "other",
};

export const STORAGE_CONDITION_LABELS: Record<StorageCondition, string> = {
  refrigerated: "Refrigerated",
  hot_holding: "Hot holding",
  room_temperature: "Room temperature",
  unknown: "Unknown",
};

export const SERVED_STATUS_LABELS: Record<ServedStatus, string> = {
  yes: "Yes",
  no: "No",
  partially: "Partially",
};

export const CONTAMINATION_LABELS: Record<ContaminationStatus, string> = {
  no: "No",
  yes: "Yes",
  unsure: "Unsure",
};

export const PACKED_STATUS_LABELS: Record<PackedStatus, string> = {
  completely_packed: "Completely packed",
  partially_packed: "Partially packed",
  not_packed: "Not packed",
};

export const AVAILABILITY_TRI_LABELS: Record<AvailabilityTri, string> = {
  yes: "Yes",
  no: "No",
  some: "Some",
};

export const DONOR_TRANSPORT_LABELS: Record<DonorTransportAvailability, string> = {
  yes_completely: "Yes, completely",
  partially: "Partially",
  no: "No",
};

export const LOAD_SIZE_LABELS: Record<LoadSize, string> = {
  small: "Small — 1-2 people can manage",
  medium: "Medium — car recommended",
  large: "Large — SUV/van recommended",
  very_large: "Very large — commercial transport likely required",
};

export const TRANSPORT_STATUS_LABELS: Record<TransportStatusEnum, string> = {
  not_required: "Not required",
  needed: "Needed",
  volunteer_offered: "Volunteer transport offered",
  arranged: "Transport arranged",
  driver_en_route: "Driver en route",
  completed: "Transport completed",
};

export const TEMPERATURE_LABELS: Record<TemperatureCondition, string> = {
  hot: "Hot",
  cold: "Cold",
  room_temperature: "Room temperature",
  unknown: "Unknown",
};

export const ASSESSMENT_OUTCOME_LABELS: Record<AssessmentOutcome, string> = {
  suitable: "Suitable for collection based on field observation",
  needs_review: "Needs coordinator review",
  do_not_collect: "Do not collect",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const DONOR_TRUST_LABELS: Record<DonorTrust, string> = {
  trusted: "Trusted",
  standard: "Standard",
  flagged: "Flagged",
};

export const ZONE_FALLBACK_NAMES = [
  "C-Scheme", "Malviya Nagar", "Mansarovar", "Vaishali Nagar", "Raja Park",
  "Jagatpura", "Tonk Road", "Civil Lines", "Bani Park", "Vidhyadhar Nagar",
  "Ajmer Road", "MI Road", "Sodala", "Pratap Nagar", "Other",
];
