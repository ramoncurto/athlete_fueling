'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { QuickRaceUpload } from './QuickRaceUpload';
import { RaceCard } from '@/components/races/RaceCard';
import { DashboardHero } from './DashboardHero';
import { QuickActions } from './QuickActions';
import { PreferenceSummaryCard } from './PreferenceSummaryCard';
import type { Athlete, Event, Kit, Plan, ScenarioOutput, Preference, IntakeEvent } from '@schemas/index';
import type { GutTrainingPlan } from '@/lib/training/gut';

export type DashboardData = {
  athlete: Athlete;
  allAthletes: Athlete[];
  preference: Preference;
  history: {
    plans: Plan[];
    kits: Kit[];
    intakeEvents: IntakeEvent[];
  };
  subscribed: boolean;
  trackedEvents: Array<{
    event: Event;
    plan: Plan;
    kits: Kit[];
    scenario?: ScenarioOutput;
  }>;
  availableEvents: Event[];
  gutPlan: GutTrainingPlan;
  params: { locale: string };
  isDemo?: boolean; // true if using demo/sample data
};

export default function DashboardPageClient({ data }: { data: DashboardData }) {
  const { trackedEvents, availableEvents, params, athlete, preference } = data;

  // Combine all events and add race metadata
  const allRaces = [
    ...trackedEvents.map(({ event, plan }) => {
      const raceDate = new Date(event.startTimeIso);
      const today = new Date();
      const daysUntil = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        event,
        estimatedTime: undefined, // TODO: Get from athlete race time estimate
        daysUntil,
        hasPlan: !!plan,
      };
    }),
    ...availableEvents.map(event => {
      const raceDate = new Date(event.startTimeIso);
      const today = new Date();
      const daysUntil = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        event,
        estimatedTime: undefined,
        daysUntil,
        hasPlan: false,
      };
    })
  ].sort((a, b) => {
    // Sort by date (soonest first)
    const dateA = new Date(a.event.startTimeIso).getTime();
    const dateB = new Date(b.event.startTimeIso).getTime();
    return dateA - dateB;
  });

  const upcomingRaces = allRaces.filter((r) => r.daysUntil >= 0);
  const pastRaces = allRaces.filter((r) => r.daysUntil < 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <DashboardHero
          athlete={athlete}
          upcomingRacesCount={upcomingRaces.length}
          nextRace={upcomingRaces[0]}
        />

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions locale={params.locale} />
        </div>

        {/* Upload Card - Primary CTA */}
        <div className="mb-12">
          <QuickRaceUpload />
        </div>

        {/* Preference Summary */}
        <div className="mb-12">
          <PreferenceSummaryCard preference={preference} />
        </div>

        {/* Upcoming Races */}
        {upcomingRaces.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">
              Upcoming Races ({upcomingRaces.length})
            </h2>
            <div className="space-y-4">
              {upcomingRaces.map((race) => (
                <RaceCard
                  key={race.event.id}
                  event={race.event}
                  estimatedTime={race.estimatedTime}
                  daysUntil={race.daysUntil}
                  hasPlan={race.hasPlan}
                  locale={params.locale}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Races or Empty State */}
        {pastRaces.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Past Races ({pastRaces.length})
            </h2>
            <div className="space-y-4">
              {pastRaces.map((race) => (
                <RaceCard
                  key={race.event.id}
                  event={race.event}
                  estimatedTime={race.estimatedTime}
                  daysUntil={race.daysUntil}
                  hasPlan={race.hasPlan}
                  locale={params.locale}
                />
              ))}
            </div>
          </div>
        ) : upcomingRaces.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-12 text-center">
            <div className="text-5xl mb-4">🏃</div>
            <h3 className="text-xl font-semibold text-white mb-2">No races yet</h3>
            <p className="text-slate-400 mb-6">
              Upload your first race to get started with personalized nutrition planning
            </p>
            <button className="text-cyan-400 hover:text-cyan-300 font-medium">
              ↑ Upload GPX above
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8 text-center">
            <p className="text-slate-400">No past races yet</p>
          </div>
        )}
      </div>
    </div>
  );
}