import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import { renderToStaticMarkup } from "react-dom/server";

import { BarListChart, RadarProfileChart, RangePlotChart } from "./charts";
import { chartStyles } from "./charts.stylex";

function classTokens(markup: string, stableClass: string): readonly string[] {
  const classValue = [...markup.matchAll(/class="([^"]+)"/gu)]
    .map((match) => match[1] ?? "")
    .find((value) => value.split(" ").includes(stableClass));
  if (classValue === undefined) throw new Error(`Missing ${stableClass} class hook.`);
  return classValue.split(" ").filter(Boolean);
}

function atomicTokens(...styles: readonly stylex.CompiledStyles[]): readonly string[] {
  return stylex.props(...styles).className?.split(" ").filter(Boolean) ?? [];
}

test("bar lists keep exact values visible and expose native selectable rows", () => {
  const html = renderToStaticMarkup(
    <BarListChart
      aria-label="Model performance"
      className="consumer-chart"
      data={[
        { color: "#4f8de8", detail: "$2.10", id: "one", label: "Model one", value: 72.4 },
        { color: "#ee744f", detail: "$5.20", id: "two", label: "Model two", value: 68.1 },
      ]}
      domain={[0, 100]}
      formatValue={(value) => value.toFixed(1)}
      onSelectionChange={() => undefined}
      selectedId="one"
    />,
  );

  expect(html).toContain("Model performance");
  expect(html).toContain("Model one");
  expect(html).toContain("72.4");
  expect(html).toContain("$2.10");
  expect(html.match(/<button/g)).toHaveLength(2);
  expect(html).toContain('aria-pressed="true"');
  expect(html).toContain("--hraness-design-chart-value:72.4%");
  expect(classTokens(html, "hraness-design-bar-list-chart")).toEqual([
    "hraness-design-bar-list-chart",
    ...atomicTokens(chartStyles.root),
    "consumer-chart",
  ]);
  expect(classTokens(html, "hraness-design-chart-row")).toEqual([
    "hraness-design-chart-row",
    "hraness-design-chart-row--selectable",
    ...atomicTokens(
      chartStyles.row,
      chartStyles.selectableRow,
      chartStyles.selectedRow,
    ),
  ]);
  for (const [stableClass, recipe] of [
    ["hraness-design-bar-list-chart__rows", chartStyles.rows],
    ["hraness-design-chart-row__heading", chartStyles.heading],
    ["hraness-design-chart-row__label", chartStyles.label],
    ["hraness-design-chart-row__value", chartStyles.value],
    ["hraness-design-chart-row__detail", chartStyles.detail],
    ["hraness-design-bar-list-chart__track", chartStyles.track],
    ["hraness-design-bar-list-chart__bar", chartStyles.bar],
  ] as const) {
    expect(classTokens(html, stableClass)).toEqual([
      stableClass,
      ...atomicTokens(recipe),
    ]);
  }
});

test("radar profiles pair the decorative plot with exact tabular values", () => {
  const html = renderToStaticMarkup(
    <RadarProfileChart
      aria-label="Capability profiles"
      axes={[
        { id: "code", label: "Code" },
        { id: "terminal", label: "Terminal" },
        { id: "reasoning", label: "Reasoning" },
      ]}
      series={[
        {
          color: "#4f8de8",
          id: "one",
          label: "Model one",
          values: { code: 74.2, reasoning: 68.8, terminal: 81.5 },
        },
      ]}
      selectedId="one"
    />,
  );

  expect(html).toContain("hraness-design-radar-profile-chart");
  expect(html).toContain("<table");
  expect(html).toContain("<caption>Capability profiles</caption>");
  expect(html).toContain("<th scope=\"row\">Code</th>");
  expect(html).toContain("<td>74.2</td>");
  expect(html).toContain('data-selected="true"');
  expect(classTokens(html, "hraness-design-radar-profile-chart")).toEqual([
    "hraness-design-radar-profile-chart",
    ...atomicTokens(chartStyles.root),
  ]);
  expect(classTokens(html, "hraness-design-radar-profile-chart__plot")).toEqual([
    "hraness-design-radar-profile-chart__plot",
    ...atomicTokens(chartStyles.plot),
  ]);
  expect(classTokens(html, "hraness-design-radar-profile-chart__legend")).toEqual([
    "hraness-design-radar-profile-chart__legend",
    ...atomicTokens(chartStyles.legend),
  ]);
  expect(classTokens(html, "hraness-design-chart-row")).toEqual([
    "hraness-design-chart-row",
    ...atomicTokens(
      chartStyles.row,
      chartStyles.selectedRow,
      chartStyles.legendRow,
    ),
  ]);
  for (const token of atomicTokens(chartStyles.indicator)) {
    expect(html).toContain(token);
  }
  expect(html).toContain('style="background-color:#4f8de8"');
});

test("range plots label endpoints and the median marker without implying area", () => {
  const html = renderToStaticMarkup(
    <RangePlotChart
      aria-label="Provider ranges"
      data={[
        {
          color: "#4f8de8",
          detail: "4 options",
          id: "provider",
          label: "Provider",
          maximum: 82,
          median: 64,
          minimum: 38,
        },
      ]}
      formatValue={(value) => value.toFixed(0)}
    />,
  );

  expect(html).toContain("Provider ranges");
  expect(html).toContain("38–82");
  expect(html).toContain("4 options");
  expect(html).toContain("--hraness-design-chart-range-left:38%");
  expect(html).toContain("--hraness-design-chart-range-width:44%");
  expect(html).toContain("--hraness-design-chart-median:64%");
  expect(classTokens(html, "hraness-design-range-plot-chart")).toEqual([
    "hraness-design-range-plot-chart",
    ...atomicTokens(chartStyles.root),
  ]);
  expect(classTokens(html, "hraness-design-range-plot-chart__track")).toEqual([
    "hraness-design-range-plot-chart__track",
    ...atomicTokens(chartStyles.track, chartStyles.rangeTrack),
  ]);
  expect(classTokens(html, "hraness-design-range-plot-chart__range")).toEqual([
    "hraness-design-range-plot-chart__range",
    ...atomicTokens(chartStyles.range),
  ]);
  expect(classTokens(html, "hraness-design-range-plot-chart__median")).toEqual([
    "hraness-design-range-plot-chart__median",
    ...atomicTokens(chartStyles.median),
  ]);
});

test("charts reject blank names and invalid domains", () => {
  expect(() => renderToStaticMarkup(
    <BarListChart aria-label=" " data={[]} domain={[0, 1]} />,
  )).toThrow(TypeError);
  expect(() => renderToStaticMarkup(
    <RangePlotChart aria-label="Range" data={[]} domain={[1, 1]} />,
  )).toThrow(RangeError);
});

test("chart recipes are atomic while the layered CSS retains only the Recharts fallback", async () => {
  const [legacyCss, recipe] = await Promise.all([
    Bun.file(new URL("../charts.css", import.meta.url)).text(),
    Bun.file(new URL("./charts.stylex.ts", import.meta.url)).text(),
  ]);

  expect(legacyCss.trim()).toBe(`@layer components.hraness-design-kit.legacy {
  /* Recharts owns this generated SVG class, so the descendant overflow fix
   * remains an audited vendor fallback instead of an atomic recipe. */
  .hraness-design-radar-profile-chart__plot .recharts-surface {
    overflow: visible;
  }
}`);
  expect(recipe).toContain("export const chartBarRevealKeyframes = stylex.keyframes({");
  expect(recipe).toContain('const reducedMotion = "@media (prefers-reduced-motion: reduce)";');
  expect(recipe).toContain('const forcedColors = "@media (forced-colors: active)";');
  expect(recipe).toContain('backgroundColor: {');
  expect(recipe).toContain('backgroundImage: {');
  expect(recipe).toContain('animationName: {');
  expect(recipe).toContain('const selectableInteraction = ":is(:hover, :focus-visible)";');
  expect(recipe).toContain('[forcedColors]: "Canvas"');
  expect(recipe).toContain('[forcedColors]: "CanvasText"');
  expect(recipe).toContain('forcedColorAdjust: {');
  expect(recipe).toContain('transitionProperty: "background-color"');
  expect(recipe).not.toMatch(
    /^\s+(?:animation|background|border|font|inset|margin|outline|padding|transition):/gmu,
  );
  // Recharts and the native range/bar positions use physical SVG coordinates.
  expect(recipe).not.toMatch(/"(?:min-inline-size|min-block-size|inline-size|block-size)"/u);
});
