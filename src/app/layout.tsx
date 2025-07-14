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
          {/* Removed the inline script for chunk load errors to debug syntax error */}
        </head>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light">
            <ClientAuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <footer className="border-t">
                  <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
                    {/* Removed "Built by Healthcare Team. Source code available on GitHub." */}
                  </div>
                </footer>
              </div>
              <Toaster />
              {/* Floating Chat Bubble */}
              <Link
                href="/api-test"
                style={{
                  position: "fixed",
                  bottom: 90,
                  right: 24,
                  zIndex: 1000,
                  background: "#16a34a",
                  color: "white",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  fontSize: 18,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                title="API Test"
              >
                🔧
              </Link>
              
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
                �
              </Link>
            </ClientAuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </GoogleOAuthProvider>
  );
}
