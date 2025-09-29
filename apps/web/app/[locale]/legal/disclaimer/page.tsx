export const metadata = {
  title: "Disclaimer | Athletic Fuel",
};

export default function DisclaimerPage() {
  return (
    <div className="space-y-6 text-sm text-slate-300">
      <div>
        <h1 className="text-3xl font-semibold text-white">Disclaimer</h1>
        <p className="text-xs uppercase tracking-wide text-slate-500">Safety-first fueling guidance</p>
      </div>
      <section className="space-y-2">
        <p>
          Athletic Fuel is intended for healthy adults engaged in endurance sports. Consult a physician or sports dietitian
          before implementing any fueling or supplementation program, especially if you have medical conditions.
        </p>
        <p>
          The Scenario Studio and Kit Builder provide guardrails based on industry research but cannot account for every
          individual response. Monitor your body, adapt, and discontinue any strategy that triggers adverse symptoms.
        </p>
      </section>
    </div>
  );
}
