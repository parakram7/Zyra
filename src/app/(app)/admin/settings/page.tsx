import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ChapterSettingsForm } from "@/components/admin/chapter-settings-form";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: chapter } = await supabase.from("chapters").select("*").eq("id", admin.chapter_id!).single();

  if (!chapter) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Operational assumptions used across the app — changing these updates every future rescue&apos;s estimates.
      </p>
      <ChapterSettingsForm chapter={chapter} />
    </div>
  );
}
