import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ProductionDataPreviewNotice } from "./production-data-preview-notice";

test("the production data notice is gated by a non-empty deployment origin", () => {
  expect(renderToStaticMarkup(<ProductionDataPreviewNotice />)).toBe("");
  expect(renderToStaticMarkup(
    <ProductionDataPreviewNotice surfaceOrigin="" />,
  )).toBe("");

  const html = renderToStaticMarkup(
    <ProductionDataPreviewNotice surfaceOrigin="https://preview.example.test" />,
  );

  expect(html).toContain('class="hraness-design-production-data-preview-notice"');
  expect(html).toContain('role="alert"');
  expect(html).toContain('aria-label="Production data preview warning"');
  expect(html).toContain("<strong>Production data preview</strong>");
  expect(html).toContain(
    "This preview uses production data. Actions are real and affect production.",
  );
  expect(html).not.toContain("preview.example.test");
});
