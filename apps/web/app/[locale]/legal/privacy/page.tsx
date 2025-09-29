export const metadata = {
  title: "Privacy Policy | Athletic Fuel",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6 text-sm text-slate-300">
      <div>
        <h1 className="text-3xl font-semibold text-white">Privacy Policy</h1>
        <p className="text-xs uppercase tracking-wide text-slate-500">How we handle your data</p>
      </div>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Collection</h2>
        <p>
          We collect account details, fueling preferences, plan history, and kit selections to deliver the product
          experience. Payment details are processed by Stripe and never stored on our servers.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Usage</h2>
        <p>
          Data powers scenario generation, kit builder, weekly emails, and analytics events such as plan_generated or
          purchase_succeeded. We do not sell personal data.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Control</h2>
        <p>
          Export and delete options are available in the dashboard. Support requests are handled via privacy@athleticfuel.com.
        </p>
      </section>
    </div>
  );
}
