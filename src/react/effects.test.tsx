import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import type { CSSProperties } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AuroraDotsBackground } from "./aurora-dots-background";
import { effectsStyles } from "./effects.stylex";
import { ParticleHalo } from "./particle-halo";
import { ProceduralBackdrop } from "./procedural-backdrop";

function openingTag(markup: string, stableClassName: string): string {
  const tag = markup.match(
    new RegExp(`<[^>]+class="[^"]*\\b${stableClassName}\\b[^"]*"[^>]*>`, "u"),
  )?.[0];
  if (tag === undefined) {
    throw new Error(`Could not find ${stableClassName} in rendered markup`);
  }
  return tag;
}

function classesFor(markup: string, stableClassName: string): string[] {
  return /class="([^"]+)"/u.exec(openingTag(markup, stableClassName))
    ?.[1]?.split(" ").filter(Boolean) ?? [];
}

function presentationClasses(
  presentation: ReturnType<typeof stylex.props>,
): string[] {
  return presentation.className?.split(" ").filter(Boolean) ?? [];
}

test("AuroraDotsBackground composes fixed decorative atomics onto stable hooks", () => {
  const markup = renderToStaticMarkup(<AuroraDotsBackground />);

  expect(classesFor(markup, "hraness-design-aurora-background")).toEqual([
    "hraness-design-aurora-background",
    ...presentationClasses(stylex.props(effectsStyles.auroraBackground)),
  ]);
  expect(classesFor(markup, "hraness-design-aurora-dots")).toEqual([
    "hraness-design-aurora-dots",
    ...presentationClasses(stylex.props(effectsStyles.auroraDots)),
  ]);
  expect(openingTag(markup, "hraness-design-aurora-background"))
    .toContain('aria-hidden="true"');
  expect(openingTag(markup, "hraness-design-aurora-dots"))
    .toContain('aria-hidden="true"');
  expect(markup).toContain('class="hraness-design-phaser-dots ');
});

test("ProceduralBackdrop preserves its deterministic recipe, inert contract, and caller seams", () => {
  const style = {
    "--hraness-design-procedural-key": "caller-key",
    backgroundColor: "hotpink",
  } as CSSProperties;
  const markup = renderToStaticMarkup(
    <ProceduralBackdrop
      className="consumer-backdrop"
      seed="effects-test"
      style={style}
      variation={3}
      variant="composite"
    />,
  );
  const root = openingTag(markup, "hraness-design-procedural-backdrop");

  expect(classesFor(markup, "hraness-design-procedural-backdrop")).toEqual([
    "hraness-design-procedural-backdrop",
    ...presentationClasses(stylex.props(effectsStyles.proceduralRoot)),
    "consumer-backdrop",
  ]);
  expect(root).toContain('aria-hidden="true"');
  expect(root).toContain('inert=""');
  expect(root).toContain('role="presentation"');
  expect(root).toContain('data-variation="3"');
  expect(root).toContain('data-variant="composite"');
  expect(root).toContain("--hraness-design-procedural-key:caller-key");
  expect(root).toContain("background-color:hotpink");
  expect(classesFor(markup, "hraness-design-procedural-backdrop__atmosphere"))
    .toEqual([
      "hraness-design-procedural-backdrop__atmosphere",
      ...presentationClasses(
        stylex.props(
          effectsStyles.proceduralSlot,
          effectsStyles.proceduralAtmosphere,
        ),
      ),
    ]);
  expect(classesFor(markup, "hraness-design-procedural-backdrop__grid"))
    .toEqual([
      "hraness-design-procedural-backdrop__grid",
      ...presentationClasses(
        stylex.props(
          effectsStyles.proceduralSlot,
          effectsStyles.proceduralGrid,
        ),
      ),
    ]);
  expect(classesFor(markup, "hraness-design-procedural-backdrop__ripples"))
    .toEqual([
      "hraness-design-procedural-backdrop__ripples",
      ...presentationClasses(
        stylex.props(
          effectsStyles.proceduralSlot,
          effectsStyles.proceduralRipples,
        ),
      ),
    ]);
  expect(classesFor(markup, "hraness-design-procedural-backdrop__cloud"))
    .toEqual([
      "hraness-design-procedural-backdrop__cloud",
      ...presentationClasses(stylex.props(effectsStyles.proceduralCloud)),
    ]);
  expect(classesFor(markup, "hraness-design-procedural-backdrop__ripple"))
    .toEqual([
      "hraness-design-procedural-backdrop__ripple",
      ...presentationClasses(stylex.props(effectsStyles.proceduralRipple)),
    ]);
  expect(renderToStaticMarkup(
    <ProceduralBackdrop seed="effects-test" variation={3} variant="composite" />,
  )).toBe(renderToStaticMarkup(
    <ProceduralBackdrop seed="effects-test" variation={3} variant="composite" />,
  ));
});

test("ParticleHalo hides only its inert decoration and preserves meaningful children", () => {
  const style = {
    "--hraness-design-procedural-support": "caller-support",
    color: "rebeccapurple",
  } as CSSProperties;
  const markup = renderToStaticMarkup(
    <ParticleHalo
      className="consumer-halo"
      seed="effects-test"
      style={style}
      variation={2}
    >
      <button type="button">Continue</button>
    </ParticleHalo>,
  );
  const root = openingTag(markup, "hraness-design-particle-halo");
  const particles = openingTag(markup, "hraness-design-particle-halo__particles");
  const content = openingTag(markup, "hraness-design-particle-halo__content");

  expect(classesFor(markup, "hraness-design-particle-halo")).toEqual([
    "hraness-design-particle-halo",
    ...presentationClasses(stylex.props(effectsStyles.particleRoot)),
    "consumer-halo",
  ]);
  expect(root).toContain('data-variation="2"');
  expect(root).toContain("--hraness-design-procedural-support:caller-support");
  expect(root).toContain("color:rebeccapurple");
  expect(particles).toContain('aria-hidden="true"');
  expect(particles).toContain('role="presentation"');
  expect(classesFor(markup, "hraness-design-particle-halo__particles"))
    .toEqual([
      "hraness-design-particle-halo__particles",
      ...presentationClasses(stylex.props(effectsStyles.particleField)),
    ]);
  expect(classesFor(markup, "hraness-design-particle-halo__particle"))
    .toEqual([
      "hraness-design-particle-halo__particle",
      ...presentationClasses(stylex.props(effectsStyles.particle)),
    ]);
  expect(classesFor(markup, "hraness-design-particle-halo__content"))
    .toEqual([
      "hraness-design-particle-halo__content",
      ...presentationClasses(stylex.props(effectsStyles.particleContent)),
    ]);
  expect(content).not.toContain("aria-hidden");
  expect(markup).toContain('<button type="button">Continue</button>');
});

test("effects keep the ancestor theme bridge in legacy and own presentation in StyleX", async () => {
  const [tokens, source] = await Promise.all([
    Bun.file(new URL("../effects.css", import.meta.url)).text(),
    Bun.file(new URL("./effects.stylex.ts", import.meta.url)).text(),
  ]);

  expect(source).toContain("var(--hraness-design-aurora-cyan-mix, 26%)");
  expect(source).toContain('transparent 58%), none"');
  expect(source).not.toMatch(/"--hraness-design-aurora-[\w-]+":/u);
  expect(tokens).toContain("@layer components.hraness-design-kit.legacy {");
  expect(tokens).toContain("--hraness-design-aurora-before-opacity: 0.52;");
  expect(source).toContain('"--phaser-dots-static-opacity": "0.3"');
  expect(tokens).not.toContain("position:");
  expect(tokens).not.toContain("background-image:");
  expect(tokens).not.toContain("@keyframes");
  expect(tokens).not.toContain("@media");

  expect(source.match(/stylex\.keyframes\(/gu)).toHaveLength(4);
  expect(source.split('animationFillMode: "none"').length - 1).toBe(4);
  expect(source.split('animationPlayState: "running"').length - 1).toBe(4);
  expect(source).toContain('"@media (prefers-reduced-motion: reduce)": "none"');
  expect(source).toContain('"@media (forced-colors: active)": "none"');
  expect(source).toContain("backgroundColor:");
  expect(source).toContain("backgroundImage:");
  expect(source).not.toMatch(/\bbackground:/u);
  for (const declaration of [
    'backgroundAttachment: "scroll"',
    'backgroundClip: "border-box"',
    'backgroundOrigin: "padding-box"',
    'backgroundPosition: "0% 0%"',
    'backgroundRepeat: "repeat"',
    'backgroundSize: "auto auto"',
  ]) {
    expect(source.split(declaration).length - 1).toBe(6);
  }

  const particleField = source.slice(
    source.indexOf("particleField:"),
    source.indexOf("particle:", source.indexOf("particleField:")),
  );
  const particleContent = source.slice(source.indexOf("particleContent:"));
  expect(particleField).toContain("@media (forced-colors: active)");
  expect(particleContent).not.toContain("@media (forced-colors: active)");
});
