"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, MapPinned } from "lucide-react";
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
import type { SavedDistributionLocation } from "@/lib/database.types";

interface FormValues {
  locationName: string;
  area: string;
  peopleServed: string;
  mealsDistributed: string;
  notes: string;
}

export function DistributionDialog({
  rescueId,
  savedLocations,
  estimatedMeals,
}: {
  rescueId: string;
  savedLocations: SavedDistributionLocation[];
  estimatedMeals: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      locationName: "",
      area: "",
      peopleServed: estimatedMeals ? String(estimatedMeals) : "",
      mealsDistributed: estimatedMeals ? String(estimatedMeals) : "",
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("record_distribution", {
      p_rescue_id: rescueId,
      p_location: values.locationName,
      p_area: values.area || null,
      p_people: values.peopleServed ? Number(values.peopleServed) : null,
      p_meals: Number(values.mealsDistributed || 0),
      p_notes: values.notes || null,
      p_photo_url: null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    toast.success("Distribution recorded");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <MapPinned /> Record Distribution
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Distribution details</DialogTitle>
          <DialogDescription>Where did this food ultimately go?</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {savedLocations.length > 0 && (
            <div className="space-y-1.5">
              <Label>Saved locations</Label>
              <Select
                onValueChange={(v) => {
                  const loc = savedLocations.find((l) => l.id === v);
                  if (loc) {
                    setValue("locationName", loc.name);
                    setValue("area", loc.area ?? "");
                  }
                }}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Pick a saved community / distribution location" /></SelectTrigger>
                <SelectContent>
                  {savedLocations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Community / distribution location</Label>
            <Input {...register("locationName", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Area</Label>
            <Input {...register("area")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>People served</Label>
              <Input type="number" {...register("peopleServed")} />
            </div>
            <div className="space-y-1.5">
              <Label>Meals distributed</Label>
              <Input type="number" {...register("mealsDistributed", { required: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Save distribution
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
