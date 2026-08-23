import Link from "next/link";
import { MapPin, Users, Truck, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/rescue/status-badge";
import { UrgencyBadge } from "@/components/rescue/urgency-badge";
import { RECOMMENDED_VEHICLE } from "@/lib/estimate";
import { totalQuantityLabel, activeVolunteerCount, type RescueListItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RescueCard({ rescue }: { rescue: RescueListItem }) {
  const volunteers = activeVolunteerCount(rescue.rescue_assignments);
  const transportNeeded =
    rescue.transport_requests && !["not_required", "completed"].includes(rescue.transport_requests.status);
  const containersNeeded = rescue.volunteers_bring_containers;

  return (
    <Card className="gap-3 py-4">
      <CardContent className="space-y-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{rescue.venue_name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {rescue.area}
            </p>
          </div>
          <StatusBadge status={rescue.status} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{totalQuantityLabel(rescue.rescue_food_items)}</span>
          {rescue.estimated_meals != null && (
            <span className="text-muted-foreground">~{rescue.estimated_meals} meals</span>
          )}
        </div>

        <UrgencyBadge deadline={rescue.collection_deadline} />

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {volunteers}/{rescue.volunteers_needed} joined
          </span>
          {transportNeeded && (
            <span className="flex items-center gap-1 text-warning">
              <Truck className="size-3.5" />
              {rescue.transport_requests?.recommended_vehicle ?? RECOMMENDED_VEHICLE[rescue.load_size]}
            </span>
          )}
          {containersNeeded && (
            <span className="flex items-center gap-1 text-warning">
              <UtensilsCrossed className="size-3.5" />
              Containers required
            </span>
          )}
        </div>

        <Button asChild className={cn("w-full")} size="sm">
          <Link href={`/rescues/${rescue.id}`}>View Rescue</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
