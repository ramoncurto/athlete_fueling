import { NextRequest, NextResponse } from "next/server";
import { listAthletes, listEvents } from "@/lib/sheets/repositories";
import { seedData } from "@/lib/data";

export async function GET(request: NextRequest) {
  const demo = ["1", "true", "yes"].includes(String(request.nextUrl.searchParams.get("demo") ?? ""));
  if (demo) {
    return NextResponse.json({
      athletes: seedData.athletes.map((x) => ({ id: x.id, firstName: x.firstName, lastName: x.lastName })),
      events: seedData.events.map((x) => ({ id: x.id, name: x.name })),
    });
  }

  const [athletes, events] = await Promise.all([listAthletes(), listEvents()]);
  const haveData = athletes.length > 0 && events.length > 0;

  const a = haveData ? athletes : seedData.athletes;
  const e = haveData ? events : seedData.events;

  return NextResponse.json({
    athletes: a.map((x) => ({ id: x.id, firstName: x.firstName, lastName: x.lastName })),
    events: e.map((x) => ({ id: x.id, name: x.name })),
  });
}
