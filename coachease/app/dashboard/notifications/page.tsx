import { workspaceData } from "@/lib/workspace/data";
import TaskList from "@/components/workspace/tasks";
import s from "@/components/workspace/workspace.module.css";
export default async function NotificationsPage() {
  const { clientError, checkInError, summary } = await workspaceData();
  return <main className={s.page}><header className={s.pageHeader}><div><p className={s.kicker}>What needs your attention</p><h1>Notifications</h1><p>Tasks from your client records. Weekly check-ins are due seven days after the last entry.</p></div></header>
    {clientError ? <p role="alert" className={s.error}>Could not load your clients. Refresh to try again.</p> : <>
      {checkInError && <p role="alert" className={s.error}>Check-in reminders are unavailable. Refresh to retry; setup tasks are shown below.</p>}
      <section className={s.notificationSummary} aria-label="Task summary"><div><span>01 / Outstanding</span><strong>{summary.outstanding.length}</strong><p>Tasks to pick up now</p></div><div><span>02 / Next 7 days</span><strong>{summary.upcoming.length}</strong><p>Coming up in your schedule</p></div><div><span>The weekly rhythm</span><h2>Review.<br />Update.<br />Follow up.</h2><p>Check-ins are due seven days after the last entry.</p></div></section>
      <div className={s.dashboardGrid}><section className={s.panel}><div className={s.panelHeader}><h2>Outstanding tasks <span>{summary.outstanding.length}</span></h2></div><TaskList tasks={summary.outstanding} empty="No outstanding tasks from the available records." /></section><section className={s.panel}><div className={s.panelHeader}><h2>Upcoming tasks</h2><span>Next 7 days</span></div><TaskList tasks={summary.upcoming} empty="No upcoming tasks from the available records." /></section></div>
    </>}
    <section className={s.planned}><span className={s.badge}>Planned</span><h2>Payment notifications</h2><p>Payment tracking is not connected yet. Payment alerts will appear here when that feature is available.</p></section>
  </main>;
}
