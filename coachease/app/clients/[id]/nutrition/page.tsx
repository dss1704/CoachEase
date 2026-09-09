import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NutritionEditor from "@/components/workspace/nutrition-editor";
import s from "@/components/workspace/workspace.module.css";
export default async function ClientNutritionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase.from("clients").select("id, name, current_weight, target_weight, daily_calories, protein_target, carbs_target, fat_target").eq("id", id).eq("coach_id", user.id).maybeSingle();
  if (error) throw new Error("Could not load nutrition targets. Please try again.");
  if (!data) notFound();
  return <main className={s.page}><header className={s.pageHeader}><div><p className={s.kicker}>{data.name} / Nutrition</p><h1>Fuel the work.</h1><p>One daily target. A split you can shape around your client.</p></div></header><NutritionEditor key={id} client={data} showWeights /></main>;
}
