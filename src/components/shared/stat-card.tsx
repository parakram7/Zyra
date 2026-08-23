import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "success" | "urgent";
}) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="flex items-center justify-between px-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              "text-2xl font-semibold tabular-nums",
              tone === "warning" && "text-warning",
              tone === "success" && "text-success",
              tone === "urgent" && "text-urgent"
            )}
          >
            {value}
          </p>
        </div>
        {Icon && (
          <div className="flex size-9 items-center justify-center rounded-full bg-muted">
            <Icon className="size-4.5 text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
