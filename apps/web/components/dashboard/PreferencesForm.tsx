'use client';

import { useMemo, useState } from 'react';
import type { Preference } from '@schemas/index';

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

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Preferences</h3>
        {status === 'saving' && <span className="text-xs text-slate-400">Saving...</span>}
        {status === 'saved' && <span className="text-xs text-cyan-300">Saved!</span>}
        {status === 'error' && <span className="text-xs text-red-300">Error</span>}
      </div>
      <div className="mt-4 space-y-6">
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
          <label className="text-xs uppercase tracking-wide text-slate-500">Favorite brands</label>
          <input
            type="text"
            value={favoriteBrandsText}
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
            placeholder="e.g. Maurten Gel 100\nSkratch Hydration Mix"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
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
          <p className="mt-2 text-[11px] text-slate-500">We use these toggles to bias Scenario Studio and kits.</p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Dietary flags</label>
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
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Target flavor diversity</label>
          <input
            type="number"
            min={1}
            max={5}
            value={prefs.targetFlavorDiversity}
            onChange={(event) => updatePreference('targetFlavorDiversity', Number(event.target.value))}
            className="mt-2 w-24 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Taste profile</label>
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
          <label className="mt-4 block text-xs uppercase tracking-wide text-slate-500">Texture notes</label>
          <input
            type="text"
            value={textureNotesText}
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
          <label className="text-xs uppercase tracking-wide text-slate-500">Carry profile</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] uppercase tracking-wide text-slate-500">Bottles</span>
              <input
                type="number"
                min={0}
                value={prefs.carryProfile.bottles}
                onChange={(e) => updatePreference('carryProfile', { bottles: Number(e.target.value || 0) })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wide text-slate-500">Soft flasks</span>
              <input
                type="number"
                min={0}
                value={prefs.carryProfile.softFlasks}
                onChange={(e) => updatePreference('carryProfile', { softFlasks: Number(e.target.value || 0) })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wide text-slate-500">Gel loops</span>
              <input
                type="number"
                min={0}
                value={prefs.carryProfile.gelLoops}
                onChange={(e) => updatePreference('carryProfile', { gelLoops: Number(e.target.value || 0) })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wide text-slate-500">Prefers vest</span>
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
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Favorite homemade supplementation</label>
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
            placeholder={"e.g. rice cakes\nDIY drink mix (maltodextrin + sodium)"}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
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
      </div>
    </div>
  );
}
