// ============================================
// 10-1. ログイン認証 (app/login/page.jsx)
// サーバーコンポーネント --- サーバーで先にリダイレクト判定
// ============================================

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/"); // ← これで「ログイン済みが/loginへ」を防止
  return <LoginClient />;
}
