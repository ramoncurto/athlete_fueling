import PricingClient from "./PricingClient";

type PricingTier = {
  name: string;
  price: string;
  bullets: string[];
  sku: string;
};

const tiers: PricingTier[] = [
  {
    name: "Athlete Annual",
    price: "$20 / year",
    bullets: [
      "Athlete Dashboard access",
      "Scenario Studio + Kit Builder",
      "Dashboard history, exports, and gut training guidance",
    ],
    sku: "annual",
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Pricing</h1>
        <p className="text-sm text-slate-300">
          Packages designed for endurance athletes, multi-race planners, and coaches rolling out fueling programs across
          rosters.
        </p>
      </div>
      <PricingClient tiers={tiers} />
    </div>
  );
}
