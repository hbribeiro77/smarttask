import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { isSmarttaskPasswordAuthEnabledFromEnvironment } from "@/lib/smarttask-password-auth-is-enabled-from-environment";
import { resolveSmarttaskPasswordAuthSessionSigningSecretFromEnvironment } from "@/lib/smarttask-password-auth-resolve-session-signing-secret-from-environment";
import {
  createSmarttaskPasswordAuthSignedSessionToken,
  SMARTTASK_SESSION_COOKIE_NAME,
  SMARTTASK_SESSION_DURATION_MS,
} from "@/lib/smarttask-password-auth-signed-session-token-webcrypto-hmac-sha256";

export async function POST(request: Request) {
  if (!isSmarttaskPasswordAuthEnabledFromEnvironment()) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 400 });
  }

  const expected = process.env.SMARTTASK_ACCESS_PASSWORD!.trim();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";

  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const secret = resolveSmarttaskPasswordAuthSessionSigningSecretFromEnvironment();
  const token = await createSmarttaskPasswordAuthSignedSessionToken(secret);
  const maxAge = Math.floor(SMARTTASK_SESSION_DURATION_MS / 1000);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SMARTTASK_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
