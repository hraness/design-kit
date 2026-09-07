import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as stylex from "@stylexjs/stylex";
import { createStylexTransformCollector, serializeStylexRules } from "@hraness/ui/stylex-build";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductMarketingFixture, productMarketingConsumerCoverage, productMarketingCoverage } from "../../gallery/product-marketing-fixture.js";
import * as api from "./product-marketing.js";
import { marketingClassName, marketingFactCellVariant, marketingStyles } from "./product-marketing.stylex.js";

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
