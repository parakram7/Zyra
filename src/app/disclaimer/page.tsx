import Link from "next/link";

export const metadata = { title: "Disclaimer & safety notice — RescueLink" };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← RescueLink
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Disclaimer &amp; safety notice</h1>

      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          RescueLink is a <strong className="text-foreground">coordination tool</strong>. It helps volunteers see
          surplus-food calls, organise pickups, and record what happened. It does not itself collect, transport,
          inspect, or distribute food — volunteers do, using their own judgement.
        </p>

        <div>
          <h2 className="mb-1 font-medium text-foreground">Food safety</h2>
          <p>
            RescueLink does not certify that any donation is safe to collect or eat, and no feature in this app
            performs food-safety testing. What volunteers record on the field assessment screen is a{" "}
            <strong className="text-foreground">volunteer field assessment</strong> — a structured personal
            observation, not a food-safety certification. Volunteers may, and should, decline to collect food that
            appears unsuitable, regardless of what a donor has stated.
          </p>
        </div>

        <div>
          <h2 className="mb-1 font-medium text-foreground">Transportation estimates</h2>
          <p>
            Any transport cost or vehicle recommendation shown in the app is an{" "}
            <strong className="text-foreground">indicative estimate only</strong>, calculated from configurable
            assumptions set by the chapter. It is not a live quote, and RescueLink does not guarantee pricing or
            availability from any third-party transport provider.
          </p>
        </div>

        <div>
          <h2 className="mb-1 font-medium text-foreground">No official partnership implied</h2>
          <p>
            RescueLink is currently an independent pilot project. Mentioning a volunteer network or chapter in this
            app does not imply that organisation officially owns, endorses, or operates this software.
          </p>
        </div>

        <div>
          <h2 className="mb-1 font-medium text-foreground">Data &amp; privacy</h2>
          <p>
            Phone numbers and other personal contact details are shared only where operationally necessary —
            for example, with volunteers coordinating a specific pickup. The public tracking page never shows
            volunteer phone numbers, internal notes, or donor trust flags.
          </p>
        </div>
      </div>
    </div>
  );
}
