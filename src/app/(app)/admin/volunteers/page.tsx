import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { VolunteerVerificationMenu } from "@/components/admin/volunteer-verification-menu";
import { VERIFICATION_STATUS_LABELS, TRANSPORT_TYPE_LABELS } from "@/lib/labels";
import { formatRelative } from "@/lib/format";

export default async function VolunteersPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: volunteers } = await supabase
    .from("profiles")
    .select("*")
    .eq("chapter_id", admin.chapter_id!)
    .in("role", ["volunteer", "admin"])
    .order("full_name");

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Volunteer Directory</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Vehicle</th>
              <th className="px-3 py-2">Verification</th>
              <th className="px-3 py-2">Completed</th>
              <th className="px-3 py-2">Last active</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {(volunteers ?? []).map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-3 py-2">
                  <p className="font-medium">{v.full_name}</p>
                  <p className="text-xs text-muted-foreground">{v.email}</p>
                </td>
                <td className="px-3 py-2">{v.phone}</td>
                <td className="px-3 py-2">{TRANSPORT_TYPE_LABELS[v.transport_type]}</td>
                <td className="px-3 py-2">
                  <Badge
                    variant={
                      v.verification_status === "verified" ? "success"
                      : v.verification_status === "pending" ? "warning"
                      : "urgent"
                    }
                  >
                    {VERIFICATION_STATUS_LABELS[v.verification_status]}
                  </Badge>
                </td>
                <td className="px-3 py-2">{v.rescues_completed}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {v.last_active_at ? formatRelative(v.last_active_at) : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <VolunteerVerificationMenu profileId={v.id} current={v.verification_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
