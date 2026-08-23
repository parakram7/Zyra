import { formatTime } from "@/lib/format";
import type { RescueActivity } from "@/lib/database.types";

export function ActivityFeed({ activity }: { activity: RescueActivity[] }) {
  if (activity.length === 0) return <p className="text-sm text-muted-foreground">No activity yet.</p>;

  return (
    <ul className="space-y-2">
      {activity.map((a) => (
        <li key={a.id} className="flex gap-2 text-sm">
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatTime(a.created_at)}</span>
          <span>{a.message}</span>
        </li>
      ))}
    </ul>
  );
}
