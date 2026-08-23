import { z } from "zod";

export const donorTypeEnum = z.enum([
  "wedding_event", "restaurant", "hotel", "caterer", "household",
  "corporate_event", "institution", "other",
]);

export const foodCategoryEnum = z.enum([
  "rice", "roti_bread", "dal", "vegetable_sabzi", "curry", "snacks",
  "desserts", "packaged_food", "beverages", "mixed_meal", "other",
]);

export const foodUnitEnum = z.enum(["kg", "litres", "trays", "containers", "packets", "servings", "other"]);

export const foodItemSchema = z.object({
  name: z.string().min(1, "Name the item"),
  category: foodCategoryEnum,
  quantity: z.coerce.number().positive("Enter a quantity greater than 0"),
  unit: foodUnitEnum,
});
export type FoodItemForm = z.infer<typeof foodItemSchema>;

// Step 1 — Contact
export const contactStepSchema = z.object({
  contactName: z.string().min(2, "Enter your name"),
  organisationName: z.string().optional(),
  phone: z.string().min(8, "Enter a valid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  donorType: donorTypeEnum,
});

// Step 2 — Pickup location
export const locationStepSchema = z.object({
  venueName: z.string().min(2, "Enter the venue/location name"),
  address: z.string().min(5, "Enter the full address"),
  area: z.string().min(1, "Select an area"),
  landmark: z.string().optional(),
  mapsLink: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  floorBuilding: z.string().optional(),
  pickupContactName: z.string().optional(),
  pickupContactPhone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Step 3 — Food details
export const foodStepSchema = z.object({
  items: z.array(foodItemSchema).min(1, "Add at least one food item"),
});

// Step 4 — Estimated meals
export const mealsStepSchema = z.object({
  mealsBasis: z.enum(["auto", "manual"]),
  estimatedMeals: z.coerce.number().int().positive().optional(),
});

// Step 5 — Preparation / safety information
export const safetyStepSchema = z.object({
  preparedAt: z.string().optional(),
  servingEndedAt: z.string().optional(),
  keptCovered: z.boolean().optional(),
  storageCondition: z.enum(["refrigerated", "hot_holding", "room_temperature", "unknown"]),
  previouslyServed: z.enum(["yes", "no", "partially"]),
  contaminationReported: z.enum(["no", "yes", "unsure"]),
  safetyAcknowledged: z.literal(true, {
    message: "Please confirm you understand volunteers may decline unsuitable food",
  }),
});

// Step 6 — Collection deadline
export const deadlineStepSchema = z.object({
  collectionDeadline: z.string().min(1, "Choose a pickup deadline"),
});

// Step 7 — Packaging / utensils
export const packagingStepSchema = z.object({
  packedStatus: z.enum(["completely_packed", "partially_packed", "not_packed"]),
  containersAvailable: z.enum(["yes", "no", "some"]),
  disposablesAvailable: z.enum(["yes", "no", "some"]),
  servingUtensilsAvailable: z.enum(["yes", "no", "some"]),
  volunteersBringContainers: z.boolean(),
  packagingNotes: z.string().optional(),
});

// Step 8 — Transportation
export const transportStepSchema = z.object({
  donorTransportAvailability: z.enum(["yes_completely", "partially", "no"]),
  donorVehicleType: z.string().optional(),
  donorDriverContact: z.string().optional(),
  donorVehicleRangeKm: z.coerce.number().optional(),
  loadSize: z.enum(["small", "medium", "large", "very_large"]),
});

export const donorSubmissionSchema = contactStepSchema
  .merge(locationStepSchema)
  .merge(foodStepSchema)
  .merge(mealsStepSchema)
  .merge(safetyStepSchema)
  .merge(deadlineStepSchema)
  .merge(packagingStepSchema)
  .merge(transportStepSchema);

export type DonorSubmissionInput = z.infer<typeof donorSubmissionSchema>;
/** Pre-coercion shape (what the form fields actually hold before zodResolver coerces on submit). */
export type DonorSubmissionFormValues = z.input<typeof donorSubmissionSchema>;

export const STEP_SCHEMAS = [
  contactStepSchema,
  locationStepSchema,
  foodStepSchema,
  mealsStepSchema,
  safetyStepSchema,
  deadlineStepSchema,
  packagingStepSchema,
  transportStepSchema,
] as const;

export const STEP_LABELS = [
  "Contact",
  "Pickup location",
  "Food details",
  "Estimated meals",
  "Preparation & safety",
  "Collection deadline",
  "Packaging & utensils",
  "Transportation",
] as const;
