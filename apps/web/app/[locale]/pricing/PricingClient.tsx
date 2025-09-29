"use client";

type PricingTier = {
  name: string;
  price: string;
  bullets: string[];
  sku: string;
};

type PricingClientProps = {
  tiers: PricingTier[];
};

export default function PricingClient({ tiers }: PricingClientProps) {
  const startCheckout = async (sku: string) => {
    try {
      const response = await fetch("/api/billing/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });

      if (!response.ok) return;

      const { url } = (await response.json()) as { url?: string };
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("checkout session failed", error);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-200"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{tier.name}</h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">{tier.price}</span>
          </div>
          <ul className="mt-4 space-y-2 text-xs text-slate-300">
            {tier.bullets.map((bullet) => (
              <li key={bullet}>- {bullet}</li>
            ))}
          </ul>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => startCheckout(tier.sku)}
              className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-cyan-500/30"
            >
              Start checkout
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
