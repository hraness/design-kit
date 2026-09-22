import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  measureStickyOffset,
  publishStickyOffset,
  stickyOffsetCustomProperty,
  stickyOffsetHeaderSelector,
  syncStickyOffset,
} from "./sticky-offset";

function fixture(markup = `
  <div class="hraness-marketing-page">
    <header class="hraness-marketing-header" data-position="sticky"></header>
    <main class="hraness-marketing-main" id="main-content"></main>
  </div>
`) {
  const parsed = parseHTML(`<!doctype html><html><body>${markup}</body></html>`);
  const document = parsed.document as unknown as Document;
  const header = document.querySelector(".hraness-marketing-header") as HTMLElement | null;
  if (header !== null) {
    (header as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect = () => ({
      x: 0, y: 0, top: 0, left: 0, right: 320, bottom: 56, width: 320, height: 56,
      toJSON: () => ({}),
    });
  }
  return { document, header, window: parsed.window as unknown as Window };
}

test("the sticky offset helper measures the header border box", () => {
  const { header } = fixture();
  expect(header).not.toBeNull();
  expect(measureStickyOffset(header!)).toBe("56px");
  expect(stickyOffsetCustomProperty).toBe("--hraness-sticky-offset");
  expect(stickyOffsetHeaderSelector).toContain(".hraness-marketing-header");
  expect(stickyOffsetHeaderSelector).toContain(".hraness-marketing-header-surface");
});

test("publish writes the offset onto the marketing page so siblings inherit it", () => {
  const { document, header } = fixture();
  expect(header).not.toBeNull();
  expect(publishStickyOffset(header!)).toBe("56px");
  const page = document.querySelector(".hraness-marketing-page") as HTMLElement;
  expect(page.style.getPropertyValue(stickyOffsetCustomProperty)).toBe("56px");
});

test("sync publishes once without ResizeObserver and removes the property on stop", () => {
  const { document, header, window } = fixture();
  Object.defineProperty(window, "ResizeObserver", { configurable: true, value: undefined });
  Object.defineProperty(document, "defaultView", { configurable: true, value: window });
  const stop = syncStickyOffset({ header, root: document });
  const page = document.querySelector(".hraness-marketing-page") as HTMLElement;
  expect(page.style.getPropertyValue(stickyOffsetCustomProperty)).toBe("56px");
  stop();
  expect(page.style.getPropertyValue(stickyOffsetCustomProperty)).toBe("");
});

test("sync observes the header when ResizeObserver is present", () => {
  const { document, header, window } = fixture();
  const observed: Element[] = [];
  class FakeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}
    observe(target: Element) {
      observed.push(target);
      this.callback([], this as unknown as ResizeObserver);
    }
    disconnect() {
      observed.length = 0;
    }
  }
  Object.defineProperty(window, "ResizeObserver", { configurable: true, value: FakeObserver });
  Object.defineProperty(document, "defaultView", { configurable: true, value: window });
  const stop = syncStickyOffset({ root: document });
  expect(observed).toEqual([header]);
  expect((document.querySelector(".hraness-marketing-page") as HTMLElement)
    .style.getPropertyValue(stickyOffsetCustomProperty)).toBe("56px");
  stop();
  expect(observed).toEqual([]);
});

test("sync is a no-op when the header is missing", () => {
  const { document } = fixture("<main id='main-content'></main>");
  expect(syncStickyOffset({ root: document })).toBeTypeOf("function");
  expect((document.documentElement as HTMLElement).style.getPropertyValue(stickyOffsetCustomProperty)).toBe("");
});
