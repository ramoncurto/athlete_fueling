'use client';

import type { Athlete, Event } from '@schemas/index';

type DashboardHeroProps = {
  athlete: Athlete;
  subscribed: boolean;
  trackedEventsCount: number;
  nextEvent?: Event;
  allAthletes: Athlete[];
  locale: string;
};

const formatEventDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};

const getDaysUntil = (iso: string) => {
  const eventDate = new Date(iso);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Past event';
  if (diffDays === 0) return 'Today!';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays} days`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${Math.ceil(diffDays / 30)} months`;
};

export default function DashboardHero({
  athlete,
  subscribed,
  trackedEventsCount,
  nextEvent,
  allAthletes,
  locale
}: DashboardHeroProps) {
  const firstName = athlete.firstName || 'Athlete';
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 blur-2xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Good {timeOfDay}, {firstName}! 👋
            </h1>
            <p className="mt-2 text-lg text-slate-300">
              Ready to optimize your fueling strategy?
            </p>
          </div>

          {!subscribed && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">⚡</span>
                <span className="text-sm font-medium text-amber-200">Demo Mode</span>
              </div>
              <p className="mt-1 text-xs text-amber-300/80">
                Upgrade to unlock full features
              </p>
              <a
                href={`/${locale}/checkout/annual`}
                className="mt-2 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                Upgrade for $20/year
              </a>
            </div>
          )}
        </div>

        {/* Stats & Quick Info */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Events Tracked */}
          <div className="rounded-2xl bg-slate-800/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-cyan-500/20 p-2">
                <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{trackedEventsCount}</p>
                <p className="text-sm text-slate-400">Events planned</p>
              </div>
            </div>
          </div>

          {/* Next Event */}
          {nextEvent && (
            <div className="rounded-2xl bg-slate-800/50 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-500/20 p-2">
                  <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-white truncate">{nextEvent.name}</p>
                  <p className="text-sm text-slate-400">
                    {formatEventDate(nextEvent.startTimeIso)} • {getDaysUntil(nextEvent.startTimeIso)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Status */}
          <div className="rounded-2xl bg-slate-800/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${subscribed ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
                {subscribed ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  {subscribed ? 'Pro' : 'Demo'}
                </p>
                <p className="text-sm text-slate-400">
                  {subscribed ? 'Full access' : 'Limited features'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-athlete selector (if applicable) */}
        {allAthletes.length > 1 && (
          <div className="mt-6 rounded-2xl bg-slate-800/30 p-4">
            <form method="get" className="flex flex-wrap items-center gap-3">
              <label htmlFor="athleteId" className="text-sm font-medium text-slate-300">
                Viewing as:
              </label>
              <select
                id="athleteId"
                name="athleteId"
                defaultValue={athlete.id}
                className="rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {allAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500 transition-colors"
              >
                Switch
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}