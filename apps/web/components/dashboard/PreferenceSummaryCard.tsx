import { summarizePreference } from '@/lib/preferences';
import type { Preference } from '@schemas/index';

const caffeineCopy: Record<Preference['caffeineSensitivity'], string> = {
  low: 'Low caffeine tolerance — keep hits light and earlier in the race.',
  medium: 'Moderate caffeine use — steady boosts are usually well tolerated.',
  high: 'High tolerance — ok layering bigger late-race caffeine hits.',
};

const formatCarryProfile = (preference: ReturnType<typeof summarizePreference>['carry']) => {
  const items = [
    preference.bottles ? `${preference.bottles} bottle${preference.bottles === 1 ? '' : 's'}` : null,
    preference.softFlasks ? `${preference.softFlasks} soft flask${preference.softFlasks === 1 ? '' : 's'}` : null,
    preference.gelLoops ? `${preference.gelLoops} gel loop${preference.gelLoops === 1 ? '' : 's'}` : null,
    preference.prefersVest ? 'prefers race vest' : null,
  ].filter(Boolean);

  return items.length ? items.join(' · ') : 'No carry gear saved yet';
};

type PreferenceSummaryCardProps = {
  preference: Preference;
};

export default function PreferenceSummaryCard({ preference }: PreferenceSummaryCardProps) {
  const summary = summarizePreference(preference);
  const flavorPalette = summary.flavorNotes.length
    ? summary.flavorNotes.join(' · ')
    : 'Balanced palate';
  const dietLine = summary.diet.length ? summary.diet.join(' · ') : 'No dietary flags';
  const brandLine = summary.brandBias.length
    ? summary.brandBias.join(', ')
    : 'Open to any brand';
  const bannedLine = summary.bannedBrands.length
    ? `Avoids: ${summary.bannedBrands.join(', ')}`
    : 'No banned brands';
  const fuelStyle = summary.fuelStyle === 'energy_drink' ? 'Energy drink + mix focused' : 'Water + solids focused';
  const gelCopy = summary.gels ? 'Gels are in the rotation' : 'Prefers chews or solids over gels';
  const homemadeCopy = preference.homemadeSupplements.length
    ? `Homemade favorites: ${preference.homemadeSupplements.join(', ')}`
    : 'Primarily store-bought fueling';

  return (
    <section
      className="rounded-3xl border border-slate-800/50 bg-slate-900/30 p-6 text-slate-200 shadow-[0_25px_70px_-35px_rgba(8,47,73,0.65)]"
      id="preference-summary"
      aria-labelledby="preference-summary-title"
    >
      <div className="mb-4 space-y-1">
        <p className="text-xs uppercase tracking-wide text-cyan-300/80">Fueling Snapshot</p>
        <h2 id="preference-summary-title" className="text-xl font-semibold text-white">
          Preferences at a glance
        </h2>
        <p className="text-sm text-slate-400">
          We auto-apply these choices in the Scenario Studio, Kit Builder, and gut training guides.
        </p>
      </div>

      <dl className="space-y-4 text-sm">
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Diet & Flavor</dt>
          <dd className="text-slate-100">{dietLine}</dd>
          <dd className="text-slate-400">Flavor notes: {flavorPalette}</dd>
        </div>

        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Brands</dt>
          <dd className="text-slate-100">{brandLine}</dd>
          <dd className="text-slate-400">{bannedLine}</dd>
        </div>

        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Fuel Mix</dt>
          <dd className="text-slate-100">{fuelStyle}</dd>
          <dd className="text-slate-400">{gelCopy}</dd>
          <dd className="text-slate-400">{homemadeCopy}</dd>
        </div>

        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Caffeine & Carry</dt>
          <dd className="text-slate-100">{caffeineCopy[summary.caffeine]}</dd>
          <dd className="text-slate-400">{formatCarryProfile(summary.carry)}</dd>
        </div>
      </dl>
    </section>
  );
}
