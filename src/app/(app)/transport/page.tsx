import Link from "next/link";
import { Phone, MessageCircle, Truck, MapPin } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RESCUE_FEED_SELECT, normalizeRescueRow } from "@/lib/queries/rescues";
import { EmptyState } from "@/components/shared/empty-state";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";
import { StatusBadge } from "@/components/rescue/status-badge";
import { UrgencyBadge } from "@/components/rescue/urgency-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TRANSPORT_STATUS_LABELS, TRANSPORT_TYPE_LABELS } from "@/lib/labels";
import { RECOMMENDED_VEHICLE } from "@/lib/estimate";
import { telHref, whatsappHref } from "@/lib/format";

export default async function TransportPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();

  const [{ data: rescueRows }, { data: contacts }] = await Promise.all([
    supabase
      .from("rescues")
      .select(RESCUE_FEED_SELECT)
      .eq("chapter_id", profile.chapter_id!)
      .not("status", "in", "(completed,cancelled,rejected,food_unsuitable,donor_unavailable,duplicate_request)")
      .order("collection_deadline")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .overrideTypes<any[], { merge: false }>(),
    supabase.from("transport_contacts").select("*").eq("chapter_id", profile.chapter_id!).eq("active", true).order("name"),
  ]);

  const feed = (rescueRows ?? [])
    .map(normalizeRescueRow)
    .filter((r) => r.transport_requests && !["not_required", "completed"].includes(r.transport_requests.status));

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <RealtimeRefresher tables={["transport_requests", "transport_offers", "rescues"]} />
      <h1 className="text-2xl font-semibold tracking-tight">Transport</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Rescues needing transport</h2>
        {feed.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No transport requests"
            description="All current rescues have transportation arranged."
          />
        ) : (
          <div className="space-y-2">
            {feed.map((r) => (
              <Link key={r.id} href={`/rescues/${r.id}`}>
                <Card className="gap-2 py-3 transition-colors hover:bg-accent/50">
                  <CardContent className="space-y-2 px-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{r.venue_name}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" /> {r.area}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="warning">{TRANSPORT_STATUS_LABELS[r.transport_requests!.status]}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {r.transport_requests?.recommended_vehicle ?? RECOMMENDED_VEHICLE[r.load_size]}
                      </span>
                      <UrgencyBadge deadline={r.collection_deadline} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">Trusted transport partners</h2>
        {(contacts ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No transport partners listed yet.</p>
        ) : (
          <div className="space-y-2">
            {(contacts ?? []).map((c) => (
              <Card key={c.id} className="gap-1 py-3">
                <CardContent className="flex items-center justify-between gap-3 px-4">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {TRANSPORT_TYPE_LABELS[c.vehicle_type]}
                      {c.preferred_zones.length ? ` · ${c.preferred_zones.join(", ")}` : ""}
                    </p>
                    {c.pricing_notes && <p className="text-xs text-muted-foreground">{c.pricing_notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" asChild>
                      <a href={telHref(c.phone)} aria-label={`Call ${c.name}`}><Phone className="size-4" /></a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={whatsappHref(c.phone, `Hi ${c.name}, we may need transport help for a food rescue.`)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${c.name}`}>
                        <MessageCircle className="size-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
