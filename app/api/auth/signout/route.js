// ============================================
// 15. サインアウトAPI (app/api/auth/signout/route.js)
// ============================================
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies(); // Next.js 15対応
    cookieStore.delete("session");
    return Response.json({ status: "success" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
