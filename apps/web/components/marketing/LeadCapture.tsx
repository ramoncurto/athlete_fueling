"use client";

import { useState } from "react";

type LeadCaptureProps = {
  source?: string;
};

export default function LeadCapture({ source = "scenario-demo" }: LeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage(null);
    try {
      const locale = (() => {
        try {
          const seg = window.location.pathname.split("/")[1] || "en";
          return seg || "en";
        } catch {
          return "en";
        }
      })();
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, locale }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to save");
      }
      setStatus("success");
      setMessage("Thanks! We’ll send updates and tips.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm">
      <p className="font-semibold text-white">Want fueling tips and product updates?</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-cyan-500/30 sm:w-auto disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Keep me posted"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-xs ${status === "error" ? "text-red-300" : "text-cyan-300"}`}>{message}</p>
      )}
    </form>
  );
}

