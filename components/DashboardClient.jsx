// ============================================
// 12. ダッシュボード UI
//     (components/DashboardClient.jsx)
// ============================================
"use client";
import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardClient({ serverUser }) {
  const { user } = useAuthStore();
  const {
    posts,
    loading: postsLoading,
    subscribeToUserPosts,
    unsubscribeFromPosts,
    addPost,
    deletePost,
  } = useFirestoreStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firestoreのデータを監視開始
  useEffect(() => {
    // ユーザーUIDが利用可能になったら監視開始
    if (user?.uid) {
      subscribeToUserPosts(user.uid); // 監視開始
    }
    return () => unsubscribeFromPosts(); // クリーンアップ
  }, [user?.uid]); // 監視開始 の依存関係にuser.uidを追加

  //  ユーザーのイニシャルを取得
  const getInitials = (email) => (email ? email.charAt(0).toUpperCase() : "?");

  // ログインプロバイダー名を取得
  const getProviderName = () => {
    const provider = serverUser?.firebase?.sign_in_provider; // サーバーから渡されたユーザー情報を使用
    if (provider === "google.com") return "Google"; // Googleログイン
    if (provider === "password") return "メール/パスワード"; //  メール/パスワードログイン
    return provider || "不明"; //  その他/不明
  };

  // 投稿追加ハンドラー
  const handleAddPost = async (e) => {
    e.preventDefault(); //  フォームのデフォルト動作を防止
    if (!title || !content) return; // タイトルと内容が必須
    setIsSubmitting(true); // 送信中状態に設定
    try {
      await addPost(user.uid, title, content); // 投稿追加
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false); // 送信中状態を解除
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* ユーザー情報 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user?.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.email} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
                  {getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {user?.displayName || user?.email}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>ログイン方法: {getProviderName()}</p>
                <p>投稿数: {posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム：投稿フォーム */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📝 新規投稿</CardTitle>
                <CardDescription>Firestoreに保存される</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPost} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      placeholder="投稿のタイトル"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="content">内容</Label>
                    <textarea
                      id="content"
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="投稿の内容を書いてください"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "投稿中..." : "投稿する"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 右カラム：投稿一覧 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>📊 あなたの投稿</CardTitle>
                <CardDescription>リアルタイム更新</CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    読み込み中...
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-lg">投稿がありません</p>
                    <p className="text-sm">
                      左側のフォームから最初の投稿を作成してください
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {post.content}
                            </p>
                            {post.createdAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {post.createdAt.toLocaleDateString("ja-JP", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deletePost(post.id)}
                          >
                            削除
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
