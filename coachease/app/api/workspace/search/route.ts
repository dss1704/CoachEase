import { createClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0,80) ?? "";
  if (query.length < 2) return Response.json({ clients: [] }, { headers: { "Cache-Control": "no-store" } });
  const escaped = query.replace(/[\\%_]/g, character => `\\${character}`);
  const { data, error } = await supabase.from("clients").select("id, name").eq("coach_id", user.id).ilike("name", `%${escaped}%`).order("name").limit(8);
  if (error) return Response.json({ error: "Client search is unavailable. Try again." }, { status: 503 });
  return Response.json({ clients: data }, { headers: { "Cache-Control": "no-store" } });
}
