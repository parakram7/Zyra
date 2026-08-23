"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { TRANSPORT_TYPE_LABELS } from "@/lib/labels";

interface FormValues {
  name: string;
  phone: string;
  vehicleType: string;
  preferredZones: string;
  pricingNotes: string;
  availabilityNotes: string;
}

export function AddTransportContactDialog({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, control, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { vehicleType: "van" } });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("transport_contacts").insert({
      chapter_id: chapterId,
      name: values.name,
      phone: values.phone,
      vehicle_type: values.vehicleType as never,
      preferred_zones: values.preferredZones ? values.preferredZones.split(",").map((z) => z.trim()) : [],
      pricing_notes: values.pricingNotes || null,
      availability_notes: values.availabilityNotes || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    reset();
    toast.success("Transport partner added");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus /> Add transport partner</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add transport partner</DialogTitle>
          <DialogDescription>Trusted drivers/vehicle owners volunteers can call directly.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input {...register("name", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...register("phone", { required: true })} />
          </div>
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
            <Label>Preferred zones (comma separated)</Label>
            <Input placeholder="Vaishali Nagar, Ajmer Road" {...register("preferredZones")} />
          </div>
          <div className="space-y-1.5">
            <Label>Pricing notes</Label>
            <Textarea rows={2} {...register("pricingNotes")} />
          </div>
          <div className="space-y-1.5">
            <Label>Availability notes</Label>
            <Textarea rows={2} {...register("availabilityNotes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Add partner
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
