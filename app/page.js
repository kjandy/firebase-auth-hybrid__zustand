// ============================================
// 8. TOPページ (app/page.jsx)
// ============================================
import TopPageClient from "@/components/TopPageClient";
import { getCurrentUser } from "@/lib/auth-utils";

export default async function TopPage() {
  // サーバー側で認証チェック
  const user = await getCurrentUser();

  return <TopPageClient initialUser={user} />;
}
