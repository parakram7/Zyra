"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PartyPopper } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/rescue/detail/feedback-dialog";

export function CompleteRescueButton({ rescueId }: { rescueId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  async function handleComplete() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("complete_rescue", { p_rescue_id: rescueId });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Rescue complete! 🎉");
    router.refresh();
    setShowFeedback(true);
  }

  return (
    <>
      <Button onClick={handleComplete} disabled={loading} size="lg" className="w-full" variant="success">
        {loading ? <Loader2 className="animate-spin" /> : <PartyPopper />}
        Complete Rescue
      </Button>
      <FeedbackDialog rescueId={rescueId} open={showFeedback} onOpenChange={setShowFeedback} />
    </>
  );
}
