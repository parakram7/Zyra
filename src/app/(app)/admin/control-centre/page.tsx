import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { normalizeRescueRow } from "@/lib/queries/rescues";
import { ControlCentreTable } from "@/components/admin/control-centre-table";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RescueListItem } from "@/lib/types";
import type { RescueStatus } from "@/lib/database.types";

const SELECT =
  "*, rescue_food_items(id,name,quantity,unit), rescue_assignments(id,role,status,profile_id,profiles(full_name)), transport_requests(status,recommended_vehicle)";

const BUCKETS: { key: string; label: string; statuses: RescueStatus[] }[] = [
  { key: "awaiting_verification", label: "Awaiting verification", statuses: ["awaiting_verification"] },
  { key: "unclaimed", label: "Unclaimed", statuses: ["submitted", "open"] },
  { key: "assigned", label: "Assigned", statuses: ["volunteer_assigned", "team_forming"] },
  { key: "en_route", label: "En route", statuses: ["en_route"] },
  { key: "at_pickup", label: "At pickup", statuses: ["at_pickup", "food_inspected", "collection_in_progress"] },
  { key: "distribution", label: "Distribution", statuses: ["collected", "en_route_to_distribution", "distributed"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
  { key: "problem", label: "Problem cases", statuses: ["food_unsuitable", "donor_unavailable", "duplicate_request", "rejected", "cancelled"] },
];

export default async function ControlCentrePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("rescues")
    .select(SELECT)
    .eq("chapter_id", admin.chapter_id!)
    .order("submitted_at", { ascending: false })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .overrideTypes<any[], { merge: false }>();

  type AssignmentWithLeadName = RescueListItem["rescue_assignments"][number] & {
    profiles: { full_name: string } | null;
  };

  const rows = (data ?? []).map((row) => {
    const rescue = normalizeRescueRow(row);
    const leadAssignments = rescue.rescue_assignments as unknown as AssignmentWithLeadName[];
    const lead = leadAssignments.find((a) => a.role === "rescue_lead" && a.status !== "cancelled");
    return { ...rescue, leadName: lead?.profiles?.full_name ?? null };
  });

  const filteredRows = q
    ? rows.filter((r) => {
        const s = q.toLowerCase();
        return (
          r.code.toLowerCase().includes(s) ||
          r.venue_name.toLowerCase().includes(s) ||
          r.area.toLowerCase().includes(s) ||
          (r.organisation_name ?? "").toLowerCase().includes(s) ||
          r.contact_name.toLowerCase().includes(s)
        );
      })
    : rows;

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <RealtimeRefresher tables={["rescues", "rescue_assignments"]} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Control Centre</h1>
          <p className="text-sm text-muted-foreground">Every rescue in the chapter, live.</p>
        </div>
        <form action="/admin/control-centre" className="w-full max-w-xs sm:w-auto">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search ID, area, donor..."
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </form>
      </div>

      <Tabs defaultValue="unclaimed">
        <TabsList className="flex-wrap">
          {BUCKETS.map((b) => {
            const count = filteredRows.filter((r) => b.statuses.includes(r.status)).length;
            return (
              <TabsTrigger key={b.key} value={b.key}>
                {b.label} {count > 0 && <span className="text-muted-foreground">({count})</span>}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {BUCKETS.map((b) => (
          <TabsContent key={b.key} value={b.key} className="pt-4">
            <ControlCentreTable
              rows={filteredRows.filter((r) => b.statuses.includes(r.status))}
              showVerifyActions={b.key === "awaiting_verification"}
              showCancel={!["completed", "problem"].includes(b.key)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
