import { NextRequest, NextResponse } from "next/server";
import { buildAthleteHistory } from "@lib/history/service";
import { getAthleteById } from "@lib/sheets/repositories";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> },
) {
  const { athleteId } = await params;
  const athlete = await getAthleteById(athleteId);
  if (!athlete) {
    return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
  }

  const history = await buildAthleteHistory(athleteId);
  return NextResponse.json({ athlete, history });
}
