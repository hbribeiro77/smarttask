"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SmarttaskPasswordAuthSignOutToolbarButtonClient() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={busy}
      onClick={() => void signOut()}
    >
      <LogOut className="size-3.5 shrink-0" aria-hidden />
      {busy ? "Saindo…" : "Sair"}
    </Button>
  );
}
