import { buildCoachRosterSummary } from "@/lib/coach/analytics";

export const metadata = {
  title: "Coach Dashboard | Athletic Fuel",
};

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export default async function CoachDashboardPage() {
  const roster = await buildCoachRosterSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Coach Dashboard</h1>
        <p className="text-sm text-slate-300">
          Track athlete fueling plans, scenario risk, and kit economics at a glance. Metrics update whenever scenarios or
          kits are regenerated.
        </p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/40">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Athlete</th>
              <th className="px-4 py-3 text-left">Plans</th>
              <th className="px-4 py-3 text-left">Scenarios</th>
              <th className="px-4 py-3 text-left">High risk</th>
              <th className="px-4 py-3 text-left">Avg sodium risk</th>
              <th className="px-4 py-3 text-left">Avg GI risk</th>
              <th className="px-4 py-3 text-left">Avg kit price</th>
              <th className="px-4 py-3 text-left">Latest plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {roster.map((athlete) => (
              <tr key={athlete.athleteId}>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{athlete.name}</span>
                    <span className="text-xs text-slate-400">{athlete.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{athlete.planCount}</td>
                <td className="px-4 py-3">{athlete.scenarioCount}</td>
                <td className="px-4 py-3">{athlete.highRiskScenarioCount}</td>
                <td className="px-4 py-3">{formatPercent(athlete.avgSodiumRisk)}</td>
                <td className="px-4 py-3">{formatPercent(athlete.avgGiRisk)}</td>
                <td className="px-4 py-3">${athlete.avgKitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {athlete.latestPlanAt ? new Date(athlete.latestPlanAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
