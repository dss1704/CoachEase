"use client";
import Link from "next/link";
import { useState } from "react";
import type { CoachClient } from "@/lib/workspace/summary";
import s from "./workspace.module.css";
export default function Directory({ clients }: { clients: CoachClient[] }) {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(client => `${client.name} ${client.goal ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <section className={s.panel}>
    <div className={s.panelHeader}><h2>Client directory <span>{clients.length}</span></h2><label className={s.search}><span className={s.srOnly}>Search clients</span><input type="search" placeholder="Search name or goal" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
    {!clients.length ? <div className={s.empty}><h3>Your first client starts here.</h3><p>Use Add client to create a record, then add their goals, stats and nutrition targets.</p></div> : !filtered.length ? <p className={s.empty}>No clients match that search.</p> : <ul className={s.clientList}>{filtered.map(client => <li key={client.id}><Link href={`/clients/${client.id}`}><span className={s.avatar} aria-hidden="true">{client.name.slice(0, 2).toUpperCase()}</span><div><strong>{client.name}</strong><span>{client.goal || "Add a primary goal"}</span></div><span aria-hidden="true">↗</span></Link></li>)}</ul>}
  </section>;
}
