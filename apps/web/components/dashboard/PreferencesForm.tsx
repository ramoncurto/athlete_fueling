'use client';

import { useMemo, useState } from 'react';
import type { Preference } from '@schemas/index';

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const caffeineOptions: Preference['caffeineSensitivity'][] = ['low', 'medium', 'high'];
const sodiumOptions: Preference['sodiumSensitivity'][] = ['low', 'medium', 'high'];
const dietaryFlags: Preference['dietaryFlags'][number][] = ['vegan', 'vegetarian', 'gluten_free', 'dairy_free', 'nut_allergy', 'soy_allergy'];
const eventTemplates = ['road_cool', 'road_hot', 'trail_hot', 'trail_cool', 'custom'] as const;

const commonHomemadeSupplements = [
  'Rice cakes',
  'Potato balls',
  'Energy balls',
  'Banana bread',
  'Homemade gels',
  'Date bars',
  'Sweet potato mash',
  'Peanut butter sandwiches',
  'DIY drink mix',
  'Maple syrup packets',
];

type PreferencesFormProps = {
  preference: Preference;
};

export default function PreferencesForm({ preference }: PreferencesFormProps) {
  const [prefs, setPrefs] = useState(preference);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basics']));
  const [customHomemade, setCustomHomemade] = useState('');
  const favoriteBrandsText = useMemo(() => prefs.favoriteBrands.join(', '), [prefs.favoriteBrands]);
  const bannedBrandsText = useMemo(() => prefs.bannedBrands.join(', '), [prefs.bannedBrands]);
  const preferredProductsText = useMemo(() => prefs.preferredProducts.join('\n'), [prefs.preferredProducts]);
  const textureNotesText = useMemo(() => prefs.tasteProfile.textureNotes.join(', '), [prefs.tasteProfile.textureNotes]);

  type PreferencePatchValue =
  | Preference[keyof Preference]
  | Partial<Preference['tasteProfile']>
  | Partial<Preference['carryProfile']>;

  const updatePreference = async (key: keyof Preference, value: PreferencePatchValue) => {
    setPrefs((prev) => {
      if (key === 'tasteProfile') {
        return {
          ...prev,
          tasteProfile: {
            ...prev.tasteProfile,
            ...(value as Partial<Preference['tasteProfile']>),
          },
        };
      }
      if (key === 'carryProfile') {
        return {
          ...prev,
          carryProfile: {
            ...prev.carryProfile,
            ...(value as Partial<Preference['carryProfile']>),
          },
        };
      }
      return { ...prev, [key]: value } as Preference;
    });
    setStatus('saving');
    try {
      const response = await fetch(`/api/preferences/${preference.athleteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!response.ok) {
        throw new Error('Update failed');
      }
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const toggleHomemadeSupplement = (supplement: string) => {
    const current = prefs.homemadeSupplements ?? [];
    const next = current.includes(supplement)
      ? current.filter(s => s !== supplement)
      : [...current, supplement];
    updatePreference('homemadeSupplements', next);
  };

  const addCustomHomemade = () => {
    if (!customHomemade.trim()) return;
    const current = prefs.homemadeSupplements ?? [];
    if (!current.includes(customHomemade.trim())) {
      updatePreference('homemadeSupplements', [...current, customHomemade.trim()]);
    }
    setCustomHomemade('');
  };

  const removeHomemadeSupplement = (supplement: string) => {
    const current = prefs.homemadeSupplements ?? [];
    updatePreference('homemadeSupplements', current.filter(s => s !== supplement));
  };

  const CollapsibleSection = ({
    id,
    title,
    description,
    children
  }: {
    id: string;
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <div>
            <h4 className="text-base font-bold text-gray-900">{title}</h4>
            {description && (
              <p className="text-sm text-gray-600 mt-0.5">{description}</p>
            )}
          </div>
          {isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
          )}
        </button>
        {isExpanded && (
          <div className="px-5 pb-5 pt-1 space-y-5 bg-gradient-to-b from-gray-50/50 to-white">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4" id="preferences">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2.5">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Preferences</h3>
            <p className="text-sm text-gray-600">Customize your fueling recommendations</p>
          </div>
        </div>
        <div className="text-right">
          {status === 'saving' && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600"></div>
              <span className="text-sm font-medium">Saving...</span>
            </div>
          )}
          {status === 'saved' && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold">Saved!</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold">Error</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <CollapsibleSection
          id="basics"
          title="Sensitivity & Supplements"
          description="Core preferences that affect all recommendations"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Caffeine sensitivity</label>
            <div className="flex gap-2">
              {caffeineOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updatePreference('caffeineSensitivity', option)}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all ${
                    prefs.caffeineSensitivity === option
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Sodium sensitivity</label>
            <div className="flex gap-2">
              {sodiumOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updatePreference('sodiumSensitivity', option)}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all ${
                    prefs.sodiumSensitivity === option
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Supplementation style</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updatePreference('prefersEnergyDrink', !prefs.prefersEnergyDrink)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-all ${
                  prefs.prefersEnergyDrink
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {prefs.prefersEnergyDrink ? 'Energy drinks: yes' : 'Energy drinks: no'}
              </button>
              <button
                type="button"
                onClick={() => updatePreference('usesGels', !prefs.usesGels)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-all ${
                  prefs.usesGels
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {prefs.usesGels ? 'Gels: yes' : 'Gels: no'}
              </button>
            </div>
            <p className="mt-2.5 text-xs text-gray-600">These settings help bias product recommendations.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Dietary restrictions</label>
            <div className="flex flex-wrap gap-2">
              {dietaryFlags.map((flag) => {
                const checked = prefs.dietaryFlags.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => {
                      const next = checked
                        ? prefs.dietaryFlags.filter((f) => f !== flag)
                        : [...prefs.dietaryFlags, flag];
                      updatePreference('dietaryFlags', next);
                    }}
                    className={`rounded-lg px-3.5 py-2 text-xs font-medium uppercase tracking-wide transition-all ${
                      checked
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {flag.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="brands"
          title="Brand Preferences"
          description="Favorite and banned brands for kit building"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Favorite brands</label>
            <input
              type="text"
              value={favoriteBrandsText}
              placeholder="e.g. Maurten, Skratch, SiS"
              onChange={(event) =>
                updatePreference(
                  'favoriteBrands',
                  event.target.value
                    .split(',')
                    .map((brand) => brand.trim())
                    .filter(Boolean),
                )}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Banned brands</label>
            <input
              type="text"
              value={bannedBrandsText}
              placeholder="Brands to avoid in recommendations"
              onChange={(event) =>
                updatePreference(
                  'bannedBrands',
                  event.target.value
                    .split(',')
                    .map((brand) => brand.trim())
                    .filter(Boolean),
                )}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Preferred products</label>
            <textarea
              rows={3}
              value={preferredProductsText}
              onChange={(event) =>
                updatePreference(
                  'preferredProducts',
                  event.target.value
                    .split(/\n|,/)
                    .map((product) => product.trim())
                    .filter(Boolean),
                )
              }
              placeholder="e.g. Maurten Gel 100&#10;Skratch Hydration Mix"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all resize-none"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="taste"
          title="Taste & Texture"
          description="Flavor preferences and texture notes"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Flavor preferences</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'prefersSweet', label: 'Sweet' },
                { key: 'prefersSalty', label: 'Salty' },
                { key: 'prefersCitrus', label: 'Citrus' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    updatePreference('tasteProfile', {
                      [key]: !prefs.tasteProfile[key as keyof typeof prefs.tasteProfile],
                    })
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all ${
                    prefs.tasteProfile[key as keyof typeof prefs.tasteProfile]
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Texture notes</label>
            <input
              type="text"
              value={textureNotesText}
              placeholder="e.g. thick, smooth, gritty"
              onChange={(event) =>
                updatePreference(
                  'tasteProfile',
                  {
                    textureNotes: event.target.value
                      .split(',')
                      .map((n) => n.trim())
                      .filter(Boolean),
                  },
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Target flavor variety</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={5}
                value={prefs.targetFlavorDiversity}
                onChange={(event) => updatePreference('targetFlavorDiversity', Number(event.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <span className="text-base font-bold text-gray-900 min-w-[4rem] text-center">
                {prefs.targetFlavorDiversity} flavor{prefs.targetFlavorDiversity !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-600">How many different flavors to include in kits</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="gear"
          title="Gear & Carrying"
          description="How you carry nutrition during events"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Bottles</label>
              <input
                type="number"
                min={0}
                value={prefs.carryProfile.bottles}
                onChange={(e) => updatePreference('carryProfile', { bottles: Number(e.target.value || 0) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Soft flasks</label>
              <input
                type="number"
                min={0}
                value={prefs.carryProfile.softFlasks}
                onChange={(e) => updatePreference('carryProfile', { softFlasks: Number(e.target.value || 0) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Gel loops</label>
              <input
                type="number"
                min={0}
                value={prefs.carryProfile.gelLoops}
                onChange={(e) => updatePreference('carryProfile', { gelLoops: Number(e.target.value || 0) })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Uses vest</label>
              <button
                type="button"
                onClick={() => updatePreference('carryProfile', { prefersVest: !prefs.carryProfile.prefersVest })}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all ${
                  prefs.carryProfile.prefersVest
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {prefs.carryProfile.prefersVest ? 'Yes' : 'No'}
              </button>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="homemade"
          title="Homemade Supplements"
          description="Custom nutrition you make yourself"
        >
          <div>
            {/* Common options */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Select common options:</p>
              <div className="flex flex-wrap gap-2">
                {commonHomemadeSupplements.map((supplement) => {
                  const isSelected = (prefs.homemadeSupplements ?? []).includes(supplement);
                  return (
                    <button
                      key={supplement}
                      type="button"
                      onClick={() => toggleHomemadeSupplement(supplement)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {supplement}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom input */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Add custom supplement:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHomemade}
                  onChange={(e) => setCustomHomemade(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomHomemade();
                    }
                  }}
                  placeholder="e.g. Homemade energy bars"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={addCustomHomemade}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected items */}
            {(prefs.homemadeSupplements ?? []).length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">Selected supplements:</p>
                <div className="flex flex-wrap gap-2">
                  {(prefs.homemadeSupplements ?? []).map((supplement) => (
                    <div
                      key={supplement}
                      className="inline-flex items-center gap-2 rounded-lg bg-cyan-50 border border-cyan-200 px-3 py-1.5 text-sm text-cyan-900"
                    >
                      <span className="font-medium">{supplement}</span>
                      <button
                        type="button"
                        onClick={() => removeHomemadeSupplement(supplement)}
                        className="text-cyan-700 hover:text-cyan-900 transition-colors"
                        aria-label={`Remove ${supplement}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="advanced"
          title="Advanced Settings"
          description="Event templates and other settings"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Default event template</label>
            <select
              value={prefs.defaultEventTemplate}
              onChange={(e) => updatePreference('defaultEventTemplate', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
            >
              {eventTemplates.map((tpl) => (
                <option key={tpl} value={tpl}>
                  {tpl.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
