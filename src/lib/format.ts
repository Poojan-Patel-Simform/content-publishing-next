/**
 * Explicit locale and options rather than the visitor's locale: these dates are
 * rendered from client-fetched data, and a fixed format keeps a value stable
 * between renders no matter where it is read.
 */
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDate = (iso: string): string => {
  return DATE_FORMAT.format(new Date(iso));
};

export const formatDateTime = (iso: string): string => {
  return DATE_TIME_FORMAT.format(new Date(iso));
};

const RELATIVE_FORMAT = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

/** Largest unit first — the first threshold a duration clears wins. */
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/**
 * "3 hours ago" / "in 5 minutes". Computed against `now` at render time, so a
 * component that wants it to stay honest has to re-render — the queue does
 * that on every refetch, which is often enough for a review list.
 */
export const formatRelativeTime = (iso: string, now: number = Date.now()): string => {
  const deltaMs = new Date(iso).getTime() - now;

  for (const [unit, unitMs] of RELATIVE_UNITS) {
    if (Math.abs(deltaMs) >= unitMs) {
      return RELATIVE_FORMAT.format(Math.round(deltaMs / unitMs), unit);
    }
  }
  return "just now";
};

/**
 * `YYYY-MM-DDTHH:mm` in *local* time, the only format `<input type="datetime-local">`
 * accepts. `toISOString()` would hand it UTC and silently shift the clock.
 */
export const toDateTimeLocalValue = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};
