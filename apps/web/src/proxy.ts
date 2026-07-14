import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GUEST_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

const PROTECTED_ROUTES = [
  "/profile",
  "/checkout",
  "/orders",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasAccessToken = request.cookies.has("access_token");
  const hasRefreshToken = request.cookies.has("refresh_token");
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  // 1. If user is authenticated and tries to access guest routes, redirect to home
  const isGuestRoute = GUEST_ROUTES.some((route) => pathname.startsWith(route));
  if (isGuestRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. If user is not authenticated and tries to access protected routes, redirect to login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Remember redirect url
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - next.svg, vercel.svg (images/assets in public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg).*)",
  ],
};
