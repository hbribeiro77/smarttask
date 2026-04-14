"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SmarttaskAuthSignOutToolbarButtonClient() {
  const { data: session, status } = useSession();
  if (status !== "authenticated") return null;
  const email = session.user?.email ?? "conta";
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5"
      title={email}
      onClick={() => void signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="size-3.5 shrink-0" aria-hidden />
      Sair
    </Button>
  );
}
