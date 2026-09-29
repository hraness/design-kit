import { afterEach, expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { PlatformInstall, type PlatformInstallProps } from "./index";

const installedGlobals = ["document", "Document", "Element", "HTMLElement", "Node", "navigator", "window"] as const;
const globalRecord = globalThis as unknown as Record<string, unknown>;
const originalDescriptors = new Map(
  installedGlobals.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
);
let mountedRoot: Root | null = null;

const platforms: PlatformInstallProps["platforms"] = [
  { id: "macos", command: "brew install relay", shell: "Terminal" },
  { id: "linux", command: "curl -fsSL https://example.test/install.sh | sh", shell: "Terminal" },
  { id: "windows", command: "irm https://example.test/install.ps1 | iex", shell: "PowerShell" },
];

type FakeNavigator = { userAgent?: string; userAgentData?: { platform: string }; clipboard?: { writeText(text: string): Promise<void> } };

function hydrate(props: PlatformInstallProps, navigatorValue: FakeNavigator): HTMLElement {
  const markup = renderToString(<PlatformInstall {...props} />);
  const { document, window } = parseHTML(`<!doctype html><html><body><div id="root">${markup}</div></body></html>`);
  const windowRecord = window as unknown as Record<string, unknown>;
  for (const name of installedGlobals) {
    const value = name === "window" ? window : name === "document" ? document : name === "navigator" ? navigatorValue : windowRecord[name];
    Object.defineProperty(globalThis, name, { configurable: true, value, writable: true });
  }
  globalRecord.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.getElementById("root") as unknown as HTMLElement;
  act(() => { mountedRoot = hydrateRoot(container, <PlatformInstall {...props} />); });
  return container;
}

function dispatch(target: Element | null | undefined, type: string, init: Record<string, unknown> = {}): void {
  if (target === null || target === undefined) throw new Error(`No target for ${type}`);
  const view = target.ownerDocument.defaultView as unknown as { Event: typeof Event };
  const event = new view.Event(type, { bubbles: true, cancelable: true });
  for (const [key, value] of Object.entries(init)) Object.defineProperty(event, key, { value });
  act(() => { target.dispatchEvent(event); });
}

const selected = (container: HTMLElement) => container.querySelector('[role="tab"][aria-selected="true"]')?.getAttribute("data-platform");
const visiblePanels = (container: HTMLElement) =>
  [...container.querySelectorAll('[role="tabpanel"]')].filter((panel) => !panel.hasAttribute("hidden")).map((panel) => panel.getAttribute("data-platform"));

afterEach(() => {
  if (mountedRoot !== null) {
    act(() => mountedRoot?.unmount());
    mountedRoot = null;
  }
  for (const name of installedGlobals) {
    const descriptor = originalDescriptors.get(name);
    if (descriptor === undefined) Reflect.deleteProperty(globalRecord, name);
    else Object.defineProperty(globalThis, name, descriptor);
  }
  Reflect.deleteProperty(globalRecord, "IS_REACT_ACT_ENVIRONMENT");
});

test("hydration selects the visitor's operating system", () => {
  const container = hydrate({ platforms }, { userAgentData: { platform: "Windows" } });
  expect(selected(container)).toBe("windows");
  expect(visiblePanels(container)).toEqual(["windows"]);
  expect(container.querySelector("[data-hraness-platform-install]")?.getAttribute("data-selection-source")).toBe("detected");
});

test("an unlisted or unknown operating system keeps the default", () => {
  const phone = hydrate({ platforms, defaultPlatform: "linux" }, { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" });
  expect(selected(phone)).toBe("linux");
  act(() => mountedRoot?.unmount());
  mountedRoot = null;
  const disabled = hydrate({ platforms, detect: false }, { userAgentData: { platform: "Linux" } });
  expect(selected(disabled)).toBe("macos");
});

test("arrow, Home, and End keys move selection and focus across tabs", () => {
  const container = hydrate({ platforms }, {});
  const tablist = container.querySelector('[role="tablist"]');
  const focused: (string | null)[] = [];
  for (const tab of container.querySelectorAll('[role="tab"]')) {
    Object.defineProperty(tab, "focus", { configurable: true, value: () => { focused.push(tab.getAttribute("data-platform")); } });
  }
  const first = container.querySelector('[role="tab"][data-platform="macos"]');
  dispatch(first, "keydown", { key: "ArrowRight" });
  expect(selected(container)).toBe("linux");
  expect(focused).toEqual(["linux"]);
  expect([...container.querySelectorAll('[role="tab"]')].map((tab) => tab.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
  dispatch(tablist, "keydown", { key: "End" });
  expect(selected(container)).toBe("windows");
  dispatch(tablist, "keydown", { key: "ArrowRight" });
  expect(selected(container)).toBe("macos");
  dispatch(tablist, "keydown", { key: "ArrowLeft" });
  expect(selected(container)).toBe("windows");
  dispatch(tablist, "keydown", { key: "Home" });
  expect(selected(container)).toBe("macos");
  expect(focused).toEqual(["linux", "windows", "macos", "windows", "macos"]);
  dispatch(tablist, "keydown", { key: "a" });
  expect(focused).toHaveLength(5);
  expect(container.querySelector("[data-hraness-platform-install]")?.getAttribute("data-selection-source")).toBe("chosen");
});

test("clicking a tab shows its panel", () => {
  const container = hydrate({ platforms }, {});
  dispatch(container.querySelector('[role="tab"][data-platform="linux"]'), "click");
  expect(visiblePanels(container)).toEqual(["linux"]);
});

test("copy writes the exact command and announces it", async () => {
  const written: string[] = [];
  const container = hydrate({ platforms }, { userAgentData: { platform: "macOS" }, clipboard: { writeText: async (text) => { written.push(text); } } });
  const button = container.querySelector('[data-platform="macos"] button.hraness-platform-install__copy');
  dispatch(button, "click");
  await act(async () => { await Promise.resolve(); });
  expect(written).toEqual(["brew install relay"]);
  expect(button?.getAttribute("data-copy-state")).toBe("copied");
  expect(button?.textContent).toContain("Copied");
  expect(container.querySelector('[role="status"]')?.textContent).toBe("Copied the macOS install command.");
});

test("a blocked clipboard reports failure instead of claiming success", async () => {
  const container = hydrate({ platforms }, { clipboard: { writeText: async () => { throw new Error("denied"); } } });
  const button = container.querySelector('[data-platform="macos"] button.hraness-platform-install__copy');
  dispatch(button, "click");
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
  expect(button?.getAttribute("data-copy-state")).toBe("failed");
  expect(container.querySelector('[role="status"]')?.textContent).toContain("Copying failed");
});
