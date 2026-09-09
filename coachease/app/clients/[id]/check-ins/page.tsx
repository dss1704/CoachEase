"use client";

import Link from "next/link";
import s from "@/components/workspace/workspace.module.css";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const ACCENT = "#c7ff00";

type CheckInForm = {
  check_in_date: string;
  weight: string;
  energy: string;
  hunger: string;
  sleep: string;
  notes: string;
};

type CheckInRow = {
  id: string;
  check_in_date: string;
  weight: number | null;
  energy: number | null;
  hunger: number | null;
  sleep: number | null;
  notes: string | null;
  created_at: string;
};

function toLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateBounds() {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return {
    today: toLocalISODate(today),
    oneYearAgo: toLocalISODate(oneYearAgo),
  };
}

function emptyCheckIn(): CheckInForm {
  return {
    check_in_date: getDateBounds().today,
    weight: "",
    energy: "",
    hunger: "",
    sleep: "",
    notes: "",
  };
}

export default function ClientCheckInsPage() {
  const params = useParams<{ id: string }>();
  const clientId = params.id;

  const [clientName, setClientName] = useState("");
  const [form, setForm] = useState<CheckInForm>(emptyCheckIn);
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { today, oneYearAgo } = useMemo(() => getDateBounds(), []);

  useEffect(() => {
    async function loadPage() {
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, name")
        .eq("id", clientId)
        .single();

      if (clientError || !clientData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setClientName(clientData.name ?? "");

      const { data: checkInData, error: checkInError } = await supabase
        .from("check_ins")
        .select("id, check_in_date, weight, energy, hunger, sleep, notes, created_at")
        .eq("client_id", clientId)
        .order("check_in_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (checkInError) {
        setErrorMessage(checkInError.message);
      } else {
        setCheckIns(checkInData ?? []);
      }

      setLoading(false);
    }

    void loadPage();
  }, [clientId]);

  function updateField(field: keyof CheckInForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccessMessage("");
  }

  function numberOrNull(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function saveCheckIn() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.check_in_date) {
      setErrorMessage("Check-in date is required.");
      return;
    }

    if (form.check_in_date > today) {
      setErrorMessage("Check-in date cannot be in the future.");
      return;
    }

    if (form.check_in_date < oneYearAgo) {
      setErrorMessage("Check-in date cannot be more than one year old.");
      return;
    }

    const weight = numberOrNull(form.weight);
    const energy = numberOrNull(form.energy);
    const hunger = numberOrNull(form.hunger);
    const sleep = numberOrNull(form.sleep);

    if (weight !== null && weight <= 0) {
      setErrorMessage("Weight must be greater than 0.");
      return;
    }

    for (const [label, value] of [
      ["Energy", energy],
      ["Hunger", hunger],
      ["Sleep", sleep],
    ] as const) {
      if (value !== null && (value < 1 || value > 10)) {
        setErrorMessage(`${label} must be between 1 and 10.`);
        return;
      }
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("You must be signed in to save a check-in.");
      setSaving(false);
      return;
    }

    const notes = form.notes.trim() || null;

    const { data, error } = await supabase
      .from("check_ins")
      .insert({
        client_id: clientId,
        coach_id: user.id,
        check_in_date: form.check_in_date,
        weight,
        energy,
        hunger,
        sleep,
        notes,
      })
      .select("id, check_in_date, weight, energy, hunger, sleep, notes, created_at")
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setCheckIns((current) =>
      [data, ...current].sort((a, b) => {
        const dateDiff =
          new Date(b.check_in_date).getTime() -
          new Date(a.check_in_date).getTime();

        if (dateDiff !== 0) return dateDiff;

        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      })
    );

    setForm(emptyCheckIn());
    setSuccessMessage("Weekly check-in saved.");
    setSaving(false);
  }

  async function deleteCheckIn(checkIn: CheckInRow) {
    const confirmed = window.confirm(
      `Delete the check-in from ${formatDate(checkIn.check_in_date)}? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(checkIn.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("check_ins")
      .delete()
      .eq("id", checkIn.id)
      .eq("client_id", clientId);

    if (error) {
      setErrorMessage(error.message);
      setDeletingId(null);
      return;
    }

    setCheckIns((current) => current.filter((item) => item.id !== checkIn.id));
    setSuccessMessage("Check-in deleted.");
    setDeletingId(null);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Loading check-ins...
        </p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
        <p className="text-xl font-semibold">Client not found.</p>
        <Link href="/dashboard" className="mt-8 inline-block font-semibold" style={{ color: ACCENT }}>
          ← Return to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className={s.page}>
      <div className="mx-auto max-w-7xl">

        <header className={s.recordHeader}>
          <p className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: ACCENT }}>
            Weekly check-ins
          </p>
          <h1 className="mt-4 break-words text-5xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">
            {clientName}
          </h1>
          <p className="mt-5 text-zinc-400">
            Record weekly progress without touching client information or nutrition targets.
          </p>
        </header>

        <Section number="01" label="New check-in" description="Dates are restricted to today or any date within the previous year.">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Check-in date" required>
              <input
                type="date"
                required
                min={oneYearAgo}
                max={today}
                value={form.check_in_date}
                onChange={(e) => updateField("check_in_date", e.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Weight" suffix="kg">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={form.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                className={inputClassName}
                placeholder="75.2"
              />
            </Field>

            <Field label="Energy" suffix="/10">
              <input
                type="number"
                min="1"
                max="10"
                step="1"
                value={form.energy}
                onChange={(e) => updateField("energy", e.target.value)}
                className={inputClassName}
                placeholder="8"
              />
            </Field>

            <Field label="Hunger" suffix="/10">
              <input
                type="number"
                min="1"
                max="10"
                step="1"
                value={form.hunger}
                onChange={(e) => updateField("hunger", e.target.value)}
                className={inputClassName}
                placeholder="5"
              />
            </Field>

            <Field label="Sleep" suffix="/10">
              <input
                type="number"
                min="1"
                max="10"
                step="1"
                value={form.sleep}
                onChange={(e) => updateField("sleep", e.target.value)}
                className={inputClassName}
                placeholder="7"
              />
            </Field>
          </div>

          <div className="mt-6">
            <Field label="Weekly notes">
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className={`${inputClassName} min-h-40 resize-y`}
                placeholder="Training performance, nutrition, recovery, issues this week..."
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveCheckIn}
              disabled={saving}
              className="min-w-48 px-8 py-4 font-bold text-black transition hover:brightness-90 disabled:opacity-50"
              style={{ backgroundColor: ACCENT }}
            >
              {saving ? "Saving..." : "Save check-in"}
            </button>
          </div>
        </Section>

        {(errorMessage || successMessage) && (
          <div className="border-b border-white/20 py-6">
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

        <Section number="02" label="History" description="Previous check-ins for this client.">
          {checkIns.length === 0 ? (
            <p className="border border-white/20 bg-[#181818] p-5 text-sm text-zinc-400">
              No check-ins yet.
            </p>
          ) : (
            <div className="space-y-4">
              {checkIns.map((checkIn) => (
                <article key={checkIn.id} className="border border-white/20 bg-[#181818] p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-lg font-bold">{formatDate(checkIn.check_in_date)}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-zinc-400">
                        Weekly check-in
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteCheckIn(checkIn)}
                      disabled={deletingId === checkIn.id}
                      className="border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {deletingId === checkIn.id ? "Deleting..." : "Delete check-in"}
                    </button>
                  </div>

                  <div className="mt-5 grid gap-px bg-white/20 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Weight" value={checkIn.weight == null ? "—" : `${checkIn.weight} kg`} />
                    <Stat label="Energy" value={checkIn.energy == null ? "—" : `${checkIn.energy}/10`} />
                    <Stat label="Hunger" value={checkIn.hunger == null ? "—" : `${checkIn.hunger}/10`} />
                    <Stat label="Sleep" value={checkIn.sleep == null ? "—" : `${checkIn.sleep}/10`} />
                  </div>

                  {checkIn.notes && (
                    <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                      {checkIn.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const inputClassName =
  "mt-3 w-full border border-white/20 bg-[#181818] px-4 py-4 text-white outline-none transition placeholder:text-zinc-400 focus:border-white";

function Field({ label, suffix, required = false, children }: { label: string; suffix?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.08em] text-zinc-400">
        <span>
          {label}
          {required && <span className="ml-1" style={{ color: ACCENT }}>*</span>}
        </span>
        {suffix && <span className="text-zinc-400">{suffix}</span>}
      </span>
      {children}
    </label>
  );
}

function Section({ number, label, description, children }: { number: string; label: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-8 border-b border-white/20 py-12 lg:grid-cols-[280px_1fr]">
      <div>
        <p className="text-xs font-bold" style={{ color: ACCENT }}>{number}</p>
        <h2 className="mt-4 text-2xl font-black uppercase tracking-[-0.035em]">{label}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111111] p-4">
      <p className="text-[9px] uppercase tracking-[0.08em] text-zinc-400">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}