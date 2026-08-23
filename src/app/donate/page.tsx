import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DonorWizard } from "@/components/donate/donor-wizard";
import { ZONE_FALLBACK_NAMES } from "@/lib/labels";

export const metadata = { title: "Have surplus food? — RescueLink" };

export default async function DonatePage() {
  const supabase = await createClient();
  const { data: chapter } = await supabase.from("chapters").select("id").limit(1).single();
  const { data: zones } = chapter
    ? await supabase.from("zones").select("name").eq("chapter_id", chapter.id).eq("active", true).order("sort_order")
    : { data: null };

  const areas = zones?.length ? zones.map((z) => z.name) : ZONE_FALLBACK_NAMES;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← RescueLink
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Have surplus food?</h1>
        <p className="mt-1 text-muted-foreground">
          Tell us what is available and volunteers can coordinate a collection.
        </p>
      </div>
      <DonorWizard areas={areas} />
    </div>
  );
}
