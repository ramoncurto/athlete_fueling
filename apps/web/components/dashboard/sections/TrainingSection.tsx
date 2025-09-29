import GutTrainingGuide from '../GutTrainingGuide';
import type { GutTrainingPlan } from '@/lib/training/gut';

type TrainingSectionProps = {
  gutPlan: GutTrainingPlan;
};

export default function TrainingSection({ gutPlan }: TrainingSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Gut Training</h2>
        <p className="text-slate-400">
          Personalized gut training recommendations to help you optimize your body&apos;s ability
          to process fuel during races. Based on your upcoming events and current preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <GutTrainingGuide plan={gutPlan} />

        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Training Tips</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="rounded-full bg-cyan-500/20 p-2 flex-shrink-0">
                <svg className="h-4 w-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Start Early</h4>
                <p className="text-xs text-slate-400">
                  Begin gut training at least 4-6 weeks before your target event for best adaptation.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-green-500/20 p-2 flex-shrink-0">
                <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Progressive Loading</h4>
                <p className="text-xs text-slate-400">
                  Gradually increase carbohydrate intake during training runs to build tolerance.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-purple-500/20 p-2 flex-shrink-0">
                <svg className="h-4 w-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Race Simulation</h4>
                <p className="text-xs text-slate-400">
                  Practice with your exact race nutrition plan during long training sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}