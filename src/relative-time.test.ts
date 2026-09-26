import { expect, test } from "bun:test";

import {
  formatRelativeTime,
  parseRelativeTimeInput,
  relativeTimeUnits,
  resolveRelativeTime,
} from "./index";

const now = Date.UTC(2026, 8, 26, 12, 0, 0);
const seconds = (count: number) => count * 1_000;
const minutes = (count: number) => count * 60_000;
const hours = (count: number) => count * 3_600_000;
const days = (count: number) => count * 86_400_000;

test("relative time reads naturally in both directions", () => {
  const format = (offset: number, numeric?: "auto" | "always") =>
    formatRelativeTime(now + offset, { locale: "en-US", now, ...(numeric === undefined ? {} : { numeric }) });
  expect(format(0)).toBe("now");
  expect(format(seconds(0.4))).toBe("now");
  expect(format(0, "always")).toBe("in 0 seconds");
  expect(format(-seconds(12))).toBe("12 seconds ago");
  expect(format(-minutes(5))).toBe("5 minutes ago");
  expect(format(hours(23))).toBe("in 23 hours");
  expect(format(-days(1))).toBe("yesterday");
  expect(format(-days(1), "always")).toBe("1 day ago");
  expect(format(days(3))).toBe("in 3 days");
  expect(format(-days(14))).toBe("2 weeks ago");
  expect(format(days(90))).toBe("in 3 months");
  expect(format(-days(800))).toBe("2 years ago");
});

test("relative time moves to the next unit at each rounded boundary", () => {
  expect(resolveRelativeTime(seconds(59.4))).toEqual({ unit: "second", value: 59 });
  expect(resolveRelativeTime(seconds(59.5))).toEqual({ unit: "minute", value: 1 });
  expect(resolveRelativeTime(minutes(59.5))).toEqual({ unit: "hour", value: 1 });
  expect(resolveRelativeTime(hours(23.4))).toEqual({ unit: "hour", value: 23 });
  expect(resolveRelativeTime(hours(23.5))).toEqual({ unit: "day", value: 1 });
  expect(resolveRelativeTime(days(6.5))).toEqual({ unit: "week", value: 1 });
  expect(resolveRelativeTime(days(24.5))).toEqual({ unit: "month", value: 1 });
  expect(resolveRelativeTime(days(365))).toEqual({ unit: "year", value: 1 });
  expect(resolveRelativeTime(-seconds(2.5))).toEqual({ unit: "second", value: -3 });
  expect(Object.is(resolveRelativeTime(-seconds(0.2)).value, -0)).toBe(true);
  expect(formatRelativeTime(now - 200, { locale: "en-US", now, numeric: "always" })).toBe("0 seconds ago");
  expect(relativeTimeUnits).toEqual(["second", "minute", "hour", "day", "week", "month", "year"]);
  expect(Object.isFrozen(relativeTimeUnits)).toBe(true);
});

test("relative time accepts Dates, epoch milliseconds and zoned ISO strings", () => {
  const instant = new Date(now);
  expect(parseRelativeTimeInput(instant).getTime()).toBe(now);
  expect(parseRelativeTimeInput(instant)).not.toBe(instant);
  expect(parseRelativeTimeInput(now).getTime()).toBe(now);
  expect(parseRelativeTimeInput("2026-09-26T12:00:00Z").getTime()).toBe(now);
  expect(parseRelativeTimeInput(" 2026-09-26T08:00:00-04:00 ").getTime()).toBe(now);
  expect(parseRelativeTimeInput("2026-09-26T12:00Z").getTime()).toBe(now);
  expect(parseRelativeTimeInput("2026-09-26T12:00:00.25+00:00").getTime()).toBe(now + 250);
  expect(parseRelativeTimeInput("2026-09-26").getTime()).toBe(Date.UTC(2026, 8, 26));
  expect(parseRelativeTimeInput("0044-03-15").getUTCFullYear()).toBe(44);
  expect(formatRelativeTime("2026-09-26T11:55:00Z", { locale: "en-US", now: new Date(now) })).toBe("5 minutes ago");
});

test("relative time fails fast on invalid instants and options", () => {
  const invalid: unknown[] = [
    new Date(Number.NaN), Number.NaN, Number.POSITIVE_INFINITY, 8.64e15 + 1, "", "yesterday",
    "2026-09-26T12:00:00", "2026-02-30", "2026-13-01", "2026-09-26T24:00:00Z", "2026-09-26T12:60Z",
    "2026-09-26T12:00:60Z", "2026-09-26T12:00:00+24:00", "Sat, 26 Sep 2026 12:00:00 GMT", "1790000000000",
  ];
  for (const value of invalid) expect(() => parseRelativeTimeInput(value)).toThrow(RangeError);
  for (const value of [null, undefined, {}, [], 1n, true]) expect(() => parseRelativeTimeInput(value)).toThrow(TypeError);
  expect(() => parseRelativeTimeInput("nope", "published")).toThrow(/^published must be an ISO 8601/u);
  expect(() => formatRelativeTime(now, { now: "2026-09-26" as unknown as number })).toThrow(TypeError);
  expect(() => formatRelativeTime(now, { now: Number.NaN })).toThrow(RangeError);
  expect(() => formatRelativeTime(now, { now, numeric: "never" as "auto" })).toThrow(TypeError);
  expect(() => formatRelativeTime(now, { now, locale: "" })).toThrow(TypeError);
  expect(() => formatRelativeTime(now, { now, locale: "not a locale" })).toThrow(RangeError);
  expect(() => resolveRelativeTime(Number.NaN)).toThrow(RangeError);
});

test("relative time uses the requested locale", () => {
  expect(formatRelativeTime(now - minutes(5), { locale: "fr-FR", now })).toBe("il y a 5 minutes");
  expect(formatRelativeTime(now + days(1), { locale: "de-DE", now })).toBe("morgen");
});
