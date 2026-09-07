import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { chromium, type Browser, type Page } from "playwright-core";

import {
  readStylexPackageManifest,
  type StylexRuleV1,
} from "@hraness/ui/stylex-build";
import { colors } from "../src/index.js";
import { themeColorSyncActiveAttribute } from "../src/react/theme-color-sync.js";
import { equalBackgroundValues, normalizeBackgroundPosition } from "./browser-css-parity.js";

interface LayoutEvidence {
  readonly animatedRailStageAtomic: boolean;
  readonly animatedRailStageCallerLast: boolean;
  readonly animatedRailStageMinInlineSize: string;
  readonly animatedRailStageMotionStyle: string;
  readonly animatedRailStageStageKey: string;
  readonly animatedRailStageTransform: string;
  readonly animatedRailStageTransitionProperty: string;
  readonly appearanceInHeader: boolean;
  readonly appearanceIsFinalAction: boolean;
  readonly appearancePresentation: string;
  readonly appearanceRightAligned: boolean;
  readonly appearanceTriggerLabel: string;
  readonly auroraContained: boolean;
  readonly auroraPosition: string;
  readonly chatAtomic: boolean;
  readonly chatCallerLast: boolean;
  readonly chatComposerAlignItems: string;
  readonly chatComposerColumnCount: number;
  readonly chatComposerDisplay: string;
  readonly chatComposerGap: string;
  readonly chatMessageDisplay: string;
  readonly chatMessageGap: string;
  readonly chatMessageColumnCount: number;
  readonly chatNoOwnedInlinePresentation: boolean;
  readonly chatRowsPresentation: boolean;
  readonly chatSemantic: boolean;
  readonly clientWidth: number;
  readonly copy: string;
  readonly dotsContained: boolean;
  readonly dotsPosition: string;
  readonly ditherBackgroundImage: string;
  readonly ditherDensity: string;
  readonly ditherHasInlineStyle: boolean;
  readonly ditherSize: string;
  readonly ditherUsesThemedSurface: boolean;
  readonly faderAtomic: boolean;
  readonly faderCallerLast: boolean;
  readonly faderCompactCustomProperties: readonly string[];
  readonly faderDefaultCustomProperties: readonly string[];
  readonly faderHorizontalDimensions: readonly string[];
  readonly faderInertRails: boolean;
  readonly faderNoOwnedInlinePresentation: boolean;
  readonly faderRailPresentation: readonly string[];
  readonly faderSemantic: boolean;
  readonly faderVerticalDimensions: readonly string[];
  readonly galleryPaddingLeft: number;
  readonly galleryPaddingRight: number;
  readonly heading: string;
  readonly headingClipped: boolean;
  readonly headingFontFamily: string;
  readonly horizontalFaderThumbCentered: boolean;
  readonly layoutBottomDisplay: string;
  readonly layoutDockBottom: string;
  readonly layoutDockContained: boolean;
  readonly layoutDockPosition: string;
  readonly layoutPageWidth: number;
  readonly layoutSurfacesAtomic: boolean;
  readonly layoutSurfacesSemantic: boolean;
  readonly layoutTopDisplay: string;
  readonly mobileTriggerDisplay: string;
  readonly monoFontFamily: string;
  readonly nebulaLoaded: boolean;
  readonly palette: readonly string[];
  readonly paletteValid: boolean;
  readonly playbackAlignItems: string;
  readonly playbackAtomic: boolean;
  readonly playbackCallerLast: boolean;
  readonly playbackDisplay: string;
  readonly playbackFlexWrap: string;
  readonly playbackGlyphBlockSize: string;
  readonly playbackGlyphHasInlineStyle: boolean;
  readonly playbackGlyphInlineSize: string;
  readonly playbackGap: string;
  readonly playbackHasInlineStyle: boolean;
  readonly playbackSemantic: boolean;
  readonly playbackStatus: string;
  readonly plainLinkDecoration: string;
  readonly plainHeaderChildrenContained: boolean;
  readonly plainHeaderHeight: number;
  readonly plainHeaderOverflows: boolean;
  readonly plainHeaderWrapped: boolean;
  readonly plainThemeHeight: number;
  readonly plainThemeMinHeight: string;
  readonly proportionalFontFamily: string;
  readonly proceduralAriaHidden: boolean;
  readonly proceduralCanvasCount: number;
  readonly proceduralCloudCount: number;
  readonly proceduralCoversEffect: boolean;
  readonly proceduralGridCount: number;
  readonly proceduralInert: boolean;
  readonly proceduralPointerEvents: string;
  readonly proceduralRippleCount: number;
  readonly proceduralVariant: string;
  readonly railDisplay: string;
  readonly scrollWidth: number;
  readonly verticalFaderThumbCentered: boolean;
}

interface ThemeColorEvidence {
  readonly activeContent: string;
  readonly activeHasMedia: boolean;
  readonly adaptiveMedia: readonly string[];
  readonly backgroundColor: string;
  readonly matchingColors: readonly string[];
  readonly ownedCount: number;
}

const layouts = [
  { height: 844, id: "compact", minimumEdgePadding: 20, width: 390 },
  { height: 720, id: "wide", minimumEdgePadding: 48, width: 1280 },
] as const;

const expectedHeading = "Presentation and composition reference";
const expectedCopy = "Portable controls come from @hraness/ui. This package adds application shells, charts, effects, syntax, haptics, and optional Jelly paint.";
const appearancePortalCanary = {
  accent: "rgb(89, 45, 168)",
  accentForeground: "rgb(255, 255, 255)",
  className: "design-gallery-appearance-portal-canary",
  popover: "rgb(17, 31, 47)",
  popoverForeground: "rgb(246, 248, 250)",
} as const;

function invariant(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

// Exact pre-migration charts.css from 87b3eada2e9c1884f6293274f844b08a80c9917d.
// SHA-256: 406f148b88ae75131ebcf4e4bba63e6b4c4013dc74f863135c2ce9f3384f8c8d.
// This oracle never imports recipes, manifests, or generated component CSS.
const rawChartParityCss = String.raw`.hraness-design-bar-list-chart,
.hraness-design-range-plot-chart,
.hraness-design-radar-profile-chart {
  min-width: 0;
  color: var(--foreground);
  font-family: var(--font-text);
}

.hraness-design-bar-list-chart__rows,
.hraness-design-range-plot-chart__rows {
  display: grid;
  gap: var(--space-2);
}

.hraness-design-chart-row {
  display: grid;
  min-width: 0;
  padding: var(--space-2);
  color: inherit;
  font: inherit;
  gap: var(--space-1);
  text-align: start;
}

.hraness-design-chart-row--selectable {
  width: 100%;
  min-height: var(--interactive-target-min);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  transition: background-color var(--motion-duration-fast) var(--motion-easing-standard);
}

.hraness-design-chart-row--selectable:is(:hover, :focus-visible),
.hraness-design-chart-row[data-selected] {
  background: color-mix(in oklch, var(--foreground) 7%, transparent);
}

.hraness-design-chart-row--selectable:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 1px;
}

.hraness-design-chart-row__heading {
  display: flex;
  min-width: 0;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.hraness-design-chart-row__label {
  overflow: hidden;
  font-size: var(--text-caption);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hraness-design-chart-row__value {
  flex: 0 0 auto;
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  font-variant-numeric: tabular-nums;
}

.hraness-design-chart-row__detail {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.hraness-design-bar-list-chart__track,
.hraness-design-range-plot-chart__track {
  position: relative;
  display: block;
  overflow: hidden;
  width: 100%;
  height: 8px;
  border-radius: var(--radius-round);
  background: color-mix(in oklch, var(--foreground) 8%, transparent);
}

.hraness-design-bar-list-chart__bar {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--hraness-design-chart-value);
  border-radius: inherit;
  background:
    linear-gradient(
      90deg,
      color-mix(in oklch, var(--hraness-design-chart-color) 55%, transparent),
      var(--hraness-design-chart-color)
    );
  box-shadow: 0 0 18px color-mix(in oklch, var(--hraness-design-chart-color) 20%, transparent);
  transform-origin: left center;
  animation: hraness-design-chart-bar-reveal var(--motion-duration-slow) var(--motion-easing-emphasized) both;
}

.hraness-design-range-plot-chart__track {
  overflow: visible;
  height: 2px;
  margin-block: 5px;
}

.hraness-design-range-plot-chart__range {
  position: absolute;
  top: 50%;
  left: var(--hraness-design-chart-range-left);
  width: var(--hraness-design-chart-range-width);
  height: 5px;
  border-radius: var(--radius-round);
  background: var(--hraness-design-chart-color);
  opacity: 0.64;
  transform: translateY(-50%);
}

.hraness-design-range-plot-chart__median {
  position: absolute;
  top: 50%;
  left: var(--hraness-design-chart-median);
  width: 10px;
  height: 10px;
  border: 2px solid var(--background);
  border-radius: 50%;
  background: var(--hraness-design-chart-color);
  box-shadow: 0 0 0 1px color-mix(in oklch, var(--foreground) 42%, transparent);
  transform: translate(-50%, -50%);
}

.hraness-design-radar-profile-chart__plot {
  width: 100%;
  height: clamp(250px, 30vw, 320px);
  min-height: 250px;
}

.hraness-design-radar-profile-chart__plot .recharts-surface {
  overflow: visible;
}

.hraness-design-radar-profile-chart__legend {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-2);
}

.hraness-design-radar-profile-chart__legend > .hraness-design-chart-row {
  display: inline-flex;
  width: auto;
  min-height: var(--interactive-target-compact);
  flex: 0 1 auto;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-round);
  font-size: 11px;
}

.hraness-design-radar-profile-chart__legend i,
.hraness-design-chart-tooltip i {
  display: inline-block;
  width: 12px;
  height: 4px;
  flex: 0 0 auto;
  border-radius: var(--radius-round);
}

.hraness-design-chart-tooltip {
  min-width: 152px;
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--popover) 94%, transparent);
  box-shadow: var(--elevation-overlay);
  color: var(--popover-foreground);
  font-size: var(--text-caption);
}

.hraness-design-chart-tooltip > strong {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
}

.hraness-design-chart-tooltip dl {
  display: grid;
  gap: var(--space-1);
  margin: 0;
}

.hraness-design-chart-tooltip dl > div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-4);
}

.hraness-design-chart-tooltip dt {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-2);
  color: var(--muted);
}

.hraness-design-chart-tooltip dd {
  margin: 0;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

@keyframes hraness-design-chart-bar-reveal {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .hraness-design-bar-list-chart__bar {
    animation: none;
  }
}

@media (forced-colors: active) {
  .hraness-design-bar-list-chart__track,
  .hraness-design-range-plot-chart__track,
  .hraness-design-bar-list-chart__bar,
  .hraness-design-range-plot-chart__range,
  .hraness-design-range-plot-chart__median {
    border: 1px solid CanvasText;
    background: Canvas;
    forced-color-adjust: auto;
  }
}
`;

async function requireMigrationParity(browser: Browser, origin: string): Promise<void> {
  const environments = [
    { name: "horizontal-ltr", writingMode: "horizontal-tb", direction: "ltr", forced: false },
    { name: "horizontal-rtl", writingMode: "horizontal-tb", direction: "rtl", forced: false },
    { name: "vertical-rl", writingMode: "vertical-rl", direction: "ltr", forced: false },
    { name: "vertical-lr-rtl", writingMode: "vertical-lr", direction: "rtl", forced: false },
    { name: "forced-colors", writingMode: "horizontal-tb", direction: "ltr", forced: true },
  ] as const;
  const borderTargets = [
    ".hraness-design-theme-toggle__trigger", ".hraness-design-theme-toggle__popover",
    "[data-parity-live] .hraness-design-chart-row--selectable",
    "[data-parity-live] .hraness-design-chart-tooltip",
    "[data-parity-live] .hraness-design-range-plot-chart__median",
    ".hraness-design-procedural-backdrop__ripple",
    "[data-parity-live] .hraness-design-bar-list-chart__bar",
    "[data-parity-live] .hraness-design-bar-list-chart__track",
    "[data-parity-live] .hraness-design-range-plot-chart__track",
    "[data-parity-live] .hraness-design-range-plot-chart__range",
    ".hraness-design-jelly-surface", "[data-parity-border-control]",
  ];
  for (const environment of environments) {
    const page = await browser.newPage({
      colorScheme: "light", forcedColors: environment.forced ? "active" : "none",
      reducedMotion: "reduce", viewport: { height: 900, width: 1180 },
    });
    const failures: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
    page.on("pageerror", (error) => failures.push(error.message));
    try {
      await page.goto(`${origin}/?migration-parity`, { waitUntil: "networkidle" });
      await page.locator("[data-migration-parity]").waitFor();
      await page.addStyleTag({ content: `
        [data-migration-parity] { display: grid; grid-template-columns: 430px 430px; gap: 30px; padding: 20px; }
        [data-parity-live], [data-parity-raw] { width: 430px; }
        [data-parity-live] > figure, [data-parity-raw] > figure {
          width: 430px; height: 500px; margin: 0;
          writing-mode: ${environment.writingMode}; direction: ${environment.direction};
        }
        [data-parity-controls] { grid-column: 1 / -1; display: grid; gap: 16px; justify-items: start; }
        /* The wrapper keeps the inline-flex root out of grid-item blockification. */
        [data-parity-segmented-inline] { display: block; }
        [data-parity-shell] { width: 430px; height: 120px; }
        [data-parity-shell] .hraness-design-app-shell__rail, [data-parity-rail-control], [data-parity-system-color] { forced-color-adjust: none; }
        [data-parity-system-color] { color: CanvasText; }
        @layer components.hraness-design-kit.legacy {
          @scope ([data-parity-raw]) { ${rawChartParityCss} }
        }
        @layer base {
          [data-parity-shell] .hraness-design-app-shell__rail, [data-parity-rail-control] {
            border-top-color: red; border-right-color: blue;
            border-bottom-color: green; border-left-color: yellow;
          }
          ${borderTargets.join(",")} {
            border-image-source: linear-gradient(red, blue); border-image-slice: 7;
            border-image-width: 3; border-image-outset: 2; border-image-repeat: round;
          }
        }
      ` });
      await page.evaluate(() => {
        const raw = document.querySelector("[data-parity-raw]");
        if (!(raw instanceof HTMLElement)) throw new Error("Missing raw chart fixture");
        let removed = 0;
        for (const node of raw.querySelectorAll("[class]")) {
          for (const name of [...node.classList]) if (/^x[\da-z]+$/u.test(name)) {
            node.classList.remove(name);
            removed += 1;
          }
        }
        if (removed < 100) throw new Error(`Raw chart oracle removed only ${String(removed)} atoms`);
      });
      await page.evaluate(async () => { await document.fonts.ready; });
      await page.waitForFunction(() => ["[data-parity-live]", "[data-parity-raw]"].every((selector) => {
        const plot = document.querySelector(`${selector} .hraness-design-radar-profile-chart__plot`);
        const svg = plot?.querySelector("svg.recharts-surface");
        return plot instanceof HTMLElement && svg instanceof SVGSVGElement
          && plot.clientWidth > 0 && plot.clientHeight > 0
          && Math.abs(Number(svg.getAttribute("width")) - plot.clientWidth) < 1
          && Math.abs(Number(svg.getAttribute("height")) - plot.clientHeight) < 1
          && (plot.querySelector(".recharts-radar-polygon path.recharts-polygon")?.getAttribute("d")?.length ?? 0) > 10;
      }));
      const geometry = await page.evaluate((expected) => {
        const selectors = [
          ".hraness-design-bar-list-chart", ".hraness-design-range-plot-chart", ".hraness-design-radar-profile-chart",
          ".hraness-design-chart-row", ".hraness-design-chart-row__heading", ".hraness-design-radar-profile-chart__legend",
          ".hraness-design-radar-profile-chart__plot", ".hraness-design-bar-list-chart__track",
          ".hraness-design-bar-list-chart__bar", ".hraness-design-range-plot-chart__track",
          ".hraness-design-range-plot-chart__range", ".hraness-design-range-plot-chart__median",
        ];
        const read = (selector: string) => {
          const host = document.querySelector(selector);
          if (!(host instanceof HTMLElement)) throw new Error("Missing parity host");
          const result: Record<string, unknown> = {};
          for (const target of selectors) {
            const nodes = [...host.querySelectorAll(target)];
            if (nodes.length === 0) throw new Error(`Empty chart oracle selector ${target}`);
            result[target] = nodes.map((node) => {
              const style = getComputedStyle(node);
              const bounds = node.getBoundingClientRect();
              const parent = node.parentElement?.getBoundingClientRect();
              return {
                minWidth: style.minWidth, minHeight: style.minHeight, width: style.width, height: style.height,
                // Physical chart positions are relative to their actual parent, including RTL/vertical cases.
                x: Math.round((bounds.x - (parent?.x ?? 0)) * 100) / 100,
                y: Math.round((bounds.y - (parent?.y ?? 0)) * 100) / 100,
                rectWidth: bounds.width, rectHeight: bounds.height,
              };
            });
          }
          const figure = host.querySelector("figure");
          if (!(figure instanceof HTMLElement)) throw new Error("Missing chart figure");
          const mode = getComputedStyle(figure);
          if (mode.writingMode !== expected.writingMode || mode.direction !== expected.direction) throw new Error("Writing environment did not activate");
          const plot = host.querySelector(".hraness-design-radar-profile-chart__plot");
          if (!(plot instanceof HTMLElement)) throw new Error("Missing chart plot");
          if (plot.clientWidth !== 430 || plot.clientHeight !== 320) throw new Error(`Non-square physical plot changed: ${plot.clientWidth}x${plot.clientHeight}`);
          const polygons = [...plot.querySelectorAll(".recharts-radar-polygon path.recharts-polygon")].map((node) => node.getAttribute("d"));
          if (polygons.length !== 1 || !polygons[0]?.startsWith("M") || !polygons[0].endsWith("Z")
            || (polygons[0].match(/L/gu)?.length ?? 0) < 2) throw new Error("Genuine Recharts polygon did not render");
          result.polygons = polygons;
          return result;
        };
        if (matchMedia("(forced-colors: active)").matches !== expected.forced
          || !matchMedia("(prefers-reduced-motion: reduce)").matches) throw new Error("Media environment did not activate");
        return { live: read("[data-parity-live]"), raw: read("[data-parity-raw]") };
      }, environment);
      invariant(JSON.stringify(geometry.live) === JSON.stringify(geometry.raw), `${environment.name}: raw/compiled chart coordinate mismatch ${JSON.stringify(geometry)}`);
      const segmented = await page.locator('[data-presentation="segmented"]').evaluate((node) => ({
        display: getComputedStyle(node).display, minInlineSize: getComputedStyle(node).minInlineSize,
        callerLast: node.classList.item(node.classList.length - 1), radios: node.querySelectorAll('input[type="radio"]').length,
      }));
      invariant(segmented.display === "inline-flex" && segmented.minInlineSize === "0px"
        && segmented.callerLast === "parity-segmented-caller" && segmented.radios === 3,
      `${environment.name}: segmented root parity ${JSON.stringify(segmented)}`);
      if (environment.forced) {
        const railColors = await page.evaluate(() => {
          const read = (selector: string) => {
            const node = document.querySelector(selector);
            if (!(node instanceof HTMLElement)) throw new Error(`Missing rail color oracle ${selector}`);
            const style = getComputedStyle(node);
            return [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor];
          };
          const reference = document.querySelector("[data-parity-system-color]");
          if (!(reference instanceof HTMLElement)) throw new Error("Missing system color oracle");
          return {
            actual: read("[data-parity-shell] .hraness-design-app-shell__rail"),
            control: read("[data-parity-rail-control]"),
            expected: getComputedStyle(reference).color,
          };
        });
        invariant(railColors.actual.length === 4 && railColors.actual.every((color) => color === railColors.expected),
          `Forced-color rail lost a physical edge: ${JSON.stringify(railColors)}`);
        invariant(new Set(railColors.control).size === 4 && railColors.control.every((color) => color !== railColors.expected),
          `Forced-color rail negative control did not survive: ${JSON.stringify(railColors)}`);
      }
      await page.locator('[data-presentation="segmented"]').getByText("Dark", { exact: true }).click();
      await page.locator('[data-presentation="segmented"][data-theme-value="dark"]').waitFor();
      invariant(await page.getByRole("radio", { name: "Dark", exact: true }).isChecked(), `${environment.name}: native segmented selection did not change`);

      // Real pointer input asks Recharts to render its owned tooltip. No copied
      // tooltip, forced state, or fake recipe can satisfy the border-image proof.
      const radar = page.locator("[data-parity-live] .recharts-wrapper");
      await radar.scrollIntoViewIfNeeded();
      for (const position of [{ x: 215, y: 65 }, { x: 215, y: 160 }, { x: 280, y: 195 }]) {
        await radar.hover({ position });
        await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        if (await page.locator("[data-parity-live] .hraness-design-chart-tooltip").isVisible()) break;
      }
      await page.locator("[data-parity-live] .hraness-design-chart-tooltip").waitFor({ state: "visible" });
      const tooltip = await page.locator("[data-parity-live] .hraness-design-chart-tooltip").evaluate((node) => ({
        minWidth: getComputedStyle(node).minWidth,
        terms: [...node.querySelectorAll("dt")].map((term) => getComputedStyle(term).minWidth),
      }));
      invariant(tooltip.minWidth === "152px" && tooltip.terms.length === 1 && tooltip.terms[0] === "0px", `${environment.name}: tooltip physical size ${JSON.stringify(tooltip)}`);
      const readBorders = async (selectors: readonly string[], expectReset: boolean) => {
        const values = await page.evaluate(({ targets }) => {
          const properties = ["border-image-source", "border-image-slice", "border-image-width", "border-image-outset", "border-image-repeat"];
          return targets.map((selector) => {
            const nodes = [...document.querySelectorAll(selector)];
            if (nodes.length === 0) throw new Error(`Empty border reset selector ${selector}`);
            return { selector, values: nodes.map((node) => properties.map((property) => getComputedStyle(node).getPropertyValue(property))) };
          });
        }, { targets: selectors });
        for (const entry of values) for (const value of entry.values) {
          if (expectReset) invariant(JSON.stringify(value) === JSON.stringify(["none", "100%", "1", "0", "stretch"]), `${environment.name}: ${entry.selector} full-border reset ${JSON.stringify(value)}`);
          else invariant(value[1] === "7" && value[2] === "3" && value[3] === "2" && value[4] === "round", `${environment.name}: ${entry.selector} canary did not survive ${JSON.stringify(value)}`);
        }
      };
      await readBorders(["[data-parity-border-control]"], false);
      await readBorders([
        "[data-parity-live] .hraness-design-chart-row--selectable", "[data-parity-live] .hraness-design-chart-tooltip",
        "[data-parity-live] .hraness-design-range-plot-chart__median", ".hraness-design-procedural-backdrop__ripple",
        ".hraness-design-theme-toggle__trigger",
      ], true);
      await page.locator(".hraness-design-jelly-surface:defined").waitFor();
      await readBorders([
        "[data-parity-live] .hraness-design-bar-list-chart__bar", "[data-parity-live] .hraness-design-bar-list-chart__track",
        "[data-parity-live] .hraness-design-range-plot-chart__track", "[data-parity-live] .hraness-design-range-plot-chart__range",
        ".hraness-design-jelly-surface",
      ], environment.forced);
      await page.getByRole("button", { name: "Parity appearance: Dark", exact: true }).click();
      await page.locator(".hraness-design-theme-toggle__popover").waitFor();
      await readBorders([".hraness-design-theme-toggle__popover"], true);
      await page.keyboard.press("Escape");
      invariant(failures.length === 0, `${environment.name}: ${failures.join("; ")}`);
      console.log(`Migration parity: ${environment.name}; 13 physical sizes, native SVG coordinates, segmented selection, 10 border owners (five reset longhands).`);
    } finally {
      await page.close();
    }
  }
}

async function waitForFaderFocusPresentation(
  page: Page,
  thumbSelector: string,
): Promise<void> {
  await page.waitForFunction(
    (selector) => {
      const thumb = document.querySelector(selector);
      if (!(thumb instanceof HTMLElement) || !thumb.hasAttribute("data-focus-visible")) {
        return false;
      }
      const style = getComputedStyle(thumb);
      return style.outlineStyle === "solid"
        && Number.parseFloat(style.outlineWidth) === 3
        && Number.parseFloat(style.outlineOffset) === 3;
    },
    thumbSelector,
    { polling: "raf", timeout: 2_000 },
  );
}

interface CssAtRule {
  readonly name: string;
  readonly prelude: string;
}

interface CssRuleRange {
  readonly ancestry: readonly CssAtRule[];
  readonly body: string;
  readonly end: number;
  readonly selector: string;
  readonly start: number;
}

interface CssDeclaration {
  readonly name: string;
  readonly value: string;
}

interface SerializedPriorityContract {
  readonly blockLayers: readonly string[];
  readonly layerInventory: readonly string[];
  readonly priorityByRuleKey: ReadonlyMap<string, string>;
  readonly rawPrioritiesByRank: readonly (readonly number[])[];
}

function serializedPriorityContract(
  rules: readonly StylexRuleV1[],
  prefix: string,
  label: string,
): SerializedPriorityContract {
  const emittedRules = rules.filter(([, value]) => value.constKey === undefined);
  invariant(emittedRules.length > 0, `${label} has no emitted StyleX rules.`);
  const rawPriorityLevels = [...new Set(
    emittedRules.map(([, , priority]) => Math.floor(priority / 1000)),
  )].sort((left, right) => left - right);
  const rawPrioritiesByRank = rawPriorityLevels.map((level) => [
    ...new Set(
      emittedRules
        .filter(([, , priority]) => Math.floor(priority / 1000) === level)
        .map(([, , priority]) => priority),
    ),
  ].sort((left, right) => left - right));
  const priorityByRuleKey = new Map<string, string>();
  for (const [key, , priority] of emittedRules) {
    const rank = rawPriorityLevels.indexOf(Math.floor(priority / 1000)) + 1;
    invariant(rank > 0, `${label} cannot rank ${key}.`);
    const serializedPriority = `priority${String(rank)}`;
    const previous = priorityByRuleKey.get(key);
    invariant(
      previous === undefined || previous === serializedPriority,
      `${label} assigns ${key} to inconsistent serialized priorities.`,
    );
    priorityByRuleKey.set(key, serializedPriority);
  }
  const layerInventory = rawPriorityLevels.map(
    (_level, index) => `${prefix}.priority${String(index + 1)}`,
  );
  const blockLayers = rawPrioritiesByRank.flatMap((priorities, index) =>
    (priorities[0] ?? 0) > 0 ? [layerInventory[index] ?? ""] : []);
  invariant(
    blockLayers.every((layer) => layer.length > 0),
    `${label} produced an incomplete serialized priority inventory.`,
  );
  return { blockLayers, layerInventory, priorityByRuleKey, rawPrioritiesByRank };
}

function matchingCssBrace(source: string, openBrace: number, label: string): number {
  let depth = 0;
  let escaped = false;
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  let stringQuote: '"' | "'" | undefined;

  for (let index = openBrace; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === undefined) continue;
    if (stringQuote !== undefined) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === stringQuote) stringQuote = undefined;
      continue;
    }
    if (character === "/" && nextCharacter === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      if (commentEnd < 0) throw new Error(`${label} contains an unterminated comment.`);
      index = commentEnd + 1;
      continue;
    }
    if (character === "\\") {
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") stringQuote = character;
    else if (character === "(") parenthesisDepth += 1;
    else if (character === ")") parenthesisDepth = Math.max(0, parenthesisDepth - 1);
    else if (character === "[") bracketDepth += 1;
    else if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (character === "{" && parenthesisDepth === 0 && bracketDepth === 0) depth += 1;
    else if (character === "}" && parenthesisDepth === 0 && bracketDepth === 0) {
      depth -= 1;
      if (depth === 0) return index;
      if (depth < 0) break;
    }
  }
  throw new Error(`${label} contains an unterminated CSS block.`);
}

function removeCssComments(source: string, label: string): string {
  let result = "";
  let escaped = false;
  let stringQuote: '"' | "'" | undefined;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === undefined) continue;
    if (stringQuote !== undefined) {
      result += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === stringQuote) stringQuote = undefined;
      continue;
    }
    if (character === "/" && nextCharacter === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      invariant(commentEnd >= 0, `${label} contains an unterminated comment.`);
      index = commentEnd + 1;
      continue;
    }
    result += character;
    if (character === '"' || character === "'") stringQuote = character;
    else if (character === "\\" && nextCharacter !== undefined) {
      result += nextCharacter;
      index += 1;
    }
  }
  invariant(stringQuote === undefined, `${label} contains an unterminated string.`);
  return result;
}

function decodeCssEscapes(source: string, label: string): string {
  let result = "";
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character !== "\\") {
      result += character ?? "";
      continue;
    }
    const nextCharacter = source[index + 1];
    if (nextCharacter === undefined) {
      result += "\uFFFD";
      continue;
    }
    if (/[0-9A-Fa-f]/u.test(nextCharacter)) {
      let hexadecimal = "";
      let cursor = index + 1;
      while (cursor < source.length
        && hexadecimal.length < 6
        && /[0-9A-Fa-f]/u.test(source[cursor] ?? "")) {
        hexadecimal += source[cursor];
        cursor += 1;
      }
      const codePoint = Number.parseInt(hexadecimal, 16);
      result += codePoint === 0 || codePoint > 0x10_FFFF
        || (codePoint >= 0xD800 && codePoint <= 0xDFFF)
        ? "\uFFFD"
        : String.fromCodePoint(codePoint);
      if (source[cursor] === "\r" && source[cursor + 1] === "\n") cursor += 2;
      else if (/[\t\n\f\r ]/u.test(source[cursor] ?? "")) cursor += 1;
      index = cursor - 1;
      continue;
    }
    invariant(
      !/[\n\f\r]/u.test(nextCharacter),
      `${label} contains an invalid escaped newline in a CSS identifier.`,
    );
    result += nextCharacter;
    index += 1;
  }
  return result;
}

function cssTopLevelSegments(
  source: string,
  separator: "," | ";",
  label: string,
): string[] {
  const segments: string[] = [];
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  let segmentStart = 0;
  let escaped = false;
  let stringQuote: '"' | "'" | undefined;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === undefined) continue;
    if (stringQuote !== undefined) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === stringQuote) stringQuote = undefined;
      continue;
    }
    if (character === "/" && nextCharacter === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      invariant(commentEnd >= 0, `${label} contains an unterminated comment.`);
      index = commentEnd + 1;
      continue;
    }
    if (character === "\\") index += 1;
    else if (character === '"' || character === "'") stringQuote = character;
    else if (character === "(") parenthesisDepth += 1;
    else if (character === ")") parenthesisDepth = Math.max(0, parenthesisDepth - 1);
    else if (character === "[") bracketDepth += 1;
    else if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (character === separator && parenthesisDepth === 0 && bracketDepth === 0) {
      segments.push(source.slice(segmentStart, index));
      segmentStart = index + 1;
    } else if ((character === "{" || character === "}")
      && parenthesisDepth === 0
      && bracketDepth === 0) {
      throw new Error(`${label} nests an unexpected CSS block.`);
    }
  }
  invariant(stringQuote === undefined, `${label} contains an unterminated string.`);
  invariant(parenthesisDepth === 0 && bracketDepth === 0, `${label} is unbalanced.`);
  segments.push(source.slice(segmentStart));
  return segments;
}

function cssTopLevelColon(source: string, label: string): number {
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  let escaped = false;
  let stringQuote: '"' | "'" | undefined;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === undefined) continue;
    if (stringQuote !== undefined) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === stringQuote) stringQuote = undefined;
      continue;
    }
    if (character === "/" && nextCharacter === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      invariant(commentEnd >= 0, `${label} contains an unterminated comment.`);
      index = commentEnd + 1;
      continue;
    }
    if (character === "\\") index += 1;
    else if (character === '"' || character === "'") stringQuote = character;
    else if (character === "(") parenthesisDepth += 1;
    else if (character === ")") parenthesisDepth = Math.max(0, parenthesisDepth - 1);
    else if (character === "[") bracketDepth += 1;
    else if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (character === ":" && parenthesisDepth === 0 && bracketDepth === 0) return index;
  }
  return -1;
}

function cssDeclarations(body: string, label: string): CssDeclaration[] {
  return cssTopLevelSegments(body, ";", label).flatMap((rawDeclaration) => {
    const declaration = removeCssComments(rawDeclaration, label).trim();
    if (declaration.length === 0) return [];
    const colon = cssTopLevelColon(declaration, label);
    invariant(colon > 0, `${label} contains a malformed CSS declaration.`);
    return [{
      name: decodeCssEscapes(
        declaration.slice(0, colon).trim(),
        label,
      ).toLowerCase(),
      value: declaration.slice(colon + 1).trim(),
    }];
  });
}

function nextCssStatementDelimiter(
  source: string,
  start: number,
  end: number,
  label: string,
): { readonly character: "{" | ";"; readonly index: number } | undefined {
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  let escaped = false;
  let stringQuote: '"' | "'" | undefined;
  for (let index = start; index < end; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === undefined) continue;
    if (stringQuote !== undefined) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === stringQuote) stringQuote = undefined;
      continue;
    }
    if (character === "/" && nextCharacter === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      invariant(commentEnd >= 0 && commentEnd < end, `${label} contains an unterminated comment.`);
      index = commentEnd + 1;
      continue;
    }
    if (character === "\\") index += 1;
    else if (character === '"' || character === "'") stringQuote = character;
    else if (character === "(") parenthesisDepth += 1;
    else if (character === ")") parenthesisDepth = Math.max(0, parenthesisDepth - 1);
    else if (character === "[") bracketDepth += 1;
    else if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if ((character === "{" || character === ";")
      && parenthesisDepth === 0
      && bracketDepth === 0) {
      return { character, index };
    }
  }
  invariant(stringQuote === undefined, `${label} contains an unterminated string.`);
  return undefined;
}

function cssLeafRules(css: string, label: string): CssRuleRange[] {
  const rules: CssRuleRange[] = [];
  const scanBlock = (
    bodyStart: number,
    bodyEnd: number,
    ancestry: readonly CssAtRule[],
  ): void => {
    let cursor = bodyStart;
    while (cursor < bodyEnd) {
      const remainder = css.slice(cursor, bodyEnd);
      const trivia = remainder.match(/^(?:\s|\/\*[\s\S]*?\*\/)+/u)?.[0] ?? "";
      cursor += trivia.length;
      if (cursor >= bodyEnd) return;
      const delimiter = nextCssStatementDelimiter(css, cursor, bodyEnd, label);
      if (delimiter === undefined) return;
      if (delimiter.character === ";") {
        cursor = delimiter.index + 1;
        continue;
      }
      const prelude = removeCssComments(css.slice(cursor, delimiter.index), label).trim();
      invariant(prelude.length > 0, `${label} contains an empty CSS block prelude.`);
      const closeBrace = matchingCssBrace(css, delimiter.index, label);
      invariant(closeBrace <= bodyEnd, `${label} closes a CSS block outside its parent.`);
      if (prelude.startsWith("@")) {
        const atRule = prelude.match(/^@([A-Za-z-]+)\s*([\s\S]*)$/u);
        invariant(atRule !== null, `${label} contains a malformed at-rule prelude.`);
        scanBlock(delimiter.index + 1, closeBrace, [
          ...ancestry,
          {
            name: (atRule[1] ?? "").toLowerCase(),
            prelude: (atRule[2] ?? "").trim(),
          },
        ]);
      } else {
        rules.push({
          ancestry,
          body: css.slice(delimiter.index + 1, closeBrace),
          end: closeBrace + 1,
          selector: prelude,
          start: cursor,
        });
      }
      cursor = closeBrace + 1;
    }
  };
  scanBlock(0, css.length, []);
  return rules;
}

function requireManifestRuleAncestry(
  rule: CssRuleRange,
  priorityByRuleKey: ReadonlyMap<string, string>,
  prefix: string,
  label: string,
): string {
  const ruleKeys = [...new Set(
    cssTopLevelSegments(rule.selector, ",", label).flatMap((member) => {
      const selector = decodeCssEscapes(removeCssComments(member, label), label).trim();
      const match = selector.match(/^\.([A-Za-z0-9_-]+)(?:\.\1)?$/u);
      const key = match?.[1];
      return key !== undefined && priorityByRuleKey.has(key) ? [key] : [];
    }),
  )];
  invariant(
    ruleKeys.length === 1,
    `${label} does not bind an atomic selector to exactly one manifest rule: ${rule.selector}`,
  );
  const key = ruleKeys[0] ?? "";
  const expectedPriority = priorityByRuleKey.get(key);
  invariant(expectedPriority !== undefined, `${label} has no manifest priority for ${key}.`);
  const layers = rule.ancestry.filter(({ name }) => name === "layer");
  invariant(
    expectedPriority === "priority1"
      ? layers.length === 0
      : layers.length === 1 && layers[0]?.prelude === `${prefix}.${expectedPriority}`,
    `${label} placed ${key} outside its manifest-derived ${expectedPriority} rank: ${JSON.stringify(rule.ancestry)}`,
  );
  return expectedPriority;
}

function requireChatRuleAncestry(
  rule: CssRuleRange,
  priorityByRuleKey: ReadonlyMap<string, string>,
  label: string,
  compact: boolean,
): void {
  const priority = requireManifestRuleAncestry(
    rule,
    priorityByRuleKey,
    "components.hraness-design-kit",
    label,
  );
  const conditions = rule.ancestry.filter(({ name }) => name !== "layer");
  invariant(
    priority === "priority4",
    `${label} moved a reviewed Chat declaration outside serialized priority4.`,
  );
  invariant(
    compact
      ? conditions.length === 1
        && conditions[0]?.name === "media"
        && /^\((?:max-width\s*:\s*48rem|width\s*<=\s*48rem)\)$/u.test(
          conditions[0].prelude,
        )
      : conditions.length === 0,
    `${label} placed a Chat declaration under the wrong conditional ancestry: ${JSON.stringify({
      ancestry: rule.ancestry,
      body: rule.body.trim(),
      compact,
      selector: rule.selector,
    })}`,
  );
}

function compiledChatBranchClasses(
  javaScript: string,
  branch: string,
  label: string,
): string[] {
  const styleMap = javaScript.match(/var chatStyles = \{([\s\S]*?)\n\};/u)?.[1];
  invariant(styleMap !== undefined, `${label} is missing the compiled chatStyles map.`);
  const branchMap = styleMap.match(
    new RegExp(`^  ${branch}: \\{([\\s\\S]*?)^  \\},?$`, "mu"),
  )?.[1];
  invariant(branchMap !== undefined, `${label} is missing the Chat ${branch} recipe branch.`);
  return [...new Set(branchMap.match(/\bx[a-z0-9]+\b/gu) ?? [])];
}

function chatBranchRules(
  cssRules: readonly CssRuleRange[],
  javaScript: string,
  branch: string,
  label: string,
): CssRuleRange[] {
  const rules = compiledChatBranchClasses(javaScript, branch, label).flatMap((className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const classToken = new RegExp(
      `(?:^|[^\\w-])\\.${escaped}(?:\\.${escaped})?(?![\\w-])`,
      "u",
    );
    const exactClassSelector = new RegExp(`^\\.${escaped}(?:\\.${escaped})?$`, "u");
    return cssRules.flatMap((rule) => {
      const members = cssTopLevelSegments(rule.selector, ",", label)
        .map((member) =>
          decodeCssEscapes(removeCssComments(member, label), label).trim());
      const membersWithClass = members.filter((member) => classToken.test(member));
      invariant(
        membersWithClass.every((member) => exactClassSelector.test(member)),
        `${label} scopes Chat class ${className} through a non-atomic selector.`,
      );
      return membersWithClass.some((member) => exactClassSelector.test(member))
        ? [rule]
        : [];
    });
  });
  return [...new Map(rules.map((rule) => [`${String(rule.start)}:${String(rule.end)}`, rule])).values()]
    .filter((rule) =>
      rule.ancestry.some(({ name, prelude }) =>
        name === "layer" && prelude.startsWith("components.hraness-design-kit.")));
}

function chatRulesAffectingProperties(
  rules: readonly CssRuleRange[],
  properties: ReadonlySet<string>,
  label: string,
): CssRuleRange[] {
  return rules.filter((rule) =>
    cssDeclarations(rule.body, label).some(({ name }) => properties.has(name)));
}

function requireChatStaticPresentation(
  css: string,
  javaScript: string,
  priorityByRuleKey: ReadonlyMap<string, string>,
  label: string,
): void {
  const cssRules = cssLeafRules(css, label);
  const messageRules = chatBranchRules(cssRules, javaScript, "message", label);
  const composerRules = chatBranchRules(cssRules, javaScript, "composer", label);
  const headerRules = chatBranchRules(cssRules, javaScript, "messageHeader", label);
  const gridProperties = new Set(["all", "grid", "grid-template", "grid-template-columns"]);
  const messageGridRules = chatRulesAffectingProperties(
    messageRules,
    gridProperties,
    label,
  );
  const composerGridRules = chatRulesAffectingProperties(
    composerRules,
    gridProperties,
    label,
  );
  const wideMessageRules = messageGridRules.filter(({ body }) =>
    /^\s*grid-template-columns:\s*auto\s+minmax\(0,\s*1fr\);?\s*$/u.test(body));
  const wideComposerRules = composerGridRules.filter(({ body }) =>
    /^\s*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*auto;?\s*$/u.test(body));
  const compactRules = composerGridRules.filter(({ body }) =>
    /^\s*grid-template-columns:\s*1fr;?\s*$/u.test(body));
  const wideMessageRule = wideMessageRules[0];
  const wideComposerRule = wideComposerRules[0];
  const compactRule = compactRules[0];
  invariant(
    messageGridRules.length === 1
      && wideMessageRules.length === 1
      && wideMessageRule !== undefined
      && composerGridRules.length === 2
      && wideComposerRules.length === 1
      && wideComposerRule !== undefined
      && compactRules.length === 1
      && compactRule !== undefined,
    `${label} lost the class-bound Chat message or wide composer grid: ${JSON.stringify({
      composer: composerGridRules.map(({ body, selector }) => ({
        body: body.trim(),
        selector,
      })),
      message: messageGridRules.map(({ body, selector }) => ({
        body: body.trim(),
        selector,
      })),
    })}`,
  );
  requireChatRuleAncestry(wideMessageRule, priorityByRuleKey, label, false);
  requireChatRuleAncestry(wideComposerRule, priorityByRuleKey, label, false);
  requireChatRuleAncestry(compactRule, priorityByRuleKey, label, true);
  const headerMarginRules = chatRulesAffectingProperties(
    headerRules,
    new Set(["all", "margin", "margin-block", "margin-block-end", "margin-bottom"]),
    label,
  );
  const headerMarginRule = headerMarginRules[0];
  invariant(
    headerMarginRules.length === 1
      && headerMarginRule !== undefined
      && /^\s*margin-block-end:\s*var\(--space-1\);?\s*$/u.test(
        headerMarginRule.body,
    ),
    `${label} lost the compiled Chat messageHeader logical margin.`,
  );
  requireChatRuleAncestry(headerMarginRule, priorityByRuleKey, label, false);
}

function compiledStylexBranchClasses(
  javaScript: string,
  mapName: string,
  branchName: string,
  label: string,
): string[] {
  const styleMap = javaScript.match(
    new RegExp(`var ${mapName} = \\{([\\s\\S]*?)\\n\\};`, "u"),
  )?.[1];
  invariant(styleMap !== undefined, `${label} is missing the compiled ${mapName} map.`);
  const branch = styleMap.match(
    new RegExp(`^  ${branchName}: \\{([\\s\\S]*?)^  \\},?$`, "mu"),
  )?.[1];
  invariant(branch !== undefined, `${label} is missing ${mapName}.${branchName}.`);
  return [...new Set(branch.match(/\bx[a-z0-9]+\b/gu) ?? [])];
}

function requireCompiledAtomicDeclaration(
  cssRules: readonly CssRuleRange[],
  javaScript: string,
  priorityByRuleKey: ReadonlyMap<string, string>,
  mapName: string,
  branchName: string,
  expectedBody: string,
  expectedPriority: string,
  label: string,
): void {
  const expectedDeclarations = cssDeclarations(expectedBody, label);
  const rules = compiledStylexBranchClasses(javaScript, mapName, branchName, label)
    .flatMap((className) => {
      const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
      const exactClassSelector = new RegExp(`^\\.${escaped}(?:\\.${escaped})?$`, "u");
      return cssRules.filter((rule) =>
        cssTopLevelSegments(rule.selector, ",", label)
          .map((member) => decodeCssEscapes(removeCssComments(member, label), label).trim())
          .some((member) => exactClassSelector.test(member)));
    })
    .filter((rule) => {
      const layers = rule.ancestry.filter(({ name }) => name === "layer");
      return layers.length === 0
        || layers.some(({ prelude }) => prelude.startsWith("components.hraness-design-kit."));
    });
  const matches = [...new Map(
    rules.map((rule) => [`${String(rule.start)}:${String(rule.end)}`, rule]),
  ).values()].filter((rule) =>
    JSON.stringify(cssDeclarations(rule.body, label)) === JSON.stringify(expectedDeclarations));
  invariant(
    matches.length === 1,
    `${label} expected one ${mapName}.${branchName} atom for ${expectedBody}, found ${String(matches.length)}.`,
  );
  const rule = matches[0];
  invariant(rule !== undefined, `${label} cannot locate ${mapName}.${branchName}.`);
  const actualPriority = requireManifestRuleAncestry(
    rule,
    priorityByRuleKey,
    "components.hraness-design-kit",
    label,
  );
  invariant(
    actualPriority === expectedPriority,
    `${label} moved ${mapName}.${branchName} ${expectedBody} from ${expectedPriority} to ${actualPriority}.`,
  );
}

async function firstExecutable(paths: readonly string[]): Promise<string> {
  for (const path of paths) {
    try {
      await access(path);
      return path;
    } catch {
      // Continue through known Chromium and Chrome installations.
    }
  }
  throw new Error(
    "No Chromium executable found. Set CHROMIUM_EXECUTABLE_PATH to run the gallery browser test.",
  );
}

async function requireShellBackgrounds(page: Page, label: string): Promise<void> {
  const backgrounds = await page.evaluate(() => {
    return [
      [".hraness-design-app-shell", "--background"],
      [".hraness-design-navigation-rail", "--surface"],
    ].map(([selector, token]) => {
      const element = document.querySelector(selector ?? "");
      if (!(element instanceof HTMLElement)) throw new Error(`Missing ${selector}`);
      const probe = document.createElement("span");
      probe.style.background = `var(${token})`;
      probe.style.display = "none";
      element.append(probe);
      const properties = [
        "background-color", "background-image", "background-attachment",
        "background-clip", "background-origin", "background-position",
        "background-repeat", "background-size",
      ];
      const expected = properties.map((property) => getComputedStyle(probe).getPropertyValue(property));
      probe.remove();
      return {
        selector,
        expected,
        actual: properties.map((property) => getComputedStyle(element).getPropertyValue(property)),
        atomic: [...element.classList].some((name) => /^x[a-z0-9]+$/u.test(name)),
      };
    });
  });
  invariant(backgrounds.every(({ actual, expected, atomic }) =>
    atomic && equalBackgroundValues(actual, expected, 5) && expected[0] !== "rgba(0, 0, 0, 0)"),
  `${label}: shell background atoms are ${JSON.stringify(backgrounds)}`);
}

async function requireEffectBackgrounds(page: Page, dark: boolean, label: string): Promise<void> {
  const effects = await page.evaluate((isDark) => {
    const aurora = document.querySelector(".hraness-design-aurora-background");
    const procedural = document.querySelector(".hraness-design-procedural-backdrop");
    const cloud = document.querySelector(".hraness-design-procedural-backdrop__cloud");
    if (!(aurora instanceof HTMLElement) || !(procedural instanceof HTMLElement)
      || !(cloud instanceof HTMLElement)) throw new Error("Missing effect background fixtures");
    const canary = document.createElement("style");
    canary.textContent = `@layer components.hraness-design-kit.legacy {
      .hraness-design-aurora-background,
      .hraness-design-aurora-background::before,
      .hraness-design-aurora-background::after,
      .hraness-design-procedural-backdrop,
      .hraness-design-procedural-backdrop__cloud {
        background-attachment: fixed; background-clip: content-box;
        background-origin: border-box; background-position: 13px 17px;
        background-repeat: no-repeat; background-size: 19px 23px;
      }
    }`;
    document.head.append(canary);
    try {
      const mixtures = isDark ? [15, 13, 13, 12, 90] : [26, 24, 22, 20, 86];
      const auroraBackground = [
        `radial-gradient(ellipse 54% 40% at 16% 24%, color-mix(in oklch, var(--aurora-cyan) ${mixtures[0]}%, transparent) 0%, transparent 62%)`,
        `radial-gradient(ellipse 52% 38% at 82% 20%, color-mix(in oklch, var(--aurora-gold) ${mixtures[1]}%, transparent) 0%, transparent 60%)`,
        `radial-gradient(ellipse 58% 42% at 58% 76%, color-mix(in oklch, var(--aurora-violet) ${mixtures[2]}%, transparent) 0%, transparent 62%)`,
        `radial-gradient(ellipse 48% 34% at 24% 78%, color-mix(in oklch, var(--aurora-mint) ${mixtures[3]}%, transparent) 0%, transparent 58%)`,
        `color-mix(in oklch, var(--background) ${mixtures[4]}%, transparent)`,
      ].join(", ");
      const cloudBackground = "radial-gradient(ellipse at center, color-mix(in oklch, var(--hraness-design-procedural-layer-color) 58%, transparent) 0%, color-mix(in oklch, var(--hraness-design-procedural-layer-color) 24%, transparent) 48%, transparent 74%)";
      const properties = ["background-color", "background-image", "background-attachment", "background-clip", "background-origin", "background-position", "background-repeat", "background-size"];
      const rows = [
        { element: aurora, background: auroraBackground },
        { element: procedural, background: "var(--background)" },
        { element: cloud, background: cloudBackground },
      ].map(({ element, background }) => {
        const probe = document.createElement("span");
        probe.style.background = background;
        probe.style.display = "none";
        element.append(probe);
        try {
          return {
            selector: element.classList[0],
            atomic: [...element.classList].some((name) => /^x[a-z0-9]+$/u.test(name)),
            actual: properties.map((property) => getComputedStyle(element).getPropertyValue(property)),
            expected: properties.map((property) => getComputedStyle(probe).getPropertyValue(property)),
          };
        } finally { probe.remove(); }
      });
      const pseudos = ["::before", "::after"].map((pseudo, index) => {
        const style = getComputedStyle(aurora, pseudo);
        return {
          pseudo,
          opacity: style.opacity,
          expectedOpacity: String(isDark ? [0.52, 0.18][index] : [0.84, 0.36][index]),
          color: style.backgroundColor,
          hasGradients: style.backgroundImage.includes("radial-gradient"),
          resets: properties.slice(2).map((property) => style.getPropertyValue(property)
            .split(",").map((value) => value.trim())),
        };
      });
      return { rows, pseudos };
    } finally { canary.remove(); }
  }, dark);
  invariant(effects.rows.every(({ actual, expected, atomic }) =>
    atomic && equalBackgroundValues(actual, expected, 5)),
  `${label}: effect background shorthand parity is ${JSON.stringify(effects.rows)}`);
  const resetValues = ["scroll", "border-box", "padding-box", "0% 0%", "repeat", "auto"];
  invariant(effects.pseudos.every(({ opacity, expectedOpacity, color, hasGradients, resets }) =>
    opacity === expectedOpacity && color === "rgba(0, 0, 0, 0)" && hasGradients
    && resets.every((values, index) => values.length > 0 && values.every((value) =>
      value === resetValues[index]
      || (index === 3 && normalizeBackgroundPosition(value) === "0 0")
      || (index === 5 && value === "auto auto")))),
  `${label}: effect pseudo background/theme parity is ${JSON.stringify(effects.pseudos)}`);
}

async function requireAppearanceBackground(page: Page, selector: string, label: string): Promise<void> {
  const result = await page.locator(selector).evaluate((element) => {
    const canary = document.createElement("style");
    canary.textContent = `@layer components.hraness-design-kit.legacy {
      .hraness-design-theme-toggle__popover, .hraness-design-theme-toggle__item {
        background-image: linear-gradient(red, blue); background-attachment: fixed;
        background-clip: content-box; background-origin: border-box;
        background-position: 13px 17px; background-repeat: no-repeat;
        background-size: 19px 23px;
      }
    }`;
    document.head.append(canary);
    try {
      const properties = ["background-image", "background-attachment", "background-clip", "background-origin", "background-position", "background-repeat", "background-size"];
      const probe = document.createElement("span");
      probe.style.background = "transparent";
      probe.style.display = "none";
      element.append(probe);
      try {
        return {
          actual: properties.map((property) => getComputedStyle(element).getPropertyValue(property)),
          expected: properties.map((property) => getComputedStyle(probe).getPropertyValue(property)),
        };
      } finally { probe.remove(); }
    } finally { canary.remove(); }
  });
  invariant(equalBackgroundValues(result.actual, result.expected, 4),
    `${label}: appearance background shorthand parity is ${JSON.stringify(result)}`);
}

async function evidence(page: Page): Promise<LayoutEvidence> {
  return page.evaluate(() => {
    const gallery = document.querySelector(".design-gallery");
    const heading = document.querySelector(".design-gallery__intro h1");
    const copy = document.querySelector(".design-gallery__intro > p");
    const rail = document.querySelector(".hraness-design-app-shell__rail");
    const mobileTrigger = document.querySelector(".hraness-design-app-shell__mobile-trigger");
    const effect = document.querySelector(".design-gallery__effect");
    const aurora = effect?.querySelector(".hraness-design-aurora-background");
    const dots = effect?.querySelector(".hraness-design-aurora-dots");
    const dither = document.querySelector("[data-gallery-dither]");
    const chat = document.querySelector("[data-gallery-chat]");
    const chatMessage = chat?.querySelector(".design-gallery__chat-message");
    const chatContent = chatMessage?.querySelector(".hraness-design-chat-message__content");
    const chatHeader = chatMessage?.querySelector(".hraness-design-chat-message__header");
    const chatBody = chatMessage?.querySelector(".hraness-design-chat-message__body");
    const chatActions = chatMessage?.querySelector(".hraness-design-chat-message__actions");
    const chatComposer = chat?.querySelector(".design-gallery__chat-composer");
    const chatTextArea = chatComposer?.querySelector("textarea");
    const chatSubmit = chatComposer?.querySelector('button[type="submit"]');
    const plainLink = document.querySelector(".design-gallery__plain-link-example a");
    const plainHeader = document.querySelector(".plain-header__inner");
    const plainNav = plainHeader?.querySelector(".plain-nav");
    const plainTheme = document.querySelector(".design-gallery__plain-theme");
    const plainWordmark = plainHeader?.querySelector(".plain-wordmark");
    const proportionalSpecimen = document.querySelector('[data-gallery-font="proportional"]');
    const monoSpecimen = document.querySelector('[data-gallery-font="mono"]');
    const procedural = effect?.querySelector(".hraness-design-procedural-backdrop");
    const horizontalFader = document.querySelector('[data-gallery-fader="horizontal"]');
    const horizontalFaderLabel = horizontalFader?.querySelector(
      ".hraness-design-fader__label",
    );
    const horizontalFaderOutput = horizontalFader?.querySelector(
      ".hraness-design-fader__output",
    );
    const horizontalFaderTrack = horizontalFader?.querySelector(
      ".hraness-design-fader__track",
    );
    const horizontalFaderTrackRail = horizontalFaderTrack?.querySelector(
      ".hraness-design-fader__track-rail",
    );
    const horizontalFaderFillRail = horizontalFaderTrack?.querySelector(
      ".hraness-design-fader__fill-rail",
    );
    const horizontalFaderThumb = horizontalFaderTrack?.querySelector(
      ".hraness-design-fader__thumb",
    );
    const horizontalFaderInput = horizontalFaderThumb?.querySelector('input[type="range"]');
    const layoutTop = document.querySelector("[data-gallery-layout-top-bar]");
    const layoutBottom = document.querySelector("[data-gallery-layout-bottom-bar]");
    const layoutPage = document.querySelector("[data-gallery-layout-page-canvas]");
    const layoutDock = document.querySelector("[data-gallery-layout-docked-footer]");
    const layoutDockContent = layoutDock?.querySelector(
      ".hraness-design-docked-footer__content",
    );
    const layoutDockFrame = document.querySelector("[data-gallery-layout-docked-frame]");
    const animatedRailStage = document.querySelector(
      ".design-gallery__animated-rail-stage",
    );
    const playback = document.querySelector(".design-gallery__playback-transport");
    const playbackCommand = document.querySelector("#design-gallery-playback-command");
    const playbackGlyph = playbackCommand?.querySelector(
      '[data-slot="icon"], [data-slot="spinner"]',
    );
    const playbackButton = playbackCommand?.closest(
      ".hraness-design-playback-transport__button",
    );
    const verticalFader = document.querySelector('[data-gallery-fader="vertical"]');
    const verticalFaderLabel = verticalFader?.querySelector(
      ".hraness-design-fader__label",
    );
    const verticalFaderOutput = verticalFader?.querySelector(
      ".hraness-design-fader__output",
    );
    const verticalFaderTrack = verticalFader?.querySelector(
      ".hraness-design-fader__track",
    );
    const verticalFaderTrackRail = verticalFaderTrack?.querySelector(
      ".hraness-design-fader__track-rail",
    );
    const verticalFaderFillRail = verticalFaderTrack?.querySelector(
      ".hraness-design-fader__fill-rail",
    );
    const verticalFaderThumb = verticalFaderTrack?.querySelector(
      ".hraness-design-fader__thumb",
    );
    const verticalFaderInput = verticalFaderThumb?.querySelector('input[type="range"]');
    const appearance = document.querySelector(".hraness-design-theme-toggle");
    const appearanceTrigger = appearance?.querySelector("button");
    const appearanceHeader = appearance?.closest("header");
    const appearanceActions = appearance?.parentElement;
    if (
      !(gallery instanceof HTMLElement)
      || !(heading instanceof HTMLElement)
      || !(copy instanceof HTMLElement)
      || !(rail instanceof HTMLElement)
      || !(mobileTrigger instanceof HTMLElement)
      || !(effect instanceof HTMLElement)
      || !(aurora instanceof HTMLElement)
      || !(dots instanceof HTMLElement)
      || !(dither instanceof HTMLElement)
      || !(chat instanceof HTMLElement)
      || !(chatMessage instanceof HTMLElement)
      || !(chatContent instanceof HTMLElement)
      || !(chatHeader instanceof HTMLElement)
      || !(chatBody instanceof HTMLElement)
      || !(chatActions instanceof HTMLElement)
      || !(chatComposer instanceof HTMLFormElement)
      || !(chatTextArea instanceof HTMLTextAreaElement)
      || !(chatSubmit instanceof HTMLButtonElement)
      || !(plainLink instanceof HTMLAnchorElement)
      || !(plainHeader instanceof HTMLElement)
      || !(plainNav instanceof HTMLElement)
      || !(plainTheme instanceof HTMLElement)
      || !(plainWordmark instanceof HTMLAnchorElement)
      || !(proportionalSpecimen instanceof HTMLElement)
      || !(monoSpecimen instanceof HTMLElement)
      || !(procedural instanceof HTMLElement)
      || !(horizontalFader instanceof HTMLElement)
      || !(horizontalFaderLabel instanceof HTMLElement)
      || !(horizontalFaderOutput instanceof HTMLOutputElement)
      || !(horizontalFaderTrack instanceof HTMLElement)
      || !(horizontalFaderTrackRail instanceof HTMLElement)
      || !(horizontalFaderFillRail instanceof HTMLElement)
      || !(horizontalFaderThumb instanceof HTMLElement)
      || !(horizontalFaderInput instanceof HTMLInputElement)
      || !(layoutTop instanceof HTMLElement)
      || !(layoutBottom instanceof HTMLElement)
      || !(layoutPage instanceof HTMLElement)
      || !(layoutDock instanceof HTMLElement)
      || !(layoutDockContent instanceof HTMLElement)
      || !(layoutDockFrame instanceof HTMLElement)
      || !(animatedRailStage instanceof HTMLElement)
      || !(playback instanceof HTMLElement)
      || !(playbackCommand instanceof HTMLButtonElement)
      || !(playbackGlyph instanceof HTMLElement || playbackGlyph instanceof SVGElement)
      || !(playbackButton instanceof HTMLElement)
      || !(verticalFader instanceof HTMLElement)
      || !(verticalFaderLabel instanceof HTMLElement)
      || !(verticalFaderOutput instanceof HTMLOutputElement)
      || !(verticalFaderTrack instanceof HTMLElement)
      || !(verticalFaderTrackRail instanceof HTMLElement)
      || !(verticalFaderFillRail instanceof HTMLElement)
      || !(verticalFaderThumb instanceof HTMLElement)
      || !(verticalFaderInput instanceof HTMLInputElement)
      || !(appearance instanceof HTMLElement)
      || !(appearanceTrigger instanceof HTMLButtonElement)
      || !(appearanceHeader instanceof HTMLElement)
      || !(appearanceActions instanceof HTMLElement)
    ) {
      throw new Error("The public gallery structure is incomplete.");
    }

    const galleryStyle = getComputedStyle(gallery);
    const proceduralStyle = getComputedStyle(procedural);
    const ditherStyle = getComputedStyle(dither);
    const chatMessageStyle = getComputedStyle(chatMessage);
    const chatContentStyle = getComputedStyle(chatContent);
    const chatHeaderStyle = getComputedStyle(chatHeader);
    const chatBodyStyle = getComputedStyle(chatBody);
    const chatActionsStyle = getComputedStyle(chatActions);
    const chatComposerStyle = getComputedStyle(chatComposer);
    const effectBox = effect.getBoundingClientRect();
    const auroraBox = aurora.getBoundingClientRect();
    const dotsBox = dots.getBoundingClientRect();
    const plainHeaderBox = plainHeader.getBoundingClientRect();
    const plainNavBox = plainNav.getBoundingClientRect();
    const plainWordmarkBox = plainWordmark.getBoundingClientRect();
    const proceduralBox = procedural.getBoundingClientRect();
    const horizontalFaderTrackBox = horizontalFaderTrack.getBoundingClientRect();
    const horizontalFaderThumbBox = horizontalFaderThumb.getBoundingClientRect();
    const horizontalFaderStyle = getComputedStyle(horizontalFader);
    const horizontalFaderTrackStyle = getComputedStyle(horizontalFaderTrack);
    const horizontalFaderTrackRailStyle = getComputedStyle(horizontalFaderTrackRail);
    const horizontalFaderFillRailStyle = getComputedStyle(horizontalFaderFillRail);
    const horizontalFaderThumbStyle = getComputedStyle(horizontalFaderThumb);
    const layoutDockBox = layoutDock.getBoundingClientRect();
    const layoutDockFrameBox = layoutDockFrame.getBoundingClientRect();
    const animatedRailStageStyle = getComputedStyle(animatedRailStage);
    const playbackStyle = getComputedStyle(playback);
    const playbackGlyphStyle = getComputedStyle(playbackGlyph);
    const verticalFaderTrackBox = verticalFaderTrack.getBoundingClientRect();
    const verticalFaderThumbBox = verticalFaderThumb.getBoundingClientRect();
    const verticalFaderStyle = getComputedStyle(verticalFader);
    const verticalFaderTrackStyle = getComputedStyle(verticalFaderTrack);
    const verticalFaderTrackRailStyle = getComputedStyle(verticalFaderTrackRail);
    const verticalFaderFillRailStyle = getComputedStyle(verticalFaderFillRail);
    const verticalFaderThumbStyle = getComputedStyle(verticalFaderThumb);
    const paletteNames = [
      "--hraness-design-procedural-highlight",
      "--hraness-design-procedural-key",
      "--hraness-design-procedural-shadow",
      "--hraness-design-procedural-support",
    ];

    const palette = paletteNames.map((name) => proceduralStyle.getPropertyValue(name).trim());

    return {
      animatedRailStageAtomic:
        animatedRailStage.classList.contains("hraness-design-animated-rail-stage")
        && [...animatedRailStage.classList].some((className) => className.startsWith("x")),
      animatedRailStageCallerLast:
        animatedRailStage.classList.item(animatedRailStage.classList.length - 1)
          === "design-gallery__animated-rail-stage",
      animatedRailStageMinInlineSize: animatedRailStageStyle.minInlineSize,
      animatedRailStageMotionStyle: animatedRailStage.getAttribute("style") ?? "",
      animatedRailStageStageKey: animatedRailStage.dataset.stageKey ?? "",
      animatedRailStageTransform: animatedRailStageStyle.transform,
      animatedRailStageTransitionProperty: animatedRailStageStyle.transitionProperty,
      appearanceInHeader: appearanceHeader.tagName === "HEADER",
      appearanceIsFinalAction: appearanceActions.lastElementChild === appearance,
      appearancePresentation: appearance.dataset.presentation ?? "",
      appearanceRightAligned:
        Math.abs(
          appearance.getBoundingClientRect().right
          - appearanceActions.getBoundingClientRect().right,
        ) <= 1,
      appearanceTriggerLabel: appearanceTrigger.getAttribute("aria-label") ?? "",
      auroraContained:
        Math.abs(auroraBox.left - effectBox.left) <= 1
        && Math.abs(auroraBox.right - effectBox.right) <= 1
        && Math.abs(auroraBox.top - effectBox.top) <= 1
        && Math.abs(auroraBox.bottom - effectBox.bottom) <= 1,
      auroraPosition: getComputedStyle(aurora).position,
      chatAtomic: [
        [chatMessage, "hraness-design-chat-message"],
        [chatContent, "hraness-design-chat-message__content"],
        [chatHeader, "hraness-design-chat-message__header"],
        [chatBody, "hraness-design-chat-message__body"],
        [chatActions, "hraness-design-chat-message__actions"],
        [chatComposer, "hraness-design-chat-composer"],
      ].every(([element, stableClass]) =>
        element instanceof HTMLElement
        && typeof stableClass === "string"
        && element.classList.contains(stableClass)
        && [...element.classList].some((className) => className.startsWith("x"))),
      chatCallerLast:
        chatMessage.classList.item(chatMessage.classList.length - 1)
          === "design-gallery__chat-message"
        && chatComposer.classList.item(chatComposer.classList.length - 1)
          === "design-gallery__chat-composer",
      chatComposerAlignItems: chatComposerStyle.alignItems,
      chatComposerColumnCount: chatComposerStyle.gridTemplateColumns
        .trim().split(/\s+/u).filter(Boolean).length,
      chatComposerDisplay: chatComposerStyle.display,
      chatComposerGap: chatComposerStyle.gap,
      chatMessageColumnCount: chatMessageStyle.gridTemplateColumns
        .trim().split(/\s+/u).filter(Boolean).length,
      chatMessageDisplay: chatMessageStyle.display,
      chatMessageGap: chatMessageStyle.gap,
      chatNoOwnedInlinePresentation: [
        chatMessage,
        chatContent,
        chatHeader,
        chatBody,
        chatActions,
        chatComposer,
      ].every((element) => !element.hasAttribute("style")),
      chatRowsPresentation:
        chatContentStyle.minInlineSize === "0px"
        && chatBodyStyle.minInlineSize === "0px"
        && chatHeaderStyle.display === "flex"
        && chatHeaderStyle.flexWrap === "wrap"
        && chatHeaderStyle.alignItems === "center"
        && chatHeaderStyle.gap === "8px"
        && chatHeaderStyle.marginBlockEnd === "4px"
        && chatActionsStyle.display === "flex"
        && chatActionsStyle.flexWrap === "wrap"
        && chatActionsStyle.alignItems === "center"
        && chatActionsStyle.gap === "8px",
      chatSemantic:
        chatMessage.tagName === "ARTICLE"
        && chatMessage.dataset.role === "assistant"
        && chatHeader.tagName === "HEADER"
        && chatActions.tagName === "FOOTER"
        && chatComposer.getAttribute("action") === "/gallery-chat-submit"
        && chatComposer.getAttribute("aria-label") === "Gallery message composer"
        && chatTextArea.rows === 2
        && chatTextArea.value === "Review the presentation contract"
        && chatSubmit.type === "submit"
        && chatSubmit.textContent?.trim() === "Send message",
      clientWidth: document.documentElement.clientWidth,
      copy: copy.textContent?.replace(/\s+/gu, " ").trim() ?? "",
      dotsContained:
        Math.abs(dotsBox.left - effectBox.left) <= 1
        && Math.abs(dotsBox.right - effectBox.right) <= 1
        && Math.abs(dotsBox.top - effectBox.top) <= 1
        && Math.abs(dotsBox.bottom - effectBox.bottom) <= 1,
      dotsPosition: getComputedStyle(dots).position,
      ditherBackgroundImage: ditherStyle.backgroundImage,
      ditherDensity: dither.dataset.density ?? "",
      ditherHasInlineStyle: dither.hasAttribute("style"),
      ditherSize: ditherStyle.backgroundSize,
      ditherUsesThemedSurface:
        dither.classList.contains("hraness-themed-surface")
        && dither.classList.contains("hraness-design-dither-surface")
        && dither.dataset.slot === "themed-surface",
      faderAtomic: [
        [horizontalFader, "hraness-design-fader"],
        [horizontalFaderLabel, "hraness-design-fader__label"],
        [horizontalFaderOutput, "hraness-design-fader__output"],
        [horizontalFaderTrack, "hraness-design-fader__track"],
        [horizontalFaderTrackRail, "hraness-design-fader__track-rail"],
        [horizontalFaderFillRail, "hraness-design-fader__fill-rail"],
        [horizontalFaderThumb, "hraness-design-fader__thumb"],
        [verticalFader, "hraness-design-fader"],
        [verticalFaderLabel, "hraness-design-fader__label"],
        [verticalFaderOutput, "hraness-design-fader__output"],
        [verticalFaderTrack, "hraness-design-fader__track"],
        [verticalFaderTrackRail, "hraness-design-fader__track-rail"],
        [verticalFaderFillRail, "hraness-design-fader__fill-rail"],
        [verticalFaderThumb, "hraness-design-fader__thumb"],
      ].every(([element, stableClass]) =>
        element instanceof HTMLElement
        && typeof stableClass === "string"
        && element.classList.contains(stableClass)
        && [...element.classList].some((className) => className.startsWith("x"))),
      faderCallerLast:
        horizontalFader.classList.item(horizontalFader.classList.length - 1)
          === "design-gallery__horizontal-fader"
        && verticalFader.classList.item(verticalFader.classList.length - 1)
          === "design-gallery__vertical-fader",
      faderCompactCustomProperties: [
        horizontalFaderStyle.getPropertyValue(
          "--hraness-design-fader-thumb-block-size",
        ).trim(),
        horizontalFaderStyle.getPropertyValue(
          "--hraness-design-fader-thumb-inline-size",
        ).trim(),
        horizontalFaderStyle.getPropertyValue(
          "--hraness-design-fader-track-length",
        ).trim(),
      ],
      faderDefaultCustomProperties: [
        verticalFaderStyle.getPropertyValue(
          "--hraness-design-fader-thumb-block-size",
        ).trim(),
        verticalFaderStyle.getPropertyValue(
          "--hraness-design-fader-thumb-inline-size",
        ).trim(),
        verticalFaderStyle.getPropertyValue(
          "--hraness-design-fader-track-length",
        ).trim(),
      ],
      faderHorizontalDimensions: [
        horizontalFaderStyle.minInlineSize,
        horizontalFaderTrackStyle.inlineSize,
        horizontalFaderTrackStyle.blockSize,
        horizontalFaderThumbStyle.inlineSize,
        horizontalFaderThumbStyle.blockSize,
      ],
      faderInertRails:
        horizontalFaderTrackRail.getAttribute("aria-hidden") === "true"
        && horizontalFaderFillRail.getAttribute("aria-hidden") === "true"
        && verticalFaderTrackRail.getAttribute("aria-hidden") === "true"
        && verticalFaderFillRail.getAttribute("aria-hidden") === "true"
        && horizontalFaderTrackRail.tabIndex === -1
        && horizontalFaderFillRail.tabIndex === -1
        && verticalFaderTrackRail.tabIndex === -1
        && verticalFaderFillRail.tabIndex === -1,
      faderNoOwnedInlinePresentation: [
        horizontalFader,
        horizontalFaderLabel,
        horizontalFaderOutput,
        horizontalFaderTrackRail,
        horizontalFaderFillRail,
        verticalFader,
        verticalFaderLabel,
        verticalFaderOutput,
        verticalFaderTrackRail,
        verticalFaderFillRail,
      ].every((element) => !element.hasAttribute("style")),
      faderRailPresentation: [
        horizontalFaderTrackRailStyle.inlineSize,
        horizontalFaderTrackRailStyle.blockSize,
        horizontalFaderTrackRailStyle.backgroundColor,
        horizontalFaderFillRailStyle.inlineSize,
        horizontalFaderFillRailStyle.backgroundColor,
        verticalFaderTrackRailStyle.inlineSize,
        verticalFaderTrackRailStyle.blockSize,
        verticalFaderTrackRailStyle.backgroundColor,
        verticalFaderFillRailStyle.inlineSize,
        verticalFaderFillRailStyle.backgroundColor,
      ],
      faderSemantic:
        horizontalFader.getAttribute("role") === "group"
        && horizontalFader.getAttribute("aria-label") === "Example horizontal level"
        && horizontalFader.dataset.density === "compact"
        && horizontalFader.dataset.orientation === "horizontal"
        && horizontalFaderLabel.textContent?.trim() === "Horizontal level"
        && horizontalFaderOutput.textContent?.trim() === "64"
        && horizontalFaderInput.getAttribute("aria-orientation") === "horizontal"
        && horizontalFaderInput.value === "64"
        && verticalFader.getAttribute("role") === "group"
        && verticalFader.getAttribute("aria-label") === "Example level"
        && verticalFader.dataset.density === "default"
        && verticalFader.dataset.orientation === "vertical"
        && verticalFaderLabel.textContent?.replace(/\s+/gu, " ").trim() === "Level"
        && verticalFaderOutput.textContent?.trim() === "64"
        && verticalFaderInput.getAttribute("aria-orientation") === "vertical"
        && verticalFaderInput.value === "64",
      faderVerticalDimensions: [
        verticalFaderStyle.minInlineSize,
        verticalFaderTrackStyle.inlineSize,
        verticalFaderTrackStyle.blockSize,
        verticalFaderThumbStyle.inlineSize,
        verticalFaderThumbStyle.blockSize,
      ],
      galleryPaddingLeft: Number.parseFloat(galleryStyle.paddingLeft),
      galleryPaddingRight: Number.parseFloat(galleryStyle.paddingRight),
      heading: heading.textContent?.trim() ?? "",
      headingClipped: heading.scrollWidth > heading.clientWidth + 1,
      headingFontFamily: getComputedStyle(heading).fontFamily,
      horizontalFaderThumbCentered:
        Math.abs(
          (horizontalFaderThumbBox.top + horizontalFaderThumbBox.bottom) / 2
          - (horizontalFaderTrackBox.top + horizontalFaderTrackBox.bottom) / 2,
        ) <= 1,
      layoutBottomDisplay: getComputedStyle(layoutBottom).display,
      layoutDockBottom: getComputedStyle(layoutDock).bottom,
      layoutDockContained:
        layoutDockBox.left >= layoutDockFrameBox.left - 1
        && layoutDockBox.right <= layoutDockFrameBox.right + 1
        && layoutDockBox.top >= layoutDockFrameBox.top - 1
        && layoutDockBox.bottom <= layoutDockFrameBox.bottom + 1,
      layoutDockPosition: getComputedStyle(layoutDock).position,
      layoutPageWidth: layoutPage.getBoundingClientRect().width,
      layoutSurfacesAtomic: [
        [layoutTop, "hraness-design-top-bar"],
        [layoutBottom, "hraness-design-bottom-bar"],
        [layoutPage, "hraness-design-page-canvas"],
        [layoutDock, "hraness-design-docked-footer"],
        [layoutDockContent, "hraness-design-docked-footer__content"],
      ].every(([element, stableClass]) =>
        element instanceof HTMLElement
        && typeof stableClass === "string"
        && !element.hasAttribute("style")
        && [...element.classList].some(
          (className) => className !== stableClass && className.startsWith("x"),
        )),
      layoutSurfacesSemantic:
        layoutTop.tagName === "HEADER"
        && layoutTop.dataset.position === "static"
        && layoutTop.dataset.surface === "solid"
        && layoutBottom.tagName === "FOOTER"
        && layoutPage.tagName === "DIV"
        && layoutPage.dataset.inset === "content"
        && layoutPage.dataset.size === "default"
        && layoutDock.tagName === "FOOTER"
        && layoutDock.dataset.position === "absolute"
        && layoutDock.dataset.surface === "solid"
        && layoutDockContent.dataset.density === "compact"
        && layoutDockContent.dataset.inset === "content"
        && layoutDockContent.dataset.size === "default",
      layoutTopDisplay: getComputedStyle(layoutTop).display,
      mobileTriggerDisplay: getComputedStyle(mobileTrigger).display,
      monoFontFamily: getComputedStyle(monoSpecimen).fontFamily,
      nebulaLoaded: Array.from(document.fonts).some(
        (face) => face.family === "Nebula Sans" && face.status === "loaded",
      ),
      palette,
      paletteValid: palette.every((value) => value !== "" && CSS.supports("color", value)),
      playbackAlignItems: playbackStyle.alignItems,
      playbackAtomic:
        [...playback.classList].filter((className) => className.startsWith("x")).length >= 4
        && [...playbackGlyph.classList].filter((className) => className.startsWith("x")).length >= 2,
      playbackCallerLast:
        playback.classList.item(playback.classList.length - 1)
        === "design-gallery__playback-transport",
      playbackDisplay: playbackStyle.display,
      playbackFlexWrap: playbackStyle.flexWrap,
      playbackGlyphBlockSize: playbackGlyphStyle.blockSize,
      playbackGlyphHasInlineStyle: playbackGlyph.hasAttribute("style"),
      playbackGlyphInlineSize: playbackGlyphStyle.inlineSize,
      playbackGap: playbackStyle.gap,
      playbackHasInlineStyle: playback.hasAttribute("style"),
      playbackSemantic:
        playback.classList.contains("hraness-toolbar")
        && playback.classList.contains("hraness-design-playback-transport")
        && playback.getAttribute("role") === "toolbar"
        && playback.getAttribute("aria-label") === "Preview transport"
        && playbackCommand.getAttribute("aria-label") === "Play"
        && playbackCommand.dataset.playbackCommand === "play"
        && playbackButton.dataset.size === "large"
        && playbackButton.dataset.variant === "primary"
        && playbackButton.classList.contains("hraness-design-playback-transport__button"),
      playbackStatus: playback.dataset.playbackStatus ?? "",
      plainLinkDecoration: getComputedStyle(plainLink).textDecorationLine,
      plainHeaderChildrenContained:
        plainWordmarkBox.left >= plainHeaderBox.left - 1
        && plainWordmarkBox.right <= plainHeaderBox.right + 1
        && plainNavBox.left >= plainHeaderBox.left - 1
        && plainNavBox.right <= plainHeaderBox.right + 1,
      plainHeaderHeight: plainHeaderBox.height,
      plainHeaderOverflows: plainHeader.scrollWidth > plainHeader.clientWidth + 1,
      plainHeaderWrapped: Math.abs(plainWordmarkBox.top - plainNavBox.top) > 2,
      plainThemeHeight: plainTheme.getBoundingClientRect().height,
      plainThemeMinHeight: getComputedStyle(plainTheme).minHeight,
      proportionalFontFamily: getComputedStyle(proportionalSpecimen).fontFamily,
      proceduralAriaHidden: procedural.getAttribute("aria-hidden") === "true",
      proceduralCanvasCount: procedural.querySelectorAll("canvas").length,
      proceduralCloudCount: procedural.querySelectorAll(
        ".hraness-design-procedural-backdrop__cloud",
      ).length,
      proceduralCoversEffect:
        Math.abs(proceduralBox.left - effectBox.left) <= 1
        && Math.abs(proceduralBox.right - effectBox.right) <= 1
        && Math.abs(proceduralBox.top - effectBox.top) <= 1
        && Math.abs(proceduralBox.bottom - effectBox.bottom) <= 1,
      proceduralGridCount: procedural.querySelectorAll(
        ".hraness-design-procedural-backdrop__grid",
      ).length,
      proceduralInert: procedural.inert,
      proceduralPointerEvents: proceduralStyle.pointerEvents,
      proceduralRippleCount: procedural.querySelectorAll(
        ".hraness-design-procedural-backdrop__ripple",
      ).length,
      proceduralVariant: procedural.dataset.variant ?? "",
      railDisplay: getComputedStyle(rail).display,
      scrollWidth: document.documentElement.scrollWidth,
      verticalFaderThumbCentered:
        Math.abs(
          (verticalFaderThumbBox.left + verticalFaderThumbBox.right) / 2
          - (verticalFaderTrackBox.left + verticalFaderTrackBox.right) / 2,
        ) <= 1,
    };
  });
}

async function themeColorEvidence(page: Page): Promise<ThemeColorEvidence> {
  return page.evaluate((activeAttribute) => {
    const metas = Array.from(document.head.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    ));
    const active = metas.find((meta) => meta.hasAttribute(activeAttribute));
    if (active === undefined) throw new Error("The synchronized theme-color meta is missing.");

    const normalizeColor = (value: string): string => {
      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.append(probe);
      const normalized = getComputedStyle(probe).color;
      probe.remove();
      return normalized;
    };

    return {
      activeContent: active.content,
      activeHasMedia: active.hasAttribute("media"),
      adaptiveMedia: metas
        .filter((meta) => meta.hasAttribute("data-gallery-adaptive-theme-color"))
        .map((meta) => meta.getAttribute("media") ?? ""),
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      matchingColors: metas
        .filter((meta) => !meta.hasAttribute("media") || matchMedia(meta.media).matches)
        .map((meta) => normalizeColor(meta.content)),
      ownedCount: metas.filter((meta) => meta.hasAttribute(activeAttribute)).length,
    };
  }, themeColorSyncActiveAttribute);
}

function startGalleryServer(directory: string) {
  const firstPort = 43_000 + (process.pid % 1_000);
  for (let offset = 0; offset < 20; offset += 1) {
    try {
      return Bun.serve({
        hostname: "127.0.0.1",
        port: firstPort + offset,
        async fetch(request) {
          const pathname = new URL(request.url).pathname;
          if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
          const name = pathname === "/" ? "index.html" : basename(pathname);
          const file = Bun.file(join(directory, name));
          if (!(await file.exists())) return new Response("Not found", { status: 404 });
          const type = name.endsWith(".css")
            ? "text/css"
            : name.endsWith(".js")
              ? "text/javascript"
              : "text/html";
          return new Response(file, { headers: { "content-type": type } });
        },
      });
    } catch (error: unknown) {
      if (offset === 19) throw error;
    }
  }
  throw new Error("No local port was available for the gallery browser test.");
}

const repository = process.cwd();
const work = await mkdtemp(join(tmpdir(), "hraness-design-gallery-browser-"));

try {
  const build = await Bun.build({
    entrypoints: [join(repository, "gallery/main.tsx")],
    format: "esm",
    minify: true,
    outdir: work,
    target: "browser",
  });
  if (!build.success) {
    throw new Error(build.logs.map((log) => log.message).join("\n"));
  }

  const files = await readdir(work);
  const script = files.find((file) => file.endsWith(".js"));
  const stylesheet = files.find((file) => file.endsWith(".css"));
  invariant(script !== undefined, "Gallery build did not emit JavaScript.");
  invariant(stylesheet !== undefined, "Gallery build did not emit CSS.");
  const [
    builtCss,
    stylexCss,
    compiledReactJavaScript,
    designManifest,
    uiManifest,
  ] = await Promise.all([
    Bun.file(join(work, stylesheet)).text(),
    Bun.file(join(repository, "dist/stylex.css")).text(),
    Bun.file(join(repository, "dist/react/index.js")).text(),
    readStylexPackageManifest(join(repository, "dist/stylex-manifest.json"), repository),
    readStylexPackageManifest(
      join(repository, "node_modules/@hraness/ui/dist/stylex-manifest.json"),
      join(repository, "node_modules/@hraness/ui"),
    ),
  ]);
  const designPriorityContract = serializedPriorityContract(
    designManifest.rules,
    designManifest.standaloneSerializer.prefix,
    "Gallery design-kit manifest",
  );
  const uiPriorityContract = serializedPriorityContract(
    uiManifest.rules,
    uiManifest.standaloneSerializer.prefix,
    "Gallery UI manifest",
  );
  invariant(
    JSON.stringify(designPriorityContract.rawPrioritiesByRank) === JSON.stringify([
      [0, 1, 41],
      [1000, 1200],
      [2000, 2040, 2130, 2200],
      [3000, 3040, 3092, 3130, 3200, 3330],
      [4000, 4130],
      [6000],
      [7000],
      [8000, 8040],
    ]),
    "Gallery design-kit manifest no longer matches its reviewed eight-rank inventory.",
  );
  invariant(
    JSON.stringify(designPriorityContract.layerInventory) === JSON.stringify(
      Array.from({ length: 8 }, (_value, index) =>
        `components.hraness-design-kit.priority${String(index + 1)}`),
    ),
    "Gallery design-kit manifest no longer owns the exact priority1-through-priority8 inventory.",
  );
  invariant(
    JSON.stringify(uiPriorityContract.layerInventory) === JSON.stringify(
      Array.from({ length: 7 }, (_value, index) =>
        `components.hraness-ui.priority${String(index + 1)}`),
    ),
    "Gallery UI manifest no longer matches its reviewed seven-rank inventory.",
  );
  const stylexClasses = [...stylexCss.matchAll(/^\s*\.([\w-]+)\s*\{/gmu)]
    .map((match) => match[1])
    .filter((className): className is string => className !== undefined);
  invariant(stylexClasses.length > 0, "Gallery build has no package StyleX selectors to verify.");
  for (const className of new Set(stylexClasses)) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const matches = builtCss.match(new RegExp(`\\.${escaped}(?=[\\s,{:])`, "gu")) ?? [];
    invariant(
      matches.length >= 1,
      `Gallery CSS does not contain the generated .${className} selector.`,
    );
  }
  for (const [layerName, expectedBlocks] of [
    ...uiPriorityContract.layerInventory.map((layer) => [
      layer,
      uiPriorityContract.blockLayers.includes(layer) ? 1 : 0,
    ] as const),
    ...designPriorityContract.layerInventory.map((layer) => [
      layer,
      designPriorityContract.blockLayers.includes(layer) ? 1 : 0,
    ] as const),
  ]) {
    const escaped = layerName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const count = builtCss.match(new RegExp(`@layer\\s+${escaped}\\s*\\{`, "gu"))?.length ?? 0;
    invariant(
      count === expectedBlocks,
      `Gallery CSS contains ${String(count)} ${layerName} blocks instead of ${String(expectedBlocks)}.`,
    );
  }
  invariant(
    /@layer\s+components\.hraness-ui\.priority3\s*\{[\s\S]*?padding-top:\s*var\(--space-5,\s*1\.25rem\)/u.test(builtCss),
    "Gallery CSS lost the pinned UI QuietSite priority3 output.",
  );
  const builtCssRules = cssLeafRules(builtCss, "Gallery CSS");
  for (const [mapName, branchName, body, priority] of [
    ["playbackTransportStyles", "root", "gap: var(--space-2);", "priority3"],
    ["playbackTransportStyles", "glyph", "block-size: 1.5rem;", "priority4"],
    ["playbackTransportStyles", "glyph", "inline-size: 1.5rem;", "priority4"],
    ["faderStyles", "root", "--hraness-design-fader-thumb-block-size: 1.125rem;", "priority1"],
    ["faderStyles", "root", "--hraness-design-fader-thumb-inline-size: 1.75rem;", "priority1"],
    ["faderStyles", "root", "--hraness-design-fader-track-length: 6rem;", "priority1"],
    ["faderStyles", "compact", "--hraness-design-fader-thumb-block-size: .75rem;", "priority1"],
    ["faderStyles", "compact", "--hraness-design-fader-thumb-inline-size: 1.5rem;", "priority1"],
    ["faderStyles", "compact", "--hraness-design-fader-track-length: var(--interactive-target-min);", "priority1"],
    ["faderStyles", "rail", "inline-size: 4px;", "priority4"],
    ["faderStyles", "focusVisible", "outline-offset: 3px;", "priority4"],
  ] as const) {
    requireCompiledAtomicDeclaration(
      builtCssRules,
      compiledReactJavaScript,
      designPriorityContract.priorityByRuleKey,
      mapName,
      branchName,
      body,
      priority,
      "Gallery CSS",
    );
  }
  requireChatStaticPresentation(
    stylexCss,
    compiledReactJavaScript,
    designPriorityContract.priorityByRuleKey,
    "Gallery design-kit StyleX CSS",
  );
  requireChatStaticPresentation(
    builtCss,
    compiledReactJavaScript,
    designPriorityContract.priorityByRuleKey,
    "Gallery CSS",
  );
  await writeFile(
    join(work, "index.html"),
    [
      "<!doctype html>",
      '<html lang="en"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      `<meta data-gallery-adaptive-theme-color="" name="theme-color" media="(prefers-color-scheme: light)" content="${colors.light.background}">`,
      `<meta data-gallery-adaptive-theme-color="" name="theme-color" media="(prefers-color-scheme: dark)" content="${colors.dark.background}">`,
      `<link rel="stylesheet" href="/${basename(stylesheet)}">`,
      `</head><body><div id="root"></div><script type="module" src="/${basename(script)}"></script></body></html>`,
    ].join(""),
  );

  const server = startGalleryServer(work);

  try {
    const executablePath = await firstExecutable([
      ...(process.env.CHROMIUM_EXECUTABLE_PATH === undefined
        ? []
        : [process.env.CHROMIUM_EXECUTABLE_PATH]),
      chromium.executablePath(),
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ]);
    const browser = await chromium.launch({
      args: ["--no-sandbox"],
      executablePath,
      headless: true,
    });

    try {
      await requireMigrationParity(browser, `http://${server.hostname}:${String(server.port)}`);
      for (const layout of layouts) {
        const page = await browser.newPage({
          colorScheme: "light",
          reducedMotion: "reduce",
          viewport: { height: layout.height, width: layout.width },
        });
        const failures: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") failures.push(`console: ${message.text()}`);
        });
        page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
        await page.addInitScript(() => {
          localStorage.removeItem("hraness-design-theme-v1");
        });
        await page.goto(`http://${server.hostname}:${String(server.port)}/`, {
          waitUntil: "networkidle",
        });
        await page.locator('.hraness-design-theme-toggle[data-ready="true"]').waitFor();

        const state = await evidence(page);
        invariant(state.heading === expectedHeading, `${layout.id}: accessible title changed`);
        invariant(state.copy === expectedCopy, `${layout.id}: explanatory copy changed`);
        invariant(!state.headingClipped, `${layout.id}: title is clipped`);
        invariant(
          state.nebulaLoaded
            && state.proportionalFontFamily.startsWith('"Nebula Sans"')
            && state.headingFontFamily.startsWith('"Nebula Sans"')
            && !state.monoFontFamily.includes("Nebula Sans"),
          `${layout.id}: typography roles are ${JSON.stringify({
            heading: state.headingFontFamily,
            mono: state.monoFontFamily,
            nebulaLoaded: state.nebulaLoaded,
            proportional: state.proportionalFontFamily,
          })}`,
        );
        invariant(state.scrollWidth <= state.clientWidth + 1, `${layout.id}: document overflows horizontally`);
        invariant(
          state.galleryPaddingLeft + 0.5 >= layout.minimumEdgePadding
          && state.galleryPaddingRight + 0.5 >= layout.minimumEdgePadding,
          `${layout.id}: gallery edge padding is below ${String(layout.minimumEdgePadding)}px`,
        );
        invariant(state.appearanceInHeader, `${layout.id}: appearance trigger is outside the header`);
        await requireShellBackgrounds(page, `${layout.id}: initial theme`);
        await requireEffectBackgrounds(page, false, `${layout.id}: initial theme`);
        invariant(
          state.appearanceIsFinalAction,
          `${layout.id}: appearance trigger is not the final header action`,
        );
        invariant(
          state.appearanceRightAligned,
          `${layout.id}: appearance trigger is not aligned to the header action edge`,
        );
        invariant(
          state.appearancePresentation === "menu",
          `${layout.id}: appearance presentation is ${JSON.stringify(state.appearancePresentation)}`,
        );
        invariant(
          state.appearanceTriggerLabel === "Appearance: System",
          `${layout.id}: first-visit appearance is ${JSON.stringify(state.appearanceTriggerLabel)}`,
        );
        invariant(
          layout.id === "compact"
            ? state.railDisplay === "none" && state.mobileTriggerDisplay !== "none"
            : state.railDisplay !== "none" && state.mobileTriggerDisplay === "none",
          `${layout.id}: responsive shell ownership is incorrect`,
        );
        invariant(
          state.animatedRailStageAtomic
            && state.animatedRailStageCallerLast
            && state.animatedRailStageMinInlineSize === "0px"
            && state.animatedRailStageMotionStyle.includes("opacity: 1")
            && state.animatedRailStageStageKey === "default"
            && state.animatedRailStageTransform === "none"
            && state.animatedRailStageTransitionProperty === "none",
          `${layout.id}: AnimatedRailStage gallery delivery is ${JSON.stringify({
            atomic: state.animatedRailStageAtomic,
            callerLast: state.animatedRailStageCallerLast,
            minInlineSize: state.animatedRailStageMinInlineSize,
            motionStyle: state.animatedRailStageMotionStyle,
            stageKey: state.animatedRailStageStageKey,
            transform: state.animatedRailStageTransform,
            transitionProperty: state.animatedRailStageTransitionProperty,
          })}`,
        );
        invariant(
          state.chatAtomic
            && state.chatCallerLast
            && state.chatMessageDisplay === "grid"
            && state.chatMessageColumnCount === 2
            && state.chatMessageGap === "12px"
            && state.chatComposerDisplay === "grid"
            && state.chatComposerAlignItems === "end"
            && state.chatComposerGap === "8px"
            && state.chatComposerColumnCount === (layout.id === "compact" ? 1 : 2)
            && state.chatRowsPresentation
            && state.chatSemantic
            && state.chatNoOwnedInlinePresentation,
          `${layout.id}: Chat delivery is ${JSON.stringify({
            atomic: state.chatAtomic,
            callerLast: state.chatCallerLast,
            composerAlignItems: state.chatComposerAlignItems,
            composerColumns: state.chatComposerColumnCount,
            composerDisplay: state.chatComposerDisplay,
            composerGap: state.chatComposerGap,
            messageColumns: state.chatMessageColumnCount,
            messageDisplay: state.chatMessageDisplay,
            messageGap: state.chatMessageGap,
            noOwnedInlinePresentation: state.chatNoOwnedInlinePresentation,
            rowsPresentation: state.chatRowsPresentation,
            semantic: state.chatSemantic,
          })}`,
        );
        invariant(state.proceduralVariant === "composite", `${layout.id}: procedural variant changed`);
        invariant(
          state.auroraPosition === "absolute" && state.auroraContained,
          `${layout.id}: aurora paint escaped its gallery specimen`,
        );
        invariant(
          state.dotsPosition === "absolute" && state.dotsContained,
          `${layout.id}: dot paint escaped its gallery specimen`,
        );
        invariant(
          state.ditherUsesThemedSurface
            && state.ditherDensity === "medium"
            && state.ditherSize === "4px 4px"
            && state.ditherBackgroundImage.includes("radial-gradient")
            && !state.ditherHasInlineStyle,
          `${layout.id}: DitherSurface gallery delivery is ${JSON.stringify({
            backgroundImage: state.ditherBackgroundImage,
            density: state.ditherDensity,
            hasInlineStyle: state.ditherHasInlineStyle,
            size: state.ditherSize,
            themed: state.ditherUsesThemedSurface,
          })}`,
        );
        invariant(
          state.faderAtomic
            && state.faderCallerLast
            && state.faderInertRails
            && state.faderNoOwnedInlinePresentation
            && state.faderSemantic
            && Number.parseFloat(state.faderDefaultCustomProperties[0] ?? "") === 1.125
            && Number.parseFloat(state.faderDefaultCustomProperties[1] ?? "") === 1.75
            && Number.parseFloat(state.faderDefaultCustomProperties[2] ?? "") === 6
            && Number.parseFloat(state.faderCompactCustomProperties[0] ?? "") === 0.75
            && Number.parseFloat(state.faderCompactCustomProperties[1] ?? "") === 1.5
            && Number.parseFloat(state.faderCompactCustomProperties[2] ?? "") === 3
            && Number.parseFloat(state.faderVerticalDimensions[0] ?? "") === 48
            && Number.parseFloat(state.faderVerticalDimensions[1] ?? "") === 48
            && Number.parseFloat(state.faderVerticalDimensions[2] ?? "") === 96
            && Number.parseFloat(state.faderVerticalDimensions[3] ?? "") === 28
            && Number.parseFloat(state.faderVerticalDimensions[4] ?? "") === 18
            && Number.parseFloat(state.faderHorizontalDimensions[0] ?? "") === 128
            && Number.parseFloat(state.faderHorizontalDimensions[1] ?? "") >= 128
            && Number.parseFloat(state.faderHorizontalDimensions[2] ?? "") === 48
            && Number.parseFloat(state.faderHorizontalDimensions[3] ?? "") === 24
            && Number.parseFloat(state.faderHorizontalDimensions[4] ?? "") === 12
            && Number.parseFloat(state.faderRailPresentation[0] ?? "") === 4
            && Number.parseFloat(state.faderRailPresentation[1] ?? "") === 48
            && Number.parseFloat(state.faderRailPresentation[3] ?? "") === 4
            && Number.parseFloat(state.faderRailPresentation[5] ?? "") === 4
            && Number.parseFloat(state.faderRailPresentation[6] ?? "") === 96
            && Number.parseFloat(state.faderRailPresentation[8] ?? "") === 4
            && state.faderRailPresentation[2] !== "rgba(0, 0, 0, 0)"
            && state.faderRailPresentation[4] !== "rgba(0, 0, 0, 0)"
            && state.faderRailPresentation[2] !== state.faderRailPresentation[4]
            && state.faderRailPresentation[7] !== state.faderRailPresentation[9],
          `${layout.id}: Fader delivery is ${JSON.stringify({
            atomic: state.faderAtomic,
            callerLast: state.faderCallerLast,
            compact: state.faderCompactCustomProperties,
            default: state.faderDefaultCustomProperties,
            horizontal: state.faderHorizontalDimensions,
            inertRails: state.faderInertRails,
            noOwnedInlinePresentation: state.faderNoOwnedInlinePresentation,
            rails: state.faderRailPresentation,
            semantic: state.faderSemantic,
            vertical: state.faderVerticalDimensions,
          })}`,
        );
        invariant(
          state.layoutSurfacesAtomic
            && state.layoutSurfacesSemantic
            && state.layoutTopDisplay === "flex"
            && state.layoutBottomDisplay === "flex"
            && state.layoutPageWidth > 0
            && state.layoutDockPosition === "absolute"
            && state.layoutDockBottom === "0px"
            && state.layoutDockContained,
          `${layout.id}: layout-surface delivery is ${JSON.stringify({
            atomic: state.layoutSurfacesAtomic,
            bottomDisplay: state.layoutBottomDisplay,
            dockBottom: state.layoutDockBottom,
            dockContained: state.layoutDockContained,
            dockPosition: state.layoutDockPosition,
            pageWidth: state.layoutPageWidth,
            semantic: state.layoutSurfacesSemantic,
            topDisplay: state.layoutTopDisplay,
          })}`,
        );
        invariant(
          state.playbackAtomic
            && state.playbackCallerLast
            && state.playbackSemantic
            && state.playbackStatus === "idle"
            && state.playbackDisplay === "flex"
            && state.playbackFlexWrap === "wrap"
            && state.playbackAlignItems === "center"
            && state.playbackGap === "8px"
            && state.playbackGlyphInlineSize === "24px"
            && state.playbackGlyphBlockSize === "24px"
            && !state.playbackHasInlineStyle
            && !state.playbackGlyphHasInlineStyle,
          `${layout.id}: PlaybackTransport delivery is ${JSON.stringify({
            alignItems: state.playbackAlignItems,
            atomic: state.playbackAtomic,
            blockSize: state.playbackGlyphBlockSize,
            callerLast: state.playbackCallerLast,
            display: state.playbackDisplay,
            flexWrap: state.playbackFlexWrap,
            gap: state.playbackGap,
            glyphHasInlineStyle: state.playbackGlyphHasInlineStyle,
            inlineSize: state.playbackGlyphInlineSize,
            rootHasInlineStyle: state.playbackHasInlineStyle,
            semantic: state.playbackSemantic,
            status: state.playbackStatus,
          })}`,
        );
        invariant(
          state.plainLinkDecoration === "none",
          `${layout.id}: plain links are not quiet at rest`,
        );
        invariant(
          !state.plainHeaderOverflows && state.plainHeaderChildrenContained,
          `${layout.id}: plain header content overflows its shell`,
        );
        invariant(
          state.plainHeaderHeight <= 110,
          `${layout.id}: plain header is ${String(state.plainHeaderHeight)}px tall`,
        );
        invariant(
          layout.id === "compact" || !state.plainHeaderWrapped,
          `${layout.id}: plain header wrapped despite available inline room`,
        );
        invariant(
          state.plainThemeMinHeight === "0px" && state.plainThemeHeight < 260,
          `${layout.id}: plain shell specimen is not compact`,
        );
        invariant(state.proceduralCloudCount === 5, `${layout.id}: procedural atmosphere is incomplete`);
        invariant(state.proceduralGridCount === 1, `${layout.id}: procedural grid is incomplete`);
        invariant(state.proceduralRippleCount === 4, `${layout.id}: procedural ripples are incomplete`);
        invariant(state.proceduralCanvasCount === 0, `${layout.id}: excluded canvas effect returned`);
        invariant(state.proceduralAriaHidden && state.proceduralInert, `${layout.id}: procedural paint entered the accessibility tree`);
        invariant(state.proceduralPointerEvents === "none", `${layout.id}: procedural paint captures input`);
        invariant(state.proceduralCoversEffect, `${layout.id}: procedural paint does not cover its presentation surface`);
        invariant(
          state.horizontalFaderThumbCentered,
          `${layout.id}: horizontal fader thumb is not centered on its track`,
        );
        invariant(
          state.verticalFaderThumbCentered,
          `${layout.id}: vertical fader thumb is not centered on its track`,
        );
        const verticalFaderInput = page.locator(
          '[data-gallery-fader="vertical"] input[type="range"]',
        );
        const verticalFaderThumb = page.locator(
          '[data-gallery-fader="vertical"] .hraness-design-fader__thumb',
        );
        const verticalValueBefore = Number(await verticalFaderInput.inputValue());
        await verticalFaderInput.focus();
        await page.keyboard.press("ArrowUp");
        await waitForFaderFocusPresentation(
          page,
          '[data-gallery-fader="vertical"] .hraness-design-fader__thumb',
        );
        const verticalFocus = await verticalFaderThumb.evaluate((thumb) => {
          const style = getComputedStyle(thumb);
          return {
            offset: style.outlineOffset,
            style: style.outlineStyle,
            visible: thumb.hasAttribute("data-focus-visible"),
            width: style.outlineWidth,
          };
        });
        invariant(
          Number(await verticalFaderInput.inputValue()) === verticalValueBefore + 1
            && await page.locator(
              '[data-gallery-fader="vertical"] .hraness-design-fader__output',
            ).textContent() === String(verticalValueBefore + 1)
            && verticalFocus.visible
            && verticalFocus.width === "3px"
            && verticalFocus.offset === "3px"
            && verticalFocus.style === "solid",
          `${layout.id}: vertical Fader keyboard or focus-visible state is ${JSON.stringify({
            focus: verticalFocus,
            value: await verticalFaderInput.inputValue(),
          })}`,
        );

        const horizontalFaderInput = page.locator(
          '[data-gallery-fader="horizontal"] input[type="range"]',
        );
        const horizontalFaderThumb = page.locator(
          '[data-gallery-fader="horizontal"] .hraness-design-fader__thumb',
        );
        const horizontalValueBefore = Number(await horizontalFaderInput.inputValue());
        await horizontalFaderInput.focus();
        await page.keyboard.press("ArrowRight");
        await waitForFaderFocusPresentation(
          page,
          '[data-gallery-fader="horizontal"] .hraness-design-fader__thumb',
        );
        const horizontalFocus = await horizontalFaderThumb.evaluate((thumb) => {
          const style = getComputedStyle(thumb);
          return {
            offset: style.outlineOffset,
            style: style.outlineStyle,
            visible: thumb.hasAttribute("data-focus-visible"),
            width: style.outlineWidth,
          };
        });
        invariant(
          Number(await horizontalFaderInput.inputValue()) === horizontalValueBefore + 1
            && await page.locator(
              '[data-gallery-fader="horizontal"] .hraness-design-fader__output',
            ).textContent() === String(horizontalValueBefore + 1)
            && horizontalFocus.visible
            && horizontalFocus.width === "3px"
            && horizontalFocus.offset === "3px"
            && horizontalFocus.style === "solid",
          `${layout.id}: horizontal Fader keyboard or focus-visible state is ${JSON.stringify({
            focus: horizontalFocus,
            value: await horizontalFaderInput.inputValue(),
          })}`,
        );
        invariant(
          state.palette.length === 4 && state.paletteValid,
          `${layout.id}: procedural palette is ${JSON.stringify(state.palette)}`,
        );

        const playbackCommand = page.locator("#design-gallery-playback-command");
        await playbackCommand.click();
        await page.locator(
          '.design-gallery__playback-transport[data-playback-status="playing"]',
        ).waitFor();
        invariant(
          await playbackCommand.getAttribute("aria-label") === "Stop"
            && await playbackCommand.getAttribute("data-playback-command") === "stop"
            && await playbackCommand.locator('[data-slot="icon"]').count() === 1,
          `${layout.id}: Play did not transition the stable command to Stop`,
        );
        await playbackCommand.click();
        await page.locator(
          '.design-gallery__playback-transport[data-playback-status="idle"]',
        ).waitFor();
        invariant(
          await playbackCommand.getAttribute("aria-label") === "Play"
            && await playbackCommand.getAttribute("data-playback-command") === "play"
            && await playbackCommand.locator('[data-slot="icon"]').count() === 1,
          `${layout.id}: Stop did not restore the stable Play command`,
        );

        const chatComposer = page.locator(".design-gallery__chat-composer");
        const chatTextArea = chatComposer.locator("textarea");
        const chatUrl = page.url();
        await chatTextArea.fill("First line");
        await chatTextArea.press("Enter");
        invariant(
          (await chatTextArea.inputValue()).includes("\n")
            && await page.locator("[data-gallery-chat]")
              .getAttribute("data-gallery-chat-submission") === "",
          `${layout.id}: multiline Enter submitted or lost its newline`,
        );
        await chatTextArea.fill("Verified message");
        await chatComposer.getByRole("button", { name: "Send message" }).click();
        await page.locator('[data-gallery-chat-submission="Verified message"]').waitFor();
        invariant(
          page.url() === chatUrl && await chatTextArea.inputValue() === "",
          `${layout.id}: ChatComposer did not prevent navigation or clear through its controlled callback`,
        );

        const plainLink = page.locator(".design-gallery__plain-link-example a");
        await plainLink.hover();
        invariant(
          await plainLink.evaluate((link) =>
            getComputedStyle(link).textDecorationLine.includes("underline")),
          `${layout.id}: plain links do not reveal an underline on interaction`,
        );

        const appearanceTrigger = page.getByRole("button", { name: "Appearance: System" });
        await appearanceTrigger.focus();
        await page.keyboard.press("Enter");
        const appearanceMenu = page.getByRole("menu", { name: "Appearance" });
        await appearanceMenu.waitFor();
        const appearancePopover = page.locator(
          `.hraness-design-theme-toggle__popover.${appearancePortalCanary.className}`,
        );
        await appearancePopover.waitFor();
        await requireAppearanceBackground(page, `.${appearancePortalCanary.className}`, `${layout.id}: appearance popover`);
        const portalPalette = await appearancePopover.evaluate((popover) => {
          const style = getComputedStyle(popover);
          return {
            backgroundColor: style.backgroundColor,
            color: style.color,
          };
        });
        invariant(
          portalPalette.backgroundColor === appearancePortalCanary.popover
            && portalPalette.color === appearancePortalCanary.popoverForeground,
          `${layout.id}: scoped appearance portal palette is ${JSON.stringify(portalPalette)}`,
        );
        const appearanceChoices = await appearanceMenu
          .locator('[role="menuitemradio"]')
          .allTextContents();
        invariant(
          appearanceChoices.map((choice) => choice.trim()).join("\0") === "Light\0Dark\0System",
          `${layout.id}: appearance choices are ${JSON.stringify(appearanceChoices)}`,
        );
        await page.keyboard.press("End");
        const selectedAppearanceChoice = appearanceMenu.getByRole(
          "menuitemradio",
          { exact: true, name: "System" },
        );
        await page.waitForFunction(
          (selector) => {
            const choice = document.querySelector(selector);
            return choice instanceof HTMLElement
              && choice.getAttribute("aria-checked") === "true"
              && choice.matches(":is([data-focused], :focus-visible)");
          },
          `.${appearancePortalCanary.className} [role="menuitemradio"][aria-checked="true"]`,
          { polling: "raf", timeout: 2_000 },
        );
        const focusedSelectedPalette = await selectedAppearanceChoice.evaluate((choice) => {
          const style = getComputedStyle(choice);
          return {
            backgroundColor: style.backgroundColor,
            color: style.color,
            focused: choice.matches(":is([data-focused], :focus-visible)"),
          };
        });
        invariant(
          focusedSelectedPalette.focused
            && focusedSelectedPalette.backgroundColor === appearancePortalCanary.accent
            && focusedSelectedPalette.color === appearancePortalCanary.accentForeground,
          `${layout.id}: selected focused appearance item is ${JSON.stringify(focusedSelectedPalette)}`,
        );
        await requireAppearanceBackground(page, `.${appearancePortalCanary.className} [role="menuitemradio"][aria-checked="true"]`, `${layout.id}: selected focused item`);
        await selectedAppearanceChoice.hover();
        await page.waitForFunction(
          ({ accent, accentForeground, selector }) => {
            const choice = document.querySelector(selector);
            if (!(choice instanceof HTMLElement) || !choice.matches(":hover")) return false;
            const style = getComputedStyle(choice);
            return style.backgroundColor === accent && style.color === accentForeground;
          },
          {
            accent: appearancePortalCanary.accent,
            accentForeground: appearancePortalCanary.accentForeground,
            selector: `.${appearancePortalCanary.className} [role="menuitemradio"][aria-checked="true"]`,
          },
          { polling: "raf", timeout: 2_000 },
        );
        const hoveredSelectedPalette = await selectedAppearanceChoice.evaluate((choice) => {
          const style = getComputedStyle(choice);
          return {
            backgroundColor: style.backgroundColor,
            color: style.color,
            hovered: choice.matches(":is([data-hovered], :hover)"),
          };
        });
        invariant(
          hoveredSelectedPalette.hovered
            && hoveredSelectedPalette.backgroundColor === appearancePortalCanary.accent
            && hoveredSelectedPalette.color === appearancePortalCanary.accentForeground,
          `${layout.id}: selected hovered appearance item is ${JSON.stringify(hoveredSelectedPalette)}`,
        );
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await page.locator('html[data-theme="dark"]').waitFor();
        await requireShellBackgrounds(page, `${layout.id}: dark theme`);
        await requireEffectBackgrounds(page, true, `${layout.id}: dark theme`);
        invariant(
          await page.getByRole("button", { name: "Appearance: Dark" }).count() === 1,
          `${layout.id}: keyboard appearance change did not select Dark`,
        );
        invariant(failures.length === 0, `${layout.id}: ${failures.join("; ")}`);
        await page.close();
      }

      const coarsePage = await browser.newPage({
        colorScheme: "light",
        hasTouch: true,
        viewport: { height: 844, width: 390 },
      });
      await coarsePage.addInitScript(() => {
        localStorage.removeItem("hraness-design-theme-v1");
      });
      await coarsePage.goto(`http://${server.hostname}:${String(server.port)}/`, {
        waitUntil: "networkidle",
      });
      await coarsePage.locator('.hraness-design-theme-toggle[data-ready="true"]').waitFor();
      const coarseTrigger = coarsePage.getByRole("button", { name: "Appearance: System" });
      const coarseBox = await coarseTrigger.boundingBox();
      invariant(coarseBox !== null, "coarse pointer: appearance trigger has no layout box");
      invariant(
        coarseBox.width >= 48 && coarseBox.height >= 48,
        `coarse pointer: appearance trigger is ${String(coarseBox.width)}×${String(coarseBox.height)}`,
      );
      invariant(
        await coarsePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        "coarse pointer: appearance header overflows horizontally",
      );
      await coarsePage.close();

      const forcedPage = await browser.newPage({
        colorScheme: "light",
        forcedColors: "active",
        reducedMotion: "reduce",
      });
      const forcedFailures: string[] = [];
      forcedPage.on("pageerror", (error) => forcedFailures.push(error.message));
      forcedPage.on("console", (message) => {
        if (message.type() === "error") forcedFailures.push(message.text());
      });
      await forcedPage.addInitScript(() => {
        localStorage.removeItem("hraness-design-theme-v1");
      });
      await forcedPage.goto(`http://${server.hostname}:${String(server.port)}/`, {
        waitUntil: "networkidle",
      });
      await forcedPage.locator('.hraness-design-theme-toggle[data-ready="true"]').waitFor();
      await forcedPage.getByRole("button", { name: "Appearance: System" }).focus();
      await forcedPage.keyboard.press("Enter");
      await forcedPage.getByRole("menu", { name: "Appearance" }).waitFor();
      await forcedPage.keyboard.press("End");
      const forcedChoice = forcedPage.getByRole("menuitemradio", { name: "System", exact: true });
      await forcedChoice.waitFor();
      const forcedPalette = await forcedChoice.evaluate((element) => {
        const probe = document.createElement("span");
        probe.style.backgroundColor = "Highlight";
        probe.style.color = "HighlightText";
        element.append(probe);
        try {
          const actual = getComputedStyle(element);
          const expected = getComputedStyle(probe);
          return {
            selected: element.getAttribute("aria-checked") === "true",
            actual: [actual.backgroundColor, actual.color],
            expected: [expected.backgroundColor, expected.color],
          };
        } finally { probe.remove(); }
      });
      invariant(forcedPalette.selected
        && JSON.stringify(forcedPalette.actual) === JSON.stringify(forcedPalette.expected),
      `forced colors: selected appearance palette is ${JSON.stringify(forcedPalette)}`);
      await requireAppearanceBackground(forcedPage,
        `.${appearancePortalCanary.className} [role="menuitemradio"][aria-checked="true"]`,
        "forced colors: selected appearance item");
      const forcedEffects = await forcedPage.evaluate(() => [
        ".hraness-design-aurora-background", ".hraness-design-aurora-dots",
        ".hraness-design-procedural-backdrop__atmosphere",
        ".hraness-design-procedural-backdrop__grid",
        ".hraness-design-procedural-backdrop__ripples",
      ].map((selector) => {
        const element = document.querySelector(selector);
        return { selector, display: element === null ? "missing" : getComputedStyle(element).display };
      }));
      invariant(forcedEffects.every(({ display }) => display === "none"),
        `forced colors: decoration visibility is ${JSON.stringify(forcedEffects)}`);
      invariant(forcedFailures.length === 0, `forced colors: ${forcedFailures.join("; ")}`);
      await forcedPage.close();

      for (const scenario of [
        {
          expectedColor: colors.light.background,
          os: "dark",
          preference: "light",
        },
        {
          expectedColor: colors.dark.background,
          os: "light",
          preference: "dark",
        },
      ] as const) {
        const page = await browser.newPage({ colorScheme: scenario.os });
        const failures: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") failures.push(`console: ${message.text()}`);
        });
        page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
        await page.addInitScript((preference) => {
          localStorage.setItem("hraness-design-theme-v1", preference);
        }, scenario.preference);
        await page.goto(`http://${server.hostname}:${String(server.port)}/`, {
          waitUntil: "networkidle",
        });
        await page.locator(`html[data-theme="${scenario.preference}"]`).waitFor();
        await page.locator(`meta[${themeColorSyncActiveAttribute}]`).waitFor({
          state: "attached",
        });

        const state = await themeColorEvidence(page);
        invariant(
          state.ownedCount === 1,
          `${scenario.os}/${scenario.preference}: active meta ownership is ambiguous`,
        );
        invariant(
          !state.activeHasMedia,
          `${scenario.os}/${scenario.preference}: active meta is media-qualified`,
        );
        invariant(
          state.activeContent === scenario.expectedColor,
          `${scenario.os}/${scenario.preference}: active color is ${state.activeContent}`,
        );
        invariant(
          state.adaptiveMedia.length === 2
          && state.adaptiveMedia.every((media) => media === "not all"),
          `${scenario.os}/${scenario.preference}: adaptive tags remain active ${JSON.stringify(state.adaptiveMedia)}`,
        );
        invariant(
          state.matchingColors.length === 1
          && state.matchingColors[0] === state.backgroundColor,
          `${scenario.os}/${scenario.preference}: chrome ${JSON.stringify(state.matchingColors)} does not match ${state.backgroundColor}`,
        );
        invariant(
          failures.length === 0,
          `${scenario.os}/${scenario.preference}: ${failures.join("; ")}`,
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
  } finally {
    server.stop(true);
  }
} finally {
  await rm(work, { force: true, recursive: true });
}
