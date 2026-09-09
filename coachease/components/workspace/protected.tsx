import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoachShell from "./shell";

export default async function ProtectedWorkspace({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: onboarding, error: onboardingError } = await supabase.from("coach_onboarding").select("coach_id").eq("coach_id", user.id).maybeSingle();
  return <CoachShell key={user.id} tutorialPending={!onboardingError && !onboarding} tutorialUnavailable={!!onboardingError} email={user.email ?? "Coach account"}>{children}</CoachShell>;
}
