import type {
  Rescue, RescueFoodItem, RescueAssignment, TransportRequest, TransportOffer, Profile,
} from "@/lib/database.types";

/** Shape returned by the rescue feed / control centre queries (rescue + light joins). */
export interface RescueListItem extends Rescue {
  rescue_food_items: Pick<RescueFoodItem, "id" | "quantity" | "unit" | "name">[];
  rescue_assignments: Pick<RescueAssignment, "id" | "role" | "status" | "profile_id">[];
  transport_requests: Pick<TransportRequest, "status" | "recommended_vehicle"> | null;
}

export function totalQuantityLabel(items: Pick<RescueFoodItem, "quantity" | "unit">[]): string {
  if (items.length === 0) return "Quantity not specified";
  const kgTotal = items.filter((i) => i.unit === "kg").reduce((s, i) => s + Number(i.quantity), 0);
  if (kgTotal > 0 && items.every((i) => i.unit === "kg")) return `Approx. ${kgTotal} kg`;
  if (items.length === 1) return `Approx. ${items[0].quantity} ${items[0].unit}`;
  return `${items.length} items`;
}

export function activeVolunteerCount(assignments: Pick<RescueAssignment, "status" | "role">[]): number {
  return assignments.filter((a) => a.status !== "cancelled").length;
}

export interface AssignmentWithProfile extends RescueAssignment {
  profiles: Pick<Profile, "full_name" | "phone" | "transport_type"> | null;
}

export interface TransportOfferWithProfile extends TransportOffer {
  profiles: Pick<Profile, "full_name" | "phone"> | null;
}
