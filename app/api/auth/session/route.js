// ============================================
// 14. セッション作成API (app/api/auth/session/route.js)
// ============================================
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request) {
  try {
    const { idToken } = await request.json();
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
