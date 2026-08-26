// src/appearance.ts
var designThemes = ["light", "dark", "system"];
var defaultDesignTheme = "system";
var designThemeStorageKey = "hraness-design-theme-v1";
function isDesignTheme(value) {
  return typeof value === "string" && designThemes.some((theme) => theme === value);
}
function normalizeDesignTheme(value) {
  return isDesignTheme(value) ? value : defaultDesignTheme;
}
function designThemeLabel(theme, labels) {
  return labels?.[theme] ?? `${theme.charAt(0).toUpperCase()}${theme.slice(1)}`;
}
function resolveDesignTheme(theme, systemPrefersDark) {
  return theme === "system" ? systemPrefersDark ? "dark" : "light" : theme;
}

// src/browser/appearance-menu.ts
import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon
} from "@hugeicons/core-free-icons";

// src/browser/theme-color-sync.ts
var themeColorSyncActiveAttribute = "data-hraness-design-theme-color-sync-active";
var themeColorSyncDisabledAttribute = "data-hraness-design-theme-color-sync-disabled";
var managersByDocument = new WeakMap;
var ownerSequence = 0;
function exactThemeColorMetas(manager) {
  return Array.from(manager.document.head.querySelectorAll("meta[name]")).filter((meta) => meta.name === manager.metaName);
}
function currentRegisteredColor(manager) {
  let color;
  for (const registeredColor of manager.registrations.values())
    color = registeredColor;
  if (color === undefined)
    throw new Error("Theme color synchronization has no active owner.");
  return color;
}
function restoreDisabledMeta(meta, original) {
  if (original.media === null)
    meta.removeAttribute("media");
  else
    meta.setAttribute("media", original.media);
  meta.removeAttribute(themeColorSyncDisabledAttribute);
}
function createActiveMeta(manager) {
  const meta = manager.document.createElement("meta");
  meta.name = manager.metaName;
  meta.content = currentRegisteredColor(manager);
  meta.setAttribute(themeColorSyncActiveAttribute, manager.owner);
  manager.activeMetas.add(meta);
  const first = exactThemeColorMetas(manager).find((candidate) => candidate.parentElement === manager.document.head);
  manager.document.head.insertBefore(meta, first ?? null);
  return meta;
}
function activeMetaIsOwned(manager) {
  const active = manager.activeMeta;
  return active !== null && active.parentElement === manager.document.head && active.name === manager.metaName && !active.hasAttribute("media") && active.getAttribute(themeColorSyncActiveAttribute) === manager.owner;
}
function disableCompetingMeta(manager, meta) {
  if (manager.disabledMetas.has(meta)) {
    if (meta.getAttribute(themeColorSyncDisabledAttribute) !== manager.owner) {
      meta.setAttribute(themeColorSyncDisabledAttribute, manager.owner);
    }
    if (meta.getAttribute("media") !== "not all")
      meta.setAttribute("media", "not all");
    return;
  }
  const ownedBy = meta.getAttribute(themeColorSyncDisabledAttribute);
  if (ownedBy !== null || meta.getAttribute("media")?.trim().toLowerCase() === "not all") {
    return;
  }
  manager.disabledMetas.set(meta, { media: meta.getAttribute("media") });
  meta.setAttribute(themeColorSyncDisabledAttribute, manager.owner);
  meta.setAttribute("media", "not all");
}
function reconcileThemeColorMetas(manager) {
  if (manager.registrations.size === 0)
    return;
  for (const [meta, original] of manager.disabledMetas) {
    if (!manager.document.head.contains(meta) || meta.name !== manager.metaName) {
      restoreDisabledMeta(meta, original);
      manager.disabledMetas.delete(meta);
    }
  }
  if (!activeMetaIsOwned(manager))
    manager.activeMeta = createActiveMeta(manager);
  const active = manager.activeMeta;
  if (active === null)
    return;
  const metas = exactThemeColorMetas(manager);
  const first = metas.find((meta) => meta.parentElement === manager.document.head);
  if (first !== undefined && first !== active)
    manager.document.head.insertBefore(active, first);
  const color = currentRegisteredColor(manager);
  if (active.content !== color)
    active.content = color;
  for (const meta of metas) {
    if (meta !== active)
      disableCompetingMeta(manager, meta);
  }
}
function observeThemeColorMetas(manager) {
  const Observer = manager.document.defaultView?.MutationObserver;
  if (Observer === undefined)
    return;
  manager.observer = new Observer(() => reconcileThemeColorMetas(manager));
  manager.observer.observe(manager.document.head, {
    attributeFilter: [
      "content",
      "media",
      "name",
      themeColorSyncActiveAttribute,
      themeColorSyncDisabledAttribute
    ],
    attributes: true,
    childList: true,
    subtree: true
  });
}
function destroyThemeColorManager(manager) {
  manager.observer?.disconnect();
  manager.observer = null;
  for (const meta of manager.activeMetas)
    meta.remove();
  for (const [meta, original] of manager.disabledMetas) {
    restoreDisabledMeta(meta, original);
  }
  manager.activeMetas.clear();
  manager.disabledMetas.clear();
  manager.activeMeta = null;
  const documentManagers = managersByDocument.get(manager.document);
  if (documentManagers?.get(manager.metaName) === manager) {
    documentManagers.delete(manager.metaName);
  }
}
function acquireThemeColorMeta(document, metaName, registrationId, color) {
  let documentManagers = managersByDocument.get(document);
  if (documentManagers === undefined) {
    documentManagers = new Map;
    managersByDocument.set(document, documentManagers);
  }
  let manager = documentManagers.get(metaName);
  if (manager === undefined) {
    ownerSequence += 1;
    manager = {
      activeMeta: null,
      activeMetas: new Set,
      disabledMetas: new Map,
      document,
      metaName,
      observer: null,
      owner: String(ownerSequence),
      registrations: new Map
    };
    documentManagers.set(metaName, manager);
  }
  manager.registrations.set(registrationId, color);
  reconcileThemeColorMetas(manager);
  if (manager.observer === null)
    observeThemeColorMetas(manager);
  let released = false;
  return {
    release: () => {
      if (released)
        return;
      released = true;
      manager.registrations.delete(registrationId);
      if (manager.registrations.size === 0)
        destroyThemeColorManager(manager);
      else
        reconcileThemeColorMetas(manager);
    },
    update: (nextColor) => {
      if (released || !manager.registrations.has(registrationId))
        return;
      manager.registrations.set(registrationId, nextColor);
      reconcileThemeColorMetas(manager);
    }
  };
}

// src/browser/appearance-menu.ts
var menuSelector = "[data-hraness-appearance-menu]";
var triggerSelector = ".hraness-design-theme-toggle__trigger";
var popoverSelector = ".hraness-design-theme-toggle__popover";
var menuElementSelector = ".hraness-design-theme-toggle__menu";
var itemSelector = ".hraness-design-theme-toggle__item[data-theme-value]";
var systemDarkQuery = "(prefers-color-scheme: dark)";
var svgNamespace = "http://www.w3.org/2000/svg";
var appearanceIcons = {
  dark: Moon02Icon,
  light: Sun03Icon,
  system: ComputerIcon
};
var installationByDocument = new WeakMap;
function requireNonBlank(value, name) {
  if (value.trim().length === 0)
    throw new Error(`${name} must not be blank.`);
  return value;
}
function resolveDocument(candidate) {
  const ownedDocument = candidate ?? (typeof globalThis.document === "undefined" ? undefined : globalThis.document);
  if (ownedDocument === undefined) {
    throw new Error("installAppearanceMenus requires a browser Document.");
  }
  if (ownedDocument.documentElement === null || ownedDocument.head === null) {
    throw new Error("installAppearanceMenus requires a complete HTML document.");
  }
  return ownedDocument;
}
function defaultStorage(document) {
  try {
    return document.defaultView?.localStorage ?? null;
  } catch {
    return null;
  }
}
function storedPreference(storage, storageKey) {
  if (storage === null)
    return defaultDesignTheme;
  try {
    const value = storage.getItem(storageKey);
    if (value === null || value === undefined)
      return defaultDesignTheme;
    if (isDesignTheme(value))
      return value;
    storage.setItem(storageKey, defaultDesignTheme);
  } catch {}
  return defaultDesignTheme;
}
function persistPreference(storage, storageKey, preference) {
  if (storage === null)
    return;
  try {
    storage.setItem(storageKey, preference);
  } catch {}
}
function isElement(value) {
  return value !== null && typeof value === "object" && "nodeType" in value && value.nodeType === 1;
}
function attributeName(name) {
  return name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}
function appearanceIcon(document, theme) {
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
      if (name !== "key")
        child.setAttribute(attributeName(name), String(value));
    }
    child.setAttribute("stroke", "currentColor");
    child.setAttribute("stroke-width", "1.5");
    svg.append(child);
  }
  return svg;
}
function renderIconHost(document, host, theme) {
  host.classList.add("hraness-appearance-icon");
  host.setAttribute("aria-hidden", "true");
  host.setAttribute("data-appearance-icon", theme);
  host.setAttribute("data-slot", "appearance-icon");
  host.replaceChildren(appearanceIcon(document, theme));
}
function themeValue(element) {
  const value = element.getAttribute("data-theme-value");
  return isDesignTheme(value) ? value : null;
}
function requireMenuElements(root) {
  const triggers = root.querySelectorAll(triggerSelector);
  const popovers = root.querySelectorAll(popoverSelector);
  const menus = root.querySelectorAll(menuElementSelector);
  const trigger = triggers[0];
  const popover = popovers[0];
  const menu = menus[0];
  if (triggers.length !== 1 || popovers.length !== 1 || menus.length !== 1 || trigger?.tagName !== "BUTTON" || popover === undefined || menu === undefined) {
    throw new Error("Appearance menu markup requires one button trigger, popover, and menu.");
  }
  if (menu.id.trim().length === 0 || trigger.getAttribute("aria-controls") !== menu.id || menu.getAttribute("role") !== "menu") {
    throw new Error("Appearance menu trigger and menu ownership is invalid.");
  }
  const items = new Map;
  for (const element of menu.querySelectorAll(itemSelector)) {
    const theme = themeValue(element);
    if (theme === null || items.has(theme) || element.getAttribute("role") !== "menuitemradio") {
      throw new Error("Appearance menu items must be unique Light, Dark, and System radios.");
    }
    items.set(theme, element);
  }
  if (items.size !== designThemes.length || designThemes.some((theme) => !items.has(theme))) {
    throw new Error("Appearance menu must contain Light, Dark, and System exactly once.");
  }
  return {
    items,
    menu,
    popover,
    root,
    trigger,
    typeahead: "",
    typeaheadTimer: null
  };
}
function menuItemFromEvent(elements, event) {
  if (!isElement(event.target))
    return null;
  const item = event.target.closest(itemSelector);
  return item !== null && elements.menu.contains(item) ? item : null;
}
function focusItem(elements, theme) {
  elements.items.get(theme)?.focus();
}
function orderedItems(elements) {
  return designThemes.flatMap((theme) => {
    const item = elements.items.get(theme);
    return item === undefined ? [] : [item];
  });
}
function adjacentItem(elements, current, offset) {
  const items = orderedItems(elements);
  if (items.length === 0)
    throw new Error("Appearance menu has no focusable items.");
  const currentIndex = current === null ? -1 : items.indexOf(current);
  const nextIndex = currentIndex < 0 ? offset === 1 ? 0 : items.length - 1 : (currentIndex + offset + items.length) % items.length;
  const next = items[nextIndex];
  if (next === undefined)
    throw new Error("Appearance menu focus order is invalid.");
  return next;
}
function storageEventValue(event, storageKey) {
  const candidate = event;
  return candidate.key === storageKey ? candidate.newValue : undefined;
}
function installAppearanceMenus(options) {
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
  const systemMedia = typeof view?.matchMedia === "function" ? view.matchMedia(systemDarkQuery) : null;
  let preference = storedPreference(storage, storageKey);
  let disposed = false;
  let mounted = false;
  let openMenu = null;
  let metaRegistration = null;
  const menus = new Set;
  const menuIds = new Set;
  const cleanups = [];
  const resolvedTheme = () => resolveDesignTheme(preference, systemMedia?.matches ?? false);
  const currentThemeColor = () => resolvedTheme() === "dark" ? darkThemeColor : lightThemeColor;
  const closeMenu = (elements, returnFocus) => {
    elements.popover.hidden = true;
    elements.root.removeAttribute("data-open");
    elements.trigger.setAttribute("aria-expanded", "false");
    if (openMenu === elements)
      openMenu = null;
    if (returnFocus)
      elements.trigger.focus();
  };
  const syncMenu = (elements) => {
    elements.root.setAttribute("data-theme-value", preference);
    const currentLabel = designThemeLabel(preference);
    const menuLabel = elements.menu.getAttribute("aria-label")?.trim() || "Appearance";
    elements.trigger.setAttribute("aria-label", `${menuLabel}: ${currentLabel}`);
    elements.trigger.setAttribute("title", `${menuLabel}: ${currentLabel}`);
    const currentHost = elements.trigger.querySelector("[data-current-appearance-icon]");
    if (currentHost === null) {
      throw new Error("Appearance menu trigger is missing its current icon host.");
    }
    currentHost.setAttribute("data-current-appearance-icon", preference);
    renderIconHost(document, currentHost, preference);
    for (const theme of designThemes) {
      const item = elements.items.get(theme);
      if (item === undefined)
        continue;
      const selected = theme === preference;
      item.setAttribute("aria-checked", String(selected));
      item.setAttribute("tabindex", "-1");
      item.toggleAttribute("data-selected", selected);
      const iconHost = item.querySelector("[data-appearance-icon]");
      if (iconHost === null) {
        throw new Error(`Appearance menu ${theme} item is missing its icon host.`);
      }
      renderIconHost(document, iconHost, theme);
    }
  };
  const syncAppearance = () => {
    document.documentElement.setAttribute("data-theme", resolvedTheme());
    metaRegistration?.update(currentThemeColor());
    for (const menu of menus)
      syncMenu(menu);
  };
  const setPreference = (nextPreference, persist) => {
    preference = nextPreference;
    if (persist)
      persistPreference(storage, storageKey, preference);
    syncAppearance();
  };
  const focusForOpen = (elements, target) => {
    if (target === "selected")
      focusItem(elements, preference);
    else {
      const items = orderedItems(elements);
      const item = target === "first" ? items[0] : items.at(-1);
      item?.focus();
    }
  };
  const showMenu = (elements, focus) => {
    if (openMenu !== null && openMenu !== elements)
      closeMenu(openMenu, false);
    openMenu = elements;
    elements.popover.hidden = false;
    elements.root.setAttribute("data-open", "true");
    elements.trigger.setAttribute("aria-expanded", "true");
    focusForOpen(elements, focus);
  };
  const selectItem = (elements, item) => {
    const theme = themeValue(item);
    if (theme === null)
      return;
    setPreference(theme, true);
    closeMenu(elements, true);
  };
  const clearTypeahead = (elements) => {
    elements.typeahead = "";
    if (elements.typeaheadTimer !== null)
      clearTimeout(elements.typeaheadTimer);
    elements.typeaheadTimer = null;
  };
  const typeahead = (elements, key) => {
    if (elements.typeaheadTimer !== null)
      clearTimeout(elements.typeaheadTimer);
    elements.typeahead += key.toLocaleLowerCase();
    const find = (query) => orderedItems(elements).find((item) => (item.textContent ?? "").trim().toLocaleLowerCase().startsWith(query));
    const match = find(elements.typeahead) ?? find(key.toLocaleLowerCase());
    match?.focus();
    elements.typeaheadTimer = setTimeout(() => clearTypeahead(elements), 500);
  };
  const mount = () => {
    if (disposed || mounted)
      return;
    mounted = true;
    for (const root of document.querySelectorAll(menuSelector)) {
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
      const onTriggerClick = () => {
        if (openMenu === elements)
          closeMenu(elements, false);
        else
          showMenu(elements, "selected");
      };
      const onTriggerKeyDown = (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          showMenu(elements, event.key === "ArrowDown" ? "first" : "last");
        } else if (event.key === "Escape" && openMenu === elements) {
          event.preventDefault();
          closeMenu(elements, true);
        }
      };
      const onMenuClick = (event) => {
        const item = menuItemFromEvent(elements, event);
        if (item !== null)
          selectItem(elements, item);
      };
      const onMenuKeyDown = (event) => {
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
        if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
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
  const state = {
    disposed: false,
    publicInstallation: {
      dispose: () => {
        if (disposed)
          return;
        disposed = true;
        state.disposed = true;
        for (const cleanup of cleanups.splice(0).reverse())
          cleanup();
        metaRegistration?.release();
        metaRegistration = null;
        menus.clear();
        if (installationByDocument.get(document) === state) {
          installationByDocument.delete(document);
        }
      },
      preference: () => preference
    }
  };
  const { publicInstallation } = state;
  installationByDocument.set(document, state);
  try {
    metaRegistration = acquireThemeColorMeta(document, metaName, Symbol("hraness-static-appearance"), currentThemeColor());
    document.documentElement.setAttribute("data-theme", resolvedTheme());
    const onSystemChange = () => {
      if (preference === "system")
        syncAppearance();
    };
    systemMedia?.addEventListener("change", onSystemChange);
    if (systemMedia !== null) {
      cleanups.push(() => systemMedia.removeEventListener("change", onSystemChange));
    }
    const onStorage = (event) => {
      const value = storageEventValue(event, storageKey);
      if (value === undefined)
        return;
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
    const closeForOutsideTarget = (target) => {
      if (openMenu !== null && (!isElement(target) || !openMenu.root.contains(target))) {
        closeMenu(openMenu, false);
      }
    };
    const onDocumentPointerDown = (event) => {
      closeForOutsideTarget(event.target);
    };
    const onDocumentFocusIn = (event) => {
      closeForOutsideTarget(event.target);
    };
    document.addEventListener("pointerdown", onDocumentPointerDown, true);
    document.addEventListener("focusin", onDocumentFocusIn);
    cleanups.push(() => {
      document.removeEventListener("pointerdown", onDocumentPointerDown, true);
      document.removeEventListener("focusin", onDocumentFocusIn);
    });
    if (document.readyState === "loading") {
      const mountAfterParse = () => {
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

// src/browser/artifact-share.ts
function nonblank(value, label) {
  if (value.trim().length === 0) {
    throw new RangeError(`${label} must contain a non-whitespace character.`);
  }
  return value;
}
function publicWebUrl(value) {
  const normalized = nonblank(value, "An artifact share URL").trim();
  let url;
  try {
    url = new URL(normalized);
  } catch {
    throw new RangeError("An artifact share URL must be an absolute URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new RangeError("An artifact share URL must use HTTP or HTTPS.");
  }
  return url.href;
}
function normalizedIntent(input) {
  return {
    text: nonblank(input.text, "Artifact share text"),
    url: publicWebUrl(input.url)
  };
}
function buildXShareIntentUrl(input) {
  const { text, url } = normalizedIntent(input);
  const intent = new URL("https://x.com/intent/post");
  intent.searchParams.set("text", text);
  intent.searchParams.set("url", url);
  return intent.href;
}
function buildLinkedInShareIntentUrl(url) {
  const intent = new URL("https://www.linkedin.com/sharing/share-offsite/");
  intent.searchParams.set("url", publicWebUrl(url));
  return intent.href;
}
function buildBlueskyShareIntentUrl(input) {
  const { text, url } = normalizedIntent(input);
  const intent = new URL("https://bsky.app/intent/compose");
  intent.searchParams.set("text", `${text}
${url}`);
  return intent.href;
}
async function copyTextToClipboard(text) {
  const clipboard = globalThis.navigator?.clipboard;
  if (clipboard === undefined || typeof clipboard.writeText !== "function") {
    throw new Error("Clipboard text writing is unavailable in this environment.");
  }
  await clipboard.writeText(text);
}
function downloadBlob(blob, filename) {
  const normalizedFilename = nonblank(filename, "A download filename").trim();
  const document = globalThis.document;
  if (document === undefined || typeof URL.createObjectURL !== "function" || typeof URL.revokeObjectURL !== "function") {
    throw new Error("Blob downloads are unavailable in this environment.");
  }
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = normalizedFilename;
  anchor.hidden = true;
  anchor.href = objectUrl;
  anchor.rel = "noopener";
  document.body.append(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
}
function isAbortError(error) {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}
function filesOnlyShareData(file) {
  return { files: [file] };
}
function nativeFileShareNavigator() {
  const shareNavigator = globalThis.navigator;
  if (shareNavigator === undefined || typeof shareNavigator.canShare !== "function" || typeof shareNavigator.share !== "function") {
    return;
  }
  return shareNavigator;
}
function canShareFileWithNavigator(shareNavigator, file) {
  try {
    return shareNavigator.canShare(filesOnlyShareData(file));
  } catch {
    return false;
  }
}
function canShareFileNatively(file) {
  const shareNavigator = nativeFileShareNavigator();
  return shareNavigator !== undefined && canShareFileWithNavigator(shareNavigator, file);
}
async function shareFileNatively(file) {
  const shareNavigator = nativeFileShareNavigator();
  if (shareNavigator === undefined || !canShareFileWithNavigator(shareNavigator, file)) {
    return { kind: "unavailable" };
  }
  try {
    await shareNavigator.share(filesOnlyShareData(file));
    return { kind: "shared" };
  } catch (error) {
    if (isAbortError(error))
      return { kind: "cancelled" };
    return { error, kind: "failed" };
  }
}

// src/browser/index.ts
var defaultDesignTheme2 = defaultDesignTheme;
var designThemeLabel2 = designThemeLabel;
var designThemes2 = designThemes;
var designThemeStorageKey2 = designThemeStorageKey;
var installAppearanceMenus2 = installAppearanceMenus;
var isDesignTheme2 = isDesignTheme;
var normalizeDesignTheme2 = normalizeDesignTheme;
var resolveDesignTheme2 = resolveDesignTheme;
export {
  shareFileNatively,
  resolveDesignTheme2 as resolveDesignTheme,
  normalizeDesignTheme2 as normalizeDesignTheme,
  isDesignTheme2 as isDesignTheme,
  installAppearanceMenus2 as installAppearanceMenus,
  downloadBlob,
  designThemes2 as designThemes,
  designThemeStorageKey2 as designThemeStorageKey,
  designThemeLabel2 as designThemeLabel,
  defaultDesignTheme2 as defaultDesignTheme,
  copyTextToClipboard,
  canShareFileNatively,
  buildXShareIntentUrl,
  buildLinkedInShareIntentUrl,
  buildBlueskyShareIntentUrl
};
