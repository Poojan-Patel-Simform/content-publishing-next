# Project: Content Publishing

Production-grade Next.js application. This file holds always-true conventions.
Procedural workflows (design-to-code, form building, migrations, reviews) live in
`.claude/skills/` — see the Skills section at the bottom for what's available.

## Stack

- Next.js 16.2 (App Router, Server Components by default, Server Actions for mutations)
- TypeScript — strict mode, no `any`, no implicit `any`
- react-hook-form + zod for all forms (client) — same zod schema reused server-side
- TanStack React Query for all API calls (queries + mutations) against the external API,
  via a shared `axios` client — no Prisma, no direct database access from this app
- Tailwind CSS + shadcn/ui
- Package manager: [npm — fill in]

## Folder Structure

```
src/
  app/                        # routes only — thin, delegate to features
    (auth)/
    (dashboard)/
    api/                      # only for webhooks/external callbacks; prefer Server Actions otherwise
  features/
    [feature-name]/
      components/
        [Feature].container.tsx   # data + state, no markup logic
        [Feature].presentation.tsx # pure UI, props in, JSX out
        [Feature].hooks.ts         # extracted hooks for this feature
      actions.ts                # Server Actions ("use server") — non-API mutations only
      schema.ts                 # zod schemas (shared client/server)
      types.ts
  components/
    ui/                        # shadcn primitives — generated, do not hand-edit internals
    shared/                    # cross-feature composed components (still follow conventions below)
  lib/
    auth.ts                    # Better Auth instance/config
    utils.ts
    api/
      client.ts                # shared axios instance + apiGet/apiPost/apiPatch/apiDelete
      [resource].ts             # one API module per resource (e.g. items.ts, editorial.ts)
    query-keys.ts              # hierarchical query key factories, one export per resource
  server/
    services/                  # business logic reused across actions, server-only
  hooks/                       # app-wide + feature data hooks (use-items.ts, use-item-mutations.ts,
                                # use-debounce, use-media-query, etc.)
```

## Component Conventions (quick reference)

Full rules, checklist, and examples live in the `component-architecture` skill — load it
whenever creating or editing a component. Headline rules only, kept here so they're never
missed even before the skill loads:

- Arrow functions only, no `function` declarations.
- Container/presentational split for anything with data, state, or Server Action calls.
- Extract non-trivial logic into hooks (`use` prefix).
- **300-line hard limit per component file.**
- Explicit `Props` interface, no `React.FC`, composition over boolean-prop explosions.
- Default to Server Components; `"use client"` only when actually needed.
- `cn()` for conditional Tailwind classes; never edit `components/ui/` directly, wrap instead.

## Non-negotiable conventions (outside components)

- Every Server Action validates input with a zod schema before touching the backing store.
- Every mutating Server Action re-checks auth/role/session server-side — never trust the
  client, even if the UI already hides the action.
- Forms: RHF + `zodResolver`, schema imported from `features/[x]/schema.ts` — one schema,
  used for both client validation and server-side re-validation.
- All calls to the external API go through React Query — `useQuery`/`useMutation` wrapping
  a function from `lib/api/[resource].ts`, never raw `fetch`/`axios` calls inside components.
- Query keys live in `lib/query-keys.ts` as hierarchical factories (see `react-query` skill) —
  never inline array literals as query keys.
- No client-side database access, ever — this app has no database of its own; all data comes
  from the external API via `lib/api/`.
- Errors: Server Actions return a typed result (`{ success, data } | { success: false, error }`),
  never throw raw errors across the server/client boundary.

## Commands

- Dev: `npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- E2E tests: `npm run test:e2e` (Playwright)

## Do NOT

- Do not add new npm packages without asking first.
- Do not hand-edit files inside `components/ui/` (shadcn generated) — wrap instead.
- Do not exceed 300 lines in a single component file — split it.
- Do not use `function` declarations for components/handlers — arrow functions only.
- Do not put data fetching or Server Action calls inside presentational components.
- Do not bypass server-side auth/role checks because the client already restricts access.

## Skills available

- `component-architecture` — use when creating or refactoring any component; enforces the
  conventions above (container/presentational split, hook extraction, 300-line limit).
- `form-builder` — RHF + zod + shadcn Form end-to-end pattern.
- `react-query` — API module + query key + query/mutation hook pattern for all data fetching.

## Subagents available

- `explore-codebase` — read-only codebase research, keeps main session context clean.
- `security-reviewer` — isolated review of auth/Server Action security after a feature is built.
