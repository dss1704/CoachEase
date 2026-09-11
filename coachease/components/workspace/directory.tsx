"use client";
import Link from "next/link";
import { useState } from "react";
import type { CoachClient } from "@/lib/workspace/summary";
import s from "./workspace.module.css";
export default function Directory({ clients }: { clients: CoachClient[] }) {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(client => `${client.name} ${client.goal ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <section className={s.directory}>
    <div className={s.directoryToolbar}><div><span className={s.kicker}>The roster</span><h2>{clients.length} <span>{clients.length === 1 ? "client" : "clients"}</span></h2></div><label className={s.search}><span className={s.srOnly}>Search clients</span><input type="search" placeholder="Search name or goal…" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
    {!clients.length ? <div data-tour="no-clients" className={s.empty}><h3>Your first client starts here.</h3><p>Use Add client to create a record, then add their goals, stats and nutrition targets.</p></div> : !filtered.length ? <p className={s.empty} role="status">No clients match that search.</p> : <ul className={s.rosterCards}>{filtered.map(client => <li key={client.id}><Link data-tour="client-record" href={`/clients/${client.id}`} className={s.rosterCard}><div className={s.rosterIdentity}><span className={s.rosterAvatar} aria-hidden="true">{client.name.trim().split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase()}</span><span className={s.rosterArrow} aria-hidden="true">↗</span></div><h3>{client.name}</h3><p>{client.goal || "Primary goal not set"}</p><div className={s.rosterTargets}><div><span>Daily target</span><strong>{client.daily_calories == null ? "—" : client.daily_calories.toLocaleString("en-GB")}<small> kcal</small></strong></div><div><span>Protein</span><strong>{client.protein_target ?? "—"}<small> g</small></strong></div></div><footer>Open client record <span aria-hidden="true">→</span></footer></Link></li>)}</ul>}
  </section>;
}
