import { Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { telHref } from "@/lib/format";
import { TRANSPORT_TYPE_LABELS } from "@/lib/labels";
import type { AssignmentWithProfile } from "@/lib/types";

const ROLE_LABELS: Record<string, string> = {
  rescue_lead: "Rescue Lead",
  volunteer: "Volunteer",
  driver: "Driver",
  distribution_lead: "Distribution Lead",
};

const STATUS_LABELS: Record<string, string> = {
  joined: "Joined",
  en_route: "En route",
  at_pickup: "At pickup",
  completed: "Completed",
  cancelled: "Left",
};

export function TeamSection({ assignments }: { assignments: AssignmentWithProfile[] }) {
  const active = assignments.filter((a) => a.status !== "cancelled");
  if (active.length === 0) return <p className="text-sm text-muted-foreground">No volunteers yet.</p>;

  return (
    <ul className="space-y-3">
      {active.map((a) => (
        <li key={a.id} className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{(a.profiles?.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{a.profiles?.full_name ?? "Volunteer"}</p>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[a.role]}
              {a.role === "driver" && a.profiles?.transport_type
                ? ` · ${TRANSPORT_TYPE_LABELS[a.profiles.transport_type]}`
                : ""}
              {a.transport_contribution ? ` · ${a.transport_contribution}` : ""}
            </p>
          </div>
          <Badge variant="outline">{STATUS_LABELS[a.status]}</Badge>
          {a.profiles?.phone && (
            <a
              href={telHref(a.profiles.phone)}
              className="flex size-8 items-center justify-center rounded-full border text-muted-foreground hover:bg-accent"
              aria-label={`Call ${a.profiles.full_name}`}
            >
              <Phone className="size-3.5" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
