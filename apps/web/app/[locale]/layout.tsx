import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import AuthProvider from "@/components/auth/AuthProvider";

const locales = ["en", "es", "fr", "de"] as const;

export const metadata: Metadata = {
  title: "Athletic Fuel | Scenario Studio & Athlete Dashboard",
  description:
    "Safety-first fueling and hydration planning for endurance athletes with offline scenario studio and kits.",
};

type LocaleParams = {
  locale?: string;
};

type MaybePromise<T> = T | Promise<T>;

type LocaleLayoutProps = {
  children: ReactNode;
  params?: MaybePromise<LocaleParams | undefined>;
};

const navigation = [
  { href: "/tools/fuel-calculator", label: "Tools" },
  { href: "/plan/scenarios", label: "Scenario Studio" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coach/dashboard", label: "Coach" },
  { href: "/pricing", label: "Pricing" },
];

const isSupportedLocale = (locale?: string): locale is (typeof locales)[number] =>
  typeof locale === "string" && locales.includes(locale as (typeof locales)[number]);

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const resolvedParams = params ? await params : undefined;
  const localeCandidate = resolvedParams?.locale;
  const locale = isSupportedLocale(localeCandidate) ? localeCandidate : "en";

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link href={`/${locale}`} className="font-semibold tracking-tight">
              Athletic Fuel
            </Link>
            <nav className="flex items-center gap-6 text-sm uppercase tracking-wide text-slate-300">
              {navigation.map((item) => (
                <Link key={item.href} href={`/${locale}${item.href}`} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
              <Link
                href={`/${locale}/checkout/annual`}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/30"
              >
                Subscribe $20/year
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 pb-16 pt-10">{children}</main>
        <footer className="border-t border-slate-800 bg-slate-950/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>&copy; {new Date().getFullYear()} Athletic Fuel. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href={`/${locale}/legal/terms`}>Terms</Link>
              <Link href={`/${locale}/legal/privacy`}>Privacy</Link>
              <Link href={`/${locale}/legal/disclaimer`}>Disclaimer</Link>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
