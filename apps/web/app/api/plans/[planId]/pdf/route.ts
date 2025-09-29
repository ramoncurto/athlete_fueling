import { NextResponse } from "next/server";
import { renderSupplementationPlanPdf } from "@/lib/pdf";
import { getPlanById, listKitsForPlan } from "@/lib/sheets/repositories";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const { planId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const kits = await listKitsForPlan(plan.id);
  const pdfBuffer = await renderSupplementationPlanPdf(plan, kits);

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${plan.id}-supplementation-plan.pdf`,
    },
  });
}

