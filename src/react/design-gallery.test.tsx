import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DesignSystemGallery,
  designGalleryRecipeCoverage,
  designGallerySections,
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
  expect(designGalleryRecipeCoverage).toContain("production preview notice");
});

test("the gallery is product-neutral and server renderable", () => {
  const html = renderToStaticMarkup(<DesignSystemGallery />);

  expect(html).toContain("Presentation and composition reference");
  expect(html).toContain("@hraness/design-kit");
  expect(html).toContain("hraness-design-app-shell");
  expect(html).toContain("hraness-design-bar-list-chart");
  expect(html).toContain("hraness-design-production-data-preview-notice");
});

test("system appearance resolves from the supplied media preference", () => {
  expect(resolveGalleryTheme("system", true)).toBe("dark");
  expect(resolveGalleryTheme("system", false)).toBe("light");
  expect(resolveGalleryTheme("light", true)).toBe("light");
});
