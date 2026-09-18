/**
 * Guards `?returnTo=` against open redirects.
 *
 * A leading `/` alone isn't enough: `//evil.com` is a protocol-relative URL
 * the browser resolves off-origin, as is `/\evil.com` in some parsers.
 */
export const isSafeReturnTo = (value: string | null | undefined): value is string => {
  return (
    !!value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
  );
};
