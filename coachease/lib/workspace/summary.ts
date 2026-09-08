export type CoachClient = {
  id: string;
  name: string;
  goal: string | null;
  start_date: string | null;
  created_at: string;
  daily_calories: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fat_target: number | null;
};
export type CoachCheckIn = { id: string; client_id: string; check_in_date: string };
export type CoachTask = { id: string; clientId: string; clientName: string; title: string; href: string; due: string; kind: "setup" | "check-in" };

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function summarize(clients: CoachClient[], checkIns: CoachCheckIn[] | null, today: string) {
  const latest = new Map<string, string>();
  for (const row of checkIns ?? []) {
    if (row.check_in_date <= today && row.check_in_date > (latest.get(row.client_id) ?? "")) latest.set(row.client_id, row.check_in_date);
  }
  const monday = new Date(`${today}T12:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  const weekStart = monday.toISOString().slice(0, 10);
  const clientIds = new Set(clients.map(client => client.id));
  const completed = checkIns === null ? null : new Set(checkIns.filter(row => clientIds.has(row.client_id) && row.check_in_date >= weekStart && row.check_in_date <= today).map(row => row.client_id)).size;
  const tasks: CoachTask[] = [];
  for (const client of clients) {
    const base = `/clients/${client.id}`;
    if (!client.goal?.trim()) tasks.push({ id: `${client.id}-goal`, clientId: client.id, clientName: client.name, title: "Add a primary goal", href: `${base}/goals`, due: today, kind: "setup" });
    if ([client.daily_calories, client.protein_target, client.carbs_target, client.fat_target].some(value => value === null)) tasks.push({ id: `${client.id}-nutrition`, clientId: client.id, clientName: client.name, title: "Complete nutrition targets", href: `${base}/nutrition`, due: today, kind: "setup" });
    if (checkIns !== null) {
      const last = latest.get(client.id);
      const firstDue = client.start_date ?? client.created_at.slice(0, 10);
      tasks.push({ id: `${client.id}-check-in`, clientId: client.id, clientName: client.name, title: last ? "Weekly check-in due" : "Record a first check-in", href: `${base}/check-ins`, due: last ? addDays(last, 7) : firstDue, kind: "check-in" });
    }
  }
  const outstanding = tasks.filter(task => task.due <= today).sort((a, b) => a.due.localeCompare(b.due));
  const upcoming = tasks.filter(task => task.due > today && task.due <= addDays(today, 7)).sort((a, b) => a.due.localeCompare(b.due));
  return { latest, completed, outstanding, upcoming, attention: new Set(outstanding.map(task => task.clientId)).size, due: checkIns === null ? null : outstanding.filter(task => task.kind === "check-in").length };
}
