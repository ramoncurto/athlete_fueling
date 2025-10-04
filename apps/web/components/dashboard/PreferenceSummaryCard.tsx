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
        className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-cyan-700"
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
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      id="preference-summary"
      aria-labelledby="preference-summary-title"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id="preference-summary-title" className="text-base font-bold text-gray-900">
            Your Fueling Profile
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Auto-applied to all plans
          </p>
        </div>
        <a
          href="#preferences"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:border-cyan-500 hover:text-cyan-600"
        >
          Edit
        </a>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <dt className="text-xs font-semibold text-gray-700">Diet & Brands</dt>
          {renderChipRow([...dietChips.slice(0, 3), ...brandChips.slice(0, 2)])}
        </div>

        <div className="space-y-2">
          <dt className="text-xs font-semibold text-gray-700">Fueling Style</dt>
          <p className="text-sm text-gray-700">{fuelHighlights[0]}</p>
        </div>

        <div className="space-y-2">
          <dt className="text-xs font-semibold text-gray-700">Caffeine & Carry</dt>
          <p className="text-sm text-gray-700">{caffeineCopy[summary.caffeine].split(' - ')[0]}</p>
          <div className="flex flex-wrap gap-1.5">
            {carryChips.slice(0, 3).map((chip) => (
              <span key={chip} className="text-xs text-gray-600">• {chip}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
