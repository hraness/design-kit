import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";

import {
  colors,
  fontWeights,
  interaction,
  layout,
  radius,
  spacing,
  stacking,
  typeScale,
  typography,
} from "./index";
import { layoutSurfaceStyles } from "./react/surfaces.stylex";

function ruleBody(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(css);
  if (match?.[1] === undefined) throw new Error(`Missing CSS rule for ${selector}`);
  return match[1];
}

function declarations(body: string): ReadonlyMap<string, string> {
  return new Map(
    body
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const separator = declaration.indexOf(":");
        if (separator < 0) throw new Error(`Invalid CSS declaration: ${declaration}`);
        return [
          declaration.slice(0, separator).trim(),
          declaration.slice(separator + 1).trim(),
        ] as const;
      }),
  );
}

function cssName(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function rem(pixels: number): string {
  return pixels === 0 ? "0" : `${String(pixels / 16)}rem`;
}

function atomicRuleBodies(css: string, classNames: readonly string[]): string {
  const bodies = [...new Set(classNames)].flatMap((className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const matches = [...css.matchAll(
      new RegExp(
        `\\.${escaped}(?:\\.${escaped})?(?=\\s|\\{|,|:|\\[)[^{}]*\\{([^{}]*)\\}`,
        "gu",
      ),
    )];
    expect(matches.length, `Missing emitted rule for layout-surface class ${className}`).toBeGreaterThan(0);
    return matches.map((match) => match[1] ?? "");
  });
  return bodies.join("\n");
}

const tokensCss = await Bun.file(new URL("./tokens.css", import.meta.url)).text();
const css = await Bun.file(new URL("./compiler-tokens.css", import.meta.url)).text();
const resetCss = await Bun.file(new URL("./reset.css", import.meta.url)).text();
const stylesCss = await Bun.file(new URL("./styles.css", import.meta.url)).text();
const componentsCss = await Bun.file(new URL("./components.css", import.meta.url)).text();
const compilerComponentsCss = await Bun.file(
  new URL("./compiler-components.css", import.meta.url),
).text();
const compilerFoundationCss = await Bun.file(
  new URL("./compiler-foundation.css", import.meta.url),
).text();
const stylexCss = await Bun.file(new URL("../dist/stylex.css", import.meta.url)).text();
const layoutSurfaceClasses = Object.values(layoutSurfaceStyles).flatMap((recipe) =>
  stylex.props(recipe).className?.split(" ").filter(Boolean) ?? []);
const layoutSurfaceCss = atomicRuleBodies(stylexCss, layoutSurfaceClasses);
const light = declarations(ruleBody(css, ":root"));
const dark = declarations(ruleBody(css, ".dark"));

test("the design layer composes the public primitive core first", () => {
  expect(tokensCss).toBe([
    "/* Portable primitives come from @hraness/ui. */",
    '@import "@hraness/ui/tokens.css";',
    '@import "./compiler-tokens.css";',
    "",
  ].join("\n"));
  expect(resetCss).toContain('@import "@hraness/ui/reset.css";');

  const portableComponents = stylesCss.indexOf('@import "@hraness/ui/components.css";');
  const portableStylex = stylesCss.indexOf('@import "@hraness/ui/stylex.css";');
  const designComponents = stylesCss.indexOf('@import "./components.css";');
  expect(portableComponents).toBeGreaterThanOrEqual(0);
  expect(portableStylex).toBeGreaterThan(portableComponents);
  expect(designComponents).toBeGreaterThan(portableStylex);
  expect(stylesCss.startsWith([
    "@layer base, components;",
    "@layer components.hraness-ui.legacy.base, components.hraness-ui.legacy, components.hraness-ui.priority1, components.hraness-ui.priority2, components.hraness-ui.priority3, components.hraness-ui.priority4, components.hraness-ui.priority5, components.hraness-ui.priority6, components.hraness-ui.priority7, components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4, components.hraness-design-kit.priority5, components.hraness-design-kit.priority6, components.hraness-design-kit.priority7, components.hraness-design-kit.priority8;",
  ].join("\n"))).toBe(true);
  expect(stylesCss).not.toContain("fonts.css");
  expect(stylesCss).toContain('@import "./product-marketing.css";\n@import "./product-marketing-foundation.css";');

  expect(compilerFoundationCss).toContain(
    '@import "./compiler-palettes.css";',
  );
  expect(compilerFoundationCss).toContain(
    '@import "./compiler-components.css";',
  );
  expect(compilerFoundationCss).toContain('@import "./product-marketing-foundation.css";');
  expect(compilerFoundationCss).not.toContain('@import "./product-marketing.css";');
  expect(compilerFoundationCss).not.toMatch(/(?:styles|stylex)\.css/u);
  expect(compilerFoundationCss).not.toMatch(
    /components\.(?:hraness-ui|hraness-design-kit)\.priority\d+/u,
  );
});

test("CSS and TypeScript themes expose identical semantic colors", () => {
  for (const [role, value] of Object.entries(colors.light)) {
    expect(light.get(`--${cssName(role)}`)).toBe(value);
  }
  for (const [role, value] of Object.entries(colors.dark)) {
    expect(dark.get(`--${cssName(role)}`)).toBe(value);
  }
});

test("CSS and TypeScript scales stay aligned", () => {
  const spaceNames = [0, 1, 2, 3, 4, 5, 6, 8, 12, 16] as const;
  for (const [index, value] of spacing.entries()) {
    expect(light.get(`--space-${String(spaceNames[index])}`)).toBe(rem(value));
  }
  for (const [role, value] of Object.entries(typeScale)) {
    expect(light.get(`--text-${cssName(role)}`)).toBe(rem(value));
  }
  for (const [role, value] of Object.entries(fontWeights)) {
    expect(light.get(`--font-weight-${cssName(role)}`)).toBe(String(value));
  }
  for (const [role, value] of Object.entries(stacking)) {
    expect(light.get(`--z-${cssName(role)}`)).toBe(String(value));
  }
  expect(light.get("--layout-chrome-inset")).toBe(rem(layout.chromeInset));
  expect(light.get("--layout-edge-inset")).toBe(rem(layout.edgeInset));
  expect(light.get("--interactive-target-min")).toBe(rem(interaction.minimumTarget));
  expect(light.get("--radius-lg")).toBe(rem(radius.lg));
});

test("default proportional roles use bundled Nebula Sans and mono stays system-owned", () => {
  expect(css).toContain('@import "./fonts.css";');
  expect(light.get("--font-text")).toBe(typography.fontText);
  expect(light.get("--font-heading")).toBe(typography.fontHeading);
  expect(light.get("--font-mono")).toBe(typography.fontMono);
  expect(light.get("--font-text")).toStartWith('"Nebula Sans"');
  expect(light.get("--font-heading")).toBe(light.get("--font-text"));
  expect(light.get("--font-mono")).toStartWith("ui-monospace");
  expect(light.get("--ui-font-sans")).toBe("var(--font-text)");
  expect(light.get("--ui-font-heading")).toBe("var(--font-heading)");
  expect(light.get("--ui-font-mono")).toBe("var(--font-mono)");
  expect(css).not.toContain("@font-face");
  expect(css).not.toContain("size-adjust");
});

test("composition CSS retains mobile, extracted reduced-motion, and forced-color contracts", () => {
  expect(componentsCss.startsWith([
    "@layer components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4, components.hraness-design-kit.priority5, components.hraness-design-kit.priority6, components.hraness-design-kit.priority7, components.hraness-design-kit.priority8;",
    '@import "../dist/stylex.css";',
  ].join("\n"))).toBe(true);
  expect(componentsCss).toContain('@import "./compiler-components.css";');
  expect(compilerComponentsCss).toContain(
    "@layer components.hraness-design-kit.legacy {",
  );
  expect(compilerComponentsCss).toContain(".hraness-design-visually-hidden");
  for (const migratedFamily of [
    "animated-rail-stage",
    "app-shell",
    "chat-message",
    "chat-composer",
    "fader",
    "navigation-rail",
    "rail-item",
    "rail-section",
    "route-state",
    "theme-toggle",
  ]) {
    expect(compilerComponentsCss).not.toContain(`.hraness-design-${migratedFamily}`);
  }
  expect(compilerComponentsCss).not.toContain("@media (max-width: 48rem)");
  expect(compilerComponentsCss).not.toContain("@media (forced-colors: active)");
  expect(stylexCss).toContain("--hraness-design-dither-size: 3px");
  expect(stylexCss).toContain("--hraness-design-dither-size: 7px");
  expect(layoutSurfaceCss).toContain("min-inline-size: 0");
  expect(stylexCss).toContain("grid-template-columns: auto minmax(0, 1fr)");
  expect(stylexCss).toContain("grid-template-columns: minmax(0, 1fr) auto");
  expect(stylexCss).toContain("grid-template-columns: 1fr");
  expect(stylexCss).toContain("margin-block-end: var(--space-1)");
  expect(layoutSurfaceCss).toContain("min-block-size: var(--top-bar-height)");
  expect(layoutSurfaceCss).toContain("min-block-size: var(--bottom-bar-height)");
  expect(layoutSurfaceCss).toContain("inline-size: min(100%,var(--page-canvas-width))");
  expect(layoutSurfaceCss).toContain("max-inline-size: none");
  expect(layoutSurfaceCss).toContain("max-inline-size: var(--page-canvas-wide)");
  expect(layoutSurfaceCss).toContain("inset-block-start: 0");
  expect(layoutSurfaceCss).toContain("inset-block-end: 0");
  expect(layoutSurfaceCss).toContain("inset-inline: 0");
  expect(layoutSurfaceCss).toContain("border-block-end-color: var(--line)");
  expect(layoutSurfaceCss).toContain("border-block-start-color: var(--line)");
  expect(layoutSurfaceCss).not.toContain("min-width: 0");
  expect(layoutSurfaceCss).not.toContain("margin-bottom: var(--space-1)");
  expect(layoutSurfaceCss).not.toContain("min-height: var(--top-bar-height)");
  expect(layoutSurfaceCss).not.toContain("min-height: var(--bottom-bar-height)");
  expect(layoutSurfaceCss).not.toContain("width: min(100%,var(--page-canvas-width))");
  expect(layoutSurfaceCss).not.toContain("max-width: none");
  expect(layoutSurfaceCss).not.toContain("max-width: var(--page-canvas-wide)");
  expect(layoutSurfaceCss).not.toContain("bottom: 0");
  expect(layoutSurfaceCss).toContain("background-color: canvas");
  expect(layoutSurfaceCss).toContain("border-block-end-color: canvastext");
  expect(layoutSurfaceCss).toContain("border-block-start-color: canvastext");
  expect(layoutSurfaceCss).not.toContain("border-bottom-color: canvastext");
  expect(layoutSurfaceCss).not.toContain("border-top-color: canvastext");
  expect(stylexCss).toContain("@media (forced-colors: active)");
  expect(stylexCss).toContain("@media (width <= 48rem)");
  expect(stylexCss).toContain("grid-template: \"rail top\"");
  expect(layoutSurfaceCss).toContain("border-inline-end-color: canvastext");
  expect(stylexCss).toContain("outline-color: var(--focus)");
  expect(stylexCss).toContain("grid-template-rows: auto minmax(0, 1fr)");
  expect(stylexCss).toContain("opacity: .64");
  expect(stylexCss).toContain("@media (prefers-reduced-motion: reduce)");
  expect(stylexCss).toContain("transform: none !important");
  expect(stylexCss).toContain("transition: none !important");
});
