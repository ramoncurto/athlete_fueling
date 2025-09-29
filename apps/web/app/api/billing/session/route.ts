import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const SKU_TO_PRICE: Record<string, number> = {
  annual: 2000, // $20 / year
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = (typeof body === "object" && body !== null) ? (body as Record<string, unknown>) : {};
    const candidate = typeof payload.sku === "string" ? payload.sku : undefined;
    if (candidate && candidate !== "annual") {
      return NextResponse.json(
        { error: "Only the $20 annual subscription is available" },
        { status: 400 },
      );
    }
    const sku = candidate ?? "annual";
    const amount = SKU_TO_PRICE[sku];

    const sessionId = `cs_test_${randomUUID()}`;
    const checkoutUrl = `https://checkout.example.com/${sessionId}`;

    return NextResponse.json({
      sessionId,
      amount,
      currency: "usd",
      url: checkoutUrl,
    });
  } catch (error) {
    console.error("/api/billing/session", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
