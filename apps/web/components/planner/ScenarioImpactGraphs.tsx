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
  if (values.length === 0) return <div className="h-[60px] w-[220px] rounded-lg bg-slate-950/40" />;
  const vmin = min ?? Math.min(0, ...values, threshold ?? Infinity);
  const vmax = max ?? Math.max(...values, threshold ?? -Infinity, 1);
  const pad = 6;
  const scaleX = (i: number) => pad + (i * (width - pad * 2)) / Math.max(1, values.length - 1);
  const scaleY = (v: number) => pad + (height - pad * 2) * (1 - (v - vmin) / (vmax - vmin));
  const pts = values.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");
  const threshY = threshold !== undefined ? scaleY(threshold) : null;

  // Create gradient area under the line
  const areaPath = values.length > 0
    ? `M${scaleX(0)},${height - pad} L${values.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" L")} L${scaleX(values.length - 1)},${height - pad} Z`
    : "";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="rounded-lg bg-slate-950/50 shadow-inner">
      {/* Grid lines */}
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#1e293b" strokeWidth={0.5} />
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#1e293b" strokeWidth={1} />

      {/* Gradient fill under line */}
      <defs>
        <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
        </linearGradient>
      </defs>
      {areaPath && <path d={areaPath} fill={`url(#gradient-${color.replace("#", "")})`} />}

      {/* Threshold line */}
      {threshY !== null && (
        <>
          <line x1={pad} y1={threshY} x2={width - pad} y2={threshY} stroke="#64748b" strokeDasharray="4 3" strokeWidth={1.5} opacity={0.6} />
        </>
      )}

      {/* Main line */}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {values.map((v, i) => (
        <circle key={i} cx={scaleX(i)} cy={scaleY(v)} r={2.5} fill={color} className="drop-shadow-lg" />
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

  const minGlycogen = Math.min(...timeline.glycogenG);
  const finalHydration = timeline.hydrationDeficitMl.at(-1) ?? 0;

  return (
    <div className="mt-5 space-y-4 rounded-xl bg-slate-950/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Performance Timeline</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Glycogen</span>
            </div>
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold tabular-nums ${
              minGlycogen > 300 ? "bg-emerald-500/20 text-emerald-300" :
              minGlycogen > 200 ? "bg-yellow-500/20 text-yellow-300" :
              "bg-red-500/20 text-red-300"
            }`}>min {minGlycogen} g</span>
          </div>
          <MiniLine values={timeline.glycogenG} color="#34d399" threshold={timeline.glycogenCriticalG} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-sky-400"></div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Hydration</span>
            </div>
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold tabular-nums ${
              finalHydration < 500 ? "bg-emerald-500/20 text-emerald-300" :
              finalHydration < 1000 ? "bg-yellow-500/20 text-yellow-300" :
              "bg-red-500/20 text-red-300"
            }`}>deficit {finalHydration} ml</span>
          </div>
          <MiniLine values={timeline.hydrationDeficitMl} color="#38bdf8" threshold={timeline.hydrationCriticalMl} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Sodium</span>
            </div>
            <span className="rounded bg-slate-800/50 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-300">
              target {timeline.sodiumTargetPerHour} mg/h
            </span>
          </div>
          {/* Map ratio 0..2 to chart; threshold 1.0 */}
          <MiniLine values={timeline.sodiumRatio} color="#f59e0b" min={0} max={2} threshold={1} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-fuchsia-400"></div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Caffeine</span>
            </div>
            <span className="rounded bg-slate-800/50 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-300">
              total {Math.round(scenario.totals.caffeine)} mg
            </span>
          </div>
          <MiniLine values={timeline.caffeinePerHour} color="#e879f9" min={0} />
        </div>
      </div>
    </div>
  );
}

