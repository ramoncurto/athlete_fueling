import Link from "next/link";

const heroHighlights = [
  { title: "Scenario Studio", description: "Model 2-6 fueling plans with guardrails and Monte Carlo risk." },
  { title: "Athlete Dashboard", description: "Persist preferences, kits, and supplementation logs for trust." },
  { title: "Shoppable Kits", description: "Translate winning plans into value and premium kits with deep links." },
];

const steps = [
  {
    title: "Preview & Capture",
    description: "Start with the Fuel Calculator, educate, and capture the lead with a teaser PDF.",
  },
  {
    title: "Scenario Studio",
    description: "Compare hot vs cool, high vs steady carb, caffeine ladders, and logistics in minutes.",
  },
  {
    title: "Plan, Kit, Debrief",
    description: "Download deterministic PDFs, send the kit cart, and update dashboard history weekly.",
  },
];

const testimonials = [
  {
    name: "Coach Maya",
    role: "Dockia Sports Performance",
    quote:
      "Athletic Fuel turned our spreadsheets into a dependable funnel. Athletes trust the guardrails, and we instantly monetize the plan with kits.",
  },
  {
    name: "Ethan",
    role: "70.3 Age Grouper",
    quote: "The dashboard remembers my caffeine ceiling and favorite flavors so every race kit just works.",
  },
];

export default function LocaleHomePage() {
  return (
    <div className="space-y-20">
      <section className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Offline-friendly and Vercel ready
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Fueling plans that respect biology, logistics, and conversion.
          </h1>
          <p className="text-lg text-slate-300">
            Athletic Fuel helps endurance athletes and coaches design safe fueling scenarios, compare strategies, and turn
            winners into shoppable kits while updating a living preference profile.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="./plan/scenarios"
              className="rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30"
            >
              Explore Scenario Studio
            </Link>
            <Link
              href="./tools/fuel-calculator"
              className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500"
            >
              Try the Fuel Calculator
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {heroHighlights.map((highlight) => (
              <div key={highlight.title} className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
                <p className="text-sm font-semibold text-cyan-300">{highlight.title}</p>
                <p className="mt-2 text-sm text-slate-300">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-2xl shadow-cyan-500/10">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Race Week Snapshot</h2>
              <p className="text-sm text-slate-400">Pinned from Athlete Dashboard</p>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="font-semibold text-cyan-200">NYC Marathon</p>
                <p className="text-xs text-slate-400">Safe scenario: 0.22 GI risk, 86 raceability</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="font-semibold text-amber-200">Hot contingency</p>
                <p className="text-xs text-slate-400">Plan B hydration and sodium adjustments ready.</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm">
              <p className="font-semibold text-slate-200">Kit Builder</p>
              <p className="text-xs text-slate-400">Value kit: $40.20 - Premium kit: $29.60</p>
              <p className="mt-2 text-xs text-slate-500">
                Links ready for Maurten, Skratch, and Precision Hydration carts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8">
        <h2 className="text-2xl font-semibold text-white">Offline-safe, conversion-first workflow</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-sm font-semibold text-cyan-300">{step.title}</p>
              <p className="mt-3 text-sm text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Athlete Dashboard unlocks retention</h2>
          <p className="text-sm text-slate-300">
            Preferences pre-fill the Scenario Studio, compliance logs feed weekly debriefs, and instant re-order links keep
            lifetime value compounding. The dashboard is async-first and perfect for Vercel deployments.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>- AI-assisted preference merge and guardrails enforcement.</li>
            <li>- Export-ready history (JSON/CSV) with privacy controls.</li>
            <li>- &quot;Plan again like last time&quot; shortcut with today&apos;s route and weather.</li>
          </ul>
        </div>
        <div className="space-y-4 rounded-3xl border border-slate-800/70 bg-slate-900/50 p-6">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <blockquote className="text-sm text-slate-200">{testimonial.quote}</blockquote>
              <figcaption className="mt-3 text-xs uppercase tracking-wide text-slate-400">
                {testimonial.name} - {testimonial.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
