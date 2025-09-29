"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [timezone, setTimezone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setTimezone(tz);
    } catch {}
  }, []);

  const weightValid = useMemo(() => {
    const n = Number(weightKg);
    return Number.isFinite(n) && n > 0;
  }, [weightKg]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, weightKg: Number(weightKg), timezone }),
      });
      if (!response.ok) {
        const { error: msg } = await response.json();
        throw new Error(msg || "Failed to create athlete");
      }
      setSuccess(true);

      // Low-friction: auto sign-in using the demo access code pattern (last name)
      const result = await signIn("credentials", {
        redirect: false,
        email,
        code: lastName,
      });
      if (!result?.error) {
        window.location.href = "../dashboard";
      } else {
        // Fallback: take them to sign-in with prefilled email
        window.location.href = `../auth/sign-in?email=${encodeURIComponent(email)}`;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8 text-sm text-slate-200">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Create your athlete dashboard</h1>
        <p className="text-xs text-slate-400">Quick setup. No passwords—use your last name as the access code.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
            {!weightValid && weightKg && (
              <p className="mt-1 text-[10px] text-red-300">Enter a valid weight</p>
            )}
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Timezone</label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
        {success && (
          <p className="text-xs text-cyan-300">Profile created. Finishing sign-in…</p>
        )}
        <button
          type="submit"
          disabled={!email || !firstName || !lastName || !weightValid || !timezone}
          className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-cyan-500/30 disabled:opacity-40"
        >
          Create my dashboard
        </button>
      </form>
      <p className="text-xs text-slate-400">
        Already have an account? <a href="./sign-in" className="text-cyan-300">Sign in</a>
      </p>
    </div>
  );
}

