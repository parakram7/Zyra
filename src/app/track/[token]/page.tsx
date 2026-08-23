import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, PackageCheck, Truck, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RESCUE_STATUS_META } from "@/lib/status";
import { formatDateTime } from "@/lib/format";
import { CancelRequestButton } from "@/components/donate/cancel-request-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BLOCKED_CANCEL = ["completed", "distributed", "collected", "collection_in_progress", "cancelled", "rejected", "food_unsuitable", "donor_unavailable", "duplicate_request"];

export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_tracking_status", { p_token: token });
  const rescue = data?.[0];

  if (error || !rescue) notFound();

  const steps = [
    { key: "received", label: "Request received", at: rescue.submitted_at, icon: Circle },
    { key: "assigned", label: "Volunteer assigned", at: rescue.claimed_at, icon: UserCheck },
    { key: "enroute", label: "Team en route", at: rescue.en_route_at, icon: Truck },
    { key: "collected", label: "Food collected", at: rescue.collected_at, icon: PackageCheck },
    { key: "completed", label: "Completed", at: rescue.completed_at ?? rescue.distributed_at, icon: CheckCircle2 },
  ];

  const meta = RESCUE_STATUS_META[rescue.status];
  const canCancel = !BLOCKED_CANCEL.includes(rescue.status);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← RescueLink
      </Link>
      <Card className="mt-4">
        <CardHeader>
          <p className="text-xs font-mono text-muted-foreground">{rescue.code}</p>
          <CardTitle className="text-xl">{rescue.venue_name}</CardTitle>
          <p className="text-sm text-muted-foreground">{rescue.area}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium">{meta.label}</p>
            <p className="text-muted-foreground">{meta.description}</p>
            {rescue.lead_first_name && (
              <p className="mt-1 text-muted-foreground">
                {rescue.lead_first_name} is coordinating this pickup.
              </p>
            )}
            {rescue.estimated_meals != null && (
              <p className="mt-1 text-muted-foreground">Estimated ~{rescue.estimated_meals} meals.</p>
            )}
          </div>

          <ol className="space-y-4">
            {steps.map((step) => {
              const done = Boolean(step.at);
              const Icon = step.icon;
              return (
                <li key={step.key} className="flex items-start gap-3">
                  <Icon className={cn("mt-0.5 size-5 shrink-0", done ? "text-success" : "text-muted-foreground/40")} />
                  <div>
                    <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>{step.label}</p>
                    {done && <p className="text-xs text-muted-foreground">{formatDateTime(step.at)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="text-xs text-muted-foreground">
            Pickup deadline: {formatDateTime(rescue.collection_deadline)}
          </p>

          {canCancel && <CancelRequestButton token={token} />}
        </CardContent>
      </Card>
    </div>
  );
}
