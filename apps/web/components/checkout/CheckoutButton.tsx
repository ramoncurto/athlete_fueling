"use client";

import { useState } from "react";

type CheckoutButtonProps = {
  sku: string;
};

export default function CheckoutButton({ sku }: CheckoutButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [url, setUrl] = useState<string | null>(null);

  const createSession = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/billing/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = (await response.json()) as { url?: string };
      setUrl(data.url ?? null);
      setStatus("ready");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
      <button
        type="button"
        onClick={createSession}
        disabled={status === "loading"}
        className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-cyan-500/30 disabled:opacity-40"
      >
        {status === "loading" ? "Redirecting..." : "Proceed to payment"}
      </button>
      {status === "error" && (
        <p className="mt-3 text-xs text-red-300">Could not start checkout. Try again.</p>
      )}
      {status === "ready" && url && (
        <p className="mt-3 text-xs text-cyan-300">Redirecting to Stripe.</p>
      )}
    </div>
  );
}
