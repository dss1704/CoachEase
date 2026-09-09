"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { searchHelp } from "@/lib/workspace/help";
import s from "./workspace.module.css";
type Client = { id: string; name: string };
export default function WorkspaceSearch() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ query: string; clients: Client[]; error: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const trimmed = query.trim();
  const loading = open && trimmed.length >= 2 && result?.query !== trimmed;
  const clients = result?.query === trimmed ? result.clients : [];
  const error = result?.query === trimmed ? result.error : "";
  const matches = searchHelp(query);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  useEffect(() => {
    if (!open || trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/workspace/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        if (!controller.signal.aborted) setResult({ query: trimmed, clients: data.clients, error: "" });
      } catch {
        if (!controller.signal.aborted) setResult({ query: trimmed, clients: [], error: "Client search is unavailable. Your feature and FAQ results are still shown." });
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed, open, retry]);
  return <><button className={s.searchTrigger} onClick={() => { setResult(null); setOpen(true); }}><span aria-hidden="true">⌕</span> Search clients, features & help <span aria-hidden="true">↗</span></button><dialog ref={dialog} className={`${s.dialog} ${s.searchDialog}`} aria-labelledby="workspace-search-title" onCancel={event => { event.preventDefault(); setOpen(false); }}><header><h2 id="workspace-search-title">Find it here.</h2><button className={s.close} aria-label="Close search" onClick={() => setOpen(false)}>×</button></header><div className={s.searchBody}><label className={s.form}><span className={s.srOnly}>Search clients, features and help</span><input autoFocus type="search" maxLength={80} value={query} placeholder="Try a client name, food, weight, overdue…" onChange={event => setQuery(event.target.value)} /></label>
    <p className={s.help}>Search by client name or use keywords to find a feature or answer.</p>
    <div aria-live="polite">{trimmed.length === 1 && <p className={s.help}>Type at least two characters to search client names.</p>}{loading && <p className={s.help}>Searching clients…</p>}{error && <p className={s.error}>{error} <button className={s.retrySearch} onClick={() => { setResult(null); setRetry(retry+1); }}>Retry</button></p>}</div>
    {clients.length>0 && <><h3 className={s.searchGroup}>Clients</h3><ul className={s.searchResults}>{clients.map(client => <li key={client.id}><Link href={`/clients/${client.id}`} onClick={() => setOpen(false)}><strong>{client.name}</strong><span>Open client record ↗</span></Link></li>)}</ul></>}
    <h3 className={s.searchGroup}>{trimmed ? "Features & answers" : "Quick links"}</h3><ul className={s.searchResults}>{matches.map(item => <li key={`${item.kind}-${item.id}`}><a href={item.href} onClick={() => setOpen(false)}><small>{item.kind}</small><strong>{item.title}</strong><span>{item.kind === "Answer" ? "Read answer ↗" : item.answer}</span></a></li>)}</ul>
    {!matches.length && !clients.length && !loading && <p className={s.empty}>{error ? "No matching features or answers. Retry to search clients." : "No matches. Try a client’s name, calories, check-in or notes."}</p>}
  </div></dialog></>;
}
