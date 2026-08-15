import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { PhaserDots } from "./phaser-dots";

test("PhaserDots is an inert, unfocusable decorative layer", () => {
  const markup = renderToStaticMarkup(<PhaserDots mouseGlow />);

  expect(markup).toContain('aria-hidden="true"');
  expect(markup).toContain('inert=""');
  expect(markup).toContain('role="presentation"');
  expect(markup).not.toContain("tabindex");
  expect(markup).not.toContain("<button");
});
