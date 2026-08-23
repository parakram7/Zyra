import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { DonorTrustMenu } from "@/components/admin/donor-trust-menu";
import { DONOR_TYPE_LABELS, DONOR_TRUST_LABELS } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";

export default async function DonorsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: donors } = await supabase
    .from("donor_profiles")
    .select("*")
    .order("total_requests", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Donor History</h1>
      <p className="text-sm text-muted-foreground">Visible to volunteers and coordinators only — never shown publicly.</p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2">Donor</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Requests</th>
              <th className="px-3 py-2">Successful</th>
              <th className="px-3 py-2">Cancelled</th>
              <th className="px-3 py-2">Last donation</th>
              <th className="px-3 py-2">Trust</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {(donors ?? []).map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-3 py-2">
                  <p className="font-medium">{d.organisation_name || d.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{d.name}</p>
                </td>
                <td className="px-3 py-2">{d.phone}</td>
                <td className="px-3 py-2">{d.donor_type ? DONOR_TYPE_LABELS[d.donor_type] : "—"}</td>
                <td className="px-3 py-2">{d.total_requests}</td>
                <td className="px-3 py-2">{d.successful_rescues}</td>
                <td className="px-3 py-2">{d.cancelled_requests}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{formatDateTime(d.last_donation_at)}</td>
                <td className="px-3 py-2">
                  <Badge variant={d.trust_status === "flagged" ? "urgent" : d.trust_status === "trusted" ? "success" : "outline"}>
                    {DONOR_TRUST_LABELS[d.trust_status]}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  <DonorTrustMenu donorId={d.id} current={d.trust_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
