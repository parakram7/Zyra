import { PartyPopper, Utensils, Weight, Users, Truck, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Rescue } from "@/lib/database.types";

function formatDuration(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const totalMin = Math.max(Math.round(ms / 60000), 0);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hrs === 0) return `${mins} min`;
  return `${hrs} hr ${mins} min`;
}

export function CompletionSummary({
  rescue,
  mealsDistributed,
  volunteerCount,
  vehicleCount,
}: {
  rescue: Rescue;
  mealsDistributed: number;
  volunteerCount: number;
  vehicleCount: number;
}) {
  const duration = rescue.completed_at
    ? formatDuration(rescue.submitted_at, rescue.completed_at)
    : null;

  const stats = [
    { icon: Utensils, label: "Meals distributed", value: `Approx. ${mealsDistributed}` },
    { icon: Weight, label: "Food rescued", value: rescue.actual_quantity_kg ? `${rescue.actual_quantity_kg} kg` : "—" },
    { icon: Users, label: "Volunteers", value: volunteerCount },
    { icon: Truck, label: "Vehicles", value: vehicleCount },
  ];

  return (
    <Card className="border-success/40 bg-success/5">
      <CardContent className="space-y-4 px-5">
        <div className="flex items-center gap-2">
          <PartyPopper className="size-5 text-success" />
          <p className="text-lg font-semibold">Rescue Complete</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-md border bg-background p-3">
              <s.icon className="mb-1 size-4 text-muted-foreground" />
              <p className="text-lg font-semibold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        {duration && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Timer className="size-4" /> Total rescue time: {duration}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
