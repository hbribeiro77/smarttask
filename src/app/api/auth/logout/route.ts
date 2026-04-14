import { NextResponse } from "next/server";
import { SMARTTASK_SESSION_COOKIE_NAME } from "@/lib/smarttask-password-auth-signed-session-token-webcrypto-hmac-sha256";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SMARTTASK_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
