import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import { attachFoil } from "./foil";

function fixture(enabled = true) {
  const parsed = parseHTML(`<!doctype html><html><body>
    <div id="root">
      <a id="target" data-foil href="#">Brand</a>
      <a id="plain" href="#">Plain</a>
    </div>
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
  const step = (frames = 1) => {
    for (let i = 0; i < frames; i += 1) {
      const pending = queue;
      queue = [];
      for (const callback of pending) callback(0);
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
    angle: target.style.getPropertyValue("--hraness-foil-angle"),
  });
  const changePreference = (matches: boolean) => {
    media.matches = matches;
    for (const listener of listeners) listener();
  };
  return { document, view, root, target, media, step, pointer, props, changePreference, listeners };
}

test("attachFoil eases the three bounded inputs on [data-foil] descendants only", () => {
  const f = fixture();
  const detach = attachFoil(f.root);
  f.pointer("pointermove", { clientX: 50, clientY: 25, pointerType: "mouse" });
  f.step(60);
  const props = f.props();
  expect(props.x).toBe("50.0%");
  expect(props.y).toBe("50.0%");
  // Pointer at the element center resolves to 90deg after wrapping.
  expect(props.angle).toBe("90.0deg");
  const plain = f.document.getElementById("plain") as unknown as HTMLElement;
  expect(plain.style.getPropertyValue("--hraness-foil-x")).toBe("");
  detach();
  expect(f.props()).toEqual({ x: "", y: "", angle: "" });
});

test("attachFoil stays bounded off-surface and rewrites after each move", () => {
  const f = fixture();
  const detach = attachFoil(f.root);
  f.pointer("pointermove", { clientX: -5000, clientY: 99999, pointerType: "mouse" });
  f.step(120);
  const props = f.props();
  expect(props.x).toBe("-100.0%");
  expect(props.y).toBe("200.0%");
  f.target.style.removeProperty("--hraness-foil-x");
  f.pointer("pointermove", { clientX: 50, clientY: 25, pointerType: "mouse" });
  f.step(120);
  expect(f.props().x).toBe("50.0%");
  detach();
});

test("reduced motion or forced colors leave the resting gradient untouched", () => {
  const f = fixture(false);
  const detach = attachFoil(f.root);
  f.pointer("pointermove", { clientX: 50, clientY: 25, pointerType: "mouse" });
  f.step(10);
  expect(f.props()).toEqual({ x: "", y: "", angle: "" });
  f.changePreference(true);
  f.pointer("pointermove", { clientX: 50, clientY: 25, pointerType: "mouse" });
  f.step(120);
  expect(f.props().x).toBe("50.0%");
  f.changePreference(false);
  expect(f.props()).toEqual({ x: "", y: "", angle: "" });
  detach();
});

test("touch release resets and detach removes listeners", () => {
  const f = fixture();
  const detach = attachFoil(f.root);
  f.pointer("pointermove", { clientX: 50, clientY: 25, pointerType: "mouse" });
  f.step(120);
  expect(f.props().x).toBe("50.0%");
  f.pointer("pointerup", { pointerType: "touch" });
  expect(f.props()).toEqual({ x: "", y: "", angle: "" });
  f.pointer("pointermove", { clientX: 50, clientY: 25, pointerType: "mouse" });
  f.step(120);
  expect(f.props().x).toBe("50.0%");
  detach();
  f.pointer("pointermove", { clientX: 10, clientY: 10, pointerType: "mouse" });
  f.step(120);
  expect(f.props()).toEqual({ x: "", y: "", angle: "" });
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
