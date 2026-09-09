"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MACRO_PRESETS, macrosFromCalories, caloriesFromMacros } from "@/lib/workspace/macros";
import s from "./workspace.module.css";
export type NutritionClient = { id: string; daily_calories: number | null; protein_target: number | null; carbs_target: number | null; fat_target: number | null; current_weight: number | null; target_weight: number | null };
const macroFields = [["protein_target", "Protein", "4 kcal / g"], ["carbs_target", "Carbohydrates", "4 kcal / g"], ["fat_target", "Fat", "9 kcal / g"]] as const;
const fields = ["daily_calories", "protein_target", "carbs_target", "fat_target", "current_weight", "target_weight"] as const;
type Field = typeof fields[number];
export default function NutritionEditor({ client, showWeights = false }: { client: NutritionClient; showWeights?: boolean }) {
  const router = useRouter();
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(field => [field, client[field] == null ? "" : String(client[field])])) as Record<Field, string>);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const target = Number(values.daily_calories);
  const validTarget = values.daily_calories.trim() !== "" && Number.isFinite(target) && target > 0;
  const hasMacros = macroFields.every(([field]) => values[field].trim() !== "");
  const total = hasMacros ? caloriesFromMacros(Number(values.protein_target), Number(values.carbs_target), Number(values.fat_target)) : null;
  const difference = validTarget && total !== null ? total - target : null;
  const format = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });
  function update(field: Field, value: string) {
    setValues(current => ({ ...current, [field]: value }));
    if (field !== "current_weight" && field !== "target_weight") setPresetId(null);
    setMessage(""); setError("");
  }
  function applyPreset(preset: typeof MACRO_PRESETS[number]) {
    if (!validTarget) return;
    const macros = macrosFromCalories(target, preset);
    setValues(current => ({ ...current, ...Object.fromEntries(Object.entries(macros).map(([key, value]) => [key, String(value)])) }));
    setPresetId(preset.id); setMessage(""); setError("");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return;
    const payload: Record<string, number | null> = {};
    for (const field of fields) {
      if (!showWeights && (field === "current_weight" || field === "target_weight")) continue;
      const value = values[field].trim() === "" ? null : Number(values[field]);
      if (value !== null && (!Number.isFinite(value) || value < 0 || (field === "daily_calories" && value === 0))) {
        setError("Enter a positive calorie target and non-negative macro and weight values, or leave them blank."); return;
      }
      payload[field] = value;
    }
    setSaving(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Your session has expired. Log in again to save."); return; }
      const { error: saveError } = await supabase.from("clients").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", client.id).eq("coach_id", user.id).select("id").single();
      if (saveError) { setError("Could not save nutrition targets. Please try again."); return; }
      setMessage("Nutrition targets saved to this client."); router.refresh();
    } catch { setError("Connection lost. Please try again."); }
    finally { setSaving(false); }
  }
  return <form onSubmit={save} className={s.nutritionPlanner}><fieldset disabled={saving}>
    <section className={s.plannerIntro}><div><p className={s.kicker}>01 / Set the target</p><h2>Calories first.<br />Fine-tune from there.</h2><p className={s.help}>Enter the daily calorie goal, choose a split, then adjust the grams to suit your client.</p></div><label className={s.calorieInput}>Daily calorie target<span><input type="number" min="1" step="1" placeholder="3000" value={values.daily_calories} onChange={event => update("daily_calories", event.target.value)} /><small>kcal / day</small></span></label></section>
    <section className={s.plannerSection} aria-labelledby="preset-heading"><p className={s.kicker}>02 / Choose a starting point</p><h3 id="preset-heading">Macro split</h3><p className={s.help}>Percentages show the share of calories from protein, carbohydrates and fat. Select a preset to fill the grams below.</p><div className={s.presets}>{MACRO_PRESETS.map((preset, index) => <button key={preset.id} type="button" disabled={!validTarget} aria-pressed={presetId === preset.id} onClick={() => applyPreset(preset)}><span className={s.presetNumber}>0{index + 1}<span aria-hidden="true">{presetId === preset.id ? "✓" : "↗"}</span></span><strong>{preset.label}</strong><span className={s.splitBar} aria-hidden="true"><i style={{ width: `${preset.protein}%` }} /><i style={{ width: `${preset.carbs}%` }} /><i style={{ width: `${preset.fat}%` }} /></span><small>P {preset.protein}% · C {preset.carbs}% · F {preset.fat}%</small></button>)}</div>{!validTarget && <p className={s.help}>Enter a calorie target above to enable presets.</p>}</section>
    <section className={s.plannerSection} aria-labelledby="grams-heading"><p className={s.kicker}>03 / Refine the plan</p><h3 id="grams-heading">Daily macros</h3><div className={s.macroInputs}>{macroFields.map(([field, label, energy]) => <label key={field}><span>{label}<small>{energy}</small></span><div><input type="number" min="0" step="1" value={values[field]} onChange={event => update(field, event.target.value)} placeholder="0" /><span>g</span></div></label>)}</div><div className={s.macroSummary} aria-live="polite" aria-atomic="true"><div><span>Calories from macros</span><strong>{total === null ? "—" : format(total)}<small> kcal</small></strong></div><div><span>Difference from target</span><strong>{difference === null ? "—" : `${difference > 0 ? "+" : ""}${format(difference)}`}<small> kcal</small></strong></div><p>{presetId ? "Preset applied. " : ""}Presets round to whole grams. Manual changes keep your calorie target fixed; the difference updates as you refine.</p></div></section>
    {showWeights && <section className={s.plannerSection}><h3>Weight targets</h3><div className={`${s.form} ${s.formGrid}`}>{([["current_weight", "Current weight (kg)"], ["target_weight", "Target weight (kg)"]] as const).map(([field, label]) => <label key={field}>{label}<input type="number" min="0" step="0.1" value={values[field]} onChange={event => update(field, event.target.value)} /></label>)}</div></section>}
    <footer className={s.plannerFooter}><p className={s.help}>Save when you are ready to update this client’s nutrition targets.</p><button className={s.primary} disabled={saving}>{saving ? "Saving…" : "Save nutrition targets ↗"}</button></footer>{error && <p className={s.error} role="alert">{error}</p>}{message && <p className={s.success} role="status">{message}</p>}
  </fieldset></form>;
}
