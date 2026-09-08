"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const ACCENT = "#B7FF3C";

type Client = {
  id: string;
  name: string;
};

type NewClientForm = {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  start_date: string;
  goal: string;
};

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createEmptyClientForm(): NewClientForm {
  return {
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    start_date: getToday(),
    goal: "",
  };
}

export default function Dashboard() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState<NewClientForm>(
    createEmptyClientForm
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [addingClient, setAddingClient] = useState(false);

  useEffect(() => {
    async function loadClients() {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("created_at", { ascending: true });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setClients(data ?? []);
    }

    void loadClients();
  }, []);

  function updateNewClient(
    field: keyof NewClientForm,
    value: string
  ) {
    setNewClient((current) => ({
      ...current,
      [field]: value,
    }));

    setErrorMessage("");
  }

  function openAddClient() {
    setNewClient(createEmptyClientForm());
    setErrorMessage("");
    setShowAddClient(true);
  }

  function closeAddClient() {
    if (addingClient) return;

    setShowAddClient(false);
    setErrorMessage("");
    setNewClient(createEmptyClientForm());
  }

  function textOrNull(value: string) {
    const trimmed = value.trim();

    return trimmed === "" ? null : trimmed;
  }

  async function addClient(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (addingClient) return;

    const name = newClient.name.trim();

    if (!name) {
      setErrorMessage("Client name is required.");
      return;
    }

    if (
      newClient.date_of_birth &&
      newClient.date_of_birth > getToday()
    ) {
      setErrorMessage(
        "Date of birth cannot be in the future."
      );
      return;
    }

    setAddingClient(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("You are not signed in.");
      setAddingClient(false);
      return;
    }

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name,
        email: textOrNull(newClient.email),
        phone: textOrNull(newClient.phone),
        date_of_birth:
          newClient.date_of_birth || null,
        gender: textOrNull(newClient.gender),
        start_date: newClient.start_date || null,
        goal: textOrNull(newClient.goal),
        coach_id: user.id,
      })
      .select("id")
      .single();

    if (error) {
      setErrorMessage(error.message);
      setAddingClient(false);
      return;
    }

    setAddingClient(false);
    setShowAddClient(false);
    setNewClient(createEmptyClientForm());

    router.push(`/clients/${data.id}`);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white lg:px-10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/20 pb-6">
        <Link
          href="/"
          className="flex items-center gap-3 font-bold"
        >
          <span
            className="flex h-8 w-8 items-center justify-center text-xs font-black text-black"
            style={{ backgroundColor: ACCENT }}
          >
            CE
          </span>

          CoachEase
        </Link>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="border border-white/30 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:text-black"
          >
            Log out
          </button>
        </form>
      </nav>

      <section className="mx-auto mt-14 max-w-7xl">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p
              className="font-mono text-xs font-bold uppercase tracking-[0.24em]"
              style={{ color: ACCENT }}
            >
              Coach workspace
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.05em]">
              Dashboard
            </h1>
          </div>

          <button
            type="button"
            onClick={openAddClient}
            className="px-7 py-4 font-bold text-black transition hover:brightness-90"
            style={{ backgroundColor: ACCENT }}
          >
            + Add client
          </button>
        </div>

        {errorMessage && !showAddClient && (
          <p className="mt-8 border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
            {errorMessage}
          </p>
        )}

        <div className="mt-12 border border-white/20">
          <div className="border-b border-white/20 px-6 py-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              Active clients · {clients.length}
            </h2>
          </div>

          {clients.length === 0 ? (
            <div className="px-6 py-12">
              <p className="text-zinc-500">
                No clients have been added yet.
              </p>

              <button
                type="button"
                onClick={openAddClient}
                className="mt-5 font-semibold"
                style={{ color: ACCENT }}
              >
                Add your first client →
              </button>
            </div>
          ) : (
            clients.map((client, index) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className={`flex items-center justify-between px-6 py-5 transition hover:bg-white/5 ${
                  index !== clients.length - 1
                    ? "border-b border-white/20"
                    : ""
                }`}
              >
                <span className="font-semibold">
                  {client.name}
                </span>

                <span style={{ color: ACCENT }}>
                  Open →
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-white/20 bg-black">
            <div className="flex items-start justify-between border-b border-white/20 p-6 sm:p-8">
              <div>
                <p
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.24em]"
                  style={{ color: ACCENT }}
                >
                  New client
                </p>

                <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em]">
                  Add client
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Enter the client&apos;s initial information.
                  Nutrition and check-ins are managed
                  separately.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddClient}
                disabled={addingClient}
                className="ml-6 text-2xl text-zinc-500 transition hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={addClient}>
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
                <Field
                  label="Full name"
                  required
                >
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newClient.name}
                    onChange={(event) =>
                      updateNewClient(
                        "name",
                        event.target.value
                      )
                    }
                    className={inputClassName}
                    placeholder="Michael Smith"
                  />
                </Field>

                <Field label="Email address">
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(event) =>
                      updateNewClient(
                        "email",
                        event.target.value
                      )
                    }
                    className={inputClassName}
                    placeholder="client@example.com"
                  />
                </Field>

                <Field label="Phone number">
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(event) =>
                      updateNewClient(
                        "phone",
                        event.target.value
                      )
                    }
                    className={inputClassName}
                    placeholder="+44..."
                  />
                </Field>

                <Field label="Date of birth">
                  <input
                    type="date"
                    max={getToday()}
                    value={newClient.date_of_birth}
                    onChange={(event) =>
                      updateNewClient(
                        "date_of_birth",
                        event.target.value
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Gender">
                  <select
                    value={newClient.gender}
                    onChange={(event) =>
                      updateNewClient(
                        "gender",
                        event.target.value
                      )
                    }
                    className={inputClassName}
                  >
                    <option value="">
                      Select gender
                    </option>
                    <option value="Male">
                      Male
                    </option>
                    <option value="Female">
                      Female
                    </option>
                    <option value="Other">
                      Other
                    </option>
                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>
                  </select>
                </Field>

                <Field label="Start date">
                  <input
                    type="date"
                    value={newClient.start_date}
                    onChange={(event) =>
                      updateNewClient(
                        "start_date",
                        event.target.value
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Primary goal">
                    <textarea
                      value={newClient.goal}
                      onChange={(event) =>
                        updateNewClient(
                          "goal",
                          event.target.value
                        )
                      }
                      className={`${inputClassName} min-h-32 resize-y`}
                      placeholder="Lose body fat while maintaining strength..."
                    />
                  </Field>
                </div>
              </div>

              {errorMessage && (
                <div className="px-6 pb-6 sm:px-8">
                  <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errorMessage}
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-white/20 p-6 sm:flex-row sm:p-8">
                <button
                  type="button"
                  onClick={closeAddClient}
                  disabled={addingClient}
                  className="border border-white/20 px-7 py-4 font-semibold transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingClient}
                  className="min-w-44 px-7 py-4 font-bold text-black transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor: ACCENT,
                  }}
                >
                  {addingClient
                    ? "Creating..."
                    : "Create client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

const inputClassName =
  "mt-3 w-full border border-white/20 bg-[#090909] px-4 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {label}

        {required && (
          <span
            className="ml-1"
            style={{ color: ACCENT }}
          >
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}