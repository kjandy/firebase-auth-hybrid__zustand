// ============================================
// 9. TOPページのクライアント部分
//    (components/TopPageClient.jsx)
// ============================================
"use client";
import { useEffect, useRef } from "react";
import useAuthStore from "@/stores/authStore";
import useFirestoreStore from "@/stores/firestoreStore";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function TopPageClient({ initialUser }) {
  const { user, loading } = useAuthStore();
  const {
    timeline,
    timelineLoading,
    timelineHasMore,
    loadTimeline,
    loadMoreTimeline,
    resetTimeline,
  } = useFirestoreStore();
  const router = useRouter();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // タイムライン読み込み
  useEffect(() => {
    if (user) {
      loadTimeline();
    } else {
      resetTimeline();
    }
  }, [user]);

  // 無限スクロール設定
  useEffect(() => {
    if (!user || !timelineHasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !timelineLoading) {
          loadMoreTimeline();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [user, timelineHasMore, timelineLoading]);

  const getInitials = (email) => (email ? email.charAt(0).toUpperCase() : "?");

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
              <p className="text-gray-500">みんなの投稿をチェックしましょう</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左カラム: クイックアクション */}
              <div className="lg:col-span-1 space-y-4">
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

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push("/dashboard")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📝</span> 新規投稿
                    </CardTitle>
                    <CardDescription>Firestoreに投稿を作成</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">📈 統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          全体の投稿数
                        </span>
                        <span className="font-semibold">
                          {timeline.length}+
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 右カラム: タイムライン */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>🌐 タイムライン</CardTitle>
                    <CardDescription>みんなの最新投稿</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {timeline.length === 0 && !timelineLoading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">まだ投稿がありません</p>
                        <p className="text-sm mt-2">
                          最初の投稿を作成してみましょう！
                        </p>
                        <Button
                          className="mt-4"
                          onClick={() => router.push("/dashboard")}
                        >
                          投稿を作成
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {timeline.map((post, index) => (
                          <div
                            key={post.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                                  {getInitials(post.userEmail || "U")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm truncate">
                                    {post.userEmail || "ユーザー"}
                                  </span>
                                  {post.createdAt && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatRelativeTime(post.createdAt)}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-semibold mt-1">
                                  {post.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                  {post.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* 無限スクロールのトリガー要素 */}
                        {timelineHasMore && (
                          <div ref={loadMoreRef} className="py-4 text-center">
                            {timelineLoading ? (
                              <div className="text-sm text-muted-foreground">
                                読み込み中...
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                スクロールして続きを読む
                              </div>
                            )}
                          </div>
                        )}

                        {!timelineHasMore && timeline.length > 0 && (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            これ以上の投稿はありません
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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

// 相対時間フォーマット（例: "3分前"）
function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}秒前`;
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
