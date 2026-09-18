---
name: react-query
description: Use whenever fetching data from or mutating data through the external API. Enforces the axios client + lib/api resource module + hierarchical query-keys + React Query hook pattern — no raw fetch/axios in components, no Prisma, no ad-hoc query keys.
---

# React Query Data-Fetching Pattern

This app has no database of its own — all data comes from the external API
(`NEXT_PUBLIC_API_URL`). Every read or write to it goes through React Query, never a raw
`fetch`/`axios` call inside a component or a Server Action.

There are four layers, in order:

1. `lib/api/client.ts` — one shared axios instance (already exists, do not duplicate)
2. `lib/api/[resource].ts` — typed request functions for one resource
3. `lib/query-keys.ts` — hierarchical key factory for that resource
4. `hooks/use-[resource].ts` + `hooks/use-[resource]-mutations.ts` — the actual React Query hooks

## Step 1 — API module (`lib/api/[resource].ts`)

Plain functions, no React, no hooks. Reuse `apiGet`/`apiPost`/`apiPatch`/`apiDelete` from
`lib/api/client.ts` — they already unwrap the `{ success, data }` envelope and throw
`ApiError` on failure.

```ts
// lib/api/projects.ts
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { ProjectDto, Paginated } from "@/lib/api/content-types";

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  status?: "active" | "archived";
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export const projectsApi = {
  list: (params: ProjectListParams = {}) =>
    apiGet<Paginated<ProjectDto>>("/projects", { params }),

  get: (id: string) => apiGet<{ project: ProjectDto }>(`/projects/${id}`),

  create: (input: CreateProjectInput) =>
    apiPost<{ project: ProjectDto }>("/projects", input),

  update: (id: string, input: Partial<CreateProjectInput>) =>
    apiPatch<{ project: ProjectDto }>(`/projects/${id}`, input),

  archive: (id: string) => apiDelete<void>(`/projects/${id}`),
};
```

## Step 2 — Query keys (`lib/query-keys.ts`)

Add one hierarchical factory per resource to the existing file — never inline array
literals as query keys in a hook. Keep `all` as a prefix of every other key in the
factory so a mutation can invalidate coarsely without enumerating filter combinations.

```ts
export const projectKeys = {
  all: ["projects"] as const,
  list: (params: ProjectListParams = {}) => ["projects", "list", params] as const,
  detail: (id: string) => ["projects", "detail", id] as const,
};
```

## Step 3 — Query hooks (`hooks/use-[resource].ts`)

```ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { projectsApi, type ProjectListParams } from "@/lib/api/projects";
import { projectKeys } from "@/lib/query-keys";

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsApi.list(params),
    placeholderData: keepPreviousData, // paginated/filtered lists only
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  });
}
```

## Step 4 — Mutation hooks (`hooks/use-[resource]-mutations.ts`)

One `useMutation` per operation. Invalidate via the key factory's `all` (or a narrower
key when the mutation only affects one entry) inside `onSuccess`.

```ts
"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { projectsApi, type CreateProjectInput } from "@/lib/api/projects";
import { projectKeys } from "@/lib/query-keys";

function invalidateProjects(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: projectKeys.all });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useArchiveProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => projectsApi.archive(id),
    onSuccess: () => invalidateProjects(queryClient),
  });
}
```

## Step 5 — Consume from a container component

Only container components (`[Feature].container.tsx`) call these hooks. Presentational
components receive data/loading/error state as props — never call `useQuery`/`useMutation`
themselves.

```tsx
// ProjectList.container.tsx
"use client";

export const ProjectListContainer = ({ status }: { status?: "active" | "archived" }) => {
  const { data, isPending, error } = useProjects({ status });

  return <ProjectListPresentation data={data} isPending={isPending} error={error} />;
};
```

## Cross-invalidation

When a mutation on one resource affects another resource's cached data (e.g. submitting
an item also changes the editorial queue), invalidate both key factories' `all` keys in
the same `onSuccess`, and leave a one-line comment explaining the cross-resource link —
it isn't obvious from the code alone.

## Checklist before finishing a data-fetching feature

- [ ] No raw `fetch`/`axios` calls outside `lib/api/client.ts` and `lib/api/[resource].ts`
- [ ] Request functions live in `lib/api/[resource].ts`, grouped as `[resource]Api`
- [ ] Query keys added to `lib/query-keys.ts` as a hierarchical factory, `all` as prefix
- [ ] Query hooks in `hooks/use-[resource].ts`, mutation hooks in
      `hooks/use-[resource]-mutations.ts`
- [ ] Paginated/filtered lists use `placeholderData: keepPreviousData`
- [ ] Mutations invalidate the relevant key(s) in `onSuccess`, including any other
      resource's keys affected by a side effect
- [ ] Only container components call `useQuery`/`useMutation`; presentational components
      take plain props
- [ ] No Prisma, no direct database access — everything goes through `lib/api/`
