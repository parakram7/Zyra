"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PhoneCall } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ConfirmDonorButton({ rescueId }: { rescueId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("confirm_donor_by_phone", { p_rescue_id: rescueId });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Donor confirmed");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleConfirm} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <PhoneCall />}
      Confirm Donor by Phone
    </Button>
  );
}
