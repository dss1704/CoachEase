import { workspaceData } from "@/lib/workspace/data";
import AddClient from "@/components/workspace/add-client";
import Directory from "@/components/workspace/directory";
import s from "@/components/workspace/workspace.module.css";
export default async function ClientsPage() {
  const { clients, clientError } = await workspaceData();
  return <main className={s.page}><header className={s.pageHeader}><div><p className={s.kicker}>Your coaching roster</p><h1>Clients</h1><p>Open a record to manage goals, stats, nutrition and progress.</p></div><AddClient /></header>{clientError ? <p role="alert" className={s.error}>Could not load your clients. Refresh to try again.</p> : <Directory clients={clients} />}</main>;
}
