import { SmarttaskClientHydrationAndCemeteryVisibilityProvider } from "@/components/providers/smarttask-client-hydration-and-cemetery-visibility-provider";
import { SmarttaskMainAppShellWithTabsAndParentCompleteDialog } from "@/components/smarttask-main-app-shell-with-tabs-and-parent-complete-dialog";
import { isSmarttaskPasswordAuthEnabledFromEnvironment } from "@/lib/smarttask-password-auth-is-enabled-from-environment";

export default function Home() {
  return (
    <SmarttaskClientHydrationAndCemeteryVisibilityProvider>
      <SmarttaskMainAppShellWithTabsAndParentCompleteDialog
        passwordAuthEnabled={isSmarttaskPasswordAuthEnabledFromEnvironment()}
      />
    </SmarttaskClientHydrationAndCemeteryVisibilityProvider>
  );
}
