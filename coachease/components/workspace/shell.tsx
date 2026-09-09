"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { TutorialProvider } from "./tutorial";
import WorkspaceSearch from "./workspace-search";
import s from "./workspace.module.css";

const navigation = [
  { href: "/dashboard", label: "Dashboard", number: "01" },
  { href: "/dashboard/clients", label: "Clients", number: "02" },
  { href: "/dashboard/notifications", label: "Notifications", number: "03" },
  { href: "/dashboard/guide", label: "Getting started", number: "04" },
  { href: "/dashboard/help", label: "Help & FAQ", number: "05" },
];
export default function CoachShell({ children, email, tutorialPending, tutorialUnavailable }: { children: ReactNode; email: string; tutorialPending: boolean; tutorialUnavailable: boolean }) {
  const pathname = usePathname();
  return <div className={s.shell}><TutorialProvider pending={tutorialPending} unavailable={tutorialUnavailable}>
    <a href="#coach-content" className={s.skip}>Skip to workspace</a>
    <aside className={s.sidebar}>
      <Link className={s.brand} href="/dashboard"><span>CoachEase</span><i aria-hidden="true" /></Link>
      <p className={s.sidebarLabel}>Coach workspace</p>
      <nav aria-label="Coach navigation" className={s.navigation}>{navigation.map(item => {
        const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href) || item.label === "Clients" && pathname.startsWith("/clients/");
        return <Link href={item.href} key={item.href} aria-current={active ? "page" : undefined}><span>{item.number}</span>{item.label}</Link>;
      })}</nav>
      <div className={s.account}><span>Signed in as coach</span><p title={email}>{email}</p><form method="post" action="/auth/signout"><button type="submit">Log out ↗</button></form></div>
    </aside>
    <div className={s.mainColumn}><header className={s.topbar}><WorkspaceSearch /><Link href="/">View website ↗</Link></header><div id="coach-content" className={s.content}>{children}</div></div>
  </TutorialProvider></div>;
}
