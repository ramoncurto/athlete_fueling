'use client';

import { useState } from 'react';
import DashboardNavigation, { type DashboardSection } from './DashboardNavigation';
import OverviewSection from './sections/OverviewSection';
import EventsSection from './sections/EventsSection';
import PreferencesSection from './sections/PreferencesSection';
import HistorySection from './sections/HistorySection';
import TrainingSection from './sections/TrainingSection';
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
};

function DashboardContent({
  data,
  activeSection
}: {
  data: DashboardData;
  activeSection: DashboardSection;
}) {
  const {
    athlete,
    allAthletes,
    preference,
    history,
    subscribed,
    trackedEvents,
    availableEvents,
    gutPlan,
    params
  } = data;

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            athlete={athlete}
            subscribed={subscribed}
            trackedEventsCount={trackedEvents.length}
            nextEvent={trackedEvents[0]?.event || availableEvents[0]}
            allAthletes={allAthletes}
            locale={params.locale}
          />
        );
      case 'events':
        return (
          <EventsSection
            locale={params.locale}
            trackedEvents={trackedEvents}
            availableEvents={availableEvents}
            athlete={athlete}
            subscribed={subscribed}
          />
        );
      case 'preferences':
        return <PreferencesSection preference={preference} />;
      case 'history':
        return (
          <HistorySection
            plans={history.plans}
            intake={history.intakeEvents}
            kits={history.kits}
          />
        );
      case 'training':
        return <TrainingSection gutPlan={gutPlan} />;
      default:
        return (
          <OverviewSection
            athlete={athlete}
            subscribed={subscribed}
            trackedEventsCount={trackedEvents.length}
            nextEvent={trackedEvents[0]?.event || availableEvents[0]}
            allAthletes={allAthletes}
            locale={params.locale}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl">
        {renderSection()}
      </div>
    </div>
  );
}

export default function DashboardPageClient({ data }: { data: DashboardData }) {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');

  return (
    <DashboardNavigation
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      <DashboardContent
        data={data}
        activeSection={activeSection}
      />
    </DashboardNavigation>
  );
}