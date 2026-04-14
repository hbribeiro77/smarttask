import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSmarttaskPasswordAuthEnabledFromEnvironment } from "@/lib/smarttask-password-auth-is-enabled-from-environment";
import { resolveSmarttaskPasswordAuthSessionSigningSecretFromEnvironment } from "@/lib/smarttask-password-auth-resolve-session-signing-secret-from-environment";
import {
  SMARTTASK_SESSION_COOKIE_NAME,
  SMARTTASK_SESSION_DURATION_MS,
  verifySmarttaskPasswordAuthSignedSessionToken,
} from "@/lib/smarttask-password-auth-signed-session-token-webcrypto-hmac-sha256";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname.startsWith("/_next")) return NextResponse.next();
  if (pathname === "/favicon.ico") return NextResponse.next();
  if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$/iu.test(pathname)) {
    return NextResponse.next();
  }

  if (!isSmarttaskPasswordAuthEnabledFromEnvironment()) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SMARTTASK_SESSION_COOKIE_NAME)?.value;
  const secret = resolveSmarttaskPasswordAuthSessionSigningSecretFromEnvironment();
  const v = await verifySmarttaskPasswordAuthSignedSessionToken(cookie, secret);
  if (!v.ok) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  const res = NextResponse.next();
  const maxAge = Math.floor(SMARTTASK_SESSION_DURATION_MS / 1000);
  res.cookies.set(SMARTTASK_SESSION_COOKIE_NAME, v.refreshedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
