import { afterEach, expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act, type ReactElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { AgentCommandTabs, AgentSetupPrompt, type AgentCommand } from "./agent-setup-prompt.js";

const names = ["document", "Document", "Element", "HTMLElement", "Node", "navigator", "window", "getSelection", "matchMedia", "open"] as const;
const globalRecord = globalThis as unknown as Record<string, unknown>;
const originalDescriptors = new Map(names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
let root: Root | null = null;
type Clipboard = { writeText(text: string): Promise<void> };

function hydrate(component: ReactElement, clipboard?: Clipboard): HTMLElement {
  const { document, window } = parseHTML(`<!doctype html><html><body><div id="root">${renderToString(component)}</div></body></html>`);
  Object.defineProperty(window, "getSelection", { configurable: true, value: () => null });
  // Linkedom's window can proxy globals left by another DOM fixture.
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({ matches: false, media: query, addEventListener: () => undefined, removeEventListener: () => undefined }),
  });
  const windowRecord = window as unknown as Record<string, unknown>;
  for (const name of names) {
    const value = name === "window" ? window : name === "document" ? document : name === "navigator" ? (clipboard === undefined ? {} : { clipboard }) : windowRecord[name];
    Object.defineProperty(globalThis, name, { configurable: true, value, writable: true });
  }
  globalRecord.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.getElementById("root") as unknown as HTMLElement;
  act(() => { root = hydrateRoot(container, component); });
  return container;
}

function dispatch(target: Element | null, type: string, init: Record<string, unknown> = {}): Event {
  if (target === null) throw new Error(`Missing ${type} target.`);
  const view = target.ownerDocument.defaultView as unknown as { Event: typeof Event };
  const event = new view.Event(type, { bubbles: true, cancelable: true });
  for (const [name, value] of Object.entries(init)) Object.defineProperty(event, name, { value });
  act(() => { target.dispatchEvent(event); });
  return event;
}

async function settle(): Promise<void> {
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
}

afterEach(() => {
  if (root !== null) act(() => { root?.unmount(); });
  root = null;
  for (const name of names) {
    const descriptor = originalDescriptors.get(name);
    if (descriptor === undefined) Reflect.deleteProperty(globalRecord, name);
    else Object.defineProperty(globalThis, name, descriptor);
  }
  Reflect.deleteProperty(globalRecord, "IS_REACT_ACT_ENVIRONMENT");
});

const prompt = "First line.\n\n  Preserve spaces, `quotes`, and <tags>.\nLast line.\n";
const copyTarget = { id: "claude", label: "Claude", mark: "example-agent", href: "https://claude.ai/new", mode: "copy-and-open" as const };

function legacyClipboard(container: HTMLElement, { normalize = false, data = true }: { normalize?: boolean; data?: boolean } = {}) {
  const documentValue = container.ownerDocument;
  const view = documentValue.defaultView as unknown as { Event: typeof Event };
  const original = documentValue.createElement.bind(documentValue);
  const button = container.querySelector("button") as HTMLButtonElement;
  let focused: Element | null = button;
  const values: string[] = [];
  const written: string[] = [];
  Object.defineProperty(documentValue, "activeElement", { configurable: true, get: () => focused });
  Object.defineProperty(button, "focus", { configurable: true, value: () => { focused = button; } });
  Object.defineProperty(documentValue, "createElement", { configurable: true, value: (name: string) => {
    const node = original(name);
    if (name === "textarea") {
      let value = "";
      Object.defineProperty(node, "value", { configurable: true, get: () => value, set: (next: string) => { value = normalize ? next.replace(/\r\n?/gu, "\n") : next; } });
      Object.defineProperty(node, "focus", { configurable: true, value: () => { focused = node; } });
      Object.defineProperty(node, "select", { configurable: true, value: () => undefined });
      Object.defineProperty(node, "setSelectionRange", { configurable: true, value: (start: number, end: number) => { expect(start).toBe(0); expect(end).toBe(value.length); } });
    }
    return node;
  } });
  const fire = () => {
    const event = new view.Event("copy", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: data ? { setData: (type: string, text: string) => { expect(type).toBe("text/plain"); written.push(text); } } : null });
    documentValue.dispatchEvent(event);
    return event;
  };
  Object.defineProperty(documentValue, "execCommand", { configurable: true, value: (command: string) => {
    expect(command).toBe("copy");
    expect(focused?.tagName).toBe("TEXTAREA");
    values.push((focused as HTMLTextAreaElement).value);
    fire();
    return true;
  } });
  return { values, written, fire, restored: () => focused === button };
}

function targetTab(container: HTMLElement, blocked = false) {
  const opened: string[][] = [];
  const navigations: string[] = [];
  const { document } = parseHTML("<!doctype html><html><head></head><body></body></html>");
  const tab = {
    opener: {} as unknown,
    closed: false,
    closeCount: 0,
    document,
    location: { replace: (href: string) => { navigations.push(href); } },
    close: () => { tab.closed = true; tab.closeCount += 1; },
  };
  Object.defineProperty(container.ownerDocument.defaultView, "open", {
    configurable: true,
    value: (...args: string[]) => { opened.push(args); return blocked ? null : tab; },
  });
  return { opened, navigations, tab };
}

const commands: readonly AgentCommand[] = [
  // Linkedom rewrites self-closing SVG paths. Browser fixtures exercise the
  // actual provider art; this DOM harness uses the shared monogram fallback.
  { id: "claude", label: "Claude Code", mark: "example-agent", command: "claude mcp add sample -- sample serve" },
  { id: "codex", label: "Codex", mark: "example-agent", command: "codex mcp add sample -- sample serve" },
  { id: "other", label: "Other", mark: "example-agent", command: "sample serve\n" },
];

test("copying a faded preview writes the entire original prompt and announces pending and success", async () => {
  const written: string[] = [];
  let copied = 0;
  let finish: (() => void) | undefined;
  const container = hydrate(<AgentSetupPrompt onCopied={() => { copied += 1; }} prompt={prompt} />, { writeText: (text) => { written.push(text); return new Promise<void>((resolve) => { finish = resolve; }); } });
  const button = container.querySelector("button");
  dispatch(button, "click");
  expect(button?.getAttribute("data-copy-state")).toBe("copying");
  expect(button?.hasAttribute("disabled")).toBe(true);
  expect(button?.getAttribute("aria-busy")).toBe("true");
  expect(container.querySelector('[role="status"]')?.textContent).toBe("Copying setup prompt.");
  expect(written).toEqual([prompt]);
  expect(copied).toBe(0);
  if (finish === undefined) throw new Error("Copy did not start.");
  finish();
  await settle();
  expect(button?.getAttribute("data-copy-state")).toBe("copied");
  expect(container.querySelector('[role="status"]')?.textContent).toBe("Copied setup prompt.");
  expect(container.querySelector("details")?.hasAttribute("open")).toBe(false);
  expect(copied).toBe(1);
});

test("an ordinary prompt isolates a forced-color media stub left by another fixture", async () => {
  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    value: () => ({ matches: true, addEventListener: () => undefined, removeEventListener: () => undefined }),
  });
  const container = hydrate(<AgentSetupPrompt prompt={prompt} />, { writeText: async () => undefined });
  expect(window.matchMedia("(forced-colors: active)").matches).toBe(false);
  expect(container.querySelector("details")?.hasAttribute("open")).toBe(false);
  dispatch(container.querySelector("button"), "click");
  await settle();
  expect(container.querySelector("button")?.getAttribute("data-copy-state")).toBe("copied");
  expect(container.querySelector("details")?.hasAttribute("open")).toBe(false);
});

test("a denied clipboard uses an exact temporary buffer and restores focus after native copying", async () => {
  const container = hydrate(<AgentSetupPrompt prompt={prompt} />, { writeText: async () => { throw new Error("denied"); } });
  const clipboard = legacyClipboard(container);
  dispatch(container.querySelector("button"), "click");
  await settle();
  expect(clipboard.values).toEqual([prompt]);
  expect(clipboard.written).toEqual([prompt]);
  expect(clipboard.restored()).toBe(true);
  expect(container.ownerDocument.querySelector("[data-hraness-copy-buffer]")).toBeNull();
  expect(clipboard.fire().defaultPrevented).toBe(false);
  expect(clipboard.written).toEqual([prompt]);
  expect((container.querySelector("details") as HTMLDetailsElement).open).toBe(true);
  expect(container.querySelector("button")?.getAttribute("data-copy-state")).toBe("copied");
});

test("native copy events preserve CRLF source when textarea values normalize line endings", async () => {
  const source = prompt.replace(/\n/gu, "\r\n");
  const container = hydrate(<AgentSetupPrompt prompt={source} />, { writeText: async () => { throw new Error("denied"); } });
  const clipboard = legacyClipboard(container, { normalize: true });
  dispatch(container.querySelector("button"), "click");
  await settle();
  expect(clipboard.values).toEqual([prompt]);
  expect(clipboard.written).toEqual([source]);
  expect(container.querySelector("button")?.getAttribute("data-copy-state")).toBe("copied");
  expect(container.ownerDocument.querySelector("[data-hraness-copy-buffer]")).toBeNull();
});

test("normalized legacy input without a clipboard-data override cannot open a provider", async () => {
  const source = prompt.replace(/\n/gu, "\r\n");
  const container = hydrate(<AgentSetupPrompt prompt={source} targets={[copyTarget]} />, { writeText: async () => { throw new Error("denied"); } });
  const destination = targetTab(container);
  legacyClipboard(container, { normalize: true, data: false });
  dispatch(container.querySelector("a"), "click");
  await settle();
  expect(container.querySelector("button")?.getAttribute("data-copy-state")).toBe("failed");
  expect(destination.navigations).toEqual([]);
  expect(destination.tab.closed).toBe(true);
  expect(container.ownerDocument.querySelector("[data-hraness-copy-buffer]")).toBeNull();
});

test("unavailable clipboard reports failure without claiming the source was selected", async () => {
  let copied = 0;
  const container = hydrate(<AgentSetupPrompt onCopied={() => { copied += 1; }} prompt={prompt} />, { writeText: async () => { throw new Error("denied"); } });
  dispatch(container.querySelector("button"), "click");
  await settle();
  expect(container.querySelector("button")?.getAttribute("data-copy-state")).toBe("failed");
  expect(container.querySelector('[role="status"]')?.textContent).toBe("Copy failed. Select the setup prompt and copy it with your keyboard.");
  expect(copied).toBe(0);
});

test("copy hooks run once per successful action and cannot turn a copied prompt into an error", async () => {
  let copied = 0;
  const written: string[] = [];
  const container = hydrate(<AgentSetupPrompt onCopied={() => { copied += 1; throw new Error("analytics failed"); }} prompt={prompt} />, { writeText: async (text) => { written.push(text); } });
  for (const expected of [1, 2]) {
    dispatch(container.querySelector("button"), "click");
    await settle();
    expect(copied).toBe(expected);
    expect(container.querySelector("button")?.getAttribute("data-copy-state")).toBe("copied");
    expect(container.querySelector('[role="status"]')?.textContent).toBe("Copied setup prompt.");
  }
  expect(written).toEqual([prompt, prompt]);
});

test("copy-and-open isolates a reserved tab and waits for the full prompt before navigation", async () => {
  const written: string[] = [];
  let finish: (() => void) | undefined;
  let copied = 0;
  const container = hydrate(<AgentSetupPrompt onCopied={() => { copied += 1; }} prompt={prompt} targets={[copyTarget]} />, { writeText: (text) => {
    expect(destination.opened).toEqual([]);
    written.push(text);
    return new Promise<void>((resolve) => { finish = resolve; });
  } });
  const destination = targetTab(container);
  const link = container.querySelector("a");
  const event = dispatch(link, "click");
  expect(event.defaultPrevented).toBe(true);
  expect(destination.opened).toEqual([["about:blank", "_blank"]]);
  expect(destination.tab.opener).toBeNull();
  expect(destination.tab.document.querySelector('meta[name="referrer"]')?.getAttribute("content")).toBe("no-referrer");
  expect(destination.navigations).toEqual([]);
  expect(copied).toBe(0);
  expect(link?.getAttribute("aria-busy")).toBe("true");
  dispatch(link, "click");
  expect(destination.opened).toHaveLength(1);
  expect(written).toEqual([prompt]);
  if (finish === undefined) throw new Error("Copy did not start.");
  finish();
  await settle();
  expect(destination.navigations).toEqual(["https://claude.ai/new"]);
  expect(destination.tab.closed).toBe(false);
  expect(link?.getAttribute("href")).toBe("https://claude.ai/new");
  expect(link?.getAttribute("target")).toBe("_blank");
  expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
  expect(written).toEqual([prompt]);
  expect(copied).toBe(1);
});

test("denied copy-and-open closes the reservation and keeps the full selected prompt on the page", async () => {
  const container = hydrate(<AgentSetupPrompt prompt={prompt} targets={[copyTarget]} />, { writeText: async () => { throw new Error("denied"); } });
  const destination = targetTab(container);
  const selected: string[] = [];
  Object.defineProperty(container.ownerDocument.defaultView, "getSelection", { configurable: true, value: () => ({ removeAllRanges: () => undefined, addRange: () => undefined }) });
  Object.defineProperty(container.ownerDocument, "createRange", { configurable: true, value: () => ({ selectNodeContents: (node: Element) => { selected.push(node.textContent ?? ""); } }) });
  Object.defineProperty(container.ownerDocument, "execCommand", { configurable: true, value: () => false });
  const event = dispatch(container.querySelector("a"), "click");
  await settle();
  expect(event.defaultPrevented).toBe(true);
  expect(destination.navigations).toEqual([]);
  expect(destination.tab.closeCount).toBe(1);
  expect((container.querySelector("details") as HTMLDetailsElement).open).toBe(true);
  expect(selected).toEqual([prompt]);
  expect(container.querySelector("details pre")?.textContent).toBe(prompt);
  expect(container.querySelector('[role="status"]')?.textContent).toBe("Copy failed. The setup prompt is selected; copy it with your keyboard.");
});

test("blocked popup permission copies the prompt and retains a real link for manual opening", async () => {
  const written: string[] = [];
  const container = hydrate(<AgentSetupPrompt prompt={prompt} targets={[copyTarget]} />, { writeText: async (text) => { written.push(text); } });
  const destination = targetTab(container, true);
  const event = dispatch(container.querySelector("a"), "click");
  await settle();
  expect(event.defaultPrevented).toBe(true);
  expect(destination.navigations).toEqual([]);
  expect(written).toEqual([prompt]);
  expect(container.querySelector('[role="status"]')?.textContent).toBe("Copied setup prompt. Open Claude in a new tab.");
  expect(container.querySelector("a")?.getAttribute("href")).toBe("https://claude.ai/new");
  expect(container.querySelector("a")?.getAttribute("target")).toBe("_blank");
});

test("prefilled destinations retain native navigation without copying or reserving another tab", async () => {
  const written: string[] = [];
  const container = hydrate(<AgentSetupPrompt prompt={prompt} targets={[{ ...copyTarget, mode: "prefill" }]} />, { writeText: async (text) => { written.push(text); } });
  const destination = targetTab(container);
  const event = dispatch(container.querySelector("a"), "click");
  await settle();
  expect(event.defaultPrevented).toBe(false);
  expect(destination.opened).toEqual([]);
  expect(written).toEqual([]);
});

test("a changed prompt closes pending handoff and cannot open a provider with stale source", async () => {
  let finish: (() => void) | undefined;
  let copied = 0;
  const container = hydrate(<AgentSetupPrompt onCopied={() => { copied += 1; }} prompt={prompt} targets={[copyTarget]} />, { writeText: () => new Promise<void>((resolve) => { finish = resolve; }) });
  const destination = targetTab(container);
  dispatch(container.querySelector("a"), "click");
  act(() => { root?.render(<AgentSetupPrompt onCopied={() => { copied += 1; }} prompt={"Use the new source.\n"} targets={[copyTarget]} />); });
  expect(destination.tab.closeCount).toBe(1);
  if (finish === undefined) throw new Error("Copy did not start.");
  finish();
  await settle();
  expect(destination.navigations).toEqual([]);
  expect(destination.tab.closeCount).toBe(1);
  expect(copied).toBe(0);
  expect(container.querySelector("details pre")?.textContent).toBe("Use the new source.\n");
  expect(container.querySelector('[role="status"]')?.textContent).toBe("");
});

test("unmounting a pending handoff closes its blank tab without later navigation", async () => {
  let finish: (() => void) | undefined;
  const container = hydrate(<AgentSetupPrompt prompt={prompt} targets={[copyTarget]} />, { writeText: () => new Promise<void>((resolve) => { finish = resolve; }) });
  const destination = targetTab(container);
  dispatch(container.querySelector("a"), "auxclick", { button: 1 });
  act(() => { root?.unmount(); root = null; });
  expect(destination.tab.closeCount).toBe(1);
  if (finish === undefined) throw new Error("Copy did not start.");
  finish();
  await settle();
  expect(destination.navigations).toEqual([]);
  expect(destination.tab.closeCount).toBe(1);
});

test("native command tabs wrap with arrows, select with Home and End, and move focus", () => {
  const container = hydrate(<AgentCommandTabs commands={commands} />);
  const focused: string[] = [];
  for (const tab of container.querySelectorAll('[role="tab"]')) Object.defineProperty(tab, "focus", { configurable: true, value: () => { focused.push(tab.getAttribute("data-agent") ?? ""); } });
  const tablist = container.querySelector('[role="tablist"]');
  for (const key of ["ArrowRight", "End", "ArrowRight", "ArrowLeft", "Home"]) dispatch(tablist, "keydown", { key });
  expect(focused).toEqual(["codex", "other", "claude", "other", "claude"]);
  expect(container.querySelector('[aria-selected="true"]')?.getAttribute("data-agent")).toBe("claude");
  expect([...container.querySelectorAll('[role="tab"]')].map((tab) => tab.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  expect([...container.querySelectorAll('[role="tabpanel"]')].filter((panel) => !panel.hasAttribute("hidden")).map((panel) => panel.getAttribute("data-agent"))).toEqual(["claude"]);
  dispatch(container.querySelector('[role="tab"][data-agent="codex"]'), "click");
  expect(container.querySelector('[aria-selected="true"]')?.getAttribute("data-agent")).toBe("codex");
});

test("a pending copy cannot announce success for a newly selected command", async () => {
  let finish: (() => void) | undefined;
  const written: string[] = [];
  const container = hydrate(<AgentCommandTabs commands={commands} />, { writeText: (text) => { written.push(text); return new Promise<void>((resolve) => { finish = resolve; }); } });
  dispatch(container.querySelector('[role="tabpanel"]:not([hidden]) button'), "click");
  dispatch(container.querySelector('[role="tab"][data-agent="codex"]'), "click");
  expect(container.querySelector('[role="tabpanel"]:not([hidden]) button')?.getAttribute("data-copy-state")).toBe("idle");
  if (finish === undefined) throw new Error("Copy did not start.");
  finish();
  await settle();
  expect(written).toEqual([commands[0]?.command ?? ""]);
  expect(container.querySelector('[role="status"]')?.textContent).toBe("");
  expect(container.querySelector('[role="tabpanel"]:not([hidden]) button')?.getAttribute("data-copy-state")).toBe("idle");
});

test("copy status returns to idle without changing the copied source", async () => {
  const written: string[] = [];
  const container = hydrate(<AgentCommandTabs commands={commands} initial="other" />, { writeText: async (text) => { written.push(text); } });
  const button = container.querySelector('[role="tabpanel"]:not([hidden]) button');
  dispatch(button, "click");
  await settle();
  expect(button?.getAttribute("data-copy-state")).toBe("copied");
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 2050)); });
  expect(button?.getAttribute("data-copy-state")).toBe("idle");
  expect(container.querySelector('[role="status"]')?.textContent).toBe("");
  expect(written).toEqual(["sample serve\n"]);
});
