"use client";

import type { Athlete, Event } from "@schemas/index";

type DashboardHeroProps = {
  athlete: Athlete;
  subscribed: boolean;
  trackedEventsCount: number;
  nextEvent?: Event;
  allAthletes: Athlete[];
  locale: string;
};

const disciplineCopy: Record<Event["discipline"], string> = {
  road_marathon: "Road marathon",
  half_ironman: "70.3 triathlon",
  ultra_run: "Ultra run",
  trail_ultra: "Trail ultra",
  cycling: "Cycling event",
};

const formatEventDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

const getDaysUntil = (iso: string) => {
  const eventDate = new Date(iso);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Past event";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays} days`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${Math.ceil(diffDays / 30)} months`;
};

type CountdownMeta = {
  label: string;
  recommendation: string;
  accentClass: string;
  progress: number;
  daysRemaining: number;
};

const getEventCountdownMeta = (iso: string): CountdownMeta | null => {
  const eventDate = new Date(iso);
  if (Number.isNaN(eventDate.getTime())) {
    return null;
  }
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const windowDays = 45;
  const baseProgress = diffDays <= 0 ? 100 : ((windowDays - diffDays) / windowDays) * 100;
  const progress = Math.max(0, Math.min(100, baseProgress));

  let label = "Base phase";
  let recommendation = "Log long runs with fueling rehearsals to build tolerance.";
  let accentClass = "bg-cyan-500";

  if (diffDays <= 0) {
    label = "Event completed";
    recommendation = "Capture intake notes and flag wins while the race is fresh.";
    accentClass = "bg-emerald-500";
  } else if (diffDays <= 3) {
    label = "Race week";
    recommendation = "Lock your final scenario and prep bottles in Kit Builder.";
    accentClass = "bg-rose-500";
  } else if (diffDays <= 10) {
    label = "Final tune-up";
    recommendation = "Run a gut training dress rehearsal and confirm product pickup.";
    accentClass = "bg-amber-500";
  } else if (diffDays <= 21) {
    label = "Build phase";
    recommendation = "Dial high-carb fueling on key workouts and compare alternate scenarios.";
    accentClass = "bg-sky-500";
  }

  return {
    label,
    recommendation,
    accentClass,
    progress,
    daysRemaining: diffDays,
  };
};

export default function DashboardHero({
  athlete,
  subscribed,
  trackedEventsCount,
  nextEvent,
  allAthletes,
  locale,
}: DashboardHeroProps) {
  const firstName = athlete.firstName || "Athlete";
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const countdown = nextEvent ? getEventCountdownMeta(nextEvent.startTimeIso) : null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 blur-2xl" />
      </div>

      <div className="relative">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Good {timeOfDay}, {firstName}! Let&apos;s dial in your race fueling.
            </h1>
            <p className="mt-2 text-lg text-slate-300">You&apos;re one tap away from a sharper fueling plan.</p>
          </div>

          {!subscribed && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs uppercase tracking-wide">
                  Demo
                </span>
                <span>Feature preview</span>
              </div>
              <p className="mt-1 text-xs text-amber-200/80">Upgrade to unlock full scenario generation and kit exports.</p>
              <a
                href={`/${locale}/checkout/annual`}
                className="mt-2 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                Upgrade for $20/year
              </a>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-slate-800/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-cyan-500/20 p-2">
                <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{trackedEventsCount}</p>
                <p className="text-sm text-slate-400">Events planned</p>
              </div>
            </div>
          </div>

          {nextEvent && (
            <div className="rounded-2xl bg-slate-800/50 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-500/20 p-2">
                  <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-white">{nextEvent.name}</p>
                  <p className="text-xs text-slate-400">
                    {disciplineCopy[nextEvent.discipline]} | {nextEvent.location}
                  </p>
                  <p className="text-sm text-slate-400">
                    {formatEventDate(nextEvent.startTimeIso)} / {getDaysUntil(nextEvent.startTimeIso)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-slate-800/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${subscribed ? "bg-green-500/20" : "bg-amber-500/20"}`}>
                {subscribed ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{subscribed ? "Pro" : "Demo"}</p>
                <p className="text-sm text-slate-400">{subscribed ? "Full access" : "Limited features"}</p>
              </div>
            </div>
          </div>
        </div>

        {countdown && (
          <div id="race-focus" className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-900/50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-cyan-300/80">Race countdown</p>
                <p className="text-sm font-semibold text-white">{countdown.label}</p>
                <p className="text-xs text-slate-400">{countdown.recommendation}</p>
              </div>
              <div className="flex flex-1 min-w-[200px] items-center justify-end gap-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">
                    {countdown.daysRemaining <= 0 ? "Done" : `${countdown.daysRemaining} days`}
                  </p>
                  <p className="text-xs text-slate-400">
                    {countdown.daysRemaining <= 0 ? "since race" : "until gun time"}
                  </p>
                </div>
                <div className="w-full max-w-[220px]">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className={`h-full rounded-full ${countdown.accentClass}`} style={{ width: `${countdown.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="#scenario-studio"
                className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-transform hover:scale-105"
              >
                Review fueling plan
              </a>
              <a
                href="#preferences"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200"
              >
                Tune preferences
              </a>
            </div>
          </div>
        )}

        {allAthletes.length > 1 && (
          <div className="mt-6 rounded-2xl bg-slate-800/30 p-4">
            <form method="get" className="flex flex-wrap items-center gap-3">
              <label htmlFor="athleteId" className="text-sm font-medium text-slate-300">
                Viewing as
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
                className="rounded-xl bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-500"
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
