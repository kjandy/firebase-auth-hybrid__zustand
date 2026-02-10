// ============================================
// 6. レイアウト (app/layout.jsx)
// ============================================
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
