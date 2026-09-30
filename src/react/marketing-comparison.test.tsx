import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";
import { MarketingComparison } from "./marketing-comparison";

test("comparison matrices keep conditional claims visible and navigation native", () => {
  const html = renderToStaticMarkup(<MarketingComparison caption="Storage and cost" highlight={0} options={[{ name: "Relay", mark: "/relay.svg" }, { name: "Hosted" }]} rows={[
    { label: "Offline", values: [true, false] },
    { label: "Export", note: "Check the target format.", values: [true, { status: "depends", label: "Plan dependent", detail: "CSV on paid plans." }] },
    { label: "Hosting", values: [{ status: "optional" }, "Included"] },
    { label: "Integrations", values: ["partial", { status: "partial", label: "Some providers" }] },
  ]} note="Reviewed today." />);
  const { document } = parseHTML(html);
  expect(document.querySelector("caption")?.textContent).toBe("Storage and cost");
  expect(document.querySelector('[role="region"]')?.getAttribute("tabindex")).toBe("0");
  expect(document.querySelectorAll('th[scope="row"]')).toHaveLength(4);
  expect(document.querySelectorAll('th[scope="col"]')).toHaveLength(2);
  expect(document.querySelectorAll("[data-highlight]")).toHaveLength(5);
  expect(document.querySelector('[data-comparison-status="depends"]')?.textContent).toContain("Plan dependent");
  expect(document.querySelector('[data-comparison-status="depends"]')?.textContent).toContain("CSV on paid plans.");
  expect(document.querySelector('[data-comparison-status="optional"]')?.textContent).toBe("Optional");
  expect(document.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(7);
  expect(document.querySelectorAll("[style], button, script")).toHaveLength(0);
  expect(html).toContain("Reviewed today.");
});

test("comparison matrices reject ambiguous rows or invalid highlighted columns", () => {
  const options = [{ name: "Relay" }];
  expect(() => renderToStaticMarkup(<MarketingComparison caption="" options={options} rows={[]} />)).toThrow();
  expect(() => renderToStaticMarkup(<MarketingComparison caption="Test" options={[]} rows={[]} />)).toThrow();
  expect(() => renderToStaticMarkup(<MarketingComparison caption="Test" options={options} highlight={1} rows={[]} />)).toThrow();
  expect(() => renderToStaticMarkup(<MarketingComparison caption="Test" options={options} rows={[{ label: "X", values: [] }]} />)).toThrow();
});
