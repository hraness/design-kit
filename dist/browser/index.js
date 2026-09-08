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
import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

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
  manager.disabledMetas.set(meta, {
    media: meta.getAttribute("media")
  });
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
    attributeFilter: ["content", "media", "name", themeColorSyncActiveAttribute, themeColorSyncDisabledAttribute],
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
  const {
    publicInstallation
  } = state;
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
      document.addEventListener("DOMContentLoaded", mountAfterParse, {
        once: true
      });
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
  const {
    text,
    url
  } = normalizedIntent(input);
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
  const {
    text,
    url
  } = normalizedIntent(input);
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
  return {
    files: [file]
  };
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
    return {
      kind: "unavailable"
    };
  }
  try {
    await shareNavigator.share(filesOnlyShareData(file));
    return {
      kind: "shared"
    };
  } catch (error) {
    if (isAbortError(error))
      return {
        kind: "cancelled"
      };
    return {
      error,
      kind: "failed"
    };
  }
}
// src/palette-color.ts
function channels(hex) {
  if (!/^#[0-9a-f]{6}$/iu.test(hex))
    throw new Error("Palette colors must be six-digit hex values.");
  return [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
}
function mixPaletteColor(color, toward, amount) {
  const target = channels(toward);
  return `#${channels(color).map((value, index) => Math.round(value * (1 - amount) + (target[index] ?? 0) * amount).toString(16).padStart(2, "0")).join("")}`;
}
function luminance(hex) {
  const linearize = (channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const [red, green, blue] = channels(hex);
  return linearize(red) * 0.2126 + linearize(green) * 0.7152 + linearize(blue) * 0.0722;
}
function paletteContrast(a, b) {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
function readablePaletteColor(color, toward, backgrounds, minimum) {
  for (let step = 0;step <= 100; step += 1) {
    const candidate = mixPaletteColor(color, toward, step / 100);
    if (backgrounds.every((background) => paletteContrast(candidate, background) >= minimum))
      return candidate;
  }
  throw new Error("The authored palette cannot meet its contrast contract.");
}

// src/palettes.ts
var designPalettes = ["catppuccin", "gruvbox", "rose-pine", "tokyo-night"];
function isDesignPalette(value) {
  return typeof value === "string" && designPalettes.some((palette) => palette === value);
}
var designPaletteSources = {
  catppuccin: {
    dark: {
      background: "#1e1e2e",
      surface: "#181825",
      raised: "#313244",
      hover: "#45475a",
      text: "#cdd6f4",
      muted: "#a6adc8",
      border: "#7f849c",
      primary: "#89b4fa",
      danger: "#f38ba8",
      warning: "#f9e2af",
      success: "#a6e3a1",
      info: "#89dceb",
      violet: "#cba6f7",
      rose: "#f5c2e7"
    },
    light: {
      background: "#eff1f5",
      surface: "#e6e9ef",
      raised: "#dce0e8",
      hover: "#ccd0da",
      text: "#4c4f69",
      muted: "#6c6f85",
      border: "#7c7f93",
      primary: "#1e66f5",
      danger: "#d20f39",
      warning: "#df8e1d",
      success: "#40a02b",
      info: "#179299",
      violet: "#8839ef",
      rose: "#ea76cb"
    }
  },
  gruvbox: {
    dark: {
      background: "#282828",
      surface: "#1d2021",
      raised: "#3c3836",
      hover: "#504945",
      text: "#ebdbb2",
      muted: "#bdae93",
      border: "#928374",
      primary: "#83a598",
      danger: "#fb4934",
      warning: "#fabd2f",
      success: "#b8bb26",
      info: "#8ec07c",
      violet: "#d3869b",
      rose: "#fe8019"
    },
    light: {
      background: "#fbf1c7",
      surface: "#f9f5d7",
      raised: "#ebdbb2",
      hover: "#d5c4a1",
      text: "#3c3836",
      muted: "#665c54",
      border: "#7c6f64",
      primary: "#076678",
      danger: "#9d0006",
      warning: "#b57614",
      success: "#79740e",
      info: "#427b58",
      violet: "#8f3f71",
      rose: "#af3a03"
    }
  },
  "rose-pine": {
    dark: {
      background: "#191724",
      surface: "#1f1d2e",
      raised: "#26233a",
      hover: "#403d52",
      text: "#e0def4",
      muted: "#908caa",
      border: "#908caa",
      primary: "#c4a7e7",
      danger: "#eb6f92",
      warning: "#f6c177",
      success: "#9ccfd8",
      info: "#ebbcba",
      violet: "#c4a7e7",
      rose: "#ebbcba"
    },
    light: {
      background: "#faf4ed",
      surface: "#fffaf3",
      raised: "#f2e9e1",
      hover: "#dfdad9",
      text: "#575279",
      muted: "#797593",
      border: "#797593",
      primary: "#907aa9",
      danger: "#b4637a",
      warning: "#ea9d34",
      success: "#286983",
      info: "#56949f",
      violet: "#907aa9",
      rose: "#d7827e"
    }
  },
  "tokyo-night": {
    dark: {
      background: "#1a1b26",
      surface: "#16161e",
      raised: "#24283b",
      hover: "#292e42",
      text: "#c0caf5",
      muted: "#a9b1d6",
      border: "#737aa2",
      primary: "#7aa2f7",
      danger: "#f7768e",
      warning: "#e0af68",
      success: "#9ece6a",
      info: "#7dcfff",
      violet: "#bb9af7",
      rose: "#ff9e64"
    },
    light: {
      background: "#e1e2e7",
      surface: "#d0d5e3",
      raised: "#c4c8da",
      hover: "#b7c1e3",
      text: "#3760bf",
      muted: "#6172b0",
      border: "#6172b0",
      primary: "#2e7de9",
      danger: "#f52a65",
      warning: "#8c6c3e",
      success: "#587539",
      info: "#007197",
      violet: "#9854f1",
      rose: "#b15c00"
    }
  }
};
function createPalette(source, mode) {
  const surfaces = [source.background, source.surface, source.raised, source.hover];
  const endpoint = mode === "dark" ? "#ffffff" : "#000000";
  const foreground = readablePaletteColor(source.text, endpoint, surfaces, 7);
  const muted = readablePaletteColor(source.muted, endpoint, surfaces, 4.6);
  const status = (seed) => {
    const soft = mixPaletteColor(source.background, seed, 0.12);
    const color = readablePaletteColor(seed, endpoint, [...surfaces, soft], 4.6);
    const onColor = paletteContrast(color, source.background) >= 4.5 ? source.background : endpoint === "#ffffff" ? "#000000" : "#ffffff";
    return {
      color,
      foreground: onColor,
      soft
    };
  };
  const primary = status(source.primary);
  const danger = status(source.danger);
  const warning = status(source.warning);
  const success = status(source.success);
  const info = status(source.info);
  return Object.freeze({
    background: source.background,
    foreground,
    muted,
    faint: muted,
    grid: source.raised,
    line: source.hover,
    controlBorder: readablePaletteColor(source.border, endpoint, surfaces, 3.1),
    surface: source.surface,
    surfaceRaised: source.raised,
    surfaceHover: source.hover,
    card: source.surface,
    cardForeground: foreground,
    popover: source.raised,
    popoverForeground: foreground,
    primary: primary.color,
    primaryForeground: primary.foreground,
    primarySoft: primary.soft,
    secondary: source.raised,
    secondaryForeground: foreground,
    accent: primary.soft,
    accentForeground: foreground,
    focus: primary.color,
    scrim: mode === "dark" ? "#000000b8" : "#00000070",
    disabled: source.raised,
    disabledForeground: muted,
    inverse: foreground,
    inverseForeground: source.background,
    danger: danger.color,
    dangerForeground: danger.foreground,
    dangerSoft: danger.soft,
    warning: warning.color,
    warningForeground: warning.foreground,
    warningSoft: warning.soft,
    success: success.color,
    successForeground: success.foreground,
    successSoft: success.soft,
    info: info.color,
    infoForeground: info.foreground,
    infoSoft: info.soft,
    chart1: readablePaletteColor(source.rose, endpoint, surfaces, 4.6),
    chart2: success.color,
    chart3: info.color,
    chart4: warning.color,
    chart5: readablePaletteColor(source.violet, endpoint, surfaces, 4.6)
  });
}
var paletteColors = Object.freeze({
  catppuccin: Object.freeze({
    light: createPalette(designPaletteSources.catppuccin.light, "light"),
    dark: createPalette(designPaletteSources.catppuccin.dark, "dark")
  }),
  gruvbox: Object.freeze({
    light: createPalette(designPaletteSources.gruvbox.light, "light"),
    dark: createPalette(designPaletteSources.gruvbox.dark, "dark")
  }),
  "rose-pine": Object.freeze({
    light: createPalette(designPaletteSources["rose-pine"].light, "light"),
    dark: createPalette(designPaletteSources["rose-pine"].dark, "dark")
  }),
  "tokyo-night": Object.freeze({
    light: createPalette(designPaletteSources["tokyo-night"].light, "light"),
    dark: createPalette(designPaletteSources["tokyo-night"].dark, "dark")
  })
});

// src/palette-appearance.ts
var defaultDesignPalettePreference = Object.freeze({
  palette: "catppuccin",
  mode: "dark"
});
var designPaletteStorageKey = "hraness-design-palette-v1";
function parseDesignPalettePreference(value) {
  if (typeof value === "string") {
    if (value.length > 256)
      return null;
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  const record = value;
  if (!isDesignPalette(record.palette) || !isDesignTheme(record.mode))
    return null;
  return Object.freeze({
    palette: record.palette,
    mode: record.mode
  });
}
function normalizeDesignPalettePreference(value, fallback = defaultDesignPalettePreference) {
  return parseDesignPalettePreference(value) ?? parseDesignPalettePreference(fallback) ?? defaultDesignPalettePreference;
}
function resolveDesignPalettePreference(preference, systemPrefersDark) {
  return {
    palette: preference.palette,
    mode: resolveDesignTheme(preference.mode, systemPrefersDark)
  };
}

// src/palette-themes.ts
import * as stylex from "@stylexjs/stylex";

// src/palette-tokens.stylex.ts
var catppuccinLight = {
  x18acsur: "xadus2s x18acsur",
  $$css: true
};
var catppuccinDark = {
  x18acsur: "x18wthyl x18acsur",
  $$css: true
};
var gruvboxLight = {
  x18acsur: "xdktuxt x18acsur",
  $$css: true
};
var gruvboxDark = {
  x18acsur: "x1fsd05x x18acsur",
  $$css: true
};
var rosePineLight = {
  x18acsur: "x131glkb x18acsur",
  $$css: true
};
var rosePineDark = {
  x18acsur: "xivpxii x18acsur",
  $$css: true
};
var tokyoNightLight = {
  x18acsur: "x11phk89 x18acsur",
  $$css: true
};
var tokyoNightDark = {
  x18acsur: "xgp1gpt x18acsur",
  $$css: true
};

// src/palette-themes.ts
var classes = {
  catppuccin: {
    light: stylex.props(catppuccinLight).className,
    dark: stylex.props(catppuccinDark).className
  },
  gruvbox: {
    light: stylex.props(gruvboxLight).className,
    dark: stylex.props(gruvboxDark).className
  },
  "rose-pine": {
    light: stylex.props(rosePineLight).className,
    dark: stylex.props(rosePineDark).className
  },
  "tokyo-night": {
    light: stylex.props(tokyoNightLight).className,
    dark: stylex.props(tokyoNightDark).className
  }
};
function getDesignPaletteTheme(palette, mode) {
  return {
    className: `hraness-palette ${classes[palette][mode]}`,
    background: paletteColors[palette][mode].background
  };
}

// src/browser/design-palette.ts
var installationKey = Symbol.for("hraness.design-palette.controller.v1");
var darkQuery = "(prefers-color-scheme: dark)";
function designPaletteSnapshot(preference, systemPrefersDark, isForced = false) {
  const resolved = resolveDesignPalettePreference(preference, systemPrefersDark);
  const theme = getDesignPaletteTheme(resolved.palette, resolved.mode);
  return Object.freeze({
    preference: Object.freeze({
      ...preference
    }),
    resolvedMode: resolved.mode,
    className: theme.className,
    background: theme.background,
    isForced
  });
}
function readStorage(storage, key) {
  try {
    return storage?.getItem(key);
  } catch {
    return;
  }
}
function writeStorage(storage, key, preference) {
  try {
    storage?.setItem(key, JSON.stringify(preference));
  } catch {}
}
function initDesignPalette(options = {}) {
  const document = options.document ?? globalThis.document;
  if (document === undefined || document.documentElement === null || document.head === null) {
    throw new Error("initDesignPalette requires an HTML document with a head.");
  }
  const view = document.defaultView;
  const root = document.documentElement;
  const storageKey = options.storageKey ?? designPaletteStorageKey;
  const legacyStorageKey = options.legacyStorageKey === undefined ? designThemeStorageKey : options.legacyStorageKey;
  if (storageKey.trim() === "" || legacyStorageKey?.trim() === "")
    throw new Error("Appearance storage keys must not be blank.");
  const fallback = normalizeDesignPalettePreference(options.defaultPreference);
  const forced = options.forcedPreference === undefined ? null : parseDesignPalettePreference(options.forcedPreference);
  if (options.forcedPreference !== undefined && (forced === null || forced.mode === "system")) {
    throw new Error("A forced palette requires a valid palette and a light or dark mode.");
  }
  const configuration = JSON.stringify({
    storageKey,
    legacyStorageKey,
    fallback,
    forced
  });
  const ownerDocument = document;
  const previous = ownerDocument[installationKey];
  if (previous !== undefined) {
    if (previous.version !== 1 || previous.configuration !== configuration) {
      throw new Error("This document already has a different palette configuration.");
    }
    return previous.acquire();
  }
  let storage = options.storage ?? null;
  const usesDefaultStorage = options.storage === undefined;
  if (usesDefaultStorage && forced === null) {
    try {
      storage = view?.localStorage ?? null;
    } catch {}
  }
  let media = null;
  try {
    media = view?.matchMedia?.(darkQuery) ?? null;
  } catch {}
  const readPreference = () => {
    if (forced !== null)
      return forced;
    const raw = readStorage(storage, storageKey);
    const saved = parseDesignPalettePreference(raw);
    if (saved !== null)
      return saved;
    if ((raw === null || raw === undefined) && legacyStorageKey !== null) {
      const legacy = readStorage(storage, legacyStorageKey);
      if (isDesignTheme(legacy))
        return Object.freeze({
          palette: fallback.palette,
          mode: legacy
        });
    }
    return fallback;
  };
  let snapshot = designPaletteSnapshot(readPreference(), media?.matches ?? false, forced !== null);
  const listeners = new Set;
  const ownedClasses = new Set(designPalettes.flatMap((palette) => ["light", "dark"].flatMap((mode) => getDesignPaletteTheme(palette, mode).className.split(/\s+/u))));
  const themeColor = acquireThemeColorMeta(document, "theme-color", Symbol("palette-theme-color"), snapshot.background);
  const apply = () => {
    const nextClasses = new Set(snapshot.className.split(/\s+/u).filter(Boolean));
    for (const token of ownedClasses)
      if (token !== "" && !nextClasses.has(token))
        root.classList.remove(token);
    for (const token of nextClasses)
      root.classList.add(token);
    root.setAttribute("data-palette", snapshot.preference.palette);
    root.setAttribute("data-theme", snapshot.resolvedMode);
    themeColor.update(snapshot.background);
  };
  const update = (preference) => {
    const next = designPaletteSnapshot(preference, media?.matches ?? false, forced !== null);
    if (next.preference.palette === snapshot.preference.palette && next.preference.mode === snapshot.preference.mode && next.resolvedMode === snapshot.resolvedMode)
      return false;
    snapshot = next;
    apply();
    for (const listener of listeners)
      listener();
    return true;
  };
  const onMedia = () => {
    update(snapshot.preference);
  };
  const onStorage = (event) => {
    if (forced !== null || event.key !== storageKey && event.key !== null)
      return;
    if (usesDefaultStorage && event.storageArea !== null && event.storageArea !== undefined && event.storageArea !== storage)
      return;
    update(readPreference());
  };
  apply();
  if (forced === null) {
    writeStorage(storage, storageKey, snapshot.preference);
    view?.addEventListener("storage", onStorage);
    media?.addEventListener("change", onMedia);
  }
  let owners = 0;
  const installation = {
    version: 1,
    configuration,
    acquire: () => {
      owners += 1;
      let disposed = false;
      const subscriptions = new Set;
      return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
          if (disposed)
            return () => {
              return;
            };
          const subscription = () => {
            listener();
          };
          subscriptions.add(subscription);
          listeners.add(subscription);
          return () => {
            subscriptions.delete(subscription);
            listeners.delete(subscription);
          };
        },
        setPreference: (value) => {
          if (disposed || forced !== null)
            return false;
          const preference = parseDesignPalettePreference(value);
          if (preference === null)
            throw new Error("Choose a supported palette and appearance mode.");
          writeStorage(storage, storageKey, preference);
          return update(preference);
        },
        dispose: () => {
          if (disposed)
            return;
          disposed = true;
          for (const listener of subscriptions)
            listeners.delete(listener);
          subscriptions.clear();
          owners -= 1;
          if (owners !== 0)
            return;
          view?.removeEventListener("storage", onStorage);
          media?.removeEventListener("change", onMedia);
          themeColor.release();
          if (ownerDocument[installationKey] === installation)
            Reflect.deleteProperty(ownerDocument, installationKey);
        }
      };
    }
  };
  ownerDocument[installationKey] = installation;
  return installation.acquire();
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
  resolveDesignPalettePreference,
  parseDesignPalettePreference,
  normalizeDesignTheme2 as normalizeDesignTheme,
  normalizeDesignPalettePreference,
  isDesignTheme2 as isDesignTheme,
  installAppearanceMenus2 as installAppearanceMenus,
  initDesignPalette,
  downloadBlob,
  designThemes2 as designThemes,
  designThemeStorageKey2 as designThemeStorageKey,
  designThemeLabel2 as designThemeLabel,
  designPaletteStorageKey,
  designPaletteSnapshot,
  defaultDesignTheme2 as defaultDesignTheme,
  defaultDesignPalettePreference,
  copyTextToClipboard,
  canShareFileNatively,
  buildXShareIntentUrl,
  buildLinkedInShareIntentUrl,
  buildBlueskyShareIntentUrl
};
