---
name: form-builder
description: Use when building or editing any form in the app. Enforces the react-hook-form + zod + shadcn Form pattern, with schema shared between client and Server Action validation.
---

# Form Builder Pattern

## Step 1 — Schema first

Create/update `features/[feature]/schema.ts`:

```ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(["private", "team", "public"]),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

This schema is imported by both the client form and the Server Action — never duplicate
validation rules.

## Step 2 — Container component with RHF

```tsx
// CreateProjectForm.container.tsx
"use client";

interface CreateProjectFormContainerProps {
  organizationId: string;
}

export const CreateProjectFormContainer = ({
  organizationId,
}: CreateProjectFormContainerProps) => {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "", visibility: "private" },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: CreateProjectInput) => {
    startTransition(async () => {
      const result = await createProject(organizationId, values);
      if (!result.success) {
        form.setError("root", { message: result.error });
        return;
      }
      form.reset();
    });
  };

  return (
    <CreateProjectFormPresentation
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      isPending={isPending}
    />
  );
};
```

## Step 3 — Presentational form UI (shadcn Form primitives)

```tsx
// CreateProjectForm.presentation.tsx
interface CreateProjectFormPresentationProps {
  form: UseFormReturn<CreateProjectInput>;
  onSubmit: () => void;
  isPending: boolean;
}

export const CreateProjectFormPresentation = ({
  form,
  onSubmit,
  isPending,
}: CreateProjectFormPresentationProps) => (
  <Form {...form}>
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* additional fields */}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create project"}
      </Button>
    </form>
  </Form>
);
```

## Step 4 — Server Action re-validates the same schema

```ts
// actions.ts
"use server";

export const createProject = async (
  organizationId: string,
  input: CreateProjectInput
): Promise<ActionResult<Project>> => {
  const session = await requireSession();
  if (!(await canCreateProject(session.user.id, organizationId))) {
    return { success: false, error: "Not authorized" };
  }

  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const project = await prisma.project.create({
    data: { ...parsed.data, organizationId, ownerId: session.user.id },
  });

  revalidatePath(`/organizations/${organizationId}/projects`);
  return { success: true, data: project };
};
```

Never skip the server-side `safeParse` even though the client already validated — the client
can be bypassed.

## Checklist before finishing a form

- [ ] Schema lives in `schema.ts`, imported by both client and action
- [ ] `zodResolver` wired into `useForm`
- [ ] Container/presentational split followed
- [ ] Submit uses `useTransition` for pending state, not manual `isSubmitting` flags
- [ ] Server Action re-validates with `safeParse` and checks auth before mutating
- [ ] Errors surfaced via `form.setError("root", ...)` or field-level errors, not thrown
      across the boundary
- [ ] `revalidatePath`/`revalidateTag` called after a successful mutation
