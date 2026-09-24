const SESSION_ID_KEY = "cp-session-request-id";

let inMemoryFallback: string | undefined;

/**
 * One ID per browser session (tab), sent as `X-Request-Id` on every API call
 * so the backend can group log lines from one session together. Cached in
 * `sessionStorage` so it survives client-side navigations within the tab.
 */
export const getSessionRequestId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    const existing = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;

    const id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    // sessionStorage unavailable (e.g. private mode) — fall back to an
    // in-memory id for the lifetime of this page load.
    if (!inMemoryFallback) inMemoryFallback = crypto.randomUUID();
    return inMemoryFallback;
  }
};
