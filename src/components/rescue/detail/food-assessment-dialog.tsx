"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

interface FormValues {
  coveredOk: boolean;
  unusualSmell: boolean;
  visibleContamination: boolean;
  packagingOk: boolean;
  storageMatches: boolean;
  temperature: "hot" | "cold" | "room_temperature" | "unknown";
  concerns: string;
  notes: string;
  outcome: "suitable" | "needs_review" | "do_not_collect";
  reason: string;
}

export function FoodAssessmentDialog({ rescueId, disclaimer }: { rescueId: string; disclaimer: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      coveredOk: true,
      unusualSmell: false,
      visibleContamination: false,
      packagingOk: true,
      storageMatches: true,
      temperature: "unknown",
      outcome: "suitable",
    },
  });
  const outcome = watch("outcome");

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("submit_food_assessment", {
      p_rescue_id: rescueId,
      p_covered_ok: values.coveredOk,
      p_unusual_smell: values.unusualSmell,
      p_visible_contamination: values.visibleContamination,
      p_packaging_ok: values.packagingOk,
      p_storage_matches: values.storageMatches,
      p_temp: values.temperature,
      p_concerns: values.concerns || null,
      p_notes: values.notes || null,
      p_photo_urls: [],
      p_outcome: values.outcome,
      p_reason: values.outcome === "do_not_collect" ? values.reason || null : null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    toast.success(values.outcome === "do_not_collect" ? "Marked food unsuitable" : "Field assessment recorded");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <ClipboardCheck /> Inspect Food
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Field food assessment</DialogTitle>
          <DialogDescription>A structured observation — not a food safety certification.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            ["coveredOk", "Food appears appropriately covered?"],
            ["packagingOk", "Packaging condition acceptable?"],
            ["storageMatches", "Storage information matches donor description?"],
          ].map(([name, label]) => (
            <div key={name} className="flex items-center justify-between">
              <Label htmlFor={name}>{label}</Label>
              <Controller
                control={control}
                name={name as keyof FormValues}
                render={({ field }) => (
                  <Switch id={name} checked={!!field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          ))}
          {[
            ["unusualSmell", "Unusual smell observed?"],
            ["visibleContamination", "Visible contamination?"],
          ].map(([name, label]) => (
            <div key={name} className="flex items-center justify-between">
              <Label htmlFor={name}>{label}</Label>
              <Controller
                control={control}
                name={name as keyof FormValues}
                render={({ field }) => (
                  <Switch id={name} checked={!!field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <Label>Apparent temperature condition</Label>
            <Controller
              control={control}
              name="temperature"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-3">
                  {["hot", "cold", "room_temperature", "unknown"].map((v) => (
                    <label key={v} className="flex items-center gap-1.5 text-sm capitalize">
                      <RadioGroupItem value={v} /> {v.replace("_", " ")}
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Any concerns?</Label>
            <Textarea rows={2} {...register("concerns")} />
          </div>
          <div className="space-y-1.5">
            <Label>Volunteer notes</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>

          <div className="space-y-1.5">
            <Label>Volunteer assessment</Label>
            <Controller
              control={control}
              name="outcome"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-2">
                  <label className="flex items-start gap-2 text-sm">
                    <RadioGroupItem value="suitable" className="mt-0.5" />
                    Suitable for collection based on field observation
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <RadioGroupItem value="needs_review" className="mt-0.5" />
                    Needs coordinator review
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <RadioGroupItem value="do_not_collect" className="mt-0.5" />
                    Do not collect
                  </label>
                </RadioGroup>
              )}
            />
          </div>
          {outcome === "do_not_collect" && (
            <div className="space-y-1.5">
              <Label>Reason (required)</Label>
              <Textarea rows={2} {...register("reason")} />
            </div>
          )}

          <Alert>
            <AlertDescription>{disclaimer}</AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} variant={outcome === "do_not_collect" ? "destructive" : "default"}>
              {loading && <Loader2 className="animate-spin" />}
              Save assessment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
