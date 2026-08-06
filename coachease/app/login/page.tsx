"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ACCENT = "#B7FF3C";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#050505,#101010_55%,#080b04)]" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-white/20" />

      <Link
        href="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-3 font-bold tracking-[-0.04em] lg:left-10 lg:top-8"
      >
        <span
          className="flex h-8 w-8 items-center justify-center text-xs font-black text-black"
          style={{ backgroundColor: ACCENT }}
        >
          CE
        </span>

        <span className="text-xl">CoachEase</span>
      </Link>

      <section className="relative z-10 w-full max-w-md border border-white/20 bg-[#090909]">
        <div className="border-b border-white/20 px-7 py-6">
          <p
            className="font-mono text-[11px] font-bold uppercase tracking-[0.24em]"
            style={{ color: ACCENT }}
          >
            Authorised access
          </p>

          <h1 className="mt-4 text-4xl font-black uppercase tracking-[-0.05em]">
            Coach login
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Enter your CoachEase workspace credentials.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 p-7">
          <div>
            <label
              htmlFor="email"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-3 w-full border border-white/20 bg-black px-4 py-4 outline-none transition focus:border-white"
              placeholder="coach@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-3 w-full border border-white/20 bg-black px-4 py-4 outline-none transition focus:border-white"
              placeholder="Enter your password"
            />
          </div>

          {errorMessage && (
            <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 font-bold text-black transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: ACCENT }}
          >
            {loading ? "Authenticating..." : "Enter workspace"}
          </button>
        </form>

        <div className="border-t border-white/20 px-7 py-5">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500 transition hover:text-white"
          >
            ← Return to website
          </Link>
        </div>
      </section>
    </main>
  );
}