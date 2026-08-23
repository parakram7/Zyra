import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddTransportContactDialog } from "@/components/admin/add-transport-contact-dialog";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";
import { TRANSPORT_TYPE_LABELS } from "@/lib/labels";

export default async function TransportPartnersPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from("transport_contacts")
    .select("*")
    .eq("chapter_id", admin.chapter_id!)
    .order("name");

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Transport Partners</h1>
        <AddTransportContactDialog chapterId={admin.chapter_id!} />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Vehicle</th>
              <th className="px-3 py-2">Zones</th>
              <th className="px-3 py-2">Pricing</th>
              <th className="px-3 py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {(contacts ?? []).map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2">{c.phone}</td>
                <td className="px-3 py-2">{TRANSPORT_TYPE_LABELS[c.vehicle_type]}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{c.preferred_zones.join(", ") || "Any"}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{c.pricing_notes}</td>
                <td className="px-3 py-2"><ToggleActiveButton table="transport_contacts" id={c.id} active={c.active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
