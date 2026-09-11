"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { tourPosition } from "@/lib/workspace/tour-position";
import s from "./workspace.module.css";
const TourContext = createContext({ start: () => {}, unavailable: false });
const steps = [
  { target: "clients", title: "Let’s open your clients.", description: "This is your client directory. Open it to find the people you coach and manage their records.", action: "Try it now" },
  { target: "add-client", title: "Here’s where a client starts.", description: "Try opening the form. You can add a real client, or close it to continue looking around. Nothing is saved until you choose Create client.", action: "Try the form" },
  { target: "client-record", title: "Open a client’s record.", description: "Choose a client card to see their details, goals, nutrition and progress. We’ll try a couple of their tabs together.", action: "Open a client" },
  { target: "nutrition", title: "Build their daily targets here.", description: "Open Nutrition targets. Enter a calorie goal, select a macro preset and adjust the grams. You stay in control: changes only save when you press Save nutrition targets.", action: "Try this tab" },
  { target: "check-ins", title: "Keep track of the week.", description: "This tab holds weight, recovery and notes for each week. Open it to look around; you don’t need to submit a check-in for this tour.", action: "Open check-ins" },
  { target: "notifications", title: "See what needs attention.", description: "Notifications gathers missing setup details and upcoming or overdue check-ins. Open it to see what comes next.", action: "Try it now" },
  { target: "search", title: "Find something without hunting.", description: "Open search and try a client name, food, weight or overdue. Close search when you’re ready and I’ll show you the last stop.", action: "Try searching" },
  { target: "help", title: "You can always ask for directions.", description: "Help & FAQ explains the features and holds the replay button for this guide. Let’s open it.", action: "Open Help & FAQ" },
  { target: "replay-tour", title: "You’ve found your way around.", description: "This button brings me back whenever you need a refresher. Finish now and I’ll remember that you’ve had the tour.", action: "Finish tour" },
];
type Placement = { left: number; top: number; side: string; target: { left: number; top: number; width: number; height: number } | null; missing: boolean; emptyRoster: boolean; paused: boolean };
export function TutorialProvider({ children, pending, unavailable, coachId }: { children: ReactNode; pending: boolean; unavailable: boolean; coachId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const key = `coachease-active-tour:${coachId}`;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [memoryError, setMemoryError] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const current = steps[step];
  function remember(value: number | null) { try { if (value === null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, String(value)); } catch { /* Account completion remains server-backed. */ } }
  function go(next: number) { remember(next); setPlacement(null); setError(""); setStep(next); }
  function start() { go(0); setOpen(true); }
  useEffect(() => {
    let saved: string | null = null;
    try { saved = sessionStorage.getItem(key); } catch {}
    if (saved !== null && /^\d+$/.test(saved) && Number(saved) < steps.length) { setStep(Number(saved)); setOpen(true); return; }
    if (!pending || unavailable) return;
    const controller = new AbortController();
    void fetch("/api/workspace/tutorial", { cache: "no-store", signal: controller.signal }).then(async response => {
      if (!response.ok) { if (!controller.signal.aborted) setMemoryError(true); return; }
      const status = await response.json();
      if (!controller.signal.aborted && status.pending) setOpen(true);
    }).catch(() => { if (!controller.signal.aborted) setMemoryError(true); });
    return () => controller.abort();
  }, [pending, unavailable, key]);
  useEffect(() => {
    if (!open) return;
    if (step === 2 && pathname.startsWith("/clients/")) { try { sessionStorage.setItem(key,"3"); } catch {} setStep(3); }
  }, [open, step, pathname, key]);
  useEffect(() => {
    if (!open) return;
    let frame = 0, previous = "", focused = false;
    const find = () => document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`);
    const initial = find();
    let lastTarget = initial;
    initial?.scrollIntoView({ block: window.innerWidth < 760 ? "start" : "center", inline: "nearest", behavior: "instant" });
    const update = () => {
      const target = find();
      const paused = !!document.querySelector("dialog[open]");
      if (target && target !== lastTarget && !paused) {
        lastTarget = target;
        target.scrollIntoView({ block: window.innerWidth < 760 ? "start" : "center", inline: "nearest", behavior: "instant" });
      }
      const rect = target?.getBoundingClientRect();
      const visible = !!rect && rect.width>0 && rect.height>0;
      const width = Math.min(360, window.innerWidth-24);
      const height = Math.min(panel.current?.offsetHeight || 360, window.innerHeight-24);
      const anchor = visible ? rect : { left: 12, top: 12, right: 12, bottom: 12 };
      const position = tourPosition(anchor, width, height, window.innerWidth, window.innerHeight);
      const value: Placement = { ...position, missing: !visible, emptyRoster: !!document.querySelector('[data-tour="no-clients"]'), paused, target: visible ? { left: rect.left-5, top: rect.top-5, width: rect.width+10, height: rect.height+10 } : null };
      const serialized = JSON.stringify(value);
      if (serialized !== previous) { previous = serialized; setPlacement(value); }
      if (!paused && !focused) { focused = true; title.current?.focus({ preventScroll: true }); }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
    const resize = new ResizeObserver(schedule);
    if (panel.current) resize.observe(panel.current);
    if (initial) resize.observe(initial);
    const clicked = (event: MouseEvent) => {
      const target = find();
      if (saving || step===steps.length-1 || !target || !(event.target instanceof Node) || !target.contains(event.target)) return;
      const next = step+1;
      try { sessionStorage.setItem(key,String(next)); } catch {}
      setPlacement(null); setStep(next); setError("");
    };
    document.addEventListener("click", clicked, true);
    window.addEventListener("scroll", schedule, true); window.addEventListener("resize", schedule);
    schedule();
    return () => { observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame); document.removeEventListener("click",clicked,true); window.removeEventListener("scroll",schedule,true); window.removeEventListener("resize",schedule); };
  }, [open, step, current.target, pathname, saving, key]);
  useEffect(() => {
    if (open && placement && !placement.paused) title.current?.focus({ preventScroll: true });
  }, [open, step, placement?.paused]);
  async function finish(outcome: "completed" | "skipped") {
    if (saving) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/workspace/tutorial", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outcome }) });
      if (!response.ok) throw new Error("Could not save");
      remember(null); setOpen(false); router.refresh();
    } catch { setError("We couldn’t remember your choice. Please retry, or close without saving. The guide may appear again on your next visit."); }
    finally { setSaving(false); }
  }
  function tryNow() {
    if (step === steps.length-1) { void finish("completed"); return; }
    const target = document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`);
    if (target) { target.focus({ preventScroll: true }); target.click(); }
  }
  const noClient = step===2 && placement?.emptyRoster;
  return <TourContext.Provider value={{ start, unavailable: unavailable || memoryError }}>{children}{open && <>
    {placement?.target && !placement.paused && <div className={s.tourSpotlight} style={placement.target} aria-hidden="true" />}
    <div ref={panel} role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-description" className={s.anchoredTour} data-side={placement?.side} style={{ left: placement?.left ?? 12, top: placement?.top ?? 12, visibility: !placement || placement.paused ? "hidden" : "visible" }} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); void finish("skipped"); } }}>
      <header><span className={s.guideAvatar} aria-hidden="true">🧑‍🏫</span><div><strong>Your CoachEase guide</strong><span>Learn by trying · {step+1} / {steps.length}</span></div><button aria-label="Skip tutorial" disabled={saving} onClick={() => void finish("skipped")}>×</button></header>
      <h2 id="tour-title" ref={title} tabIndex={-1}>{noClient ? "No client record yet?" : current.title}</h2>
      <p id="tour-description">{noClient ? "You can add a real client whenever you’re ready. For now, continue to Notifications; the client tabs will be here once you have a record." : current.description}</p>
      {placement?.missing && !noClient && <p className={s.tourHint}>This control isn’t on this screen yet. <button className={s.retrySearch} onClick={() => router.push("/dashboard/clients")}>Open Clients</button> or move to the next tip.</p>}
      {error && <p className={s.error} role="alert">{error}</p>}
      <footer><div>{step>0 && <button className={s.secondary} disabled={saving} onClick={() => go(step-1)}>Back</button>}<button className={s.primary} disabled={saving || (!noClient && !!placement?.missing && step !== steps.length-1)} onClick={() => noClient ? go(5) : tryNow()}>{saving ? "Saving…" : noClient ? "Continue tour" : current.action}</button></div><div><button onClick={() => void finish("skipped")} disabled={saving}>Skip tour</button>{step<steps.length-1 && !noClient && <button disabled={saving} onClick={() => go(step+1)}>Next tip →</button>}</div></footer>
      {error && <button className={s.closeTour} disabled={saving} onClick={() => { remember(null); setOpen(false); }}>Close without saving</button>}
    </div>
  </>}</TourContext.Provider>;
}
export function ReplayTutorial() {
  const { start, unavailable } = useContext(TourContext);
  return <div><button data-tour="replay-tour" className={s.primary} onClick={start}>Replay tutorial ↗</button>{unavailable && <p className={s.help} role="status">Tutorial memory is currently unavailable. You can still try the guide.</p>}</div>;
}
