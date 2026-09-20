import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";
import { FoilMark } from "./foil-mark";
import { MarketingSiteHeader } from "./product-marketing";

test("foil marks retain exact artwork and a decorative fallback without a client runtime", () => {
  const { document } = parseHTML(renderToStaticMarkup(<FoilMark src="/marks/relay.svg" size={44} className="project-mark" />));
  const mark = document.querySelector(".hraness-foil-mark");
  expect(mark?.getAttribute("aria-hidden")).toBe("true");
  expect(mark?.className.split(" ").at(-1)).toBe("project-mark");
  expect(mark?.querySelector("img")?.getAttribute("src")).toBe("/marks/relay.svg");
  expect(mark?.querySelector("img")?.getAttribute("width")).toBe("44");
  expect(mark?.querySelector("img")?.getAttribute("alt")).toBe("");
  expect(mark?.querySelector(".hraness-foil-mark__paint")?.getAttribute("style")).toBe('--hraness-foil-mask:url("/marks/relay.svg")');
  expect(document.querySelector("script, style, canvas")).toBeNull();
});

test("an explicit label names only the wrapper while an inline original remains available", () => {
  const { document } = parseHTML(renderToStaticMarkup(<FoilMark src="/mark.svg" label="Relay" fallback={<svg aria-hidden="true"><path d="M0 0h8v8z" fill="currentColor" /></svg>} />));
  expect(document.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Relay");
  expect(document.querySelectorAll("[aria-label]")).toHaveLength(1);
  expect(document.querySelector("svg path")?.getAttribute("d")).toBe("M0 0h8v8z");
  expect(document.querySelector("img")).toBeNull();
});

test("the shared marketing header composes its product mark inside the one named home link", () => {
  const { document } = parseHTML(renderToStaticMarkup(<MarketingSiteHeader brand="Relay" brandMark="/relay.svg" brandLabel="Relay home" links={[]} />));
  const home = document.querySelector('a[href="/"]');
  expect(home?.getAttribute("aria-label")).toBe("Relay home");
  expect(home?.querySelector(".hraness-foil-mark img")?.getAttribute("src")).toBe("/relay.svg");
  expect(home?.textContent).toBe("Relay");
  expect(home?.querySelectorAll("a")).toHaveLength(0);
});


test("invalid mark dimensions fail before producing unusable layout", () => {
  for (const size of [0, -1, NaN, Infinity]) {
    expect(() => renderToStaticMarkup(<FoilMark src="/mark.svg" size={size} />)).toThrow(RangeError);
  }
});
