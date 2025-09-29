import { NextRequest, NextResponse } from "next/server";
import { buildAthleteHistory } from "@lib/history/service";
import { getAthleteById } from "@lib/sheets/repositories";

const toCsv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header])).join(","));
  }
  return lines.join("\n");
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> },
) {
  const { athleteId } = await params;
  const athlete = await getAthleteById(athleteId);
  if (!athlete) {
    return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
  }

  const history = await buildAthleteHistory(athleteId);
  const format = request.nextUrl.searchParams.get("format") ?? "json";

  if (format === "csv") {
    const rows = history.intakeEvents.map((event) => ({
      happenedAt: event.happenedAt,
      carbs: event.carbsG,
      fluids: event.fluidsMl,
      sodium: event.sodiumMg,
      caffeine: event.caffeineMg,
      notes: event.notes ?? "",
    }));
    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=athlete-${athleteId}-intake.csv`,
      },
    });
  }

  return NextResponse.json({ athlete, history });
}
