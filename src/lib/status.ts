import type { RescueStatus } from "@/lib/database.types";

export type StatusTone = "neutral" | "info" | "progress" | "success" | "warning" | "danger";

interface StatusMeta {
  label: string;
  tone: StatusTone;
  description: string;
}

export const RESCUE_STATUS_META: Record<RescueStatus, StatusMeta> = {
  submitted: { label: "Submitted", tone: "neutral", description: "Request received, not yet visible to volunteers." },
  awaiting_verification: { label: "Awaiting verification", tone: "warning", description: "Needs a coordinator review before it goes live." },
  open: { label: "Unclaimed", tone: "danger", description: "Visible to all volunteers, no lead yet." },
  volunteer_assigned: { label: "Volunteer assigned", tone: "info", description: "A Rescue Lead has claimed this call." },
  team_forming: { label: "Team forming", tone: "info", description: "Lead is building the team." },
  en_route: { label: "En route", tone: "progress", description: "Team is travelling to the pickup." },
  at_pickup: { label: "At pickup", tone: "progress", description: "Team has reached the location." },
  food_inspected: { label: "Food inspected", tone: "progress", description: "Field assessment recorded." },
  collection_in_progress: { label: "Collection in progress", tone: "progress", description: "Loading food for transport." },
  collected: { label: "Collected", tone: "progress", description: "Food has been picked up." },
  en_route_to_distribution: { label: "En route to distribution", tone: "progress", description: "Heading to the distribution point." },
  distributed: { label: "Distributed", tone: "success", description: "Food has reached the community." },
  completed: { label: "Completed", tone: "success", description: "Rescue closed out." },
  cancelled: { label: "Cancelled", tone: "neutral", description: "Cancelled before collection." },
  rejected: { label: "Rejected", tone: "danger", description: "Rejected by a coordinator." },
  food_unsuitable: { label: "Food unsuitable", tone: "danger", description: "Declined after field assessment." },
  donor_unavailable: { label: "Donor unavailable", tone: "neutral", description: "Donor could not be reached / venue closed." },
  duplicate_request: { label: "Duplicate request", tone: "neutral", description: "Matches an existing rescue." },
};

export const TERMINAL_STATUSES: RescueStatus[] = [
  "completed", "cancelled", "rejected", "food_unsuitable", "donor_unavailable", "duplicate_request",
];

export const PROBLEM_STATUSES: RescueStatus[] = [
  "food_unsuitable", "donor_unavailable", "duplicate_request", "rejected", "awaiting_verification",
];

export const WORKFLOW_ORDER: RescueStatus[] = [
  "submitted", "open", "volunteer_assigned", "team_forming", "en_route", "at_pickup",
  "food_inspected", "collection_in_progress", "collected", "en_route_to_distribution",
  "distributed", "completed",
];

export function isTerminal(status: RescueStatus) {
  return TERMINAL_STATUSES.includes(status);
}

export function toneToBadgeVariant(tone: StatusTone) {
  switch (tone) {
    case "danger": return "urgent" as const;
    case "success": return "success" as const;
    case "warning": return "warning" as const;
    case "info": return "secondary" as const;
    case "progress": return "default" as const;
    default: return "outline" as const;
  }
}
