import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  FoilCardDeck,
  FoilCardSurface,
  foilCardIntensities,
  foilCardOrnaments,
  foilCardPresets,
  foilCardRenderModes,
} from "./foil-card-surface";

test("the surface preserves semantic descendants and isolates decorative paint", () => {
  const html = renderToStaticMarkup(
    <FoilCardSurface
      className="consumer-card"
      intensity="standard"
      preset="aurora"
      renderMode="interactive"
      seed="gallery-card"
    >
      <article aria-labelledby="card-title">
        <h3 id="card-title">Ordinary card content</h3>
        <button type="button">Inspect</button>
      </article>
    </FoilCardSurface>,
  );

  expect(html).toContain("hraness-design-foil-card-surface");
  expect(html).toContain("consumer-card");
  expect(html).toContain('data-foil-intensity="standard"');
  expect(html).toContain('data-foil-preset="aurora"');
  expect(html).toContain('data-foil-render-mode="interactive"');
  expect(html).toContain('data-foil-controller="standalone"');
  expect(html).toContain('data-foil-ornament="none"');
  expect(html).toContain('<article aria-labelledby="card-title">');
  expect(html).toContain('<button type="button">Inspect</button>');
  expect(html.match(/aria-hidden="true"/gu)).toHaveLength(5);
  expect(html).toContain("--foil-light-x:");
  expect(html).toContain("--foil-spectrum-angle:");
  expect(html).not.toContain("canvas");
  expect(html).not.toContain("tabindex");
});

test("every public preset, intensity, and render mode has a renderable state", () => {
  expect(foilCardPresets).toEqual([
    "prism",
    "aurora",
    "etched",
    "gold",
    "fast",
    "max",
  ]);
  expect(foilCardIntensities).toEqual(["subtle", "standard", "vivid"]);
  expect(foilCardRenderModes).toEqual(["interactive", "static"]);
  expect(foilCardOrnaments).toEqual([
    "none",
    "corners",
    "rails",
    "circuit",
    "radial",
    "facets",
  ]);

  for (const preset of foilCardPresets) {
    for (const intensity of foilCardIntensities) {
      for (const renderMode of foilCardRenderModes) {
        const html = renderToStaticMarkup(
          <FoilCardSurface
            intensity={intensity}
            preset={preset}
            renderMode={renderMode}
            seed={`${preset}-${intensity}-${renderMode}`}
          >
            content
          </FoilCardSurface>,
        );
        expect(html).toContain(`data-foil-preset="${preset}"`);
        expect(html).toContain(`data-foil-intensity="${intensity}"`);
        expect(html).toContain(`data-foil-render-mode="${renderMode}"`);
      }
    }
  }

  for (const ornament of foilCardOrnaments) {
    const html = renderToStaticMarkup(
      <FoilCardSurface
        intensity="standard"
        ornament={ornament}
        preset="prism"
        renderMode="static"
        seed={`ornament-${ornament}`}
      >
        content
      </FoilCardSurface>,
    );
    expect(html).toContain(`data-foil-ornament="${ornament}"`);
  }
});

test("a deck delegates interaction without changing descendant semantics", () => {
  const html = renderToStaticMarkup(
    <FoilCardDeck aria-label="Reference deck" className="consumer-deck">
      <a href="/alpha">
        <FoilCardSurface
          intensity="standard"
          ornament="circuit"
          preset="aurora"
          renderMode="interactive"
          seed="alpha"
        >
          Alpha
        </FoilCardSurface>
      </a>
    </FoilCardDeck>,
  );

  expect(html).toContain("hraness-design-foil-card-deck");
  expect(html).toContain("consumer-deck");
  expect(html).toContain('aria-label="Reference deck"');
  expect(html).toContain('<a href="/alpha">');
  expect(html).toContain('data-foil-controller="deck"');
  expect(html).toContain('data-foil-ornament="circuit"');
  expect(html).not.toContain("tabindex");
});

test("the public component rejects a blank seed before rendering", () => {
  expect(() => renderToStaticMarkup(
    <FoilCardSurface
      intensity="subtle"
      preset="prism"
      renderMode="static"
      seed={" \n "}
    >
      content
    </FoilCardSurface>,
  )).toThrow("must contain a non-whitespace character");
  expect(() => renderToStaticMarkup(
    <FoilCardSurface
      intensity={"loud" as "standard"}
      preset="prism"
      renderMode="static"
      seed="valid"
    >
      content
    </FoilCardSurface>,
  )).toThrow("Unsupported foil card intensity: loud");
  expect(() => renderToStaticMarkup(
    <FoilCardSurface
      intensity="standard"
      ornament={"loud" as "none"}
      preset="prism"
      renderMode="static"
      seed="valid"
    >
      content
    </FoilCardSurface>,
  )).toThrow("Unsupported foil card ornament: loud");
});

test("foil presentation keeps interaction and accessibility fallbacks explicit", async () => {
  const componentSource = await Bun.file(
    new URL("./foil-card-surface.tsx", import.meta.url),
  ).text();
  const styleSource = await Bun.file(
    new URL("./foil-card-surface.stylex.ts", import.meta.url),
  ).text();

  expect(componentSource).toContain("window.requestAnimationFrame");
  expect(componentSource).toContain("FoilCardDeck");
  expect(componentSource).toContain("activeBounds");
  expect(componentSource).toContain("--foil-activity");
  expect(componentSource).toContain('event.pointerType !== "mouse"');
  expect(componentSource).toContain('style.setProperty("--foil-light-x"');
  expect(componentSource).not.toContain("useState");
  expect(styleSource).toContain('"@media (prefers-reduced-motion: reduce)"');
  expect(styleSource).toContain('"@media (forced-colors: active)"');
  expect(styleSource).toContain('"@media (prefers-contrast: more)"');
  expect(styleSource).toContain("(pointer: fine)");
  expect(styleSource).toContain('pointerEvents: "none"');
  expect(styleSource).toContain("--foil-card-radius");
  expect(styleSource).toContain("ornamentCircuit");
  expect(styleSource).not.toMatch(/\burl\s*\(/u);
});
