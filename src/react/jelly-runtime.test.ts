import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  applyJellyRootMode,
  applyJellyThemeMode,
  createRetryableJellyRuntimeLoader,
  loadJellyRuntimeForRoot,
  shouldLoadJellyRuntime,
  synchronizeJellyThemeMode,
} from "./jelly-runtime";

test("theme sync does not load Jelly when the document has no Jelly surface", async () => {
  const { document } = parseHTML("<!doctype html><html><head></head><body></body></html>");
  let loads = 0;

  expect(await synchronizeJellyThemeMode(document, "dark", async () => {
    loads += 1;
    return { setThemeMode: () => undefined };
  })).toBeTrue();

  expect(loads).toBe(0);
  expect(shouldLoadJellyRuntime(document)).toBeFalse();
  expect(document.documentElement.getAttribute("data-jelly-mode")).toBe("dark");
  expect(document.querySelector("style[data-jelly-tokens]")).toBeNull();
});

test("an initially present Jelly surface loads with the selected root mode", async () => {
  const { document } = parseHTML(
    '<!doctype html><html><head></head><body><jelly-card class="hraness-design-jelly-surface"></jelly-card></body></html>',
  );
  const modes: string[] = [];
  let loads = 0;

  expect(shouldLoadJellyRuntime(document)).toBeTrue();
  expect(await synchronizeJellyThemeMode(document, "light", async () => {
    loads += 1;
    return { setThemeMode: (mode = "auto") => modes.push(mode) };
  })).toBeTrue();
  expect(loads).toBe(1);
  expect(document.documentElement.getAttribute("data-jelly-mode")).toBe("light");
  expect(modes).toEqual(["light"]);
});

test("a later-mounted Jelly surface receives the mode selected before it existed", async () => {
  const { document } = parseHTML("<!doctype html><html><head></head><body></body></html>");
  const modes: string[] = [];

  applyJellyRootMode(document.documentElement, "dark");
  expect(shouldLoadJellyRuntime(document)).toBeFalse();

  const surface = document.createElement("jelly-card");
  surface.className = "hraness-design-jelly-surface";
  document.body.append(surface);

  expect(surface.isConnected).toBeTrue();
  expect(shouldLoadJellyRuntime(document)).toBeTrue();
  expect(await loadJellyRuntimeForRoot(
    async () => ({ setThemeMode: (mode = "auto") => modes.push(mode) }),
    document.documentElement,
  )).toBeTrue();
  expect(document.documentElement.getAttribute("data-jelly-mode")).toBe("dark");
  expect(modes).toEqual(["dark"]);
});

test("theme changes use Jelly's public API and emit the canvas repaint event", async () => {
  const events = new EventTarget();
  const modes: string[] = [];
  let repaintEvents = 0;
  events.addEventListener("jelly-theme-change", () => repaintEvents += 1);

  const runtime = {
    setThemeMode(mode = "auto") {
      modes.push(mode);
      events.dispatchEvent(new Event("jelly-theme-change"));
    },
  };

  applyJellyThemeMode(runtime, "dark");
  applyJellyThemeMode(runtime, "light");

  expect(modes).toEqual(["dark", "light"]);
  expect(repaintEvents).toBe(2);

  const vendor = await Bun.file(
    new URL("../../vendor/jelly-ui/jelly.js", import.meta.url),
  ).text();
  expect(vendor).toContain('new CustomEvent("jelly-theme-change")');
  expect(vendor).toContain("setThemeMode");
});

test("the shared theme provider repaints Jelly after resolved appearance changes", async () => {
  const theme = await Bun.file(new URL("./theme.tsx", import.meta.url)).text();

  expect(theme.match(/setJellyThemeMode\(/gu)).toHaveLength(1);
  expect(theme).toContain("void setJellyThemeMode(resolvedTheme);");
  expect(theme).toContain('resolvedTheme === "light" || resolvedTheme === "dark"');
});

test("a rejected Jelly runtime load can retry instead of poisoning the singleton", async () => {
  const runtime = { setThemeMode: () => undefined };
  let attempts = 0;
  const load = createRetryableJellyRuntimeLoader(() => {
    attempts += 1;
    if (attempts === 1) return Promise.reject(new Error("transient chunk failure"));
    return Promise.resolve(runtime);
  });

  let firstFailure: unknown;
  try {
    await load();
  } catch (error: unknown) {
    firstFailure = error;
  }
  expect(firstFailure).toBeInstanceOf(Error);
  if (!(firstFailure instanceof Error)) throw new Error("expected the first runtime load to fail");
  expect(firstFailure.message).toBe("transient chunk failure");
  expect(await load()).toBe(runtime);
  expect(await load()).toBe(runtime);
  expect(attempts).toBe(2);
});
