import { expect, test } from "bun:test";
import fc from "fast-check";
import { parseHTML } from "linkedom";
import { attachHeroLight } from "./hero-light.js";

// The retired hero light must stay inert: no listeners, frames, or style writes.
function fixture() {
  const parsed = parseHTML('<html><body><header id="hero"><span data-hraness-hero-item=""></span><a href="#docs">Docs</a></header></body></html>');
  const root = parsed.document.getElementById("hero") as unknown as HTMLElement;
  const item = root.querySelector("[data-hraness-hero-item]") as unknown as HTMLElement;
  const view = root.ownerDocument.defaultView;
  if (!view) throw new Error("Fixture needs a window");
  const calls: string[] = [];
  const record = (name: string) => () => { calls.push(name); return 0; };
  Object.defineProperties(view, {
    innerHeight: { configurable: true, value: 900 },
    matchMedia: { configurable: true, value: () => ({ matches: true, addEventListener: record("media"), removeEventListener: record("media") }) },
    requestAnimationFrame: { configurable: true, value: record("frame") },
    cancelAnimationFrame: { configurable: true, value: record("cancel") },
  });
  for (const target of [root, root.ownerDocument, view] as unknown as EventTarget[]) {
    const add = target.addEventListener.bind(target);
    target.addEventListener = ((...args: Parameters<EventTarget["addEventListener"]>) => { calls.push(`listen:${args[0]}`); add(...args); }) as EventTarget["addEventListener"];
  }
  const pointer = (x: number, y: number, pointerType = "mouse") => {
    const event = new parsed.window.Event("pointermove");
    Object.assign(event, { clientX: x, clientY: y, pointerType });
    root.dispatchEvent(event as unknown as Event);
  };
  return { root, item, calls, pointer };
}

test("the retired hero light returns an idempotent disposer and leaves the hero untouched", () => {
  const f = fixture();
  const before = f.root.outerHTML;
  const dispose = attachHeroLight(f.root);
  expect(typeof dispose).toBe("function");
  f.pointer(400, 300);
  dispose(); dispose();
  expect(f.calls).toEqual([]);
  expect(f.root.outerHTML).toBe(before);
  expect(f.root.getAttribute("style")).toBeNull();
  expect(f.item.getAttribute("style")).toBeNull();
});

test("no pointer sequence moves a light, drift, or proximity input", () => {
  fc.assert(fc.property(
    fc.array(fc.record({ x: fc.double({ noNaN: false }), y: fc.double({ noNaN: false }), type: fc.constantFrom("mouse", "pen", "touch") }), { maxLength: 24 }),
    (moves) => {
      const f = fixture();
      const dispose = attachHeroLight(f.root);
      for (const move of moves) f.pointer(move.x, move.y, move.type);
      dispose();
      return f.calls.length === 0 && f.root.getAttribute("style") === null && f.item.getAttribute("style") === null;
    },
  ), { numRuns: 50 });
});
