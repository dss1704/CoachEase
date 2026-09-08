"use client";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { localDate } from "@/lib/workspace/summary";
import s from "./workspace.module.css";

export default function AddClient() {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [today, setToday] = useState("");
  const router = useRouter();
  function open() {
    form.current?.reset();
    setError("");
    setToday(localDate());
    dialog.current?.showModal();
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const values = new FormData(event.currentTarget);
    const text = (key: string) => String(values.get(key) ?? "").trim();
    if (!text("name")) { setError("Enter a client name."); return; }
    if (text("date_of_birth") > localDate()) { setError("Date of birth cannot be in the future."); return; }
    setSaving(true); setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Your session has expired. Log in again to add a client."); return; }
      const { data, error: insertError } = await supabase.from("clients").insert({
        name: text("name"), email: text("email") || null, phone: text("phone") || null,
        date_of_birth: text("date_of_birth") || null, gender: text("gender") || null,
        start_date: text("start_date") || null, goal: text("goal") || null, coach_id: user.id,
      }).select("id").single();
      if (insertError || !data) { setError("Could not create this client. Please try again."); return; }
      dialog.current?.close(); router.push(`/clients/${data.id}`); router.refresh();
    } catch { setError("Connection lost. Please try again."); }
    finally { setSaving(false); }
  }
  return <>
    <button type="button" className={s.primary} onClick={open}>+ Add client</button>
    <dialog ref={dialog} className={s.dialog} aria-labelledby="add-client-title" onCancel={event => { if (saving) event.preventDefault(); }}>
      <header><div><p className={s.kicker}>Start a client record</p><h2 id="add-client-title">Add client</h2></div><button type="button" className={s.close} aria-label="Close add client" disabled={saving} onClick={() => dialog.current?.close()}>×</button></header>
      <form ref={form} onSubmit={save} className={s.form}>
        <div className={s.formGrid}>
          <label>Full name<input name="name" autoComplete="name" required maxLength={200} /></label>
          <label>Email<input name="email" type="email" autoComplete="email" /></label>
          <label>Phone<input name="phone" type="tel" autoComplete="tel" /></label>
          <label>Date of birth<input name="date_of_birth" type="date" max={today} /></label>
          <label>Gender<select name="gender"><option value="">Select (optional)</option><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select></label>
          <label>Start date<input name="start_date" type="date" defaultValue={today} /></label>
        </div>
        <label>Primary goal<textarea name="goal" rows={3} placeholder="What are you working towards together?" /></label>
        {error && <p role="alert" className={s.error}>{error}</p>}
        <footer><button type="button" className={s.secondary} disabled={saving} onClick={() => dialog.current?.close()}>Cancel</button><button className={s.primary} disabled={saving}>{saving ? "Creating…" : "Create client"}</button></footer>
      </form>
    </dialog>
  </>;
}
