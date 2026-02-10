// ============================================
// 7. ヘッダー (components/Header.jsx)
// ============================================
"use client";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, loading, signOut } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const getInitials = (email) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  if (loading) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* ロゴ */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-lg hidden sm:inline">MyApp</span>
        </button>

        {/* ナビゲーション＋ログイン情報 */}
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              {/* ダッシュボードリンク */}
              <Button
                variant={pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                ダッシュボード
              </Button>

              {/* アバター＋ログアウト */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.email} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  ログアウト
                </Button>
              </div>
            </>
          ) : (
            <Button size="sm" onClick={() => router.push("/login")}>
              ログイン
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
