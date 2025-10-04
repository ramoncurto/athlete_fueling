import { notFound } from "next/navigation";
import { getEventBySlug, getRouteById, getAthleteByEmail } from "@/lib/sheets/repositories";
import { RouteSchema } from "@schemas/index";
import { RaceDetailClient } from "./RaceDetailClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export const dynamicParams = true;

type RacePageProps = {
  params: { slug: string };
};

export default async function RacePage({ params }: RacePageProps) {
  const event = await getEventBySlug(params.slug);
  if (!event) return notFound();

  const routeRaw = await getRouteById(event.routeId);
  const route = RouteSchema.parse(routeRaw);

  // Get authenticated athlete if logged in
  const session = await getServerSession(authOptions);
  const athlete = session?.user?.email
    ? await getAthleteByEmail(session.user.email)
    : undefined;

  return <RaceDetailClient event={event} route={route} athlete={athlete} />;
}
