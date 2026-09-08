"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./workspace.module.css";
const sections = [
  ["", "Progress"], ["profile", "Details"], ["goals", "Goals"], ["stats", "Stats & calculator"],
  ["workouts", "Workouts"], ["meal-plans", "Meal plans"], ["nutrition", "Nutrition targets"],
  ["notes", "Notes"], ["check-ins", "Weekly check-ins"],
];
export default function ClientNavigation({ clientId, name }: { clientId: string; name: string }) {
  const pathname = usePathname();
  return <div className={s.clientContext}><div><Link href="/dashboard/clients">← All clients</Link><strong>{name}</strong></div><nav aria-label="Client sections">{sections.map(([slug, label]) => {
    const href = `/clients/${clientId}${slug ? `/${slug}` : ""}`;
    return <Link href={href} key={slug} aria-current={pathname === href ? "page" : undefined}>{label}{["workouts", "meal-plans"].includes(slug) && <span>Planned</span>}</Link>;
  })}</nav></div>;
}
