import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";

import {
  canonicalJson,
  compilerSha256,
  readStylexPackageManifest,
  serializeStylexPackageRules,
  stylexRulesSha256,
  type StylexRuleV1,
} from "@hraness/ui/stylex-build";

const DESIGN_COMPONENTS_IMPORT = '@import "./components.css";';
const DESIGN_COMPILER_COMPONENTS_IMPORT = '@import "./compiler-components.css";';
const DESIGN_STYLEX_IMPORT = '@import "../dist/stylex.css";';
const GALLERY_LAYER_CONFLICT_SENTINEL = "data-design-kit-stylex-";
const TOP_LEVEL_LAYER_PRELUDE = "@layer base, components;";
const UI_COMPONENTS_IMPORT = '@import "@hraness/ui/components.css";';
const UI_STYLEX_IMPORT = '@import "@hraness/ui/stylex.css";';
const COMPILER_STYLESHEET_PATHS = [
  "src/appearance-menu.css",
  "src/charts.css",
  "src/compiler-components.css",
  "src/compiler-foundation.css",
  "src/compiler-tokens.css",
  "src/components.css",
  "src/design-gallery.css",
  "src/effects.css",
  "src/fonts.css",
  "src/jelly.css",
  "src/plain-publication.css",
  "src/plain-site.css",
  "src/product-marketing-foundation.css",
  "src/product-marketing.css",
  "src/reset.css",
  "src/styles.css",
  "src/syntax-highlighting.css",
  "src/tokens.css",
  "src/typography.css",
] as const;

const DESIGN_STYLEX_LAYER_INVENTORY = [
  "components.hraness-design-kit.priority1",
  "components.hraness-design-kit.priority2",
  "components.hraness-design-kit.priority3",
  "components.hraness-design-kit.priority4",
  "components.hraness-design-kit.priority5",
  "components.hraness-design-kit.priority6",
  "components.hraness-design-kit.priority7",
  "components.hraness-design-kit.priority8",
] as const;
const DESIGN_STYLEX_LAYERS = DESIGN_STYLEX_LAYER_INVENTORY.slice(1);
const UI_LEGACY_LAYERS = [
  "components.hraness-ui.legacy.base",
  "components.hraness-ui.legacy",
] as const;
const UI_STYLEX_LAYER_INVENTORY = [
  "components.hraness-ui.priority1",
  "components.hraness-ui.priority2",
  "components.hraness-ui.priority3",
  "components.hraness-ui.priority4",
  "components.hraness-ui.priority5",
  "components.hraness-ui.priority6",
  "components.hraness-ui.priority7",
] as const;
const UI_STYLEX_LAYERS = UI_STYLEX_LAYER_INVENTORY.slice(1);
const DESIGN_GENERATED_LAYER_PRELUDE =
  `@layer components.hraness-design-kit.legacy, ${DESIGN_STYLEX_LAYER_INVENTORY.join(", ")};`;
const UI_GENERATED_LAYER_PRELUDE =
  `@layer ${[...UI_LEGACY_LAYERS, ...UI_STYLEX_LAYER_INVENTORY].join(", ")};`;
const LOCAL_LAYER_PRELUDE = DESIGN_GENERATED_LAYER_PRELUDE;
const PORTFOLIO_LAYER_PRELUDE =
  `@layer ${[
    ...UI_LEGACY_LAYERS,
    ...UI_STYLEX_LAYER_INVENTORY,
    "components.hraness-design-kit.legacy",
    ...DESIGN_STYLEX_LAYER_INVENTORY,
  ].join(", ")};`;

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function logical(root: string, path: string): string {
  const value = relative(root, path).split(sep).join("/");
  assert.ok(
    value.length > 0 && value !== ".." && !value.startsWith("../"),
    `Artifact escapes its root: ${path}`,
  );
  return value;
}

function requireMatch(source: string, pattern: RegExp, description: string): void {
  if (!pattern.test(source)) {
    throw new Error(`StyleX artifact is missing ${description}`);
  }
}

function forbid(source: string, pattern: RegExp, description: string): void {
  if (pattern.test(source)) {
    throw new Error(`StyleX artifact unexpectedly contains ${description}`);
  }
}

function topLevelStatements(source: string, description: string): string[] {
  const statements: string[] = [];
  let blockDepth = 0;
  let escaped = false;
  let start = -1;
  let stringQuote: '"' | "'" | undefined;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === undefined) continue;

    if (stringQuote !== undefined) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === stringQuote) {
        stringQuote = undefined;
      }
      continue;
    }

    if (character === "/" && nextCharacter === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      if (commentEnd < 0) {
        throw new Error(`${description} contains an unterminated comment`);
      }
      index = commentEnd + 1;
      continue;
    }

    if (start < 0) {
      if (/\s/u.test(character)) continue;
      start = index;
    }

    if (character === '"' || character === "'") {
      stringQuote = character;
      continue;
    }

    if (character === "{") {
      blockDepth += 1;
      continue;
    }
    if (character === "}") {
      blockDepth -= 1;
      if (blockDepth < 0) {
        throw new Error(`${description} contains an unmatched closing brace`);
      }
      if (blockDepth === 0 && start >= 0) {
        statements.push(source.slice(start, index + 1).trim());
        start = -1;
      }
      continue;
    }
    if (character === ";" && blockDepth === 0 && start >= 0) {
      statements.push(source.slice(start, index + 1).trim());
      start = -1;
    }
  }

  if (stringQuote !== undefined || blockDepth !== 0) {
    throw new Error(`${description} contains an unterminated CSS construct`);
  }
  if (start >= 0 && source.slice(start).trim().length > 0) {
    throw new Error(`${description} contains an unterminated top-level statement`);
  }
  return statements;
}

type SerializedPriorityContract = Readonly<{
  blockLayers: readonly string[];
  prefix: string;
  priorityByRuleKey: ReadonlyMap<string, string>;
  rawPrioritiesByRank: readonly (readonly number[])[];
  unlayeredPriorities: ReadonlySet<string>;
  unlayeredStatements: readonly string[];
}>;

function escapedPattern(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function statementContainsRuleKey(statement: string, key: string): boolean {
  const escaped = escapedPattern(key);
  return new RegExp(`(?:@keyframes\\s+${escaped}(?=\\s*\\{)|\\.${escaped}(?![A-Za-z0-9_-]))`, "u")
    .test(statement);
}

function requireRuleSerializedRank(
  source: string,
  key: string,
  contract: SerializedPriorityContract,
  description: string,
): string {
  const expectedPriority = contract.priorityByRuleKey.get(key);
  assert.ok(expectedPriority !== undefined, `${description} has no manifest priority for ${key}`);
  const expectedLayer = contract.unlayeredPriorities.has(expectedPriority)
    ? undefined
    : `${contract.prefix}.${expectedPriority}`;
  const containingStatements = topLevelStatements(source, description)
    .filter((statement) => statementContainsRuleKey(statement, key));
  assert.ok(containingStatements.length > 0, `${description} does not serialize manifest rule ${key}`);
  for (const statement of containingStatements) {
    const actualLayer = statement.match(/^@layer\s+([A-Za-z0-9_.-]+)\s*\{/u)?.[1];
    assert.equal(
      actualLayer,
      expectedLayer,
      `${description} serializes ${key} outside its manifest-derived ${expectedPriority} rank`,
    );
  }
  return expectedPriority;
}

function requireSerializedPriorityContract(
  source: string,
  rules: readonly StylexRuleV1[],
  legacyLayers: readonly string[],
  prefix: string,
  description: string,
): SerializedPriorityContract {
  const emittedRules = rules.filter(([, value]) => value.constKey === undefined);
  assert.ok(emittedRules.length > 0, `${description} has no emitted StyleX rules`);
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
  for (const [key, , rawPriority] of emittedRules) {
    const rank = rawPriorityLevels.indexOf(Math.floor(rawPriority / 1000)) + 1;
    assert.ok(rank > 0, `${description} cannot rank ${key}`);
    const priority = `priority${String(rank)}`;
    const previous = priorityByRuleKey.get(key);
    assert.ok(
      previous === undefined || previous === priority,
      `${description} assigns ${key} to inconsistent serialized priorities`,
    );
    priorityByRuleKey.set(key, priority);
  }

  const priorityLayers = rawPriorityLevels.map(
    (_level, index) => `${prefix}.priority${String(index + 1)}`,
  );
  const statements = topLevelStatements(source, description);
  assert.equal(statements[0], TOP_LEVEL_LAYER_PRELUDE, `${description} has the wrong top-level layer prelude`);
  assert.equal(
    statements[1],
    `@layer ${[...legacyLayers, ...priorityLayers].join(", ")};`,
    `${description} does not declare its complete manifest-derived priority inventory`,
  );

  const bodyStatements = statements.slice(2);
  const blockLayers = bodyStatements.flatMap((statement) => {
    const layer = statement.match(/^@layer\s+([A-Za-z0-9_.-]+)\s*\{/u)?.[1];
    return layer === undefined ? [] : [layer];
  });
  assert.ok(
    rawPriorityLevels.every((level) => level >= 0),
    `${description} contains an unsupported negative StyleX priority group`,
  );
  const expectedBlockLayers = rawPriorityLevels.flatMap((level, index) =>
    level > 0 ? [`${prefix}.priority${String(index + 1)}`] : []);
  const unlayeredPriorities = new Set(
    rawPriorityLevels.flatMap((level, index) =>
      level === 0 ? [`priority${String(index + 1)}`] : []),
  );
  assert.deepEqual(
    blockLayers,
    expectedBlockLayers,
    `${description} named blocks differ from its manifest-derived serialized ranks`,
  );

  const unlayeredStatements = bodyStatements.filter((statement) =>
    !/^@layer\s+[A-Za-z0-9_.-]+\s*\{/u.test(statement));
  const contract: SerializedPriorityContract = {
    blockLayers,
    prefix,
    priorityByRuleKey,
    rawPrioritiesByRank,
    unlayeredPriorities,
    unlayeredStatements,
  };
  for (const [key] of emittedRules) {
    requireRuleSerializedRank(source, key, contract, description);
  }
  const unlayeredRuleKeys = new Set(
    [...priorityByRuleKey]
      .filter(([, priority]) => unlayeredPriorities.has(priority))
      .map(([key]) => key),
  );
  for (const statement of unlayeredStatements) {
    assert.ok(
      [...unlayeredRuleKeys].some((key) => statementContainsRuleKey(statement, key)),
      `${description} contains unlayered output without a manifest-derived unlayered rule`,
    );
  }

  return contract;
}

function requireOnlyLayerBlocks(
  source: string,
  allowedLayers: ReadonlySet<string>,
  description: string,
  allowGeneratedKeyframes = false,
  expectedUnlayeredStatements: readonly string[] = [],
): string[] {
  const statements = topLevelStatements(source, description);
  if (statements.length === 0) {
    throw new Error(`${description} must contain a named layer block`);
  }

  const layers: string[] = [];
  const remainingUnlayeredStatements = [...expectedUnlayeredStatements];
  for (const statement of statements) {
    const layer = statement.match(/^@layer\s+([A-Za-z0-9_.-]+)\s*\{/u)?.[1];
    if (layer !== undefined && allowedLayers.has(layer)) {
      layers.push(layer);
      continue;
    }
    if (allowGeneratedKeyframes
      && /^@keyframes\s+x[A-Za-z0-9_-]+\s*\{/u.test(statement)) {
      continue;
    }
    const unlayeredIndex = remainingUnlayeredStatements.indexOf(statement);
    if (unlayeredIndex >= 0) {
      remainingUnlayeredStatements.splice(unlayeredIndex, 1);
      continue;
    }
    {
      throw new Error(
        `${description} contains top-level content outside its allowed named layers`,
      );
    }
  }
  assert.deepEqual(
    remainingUnlayeredStatements,
    [],
    `${description} omits expected manifest-derived unlayered output`,
  );
  return layers;
}

function requireGeneratedLayerContract(
  source: string,
  allowedLayers: readonly string[],
  description: string,
  requiredLayers: readonly string[] = allowedLayers,
  generatedLayerPrelude?: string,
  allowGeneratedKeyframes = false,
  expectedUnlayeredStatements: readonly string[] = [],
): void {
  let layerSource = source;
  if (generatedLayerPrelude !== undefined) {
    const generatedPrelude = `${TOP_LEVEL_LAYER_PRELUDE}\n${generatedLayerPrelude}\n`;
    if (!source.startsWith(generatedPrelude)) {
      throw new Error(`${description} has the wrong canonical generated layer prelude`);
    }
    layerSource = source.slice(generatedPrelude.length);
  }
  const layers = requireOnlyLayerBlocks(
    layerSource,
    new Set(allowedLayers),
    description,
    allowGeneratedKeyframes,
    expectedUnlayeredStatements,
  );
  assert.deepEqual(layers, requiredLayers, `${description} has missing, duplicate, or reordered named layers`);
}

function requireLocalComponentsContract(source: string): void {
  const statements = topLevelStatements(source, "src/components.css");
  if (statements.length !== 3
    || statements[0] !== LOCAL_LAYER_PRELUDE
    || statements[1] !== DESIGN_STYLEX_IMPORT
    || statements[2] !== DESIGN_COMPILER_COMPONENTS_IMPORT) {
    throw new Error(
      "src/components.css must contain the exact local layer prelude, one standalone StyleX import, and one compiler-components import with no bare or unlayered rules",
    );
  }
}

function requireCompilerComponentsContract(source: string): void {
  const statements = topLevelStatements(source, "src/compiler-components.css");
  const legacyLayer = statements[0]?.match(
    /^@layer\s+(components\.hraness-design-kit\.legacy)\s*\{/u,
  )?.[1];
  if (statements.length !== 1
    || legacyLayer !== "components.hraness-design-kit.legacy") {
    throw new Error(
      "src/compiler-components.css must contain exactly one design-kit legacy layer block with no imports, bare rules, or generated priority declarations",
    );
  }
  const layer = statements[0] ?? "";
  const rules = topLevelStatements(layer.slice(layer.indexOf("{") + 1, -1), "compiler-components utility");
  assert.equal(rules.length, 1, "Only the shared visually-hidden utility may remain in compiler-components.css");
  const rule = rules[0] ?? "";
  assert.equal(rule.slice(0, rule.indexOf("{")).trim(), ".hraness-design-visually-hidden");
  assert.equal(rule.slice(rule.indexOf("{") + 1, -1).replace(/\s+/gu, ""),
    "position:absolute;inline-size:1px;block-size:1px;padding:0;overflow:hidden;clip:rect(0000);white-space:nowrap;border:0;",
    "The shared visually-hidden utility must retain its exact accessibility declarations");
}

function requireAggregateContract(source: string): void {
  const expectedStatements = [
    TOP_LEVEL_LAYER_PRELUDE,
    PORTFOLIO_LAYER_PRELUDE,
    '@import "./tokens.css";',
    '@import "./reset.css";',
    '@import "./typography.css";',
    '@import "./syntax-highlighting.css";',
    '@import "./effects.css";',
    UI_COMPONENTS_IMPORT,
    UI_STYLEX_IMPORT,
    DESIGN_COMPONENTS_IMPORT,
    '@import "./appearance-menu.css";',
    '@import "./charts.css";',
    '@import "./jelly.css";',
    '@import "./plain-site.css";',
    '@import "./plain-publication.css";',
    '@import "./product-marketing.css";',
    '@import "./product-marketing-foundation.css";',
    '@import "./design-gallery.css";',
  ];
  const statements = topLevelStatements(source, "src/styles.css");
  if (statements.length !== expectedStatements.length
    || statements.some((statement, index) => statement !== expectedStatements[index])) {
    throw new Error(
      "src/styles.css must contain the exact base < components and UI legacy.base < UI legacy < UI priority1/2/3/4/5/6/7 < design-kit legacy < design-kit priority1/2/3/4/5/6/7/8 preludes before its ordered imports",
    );
  }
}

function requireCompilerFoundationContract(source: string): void {
  const expectedStatements = [
    TOP_LEVEL_LAYER_PRELUDE,
    "@layer components.hraness-ui.legacy.base, components.hraness-ui.legacy, components.hraness-design-kit.legacy;",
    '@import "@hraness/ui/compiler-foundation.css";',
    '@import "./compiler-tokens.css";',
    '@import "./typography.css";',
    '@import "./syntax-highlighting.css";',
    '@import "./effects.css";',
    DESIGN_COMPILER_COMPONENTS_IMPORT,
    '@import "./appearance-menu.css";',
    '@import "./charts.css";',
    '@import "./jelly.css";',
    '@import "./plain-site.css";',
    '@import "./plain-publication.css";',
    '@import "./product-marketing-foundation.css";',
    '@import "./design-gallery.css";',
  ];
  const statements = topLevelStatements(source, "src/compiler-foundation.css");
  if (statements.length !== expectedStatements.length
    || statements.some((statement, index) => statement !== expectedStatements[index])) {
    throw new Error(
      "src/compiler-foundation.css must preserve the exact recipe-free UI + design-kit foundation order",
    );
  }
  forbid(
    source,
    /(?:styles|stylex)\.css|components\.(?:hraness-ui|hraness-design-kit)\.priority\d+/u,
    "a standalone recipe sheet or fixed generated priority in the compiler foundation",
  );
}

function selectors(source: string): string[] {
  const result: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) { escaped = false; continue; }
    if (character === "\\") { escaped = true; continue; }
    if (quote !== "") {
      if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === "(" || character === "[") depth += 1;
    if (character === ")" || character === "]") depth -= 1;
    if (character === "," && depth === 0) {
      result.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  assert.equal(depth, 0, "Unbalanced fallback selector");
  assert.equal(quote, "", "Unterminated fallback selector string");
  result.push(source.slice(start).trim());
  return result;
}

const EFFECTS_DARK_BRIDGE_SELECTORS = [
  '[data-theme="dark"] .hraness-design-aurora-background',
  ".dark .hraness-design-aurora-background",
] as const;
const EFFECTS_DARK_BRIDGE_DECLARATIONS = [
  ["--hraness-design-aurora-cyan-mix", "15%"],
  ["--hraness-design-aurora-gold-mix", "13%"],
  ["--hraness-design-aurora-violet-mix", "13%"],
  ["--hraness-design-aurora-mint-mix", "12%"],
  ["--hraness-design-aurora-background-mix", "90%"],
  ["--hraness-design-aurora-before-opacity", "0.52"],
  ["--hraness-design-aurora-after-opacity", "0.18"],
] as const;

function effectsDarkBridgeRule(source: string, file: string): string {
  const legacy = "@layer components.hraness-design-kit.legacy";
  const statements = topLevelStatements(source, file);
  assert.equal(statements.length, 1, `${file}: expected exactly one legacy dark-theme bridge`);
  const layer = statements[0] ?? "";
  const opening = layer.indexOf("{");
  assert.ok(opening > 0 && layer.endsWith("}"), `${file}: malformed legacy dark-theme bridge`);
  assert.equal(
    layer.slice(0, opening).trim(),
    legacy,
    `${file}: the dark-theme bridge must use the design-kit legacy layer`,
  );
  const rules = topLevelStatements(layer.slice(opening + 1, -1), `${file} dark-theme bridge`);
  assert.equal(rules.length, 1, `${file}: expected exactly one dark-theme bridge rule`);
  const rule = rules[0] ?? "";
  const ruleOpening = rule.indexOf("{");
  assert.ok(ruleOpening > 0 && rule.endsWith("}"), `${file}: malformed dark-theme bridge rule`);
  assert.deepEqual(
    selectors(rule.slice(0, ruleOpening).trim()),
    EFFECTS_DARK_BRIDGE_SELECTORS,
    `${file}: the dark-theme bridge must use the exact two reviewed ancestor selectors`,
  );
  const declarations = rule.slice(ruleOpening + 1, -1)
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      assert.ok(colon > 0, `${file}: malformed dark-theme bridge declaration`);
      return [
        declaration.slice(0, colon).trim(),
        declaration.slice(colon + 1).trim(),
      ];
    });
  assert.deepEqual(
    declarations,
    EFFECTS_DARK_BRIDGE_DECLARATIONS,
    `${file}: the dark-theme bridge must preserve the exact seven reviewed token values`,
  );
  return rule;
}

function requirePresentationBoundary(source: string, file: string): void {
  if (file === "src/effects.css") {
    effectsDarkBridgeRule(source, file);
    return;
  }
  const legacy = "@layer components.hraness-design-kit.legacy";
  let fallbackRules = 0;
  function visit(css: string, layered = false): void {
    for (const statement of topLevelStatements(css, file)) {
      const opening = statement.indexOf("{");
      assert.ok(opening > 0 && statement.endsWith("}"), `${file}: only reviewed rules are allowed`);
      const selector = statement.slice(0, opening).trim();
      const body = statement.slice(opening + 1, -1).trim();
      if (selector === legacy && !layered) { visit(body, true); continue; }
      if (selector.startsWith("@media ") && layered && file === "src/appearance-menu.css") {
        visit(body, true);
        continue;
      }
      assert.ok(!selector.startsWith("@"), `${file}: unexpected at-rule ${selector}`);
      const list = selectors(selector);
      const tokenRule = file === "src/jelly.css"
        && list.every((item) => /^(?::root(?:\[data-theme="(?:light|dark)"\])?|\[data-theme="(?:light|dark)"\]|\.dark)$/u.test(item));
      if (tokenRule) {
        assert.ok(!layered, `${file}: theme tokens must remain outside component layers`);
        const declarations = body.split(";").map((item) => item.trim()).filter(Boolean);
        assert.ok(declarations.length > 0, `${file}: empty token rule`);
        assert.ok(declarations.every((item) => /^--[\w-]+\s*:[^{}]+$/u.test(item)), `${file}: theme boundaries may only set custom properties`);
        continue;
      }
      assert.ok(layered, `${file}: component fallback escaped its legacy layer`);
      if (file === "src/appearance-menu.css") {
        assert.ok(list.every((item) => item.includes(":not([data-hraness-theme-toggle-stylex])")), `${file}: browser-only fallback also matches React StyleX markup`);
      } else if (file === "src/charts.css") {
        assert.deepEqual(list, [".hraness-design-radar-profile-chart__plot .recharts-surface"], `${file}: only the vendor SVG descendant may remain`);
        assert.equal(body.replace(/\s+/gu, ""), "overflow:visible;", `${file}: unexpected vendor override`);
      } else if (file === "src/jelly.css") {
        const lifecycle = new Map([
          [".hraness-design-jelly-surface:not(:defined)", "border:1pxsolidvar(--line);background:var(--jelly-fill);box-shadow:var(--jelly-shadow-raised);"],
          [".hraness-design-jelly-surface:defined", "border-color:transparent;background:transparent;box-shadow:none;"],
        ]);
        assert.equal(list.length, 1, `${file}: unexpected lifecycle selector group`);
        const expected = lifecycle.get(list[0] ?? "");
        assert.ok(expected !== undefined, `${file}: only native vendor upgrade selectors may remain`);
        assert.equal(body.replace(/\s+/gu, ""), expected, `${file}: unexpected lifecycle declarations`);
      } else {
        assert.fail(`${file}: owned effect recipes must be compiled StyleX`);
      }
      fallbackRules += 1;
    }
  }
  visit(source);
  if (file === "src/charts.css") assert.equal(fallbackRules, 1);
  if (file === "src/jelly.css") assert.equal(fallbackRules, 2);
  if (file === "src/appearance-menu.css") assert.ok(fallbackRules > 0);
}

function replaceExactlyOnce(
  source: string,
  target: string,
  replacement: string,
  description: string,
): string {
  const firstIndex = source.indexOf(target);
  const lastIndex = source.lastIndexOf(target);
  if (firstIndex < 0 || firstIndex !== lastIndex) {
    throw new Error(
      `Cannot build the ${description} mutation because its target occurs ${firstIndex < 0 ? "zero" : "more than one"} times`,
    );
  }
  return `${source.slice(0, firstIndex)}${replacement}${source.slice(firstIndex + target.length)}`;
}

function appendToNamedLayer(
  source: string,
  layerName: string,
  addition: string,
  description: string,
): string {
  const statements = topLevelStatements(source, description);
  const layerStatements = statements.filter((statement) =>
    statement.match(/^@layer\s+([A-Za-z0-9_.-]+)\s*\{/u)?.[1] === layerName);
  if (layerStatements.length !== 1) {
    throw new Error(
      `Cannot build the ${description} mutation because ${layerName} occurs ${String(layerStatements.length)} times`,
    );
  }
  const layerStatement = layerStatements[0];
  if (layerStatement === undefined) {
    throw new Error(`Cannot build the ${description} mutation without ${layerName}`);
  }
  const statementStart = source.indexOf(layerStatement);
  if (statementStart < 0 || statementStart !== source.lastIndexOf(layerStatement)) {
    throw new Error(
      `Cannot build the ${description} mutation because its parsed layer block is ambiguous`,
    );
  }
  const closingBrace = statementStart + layerStatement.length - 1;
  if (source[closingBrace] !== "}") {
    throw new Error(`Cannot build the ${description} mutation because its layer is malformed`);
  }
  return `${source.slice(0, closingBrace)}\n\n${addition}\n${source.slice(closingBrace)}`;
}

function compiledChatStyleMap(javaScript: string, label: string): string {
  const styleMap = javaScript.match(/var chatStyles = \{([\s\S]*?)\n\};/u)?.[1];
  if (styleMap === undefined) {
    throw new Error(`${label} is missing the compiled chatStyles map`);
  }
  return styleMap;
}

function compiledChatBranch(
  javaScript: string,
  branch: string,
  label: string,
): string {
  const branchMap = compiledChatStyleMap(javaScript, label).match(
    new RegExp(`^  ${branch}: \\{([\\s\\S]*?)^  \\},?$`, "mu"),
  )?.[1];
  if (branchMap === undefined) {
    throw new Error(`${label} is missing the Chat ${branch} recipe branch`);
  }
  return branchMap;
}

interface CssBlockRange {
  readonly bodyStart: number;
  readonly closeBrace: number;
}

interface CssRuleRange {
  readonly body: string;
  readonly end: number;
  readonly rule: string;
  readonly start: number;
}

function mutateCompiledBranchDeclaration(
  css: string,
  javaScript: string,
  styleMapName: string,
  branchName: string,
  expectedBody: string,
  replacementBody: string,
  description: string,
): string {
  if (!/^[A-Za-z][A-Za-z0-9]*$/u.test(styleMapName)
    || !/^[A-Za-z][A-Za-z0-9]*$/u.test(branchName)) {
    throw new Error(`Cannot build the ${description} mutation from an invalid recipe name`);
  }
  const styleMap = javaScript.match(
    new RegExp(`var ${styleMapName} = \\{([\\s\\S]*?)\\n\\};`, "u"),
  )?.[1];
  const branch = styleMap?.match(
    new RegExp(`^  ${branchName}: \\{([\\s\\S]*?)^  \\},?$`, "mu"),
  )?.[1];
  if (branch === undefined) {
    throw new Error(
      `Cannot build the ${description} mutation without ${styleMapName}.${branchName}`,
    );
  }
  const classNames = [...new Set(branch.match(/\bx[a-z0-9]+\b/gu) ?? [])];
  const matches = classNames.flatMap((className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    return [...css.matchAll(
      new RegExp(`\\.${escaped}(?:\\.${escaped})?\\s*\\{([^{}]*)\\}`, "gu"),
    )].filter((match) =>
      (match[1] ?? "").replace(/\s+/gu, " ").trim() === expectedBody);
  });
  if (matches.length !== 1 || matches[0]?.index === undefined) {
    throw new Error(
      `Cannot build the ${description} mutation because ${styleMapName}.${branchName} has ${String(
        matches.length,
      )} matching declarations`,
    );
  }
  const match = matches[0];
  const body = match[1] ?? "";
  const mutatedBody = replaceExactlyOnce(body, expectedBody, replacementBody, description);
  return `${css.slice(0, match.index)}${match[0].replace(body, mutatedBody)}${css.slice(
    match.index + match[0].length,
  )}`;
}

function matchingCssBrace(source: string, openBrace: number, label: string): number {
  let depth = 0;
  let escaped = false;
  let stringQuote: '"' | "'" | undefined;

  for (let index = openBrace; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === undefined) continue;

    if (stringQuote !== undefined) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === stringQuote) {
        stringQuote = undefined;
      }
      continue;
    }
    if (character === "/" && nextCharacter === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      if (commentEnd < 0) throw new Error(`${label} contains an unterminated comment`);
      index = commentEnd + 1;
      continue;
    }
    if (character === '"' || character === "'") {
      stringQuote = character;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
      if (depth < 0) break;
    }
  }
  throw new Error(`${label} contains an unterminated CSS block`);
}

function compactMediaBlocks(css: string, label: string): CssBlockRange[] {
  return [...css.matchAll(/@media\s*\(width\s*<=\s*48rem\)\s*\{/gu)].map((match) => {
    if (match.index === undefined) {
      throw new Error(`${label} contains an unlocatable compact media block`);
    }
    const openBrace = match.index + match[0].lastIndexOf("{");
    return {
      bodyStart: openBrace + 1,
      closeBrace: matchingCssBrace(css, openBrace, label),
    };
  });
}

function compiledChatClassNames(
  javaScript: string,
  branch: string,
  label: string,
): string[] {
  return [...new Set(
    compiledChatBranch(javaScript, branch, label).match(/\bx[a-z0-9]+\b/gu) ?? [],
  )];
}

function chatBranchRules(
  css: string,
  javaScript: string,
  branch: string,
  label: string,
): CssRuleRange[] {
  return compiledChatClassNames(javaScript, branch, label).flatMap((className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    return [...css.matchAll(
      new RegExp(`\\.${escaped}(?:\\.${escaped})?\\s*\\{([^{}]*)\\}`, "gu"),
    )].flatMap((match) => match.index === undefined
      ? []
      : [{
          body: match[1] ?? "",
          end: match.index + match[0].length,
          rule: match[0],
          start: match.index,
        }]);
  });
}

function compactChatComposerRule(
  css: string,
  javaScript: string,
  label: string,
): { readonly media: CssBlockRange; readonly rule: CssRuleRange } {
  const rules = chatBranchRules(css, javaScript, "composer", label).filter(({ body }) =>
    /^\s*grid-template-columns:\s*1fr;?\s*$/u.test(body));
  const mediaBlocks = compactMediaBlocks(css, label);
  const contained = rules.flatMap((rule) => {
    const media = mediaBlocks.find((block) =>
      rule.start >= block.bodyStart && rule.end <= block.closeBrace);
    return media === undefined ? [] : [{ media, rule }];
  });
  if (rules.length !== 1 || contained.length !== 1) {
    throw new Error(
      `${label} must contain exactly one ChatComposer one-column atomic rule inside @media (width <= 48rem)`,
    );
  }
  const evidence = contained[0];
  if (evidence === undefined) {
    throw new Error(`${label} has no bounded ChatComposer compact rule`);
  }
  return evidence;
}

function relocateChatCompactRuleOutsideMedia(
  css: string,
  javaScript: string,
  description: string,
): string {
  const { media, rule } = compactChatComposerRule(css, javaScript, description);
  const withoutRule = `${css.slice(0, rule.start)}${css.slice(rule.end)}`;
  const relocatedMediaClose = media.closeBrace - (rule.end - rule.start);
  return `${withoutRule.slice(0, relocatedMediaClose + 1)}\n\n  ${rule.rule}\n${withoutRule.slice(relocatedMediaClose + 1)}`;
}

function mutateChatDeclaration(
  css: string,
  javaScript: string,
  branch: string,
  expectedBody: string,
  replacementBody: string,
  description: string,
): string {
  const classNames = [...new Set(
    compiledChatBranch(javaScript, branch, description).match(/\bx[a-z0-9]+\b/gu) ?? [],
  )];
  const matches = classNames.flatMap((className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    return [...css.matchAll(
      new RegExp(`\\.${escaped}(?:\\.${escaped})?\\s*\\{([^}]*)\\}`, "gu"),
    )].filter((match) => (match[1] ?? "").replace(/\s+/gu, " ").trim() === expectedBody);
  });
  if (matches.length !== 1 || matches[0]?.index === undefined) {
    throw new Error(
      `Cannot build the ${description} mutation because its Chat ${branch} declaration occurs ${String(matches.length)} times`,
    );
  }
  const match = matches[0];
  const rule = match[0];
  const body = match[1] ?? "";
  const mutatedRule = rule.replace(body, ` ${replacementBody} `);
  return `${css.slice(0, match.index)}${mutatedRule}${css.slice(match.index + rule.length)}`;
}

function requireMutationRejected(description: string, validate: () => void): void {
  try {
    validate();
  } catch {
    return;
  }
  throw new Error(`StyleX artifact validators accepted the ${description} mutation`);
}

function requireMutationNegativeContracts(
  designCompiledCss: string,
  designPriorityContract: SerializedPriorityContract,
  designCompiledJavaScript: string,
  uiCompiledCss: string,
  localEntry: string,
  localComponents: string,
  aggregateStylesheet: string,
): number {
  const localLegacyLayer = "@layer components.hraness-design-kit.legacy {";
  const invertedLocalPrelude =
    "@layer components.hraness-design-kit.legacy, components.hraness-design-kit.priority2, components.hraness-design-kit.priority1, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4, components.hraness-design-kit.priority5, components.hraness-design-kit.priority6, components.hraness-design-kit.priority7, components.hraness-design-kit.priority8;";
  const invertedPortfolioPrelude =
    "@layer components.hraness-ui.legacy.base, components.hraness-ui.legacy, components.hraness-ui.priority1, components.hraness-ui.priority2, components.hraness-design-kit.legacy, components.hraness-ui.priority3, components.hraness-ui.priority4, components.hraness-ui.priority5, components.hraness-ui.priority6, components.hraness-ui.priority7, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4, components.hraness-design-kit.priority5, components.hraness-design-kit.priority6, components.hraness-design-kit.priority7, components.hraness-design-kit.priority8;";
  const localMutations = [
    [
      "restored AnimatedRailStage root legacy selector",
      appendToNamedLayer(
        localComponents,
        "components.hraness-design-kit.legacy",
        ".hraness-design-animated-rail-stage { min-inline-size: 0; }",
        "restored AnimatedRailStage root legacy selector",
      ),
    ],
    [
      "restored AnimatedRailStage reduced-motion legacy selector",
      appendToNamedLayer(
        localComponents,
        "components.hraness-design-kit.legacy",
        "@media (prefers-reduced-motion: reduce) { .hraness-design-animated-rail-stage { transform: none !important; transition: none !important; } }",
        "restored AnimatedRailStage reduced-motion legacy selector",
      ),
    ],
    [
      "restored PlaybackTransport root legacy selector",
      appendToNamedLayer(
        localComponents,
        "components.hraness-design-kit.legacy",
        ".hraness-design-playback-transport { display: flex; }",
        "restored PlaybackTransport root legacy selector",
      ),
    ],
    [
      "restored PlaybackTransport descendant legacy selector",
      appendToNamedLayer(
        localComponents,
        "components.hraness-design-kit.legacy",
        '.hraness-design-playback-transport__button :is(svg, [data-slot="spinner"]) { inline-size: 1.5rem; }',
        "restored PlaybackTransport descendant legacy selector",
      ),
    ],
    [
      "restored Fader root legacy selector",
      appendToNamedLayer(
        localComponents,
        "components.hraness-design-kit.legacy",
        ".hraness-design-fader { display: grid; }",
        "restored Fader root legacy selector",
      ),
    ],
    [
      "restored Fader pseudo legacy selector",
      appendToNamedLayer(
        localComponents,
        "components.hraness-design-kit.legacy",
        ".hraness-design-fader__track::before { inline-size: 4px; }",
        "restored Fader pseudo legacy selector",
      ),
    ],
    [
      "restored ChatMessage root legacy selector",
      appendToNamedLayer(
        localComponents,
        "components.hraness-design-kit.legacy",
        ".hraness-design-chat-message { display: grid; }",
        "restored ChatMessage root legacy selector",
      ),
    ],
    [
      "restored ChatMessage slot legacy selector",
      appendToNamedLayer(
        localComponents,
        "components.hraness-design-kit.legacy",
        ".hraness-design-chat-message__content { min-inline-size: 0; }",
        "restored ChatMessage slot legacy selector",
      ),
    ],
    [
      "restored ChatComposer responsive legacy selector",
      appendToNamedLayer(
        localComponents,
        "components.hraness-design-kit.legacy",
        "@media (max-width: 48rem) { .hraness-design-chat-composer { grid-template-columns: 1fr; } }",
        "restored ChatComposer responsive legacy selector",
      ),
    ],
    [
      "direct-parent local legacy restoration",
      replaceExactlyOnce(
        localComponents,
        localLegacyLayer,
        "@layer components {",
        "direct-parent local legacy restoration",
      ),
    ],
    [
      "wrong local legacy layer",
      replaceExactlyOnce(
        localComponents,
        localLegacyLayer,
        "@layer components.hraness-ui.legacy {",
        "wrong local legacy layer",
      ),
    ],
    [
      "unlayered local handwritten rule",
      `${localComponents}\n.hraness-design-unlayered-mutation { color: red; }\n`,
    ],
  ] as const;

  const localEntryMutations = [
    [
      "missing local StyleX import",
      replaceExactlyOnce(localEntry, `${DESIGN_STYLEX_IMPORT}\n`, "", "missing local StyleX import"),
    ],
    [
      "duplicate local StyleX import",
      replaceExactlyOnce(
        localEntry,
        DESIGN_STYLEX_IMPORT,
        `${DESIGN_STYLEX_IMPORT}\n${DESIGN_STYLEX_IMPORT}`,
        "duplicate local StyleX import",
      ),
    ],
    [
      "missing compiler-components import",
      replaceExactlyOnce(
        localEntry,
        `${DESIGN_COMPILER_COMPONENTS_IMPORT}\n`,
        "",
        "missing compiler-components import",
      ),
    ],
    [
      "inverted local layer prelude",
      replaceExactlyOnce(localEntry, LOCAL_LAYER_PRELUDE, invertedLocalPrelude, "inverted local layer prelude"),
    ],
    [
      "missing local layer prelude",
      replaceExactlyOnce(localEntry, `${LOCAL_LAYER_PRELUDE}\n`, "", "missing local layer prelude"),
    ],
  ] as const;

  const aggregateMutations = [
    [
      "aggregate UI/design-kit priority inversion",
      replaceExactlyOnce(
        aggregateStylesheet,
        PORTFOLIO_LAYER_PRELUDE,
        invertedPortfolioPrelude,
        "aggregate UI/design-kit priority inversion",
      ),
    ],
    [
      "aggregate base/components inversion",
      replaceExactlyOnce(
        aggregateStylesheet,
        TOP_LEVEL_LAYER_PRELUDE,
        "@layer components, base;",
        "aggregate base/components inversion",
      ),
    ],
    [
      "unlayered aggregate handwritten rule",
      `${aggregateStylesheet}\n.hraness-design-aggregate-unlayered-mutation { color: red; }\n`,
    ],
    [
      "missing aggregate UI components import",
      replaceExactlyOnce(
        aggregateStylesheet,
        `${UI_COMPONENTS_IMPORT}\n`,
        "",
        "missing aggregate UI components import",
      ),
    ],
    [
      "duplicate aggregate UI components import",
      replaceExactlyOnce(
        aggregateStylesheet,
        UI_COMPONENTS_IMPORT,
        `${UI_COMPONENTS_IMPORT}\n${UI_COMPONENTS_IMPORT}`,
        "duplicate aggregate UI components import",
      ),
    ],
    [
      "missing aggregate UI StyleX import",
      replaceExactlyOnce(
        aggregateStylesheet,
        `${UI_STYLEX_IMPORT}\n`,
        "",
        "missing aggregate UI StyleX import",
      ),
    ],
    [
      "duplicate aggregate UI StyleX import",
      replaceExactlyOnce(
        aggregateStylesheet,
        UI_STYLEX_IMPORT,
        `${UI_STYLEX_IMPORT}\n${UI_STYLEX_IMPORT}`,
        "duplicate aggregate UI StyleX import",
      ),
    ],
    [
      "missing aggregate design-kit components import",
      replaceExactlyOnce(
        aggregateStylesheet,
        `${DESIGN_COMPONENTS_IMPORT}\n`,
        "",
        "missing aggregate design-kit components import",
      ),
    ],
    [
      "duplicate aggregate design-kit components import",
      replaceExactlyOnce(
        aggregateStylesheet,
        DESIGN_COMPONENTS_IMPORT,
        `${DESIGN_COMPONENTS_IMPORT}\n${DESIGN_COMPONENTS_IMPORT}`,
        "duplicate aggregate design-kit components import",
      ),
    ],
  ] as const;

  const mutatedChatMessageColumns = mutateChatDeclaration(
    designCompiledCss,
    designCompiledJavaScript,
    "message",
    "grid-template-columns: auto minmax(0, 1fr);",
    "grid-template-columns: 1fr;",
    "mutated ChatMessage grid columns",
  );
  const physicalChatMessageHeaderMargin = mutateChatDeclaration(
    designCompiledCss,
    designCompiledJavaScript,
    "messageHeader",
    "margin-block-end: var(--space-1);",
    "margin-bottom: var(--space-1);",
    "physical ChatMessage header margin substitution",
  );
  const mutatedChatComposerCompactColumns = mutateChatDeclaration(
    designCompiledCss,
    designCompiledJavaScript,
    "composer",
    "grid-template-columns: 1fr;",
    "grid-template-columns: auto;",
    "mutated ChatComposer compact columns",
  );
  const relocatedChatComposerCompactRule = relocateChatCompactRuleOutsideMedia(
    designCompiledCss,
    designCompiledJavaScript,
    "relocated ChatComposer compact rule",
  );

  const generatedMutations = [
    [
      "unlayered generated design-kit rule",
      () => requireGeneratedLayerContract(
        `${designCompiledCss}\n.x-design-unlayered-mutation { color: red; }\n`,
        DESIGN_STYLEX_LAYERS,
        "mutated dist/stylex.css",
        DESIGN_STYLEX_LAYERS,
        DESIGN_GENERATED_LAYER_PRELUDE,
        false,
        designPriorityContract.unlayeredStatements,
      ),
    ],
    [
      "undeclared generated design-kit priority layer",
      () => requireGeneratedLayerContract(
        `${designCompiledCss}\n@layer components.hraness-design-kit.priority9 { .x-design-priority9-mutation { color: red; } }\n`,
        DESIGN_STYLEX_LAYERS,
        "mutated dist/stylex.css",
        DESIGN_STYLEX_LAYERS,
        DESIGN_GENERATED_LAYER_PRELUDE,
        false,
        designPriorityContract.unlayeredStatements,
      ),
    ],
    [
      "unlayered generated UI rule",
      () => requireGeneratedLayerContract(
        `${uiCompiledCss}\n.x-ui-unlayered-mutation { color: red; }\n`,
        UI_STYLEX_LAYERS,
        "mutated @hraness/ui stylex.css",
        UI_STYLEX_LAYERS,
        UI_GENERATED_LAYER_PRELUDE,
        true,
      ),
    ],
    [
      "undeclared generated UI priority layer",
      () => requireGeneratedLayerContract(
        `${uiCompiledCss}\n@layer components.hraness-ui.priority8 { .x-ui-priority8-mutation { color: red; } }\n`,
        UI_STYLEX_LAYERS,
        "mutated @hraness/ui stylex.css",
        UI_STYLEX_LAYERS,
        UI_GENERATED_LAYER_PRELUDE,
        true,
      ),
    ],
    [
      "mutated AnimatedRailStage reduced-motion transform importance",
      () => requireAnimatedRailStageDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "transform: none !important;",
          "transform: none;",
          "mutated AnimatedRailStage reduced-motion transform importance",
        ),
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "mutated AnimatedRailStage reduced-motion transition importance",
      () => requireAnimatedRailStageDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "transition: none !important;",
          "transition: none;",
          "mutated AnimatedRailStage reduced-motion transition importance",
        ),
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical min-width layout substitution",
      () => requireLayoutSurfaceDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "min-inline-size: 0;",
          "min-width: 0;",
          "physical min-width layout substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical BottomBar min-height substitution",
      () => requireLayoutSurfaceDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "min-block-size: var(--bottom-bar-height);",
          "min-height: var(--bottom-bar-height);",
          "physical BottomBar min-height substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical TopBar min-height substitution",
      () => requireLayoutSurfaceDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "min-block-size: var(--top-bar-height);",
          "min-height: var(--top-bar-height);",
          "physical TopBar min-height substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical width layout substitution",
      () => requireLayoutSurfaceDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "inline-size: min(100%,var(--page-canvas-width));",
          "width: min(100%,var(--page-canvas-width));",
          "physical width layout substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical full-size max-width substitution",
      () => requireLayoutSurfaceDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "max-inline-size: none;",
          "max-width: none;",
          "physical full-size max-width substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical wide-size max-width substitution",
      () => requireLayoutSurfaceDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "max-inline-size: var(--page-canvas-wide);",
          "max-width: var(--page-canvas-wide);",
          "physical wide-size max-width substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical top layout substitution",
      () => requireLayoutSurfaceLogicalAtomicContract(
        replaceExactlyOnce(
          designCompiledCss,
          "inset-block-start: 0;",
          "top: 0;",
          "physical top layout substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical right layout substitution",
      () => requireLayoutSurfaceLogicalAtomicContract(
        replaceExactlyOnce(
          designCompiledCss,
          "border-inline-end-color: var(--line);",
          "border-right-color: var(--line);",
          "physical right layout substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical bottom layout substitution",
      () => requireLayoutSurfaceLogicalAtomicContract(
        replaceExactlyOnce(
          designCompiledCss,
          "inset-block-end: 0;",
          "bottom: 0;",
          "physical bottom layout substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical left layout substitution",
      () => requireLayoutSurfaceLogicalAtomicContract(
        replaceExactlyOnce(
          designCompiledCss,
          "margin-inline-start: auto;",
          "margin-left: auto;",
          "physical left layout substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical PlaybackTransport glyph width substitution",
      () => requirePlaybackTransportDeclarationContract(
        mutateCompiledBranchDeclaration(
          designCompiledCss,
          designCompiledJavaScript,
          "playbackTransportStyles",
          "glyph",
          "inline-size: 1.5rem;",
          "width: 1.5rem;",
          "physical PlaybackTransport glyph width substitution",
        ),
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical PlaybackTransport glyph height substitution",
      () => requirePlaybackTransportDeclarationContract(
        mutateCompiledBranchDeclaration(
          designCompiledCss,
          designCompiledJavaScript,
          "playbackTransportStyles",
          "glyph",
          "block-size: 1.5rem;",
          "height: 1.5rem;",
          "physical PlaybackTransport glyph height substitution",
        ),
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "mutated Fader default thumb block variable",
      () => requireFaderDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "--hraness-design-fader-thumb-block-size: 1.125rem;",
          "--hraness-design-fader-thumb-block-size: 1.25rem;",
          "mutated Fader default thumb block variable",
        ),
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical Fader rail inline-size substitution",
      () => requireFaderDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "inline-size: 4px;",
          "width: 4px;",
          "physical Fader rail inline-size substitution",
        ),
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "missing Fader thumb cross-axis top",
      () => requireFaderDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "top: 50%;",
          "top: 51%;",
          "missing Fader thumb cross-axis top",
        ),
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "mutated Fader focus outline",
      () => requireFaderDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "outline-offset: 3px;",
          "outline-offset: 2px;",
          "mutated Fader focus outline",
        ),
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "mutated ChatMessage grid columns",
      () => requireChatDeclarationContract(
        mutatedChatMessageColumns,
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical ChatMessage header margin substitution",
      () => requireChatDeclarationContract(
        physicalChatMessageHeaderMargin,
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "mutated ChatComposer compact columns",
      () => requireChatDeclarationContract(
        mutatedChatComposerCompactColumns,
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "relocated ChatComposer compact rule",
      () => requireChatDeclarationContract(
        relocatedChatComposerCompactRule,
        designCompiledJavaScript,
        designPriorityContract,
        "mutated dist/stylex.css",
      ),
    ],
  ] as const;

  for (const [description, mutation] of localMutations) {
    requireMutationRejected(
      description,
      () => {
        requireCompilerComponentsContract(mutation);
        requireAnimatedRailStageLegacyRemoval(mutation, "mutated src/components.css");
        requirePlaybackTransportLegacyRemoval(mutation, "mutated src/components.css");
        requireFaderLegacyRemoval(mutation, "mutated src/components.css");
        requireChatLegacyRemoval(mutation, "mutated src/components.css");
        requireShellNavigationRouteThemeLegacyRemoval(
          mutation,
          "mutated src/compiler-components.css",
        );
      },
    );
  }
  for (const [description, mutation] of localEntryMutations) {
    requireMutationRejected(description, () => requireLocalComponentsContract(mutation));
  }
  for (const [description, mutation] of aggregateMutations) {
    requireMutationRejected(
      description,
      () => requireAggregateContract(mutation),
    );
  }
  for (const [description, validate] of generatedMutations) {
    requireMutationRejected(description, validate);
  }

  return localMutations.length
    + localEntryMutations.length
    + aggregateMutations.length
    + generatedMutations.length;
}

async function JavaScriptBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return JavaScriptBelow(path);
    return entry.name.endsWith(".js") ? [path] : [];
  }));
  return nested.flat();
}

const repository = process.cwd();
const dist = resolve(repository, "dist");
assert.equal(Bun.version, "1.3.14", "StyleX artifact checks require Bun 1.3.14");
const manifestPath = resolve(dist, "stylex-manifest.json");
const [packageSource, manifestSource] = await Promise.all([
  readFile(resolve(repository, "package.json"), "utf8"),
  readFile(manifestPath, "utf8"),
]);
const packageJson = JSON.parse(packageSource) as {
  readonly name?: unknown;
  readonly version?: unknown;
};
const manifest = await readStylexPackageManifest(manifestPath, repository);
const javaScriptPaths = await JavaScriptBelow(dist);
const javaScriptSources = new Map(await Promise.all(
  javaScriptPaths.map(async (path) => [path, await readFile(path, "utf8")] as const),
));
const [
  compiledCss,
  orderedStylesheet,
  localEntry,
  legacyComponents,
  compilerFoundation,
  uiLegacyComponents,
  uiCompiledCss,
] = await Promise.all([
  readFile(resolve(dist, "stylex.css"), "utf8"),
  readFile(resolve(repository, "src/styles.css"), "utf8"),
  readFile(resolve(repository, "src/components.css"), "utf8"),
  readFile(resolve(repository, "src/compiler-components.css"), "utf8"),
  readFile(resolve(repository, "src/compiler-foundation.css"), "utf8"),
  readFile(resolve(repository, "node_modules/@hraness/ui/src/components.css"), "utf8"),
  readFile(resolve(repository, "node_modules/@hraness/ui/dist/stylex.css"), "utf8"),
]);
const compiledJavaScript = [...javaScriptSources.values()].join("\n");

assert.deepEqual(
  manifest.package,
  { name: packageJson.name, version: packageJson.version },
  "StyleX manifest package identity differs from package.json",
);
assert.deepEqual(
  manifest.package,
  { name: "@hraness/design-kit", version: "0.5.1" },
  "StyleX manifest must describe design-kit v0.5.1",
);
assert.equal(manifest.compilerSha256, compilerSha256);
assert.equal(manifest.rulesSha256, stylexRulesSha256(manifest.rules));
assert.equal(
  manifestSource,
  `${canonicalJson(manifest)}\n`,
  "StyleX package manifest must be canonical with one trailing newline",
);
assert.ok(!manifestSource.includes(repository), "StyleX manifest contains its absolute build root");
assert.ok(
  !/"(?:timestamp|pid|temporary|createdAt|updatedAt)"/u.test(manifestSource),
  "StyleX manifest contains ambient build identity",
);
assert.deepEqual(manifest.buildTools, [], "Design-kit must not publish compiler build tools");
assert.deepEqual(
  manifest.runtime.map(({ path }) => path),
  javaScriptPaths.map((path) => `dist/${logical(dist, path)}`).sort(),
  "StyleX manifest runtime inventory is incomplete",
);
assert.deepEqual(
  manifest.standaloneSerializer,
  {
    before: ["components.hraness-design-kit.legacy"],
    prefix: "components.hraness-design-kit",
  },
  "Design-kit must own its standalone StyleX namespace and legacy boundary",
);
assert.equal(manifest.compilerFoundation, "src/compiler-foundation.css");
assert.deepEqual(
  manifest.stylesheets.map(({ path }) => path),
  [...COMPILER_STYLESHEET_PATHS].sort(),
  "StyleX manifest compiler stylesheet inventory is incomplete",
);
assert.equal(
  manifest.stylesheets.filter(({ path }) => path === manifest.compilerFoundation).length,
  1,
  "StyleX manifest must bind exactly one compiler foundation",
);
for (const stylesheet of manifest.stylesheets) {
  const bytes = await readFile(resolve(repository, ...stylesheet.path.split("/")));
  assert.deepEqual(
    { bytes: stylesheet.bytes, sha256: stylesheet.sha256 },
    { bytes: bytes.byteLength, sha256: sha256(bytes) },
    `StyleX manifest stylesheet binding differs: ${stylesheet.path}`,
  );
}
assert.equal(manifest.standaloneCss.path, "dist/stylex.css");
assert.deepEqual(
  {
    bytes: manifest.standaloneCss.bytes,
    sha256: manifest.standaloneCss.sha256,
  },
  {
    bytes: new TextEncoder().encode(compiledCss).byteLength,
    sha256: sha256(compiledCss),
  },
  "StyleX manifest standalone artifact binding differs from dist/stylex.css",
);
assert.equal(
  compiledCss,
  serializeStylexPackageRules(manifest.rules, manifest.standaloneSerializer),
  "dist/stylex.css is not the canonical package-owned standalone serialization",
);

if (compiledCss.trim().length === 0) {
  throw new Error("dist/stylex.css is empty");
}

const designPriorityContract = requireSerializedPriorityContract(
  compiledCss,
  manifest.rules,
  manifest.standaloneSerializer.before,
  manifest.standaloneSerializer.prefix,
  "dist/stylex.css",
);
assert.deepEqual(
  designPriorityContract.rawPrioritiesByRank,
  [
    [0, 1, 41],
    [1000, 1200],
    [2000, 2040, 2130, 2200],
    [3000, 3040, 3092, 3130, 3200, 3330],
    [4000, 4130],
    [6000],
    [7000],
    [8000, 8040],
  ],
  "Design-kit raw StyleX priorities no longer map to the reviewed eight-rank inventory",
);
// The reviewed primary-action hover repair introduces one media-plus-pseudo
// atom. It stays in rank 4; it does not create a ninth standalone layer.
const marketingForcedHoverRules = manifest.rules.filter(([, , priority]) => priority === 3330);
assert.deepEqual(marketingForcedHoverRules, [[
  "x6ezp6e",
  { ltr: "@media (forced-colors: active){.x6ezp6e.x6ezp6e:hover{background-color:Canvas}}", rtl: null },
  3330,
]], "Raw priority 3330 must contain only the reviewed forced-color primary hover atom");
assert.equal(
  requireRuleSerializedRank(compiledCss, "x6ezp6e", designPriorityContract, "dist/stylex.css"),
  "priority4",
  "Forced-color primary hover must remain in the existing rank-4 layer",
);
assert.deepEqual(
  designPriorityContract.blockLayers,
  DESIGN_STYLEX_LAYERS,
  "Design-kit must emit priority2 through priority8 blocks after its unlayered priority1 bucket",
);
const generatedKeyframeRules = manifest.rules.filter(([, value]) =>
  value.ltr.startsWith("@keyframes "));
assert.ok(generatedKeyframeRules.length > 0, "Design-kit must retain generated keyframe rules");
for (const [key, , rawPriority] of generatedKeyframeRules) {
  assert.equal(rawPriority, 0, `Generated keyframe ${key} must retain raw priority 0`);
  assert.equal(
    requireRuleSerializedRank(
      compiledCss,
      key,
      designPriorityContract,
      "dist/stylex.css",
    ),
    "priority1",
    `Generated keyframe ${key} must remain in the unlayered serialized priority1 bucket`,
  );
}
const ditherDensityRules = manifest.rules.filter(([, value]) =>
  /--hraness-design-dither-size:(?:3px|7px)\}/u.test(value.ltr));
assert.equal(ditherDensityRules.length, 2, "DitherSurface must retain exactly two density-variable atoms");
for (const [key, , rawPriority] of ditherDensityRules) {
  assert.equal(rawPriority, 1, `DitherSurface density rule ${key} must retain raw priority 1`);
  assert.equal(
    requireRuleSerializedRank(
      compiledCss,
      key,
      designPriorityContract,
      "dist/stylex.css",
    ),
    "priority1",
    `DitherSurface density rule ${key} must remain in the unlayered serialized priority1 bucket`,
  );
}
const ditherDeclarations: readonly (readonly [RegExp, string])[] = [
  [
    /--hraness-design-dither-size:\s*3px;[\s\S]*?--hraness-design-dither-size:\s*7px;/u,
    "literal fine and coarse density variables in the manifest-derived priority1 bucket",
  ],
  [
    /background-image:\s*radial-gradient\(color-mix\(in oklch,\s*currentColor 18%,\s*transparent\)\s*0?\.75px,\s*transparent\s*0?\.75px\);/u,
    "radial texture",
  ],
  [
    /background-size:\s*var\(--hraness-design-dither-size,\s*4px\)\s+var\(--hraness-design-dither-size,\s*4px\);/u,
    "public density-variable texture size",
  ],
  [
    /@media \(forced-colors:\s*active\)\s*\{[\s\S]*?background-image:\s*none;/u,
    "forced-colors texture removal",
  ],
];
for (const [pattern, description] of ditherDeclarations) {
  requireMatch(compiledCss, pattern, `the DitherSurface ${description} declaration`);
}
const layoutSurfaceDeclarations: readonly (readonly [RegExp, string])[] = [
  [/background-attachment:\s*scroll;/u, "surface background attachment reset"],
  [/background-clip:\s*border-box;/u, "surface background clip reset"],
  [/background-color:\s*var\(--background\);/u, "solid surface background"],
  [
    /background-color:\s*color-mix\(in oklch,\s*var\(--background\) 90%,\s*transparent\);/u,
    "glass TopBar background",
  ],
  [/background-image:\s*none;/u, "surface background image reset"],
  [/background-origin:\s*padding-box;/u, "surface background origin reset"],
  [/background-repeat:\s*repeat;/u, "surface background repeat reset"],
  [/background-size:\s*auto;/u, "surface background size reset"],
  [/backdrop-filter:\s*blur\(18px\)\s+saturate\(1\.08\);/u, "glass TopBar filter"],
  [/border-block-end-color:\s*var\(--line\);/u, "TopBar logical block-end border color"],
  [/border-block-end-style:\s*solid;/u, "TopBar logical block-end border style"],
  [/border-block-end-width:\s*1px;/u, "TopBar logical block-end border width"],
  [/border-block-start-color:\s*var\(--line\);/u, "BottomBar and DockedFooter logical block-start border color"],
  [/border-block-start-style:\s*solid;/u, "BottomBar and DockedFooter logical block-start border style"],
  [/border-block-start-width:\s*1px;/u, "BottomBar and DockedFooter logical block-start border width"],
  [/border-inline-end-color:\s*var\(--line\);/u, "surface inline-end border color"],
  [/border-inline-start-color:\s*var\(--line\);/u, "surface inline-start border color"],
  [/flex:\s*auto;/u, "bar content growth"],
  [/gap:\s*var\(--space-2\);/u, "bar slot gap"],
  [/gap:\s*var\(--space-3\);/u, "bar root gap"],
  [/inset-block-end:\s*0;/u, "DockedFooter logical block-end inset"],
  [/inset-block-start:\s*0;/u, "sticky TopBar logical block-start inset"],
  [/inset-inline:\s*0;/u, "DockedFooter logical inline insets"],
  [/margin-inline:\s*auto;/u, "PageCanvas and DockedFooter content logical inline margins"],
  [/margin-inline-start:\s*auto;/u, "TopBar action alignment"],
  [/min-inline-size:\s*0;/u, "bar and PageCanvas logical inline minimum"],
  [/min-block-size:\s*var\(--bottom-bar-height\);/u, "BottomBar logical block minimum"],
  [/min-block-size:\s*var\(--top-bar-height\);/u, "TopBar logical block minimum"],
  [/inline-size:\s*min\(100%,\s*var\(--page-canvas-width\)\);/u, "PageCanvas and DockedFooter content logical inline size"],
  [/max-inline-size:\s*none;/u, "full PageCanvas and DockedFooter content logical inline cap"],
  [/max-inline-size:\s*var\(--page-canvas-wide\);/u, "wide PageCanvas and DockedFooter content logical inline cap"],
  [/padding-block:\s*var\(--layout-edge-inset\);/u, "PageCanvas content inset"],
  [
    /padding-block:\s*max\(var\(--layout-chrome-inset\),\s*env\(safe-area-inset-top\)\)\s+var\(--layout-chrome-inset\);/u,
    "sticky TopBar safe-area inset",
  ],
  [
    /padding-block:\s*var\(--space-1\)\s+max\(var\(--space-1\),\s*env\(safe-area-inset-bottom\)\);/u,
    "compact DockedFooter safe-area inset",
  ],
  [/position:\s*absolute;/u, "absolute DockedFooter position"],
  [/position:\s*fixed;/u, "fixed DockedFooter position"],
  [
    /@media \(forced-colors:\s*active\)\s*\{[\s\S]*?backdrop-filter:\s*none;[\s\S]*?background-color:\s*canvas;/u,
    "forced-colors glass and surface reset",
  ],
  [
    /@media \(forced-colors:\s*active\)\s*\{[\s\S]*?border-block-end-color:\s*canvastext;[\s\S]*?border-block-start-color:\s*canvastext;/u,
    "forced-colors bar edge borders",
  ],
  [/border-inline-end-color:\s*canvastext;/u, "forced-colors inline-end border"],
  [/border-inline-start-color:\s*canvastext;/u, "forced-colors inline-start border"],
];

function requireLayoutSurfaceDeclarationContract(
  source: string,
  javaScript: string,
  label: string,
): void {
  for (const [pattern, description] of layoutSurfaceDeclarations) {
    requireMatch(source, pattern, `${label} layout-surface ${description} declaration`);
  }
  requireLayoutSurfaceLogicalAtomicContract(source, javaScript, label);
}

function requireLayoutSurfaceLogicalAtomicContract(
  css: string,
  javaScript: string,
  label: string,
): void {
  const layoutStyleMap = javaScript.match(
    /var layoutSurfaceStyles = \{([\s\S]*?)\n\};/u,
  )?.[1];
  if (layoutStyleMap === undefined) {
    throw new Error(`${label} is missing the compiled layoutSurfaceStyles map`);
  }
  const classNames = [...new Set(layoutStyleMap.match(/\bx[a-z0-9]+\b/gu) ?? [])];
  if (classNames.length < 20) {
    throw new Error(`${label} exposes too few compiled layout-surface atomic classes`);
  }
  const physicalLogicalSubstitution = /(?:^|\s)(?:top|right|bottom|left|min-width|min-height|width|max-width|border-(?:top|right|bottom|left)(?:-(?:color|style|width))?|margin-(?:left|right)|padding-(?:top|right|bottom|left))\s*:/u;
  for (const className of classNames) {
    const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const ruleBodies = [...css.matchAll(
      new RegExp(`\\.${escapedClassName}\\s*\\{([^}]*)\\}`, "gu"),
    )].map((match) => match[1] ?? "");
    if (ruleBodies.length === 0) {
      throw new Error(`${label} is missing the ${className} layout-surface atomic rule`);
    }
    if (ruleBodies.some((body) => physicalLogicalSubstitution.test(body))) {
      throw new Error(
        `${label} maps layout-surface class ${className} to a physical directional substitution`,
      );
    }
  }
}

function requireAnimatedRailStageLegacyRemoval(source: string, label: string): void {
  forbid(
    source,
    /\.hraness-design-animated-rail-stage/u,
    `${label} AnimatedRailStage legacy selector`,
  );
}

function requireAnimatedRailStageDeclarationContract(
  css: string,
  javaScript: string,
  priorityContract: SerializedPriorityContract,
  label: string,
): void {
  const styleMap = javaScript.match(
    /var animatedRailStageStyles = \{([\s\S]*?)\n\};/u,
  )?.[1];
  const rootMap = styleMap?.match(/root:\s*\{([^}]*)\}/u)?.[1];
  if (rootMap === undefined) {
    throw new Error(`${label} is missing the compiled AnimatedRailStage root recipe`);
  }
  const classNames = [...new Set(rootMap.match(/\bx[a-z0-9]+\b/gu) ?? [])];
  if (classNames.length !== 3) {
    throw new Error(`${label} exposes the wrong AnimatedRailStage atomic class count`);
  }

  const actual = classNames.map((className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const rules = [...css.matchAll(
      new RegExp(`\\.${escaped}(?:\\.${escaped})?\\s*\\{([^}]*)\\}`, "gu"),
    )];
    if (rules.length !== 1 || rules[0]?.index === undefined) {
      throw new Error(
        `${label} contains ${String(rules.length)} rules for AnimatedRailStage class ${className}`,
      );
    }
    const body = (rules[0][1] ?? "").replace(/\s+/gu, " ").trim();
    const isReducedMotion = body === "transform: none !important;"
      || body === "transition: none !important;";
    if (isReducedMotion) {
      const property = body.startsWith("transform:") ? "transform" : "transition";
      const mediaRule = new RegExp(
        `@media \\(prefers-reduced-motion: reduce\\)\\s*\\{\\s*\\.${escaped}\\.${escaped}\\s*\\{\\s*${property}:\\s*none !important;\\s*\\}\\s*\\}`,
        "u",
      );
      if (!mediaRule.test(css)) {
        throw new Error(
          `${label} does not bind AnimatedRailStage ${property} to reduced motion`,
        );
      }
    }
    return `${requireRuleSerializedRank(css, className, priorityContract, label)}\u0000${body}`;
  });
  const expected = [
    "priority3\u0000transition: none !important;",
    "priority4\u0000min-inline-size: 0;",
    "priority4\u0000transform: none !important;",
  ];
  if (actual.length !== expected.length
    || actual.some((declaration) => !expected.includes(declaration))
    || new Set(actual).size !== expected.length) {
    throw new Error(`${label} does not preserve the exact AnimatedRailStage recipe`);
  }
}

function requirePlaybackTransportLegacyRemoval(source: string, label: string): void {
  forbid(
    source,
    /\.hraness-design-playback-transport\s*\{/u,
    `${label} PlaybackTransport root legacy selector`,
  );
  forbid(
    source,
    /\.hraness-design-playback-transport__button\s+:is\(svg,\s*\[data-slot=["']spinner["']\]\)/u,
    `${label} PlaybackTransport glyph legacy selector`,
  );
}

function requireFaderLegacyRemoval(source: string, label: string): void {
  forbid(
    source,
    /\.hraness-design-fader/u,
    `${label} Fader legacy selector`,
  );
}

function requireChatLegacyRemoval(source: string, label: string): void {
  forbid(
    source,
    /\.hraness-design-chat-(?:message|composer)/u,
    `${label} Chat legacy selector`,
  );
}

function requireShellNavigationRouteThemeLegacyRemoval(
  source: string,
  label: string,
): void {
  for (const family of [
    "app-shell",
    "navigation-rail",
    "rail-section",
    "rail-item",
    "route-state",
    "theme-toggle",
  ] as const) {
    forbid(
      source,
      new RegExp(`\\.hraness-design-${family}(?:__[\\w-]+)?(?:\\s|\\{|\\[|,|:)`, "u"),
      `${label} ${family} legacy selector`,
    );
  }
}

function requireChatDeclarationContract(
  css: string,
  javaScript: string,
  priorityContract: SerializedPriorityContract,
  label: string,
): void {
  const styleMap = compiledChatStyleMap(javaScript, label);
  const expectedBranches = {
    composer: [
      ["align-items: end;", "priority4"],
      ["display: grid;", "priority4"],
      ["gap: var(--space-2);", "priority3"],
      ["grid-template-columns: minmax(0, 1fr) auto;", "priority4"],
      ["grid-template-columns: 1fr;", "priority4"],
    ],
    message: [
      ["display: grid;", "priority4"],
      ["gap: var(--space-3);", "priority3"],
      ["grid-template-columns: auto minmax(0, 1fr);", "priority4"],
    ],
    messageHeader: [
      ["color: var(--muted);", "priority4"],
      ["font-size: var(--text-caption);", "priority4"],
      ["margin-block-end: var(--space-1);", "priority4"],
    ],
    messageMinInline: [
      ["min-inline-size: 0;", "priority4"],
    ],
    messageRow: [
      ["align-items: center;", "priority4"],
      ["display: flex;", "priority4"],
      ["flex-wrap: wrap;", "priority4"],
      ["gap: var(--space-2);", "priority3"],
    ],
  } as const;
  const actualBranchNames = [...styleMap.matchAll(
    /^ {2}([A-Za-z][A-Za-z0-9]*):\s*\{/gmu,
  )].map((match) => match[1]);
  if (JSON.stringify(actualBranchNames) !== JSON.stringify(Object.keys(expectedBranches))) {
    throw new Error(`${label} exposes the wrong Chat recipe branches`);
  }

  for (const [branch, expectedDeclarations] of Object.entries(expectedBranches)) {
    const branchMap = compiledChatBranch(javaScript, branch, label);
    const classNames = [...new Set(branchMap.match(/\bx[a-z0-9]+\b/gu) ?? [])];
    const expectedClassCount = expectedDeclarations.length;
    if (classNames.length !== expectedClassCount) {
      throw new Error(`${label} exposes the wrong Chat ${branch} atomic class count`);
    }
    const actual = classNames.flatMap((className) => {
      const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
      const matches = [...css.matchAll(
        new RegExp(`\\.${escaped}(?:\\.${escaped})?\\s*\\{([^}]*)\\}`, "gu"),
      )];
      if (matches.length === 0 || matches.some((match) => match.index === undefined)) {
        throw new Error(`${label} is missing a Chat ${branch} rule for ${className}`);
      }
      return matches.map((match) =>
        `${requireRuleSerializedRank(css, className, priorityContract, label)}\u0000${(match[1] ?? "").replace(/\s+/gu, " ").trim()}`);
    });
    const expected = expectedDeclarations.map(
      ([body, priority]) => `${priority}\u0000${body}`,
    );
    if (actual.length !== expected.length
      || actual.some((declaration) => !expected.includes(declaration))
      || new Set(actual).size !== expected.length) {
      throw new Error(`${label} does not preserve the exact Chat ${branch} recipe`);
    }
  }

  compactChatComposerRule(css, javaScript, label);
  if (chatBranchRules(css, javaScript, "messageHeader", label).some(({ body }) =>
    /(?:^|;)\s*margin-bottom:\s*var\(--space-1\);?/u.test(body))) {
    throw new Error(`${label} physicalized a compiled Chat messageHeader declaration`);
  }
  if (chatBranchRules(css, javaScript, "messageMinInline", label).some(({ body }) =>
    /(?:^|;)\s*min-width:\s*0;?/u.test(body))) {
    throw new Error(`${label} physicalized a compiled Chat minimum inline-size`);
  }
}

function requireFaderDeclarationContract(
  css: string,
  javaScript: string,
  priorityContract: SerializedPriorityContract,
  label: string,
): void {
  const styleMap = javaScript.match(
    /var faderStyles = \{([\s\S]*?)\n\};/u,
  )?.[1];
  if (styleMap === undefined) {
    throw new Error(`${label} is missing the compiled faderStyles map`);
  }

  const expectedBranches = {
    caption: [
      ["font-size: var(--text-caption);", "priority4"],
    ],
    compact: [
      ["--hraness-design-fader-thumb-block-size: .75rem;", "priority1"],
      ["--hraness-design-fader-thumb-inline-size: 1.5rem;", "priority1"],
      ["--hraness-design-fader-track-length: var(--interactive-target-min);", "priority1"],
    ],
    fillRail: [
      ["background-color: var(--primary);", "priority4"],
      ["block-size: 100%;", "priority4"],
      ["inset-block-end: 0;", "priority4"],
    ],
    focusVisible: [
      ["outline-color: var(--focus);", "priority4"],
      ["outline-offset: 3px;", "priority4"],
      ["outline-style: solid;", "priority4"],
      ["outline-width: 3px;", "priority4"],
    ],
    horizontalRoot: [
      ["min-inline-size: 8rem;", "priority4"],
    ],
    horizontalTrack: [
      ["block-size: var(--interactive-target-min);", "priority4"],
      ["inline-size: 100%;", "priority4"],
    ],
    labelRow: [
      ["align-items: center;", "priority4"],
      ["display: flex;", "priority4"],
      ["gap: var(--space-1);", "priority3"],
    ],
    rail: [
      ["border-radius: var(--radius-round);", "priority3"],
      ["inline-size: 4px;", "priority4"],
      ["inset-inline: calc(50% - 2px);", "priority3"],
      ["position: absolute;", "priority4"],
    ],
    root: [
      ["--hraness-design-fader-thumb-block-size: 1.125rem;", "priority1"],
      ["--hraness-design-fader-thumb-inline-size: 1.75rem;", "priority1"],
      ["--hraness-design-fader-track-length: 6rem;", "priority1"],
      ["display: grid;", "priority4"],
      ["gap: var(--space-2);", "priority3"],
      ["justify-items: center;", "priority4"],
      ["min-inline-size: var(--interactive-target-min);", "priority4"],
    ],
    thumb: [
      ["background-color: var(--primary);", "priority4"],
      ["block-size: var(--hraness-design-fader-thumb-block-size);", "priority4"],
      ["border-color: var(--background);", "priority3"],
      ["border-radius: var(--radius-sm);", "priority3"],
      ["border-style: solid;", "priority3"],
      ["border-width: 2px;", "priority3"],
      ["box-shadow: 0 0 0 1px var(--line);", "priority4"],
      ["inline-size: var(--hraness-design-fader-thumb-inline-size);", "priority4"],
      ["left: 50%;", "priority5"],
      ["top: 50%;", "priority5"],
    ],
    track: [
      ["block-size: var(--hraness-design-fader-track-length);", "priority4"],
      ["inline-size: var(--interactive-target-min);", "priority4"],
      ["position: relative;", "priority4"],
    ],
    trackRail: [
      ["background-color: var(--grid);", "priority4"],
      ["inset-block: 0;", "priority3"],
    ],
  } as const;

  const actualBranchNames = [...styleMap.matchAll(
    /^ {2}([A-Za-z][A-Za-z0-9]*):\s*\{/gmu,
  )].map((match) => match[1]);
  const expectedBranchNames = Object.keys(expectedBranches);
  if (JSON.stringify(actualBranchNames) !== JSON.stringify(expectedBranchNames)) {
    throw new Error(`${label} exposes the wrong Fader recipe branches`);
  }

  const allClassNames = new Set<string>();

  for (const [branch, expectedDeclarations] of Object.entries(expectedBranches)) {
    const branchMap = styleMap.match(
      new RegExp(`^  ${branch}: \\{([\\s\\S]*?)^  \\},?$`, "mu"),
    )?.[1];
    if (branchMap === undefined) {
      throw new Error(`${label} is missing the Fader ${branch} recipe branch`);
    }
    const classNames = [...new Set(branchMap.match(/\bx[a-z0-9]+\b/gu) ?? [])];
    if (classNames.length !== expectedDeclarations.length) {
      throw new Error(
        `${label} exposes the wrong Fader ${branch} atomic class count`,
      );
    }
    const actualDeclarations = classNames.map((className) => {
      allClassNames.add(className);
      const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
      const matches = [...css.matchAll(
        new RegExp(`\\.${escaped}\\s*\\{([^}]*)\\}`, "gu"),
      )];
      if (matches.length !== 1 || matches[0]?.index === undefined) {
        throw new Error(
          `${label} contains ${String(matches.length)} rules for Fader class ${className}`,
        );
      }
      const body = (matches[0][1] ?? "").replace(/\s+/gu, " ").trim();
      return `${requireRuleSerializedRank(css, className, priorityContract, label)}\u0000${body}`;
    });
    const expected = expectedDeclarations.map(
      ([body, priority]) => `${priority}\u0000${body}`,
    );
    if (
      actualDeclarations.length !== expected.length
      || actualDeclarations.some((declaration) => !expected.includes(declaration))
      || new Set(actualDeclarations).size !== expected.length
    ) {
      throw new Error(
        `${label} does not preserve the exact Fader ${branch} recipe`,
      );
    }
  }

  for (const className of allClassNames) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    if (new RegExp(`\\.${escaped}::?[A-Za-z-]+`, "u").test(css)) {
      throw new Error(`${label} emitted a pseudo selector for Fader class ${className}`);
    }
  }
}

function requirePlaybackTransportDeclarationContract(
  css: string,
  javaScript: string,
  priorityContract: SerializedPriorityContract,
  label: string,
): void {
  const styleMap = javaScript.match(
    /var playbackTransportStyles = \{([\s\S]*?)\n\};/u,
  )?.[1];
  if (styleMap === undefined) {
    throw new Error(`${label} is missing the compiled playbackTransportStyles map`);
  }
  const glyphMap = styleMap.match(/glyph:\s*\{([^}]*)\}/u)?.[1];
  const rootMap = styleMap.match(/root:\s*\{([^}]*)\}/u)?.[1];
  if (glyphMap === undefined || rootMap === undefined) {
    throw new Error(`${label} is missing a PlaybackTransport recipe branch`);
  }
  const classNames = (map: string) => [
    ...new Set(map.match(/\bx[a-z0-9]+\b/gu) ?? []),
  ];
  const glyphClasses = classNames(glyphMap);
  const rootClasses = classNames(rootMap);
  if (glyphClasses.length !== 2 || rootClasses.length !== 4) {
    throw new Error(
      `${label} exposes the wrong PlaybackTransport atomic class counts`,
    );
  }
  const ruleFor = (className: string) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const matches = [...css.matchAll(
      new RegExp(`\\.${escaped}\\s*\\{([^}]*)\\}`, "gu"),
    )];
    if (matches.length !== 1 || matches[0]?.index === undefined) {
      throw new Error(
        `${label} contains ${String(matches.length)} rules for PlaybackTransport class ${className}`,
      );
    }
    return {
      body: (matches[0][1] ?? "").replace(/\s+/gu, " ").trim(),
      priority: requireRuleSerializedRank(css, className, priorityContract, label),
    };
  };
  const glyphRules = glyphClasses.map(ruleFor);
  const rootRules = rootClasses.map(ruleFor);
  const expectedGlyph = new Set([
    "block-size: 1.5rem;",
    "inline-size: 1.5rem;",
  ]);
  const expectedRoot = new Set([
    "align-items: center;",
    "display: flex;",
    "flex-wrap: wrap;",
    "gap: var(--space-2);",
  ]);
  if (glyphRules.some(({ body, priority }) =>
    !expectedGlyph.has(body) || priority !== "priority4")
    || rootRules.some(({ body, priority }) =>
      !expectedRoot.has(body)
      || priority !== (body.startsWith("gap:") ? "priority3" : "priority4"))) {
    throw new Error(
      `${label} does not preserve the exact PlaybackTransport priority3/priority4 recipe`,
    );
  }
  if (new Set(glyphRules.map(({ body }) => body)).size !== expectedGlyph.size
    || new Set(rootRules.map(({ body }) => body)).size !== expectedRoot.size) {
    throw new Error(`${label} duplicates or omits a PlaybackTransport declaration`);
  }
  if ([...glyphRules, ...rootRules].some(({ priority }) =>
    priority !== "priority3" && priority !== "priority4")) {
    throw new Error(`${label} leaked PlaybackTransport output outside priority3/priority4`);
  }
  for (const { body } of glyphRules) {
    if (/(?:^|\s)(?:height|width):\s*1\.5rem;/u.test(body)) {
      throw new Error(`${label} physicalized a PlaybackTransport logical glyph size`);
    }
  }
}
requireLayoutSurfaceDeclarationContract(
  compiledCss,
  compiledJavaScript,
  "the compiled",
);
requireAnimatedRailStageDeclarationContract(
  compiledCss,
  compiledJavaScript,
  designPriorityContract,
  "the compiled artifact",
);
requireChatDeclarationContract(
  compiledCss,
  compiledJavaScript,
  designPriorityContract,
  "the compiled artifact",
);
requirePlaybackTransportDeclarationContract(
  compiledCss,
  compiledJavaScript,
  designPriorityContract,
  "the compiled artifact",
);
requireFaderDeclarationContract(
  compiledCss,
  compiledJavaScript,
  designPriorityContract,
  "the compiled artifact",
);
function requireCompiledBackground(css: string, javaScript: string, map: string, recipe: string, value: string): void {
  const styleMap = javaScript.match(new RegExp(`var ${map} = \\{([\\s\\S]*?)\\n\\};`, "u"))?.[1];
  const branch = styleMap?.match(new RegExp(`${recipe}:\\s*\\{([^}]*)\\}`, "u"))?.[1];
  assert.ok(branch !== undefined, `Missing ${map}.${recipe}`);
  const classes = [...new Set(branch.match(/\bx[a-z0-9]+\b/gu) ?? [])];
  assert.ok(classes.some((name) => {
    const rule = css.match(new RegExp(`\\.${name}\\s*\\{([^}]*)\\}`, "u"))?.[1];
    return rule?.replace(/\s+/gu, "").includes(`background-color:${value};`);
  }), `${map}.${recipe} lost its compiled background-color: ${value}`);
}
for (const [map, recipe, value] of [
  ["appShellStyles", "root", "var(--background)"],
  ["navigationRailStyles", "rail", "var(--surface)"],
] as const) {
  requireCompiledBackground(compiledCss, compiledJavaScript, map, recipe, value);
  requireMutationRejected(`${map}.${recipe} missing background atom`, () => requireCompiledBackground(
    compiledCss.replaceAll(`background-color: ${value};`, "background-color: transparent;"),
    compiledJavaScript, map, recipe, value,
  ));
}
const noticeDeclarations: readonly (readonly [RegExp, string])[] = [
  [/align-items:\s*center;/u, "root align-items"],
  [/background-color:\s*(?:#ffcc33|#fc3);/u, "root background-color"],
  [/border-block-end-color:\s*#5c1906;/u, "root border-block-end color"],
  [/border-block-end-style:\s*solid;/u, "root border-block-end style"],
  [/border-block-end-width:\s*2px;/u, "root border-block-end width"],
  [/box-shadow:\s*0\s+3px\s+12px\s+#24140059;/u, "root box-shadow"],
  [/color:\s*#241400;/u, "root color"],
  [/display:\s*flex;/u, "root display"],
  [/flex-wrap:\s*wrap;/u, "root flex-wrap"],
  [/font-family:\s*var\(--font-text,\s*system-ui,\s*sans-serif\);/u, "root font-family"],
  [/font-size:\s*var\(--text-label,\s*0?\.875rem\);/u, "root font-size"],
  [/gap:\s*var\(--space-1,\s*0?\.25rem\)\s+var\(--space-3,\s*0?\.75rem\);/u, "root gap"],
  [/inset-block-start:\s*0;/u, "root logical block-start inset"],
  [/justify-content:\s*center;/u, "root justify-content"],
  [/line-height:\s*1\.35;/u, "root line-height"],
  [/min-height:\s*3rem;/u, "root min-height"],
  [/padding-block:\s*max\(var\(--space-2,\s*0?\.5rem\),\s*env\(safe-area-inset-top\)\);/u, "root padding-block"],
  [/padding-inline:\s*max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-left\)\)\s+max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-right\)\);/u, "root padding-inline"],
  [/position:\s*sticky;/u, "root position"],
  [/text-align:\s*center;/u, "root text-align"],
  [/width:\s*100%;/u, "root width"],
  [/z-index:\s*calc\(var\(--z-tooltip,\s*3000\)\s*\+\s*1\);/u, "root z-index"],
  [/font-weight:\s*var\(--font-weight-bold,\s*700\);/u, "emphasis font-weight"],
  [/letter-spacing:\s*0?\.04em;/u, "emphasis letter-spacing"],
  [/text-transform:\s*uppercase;/u, "emphasis text-transform"],
];
for (const [pattern, description] of noticeDeclarations) {
  requireMatch(compiledCss, pattern, `the notice ${description} declaration`);
}
requireMatch(
  compiledJavaScript,
  /from\s*["']react\/jsx-runtime["']/u,
  "the production React JSX runtime",
);
requireMatch(
  compiledJavaScript,
  /from\s*["']@stylexjs\/stylex["']/u,
  "the static StyleX props runtime",
);
requireMatch(
  compiledJavaScript,
  /querySelector\(["']\.hraness-design-jelly-surface["']\)/u,
  "the no-surface Jelly runtime guard",
);

const jellyTokenArtifacts = [...javaScriptSources]
  .filter(([, source]) => source.includes("data-jelly-tokens"));
if (jellyTokenArtifacts.length !== 1) {
  throw new Error(
    `expected one isolated Jelly vendor artifact, found ${jellyTokenArtifacts.length}`,
  );
}
const jellyTokenArtifact = jellyTokenArtifacts[0];
if (jellyTokenArtifact === undefined) {
  throw new Error("the isolated Jelly vendor artifact is missing");
}
const [jellyTokenPath] = jellyTokenArtifact;
const jellyTokenFile = basename(jellyTokenPath);
const escapedJellyTokenFile = jellyTokenFile.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const staticJellyImport = new RegExp(
  `(?:from\\s*|import\\s*)["'][^"']*${escapedJellyTokenFile}["']`,
  "u",
);
for (const [path, source] of javaScriptSources) {
  if (path !== jellyTokenPath && staticJellyImport.test(source)) {
    throw new Error(`Jelly's vendor stylesheet became statically reachable from ${path}`);
  }
}
const reactEntry = javaScriptSources.get(resolve(dist, "react/index.js"));
if (reactEntry === undefined) throw new Error("dist/react/index.js is missing");
const chartEntry = javaScriptSources.get(resolve(dist, "react/charts.js"));
if (chartEntry === undefined) throw new Error("dist/react/charts.js is missing");
forbid(
  reactEntry,
  /from\s*["']recharts["']/u,
  "a direct Recharts dependency in the aggregate React entry",
);
const rechartsArtifacts = [...javaScriptSources]
  .filter(([, source]) => /from\s*["']recharts["']/u.test(source));
if (rechartsArtifacts.length !== 1) {
  throw new Error(
    `expected one isolated Recharts artifact, found ${rechartsArtifacts.length}`,
  );
}
const [rechartsArtifact] = rechartsArtifacts;
if (rechartsArtifact === undefined || rechartsArtifact[0] === resolve(dist, "react/index.js")) {
  throw new Error("the isolated Recharts artifact is missing");
}
requireMatch(
  reactEntry,
  new RegExp(`import\\(["'][^"']*${escapedJellyTokenFile}["']\\)`, "u"),
  "a dynamic-only Jelly vendor import",
);

forbid(compiledJavaScript, /react\/jsx-dev-runtime/u, "the development React JSX runtime");
forbid(
  compiledJavaScript,
  /stylex\.create|stylexCreate|Unexpected ['"]stylex\.create/u,
  "an uncompiled StyleX authoring call",
);
forbid(
  compiledJavaScript,
  /stylex-inject|stylexInject|data-stylex|stylesheet-group/u,
  "runtime CSS injection",
);
forbid(
  legacyComponents,
  /\.hraness-design-production-data-preview-notice(?:\s|\{|:)/u,
  "the migrated notice's legacy selector",
);
forbid(
  legacyComponents,
  /\.hraness-design-dither-surface(?:\s|\{|\[|:)/u,
  "the migrated DitherSurface legacy selector",
);
for (const stableClass of [
  "top-bar",
  "bottom-bar",
  "page-canvas",
  "docked-footer",
] as const) {
  forbid(
    legacyComponents,
    new RegExp(
      `\\.hraness-design-${stableClass}(?:__[\\w-]+)?(?:\\s|\\{|\\[|,|:)`,
      "u",
    ),
    `the migrated ${stableClass} legacy selector`,
  );
}
requireAnimatedRailStageLegacyRemoval(legacyComponents, "src/compiler-components.css");
requirePlaybackTransportLegacyRemoval(legacyComponents, "src/compiler-components.css");
requireFaderLegacyRemoval(legacyComponents, "src/compiler-components.css");
requireChatLegacyRemoval(legacyComponents, "src/compiler-components.css");
requireShellNavigationRouteThemeLegacyRemoval(
  legacyComponents,
  "src/compiler-components.css",
);
requireGeneratedLayerContract(
  compiledCss,
  DESIGN_STYLEX_LAYERS,
  "dist/stylex.css",
  DESIGN_STYLEX_LAYERS,
  DESIGN_GENERATED_LAYER_PRELUDE,
  false,
  designPriorityContract.unlayeredStatements,
);
requireGeneratedLayerContract(
  uiLegacyComponents,
  UI_LEGACY_LAYERS,
  "the pinned @hraness/ui components.css",
);
requireGeneratedLayerContract(
  uiCompiledCss,
  UI_STYLEX_LAYERS,
  "the pinned @hraness/ui stylex.css",
  UI_STYLEX_LAYERS,
  UI_GENERATED_LAYER_PRELUDE,
  true,
);
requireMatch(
  uiCompiledCss,
  /@layer components\.hraness-ui\.priority3\s*\{[\s\S]*?padding-top:\s*var\(--space-5,\s*1\.25rem\);/u,
  "the pinned @hraness/ui QuietSite priority3 padding declaration",
);
requireLocalComponentsContract(localEntry);
requireCompilerComponentsContract(legacyComponents);
requireMutationRejected("arbitrary component restored in compiler legacy layer", () => requireCompilerComponentsContract(
  appendToNamedLayer(legacyComponents, "components.hraness-design-kit.legacy", ".hraness-design-unreviewed { display: grid; }", "legacy utility"),
));
requireCompilerFoundationContract(compilerFoundation);
requireAggregateContract(orderedStylesheet);
const foundationMutations = [
  compilerFoundation.replace(
    '@import "./compiler-components.css";',
    '@import "./components.css";',
  ),
  `${compilerFoundation}\n@import "../dist/stylex.css";\n`,
] as const;
for (const mutation of foundationMutations) {
  requireMutationRejected(
    "mixed or standalone compiler foundation",
    () => requireCompilerFoundationContract(mutation),
  );
}
let rejectedMutationCount = 3 + foundationMutations.length + requireMutationNegativeContracts(
  compiledCss,
  designPriorityContract,
  compiledJavaScript,
  uiCompiledCss,
  localEntry,
  legacyComponents,
  orderedStylesheet,
);
for (const file of ["src/appearance-menu.css", "src/charts.css", "src/effects.css", "src/jelly.css"]) {
  const css = await readFile(resolve(file), "utf8");
  requirePresentationBoundary(css, file);
  for (const mutation of [
    `${css}\n.escaped-component { background: red; }`,
    `${css}\n@layer components.hraness-design-kit.legacy { .restored-component { display: grid; } }`,
  ]) {
    requireMutationRejected(`${file} restored handwritten component`, () => requirePresentationBoundary(mutation, file));
    rejectedMutationCount += 1;
  }
  if (file === "src/appearance-menu.css") {
    requireMutationRejected("appearance fallback matching React", () => requirePresentationBoundary(
      css.replace(":not([data-hraness-theme-toggle-stylex])", ""), file,
    ));
    rejectedMutationCount += 1;
  }
  if (file === "src/effects.css") {
    const bridgeRule = effectsDarkBridgeRule(css, file);
    const effectsMutations = [
      ["bare effects dark bridge", `${bridgeRule}\n`],
      [
        "effects dark bridge in the wrong layer",
        replaceExactlyOnce(
          css,
          "@layer components.hraness-design-kit.legacy",
          "@layer components.hraness-design-kit.priority2",
          "effects dark bridge in the wrong layer",
        ),
      ],
      [
        "effects dark bridge with an extra selector",
        replaceExactlyOnce(
          css,
          ".dark .hraness-design-aurora-background {",
          ".dark .hraness-design-aurora-background,\n  .theme-dark .hraness-design-aurora-background {",
          "effects dark bridge with an extra selector",
        ),
      ],
      [
        "effects dark bridge with a different selector",
        replaceExactlyOnce(
          css,
          ".dark .hraness-design-aurora-background {",
          ".theme-dark .hraness-design-aurora-background {",
          "effects dark bridge with a different selector",
        ),
      ],
      [
        "effects dark bridge with an extra declaration",
        replaceExactlyOnce(
          css,
          "--hraness-design-aurora-after-opacity: 0.18;",
          "--hraness-design-aurora-after-opacity: 0.18;\n    --hraness-design-aurora-extra: 1;",
          "effects dark bridge with an extra declaration",
        ),
      ],
      [
        "effects dark bridge with a different declaration",
        replaceExactlyOnce(
          css,
          "--hraness-design-aurora-cyan-mix: 15%;",
          "--hraness-design-aurora-cyan-mix: 16%;",
          "effects dark bridge with a different declaration",
        ),
      ],
      [
        "missing effects dark bridge",
        "@layer components.hraness-design-kit.legacy {}\n",
      ],
    ] as const;
    for (const [description, mutation] of effectsMutations) {
      requireMutationRejected(description, () => requirePresentationBoundary(mutation, file));
      rejectedMutationCount += 1;
    }
  }
  if (file === "src/jelly.css") {
    requireMutationRejected(`${file} layered theme tokens`, () => requirePresentationBoundary(
      `${css}\n@layer components.hraness-design-kit.legacy { .dark { --theme-mutation: red; } }`, file,
    ));
    rejectedMutationCount += 1;
  }
}
forbid(
  `${compiledJavaScript}\n${compiledCss}\n${localEntry}\n${legacyComponents}\n${compilerFoundation}\n${orderedStylesheet}`,
  new RegExp(GALLERY_LAYER_CONFLICT_SENTINEL, "u"),
  "the gallery-only cross-package layer sentinel in package output",
);

console.log(
  `StyleX package artifacts match the compiler contract and reject ${String(rejectedMutationCount)} malformed layer mutations`,
);
