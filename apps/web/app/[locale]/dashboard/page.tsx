import PreferencesForm from "@/components/dashboard/PreferencesForm";
import HistoryTimeline from "@/components/dashboard/HistoryTimeline";
import KitSummary from "@/components/dashboard/KitSummary";
import EventAccessList from "@/components/dashboard/EventAccessList";
import GutTrainingGuide from "@/components/dashboard/GutTrainingGuide";
import ScenarioStudio from "@/components/planner/ScenarioStudio";
import { generateGutTrainingMiniPlan } from "@/lib/training/gut";
import { buildAthleteHistory } from "@/lib/history/service";
import {
  getAthleteById,
  listAthletes,
  getPreferenceByAthleteId,
  hasActiveSubscription,
  listEvents,
  getScenarioById,
} from "@/lib/sheets/repositories";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Athlete Dashboard | Athletic Fuel",
};

type PageProps = { params: { locale: string } };

const toTime = (iso: string) => {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? 0 : time;
};

export default async function DashboardPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const callback = encodeURIComponent(`/${params.locale}/dashboard`);
    redirect(`/api/auth/signin?callbackUrl=${callback}`);
  }

  const athleteId = session.user.id as string;
  const [athlete, allAthletes] = await Promise.all([
    getAthleteById(athleteId),
    listAthletes(),
  ]);
  const preference = await getPreferenceByAthleteId(athleteId);
  const [history, subscribed, events] = await Promise.all([
    buildAthleteHistory(athleteId),
    hasActiveSubscription(athleteId),
    listEvents(),
  ]);

  if (!preference) {
    return <p className="text-sm text-slate-300">No preference profile found.</p>;
  }
  if (!athlete) {
    return <p className="text-sm text-slate-300">No athlete profile found.</p>;
  }

  const eventsById = new Map(events.map((event) => [event.id, event]));
  const planByEventId = new Map<string, typeof history.plans[number]>();
  for (const plan of history.plans) {
    const existing = planByEventId.get(plan.eventId);
    if (!existing || toTime(plan.updatedAt) > toTime(existing.updatedAt)) {
      planByEventId.set(plan.eventId, plan);
    }
  }

  const kitsByPlanId = history.kits.reduce<Map<string, typeof history.kits[number][]>>((map, kit) => {
    const current = map.get(kit.planId) ?? [];
    current.push(kit);
    map.set(kit.planId, current);
    return map;
  }, new Map());

  const scenarioIds = Array.from(new Set(Array.from(planByEventId.values()).map((plan) => plan.scenarioId)));
  const scenarioRecords = await Promise.all(scenarioIds.map((scenarioId) => getScenarioById(scenarioId)));
  const scenariosById = new Map(
    scenarioRecords
      .filter((scenario): scenario is NonNullable<typeof scenario> => Boolean(scenario))
      .map((scenario) => [scenario.id, scenario]),
  );

  const trackedEvents = (
    Array.from(planByEventId.entries())
      .map(([eventId, plan]) => {
        const event = eventsById.get(eventId);
        if (!event) {
          return null;
        }
        return {
          event,
          plan,
          kits: kitsByPlanId.get(plan.id) ?? [],
          scenario: scenariosById.get(plan.scenarioId),
        };
      })
      .filter(Boolean) as {
        event: typeof events[number];
        plan: typeof history.plans[number];
        kits: typeof history.kits[number][];
        scenario?: NonNullable<typeof scenarioRecords[number]>;
      }[]
  ).sort((a, b) => toTime(a.event.startTimeIso) - toTime(b.event.startTimeIso));

  const availableEvents = events.filter((event) => !planByEventId.has(event.id));

  const primaryTracked = trackedEvents[0];
  const primaryEvent = primaryTracked?.event ?? availableEvents[0];
  const gutPlan = generateGutTrainingMiniPlan({
    athlete,
    preference,
    event: primaryEvent,
    scenario: primaryTracked?.scenario,
  });

  return (
    <div className="space-y-6">
      {!subscribed && (
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4 text-xs text-slate-300">
          <span className="font-semibold text-slate-200">Demo mode</span>
          <span className="mx-2 text-slate-500">-</span>
          <span>Subscribe to Athlete Annual for $20/year to unlock full Scenario Studio.</span>
          <a
            href="../checkout/annual"
            className="ml-3 inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-3 py-1 font-semibold text-white"
          >
            Subscribe
          </a>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-semibold text-white">Athlete Dashboard</h1>
        <p className="text-sm text-slate-300">
          Preferences feed directly into Scenario Studio and Kit Builder. History keeps every plan, kit, and intake log
          ready for compliance reviews.
        </p>
        <form method="get" className="mt-4 flex items-center gap-3 text-sm">
          <label htmlFor="athleteId" className="text-slate-400">
            Viewing history for
          </label>
          <select
            id="athleteId"
            name="athleteId"
            defaultValue={athlete.id}
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            {allAthletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500"
          >
            Switch
          </button>
        </form>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <PreferencesForm preference={preference} />
        <KitSummary kits={history.kits} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EventAccessList locale={params.locale} tracked={trackedEvents} available={availableEvents} />
        <GutTrainingGuide plan={gutPlan} />
      </div>
      <div className="space-y-3" id="scenario-studio">
        <h2 className="text-2xl font-semibold text-white">Scenario Studio</h2>
        <p className="text-sm text-slate-300">Simulate different fueling options and see how they play out for your race.</p>
        <ScenarioStudio
          athlete={{ id: athlete.id, firstName: athlete.firstName, lastName: athlete.lastName }}
          athleteWeightKg={Number(athlete.weightKg) || undefined}
          lockAthlete
          demo={!subscribed}
        />
      </div>
      <HistoryTimeline plans={history.plans} intake={history.intakeEvents} />
    </div>
  );
}
