import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";

import {
  auroraColors,
  breakpoints,
  chromeColors,
  chromeGradientStops,
  colors,
  controlRadius,
  elevation,
  fontFamilies,
  fontFallbacks,
  fontWeights,
  iconography,
  interaction,
  layout,
  motion,
  radius,
  siteThemes,
  spacing,
  stacking,
  themeFor,
  typography,
  typeScale,
} from "./index";
import { effectsStyles } from "./react/effects.stylex";

function atomicRules(
  css: string,
  classNames: readonly string[],
  label: string,
): string {
  return [...new Set(classNames)].flatMap((className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const matches = [...css.matchAll(
      new RegExp(
        `\\.${escaped}(?:\\.${escaped})?(?=\\s|\\{|,|:|\\[)[^{}]*\\{[^{}]*\\}`,
        "gu",
      ),
    )];
    expect(matches.length, `Missing emitted rule for ${label} class ${className}`)
      .toBeGreaterThan(0);
    return matches.map((match) => match[0] ?? "");
  }).join("\n");
}

function relativeLuminance(hex: string): number {
  const linearChannel = (start: number): number => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return linearChannel(1) * 0.2126
    + linearChannel(3) * 0.7152
    + linearChannel(5) * 0.0722;
}

function contrastRatio(left: string, right: string): number {
  const leftLuminance = relativeLuminance(left);
  const rightLuminance = relativeLuminance(right);
  const lighter = Math.max(leftLuminance, rightLuminance);
  const darker = Math.min(leftLuminance, rightLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

test("shared tokens expose exact themes and portable scales", () => {
  expect(themeFor("dark")).toBe(colors.dark);
  expect(colors.light.foreground).not.toBe(colors.dark.foreground);
  expect(colors.light.surface).not.toBe(colors.dark.surface);
  expect(colors.light.dangerSoft).not.toBe(colors.dark.dangerSoft);
  expect(colors.light.danger).not.toBe(colors.dark.danger);
  expect(colors.light.primary).not.toBe(colors.dark.primary);
  expect(colors.light.cardForeground).toBe(colors.light.foreground);
  expect(colors.dark.cardForeground).toBe(colors.dark.foreground);
  expect(spacing[4]).toBe(16);
  expect(spacing[5]).toBe(20);
  expect(radius.round).toBe(999);
  expect(controlRadius).toBe(16);
  expect(controlRadius).toBeGreaterThan(radius.lg);
  expect(controlRadius).toBeLessThan(radius.round);
  expect(layout.chromeInset).toBe(spacing[2]);
  expect(layout.edgeInset).toBe(spacing[6]);
  expect(layout.chromeInset).toBeLessThan(layout.edgeInset);
  expect(siteThemes.plain).toEqual({
    bodyClassName: "plain-site",
    footerClassName: "plain-footer",
    pageClassName: "plain-page",
  });
});

test("the plain site theme remains an explicit, framework-neutral CSS entry point", async () => {
  const css = await Bun.file(new URL("./plain-site.css", import.meta.url)).text();

  expect(css).toContain(".plain-site");
  expect(css).toContain(".plain-page");
  expect(css).toContain(".plain-footer");
  expect(css).toContain(':root[data-theme="dark"] .plain-site');
  expect(css).toContain("@media (prefers-color-scheme: dark)");
  expect(css).toContain("@media (forced-colors: active)");
});

test("secondary text remains readable on every standard muted surface", () => {
  expect(contrastRatio(colors.light.muted, colors.light.surfaceHover)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(colors.light.faint, colors.light.surfaceHover)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(colors.dark.muted, colors.dark.surfaceHover)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(colors.dark.faint, colors.dark.surfaceHover)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(colors.dark.muted, colors.dark.secondary)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(colors.dark.faint, colors.dark.secondary)).toBeGreaterThanOrEqual(4.5);
});

test("motion, elevation, and responsive primitives expose a coherent browser contract", () => {
  expect(motion.duration.standard).toBe(180);
  expect(motion.distance).toEqual({ railEnter: 14, railExit: 10 });
  expect(motion.easing.standard).toStartWith("cubic-bezier(");
  expect(elevation.none).toBe("none");
  expect(elevation.overlay).not.toBe(elevation.raised);
  expect(breakpoints.compact).toBeLessThan(breakpoints.medium);
  expect(breakpoints.medium).toBeLessThan(breakpoints.wide);
  expect(breakpoints.wide).toBeLessThan(breakpoints.canvas);
});

test("browser effects expose portable aurora and chrome palettes", async () => {
  expect(Object.keys(auroraColors)).toEqual(["light", "dark"]);
  expect(Object.keys(auroraColors.light)).toEqual(["violet", "rose", "gold", "mint", "cyan"]);
  expect(new Set(Object.values(chromeColors.light)).size).toBe(5);
  expect(new Set(Object.values(chromeColors.dark)).size).toBe(5);

  const tokensEntry = await Bun.file(new URL("./tokens.css", import.meta.url)).text();
  const tokens = await Bun.file(new URL("./compiler-tokens.css", import.meta.url)).text();
  const effects = await Bun.file(new URL("./effects.css", import.meta.url)).text();
  const compiledEffects = await Bun.file(
    new URL("../dist/stylex.css", import.meta.url),
  ).text();
  const fonts = await Bun.file(new URL("./fonts.css", import.meta.url)).text();
  const headingFont = Bun.file(
    new URL("./fonts/geist-mono/GeistMono[wght].woff2", import.meta.url),
  );
  const typographyStyles = await Bun.file(new URL("./typography.css", import.meta.url)).text();

  expect(tokensEntry).toContain('@import "@hraness/ui/tokens.css";');
  expect(tokensEntry).toContain('@import "./compiler-tokens.css";');

  for (const mode of Object.values(auroraColors)) {
    for (const value of Object.values(mode)) expect(tokens).toContain(value);
  }
  for (const mode of Object.values(chromeColors)) {
    for (const value of Object.values(mode)) expect(tokens).toContain(value);
  }
  for (const mode of Object.values(chromeGradientStops)) {
    for (const [, value] of mode) expect(tokens).toContain(value);
  }
  expect(tokens).toContain("--canvas-background:");
  expect(typographyStyles).toContain(".hraness-design-text-chrome");
  expect(typographyStyles).not.toContain("background-blend-mode");
  expect(typographyStyles).toContain("@media (forced-colors: active)");
  expect(effects).toContain("@layer components.hraness-design-kit.legacy {");
  expect(effects).toContain('[data-theme="dark"] .hraness-design-aurora-background,');
  expect(effects).toContain(".dark .hraness-design-aurora-background {");
  expect(effects).toContain("--hraness-design-aurora-cyan-mix: 15%;");
  expect(effects).not.toContain("--hraness-design-aurora-cyan-mix: 26%;");
  expect(effects).not.toContain("--phaser-dots-static-opacity:");

  const auroraRules = atomicRules(
    compiledEffects,
    stylex.props(effectsStyles.auroraBackground).className?.split(" ").filter(Boolean) ?? [],
    "aurora background",
  );
  const dotsRules = atomicRules(
    compiledEffects,
    stylex.props(effectsStyles.auroraDots).className?.split(" ").filter(Boolean) ?? [],
    "aurora dots",
  );
  expect(auroraRules).toContain("var(--hraness-design-aurora-cyan-mix, 26%)");
  expect(dotsRules).toMatch(/--phaser-dots-static-opacity:\s*(?:0?\.3);/u);
  expect(fonts).toContain('font-family: "Geist Mono";');
  expect(fonts).toContain("font-weight: 100 900;");
  expect(fonts).not.toContain("size-adjust:");
  expect(
    new Bun.CryptoHasher("sha256")
      .update(new Uint8Array(await headingFont.arrayBuffer()))
      .digest("hex"),
  ).toBe("afaacc4c5fbba89d2ebf7a02dc4070208540874592a5504d57175782fe893101");
});

test("consumer defaults preserve readable type and touch targets", () => {
  expect(interaction.compactTarget).toBe(40);
  expect(interaction.compactTarget).toBeLessThan(interaction.minimumTarget);
  expect(interaction.minimumTarget).toBe(48);
  expect(interaction.controlHeight).toBeGreaterThanOrEqual(interaction.minimumTarget);
  expect(interaction.primaryControlHeight).toBe(56);
  expect(interaction.transportControlHeight).toBe(64);
  expect(interaction.transportControlHeight).toBeGreaterThan(
    interaction.primaryControlHeight,
  );
  expect(stacking.chrome).toBeLessThan(stacking.modal);
  expect(stacking.modal).toBeLessThan(stacking.tooltip);
  expect(stacking.tooltip).toBeLessThan(stacking.skipLink);
  expect(iconography).toEqual({ size: 20, strokeWidth: 1.5 });
  expect(typeScale.caption).toBeLessThan(typeScale.label);
  expect(typeScale.label).toBeLessThan(typeScale.body);
  expect(typeScale.control).toBeGreaterThanOrEqual(typeScale.body);
  expect(typeScale.controlGlyph).toBe(iconography.size);
  expect(typeScale.controlGlyph).toBeGreaterThan(typeScale.control);
  expect(typeScale.heading).toBeGreaterThan(typeScale.control);
  expect(typeScale.title).toBeGreaterThan(typeScale.control);
  expect(typeScale.display).toBeGreaterThan(typeScale.title);
  expect(fontWeights.bold).toBeGreaterThan(fontWeights.medium);
});

test("shared typography defaults to Nebula Sans and preserves explicit mono roles", () => {
  expect(fontFamilies).toEqual({
    heading: "Nebula Sans",
    mono: "ui-monospace",
    text: "Nebula Sans",
  });
  expect(fontFallbacks.text).toContain("system-ui");
  expect(fontFallbacks.mono).toContain("SFMono-Regular");
  expect(typography.fontText).toStartWith(`"${fontFamilies.text}"`);
  expect(typography.fontText).toContain(fontFallbacks.text[0]);
  expect(typography.fontHeading).toBe(typography.fontText);
  expect(typography.fontMono).toStartWith(fontFamilies.mono);
  expect(typography.fontMono).toContain(`"${fontFallbacks.mono[0]}"`);
  expect(typography.fontGeistMono).toStartWith('"Geist Mono"');
  expect(typography.fontSans).toBe(typography.fontText);
});
