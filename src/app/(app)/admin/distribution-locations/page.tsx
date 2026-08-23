import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddDistributionLocationDialog } from "@/components/admin/add-distribution-location-dialog";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";

export default async function DistributionLocationsPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("saved_distribution_locations")
    .select("*")
    .eq("chapter_id", admin.chapter_id!)
    .order("name");

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Distribution Locations</h1>
        <AddDistributionLocationDialog chapterId={admin.chapter_id!} />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Area</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {(locations ?? []).map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2 font-medium">{l.name}</td>
                <td className="px-3 py-2">{l.area}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{l.category}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{l.notes}</td>
                <td className="px-3 py-2"><ToggleActiveButton table="saved_distribution_locations" id={l.id} active={l.active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
