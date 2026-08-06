import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ACCENT = "#B7FF3C";

type ClientPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientPage({
  params,
}: ClientPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <p>Client not found.</p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block"
          style={{ color: ACCENT }}
        >
          ← Return to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: ACCENT }}
        >
          ← Dashboard
        </Link>

        <p className="mt-16 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          Client profile
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.05em]">
          {client.name}
        </h1>

        <p className="mt-5 font-mono text-xs text-zinc-600">
          Client ID: {client.id}
        </p>
      </div>
    </main>
  );
}