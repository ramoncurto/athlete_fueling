import { summarizePreference } from "@/lib/preferences";
import type { Preference } from "@schemas/index";

const caffeineCopy: Record<Preference["caffeineSensitivity"], string> = {
  low: "Low caffeine tolerance - keep hits light and earlier in the race.",
  medium: "Moderate caffeine use - steady boosts are usually well tolerated.",
  high: "High tolerance - ok layering bigger late-race caffeine hits.",
};

const buildCarryChips = (preference: ReturnType<typeof summarizePreference>["carry"]) => {
  const items = [
    preference.bottles ? `${preference.bottles} bottle${preference.bottles === 1 ? "" : "s"}` : null,
    preference.softFlasks ? `${preference.softFlasks} soft flask${preference.softFlasks === 1 ? "" : "s"}` : null,
    preference.gelLoops ? `${preference.gelLoops} gel loop${preference.gelLoops === 1 ? "" : "s"}` : null,
    preference.prefersVest ? "race vest" : null,
  ].filter(Boolean) as string[];

  return items.length ? items : ["No carry gear saved yet"];
};

const renderChipRow = (values: string[]) => (
  <div className="flex flex-wrap gap-2">
    {values.map((value) => (
      <span
        key={value}
        className="rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-200"
      >
        {value}
      </span>
    ))}
  </div>
);

type PreferenceSummaryCardProps = {
  preference: Preference;
};

export default function PreferenceSummaryCard({ preference }: PreferenceSummaryCardProps) {
  const summary = summarizePreference(preference);
  const dietChips = summary.diet.length ? summary.diet : ["No dietary flags"];
  const flavorChips = summary.flavorNotes.length ? summary.flavorNotes : ["Balanced palate"];
  const brandChips = summary.brandBias.length ? summary.brandBias : ["Open to any brand"];
  const bannedChips = summary.bannedBrands.length
    ? summary.bannedBrands.map((brand) => `Avoid ${brand}`)
    : ["No banned brands"];
  const fuelHighlights = [
    summary.fuelStyle === "energy_drink" ? "Energy drink forward" : "Water + solids focus",
    summary.gels ? "Gels in rotation" : "Prefers chews or solids",
    preference.homemadeSupplements.length ? `Homemade: ${preference.homemadeSupplements.join(", ")}` : "Store-bought primary",
  ];
  const carryChips = buildCarryChips(summary.carry);

  return (
    <section
      className="rounded-3xl border border-slate-800/50 bg-slate-900/30 p-6 text-slate-200 shadow-[0_25px_70px_-35px_rgba(8,47,73,0.65)]"
      id="preference-summary"
      aria-labelledby="preference-summary-title"
    >
      <div className="mb-6 space-y-1">
        <p className="text-xs uppercase tracking-wide text-cyan-300/80">Fueling Snapshot</p>
        <h2 id="preference-summary-title" className="text-xl font-semibold text-white">
          Preferences at a glance
        </h2>
        <p className="text-sm text-slate-400">
          We auto-apply this profile in the Scenario Studio, Kit Builder, and gut training guides so plans stay personal.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <dl className="space-y-4">
          <div className="space-y-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Diet focus</dt>
            {renderChipRow(dietChips)}
            <p className="text-xs text-slate-400">Flavor notes: {flavorChips.join(" / ")}</p>
          </div>

          <div className="space-y-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Brand stance</dt>
            {renderChipRow(brandChips)}
            <p className="text-xs text-slate-400">{bannedChips.join(", ")}</p>
          </div>
        </dl>

        <dl className="space-y-4">
          <div className="space-y-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Fueling style</dt>
            <ul className="space-y-1 text-sm text-slate-100">
              {fuelHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Caffeine & carry</dt>
            <p className="text-sm text-slate-100">{caffeineCopy[summary.caffeine]}</p>
            {renderChipRow(carryChips)}
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-400">
          Keep this section up to date to get better scenario recommendations and kit picks.
        </p>
        <a
          href="#preferences"
          className="inline-flex items-center justify-center rounded-full border border-cyan-500 px-4 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-400 hover:text-cyan-100"
        >
          Update preferences
        </a>
      </div>
    </section>
  );
}
