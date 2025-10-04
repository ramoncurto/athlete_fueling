"use client";

import type { BaselineTargets } from "@/lib/planner/targets";

interface SupplementationPlanProps {
  targets: BaselineTargets;
  terrainType: "road" | "trail" | "ultra_trail";
}

export function SupplementationPlan({ targets, terrainType }: SupplementationPlanProps) {
  const totalCarbs = Math.round(targets.carbsPerHour * targets.durationHours);
  const totalFluids = Math.round((targets.fluidsPerHour * targets.durationHours) / 1000);
  const totalSodium = Math.round(targets.sodiumPerHour * targets.durationHours);

  const getTerrainLabel = () => {
    const labels = {
      road: { name: "Road Running", color: "from-blue-500 to-blue-600" },
      trail: { name: "Trail Running", color: "from-green-500 to-green-600" },
      ultra_trail: { name: "Ultra Trail", color: "from-purple-500 to-purple-600" },
    };
    return labels[terrainType];
  };

  const terrain = getTerrainLabel();

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Supplementation Strategy</h2>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r ${terrain.color}`}>
          {terrain.name}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Hourly Targets */}
        <div className="col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Hourly Targets</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-700/30">
              <p className="text-xs text-cyan-300 mb-1">Carbohydrates</p>
              <p className="text-2xl font-bold text-white">{targets.carbsPerHour}g</p>
              <p className="text-xs text-slate-400 mt-1">per hour</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30">
              <p className="text-xs text-blue-300 mb-1">Fluids</p>
              <p className="text-2xl font-bold text-white">{targets.fluidsPerHour}ml</p>
              <p className="text-xs text-slate-400 mt-1">per hour</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/30">
              <p className="text-xs text-orange-300 mb-1">Sodium</p>
              <p className="text-2xl font-bold text-white">{targets.sodiumPerHour}mg</p>
              <p className="text-xs text-slate-400 mt-1">per hour</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/30">
              <p className="text-xs text-purple-300 mb-1">Caffeine</p>
              <p className="text-2xl font-bold text-white">{targets.caffeineTotal}mg</p>
              <p className="text-xs text-slate-400 mt-1">total</p>
            </div>
          </div>
        </div>

        {/* Race Totals */}
        <div className="col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Race Day Totals</h3>
          <div className="p-4 rounded-lg bg-slate-800/50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Carbs</span>
              <span className="text-lg font-bold text-cyan-400">{totalCarbs}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Fluids</span>
              <span className="text-lg font-bold text-blue-400">{totalFluids}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Sodium</span>
              <span className="text-lg font-bold text-orange-400">{totalSodium}mg</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-700">
              <span className="text-sm text-slate-300 font-semibold">Duration</span>
              <span className="text-lg font-bold text-white">
                {Math.floor(targets.durationHours)}h {Math.round((targets.durationHours % 1) * 60)}m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terrain-Specific Recommendations */}
      <div className="mt-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-3">Nutrition Strategy</h3>
        <div className="space-y-2 text-xs text-slate-300">
          {terrainType === "road" && (
            <>
              <p>• <strong>Format:</strong> 70% gels, 20% sports drinks, 10% chews</p>
              <p>• <strong>Aid Stations:</strong> 15-20 second stops - grab and go</p>
              <p>• <strong>Focus:</strong> Fast absorption, maintain high intensity</p>
              <p>• <strong>Timing:</strong> Gel every 30-40 minutes, sip fluids constantly</p>
            </>
          )}
          {terrainType === "trail" && (
            <>
              <p>• <strong>Format:</strong> 40% gels, 25% real food, 25% chews/bars, 10% drinks</p>
              <p>• <strong>Aid Stations:</strong> 60 second stops - refill and grab mixed nutrition</p>
              <p>• <strong>Focus:</strong> Variety to prevent palate fatigue</p>
              <p>• <strong>Carrying:</strong> Vest with 1-1.5L capacity, varied fuel sources</p>
            </>
          )}
          {terrainType === "ultra_trail" && (
            <>
              <p>• <strong>Format:</strong> 50% real food, 20% gels, 20% chews/bars, 10% drinks</p>
              <p>• <strong>Aid Stations:</strong> 2-5 minute stops - sit, eat, refuel strategically</p>
              <p>• <strong>Focus:</strong> GI tolerance over speed, sustainable fueling</p>
              <p>• <strong>Real Food:</strong> Soup, sandwiches, fruit - gut will crave it after 4-6hrs</p>
              <p>• <strong>Sodium:</strong> Separate electrolyte capsules for flexible dosing</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
