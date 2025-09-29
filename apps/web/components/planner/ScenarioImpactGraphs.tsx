"use client";

import * as React from "react";
import type { ScenarioOutput } from "@schemas/index";
import { computeScenarioTimeline } from "@/lib/planner/metrics";

type LineProps = {
  values: number[];
  width?: number;
  height?: number;
  color?: string; // hex
  min?: number;
  max?: number;
  threshold?: number; // optional horizontal line
};

const MiniLine: React.FC<LineProps> = ({ values, width = 220, height = 60, color = "#22d3ee", min, max, threshold }) => {
  if (values.length === 0) return <div className="h-[60px] w-[220px] rounded-md bg-slate-950/40" />;
  const vmin = min ?? Math.min(0, ...values, threshold ?? Infinity);
  const vmax = max ?? Math.max(...values, threshold ?? -Infinity, 1);
  const pad = 4;
  const scaleX = (i: number) => pad + (i * (width - pad * 2)) / Math.max(1, values.length - 1);
  const scaleY = (v: number) => pad + (height - pad * 2) * (1 - (v - vmin) / (vmax - vmin));
  const pts = values.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");
  const threshY = threshold !== undefined ? scaleY(threshold) : null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="rounded-md bg-slate-950/40">
      <line x1={0} y1={height - 0.5} x2={width} y2={height - 0.5} className="stroke-slate-800" />
      {threshY !== null && <line x1={0} y1={threshY} x2={width} y2={threshY} stroke="#475569" strokeDasharray="3 3" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={scaleX(i)} cy={scaleY(v)} r={1.6} fill={color} />
      ))}
    </svg>
  );
};

type Props = {
  scenario: ScenarioOutput;
  weightKg?: number;
};

export default function ScenarioImpactGraphs({ scenario, weightKg }: Props) {
  const timeline = React.useMemo(() => computeScenarioTimeline(scenario, { weightKg }), [scenario, weightKg]);

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="uppercase tracking-wide">Glycogen stores (g)</span>
          <span className="tabular-nums text-slate-300">min {Math.min(...timeline.glycogenG)} g</span>
        </div>
        <MiniLine values={timeline.glycogenG} color="#34d399" threshold={timeline.glycogenCriticalG} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="uppercase tracking-wide">Hydration deficit (ml)</span>
          <span className="tabular-nums text-slate-300">final {timeline.hydrationDeficitMl.at(-1) ?? 0} ml</span>
        </div>
        <MiniLine values={timeline.hydrationDeficitMl} color="#38bdf8" threshold={timeline.hydrationCriticalMl} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="uppercase tracking-wide">Sodium coverage (x target)</span>
          <span className="tabular-nums text-slate-300">target {timeline.sodiumTargetPerHour} mg/h</span>
        </div>
        {/* Map ratio 0..2 to chart; threshold 1.0 */}
        <MiniLine values={timeline.sodiumRatio} color="#f59e0b" min={0} max={2} threshold={1} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="uppercase tracking-wide">Caffeine per hour (mg)</span>
          <span className="tabular-nums text-slate-300">total {Math.round(scenario.totals.caffeine)} mg</span>
        </div>
        <MiniLine values={timeline.caffeinePerHour} color="#e879f9" min={0} />
      </div>
    </div>
  );
}

