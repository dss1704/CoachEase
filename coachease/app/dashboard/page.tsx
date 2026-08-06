"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  name: string;
};

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at");

    if (error) {
      console.error(error);
      return;
    }

    setClients(data ?? []);
  }

  async function addClient() {
    const name = newClient.trim();

    if (!name) return;

    const { error } = await supabase.from("clients").insert({ name });

    if (error) {
      console.error(error);
      return;
    }

    setNewClient("");
    await loadClients();
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <input
        value={newClient}
        onChange={(event) => setNewClient(event.target.value)}
        placeholder="Client name"
      />

      <button onClick={addClient}>Add Client</button>

      <h2>Clients</h2>

      {clients.map((client) => (
        <p key={client.id}>
          <Link href={`/clients/${client.id}`}>
            {client.name}
          </Link>
        </p>
      ))}
    </main>
  );
}