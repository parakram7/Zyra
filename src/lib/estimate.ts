// Client-side preview of the same assumptions applied server-side in
// supabase/migrations/0002_functions.sql (estimate_meals_for_rescue, bootstrap_transport_request).
// Keeping the constants here mirrors the chapter's configurable settings so the donor form can
// show a live "~120 meals" preview before the row exists in the database.

import type { FoodUnit, LoadSize } from "@/lib/database.types";

export interface FoodItemInput {
  quantity: number;
  unit: FoodUnit;
}

export function estimateMealsFromItems(items: FoodItemInput[], mealsPerKg = 2.2): number {
  const totalKgEquivalent = items.reduce((sum, item) => {
    switch (item.unit) {
      case "kg":
      case "litres":
        return sum + item.quantity;
      case "trays":
        return sum + item.quantity * 8;
      case "containers":
        return sum + item.quantity * 3;
      case "packets":
        return sum + item.quantity * 1;
      case "servings":
        return sum + item.quantity / mealsPerKg;
      default:
        return sum + item.quantity;
    }
  }, 0);
  return Math.max(Math.round(totalKgEquivalent * mealsPerKg), 0);
}

const SIZE_MULTIPLIER: Record<LoadSize, number> = {
  small: 1,
  medium: 1.4,
  large: 2,
  very_large: 3,
};

export function estimateTransportCost(
  loadSize: LoadSize,
  baseCharge = 150,
  perKm = 12,
  approxKm = 8
): { low: number; high: number } {
  const mult = SIZE_MULTIPLIER[loadSize];
  return {
    low: Math.round(baseCharge * mult),
    high: Math.round(baseCharge * mult * 1.6 + perKm * approxKm),
  };
}

export const RECOMMENDED_VEHICLE: Record<LoadSize, string> = {
  small: "Two-wheeler / small car",
  medium: "Car",
  large: "SUV / Van",
  very_large: "Commercial vehicle (Van / Porter-type)",
};
