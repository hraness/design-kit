import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  StickyOffsetSync,
  measureStickyOffset,
  stickyOffsetCustomProperty,
} from "./sticky-offset";

test("StickyOffsetSync is a client-only helper with no server markup", () => {
  expect(renderToStaticMarkup(<StickyOffsetSync />)).toBe("");
  expect(renderToStaticMarkup(<StickyOffsetSync header=".hraness-marketing-header" />)).toBe("");
  expect(stickyOffsetCustomProperty).toBe("--hraness-sticky-offset");
  expect(typeof measureStickyOffset).toBe("function");
});
