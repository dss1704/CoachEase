"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NutritionEditor, { type NutritionClient } from "./nutrition-editor";
import s from "./workspace.module.css";

type Client = NutritionClient & { id: string; name: string; goal: string | null; coach_notes: string | null; starting_weight: number | null; current_weight: number | null; target_weight: number | null };
export default function ClientEditor({ client, section }: { client: Client; section: "goals" | "notes" | "stats" }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const title = { goals: "Goals", notes: "Coach notes", stats: "Stats & calculator" }[section];
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return;
    const values = new FormData(event.currentTarget);
    const payload: Record<string, string | number | null> = {};
    if (section === "stats") {
      for (const field of ["starting_weight", "current_weight", "target_weight"]) {
        const input = String(values.get(field) ?? "").trim();
        const value = input ? Number(input) : null;
        if (value !== null && (!Number.isFinite(value) || value <= 0)) { setError("Weights must be greater than zero, or left blank."); return; }
        payload[field] = value;
      }
    } else {
      const field = section === "goals" ? "goal" : "coach_notes";
      payload[field] = String(values.get(field) ?? "").trim() || null;
    }
    setSaving(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Your session has expired. Log in again to save."); return; }
      const { error: saveError } = await supabase.from("clients").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", client.id).eq("coach_id", user.id).select("id").single();
      if (saveError) { setError("Could not save. Please try again."); return; }
      setMessage("Saved to this client’s record."); router.refresh();
    } catch { setError("Connection lost. Please try again."); }
    finally { setSaving(false); }
  }
  return <main className={s.page}>
    <header className={s.pageHeader}><div><p className={s.kicker}>{client.name}</p><h1>{title}</h1><p>{section === "goals" ? "Keep the objective clear, and update it as your client progresses." : section === "notes" ? "Keep useful context for your next coaching conversation." : "Maintain the client’s baseline and weight targets."}</p></div></header>
    <form onSubmit={save} onChange={() => { setMessage(""); setError(""); }} className={`${s.panel} ${s.editor}`}>
      <fieldset disabled={saving} className={s.form}>
        {section === "stats" ? <div className={s.formGrid}>{([['starting_weight', 'Starting weight (kg)'], ['current_weight', 'Profile weight (kg)'], ['target_weight', 'Target weight (kg)']] as const).map(([field, label]) => <label key={field}>{label}<input name={field} type="number" min="0.1" step="0.1" defaultValue={client[field] ?? ""} /></label>)}</div> : <label>{section === "goals" ? "Primary goal" : "Coaching notes"}<textarea name={section === "goals" ? "goal" : "coach_notes"} rows={8} maxLength={20000} defaultValue={(section === "goals" ? client.goal : client.coach_notes) ?? ""} placeholder={section === "goals" ? "What are you working towards together?" : "Preferences, context and points to follow up…"} /></label>}
        {section === "stats" && <p className={s.help}>Progress uses the latest recorded check-in weight when one is available. Profile weight is the fallback.</p>}
        {error && <p role="alert" className={s.error}>{error}</p>}{message && <p role="status" className={s.success}>{message}</p>}
        <button className={s.primary} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
      </fieldset>
    </form>
    {section === "stats" && <NutritionEditor client={client} />}
  </main>;
}