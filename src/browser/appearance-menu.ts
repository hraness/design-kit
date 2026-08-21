import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";

import {
  defaultDesignTheme,
  designThemeStorageKey,
  designThemeLabel,
  designThemes,
  type DesignTheme,
  isDesignTheme,
  resolveDesignTheme,
} from "../appearance.js";
import {
  acquireThemeColorMeta,
  type ThemeColorMetaRegistration,
} from "./theme-color-sync.js";

const menuSelector = "[data-hraness-appearance-menu]";
const triggerSelector = ".hraness-design-theme-toggle__trigger";
const popoverSelector = ".hraness-design-theme-toggle__popover";
const menuElementSelector = ".hraness-design-theme-toggle__menu";
const itemSelector = ".hraness-design-theme-toggle__item[data-theme-value]";
const systemDarkQuery = "(prefers-color-scheme: dark)";
const svgNamespace = "http://www.w3.org/2000/svg";

type IconSvgElement = readonly (
  readonly [string, Readonly<Record<string, string | number>>]
)[];

const appearanceIcons: Readonly<Record<DesignTheme, IconSvgElement>> = {
  dark: Moon02Icon,
  light: Sun03Icon,
  system: ComputerIcon,
};

export interface AppearanceStorage {
  readonly getItem: (key: string) => unknown;
  readonly setItem: (key: string, value: string) => void;
}

export interface AppearanceMenuOptions {
  readonly darkThemeColor: string;
  readonly document?: Document;
  readonly lightThemeColor: string;
  readonly metaName?: string;
  readonly storage?: AppearanceStorage | null;
  readonly storageKey?: string;
}

export interface AppearanceMenuInstallation {
  readonly dispose: () => void;
  readonly preference: () => DesignTheme;
}

interface AppearanceMenuElements {
  readonly items: ReadonlyMap<DesignTheme, HTMLElement>;
  readonly menu: HTMLElement;
  readonly popover: HTMLElement;
  readonly root: HTMLElement;
  readonly trigger: HTMLButtonElement;
  typeahead: string;
  typeaheadTimer: ReturnType<typeof setTimeout> | null;
}

interface InstallationState {
  disposed: boolean;
  readonly publicInstallation: AppearanceMenuInstallation;
}

const installationByDocument = new WeakMap<Document, InstallationState>();

function requireNonBlank(value: string, name: string): string {
  if (value.trim().length === 0) throw new Error(`${name} must not be blank.`);
  return value;
}

function resolveDocument(candidate: Document | undefined): Document {
  const ownedDocument = candidate
    ?? (typeof globalThis.document === "undefined" ? undefined : globalThis.document);
  if (ownedDocument === undefined) {
    throw new Error("installAppearanceMenus requires a browser Document.");
  }
  if (ownedDocument.documentElement === null || ownedDocument.head === null) {
    throw new Error("installAppearanceMenus requires a complete HTML document.");
  }
  return ownedDocument;
}

function defaultStorage(document: Document): AppearanceStorage | null {
  try {
    return document.defaultView?.localStorage ?? null;
  } catch {
    return null;
  }
}

function storedPreference(storage: AppearanceStorage | null, storageKey: string): DesignTheme {
  if (storage === null) return defaultDesignTheme;
  try {
    const value = storage.getItem(storageKey);
    if (value === null || value === undefined) return defaultDesignTheme;
    if (isDesignTheme(value)) return value;
    storage.setItem(storageKey, defaultDesignTheme);
  } catch {
    // Appearance persistence is optional in privacy-restricted browsers.
  }
  return defaultDesignTheme;
}

function persistPreference(
  storage: AppearanceStorage | null,
  storageKey: string,
  preference: DesignTheme,
): void {
  if (storage === null) return;
  try {
    storage.setItem(storageKey, preference);
  } catch {
    // The current page still changes when persistence is unavailable.
  }
}

function isElement(value: EventTarget | null): value is Element {
  return value !== null
    && typeof value === "object"
    && "nodeType" in value
    && (value as Node).nodeType === 1;
}

function attributeName(name: string): string {
  return name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}

function appearanceIcon(document: Document, theme: DesignTheme): SVGSVGElement {
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "hraness-icon");
  svg.setAttribute("color", "currentColor");
  svg.setAttribute("data-slot", "icon");
  svg.setAttribute("fill", "none");
  svg.setAttribute("height", "18");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "18");

  for (const [tag, attributes] of appearanceIcons[theme]) {
    const child = document.createElementNS(svgNamespace, tag);
    for (const [name, value] of Object.entries(attributes)) {
      if (name !== "key") child.setAttribute(attributeName(name), String(value));
    }
    child.setAttribute("stroke", "currentColor");
    child.setAttribute("stroke-width", "1.5");
    svg.append(child);
  }
  return svg;
}

function renderIconHost(
  document: Document,
  host: HTMLElement,
  theme: DesignTheme,
): void {
  host.classList.add("hraness-appearance-icon");
  host.setAttribute("aria-hidden", "true");
  host.setAttribute("data-appearance-icon", theme);
  host.setAttribute("data-slot", "appearance-icon");
  host.replaceChildren(appearanceIcon(document, theme));
}

function themeValue(element: Element): DesignTheme | null {
  const value = element.getAttribute("data-theme-value");
  return isDesignTheme(value) ? value : null;
}

function requireMenuElements(root: HTMLElement): AppearanceMenuElements {
  const triggers = root.querySelectorAll<HTMLButtonElement>(triggerSelector);
  const popovers = root.querySelectorAll<HTMLElement>(popoverSelector);
  const menus = root.querySelectorAll<HTMLElement>(menuElementSelector);
  const trigger = triggers[0];
  const popover = popovers[0];
  const menu = menus[0];
  if (
    triggers.length !== 1
    || popovers.length !== 1
    || menus.length !== 1
    || trigger?.tagName !== "BUTTON"
    || popover === undefined
    || menu === undefined
  ) {
    throw new Error(
      "Appearance menu markup requires one button trigger, popover, and menu.",
    );
  }
  if (
    menu.id.trim().length === 0
    || trigger.getAttribute("aria-controls") !== menu.id
    || menu.getAttribute("role") !== "menu"
  ) {
    throw new Error("Appearance menu trigger and menu ownership is invalid.");
  }

  const items = new Map<DesignTheme, HTMLElement>();
  for (const element of menu.querySelectorAll<HTMLElement>(itemSelector)) {
    const theme = themeValue(element);
    if (
      theme === null
      || items.has(theme)
      || element.getAttribute("role") !== "menuitemradio"
    ) {
      throw new Error("Appearance menu items must be unique Light, Dark, and System radios.");
    }
    items.set(theme, element);
  }
  if (
    items.size !== designThemes.length
    || designThemes.some((theme) => !items.has(theme))
  ) {
    throw new Error("Appearance menu must contain Light, Dark, and System exactly once.");
  }

  return {
    items,
    menu,
    popover,
    root,
    trigger,
    typeahead: "",
    typeaheadTimer: null,
  };
}

function menuItemFromEvent(
  elements: AppearanceMenuElements,
  event: Event,
): HTMLElement | null {
  if (!isElement(event.target)) return null;
  const item = event.target.closest<HTMLElement>(itemSelector);
  return item !== null && elements.menu.contains(item) ? item : null;
}

function focusItem(elements: AppearanceMenuElements, theme: DesignTheme): void {
  elements.items.get(theme)?.focus();
}

function orderedItems(elements: AppearanceMenuElements): readonly HTMLElement[] {
  return designThemes.flatMap((theme) => {
    const item = elements.items.get(theme);
    return item === undefined ? [] : [item];
  });
}

function adjacentItem(
  elements: AppearanceMenuElements,
  current: HTMLElement | null,
  offset: -1 | 1,
): HTMLElement {
  const items = orderedItems(elements);
  if (items.length === 0) throw new Error("Appearance menu has no focusable items.");
  const currentIndex = current === null ? -1 : items.indexOf(current);
  const nextIndex = currentIndex < 0
    ? (offset === 1 ? 0 : items.length - 1)
    : (currentIndex + offset + items.length) % items.length;
  const next = items[nextIndex];
  if (next === undefined) throw new Error("Appearance menu focus order is invalid.");
  return next;
}

function storageEventValue(event: Event, storageKey: string): unknown {
  const candidate = event as Event & Readonly<{ key?: unknown; newValue?: unknown }>;
  return candidate.key === storageKey ? candidate.newValue : undefined;
}

/**
 * Installs the standards-only Light/Dark/System controller for static pages.
 * Each `[data-hraness-appearance-menu]` root owns one button trigger, one
 * popover, and one `role="menu"` with unique Light/Dark/System radio items.
 * The call applies the stored preference synchronously; menu enhancement waits
 * for parsed markup when the installer runs from a blocking head script.
 */
export function installAppearanceMenus(
  options: AppearanceMenuOptions,
): AppearanceMenuInstallation {
  const document = resolveDocument(options.document);
  const active = installationByDocument.get(document);
  if (active !== undefined && !active.disposed) {
    throw new Error("Appearance menus are already installed for this document.");
  }

  const darkThemeColor = requireNonBlank(options.darkThemeColor, "darkThemeColor");
  const lightThemeColor = requireNonBlank(options.lightThemeColor, "lightThemeColor");
  const metaName = requireNonBlank(options.metaName ?? "theme-color", "metaName");
  const storageKey = requireNonBlank(options.storageKey ?? designThemeStorageKey, "storageKey");
  const storage = options.storage === undefined ? defaultStorage(document) : options.storage;
  const view = document.defaultView;
  const systemMedia = typeof view?.matchMedia === "function"
    ? view.matchMedia(systemDarkQuery)
    : null;
  let preference = storedPreference(storage, storageKey);
  let disposed = false;
  let mounted = false;
  let openMenu: AppearanceMenuElements | null = null;
  let metaRegistration: ThemeColorMetaRegistration | null = null;
  const menus = new Set<AppearanceMenuElements>();
  const menuIds = new Set<string>();
  const cleanups: Array<() => void> = [];

  const resolvedTheme = () => resolveDesignTheme(preference, systemMedia?.matches ?? false);
  const currentThemeColor = () => resolvedTheme() === "dark"
    ? darkThemeColor
    : lightThemeColor;

  const closeMenu = (
    elements: AppearanceMenuElements,
    returnFocus: boolean,
  ): void => {
    elements.popover.hidden = true;
    elements.root.removeAttribute("data-open");
    elements.trigger.setAttribute("aria-expanded", "false");
    if (openMenu === elements) openMenu = null;
    if (returnFocus) elements.trigger.focus();
  };

  const syncMenu = (elements: AppearanceMenuElements): void => {
    elements.root.setAttribute("data-theme-value", preference);
    const currentLabel = designThemeLabel(preference);
    const menuLabel = elements.menu.getAttribute("aria-label")?.trim() || "Appearance";
    elements.trigger.setAttribute("aria-label", `${menuLabel}: ${currentLabel}`);
    elements.trigger.setAttribute("title", `${menuLabel}: ${currentLabel}`);
    const currentHost = elements.trigger.querySelector<HTMLElement>(
      "[data-current-appearance-icon]",
    );
    if (currentHost === null) {
      throw new Error("Appearance menu trigger is missing its current icon host.");
    }
    currentHost.setAttribute("data-current-appearance-icon", preference);
    renderIconHost(document, currentHost, preference);

    for (const theme of designThemes) {
      const item = elements.items.get(theme);
      if (item === undefined) continue;
      const selected = theme === preference;
      item.setAttribute("aria-checked", String(selected));
      item.setAttribute("tabindex", "-1");
      item.toggleAttribute("data-selected", selected);
      const iconHost = item.querySelector<HTMLElement>("[data-appearance-icon]");
      if (iconHost === null) {
        throw new Error(`Appearance menu ${theme} item is missing its icon host.`);
      }
      renderIconHost(document, iconHost, theme);
    }
  };

  const syncAppearance = (): void => {
    document.documentElement.setAttribute("data-theme", resolvedTheme());
    metaRegistration?.update(currentThemeColor());
    for (const menu of menus) syncMenu(menu);
  };

  const setPreference = (nextPreference: DesignTheme, persist: boolean): void => {
    preference = nextPreference;
    if (persist) persistPreference(storage, storageKey, preference);
    syncAppearance();
  };

  const focusForOpen = (
    elements: AppearanceMenuElements,
    target: "first" | "last" | "selected",
  ): void => {
    if (target === "selected") focusItem(elements, preference);
    else {
      const items = orderedItems(elements);
      const item = target === "first" ? items[0] : items.at(-1);
      item?.focus();
    }
  };

  const showMenu = (
    elements: AppearanceMenuElements,
    focus: "first" | "last" | "selected",
  ): void => {
    if (openMenu !== null && openMenu !== elements) closeMenu(openMenu, false);
    openMenu = elements;
    elements.popover.hidden = false;
    elements.root.setAttribute("data-open", "true");
    elements.trigger.setAttribute("aria-expanded", "true");
    focusForOpen(elements, focus);
  };

  const selectItem = (elements: AppearanceMenuElements, item: HTMLElement): void => {
    const theme = themeValue(item);
    if (theme === null) return;
    setPreference(theme, true);
    closeMenu(elements, true);
  };

  const clearTypeahead = (elements: AppearanceMenuElements): void => {
    elements.typeahead = "";
    if (elements.typeaheadTimer !== null) clearTimeout(elements.typeaheadTimer);
    elements.typeaheadTimer = null;
  };

  const typeahead = (
    elements: AppearanceMenuElements,
    key: string,
  ): void => {
    if (elements.typeaheadTimer !== null) clearTimeout(elements.typeaheadTimer);
    elements.typeahead += key.toLocaleLowerCase();
    const find = (query: string) => orderedItems(elements).find((item) =>
      (item.textContent ?? "").trim().toLocaleLowerCase().startsWith(query));
    const match = find(elements.typeahead) ?? find(key.toLocaleLowerCase());
    match?.focus();
    elements.typeaheadTimer = setTimeout(() => clearTypeahead(elements), 500);
  };

  const mount = (): void => {
    if (disposed || mounted) return;
    mounted = true;
    for (const root of document.querySelectorAll<HTMLElement>(menuSelector)) {
      const elements = requireMenuElements(root);
      if (menuIds.has(elements.menu.id)) {
        throw new Error("Appearance menu ids must be unique within the document.");
      }
      menuIds.add(elements.menu.id);
      menus.add(elements);
      syncMenu(elements);
      root.setAttribute("data-display", "icons");
      root.setAttribute("data-presentation", "menu");
      root.setAttribute("data-ready", "true");
      root.removeAttribute("aria-busy");
      elements.trigger.disabled = false;
      elements.trigger.setAttribute("aria-expanded", "false");
      elements.trigger.setAttribute("aria-haspopup", "menu");
      elements.popover.hidden = true;

      const onTriggerClick = (): void => {
        if (openMenu === elements) closeMenu(elements, false);
        else showMenu(elements, "selected");
      };
      const onTriggerKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          showMenu(elements, event.key === "ArrowDown" ? "first" : "last");
        } else if (event.key === "Escape" && openMenu === elements) {
          event.preventDefault();
          closeMenu(elements, true);
        }
      };
      const onMenuClick = (event: MouseEvent): void => {
        const item = menuItemFromEvent(elements, event);
        if (item !== null) selectItem(elements, item);
      };
      const onMenuKeyDown = (event: KeyboardEvent): void => {
        const item = menuItemFromEvent(elements, event);
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeMenu(elements, true);
          return;
        }
        if (event.key === "Tab") {
          closeMenu(elements, false);
          return;
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          adjacentItem(elements, item, event.key === "ArrowDown" ? 1 : -1).focus();
          return;
        }
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          const items = orderedItems(elements);
          (event.key === "Home" ? items[0] : items.at(-1))?.focus();
          return;
        }
        if ((event.key === "Enter" || event.key === " ") && item !== null) {
          event.preventDefault();
          selectItem(elements, item);
          return;
        }
        if (
          event.key.length === 1
          && !event.altKey
          && !event.ctrlKey
          && !event.metaKey
        ) {
          typeahead(elements, event.key);
        }
      };
      elements.trigger.addEventListener("click", onTriggerClick);
      elements.trigger.addEventListener("keydown", onTriggerKeyDown);
      elements.menu.addEventListener("click", onMenuClick);
      elements.menu.addEventListener("keydown", onMenuKeyDown);
      cleanups.push(() => {
        clearTypeahead(elements);
        elements.trigger.removeEventListener("click", onTriggerClick);
        elements.trigger.removeEventListener("keydown", onTriggerKeyDown);
        elements.menu.removeEventListener("click", onMenuClick);
        elements.menu.removeEventListener("keydown", onMenuKeyDown);
        closeMenu(elements, false);
        elements.root.setAttribute("aria-busy", "true");
        elements.root.setAttribute("data-ready", "false");
        elements.trigger.disabled = true;
      });
    }
  };

  const state: InstallationState = {
    disposed: false,
    publicInstallation: {
      dispose: () => {
        if (disposed) return;
        disposed = true;
        state.disposed = true;
        for (const cleanup of cleanups.splice(0).reverse()) cleanup();
        metaRegistration?.release();
        metaRegistration = null;
        menus.clear();
        if (installationByDocument.get(document) === state) {
          installationByDocument.delete(document);
        }
      },
      preference: () => preference,
    },
  };
  const { publicInstallation } = state;
  installationByDocument.set(document, state);

  try {
    metaRegistration = acquireThemeColorMeta(
      document,
      metaName,
      Symbol("hraness-static-appearance"),
      currentThemeColor(),
    );
    document.documentElement.setAttribute("data-theme", resolvedTheme());

    const onSystemChange = (): void => {
      if (preference === "system") syncAppearance();
    };
    systemMedia?.addEventListener("change", onSystemChange);
    if (systemMedia !== null) {
      cleanups.push(() => systemMedia.removeEventListener("change", onSystemChange));
    }

    const onStorage = (event: Event): void => {
      const value = storageEventValue(event, storageKey);
      if (value === undefined) return;
      if (isDesignTheme(value)) {
        setPreference(value, false);
        return;
      }
      setPreference(defaultDesignTheme, value !== null);
    };
    view?.addEventListener("storage", onStorage);
    if (view !== null) {
      cleanups.push(() => view.removeEventListener("storage", onStorage));
    }

    const closeForOutsideTarget = (target: EventTarget | null): void => {
      if (
        openMenu !== null
        && (!isElement(target) || !openMenu.root.contains(target))
      ) {
        closeMenu(openMenu, false);
      }
    };
    const onDocumentPointerDown = (event: Event): void => {
      closeForOutsideTarget(event.target);
    };
    const onDocumentFocusIn = (event: Event): void => {
      closeForOutsideTarget(event.target);
    };
    document.addEventListener("pointerdown", onDocumentPointerDown, true);
    document.addEventListener("focusin", onDocumentFocusIn);
    cleanups.push(() => {
      document.removeEventListener("pointerdown", onDocumentPointerDown, true);
      document.removeEventListener("focusin", onDocumentFocusIn);
    });

    if (document.readyState === "loading") {
      const mountAfterParse = (): void => {
        try {
          mount();
        } catch (error) {
          publicInstallation.dispose();
          throw error;
        }
      };
      document.addEventListener("DOMContentLoaded", mountAfterParse, { once: true });
      cleanups.push(() => document.removeEventListener("DOMContentLoaded", mountAfterParse));
    } else {
      mount();
    }
  } catch (error) {
    publicInstallation.dispose();
    throw error;
  }

  return publicInstallation;
}
