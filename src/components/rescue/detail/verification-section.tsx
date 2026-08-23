import { Check, Circle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDonorButton } from "@/components/rescue/detail/confirm-donor-button";
import type { DonorProfile, Rescue } from "@/lib/database.types";
import { DONOR_TRUST_LABELS } from "@/lib/labels";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

function Signal({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={cn("flex items-center gap-2 text-sm", met ? "text-foreground" : "text-muted-foreground")}>
      {met ? <Check className="size-4 text-success" /> : <Circle className="size-4" />}
      {label}
    </li>
  );
}

export function VerificationSection({
  rescue,
  donor,
}: {
  rescue: Rescue;
  donor: DonorProfile | null;
}) {
  const successCount = donor?.successful_rescues ?? 0;

  return (
    <div className="space-y-3">
      {donor?.trust_status && donor.trust_status !== "standard" && (
        <Badge variant={donor.trust_status === "flagged" ? "urgent" : "success"} className="gap-1">
          {donor.trust_status === "flagged" ? <ShieldAlert className="size-3" /> : <ShieldCheck className="size-3" />}
          Donor marked {DONOR_TRUST_LABELS[donor.trust_status]}
        </Badge>
      )}
      <ul className="space-y-2">
        <Signal met={rescue.phone_verified} label="Phone confirmed" />
        <Signal
          met={successCount > 0}
          label={successCount > 0 ? `Donated successfully ${successCount} ${pluralize(successCount, "time")}` : "No prior donation history"}
        />
        <Signal met={rescue.admin_verified} label="Reviewed by coordinator" />
        <Signal met={Boolean(rescue.donor_confirmed_at)} label="Confirmed with donor by a volunteer" />
      </ul>
      {!rescue.donor_confirmed_at && <ConfirmDonorButton rescueId={rescue.id} />}
    </div>
  );
}
