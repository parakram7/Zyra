import Link from "next/link";
import {
  ArrowRight, Radio, Users, Truck, MapPinned, BarChart3, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const STEPS = [
  { title: "Tell us what food is available", body: "A quick form covering quantity, timing, packaging and transport needs." },
  { title: "Volunteers coordinate pickup", body: "Nearby Robins claim the call, form a team, and arrange transport." },
  { title: "Food is collected", body: "A trained volunteer records a field assessment before collection." },
  { title: "Volunteers distribute it", body: "Meals reach a community, and the rescue is logged for the record." },
];

const HIGHLIGHTS = [
  { icon: Radio, label: "Real-time food calls" },
  { icon: Users, label: "Volunteer coordination" },
  { icon: Truck, label: "Transport planning" },
  { icon: MapPinned, label: "Pickup information" },
  { icon: BarChart3, label: "Impact tracking" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <span className="text-lg font-semibold tracking-tight">RescueLink</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Volunteer Login</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-8 sm:py-20">
          <p className="mb-3 text-sm font-medium text-primary">
            Pilot coordination platform for volunteer food rescue networks.
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Good food shouldn&apos;t go to waste.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground sm:text-lg">
            RescueLink helps volunteer teams coordinate surplus-food pickups quickly — from donation call to distribution.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/donate">
                Donate Surplus Food <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Volunteer Login</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/30 px-4 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-xl border bg-card p-5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {i + 1}
                  </span>
                  <p className="mt-3 font-medium">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Built for real coordination</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {HIGHLIGHTS.map((h) => (
                <div key={h.label} className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
                  <h.icon className="size-4 text-primary" />
                  {h.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t px-4 py-14 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <ClipboardList className="mx-auto mb-3 size-6 text-muted-foreground" />
            <p className="text-muted-foreground">
              Currently being developed for a Jaipur pilot with volunteer food-rescue teams. This is an
              independent project and does not imply official partnership with any organisation.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground sm:px-8">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <span>RescueLink — surplus food. Faster coordination. More meals rescued.</span>
          <Link href="/disclaimer" className="hover:underline">
            Disclaimer &amp; safety notice
          </Link>
        </div>
      </footer>
    </div>
  );
}
