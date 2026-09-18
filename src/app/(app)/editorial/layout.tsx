import { RoleGuard } from "@/features/auth/components/auth-guard";

/**
 * Nests inside `(app)/layout.tsx`, which already established a session — this
 * only narrows it to editors. The API's `requireEditor` stays authoritative;
 * the guard just saves an author a guaranteed-403 round trip.
 */
const EditorialLayout = ({ children }: LayoutProps<"/editorial">) => {
  return <RoleGuard role="EDITOR">{children}</RoleGuard>;
};

export default EditorialLayout;
