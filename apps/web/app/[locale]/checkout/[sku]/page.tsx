import CheckoutButton from "@/components/checkout/CheckoutButton";
import { redirect } from "next/navigation";

const products = {
  annual: {
    title: "Athlete Annual",
    description: "$20/year - unlock every fueling workflow",
    headline: "Unlimited dashboard, plans, and kit builder access",
  },
} as const;

type CheckoutPageProps = {
  params: { sku: keyof typeof products | string };
};

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const product = products[params.sku as keyof typeof products];
  if (!product) {
    redirect('../annual');
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Checkout - {product.title}</h1>
        <p className="text-sm text-slate-300">{product.description}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">{product.headline}</p>
      </div>
      <CheckoutButton sku="annual" />
      <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-300">
        <p className="font-semibold text-slate-200">What happens next</p>
        <ul className="mt-3 space-y-1 text-xs text-slate-400">
          <li>- Redirect to our secure $20/year payment flow</li>
          <li>- Immediate dashboard unlock for Scenario Studio and Kit Builder</li>
          <li>- Access supplementation plans and gut training guidance for every event</li>
        </ul>
      </div>
    </div>
  );
}
