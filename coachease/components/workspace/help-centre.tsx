"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FAQ } from "@/lib/workspace/help";
import { ReplayTutorial } from "./tutorial";
import s from "./workspace.module.css";
export default function HelpCentre() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    const followHash = () => {
      const id = window.location.hash.slice(1);
      if (FAQ.some(item => item.id === id)) { setQuery(""); setExpanded(id); requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" })); }
    };
    followHash(); window.addEventListener("hashchange", followHash);
    return () => window.removeEventListener("hashchange", followHash);
  }, []);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = FAQ.filter(item => words.every(word => `${item.title} ${item.answer} ${item.keywords}`.toLowerCase().includes(word)));
  return <main className={s.page}><header className={s.pageHeader}><div><p className={s.kicker}>A little direction</p><h1>Help & FAQ</h1><p>Find an answer, revisit the basics or take the tour again.</p></div></header><section className={s.helpIntro}><div><p className={s.kicker}>Find your feet</p><h2>A quick look around.</h2><p className={s.help}>The guided tour covers clients, nutrition, check-ins and finding your way through the workspace.</p></div><ReplayTutorial /></section><section className={s.faqSection}><label className={s.search}><span className={s.searchGroup}>Search frequently asked questions</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try macros, notes or payments…" /></label><p className={s.help} role="status">{matches.length} {matches.length === 1 ? "answer" : "answers"}</p><div className={s.faqList}>{matches.map((item,index) => <article id={item.id} key={item.id}><h2><button aria-expanded={expanded===item.id} aria-controls={`answer-${item.id}`} onClick={() => setExpanded(expanded===item.id ? null : item.id)}><span>{String(index+1).padStart(2,"0")}</span>{item.title}<b aria-hidden="true">{expanded===item.id ? "−" : "+"}</b></button></h2><div id={`answer-${item.id}`} hidden={expanded!==item.id}><p>{item.answer}</p>{item.href !== "/dashboard/help" && <Link href={item.href}>Open {item.href.endsWith("clients") ? "clients" : item.href.endsWith("guide") ? "getting started" : "notifications"} ↗</Link>}</div></article>)}</div>{!matches.length && <p className={s.empty}>No answers match. Try a shorter keyword or clear the search.</p>}</section></main>;
}
