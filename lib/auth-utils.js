// ============================================
// 13. 認証チェック用ユーティリティ (lib/auth-utils.js)
// HttpOnly session cookie を検証して、
// ログインユーザー情報を返す
// 未ログイン/無効なら null を返す
// ============================================
import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

export async function getCurrentUser() {
  const cookieStore = await cookies(); // Next.js 15対応
  const session = cookieStore.get("session")?.value; // HttpOnly cookie 取得

  if (!session) return null;

  try {
    // Session cookie を検証してユーザー情報を取得
    // true: revoked(失効)チェックも行う（セキュア寄り）
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    return decodedClaims;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}
