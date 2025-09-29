"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const presetEmail = params.get("email");
      if (presetEmail) setEmail(presetEmail);
    } catch {}
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      code,
    });
    if (result?.error) {
      setError(result.error);
    } else if (!result?.error) {
      window.location.href = "../dashboard";
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8 text-sm text-slate-200">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>
        <p className="text-xs text-slate-400">Use your athlete email and your access code (default: last name).</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-500">Access code</label>
          <input
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-cyan-500/30"
        >
          Continue
        </button>
      </form>
      <p className="text-xs text-slate-400">
        New here? <a href="./sign-up" className="text-cyan-300">Create your dashboard</a>
      </p>
    </div>
  );
}
