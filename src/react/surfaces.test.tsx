import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import type { CSSProperties } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DitherSurface,
  type DitherSurfaceDensity,
} from "./surfaces.js";

const testStyles = stylex.create({
  textureOverride: {
    backgroundImage:
      "repeating-linear-gradient(135deg, transparent 0 2px, currentColor 2px 3px)",
    backgroundSize: "9px 9px",
  },
});

function openingTag(html: string): string {
  const marker = 'data-slot="themed-surface"';
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error("Rendered markup has no themed-surface slot");
  const start = html.lastIndexOf("<", markerIndex);
  const end = html.indexOf(">", markerIndex);
  if (start < 0 || end < 0) throw new Error("Rendered themed surface tag is incomplete");
  return html.slice(start, end + 1);
}

function classes(html: string): string[] {
  const className = openingTag(html).match(/class="([^"]+)"/u)?.[1];
  if (className === undefined) throw new Error("Rendered DitherSurface has no class");
  return className.split(" ").filter(Boolean);
}

const densities = ["coarse", "fine", "medium"] as const satisfies readonly DitherSurfaceDensity[];

test("DitherSurface preserves ThemedSurface semantics, native attributes, and stable hooks", () => {
  const html = renderToStaticMarkup(
    <DitherSurface
      {...{ "data-density": "caller", "data-slot": "caller-slot" }}
      aria-label="Dither preview"
      as="article"
      className="consumer-surface"
      data-product="writer"
      density="fine"
      id="preview"
      shape="rectangular"
      tone="inverse"
    >
      Preview content
    </DitherSurface>,
  );
  const tag = openingTag(html);
  const renderedClasses = classes(html);

  expect(tag).toStartWith("<article");
  expect(tag).toContain('aria-label="Dither preview"');
  expect(tag).toContain('data-density="fine"');
  expect(tag).not.toContain('data-density="caller"');
  expect(tag).toContain('data-product="writer"');
  expect(tag).toContain('data-shape="rectangular"');
  expect(tag).toContain('data-slot="themed-surface"');
  expect(tag).not.toContain('data-slot="caller-slot"');
  expect(tag).toContain('data-tone="inverse"');
  expect(tag).toContain('id="preview"');
  expect(renderedClasses[0]).toBe("hraness-themed-surface");
  expect(renderedClasses).toContain("hraness-design-dither-surface");
  expect(renderedClasses.at(-1)).toBe("consumer-surface");
  expect(renderedClasses.length).toBeGreaterThan(3);
  expect(html).toContain(">Preview content</article>");
  expect(tag).not.toContain("style=");
});

test("DitherSurface renders every finite density and keeps medium as the public fallback", () => {
  const rendered = densities.map((density) => {
    const html = renderToStaticMarkup(<DitherSurface density={density}>{density}</DitherSurface>);
    expect(openingTag(html)).toContain(`data-density="${density}"`);
    expect(classes(html)).toContain("hraness-design-dither-surface");
    expect(html).toContain(`>${density}</div>`);
    return [density, classes(html)] as const;
  });
  const coarse = rendered.find(([density]) => density === "coarse")?.[1];
  const fine = rendered.find(([density]) => density === "fine")?.[1];
  const medium = rendered.find(([density]) => density === "medium")?.[1];
  if (coarse === undefined || fine === undefined || medium === undefined) {
    throw new Error("The finite density matrix is incomplete");
  }

  expect(coarse).not.toEqual(fine);
  expect(coarse).not.toEqual(medium);
  expect(fine).not.toEqual(medium);
  expect(coarse.length).toBe(medium.length + 1);
  expect(fine.length).toBe(medium.length + 1);
});

test("DitherSurface applies its texture before the caller StyleX seam", () => {
  const baseClasses = classes(
    renderToStaticMarkup(<DitherSurface density="coarse" />),
  );
  const overrideHtml = renderToStaticMarkup(
    <DitherSurface
      className="consumer-surface"
      density="coarse"
      xstyle={testStyles.textureOverride}
    />,
  );
  const overrideClasses = classes(overrideHtml);

  expect(overrideClasses[0]).toBe("hraness-themed-surface");
  expect(overrideClasses).toContain("hraness-design-dither-surface");
  expect(overrideClasses.at(-1)).toBe("consumer-surface");
  expect(overrideClasses.length).toBe(baseClasses.length);
  expect(
    overrideClasses.filter((name) => baseClasses.includes(name)),
  ).not.toHaveLength(baseClasses.length);
  expect(openingTag(overrideHtml)).not.toContain("style=");
});

test("caller native styles remain last while the literal dither variable stays public", () => {
  const html = renderToStaticMarkup(
    <DitherSurface
      density="fine"
      style={{
        "--hraness-design-dither-size": "11px",
        backgroundImage: "none",
        backgroundSize: "11px 11px",
      } as CSSProperties}
    />,
  );
  const tag = openingTag(html);

  expect(tag).toContain("--hraness-design-dither-size:11px");
  expect(tag).toContain("background-image:none");
  expect(tag).toContain("background-size:11px 11px");
});
