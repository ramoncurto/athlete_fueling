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
    <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200">
      <div className="relative p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {timeOfDay}, {firstName}!
            </h1>
            <p className="mt-1 text-gray-600">Ready to plan your next race fueling strategy.</p>
          </div>

          {!subscribed && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-[10px] uppercase tracking-wide">
                  Demo
                </span>
                <span>Limited Access</span>
              </div>
            </div>
          )}
        </div>

        {nextEvent && countdown && (
          <div id="race-focus" className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-blue-600 p-2">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">{countdown.label}</p>
                </div>
                <p className="text-lg font-bold text-gray-900 truncate">{nextEvent.name}</p>
                <p className="text-sm text-gray-600">
                  {formatEventDate(nextEvent.startTimeIso)} • {nextEvent.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  {countdown.daysRemaining <= 0 ? "✓" : countdown.daysRemaining}
                </p>
                <p className="text-xs text-gray-600">
                  {countdown.daysRemaining <= 0 ? "Completed" : "days to go"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">{countdown.recommendation}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/${locale}/plan/scenarios`}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                Plan Race
              </a>
              <a
                href="#preferences"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-cyan-500 hover:text-cyan-600"
              >
                Update Preferences
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
