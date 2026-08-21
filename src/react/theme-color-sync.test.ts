import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  acquireThemeColorMeta,
  themeColorSyncActiveAttribute,
  themeColorSyncDisabledAttribute,
} from "./theme-color-sync";

function adaptiveThemeColorDocument(): Document {
  return parseHTML(`<!doctype html><html><head>
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fafafa">
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111111">
    <meta name="theme-color" media="not all" content="#777777" data-unrelated="true">
  </head><body></body></html>`).document;
}

function activeMeta(document: Document): HTMLMetaElement {
  const meta = document.head.querySelector<HTMLMetaElement>(
    `meta[${themeColorSyncActiveAttribute}]`,
  );
  if (meta === null) throw new Error("The synchronized theme-color meta is missing.");
  return meta;
}

test("one active meta temporarily disables and then exactly restores adaptive server tags", async () => {
  const document = adaptiveThemeColorDocument();
  const adaptive = Array.from(
    document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
  ).slice(0, 2);
  const registration = acquireThemeColorMeta(
    document,
    "theme-color",
    Symbol("primary"),
    "#fafafa",
  );

  expect(activeMeta(document).content).toBe("#fafafa");
  expect(activeMeta(document).hasAttribute("media")).toBe(false);
  expect(adaptive.map((meta) => meta.media)).toEqual(["not all", "not all"]);
  expect(adaptive.every((meta) => meta.hasAttribute(themeColorSyncDisabledAttribute))).toBe(true);
  const unrelated = document.head.querySelector<HTMLMetaElement>('[data-unrelated="true"]');
  expect(unrelated?.media).toBe("not all");
  expect(unrelated?.hasAttribute(themeColorSyncDisabledAttribute)).toBe(false);

  adaptive[0]?.removeAttribute(themeColorSyncDisabledAttribute);
  adaptive[0]?.setAttribute("media", "(prefers-color-scheme: print)");
  await Promise.resolve();
  await Promise.resolve();
  expect(adaptive[0]?.media).toBe("not all");
  expect(adaptive[0]?.hasAttribute(themeColorSyncDisabledAttribute)).toBe(true);

  activeMeta(document).content = "#ff00ff";
  await Promise.resolve();
  expect(activeMeta(document).content).toBe("#fafafa");

  registration.update("#111111");
  expect(activeMeta(document).content).toBe("#111111");
  registration.release();

  expect(document.head.querySelector(`[${themeColorSyncActiveAttribute}]`)).toBeNull();
  expect(adaptive.map((meta) => meta.media)).toEqual([
    "(prefers-color-scheme: light)",
    "(prefers-color-scheme: dark)",
  ]);
  expect(adaptive.every((meta) => !meta.hasAttribute(themeColorSyncDisabledAttribute))).toBe(true);

  const remount = acquireThemeColorMeta(
    document,
    "theme-color",
    Symbol("remount"),
    "#111111",
  );
  expect(activeMeta(document).content).toBe("#111111");
  expect(adaptive.map((meta) => meta.media)).toEqual(["not all", "not all"]);
  remount.release();
  expect(adaptive.map((meta) => meta.media)).toEqual([
    "(prefers-color-scheme: light)",
    "(prefers-color-scheme: dark)",
  ]);
});

test("an existing unqualified tag is neutralized without changing its content", () => {
  const { document } = parseHTML(`<!doctype html><html><head>
    <meta name="theme-color" content="#abcdef" data-existing="true">
  </head><body></body></html>`);
  const existing = document.head.querySelector<HTMLMetaElement>('[data-existing="true"]');
  if (existing === null) throw new Error("The existing theme-color fixture is missing.");

  const registration = acquireThemeColorMeta(
    document,
    "theme-color",
    Symbol("existing"),
    "#fafafa",
  );
  expect(existing.content).toBe("#abcdef");
  expect(existing.media).toBe("not all");
  registration.release();
  expect(existing.content).toBe("#abcdef");
  expect(existing.hasAttribute("media")).toBe(false);
});

test("simultaneous owners share one active meta until the final release", () => {
  const document = adaptiveThemeColorDocument();
  const first = acquireThemeColorMeta(document, "theme-color", Symbol("first"), "#fafafa");
  const second = acquireThemeColorMeta(document, "theme-color", Symbol("second"), "#111111");

  expect(document.head.querySelectorAll(`[${themeColorSyncActiveAttribute}]`)).toHaveLength(1);
  expect(activeMeta(document).content).toBe("#111111");
  second.release();
  expect(activeMeta(document).content).toBe("#fafafa");
  expect(
    Array.from(document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
      .filter((meta) => meta !== activeMeta(document) && meta.media !== "not all"),
  ).toHaveLength(0);

  first.release();
  expect(document.head.querySelector(`[${themeColorSyncActiveAttribute}]`)).toBeNull();
});

test("late competing tags are disabled, ordered after the active meta, and restored", async () => {
  const document = adaptiveThemeColorDocument();
  const registration = acquireThemeColorMeta(
    document,
    "theme-color",
    Symbol("observer"),
    "#fafafa",
  );
  const late = document.createElement("meta");
  late.name = "theme-color";
  late.media = "(prefers-color-scheme: dark)";
  late.content = "#222222";
  document.head.insertBefore(late, document.head.firstChild);
  await Promise.resolve();

  expect(document.head.querySelector('meta[name="theme-color"]')).toBe(activeMeta(document));
  expect(late.media).toBe("not all");
  expect(late.hasAttribute(themeColorSyncDisabledAttribute)).toBe(true);

  registration.release();
  expect(late.media).toBe("(prefers-color-scheme: dark)");
  expect(late.hasAttribute(themeColorSyncDisabledAttribute)).toBe(false);
});
