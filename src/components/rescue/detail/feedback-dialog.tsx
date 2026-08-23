"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FormValues {
  rating: number;
  biggestDelay: string;
  infoNeeded: string;
  featureRequest: string;
  workedWell: string;
  delays: string;
  future: string;
}

const DELAY_OPTIONS = [
  ["finding_volunteers", "Finding volunteers"],
  ["transportation", "Transportation"],
  ["donor_coordination", "Donor coordination"],
  ["location_confusion", "Location confusion"],
  ["packaging", "Packaging"],
  ["food_assessment", "Food assessment"],
  ["distribution_location", "Distribution location"],
  ["no_major_delay", "No major delay"],
  ["other", "Other"],
];

export function FeedbackDialog({
  rescueId,
  open,
  onOpenChange,
  trigger,
}: {
  rescueId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: { rating: 5, biggestDelay: "no_major_delay" },
  });
  const rating = watch("rating");

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("submit_rescue_feedback", {
      p_rescue_id: rescueId,
      p_rating: values.rating,
      p_biggest_delay: values.biggestDelay,
      p_info_needed: values.infoNeeded || null,
      p_feature_request: values.featureRequest || null,
      p_worked_well: values.workedWell || null,
      p_delays: values.delays || null,
      p_future_notes: values.future || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Thanks — this helps us improve the pilot.");
    onOpenChange?.(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How did this rescue go?</DialogTitle>
          <DialogDescription>Help the Jaipur pilot find what&apos;s working and what&apos;s missing.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setValue("rating", n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star className={cn("size-6", n <= rating ? "fill-warning text-warning" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>What caused the biggest delay?</Label>
            <Controller
              control={control}
              name="biggestDelay"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DELAY_OPTIONS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>What information would have helped before arriving?</Label>
            <Textarea rows={2} {...register("infoNeeded")} />
          </div>
          <div className="space-y-1.5">
            <Label>What feature should we add?</Label>
            <Textarea rows={2} {...register("featureRequest")} />
          </div>
          <div className="space-y-1.5">
            <Label>What worked well?</Label>
            <Textarea rows={2} {...register("workedWell")} />
          </div>
          <div className="space-y-1.5">
            <Label>What caused delays?</Label>
            <Textarea rows={2} {...register("delays")} />
          </div>
          <div className="space-y-1.5">
            <Label>Anything future volunteers should know?</Label>
            <Textarea rows={2} {...register("future")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>Skip</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Submit feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
