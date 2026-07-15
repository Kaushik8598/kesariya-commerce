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
  "/admin",
];

const ROLE_ROUTE_GUARDS: { prefix: string; allowedRoles: string[] }[] = [
  { prefix: "/admin", allowedRoles: ["super-admin"] },
];

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessTokenCookie = request.cookies.get("access_token");
  const hasAccessToken = !!accessTokenCookie;
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

  // 3. If user is authenticated and route is role-restricted, check access token role
  const activeGuard = ROLE_ROUTE_GUARDS.find((guard) => pathname.startsWith(guard.prefix));
  if (activeGuard && accessTokenCookie) {
    const payload = decodeJwt(accessTokenCookie.value);
    const userRole = payload?.role;
    if (!userRole || !activeGuard.allowedRoles.includes(userRole)) {
      // Redirect authenticated but unauthorized user to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
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
