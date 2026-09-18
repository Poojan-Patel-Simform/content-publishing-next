import { AppShell } from "@/components/shared/app-shell";

/** The public reading surface: no guard, readable logged out. */
const PublicLayout = ({ children }: LayoutProps<"/">) => {
  return <AppShell>{children}</AppShell>;
};

export default PublicLayout;
