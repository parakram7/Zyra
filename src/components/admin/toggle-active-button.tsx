"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";

export function ToggleActiveButton({
  table,
  id,
  active,
}: {
  table: "transport_contacts" | "saved_distribution_locations";
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle(checked: boolean) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from(table).update({ active: checked }).eq("id", id);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
      <Switch checked={active} onCheckedChange={handleToggle} disabled={loading} />
    </div>
  );
}
