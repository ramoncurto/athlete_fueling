import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug, getRouteById } from "@/lib/sheets/repositories";
import { RouteSchema } from "@schemas/index";

export const dynamicParams = true;

type RacePageProps = {
  params: { slug: string };
};

export default async function RacePage({ params }: RacePageProps) {
  const event = await getEventBySlug(params.slug);
  if (!event) return notFound();
  const routeRaw = await getRouteById(event.routeId);
  const route = RouteSchema.parse(routeRaw);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">{event.name}</h1>
        <p className="text-sm text-slate-300">
          {event.location} • {new Date(event.startTimeIso).toLocaleString()} • {event.climate.toUpperCase()}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-200">
          <h2 className="text-lg font-semibold text-white">Route profile</h2>
          <ul className="mt-3 space-y-1 text-xs text-slate-300">
            <li>Distance: {route.distanceKm} km</li>
            <li>Elevation gain: {route.elevationGainM} m</li>
            <li>Laps: {route.laps}</li>
            <li>Aid stations: {route.aidStations.length}</li>
          </ul>
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            {route.aidStations.map((station) => (
              <p key={station.name}>
                {station.km} km • {station.name} ({station.offerings.join(", ")})
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-200">
          <h2 className="text-lg font-semibold text-white">Recommended workflow</h2>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            <li>• Run Scenario Studio with hot vs cool presets.</li>
            <li>• Use Kit Builder to mix gels + hydration aligned with preferences.</li>
            <li>• Capture intake logs post-race for compliance review.</li>
          </ul>
          <Link
            href="../plan/scenarios"
            className="mt-4 inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Generate scenarios
          </Link>
        </div>
      </div>
    </div>
  );
}
