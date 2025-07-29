import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các route cần xác thực
const protectedRoutes = [
  "/menstrual-tracker",
  "/appointments",
  "/sti-testing",
  "/profile",
];

// Các route chỉ dành cho admin
const adminRoutes = ["/admin"];

// Các route chỉ dành cho consultant (hiện tại để trống vì /consultant cho phép cả user và consultant)
const consultantRoutes: string[] = [];

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("auth-token");
  const { pathname } = request.nextUrl;

  // Kiểm tra xác thực cho protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!currentUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Kiểm tra quyền consultant (hiện tại không áp dụng vì /consultant được dùng cho cả user và consultant)
  if (consultantRoutes.some((route) => pathname.startsWith(route))) {
    try {
      if (!currentUser) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      const userData = JSON.parse(atob(currentUser.value.split(".")[1]));
      if (userData.role !== "consultant") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Cấu hình các route áp dụng middleware
export const config = {
  matcher: [
    
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
