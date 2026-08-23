"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2, MapPin, CheckCircle2 } from "lucide-react";

import {
  donorSubmissionSchema,
  type DonorSubmissionInput,
  type DonorSubmissionFormValues,
  STEP_LABELS,
} from "@/lib/schemas/rescue";
import { DONOR_TYPE_LABELS, FOOD_CATEGORY_LABELS, FOOD_UNIT_LABELS } from "@/lib/labels";
import { estimateMealsFromItems, estimateTransportCost, RECOMMENDED_VEHICLE } from "@/lib/estimate";
import { submitRescue } from "@/app/donate/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup, RadioGroupItem,
} from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

const STEP_FIELDS: FieldPath<DonorSubmissionFormValues>[][] = [
  ["contactName", "phone", "donorType"],
  ["venueName", "address", "area"],
  ["items"],
  ["mealsBasis"],
  ["storageCondition", "previouslyServed", "contaminationReported", "safetyAcknowledged"],
  ["collectionDeadline"],
  ["packedStatus", "containersAvailable", "disposablesAvailable", "servingUtensilsAvailable"],
  ["donorTransportAvailability", "loadSize"],
];

export function DonorWizard({ areas }: { areas: string[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ code: string; token: string } | null>(null);

  const form = useForm<DonorSubmissionFormValues, unknown, DonorSubmissionInput>({
    resolver: zodResolver(donorSubmissionSchema),
    defaultValues: {
      donorType: "other",
      items: [{ name: "", category: "mixed_meal", quantity: 1, unit: "kg" }],
      mealsBasis: "auto",
      storageCondition: "unknown",
      previouslyServed: "no",
      contaminationReported: "no",
      packedStatus: "not_packed",
      containersAvailable: "no",
      disposablesAvailable: "no",
      servingUtensilsAvailable: "no",
      volunteersBringContainers: false,
      donorTransportAvailability: "no",
      loadSize: "medium",
    },
    mode: "onChange",
  });

  const { register, control, handleSubmit, watch, trigger, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const items = watch("items");
  const mealsBasis = watch("mealsBasis");
  const loadSize = watch("loadSize");
  const donorTransport = watch("donorTransportAvailability");
  const numericItems = items.map((i) => ({ quantity: Number(i.quantity) || 0, unit: i.unit }));
  const preview = estimateMealsFromItems(numericItems.filter((i) => i.quantity > 0));
  const transportPreview = estimateTransportCost(loadSize);

  async function next() {
    const ok = await trigger(STEP_FIELDS[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: DonorSubmissionInput) {
    setSubmitting(true);
    setSubmitError(null);
    const res = await submitRescue(values);
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.error ?? "Something went wrong. Please try again.");
      return;
    }
    setSuccess({ code: res.code!, token: res.trackingToken! });
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <div>
            <p className="text-lg font-semibold">Request submitted</p>
            <p className="text-sm text-muted-foreground">
              Reference <span className="font-mono font-medium">{success.code}</span>. Volunteers in your area
              can now see this request.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/track/${success.token}`)}>Track this request</Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(null);
                setStep(0);
                form.reset();
              }}
            >
              Submit another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Progress value={((step + 1) / STEP_LABELS.length) * 100} />
        <p className="text-xs font-medium text-muted-foreground">
          Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Contact */}
        <div className={step === 0 ? "space-y-4" : "hidden"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" error={errors.contactName?.message}>
              <Input {...register("contactName")} />
            </Field>
            <Field label="Organisation / event name" error={errors.organisationName?.message}>
              <Input {...register("organisationName")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone number" error={errors.phone?.message}>
              <Input type="tel" placeholder="+91 90000 00000" {...register("phone")} />
            </Field>
            <Field label="Email (optional)" error={errors.email?.message}>
              <Input type="email" {...register("email")} />
            </Field>
          </div>
          <Field label="Donor type" error={errors.donorType?.message}>
            <Controller
              control={control}
              name="donorType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DONOR_TYPE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        {/* Step 2: Pickup location */}
        <div className={step === 1 ? "space-y-4" : "hidden"}>
          <Field label="Venue / location name" error={errors.venueName?.message}>
            <Input {...register("venueName")} />
          </Field>
          <Field label="Full address" error={errors.address?.message}>
            <Textarea rows={2} {...register("address")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Area / locality" error={errors.area?.message}>
              <Controller
                control={control}
                name="area"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select area" /></SelectTrigger>
                    <SelectContent>
                      {areas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Landmark (optional)" error={errors.landmark?.message}>
              <Input {...register("landmark")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Google Maps link (optional)" error={errors.mapsLink?.message}>
              <Input placeholder="https://maps.google.com/..." {...register("mapsLink")} />
            </Field>
            <Field label="Floor / building details (optional)" error={errors.floorBuilding?.message}>
              <Input {...register("floorBuilding")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pickup contact person" error={errors.pickupContactName?.message}>
              <Input placeholder="Same as your name if left blank" {...register("pickupContactName")} />
            </Field>
            <Field label="Pickup contact phone" error={errors.pickupContactPhone?.message}>
              <Input placeholder="Same as your phone if left blank" {...register("pickupContactPhone")} />
            </Field>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (!navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition((pos) => {
                form.setValue("latitude", pos.coords.latitude);
                form.setValue("longitude", pos.coords.longitude);
              });
            }}
          >
            <MapPin /> Use current location
          </Button>
          {watch("latitude") != null && (
            <p className="text-xs text-muted-foreground">Location captured — will be shared with volunteers.</p>
          )}
        </div>

        {/* Step 3: Food details */}
        <div className={step === 2 ? "space-y-4" : "hidden"}>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_100px_110px_auto]">
              <Field label={index === 0 ? "Food name" : undefined} error={errors.items?.[index]?.name?.message}>
                <Input placeholder="e.g. Paneer Butter Masala" {...register(`items.${index}.name` as const)} />
              </Field>
              <Field label={index === 0 ? "Category" : undefined}>
                <Controller
                  control={control}
                  name={`items.${index}.category` as const}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(FOOD_CATEGORY_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label={index === 0 ? "Approx. qty" : undefined} error={errors.items?.[index]?.quantity?.message}>
                <Input type="number" step="0.1" min="0" {...register(`items.${index}.quantity` as const)} />
              </Field>
              <Field label={index === 0 ? "Unit" : undefined}>
                <Controller
                  control={control}
                  name={`items.${index}.unit` as const}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(FOOD_UNIT_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end text-muted-foreground"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label="Remove item"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {errors.items?.message && <p className="text-sm text-destructive">{errors.items.message}</p>}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", category: "mixed_meal", quantity: 1, unit: "kg" })}
          >
            <Plus /> Add another item
          </Button>
        </div>

        {/* Step 4: Estimated meals */}
        <div className={step === 3 ? "space-y-4" : "hidden"}>
          <Controller
            control={control}
            name="mealsBasis"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-3">
                <label className="flex items-start gap-3 rounded-md border p-3">
                  <RadioGroupItem value="auto" className="mt-0.5" />
                  <div>
                    <p className="font-medium">Let RescueLink estimate</p>
                    <p className="text-sm text-muted-foreground">
                      Based on quantity — <strong>~{preview} meals</strong>. Actual servings may vary.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 rounded-md border p-3">
                  <RadioGroupItem value="manual" className="mt-0.5" />
                  <div className="w-full">
                    <p className="font-medium">I&apos;ll provide my own estimate</p>
                    {mealsBasis === "manual" && (
                      <Input
                        type="number"
                        min={1}
                        className="mt-2 max-w-40"
                        placeholder="e.g. 120"
                        {...register("estimatedMeals")}
                      />
                    )}
                  </div>
                </label>
              </RadioGroup>
            )}
          />
        </div>

        {/* Step 5: Preparation & safety */}
        <div className={step === 4 ? "space-y-4" : "hidden"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What time was the food prepared?">
              <Input type="datetime-local" {...register("preparedAt")} />
            </Field>
            <Field label="What time did serving end?">
              <Input type="datetime-local" {...register("servingEndedAt")} />
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="keptCovered">Has the food remained covered?</Label>
            <Controller
              control={control}
              name="keptCovered"
              render={({ field }) => (
                <Switch id="keptCovered" checked={!!field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
          <Field label="Current storage">
            <Controller
              control={control}
              name="storageCondition"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="refrigerated">Refrigerated</SelectItem>
                    <SelectItem value="hot_holding">Hot holding</SelectItem>
                    <SelectItem value="room_temperature">Room temperature</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Has the food already been served to guests?">
            <Controller
              control={control}
              name="previouslyServed"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                  {["yes", "no", "partially"].map((v) => (
                    <label key={v} className="flex items-center gap-1.5 text-sm capitalize">
                      <RadioGroupItem value={v} /> {v}
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
          </Field>
          <Field label="Any known contamination / spillage?">
            <Controller
              control={control}
              name="contaminationReported"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                  {["no", "yes", "unsure"].map((v) => (
                    <label key={v} className="flex items-center gap-1.5 text-sm capitalize">
                      <RadioGroupItem value={v} /> {v}
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
          </Field>
          <label className="flex items-start gap-2 text-sm">
            <Controller
              control={control}
              name="safetyAcknowledged"
              render={({ field }) => (
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} className="mt-0.5" />
              )}
            />
            I understand that volunteers may decline collection if the food appears unsuitable for redistribution.
          </label>
          {errors.safetyAcknowledged && (
            <p className="text-sm text-destructive">{errors.safetyAcknowledged.message}</p>
          )}
        </div>

        {/* Step 6: Deadline */}
        <div className={step === 5 ? "space-y-4" : "hidden"}>
          <Field label="Until what time can the food be collected?" error={errors.collectionDeadline?.message}>
            <Input type="datetime-local" {...register("collectionDeadline")} />
          </Field>
        </div>

        {/* Step 7: Packaging */}
        <div className={step === 6 ? "space-y-4" : "hidden"}>
          <Field label="Is the food already packed?">
            <Controller
              control={control}
              name="packedStatus"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completely_packed">Completely packed</SelectItem>
                    <SelectItem value="partially_packed">Partially packed</SelectItem>
                    <SelectItem value="not_packed">Not packed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          {(
            [
              ["containersAvailable", "Are containers available?"],
              ["disposablesAvailable", "Are disposable plates/bowls/spoons available?"],
              ["servingUtensilsAvailable", "Are serving utensils available?"],
            ] as const
          ).map(([name, label]) => (
            <Field key={name} label={label}>
              <Controller
                control={control}
                name={name}
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                    {["yes", "no", "some"].map((v) => (
                      <label key={v} className="flex items-center gap-1.5 text-sm capitalize">
                        <RadioGroupItem value={v} /> {v}
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>
          ))}
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="volunteersBringContainers">Will volunteers need to bring containers?</Label>
            <Controller
              control={control}
              name="volunteersBringContainers"
              render={({ field }) => (
                <Switch id="volunteersBringContainers" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
          <Field label="Notes (optional)">
            <Textarea rows={2} {...register("packagingNotes")} />
          </Field>
        </div>

        {/* Step 8: Transportation */}
        <div className={step === 7 ? "space-y-4" : "hidden"}>
          <Field label="Is transportation available from your side?">
            <Controller
              control={control}
              name="donorTransportAvailability"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-2">
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="yes_completely" /> Yes, completely</label>
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="partially" /> Partially</label>
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="no" /> No</label>
                </RadioGroup>
              )}
            />
          </Field>
          {donorTransport !== "no" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Vehicle type">
                <Input {...register("donorVehicleType")} />
              </Field>
              <Field label="Driver contact">
                <Input {...register("donorDriverContact")} />
              </Field>
              <Field label="How far can the vehicle travel (km)?">
                <Input type="number" {...register("donorVehicleRangeKm")} />
              </Field>
            </div>
          )}
          {donorTransport === "no" && (
            <Field label="Approximate load size">
              <Controller
                control={control}
                name="loadSize"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-2">
                    <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="small" /> Small — manageable by 1-2 people</label>
                    <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="medium" /> Medium — car recommended</label>
                    <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="large" /> Large — SUV/van recommended</label>
                    <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="very_large" /> Very large — commercial transport likely required</label>
                  </RadioGroup>
                )}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Recommended: {RECOMMENDED_VEHICLE[loadSize]} · Indicative estimate only: ₹{transportPreview.low}–₹{transportPreview.high}
              </p>
            </Field>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
            <ChevronLeft /> Back
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next <ChevronRight />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Submit request
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
