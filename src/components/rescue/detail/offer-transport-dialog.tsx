"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { TRANSPORT_TYPE_LABELS } from "@/lib/labels";

interface FormValues {
  vehicleType: string;
  notes: string;
}

export function OfferTransportDialog({ rescueId }: { rescueId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, control, handleSubmit } = useForm<FormValues>({ defaultValues: { vehicleType: "car" } });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("offer_transport", {
      p_rescue_id: rescueId,
      p_vehicle_type: values.vehicleType as never,
      p_notes: values.notes || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    toast.success("Transport offer added");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Truck /> I can provide transport
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offer transport</DialogTitle>
          <DialogDescription>Let the team know you can help move this pickup.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Vehicle type</Label>
            <Controller
              control={control}
              name="vehicleType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRANSPORT_TYPE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea rows={2} placeholder="e.g. Can travel anywhere in Jaipur" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Offer transport
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
