import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import { attachFoil } from "./foil";

function fixture(enabled = true, markup?: string) {
  const parsed = parseHTML(`<!doctype html><html><body>
    ${markup ?? `<div id="root">
      <a id="target" data-foil href="#">Brand</a>
      <a id="plain" href="#">Plain</a>
    </div>`}
  </body></html>`);
  const document = parsed.document as unknown as Document;
  const view = parsed.window as unknown as Window;
  const listeners = new Set<() => void>();
  const media = {
    matches: enabled,
    addEventListener: (_type: string, listener: () => void) => { listeners.add(listener); },
    removeEventListener: (_type: string, listener: () => void) => { listeners.delete(listener); },
  };
  Object.defineProperty(view, "matchMedia", { configurable: true, value: () => media });
  let queue: FrameRequestCallback[] = [];
  let sequence = 0;
  let clock = 0;
  Object.defineProperty(view, "requestAnimationFrame", {
    configurable: true,
    value: (callback: FrameRequestCallback) => { queue.push(callback); return ++sequence; },
  });
  Object.defineProperty(view, "cancelAnimationFrame", {
    configurable: true,
    value: () => { queue = []; },
  });
  const root = document.getElementById("root") as unknown as HTMLElement;
  const target = document.getElementById("target") as unknown as HTMLElement;
  (target as { getBoundingClientRect: () => object }).getBoundingClientRect = () => ({
    left: 0, top: 0, right: 100, bottom: 50, width: 100, height: 50, x: 0, y: 0,
    toJSON: () => ({}),
  });
  const step = (frames = 1, delta = 16.7) => {
    for (let i = 0; i < frames; i += 1) {
      const pending = queue;
      queue = [];
      clock += delta;
      for (const callback of pending) callback(clock);
    }
  };
  const pointer = (type: string, init: Record<string, unknown>) => {
    const event = new parsed.window.Event(type) as unknown as Record<string, unknown>;
    Object.assign(event, init);
    view.dispatchEvent(event as unknown as Event);
  };
  const props = () => ({
    x: target.style.getPropertyValue("--hraness-foil-x"),
    y: target.style.getPropertyValue("--hraness-foil-y"),
  });
  const changePreference = (matches: boolean) => {
    media.matches = matches;
    for (const listener of listeners) listener();
  };
  const hide = () => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new parsed.window.Event("visibilitychange") as unknown as Event);
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
  };
  return { document, view, root, target, media, step, pointer, props, changePreference, hide, listeners };
}

test("attachFoil eases the two bounded light inputs on [data-foil] descendants only", () => {
  const f = fixture();
  const detach = attachFoil(f.root);
  f.pointer("pointermove", { clientX: 50, clientY: 25, pointerType: "mouse" });
  f.step(120);
  // The pointer rests at the element center, so the light settles at 50/50.
  expect(f.props()).toEqual({ x: "50.00%", y: "50.00%" });
  // The material direction is fixed; the controller never writes an angle.
  expect(f.target.style.getPropertyValue("--hraness-foil-angle")).toBe("");
  const plain = f.document.getElementById("plain") as unknown as HTMLElement;
  expect(plain.style.getPropertyValue("--hraness-foil-x")).toBe("");
  detach();
  expect(f.props()).toEqual({ x: "", y: "" });
});

test("the light field eases toward the pointer instead of snapping", () => {
  const f = fixture();
  const detach = attachFoil(f.root);
  // A pointer 160px right of the element center maps to the +60% goal span.
  f.pointer("pointermove", { clientX: 130, clientY: 25, pointerType: "mouse" });
  f.step(1);
  const first = Number.parseFloat(f.props().x);
  expect(first).toBeGreaterThan(50);
  expect(first).toBeLessThan(104);
  f.step(120);
  // 130 is 80px right of center; 80/160*60 = 30 -> 80%.
  expect(f.props()).toEqual({ x: "80.00%", y: "50.00%" });
  detach();
});

test("the light stays clamped inside the material bounds", () => {
  const f = fixture();
  const detach = attachFoil(f.root);
  f.pointer("pointermove", { clientX: -5000, clientY: 99999, pointerType: "mouse" });
  f.step(240);
  expect(f.props()).toEqual({ x: "8.00%", y: "92.00%" });
  // A rewritten style is overwritten by the next move.
  f.target.style.removeProperty("--hraness-foil-x");
  f.pointer("pointermove", { clientX: 50, clientY: 25, pointerType: "mouse" });
  f.step(240);
  expect(f.props().x).toBe("50.00%");
  detach();
});

test("pointerdown primes the light so a press lands lit", () => {
  const f = fixture();
  const detach = attachFoil(f.root);
  f.pointer("pointerdown", { clientX: 130, clientY: 25, pointerType: "mouse" });
  f.step(120);
  expect(f.props().x).toBe("80.00%");
  detach();
});

test("nested [data-foil] descendants follow the outermost lockup", () => {
  const f = fixture(true, `<div id="root">
    <a id="target" data-foil href="#"><span id="inner" data-foil>Brand</span></a>
  </div>`);
  const inner = f.document.getElementById("inner") as unknown as HTMLElement;
  (inner as { getBoundingClientRect: () => object }).getBoundingClientRect = () => ({
    left: 10, top: 10, right: 30, bottom: 30, width: 20, height: 20, x: 10, y: 10,
    toJSON: () => ({}),
  });
  const detach = attachFoil(f.root);
  f.pointer("pointermove", { clientX: 130, clientY: 25, pointerType: "mouse" });
  f.step(120);
  // The outer lockup is the single light source; the nested mark never writes.
  expect(f.props().x).toBe("80.00%");
  expect(inner.style.getPropertyValue("--hraness-foil-x")).toBe("");
  expect(inner.style.getPropertyValue("--hraness-foil-y")).toBe("");
  detach();
});

test("reduced motion or forced colors leave the resting material untouched", () => {
  const f = fixture(false);
  const detach = attachFoil(f.root);
  f.pointer("pointermove", { clientX: 130, clientY: 25, pointerType: "mouse" });
  f.step(10);
  expect(f.props()).toEqual({ x: "", y: "" });
  f.changePreference(true);
  f.pointer("pointermove", { clientX: 130, clientY: 25, pointerType: "mouse" });
  f.step(120);
  expect(f.props().x).toBe("80.00%");
  f.changePreference(false);
  expect(f.props()).toEqual({ x: "", y: "" });
  detach();
});

test("touch input, pointer cancel, blur, scroll, resize, hiding, and leaving the window reset", () => {
  const f = fixture();
  const detach = attachFoil(f.root);
  const lit = () => {
    f.pointer("pointermove", { clientX: 130, clientY: 25, pointerType: "mouse" });
    f.step(120);
    expect(f.props().x).toBe("80.00%");
  };
  const idle = () => expect(f.props()).toEqual({ x: "", y: "" });
  lit();
  f.pointer("pointermove", { clientX: 130, clientY: 25, pointerType: "touch" });
  idle();
  lit();
  f.pointer("pointercancel", {});
  idle();
  lit();
  f.pointer("pointerout", { relatedTarget: null });
  idle();
  for (const type of ["blur", "scroll", "resize"]) {
    lit();
    f.pointer(type, {});
    idle();
  }
  lit();
  f.hide();
  idle();
  // blur/scroll/resize fired on the view; re-light to prove listeners survive.
  lit();
  detach();
  f.pointer("pointermove", { clientX: 130, clientY: 25, pointerType: "mouse" });
  f.step(120);
  idle();
  expect(f.listeners.size).toBe(0);
});

test("attachFoil tolerates roots without a live view", () => {
  const parsed = parseHTML("<!doctype html><html><body><div id=\"root\"></div></body></html>");
  const root = parsed.document.getElementById("root") as unknown as HTMLElement;
  const view = parsed.window as unknown as Record<string, unknown>;
  delete view.matchMedia;
  const detach = attachFoil(root);
  expect(typeof detach).toBe("function");
  detach();
});
