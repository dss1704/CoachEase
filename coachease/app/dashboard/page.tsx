import Link from "next/link";
import { workspaceData } from "@/lib/workspace/data";
import AddClient from "@/components/workspace/add-client";
import TaskList from "@/components/workspace/tasks";
import s from "@/components/workspace/workspace.module.css";

export default async function Dashboard() {
  const { clients, clientError, checkInError, summary } = await workspaceData();
  return <main className={s.page}>
    <header className={s.pageHeader}><div><p className={s.kicker}>Your coaching day</p><h1>Dashboard</h1><p>The people, the progress and what needs you next.</p></div><AddClient /></header>
    {clientError ? <p role="alert" className={s.error}>Could not load your clients. Refresh to try again.</p> : <>
      {checkInError && <p role="alert" className={s.error}>Check-ins could not be loaded. Check-in counts and reminders are unavailable until you refresh successfully.</p>}
      <section className={s.metrics} aria-label="Workspace summary">
        <Link href="/dashboard/clients"><span>Total clients</span><strong>{clients.length}</strong><small>In your workspace ↗</small></Link>
        <Link href="/dashboard/notifications"><span>Requires attention</span><strong>{summary.attention}</strong><small>Clients with outstanding tasks ↗</small></Link>
        <Link href="/dashboard/notifications"><span>Check-ins due</span><strong>{summary.due ?? "—"}</strong><small>Weekly cadence ↗</small></Link>
        <Link href="/dashboard/clients"><span>Checked in this week</span><strong>{summary.completed ?? "—"}</strong><small>Clients with a record since Monday ↗</small></Link>
      </section>
      <Link href="/dashboard/guide" className={s.guideBanner}><div><span className={s.kicker}>Getting started</span><h2>{clients.length ? "Find your way around the workspace." : "Set up your first client."}</h2><p>A short guide to clients, goals, nutrition and check-ins.</p></div><span aria-hidden="true">↗</span></Link>
      <div className={s.dashboardGrid}>
        <section className={s.panel}><div className={s.panelHeader}><h2>Needs attention</h2><Link href="/dashboard/notifications">View all ↗</Link></div><TaskList tasks={summary.outstanding.slice(0, 5)} empty={clients.length ? "No outstanding tasks from the available records." : "Tasks appear here as you add clients."} /></section>
        <section className={s.panel}><div className={s.panelHeader}><h2>Your clients</h2><Link href="/dashboard/clients">View all ↗</Link></div>{clients.length ? <ul className={s.tasks}>{clients.slice(0, 5).map(client => <li key={client.id}><Link href={`/clients/${client.id}`}><div><strong>{client.name}</strong><span>{client.goal || "Set a primary goal"}</span></div><b aria-hidden="true">↗</b></Link></li>)}</ul> : <p className={s.empty}>Add your first client to begin.</p>}</section>
      </div>
    </>}
  </main>;
}
