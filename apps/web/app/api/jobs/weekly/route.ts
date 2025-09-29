import { NextResponse } from "next/server";
import { runWeeklyJob } from "@/lib/jobs/weekly";

export const runtime = "nodejs";

export async function GET() {
  const result = await runWeeklyJob();
  return NextResponse.json({
    status: "ok",
    processedAthletes: result.processed,
    details: result.athletes,
  });
}
