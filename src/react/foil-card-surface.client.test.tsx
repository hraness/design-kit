import { afterEach, expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { createFoilCardSeedPose } from "./foil-card-math";
import { FoilCardDeck, FoilCardSurface } from "./foil-card-surface";

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

test("one delegated controller drives a 50-card deck with cached geometry", () => {
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
      addEventListener: () => undefined,
      matches: query === "(hover: hover) and (pointer: fine)",
      removeEventListener: () => undefined,
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
    value: (requestedFrame: number) => frames.delete(requestedFrame),
  });

  const listenerCounts = {
    deckFocusIn: 0,
    deckFocusOut: 0,
    deckPointerLeave: 0,
    deckPointerMove: 0,
    surfaceFocusIn: 0,
    surfaceFocusOut: 0,
    surfacePointerLeave: 0,
    surfacePointerMove: 0,
  };
  const elementPrototype = window.HTMLElement.prototype as unknown as {
    addEventListener: typeof HTMLElement.prototype.addEventListener;
  };
  const nativeAddEventListener = elementPrototype.addEventListener;
  Object.defineProperty(elementPrototype, "addEventListener", {
    configurable: true,
    value: function addEventListener(
      this: HTMLElement,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions | boolean,
    ): void {
      if (this.classList.contains("hraness-design-foil-card-deck")) {
        if (type === "focusin") listenerCounts.deckFocusIn += 1;
        if (type === "focusout") listenerCounts.deckFocusOut += 1;
        if (type === "pointermove") listenerCounts.deckPointerMove += 1;
        if (type === "pointerleave") listenerCounts.deckPointerLeave += 1;
      }
      if (this.classList.contains("hraness-design-foil-card-surface")) {
        if (type === "focusin") listenerCounts.surfaceFocusIn += 1;
        if (type === "focusout") listenerCounts.surfaceFocusOut += 1;
        if (type === "pointermove") listenerCounts.surfacePointerMove += 1;
        if (type === "pointerleave") listenerCounts.surfacePointerLeave += 1;
      }
      nativeAddEventListener.call(this, type, listener, options);
    },
  });

  const container = document.getElementById("root");
  if (!(container instanceof window.HTMLElement)) throw new Error("Missing test root.");
  mountedRoot = createRoot(container as unknown as HTMLElement);
  act(() => mountedRoot?.render(
    <FoilCardDeck aria-label="Fifty cards">
      {Array.from({ length: 50 }, (_, index) => (
        <FoilCardSurface
          intensity="standard"
          key={index}
          ornament={index % 2 === 0 ? "circuit" : "facets"}
          preset="prism"
          renderMode="interactive"
          seed={`deck-card-${String(index)}`}
        >
          <span data-card-copy={String(index)}>Card {index}</span>
        </FoilCardSurface>
      ))}
    </FoilCardDeck>,
  ));

  expect(listenerCounts).toEqual({
    deckFocusIn: 1,
    deckFocusOut: 1,
    deckPointerLeave: 1,
    deckPointerMove: 1,
    surfaceFocusIn: 0,
    surfaceFocusOut: 0,
    surfacePointerLeave: 0,
    surfacePointerMove: 0,
  });
  const deck = container.querySelector<HTMLElement>(".hraness-design-foil-card-deck");
  const surfaces = [...container.querySelectorAll<HTMLElement>(
    ".hraness-design-foil-card-surface",
  )];
  if (deck === null || surfaces.length !== 50) throw new Error("Missing test deck.");
  const tokenListPrototype = Object.getPrototypeOf(surfaces[0]?.classList) as {
    toggle: typeof DOMTokenList.prototype.toggle;
  };
  const nativeToggle = tokenListPrototype.toggle;
  Object.defineProperty(tokenListPrototype, "toggle", {
    configurable: true,
    value: function toggle(
      this: DOMTokenList,
      token: string,
      force?: boolean,
    ): boolean {
      if (/\s/u.test(token)) {
        throw new DOMException(
          "Class tokens cannot contain whitespace.",
          "InvalidCharacterError",
        );
      }
      return nativeToggle.call(this, token, force);
    },
  });
  const boundsReads = Array.from({ length: 50 }, () => 0);
  for (const [index, surface] of surfaces.entries()) {
    Object.defineProperty(surface, "getBoundingClientRect", {
      configurable: true,
      value: () => {
        boundsReads[index] = (boundsReads[index] ?? 0) + 1;
        return {
          bottom: 200,
          height: 200,
          left: index * 10,
          right: index * 10 + 100,
          top: 0,
          width: 100,
          x: index * 10,
          y: 0,
          toJSON: () => ({}),
        };
      },
    });
  }
  const flushFrame = (): void => {
    const entry = [...frames.entries()][0];
    if (entry === undefined) throw new Error("Missing delegated animation frame.");
    frames.delete(entry[0]);
    entry[1](0);
  };

  const EventConstructor = window.Event as unknown as typeof Event;
  const firstCopy = surfaces[0]?.querySelector("span");
  if (firstCopy === null || firstCopy === undefined) throw new Error("Missing first copy.");
  firstCopy.dispatchEvent(pointerEvent(EventConstructor, "pointermove", {
    clientX: 25,
    clientY: 40,
    pointerType: "mouse",
  }));
  firstCopy.dispatchEvent(pointerEvent(EventConstructor, "pointermove", {
    clientX: 75,
    clientY: 150,
    pointerType: "mouse",
  }));
  expect(frames.size).toBe(1);
  expect(boundsReads[0]).toBe(0);
  expect(surfaces.filter((surface) => surface.hasAttribute("data-foil-active")))
    .toHaveLength(1);
  expect(surfaces[0]?.style.getPropertyValue("--foil-activity")).toBe("1");
  expect(surfaces.slice(1).every(
    (surface) => surface.style.getPropertyValue("--foil-activity") === "0",
  )).toBeTrue();

  flushFrame();
  expect(boundsReads[0]).toBe(1);
  expect(surfaces[0]?.style.getPropertyValue("--foil-light-x")).toBe("75%");
  firstCopy.dispatchEvent(pointerEvent(EventConstructor, "pointermove", {
    clientX: 50,
    clientY: 100,
    pointerType: "mouse",
  }));
  flushFrame();
  expect(boundsReads[0]).toBe(1);

  const secondCopy = surfaces[1]?.querySelector("span");
  if (secondCopy === null || secondCopy === undefined) throw new Error("Missing second copy.");
  secondCopy.dispatchEvent(pointerEvent(EventConstructor, "pointermove", {
    clientX: 35,
    clientY: 60,
    pointerType: "mouse",
  }));
  expect(surfaces[0]?.hasAttribute("data-foil-active")).toBeFalse();
  expect(surfaces[1]?.hasAttribute("data-foil-active")).toBeTrue();
  expect(surfaces.filter((surface) => surface.hasAttribute("data-foil-active")))
    .toHaveLength(1);
  flushFrame();
  expect(boundsReads[1]).toBe(1);

  const thirdCopy = surfaces[2]?.querySelector("span");
  const fourthCopy = surfaces[3]?.querySelector("span");
  if (
    thirdCopy === null
    || thirdCopy === undefined
    || fourthCopy === null
    || fourthCopy === undefined
  ) throw new Error("Missing focus copies.");
  thirdCopy.dispatchEvent(pointerEvent(EventConstructor, "focusin", {}));
  expect(surfaces[2]?.hasAttribute("data-foil-active")).toBeTrue();
  expect(surfaces[2]?.style.getPropertyValue("--foil-rotate-x")).toBe("0deg");
  expect(surfaces[2]?.style.getPropertyValue("--foil-rotate-y")).toBe("0deg");
  expect(surfaces.filter((surface) => surface.hasAttribute("data-foil-active")))
    .toHaveLength(1);
  thirdCopy.dispatchEvent(pointerEvent(EventConstructor, "focusout", {
    relatedTarget: fourthCopy,
  }));
  fourthCopy.dispatchEvent(pointerEvent(EventConstructor, "focusin", {}));
  expect(surfaces[3]?.hasAttribute("data-foil-active")).toBeTrue();
  expect(surfaces.filter((surface) => surface.hasAttribute("data-foil-active")))
    .toHaveLength(1);
  fourthCopy.dispatchEvent(pointerEvent(EventConstructor, "focusout", {
    relatedTarget: null,
  }));
  expect(surfaces.some((surface) => surface.hasAttribute("data-foil-active")))
    .toBeFalse();

  thirdCopy.dispatchEvent(pointerEvent(EventConstructor, "pointermove", {
    clientX: 50,
    clientY: 100,
    pointerType: "touch",
  }));
  expect(frames.size).toBe(0);
  expect(surfaces.some((surface) => surface.hasAttribute("data-foil-active")))
    .toBeFalse();

  secondCopy.dispatchEvent(pointerEvent(EventConstructor, "pointermove", {
    clientX: 35,
    clientY: 60,
    pointerType: "mouse",
  }));
  expect(frames.size).toBe(1);
  expect(surfaces[1]?.hasAttribute("data-foil-active")).toBeTrue();

  deck.dispatchEvent(pointerEvent(EventConstructor, "pointerleave", {
    pointerType: "mouse",
  }));
  flushFrame();
  expect(surfaces.some((surface) => surface.hasAttribute("data-foil-active")))
    .toBeFalse();
  expect(surfaces.every(
    (surface) => surface.style.getPropertyValue("--foil-activity") === "0",
  )).toBeTrue();
});

test("a delegated deck stays inert for reduced motion and forced colors", () => {
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

  let requestedFrames = 0;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: () => undefined,
      matches: query === "(hover: hover) and (pointer: fine)"
        || query === "(prefers-reduced-motion: reduce)"
        || query === "(forced-colors: active)",
      removeEventListener: () => undefined,
    }),
  });
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    value: () => {
      requestedFrames += 1;
      return requestedFrames;
    },
  });
  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    value: () => undefined,
  });

  const container = document.getElementById("root");
  if (!(container instanceof window.HTMLElement)) throw new Error("Missing test root.");
  mountedRoot = createRoot(container as unknown as HTMLElement);
  act(() => mountedRoot?.render(
    <FoilCardDeck>
      <FoilCardSurface
        intensity="vivid"
        ornament="radial"
        preset="gold"
        renderMode="interactive"
        seed="inert-card"
      >
        card
      </FoilCardSurface>
    </FoilCardDeck>,
  ));

  const surface = container.querySelector<HTMLElement>(
    ".hraness-design-foil-card-surface",
  );
  if (surface === null) throw new Error("Missing inert card.");
  surface.dispatchEvent(pointerEvent(window.Event as unknown as typeof Event, "pointermove", {
    clientX: 10,
    clientY: 10,
    pointerType: "mouse",
  }));
  expect(requestedFrames).toBe(0);
  expect(surface.hasAttribute("data-foil-active")).toBeFalse();
  expect(surface.style.getPropertyValue("--foil-activity")).toBe("0");
});
