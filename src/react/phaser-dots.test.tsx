import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import { renderToStaticMarkup } from "react-dom/server";

import { effectsStyles } from "./effects.stylex";
import { PhaserDots } from "./phaser-dots";

function classesFor(markup: string, stableClassName: string): string[] {
  const tag = markup.match(
    new RegExp(`<[^>]+class="[^"]*\\b${stableClassName}\\b[^"]*"[^>]*>`, "u"),
  )?.[0];
  if (tag === undefined) {
    throw new Error(`Could not find ${stableClassName} in rendered markup`);
  }
  return /class="([^"]+)"/u.exec(tag)?.[1]?.split(" ").filter(Boolean) ?? [];
}

test("PhaserDots is an inert, unfocusable decorative layer", () => {
  const markup = renderToStaticMarkup(<PhaserDots mouseGlow />);

  expect(markup).toContain('aria-hidden="true"');
  expect(markup).toContain('inert=""');
  expect(markup).toContain('role="presentation"');
  expect(markup).not.toContain("tabindex");
  expect(markup).not.toContain("<button");
});

test("PhaserDots composes extracted recipes before caller classes", () => {
  const markup = renderToStaticMarkup(
    <PhaserDots
      className="consumer-root"
      dotClassName="consumer-dots"
      fadeDirection="top"
      mouseGlow
      style={{
        WebkitMaskImage: "url(#consumer-webkit-mask)",
        maskImage: "url(#consumer-mask)",
      }}
      trailClassName="consumer-trail"
    />,
  );
  const rootClasses = classesFor(markup, "hraness-design-phaser-dots");
  const dotClasses = classesFor(markup, "hraness-design-phaser-dots__static");
  const trailClasses = classesFor(markup, "hraness-design-phaser-dots__trail");

  expect(rootClasses).toEqual([
    "hraness-design-phaser-dots",
    ...(stylex.props(
      effectsStyles.phaserSlot,
      effectsStyles.phaserRoot,
    ).className?.split(" ").filter(Boolean) ?? []),
    "consumer-root",
  ]);
  expect(dotClasses).toEqual([
    "hraness-design-phaser-dots__static",
    ...(stylex.props(
      effectsStyles.phaserSlot,
      effectsStyles.phaserStatic,
    ).className?.split(" ").filter(Boolean) ?? []),
    "consumer-dots",
  ]);
  expect(trailClasses).toEqual([
    "hraness-design-phaser-dots__trail",
    ...(stylex.props(
      effectsStyles.phaserSlot,
      effectsStyles.phaserTrail,
    ).className?.split(" ").filter(Boolean) ?? []),
    "consumer-trail",
  ]);
  expect(markup).toContain("-webkit-mask-image:url(#consumer-webkit-mask)");
  expect(markup).toContain("mask-image:url(#consumer-mask)");
});

test("PhaserDots keeps default colors atomic and gates the canvas trail for reduced motion", async () => {
  const markup = renderToStaticMarkup(<PhaserDots mouseGlow />);
  const dotClasses = classesFor(markup, "hraness-design-phaser-dots__static");
  const trailClasses = classesFor(markup, "hraness-design-phaser-dots__trail");
  const source = await Bun.file(new URL("./phaser-dots.tsx", import.meta.url)).text();

  for (const className of stylex.props(
    effectsStyles.phaserStaticDefault,
  ).className?.split(" ").filter(Boolean) ?? []) {
    expect(dotClasses).toContain(className);
  }
  for (const className of stylex.props(
    effectsStyles.phaserTrailDefault,
  ).className?.split(" ").filter(Boolean) ?? []) {
    expect(trailClasses).toContain(className);
  }
  expect(source.indexOf('matchMedia("(prefers-reduced-motion: reduce)")'))
    .toBeLessThan(source.indexOf('canvas.getContext("2d"'));
});
