// ============================================
// 14. セッション作成API (app/api/auth/session/route.js)
// - クライアントからIDトークンを受け取り、Firebase Admin SDKでセッションCookieを作成
// これにより、ユーザーはブラウザにセッションCookieを保存し、
// 次回以降のリクエストで認証状態を維持できます。
// idToken を一度だけ受け取り、HttpOnly Cookie を作るための入口
// HttpOnly Cookieとは？
// - JavaScriptからアクセスできないCookie
// - XSS攻撃から保護される
// - サーバー側でのみ利用可能
// - どこに保存される？ ブラウザに保存される
// - どうやって使う？ ブラウザが自動的にHTTPリクエストに含める
// ============================================
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

//このAPIはPOSTリクエストのみを受け付けます
//→ POST メソッド専用の APIハンドラーをエクスポート
export async function POST(request) {
  // request.method     // "POST"
  // request.headers    // リクエストヘッダー
  // request.json()     // JSON body を読む
  // request.text()     // text body を読む
  // request.url        // URL
  try {
    const { idToken } = await request.json(); // クライアントからIDトークンを受け取る
    if (!idToken) return Response.json({ error: "No token" }, { status: 400 });

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5日間

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const cookieStore = await cookies(); // Next.js 15対応
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return Response.json({ status: "success", uid: decodedToken.uid });
  } catch (error) {
    console.error("Session creation error:", error.message);
    return Response.json(
      { error: "Unauthorized", message: error.message },
      { status: 401 },
    );
  }
}
