"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const ACCENT = "#B7FF3C";

type Client = {
  id: string;
  name: string;
};

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at");

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setClients(data ?? []);
  }

  async function addClient() {
    const name = newClient.trim();

    if (!name) return;

    setErrorMessage("");

    const { error } = await supabase.from("clients").insert({
      name,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setNewClient("");
    await loadClients();
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white lg:px-10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/20 pb-6">
        <Link href="/" className="flex items-center gap-3 font-bold">
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
        <p
          className="font-mono text-xs font-bold uppercase tracking-[0.24em]"
          style={{ color: ACCENT }}
        >
          Coach workspace
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.05em]">
          Dashboard
        </h1>

        <div className="mt-12 grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            value={newClient}
            onChange={(event) => setNewClient(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addClient();
              }
            }}
            placeholder="Enter client name"
            className="border border-white/20 bg-[#090909] px-5 py-4 outline-none transition focus:border-white"
          />

          <button
            onClick={addClient}
            className="px-7 py-4 font-bold text-black"
            style={{ backgroundColor: ACCENT }}
          >
            Add client
          </button>
        </div>

        {errorMessage && (
          <p className="mt-5 border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
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
            <p className="px-6 py-10 text-zinc-500">
              No clients have been added yet.
            </p>
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
                <span className="font-semibold">{client.name}</span>
                <span style={{ color: ACCENT }}>Open →</span>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}