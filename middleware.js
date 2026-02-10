// ============================================
// 16. ミドルウェア (middleware.js)
// ============================================
import { NextResponse } from "next/server";

export async function middleware(request) {
  const session = request.cookies.get("session");

  // /dashboard へのアクセスを保護
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済みの場合は /login へのアクセスを / にリダイレクト
  if (session && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
