import PreferencesForm from '../PreferencesForm';
import type { Preference } from '@schemas/index';

type PreferencesSectionProps = {
  preference: Preference;
};

export default function PreferencesSection({ preference }: PreferencesSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Fueling Preferences</h2>
        <p className="text-slate-400">
          Customize your nutrition preferences to get personalized product recommendations and race plans.
          These settings directly influence the Scenario Studio and Kit Builder suggestions.
        </p>
      </div>

      <PreferencesForm preference={preference} />
    </div>
  );
}