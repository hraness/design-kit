import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ProductionDataPreviewNotice } from "./production-data-preview-notice";

function classNames(element: string, html: string): string[] {
  const match = new RegExp(`<${element}[^>]*class="([^"]+)"`, "u").exec(html);
  if (match?.[1] === undefined) throw new Error(`${element} has no rendered classes`);
  return match[1].split(" ").filter((name) => name.length > 0);
}

test("the production data notice is gated by a non-empty deployment origin", () => {
  expect(renderToStaticMarkup(<ProductionDataPreviewNotice />)).toBe("");
  expect(renderToStaticMarkup(
    <ProductionDataPreviewNotice surfaceOrigin="" />,
  )).toBe("");

  const html = renderToStaticMarkup(
    <ProductionDataPreviewNotice surfaceOrigin="https://preview.example.test" />,
  );

  const noticeClasses = classNames("aside", html);
  const emphasisClasses = classNames("strong", html);
  expect(noticeClasses).toContain("hraness-design-production-data-preview-notice");
  expect(
    noticeClasses.filter(
      (name) => name !== "hraness-design-production-data-preview-notice",
    ).length,
  ).toBeGreaterThan(0);
  expect(emphasisClasses.length).toBeGreaterThan(0);
  expect(emphasisClasses.every((name) => !noticeClasses.includes(name))).toBeTrue();
  expect(html).toContain('role="alert"');
  expect(html).toContain('aria-label="Production data preview warning"');
  expect(html).toContain(">Production data preview</strong>");
  expect(html).toContain(
    "This preview uses production data. Actions are real and affect production.",
  );
  expect(html).not.toContain("preview.example.test");
  expect(html).not.toContain("style=");
});
