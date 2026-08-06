"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ACCENT = "#B7FF3C";

export default function Home() {
  const [contentVisible, setContentVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setContentVisible(true);
    }, 500);

    function handleScroll() {
      const progress = Math.min(window.scrollY / 650, 1);
      setScrollProgress(progress);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const videoOpacity = contentVisible
    ? Math.max(0.28, 0.5 - scrollProgress * 0.18)
    : 1;

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{ opacity: videoOpacity }}
        className="fixed inset-0 h-full w-full object-cover transition-opacity duration-[1800ms]"
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15),rgba(0,0,0,0.2)_45%,rgba(0,0,0,0.85))]" />

      <div
        className={`relative z-10 transition-all duration-[1800ms] ${
          contentVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0"
        }`}
      >
        {/* Navigation */}
        <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/15 bg-black/40 backdrop-blur-lg">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 lg:px-10">
            <Link
              href="/"
              className="flex items-center gap-3 font-bold tracking-[-0.04em]"
            >
              <span
                className="flex h-8 w-8 items-center justify-center border text-xs font-black text-black"
                style={{
                  backgroundColor: ACCENT,
                  borderColor: ACCENT,
                }}
              >
                CE
              </span>

              <span className="text-xl">CoachEase</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="border border-white/25 px-5 py-2.5 text-sm font-medium transition hover:bg-white hover:text-black"
              >
                Coach login
              </Link>

              <a
                href="#system"
                className="px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-90"
                style={{ backgroundColor: ACCENT }}
              >
                See the system
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative flex min-h-screen items-center px-6 pb-24 pt-32 lg:px-10">
          <div className="mx-auto w-full max-w-[1500px]">
            <div className="max-w-6xl">
              <p
                className="mb-7 font-mono text-xs font-bold uppercase tracking-[0.28em]"
                style={{ color: ACCENT }}
              >
                Coaching business control system
              </p>

              <h1 className="max-w-6xl text-6xl font-black uppercase leading-[0.88] tracking-[-0.065em] sm:text-7xl lg:text-[104px]">
                50 clients.
                <br />
                One coach.
                <br />

                <span style={{ color: ACCENT }}>Zero chaos.</span>
              </h1>

              <div className="mt-9 grid max-w-4xl gap-8 border-l-2 border-white/30 pl-6 md:grid-cols-[1fr_auto] md:items-end">
                <p className="max-w-2xl text-lg leading-relaxed text-zinc-200 sm:text-xl">
                  Client plans, check-ins, progress and decisions — controlled
                  from one place.
                </p>

                <a
                  href="#system"
                  className="inline-flex min-w-52 items-center justify-between border border-white bg-white px-6 py-4 font-bold text-black transition hover:bg-transparent hover:text-white"
                >
                  Enter the system
                  <span aria-hidden="true">↘</span>
                </a>
              </div>
            </div>
          </div>

          {/* Data overlays revealed by scrolling */}
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              opacity: scrollProgress,
            }}
          >
            <DataLabel
              className="left-[7%] top-[30%]"
              label="ACTIVE CLIENTS"
              value="48"
              offset={scrollProgress * 20}
            />

            <DataLabel
              className="right-[7%] top-[32%]"
              label="CHECK-INS DUE"
              value="12"
              offset={scrollProgress * -20}
            />

            <DataLabel
              className="bottom-[22%] left-[13%]"
              label="NEED ATTENTION"
              value="04"
              offset={scrollProgress * 14}
            />

            <DataLabel
              className="bottom-[20%] right-[13%]"
              label="AVG. ADHERENCE"
              value="91%"
              offset={scrollProgress * -14}
            />

            <div
              className="absolute left-1/2 top-[22%] h-[55%] w-px -translate-x-1/2 bg-white/20"
              style={{
                transform: `translateX(-50%) scaleY(${scrollProgress})`,
                transformOrigin: "top",
              }}
            />

            <div
              className="absolute left-[12%] top-1/2 h-px w-[76%] bg-white/20"
              style={{
                transform: `scaleX(${scrollProgress})`,
              }}
            />
          </div>

          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/65">
            Scroll to reveal the operation
          </div>
        </section>

        {/* System workflow */}
        <section
          id="system"
          className="relative border-t border-white/20 bg-[#080808] px-6 py-28 lg:px-10"
        >
          <div className="mx-auto max-w-[1500px]">
            <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr]">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <p
                  className="font-mono text-xs font-bold uppercase tracking-[0.28em]"
                  style={{ color: ACCENT }}
                >
                  Workflow 01
                </p>

                <h2 className="mt-5 max-w-xl text-5xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">
                  Stop rebuilding the same plan.
                </h2>

                <p className="mt-7 max-w-lg text-lg leading-relaxed text-zinc-400">
                  A client asks for one change. CoachEase adjusts the plan,
                  protects the targets and updates everything connected to it.
                </p>

                <div className="mt-10 border-t border-white/20 pt-6 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                  One request → one decision → every system updated
                </div>
              </div>

              <div className="border border-white/20 bg-black">
                <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                      Client request
                    </p>

                    <p className="mt-1 font-semibold">Emily Brown · Week 6</p>
                  </div>

                  <span
                    className="px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-black"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Action required
                  </span>
                </div>

                <div className="border-b border-white/20 p-6 sm:p-8">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Message received · 09:41
                  </p>

                  <blockquote className="mt-4 max-w-3xl text-2xl font-medium leading-relaxed sm:text-3xl">
                    “Can I replace the chicken in Wednesday&apos;s lunch? I
                    can&apos;t face eating it again.”
                  </blockquote>
                </div>

                <div className="grid border-b border-white/20 lg:grid-cols-2">
                  <FoodPanel
                    title="Current selection"
                    food="Chicken breast"
                    amount="180 g"
                    calories="297 kcal"
                    protein="56 g protein"
                    muted
                  />

                  <FoodPanel
                    title="Recommended replacement"
                    food="Turkey breast"
                    amount="190 g"
                    calories="294 kcal"
                    protein="57 g protein"
                  />
                </div>

                <div className="grid gap-px bg-white/20 sm:grid-cols-3">
                  <SystemUpdate
                    number="01"
                    title="Meal updated"
                    text="Wednesday lunch changes automatically."
                  />

                  <SystemUpdate
                    number="02"
                    title="Targets protected"
                    text="Calories and protein remain aligned."
                  />

                  <SystemUpdate
                    number="03"
                    title="List synchronised"
                    text="The shopping list adjusts instantly."
                  />
                </div>

                <div className="flex flex-col justify-between gap-5 border-t border-white/20 bg-[#0d0d0d] p-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                      Proposed impact
                    </p>

                    <p className="mt-2 text-sm text-zinc-300">
                      −3 kcal · +1 g protein · no other meals affected
                    </p>
                  </div>

                  <button
                    className="px-7 py-4 font-bold text-black transition hover:brightness-90"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Approve replacement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Attention dashboard */}
        <section className="border-t border-white/20 bg-black px-6 py-28 lg:px-10">
          <div className="mx-auto max-w-[1500px]">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p
                  className="font-mono text-xs font-bold uppercase tracking-[0.28em]"
                  style={{ color: ACCENT }}
                >
                  Workflow 02
                </p>

                <h2 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">
                  Know who needs you.
                  <br />
                  Before opening WhatsApp.
                </h2>
              </div>

              <p className="max-w-xl text-lg leading-relaxed text-zinc-400 lg:justify-self-end">
                Your dashboard does not show you everything. It shows you what
                matters next.
              </p>
            </div>

            <div className="mt-14 border border-white/20">
              <div className="grid gap-px bg-white/20 md:grid-cols-4">
                <SharpMetric label="Active clients" value="48" detail="+6" />

                <SharpMetric
                  label="Requires attention"
                  value="04"
                  detail="Now"
                  accent
                />

                <SharpMetric
                  label="Check-ins due"
                  value="12"
                  detail="This week"
                />

                <SharpMetric
                  label="Adherence"
                  value="91%"
                  detail="+4%"
                />
              </div>

              <div className="grid border-t border-white/20 lg:grid-cols-[200px_1fr]">
                <aside className="border-b border-white/20 bg-[#080808] p-5 lg:border-b-0 lg:border-r">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    Priority view
                  </p>

                  <div className="mt-6 space-y-2 font-mono text-xs uppercase tracking-wider">
                    <div
                      className="border-l-2 py-2 pl-3 text-white"
                      style={{ borderColor: ACCENT }}
                    >
                      Needs attention
                    </div>

                    <div className="border-l-2 border-transparent py-2 pl-3 text-zinc-600">
                      All clients
                    </div>

                    <div className="border-l-2 border-transparent py-2 pl-3 text-zinc-600">
                      Check-ins
                    </div>

                    <div className="border-l-2 border-transparent py-2 pl-3 text-zinc-600">
                      Plans
                    </div>
                  </div>
                </aside>

                <div>
                  <PriorityRow
                    number="01"
                    name="Emily Brown"
                    issue="Weight plateau detected"
                    detail="14-day average unchanged despite 92% adherence"
                    action="Review target"
                  />

                  <PriorityRow
                    number="02"
                    name="James Smith"
                    issue="Check-in overdue"
                    detail="Submission expected 2 days ago"
                    action="Send reminder"
                  />

                  <PriorityRow
                    number="03"
                    name="Michael Ward"
                    issue="Meal change requested"
                    detail="Replacement waiting for coach approval"
                    action="Open request"
                  />

                  <PriorityRow
                    number="04"
                    name="Sarah Jones"
                    issue="Rapid weight decline"
                    detail="Weekly loss is 0.8 kg above target"
                    action="Adjust plan"
                    last
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="border-t border-white/20 bg-[#0a0a0a] px-6 py-32 lg:px-10">
          <div className="mx-auto max-w-[1500px]">
            <p
              className="font-mono text-xs font-bold uppercase tracking-[0.28em]"
              style={{ color: ACCENT }}
            >
              The principle
            </p>

            <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <h2 className="max-w-5xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-[92px]">
                More clients should not mean more admin.
              </h2>

              <div className="border-l border-white/25 pl-7">
                <p className="text-lg leading-relaxed text-zinc-400">
                  CoachEase gives online coaches the leverage to grow without
                  degrading the service their clients receive.
                </p>

                <a
                  href="#contact"
                  className="mt-8 inline-flex items-center gap-6 border-b-2 pb-2 font-bold uppercase tracking-wide"
                  style={{ borderColor: ACCENT }}
                >
                  See whether it fits your business
                  <span style={{ color: ACCENT }}>→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          id="contact"
          className="border-t border-white/20 bg-black px-6 py-28 lg:px-10"
        >
          <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p
                className="font-mono text-xs font-bold uppercase tracking-[0.28em]"
                style={{ color: ACCENT }}
              >
                Start the conversation
              </p>

              <h2 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">
                Find out how many hours your current system is costing you.
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                className="min-w-56 px-8 py-4 font-bold text-black transition hover:brightness-90"
                style={{ backgroundColor: ACCENT }}
              >
                Book a walkthrough
              </button>

              <Link
                href="/login"
                className="min-w-56 border border-white/30 px-8 py-4 text-center font-bold transition hover:bg-white hover:text-black"
              >
                Existing coach login
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/20 bg-black px-6 py-8 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600 lg:px-10">
          <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 sm:flex-row">
            <span>© 2026 CoachEase</span>
            <span>Built for coaches who intend to scale</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function DataLabel({
  className,
  label,
  value,
  offset,
}: {
  className: string;
  label: string;
  value: string;
  offset: number;
}) {
  return (
    <div
      className={`absolute border-l-2 border-white/40 pl-4 ${className}`}
      style={{ transform: `translateY(${offset}px)` }}
    >
      <p className="font-mono text-[10px] tracking-[0.2em] text-white/60">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function FoodPanel({
  title,
  food,
  amount,
  calories,
  protein,
  muted = false,
}: {
  title: string;
  food: string;
  amount: string;
  calories: string;
  protein: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`p-6 sm:p-8 ${
        muted
          ? "border-b border-white/20 bg-[#0b0b0b] lg:border-b-0 lg:border-r"
          : "bg-[#11150d]"
      }`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>

      <div className="mt-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-bold">{food}</p>
          <p className="mt-2 text-zinc-500">{amount}</p>
        </div>

        {!muted && (
          <span
            className="font-mono text-xs font-bold uppercase tracking-wider"
            style={{ color: ACCENT }}
          >
            Matched
          </span>
        )}
      </div>

      <div className="mt-8 flex gap-6 border-t border-white/15 pt-5 font-mono text-sm text-zinc-400">
        <span>{calories}</span>
        <span>{protein}</span>
      </div>
    </div>
  );
}

function SystemUpdate({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-[#090909] p-6">
      <p
        className="font-mono text-xs font-bold"
        style={{ color: ACCENT }}
      >
        {number}
      </p>

      <h3 className="mt-5 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{text}</p>
    </div>
  );
}

function SharpMetric({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[#090909] p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>

      <div className="mt-6 flex items-end justify-between gap-4">
        <p
          className="text-5xl font-black tracking-[-0.06em]"
          style={accent ? { color: ACCENT } : undefined}
        >
          {value}
        </p>

        <p className="font-mono text-xs text-zinc-500">{detail}</p>
      </div>
    </div>
  );
}

function PriorityRow({
  number,
  name,
  issue,
  detail,
  action,
  last = false,
}: {
  number: string;
  name: string;
  issue: string;
  detail: string;
  action: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid gap-5 p-6 transition hover:bg-white/[0.035] md:grid-cols-[50px_1fr_1.2fr_auto] md:items-center ${
        last ? "" : "border-b border-white/20"
      }`}
    >
      <span className="font-mono text-xs text-zinc-600">{number}</span>

      <div>
        <p className="font-bold">{name}</p>
        <p className="mt-1 text-sm text-zinc-500">{issue}</p>
      </div>

      <p className="text-sm leading-relaxed text-zinc-400">{detail}</p>

      <button
        className="justify-self-start border-b pb-1 text-sm font-bold md:justify-self-end"
        style={{ borderColor: ACCENT }}
      >
        {action}
      </button>
    </div>
  );
}