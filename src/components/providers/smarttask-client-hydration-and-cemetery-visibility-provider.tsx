"use client";

import { useEffect } from "react";
import { useSmartTaskStore } from "@/stores/smarttask-zustand-tasks-store-with-indexeddb-persistence";

export function SmarttaskClientHydrationAndCemeteryVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrate = useSmartTaskStore((s) => s.hydrate);
  const runCemeteryPass = useSmartTaskStore((s) => s.runCemeteryPass);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") runCemeteryPass();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [runCemeteryPass]);

  return <>{children}</>;
}
