"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SmarttaskLoginPageGoogleOauthSignInButtonClient() {
  return (
    <Button
      type="button"
      variant="default"
      className="gap-2"
      onClick={() => void signIn("google", { callbackUrl: "/" })}
    >
      Entrar com Google
    </Button>
  );
}
