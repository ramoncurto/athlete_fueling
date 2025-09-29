"use client";

import * as React from "react";
import type { ScenarioOutput } from "@schemas/index";

type SparkProps = {
  values: number[];
  width?: number;
  height?: number;
  colorHex?: string; // e.g., '#22d3ee'
  title: string;
  unit?: string;
  emphasizeTotal?: boolean;
};

const Sparkline: React.FC<SparkProps> = ({ values, width = 220, height = 56, colorHex = "#22d3ee", title, unit = "", emphasizeTotal = false }) => {
  const max = Math.max(1, ...values);
  const steps = values.length;
  const padding = 4;

  const points = values.map((v, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, steps - 1);
    const y = padding + (height - padding * 2) * (1 - v / max);
    return `${x},${y}`;
  });

  const total = values.reduce((a, b) => a + b, 0);
  const avg = values.length ? total / values.length : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="uppercase tracking-wide">{title}</span>
        <span className="tabular-nums text-slate-300">
          {emphasizeTotal ? `${Math.round(total)}${unit ? ` ${unit}` : ""} total` : `${Math.round(avg)}${unit ? ` ${unit}` : ""} avg`}
        </span>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="rounded-md bg-slate-950/40">
        {/* baseline */}
        <line x1={0} y1={height - 0.5} x2={width} y2={height - 0.5} className="stroke-slate-800" />
        {/* line */}
        {points.length > 1 ? (
          <polyline
            points={points.join(" ")}
            style={{ fill: "none", stroke: colorHex }}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <circle cx={width / 2} cy={height / 2} r={2} style={{ fill: colorHex }} />
        )}
        {/* markers */}
        {values.map((v, i) => {
          const x = padding + (i * (width - padding * 2)) / Math.max(1, steps - 1);
          const y = padding + (height - padding * 2) * (1 - v / max);
          return <circle key={i} cx={x} cy={y} r={1.5} style={{ fill: colorHex }} />;
        })}
      </svg>
    </div>
  );
};

type ScenarioSparklinesProps = {
  scenario: ScenarioOutput;
};

export default function ScenarioSparklines({ scenario }: ScenarioSparklinesProps) {
  const legsSorted = React.useMemo(() => [...scenario.fuelPlan].sort((a, b) => a.hour - b.hour), [scenario.fuelPlan]);
  const carbs = legsSorted.map((l) => l.carbsG);
  const fluids = legsSorted.map((l) => l.fluidsMl);
  const sodium = legsSorted.map((l) => l.sodiumMg);
  const caffeine = legsSorted.map((l) => l.caffeineMg);

  // Cumulative carbs as a rough proxy for CHO stores intake progression
  const carbsCum = carbs.reduce<number[]>((acc, v) => {
    const prev = acc.length ? acc[acc.length - 1] : 0;
    acc.push(prev + v);
    return acc;
  }, []);

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Sparkline title="Carbs per hour" values={carbs} unit="g" colorHex="#22d3ee" />
      <Sparkline title="CHO intake (cumulative)" values={carbsCum} unit="g" colorHex="#34d399" emphasizeTotal />
      <Sparkline title="Fluids per hour" values={fluids} unit="ml" colorHex="#38bdf8" />
      <Sparkline title="Sodium per hour" values={sodium} unit="mg" colorHex="#f59e0b" />
      <Sparkline title="Caffeine per hour" values={caffeine} unit="mg" colorHex="#e879f9" />
    </div>
  );
}
