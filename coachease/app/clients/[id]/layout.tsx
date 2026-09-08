import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientNavigation from "@/components/workspace/client-nav";
export default async function ClientLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase.from("clients").select("id, name").eq("id", id).eq("coach_id", user.id).maybeSingle();
  if (error) throw new Error("Could not load this client. Please try again.");
  if (!data) notFound();
  return <><ClientNavigation clientId={id} name={data.name} />{children}</>;
}
