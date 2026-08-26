import { afterEach, expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { createFoilCardSeedPose } from "./foil-card-math";
import { FoilCardSurface } from "./foil-card-surface";

const installedGlobals = [
  "document",
  "Document",
  "DocumentFragment",
  "Element",
  "Event",
  "HTMLElement",
  "Node",
  "navigator",
  "window",
] as const;

const globalRecord = globalThis as unknown as Record<string, unknown>;
const originalDescriptors = new Map(
  installedGlobals.map((name) => [
    name,
    Object.getOwnPropertyDescriptor(globalThis, name),
  ]),
);
let mountedRoot: Root | null = null;

function pointerEvent(
  EventConstructor: typeof Event,
  type: string,
  values: Readonly<Record<string, unknown>>,
): Event {
  const event = new EventConstructor(type, { bubbles: true });
  for (const [name, value] of Object.entries(values)) {
    Object.defineProperty(event, name, { configurable: true, value });
  }
  return event;
}

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

test("fine mouse movement is frame-batched and writes CSS variables directly", () => {
  globalRecord.IS_REACT_ACT_ENVIRONMENT = true;
  const parsed = parseHTML(
    '<!doctype html><html><body><div id="root"></div></body></html>',
  );
  const { document, window } = parsed;
  const windowRecord = window as unknown as Record<string, unknown>;
  for (const name of installedGlobals) {
    globalRecord[name] = name === "window"
      ? window
      : name === "document"
        ? document
        : windowRecord[name];
  }

  const frames = new Map<number, FrameRequestCallback>();
  let frameSequence = 0;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query === "(hover: hover) and (pointer: fine)",
    }),
  });
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    value: (callback: FrameRequestCallback) => {
      frameSequence += 1;
      frames.set(frameSequence, callback);
      return frameSequence;
    },
  });
  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    value: (frame: number) => frames.delete(frame),
  });

  const container = document.getElementById("root");
  if (!(container instanceof window.HTMLElement)) throw new Error("Missing test root.");
  mountedRoot = createRoot(container as unknown as HTMLElement);
  act(() => mountedRoot?.render(
    <FoilCardSurface
      intensity="standard"
      preset="prism"
      renderMode="interactive"
      seed="pointer-fixture"
    >
      card
    </FoilCardSurface>,
  ));

  const surface = container.querySelector<HTMLElement>(
    ".hraness-design-foil-card-surface",
  );
  if (surface === null) throw new Error("Missing foil surface.");
  let boundsReadCount = 0;
  Object.defineProperty(surface, "getBoundingClientRect", {
    configurable: true,
    value: () => {
      boundsReadCount += 1;
      return {
        bottom: 250,
        height: 200,
        left: 10,
        right: 410,
        top: 50,
        width: 400,
        x: 10,
        y: 50,
        toJSON: () => ({}),
      };
    },
  });

  const initialX = surface.style.getPropertyValue("--foil-light-x");
  const EventConstructor = window.Event as unknown as typeof Event;
  surface.dispatchEvent(pointerEvent(EventConstructor, "pointermove", {
    clientX: 110,
    clientY: 100,
    pointerType: "mouse",
  }));
  surface.dispatchEvent(pointerEvent(EventConstructor, "pointermove", {
    clientX: 310,
    clientY: 200,
    pointerType: "mouse",
  }));

  expect(frames.size).toBe(1);
  expect(boundsReadCount).toBe(0);
  expect(surface.style.getPropertyValue("--foil-light-x")).toBe(initialX);
  const pendingFrame = [...frames.values()][0];
  if (pendingFrame === undefined) throw new Error("Missing pending animation frame.");
  frames.clear();
  pendingFrame(0);
  expect(boundsReadCount).toBe(1);
  expect(surface.style.getPropertyValue("--foil-light-x")).toBe("75%");
  expect(surface.style.getPropertyValue("--foil-light-y")).toBe("75%");
  expect(surface.style.getPropertyValue("--foil-rotate-x")).toBe("-2.5deg");
  expect(surface.style.getPropertyValue("--foil-rotate-y")).toBe("3deg");

  surface.dispatchEvent(pointerEvent(EventConstructor, "pointermove", {
    clientX: 10,
    clientY: 50,
    pointerType: "touch",
  }));
  expect(frames.size).toBe(0);

  surface.dispatchEvent(pointerEvent(EventConstructor, "pointerleave", {
    pointerType: "mouse",
  }));
  const resetFrame = [...frames.values()][0];
  if (resetFrame === undefined) throw new Error("Missing reset animation frame.");
  frames.clear();
  resetFrame(0);
  const seedPose = createFoilCardSeedPose("pointer-fixture");
  expect(surface.style.getPropertyValue("--foil-light-x"))
    .toBe(`${String(seedPose.highlightX)}%`);
});
