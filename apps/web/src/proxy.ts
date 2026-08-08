import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth-server";

const PUBLIC_API_PATHS = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/verify-forgot-password-otp",
  "/api/auth/reset-password",
  "/api/auth/verify-registration-otp",
  "/api/auth/resend-registration-otp",
  "/api/products",
  "/api/categories",
  "/api/brands",
  "/api/testimonials",
  "/api/newsletter",
  "/api/cms",
  "/api/locations",
  "/api/public",
  "/api/coupons",
  "/api/reviews",
];

const ADMIN_API_PATHS = ["/api/admin"];
const ADMIN_PAGE_PATHS = ["/admin"];

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((path) => {
    return pathname === path || pathname.startsWith(path + "/") || pathname.startsWith(path + "?");
  });
}

function isAdminPath(pathname: string): boolean {
  return (
    ADMIN_API_PATHS.some((path) => pathname.startsWith(path)) ||
    ADMIN_PAGE_PATHS.some((path) => pathname.startsWith(path))
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-API, non-admin paths and allow public /admin/login page
  if ((!pathname.startsWith("/api") && !pathname.startsWith("/admin")) || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isPublic = pathname.startsWith("/api") && isPublicApiPath(pathname);

  // Get token from header or cookie
  const authHeader = request.headers.get("Authorization");
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  const tokenFromCookie = request.cookies.get("access_token")?.value;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    if (isPublic) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login?redirectTo=/admin", request.url));
  }

  // Verify token
  const payload = await verifyAccessToken(token);

  if (!payload) {
    if (isPublic) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login?redirectTo=/admin", request.url));
  }

  // Admin-only paths require admin role
  if (isAdminPath(pathname)) {
    const adminRoles = ["super-admin", "admin"];
    if (!adminRoles.includes(payload.role)) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { success: false, message: "Forbidden: Admin access required" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Pass user info to route handlers via headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.sub);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
  ],
};
