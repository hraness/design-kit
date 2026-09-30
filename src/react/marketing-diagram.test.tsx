import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { parseHTML } from "linkedom";
import { DiagramArrowhead, MarketingDiagram } from "./marketing-diagram";

test("diagram frames keep an accessible name and a stroke-sized-independent arrowhead", () => {
  const { document } = parseHTML(renderToStaticMarkup(<MarketingDiagram width={720} height={216} label="Sources flow to a local workspace."><defs><DiagramArrowhead id="source-arrow" /></defs><path d="M0 3H24" markerEnd="url(#source-arrow)" /></MarketingDiagram>));
  expect(document.querySelector('[role="region"]')?.getAttribute("tabindex")).toBe("0");
  expect(document.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Sources flow to a local workspace.");
  expect(document.querySelector("marker")?.getAttribute("markerUnits")).toBe("userSpaceOnUse");
  expect(document.querySelector("marker")?.getAttribute("markerWidth")).toBe("6");
  expect(document.querySelector("marker path")?.getAttribute("fill")).toBe("context-stroke");
  expect(document.querySelector("figcaption")).toBeNull();
  expect(() => renderToStaticMarkup(<DiagramArrowhead id="bad id" />)).toThrow();
  expect(() => renderToStaticMarkup(<MarketingDiagram width={0} height={2} label="X">X</MarketingDiagram>)).toThrow();
});
