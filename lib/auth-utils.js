// ============================================
// 13. 認証チェック用ユーティリティ (lib/auth-utils.js)
// ============================================
import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

export async function getCurrentUser() {
  const cookieStore = await cookies(); // Next.js 15対応
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    return decodedClaims;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}
