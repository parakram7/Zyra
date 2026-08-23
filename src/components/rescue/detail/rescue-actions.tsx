"use client";

import { Phone, MessageCircle, Navigation, MapPinCheck, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClaimButton, JoinButton, LeaveButton } from "@/components/rescue/detail/claim-join-actions";
import { AdvanceStatusButton } from "@/components/rescue/detail/advance-status-button";
import { FoodAssessmentDialog } from "@/components/rescue/detail/food-assessment-dialog";
import { MarkCollectedDialog } from "@/components/rescue/detail/mark-collected-dialog";
import { DistributionDialog } from "@/components/rescue/detail/distribution-dialog";
import { CompleteRescueButton } from "@/components/rescue/detail/complete-rescue-button";
import { telHref, whatsappHref } from "@/lib/format";
import { donorConfirmationMessage } from "@/lib/integrations/messaging";
import type { Rescue, SavedDistributionLocation } from "@/lib/database.types";
import { TERMINAL_STATUSES } from "@/lib/status";

export function RescueActions({
  rescue,
  isAssigned,
  isTeamEmpty,
  savedLocations,
  disclaimer,
}: {
  rescue: Rescue;
  isAssigned: boolean;
  isTeamEmpty: boolean;
  savedLocations: SavedDistributionLocation[];
  disclaimer: string;
}) {
  const contactPhone = rescue.pickup_contact_phone || rescue.phone;

  const contactButtons = (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="lg" className="flex-1">
        <a href={telHref(contactPhone)}>
          <Phone /> Call
        </a>
      </Button>
      <Button asChild variant="outline" size="lg" className="flex-1">
        <a
          href={whatsappHref(contactPhone, donorConfirmationMessage(rescue.venue_name))}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle /> WhatsApp
        </a>
      </Button>
    </div>
  );

  let primary: React.ReactNode = null;

  if (TERMINAL_STATUSES.includes(rescue.status)) {
    primary = null;
  } else if (rescue.status === "awaiting_verification") {
    primary = <p className="text-center text-sm text-muted-foreground">Waiting on coordinator verification.</p>;
  } else if (!isAssigned && (rescue.status === "submitted" || rescue.status === "open")) {
    primary = <ClaimButton rescueId={rescue.id} />;
  } else if (!isAssigned && !isTeamEmpty) {
    primary = <JoinButton rescueId={rescue.id} />;
  } else if (isAssigned && ["volunteer_assigned", "team_forming"].includes(rescue.status)) {
    primary = (
      <AdvanceStatusButton
        rescueId={rescue.id}
        nextStatus="en_route"
        label="Start Journey"
        icon={Navigation}
        successMessage="Team marked en route"
      />
    );
  } else if (isAssigned && rescue.status === "en_route") {
    primary = (
      <AdvanceStatusButton
        rescueId={rescue.id}
        nextStatus="at_pickup"
        label="Reached Pickup"
        icon={MapPinCheck}
        successMessage="Marked as at pickup"
      />
    );
  } else if (isAssigned && rescue.status === "at_pickup") {
    primary = <FoodAssessmentDialog rescueId={rescue.id} disclaimer={disclaimer} />;
  } else if (isAssigned && rescue.status === "food_inspected") {
    primary = (
      <AdvanceStatusButton
        rescueId={rescue.id}
        nextStatus="collection_in_progress"
        label="Start Collecting"
        icon={ListChecks}
      />
    );
  } else if (isAssigned && rescue.status === "collection_in_progress") {
    primary = <MarkCollectedDialog rescueId={rescue.id} />;
  } else if (isAssigned && rescue.status === "collected") {
    primary = (
      <DistributionDialog rescueId={rescue.id} savedLocations={savedLocations} estimatedMeals={rescue.estimated_meals} />
    );
  } else if (isAssigned && ["en_route_to_distribution", "distributed"].includes(rescue.status)) {
    primary = <CompleteRescueButton rescueId={rescue.id} />;
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm md:static">
      {primary}
      {contactButtons}
      {isAssigned && !TERMINAL_STATUSES.includes(rescue.status) && (
        <div className="flex justify-center">
          <LeaveButton rescueId={rescue.id} />
        </div>
      )}
    </div>
  );
}
