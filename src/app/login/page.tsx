import { redirect } from "next/navigation";
import { isSmarttaskGoogleOAuthEnabledFromEnvironment } from "@/lib/smarttask-parse-auth-allowed-emails-from-environment-comma-separated-string";
import { SmarttaskLoginPageGoogleOauthSignInButtonClient } from "@/components/smarttask-login-page-google-oauth-sign-in-button-client";

export default function SmarttaskLoginRoutePage() {
  if (!isSmarttaskGoogleOAuthEnabledFromEnvironment()) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-br from-sky-100/50 via-background to-violet-100/45 px-4 py-12 dark:from-background dark:via-background dark:to-card/30">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/70 bg-card/90 p-8 shadow-md backdrop-blur-sm">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">SmartTask</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Acesso restrito. Entre com a conta Google autorizada para continuar.
          </p>
        </div>
        <div className="flex justify-center">
          <SmarttaskLoginPageGoogleOauthSignInButtonClient />
        </div>
      </div>
    </div>
  );
}
