import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RescueStatus } from "@/lib/database.types";
import type { RescueListItem } from "@/lib/types";

export const RESCUE_FEED_SELECT =
  "*, rescue_food_items(id,name,quantity,unit), rescue_assignments(id,role,status,profile_id), transport_requests(status,recommended_vehicle)";

export const OPEN_FEED_STATUSES = [
  "open", "volunteer_assigned", "team_forming", "en_route", "at_pickup",
  "food_inspected", "collection_in_progress", "collected", "en_route_to_distribution",
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeRescueRow(row: any): RescueListItem {
  return {
    ...row,
    transport_requests: Array.isArray(row.transport_requests)
      ? (row.transport_requests[0] ?? null)
      : row.transport_requests,
  };
}

export async function fetchRescueFeed(
  supabase: SupabaseClient<Database>,
  chapterId: string,
  opts: { statuses?: readonly RescueStatus[]; zoneNames?: string[]; search?: string } = {}
): Promise<RescueListItem[]> {
  let query = supabase
    .from("rescues")
    .select(RESCUE_FEED_SELECT)
    .eq("chapter_id", chapterId)
    .order("collection_deadline", { ascending: true });

  if (opts.statuses?.length) {
    query = query.in("status", opts.statuses);
  } else {
    query = query.in("status", OPEN_FEED_STATUSES);
  }

  if (opts.zoneNames?.length) {
    query = query.in("area", opts.zoneNames);
  }

  if (opts.search) {
    const s = opts.search.trim();
    query = query.or(
      `venue_name.ilike.%${s}%,area.ilike.%${s}%,organisation_name.ilike.%${s}%,code.ilike.%${s}%`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await query.overrideTypes<any[], { merge: false }>();
  return (data ?? []).map(normalizeRescueRow);
}
