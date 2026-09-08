import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localDate, summarize, type CoachClient, type CoachCheckIn } from "./summary";

export async function workspaceData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [clientsResult, checkInsResult] = await Promise.all([
    supabase.from("clients").select("id, name, goal, start_date, created_at, daily_calories, protein_target, carbs_target, fat_target").eq("coach_id", user.id).order("created_at", { ascending: false }),
    supabase.from("check_ins").select("id, client_id, check_in_date").eq("coach_id", user.id).order("check_in_date", { ascending: false }),
  ]);
  const clients = (clientsResult.data ?? []) as CoachClient[];
  const checkIns = checkInsResult.error ? null : (checkInsResult.data ?? []) as CoachCheckIn[];
  return { clients, clientError: !!clientsResult.error, checkInError: !!checkInsResult.error, summary: summarize(clients, checkIns, localDate()) };
}
