"use client";

import { useEffect, useState, type ComponentPropsWithoutRef } from "react";

import {
  formatRelativeTime,
  parseRelativeTimeInput,
  resolveRelativeTime,
  type RelativeTimeInput,
  type RelativeTimeNumeric,
  type RelativeTimeReference,
} from "../relative-time.js";

/**
 * `auto` refreshes about as often as the displayed unit can change. A number
 * is a fixed interval in milliseconds. `off` keeps the first reference.
 */
export type RelativeTimeRefresh = "auto" | "off" | number;

export interface RelativeTimeProps
  extends Omit<ComponentPropsWithoutRef<"time">, "children" | "dateTime" | "title" | "suppressHydrationWarning"> {
  /** The instant to describe: a Date, epoch milliseconds, or a zoned ISO 8601 string. */
  readonly value: RelativeTimeInput;
  /**
   * The reference for the server render and the first client render. After
   * mount the component follows the client clock unless `refreshInterval` is `off`.
   */
  readonly now?: RelativeTimeReference | undefined;
  readonly locale?: string | undefined;
  readonly numeric?: RelativeTimeNumeric | undefined;
  /** Defaults to `auto`. A fixed interval must be a whole number from 1000 to 2147483647. */
  readonly refreshInterval?: RelativeTimeRefresh | undefined;
}

const maximumTimeout = 2_147_483_647;
const autoDelays = {
  second: 1_000,
  minute: 15_000,
  hour: 60_000,
  day: 3_600_000,
  week: 3_600_000,
  month: 3_600_000,
  year: 3_600_000,
} as const;

function parseRefresh(value: unknown): RelativeTimeRefresh {
  if (value === undefined) return "auto";
  if (value === "auto" || value === "off") return value;
  if (typeof value === "number" && Number.isInteger(value) && value >= 1_000 && value <= maximumTimeout) return value;
  throw new RangeError(
    `RelativeTime refreshInterval must be "auto", "off", or whole milliseconds from 1000 to ${maximumTimeout}.`,
  );
}

function absoluteFormatter(locale: string | undefined): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "long" });
}

/**
 * A `<time>` element whose text is relative ("5 minutes ago") and whose
 * `title` is the absolute local date and time. The server render and the
 * hydration render use `now`; the element is then re-created with the client
 * clock and time zone, so no stale server text survives hydration.
 */
export function RelativeTime({
  locale,
  now,
  numeric,
  refreshInterval,
  value,
  ...timeProps
}: RelativeTimeProps) {
  const instant = parseRelativeTimeInput(value, "RelativeTime value");
  const refresh = parseRefresh(refreshInterval);
  const time = instant.getTime();
  const [clock, setClock] = useState<number | null>(null);

  useEffect(() => {
    setClock(Date.now());
    if (refresh === "off") return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      const delay = typeof refresh === "number"
        ? refresh
        : autoDelays[resolveRelativeTime(time - Date.now()).unit];
      timer = setTimeout(() => {
        setClock(Date.now());
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [refresh, time]);

  const mounted = clock !== null;
  const reference = refresh === "off" && now !== undefined
    ? now
    // Without `now` the first render reads the clock; the mount update replaces it.
    : clock ?? now ?? Date.now();
  const text = formatRelativeTime(instant, {
    now: reference,
    ...(locale === undefined ? {} : { locale }),
    ...(numeric === undefined ? {} : { numeric }),
  });

  return (
    <time
      {...timeProps}
      dateTime={instant.toISOString()}
      key={mounted ? "client" : "server"}
      suppressHydrationWarning
      title={absoluteFormatter(locale).format(instant)}
    >
      {text}
    </time>
  );
}
