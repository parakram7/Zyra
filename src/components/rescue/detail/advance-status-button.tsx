"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { RescueStatus } from "@/lib/database.types";

export function AdvanceStatusButton({
  rescueId,
  nextStatus,
  label,
  icon: Icon,
  successMessage,
}: {
  rescueId: string;
  nextStatus: RescueStatus;
  label: string;
  icon: LucideIcon;
  successMessage?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("advance_rescue_status", {
      p_rescue_id: rescueId,
      p_new_status: nextStatus,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (successMessage) toast.success(successMessage);
    router.refresh();
  }

  return (
    <Button onClick={handleClick} disabled={loading} size="lg" className="w-full">
      {loading ? <Loader2 className="animate-spin" /> : <Icon />}
      {label}
    </Button>
  );
}
