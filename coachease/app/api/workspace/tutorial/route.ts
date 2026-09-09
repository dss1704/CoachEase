import { createClient } from "@/lib/supabase/server";
export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ error: "Forbidden" }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  if (!body || !["completed", "skipped"].includes(body.outcome)) return Response.json({ error: "Invalid outcome" }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { error } = await supabase.from("coach_onboarding").upsert({ coach_id: user.id, outcome: body.outcome, finished_at: new Date().toISOString() }, { onConflict: "coach_id" }).select("coach_id").single();
  if (error) return Response.json({ error: "Could not remember your choice. Please retry." }, { status: 503 });
  return Response.json({ saved: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { data, error } = await supabase.from("coach_onboarding").select("coach_id").eq("coach_id", user.id).maybeSingle();
  if (error) return Response.json({ error: "Tutorial memory unavailable" }, { status: 503 });
  return Response.json({ pending: !data }, { headers: { "Cache-Control": "no-store" } });
}
