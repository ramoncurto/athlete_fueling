"use client";

import { useState } from "react";

interface RacePreparationChecklistProps {
  terrainType: "road" | "trail" | "ultra_trail";
  daysUntilRace: number;
  elevationGainM: number;
}

export function RacePreparationChecklist({
  terrainType,
  daysUntilRace,
  elevationGainM,
}: RacePreparationChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getChecklistItems = () => {
    const baseItems = [
      {
        id: "nutrition-test",
        category: "Nutrition",
        title: "Test race nutrition in training",
        description: "Run at least one long run with your planned gels, drinks, and foods",
        urgent: daysUntilRace <= 14,
      },
      {
        id: "gear-check",
        category: "Gear",
        title: "Check all race gear",
        description: "Verify hydration vest/belt, bottles, gels loops are in good condition",
        urgent: daysUntilRace <= 7,
      },
      {
        id: "fuel-purchase",
        category: "Nutrition",
        title: "Purchase race fuel",
        description: "Buy all gels, chews, drink mixes, and electrolyte capsules",
        urgent: daysUntilRace <= 10,
      },
      {
        id: "course-study",
        category: "Strategy",
        title: "Study the course",
        description: "Review elevation profile, aid station locations, and cut-off times",
        urgent: daysUntilRace <= 7,
      },
    ];

    const trailItems = [
      {
        id: "trail-shoes",
        category: "Gear",
        title: "Break in trail shoes",
        description: "Ensure trail shoes are broken in but not worn out",
        urgent: daysUntilRace <= 21,
      },
      {
        id: "vest-fit",
        category: "Gear",
        title: "Dial in vest fit",
        description: "Adjust straps and pockets on hydration vest for comfort",
        urgent: daysUntilRace <= 14,
      },
    ];

    const ultraItems = [
      {
        id: "crew-plan",
        category: "Logistics",
        title: "Coordinate with crew/pacers",
        description: "Share detailed plan with crew, including aid station ETAs",
        urgent: daysUntilRace <= 10,
      },
      {
        id: "drop-bags",
        category: "Logistics",
        title: "Prepare drop bags",
        description: "Pack nutrition, clothing changes, first aid for each drop location",
        urgent: daysUntilRace <= 3,
      },
      {
        id: "night-gear",
        category: "Gear",
        title: "Test night running gear",
        description: "Charge headlamps, test with spare batteries",
        urgent: daysUntilRace <= 7,
      },
      {
        id: "gut-training",
        category: "Nutrition",
        title: "Complete gut training protocol",
        description: "Practice eating solid food during long runs",
        urgent: daysUntilRace <= 30,
      },
    ];

    const raceWeekItems = [
      {
        id: "carb-load",
        category: "Nutrition",
        title: "Start carb loading",
        description: "Increase carb intake 2-3 days before race",
        urgent: daysUntilRace <= 3,
      },
      {
        id: "hydration",
        category: "Nutrition",
        title: "Focus on hydration",
        description: "Drink extra fluids, monitor urine color",
        urgent: daysUntilRace <= 2,
      },
      {
        id: "race-pack",
        category: "Logistics",
        title: "Pack race day bag",
        description: "Lay out everything night before: gear, nutrition, timing chip",
        urgent: daysUntilRace <= 1,
      },
    ];

    let items = [...baseItems];

    if (terrainType === "trail" || terrainType === "ultra_trail") {
      items = [...items, ...trailItems];
    }

    if (terrainType === "ultra_trail") {
      items = [...items, ...ultraItems];
    }

    if (daysUntilRace <= 7) {
      items = [...items, ...raceWeekItems];
    }

    return items;
  };

  const items = getChecklistItems();
  const urgentItems = items.filter((item) => item.urgent);
  const completedCount = items.filter((item) => checkedItems.has(item.id)).length;
  const progressPercent = (completedCount / items.length) * 100;

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Race Preparation</h2>
          <span className="text-sm text-slate-400">
            {completedCount} / {items.length} completed
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {daysUntilRace <= 30 && (
        <div className="mb-4 p-3 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
          <p className="text-sm text-cyan-200">
            <strong>{daysUntilRace} days</strong> until race day
            {urgentItems.length > 0 && ` • ${urgentItems.length} urgent items`}
          </p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.map((item) => {
          const isChecked = checkedItems.has(item.id);

          return (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-all ${
                isChecked
                  ? "bg-slate-800/30 border-slate-700/50 opacity-60"
                  : item.urgent
                  ? "bg-orange-900/20 border-orange-800/30"
                  : "bg-slate-800/50 border-slate-700/50"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      {item.category}
                    </span>
                    {item.urgent && !isChecked && (
                      <span className="text-xs font-semibold text-orange-400">
                        • URGENT
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-semibold ${isChecked ? "text-slate-500 line-through" : "text-white"}`}>
                    {item.title}
                  </p>
                  <p className={`text-xs mt-1 ${isChecked ? "text-slate-600" : "text-slate-400"}`}>
                    {item.description}
                  </p>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {completedCount === items.length && (
        <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-800/30">
          <p className="text-sm text-green-200">
            ✓ <strong>All set!</strong> You're prepared and ready for race day.
          </p>
        </div>
      )}
    </div>
  );
}
