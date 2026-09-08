import Link from "next/link";
import type { CoachTask } from "@/lib/workspace/summary";
import s from "./workspace.module.css";
export default function TaskList({ tasks, empty }: { tasks: CoachTask[]; empty: string }) {
  return tasks.length ? <ul className={s.tasks}>{tasks.map(task => <li key={task.id}><Link href={task.href}><div><strong>{task.clientName}</strong><span>{task.title}</span></div><span>{task.kind === "setup" ? "Setup" : task.due.slice(8, 10) + "/" + task.due.slice(5, 7)} <b aria-hidden="true">↗</b></span></Link></li>)}</ul> : <p className={s.empty}>{empty}</p>;
}
