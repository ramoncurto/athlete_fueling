import DashboardHero from '../DashboardHero';
import QuickActions from '../QuickActions';
import PreferenceSummaryCard from '../PreferenceSummaryCard';
import type { Athlete, Event, Preference } from '@schemas/index';

type OverviewSectionProps = {
  athlete: Athlete;
  subscribed: boolean;
  trackedEventsCount: number;
  nextEvent?: Event;
  allAthletes: Athlete[];
  locale: string;
  preference: Preference;
};

export default function OverviewSection({
  athlete,
  subscribed,
  trackedEventsCount,
  nextEvent,
  allAthletes,
  locale,
  preference,
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <QuickActions
          subscribed={subscribed}
          hasEvents={trackedEventsCount > 0}
          locale={locale}
        />
        <PreferenceSummaryCard preference={preference} />
      </div>
    </div>
  );
}
