"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyValidationErrors } from "@/lib/form-errors";
import {
  BODY_MAX_LENGTH,
  CHANGE_SUMMARY_MAX_LENGTH,
  EXCERPT_MAX_LENGTH,
  MAX_TAGS,
  TITLE_MAX_LENGTH,
  contentFormSchema,
  emptyContentFormValues,
  type ContentFormValues,
} from "@/features/items/schema";
import { useCategories } from "@/features/categories/hooks";
import { ApiErrorMessage } from "@/components/shared/api-error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * The composer, shared by "new draft" (T15) and "edit version" (T19).
 *
 * `onSubmit` is expected to reject with an `ApiError`: field-level
 * `VALIDATION_ERROR`s land on the matching inputs, anything else becomes the
 * banner above the form. Either way the user's text stays in the fields — the
 * form is never reset on failure.
 */
interface ContentFormProps {
  defaultValues?: Partial<ContentFormValues>;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (values: ContentFormValues) => Promise<void>;
  changeSummaryHint?: string;
  /** Edit mode explains why category/tags come up blank. */
  taxonomyHint?: string;
  secondaryAction?: React.ReactNode;
  errorMessages?: Record<string, string>;
  /** Rendered inside the error banner — e.g. a link back when a 409 lands. */
  errorAction?: React.ReactNode;
}

export const ContentForm = ({
  defaultValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  changeSummaryHint,
  taxonomyHint,
  secondaryAction,
  errorMessages,
  errorAction,
}: ContentFormProps) => {
  const [formError, setFormError] = useState<unknown>(null);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories ?? [];

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: { ...emptyContentFormValues, ...defaultValues },
  });

  const submit = async (values: ContentFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      if (!applyValidationErrors(error, setError)) {
        setFormError(error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <ApiErrorMessage
        error={formError}
        title="Couldn't save"
        messages={errorMessages}
      >
        {errorAction && <span className="mt-2 block">{errorAction}</span>}
      </ApiErrorMessage>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          maxLength={TITLE_MAX_LENGTH}
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          rows={2}
          maxLength={EXCERPT_MAX_LENGTH}
          placeholder="A short teaser shown in the public list (optional)"
          aria-invalid={!!errors.excerpt}
          {...register("excerpt")}
        />
        {errors.excerpt && (
          <p className="text-sm text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          rows={16}
          maxLength={BODY_MAX_LENGTH}
          className="min-h-80 font-normal"
          aria-invalid={!!errors.body}
          {...register("body")}
        />
        {errors.body && (
          <p className="text-sm text-destructive">{errors.body.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="categorySlug">Category</Label>
          <Controller
            name="categorySlug"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="categorySlug" aria-invalid={!!errors.categorySlug} className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categorySlug && (
            <p className="text-sm text-destructive">{errors.categorySlug.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tagSlugs">Tags</Label>
          <Input
            id="tagSlugs"
            placeholder="velocity, process"
            aria-invalid={!!errors.tagSlugs}
            {...register("tagSlugs")}
          />
          {errors.tagSlugs ? (
            <p className="text-sm text-destructive">{errors.tagSlugs.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Comma-separated slugs, up to {MAX_TAGS}.
            </p>
          )}
        </div>
      </div>

      {taxonomyHint && (
        <p className="text-sm text-muted-foreground">{taxonomyHint}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="changeSummary">Change summary</Label>
        <Input
          id="changeSummary"
          maxLength={CHANGE_SUMMARY_MAX_LENGTH}
          placeholder="Initial draft"
          aria-invalid={!!errors.changeSummary}
          {...register("changeSummary")}
        />
        {errors.changeSummary ? (
          <p className="text-sm text-destructive">{errors.changeSummary.message}</p>
        ) : (
          changeSummaryHint && (
            <p className="text-sm text-muted-foreground">{changeSummaryHint}</p>
          )
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </form>
  );
};
