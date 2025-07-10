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

// Các route chỉ dành cho consultant
const consultantRoutes = ["/consultant"];

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("auth-token");
  const { pathname } = request.nextUrl;

  // Kiểm tra xác thực cho protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!currentUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Kiểm tra quyền admin
  // if (adminRoutes.some((route) => pathname.startsWith(route))) {
  //   try {
  //     if (!currentUser) {
  //       return NextResponse.redirect(new URL("/", request.url));
  //     }
  //     // Giải mã token và kiểm tra quyền admin (linh hoạt, chấp nhận isAdmin)
  //     const userData = JSON.parse(atob(currentUser.value.split(".")[1]));
  //     console.log("[MIDDLEWARE] Decoded userData:", userData);
  //     const isAdmin =
  //       (typeof userData.isAdmin === "boolean" && userData.isAdmin === true) ||
  //       (typeof userData.role === "string" &&
  //         userData.role.toLowerCase() === "admin") ||
  //       (Array.isArray(userData.roles) &&
  //         (userData.roles as any[])
  //           .map((r: any) => r.toLowerCase())
  //           .includes("admin"));
  //     if (!isAdmin) {
  //       return NextResponse.redirect(new URL("/", request.url));
  //     }
  //   } catch {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  // }

  // Kiểm tra quyền consultant
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
