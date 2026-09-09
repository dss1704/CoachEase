"use client";

import Link from "next/link";
import s from "@/components/workspace/workspace.module.css";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const ACCENT = "#c7ff00";

type ClientForm = {
  name: string;
  email: string;
  phone: string;
  start_date: string;
  goal: string;
  coach_notes: string;
};

const EMPTY_FORM: ClientForm = {
  name: "",
  email: "",
  phone: "",
  start_date: "",
  goal: "",
  coach_notes: "",
};

export default function ClientProfilePage() {
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

      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, phone, start_date, goal, coach_notes")
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
        coach_notes: data.coach_notes ?? "",
      });

      setLoading(false);
    }

    void loadClient();
  }, [clientId]);

  function updateField(field: keyof ClientForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccessMessage("");
  }

  function textOrNull(value: string) {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
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
        coach_notes: textOrNull(form.coach_notes),
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSuccessMessage("Client information saved.");
    setSaving(false);
    router.refresh();
  }

  async function deleteClient() {
    const confirmed = window.confirm(
      `Permanently delete ${form.name || "this client"}? This will also delete their check-ins.`
    );

    if (!confirmed) return;

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
      <main className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Loading client information...
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
            Client information
          </p>
          <h1 className="mt-4 break-words text-5xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">
            {form.name || "Unnamed client"}
          </h1>
          <p className="mt-5 text-zinc-400">
            Contact details, coaching goal and private coach notes.
          </p>
        </header>

        <form onSubmit={saveClient}>
          <Section number="01" label="Personal details" description="Basic contact and onboarding information.">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Full name" required>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={inputClassName}
                  placeholder="Client name"
                />
              </Field>

              <Field label="Start date">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className={inputClassName}
                />
              </Field>

              <Field label="Email address">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputClassName}
                  placeholder="client@example.com"
                />
              </Field>

              <Field label="Phone number">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={inputClassName}
                  placeholder="+44..."
                />
              </Field>
            </div>
          </Section>

          <Section number="02" label="Primary goal" description="What the client is currently working towards.">
            <textarea
              value={form.goal}
              onChange={(e) => updateField("goal", e.target.value)}
              className={`${inputClassName} min-h-36 resize-y`}
              placeholder="Lose body fat while maintaining strength..."
            />
          </Section>

          <Section number="03" label="Private coach notes" description="Private notes that are not visible to the client.">
            <textarea
              value={form.coach_notes}
              onChange={(e) => updateField("coach_notes", e.target.value)}
              className={`${inputClassName} min-h-48 resize-y`}
              placeholder="Injuries, preferences, coaching observations..."
            />
          </Section>

          {(errorMessage || successMessage) && (
            <div className="border-t border-white/20 py-6">
              {errorMessage && (
                <p className="border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}
              {successMessage && (
                <p className="border px-5 py-4 text-sm" style={{ borderColor: `${ACCENT}66`, backgroundColor: `${ACCENT}12`, color: ACCENT }}>
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
              className="border border-red-500/40 px-6 py-4 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete client"}
            </button>

            <button
              type="submit"
              disabled={saving || deleting}
              className="min-w-48 px-8 py-4 font-bold text-black transition hover:brightness-90 disabled:opacity-50"
              style={{ backgroundColor: ACCENT }}
            >
              {saving ? "Saving..." : "Save information"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const inputClassName =
  "mt-3 w-full border border-white/20 bg-[#181818] px-4 py-4 text-white outline-none transition placeholder:text-zinc-400 focus:border-white";

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.08em] text-zinc-400">
        {label}
        {required && <span className="ml-1" style={{ color: ACCENT }}>*</span>}
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