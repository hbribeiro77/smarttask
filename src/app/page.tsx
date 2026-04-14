import { SmarttaskClientHydrationAndCemeteryVisibilityProvider } from "@/components/providers/smarttask-client-hydration-and-cemetery-visibility-provider";
import { SmarttaskMainAppShellWithTabsAndParentCompleteDialog } from "@/components/smarttask-main-app-shell-with-tabs-and-parent-complete-dialog";

export default function Home() {
  return (
    <SmarttaskClientHydrationAndCemeteryVisibilityProvider>
      <SmarttaskMainAppShellWithTabsAndParentCompleteDialog />
    </SmarttaskClientHydrationAndCemeteryVisibilityProvider>
  );
}
