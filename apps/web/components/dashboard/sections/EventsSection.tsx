import EventAccessList from '../EventAccessList';
import ScenarioStudio from '@/components/planner/ScenarioStudio';
import type { Event, Kit, Plan, ScenarioOutput, Athlete } from '@schemas/index';

type EventsSectionProps = {
  locale: string;
  trackedEvents: Array<{
    event: Event;
    plan: Plan;
    kits: Kit[];
    scenario?: ScenarioOutput;
  }>;
  availableEvents: Event[];
  athlete: Athlete;
  subscribed: boolean;
};

export default function EventsSection({
  locale,
  trackedEvents,
  availableEvents,
  athlete,
  subscribed
}: EventsSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Events & Race Plans</h2>
        <p className="text-slate-400">
          Manage your upcoming events and create detailed fueling strategies for each race.
        </p>
      </div>

      <EventAccessList
        locale={locale}
        tracked={trackedEvents}
        available={availableEvents}
      />

      <div className="space-y-4" id="scenario-studio">
        <div className="border-t border-slate-800 pt-6">
          <h3 className="text-xl font-semibold text-white mb-2">Scenario Studio</h3>
          <p className="text-slate-400 mb-6">
            Create and compare different fueling strategies. Test various nutrition approaches
            and find the optimal plan for your race conditions.
          </p>

          <ScenarioStudio
            athlete={{
              id: athlete.id,
              firstName: athlete.firstName,
              lastName: athlete.lastName
            }}
            athleteWeightKg={Number(athlete.weightKg) || undefined}
            lockAthlete
            demo={!subscribed}
          />
        </div>
      </div>
    </div>
  );
}