import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AccountStatusGate } from "@/components/shared/account-notices";
import { AppShell } from "@/components/shared/app-shell";

const AppLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <AuthGuard>
      <AppShell>
        <AccountStatusGate>{children}</AccountStatusGate>
      </AppShell>
    </AuthGuard>
  );
};

export default AppLayout;
