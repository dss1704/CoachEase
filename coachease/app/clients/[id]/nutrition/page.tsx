"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const ACCENT = "#B7FF3C";

type NutritionForm = {
  current_weight: string;
  target_weight: string;
  daily_calories: string;
  protein_target: string;
  carbs_target: string;
  fat_target: string;
};

const EMPTY_FORM: NutritionForm = {
  current_weight: "",
  target_weight: "",
  daily_calories: "",
  protein_target: "",
  carbs_target: "",
  fat_target: "",
};

export default function ClientNutritionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = params.id;

  const [clientName, setClientName] = useState("");
  const [form, setForm] = useState<NutritionForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadNutrition() {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, current_weight, target_weight, daily_calories, protein_target, carbs_target, fat_target")
        .eq("id", clientId)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setClientName(data.name ?? "");
      setForm({
        current_weight: data.current_weight == null ? "" : String(data.current_weight),
        target_weight: data.target_weight == null ? "" : String(data.target_weight),
        daily_calories: data.daily_calories == null ? "" : String(data.daily_calories),
        protein_target: data.protein_target == null ? "" : String(data.protein_target),
        carbs_target: data.carbs_target == null ? "" : String(data.carbs_target),
        fat_target: data.fat_target == null ? "" : String(data.fat_target),
      });

      setLoading(false);
    }

    void loadNutrition();
  }, [clientId]);

  function updateField(field: keyof NutritionForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccessMessage("");
  }

  function numberOrNull(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function saveNutrition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const values = {
      current_weight: numberOrNull(form.current_weight),
      target_weight: numberOrNull(form.target_weight),
      daily_calories: numberOrNull(form.daily_calories),
      protein_target: numberOrNull(form.protein_target),
      carbs_target: numberOrNull(form.carbs_target),
      fat_target: numberOrNull(form.fat_target),
    };

    if (Object.values(values).some((value) => value !== null && value < 0)) {
      setErrorMessage("Nutrition and weight values cannot be negative.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("clients")
      .update({
        ...values,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSuccessMessage("Nutrition information saved.");
    setSaving(false);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          Loading nutrition...
        </p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <p className="text-xl font-semibold">Client not found.</p>
        <Link href="/dashboard" className="mt-8 inline-block font-semibold" style={{ color: ACCENT }}>
          ← Return to dashboard
        </Link>
      </main>
    );
  }

  const proteinCalories = Number(form.protein_target || 0) * 4;
  const carbsCalories = Number(form.carbs_target || 0) * 4;
  const fatCalories = Number(form.fat_target || 0) * 9;
  const macroCalories = proteinCalories + carbsCalories + fatCalories;
  const targetCalories = Number(form.daily_calories || 0);
  const difference = macroCalories - targetCalories;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <ClientNav clientId={clientId} active="nutrition" />

        <header className="border-b border-white/20 py-14">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em]" style={{ color: ACCENT }}>
            Client nutrition
          </p>
          <h1 className="mt-4 break-words text-5xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">
            {clientName}
          </h1>
          <p className="mt-5 text-zinc-500">
            Current weight, target weight and daily nutrition targets.
          </p>
        </header>

        <form onSubmit={saveNutrition}>
          <Section number="01" label="Weight" description="Only the client's current position and target.">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Current weight" suffix="kg">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.current_weight}
                  onChange={(e) => updateField("current_weight", e.target.value)}
                  className={inputClassName}
                  placeholder="75.2"
                />
              </Field>

              <Field label="Target weight" suffix="kg">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.target_weight}
                  onChange={(e) => updateField("target_weight", e.target.value)}
                  className={inputClassName}
                  placeholder="72.0"
                />
              </Field>
            </div>
          </Section>

          <Section number="02" label="Nutrition targets" description="Current daily calorie and macronutrient targets.">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Daily calories" suffix="kcal">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.daily_calories}
                  onChange={(e) => updateField("daily_calories", e.target.value)}
                  className={inputClassName}
                  placeholder="2200"
                />
              </Field>

              <Field label="Protein" suffix="g">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.protein_target}
                  onChange={(e) => updateField("protein_target", e.target.value)}
                  className={inputClassName}
                  placeholder="180"
                />
              </Field>

              <Field label="Carbohydrates" suffix="g">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.carbs_target}
                  onChange={(e) => updateField("carbs_target", e.target.value)}
                  className={inputClassName}
                  placeholder="220"
                />
              </Field>

              <Field label="Fat" suffix="g">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.fat_target}
                  onChange={(e) => updateField("fat_target", e.target.value)}
                  className={inputClassName}
                  placeholder="70"
                />
              </Field>
            </div>

            <div className="mt-8 grid gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
              <Summary label="Calories from macros" value={`${macroCalories.toLocaleString()} kcal`} />
              <Summary label="Calorie target" value={`${targetCalories.toLocaleString()} kcal`} />
              <Summary label="Difference" value={`${difference > 0 ? "+" : ""}${difference.toLocaleString()} kcal`} accent={difference === 0} />
            </div>
          </Section>

          {(errorMessage || successMessage) && (
            <div className="border-t border-white/20 py-6">
              {errorMessage && (
                <p className="border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="border px-5 py-4 text-sm" style={{ borderColor: `${ACCENT}66`, backgroundColor: `${ACCENT}12`, color: ACCENT }}>
                  {successMessage}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end border-t border-white/20 py-8">
            <button
              type="submit"
              disabled={saving}
              className="min-w-48 px-8 py-4 font-bold text-black transition hover:brightness-90 disabled:opacity-50"
              style={{ backgroundColor: ACCENT }}
            >
              {saving ? "Saving..." : "Save nutrition"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function ClientNav({ clientId, active }: { clientId: string; active: "profile" | "nutrition" | "check-ins" }) {
  const items = [
    { key: "profile", label: "Information", href: `/clients/${clientId}/profile` },
    { key: "nutrition", label: "Nutrition", href: `/clients/${clientId}/nutrition` },
    { key: "check-ins", label: "Check-ins", href: `/clients/${clientId}/check-ins` },
  ];

  return (
    <nav className="flex flex-col gap-5 border-b border-white/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <Link href={`/clients/${clientId}`} className="font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
        ← Client dashboard
      </Link>
      <div className="flex flex-wrap gap-5">
        {items.map((item) => (
          <Link key={item.key} href={item.href} className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: item.key === active ? ACCENT : "#71717a" }}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const inputClassName =
  "mt-3 w-full border border-white/20 bg-[#090909] px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white";

function Field({ label, suffix, children }: { label: string; suffix?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        <span>{label}</span>
        {suffix && <span className="text-zinc-700">{suffix}</span>}
      </span>
      {children}
    </label>
  );
}

function Section({ number, label, description, children }: { number: string; label: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-8 border-b border-white/20 py-12 lg:grid-cols-[280px_1fr]">
      <div>
        <p className="font-mono text-xs font-bold" style={{ color: ACCENT }}>{number}</p>
        <h2 className="mt-4 text-2xl font-black uppercase tracking-[-0.035em]">{label}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Summary({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#090909] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">{label}</p>
      <p className="mt-3 text-xl font-bold" style={accent ? { color: ACCENT } : undefined}>{value}</p>
    </div>
  );
}