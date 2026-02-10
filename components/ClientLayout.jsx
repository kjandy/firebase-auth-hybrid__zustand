// ============================================
// 5. 認証監視を開始するClientLayout
//    (components/ClientLayout.jsx)
// ============================================
"use client";
import { useEffect } from "react";
import { initAuth } from "@/stores/authStore";
import FloatingPostButton from "@/components/FloatingPostButton";

export default function ClientLayout({ children }) {
  useEffect(() => {
    const unsubscribe = initAuth(); // 認証監視開始
    return () => unsubscribe(); // クリーンアップ
  }, []);

  return (
    <>
      {children}
      <FloatingPostButton />
    </>
  );
}
