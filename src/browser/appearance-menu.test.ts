import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  defaultDesignTheme,
  designThemeLabel,
  designThemeStorageKey,
  normalizeDesignTheme,
  resolveDesignTheme,
} from "../appearance";
import { installAppearanceMenus, type AppearanceStorage } from "./appearance-menu";
import {
  themeColorSyncActiveAttribute,
  themeColorSyncDisabledAttribute,
} from "./theme-color-sync";

const appearanceCss = await Bun.file(
  new URL("../appearance-menu.css", import.meta.url),
).text();

class MemoryStorage implements AppearanceStorage {
  readonly values = new Map<string, string>();
  readonly writes: Array<readonly [string, string]> = [];

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
    this.writes.push([key, value]);
  }
}

class MediaPreference {
  readonly listeners = new Set<EventListenerOrEventListenerObject>();
  matches: boolean;

  constructor(matches: boolean) {
    this.matches = matches;
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type === "change") this.listeners.add(listener);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type === "change") this.listeners.delete(listener);
  }

  setMatches(matches: boolean, event: Event): void {
    this.matches = matches;
    for (const listener of this.listeners) {
      if (typeof listener === "function") listener(event);
      else listener.handleEvent(event);
    }
  }
}

function menuMarkup(id: string): string {
  return `<div aria-busy="true" class="hraness-design-theme-toggle"
      data-display="icons" data-hraness-appearance-menu data-presentation="menu"
      data-ready="false" data-theme-value="system">
    <button aria-controls="${id}" aria-expanded="false" aria-haspopup="menu"
      aria-label="Appearance: System" class="hraness-design-theme-toggle__trigger"
      disabled type="button">
      <span aria-hidden="true" data-current-appearance-icon="system"></span>
    </button>
    <div class="hraness-design-theme-toggle__popover" hidden>
      <div aria-label="Appearance" class="hraness-design-theme-toggle__menu"
        id="${id}" role="menu">
        <div aria-checked="false" class="hraness-design-theme-toggle__item"
          data-theme-value="light" role="menuitemradio" tabindex="-1">
          <span aria-hidden="true" data-appearance-icon="light"></span><span>Light</span>
        </div>
        <div aria-checked="false" class="hraness-design-theme-toggle__item"
          data-theme-value="dark" role="menuitemradio" tabindex="-1">
          <span aria-hidden="true" data-appearance-icon="dark"></span><span>Dark</span>
        </div>
        <div aria-checked="true" class="hraness-design-theme-toggle__item"
          data-selected="true" data-theme-value="system" role="menuitemradio" tabindex="-1">
          <span aria-hidden="true" data-appearance-icon="system"></span><span>System</span>
        </div>
      </div>
    </div>
  </div>`;
}

interface Fixture {
  readonly activeElement: () => Element | null;
  readonly document: Document;
  readonly event: (type: string, values?: Readonly<Record<string, unknown>>) => Event;
  readonly media: MediaPreference;
  readonly view: Window;
}

function fixture(menuCount = 1, osDark = false): Fixture {
  const menus = Array.from({ length: menuCount }, (_, index) =>
    menuMarkup(`appearance-${String(index + 1)}`)).join("");
  const parsed = parseHTML(`<!doctype html><html data-theme="system"><head>
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fafafa">
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111111">
  </head><body>${menus}<button id="outside" type="button">Outside</button></body></html>`);
  const document = parsed.document as unknown as Document;
  const view = parsed.window as unknown as Window;
  const EventConstructor = (
    view as unknown as { readonly Event: typeof Event }
  ).Event;
  const media = new MediaPreference(osDark);
  Object.defineProperty(view, "matchMedia", {
    configurable: true,
    value: () => media as unknown as MediaQueryList,
  });

  let activeElement: Element | null = null;
  Object.defineProperty(document, "activeElement", {
    configurable: true,
    get: () => activeElement,
  });
  const elementPrototype = (
    view as unknown as { HTMLElement: { prototype: HTMLElement } }
  ).HTMLElement.prototype;
  const focusElement = (next: HTMLElement): void => {
    const previous = activeElement;
    activeElement = next;
    if (previous !== null && previous !== next) {
      previous.dispatchEvent(new EventConstructor("focusout", { bubbles: true }));
    }
    next.dispatchEvent(new EventConstructor("focusin", { bubbles: true }));
  };
  Object.defineProperty(elementPrototype, "focus", {
    configurable: true,
    value(this: HTMLElement) {
      focusElement(this);
    },
  });

  return {
    activeElement: () => activeElement,
    document,
    event: (type, values = {}) => {
      const event = new EventConstructor(type, { bubbles: true, cancelable: true });
      for (const [name, value] of Object.entries(values)) {
        Object.defineProperty(event, name, { configurable: true, value });
      }
      return event;
    },
    media,
    view,
  };
}

function rootAt(document: Document, index = 0): HTMLElement {
  const root = document.querySelectorAll<HTMLElement>(
    "[data-hraness-appearance-menu]",
  )[index];
  if (root === undefined) throw new Error("Missing appearance menu root.");
  return root;
}

function triggerAt(document: Document, index = 0): HTMLButtonElement {
  const trigger = rootAt(document, index).querySelector<HTMLButtonElement>(
    ".hraness-design-theme-toggle__trigger",
  );
  if (trigger === null) throw new Error("Missing appearance menu trigger.");
  return trigger;
}

function itemAt(document: Document, theme: string, index = 0): HTMLElement {
  const item = rootAt(document, index).querySelector<HTMLElement>(
    `.hraness-design-theme-toggle__item[data-theme-value="${theme}"]`,
  );
  if (item === null) throw new Error(`Missing ${theme} item.`);
  return item;
}

function popoverAt(document: Document, index = 0): HTMLElement {
  const popover = rootAt(document, index).querySelector<HTMLElement>(
    ".hraness-design-theme-toggle__popover",
  );
  if (popover === null) throw new Error("Missing appearance menu popover.");
  return popover;
}

function activeThemeColor(document: Document): HTMLMetaElement {
  const meta = document.head.querySelector<HTMLMetaElement>(
    `meta[${themeColorSyncActiveAttribute}]`,
  );
  if (meta === null) throw new Error("Missing synchronized theme-color meta.");
  return meta;
}

test("appearance values are system-first and resolve against the device", () => {
  expect(defaultDesignTheme).toBe("system");
  expect(designThemeStorageKey).toBe("hraness-design-theme-v1");
  expect(normalizeDesignTheme(undefined)).toBe("system");
  expect(normalizeDesignTheme("sepia")).toBe("system");
  expect(normalizeDesignTheme("dark")).toBe("dark");
  expect(designThemeLabel("system")).toBe("System");
  expect(designThemeLabel("system", { system: "Device" })).toBe("Device");
  expect(resolveDesignTheme("system", false)).toBe("light");
  expect(resolveDesignTheme("system", true)).toBe("dark");
  expect(resolveDesignTheme("light", true)).toBe("light");
});

test("appearance menu CSS is a portable, accessible leaf asset", () => {
  expect(appearanceCss).not.toContain("@import");
  expect(appearanceCss).toContain(".hraness-design-theme-toggle__trigger");
  expect(appearanceCss).toContain(".hraness-design-theme-toggle__popover[hidden]");
  expect(appearanceCss).toContain(".hraness-design-theme-toggle__item[data-selected]");
  expect(appearanceCss).toContain("@media (pointer: coarse)");
  expect(appearanceCss).toMatch(
    /@media \(pointer: coarse\) \{\s+\.hraness-design-theme-toggle\[data-hraness-appearance-menu\]\[data-presentation="menu"\]:not\(\[data-hraness-theme-toggle-stylex\]\)\s+\.hraness-design-theme-toggle__trigger\s*\{\s+inline-size:\s*3rem;\s+min-inline-size:\s*3rem;\s+min-block-size:\s*3rem;/u,
  );
  expect(appearanceCss).toContain("@media (prefers-reduced-motion: reduce)");
  expect(appearanceCss).toContain("@media (forced-colors: active)");
});

test("bootstrap repairs invalid storage, mounts every menu, and restores meta ownership", () => {
  const { document } = fixture(2, true);
  const storage = new MemoryStorage();
  storage.values.set("appearance", "sepia");
  const installation = installAppearanceMenus({
    darkThemeColor: "#111111",
    document,
    lightThemeColor: "#fafafa",
    storage,
    storageKey: "appearance",
  });

  expect(installation.preference()).toBe("system");
  expect(storage.writes).toEqual([["appearance", "system"]]);
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(activeThemeColor(document).content).toBe("#111111");
  expect(activeThemeColor(document).hasAttribute("media")).toBe(false);
  expect(
    Array.from(document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
      .filter((meta) => !meta.hasAttribute(themeColorSyncActiveAttribute))
      .map((meta) => meta.media),
  ).toEqual(["not all", "not all"]);

  for (let index = 0; index < 2; index += 1) {
    expect(rootAt(document, index).dataset.ready).toBe("true");
    expect(rootAt(document, index).getAttribute("aria-busy")).toBeNull();
    expect(triggerAt(document, index).disabled).toBe(false);
    expect(triggerAt(document, index).getAttribute("aria-label")).toBe("Appearance: System");
    expect(rootAt(document, index).querySelectorAll("svg.hraness-icon")).toHaveLength(4);
    expect(itemAt(document, "system", index).getAttribute("aria-checked")).toBe("true");
  }

  installation.dispose();
  installation.dispose();
  expect(document.head.querySelector(`[${themeColorSyncActiveAttribute}]`)).toBeNull();
  expect(
    Array.from(document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
      .map((meta) => meta.media),
  ).toEqual(["(prefers-color-scheme: light)", "(prefers-color-scheme: dark)"]);
  expect(
    document.head.querySelector(`[${themeColorSyncDisabledAttribute}]`),
  ).toBeNull();
  expect(rootAt(document).dataset.ready).toBe("false");
  expect(triggerAt(document).disabled).toBe(true);
});

test("pointer selection persists and keeps simultaneous menus synchronized", () => {
  const { document } = fixture(2);
  const storage = new MemoryStorage();
  const installation = installAppearanceMenus({
    darkThemeColor: "#111111",
    document,
    lightThemeColor: "#fafafa",
    storage,
    storageKey: "appearance",
  });

  triggerAt(document).click();
  expect(popoverAt(document).hidden).toBe(false);
  expect(triggerAt(document).getAttribute("aria-expanded")).toBe("true");
  itemAt(document, "dark").click();

  expect(installation.preference()).toBe("dark");
  expect(storage.values.get("appearance")).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(activeThemeColor(document).content).toBe("#111111");
  expect(popoverAt(document).hidden).toBe(true);
  for (let index = 0; index < 2; index += 1) {
    expect(rootAt(document, index).dataset.themeValue).toBe("dark");
    expect(triggerAt(document, index).getAttribute("aria-label")).toBe("Appearance: Dark");
    expect(itemAt(document, "dark", index).hasAttribute("data-selected")).toBe(true);
    expect(itemAt(document, "system", index).getAttribute("aria-checked")).toBe("false");
  }
  installation.dispose();
});

test("keyboard navigation, typeahead, selection, escape, and Tab follow menu semantics", () => {
  const { activeElement, document, event } = fixture();
  const storage = new MemoryStorage();
  const installation = installAppearanceMenus({
    darkThemeColor: "#111111",
    document,
    lightThemeColor: "#fafafa",
    storage,
  });
  const trigger = triggerAt(document);

  trigger.dispatchEvent(event("keydown", { key: "ArrowDown" }));
  expect(activeElement()).toBe(itemAt(document, "light"));
  itemAt(document, "light").dispatchEvent(event("keydown", { key: "ArrowUp" }));
  expect(activeElement()).toBe(itemAt(document, "system"));
  itemAt(document, "system").dispatchEvent(event("keydown", { key: "Home" }));
  expect(activeElement()).toBe(itemAt(document, "light"));
  itemAt(document, "light").dispatchEvent(event("keydown", { key: "End" }));
  expect(activeElement()).toBe(itemAt(document, "system"));
  itemAt(document, "system").dispatchEvent(event("keydown", { key: "d" }));
  expect(activeElement()).toBe(itemAt(document, "dark"));
  itemAt(document, "dark").dispatchEvent(event("keydown", { key: "Enter" }));
  expect(installation.preference()).toBe("dark");
  expect(activeElement()).toBe(trigger);
  expect(popoverAt(document).hidden).toBe(true);

  trigger.dispatchEvent(event("keydown", { key: "ArrowUp" }));
  expect(activeElement()).toBe(itemAt(document, "system"));
  itemAt(document, "system").dispatchEvent(event("keydown", { key: "Escape" }));
  expect(activeElement()).toBe(trigger);
  expect(popoverAt(document).hidden).toBe(true);

  trigger.dispatchEvent(event("keydown", { key: "ArrowDown" }));
  const first = itemAt(document, "light");
  first.dispatchEvent(event("keydown", { key: "Tab" }));
  expect(activeElement()).toBe(first);
  expect(popoverAt(document).hidden).toBe(true);
  installation.dispose();
});

test("outside pointer and focus movement dismiss without returning focus", async () => {
  const { activeElement, document, event } = fixture();
  const installation = installAppearanceMenus({
    darkThemeColor: "#111111",
    document,
    lightThemeColor: "#fafafa",
    storage: null,
  });
  const trigger = triggerAt(document);
  const outside = document.querySelector<HTMLElement>("#outside");
  if (outside === null) throw new Error("Missing outside control.");

  trigger.click();
  outside.dispatchEvent(event("pointerdown"));
  expect(popoverAt(document).hidden).toBe(true);
  outside.focus();
  expect(popoverAt(document).hidden).toBe(true);
  expect(activeElement()).toBe(outside);

  trigger.click();
  outside.focus();
  await Promise.resolve();
  expect(popoverAt(document).hidden).toBe(true);
  expect(activeElement()).toBe(outside);
  installation.dispose();
});

test("system and cross-tab changes update resolved chrome without overwriting preference", () => {
  const { document, event, media, view } = fixture(1, false);
  const storage = new MemoryStorage();
  const installation = installAppearanceMenus({
    darkThemeColor: "#111111",
    document,
    lightThemeColor: "#fafafa",
    storage,
    storageKey: "appearance",
  });

  expect(activeThemeColor(document).content).toBe("#fafafa");
  expect(document.documentElement.dataset.theme).toBe("light");
  media.setMatches(true, event("change"));
  expect(installation.preference()).toBe("system");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(activeThemeColor(document).content).toBe("#111111");

  view.dispatchEvent(event("storage", { key: "appearance", newValue: "light" }));
  expect(installation.preference()).toBe("light");
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(activeThemeColor(document).content).toBe("#fafafa");
  media.setMatches(false, event("change"));
  media.setMatches(true, event("change"));
  expect(activeThemeColor(document).content).toBe("#fafafa");

  view.dispatchEvent(event("storage", { key: "appearance", newValue: "sepia" }));
  expect(installation.preference()).toBe("system");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(storage.writes.at(-1)).toEqual(["appearance", "system"]);
  expect(activeThemeColor(document).content).toBe("#111111");

  view.dispatchEvent(event("storage", { key: "appearance", newValue: null }));
  expect(installation.preference()).toBe("system");
  expect(activeThemeColor(document).content).toBe("#111111");
  installation.dispose();
});

test("a document rejects simultaneous installers and allows a clean reinstall", () => {
  const { document } = fixture();
  const first = installAppearanceMenus({
    darkThemeColor: "#111111",
    document,
    lightThemeColor: "#fafafa",
    storage: null,
  });
  expect(() => installAppearanceMenus({
    darkThemeColor: "#222222",
    document,
    lightThemeColor: "#eeeeee",
    storage: null,
  })).toThrow("already installed");
  first.dispose();

  const second = installAppearanceMenus({
    darkThemeColor: "#222222",
    document,
    lightThemeColor: "#eeeeee",
    storage: null,
  });
  expect(activeThemeColor(document).content).toBe("#eeeeee");
  second.dispose();
});

test("invalid markup releases meta ownership and does not poison reinstallation", () => {
  const { document } = fixture();
  const menu = document.querySelector<HTMLElement>(
    ".hraness-design-theme-toggle__menu",
  );
  if (menu === null) throw new Error("Missing appearance menu.");
  menu.setAttribute("role", "listbox");

  expect(() => installAppearanceMenus({
    darkThemeColor: "#111111",
    document,
    lightThemeColor: "#fafafa",
    storage: null,
  })).toThrow("ownership is invalid");
  expect(document.head.querySelector(`[${themeColorSyncActiveAttribute}]`)).toBeNull();
  expect(
    document.head.querySelectorAll(`[${themeColorSyncDisabledAttribute}]`),
  ).toHaveLength(0);

  menu.setAttribute("role", "menu");
  const installation = installAppearanceMenus({
    darkThemeColor: "#111111",
    document,
    lightThemeColor: "#fafafa",
    storage: null,
  });
  expect(rootAt(document).dataset.ready).toBe("true");
  installation.dispose();
});
