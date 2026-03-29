// proxy.ts

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, RESERVED_SLUGS } from "@/constants";

const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST || "localhost:3000";
const SHORT_HOST = process.env.NEXT_PUBLIC_SHORT_HOST || "localhost:3000";
const PROTOCOL = process.env.NEXT_PUBLIC_PROTOCOL || "http";

function isAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  return !!cookie?.value;
}

function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/verify",
    "/forgot-password",
    "/reset-password",
    "/account-deleted",
    "/setup",
    "/api/setup",
    "/api/setup/status",
    "/api/login",
    "/api/logout",
    "/api/session",
    "/api/public-links",
    "/api/auth/register",
    "/api/auth/verify",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/resend-otp",
    "/api/report",
    "/api/cron/cleanup",
    "/api/admin/delete", 
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ];

  return publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

export default function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  
  const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const requestHost = hostHeader.split(":")[0];
  
  const appHostClean = APP_HOST.split(":")[0];
  const shortHostClean = SHORT_HOST.split(":")[0];

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isShortDomain = requestHost === shortHostClean && appHostClean !== shortHostClean;

  if (isShortDomain) {
    if (pathname === "/") {
      return NextResponse.redirect(`${PROTOCOL}://${APP_HOST}`, 301);
    }

    const firstSegment = pathname.split("/")[1];
    if (firstSegment && RESERVED_SLUGS.has(firstSegment)) {
      const search = req.nextUrl.search;
      return NextResponse.redirect(`${PROTOCOL}://${APP_HOST}${pathname}${search}`, 301);
    }

    return NextResponse.next();
  }

  const authed = isAuthenticated(req);

  if (authed && (
    pathname === "/" || 
    pathname === "/login" || 
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/verify" ||
    pathname === "/setup"
  )) {
    return NextResponse.redirect(new URL("/dash", req.url));
  }

  if (!authed && !isPublicPath(pathname)) {
    const segments = pathname.split("/").filter(Boolean);
    const isShortlinkCandidate = segments.length === 1 && !RESERVED_SLUGS.has(segments[0]);

    if (!isShortlinkCandidate) {
        const loginUrl = new URL("/", req.url);
        return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
