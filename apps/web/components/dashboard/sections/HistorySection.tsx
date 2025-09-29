import HistoryTimeline from '../HistoryTimeline';
import KitSummary from '../KitSummary';
import type { Plan, IntakeEvent, Kit } from '@schemas/index';

type HistorySectionProps = {
  plans: Plan[];
  intake: IntakeEvent[];
  kits: Kit[];
};

export default function HistorySection({ plans, intake, kits }: HistorySectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Plan History & Kits</h2>
        <p className="text-slate-400">
          Review your past fueling plans, intake logs, and generated kit recommendations.
          All data is maintained for compliance reviews and performance analysis.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_0.6fr]">
        <HistoryTimeline plans={plans} intake={intake} />
        <KitSummary kits={kits} showViewAll={true} />
      </div>
    </div>
  );
}