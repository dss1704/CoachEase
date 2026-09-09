import Link from "next/link";
import s from "@/components/workspace/workspace.module.css";
const steps = [
  ["Create a client", "Open Clients, choose Add client and enter their details. You can add their primary goal at the same time."],
  ["Set goals and stats", "Open the client record. Goals holds their coaching objective; Stats holds starting, current and target weight."],
  ["Set nutrition targets", "Use Nutrition to save calories and macro targets. The calculator in Stats adds up calories from your macro inputs."],
  ["Record the week", "Use Weekly check-ins for weight, recovery and notes. Progress brings their recent entries and weight history together."],
  ["Review what is due", "Return to Notifications for missing setup details and weekly check-ins due. The dashboard gives you a quick overview."],
];
export default function GuidePage() {
  return <main className={s.page}><header className={s.pageHeader}><div><p className={s.kicker}>A quick tour</p><h1>Getting started</h1><p>Your route from a new client to their first weekly review.</p></div><Link href="/dashboard" className={s.secondary}>Go to dashboard ↗</Link></header><ol className={s.guideSteps}>{steps.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{description}</p></div></li>)}</ol><div className={s.planned}><span className={s.badge}>Coming later</span><p>Workout plans, meal plans and payment notifications have places in the workspace, but cannot be saved or connected yet.</p></div><Link className={s.primary} href="/dashboard/clients">Open clients ↗</Link></main>;
}
