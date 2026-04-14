import Link from "next/link";
import { isSmarttaskGoogleOAuthEnabledFromEnvironment } from "@/lib/smarttask-parse-auth-allowed-emails-from-environment-comma-separated-string";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SmarttaskAccessDeniedRoutePage() {
  const oauthOn = isSmarttaskGoogleOAuthEnabledFromEnvironment();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-br from-sky-100/50 via-background to-violet-100/45 px-4 py-12 dark:from-background dark:via-background dark:to-card/30">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-destructive/25 bg-card/90 p-8 text-center shadow-md backdrop-blur-sm">
        <h1 className="font-heading text-xl font-semibold text-destructive">Acesso não autorizado</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          {oauthOn
            ? "Seu e-mail não está na lista permitida desta instância, ou o login não pôde ser concluído."
            : "O login por Google não está configurado neste ambiente."}
        </p>
        {oauthOn ? (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
          >
            Tentar novamente
          </Link>
        ) : (
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
          >
            Voltar ao início
          </Link>
        )}
      </div>
    </div>
  );
}
