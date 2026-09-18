import { EmailVerificationBanner } from "@/components/shared/account-notices";
import { SiteHeader } from "@/components/shared/site-header";

interface Props {
  children: React.ReactNode;
}

export const AppShell = ({ children }: Props) => {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      {/* Sits above the content rather than inside a page, so it persists
          across navigation instead of re-appearing per route. */}
      <EmailVerificationBanner />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
};
