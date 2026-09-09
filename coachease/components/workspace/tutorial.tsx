"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import s from "./workspace.module.css";
const TourContext = createContext({ start: () => {}, unavailable: false });
const steps = [
  { title: "Welcome to your workspace.", description: "A quick tour of the places you will use to manage your clients. You can skip now and replay from Help & FAQ whenever you need it.", section: "Dashboard", items: ["Client totals", "Requires attention", "Weekly check-ins"] },
  { title: "Start with your clients.", description: "Choose Clients in the sidebar, then Add client. Open any client card to manage their details, goals, weight and coaching notes.", section: "Clients → Client record", items: ["Details & goals", "Stats & weight", "Coaching notes"] },
  { title: "Set their daily targets.", description: "In a client record, open Nutrition targets. Enter calories, select a macro split and fine-tune the grams. Save nutrition targets to keep the plan on their record.", section: "Client → Nutrition targets", items: ["1. Set calories", "2. Choose a split", "3. Refine & save"] },
  { title: "Record and review the week.", description: "Weekly check-ins records weight, recovery and notes. Progress shows their history. Notifications lists missing setup details and check-ins due seven days after the last entry.", section: "Check-ins + Notifications", items: ["Record the week", "Review progress", "Follow up on tasks"] },
  { title: "Find your way, any time.", description: "Use the search at the top to find clients, features and answers. Try food, weight or overdue. Help & FAQ contains practical answers and a button to replay this tour.", section: "Search + Help & FAQ", items: ["Client names", "Feature keywords", "Answers & tutorial"] },
];
export function TutorialProvider({ children, pending, unavailable }: { children: ReactNode; pending: boolean; unavailable: boolean }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [memoryError, setMemoryError] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  // Recheck before auto-opening so cached layouts cannot replay a finished tour.
  useEffect(() => {
    if (!pending || unavailable) return;
    const controller = new AbortController();
    void fetch("/api/workspace/tutorial", { cache: "no-store", signal: controller.signal }).then(async response => {
      if (!response.ok) { if (!controller.signal.aborted) setMemoryError(true); return; }
      const status = await response.json();
      if (!controller.signal.aborted && status.pending) setOpen(true);
    }).catch(() => { if (!controller.signal.aborted) setMemoryError(true); });
    return () => controller.abort();
  }, [pending, unavailable]);
  useEffect(() => { if (open) { if (!dialog.current?.open) dialog.current?.showModal(); title.current?.focus(); } else dialog.current?.close(); }, [open, step]);
  async function finish(outcome: "completed" | "skipped") {
    if (saving) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/workspace/tutorial", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outcome }) });
      if (!response.ok) throw new Error("Could not save");
      setOpen(false); router.refresh();
    } catch { setError("We could not remember your choice. Retry, or close for now. Closing without saving may show the tour again on your next visit."); }
    finally { setSaving(false); }
  }
  const current = steps[step];
  return <TourContext.Provider value={{ start: () => { setStep(0); setError(""); setOpen(true); }, unavailable: unavailable || memoryError }}>{children}<dialog ref={dialog} className={`${s.dialog} ${s.tourDialog}`} aria-labelledby="tour-title" aria-describedby="tour-description" onCancel={event => { event.preventDefault(); void finish("skipped"); }}>
    <div className={s.tourVisual}><span className={s.kicker}>CoachEase / Quick tour</span><div className={s.tourNumber}>0{step+1}<span> / 05</span></div><p>{current.section}</p><div className={s.tourChips}>{current.items.map(item => <span key={item}>{item}</span>)}</div></div>
    <div className={s.tourBody}><p className={s.kicker}>Step {step+1} of {steps.length}</p><h2 ref={title} tabIndex={-1} id="tour-title">{current.title}</h2><p id="tour-description" className={s.help}>{current.description}</p><div className={s.tourDots} aria-hidden="true">{steps.map((_,index) => <i key={index} data-active={index <= step} />)}</div>
      {error && <p role="alert" className={s.error}>{error}</p>}
      <footer><button className={s.secondary} disabled={saving} onClick={() => void finish("skipped")}>{saving ? "Saving…" : "Skip tour"}</button><div>{step>0 && <button className={s.secondary} disabled={saving} onClick={() => setStep(step-1)}>Back</button>}<button className={s.primary} disabled={saving} onClick={() => step < steps.length-1 ? setStep(step+1) : void finish("completed")}>{step < steps.length-1 ? "Next →" : saving ? "Saving…" : "Finish tour"}</button></div></footer>{error && <button className={s.closeTour} onClick={() => setOpen(false)} disabled={saving}>Close without saving</button>}
    </div></dialog></TourContext.Provider>;
}
export function ReplayTutorial() {
  const { start, unavailable } = useContext(TourContext);
  return <div><button className={s.primary} onClick={start}>Replay tutorial ↗</button>{unavailable && <p className={s.help} role="status">Tutorial memory is currently unavailable. The workspace owner needs to check the onboarding setup in Supabase. You can still view the tour.</p>}</div>;
}
