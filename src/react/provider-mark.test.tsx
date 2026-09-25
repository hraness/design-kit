import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";

import { ProviderMark, ProviderMarkChip } from "./provider-mark";

test("a registered mark renders its accent tile and real artwork", () => {
  const { document } = parseHTML(renderToStaticMarkup(<ProviderMark mark="claudecode" size={36} />));
  const tile = document.querySelector(".hraness-provider-mark");
  expect(tile?.getAttribute("aria-hidden")).toBe("true");
  expect(tile?.getAttribute("style")).toContain("--_mark-accent:#d97757");
  expect(tile?.getAttribute("style")).toContain("--_mark-size:36px");
  const svgs = tile?.querySelectorAll("svg");
  expect(svgs?.length).toBe(2);
  expect(svgs?.[1]?.innerHTML).toContain("#D97757");
});

test("marks without color art render only the retintable glyph", () => {
  const { document } = parseHTML(renderToStaticMarkup(<ProviderMark mark="opencode" />));
  const svgs = document.querySelectorAll(".hraness-provider-mark svg");
  expect(svgs.length).toBe(1);
  expect(svgs[0]?.getAttribute("fill")).toBe("currentColor");
});

test("aliases resolve through the same registry", () => {
  const { document } = parseHTML(renderToStaticMarkup(<ProviderMark mark="Claude Code" />));
  expect(document.querySelector(".hraness-provider-mark")?.getAttribute("style")).toContain(
    "--_mark-accent:#d97757",
  );
});

test("unknown identities render a neutral monogram, not invented art", () => {
  const { document } = parseHTML(renderToStaticMarkup(<ProviderMark mark="Windsurf" />));
  const tile = document.querySelector(".hraness-provider-mark");
  expect(tile?.querySelectorAll("svg").length).toBe(0);
  expect(tile?.textContent).toContain("W");
  expect(tile?.getAttribute("style")).toContain("--_mark-accent:#6f6962");
});

test("an explicit label names the tile; otherwise it stays decorative", () => {
  const labeled = parseHTML(renderToStaticMarkup(<ProviderMark mark="codex" label="Codex" />));
  expect(labeled.document.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Codex");
  const plain = parseHTML(renderToStaticMarkup(<ProviderMark mark="codex" />));
  expect(plain.document.querySelector('[role="img"]')).toBeNull();
});

test("solid tiles pin a readable on-accent glyph color", () => {
  const { document } = parseHTML(renderToStaticMarkup(<ProviderMark mark="nvidia" tone="solid" />));
  expect(document.querySelector(".hraness-provider-mark")?.getAttribute("style")).toContain(
    "--_mark-on-accent:#f7f6f2",
  );
});

test("chips carry the display name next to the mark", () => {
  const { document } = parseHTML(renderToStaticMarkup(<ProviderMarkChip mark="goose" />));
  const chip = document.querySelector(".hraness-provider-mark__chip");
  expect(chip?.textContent).toContain("Goose");
  expect(chip?.querySelector(".hraness-provider-mark")).not.toBeNull();
});

test("invalid sizes fail before producing unusable layout", () => {
  for (const size of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    expect(() => renderToStaticMarkup(<ProviderMark mark="openai" size={size} />)).toThrow(RangeError);
  }
});
