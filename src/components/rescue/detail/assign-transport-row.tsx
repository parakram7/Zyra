"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function AssignOfferButton({ rescueId, offerId }: { rescueId: string; offerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAssign() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("assign_transport_offer", { p_rescue_id: rescueId, p_offer_id: offerId });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Transport assigned");
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" onClick={handleAssign} disabled={loading}>
      {loading && <Loader2 className="animate-spin" />}
      Assign
    </Button>
  );
}

export function AssignContactButton({ rescueId, contactId }: { rescueId: string; contactId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAssign() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("assign_transport_contact", {
      p_rescue_id: rescueId,
      p_contact_id: contactId,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Trusted transporter arranged");
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" onClick={handleAssign} disabled={loading}>
      {loading && <Loader2 className="animate-spin" />}
      Arrange
    </Button>
  );
}
