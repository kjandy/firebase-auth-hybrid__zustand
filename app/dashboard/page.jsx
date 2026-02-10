// ============================================
// 11. ダッシュボード (app/dashboard/page.jsx)
// ============================================
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <DashboardClient serverUser={user} />;
}
