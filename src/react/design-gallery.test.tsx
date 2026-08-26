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
  expect(designGalleryRecipeCoverage).toContain("Jelly presentation");
  expect(designGalleryRecipeCoverage).toContain("dither surface");
  expect(designGalleryRecipeCoverage).toContain("plain site and publication grammar");
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
  expect(html).toContain("hraness-design-bar-list-chart");
  expect(html).toContain("hraness-design-production-data-preview-notice");
  expect(html).toContain("hraness-design-dither-surface");
  expect(html).toContain('data-density="medium"');
  expect(html).toContain('data-gallery-dither=""');
  expect(html).toContain('class="design-gallery__plain-link-example"');
  expect(html).toContain('class="plain-header__inner" data-layout="responsive-wrap"');
  expect(html).toContain('class="plain-wordmark"');
  expect(html).toContain("project-name.example");
  expect(html).toContain(">blue links</a> stay quiet until interaction.");
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
