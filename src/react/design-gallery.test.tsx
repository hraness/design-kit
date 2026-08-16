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
  expect(designGalleryRecipeCoverage).toContain("plain site and publication grammar");
  expect(designGalleryRecipeCoverage).toContain("production preview notice");
  expect(designGalleryTouchKinds).toEqual(["button", "link", "radio", "range"]);
});

test("the gallery is product-neutral and server renderable", () => {
  const html = renderToStaticMarkup(<DesignSystemGallery />);

  expect(html).toContain("Presentation and composition reference");
  expect(html).toContain("@hraness/design-kit");
  expect(html).toContain("hraness-design-app-shell");
  expect(html).toContain("hraness-design-bar-list-chart");
  expect(html).toContain("hraness-design-production-data-preview-notice");
  expect(html).toContain('class="design-gallery__plain-link-example"');
  expect(html).toContain('class="plain-header__inner" data-layout="responsive-wrap"');
  expect(html).toContain('class="plain-wordmark"');
  expect(html).toContain("project-name.example");
  expect(html).toContain(">blue links</a> stay quiet until interaction.");
});

test("system appearance resolves from the supplied media preference", () => {
  expect(resolveGalleryTheme("system", true)).toBe("dark");
  expect(resolveGalleryTheme("system", false)).toBe("light");
  expect(resolveGalleryTheme("light", true)).toBe("light");
});
