---
name: component-architecture
description: Use whenever creating a new React component, refactoring an existing one, or a component file is approaching/exceeding 300 lines. Enforces arrow-function-only style, container/presentational split, hook extraction, and file size limits per project convention.
---

# Component Architecture

Follow this every time a component is created or touched — not just on request.

## Step 1 — Decide if it needs a container/presentational split

Ask: does this component fetch data, call a Server Action, manage non-trivial state, or run
side effects?

- **Yes** → split into `[Name].container.tsx` (logic) + `[Name].presentation.tsx` (pure UI).
- **No** (e.g. `Badge`, `EmptyState`, `PageHeader`) → single file is fine, no split needed.

Container rules:
- May use hooks, call Server Actions, hold state.
- Renders the presentational component and passes props down — nothing else in its JSX.
- No styling decisions here.

Presentational rules:
- Pure function of props. No `useEffect`, no imports from `actions.ts`, no data fetching.
- Local-only UI state is fine (e.g. `useState` for a dropdown's open/closed).
- Should be easy to render in isolation (Storybook-able) with just props.

## Step 2 — Extract hooks

Before writing logic inline in a component, check:
- Is this >15 lines of non-JSX logic? → extract to a hook.
- Is this logic reused, or likely to be reused? → extract to a hook.
- Does it involve `useEffect`, refs, subscriptions, or polling? → extract to a hook.

Place feature-specific hooks in `[Feature].hooks.ts`; app-wide reusable hooks in `src/hooks/`.

One hook, one responsibility. If a hook both fetches data AND derives filtered/sorted state
AND handles a mutation, split it into three hooks and compose them in the container.

## Step 3 — Check the line count

Before finishing, count lines in the component file (excluding imports and type
declarations). **300 lines is a hard ceiling.**

If over (or approaching it), apply in this order:
1. Extract repeated or logically-distinct JSX blocks into subcomponents in the same folder.
2. Move logic into hooks (Step 2).
3. Move constants, option lists, static config into `[Name].constants.ts`.
4. If the component is doing two distinct jobs (e.g. "list + detail panel"), consider
   whether it should be two components composed by a parent, not one.

Do this proactively — don't build to 500 lines and refactor after. Check as you go.

## Step 4 — Style and syntax check

- Arrow functions only — no `function` keyword anywhere in the file (components, handlers,
  helpers).
- Named export for the component, matching the file name in PascalCase.
- `interface [Component]Props` declared above the component (skip only for a single trivial
  prop).
- No `React.FC`.
- No boolean-prop explosion — if you're about to add a 5th boolean prop, stop and consider
  composition (`children`, slots) instead.
- `"use client"` only if the component actually needs interactivity/hooks/browser APIs —
  default to Server Component.

## Step 5 — Quick self-check before finishing

- [ ] Arrow functions throughout
- [ ] Container/presentational split applied if data or business logic is involved
- [ ] No `useEffect` without a one-line comment justifying it
- [ ] File under 300 lines
- [ ] Props typed via explicit interface
- [ ] No direct Prisma/Server Action calls inside a presentational component
- [ ] Tailwind classes via `cn()` for any conditional styling, no manual string concatenation

## Example skeleton

```tsx
// ProjectList.container.tsx
"use client";

interface ProjectListContainerProps {
  organizationId: string;
}

export const ProjectListContainer = ({ organizationId }: ProjectListContainerProps) => {
  const { projects, isLoading } = useProjects(organizationId);
  const { filters, setFilter } = useProjectFilters();

  return (
    <ProjectListPresentation
      projects={projects}
      isLoading={isLoading}
      filters={filters}
      onFilterChange={setFilter}
    />
  );
};
```

```tsx
// ProjectList.presentation.tsx
interface ProjectListPresentationProps {
  projects: Project[];
  isLoading: boolean;
  filters: ProjectFilters;
  onFilterChange: (filters: ProjectFilters) => void;
}

export const ProjectListPresentation = ({
  projects,
  isLoading,
  filters,
  onFilterChange,
}: ProjectListPresentationProps) => {
  if (isLoading) return <ProjectListSkeleton />;

  return (
    <div className={cn("grid gap-4", filters.compact && "gap-2")}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
```
