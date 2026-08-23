import { Badge } from "@/components/ui/badge";
import { RESCUE_STATUS_META, toneToBadgeVariant } from "@/lib/status";
import type { RescueStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: RescueStatus; className?: string }) {
  const meta = RESCUE_STATUS_META[status];
  return (
    <Badge variant={toneToBadgeVariant(meta.tone)} className={cn(className)}>
      {meta.label}
    </Badge>
  );
}
