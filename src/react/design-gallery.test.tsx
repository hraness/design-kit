import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DesignSystemGallery,
  designGalleryRecipeCoverage,
  designGallerySections,
  designGalleryTouchKinds,
  resolveGalleryTheme,
} from "./design-gallery";

test("the public gallery covers the composition boundary", () => {
  expect(designGallerySections.map(({ id }) => id)).toEqual([
    "foundation",
    "shells",
    "data",
    "effects",
    "syntax",
  ]);
  expect(designGalleryRecipeCoverage).toContain("@hraness/ui primitives");
  expect(designGalleryRecipeCoverage).toContain("foil card surface");
  expect(designGalleryRecipeCoverage).toContain("Jelly presentation");
  expect(designGalleryRecipeCoverage).toContain("dither surface");
  expect(designGalleryRecipeCoverage).toContain("layout surfaces");
  expect(designGalleryRecipeCoverage).toContain("playback transport");
  expect(designGalleryRecipeCoverage).toContain("plain site and publication grammar");
  expect(designGalleryRecipeCoverage).toContain("Nebula Sans typography");
  expect(designGalleryRecipeCoverage).toContain("production preview notice");
  expect(designGalleryTouchKinds).toEqual(["button", "link", "radio", "range"]);
});

test("the gallery is product-neutral and server renderable", () => {
  const html = renderToStaticMarkup(<DesignSystemGallery />);

  expect(html).toContain("Presentation and composition reference");
  expect(html).toContain("@hraness/design-kit");
  expect(html).toContain("System follows your device on the first visit.");
  expect(html).toContain("or System saves that preference.");
  expect(html).toContain('data-design-gallery-nested="false"');
  expect(html).not.toContain("hraness-design-theme-toggle");
  expect(html).toContain("hraness-design-app-shell");
  expect(html).toContain("hraness-design-top-bar");
  expect(html).toContain('data-position="static"');
  expect(html).toContain('data-surface="solid"');
  expect(html).toContain("hraness-design-bottom-bar");
  expect(html).toContain("hraness-design-page-canvas");
  expect(html).toContain('data-inset="content"');
  expect(html).toContain('data-size="default"');
  expect(html).toContain("hraness-design-docked-footer");
  expect(html).toContain('data-position="absolute"');
  expect(html).toContain('data-density="compact"');
  expect(html).toContain("hraness-design-bar-list-chart");
  expect(html).toContain("hraness-design-production-data-preview-notice");
  expect(html).toContain("hraness-design-dither-surface");
  expect(html).toContain('data-density="medium"');
  expect(html).toContain('data-gallery-dither=""');
  expect(html).toContain("hraness-design-playback-transport");
  expect(html).toContain("design-gallery__playback-transport");
  expect(html).toContain('data-playback-status="idle"');
  expect(html).toContain('id="design-gallery-playback-command"');
  expect(html).toContain("hraness-design-foil-card-surface");
  expect(html).toContain("hraness-design-foil-card-deck");
  expect(html).toContain('data-foil-preset="prism"');
  expect(html).toContain('data-foil-render-mode="interactive"');
  expect(html).toContain('data-foil-controller="deck"');
  expect(html).toContain('data-foil-ornament="corners"');
  expect(html).toContain('data-foil-ornament="rails"');
  expect(html).toContain('data-foil-ornament="circuit"');
  expect(html).toContain('data-foil-ornament="radial"');
  expect(html).toContain('data-foil-ornament="facets"');
  expect(html).toContain('class="design-gallery__plain-link-example"');
  expect(html).toContain('class="plain-header__inner" data-layout="responsive-wrap"');
  expect(html).toContain('class="plain-wordmark"');
  expect(html).toContain("project-name.example");
  expect(html).toContain(">blue links</a> stay quiet until interaction.");
  expect(html).toContain('data-gallery-font="proportional"');
  expect(html).toContain('data-gallery-font="mono"');
  expect(html).toContain("More shape, less noise.");
});

test("a nested gallery identifies itself and defers appearance to the product header", () => {
  const html = renderToStaticMarkup(<DesignSystemGallery isNestedInMain />);

  expect(html).toContain('data-design-gallery-nested="true"');
  expect(html).not.toContain("hraness-design-theme-toggle");
});

test("system appearance resolves from the supplied media preference", () => {
  expect(resolveGalleryTheme("system", true)).toBe("dark");
  expect(resolveGalleryTheme("system", false)).toBe("light");
  expect(resolveGalleryTheme("light", true)).toBe("light");
});
