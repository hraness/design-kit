import { afterEach, expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act, type ReactElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { AgentCommandTabs, AgentSetupPrompt, type AgentCommand } from "./agent-setup-prompt.js";

const names = ["document", "Document", "Element", "HTMLElement", "Node", "navigator", "window", "getSelection", "matchMedia"] as const;
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

test("a denied clipboard expands and selects the complete source for legacy and manual copying", async () => {
  const container = hydrate(<AgentSetupPrompt prompt={prompt} />, { writeText: async () => { throw new Error("denied"); } });
  const selected: { text: string; source: Element | null } = { text: "", source: null };
  const document = container.ownerDocument;
  const window = document.defaultView;
  if (window === null) throw new Error("Missing window.");
  Object.defineProperty(window, "getSelection", { configurable: true, value: () => ({ removeAllRanges: () => undefined, addRange: () => undefined }) });
  Object.defineProperty(document, "createRange", { configurable: true, value: () => ({ selectNodeContents: (node: Element) => { selected.source = node; selected.text = node.textContent ?? ""; } }) });
  Object.defineProperty(document, "execCommand", { configurable: true, value: () => true });
  dispatch(container.querySelector("button"), "click");
  await settle();
  expect(selected.text).toBe(prompt);
  expect(selected.source).toBe(container.querySelector("details pre"));
  expect((container.querySelector("details") as HTMLDetailsElement).open).toBe(true);
  expect(container.querySelector("button")?.getAttribute("data-copy-state")).toBe("copied");
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

test("copy-and-open preserves native link navigation while copying the exact prompt", async () => {
  const written: string[] = [];
  const container = hydrate(<AgentSetupPrompt prompt={prompt} targets={[{ id: "claude", label: "Claude", mark: "example-agent", href: "https://claude.ai/new", mode: "copy-and-open" }]} />, { writeText: async (text) => { written.push(text); } });
  const link = container.querySelector("a");
  const event = dispatch(link, "click");
  await settle();
  expect(event.defaultPrevented).toBe(false);
  expect(link?.getAttribute("href")).toBe("https://claude.ai/new");
  expect(written).toEqual([prompt]);
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
