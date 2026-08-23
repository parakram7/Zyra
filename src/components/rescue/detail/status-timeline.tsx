import { CheckCircle2 } from "lucide-react";
import { RESCUE_STATUS_META } from "@/lib/status";
import { formatDateTime } from "@/lib/format";
import type { RescueStatusHistory } from "@/lib/database.types";

export function StatusTimeline({ history }: { history: RescueStatusHistory[] }) {
  if (history.length === 0) return <p className="text-sm text-muted-foreground">No history yet.</p>;

  return (
    <ol className="space-y-4">
      {history.map((h, i) => (
        <li key={h.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="size-4 text-success" />
            {i < history.length - 1 && <div className="mt-1 h-full w-px flex-1 bg-border" />}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium">{RESCUE_STATUS_META[h.new_status].label}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
            {h.note && <p className="mt-0.5 text-xs text-muted-foreground">{h.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
