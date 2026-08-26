import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import type { CSSProperties } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  BottomBar,
  DitherSurface,
  type DitherSurfaceDensity,
  DockedFooter,
  PageCanvas,
  TopBar,
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

function tagWithClass(html: string, stableClass: string): string {
  const markerIndex = html.indexOf(stableClass);
  if (markerIndex < 0) throw new Error(`Rendered markup has no ${stableClass} class`);
  const start = html.lastIndexOf("<", markerIndex);
  const end = html.indexOf(">", markerIndex);
  if (start < 0 || end < 0) throw new Error(`Rendered ${stableClass} tag is incomplete`);
  return html.slice(start, end + 1);
}

function classesFor(html: string, stableClass: string): string[] {
  const className = tagWithClass(html, stableClass).match(/class="([^"]+)"/u)?.[1];
  if (className === undefined) throw new Error(`Rendered ${stableClass} has no class`);
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

test("TopBar preserves native header semantics, stable slots, defaults, and caller props", () => {
  const html = renderToStaticMarkup(
    <TopBar
      {...{ "data-position": "caller", "data-surface": "caller" }}
      actions={<button type="button">Save</button>}
      aria-label="Workspace header"
      className="consumer-top-bar"
      id="workspace-header"
      leading={<span>Back</span>}
      position="sticky"
      style={{ color: "red" }}
      surface="glass"
      title={<strong>Workspace</strong>}
    >
      Context
    </TopBar>,
  );
  const root = tagWithClass(html, "hraness-design-top-bar");
  const rootClasses = classesFor(html, "hraness-design-top-bar");

  expect(root).toStartWith("<header");
  expect(root).toContain('aria-label="Workspace header"');
  expect(root).toContain('data-position="sticky"');
  expect(root).toContain('data-surface="glass"');
  expect(root).not.toContain('data-position="caller"');
  expect(root).not.toContain('data-surface="caller"');
  expect(root).toContain('id="workspace-header"');
  expect(root).toContain('style="color:red"');
  expect(rootClasses[0]).toBe("hraness-design-top-bar");
  expect(rootClasses.at(-1)).toBe("consumer-top-bar");
  expect(rootClasses.length).toBeGreaterThan(4);
  for (const slot of ["leading", "title", "content", "actions"]) {
    const stableClass = `hraness-design-top-bar__${slot}`;
    expect(classesFor(html, stableClass)[0]).toBe(stableClass);
    expect(classesFor(html, stableClass).length).toBeGreaterThan(1);
  }
  expect(html).toContain("<strong>Workspace</strong>");
  expect(html).toContain(">Context</div>");
  expect(html).toContain('<button type="button">Save</button>');

  const defaults = renderToStaticMarkup(<TopBar />);
  expect(tagWithClass(defaults, "hraness-design-top-bar")).toContain(
    'data-position="static" data-surface="solid"',
  );
  expect(defaults).toContain("hraness-design-top-bar__leading");
  expect(defaults).not.toContain("hraness-design-top-bar__title");
  expect(defaults).not.toContain("hraness-design-top-bar__content");
  expect(defaults).not.toContain("hraness-design-top-bar__actions");

  const explicitNulls = renderToStaticMarkup(
    <TopBar actions={null} title={null}>{null}</TopBar>,
  );
  expect(explicitNulls).toContain("hraness-design-top-bar__title");
  expect(explicitNulls).toContain("hraness-design-top-bar__content");
  expect(explicitNulls).toContain("hraness-design-top-bar__actions");
});

test("BottomBar preserves its native footer and undefined-versus-null slot contract", () => {
  const html = renderToStaticMarkup(
    <BottomBar
      actions={<button type="button">Continue</button>}
      aria-label="Workspace footer"
      className="consumer-bottom-bar"
      data-consumer="true"
      leading={<span>Status</span>}
      style={{ color: "blue" }}
      title="Native footer title"
    >
      Summary
    </BottomBar>,
  );
  const root = tagWithClass(html, "hraness-design-bottom-bar");
  const rootClasses = classesFor(html, "hraness-design-bottom-bar");

  expect(root).toStartWith("<footer");
  expect(root).toContain('aria-label="Workspace footer"');
  expect(root).toContain('data-consumer="true"');
  expect(root).toContain('style="color:blue"');
  expect(root).toContain('title="Native footer title"');
  expect(rootClasses[0]).toBe("hraness-design-bottom-bar");
  expect(rootClasses.at(-1)).toBe("consumer-bottom-bar");
  expect(rootClasses.length).toBeGreaterThan(3);
  for (const slot of ["leading", "content", "actions"]) {
    const stableClass = `hraness-design-bottom-bar__${slot}`;
    expect(classesFor(html, stableClass)[0]).toBe(stableClass);
    expect(classesFor(html, stableClass).length).toBeGreaterThan(1);
  }

  const defaults = renderToStaticMarkup(<BottomBar />);
  expect(defaults).not.toContain("hraness-design-bottom-bar__leading");
  expect(defaults).toContain("hraness-design-bottom-bar__content");
  expect(defaults).not.toContain("hraness-design-bottom-bar__actions");
  const explicitNulls = renderToStaticMarkup(
    <BottomBar actions={null} leading={null} />,
  );
  expect(explicitNulls).toContain("hraness-design-bottom-bar__leading");
  expect(explicitNulls).toContain("hraness-design-bottom-bar__actions");
});

test("PageCanvas preserves both native elements and every finite inset and size variant", () => {
  const defaultHtml = renderToStaticMarkup(
    <PageCanvas
      {...{ "data-inset": "caller", "data-size": "caller" }}
      aria-label="Page content"
      className="consumer-page"
      id="page-content"
      style={{ color: "green" }}
    >
      Body
    </PageCanvas>,
  );
  const defaultRoot = tagWithClass(defaultHtml, "hraness-design-page-canvas");
  const defaultClasses = classesFor(defaultHtml, "hraness-design-page-canvas");
  expect(defaultRoot).toStartWith("<main");
  expect(defaultRoot).toContain('data-inset="content"');
  expect(defaultRoot).toContain('data-size="default"');
  expect(defaultRoot).not.toContain('data-inset="caller"');
  expect(defaultRoot).not.toContain('data-size="caller"');
  expect(defaultRoot).toContain('style="color:green"');
  expect(defaultClasses[0]).toBe("hraness-design-page-canvas");
  expect(defaultClasses.at(-1)).toBe("consumer-page");
  expect(defaultClasses.length).toBeGreaterThan(3);
  expect(defaultHtml).toContain(">Body</main>");

  const variants = (["content", "none"] as const).flatMap((inset) =>
    (["default", "full", "wide"] as const).map((size) => {
      const html = renderToStaticMarkup(
        <PageCanvas as="div" inset={inset} size={size} />,
      );
      const root = tagWithClass(html, "hraness-design-page-canvas");
      expect(root).toStartWith("<div");
      expect(root).toContain(`data-inset="${inset}"`);
      expect(root).toContain(`data-size="${size}"`);
      expect(root).not.toContain("style=");
      return classesFor(html, "hraness-design-page-canvas").join(" ");
    }),
  );
  expect(new Set(variants).size).toBe(variants.length);
});

test("DockedFooter preserves root and caller hooks plus every finite recipe", () => {
  const html = renderToStaticMarkup(
    <DockedFooter
      className="consumer-docked-footer"
      contentClassName="consumer-docked-content"
      data-density="caller-root-density"
      data-inset="caller-root-inset"
      data-size="caller-root-size"
      density="compact"
      inset="none"
      position="absolute"
      size="wide"
      style={{ color: "purple" }}
      surface="glass"
    >
      Commands
    </DockedFooter>,
  );
  const root = tagWithClass(html, "hraness-design-docked-footer");
  const content = tagWithClass(html, "hraness-design-docked-footer__content");
  const rootClasses = classesFor(html, "hraness-design-docked-footer");
  const contentClasses = classesFor(html, "hraness-design-docked-footer__content");

  expect(root).toStartWith("<footer");
  expect(root).toContain('data-density="caller-root-density"');
  expect(root).toContain('data-inset="caller-root-inset"');
  expect(root).toContain('data-position="absolute"');
  expect(root).toContain('data-size="caller-root-size"');
  expect(root).toContain('data-surface="glass"');
  expect(root).toContain('style="color:purple"');
  expect(rootClasses[0]).toBe("hraness-design-docked-footer");
  expect(rootClasses.at(-1)).toBe("consumer-docked-footer");
  expect(rootClasses.length).toBeGreaterThan(3);
  expect(content).toContain('data-density="compact"');
  expect(content).toContain('data-inset="none"');
  expect(content).toContain('data-size="wide"');
  expect(contentClasses[0]).toBe("hraness-design-docked-footer__content");
  expect(contentClasses.at(-1)).toBe("consumer-docked-content");
  expect(contentClasses.length).toBeGreaterThan(4);
  expect(html).toContain(">Commands</div></footer>");

  const positions = (["absolute", "fixed", "sticky"] as const).map((position) => {
    const markup = renderToStaticMarkup(<DockedFooter position={position} />);
    expect(tagWithClass(markup, "hraness-design-docked-footer")).toContain(
      `data-position="${position}"`,
    );
    return classesFor(markup, "hraness-design-docked-footer").join(" ");
  });
  expect(new Set(positions).size).toBe(positions.length);

  const contentVariants = (["compact", "default"] as const).flatMap((density) =>
    (["content", "none"] as const).map((inset) => {
      const markup = renderToStaticMarkup(
        <DockedFooter density={density} inset={inset} />,
      );
      return classesFor(markup, "hraness-design-docked-footer__content").join(" ");
    }),
  );
  expect(new Set(contentVariants).size).toBe(contentVariants.length);

  const sizes = (["default", "full", "wide"] as const).map((size) =>
    classesFor(
      renderToStaticMarkup(<DockedFooter size={size} />),
      "hraness-design-docked-footer__content",
    ).join(" "));
  expect(new Set(sizes).size).toBe(sizes.length);

  const solidClasses = classesFor(
    renderToStaticMarkup(<DockedFooter surface="solid" />),
    "hraness-design-docked-footer",
  );
  const glassMarkup = renderToStaticMarkup(<DockedFooter surface="glass" />);
  expect(classesFor(glassMarkup, "hraness-design-docked-footer")).toEqual(solidClasses);
  expect(tagWithClass(glassMarkup, "hraness-design-docked-footer")).toContain(
    'data-surface="glass"',
  );
});
