import type { Athlete, Preference, Event, ScenarioOutput } from "@schemas/index";

export type GutTrainingStep = {
  title: string;
  description: string;
  focus: string[];
};

export type GutTrainingPlan = {
  headline: string;
  steps: GutTrainingStep[];
  weeksUntilEvent?: number;
  eventName?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const weeksUntil = (iso?: string): number | undefined => {
  if (!iso) return undefined;
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return undefined;
  const diff = timestamp - Date.now();
  if (diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24 * 7));
};

const describeCaffeine = (preference: Preference): string => {
  switch (preference.caffeineSensitivity) {
    case "low":
      return "Keep caffeine portions light (25-35 mg hits) and pair with simple carbs.";
    case "high":
      return "Layer caffeine late in the session (70-90 mg) to stay inside your tolerance.";
    default:
      return "Introduce 45-60 mg caffeine once the gut feels stable and note any GI feedback.";
  }
};

const formatEnergyVehicle = (preference: Preference): string => {
  return preference.prefersEnergyDrink ? "mix-based" : "chew or bar";
};

const gelCue = (preference: Preference): string => {
  return preference.usesGels
    ? "Include one gel every 30 minutes to mirror race cadence."
    : "Rotate chews or rice bites every 30 minutes instead of gels.";
};

const computeAverage = (total: number, count: number, fallback: number, min: number, max: number) => {
  if (!count) {
    return fallback;
  }
  return Math.round(clamp(total / count, min, max));
};

export function generateGutTrainingMiniPlan({
  athlete,
  preference,
  event,
  scenario,
}: {
  athlete: Athlete;
  preference: Preference;
  event?: Event | null;
  scenario?: ScenarioOutput | null;
}): GutTrainingPlan {
  const weeksOut = weeksUntil(event?.startTimeIso);
  const legs = scenario?.fuelPlan ?? [];
  const legCount = legs.length;
  const avgCarbsPerHour = computeAverage(
    scenario?.totals.carbs ?? 0,
    legCount,
    preference.prefersEnergyDrink ? 90 : 75,
    40,
    110,
  );
  const avgFluidsPerHour = computeAverage(
    scenario?.totals.fluids ?? 0,
    legCount,
    preference.prefersEnergyDrink ? 650 : 550,
    400,
    900,
  );
  const avgSodiumPerHour = computeAverage(
    scenario?.totals.sodium ?? 0,
    legCount,
    preference.sodiumSensitivity === "high" ? 900 : 650,
    300,
    1600,
  );

  const baselineCarbs = clamp(Math.round(avgCarbsPerHour * 0.65), 45, avgCarbsPerHour - 10);
  const simulationCarbs = clamp(Math.round(avgCarbsPerHour * 0.85), baselineCarbs + 5, avgCarbsPerHour);
  const stressCarbs = clamp(avgCarbsPerHour + 5, simulationCarbs + 5, 110);

  const steps: GutTrainingStep[] = [
    {
      title: "Week 1: Baseline priming",
      description: "Shorter session to wake up the gut without overload.",
      focus: [
        `Target ${baselineCarbs} g carbs per hour using ${formatEnergyVehicle(preference)} fueling.`,
        gelCue(preference),
        `Sip roughly ${Math.max(400, avgFluidsPerHour - 100)} ml fluid per hour on easy terrain.`,
      ],
    },
    {
      title: "Week 2: Race simulation",
      description: "Long run or ride with race posture, aid timing, and heavier sodium.",
      focus: [
        `Move toward ${simulationCarbs} g carbs per hour and ${avgFluidsPerHour} ml fluids.`,
        `Layer sodium to around ${avgSodiumPerHour} mg per hour with capsules or mix.`,
        describeCaffeine(preference),
      ],
    },
    {
      title: "Week 3: Gut stress rehearsal",
      description: "Peak fueling rehearsal at event intensity with post-session notes.",
      focus: [
        `Hold ${stressCarbs} g carbs per hour for at least 60 minutes at race effort.`,
        `Finish with your planned final caffeine hit if tolerated.`,
        "Log GI feedback and adjust textures or spacing before taper week.",
      ],
    },
  ];

  const headlineParts = [
    `Build tolerance for ~${avgCarbsPerHour} g carbs per hour ahead of race day.`,
    `Athlete mass: ${Math.round(athlete.weightKg)} kg.`,
  ];

  if (preference.prefersEnergyDrink) {
    headlineParts.push("Primary fuel: energy drinks with staged gels.");
  } else {
    headlineParts.push("Primary fuel: chews or solids plus sip-to-thirst hydration.");
  }

  return {
    headline: headlineParts.join(' '),
    steps,
    weeksUntilEvent: weeksOut,
    eventName: event?.name,
  };
}
