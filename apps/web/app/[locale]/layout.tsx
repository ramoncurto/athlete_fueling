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
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
        {/* Subtle gradient background */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-slate-950"></div>
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-3xl"></div>
        </div>

        <main className="relative z-10">{children}</main>
      </div>
    </AuthProvider>
  );
}
