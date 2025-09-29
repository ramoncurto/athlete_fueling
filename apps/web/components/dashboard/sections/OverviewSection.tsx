import DashboardHero from '../DashboardHero';
import QuickActions from '../QuickActions';
import type { Athlete, Event } from '@schemas/index';

type OverviewSectionProps = {
  athlete: Athlete;
  subscribed: boolean;
  trackedEventsCount: number;
  nextEvent?: Event;
  allAthletes: Athlete[];
  locale: string;
};

export default function OverviewSection({
  athlete,
  subscribed,
  trackedEventsCount,
  nextEvent,
  allAthletes,
  locale
}: OverviewSectionProps) {
  return (
    <div className="space-y-8">
      <DashboardHero
        athlete={athlete}
        subscribed={subscribed}
        trackedEventsCount={trackedEventsCount}
        nextEvent={nextEvent}
        allAthletes={allAthletes}
        locale={locale}
      />

      <QuickActions
        subscribed={subscribed}
        hasEvents={trackedEventsCount > 0}
        locale={locale}
      />
    </div>
  );
}