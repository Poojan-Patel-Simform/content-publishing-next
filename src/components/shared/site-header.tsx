"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LogOut, PenLine, User as UserIcon } from "lucide-react";
import { cn } from "cn";
import { useAuth } from "@/features/auth/hooks";
import { useLogout } from "@/features/auth/hooks";
import { editorialApi } from "@/lib/api/editorial";
import { editorialKeys } from "@/lib/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** One row of the queue is enough — only `meta.totalItems` is read. */
const PENDING_COUNT_PARAMS = { page: 1, pageSize: 1 } as const;

const usePendingReviewCount = (enabled: boolean) => {
  const { data } = useQuery({
    queryKey: editorialKeys.queue(PENDING_COUNT_PARAMS),
    queryFn: () => editorialApi.queue(PENDING_COUNT_PARAMS),
    enabled,
    // A stale badge is harmless; refetching on every nav is not worth it.
    staleTime: 60_000,
  });
  return data?.meta.totalItems ?? 0;
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
};

const initialsOf = (displayName: string) => {
  return (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
};

export const SiteHeader = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const isEditor = user?.role === "EDITOR";
  const pendingCount = usePendingReviewCount(isEditor);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-1 px-4">
        <Link href="/" className="mr-4 inline-flex items-center gap-2 font-semibold">
          <PenLine className="size-4" />
          <span>Content</span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/">Read</NavLink>
          {isAuthenticated && <NavLink href="/dashboard">My Content</NavLink>}
          {isEditor && (
            <NavLink href="/editorial/queue">
              Review Queue
              {pendingCount > 0 && (
                <Badge variant="secondary" className="tabular-nums">
                  {pendingCount}
                </Badge>
              )}
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Render nothing while `/me` is in flight, so the header doesn't
              flip from "Log in" to the user menu on every page load. */}
          {isLoading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Avatar className="size-8">
                      {user.avatarUrl && (
                        <AvatarImage src={user.avatarUrl} alt="" />
                      )}
                      <AvatarFallback>{initialsOf(user.displayName)}</AvatarFallback>
                    </Avatar>
                  </button>
                }
              />
              <DropdownMenuPortal>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {user.displayName}
                    </span>
                    <span className="truncate text-xs font-normal">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/account" />}>
                    <UserIcon />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={logout.isPending}
                    onClick={() => logout.mutate()}
                  >
                    <LogOut />
                    {logout.isPending ? "Logging out..." : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
