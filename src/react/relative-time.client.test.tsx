import { afterEach, expect, jest, spyOn, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { RelativeTime, type RelativeTimeProps } from "./index";

const installedGlobals = ["document", "Document", "Element", "HTMLElement", "Node", "navigator", "window"] as const;
const globalRecord = globalThis as unknown as Record<string, unknown>;
const originalDescriptors = new Map(
  installedGlobals.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
);
const serverNow = Date.UTC(2026, 8, 26, 12, 0, 0);
const published = serverNow - 5 * 60_000;
let mountedRoot: Root | null = null;
let clock = serverNow;
const setClock = (value: number) => { clock = value; };
const dateTimeOf = (element: Element | null | undefined) =>
  element?.getAttribute("datetime") ?? element?.getAttribute("dateTime");

function hydrate(props: RelativeTimeProps, now: number): HTMLElement {
  const markup = renderToString(<RelativeTime {...props} />);
  const { document, window } = parseHTML(`<!doctype html><html><body><div id="root">${markup}</div></body></html>`);
  const windowRecord = window as unknown as Record<string, unknown>;
  for (const name of installedGlobals) {
    globalRecord[name] = name === "window" ? window : name === "document" ? document : windowRecord[name];
  }
  globalRecord.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.getElementById("root") as unknown as HTMLElement;
  setClock(now);
  spyOn(Date, "now").mockImplementation(() => clock);
  act(() => { mountedRoot = hydrateRoot(container, <RelativeTime {...props} />); });
  return container;
}

afterEach(() => {
  if (mountedRoot !== null) {
    act(() => mountedRoot?.unmount());
    mountedRoot = null;
  }
  jest.useRealTimers();
  jest.restoreAllMocks();
  for (const name of installedGlobals) {
    const descriptor = originalDescriptors.get(name);
    if (descriptor === undefined) Reflect.deleteProperty(globalRecord, name);
    else Object.defineProperty(globalThis, name, descriptor);
  }
  Reflect.deleteProperty(globalRecord, "IS_REACT_ACT_ENVIRONMENT");
});

test("the server render is a machine-readable time element with an absolute title", () => {
  const markup = renderToString(
    <RelativeTime className="stamp" id="published" locale="en-US" now={serverNow} value="2026-09-26T11:55:00Z" />,
  );
  const { document } = parseHTML(`<div>${markup}</div>`);
  const element = document.querySelector("time");
  expect(markup).toContain(`dateTime="2026-09-26T11:55:00.000Z"`);
  expect(dateTimeOf(element)).toBe("2026-09-26T11:55:00.000Z");
  expect(element?.textContent).toBe("5 minutes ago");
  expect(element?.getAttribute("title")).toBe(
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "long" }).format(published),
  );
  expect(element?.getAttribute("class")).toBe("stamp");
  expect(element?.getAttribute("id")).toBe("published");
  expect(element?.children.length).toBe(0);
});

test("hydration replaces the server text with the client clock", () => {
  jest.useFakeTimers();
  const container = hydrate({ locale: "en-US", now: serverNow, value: published }, serverNow + 10 * 60_000);
  expect(container.querySelector("time")?.textContent).toBe("15 minutes ago");
  expect(dateTimeOf(container.querySelector("time"))).toBe(new Date(published).toISOString());
});

test("auto refresh follows the displayed unit", () => {
  jest.useFakeTimers();
  const container = hydrate({ locale: "en-US", now: serverNow, value: serverNow - 30_000 }, serverNow);
  expect(container.querySelector("time")?.textContent).toBe("30 seconds ago");
  act(() => {
    setClock(serverNow + 1_000);
    jest.advanceTimersByTime(1_000);
  });
  expect(container.querySelector("time")?.textContent).toBe("31 seconds ago");
});

test("a fixed interval refreshes on its own schedule", () => {
  jest.useFakeTimers();
  const container = hydrate({ locale: "en-US", now: serverNow, refreshInterval: 60_000, value: published }, serverNow);
  act(() => {
    setClock(serverNow + 30_000);
    jest.advanceTimersByTime(30_000);
  });
  expect(container.querySelector("time")?.textContent).toBe("5 minutes ago");
  act(() => {
    setClock(serverNow + 60_000);
    jest.advanceTimersByTime(30_000);
  });
  expect(container.querySelector("time")?.textContent).toBe("6 minutes ago");
});

test("refreshInterval off keeps a deterministic reference", () => {
  jest.useFakeTimers();
  const container = hydrate({ locale: "en-US", now: serverNow, refreshInterval: "off", value: published }, serverNow + 3_600_000);
  act(() => { jest.advanceTimersByTime(3_600_000); });
  expect(container.querySelector("time")?.textContent).toBe("5 minutes ago");
});

test("invalid values and intervals fail during render", () => {
  expect(() => renderToString(<RelativeTime now={serverNow} value="yesterday" />)).toThrow(RangeError);
  expect(() => renderToString(<RelativeTime now={serverNow} value={Number.NaN} />)).toThrow(RangeError);
  for (const refreshInterval of [0, 999, 1_500.5, 2_147_483_648, Number.NaN]) {
    expect(() => renderToString(<RelativeTime now={serverNow} refreshInterval={refreshInterval} value={published} />))
      .toThrow(RangeError);
  }
});
