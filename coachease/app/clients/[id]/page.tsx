import { supabase } from "@/lib/supabase";

type ClientPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientPage({
  params,
}: ClientPageProps) {
  const { id } = await params;

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) {
    return <p>Client not found.</p>;
  }

  return (
    <main>
      <h1>{client.name}</h1>
      <p>Client ID: {client.id}</p>
    </main>
  );
}