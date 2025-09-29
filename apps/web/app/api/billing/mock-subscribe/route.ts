import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { recordOrder } from "@/lib/sheets/repositories";
import { OrderSchema } from "@/lib/schemas/index";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const athleteId = session?.user?.id as string | undefined;

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Mock Subscribe (dev)</title>
      <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",sans-serif;padding:24px;background:#0b1220;color:#e5e7eb} button{background:#0891b2;color:white;border:none;border-radius:9999px;padding:10px 16px;font-weight:600} pre{background:#0f172a;padding:12px;border-radius:12px;white-space:pre-wrap}</style>
    </head>
    <body>
      <h1>Mock Subscribe (dev)</h1>
      <p>Environment: <code>${process.env.NODE_ENV}</code></p>
      <p>${athleteId ? `Signed in as <code>${athleteId}</code>` : "Not signed in — open /api/auth/signin first."}</p>
      <button id="run">Create paid annual order</button>
      <pre id="out"></pre>
      <script>
        document.getElementById('run').addEventListener('click', async () => {
          const res = await fetch(window.location.href, { method: 'POST' });
          const txt = await res.text();
          try { document.getElementById('out').textContent = JSON.stringify(JSON.parse(txt), null, 2); }
          catch { document.getElementById('out').textContent = txt; }
        });
      </script>
    </body>
  </html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function POST() {
  // Dev-only safety
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const athleteId = session?.user?.id as string | undefined;
  if (!athleteId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const order = OrderSchema.parse({
      id: `order-${randomUUID()}`,
      athleteId,
      sku: "annual",
      amount: 2000,
      currency: "usd",
      status: "paid",
      createdAt: new Date().toISOString(),
      metadata: {},
    });

    const stored = await recordOrder(order);
    return NextResponse.json({ ok: true, order: stored });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
