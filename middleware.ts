import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip password protection for the homepage, password page, and existing exclusions
  if (
    pathname === "/" ||
    pathname === "/password" ||
    pathname === "/drivermode" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    /\.(svg|png|jpg|jpeg|gif|webp)$/.test(pathname)
  ) {
    return await updateSession(request);
  }

  // Check if the user is authenticated
  const isAuthenticated = request.cookies.get("authenticated");

  if (!isAuthenticated) {
    // If not authenticated, redirect to the password page
    return NextResponse.redirect(new URL("/password", request.url));
  }

  // If authenticated, proceed with session update
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
