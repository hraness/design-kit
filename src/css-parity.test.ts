import { expect, test } from "bun:test";

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

const css = await Bun.file(new URL("./tokens.css", import.meta.url)).text();
const resetCss = await Bun.file(new URL("./reset.css", import.meta.url)).text();
const stylesCss = await Bun.file(new URL("./styles.css", import.meta.url)).text();
const componentsCss = await Bun.file(new URL("./components.css", import.meta.url)).text();
const light = declarations(ruleBody(css, ":root"));
const dark = declarations(ruleBody(css, ".dark"));

test("the design layer composes the public primitive core first", () => {
  expect(css).toContain('@import "@hraness/ui/tokens.css";');
  expect(resetCss).toContain('@import "@hraness/ui/reset.css";');

  const portableComponents = stylesCss.indexOf('@import "@hraness/ui/components.css";');
  const designComponents = stylesCss.indexOf('@import "./components.css";');
  expect(portableComponents).toBeGreaterThanOrEqual(0);
  expect(designComponents).toBeGreaterThan(portableComponents);
  expect(stylesCss).not.toContain("fonts.css");
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

test("the default font roles are system stacks", () => {
  expect(light.get("--font-text")).toBe(typography.fontText);
  expect(light.get("--font-heading")).toBe(typography.fontHeading);
  expect(light.get("--font-mono")).toBe(typography.fontMono);
  expect(css).not.toContain("@font-face");
  expect(css).not.toContain("size-adjust");
});

test("composition CSS retains mobile, reduced-motion, and forced-color contracts", () => {
  expect(componentsCss).toContain("@media (max-width: 48rem)");
  expect(componentsCss).toContain("@media (prefers-reduced-motion: reduce)");
  expect(componentsCss).toContain("@media (forced-colors: active)");
  expect(componentsCss).toContain(".hraness-design-app-shell");
  expect(componentsCss).toContain(".hraness-design-fader");
  expect(componentsCss).not.toContain(".hraness-button");
});
