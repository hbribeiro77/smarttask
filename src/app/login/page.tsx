import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSmarttaskPasswordAuthEnabledFromEnvironment } from "@/lib/smarttask-password-auth-is-enabled-from-environment";
import { resolveSmarttaskPasswordAuthSessionSigningSecretFromEnvironment } from "@/lib/smarttask-password-auth-resolve-session-signing-secret-from-environment";
import {
  SMARTTASK_SESSION_COOKIE_NAME,
  verifySmarttaskPasswordAuthSignedSessionToken,
} from "@/lib/smarttask-password-auth-signed-session-token-webcrypto-hmac-sha256";
import { SmarttaskPasswordAuthLoginFormClient } from "@/components/smarttask-password-auth-login-form-client";

export default async function SmarttaskLoginRoutePage() {
  if (!isSmarttaskPasswordAuthEnabledFromEnvironment()) {
    redirect("/");
  }

  const cookie = (await cookies()).get(SMARTTASK_SESSION_COOKIE_NAME)?.value;
  const secret = resolveSmarttaskPasswordAuthSessionSigningSecretFromEnvironment();
  const session = await verifySmarttaskPasswordAuthSignedSessionToken(cookie, secret);
  if (session.ok) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-br from-sky-100/50 via-background to-violet-100/45 px-4 py-12 dark:from-background dark:via-background dark:to-card/30">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/70 bg-card/90 p-8 shadow-md backdrop-blur-sm">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">SmartTask</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Esta instância exige senha de acesso. A sessão dura 30 dias e renova automaticamente
            enquanto você usa o app.
          </p>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Carregando…</p>}>
          <SmarttaskPasswordAuthLoginFormClient />
        </Suspense>
      </div>
    </div>
  );
}
