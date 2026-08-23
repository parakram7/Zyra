import Link from "next/link";
import { StatusBadge } from "@/components/rescue/status-badge";
import { Badge } from "@/components/ui/badge";
import { VerifyRejectButtons } from "@/components/admin/verify-reject-buttons";
import { AdminCancelButton } from "@/components/admin/admin-cancel-button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/format";
import { totalQuantityLabel } from "@/lib/types";
import { Inbox } from "lucide-react";
import type { RescueListItem } from "@/lib/types";

interface Row extends RescueListItem {
  leadName?: string | null;
}

export function ControlCentreTable({
  rows,
  showVerifyActions = false,
  showCancel = true,
}: {
  rows: Row[];
  showVerifyActions?: boolean;
  showCancel?: boolean;
}) {
  if (rows.length === 0) {
    return <EmptyState icon={Inbox} title="Nothing here" description="No rescues currently match this view." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
          <tr>
            <th className="px-3 py-2">Code</th>
            <th className="px-3 py-2">Submitted</th>
            <th className="px-3 py-2">Area</th>
            <th className="px-3 py-2">Donor</th>
            <th className="px-3 py-2">Quantity</th>
            <th className="px-3 py-2">Deadline</th>
            <th className="px-3 py-2">Lead</th>
            <th className="px-3 py-2">Volunteers</th>
            <th className="px-3 py-2">Transport</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t hover:bg-accent/30">
              <td className="px-3 py-2">
                <Link href={`/rescues/${r.id}`} className="font-mono text-xs text-primary hover:underline">
                  {r.code}
                </Link>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(r.submitted_at)}</td>
              <td className="px-3 py-2">{r.area}</td>
              <td className="px-3 py-2">{r.organisation_name || r.contact_name}</td>
              <td className="px-3 py-2 whitespace-nowrap">{totalQuantityLabel(r.rescue_food_items)}</td>
              <td className="px-3 py-2 whitespace-nowrap text-xs">{formatDateTime(r.collection_deadline)}</td>
              <td className="px-3 py-2">{r.leadName ?? "—"}</td>
              <td className="px-3 py-2">{r.rescue_assignments.filter((a) => a.status !== "cancelled").length}/{r.volunteers_needed}</td>
              <td className="px-3 py-2">
                {r.transport_requests ? (
                  <Badge variant="outline" className="whitespace-nowrap">{r.transport_requests.status.replace("_", " ")}</Badge>
                ) : "—"}
              </td>
              <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  {showVerifyActions && <VerifyRejectButtons rescueId={r.id} />}
                  {showCancel && <AdminCancelButton rescueId={r.id} />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
