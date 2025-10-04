import Link from "next/link";

export const metadata = {
  title: "Get Started | Athletic Fuel",
};

export default function GetStartedPage() {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-6">
          <h1 className="font-sans text-[3.5rem] font-black leading-[1.05] tracking-[-0.03em] text-white sm:text-[4.5rem]">
            Get started
          </h1>
          <p className="text-[17px] leading-relaxed text-slate-400">
            $20/year. Cancel anytime.
          </p>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col items-center gap-4">
          <Link
            href="../checkout/annual"
            className="inline-flex items-center rounded-full bg-white px-12 py-4 text-[14px] font-bold uppercase tracking-[0.2em] text-slate-950 transition-all duration-200 hover:bg-slate-50"
          >
            Subscribe
          </Link>
          <Link href="/en/demo" className="text-[14px] font-medium text-cyan-400 transition-colors hover:text-cyan-300">
            Access demo →
          </Link>
        </div>

        {/* Back link */}
        <Link href="/en" className="inline-flex items-center text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-400">
          ← Back
        </Link>
      </div>
    </main>
  );
}

