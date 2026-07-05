import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api/auth",
  "/api/health",
  "/api/oauth",
];

const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session_id");
  const isAuthenticated = !!sessionCookie?.value;

  if (authPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/settings", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/settings") ||
    pathname.startsWith("/oauth/authorize")
  ) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/settings", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
