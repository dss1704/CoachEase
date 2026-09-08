"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const ACCENT = "#B7FF3C";

type ClientRow = {
  id: string;
  name: string;
  start_date: string | null;
  goal: string | null;
  starting_weight: number | null;
  current_weight: number | null;
  target_weight: number | null;
  daily_calories: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fat_target: number | null;
  coach_notes: string | null;
};

type CheckInRow = {
  id: string;
  check_in_date: string;
  weight: number | null;
  adherence: number | null;
  energy: number | null;
  hunger: number | null;
  sleep: number | null;
  notes: string | null;
  created_at: string;
};

export default function ClientDashboardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = params.id;

  const [client, setClient] = useState<ClientRow | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingClient, setDeletingClient] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setErrorMessage("");

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select(`
          id,
          name,
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
        `)
        .eq("id", clientId)
        .single();

      if (clientError || !clientData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setClient(clientData);

      const { data: checkInData, error: checkInError } = await supabase
        .from("check_ins")
        .select(`
          id,
          check_in_date,
          weight,
          adherence,
          energy,
          hunger,
          sleep,
          notes,
          created_at
        `)
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

    void loadDashboard();
  }, [clientId]);

  const latest = checkIns[0] ?? null;
  const previous = checkIns[1] ?? null;

  const latestWeight =
    checkIns.find((entry) => entry.weight !== null)?.weight ?? client?.current_weight ?? client?.starting_weight ?? null;

  const weightChange =
    latest?.weight !== null &&
    latest?.weight !== undefined &&
    previous?.weight !== null &&
    previous?.weight !== undefined
      ? latest.weight - previous.weight
      : null;

  const averageAdherence = useMemo(() => {
    const values = checkIns
      .map((item) => item.adherence)
      .filter((value): value is number => value !== null);

    if (values.length === 0) return null;

    return Math.round(
      values.reduce((total, value) => total + value, 0) / values.length
    );
  }, [checkIns]);

  const distanceToTarget =
    latestWeight == null || client?.target_weight == null
      ? null
      : Math.round((latestWeight - client.target_weight) * 10) / 10;

  async function deleteClient() {
    if (!client || deletingClient) return;

    setDeletingClient(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    if (error) {
      setErrorMessage(error.message);
      setDeletingClient(false);
      setShowDeleteConfirm(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          Loading client dashboard...
        </p>
      </main>
    );
  }

  if (notFound || !client) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <p className="text-xl font-semibold">Client not found.</p>
        <Link
          href="/dashboard/clients"
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
        <nav className="flex flex-col justify-between gap-5 border-b border-white/20 pb-6 sm:flex-row sm:items-center">
          <Link
            href="/dashboard/clients"
            className="font-mono text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: ACCENT }}
          >
            ← All clients
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/clients/${clientId}/profile`}
              className="border border-white/20 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/5"
            >
              Edit client
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="border border-red-500/40 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-red-400 transition hover:bg-red-500/10"
            >
              Delete client
            </button>

            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              Client ID · {clientId.slice(0, 8)}
            </span>
          </div>
        </nav>

        <header className="grid gap-10 border-b border-white/20 py-14 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p
              className="font-mono text-xs font-bold uppercase tracking-[0.24em]"
              style={{ color: ACCENT }}
            >
              Client dashboard
            </p>
            <h1 className="mt-4 break-words text-5xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-6xl">
              {client.name}
            </h1>
            <p className="mt-5 max-w-2xl text-zinc-500">
              {client.goal || "No primary goal has been added yet."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px border border-white/20 bg-white/20">
            <HeaderMeta label="Started" value={formatDate(client.start_date)} />
            <HeaderMeta label="Check-ins" value={String(checkIns.length)} />
          </div>
        </header>

        {errorMessage && (
          <div className="border-b border-white/20 py-6">
            <p className="border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {errorMessage}
            </p>
          </div>
        )}

        <section className="grid gap-px border-b border-white/20 bg-white/20 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Current weight"
            value={latestWeight == null ? "—" : `${latestWeight} kg`}
            helper={
              client.target_weight == null
                ? "No target set"
                : `Target ${client.target_weight} kg`
            }
          />
          <MetricCard
            label="Latest change"
            value={formatSignedWeight(weightChange)}
            helper={previous ? "Vs previous check-in" : "Need 2 check-ins"}
            accent={weightChange !== null}
          />
          <MetricCard
            label="Adherence"
            value={latest?.adherence == null ? "—" : `${latest.adherence}%`}
            helper={
              averageAdherence == null
                ? "No adherence data"
                : `${averageAdherence}% average`
            }
          />
          <MetricCard
            label="To target"
            value={distanceToTarget == null ? "—" : `${Math.abs(distanceToTarget)} kg`}
            helper={
              client.target_weight == null
                ? "No target set"
                : distanceToTarget === 0
                  ? "Target reached"
                  : `Target ${client.target_weight} kg`
            }
            accent={distanceToTarget !== null}
          />
        </section>

        <section className="grid gap-8 border-b border-white/20 py-12 lg:grid-cols-[280px_1fr]">
          <SectionIntro
            number="01"
            label="Latest check-in"
            description="The client's most recent weekly submission and recovery signals."
          />

          {latest ? (
            <div>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                    Most recent
                  </p>
                  <p className="mt-2 text-2xl font-black uppercase tracking-[-0.03em]">
                    {formatDate(latest.check_in_date)}
                  </p>
                </div>

                <Link
                  href={`/clients/${clientId}/check-ins`}
                  className="font-semibold underline decoration-[1px] underline-offset-8"
                  style={{ textDecorationColor: ACCENT }}
                >
                  Add new check-in
                </Link>
              </div>

              <div className="mt-6 grid gap-px border border-white/20 bg-white/20 sm:grid-cols-2 xl:grid-cols-5">
                <CheckInStat
                  label="Weight"
                  value={latest.weight == null ? "—" : `${latest.weight} kg`}
                />
                <CheckInStat
                  label="Adherence"
                  value={latest.adherence == null ? "—" : `${latest.adherence}%`}
                />
                <CheckInStat
                  label="Energy"
                  value={latest.energy == null ? "—" : `${latest.energy}/10`}
                />
                <CheckInStat
                  label="Hunger"
                  value={latest.hunger == null ? "—" : `${latest.hunger}/10`}
                />
                <CheckInStat
                  label="Sleep"
                  value={latest.sleep == null ? "—" : `${latest.sleep}/10`}
                />
              </div>

              <div className="mt-6 border border-white/20 bg-[#090909] p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                  Check-in notes
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                  {latest.notes || "No notes were added to this check-in."}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No check-ins yet"
              body="Add the first weekly check-in to begin building progress history."
              href={`/clients/${clientId}/check-ins`}
              action="Add first check-in"
            />
          )}
        </section>

        <section className="grid gap-8 border-b border-white/20 py-12 lg:grid-cols-[280px_1fr]">
          <SectionIntro
            number="02"
            label="Progress"
            description="A quick view of weight history across recent check-ins."
          />

          {checkIns.some((item) => item.weight !== null) ? (
            <WeightTrend checkIns={checkIns} />
          ) : (
            <EmptyState
              title="No weight history"
              body="Weight entries from weekly check-ins will appear here."
              href={`/clients/${clientId}/check-ins`}
              action="Add check-in"
            />
          )}
        </section>

        <section className="grid gap-8 border-b border-white/20 py-12 lg:grid-cols-[280px_1fr]">
          <SectionIntro
            number="03"
            label="Nutrition"
            description="Current calorie and macronutrient targets."
          />

          <div>
            <div className="grid gap-px border border-white/20 bg-white/20 sm:grid-cols-2 xl:grid-cols-4">
              <NutritionStat
                label="Calories"
                value={
                  client.daily_calories == null
                    ? "—"
                    : `${client.daily_calories.toLocaleString()}`
                }
                suffix="kcal"
              />
              <NutritionStat
                label="Protein"
                value={client.protein_target == null ? "—" : `${client.protein_target}`}
                suffix="g"
              />
              <NutritionStat
                label="Carbs"
                value={client.carbs_target == null ? "—" : `${client.carbs_target}`}
                suffix="g"
              />
              <NutritionStat
                label="Fat"
                value={client.fat_target == null ? "—" : `${client.fat_target}`}
                suffix="g"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Link
                href={`/clients/${clientId}/nutrition`}
                className="font-semibold underline decoration-[1px] underline-offset-8"
                style={{ textDecorationColor: ACCENT }}
              >
                Edit nutrition targets
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-8 py-12 lg:grid-cols-[280px_1fr]">
          <SectionIntro
            number="04"
            label="Coach notes"
            description="Private context and observations for this client."
          />

          <div className="border border-white/20 bg-[#090909] p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {client.coach_notes || "No private coach notes yet."}
            </p>
          </div>
        </section>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-white/20 bg-black">
            <div className="border-b border-white/20 p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">
                Delete client
              </p>

              <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.03em]">
                Are you sure?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                You are about to permanently delete{" "}
                <span className="font-semibold text-white">{client.name}</span>.
                This will also delete their associated check-ins. This action
                cannot be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingClient}
                className="border border-white/20 px-6 py-3 font-semibold transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteClient}
                disabled={deletingClient}
                className="border border-red-500/40 bg-red-500/10 px-6 py-3 font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingClient ? "Deleting..." : "Yes, delete client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatSignedWeight(value: number | null) {
  if (value === null) return "—";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded} kg`;
}

function HeaderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#090909] p-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  accent = false,
}: {
  label: string;
  value: string;
  helper: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-black p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>
      <p
        className="mt-5 text-4xl font-black tracking-[-0.045em]"
        style={accent ? { color: ACCENT } : undefined}
      >
        {value}
      </p>
      <p className="mt-3 text-xs text-zinc-600">{helper}</p>
    </div>
  );
}

function SectionIntro({
  number,
  label,
  description,
}: {
  number: string;
  label: string;
  description: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs font-bold" style={{ color: ACCENT }}>
        {number}
      </p>
      <h2 className="mt-4 text-2xl font-black uppercase tracking-[-0.035em]">
        {label}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function CheckInStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#090909] p-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>
      <p className="mt-3 text-lg font-bold">{value}</p>
    </div>
  );
}

function NutritionStat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="bg-[#090909] p-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black">
        {value}
        {value !== "—" && (
          <span className="ml-2 text-xs font-normal text-zinc-600">{suffix}</span>
        )}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="border border-white/20 bg-[#090909] p-6">
      <p className="text-lg font-bold">{title}</p>
      <p className="mt-2 text-sm text-zinc-500">{body}</p>
      <Link
        href={href}
        className="mt-6 inline-block font-semibold underline decoration-[1px] underline-offset-8"
        style={{ textDecorationColor: ACCENT }}
      >
        {action}
      </Link>
    </div>
  );
}

function WeightTrend({ checkIns }: { checkIns: CheckInRow[] }) {
  const points = checkIns
    .filter((item) => item.weight !== null)
    .slice(0, 8)
    .reverse();

  if (points.length === 0) return null;

  const weights = points.map((item) => item.weight as number);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = Math.max(max - min, 1);

  return (
    <div className="border border-white/20 bg-[#090909] p-6">
      <div className="flex h-56 items-end gap-3">
        {points.map((point) => {
          const weight = point.weight as number;
          const height = 25 + ((weight - min) / range) * 75;

          return (
            <div
              key={point.id}
              className="flex min-w-0 flex-1 flex-col items-center justify-end"
            >
              <span className="mb-3 text-xs font-bold">{weight} kg</span>
              <div className="flex h-36 w-full items-end border-b border-white/20">
                <div
                  className="w-full"
                  style={{
                    height: `${height}%`,
                    backgroundColor: ACCENT,
                  }}
                />
              </div>
              <span className="mt-3 truncate font-mono text-[9px] uppercase tracking-[0.08em] text-zinc-600">
                {new Date(`${point.check_in_date}T00:00:00`).toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "short" }
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}