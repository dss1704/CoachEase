import Link from "next/link";
import s from "@/components/workspace/workspace.module.css";
const steps = [
  ["Create a client", "Start with the person.", "Open Clients, choose Add client and enter their details. Add their primary goal at the same time.", "Client details"],
  ["Set goals and stats", "Give the plan a direction.", "Open the client record. Goals holds their coaching objective; Stats holds starting, current and target weight.", "Goals + baseline"],
  ["Set nutrition targets", "Build their daily targets.", "Enter a calorie goal, choose a macro preset and refine the grams. Save the targets when you are ready.", "Calories + macros"],
  ["Record the week", "Keep a useful history.", "Use Weekly check-ins for weight, recovery and notes. Progress brings recent entries and weight history together.", "Weekly check-ins"],
  ["Review what is due", "Know what comes next.", "Notifications shows missing setup details and weekly check-ins due. The dashboard gives you a quick overview.", "Your next actions"],
];
export default function GuidePage() {
  return <main className={s.page}><header className={s.pageHeader}><div><p className={s.kicker}>The essentials / 5 steps</p><h1>Getting started</h1><p>From a new client to their first weekly review.</p></div><Link href="/dashboard/clients" className={s.primary}>Open clients ↗</Link></header><ol className={s.guideCards}>{steps.map(([title, lead, description, tag], index) => <li key={title}><div className={s.guideIndex}><span>0{index + 1}</span><small>{tag}</small></div><div><p className={s.kicker}>{title}</p><h2>{lead}</h2><p>{description}</p>{index === 0 && <Link href="/dashboard/clients">Go to clients ↗</Link>}{index === 4 && <Link href="/dashboard/notifications">View notifications ↗</Link>}</div></li>)}</ol><div className={s.planned}><span className={s.badge}>Coming later</span><h2>Room to grow.</h2><p>Workout plans, meal plans and payment notifications have places in the workspace, but cannot be saved or connected yet.</p></div></main>;
}
