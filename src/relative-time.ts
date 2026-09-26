/**
 * Framework-neutral relative time. Every input is parsed from `unknown` and
 * rejected before formatting, so an invalid timestamp never renders as text.
 */

export type RelativeTimeInput = Date | number | string;
export type RelativeTimeReference = Date | number;
export type RelativeTimeNumeric = "auto" | "always";
export type RelativeTimeUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export interface RelativeTimeOptions {
  /** Reference instant. Defaults to the current clock. */
  readonly now?: RelativeTimeReference;
  /** BCP 47 locale. Defaults to the runtime locale. */
  readonly locale?: string;
  /** `auto` allows phrases such as "now" and "yesterday". Defaults to `auto`. */
  readonly numeric?: RelativeTimeNumeric;
}

/** A signed whole amount of one unit. Negative values are in the past. */
export interface RelativeTimeValue {
  readonly unit: RelativeTimeUnit;
  readonly value: number;
}

const second = 1_000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const year = 365.2425 * day;
const month = year / 12;

interface RelativeTimeBucket {
  readonly unit: RelativeTimeUnit;
  readonly milliseconds: number;
  /** The first rounded amount that moves to the next unit. */
  readonly limit: number;
}

const buckets: readonly RelativeTimeBucket[] = [
  { unit: "second", milliseconds: second, limit: 60 },
  { unit: "minute", milliseconds: minute, limit: 60 },
  { unit: "hour", milliseconds: hour, limit: 24 },
  { unit: "day", milliseconds: day, limit: 7 },
  { unit: "week", milliseconds: week, limit: 4 },
  { unit: "month", milliseconds: month, limit: 12 },
  { unit: "year", milliseconds: year, limit: Number.POSITIVE_INFINITY },
];

/** Units from finest to coarsest, in the order `resolveRelativeTime` tries them. */
export const relativeTimeUnits: readonly RelativeTimeUnit[] = Object.freeze(
  buckets.map((bucket) => bucket.unit),
);

/** ECMAScript's representable time range, in milliseconds either side of the epoch. */
const maximumTime = 8.64e15;
const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/u;
const isoDateTime =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:\d{2})$/u;

function describe(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (value instanceof Date) return "an invalid Date";
  return String(value);
}

function fromTime(time: number, label: string, original: unknown): Date {
  if (!Number.isFinite(time) || Math.abs(time) > maximumTime) {
    throw new RangeError(`${label} must be a valid instant; received ${describe(original)}.`);
  }
  return new Date(time);
}

function parseIsoString(value: string, label: string): Date {
  const date = isoDate.exec(value);
  const dateTime = date === null ? isoDateTime.exec(value) : null;
  const parts = date ?? dateTime;
  if (parts === null) {
    throw new RangeError(
      `${label} must be an ISO 8601 date (YYYY-MM-DD) or a date-time with Z or an offset; received ${describe(value)}.`,
    );
  }
  const [yearText, monthText, dayText, hourText = "00", minuteText = "00", secondText = "00", fraction = "", zone = "Z"] =
    parts.slice(1);
  const fields = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  const [y, mo, d, h, mi, s] = fields as [number, number, number, number, number, number];
  const offsetHours = zone === "Z" ? 0 : Number(zone.slice(1, 3));
  const offsetRest = zone === "Z" ? 0 : Number(zone.slice(4, 6));
  const offsetMinutes = (zone.startsWith("-") ? -1 : 1) * (offsetHours * 60 + offsetRest);
  const milliseconds = Number(fraction.padEnd(3, "0").slice(0, 3));
  const wall = new Date(0);
  wall.setUTCFullYear(y, mo - 1, d);
  wall.setUTCHours(h, mi, s, milliseconds);
  const valid = h < 24 && mi < 60 && s < 60 && offsetHours < 24 && offsetRest < 60
    && wall.getUTCFullYear() === y && wall.getUTCMonth() === mo - 1 && wall.getUTCDate() === d;
  if (!valid) throw new RangeError(`${label} must name a real calendar instant; received ${describe(value)}.`);
  return fromTime(wall.getTime() - offsetMinutes * minute, label, value);
}

/**
 * Parse a timestamp from a Date, epoch milliseconds, or an ISO 8601 string.
 * A date-only string is midnight UTC. A date-time string must carry `Z` or an
 * offset, so the server and the browser resolve it to the same instant.
 */
export function parseRelativeTimeInput(value: unknown, label = "time"): Date {
  if (value instanceof Date) return fromTime(value.getTime(), label, value);
  if (typeof value === "number") return fromTime(value, label, value);
  if (typeof value === "string") return parseIsoString(value.trim(), label);
  throw new TypeError(`${label} must be a Date, epoch milliseconds, or an ISO 8601 string.`);
}

function parseReference(value: unknown): Date {
  if (value === undefined) return new Date();
  if (value instanceof Date || typeof value === "number") return parseRelativeTimeInput(value, "now");
  throw new TypeError("now must be a Date or epoch milliseconds.");
}

function parseNumeric(value: unknown): RelativeTimeNumeric {
  if (value === undefined) return "auto";
  if (value === "auto" || value === "always") return value;
  throw new TypeError(`numeric must be "auto" or "always"; received ${describe(value)}.`);
}

function parseLocale(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError("locale must be a non-empty BCP 47 language tag.");
  }
  return value;
}

/**
 * Choose the unit and signed amount for a difference of `target - now`.
 * Amounts round half away from zero, so `resolveRelativeTime(-x)` is always
 * the exact negation of `resolveRelativeTime(x)`, including a signed zero.
 */
export function resolveRelativeTime(differenceMilliseconds: number): RelativeTimeValue {
  if (!Number.isFinite(differenceMilliseconds)) {
    throw new RangeError("The time difference must be a finite number of milliseconds.");
  }
  const magnitude = Math.abs(differenceMilliseconds);
  const sign = differenceMilliseconds < 0 || Object.is(differenceMilliseconds, -0) ? -1 : 1;
  for (const bucket of buckets) {
    const amount = Math.round(magnitude / bucket.milliseconds);
    if (amount < bucket.limit) {
      // A past instant under half a second keeps a signed zero: "0 seconds ago".
      return { unit: bucket.unit, value: sign * amount };
    }
  }
  throw new RangeError("No relative time unit matched.");
}

const formatters = new Map<string, Intl.RelativeTimeFormat>();

function formatterFor(locale: string | undefined, numeric: RelativeTimeNumeric): Intl.RelativeTimeFormat {
  const key = `${locale ?? ""}\u0000${numeric}`;
  let formatter = formatters.get(key);
  if (formatter === undefined) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric, style: "long" });
    formatters.set(key, formatter);
  }
  return formatter;
}

/**
 * Format `target` relative to `now`, for example "in 23 hours",
 * "5 minutes ago" or "now". Throws on an invalid target, reference, locale or
 * numeric option instead of rendering "Invalid Date".
 */
export function formatRelativeTime(target: RelativeTimeInput, options: RelativeTimeOptions = {}): string {
  const instant = parseRelativeTimeInput(target, "target");
  const reference = parseReference(options.now);
  const numeric = parseNumeric(options.numeric);
  const locale = parseLocale(options.locale);
  const { unit, value } = resolveRelativeTime(instant.getTime() - reference.getTime());
  return formatterFor(locale, numeric).format(value, unit);
}
