import DashboardPageClient, { type DashboardData } from '@/components/dashboard/DashboardPageClient';
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

async function getDashboardData(params: PageProps['params']) {
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

  if (!preference || !athlete) {
    return null;
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

  return {
    athlete,
    allAthletes,
    preference,
    history,
    subscribed,
    trackedEvents,
    availableEvents,
    gutPlan,
    params
  };
}


export default async function DashboardPage({ params }: PageProps) {
  const data = await getDashboardData(params);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-slate-300">No athlete or preference profile found.</p>
        </div>
      </div>
    );
  }

  return <DashboardPageClient data={data as DashboardData} />;
}