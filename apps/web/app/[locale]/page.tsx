import Link from "next/link";

export default function LocaleHomePage() {
  return (
    <main className="relative z-10 mx-auto flex h-screen w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
      <section className="flex flex-col items-center space-y-8">
        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1">
          <div className="h-0.5 w-0.5 animate-pulse rounded-full bg-emerald-500/60"></div>
          <span className="text-[9px] font-medium uppercase tracking-[0.35em] text-slate-500">
            Invitation Only
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-sans text-[3.5rem] font-black leading-[1.08] tracking-[-0.03em] text-white sm:text-[4.5rem] lg:text-[5.5rem]">
          Elite fueling +<br />
          supplementation.
          <br />
          <span className="text-slate-700">Not for everyone.</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slate-500">
          Individual planning and daily feedback for real improvements.
        </p>

        {/* CTA */}
        <Link
          href="/en/get-started"
          className="group relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 transition-all duration-200 hover:bg-slate-50"
        >
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-950">
            Request Access
          </span>
        </Link>

        {/* Footer note */}
        <p className="mt-4 text-[10px] tracking-wide text-slate-700">
          2 spots available
        </p>
      </section>
    </main>
  );
}
