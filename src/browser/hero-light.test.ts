import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { attachHeroLight } from "./hero-light.js";

function fixture() {
  const parsed = parseHTML('<html><body><header id="hero"><a href="#docs">Docs</a></header></body></html>');
  const root = parsed.document.getElementById("hero") as unknown as HTMLElement;
  // Linkedom omits CSS declaration priorities; supply that narrow browser port.
  const declarations = new Map<string, { value: string; priority: string }>();
  Object.defineProperty(root, "style", { value: {
    getPropertyValue: (name: string) => declarations.get(name)?.value ?? "",
    getPropertyPriority: (name: string) => declarations.get(name)?.priority ?? "",
    setProperty: (name: string, value: string, priority = "") => declarations.set(name, { value, priority }),
    removeProperty: (name: string) => declarations.delete(name),
  } });
  const view = root.ownerDocument.defaultView;
  if (!view) throw new Error("Fixture needs a window");
  const listeners = new Set<() => void>();
  const media = { matches: true, addEventListener: (_: string, f: () => void) => listeners.add(f), removeEventListener: (_: string, f: () => void) => listeners.delete(f) };
  const queue = new Map<number, FrameRequestCallback>();
  let id = 0;
  let clock = 0;
  Object.defineProperties(view, {
    innerHeight: { configurable: true, value: 900 },
    matchMedia: { configurable: true, value: () => media },
    requestAnimationFrame: { configurable: true, value: (callback: FrameRequestCallback) => { queue.set(++id, callback); return id; } },
    cancelAnimationFrame: { configurable: true, value: (key: number) => queue.delete(key) },
  });
  root.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, toJSON: () => ({}) });
  const pointer = (x: number, y: number, pointerType = "mouse") => {
    const event = new parsed.window.Event("pointermove");
    Object.assign(event, { clientX: x, clientY: y, pointerType });
    root.dispatchEvent(event as unknown as Event);
  };
  const settle = () => {
    let count = 0;
    while (queue.size && count < 200) {
      const pending = [...queue.values()]; queue.clear(); clock += 16;
      for (const callback of pending) callback(clock);
      count++;
    }
    expect(queue.size).toBe(0);
  };
  const preference = (enabled: boolean) => { media.matches = enabled; for (const listener of listeners) listener(); };
  return { root, view, pointer, settle, preference, listeners, queue };
}

test("hero light coalesces events, remains bounded and settles without idle work", () => {
  const f = fixture(); const dispose = attachHeroLight(f.root);
  expect(f.queue.size).toBe(0);
  for (let i = 0; i < 20; i++) f.pointer(1600, -600);
  expect(f.queue.size).toBe(1);
  f.settle();
  expect(f.root.style.getPropertyValue("--hraness-hero-light-x")).toBe("80.00%");
  expect(f.root.style.getPropertyValue("--hraness-hero-light-y")).toBe("14.00%");
  expect(f.root.style.getPropertyValue("--hraness-hero-drift-x")).toBe("6.32px");
  expect(f.root.style.getPropertyValue("--hraness-hero-drift-y")).toBe("-5.68px");
  expect(f.root.querySelector("a")?.getAttribute("href")).toBe("#docs");
  dispose(); dispose(); expect(f.listeners.size).toBe(0);
});

test("live motion changes, touch and invalid coordinates leave the static field intact", () => {
  const f = fixture(); const dispose = attachHeroLight(f.root);
  f.pointer(NaN, 2); expect(f.queue.size).toBe(0);
  f.pointer(10, 20, "touch"); expect(f.queue.size).toBe(0);
  f.pointer(10, 20); f.settle();
  f.preference(false);
  expect(f.root.style.getPropertyValue("--hraness-hero-light-x") || "").toBe("");
  f.pointer(40, 40); expect(f.queue.size).toBe(0);
  f.preference(true); f.pointer(40, 40); expect(f.queue.size).toBe(1);
  dispose(); expect(f.queue.size).toBe(0);
});

test("disposal restores caller values and an offscreen hero stops rendering", () => {
  const f = fixture();
  f.root.style.setProperty("--hraness-hero-light-x", "72%");
  const dispose = attachHeroLight(f.root);
  f.pointer(10, 20); f.settle(); dispose();
  expect(f.root.style.getPropertyValue("--hraness-hero-light-x")).toBe("72%");
  const detach = attachHeroLight(f.root);
  f.root.getBoundingClientRect = () => ({ x: 0, y: 1000, left: 0, top: 1000, right: 800, bottom: 1600, width: 800, height: 600, toJSON: () => ({}) });
  f.pointer(100, 1200); f.settle();
  expect(f.root.style.getPropertyValue("--hraness-hero-light-x")).toBe("72%");
  detach();
});
