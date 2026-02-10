// ============================================
// 9. TOPページのクライアント部分
//    (components/TopPageClient.jsx)
// ============================================
"use client";
import useAuthStore from "@/stores/authStore";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function TopPageClient({ initialUser }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 py-12">
        {user ? (
          // ← ログイン済みの場合（保護領域）
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold">
                ようこそ、{user.displayName || user.email}さん
              </h1>
              <p className="text-gray-500">何をしますか？</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/dashboard")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📊</span> ダッシュボード
                  </CardTitle>
                  <CardDescription>あなたのデータを確認</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📝</span> 新規投稿
                  </CardTitle>
                  <CardDescription>Firestoreに投稿を作成</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : (
          // ← 未ログインの場合
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">MyApp へようこそ</h1>
              <p className="text-gray-500 text-lg">
                Firebase + Next.js で構築されたアプリ
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl">🔐</div>
                    <div className="text-sm font-medium mt-1">
                      ハイブリッド認証
                    </div>
                    <div className="text-xs text-gray-500">
                      安全なセッション管理
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl">⚡</div>
                    <div className="text-sm font-medium mt-1">Firestore</div>
                    <div className="text-xs text-gray-500">
                      リアルタイムデータ
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl">🚀</div>
                    <div className="text-sm font-medium mt-1">Next.js 15</div>
                    <div className="text-xs text-gray-500">
                      最新テクノロジー
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => router.push("/login")}
                >
                  無料で始める
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
