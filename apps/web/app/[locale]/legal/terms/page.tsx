export const metadata = {
  title: "Terms of Service | Athletic Fuel",
};

export default function TermsPage() {
  return (
    <div className="space-y-6 text-sm text-slate-300">
      <div>
        <h1 className="text-3xl font-semibold text-white">Terms of Service</h1>
        <p className="text-xs uppercase tracking-wide text-slate-500">Effective September 2025</p>
      </div>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Scope</h2>
        <p>
          Athletic Fuel provides fueling and hydration planning tools, downloadable PDFs, and kit recommendations for
          endurance athletes. We are not a medical provider and do not offer personalized medical advice.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Subscriptions & billing</h2>
        <p>
          Athlete Annual is a single $20/year subscription. You can cancel at any time and access remains active until the
          end of the billing period. Refunds are available within 7 days if you have not generated a personalized plan.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Data usage</h2>
        <p>
          Preference profiles, plans, kits, and intake logs are stored to power the dashboard. You may export or delete
          your data at any time from the dashboard privacy controls.
        </p>
      </section>
    </div>
  );
}
