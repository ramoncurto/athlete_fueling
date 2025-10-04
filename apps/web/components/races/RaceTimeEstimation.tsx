"use client";

import type { TimeEstimation } from "@/lib/planner/race-time-estimator";

interface RaceTimeEstimationProps {
  estimation: TimeEstimation;
}

export function RaceTimeEstimation({ estimation }: RaceTimeEstimationProps) {
  const hours = Math.floor(estimation.estimatedMinutes / 60);
  const minutes = Math.round(estimation.estimatedMinutes % 60);

  const getConfidenceBadge = () => {
    const badges = {
      high: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "High Confidence",
      },
      medium: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Medium Confidence",
      },
      low: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "Low Confidence",
      },
    };
    return badges[estimation.confidence];
  };

  const badge = getConfidenceBadge();

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Expected Finish Time</h2>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      <div className="mb-6">
        <div className="text-5xl font-bold text-white mb-2">
          {hours}:{minutes.toString().padStart(2, "0")}
        </div>
        <p className="text-sm text-slate-400">
          Estimated finish time ({estimation.estimationMethod.replace(/_/g, " ")})
        </p>
      </div>

      {estimation.range && (
        <div className="mb-6 p-4 rounded-lg bg-slate-800/50">
          <p className="text-xs font-semibold text-slate-300 mb-2">Expected Range</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {Math.floor(estimation.range.minMinutes / 60)}:
                {Math.round(estimation.range.minMinutes % 60).toString().padStart(2, "0")}
              </p>
              <p className="text-xs text-slate-500">Best case</p>
            </div>
            <div className="flex-1 mx-4 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {Math.floor(estimation.range.maxMinutes / 60)}:
                {Math.round(estimation.range.maxMinutes % 60).toString().padStart(2, "0")}
              </p>
              <p className="text-xs text-slate-500">Conservative</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Time Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Base Time</span>
            <span className="text-slate-200 font-mono">
              {Math.floor(estimation.breakdown.baseTimeMinutes / 60)}:
              {Math.round(estimation.breakdown.baseTimeMinutes % 60).toString().padStart(2, "0")}
            </span>
          </div>
          {estimation.breakdown.elevationPenaltyMinutes > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">+ Elevation</span>
              <span className="text-orange-400 font-mono">
                +{Math.round(estimation.breakdown.elevationPenaltyMinutes)} min
              </span>
            </div>
          )}
          {estimation.breakdown.technicalPenaltyMinutes > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">+ Technical Terrain</span>
              <span className="text-orange-400 font-mono">
                +{Math.round(estimation.breakdown.technicalPenaltyMinutes)} min
              </span>
            </div>
          )}
          {estimation.breakdown.climatePenaltyMinutes > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">+ Climate</span>
              <span className="text-orange-400 font-mono">
                +{Math.round(estimation.breakdown.climatePenaltyMinutes)} min
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-slate-700">
            <span className="text-slate-300 font-semibold">Total Estimated</span>
            <span className="text-white font-semibold font-mono">
              {hours}:{minutes.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {estimation.confidence === "low" && (
        <div className="mt-4 p-3 rounded-lg bg-orange-900/20 border border-orange-800/30">
          <p className="text-xs text-orange-200">
            💡 <strong>Tip:</strong> Add your race history or performance metrics in your profile for more accurate predictions.
          </p>
        </div>
      )}
    </div>
  );
}
