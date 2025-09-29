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

type PreferencesFormProps = {
  preference: Preference;
};

export default function PreferencesForm({ preference }: PreferencesFormProps) {
  const [prefs, setPrefs] = useState(preference);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basics']));
  const favoriteBrandsText = useMemo(() => prefs.favoriteBrands.join(', '), [prefs.favoriteBrands]);
  const bannedBrandsText = useMemo(() => prefs.bannedBrands.join(', '), [prefs.bannedBrands]);
  const preferredProductsText = useMemo(() => prefs.preferredProducts.join('\n'), [prefs.preferredProducts]);
  const textureNotesText = useMemo(() => prefs.tasteProfile.textureNotes.join(', '), [prefs.tasteProfile.textureNotes]);
  const homemadeText = useMemo(() => (prefs.homemadeSupplements ?? []).join('\n'), [prefs.homemadeSupplements]);

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
      <div className="rounded-2xl border border-slate-800/50 bg-slate-800/20">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors"
        >
          <div>
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            {description && (
              <p className="text-xs text-slate-400 mt-1">{description}</p>
            )}
          </div>
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-slate-400" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 pt-0 space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6" id="preferences">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-500/20 p-2">
            <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Preferences</h3>
            <p className="text-sm text-slate-400">Customize your fueling recommendations</p>
          </div>
        </div>
        <div className="text-right">
          {status === 'saving' && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400"></div>
              <span className="text-xs">Saving...</span>
            </div>
          )}
          {status === 'saved' && (
            <div className="flex items-center gap-2 text-cyan-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Saved!</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Error</span>
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
            <label className="text-xs uppercase tracking-wide text-slate-500">Caffeine sensitivity</label>
            <div className="mt-2 flex gap-2">
              {caffeineOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updatePreference('caffeineSensitivity', option)}
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-wide ${
                    prefs.caffeineSensitivity === option
                      ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white'
                      : 'border border-slate-700 text-slate-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Sodium sensitivity</label>
            <div className="mt-2 flex gap-2">
              {sodiumOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updatePreference('sodiumSensitivity', option)}
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-wide ${
                    prefs.sodiumSensitivity === option
                      ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white'
                      : 'border border-slate-700 text-slate-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Supplementation style</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updatePreference('prefersEnergyDrink', !prefs.prefersEnergyDrink)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-wide ${
                  prefs.prefersEnergyDrink
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white'
                    : 'border border-slate-700 text-slate-300'
                }`}
              >
                {prefs.prefersEnergyDrink ? 'Energy drinks: yes' : 'Energy drinks: no'}
              </button>
              <button
                type="button"
                onClick={() => updatePreference('usesGels', !prefs.usesGels)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-wide ${
                  prefs.usesGels
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white'
                    : 'border border-slate-700 text-slate-300'
                }`}
              >
                {prefs.usesGels ? 'Gels: yes' : 'Gels: no'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">These settings help bias product recommendations.</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Dietary restrictions</label>
            <div className="mt-2 flex flex-wrap gap-2">
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
                    className={`rounded-full px-3 py-2 text-xs uppercase tracking-wide ${
                      checked
                        ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white'
                        : 'border border-slate-700 text-slate-300'
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
            <label className="text-xs uppercase tracking-wide text-slate-500">Favorite brands</label>
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
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Banned brands</label>
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
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Preferred products</label>
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
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="taste"
          title="Taste & Texture"
          description="Flavor preferences and texture notes"
        >
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Flavor preferences</label>
            <div className="mt-2 flex flex-wrap gap-2">
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
                  className={`rounded-full px-3 py-2 text-xs uppercase tracking-wide ${
                    prefs.tasteProfile[key as keyof typeof prefs.tasteProfile]
                      ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white'
                      : 'border border-slate-700 text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Texture notes</label>
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
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Target flavor variety</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={5}
                value={prefs.targetFlavorDiversity}
                onChange={(event) => updatePreference('targetFlavorDiversity', Number(event.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-white min-w-0">
                {prefs.targetFlavorDiversity} flavor{prefs.targetFlavorDiversity !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">How many different flavors to include in kits</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="gear"
          title="Gear & Carrying"
          description="How you carry nutrition during events"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-500">Bottles</span>
              <input
                type="number"
                min={0}
                value={prefs.carryProfile.bottles}
                onChange={(e) => updatePreference('carryProfile', { bottles: Number(e.target.value || 0) })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-500">Soft flasks</span>
              <input
                type="number"
                min={0}
                value={prefs.carryProfile.softFlasks}
                onChange={(e) => updatePreference('carryProfile', { softFlasks: Number(e.target.value || 0) })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-500">Gel loops</span>
              <input
                type="number"
                min={0}
                value={prefs.carryProfile.gelLoops}
                onChange={(e) => updatePreference('carryProfile', { gelLoops: Number(e.target.value || 0) })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-500">Uses vest</span>
              <button
                type="button"
                onClick={() => updatePreference('carryProfile', { prefersVest: !prefs.carryProfile.prefersVest })}
                className={`mt-1 w-full rounded-full px-4 py-2 text-xs uppercase tracking-wide ${
                  prefs.carryProfile.prefersVest
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white'
                    : 'border border-slate-700 text-slate-300'
                }`}
              >
                {prefs.carryProfile.prefersVest ? 'Yes' : 'No'}
              </button>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="advanced"
          title="Advanced Settings"
          description="Event templates and homemade supplements"
        >
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Default event template</label>
            <select
              value={prefs.defaultEventTemplate}
              onChange={(e) => updatePreference('defaultEventTemplate', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {eventTemplates.map((tpl) => (
                <option key={tpl} value={tpl}>
                  {tpl.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Homemade supplements</label>
            <textarea
              rows={3}
              value={homemadeText}
              onChange={(event) =>
                updatePreference(
                  'homemadeSupplements',
                  event.target.value
                    .split(/\n|,/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              placeholder={"e.g. rice cakes&#10;DIY drink mix (maltodextrin + sodium)"}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
