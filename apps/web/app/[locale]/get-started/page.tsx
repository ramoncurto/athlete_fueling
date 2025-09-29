import Link from "next/link";

export const metadata = {
  title: "Get Started | Athletic Fuel",
};

export default function GetStartedPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Get started</h1>
        <p className="text-sm text-slate-300">Create your athlete dashboard and unlock all features for just $20/year.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-200">
          <h2 className="text-lg font-semibold text-white">1. Create your dashboard</h2>
          <p className="mt-2 text-xs text-slate-400">
            No passwords. Use your email and last name as the access code to sign in during setup.
          </p>
          <Link
            href="../auth/sign-up"
            className="mt-4 inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Create my dashboard
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-200">
          <h2 className="text-lg font-semibold text-white">2. Unlock full access</h2>
          <p className="mt-2 text-xs text-slate-400">Athlete Annual - $20/year. Cancel anytime.</p>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="../checkout/annual"
              className="inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Subscribe for $20/year
            </Link>
            <Link href="../pricing" className="text-xs text-cyan-300">
              View details
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-white">What you get</h2>
        <ul className="mt-3 space-y-1 text-xs text-slate-300">
          <li>- Athlete Dashboard with history and exports</li>
          <li>- Scenario Studio + Kit Builder</li>
          <li>- Weekly updates and intake logging</li>
        </ul>
      </div>
    </div>
  );
}

