export type UrgencyLevel = "expired" | "critical" | "urgent" | "soon" | "normal";

export interface Urgency {
  level: UrgencyLevel;
  label: string;
  minutesLeft: number;
}

/** Urgency buckets: <0 expired, <30 critical, <60 urgent, <180 soon, else normal. */
export function getUrgency(deadline: string | Date, now: Date = new Date()): Urgency {
  const deadlineDate = typeof deadline === "string" ? new Date(deadline) : deadline;
  const minutesLeft = Math.round((deadlineDate.getTime() - now.getTime()) / 60000);

  if (minutesLeft < 0) {
    return { level: "expired", label: "Pickup window passed", minutesLeft };
  }
  if (minutesLeft < 30) {
    return { level: "critical", label: `Pickup within ${minutesLeft} min`, minutesLeft };
  }
  if (minutesLeft < 60) {
    return { level: "urgent", label: `Pickup within ${minutesLeft} min`, minutesLeft };
  }
  if (minutesLeft < 180) {
    const hrs = Math.floor(minutesLeft / 60);
    const mins = minutesLeft % 60;
    return { level: "soon", label: `Pickup within ${hrs}h ${mins}m`, minutesLeft };
  }
  const hrs = Math.floor(minutesLeft / 60);
  return { level: "normal", label: `Pickup within ${hrs}h`, minutesLeft };
}

export function urgencyBadgeClasses(level: UrgencyLevel): string {
  switch (level) {
    case "expired": return "bg-urgent text-urgent-foreground";
    case "critical": return "bg-urgent text-urgent-foreground";
    case "urgent": return "bg-warning text-warning-foreground";
    case "soon": return "bg-accent text-accent-foreground";
    default: return "bg-secondary text-secondary-foreground";
  }
}
