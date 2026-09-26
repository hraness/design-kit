import { expect, test } from "bun:test";
import * as fc from "fast-check";

import {
  formatRelativeTime,
  parseRelativeTimeInput,
  relativeTimeUnits,
  resolveRelativeTime,
} from "./index";

const maximumDifference = 4e15;
const difference = fc.double({ min: -maximumDifference, max: maximumDifference, noNaN: true });
const magnitude = fc.double({ min: 0, max: maximumDifference, noNaN: true });
const instant = fc.integer({ min: -8.64e15, max: 8.64e15 });

const negative = (value: number) => value < 0 || Object.is(value, -0);

function rank(differenceMilliseconds: number): readonly [number, number] {
  const { unit, value } = resolveRelativeTime(differenceMilliseconds);
  return [relativeTimeUnits.indexOf(unit), Math.abs(value)];
}

test("property: a larger distance never selects a smaller bucket or amount", () => {
  fc.assert(fc.property(magnitude, magnitude, fc.boolean(), (a, b, past) => {
    const [near, far] = a <= b ? [a, b] : [b, a];
    const sign = past ? -1 : 1;
    const [nearUnit, nearValue] = rank(sign * near);
    const [farUnit, farValue] = rank(sign * far);
    expect(farUnit).toBeGreaterThanOrEqual(nearUnit);
    if (farUnit === nearUnit) expect(farValue).toBeGreaterThanOrEqual(nearValue);
  }));
});

test("property: past and future are exact mirror images", () => {
  fc.assert(fc.property(difference, (delta) => {
    const future = resolveRelativeTime(delta);
    const past = resolveRelativeTime(-delta);
    expect(past.unit).toBe(future.unit);
    expect(Object.is(past.value, -future.value)).toBe(true);
    expect(negative(future.value)).toBe(negative(delta));
  }));
});

test("property: every amount is a whole number inside its bucket", () => {
  const limits = { second: 60, minute: 60, hour: 24, day: 7, week: 4, month: 12, year: Number.POSITIVE_INFINITY };
  fc.assert(fc.property(difference, (delta) => {
    const { unit, value } = resolveRelativeTime(delta);
    expect(Number.isInteger(value)).toBe(true);
    expect(Math.abs(value)).toBeLessThan(limits[unit]);
    if (unit !== "second") expect(Math.abs(value)).toBeGreaterThanOrEqual(1);
  }));
});

test("property: formatted past and future share the same number", () => {
  const number = (text: string) => text.replace(/[^0-9,]/gu, "");
  fc.assert(fc.property(fc.integer({ min: 1, max: 1e12 }), (offset) => {
    const now = Date.UTC(2026, 8, 26);
    const future = formatRelativeTime(now + offset, { locale: "en-US", now, numeric: "always" });
    const past = formatRelativeTime(now - offset, { locale: "en-US", now, numeric: "always" });
    expect(future.startsWith("in ")).toBe(true);
    expect(past.endsWith(" ago")).toBe(true);
    expect(number(past)).toBe(number(future));
  }));
});

test("property: Dates, epoch milliseconds and UTC ISO strings round-trip", () => {
  fc.assert(fc.property(fc.integer({ min: -62_167_219_200_000, max: Date.UTC(9999, 11, 31, 23, 59, 59, 999) }), (time) => {
    const iso = new Date(time).toISOString();
    expect(parseRelativeTimeInput(iso).getTime()).toBe(time);
    expect(parseRelativeTimeInput(time).getTime()).toBe(time);
    expect(parseRelativeTimeInput(new Date(time)).getTime()).toBe(time);
  }));
  fc.assert(fc.property(instant, (time) => {
    expect(formatRelativeTime(time, { now: time, locale: "en-US" })).toBe("now");
  }));
});
