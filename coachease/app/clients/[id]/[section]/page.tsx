import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientEditor from "@/components/workspace/client-editor";
import s from "@/components/workspace/workspace.module.css";
export default async function ClientSection({ params }: { params: Promise<{ id: string; section: string }> }) {
  const { id, section } = await params;
  if (!["goals", "stats", "notes", "workouts", "meal-plans"].includes(section)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase.from("clients").select("id, name, goal, coach_notes, starting_weight, current_weight, target_weight, daily_calories, protein_target, carbs_target, fat_target").eq("id", id).eq("coach_id", user.id).maybeSingle();
  if (error) throw new Error("Could not load this client. Please try again.");
  if (!data) notFound();
  if (section === "goals" || section === "notes" || section === "stats") return <ClientEditor key={`${id}-${section}`} client={data} section={section} />;
  const workout = section === "workouts";
  return <main className={s.page}><header className={s.pageHeader}><div><p className={s.kicker}>{data.name}</p><h1>{workout ? "Workouts" : "Meal plans"}</h1><p>{workout ? "A place for this client’s training programme." : "A place for this client’s meals and portions."}</p></div><span className={s.badge}>Planned</span></header>
    <section className={s.placeholder}><span className={s.placeholderNumber}>{workout ? "W / 01" : "N / 01"}</span><h2>{workout ? "Their training, organised here." : "Their meals, organised here."}</h2><p>{workout ? "The workout builder is not available yet. This section will hold training days, exercises, sets and reps." : "The meal-plan editor is not available yet. You can already set and save calorie and macro targets in Nutrition targets."}</p><div className={s.plannedColumns}>{(workout ? ["Training days", "Exercises", "Sets & reps"] : ["Meal schedule", "Foods & portions", "Daily totals"]).map(label => <span key={label}>{label}</span>)}</div></section>
  </main>;
}
