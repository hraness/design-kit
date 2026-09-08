import { expect, expectTypeOf, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as stylex from "@stylexjs/stylex";
import { createStylexTransformCollector, serializeStylexRules } from "@hraness/ui/stylex-build";
import { parseHTML } from "linkedom";
import fc from "fast-check";
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { MarketingColumnCount as ReactMarketingColumnCount } from "@hraness/design-kit/react";
import type { MarketingColumnCount as ServerMarketingColumnCount } from "@hraness/design-kit/react/server";
import { ProductMarketingFixture, productMarketingConsumerCoverage, productMarketingCoverage } from "../../gallery/product-marketing-fixture.js";
import { ProductMarketingCspFixture, productMarketingCspGrids } from "../../gallery/product-marketing-csp-fixture.js";
import * as api from "./product-marketing.js";
import * as serverApi from "./server.js";
import { marketingClassName, marketingColumnClassName, marketingFactCellVariant, marketingStyles } from "./product-marketing.stylex.js";

const columnFacts = Array.from({ length: 7 }, (_, index) => ({
  label: `Fact ${index + 1}`, value: String(index + 1), detail: `Detail ${index + 1}`,
}));
const columnPillars = columnFacts.map(({ label, detail }) => ({ label, summary: detail }));
const columnHero = { eyebrow: "Product", heading: "One shared result", headingId: "column-hero", name: "Relay", summary: "A bounded composition." };

function columnComposition(columns?: api.MarketingColumnCount) {
  const properties = columns === undefined ? {} : { columns };
  return <serverApi.MarketingPage>
    <serverApi.ProductHero {...columnHero} facts={columnFacts} {...(columns === undefined ? {} : { factsColumns: columns })} />
    <serverApi.MarketingFacts className="facts-caller" facts={columnFacts} {...properties} />
    <serverApi.MarketingPillars ariaLabel="Pillars" className="pillars-caller" pillars={columnPillars} {...properties} />
    <serverApi.MarketingStatStrip ariaLabel="Stats" className="stats-caller" source="Checked example." stats={columnFacts} {...properties} />
  </serverApi.MarketingPage>;
}

test("finite column types are available through both public React entries and every consuming prop", () => {
  expectTypeOf<ReactMarketingColumnCount>().toEqualTypeOf<1 | 2 | 3 | 4>();
  expectTypeOf<ServerMarketingColumnCount>().toEqualTypeOf<ReactMarketingColumnCount>();
  expectTypeOf<api.MarketingColumnCount>().toEqualTypeOf<ReactMarketingColumnCount>();
  expectTypeOf<ComponentProps<typeof api.MarketingFacts>["columns"]>().toEqualTypeOf<ReactMarketingColumnCount | undefined>();
  expectTypeOf<ComponentProps<typeof api.MarketingPillars>["columns"]>().toEqualTypeOf<ReactMarketingColumnCount | undefined>();
  expectTypeOf<ComponentProps<typeof api.MarketingStatStrip>["columns"]>().toEqualTypeOf<ReactMarketingColumnCount | undefined>();
  expectTypeOf<api.ProductHeroProps["factsColumns"]>().toEqualTypeOf<ReactMarketingColumnCount | undefined>();
});

test("every finite column preset renders through the public server entry without inline styles or lost content", () => {
  const legacy = parseHTML(renderToStaticMarkup(columnComposition())).document;
  for (const columns of [1, 2, 3, 4] as const) {
    const html = renderToStaticMarkup(columnComposition(columns));
    const { document } = parseHTML(html);
    expect(document.querySelector("[style], style, script")).toBeNull();
    expect(document.querySelector("h1")?.id).toBe(columnHero.headingId);
    expect(document.querySelectorAll("dl")).toHaveLength(4);
    const lists = [
      [".hraness-marketing-hero .hraness-marketing-facts", "hraness-marketing-facts", undefined],
      [".facts-caller", "hraness-marketing-facts", "facts-caller"],
      [".pillars-caller", "hraness-marketing-pillars", "pillars-caller"],
      [".hraness-marketing-stats__list", "hraness-marketing-stats__list", undefined],
    ] as const;
    for (const [selector, hook, caller] of lists) {
      const list = document.querySelector(selector);
      expect(list?.className).toBe(marketingColumnClassName(hook, caller, columns));
      expect(list?.children.length).toBe(7);
      // The preset changes only the root's column atom. Content, native semantics,
      // logical borders, and responsive cell variants retain the legacy markup.
      expect(list?.innerHTML).toBe(legacy.querySelector(selector)?.innerHTML);
      if (caller !== undefined) expect(list?.className.split(" ").at(-1)).toBe(caller);
    }
    expect(document.querySelector(".stats-caller")?.className.split(" ").at(-1)).toBe("stats-caller");
    expect(document.querySelector(".stats-caller")?.getAttribute("aria-label")).toBe("Stats");
    expect(document.querySelector(".pillars-caller")?.getAttribute("aria-label")).toBe("Pillars");
    expect(document.querySelector(".hraness-marketing-stats__source")?.textContent).toBe("Checked example.");
  }
});

test("the public strict-CSP fixture renders four hero facts, three pillars, and four stats without inline styles", () => {
  const { document } = parseHTML(renderToStaticMarkup(<ProductMarketingCspFixture api={serverApi} />));
  for (const { selector, items } of productMarketingCspGrids) {
    expect(document.querySelectorAll(selector)).toHaveLength(1);
    expect(document.querySelector(selector)?.children.length).toBe(items);
  }
  expect(document.querySelectorAll("details > summary")).toHaveLength(1);
  expect(document.querySelector("details")?.hasAttribute("open")).toBe(false);
  expect(document.querySelector("[style], style, script")).toBeNull();
});

test("omitted columns preserve arbitrary collection counts and all existing root classes", () => {
  for (const count of [1, 3, 4, 5, 11]) {
    const facts = Array.from({ length: count }, (_, index) => ({ label: String(index), value: String(index) }));
    const pillars = facts.map(({ label }) => ({ label, summary: label }));
    const { document } = parseHTML(renderToStaticMarkup(<>
      <api.ProductHero {...columnHero} facts={facts} />
      <api.MarketingFacts className="facts-caller" facts={facts} />
      <api.MarketingPillars ariaLabel="Pillars" className="pillars-caller" pillars={pillars} />
      <api.MarketingStatStrip ariaLabel="Stats" stats={facts} />
    </>));
    expect(document.querySelectorAll("[style]")).toHaveLength(4);
    for (const list of document.querySelectorAll("dl")) {
      const property = list.matches(".hraness-marketing-pillars") ? "pillar" : "fact";
      expect(list.getAttribute("style")).toBe(`--hraness-marketing-${property}-columns:${count}`);
      expect(list.children.length).toBe(count);
    }
    expect(document.querySelector(".facts-caller")?.className).toBe(marketingClassName("hraness-marketing-facts", "facts-caller"));
    expect(document.querySelector(".pillars-caller")?.className).toBe(marketingClassName("hraness-marketing-pillars", "pillars-caller"));
    expect(document.querySelector(".hraness-marketing-stats__list")?.className).toBe(marketingClassName("hraness-marketing-stats__list"));
  }
});

test("valid empty collections still render nothing, including empty hero facts", () => {
  for (const columns of [undefined, 1, 2, 3, 4] as const) {
    const properties = columns === undefined ? {} : { columns };
    expect(renderToStaticMarkup(<api.MarketingFacts facts={[]} {...properties} />)).toBe("");
    expect(renderToStaticMarkup(<api.MarketingPillars ariaLabel="Pillars" pillars={[]} {...properties} />)).toBe("");
    expect(renderToStaticMarkup(<api.MarketingStatStrip ariaLabel="Stats" stats={[]} {...properties} />)).toBe("");
    const { document } = parseHTML(renderToStaticMarkup(<api.ProductHero {...columnHero} {...(columns === undefined ? {} : { factsColumns: columns })} />));
    expect(document.querySelector("dl, [style]")).toBeNull();
  }
});

test("invalid explicit columns fail closed before rendering even empty collections", () => {
  const reject = (value: unknown) => {
    const columns = value as api.MarketingColumnCount;
    for (const facts of [[], columnFacts]) {
      const pillars = facts.map(({ label, detail }) => ({ label, summary: detail }));
      for (const node of [
        <api.MarketingFacts facts={facts} columns={columns} />,
        <api.MarketingPillars ariaLabel="Pillars" pillars={pillars} columns={columns} />,
        <api.MarketingStatStrip ariaLabel="Stats" stats={facts} columns={columns} />,
        <api.ProductHero {...columnHero} facts={facts} factsColumns={columns} />,
      ]) expect(() => renderToStaticMarkup(node)).toThrow("Marketing columns must be 1, 2, 3, or 4 when specified.");
    }
  };
  for (const value of [null, false, true, 0, -1, 5, 1.5, NaN, Infinity, -Infinity, "1", "4", "", {}, [1], 1n, Symbol("1")]) reject(value);
  fc.assert(fc.property(fc.anything().filter((value) => value !== undefined && value !== 1 && value !== 2 && value !== 3 && value !== 4), reject), { numRuns: 50, seed: 41203 });
});

test("all 18 marketing compositions render real owned atoms with native server-only semantics", () => {
  const html = renderToStaticMarkup(<ProductMarketingFixture api={api} />);
  const { document } = parseHTML(html);
  expect(Object.keys(api).filter((name) => name.startsWith("Marketing") || name === "ProductHero")).toHaveLength(18);
  const owned = [...document.querySelectorAll('[class*="hraness-marketing-"]')];
  expect(owned.length).toBeGreaterThan(250);
  for (const node of owned) {
    const tokens = node.className.split(/\s+/u);
    expect(tokens[0]).toStartWith("hraness-marketing-");
    expect(tokens.slice(1).some((token) => /^x[\da-z]+$/u.test(token))).toBe(true);
  }
  const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const node of document.querySelectorAll("[aria-labelledby]")) {
    expect(document.getElementById(node.getAttribute("aria-labelledby") ?? "")).not.toBeNull();
  }
  for (const [name, selector, count] of productMarketingCoverage) {
    expect(document.querySelectorAll(selector).length, name).toBe(count);
  }
  expect(document.querySelectorAll("[data-marketing-oracle]")).toHaveLength(productMarketingConsumerCoverage.length);
  for (const name of productMarketingConsumerCoverage) {
    expect(document.querySelectorAll(`[data-marketing-oracle="${name}"]`).length, name).toBe(1);
  }
  expect(document.querySelectorAll("details")).toHaveLength(2);
  expect(document.querySelectorAll("details > summary")).toHaveLength(2);
  expect(document.querySelector("[open]")).toBeNull();
  expect(document.querySelector("script")).toBeNull();
  expect(document.querySelector(".fixture-caller-last")?.className.split(" ").at(-1)).toBe("fixture-caller-last");
  expect(document.querySelectorAll('[style*="--hraness-marketing-fact-columns"]')).toHaveLength(6);
  expect(document.querySelectorAll('[style*="--hraness-marketing-pillar-columns"]')).toHaveLength(1);
  expect(html).not.toMatch(/onClick|onToggle|aria-expanded|tabindex=/iu);
});

test("the finite recipes preserve explicit variants and reject unknown states", () => {
  for (const recipe of Object.values(marketingStyles)) {
    expect(stylex.props(recipe).className?.length).toBeGreaterThan(0);
  }
  expect(marketingClassName("hraness-marketing-header")).toBe([
    "hraness-marketing-header", stylex.props(marketingStyles.header).className,
  ].join(" "));
  expect(marketingClassName("hraness-marketing-header", "caller", "static").split(" ").at(-1)).toBe("caller");
  expect(() => marketingClassName("hraness-marketing-header", undefined, "missing")).toThrow("Unknown marketing variant");
  expect([0, 1, 2, 3, 4].map(marketingFactCellVariant)).toEqual(["default", "later", "row-odd", "row", "row-odd"]);
  expect(marketingClassName("hraness-marketing-action", undefined, "hero-primary"))
    .not.toBe(marketingClassName("hraness-marketing-action", undefined, "cta-primary"));
  const focusTokens = stylex.props(marketingStyles.actionFocus).className?.split(" ") ?? [];
  expect(focusTokens.length).toBeGreaterThan(0);
  for (const variant of ["default", "primary", "header-secondary", "header-primary", "plan-secondary", "plan-primary", "hero-primary", "hero-secondary", "cta-primary", "cta-secondary"]) {
    const tokens = marketingClassName("hraness-marketing-action", undefined, variant).split(" ");
    for (const token of focusTokens) expect(tokens).toContain(token);
  }
});

test("the immutable static grammar and 26-token foundation stay separate from owned atoms", async () => {
  const [legacy, foundation, compiler, source] = await Promise.all([
    readFile(new URL("../product-marketing.css", import.meta.url), "utf8"),
    readFile(new URL("../product-marketing-foundation.css", import.meta.url), "utf8"),
    readFile(new URL("../compiler-foundation.css", import.meta.url), "utf8"),
    readFile(new URL("./product-marketing.stylex.ts", import.meta.url), "utf8"),
  ]);
  expect(createHash("sha256").update(legacy).digest("hex"))
    .toBe("f2437b977ddb764d9648e5a22fff9d376022b3606a225fe54d38f30a536e57e4");
  const tokenNames = (text: string) => [...new Set([...(text.match(/:where\([\s\S]*?\)\s*\{([^}]*)\}/u)?.[1] ?? "").matchAll(/(--hraness-marketing-[a-z-]+):/gu)].map((match) => match[1]))].sort();
  expect(tokenNames(foundation)).toHaveLength(26);
  expect(tokenNames(foundation)).toEqual(tokenNames(legacy));
  const tokenRoots = (text: string) => (text.match(/:where\(([^)]*)\)\s*\{/u)?.[1] ?? "")
    .split(",").map((selector) => selector.trim());
  const expectedRoots = ["page", "header", "hero", "pillars", "install", "section", "primitives", "stats",
    "interfaces", "trust", "quotes", "pricing", "questions", "maker", "cta", "proof-frame"]
    .map((role) => `.hraness-marketing-${role}`);
  expect(tokenRoots(legacy)).toEqual(expectedRoots);
  expect(tokenRoots(foundation)).toEqual(expectedRoots);
  expect(compiler).toContain('@import "./product-marketing-foundation.css";');
  expect(compiler).not.toContain('@import "./product-marketing.css";');
  expect(foundation).not.toContain(".hraness-marketing-hero__heading");
  expect(foundation).toContain(".hraness-marketing-page > .hraness-marketing-install");
  expect(source).not.toMatch(/fontPalette|font-palette|fontLanguageOverride|font-language-override/u);
  expect(source).toContain('"border-inline-start"');
  expect(source).toContain('"border-image-source": "none"');
  expect(source).toContain('stylex.when.ancestor("[open]", questionMarker)');
  expect(source).toContain("export const questionMarker = stylex.defineMarker();");
});

test("the public collector compiles native logical edges, backgrounds, media, and details deterministically", async () => {
  const filename = resolve(import.meta.dir, "product-marketing.stylex.ts");
  const source = await readFile(filename, "utf8");
  const first = createStylexTransformCollector(process.cwd());
  const second = createStylexTransformCollector(process.cwd());
  const a = await first.transform(source, filename);
  const b = await second.transform(source, filename);
  expect(a.code).toBe(b.code);
  const rules = first.seal();
  expect(rules).toEqual(second.seal());
  expect(rules.length).toBeGreaterThan(150);
  const css = serializeStylexRules(rules);
  for (const property of ["border-inline-start", "border-block-end", "border-image-source", "background-image", "background-size", "inset-block-start", "padding-inline"]) {
    expect(css).toContain(`${property}:`);
  }
  expect(css).toContain("forced-colors");
  expect(css).toContain("pointer: coarse");
  expect(css).toContain("[open]");
  expect(css).toContain("rotate(45deg)");
  expect(a.code).not.toContain("inject(");
  const recipeRules = (recipe: stylex.CompiledStyles) => {
    const tokens = new Set(stylex.props(recipe).className?.split(" ") ?? []);
    return rules.filter(([name]) => tokens.has(name)).map(([, rule]) => rule.ltr);
  };
  for (const [property, presets] of [
    ["--hraness-marketing-fact-columns", [marketingStyles.factColumns1, marketingStyles.factColumns2, marketingStyles.factColumns3, marketingStyles.factColumns4]],
    ["--hraness-marketing-pillar-columns", [marketingStyles.pillarColumns1, marketingStyles.pillarColumns2, marketingStyles.pillarColumns3, marketingStyles.pillarColumns4]],
  ] as const) {
    for (const [index, preset] of presets.entries()) {
      expect(stylex.props(preset).style).toBeUndefined();
      const emitted = recipeRules(preset);
      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toContain(`${property}:${index + 1}`);
      expect(emitted[0]).not.toContain("@media");
    }
  }
  for (const recipe of [marketingStyles.facts, marketingStyles.stats__list]) {
    const emitted = recipeRules(recipe).join("");
    expect(emitted).toContain("repeat(var(--hraness-marketing-fact-columns,4),minmax(0,1fr))");
    expect(emitted).toMatch(/@media[^{}]*max-width:\s*48rem[^{}]*\{[^{}]*\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/u);
  }
  const pillarRules = recipeRules(marketingStyles.pillars).join("");
  expect(pillarRules).toContain("repeat(var(--hraness-marketing-pillar-columns,3),minmax(0,1fr))");
  expect(pillarRules).toMatch(/@media[^{}]*max-width:\s*48rem[^{}]*\{[^{}]*\{grid-template-columns:minmax\(0,1fr\)/u);
  for (const recipe of [marketingStyles.actionFocus, marketingStyles.question__summary]) {
    const focus = recipeRules(recipe).filter((rule) => rule.includes(":focus-visible")).join("");
    expect(focus).toMatch(/outline:\s*2px solid var\(--hraness-marketing-accent\)/u);
    expect(focus).toMatch(/outline-offset:\s*2px/u);
  }
  expect(recipeRules(marketingStyles.question__summary).filter((rule) => rule.includes(":focus-visible")).join(""))
    .toMatch(/border-radius:\s*0?\.25rem/u);
  for (const recipe of [marketingStyles.headerAction, marketingStyles.headerActionPrimary]) {
    const height = recipeRules(recipe).filter((rule) => rule.includes("min-block-size:"));
    expect(height.join("")).toContain("2.25rem");
    expect(height.join("")).not.toContain("3rem");
  }
  for (const recipe of [marketingStyles.actionPrimary, marketingStyles.headerActionPrimary,
    marketingStyles.planActionPrimary]) {
    const forcedHoverBackground = recipeRules(recipe).filter((rule) => rule.includes(":hover")
      && rule.includes("forced-colors") && rule.includes("background-color:"));
    expect(forcedHoverBackground).toHaveLength(1);
    expect(forcedHoverBackground[0]).toMatch(/background-color:\s*Canvas\b/iu);
  }
  for (const recipe of [marketingStyles.heroActionPrimary, marketingStyles.heroActionSecondary,
    marketingStyles.ctaActionPrimary, marketingStyles.ctaActionSecondary, marketingStyles.hero__eyebrowAccent]) {
    const backgrounds = recipeRules(recipe).filter((rule) => rule.includes("background-"));
    expect(backgrounds.length).toBeGreaterThan(0);
    expect(backgrounds.join("")).not.toContain("forced-colors");
  }
  for (const side of ["top", "right", "bottom", "left"]) {
    expect(recipeRules(marketingStyles.planPrimary).join("")).toContain(`border-${side}-color:`);
  }
});
