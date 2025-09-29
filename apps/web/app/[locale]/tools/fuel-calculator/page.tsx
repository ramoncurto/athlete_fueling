import FuelCalculatorClient from "./FuelCalculatorClient";

export const metadata = {
  title: "Fuel Calculator | Athletic Fuel",
};

export default function FuelCalculatorPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Fuel Calculator</h1>
        <p className="text-sm text-slate-300">
          Estimate safe carbs, fluids, sodium, and caffeine targets. Leave your email to unlock the full PDF with kit
          suggestions.
        </p>
      </div>
      <FuelCalculatorClient />
    </div>
  );
}
