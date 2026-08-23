import { Phone, MessageCircle, ExternalLink, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoRow } from "@/components/shared/section-card";
import { OfferTransportDialog } from "@/components/rescue/detail/offer-transport-dialog";
import { AssignOfferButton, AssignContactButton } from "@/components/rescue/detail/assign-transport-row";
import { TRANSPORT_STATUS_LABELS, TRANSPORT_TYPE_LABELS } from "@/lib/labels";
import { RECOMMENDED_VEHICLE } from "@/lib/estimate";
import { formatCurrencyRange, telHref, whatsappHref } from "@/lib/format";
import { buildPorterLink } from "@/lib/integrations/transport-provider";
import type { Rescue, TransportContact, TransportRequest } from "@/lib/database.types";
import type { TransportOfferWithProfile } from "@/lib/types";

export function TransportSection({
  rescue,
  request,
  offers,
  contacts,
  canManage,
}: {
  rescue: Rescue;
  request: TransportRequest | null;
  offers: TransportOfferWithProfile[];
  contacts: TransportContact[];
  canManage: boolean;
}) {
  if (!request || request.status === "not_required") {
    return <p className="text-sm text-muted-foreground">Donor is providing transport — no volunteer transport needed.</p>;
  }

  const activeOffers = offers.filter((o) => o.status !== "declined");
  const zoneMatchedContacts = contacts.filter(
    (c) => c.preferred_zones.length === 0 || c.preferred_zones.includes(rescue.area)
  );

  return (
    <div className="space-y-4">
      <InfoRow label="Transport status" value={<Badge variant="warning">{TRANSPORT_STATUS_LABELS[request.status]}</Badge>} />
      <InfoRow label="Recommended vehicle" value={request.recommended_vehicle ?? RECOMMENDED_VEHICLE[rescue.load_size]} />
      <InfoRow label="Approximate load" value={rescue.load_size.replace("_", " ")} />
      <InfoRow
        label="Indicative estimate"
        value={
          <span className="text-xs text-muted-foreground">
            {formatCurrencyRange(request.estimated_charge_low, request.estimated_charge_high)} (indicative only)
          </span>
        }
      />

      {activeOffers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">Volunteer offers</p>
          {activeOffers.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div>
                <p className="font-medium">{o.profiles?.full_name ?? "Volunteer"}</p>
                <p className="text-xs text-muted-foreground">
                  {TRANSPORT_TYPE_LABELS[o.vehicle_type]}
                  {o.notes ? ` · ${o.notes}` : ""}
                </p>
              </div>
              {o.status === "assigned" ? (
                <Badge variant="success">Assigned</Badge>
              ) : canManage ? (
                <AssignOfferButton rescueId={rescue.id} offerId={o.id} />
              ) : null}
            </div>
          ))}
        </div>
      )}

      <OfferTransportDialog rescueId={rescue.id} />

      <div className="space-y-2 border-t pt-3">
        <p className="text-xs font-medium text-muted-foreground uppercase">Trusted transporters</p>
        {zoneMatchedContacts.length === 0 && <p className="text-sm text-muted-foreground">None listed for this area yet.</p>}
        {zoneMatchedContacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {TRANSPORT_TYPE_LABELS[c.vehicle_type]}
                {c.pricing_notes ? ` · ${c.pricing_notes}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <a href={telHref(c.phone)} className="rounded-full border p-1.5"><Phone className="size-3.5" /></a>
              <a href={whatsappHref(c.phone, `Hi, we need help transporting a food rescue from ${rescue.venue_name}, ${rescue.area}.`)} target="_blank" rel="noreferrer" className="rounded-full border p-1.5">
                <MessageCircle className="size-3.5" />
              </a>
              {canManage && <AssignContactButton rescueId={rescue.id} contactId={c.id} />}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" asChild>
        <a href={buildPorterLink(rescue.address)} target="_blank" rel="noreferrer">
          <ExternalLink /> Open Porter
        </a>
      </Button>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Truck className="size-3" /> Estimates are indicative only, not live pricing.
      </p>
    </div>
  );
}
