'use client';

import type { Event, Kit, Plan, ScenarioOutput } from "@schemas/index";

type EventAccessItem = {
  event: Event;
  plan?: Plan;
  scenario?: ScenarioOutput;
  kits: Kit[];
};

type EventAccessListProps = {
  locale: string;
  tracked: EventAccessItem[];
  available: Event[];
  athleteId: string;
  athleteWeightKg?: number;
  subscribed: boolean;
  isDemo?: boolean; // true if using demo/sample data
};

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

export default function EventAccessList({ locale, tracked, available, athleteId, athleteWeightKg, subscribed, isDemo = false }: EventAccessListProps) {
  // Combine all events into a single array with status
  const allEvents = [
    ...tracked.map(item => ({ ...item, status: 'tracked' as const })),
    ...available.map(event => ({
      event,
      plan: undefined,
      scenario: undefined,
      kits: [],
      status: 'available' as const
    }))
  ].sort((a, b) => {
    const dateA = new Date(a.event.startTimeIso).getTime();
    const dateB = new Date(b.event.startTimeIso).getTime();
    return dateA - dateB;
  });

  if (allEvents.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <p className="text-sm text-gray-600">No events available. Use Scenario Studio below to create your first plan.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Event
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Nutrition
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allEvents.map(({ event, plan, scenario, kits, status }) => {
              const scenarioTotals = scenario?.totals;
              const hasNutrition = scenarioTotals !== undefined;

              return (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{event.name}</p>
                          <p className="text-xs text-gray-500">{event.discipline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{formatDate(event.startTimeIso)}</p>
                      <p className="text-xs text-gray-500">{formatTime(event.startTimeIso)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700">{event.location}</p>
                    </td>
                    <td className="px-4 py-4">
                      {status === 'tracked' && plan ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Planned
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                          No plan
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {hasNutrition ? (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-900">{scenarioTotals.carbs}g</span> carbs
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-900">{scenarioTotals.fluids}ml</span> fluids
                          </span>
                          {kits.length > 0 && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-600">
                                {kits.length} kit{kits.length !== 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {plan && (
                          <a
                            href={`/api/plans/${plan.id}/pdf`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            title="Download PDF"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download</span>
                          </a>
                        )}
                        <a
                          href={`/${locale}/races/${event.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:shadow-md transition-shadow"
                          title="View race details"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Race</span>
                        </a>
                      </div>
                    </td>
                  </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
