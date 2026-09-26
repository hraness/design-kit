import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import { renderStatusPageHtml } from "../status-page-html.js";
import { attachStatusPage } from "./status-page.js";

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing fixture element");
  return value;
}

function fixture(pathname: string, referrer = "", historyLength = 2) {
  const markup = renderStatusPageHtml({
    routes: [{ href: "/docs/getting-started", label: "Getting started" }, { href: "/pricing", label: "Pricing" }],
  });
  const parsed = parseHTML(`<html><body>${markup}</body></html>`);
  const view = parsed.document.defaultView as unknown as Window;
  const location = new URL(`https://example.test${pathname}`);
  let wentBack = 0;
  Object.defineProperties(view, {
    location: { configurable: true, value: location },
    history: { configurable: true, value: { length: historyLength, back: () => { wentBack++; } } },
  });
  Object.defineProperty(parsed.document, "referrer", { configurable: true, value: referrer });
  const root = parsed.document.querySelector(".hraness-status-page") as unknown as HTMLElement;
  return { root, document: parsed.document, window: parsed.window, backs: () => wentBack };
}

test("offers the closest known page and restores the static markup on cleanup", () => {
  const { root } = fixture("/docs/getting-startd");
  const hint = required(root.querySelector<HTMLElement>(".hraness-status-page__hint"));
  expect(hint.hidden).toBe(true);
  const dispose = attachStatusPage(root);
  expect(hint.hidden).toBe(false);
  expect(hint.querySelector("a")?.getAttribute("href")).toBe("/docs/getting-started");
  expect(hint.querySelector("a")?.textContent).toBe("Getting started");
  expect(root.dataset.hranessStatusSuggestion).toBe("/docs/getting-started");
  dispose();
  expect(hint.hidden).toBe(true);
  expect(hint.querySelector("a")?.getAttribute("href")).toBe("/");
  expect(root.dataset.hranessStatusSuggestion).toBeUndefined();
});

test("keeps the hint hidden when nothing is close", () => {
  const { root } = fixture("/checkout/confirm");
  attachStatusPage(root);
  expect(required(root.querySelector<HTMLElement>(".hraness-status-page__hint")).hidden).toBe(true);
});

test("shows Back only for a reader who came from another page on this site", () => {
  const external = fixture("/missing", "https://search.test/?q=x");
  attachStatusPage(external.root);
  expect(required(external.root.querySelector<HTMLElement>(".hraness-status-page__back")).hidden).toBe(true);

  const direct = fixture("/missing", "https://example.test/docs", 1);
  attachStatusPage(direct.root);
  expect(required(direct.root.querySelector<HTMLElement>(".hraness-status-page__back")).hidden).toBe(true);

  const internal = fixture("/missing", "https://example.test/docs");
  const dispose = attachStatusPage(internal.root);
  const back = required(internal.root.querySelector<HTMLAnchorElement>(".hraness-status-page__back"));
  expect(back.hidden).toBe(false);
  expect(back.getAttribute("href")).toBe("https://example.test/docs");
  const click = new internal.window.Event("click", { cancelable: true });
  Object.assign(click, { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false });
  back.dispatchEvent(click as unknown as Event);
  expect(internal.backs()).toBe(1);
  expect(click.defaultPrevented).toBe(true);
  dispose();
  expect(back.hidden).toBe(true);
});

test("follows client-side navigation through the Navigation API", () => {
  const fromSite = fixture("/missing", "https://search.test/?q=x");
  const view = fromSite.root.ownerDocument.defaultView as unknown as Window;
  Object.defineProperty(view, "navigation", {
    configurable: true,
    value: { currentEntry: { index: 1 }, entries: () => [{ url: "https://example.test/docs" }, { url: "https://example.test/missing" }] },
  });
  attachStatusPage(fromSite.root);
  const back = required(fromSite.root.querySelector<HTMLAnchorElement>(".hraness-status-page__back"));
  expect(back.hidden).toBe(false);
  expect(back.getAttribute("href")).toBe("https://example.test/docs");

  const firstPage = fixture("/missing", "https://example.test/docs");
  Object.defineProperty(firstPage.root.ownerDocument.defaultView as unknown as Window, "navigation", {
    configurable: true,
    value: { currentEntry: { index: 0 }, entries: () => [{ url: "https://example.test/missing" }] },
  });
  attachStatusPage(firstPage.root);
  expect(required(firstPage.root.querySelector<HTMLElement>(".hraness-status-page__back")).hidden).toBe(true);
});

test("leaves the text glyph in place when the dot field cannot run", () => {
  const { root } = fixture("/missing");
  const dispose = attachStatusPage(root);
  expect(root.dataset.hranessStatusField).toBeUndefined();
  expect(root.querySelector(".hraness-status-page__glyph")?.textContent).toBe("404");
  dispose();
});
