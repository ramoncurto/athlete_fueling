import ScenarioStudio from "@/components/planner/ScenarioStudio";
import LeadCapture from "@/components/marketing/LeadCapture";
import Link from "next/link";

export const metadata = {
  title: "Scenario Studio | Athletic Fuel",
};

export default function ScenarioStudioPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Scenario Studio</h1>
        <p className="text-sm text-slate-300">
          Compare multiple fueling strategies side-by-side. Safety guardrails, kit implications, and Monte Carlo risk are
          computed in seconds. Subscribe to Athlete Annual ($20/year) to unlock downloads for your own data.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4 text-xs text-slate-300">
        This page shows sample data so you can explore how plans are generated.
        <span className="mx-1">Create an account to see your own personalized results</span>
        <span>and unlock exports.</span>
        <div className="mt-3 flex gap-3">
          <Link
            href="../auth/sign-up"
            className="inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Create your dashboard
          </Link>
          <Link href="../get-started" className="text-xs text-cyan-300">
            Get started
          </Link>
        </div>
      </div>
      <ScenarioStudio demoSource lockAthlete={false} />
      <LeadCapture />
    </div>
  );
}
