/**
 * Shared page/offset helpers for the `?page=` / `?pageSize=` URL contract.
 *
 * Both params are parsed defensively: the API rejects a `page` past
 * `totalPages`, a `page` of 0 and a `pageSize` outside 1-50 with a
 * `422 VALIDATION_ERROR` rather than a silent empty list, so a junk URL must
 * never reach it.
 */

/** Offered in the page-size selector; every value is inside the API's 1-50. */
export const PAGE_SIZES = [10, 20, 50] as const;

/** Mirrors the API's own default, so `?pageSize=` can stay out of the URL. */
export const DEFAULT_PAGE_SIZE = 20;

export const parsePage = (raw: string | null): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

/** Anything outside `PAGE_SIZES` falls back to the default — the selector is
 *  the only way to set this, so an off-list value is a hand-edited URL. */
export const parsePageSize = (raw: string | null): number => {
  const pageSize = Number(raw);
  return PAGE_SIZES.some((size) => size === pageSize)
    ? pageSize
    : DEFAULT_PAGE_SIZE;
};
