"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

interface FormValues {
  name: string;
  area: string;
  category: string;
  notes: string;
}

export function AddDistributionLocationDialog({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("saved_distribution_locations").insert({
      chapter_id: chapterId,
      name: values.name,
      area: values.area || null,
      category: values.category || null,
      notes: values.notes || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    reset();
    toast.success("Distribution location added");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus /> Add location</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add distribution location</DialogTitle>
          <DialogDescription>Community / distribution point volunteers can select while recording distribution.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input {...register("name", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Area</Label>
            <Input {...register("area")} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input placeholder="e.g. community, night_shelter, hospital_surroundings" {...register("category")} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Add location
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
