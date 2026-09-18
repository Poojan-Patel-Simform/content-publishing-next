import { z } from "zod";
import type { CreateItemInput, UpdateVersionInput } from "@/lib/api/items";

/** Mirrors the server-side limits in `docs/api.md` (POST /items, PATCH .../versions). */
export const TITLE_MAX_LENGTH = 200;
export const BODY_MAX_LENGTH = 100_000;
export const EXCERPT_MAX_LENGTH = 500;
export const SLUG_MAX_LENGTH = 200;
export const CHANGE_SUMMARY_MAX_LENGTH = 500;
export const MAX_TAGS = 20;

/**
 * One schema for both create and update.
 *
 * `changeSummary` is required in both directions — the API demands it on a
 * `PATCH` too, so treating it as create-only would fail server-side.
 *
 * The optional fields are modelled as `""` rather than `undefined` because
 * every input here is an uncontrolled text field; `toCreateInput` /
 * `toUpdateInput` below are the single place where `""` becomes "omit" or
 * "clear". Field names match the API's so `applyValidationErrors` can map a
 * `422 VALIDATION_ERROR`'s `details` straight onto them.
 */
export const contentFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`),
  body: z
    .string()
    .min(1, "Body is required")
    .max(BODY_MAX_LENGTH, `Body must be at most ${BODY_MAX_LENGTH} characters`),
  excerpt: z
    .string()
    .trim()
    .max(EXCERPT_MAX_LENGTH, `Excerpt must be at most ${EXCERPT_MAX_LENGTH} characters`),
  categorySlug: z
    .string()
    .trim()
    .max(SLUG_MAX_LENGTH, `Category slug must be at most ${SLUG_MAX_LENGTH} characters`),
  tagSlugs: z
    .string()
    .refine(
      (value) => parseTagSlugs(value).length <= MAX_TAGS,
      `Use at most ${MAX_TAGS} tags`
    )
    .refine(
      (value) => parseTagSlugs(value).every((tag) => tag.length <= SLUG_MAX_LENGTH),
      `Each tag must be at most ${SLUG_MAX_LENGTH} characters`
    ),
  changeSummary: z
    .string()
    .trim()
    .min(1, "Describe what changed — reviewers rely on this")
    .max(
      CHANGE_SUMMARY_MAX_LENGTH,
      `Change summary must be at most ${CHANGE_SUMMARY_MAX_LENGTH} characters`
    ),
});

export type ContentFormValues = z.infer<typeof contentFormSchema>;

export const emptyContentFormValues: ContentFormValues = {
  title: "",
  body: "",
  excerpt: "",
  categorySlug: "",
  tagSlugs: "",
  changeSummary: "",
};

/** Comma- or newline-separated slugs, de-duplicated, blanks dropped. */
export const parseTagSlugs = (raw: string): string[] => {
  const seen = new Set(
    raw
      .split(/[,\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
  );
  return [...seen];
};

export const toCreateInput = (values: ContentFormValues): CreateItemInput => {
  const tagSlugs = parseTagSlugs(values.tagSlugs);

  return {
    title: values.title,
    body: values.body,
    // An empty excerpt is an explicit "no excerpt", not an omission.
    excerpt: values.excerpt || null,
    ...(values.categorySlug ? { categorySlug: values.categorySlug } : {}),
    ...(tagSlugs.length > 0 ? { tagSlugs } : {}),
    changeSummary: values.changeSummary,
  };
};

/**
 * `PATCH` treats an absent key as "leave it alone", which matters here: the API
 * returns a version's category and tags as *ids*, and exposes no endpoint to
 * resolve those back to slugs, so the edit form can't prefill them. Leaving
 * those two fields blank therefore has to mean "unchanged" rather than "clear",
 * or every edit would silently strip the version's taxonomy.
 */
export const toUpdateInput = (values: ContentFormValues): UpdateVersionInput => {
  const tagSlugs = parseTagSlugs(values.tagSlugs);

  return {
    title: values.title,
    body: values.body,
    excerpt: values.excerpt || null,
    ...(values.categorySlug ? { categorySlug: values.categorySlug } : {}),
    ...(tagSlugs.length > 0 ? { tagSlugs } : {}),
    changeSummary: values.changeSummary,
  };
};
