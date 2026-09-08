import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { designPaletteStorageKey } from "../palette-appearance";
import { getDesignPaletteTheme } from "../palette-themes";
import type { AppearanceStorage } from "./appearance-menu";
import { initDesignPalette } from "./design-palette";

class MemoryStorage implements AppearanceStorage {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

function fixture(dark = false) {
  const parsed = parseHTML('<!doctype html><html class="product-font"><head><meta name="theme-color" content="#fff"></head><body></body></html>');
  const document = parsed.document as unknown as Document;
  const view = parsed.window as unknown as Window;
  const listeners = new Set<() => void>();
  const media = {
    matches: dark,
    addEventListener: (_type: string, listener: () => void) => { listeners.add(listener); },
    removeEventListener: (_type: string, listener: () => void) => { listeners.delete(listener); },
  };
  Object.defineProperty(view, "matchMedia", { configurable: true, value: () => media });
  const storage = new MemoryStorage();
  const storageEvent = (key: string | null, storageArea?: object) => {
    const event = new parsed.window.Event("storage");
    Object.defineProperty(event, "key", { value: key });
    if (storageArea !== undefined) Object.defineProperty(event, "storageArea", { value: storageArea });
    view.dispatchEvent(event as unknown as Event);
  };
  const changeSystem = (matches: boolean) => {
    media.matches = matches;
    for (const listener of listeners) listener();
  };
  return { document, storage, storageEvent, changeSystem, listeners };
}

test("default bootstrap installs Catppuccin dark without inline delivery and preserves product classes", () => {
  const f = fixture(false);
  const controller = initDesignPalette({ document: f.document, storage: f.storage });
  expect(controller.getSnapshot().preference).toEqual({ palette: "catppuccin", mode: "dark" });
  expect(f.document.documentElement.getAttribute("data-theme")).toBe("dark");
  expect(f.document.documentElement.getAttribute("data-palette")).toBe("catppuccin");
  expect(f.document.documentElement.classList.contains("product-font")).toBe(true);
  expect(f.document.querySelectorAll("[style], style, script")).toHaveLength(0);
  expect(f.document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(controller.getSnapshot().background);
  controller.dispose();
});

test("changing palettes replaces owned classes and browser chrome while retaining mode", () => {
  const f = fixture();
  const controller = initDesignPalette({ document: f.document, storage: f.storage });
  let updates = 0;
  const unsubscribe = controller.subscribe(() => { updates += 1; });
  controller.setPreference({ palette: "gruvbox", mode: "light" });
  const classes = f.document.documentElement.className.split(" ");
  expect(classes.sort()).toEqual([...getDesignPaletteTheme("gruvbox", "light").className.split(" "), "product-font"].sort());
  expect(controller.getSnapshot().resolvedMode).toBe("light");
  expect(JSON.parse(f.storage.values.get(designPaletteStorageKey) ?? "null")).toEqual({ palette: "gruvbox", mode: "light" });
  expect(f.document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(controller.getSnapshot().background);
  expect(updates).toBe(1);
  expect(controller.setPreference({ palette: "gruvbox", mode: "light" })).toBe(false);
  expect(updates).toBe(1);
  unsubscribe();
  controller.dispose();
});

test("system changes only affect system mode and storage changes synchronize another tab", () => {
  const f = fixture();
  const controller = initDesignPalette({ document: f.document, storage: f.storage });
  f.changeSystem(true);
  expect(controller.getSnapshot().resolvedMode).toBe("dark");
  controller.setPreference({ palette: "rose-pine", mode: "system" });
  f.changeSystem(false);
  expect(controller.getSnapshot().resolvedMode).toBe("light");
  f.storage.setItem(designPaletteStorageKey, JSON.stringify({ palette: "tokyo-night", mode: "dark" }));
  // Native events carry the original Storage, not the bounded adapter object.
  f.storageEvent(designPaletteStorageKey, {});
  expect(controller.getSnapshot().preference).toEqual({ palette: "tokyo-night", mode: "dark" });
  f.changeSystem(false);
  expect(controller.getSnapshot().resolvedMode).toBe("dark");
  controller.dispose();
  expect(f.listeners.size).toBe(0);
});

test("the React owner adopts an external bootstrap and only the last owner removes listeners", () => {
  const f = fixture();
  const bootstrap = initDesignPalette({ document: f.document, storage: f.storage });
  const react = initDesignPalette({ document: f.document });
  expect(f.listeners.size).toBe(1);
  expect(react.getSnapshot()).toBe(bootstrap.getSnapshot());
  react.setPreference({ palette: "gruvbox", mode: "system" });
  expect(bootstrap.getSnapshot().preference.palette).toBe("gruvbox");
  react.dispose();
  react.dispose();
  expect(f.listeners.size).toBe(1);
  expect(react.setPreference({ palette: "catppuccin", mode: "light" })).toBe(false);
  expect(() => initDesignPalette({ document: f.document, storageKey: "other" })).toThrow("different palette configuration");
  bootstrap.dispose();
  expect(f.listeners.size).toBe(0);
});

for (const replacement of ["attributes", "document root"] as const) {
  test(`a new page owner restores the saved appearance after replacing ${replacement}`, async () => {
    const f = fixture();
    f.storage.setItem(designPaletteStorageKey, JSON.stringify({ palette: "gruvbox", mode: "light" }));
    const bootstrap = initDesignPalette({ document: f.document, storage: f.storage });
    const snapshot = bootstrap.getSnapshot();
    let updates = 0;
    bootstrap.subscribe(() => { updates += 1; });
    const defaultTheme = getDesignPaletteTheme("catppuccin", "dark");
    if (replacement === "document root") {
      const nextRoot = f.document.createElement("html");
      nextRoot.innerHTML = '<head><meta name="theme-color" content="#000"></head><body></body>';
      f.document.replaceChild(nextRoot, f.document.documentElement);
    }
    f.document.documentElement.className = `fallback-font ${defaultTheme.className}`;
    f.document.documentElement.setAttribute("data-palette", "catppuccin");
    f.document.documentElement.setAttribute("data-theme", "dark");

    const fallback = initDesignPalette({ document: f.document });
    const lateMeta = f.document.createElement("meta");
    lateMeta.name = "theme-color";
    lateMeta.media = "(prefers-color-scheme: dark)";
    lateMeta.content = "#000";
    try {
      expect(fallback.getSnapshot()).toBe(snapshot);
      expect(f.document.documentElement.className.split(" ").sort()).toEqual([
        ...snapshot.className.split(" "), "fallback-font",
      ].sort());
      expect(f.document.documentElement.getAttribute("data-palette")).toBe("gruvbox");
      expect(f.document.documentElement.getAttribute("data-theme")).toBe("light");
      const activeMetas = f.document.querySelectorAll('meta[name="theme-color"]:not([media])');
      expect(activeMetas).toHaveLength(1);
      expect(activeMetas[0]?.getAttribute("content")).toBe(snapshot.background);
      expect(f.listeners.size).toBe(1);
      expect(updates).toBe(0);
      expect(JSON.parse(f.storage.values.get(designPaletteStorageKey) ?? "null")).toEqual(snapshot.preference);
      expect(f.document.querySelectorAll("[style], style, script")).toHaveLength(0);
      // Let adoption settle before simulating metadata streamed into the new head.
      await Promise.resolve();
      await Promise.resolve();
      f.document.head.prepend(lateMeta);
      await Promise.resolve();
      await Promise.resolve();
      expect(lateMeta.media).toBe("not all");
      expect(f.document.head.querySelectorAll('meta[name="theme-color"]:not([media])')).toHaveLength(1);
      expect(f.document.head.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(snapshot.background);
      fallback.setPreference({ palette: "tokyo-night", mode: "system" });
      f.changeSystem(true);
      expect(f.document.documentElement.getAttribute("data-palette")).toBe("tokyo-night");
      expect(f.document.documentElement.getAttribute("data-theme")).toBe("dark");
    } finally {
      fallback.dispose();
      bootstrap.dispose();
    }
    expect(f.listeners.size).toBe(0);
    expect(lateMeta.media).toBe("(prefers-color-scheme: dark)");
    expect(f.document.head.querySelectorAll('[data-hraness-design-theme-color-sync-active]')).toHaveLength(0);
  });
}

test("existing valid mode choices migrate once without overwriting palette selections", () => {
  const f = fixture();
  f.storage.setItem("hraness-design-theme-v1", "light");
  const controller = initDesignPalette({ document: f.document, storage: f.storage });
  expect(controller.getSnapshot().preference).toEqual({ palette: "catppuccin", mode: "light" });
  controller.setPreference({ palette: "rose-pine", mode: "dark" });
  controller.dispose();
  const next = initDesignPalette({ document: f.document, storage: f.storage });
  expect(next.getSnapshot().preference).toEqual({ palette: "rose-pine", mode: "dark" });
  next.dispose();
});

test("invalid and denied storage preserve a usable default and local changes", () => {
  const f = fixture();
  f.storage.setItem(designPaletteStorageKey, '{"palette":"invalid","mode":"dark"}');
  let controller = initDesignPalette({ document: f.document, storage: f.storage });
  expect(controller.getSnapshot().preference.palette).toBe("catppuccin");
  controller.dispose();
  controller = initDesignPalette({ document: f.document, storage: {
    getItem: () => { throw new Error("denied"); },
    setItem: () => { throw new Error("denied"); },
  } });
  expect(controller.setPreference({ palette: "gruvbox", mode: "light" })).toBe(true);
  expect(controller.getSnapshot().resolvedMode).toBe("light");
  controller.dispose();
});

test("forced previews do not read or write preferences and ignore later system changes", () => {
  const f = fixture(true);
  let storageAccesses = 0;
  const controller = initDesignPalette({ document: f.document, forcedPreference: { palette: "tokyo-night", mode: "light" }, storage: {
    getItem: () => { storageAccesses += 1; return null; },
    setItem: () => { storageAccesses += 1; },
  } });
  expect(controller.getSnapshot().resolvedMode).toBe("light");
  expect(controller.getSnapshot().isForced).toBe(true);
  expect(controller.setPreference({ palette: "gruvbox", mode: "dark" })).toBe(false);
  expect(storageAccesses).toBe(0);
  expect(f.listeners.size).toBe(0);
  controller.dispose();
});
