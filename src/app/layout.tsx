import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ClientAuthProvider from "@/components/ClientAuthProvider";
import Header from "@/components/Header";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hệ thống quản lý sức khỏe giới tính",
  description:
    "Hệ thống quản lý dịch vụ chăm sóc sức khỏe giới tính chuyên nghiệp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <html lang="vi" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                function showReloadModal() {
                  if (document.getElementById('chunk-error-modal')) return;
                  var modal = document.createElement('div');
                  modal.id = 'chunk-error-modal';
                  modal.style.position = 'fixed';
                  modal.style.top = 0;
                  modal.style.left = 0;
                  modal.style.width = '100vw';
                  modal.style.height = '100vh';
                  modal.style.background = 'rgba(0,0,0,0.5)';
                  modal.style.display = 'flex';
                  modal.style.alignItems = 'center';
                  modal.style.justifyContent = 'center';
                  modal.style.zIndex = 99999;
                  modal.innerHTML = '<div style="background: white; border-radius: 12px; padding: 32px 24px; box-shadow: 0 4px 32px rgba(0,0,0,0.15); max-width: 90vw; text-align: center;">' +
                    '<h2 style="font-size: 1.5rem; margin-bottom: 12px; color: #d97706;">Ứng dụng vừa được cập nhật!</h2>' +
                    '<p style="margin-bottom: 24px; color: #333;">Để đảm bảo trải nghiệm tốt nhất, vui lòng tải lại trang để sử dụng phiên bản mới nhất.<br><span style="font-size:0.95em;color:#888">(Nếu bạn đang phát triển trên localhost, đây là hiện tượng bình thường khi restart server.)</span></p>' +
                    '<button id="reload-btn-modal" style="background: #2563eb; color: white; border: none; border-radius: 6px; padding: 10px 24px; font-size: 1rem; cursor: pointer;">Tải lại trang</button>' +
                  '</div>';
                  document.body.appendChild(modal);
                  document.getElementById('reload-btn-modal').onclick = function() {
                    window.location.reload();
                  };
                }
                window.addEventListener('error', function(e) {
                  if (e && e.message && (e.message.includes('ChunkLoadError') || e.message.includes('Unexpected token'))) {
                    showReloadModal();
                  }
                });
                window.addEventListener('unhandledrejection', function(e) {
                  if (e && e.reason && e.reason.name === 'ChunkLoadError') {
                    showReloadModal();
                  }
                });
              })();
            `,
            }}
          />
        </head>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light">
            <ClientAuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <footer className="border-t">
                  <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                    <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                      <p className="text-center text-sm leading-loose md:text-left">
                        Built by{" "}
                        <a
                          href="#"
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline underline-offset-4"
                        >
                          Healthcare Team
                        </a>
                        . Source code available on{" "}
                        <a
                          href="#"
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline underline-offset-4"
                        >
                          GitHub
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </footer>
              </div>
              <Toaster />
              {/* Floating Chat Bubble */}
              <Link
                href="/chat"
                style={{
                  position: "fixed",
                  bottom: 24,
                  right: 24,
                  zIndex: 1000,
                  background: "#2563eb",
                  color: "white",
                  borderRadius: "50%",
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  fontSize: 28,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                title="Chat tư vấn"
              >
                💬
              </Link>
            </ClientAuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </GoogleOAuthProvider>
  );
}
