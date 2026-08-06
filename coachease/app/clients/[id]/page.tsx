"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const ACCENT = "#B7FF3C";

type ClientForm = {
  name: string;
  email: string;
  phone: string;
  start_date: string;
  goal: string;
  starting_weight: string;
  current_weight: string;
  target_weight: string;
  daily_calories: string;
  protein_target: string;
  carbs_target: string;
  fat_target: string;
  coach_notes: string;
};

const EMPTY_FORM: ClientForm = {
  name: "",
  email: "",
  phone: "",
  start_date: "",
  goal: "",
  starting_weight: "",
  current_weight: "",
  target_weight: "",
  daily_calories: "",
  protein_target: "",
  carbs_target: "",
  fat_target: "",
  coach_notes: "",
};

export default function ClientPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = params.id;

  const [form, setForm] = useState<ClientForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadClient() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("clients")
        .select(
          `
            id,
            name,
            email,
            phone,
            start_date,
            goal,
            starting_weight,
            current_weight,
            target_weight,
            daily_calories,
            protein_target,
            carbs_target,
            fat_target,
            coach_notes
          `
        )
        .eq("id", clientId)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setForm({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        start_date: data.start_date ?? "",
        goal: data.goal ?? "",
        starting_weight:
          data.starting_weight === null
            ? ""
            : String(data.starting_weight),
        current_weight:
          data.current_weight === null
            ? ""
            : String(data.current_weight),
        target_weight:
          data.target_weight === null
            ? ""
            : String(data.target_weight),
        daily_calories:
          data.daily_calories === null
            ? ""
            : String(data.daily_calories),
        protein_target:
          data.protein_target === null
            ? ""
            : String(data.protein_target),
        carbs_target:
          data.carbs_target === null
            ? ""
            : String(data.carbs_target),
        fat_target:
          data.fat_target === null
            ? ""
            : String(data.fat_target),
        coach_notes: data.coach_notes ?? "",
      });

      setLoading(false);
    }

    void loadClient();
  }, [clientId]);

  function updateField(field: keyof ClientForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccessMessage("");
  }

  function textOrNull(value: string) {
    const trimmedValue = value.trim();
    return trimmedValue === "" ? null : trimmedValue;
  }

  function numberOrNull(value: string) {
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      return null;
    }

    const parsedValue = Number(trimmedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setErrorMessage("Client name is required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("clients")
      .update({
        name,
        email: textOrNull(form.email),
        phone: textOrNull(form.phone),
        start_date: form.start_date || null,
        goal: textOrNull(form.goal),
        starting_weight: numberOrNull(form.starting_weight),
        current_weight: numberOrNull(form.current_weight),
        target_weight: numberOrNull(form.target_weight),
        daily_calories: numberOrNull(form.daily_calories),
        protein_target: numberOrNull(form.protein_target),
        carbs_target: numberOrNull(form.carbs_target),
        fat_target: numberOrNull(form.fat_target),
        coach_notes: textOrNull(form.coach_notes),
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSuccessMessage("Client profile saved.");
    setSaving(false);
    router.refresh();
  }

  async function deleteClient() {
    const confirmed = window.confirm(
      `Permanently delete ${form.name || "this client"}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    if (error) {
      setErrorMessage(error.message);
      setDeleting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          Loading client profile...
        </p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <p className="text-xl font-semibold">Client not found.</p>

        <p className="mt-3 max-w-lg text-zinc-500">
          This client does not exist or does not belong to your coach account.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-block font-semibold"
          style={{ color: ACCENT }}
        >
          ← Return to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between border-b border-white/20 pb-6">
          <Link
            href="/dashboard"
            className="font-mono text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: ACCENT }}
          >
            ← Dashboard
          </Link>

          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            Client ID · {clientId.slice(0, 8)}
          </span>
        </nav>

        <header className="border-b border-white/20 py-14">
          <p
            className="font-mono text-xs font-bold uppercase tracking-[0.24em]"
            style={{ color: ACCENT }}
          >
            Client profile
          </p>

          <h1 className="mt-4 break-words text-5xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">
            {form.name || "Unnamed client"}
          </h1>

          <p className="mt-5 text-zinc-500">
            Personal details, goals, nutrition targets and private coaching
            notes.
          </p>
        </header>

        <form onSubmit={saveClient}>
          <ProfileSection
            number="01"
            label="Personal details"
            description="The client's basic contact and onboarding information."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Full name" required>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Client name"
                />
              </Field>

              <Field label="Start date">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(event) =>
                    updateField("start_date", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Email address">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="client@example.com"
                />
              </Field>

              <Field label="Phone number">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="+44..."
                />
              </Field>
            </div>
          </ProfileSection>

          <ProfileSection
            number="02"
            label="Goal and progress"
            description="Record what the client is working towards and their current position."
          >
            <Field label="Primary goal">
              <textarea
                value={form.goal}
                onChange={(event) =>
                  updateField("goal", event.target.value)
                }
                className={`${inputClassName} min-h-32 resize-y`}
                placeholder="Lose body fat while maintaining strength..."
              />
            </Field>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Field label="Starting weight" suffix="kg">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.starting_weight}
                  onChange={(event) =>
                    updateField("starting_weight", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="0.0"
                />
              </Field>

              <Field label="Current weight" suffix="kg">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.current_weight}
                  onChange={(event) =>
                    updateField("current_weight", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="0.0"
                />
              </Field>

              <Field label="Target weight" suffix="kg">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.target_weight}
                  onChange={(event) =>
                    updateField("target_weight", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="0.0"
                />
              </Field>
            </div>
          </ProfileSection>

          <ProfileSection
            number="03"
            label="Nutrition targets"
            description="Set the client's current daily calorie and macronutrient targets."
          >
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Daily calories" suffix="kcal">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.daily_calories}
                  onChange={(event) =>
                    updateField("daily_calories", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateField("protein_target", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateField("carbs_target", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateField("fat_target", event.target.value)
                  }
                  className={inputClassName}
                  placeholder="70"
                />
              </Field>
            </div>

            <MacroSummary form={form} />
          </ProfileSection>

          <ProfileSection
            number="04"
            label="Private coach notes"
            description="These notes are private to the coach and are not visible to the client."
          >
            <textarea
              value={form.coach_notes}
              onChange={(event) =>
                updateField("coach_notes", event.target.value)
              }
              className={`${inputClassName} min-h-48 resize-y`}
              placeholder="Injuries, preferences, adherence concerns, coaching observations..."
            />
          </ProfileSection>

          {(errorMessage || successMessage) && (
            <div className="border-t border-white/20 py-6">
              {errorMessage && (
                <p className="border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p
                  className="border px-5 py-4 text-sm"
                  style={{
                    borderColor: `${ACCENT}66`,
                    backgroundColor: `${ACCENT}12`,
                    color: ACCENT,
                  }}
                >
                  {successMessage}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col justify-between gap-5 border-t border-white/20 py-8 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={deleteClient}
              disabled={deleting || saving}
              className="border border-red-500/40 px-6 py-4 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete client"}
            </button>

            <button
              type="submit"
              disabled={saving || deleting}
              className="min-w-48 px-8 py-4 font-bold text-black transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: ACCENT }}
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const inputClassName =
  "mt-3 w-full border border-white/20 bg-[#090909] px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white";

function Field({
  label,
  suffix,
  required = false,
  children,
}: {
  label: string;
  suffix?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        <span>
          {label}
          {required && (
            <span className="ml-1" style={{ color: ACCENT }}>
              *
            </span>
          )}
        </span>

        {suffix && <span className="text-zinc-700">{suffix}</span>}
      </span>

      {children}
    </label>
  );
}

function ProfileSection({
  number,
  label,
  description,
  children,
}: {
  number: string;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-8 border-b border-white/20 py-12 lg:grid-cols-[280px_1fr]">
      <div>
        <p
          className="font-mono text-xs font-bold"
          style={{ color: ACCENT }}
        >
          {number}
        </p>

        <h2 className="mt-4 text-2xl font-black uppercase tracking-[-0.035em]">
          {label}
        </h2>

        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>

      <div>{children}</div>
    </section>
  );
}

function MacroSummary({ form }: { form: ClientForm }) {
  const proteinCalories = Number(form.protein_target || 0) * 4;
  const carbohydrateCalories = Number(form.carbs_target || 0) * 4;
  const fatCalories = Number(form.fat_target || 0) * 9;

  const calculatedCalories =
    proteinCalories + carbohydrateCalories + fatCalories;

  const targetCalories = Number(form.daily_calories || 0);
  const difference = calculatedCalories - targetCalories;

  return (
    <div className="mt-8 grid gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
      <SummaryItem
        label="Calories from macros"
        value={`${calculatedCalories.toLocaleString()} kcal`}
      />

      <SummaryItem
        label="Calorie target"
        value={`${targetCalories.toLocaleString()} kcal`}
      />

      <SummaryItem
        label="Difference"
        value={`${difference > 0 ? "+" : ""}${difference.toLocaleString()} kcal`}
        accent={difference === 0}
      />
    </div>
  );
}

function SummaryItem({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[#090909] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>

      <p
        className="mt-3 text-xl font-bold"
        style={accent ? { color: ACCENT } : undefined}
      >
        {value}
      </p>
    </div>
  );
}