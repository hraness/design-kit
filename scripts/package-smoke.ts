import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";

import {
  STYLEX_COMPLETE_RECORD_SCHEMA_VERSION,
  STYLEX_GENERATION_SCHEMA_VERSION,
  STYLEX_PACKAGE_MANIFEST_SCHEMA_VERSION,
  STYLEX_TEMPLATE_CSS_PLACEHOLDER,
  artifactForFile,
  auditCssWithoutStylexUnionNamespace,
  canonicalJson,
  compilerContract,
  compilerSha256,
  createStylexGeneration,
  finalizeStylexGeneration,
  prepareStylexProducedTemplate,
  readStylexPackageManifest,
  sealStylexProducedTemplate,
  serializeStylexPackageRules,
  serializeStylexRuleUnionV1,
  stylexRulesSha256,
  stylexUnionPolicy,
  stylexUnionPolicySha256,
  validateStylexPackageManifest,
  type StylexPackageManifestV1,
  type StylexStandaloneSerializerV1,
} from "@hraness/ui/stylex-build";
import { collectBunStylexGraph } from "@hraness/ui/stylex-build/bun";

async function run(command: string[], cwd: string): Promise<void> {
  const child = Bun.spawn(command, { cwd, stdout: "inherit", stderr: "inherit" });
  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(`Command failed (${String(exitCode)}): ${command.join(" ")}`);
  }
}

async function expectRejected(
  operation: () => Promise<unknown>,
  pattern: RegExp,
  label: string,
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!pattern.test(message)) {
      throw new Error(`${label} failed for an unexpected reason: ${message}`, {
        cause: error,
      });
    }
    return;
  }
  throw new Error(`${label} unexpectedly succeeded.`);
}

function logicalPath(root: string, path: string, label: string): string {
  const logical = relative(root, resolve(path)).split(sep).join("/");
  assert.ok(
    logical.length > 0
      && logical !== ".."
      && !logical.startsWith("../")
      && !logical.startsWith("/"),
    `${label} must remain below its root.`,
  );
  return logical;
}

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  }));
  return nested.flat();
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function stringField(value: Record<string, unknown>, key: string, label: string): string {
  const field = value[key];
  if (typeof field !== "string" || field.length === 0) {
    throw new TypeError(`${label}.${key} must be a non-empty string.`);
  }
  return field;
}

interface CssBlockRange {
  readonly bodyStart: number;
  readonly closeBrace: number;
}

interface CssRuleRange {
  readonly body: string;
  readonly end: number;
  readonly start: number;
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
    if (character === '"' || character === "'") stringQuote = character;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
      if (depth < 0) break;
    }
  }
  throw new Error(`${label} contains an unterminated CSS block.`);
}

function compactMediaBlocks(css: string, label: string): CssBlockRange[] {
  return [...css.matchAll(
    /@media\s*\((?:max-width\s*:\s*48rem|width\s*<=\s*48rem)\)\s*\{/gu,
  )].map((match) => {
    if (match.index === undefined) {
      throw new Error(`${label} contains an unlocatable compact media block.`);
    }
    const openBrace = match.index + match[0].lastIndexOf("{");
    return {
      bodyStart: openBrace + 1,
      closeBrace: matchingCssBrace(css, openBrace, label),
    };
  });
}

function compiledChatBranchClasses(
  javaScript: string,
  branch: string,
  label: string,
): string[] {
  const styleMap = javaScript.match(/var chatStyles = \{([\s\S]*?)\n\};/u)?.[1];
  if (styleMap === undefined) {
    throw new Error(`${label} is missing the compiled chatStyles map.`);
  }
  const branchMap = styleMap.match(
    new RegExp(`^  ${branch}: \\{([\\s\\S]*?)^  \\},?$`, "mu"),
  )?.[1];
  if (branchMap === undefined) {
    throw new Error(`${label} is missing the Chat ${branch} recipe branch.`);
  }
  return [...new Set(branchMap.match(/\bx[a-z0-9]+\b/gu) ?? [])];
}

function compiledStyleBranchClasses(
  javaScript: string,
  styleMapName: string,
  branch: string,
  label: string,
): string[] {
  const escapedMapName = styleMapName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const styleMap = javaScript.match(
    new RegExp(`var ${escapedMapName} = \\{([\\s\\S]*?)\\n\\};`, "u"),
  )?.[1];
  if (styleMap === undefined) {
    throw new Error(`${label} is missing the compiled ${styleMapName} map.`);
  }
  const escapedBranch = branch.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const branchMap = styleMap.match(
    new RegExp(`^  ${escapedBranch}: \\{([\\s\\S]*?)^  \\},?$`, "mu"),
  )?.[1];
  if (branchMap === undefined) {
    throw new Error(`${label} is missing the ${styleMapName}.${branch} recipe branch.`);
  }
  const classes = [...new Set(branchMap.match(/\bx[a-z0-9]+\b/gu) ?? [])];
  if (classes.length === 0) {
    throw new Error(`${label} compiled ${styleMapName}.${branch} to no atomic classes.`);
  }
  return classes;
}

function chatBranchRules(
  css: string,
  javaScript: string,
  branch: string,
  label: string,
): CssRuleRange[] {
  return compiledChatBranchClasses(javaScript, branch, label).flatMap((className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    return [...css.matchAll(
      new RegExp(`\\.${escaped}(?:\\.${escaped})?\\s*\\{([^{}]*)\\}`, "gu"),
    )].flatMap((match) => match.index === undefined
      ? []
      : [{
          body: match[1] ?? "",
          end: match.index + match[0].length,
          start: match.index,
        }]);
  });
}

function atomicClassRules(
  css: string,
  classNames: readonly string[],
  label: string,
): CssRuleRange[] {
  return [...new Set(classNames)].flatMap((className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const rules = [...css.matchAll(
      new RegExp(`\\.${escaped}(?:\\.${escaped})?\\s*\\{([^{}]*)\\}`, "gu"),
    )].flatMap((match) => match.index === undefined
      ? []
      : [{
          body: match[1] ?? "",
          end: match.index + match[0].length,
          start: match.index,
        }]);
    if (rules.length === 0) {
      throw new Error(`${label} is missing the emitted atomic class ${className}.`);
    }
    return rules;
  });
}

const noticeDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/align-items:\s*center/u, "align-items"],
  [/background-color:\s*(?:#ffcc33|#fc3)/u, "background-color"],
  [/border-block-end-color:\s*#5c1906/u, "border-block-end color"],
  [/border-block-end-style:\s*solid/u, "border-block-end style"],
  [/border-block-end-width:\s*2px/u, "border-block-end width"],
  [/box-shadow:\s*0\s+3px\s+12px\s+#24140059/u, "box-shadow"],
  [/color:\s*#241400/u, "color"],
  [/display:\s*flex/u, "display"],
  [/flex-wrap:\s*wrap/u, "flex-wrap"],
  [/font-family:\s*var\(--font-text,\s*system-ui,\s*sans-serif\)/u, "font-family"],
  [/font-size:\s*var\(--text-label,\s*0?\.875rem\)/u, "font-size"],
  [/gap:\s*var\(--space-1,\s*0?\.25rem\)\s+var\(--space-3,\s*0?\.75rem\)/u, "gap"],
  [/inset-block-start:\s*0/u, "logical block-start inset"],
  [/justify-content:\s*center/u, "justify-content"],
  [/line-height:\s*1\.35/u, "line-height"],
  [/min-height:\s*3rem/u, "min-height"],
  [/padding-block:\s*max\(var\(--space-2,\s*0?\.5rem\),\s*env\(safe-area-inset-top\)\)/u, "padding-block"],
  [/padding-inline:\s*max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-left\)\)\s+max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-right\)\)/u, "padding-inline"],
  [/position:\s*sticky/u, "position"],
  [/text-align:\s*center/u, "text-align"],
  [/width:\s*100%/u, "width"],
  [/z-index:\s*calc\(var\(--z-tooltip,\s*3000\)\s*\+\s*1\)/u, "z-index"],
  [/font-weight:\s*var\(--font-weight-bold,\s*700\)/u, "emphasis font-weight"],
  [/letter-spacing:\s*0?\.04em/u, "emphasis letter-spacing"],
  [/text-transform:\s*uppercase/u, "emphasis text-transform"],
];

const ditherDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/--hraness-design-dither-size:\s*3px/u, "fine density variable"],
  [/--hraness-design-dither-size:\s*7px/u, "coarse density variable"],
  [
    /background-image:\s*radial-gradient\(color-mix\(in oklch,\s*currentColor 18%,\s*transparent\)\s*0?\.75px,\s*transparent\s*0?\.75px\)/u,
    "radial texture",
  ],
  [
    /background-size:\s*var\(--hraness-design-dither-size,\s*4px\)\s+var\(--hraness-design-dither-size,\s*4px\)/u,
    "public density-variable texture size",
  ],
  [/@media\s*\(forced-colors:\s*active\)/u, "forced-colors override"],
];

const layoutSurfaceDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/background-color:\s*var\(--background\)/u, "solid surface background"],
  [
    /background-color:\s*color-mix\(in oklch,\s*var\(--background\)\s*90%,\s*transparent\)/u,
    "glass TopBar background",
  ],
  [/backdrop-filter:\s*blur\(18px\)\s*saturate\(1\.08\)/u, "glass TopBar filter"],
  [/border-block-end-color:\s*var\(--line\)/u, "TopBar logical block-end border"],
  [/border-block-start-color:\s*var\(--line\)/u, "footer logical block-start border"],
  [/min-inline-size:\s*0/u, "logical inline minimum"],
  [/min-block-size:\s*var\(--top-bar-height\)/u, "TopBar logical block minimum"],
  [/min-block-size:\s*var\(--bottom-bar-height\)/u, "BottomBar logical block minimum"],
  [/inline-size:\s*min\(100%,\s*var\(--page-canvas-width\)\)/u, "PageCanvas logical inline size"],
  [/max-inline-size:\s*none/u, "full logical inline cap"],
  [/max-inline-size:\s*var\(--page-canvas-wide\)/u, "wide logical inline cap"],
  [
    /padding-block:\s*var\(--space-1\)\s*max\(var\(--space-1\),\s*env\(safe-area-inset-bottom\)\)/u,
    "compact DockedFooter safe-area inset",
  ],
  [/position:\s*absolute/u, "absolute DockedFooter position"],
  [/position:\s*fixed/u, "fixed DockedFooter position"],
  [/background-color:\s*canvas/u, "forced-colors surface background"],
  [/border-block-end-color:\s*canvastext/u, "forced-colors TopBar logical border"],
  [/border-block-start-color:\s*canvastext/u, "forced-colors footer logical borders"],
  [/border-inline-end-color:\s*canvastext/u, "forced-colors inline-end borders"],
  [/border-inline-start-color:\s*canvastext/u, "forced-colors inline-start borders"],
];

const layoutSurfaceIsolatedDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/inset-block-end:\s*0/u, "DockedFooter logical block-end inset"],
  [/inset-block-start:\s*0/u, "sticky TopBar logical block-start inset"],
  [/inset-inline:\s*0/u, "DockedFooter logical inline insets"],
];

const layoutSurfaceTokenPhysicalSubstitutions: readonly (readonly [RegExp, string])[] = [
  [/border-bottom-color:\s*var\(--line\)/u, "physical block-end border color substitution"],
  [/border-top-color:\s*var\(--line\)/u, "physical block-start border color substitution"],
  [/min-height:\s*var\(--top-bar-height\)/u, "physical TopBar min-height substitution"],
  [/min-height:\s*var\(--bottom-bar-height\)/u, "physical BottomBar min-height substitution"],
  [/width:\s*min\(100%,\s*var\(--page-canvas-width\)\)/u, "physical width substitution"],
  [/max-width:\s*var\(--page-canvas-wide\)/u, "physical wide max-width substitution"],
];

const layoutSurfaceIsolatedPhysicalSubstitutions: readonly (readonly [RegExp, string])[] = [
  [/border-bottom-width:\s*1px/u, "physical block-end border width substitution"],
  [/border-top-width:\s*1px/u, "physical block-start border width substitution"],
  [/(?:^|\s)bottom:\s*0/u, "physical bottom inset substitution"],
  [/min-width:\s*0/u, "physical min-width substitution"],
  [/max-width:\s*none/u, "physical full-size max-width substitution"],
];

const migratedLayoutLegacySelector =
  /\.hraness-design-(?:top-bar|bottom-bar|page-canvas|docked-footer)(?:__[\w-]+)?\s*(?:\{|\[|,|:)/u;
const migratedAnimatedRailStageLegacySelector =
  /\.hraness-design-animated-rail-stage/u;
const migratedPlaybackLegacySelector =
  /\.hraness-design-playback-transport(?:__button\s+:is\(svg,\s*\[data-slot=["']spinner["']\]\)|\s*\{)/u;
const migratedFaderLegacySelector =
  /\.hraness-design-fader(?:__[\w-]+)?(?:\[[^\]]+\])?(?:(?:::before|::after)|\s+\.hraness-design-fader__[\w-]+)?\s*(?:\{|,)/u;
const migratedChatLegacySelector =
  /\.hraness-design-chat-(?:message|composer)(?:__[\w-]+)?\s*(?:\{|\[|,|:)/u;
const migratedShellNavigationRouteLegacySelector =
  /\.hraness-design-(?:app-shell|navigation-rail|rail-section|rail-item|route-state)(?:__[\w-]+)?(?:\[[^\]]+\])?\s*(?:\{|,|:)/u;
const migratedThemeRootLegacySelector =
  /\.hraness-design-theme-toggle(?:\s*\{|\[data-ready=["']false["']\]\s*\{)/u;

const shellStyleBranches = {
  appShellStyles: [
    "bottom",
    "drawer",
    "mobileTrigger",
    "page",
    "rail",
    "root",
    "top",
  ],
  navigationRailStyles: [
    "item",
    "itemActive",
    "itemCopy",
    "itemDescription",
    "itemIcon",
    "itemLabel",
    "itemNativeInteractionFallbacks",
    "navigation",
    "rail",
    "railEdge",
    "section",
    "sectionItems",
    "sectionTitle",
  ],
  routeStateStyles: [
    "content",
    "header",
    "loading",
    "root",
    "row",
    "skeletons",
  ],
  themeStyles: ["notReady", "root"],
} as const;

const layoutSurfaceStyleBranches = [
  "bar",
  "barContent",
  "barPart",
  "bottomBar",
  "dockedAbsolute",
  "dockedContent",
  "dockedContentCompactInset",
  "dockedContentCompactNoInset",
  "dockedContentDefaultInset",
  "dockedContentDefaultNoInset",
  "dockedFixed",
  "dockedFooter",
  "dockedSticky",
  "fullSize",
  "pageCanvas",
  "pageContentInset",
  "pageNoInset",
  "surface",
  "topBar",
  "topBarActions",
  "topBarGlass",
  "topBarSticky",
  "topBarStatic",
  "topBarTitle",
  "wideSize",
] as const;

const animatedRailStageDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/min-inline-size:\s*0/u, "logical minimum inline-size"],
  [
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?transform:\s*none\s*!important/u,
    "important reduced-motion transform fallback",
  ],
  [
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?transition:\s*none\s*!important/u,
    "important reduced-motion transition fallback",
  ],
];

const playbackTransportDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [
    /@layer components\.hraness-design-kit\.priority3\s*\{[\s\S]*?gap:\s*var\(--space-2\)/u,
    "priority3 gap",
  ],
  [
    /@layer components\.hraness-design-kit\.priority4\s*\{[\s\S]*?align-items:\s*center/u,
    "priority4 alignment",
  ],
  [
    /@layer components\.hraness-design-kit\.priority4\s*\{[\s\S]*?display:\s*flex/u,
    "priority4 flex display",
  ],
  [
    /@layer components\.hraness-design-kit\.priority4\s*\{[\s\S]*?flex-wrap:\s*wrap/u,
    "priority4 wrapping",
  ],
  [
    /@layer components\.hraness-design-kit\.priority4\s*\{[\s\S]*?inline-size:\s*1\.5rem/u,
    "priority4 logical inline glyph size",
  ],
  [
    /@layer components\.hraness-design-kit\.priority4\s*\{[\s\S]*?block-size:\s*1\.5rem/u,
    "priority4 logical block glyph size",
  ],
];

const chatDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/align-items:\s*end/u, "composer block-end alignment"],
  [/color:\s*var\(--muted\)/u, "message header color"],
  [/display:\s*grid/u, "message and composer grid display"],
  [/font-size:\s*var\(--text-caption\)/u, "message header caption size"],
  [/gap:\s*var\(--space-2\)/u, "message row and composer gap"],
  [/gap:\s*var\(--space-3\)/u, "message root gap"],
  [
    /grid-template-columns:\s*auto\s+minmax\(0,\s*1fr\)/u,
    "message grid columns",
  ],
  [
    /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*auto/u,
    "composer grid columns",
  ],
  [/min-inline-size:\s*0/u, "message content logical minimum"],
];

const faderDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [
    /--hraness-design-fader-thumb-block-size:\s*(?:0?\.75rem)/u,
    "compact thumb block-size variable",
  ],
  [
    /--hraness-design-fader-thumb-block-size:\s*1\.125rem/u,
    "default thumb block-size variable",
  ],
  [
    /--hraness-design-fader-thumb-inline-size:\s*1\.5rem/u,
    "compact thumb inline-size variable",
  ],
  [
    /--hraness-design-fader-thumb-inline-size:\s*1\.75rem/u,
    "default thumb inline-size variable",
  ],
  [
    /--hraness-design-fader-track-length:\s*6rem/u,
    "default track-length variable",
  ],
  [
    /--hraness-design-fader-track-length:\s*var\(--interactive-target-min\)/u,
    "compact track-length variable",
  ],
  [
    /block-size:\s*var\(--hraness-design-fader-thumb-block-size\)/u,
    "thumb block-size variable consumption",
  ],
  [
    /inline-size:\s*var\(--hraness-design-fader-thumb-inline-size\)/u,
    "thumb inline-size variable consumption",
  ],
  [
    /block-size:\s*var\(--hraness-design-fader-track-length\)/u,
    "track-length variable consumption",
  ],
  [/inset-inline:\s*calc\(50%\s*-\s*2px\)/u, "logical rail inset"],
  [/min-inline-size:\s*8rem/u, "horizontal minimum inline-size"],
];

function requireNoticePresentation(css: string, label: string): void {
  if (!css.includes("@layer components.hraness-design-kit.priority")) {
    throw new Error(`${label} lost the package-owned StyleX layer.`);
  }
  for (const [pattern, declaration] of noticeDeclarationPatterns) {
    if (!pattern.test(css)) {
      throw new Error(`${label} lost the migrated notice ${declaration} declaration.`);
    }
  }
}

function requireAnimatedRailStagePresentation(css: string, label: string): void {
  for (const [pattern, declaration] of animatedRailStageDeclarationPatterns) {
    if (!pattern.test(css)) {
      throw new Error(
        `${label} lost the migrated AnimatedRailStage ${declaration} declaration.`,
      );
    }
  }
}

function requireDitherPresentation(css: string, label: string): void {
  for (const layer of ["priority2", "priority3", "priority4", "priority5", "priority6", "priority7", "priority8"]) {
    if (!css.includes(`@layer components.hraness-design-kit.${layer}`)) {
      throw new Error(`${label} lost the package-owned ${layer} StyleX layer.`);
    }
  }
  for (const [pattern, declaration] of ditherDeclarationPatterns) {
    if (!pattern.test(css)) {
      throw new Error(`${label} lost the migrated DitherSurface ${declaration} declaration.`);
    }
  }
}

function requireLayoutSurfacePresentation(
  css: string,
  javaScript: string,
  label: string,
  isolated = false,
): void {
  const layoutClasses = layoutSurfaceStyleBranches.flatMap((branch) =>
    compiledStyleBranchClasses(
      javaScript,
      "layoutSurfaceStyles",
      branch,
      label,
    ));
  const layoutCss = atomicClassRules(css, layoutClasses, label)
    .map(({ body }) => body)
    .join("\n");
  for (const [pattern, declaration] of layoutSurfaceDeclarationPatterns) {
    if (!pattern.test(layoutCss)) {
      throw new Error(`${label} lost the migrated layout-surface ${declaration} declaration.`);
    }
  }
  if (isolated) {
    for (const [pattern, declaration] of layoutSurfaceIsolatedDeclarationPatterns) {
      if (!pattern.test(layoutCss)) {
        throw new Error(
          `${label} lost the migrated layout-surface ${declaration} declaration.`,
        );
      }
    }
  }
  const forbidden = isolated
    ? [...layoutSurfaceTokenPhysicalSubstitutions, ...layoutSurfaceIsolatedPhysicalSubstitutions]
    : layoutSurfaceTokenPhysicalSubstitutions;
  for (const [pattern, substitution] of forbidden) {
    if (pattern.test(layoutCss)) {
      throw new Error(`${label} contains a migrated layout-surface ${substitution}.`);
    }
  }
}

function requirePlaybackTransportPresentation(css: string, label: string): void {
  for (const [pattern, declaration] of playbackTransportDeclarationPatterns) {
    if (!pattern.test(css)) {
      throw new Error(
        `${label} lost the migrated PlaybackTransport ${declaration} declaration.`,
      );
    }
  }
}

function requireFaderPresentation(css: string, label: string): void {
  for (const [pattern, declaration] of faderDeclarationPatterns) {
    if (!pattern.test(css)) {
      throw new Error(`${label} lost the migrated Fader ${declaration} declaration.`);
    }
  }
}

function requireChatPresentation(css: string, javaScript: string, label: string): void {
  for (const [pattern, declaration] of chatDeclarationPatterns) {
    if (!pattern.test(css)) {
      throw new Error(`${label} lost the migrated Chat ${declaration} declaration.`);
    }
  }
  const compactRules = chatBranchRules(css, javaScript, "composer", label).filter(({ body }) =>
    /^\s*grid-template-columns:\s*1fr;?\s*$/u.test(body));
  const compactBlocks = compactMediaBlocks(css, label);
  if (compactRules.length !== 1
    || !compactBlocks.some((block) => {
      const rule = compactRules[0];
      return rule !== undefined
        && rule.start >= block.bodyStart
        && rule.end <= block.closeBrace;
    })) {
    throw new Error(
      `${label} did not structurally bind the ChatComposer one-column class to @media (width <= 48rem).`,
    );
  }
  const headerRules = chatBranchRules(css, javaScript, "messageHeader", label);
  if (!headerRules.some(({ body }) =>
    /(?:^|;)\s*margin-block-end:\s*var\(--space-1\);?/u.test(body))) {
    throw new Error(`${label} lost the compiled Chat messageHeader logical margin.`);
  }
  if (headerRules.some(({ body }) =>
    /(?:^|;)\s*margin-bottom:\s*var\(--space-1\);?/u.test(body))) {
    throw new Error(`${label} physicalized a compiled Chat messageHeader declaration.`);
  }
}

function requireShellNavigationRouteThemePresentation(
  css: string,
  javaScript: string,
  label: string,
): string[] {
  const classes: string[] = [];
  for (const [styleMapName, branches] of Object.entries(shellStyleBranches)) {
    for (const branch of branches) {
      classes.push(...compiledStyleBranchClasses(
        javaScript,
        styleMapName,
        branch,
        label,
      ));
    }
  }
  requireAtomicSelectorsPresent(css, classes, label);
  for (const [pattern, declaration] of [
    [/grid-template:\s*["']rail top["']/u, "desktop AppShell grid"],
    [/@media\s*\((?:max-width:\s*48rem|width\s*<=\s*48rem)\)/u, "compact AppShell query"],
    [/grid-template-columns:\s*auto\s+minmax\(0,\s*1fr\)\s+auto/u, "RailItem grid"],
    [/background-color:\s*var\(--surface-hover\)/u, "RailItem native hover background"],
    [/background-color:\s*var\(--secondary\)/u, "RailItem active background"],
    [/background-color:\s*canvas/iu, "AppShell forced-color rail background"],
    [/color:\s*var\(--secondary-foreground\)/u, "RailItem active foreground"],
    [/outline-color:\s*var\(--focus\)/u, "RailItem native focus fallback"],
    [/grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)/u, "route-state rows"],
    [/inline-size:\s*min\(100%,\s*36rem\)/u, "route loading width"],
    [/opacity:\s*0?\.64/u, "ThemeToggle not-ready state"],
  ] as const) {
    if (!pattern.test(css)) {
      throw new Error(`${label} lost the migrated ${declaration} declaration.`);
    }
  }
  return [...new Set(classes)];
}

function requireAtomicSelectorsExactlyOnce(
  css: string,
  classNames: readonly string[],
  label: string,
): void {
  for (const className of new Set(classNames)) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const count = css.match(
      new RegExp(`\\.${escaped}(?:\\.${escaped})?(?=\\s|\\{|,|:|\\[)`, "gu"),
    )?.length ?? 0;
    if (count !== 1) {
      throw new Error(`${label} contains ${String(count)} selectors for rendered atomic class ${className}.`);
    }
  }
}

function requireAtomicSelectorsPresent(
  css: string,
  classNames: readonly string[],
  label: string,
): void {
  for (const className of new Set(classNames)) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const count = css.match(
      new RegExp(`\\.${escaped}(?:\\.${escaped})?(?=\\s|\\{|,|:|\\[)`, "gu"),
    )?.length ?? 0;
    if (count < 1) {
      throw new Error(`${label} does not contain rendered atomic class ${className}.`);
    }
  }
}

function requireLayerBlockExactlyOnce(
  css: string,
  layerName: string,
  label: string,
): void {
  const escaped = layerName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const count = css.match(new RegExp(`@layer\\s+${escaped}\\s*\\{`, "gu"))?.length ?? 0;
  if (count !== 1) {
    throw new Error(`${label} contains ${String(count)} ${layerName} blocks instead of one.`);
  }
}

const publicCollectorToolchain = {
  "@babel/core": "7.29.7",
  "@stylexjs/babel-plugin": "0.19.0",
  "@types/babel__core": "7.20.5",
  "@types/bun": "1.3.14",
  lightningcss: "1.33.0",
} as const;

const compilerStylesheetPaths = [
  "src/appearance-menu.css",
  "src/charts.css",
  "src/compiler-components.css",
  "src/compiler-foundation.css",
  "src/compiler-palettes.css",
  "src/compiler-tokens.css",
  "src/components.css",
  "src/design-gallery.css",
  "src/effects.css",
  "src/fonts.css",
  "src/jelly.css",
  "src/palette-bridge.css",
  "src/palettes.css",
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

const designKitStandaloneSerializer = {
  before: ["components.hraness-design-kit.legacy"],
  prefix: "components.hraness-design-kit",
} as const satisfies StylexStandaloneSerializerV1;

function requireDesignKitManifest(
  manifest: StylexPackageManifestV1,
  runtimePaths: readonly string[],
  label: string,
): void {
  assert.equal(manifest.kind, "hraness-stylex-package-manifest");
  assert.deepEqual(
    manifest.package,
    { name: "@hraness/design-kit", version: "0.6.1" },
    `${label} package identity changed`,
  );
  assert.equal(manifest.schemaVersion, STYLEX_PACKAGE_MANIFEST_SCHEMA_VERSION);
  assert.deepEqual(manifest.compiler, compilerContract, `${label} compiler contract changed`);
  assert.equal(manifest.compilerSha256, compilerSha256, `${label} compiler hash changed`);
  assert.equal(manifest.rulesSha256, stylexRulesSha256(manifest.rules));
  assert.deepEqual(manifest.buildTools, [], `${label} must not publish build tools`);
  assert.deepEqual(
    manifest.runtime.map(({ path }) => path),
    [...runtimePaths].sort(),
    `${label} runtime inventory is incomplete`,
  );
  assert.equal(manifest.compilerFoundation, "src/compiler-palettes.css");
  assert.deepEqual(
    manifest.stylesheets.map(({ path }) => path),
    [...compilerStylesheetPaths].sort(),
    `${label} compiler stylesheet inventory is incomplete`,
  );
  assert.equal(
    manifest.stylesheets.filter(({ path }) => path === manifest.compilerFoundation).length,
    1,
    `${label} must bind exactly one compiler foundation`,
  );
  assert.equal(manifest.standaloneCss.path, "dist/stylex.css");
  assert.deepEqual(
    manifest.standaloneSerializer,
    designKitStandaloneSerializer,
    `${label} standalone namespace or legacy boundary changed`,
  );
}

const repository = process.cwd();
const rootManifest = record(
  await Bun.file(join(repository, "package.json")).json() as unknown,
  "package.json",
);
const rootDevDependencies = record(
  rootManifest.devDependencies,
  "package.json devDependencies",
);
const rootDependencies = record(
  rootManifest.dependencies,
  "package.json dependencies",
);
const rootPeerDependencies = record(
  rootManifest.peerDependencies,
  "package.json peerDependencies",
);
const uiDevelopmentSpecifier = stringField(
  rootDevDependencies,
  "@hraness/ui",
  "package.json devDependencies",
);
const immutableUiRelease = /^github:hraness\/ui#v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;
const reviewedUiCommit = /^github:hraness\/ui#[0-9a-f]{40}$/u;
if (!immutableUiRelease.test(uiDevelopmentSpecifier)
  && !reviewedUiCommit.test(uiDevelopmentSpecifier)) {
  throw new Error(
    "The @hraness/ui development dependency must use an exact immutable release tag or full reviewed commit.",
  );
}
if (uiDevelopmentSpecifier !== "github:hraness/ui#v0.5.4") {
  throw new Error(
    "Design-kit v0.6.1 must build and publish against the immutable @hraness/ui v0.5.4 release.",
  );
}
if (process.argv.includes("--publication")) {
  if (!immutableUiRelease.test(uiDevelopmentSpecifier)) {
    throw new Error(
      "Publication is blocked while @hraness/ui uses a full-commit development candidate; replace it with the reviewed immutable release tag.",
    );
  }
  console.log("Publication dependency gate passed an immutable @hraness/ui release tag");
  process.exit(0);
}
const uiPeerRange = stringField(
  rootPeerDependencies,
  "@hraness/ui",
  "package.json peerDependencies",
);
if (uiPeerRange !== ">=0.5.4 <0.6.0") {
  throw new Error("Design-kit v0.6.1 must declare the exact @hraness/ui v0.5 peer range.");
}
if (stringField(rootDependencies, "@stylexjs/stylex", "package.json dependencies") !== "0.19.0") {
  throw new Error("The StyleX authoring/runtime dependency must be pinned to 0.19.0.");
}
for (const [dependency, version] of Object.entries(publicCollectorToolchain)) {
  if (stringField(rootDevDependencies, dependency, "package.json devDependencies") !== version) {
    throw new Error(`The public StyleX collector peer ${dependency} must be pinned to ${version}.`);
  }
}
if (rootDevDependencies["@stylexjs/unplugin"] !== undefined
  || rootDevDependencies.unplugin !== undefined) {
  throw new Error("The private unplugin compiler adapter must not remain in design-kit v0.6.1.");
}
const uiInstallSource = process.env.HRANESS_UI_PACKAGE
  ?? uiDevelopmentSpecifier;
const work = await realpath(
  await mkdtemp(join(tmpdir(), "hraness-design-kit-smoke-")),
);

try {
  const archive = join(work, "package.tgz");
  const consumer = join(work, "consumer");
  const neutralConsumer = join(work, "consumer-neutral");
  const unpacked = join(work, "unpacked");
  await mkdir(consumer);
  await mkdir(neutralConsumer);
  await mkdir(unpacked);
  await run([
    process.execPath,
    "pm",
    "pack",
    "--filename",
    archive,
    "--ignore-scripts",
    "--quiet",
  ], repository);
  await run(["tar", "-xzf", archive, "-C", unpacked], repository);
  const packedRoot = join(unpacked, "package");
  const packedPackageJsonPath = join(packedRoot, "package.json");
  const packedPackageJson = await Bun.file(packedPackageJsonPath).json();
  const packedReactJavaScript = await Bun.file(join(packedRoot, "dist/react/index.js")).text();
  const packedStylexCss = await Bun.file(join(packedRoot, "dist/stylex.css")).text();
  const packedManifestPath = join(packedRoot, "dist/stylex-manifest.json");
  const packedManifestSource = await readFile(packedManifestPath, "utf8");
  const packedCompilerFoundationCss = await readFile(
    join(packedRoot, "src/compiler-foundation.css"),
    "utf8",
  );
  const packedCompilerPalettesCss = await readFile(join(packedRoot, "src/compiler-palettes.css"), "utf8");
  const packedCompilerComponentsCss = await readFile(
    join(packedRoot, "src/compiler-components.css"),
    "utf8",
  );
  const packedAppearanceMenuCss = await readFile(
    join(packedRoot, "src/appearance-menu.css"),
    "utf8",
  );
  const packedComponentsCss = await Bun.file(join(packedRoot, "src/components.css")).text();
  const packedStylesCss = await Bun.file(join(packedRoot, "src/styles.css")).text();
  const packedRuntimePaths = (await filesBelow(join(packedRoot, "dist")))
    .filter((path) => path.endsWith(".js"))
    .map((path) => logicalPath(packedRoot, path, "packed runtime"))
    .sort();
  const packedStylexJavaScript = (await Promise.all(
    packedRuntimePaths.map((path) => readFile(join(packedRoot, path), "utf8")),
  )).join("\n");
  const packedManifest = await readStylexPackageManifest(packedManifestPath, packedRoot);
  assert.equal(
    packedManifestSource,
    `${canonicalJson(packedManifest)}\n`,
    "Packed StyleX manifest must be canonical JSON with one trailing newline.",
  );
  requireDesignKitManifest(packedManifest, packedRuntimePaths, "Packed StyleX manifest");
  assert.equal(
    packedStylexCss,
    serializeStylexPackageRules(
      packedManifest.rules,
      packedManifest.standaloneSerializer,
    ),
    "Packed standalone StyleX CSS must be the canonical manifest-rule serialization.",
  );
  assert.equal(
    packedPackageJson.exports?.["./compiler-foundation.css"],
    "./src/compiler-foundation.css",
    "Packed package must export its compiler foundation.",
  );
  assert.equal(packedPackageJson.exports?.["./compiler-palettes.css"], "./src/compiler-palettes.css");
  assert.deepEqual(packedCompilerPalettesCss.replace(/\/\*[\s\S]*?\*\//gu, "").trim().split(/\n+/u), [
    "@layer base, components;",
    "@layer components.hraness-ui.legacy.base, components.hraness-ui.legacy, components.hraness-design-kit.legacy;",
    '@import "@hraness/ui/compiler-foundation.css";',
    '@import "./palette-bridge.css";',
  ], "Packed minimal foundation must remain free of fonts, marketing, and atomic recipes");
  assert.equal(
    packedPackageJson.exports?.["./stylex-manifest.json"],
    "./dist/stylex-manifest.json",
    "Packed package must export its StyleX manifest.",
  );
  for (const internalExport of [
    "./compiler-components.css",
    "./compiler-tokens.css",
    "./product-marketing-foundation.css",
    "./stylex-build",
    "./stylex-build/bun",
  ]) {
    assert.equal(
      packedPackageJson.exports?.[internalExport],
      undefined,
      `Packed package must keep ${internalExport} internal or UI-owned.`,
    );
  }
  if (!packedCompilerFoundationCss.includes('@import "./compiler-palettes.css";')
    || !packedCompilerFoundationCss.includes('@import "./compiler-tokens.css";')
    || !packedCompilerFoundationCss.includes('@import "./compiler-components.css";')
    || !packedCompilerFoundationCss.includes('@import "./appearance-menu.css";')
    || !packedCompilerFoundationCss.includes('@import "./product-marketing-foundation.css";')) {
    throw new Error("Packed compiler foundation lost its UI, token, legacy, or appearance foundation imports.");
  }
  if (/(?:^|\/)stylex\.css|(?:^|\/)styles\.css/u.test(packedCompilerFoundationCss)) {
    throw new Error("Packed compiler foundation imports a standalone or aggregate stylesheet route.");
  }
  assert.ok(!packedCompilerFoundationCss.includes('@import "./product-marketing.css";'),
    "Packed compiler foundation must not import the raw HTML marketing recipes.");
  assert.ok(packedStylesCss.includes('@import "./product-marketing.css";\n@import "./product-marketing-foundation.css";'),
    "Packed standalone aggregate must preserve the raw HTML marketing sheet before its compiler-compatible foundation.");
  if (migratedShellNavigationRouteLegacySelector.test(packedCompilerComponentsCss)
    || migratedThemeRootLegacySelector.test(packedCompilerComponentsCss)) {
    throw new Error("Packed compiler components retained a migrated shell, navigation, route, or theme recipe.");
  }
  for (const expectedAppearanceContract of [
    '.hraness-design-theme-toggle[data-hraness-appearance-menu][data-presentation="menu"]:not([data-hraness-theme-toggle-stylex])',
    ".hraness-design-theme-toggle__trigger",
    "@media (pointer: coarse)",
    "@media (prefers-reduced-motion: reduce)",
    "@media (forced-colors: active)",
  ]) {
    if (!packedAppearanceMenuCss.includes(expectedAppearanceContract)) {
      throw new Error(`Packed standards-only appearance asset lost ${expectedAppearanceContract}.`);
    }
  }
  if (/@stylexjs\/stylex|stylex\.create|stylex-manifest|stylex-build/u.test(packedAppearanceMenuCss)) {
    throw new Error("Packed standards-only appearance asset acquired a StyleX compiler dependency.");
  }
  assert.throws(
    () => requireDesignKitManifest({
      ...packedManifest,
      standaloneSerializer: {
        ...packedManifest.standaloneSerializer,
        prefix: "components.hraness-ui",
      },
    }, packedRuntimePaths, "Wrong-prefix manifest"),
    /standalone namespace/u,
    "Design-kit manifest validation must reject the UI standalone prefix.",
  );
  assert.throws(
    () => requireDesignKitManifest({
      ...packedManifest,
      standaloneSerializer: {
        ...packedManifest.standaloneSerializer,
        before: [
          "components.hraness-design-kit.legacy.nested",
          "components.hraness-design-kit.legacy",
        ],
      },
    }, packedRuntimePaths, "Wrong-order manifest"),
    /standalone namespace/u,
    "Design-kit manifest validation must reject a reordered legacy boundary.",
  );
  const stylexImport = '@import "../dist/stylex.css";';
  const componentStylexImports = packedComponentsCss
    .split("\n")
    .filter((line) => line.trim() === stylexImport);
  const aggregateStylexImports = packedStylesCss
    .split("\n")
    .filter((line) => line.trim() === stylexImport);
  const localLayerPrelude = "@layer components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4, components.hraness-design-kit.priority5, components.hraness-design-kit.priority6, components.hraness-design-kit.priority7, components.hraness-design-kit.priority8;";
  const portfolioLayerPrelude = "@layer components.hraness-ui.legacy.base, components.hraness-ui.legacy, components.hraness-ui.priority1, components.hraness-ui.priority2, components.hraness-ui.priority3, components.hraness-ui.priority4, components.hraness-ui.priority5, components.hraness-ui.priority6, components.hraness-ui.priority7, components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4, components.hraness-design-kit.priority5, components.hraness-design-kit.priority6, components.hraness-design-kit.priority7, components.hraness-design-kit.priority8;";
  if (componentStylexImports.length !== 1
    || !packedComponentsCss.startsWith(`${localLayerPrelude}\n${stylexImport}\n`)) {
    throw new Error("Packed components.css does not freeze the local layers and deliver dist/stylex.css exactly once before legacy recipes.");
  }
  if (aggregateStylexImports.length !== 0) {
    throw new Error("Packed styles.css imports dist/stylex.css separately from components.css.");
  }
  if ((packedStylesCss.match(/@import "\.\/components\.css";/gu) ?? []).length !== 1) {
    throw new Error("Packed styles.css does not compose the narrow component entry exactly once.");
  }
  if (!packedStylesCss.startsWith(`@layer base, components;\n${portfolioLayerPrelude}\n`)
    || (packedStylesCss.match(/@import "@hraness\/ui\/components\.css";/gu) ?? []).length !== 1
    || (packedStylesCss.match(/@import "@hraness\/ui\/stylex\.css";/gu) ?? []).length !== 1) {
    throw new Error("Packed styles.css does not freeze and compose the exact cross-package component layer contract.");
  }
  requireNoticePresentation(packedStylexCss, "Packed stylex.css");
  requireAnimatedRailStagePresentation(packedStylexCss, "Packed stylex.css");
  requireDitherPresentation(packedStylexCss, "Packed stylex.css");
  requireLayoutSurfacePresentation(
    packedStylexCss,
    packedStylexJavaScript,
    "Packed stylex.css",
    true,
  );
  requirePlaybackTransportPresentation(packedStylexCss, "Packed stylex.css");
  requireFaderPresentation(packedStylexCss, "Packed stylex.css");
  requireChatPresentation(
    packedStylexCss,
    packedReactJavaScript,
    "Packed stylex.css",
  );
  const packedShellClasses = requireShellNavigationRouteThemePresentation(
    packedStylexCss,
    packedReactJavaScript,
    "Packed stylex.css",
  );
  if (migratedAnimatedRailStageLegacySelector.test(packedComponentsCss)) {
    throw new Error("Packed components.css retained the migrated legacy AnimatedRailStage recipe.");
  }
  if (/\.hraness-design-dither-surface\s*(?:\{|\[|,)/u.test(packedComponentsCss)) {
    throw new Error("Packed components.css retained the migrated legacy DitherSurface recipe.");
  }
  if (migratedLayoutLegacySelector.test(packedComponentsCss)) {
    throw new Error("Packed components.css retained a migrated legacy layout-surface recipe.");
  }
  if (migratedPlaybackLegacySelector.test(packedComponentsCss)) {
    throw new Error("Packed components.css retained a migrated legacy PlaybackTransport recipe.");
  }
  if (migratedFaderLegacySelector.test(packedComponentsCss)) {
    throw new Error("Packed components.css retained a migrated legacy Fader recipe.");
  }
  if (migratedChatLegacySelector.test(packedComponentsCss)) {
    throw new Error("Packed components.css retained a migrated legacy Chat recipe.");
  }
  if (migratedShellNavigationRouteLegacySelector.test(packedComponentsCss)
    || migratedThemeRootLegacySelector.test(packedComponentsCss)) {
    throw new Error("Packed components.css retained a migrated shell, navigation, route, or theme recipe.");
  }
  if (packedPackageJson.dependencies?.["@hraness/ui"] !== undefined) {
    throw new Error("Packed package nests @hraness/ui as a runtime dependency.");
  }
  if (packedPackageJson.peerDependencies?.["@hraness/ui"] !== uiPeerRange) {
    throw new Error(`Packed package does not declare the ${uiPeerRange} @hraness/ui peer.`);
  }
  if (packedPackageJson.peerDependenciesMeta?.["@hraness/ui"]?.optional !== true) {
    throw new Error("Packed package does not keep the entry-specific @hraness/ui peer optional at installation.");
  }
  if (packedPackageJson.devDependencies?.["@hraness/ui"] !== uiDevelopmentSpecifier) {
    throw new Error("Packed package does not retain the exact @hraness/ui development pin.");
  }
  if (packedPackageJson.dependencies?.["@stylexjs/stylex"] !== "0.19.0") {
    throw new Error("Packed package lost the exact StyleX runtime dependency.");
  }
  for (const [dependency, version] of Object.entries(publicCollectorToolchain)) {
    if (packedPackageJson.devDependencies?.[dependency] !== version) {
      throw new Error(`Packed package lost public StyleX collector peer ${dependency}@${version}.`);
    }
  }
  if (packedPackageJson.devDependencies?.["@stylexjs/unplugin"] !== undefined
    || packedPackageJson.devDependencies?.unplugin !== undefined) {
    throw new Error("Packed package retained the private unplugin compiler adapter.");
  }
  await writeFile(
    join(neutralConsumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await run([
    process.execPath,
    "add",
    archive,
    "typescript@^6.0.3",
    "--ignore-scripts",
  ], neutralConsumer);
  if (
    await Bun.file(
      join(neutralConsumer, "node_modules", "@hraness", "ui", "package.json"),
    ).exists()
  ) {
    throw new Error("The framework-neutral consumer installed the optional @hraness/ui peer.");
  }
  await run([
    "node",
    "--input-type=module",
    "-e",
    "await Promise.all([import('@hraness/design-kit'), import('@hraness/design-kit/browser'), import('@hraness/design-kit/fonts/nebula-sans/social'), import('@hraness/design-kit/syntax-highlighting')])",
  ], neutralConsumer);
  await writeFile(
    join(neutralConsumer, "index.ts"),
    [
      'import * as core from "@hraness/design-kit";',
      'import { nebulaSansSocialFonts } from "@hraness/design-kit/fonts/nebula-sans/social";',
      'import * as syntax from "@hraness/design-kit/syntax-highlighting";',
      "void [core, nebulaSansSocialFonts, syntax];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(neutralConsumer, `tsconfig.${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          lib: ["ES2023"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["index.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.${mode.toLowerCase()}.json`,
    ], neutralConsumer);
  }
  await writeFile(
    join(neutralConsumer, "browser.ts"),
    [
      'import { defaultDesignTheme, installAppearanceMenus, type AppearanceMenuOptions } from "@hraness/design-kit/browser";',
      "const options = null as AppearanceMenuOptions | null;",
      "void [defaultDesignTheme, installAppearanceMenus, options];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(neutralConsumer, `tsconfig.browser-${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["browser.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.browser-${mode.toLowerCase()}.json`,
    ], neutralConsumer);
  }
  await writeFile(
    join(consumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await run([
    process.execPath,
    "add",
    uiInstallSource,
    "@hugeicons/core-free-icons@^4.2.2",
    "@types/bun@^1.3.14",
    "@types/react@^19.2.14",
    "@types/react-dom@^19.2.3",
    "react@19.2.3",
    "react-dom@19.2.3",
    "typescript@^6.0.3",
    "--ignore-scripts",
  ], consumer);
  await run([process.execPath, "add", archive, "--ignore-scripts"], consumer);
  await run([
    "node",
    "--input-type=module",
    "-e",
    "await Promise.all([import('@hraness/design-kit'), import('@hraness/design-kit/react'), import('@hraness/design-kit/react/server'), import('@hraness/design-kit/syntax-highlighting')])",
  ], consumer);
  await writeFile(
    join(consumer, "global-error.mjs"),
    [
      'import { GlobalErrorDocument } from "@hraness/design-kit/react";',
      'import { createElement } from "react";',
      'import { renderToStaticMarkup } from "react-dom/server";',
      'const props = { darkColor: "#101419", error: new Error("Smoke"), lightColor: "#f4efe7", reset() {} };',
      "const system = renderToStaticMarkup(createElement(GlobalErrorDocument, props));",
      'if (!system.includes(\'content="light dark" name="color-scheme"\')) throw new Error("Packed global-error is not System-first.");',
      'if (!system.includes(\'content="#f4efe7" media="(prefers-color-scheme: light)" name="theme-color"\')) throw new Error("Packed global-error is missing custom Light metadata.");',
      'if (!system.includes(\'content="#101419" media="(prefers-color-scheme: dark)" name="theme-color"\')) throw new Error("Packed global-error is missing custom Dark metadata.");',
      'if ((system.match(/name="theme-color"/gu) ?? []).length !== 2) throw new Error("Packed System global-error does not expose two adaptive theme colors.");',
      'if (system.includes("hraness-design-theme-toggle") || system.includes("data-hraness-appearance-menu")) throw new Error("Packed global-error exposes an appearance selector.");',
      'const fixed = renderToStaticMarkup(createElement(GlobalErrorDocument, { ...props, theme: "dark" }));',
      'if (!fixed.includes(\'content="dark" name="color-scheme"\')) throw new Error("Packed fixed global-error has the wrong color scheme.");',
      'if (!fixed.includes(\'content="#101419" name="theme-color"\') || fixed.includes("prefers-color-scheme")) throw new Error("Packed fixed global-error metadata is not exact.");',
      "",
    ].join("\n"),
  );
  await run(["node", "./global-error.mjs"], consumer);
  await writeFile(
    join(consumer, "stylex-notice.mjs"),
    [
      'import { readFile, writeFile } from "node:fs/promises";',
      'import { Search01Icon } from "@hugeicons/core-free-icons";',
      'import { Icon, QuietSiteFooter } from "@hraness/ui";',
      'import { AnimatedRailStage, BarListChart, BottomBar, ChatComposer, ChatMessage, DitherSurface, DockedFooter, Fader, PageCanvas, PlaybackTransport, ProductionDataPreviewNotice, TopBar } from "@hraness/design-kit/react";',
      'import { Children, createElement, isValidElement } from "react";',
      'import { renderToStaticMarkup } from "react-dom/server";',
      'const stylexUrl = import.meta.resolve("@hraness/design-kit/stylex.css");',
      'if (new URL(stylexUrl).protocol !== "file:") throw new Error("Packed stylex.css is not a file export.");',
      'const stylexCss = await readFile(new URL(stylexUrl), "utf8");',
      'if (!stylexCss.includes("@layer components.hraness-design-kit.priority")) throw new Error("Packed stylex.css lost its package layer.");',
      'if (!stylexCss.includes("position: sticky") || !stylexCss.includes("text-transform: uppercase")) throw new Error("Packed stylex.css lost the notice declarations.");',
      'for (const layer of ["priority2", "priority3", "priority4", "priority5", "priority6", "priority7", "priority8"]) { if (!stylexCss.includes(`@layer components.hraness-design-kit.${layer} {`)) throw new Error(`Packed stylex.css lost design-kit ${layer}.`); }',
      'if (!stylexCss.includes("--hraness-design-dither-size: 3px") || !stylexCss.includes("--hraness-design-dither-size: 7px") || !stylexCss.includes("background-size: var(--hraness-design-dither-size, 4px) var(--hraness-design-dither-size, 4px)") || !stylexCss.includes("@media (forced-colors: active)")) throw new Error("Packed stylex.css lost the DitherSurface declarations.");',
      'if (!stylexCss.includes("transform: none !important") || !stylexCss.includes("transition: none !important") || !stylexCss.includes("@media (prefers-reduced-motion: reduce)")) throw new Error("Packed stylex.css lost the AnimatedRailStage reduced-motion declarations.");',
      'if (!stylexCss.includes("grid-template-columns: auto minmax(0, 1fr)") || !stylexCss.includes("grid-template-columns: minmax(0, 1fr) auto")) throw new Error("Packed stylex.css lost the Chat message or wide composer declarations.");',
      'const componentsCss = await readFile(new URL(import.meta.resolve("@hraness/design-kit/components.css")), "utf8");',
      'if (componentsCss.includes(".hraness-design-animated-rail-stage")) throw new Error("Legacy CSS still declares the migrated AnimatedRailStage recipe.");',
      'if (componentsCss.includes(".hraness-design-production-data-preview-notice")) throw new Error("Legacy CSS still declares the migrated notice.");',
      'if (componentsCss.includes(".hraness-design-dither-surface")) throw new Error("Legacy CSS still declares the migrated DitherSurface.");',
      'if (componentsCss.includes(".hraness-design-playback-transport {") || componentsCss.includes(`.hraness-design-playback-transport__button :is(svg, [data-slot="spinner"])`)) throw new Error("Legacy CSS still declares the migrated PlaybackTransport recipe.");',
      'if (componentsCss.includes(".hraness-design-fader")) throw new Error("Legacy CSS still declares the migrated Fader recipe.");',
      'if (componentsCss.includes(".hraness-design-chat-message") || componentsCss.includes(".hraness-design-chat-composer")) throw new Error("Legacy CSS still declares the migrated Chat recipe.");',
      'if (componentsCss.split("\\n").filter((line) => line.trim() === `@import "../dist/stylex.css";`).length !== 1) throw new Error("Packed components.css lost its single StyleX import.");',
      'const uiStylexCss = await readFile(new URL(import.meta.resolve("@hraness/ui/stylex.css")), "utf8");',
      'const uiPriority5Marker = "@layer components.hraness-ui.priority5 {";',
      'const uiPriority6Marker = "@layer components.hraness-ui.priority6 {";',
      'const uiPriority5Index = uiStylexCss.indexOf(uiPriority5Marker);',
      'const uiPriority6Index = uiStylexCss.indexOf(uiPriority6Marker);',
      'if (uiStylexCss.split(uiPriority5Marker).length !== 2 || uiStylexCss.split(uiPriority6Marker).length !== 2 || uiPriority5Index < 0 || uiPriority6Index <= uiPriority5Index) throw new Error("Packed UI stylex.css lost its single structural priority5 boundary.");',
      'const uiPriority5Css = uiStylexCss.slice(uiPriority5Index, uiPriority6Index);',
      'const uiManifest = JSON.parse(await readFile(new URL(import.meta.resolve("@hraness/ui/stylex-manifest.json")), "utf8"));',
      'const quietFooterPaddingRules = uiManifest.rules.filter(([, rule]) => /padding-top:var\\(--space-5,\\s*1\\.25rem\\)/u.test(rule.ltr));',
      'if (quietFooterPaddingRules.length !== 1 || quietFooterPaddingRules[0][2] !== 4000) throw new Error("Packed UI manifest changed its exact QuietSiteFooter padding atom.");',
      'const quietFooterPaddingClass = quietFooterPaddingRules[0][0];',
      'const html = renderToStaticMarkup(createElement(ProductionDataPreviewNotice, { surfaceOrigin: "https://preview.example.test" }));',
      'const aside = /<aside[^>]*class="([^"]+)"/u.exec(html)?.[1]?.split(" ").filter(Boolean);',
      'const strong = /<strong[^>]*class="([^"]+)"/u.exec(html)?.[1]?.split(" ").filter(Boolean);',
      'if (aside === undefined || !aside.includes("hraness-design-production-data-preview-notice") || aside.length < 2) throw new Error("Packed notice lost its stable and atomic classes.");',
      'if (strong === undefined || strong.length === 0) throw new Error("Packed notice emphasis lost its atomic classes.");',
      'if (html.includes("style=")) throw new Error("Packed notice emitted inline presentation.");',
      'const animatedRailStageMarkup = renderToStaticMarkup(createElement(AnimatedRailStage, { className: "consumer-animated-rail-stage", stageKey: "/workspace/detail" }, "Detail"));',
      'const animatedRailStage = /<div[^>]*class="([^"]+)"/u.exec(animatedRailStageMarkup)?.[1]?.split(" ").filter(Boolean);',
      'if (animatedRailStage === undefined || animatedRailStage[0] !== "hraness-design-animated-rail-stage" || animatedRailStage.at(-1) !== "consumer-animated-rail-stage" || !animatedRailStageMarkup.includes(`data-stage-key="/workspace/detail"`) || !animatedRailStageMarkup.includes(`style="opacity:1;transform:none"`)) throw new Error("Packed AnimatedRailStage lost its stable, caller-last, stage identity, or wait-mode render contract.");',
      'const animatedRailStageAtomic = animatedRailStage.filter((name) => name !== "hraness-design-animated-rail-stage" && name !== "consumer-animated-rail-stage" && stylexCss.includes(`.${name}`));',
      'if (animatedRailStageAtomic.length !== 3) throw new Error(`Packed AnimatedRailStage exposes ${String(animatedRailStageAtomic.length)} atomic classes instead of three.`);',
      'const iconHtml = renderToStaticMarkup(createElement(Icon, { icon: Search01Icon }));',
      'const icon = /<svg[^>]*class="([^"]+)"/u.exec(iconHtml)?.[1]?.split(" ").filter((name) => name !== "hraness-icon" && name.length > 0);',
      'if (icon === undefined || icon.length === 0 || iconHtml.includes("style=")) throw new Error("Packed UI Icon lost extracted StyleX classes.");',
      'for (const className of new Set(icon)) { const escaped = className.replace(/[.*+?^${}()|[\\]\\\\]/gu, "\\\\$&"); const count = uiStylexCss.match(new RegExp(`\\\\.${escaped}\\\\s*(?:\\\\{|,)`, "gu"))?.length ?? 0; if (count !== 1) throw new Error(`Packed UI stylex.css contains ${String(count)} selectors for rendered Icon class ${className}.`); }',
      'const footerHtml = renderToStaticMarkup(createElement(QuietSiteFooter, null, "UI priority5 canary"));',
      'const footer = /<footer[^>]*class="([^"]+)"/u.exec(footerHtml)?.[1]?.split(" ").filter((name) => name !== "hraness-quiet-site-footer" && name.length > 0);',
      'if (footer === undefined || footer.length === 0 || footerHtml.includes("style=")) throw new Error("Packed UI QuietSiteFooter lost extracted StyleX classes.");',
      'const uiPriority5 = footer.filter((className) => uiPriority5Css.includes(`.${className} {`));',
      'if (!uiPriority5.includes(quietFooterPaddingClass)) throw new Error("Packed UI QuietSiteFooter does not bind its exact padding atom to priority5.");',
      'for (const className of new Set(uiPriority5)) { const count = uiStylexCss.split(`.${className} {`).length - 1; if (count !== 1) throw new Error(`Packed UI stylex.css contains ${String(count)} selectors for rendered priority5 class ${className}.`); }',
      'const chartMarkup = renderToStaticMarkup(createElement(BarListChart, { "aria-label": "Packed chart", data: [{ id: "one", label: "Model one", value: 72.4 }], domain: [0, 100], formatValue: (value) => value.toFixed(1) }));',
      'if (!chartMarkup.includes("hraness-design-bar-list-chart") || !chartMarkup.includes("Packed chart") || !chartMarkup.includes("Model one") || !chartMarkup.includes("72.4") || !chartMarkup.includes("--hraness-design-chart-value:72.4%")) throw new Error("Packed aggregate React entry lost its public chart exports or render contract.");',
      'const ditherMarkup = Object.fromEntries(["coarse", "fine", "medium"].map((density) => [density, renderToStaticMarkup(createElement(DitherSurface, { as: "article", density, tone: "secondary" }, density))]));',
      'for (const [density, markup] of Object.entries(ditherMarkup)) { if (!markup.includes(`data-density="${density}"`) || !markup.includes("hraness-themed-surface") || !markup.includes("hraness-design-dither-surface") || !markup.includes(`data-slot="themed-surface"`) || markup.includes("style=")) throw new Error(`Packed DitherSurface lost its ${density} semantic or extracted presentation contract.`); }',
      'const dither = /<article[^>]*class="([^"]+)"/u.exec(ditherMarkup.coarse)?.[1]?.split(" ").filter((name) => name !== "hraness-themed-surface" && name !== "hraness-design-dither-surface" && name.length > 0 && stylexCss.includes(`.${name} {`));',
      'if (dither === undefined || dither.length < 3) throw new Error("Packed coarse DitherSurface exposes fewer than three design-kit atomic classes.");',
      'for (const className of new Set(dither)) { const count = stylexCss.split(`.${className} {`).length - 1; if (count !== 1) throw new Error(`Packed design-kit stylex.css contains ${String(count)} selectors for rendered DitherSurface class ${className}.`); }',
      'const callerMarkup = renderToStaticMarkup(createElement(DitherSurface, { density: "fine", style: { "--hraness-design-dither-size": "11px", backgroundImage: "none", backgroundSize: "11px 11px" } }));',
      'if (!callerMarkup.includes("--hraness-design-dither-size:11px") || !callerMarkup.includes("background-image:none") || !callerMarkup.includes("background-size:11px 11px")) throw new Error("Packed DitherSurface lost caller-last native presentation.");',
      'const layoutMarkup = { bottom: renderToStaticMarkup(createElement(BottomBar, { actions: "Actions", className: "consumer-bottom", leading: "Leading", style: { color: "blue" }, title: "Native title" }, "Content")), docked: renderToStaticMarkup(createElement(DockedFooter, { className: "consumer-docked", contentClassName: "consumer-docked-content", density: "compact", inset: "none", position: "absolute", size: "wide", style: { color: "purple" }, surface: "glass" }, "Docked")), page: renderToStaticMarkup(createElement(PageCanvas, { as: "div", className: "consumer-page", inset: "none", size: "wide", style: { color: "green" } }, "Page")), top: renderToStaticMarkup(createElement(TopBar, { actions: "Actions", className: "consumer-top", leading: "Leading", position: "sticky", style: { zIndex: 123 }, surface: "glass", title: "Title" }, "Content")) };',
      'const layoutContracts = { bottom: ["footer", "hraness-design-bottom-bar", "consumer-bottom"], docked: ["footer", "hraness-design-docked-footer", "consumer-docked"], page: ["div", "hraness-design-page-canvas", "consumer-page"], top: ["header", "hraness-design-top-bar", "consumer-top"] };',
      'const layout = [];',
      'for (const [name, markup] of Object.entries(layoutMarkup)) { const [tagName, stableClass, callerClass] = layoutContracts[name]; const tag = new RegExp(`<${tagName}[^>]*class="([^"]+)"`, "u").exec(markup); const classes = tag?.[1]?.split(" ").filter(Boolean); if (classes === undefined || classes[0] !== stableClass || classes.at(-1) !== callerClass || classes.filter((className) => stylexCss.includes(`.${className} {`)).length === 0) throw new Error(`Packed ${name} layout surface lost stable, atomic, or caller-last classes.`); layout.push(...classes.filter((className) => className !== stableClass && className !== callerClass && stylexCss.includes(`.${className} {`))); }',
      'if (!layoutMarkup.top.includes(`data-position="sticky"`) || !layoutMarkup.top.includes(`data-surface="glass"`) || !layoutMarkup.top.includes(`style="z-index:123"`) || !layoutMarkup.top.includes("hraness-design-top-bar__actions")) throw new Error("Packed TopBar lost its position, surface, native style, or slot contract.");',
      'if (!layoutMarkup.bottom.includes(`title="Native title"`) || !layoutMarkup.bottom.includes("hraness-design-bottom-bar__content")) throw new Error("Packed BottomBar lost native or slot semantics.");',
      'if (!layoutMarkup.page.includes(`data-inset="none"`) || !layoutMarkup.page.includes(`data-size="wide"`)) throw new Error("Packed PageCanvas lost its native element or variants.");',
      'if (!layoutMarkup.docked.includes(`data-position="absolute"`) || !layoutMarkup.docked.includes(`data-surface="glass"`) || !layoutMarkup.docked.includes(`data-density="compact"`) || !layoutMarkup.docked.includes(`data-inset="none"`) || !layoutMarkup.docked.includes(`data-size="wide"`) || !layoutMarkup.docked.includes("consumer-docked-content")) throw new Error("Packed DockedFooter lost its root or content contract.");',
      'if (new Set(layout).size < 12) throw new Error("Packed layout surfaces expose too few distinct atomic classes.");',
      'const playbackMarkup = Object.fromEntries(["idle", "pending", "playing"].map((status) => [status, renderToStaticMarkup(createElement(PlaybackTransport, { "aria-label": "Preview transport", className: "consumer-playback", onPlay() {}, onStop() {}, status }))]));',
      'const playback = [];',
      'for (const [status, markup] of Object.entries(playbackMarkup)) { const root = /<div(?=[^>]*role="toolbar")(?=[^>]*class="([^"]+)")[^>]*>/u.exec(markup); const classes = root?.[1]?.split(" ").filter(Boolean); if (classes === undefined || classes[0] !== "hraness-toolbar" || !classes.includes("hraness-design-playback-transport") || classes.at(-1) !== "consumer-playback" || !markup.includes(`data-playback-status="${status}"`) || !markup.includes("hraness-design-playback-transport__button") || !markup.includes(`data-size="large"`) || !markup.includes(`data-variant="primary"`) || markup.includes("<jelly-card")) throw new Error(`Packed PlaybackTransport lost its ${status} semantic or class contract.`); playback.push(...classes.filter((name) => stylexCss.includes(`.${name} {`))); }',
      'if (!playbackMarkup.idle.includes(`aria-label="Play"`) || !playbackMarkup.idle.includes(`data-playback-command="play"`) || !playbackMarkup.idle.includes(`data-slot="icon"`) || playbackMarkup.idle.includes(`aria-busy="true"`)) throw new Error("Packed idle PlaybackTransport lost its label, command, glyph, or busy contract.");',
      'if (!playbackMarkup.pending.includes(`aria-label="Cancel playback start"`) || !playbackMarkup.pending.includes(`data-playback-command="stop"`) || !playbackMarkup.pending.includes(`data-slot="spinner"`) || !playbackMarkup.pending.includes(`aria-busy="true"`)) throw new Error("Packed pending PlaybackTransport lost its label, command, spinner, or busy contract.");',
      'if (!playbackMarkup.playing.includes(`aria-label="Stop"`) || !playbackMarkup.playing.includes(`data-playback-command="stop"`) || !playbackMarkup.playing.includes(`data-slot="icon"`) || playbackMarkup.playing.includes(`aria-busy="true"`)) throw new Error("Packed playing PlaybackTransport lost its label, command, glyph, or busy contract.");',
      'const playbackGlyphByStatus = Object.fromEntries(Object.entries(playbackMarkup).map(([status, markup]) => { const glyph = /<(?:svg|span)(?=[^>]*data-slot="(?:icon|spinner)")(?=[^>]*class="([^"]+)")[^>]*>/u.exec(markup); const glyphClasses = glyph?.[1]?.split(" ").filter(Boolean); if (glyphClasses === undefined) throw new Error(`Packed ${status} PlaybackTransport has no rendered glyph classes.`); const logicalClasses = glyphClasses.filter((name) => new RegExp(`\\\\.${name}\\\\s*\\\\{\\\\s*(?:block-size|inline-size):\\\\s*1\\\\.5rem;`, "u").test(stylexCss)); const logicalProperties = logicalClasses.map((name) => new RegExp(`\\\\.${name}\\\\s*\\\\{\\\\s*((?:block-size|inline-size)):\\\\s*1\\\\.5rem;`, "u").exec(stylexCss)?.[1]); if (logicalClasses.length !== 2 || new Set(logicalClasses).size !== 2 || new Set(logicalProperties).size !== 2 || !logicalProperties.includes("block-size") || !logicalProperties.includes("inline-size")) throw new Error(`Packed ${status} PlaybackTransport did not receive exactly the two logical 1.5rem glyph atoms: ${JSON.stringify({ glyphClasses, logicalClasses, logicalProperties })}.`); return [status, logicalClasses]; }));',
      'const playbackGlyph = [...new Set(Object.values(playbackGlyphByStatus).flat())];',
      'if (new Set(playback).size < 4 || playbackGlyph.length !== 2) throw new Error("Packed PlaybackTransport exposes the wrong root or shared logical glyph atomic classes.");',
      'const playbackRef = { current: null }; let playCount = 0; let stopCount = 0;',
      'for (const status of ["idle", "pending", "playing"]) { const direct = PlaybackTransport({ "aria-labelledby": "preview-label", buttonAriaKeyShortcuts: "Space", buttonId: "preview-command", buttonRef: playbackRef, onPlay() { playCount += 1; }, onStop() { stopCount += 1; }, status }); const command = isValidElement(direct) ? Children.toArray(direct.props.children)[0] : undefined; if (!isValidElement(command) || command.props.buttonRef !== playbackRef || command.props.id !== "preview-command" || command.props["aria-keyshortcuts"] !== "Space") throw new Error(`Packed PlaybackTransport lost its ${status} button targeting seam.`); command.props.onPress(); }',
      'if (playCount !== 1 || stopCount !== 2) throw new Error("Packed PlaybackTransport changed its play/stop callback routing.");',
      'const faderMarkup = { defaultVertical: renderToStaticMarkup(createElement(Fader, { className: "consumer-fader-default", label: "Gain", maxValue: 100, minValue: 0, orientation: "vertical", showLabel: true, showOutput: true, value: 32 })), horizontalCompact: renderToStaticMarkup(createElement(Fader, { className: "consumer-fader-compact", density: "compact", label: "Pan", labelAccessory: createElement("button", { type: "button" }, "Reset"), maxValue: 100, minValue: 0, orientation: "horizontal", showLabel: true, showOutput: true, value: 64 })) };',
      'const faderContracts = { defaultVertical: { callerClass: "consumer-fader-default", density: "default", orientation: "vertical", value: "32" }, horizontalCompact: { callerClass: "consumer-fader-compact", density: "compact", orientation: "horizontal", value: "64" } };',
      'const faderTag = (markup, stableClass) => { const classMatch = [...markup.matchAll(/class="([^"]+)"/gu)].find((match) => match[1]?.split(" ").includes(stableClass)); const marker = classMatch?.index ?? -1; const start = markup.lastIndexOf("<", marker); const end = markup.indexOf(">", marker); if (marker < 0 || start < 0 || end < 0) throw new Error(`Packed Fader has no complete ${stableClass} tag.`); return markup.slice(start, end + 1); };',
      'const faderClasses = (markup, stableClass) => { const classes = /class="([^"]+)"/u.exec(faderTag(markup, stableClass))?.[1]?.split(" ").filter(Boolean); if (classes === undefined || classes[0] !== stableClass) throw new Error(`Packed Fader lost its stable-first ${stableClass} class contract.`); return classes; };',
      'const fader = [];',
      'for (const [variant, markup] of Object.entries(faderMarkup)) { const contract = faderContracts[variant]; const rootTag = faderTag(markup, "hraness-design-fader"); const rootClasses = faderClasses(markup, "hraness-design-fader"); if (rootClasses.at(-1) !== contract.callerClass || !rootTag.includes(`data-density="${contract.density}"`) || !rootTag.includes(`data-orientation="${contract.orientation}"`) || !rootTag.includes(`role="group"`) || rootTag.includes("style=")) throw new Error(`Packed ${variant} Fader lost stable, generated, caller-last, variant, or extracted root presentation.`); const hooks = ["hraness-design-fader", ...(variant === "horizontalCompact" ? ["hraness-design-fader__label-row"] : []), "hraness-design-fader__label", "hraness-design-fader__output", "hraness-design-fader__track", "hraness-design-fader__track-rail", "hraness-design-fader__fill-rail", "hraness-design-fader__thumb"]; for (const hook of hooks) { const generated = faderClasses(markup, hook).filter((name) => name !== contract.callerClass && name !== hook && stylexCss.includes(`.${name} {`)); if (generated.length === 0) throw new Error(`Packed ${variant} Fader ${hook} exposes no generated design-kit class.`); fader.push(...generated); } const labelTag = faderTag(markup, "hraness-design-fader__label"); const outputTag = faderTag(markup, "hraness-design-fader__output"); const trackTag = faderTag(markup, "hraness-design-fader__track"); if (labelTag.includes("style=") || outputTag.includes("style=") || !trackTag.includes(`style="position:relative;touch-action:none"`) || /(?:block-size|inline-size|--hraness-design-fader)/u.test(trackTag)) throw new Error(`Packed ${variant} Fader leaked package-owned inline presentation.`); const range = /<input(?=[^>]*type="range")[^>]*>/u.exec(markup)?.[0]; if (range === undefined || !range.includes(`min="0"`) || !range.includes(`max="100"`) || !range.includes(`step="1"`) || !range.includes(`aria-orientation="${contract.orientation}"`) || !range.includes(`value="${contract.value}"`)) throw new Error(`Packed ${variant} Fader lost native range semantics.`); for (const rail of ["hraness-design-fader__track-rail", "hraness-design-fader__fill-rail"]) { const matches = markup.match(new RegExp(`<span(?=[^>]*aria-hidden="true")(?=[^>]*class="[^"]*${rail}[^"]*")[^>]*>`, "gu")) ?? []; if (matches.length !== 1) throw new Error(`Packed ${variant} Fader lost its single aria-hidden ${rail} hook.`); } }',
      'if (!faderMarkup.defaultVertical.includes(">Gain</label>") || !faderMarkup.defaultVertical.includes(">32</output>") || !faderMarkup.horizontalCompact.includes(">Pan</label>") || !faderMarkup.horizontalCompact.includes(`<span class="hraness-design-fader__label-accessory"><button type="button">Reset</button></span>`) || !faderMarkup.horizontalCompact.includes(">64</output>")) throw new Error("Packed Fader lost its label, accessory, or output contract.");',
      'const chatTag = (markup, stableClass) => { const classMatch = [...markup.matchAll(/class="([^"]+)"/gu)].find((match) => match[1]?.split(" ").includes(stableClass)); const marker = classMatch?.index ?? -1; const start = markup.lastIndexOf("<", marker); const end = markup.indexOf(">", marker); if (marker < 0 || start < 0 || end < 0) throw new Error(`Packed Chat has no complete ${stableClass} tag.`); return markup.slice(start, end + 1); };',
      'const chatClasses = (markup, stableClass) => { const classes = /class="([^"]+)"/u.exec(chatTag(markup, stableClass))?.[1]?.split(" ").filter(Boolean); if (classes === undefined || classes[0] !== stableClass) throw new Error(`Packed Chat lost its stable-first ${stableClass} class contract.`); return classes; };',
      'const chatMessageMarkup = renderToStaticMarkup(createElement(ChatMessage, { actions: createElement("button", { type: "button" }, "Copy"), avatar: createElement("span", null, "A"), className: "consumer-chat-message", meta: "Now", name: "Assistant", role: "assistant" }, createElement("p", null, "Ready to help")));',
      'const chatMessageRootTag = chatTag(chatMessageMarkup, "hraness-design-chat-message");',
      'const chatMessageRootClasses = chatClasses(chatMessageMarkup, "hraness-design-chat-message");',
      'if (chatMessageRootClasses.at(-1) !== "consumer-chat-message" || !chatMessageRootTag.includes(`data-role="assistant"`) || chatMessageRootTag.includes("style=") || !chatMessageMarkup.includes("hraness-design-chat-message__avatar") || !chatMessageMarkup.includes(">Assistant</strong>") || !chatMessageMarkup.includes(">Now</span>") || !chatMessageMarkup.includes(">Ready to help</p>") || !chatMessageMarkup.includes(">Copy</button>")) throw new Error("Packed ChatMessage lost stable, caller-last, role, slot, or extracted presentation semantics.");',
      'const chat = [];',
      'for (const [hook, atomicCount] of [["hraness-design-chat-message", 3], ["hraness-design-chat-message__content", 1], ["hraness-design-chat-message__header", 7], ["hraness-design-chat-message__body", 1], ["hraness-design-chat-message__actions", 4]]) { const tag = chatTag(chatMessageMarkup, hook); const generated = chatClasses(chatMessageMarkup, hook).filter((name) => name !== hook && name !== "consumer-chat-message" && stylexCss.includes(`.${name}`)); if (generated.length !== atomicCount || tag.includes("style=")) throw new Error(`Packed ChatMessage ${hook} exposes ${String(generated.length)} atoms instead of ${String(atomicCount)} or emitted inline presentation.`); chat.push(...generated); }',
      'const chatComposerMarkup = renderToStaticMarkup(createElement(ChatComposer, { "aria-label": "Reply composer", "data-consumer-chat-composer": "ready", className: "consumer-chat-composer", id: "consumer-chat-composer", method: "post", onSubmit() {}, onValueChange() {}, placeholder: "Reply", sendLabel: "Reply", value: "Draft" }));',
      'const chatComposerTag = chatTag(chatComposerMarkup, "hraness-design-chat-composer");',
      'const chatComposerClasses = chatClasses(chatComposerMarkup, "hraness-design-chat-composer");',
      'const chatComposerAtomic = chatComposerClasses.filter((name) => name !== "hraness-design-chat-composer" && name !== "consumer-chat-composer" && stylexCss.includes(`.${name}`));',
      'if (chatComposerClasses.at(-1) !== "consumer-chat-composer" || chatComposerAtomic.length !== 5 || !chatComposerTag.includes(`aria-label="Reply composer"`) || !chatComposerTag.includes(`data-consumer-chat-composer="ready"`) || !chatComposerTag.includes(`id="consumer-chat-composer"`) || !chatComposerTag.includes(`method="post"`) || chatComposerTag.includes("style=") || !chatComposerMarkup.includes("hraness-design-chat-composer__field") || !chatComposerMarkup.includes("hraness-design-chat-composer__send") || !chatComposerMarkup.includes(`type="submit"`) || !chatComposerMarkup.includes(`data-slot="button-label">Reply</span>`)) throw new Error("Packed ChatComposer lost stable, atomic, caller-last, native form, field, send, or extracted presentation semantics.");',
      'chat.push(...chatComposerAtomic);',
      'const nativeChatComposerMarkup = renderToStaticMarkup(createElement(ChatComposer, { action: "/reply", "aria-label": "Native reply composer", onSubmit() {}, onValueChange() {}, style: { color: "red" }, title: "Native form", value: "Native draft" }));',
      'const nativeChatComposerTag = chatTag(nativeChatComposerMarkup, "hraness-design-chat-composer");',
      'if (!nativeChatComposerTag.includes(`action="/reply"`) || !nativeChatComposerTag.includes(`aria-label="Native reply composer"`) || !nativeChatComposerTag.includes(`style="color:red"`) || !nativeChatComposerTag.includes(`title="Native form"`)) throw new Error("Packed ChatComposer lost caller-owned native form attributes or style.");',
      'await writeFile(new URL("./notice-classes.json", import.meta.url), JSON.stringify({ animatedRailStage: [...new Set(animatedRailStageAtomic)], aside, chat: [...new Set(chat)], dither, fader: [...new Set(fader)], icon, layout: [...new Set(layout)], playback: [...new Set(playback)], playbackGlyph, strong, uiPriority5 }));',
      "",
    ].join("\n"),
  );
  await run(["node", "./stylex-notice.mjs"], consumer);

  for (const compilerOnlyPackage of [
    "@babel/core",
    "@stylexjs/babel-plugin",
    "lightningcss",
  ]) {
    if (await Bun.file(join(
      consumer,
      "node_modules",
      ...compilerOnlyPackage.split("/"),
      "package.json",
    )).exists()) {
      throw new Error(
        `Standalone consumer unexpectedly installed compiler-only peer ${compilerOnlyPackage}.`,
      );
    }
  }

  const installed = join(consumer, "node_modules/@hraness/design-kit");
  for (const path of [
    "dist/browser/index.js",
    "dist/fonts/nebula-sans/social-fonts.generated.js",
    "dist/stylex.css",
    "dist/stylex-manifest.json",
    "src/appearance-menu.css",
    "src/compiler-components.css",
    "src/compiler-foundation.css",
    "src/compiler-palettes.css",
    "src/compiler-tokens.css",
    "src/components.css",
    "src/product-marketing-foundation.css",
    "src/styles.css",
    "src/browser/artifact-share.ts",
    "src/react/animated-rail-stage.stylex.ts",
    "src/react/app-shell.stylex.ts",
    "src/palettes.ts",
    "src/palette-tokens.stylex.ts",
    "src/palette-themes.ts",
    "src/palette-color.ts",
    "src/palette-appearance.ts",
    "src/palette-bridge.css",
    "src/palettes.css",
    "src/browser/design-palette.ts",
    "src/react/design-palette.tsx",
    "src/react/design-palette.stylex.ts",
    "src/react/charts.stylex.ts",
    "src/react/chat.stylex.ts",
    "src/react/effects.stylex.ts",
    "src/react/foil-card-math.ts",
    "src/react/foil-card-surface.tsx",
    "src/react/foil-card-surface.stylex.ts",
    "src/react/fader.stylex.ts",
    "src/react/jelly-surface.stylex.ts",
    "src/react/playback-transport.stylex.ts",
    "src/react/production-data-preview-notice.stylex.ts",
    "src/react/product-marketing.stylex.ts",
    "src/react/navigation-rail.stylex.ts",
    "src/react/route-state.stylex.ts",
    "src/react/surfaces.stylex.ts",
    "src/react/theme.stylex.ts",
    "src/fonts/geist-mono/GeistMono[wght].woff2",
    "src/fonts/nebula-sans/LICENSE.txt",
    "src/fonts/nebula-sans/NebulaSans-Black.woff2",
    "src/fonts/nebula-sans/NebulaSans-BlackItalic.woff2",
    "src/fonts/nebula-sans/NebulaSans-Bold.woff2",
    "src/fonts/nebula-sans/NebulaSans-BoldItalic.woff2",
    "src/fonts/nebula-sans/NebulaSans-Bold.otf",
    "src/fonts/nebula-sans/NebulaSans-Book.woff2",
    "src/fonts/nebula-sans/NebulaSans-BookItalic.woff2",
    "src/fonts/nebula-sans/NebulaSans-Book.otf",
    "src/fonts/nebula-sans/NebulaSans-Light.woff2",
    "src/fonts/nebula-sans/NebulaSans-LightItalic.woff2",
    "src/fonts/nebula-sans/NebulaSans-Medium.woff2",
    "src/fonts/nebula-sans/NebulaSans-MediumItalic.woff2",
    "src/fonts/nebula-sans/NebulaSans-Semibold.woff2",
    "src/fonts/nebula-sans/NebulaSans-SemiboldItalic.woff2",
    "src/fonts/nebula-sans/PROVENANCE.md",
    "src/fonts/nebula-sans/social-fonts.generated.ts",
    "vendor/evilcharts/LICENSE",
    "vendor/jelly-ui/LICENSE",
  ]) {
    if (!(await Bun.file(join(installed, path)).exists())) {
      throw new Error(`Packed package is missing ${path}`);
    }
  }
  const installedManifestPath = join(installed, "dist/stylex-manifest.json");
  const installedManifest = await readStylexPackageManifest(installedManifestPath, installed);
  requireDesignKitManifest(installedManifest, packedRuntimePaths, "Installed StyleX manifest");
  assert.deepEqual(
    installedManifest,
    packedManifest,
    "Installed and archive-inspected design-kit manifests must be identical.",
  );
  const installedUi = join(consumer, "node_modules/@hraness/ui");
  const installedUiManifestPath = join(installedUi, "dist/stylex-manifest.json");
  const installedUiManifest = await readStylexPackageManifest(
    installedUiManifestPath,
    installedUi,
  );
  assert.deepEqual(
    installedUiManifest.package,
    { name: "@hraness/ui", version: "0.5.4" },
    "Compiler consumer must install the immutable UI v0.5.4 manifest.",
  );
  assert.notEqual(
    installedUiManifest.standaloneSerializer.prefix,
    installedManifest.standaloneSerializer.prefix,
    "UI and design-kit must own distinct standalone StyleX prefixes.",
  );
  assert.deepEqual(
    installedUiManifest.standaloneSerializer,
    {
      before: [
        "components.hraness-ui.legacy.base",
        "components.hraness-ui.legacy",
      ],
      prefix: "components.hraness-ui",
    },
    "UI v0.5.4 standalone serialization contract changed.",
  );
  assert.equal(
    installedUiManifest.compilerSha256,
    installedManifest.compilerSha256,
    "UI and design-kit manifests must share one public compiler contract.",
  );
  assert.equal(installedUiManifest.compilerSha256, compilerSha256);
  assert.equal(
    (await artifactForFile(installedUi, "dist/stylex-manifest.json")).sha256,
    "cf7598b3f9e4f39842520c1a9c3d6327c6df53e787c98db17f705ee233a46a94",
    "Installed UI manifest does not match the immutable v0.5.4 release.",
  );
  assert.equal(
    (await artifactForFile(installedUi, "src/compiler-foundation.css")).sha256,
    "2b9b3f7d23856b10357599793c649a3af41f83ac7d58f7a1ffae91a03f322e4e",
    "Installed UI compiler foundation does not match the immutable v0.5.4 release.",
  );
  assert.equal(
    (await artifactForFile(installedUi, "dist/stylex.css")).sha256,
    "10fefdbe5809b66c863ed08cedac55222b1788f1c444e072e1b08c82a88fbc74",
    "Installed UI standalone StyleX CSS does not match the immutable v0.5.4 release.",
  );
  assert.deepEqual(
    stylexUnionPolicy,
    {
      foundationOrder: "all-package-foundations-before-union",
      kind: "hraness-stylex-rule-union-policy",
      legacyLayerOrder: "canonical-package-prefix-then-declared",
      policyVersion: "hraness-stylex-rule-union-v1",
      prefix: "components.hraness-stylex",
      priorityLayers: "complete-finite",
      ruleUnion: "dedupe-identical-reject-conflicts",
      schemaVersion: 1,
    },
    "Installed UI union policy changed.",
  );
  assert.equal(
    stylexUnionPolicySha256,
    "1ceced1f1bf6359413ca6425ede61e1fdae272b897f4455c2347e2431d75caa1",
    "Installed UI union policy digest changed.",
  );
  assert.equal(STYLEX_GENERATION_SCHEMA_VERSION, 2);
  assert.equal(STYLEX_COMPLETE_RECORD_SCHEMA_VERSION, 2);
  const packedFiles = await filesBelow(installed);
  if (packedFiles.some((path) => path.includes(".test."))) {
    throw new Error("Packed package contains test sources");
  }
  const clientBundle = await Bun.file(
    join(installed, "dist", "react", "index.js"),
  ).text();
  const clientDirectives = clientBundle.match(/^"use client";\r?$/gmu) ?? [];
  if (
    !clientBundle.startsWith('"use client";\n')
    || clientDirectives.length !== 1
  ) {
    throw new Error(
      "Packed React entry must have one leading use-client directive and no interior directives.",
    );
  }
  const packedJavaScript = (await Promise.all(
    packedFiles
      .filter((path) => path.endsWith(".js"))
      .map(async (path) => Bun.file(path).text()),
  )).join("\n");
  if (/stylex\.create|stylexCreate|Unexpected ["']stylex\.create/u.test(packedJavaScript)) {
    throw new Error("Packed JavaScript contains an uncompiled StyleX authoring call.");
  }
  if (/stylex-inject|stylexInject|data-stylex|stylesheet-group/u.test(packedJavaScript)) {
    throw new Error("Packed JavaScript contains StyleX runtime injection.");
  }
  const browserBundle = await Bun.file(
    join(installed, "dist", "browser", "index.js"),
  ).text();
  if (!browserBundle.includes("installAppearanceMenus")) {
    throw new Error("Packed browser entry does not expose the appearance installer.");
  }
  if (
    !browserBundle.includes("buildXShareIntentUrl")
    || !browserBundle.includes("canShareFileNatively")
    || !browserBundle.includes("shareFileNatively")
  ) {
    throw new Error("Packed browser entry does not expose artifact sharing helpers.");
  }
  if (
    /(?:from\s*|import\s*)["'](?:next-themes|react(?:-dom|-aria-components)?)(?:\/[^"']*)?["']/u
      .test(browserBundle)
  ) {
    throw new Error("Packed browser entry imports a React runtime dependency.");
  }

  await writeFile(
    join(consumer, "index.ts"),
    [
      'import * as core from "@hraness/design-kit";',
      'import * as browser from "@hraness/design-kit/browser";',
      'import * as react from "@hraness/design-kit/react";',
      'import type { AnimatedRailStageProps, ChatComposerProps, ChatMessageProps, FaderProps, PlaybackTransportProps, RailItemProps } from "@hraness/design-kit/react";',
      'import * as serverReact from "@hraness/design-kit/react/server";',
      'import * as stylex from "@stylexjs/stylex";',
      'const callbacks = { onPlay() {}, onStop() {}, status: "idle" } as const;',
      'const railItemStyles = stylex.create({ root: { color: "rebeccapurple" } });',
      'const typedRailItem: RailItemProps = { href: "/library", label: "Library", xstyle: railItemStyles.root };',
      '// @ts-expect-error RailItem xstyle rejects uncompiled raw style objects.',
      'const rawRailItem: RailItemProps = { href: "/library", label: "Library", xstyle: { color: "rebeccapurple" } };',
      'const animatedRailStage: AnimatedRailStageProps = { children: "Detail", className: "consumer-stage", stageKey: "/workspace/detail" };',
      '// @ts-expect-error AnimatedRailStage intentionally exposes no public xstyle seam.',
      'const animatedRailStageWithXstyle: AnimatedRailStageProps = { children: "Detail", stageKey: "/workspace/detail", xstyle: {} };',
      'const chatMessage: ChatMessageProps = { children: "Ready", className: "consumer-chat-message", role: "assistant" };',
      '// @ts-expect-error ChatMessage intentionally exposes no public xstyle seam.',
      'const chatMessageWithXstyle: ChatMessageProps = { children: "Ready", role: "assistant", xstyle: {} };',
      'const chatComposer: ChatComposerProps = { action: "/reply", "aria-label": "Reply composer", className: "consumer-chat-composer", method: "post", onSubmit() {}, onValueChange() {}, style: { color: "red" }, value: "Draft" };',
      '// @ts-expect-error ChatComposer intentionally exposes no public xstyle seam.',
      'const chatComposerWithXstyle: ChatComposerProps = { onSubmit() {}, onValueChange() {}, value: "Draft", xstyle: {} };',
      'const playbackByLabel: PlaybackTransportProps = { "aria-label": "Preview", buttonAriaKeyShortcuts: "Space", buttonId: "preview", buttonRef: { current: null }, className: "consumer", ...callbacks };',
      'const playbackByLabelledby: PlaybackTransportProps = { "aria-labelledby": "preview-label", ...callbacks };',
      '// @ts-expect-error PlaybackTransport requires exactly one accessible naming strategy.',
      'const playbackWithoutName: PlaybackTransportProps = { ...callbacks };',
      '// @ts-expect-error PlaybackTransport rejects two accessible naming strategies.',
      'const playbackWithBothNames: PlaybackTransportProps = { "aria-label": "Preview", "aria-labelledby": "preview-label", ...callbacks };',
      '// @ts-expect-error PlaybackTransport intentionally exposes no public xstyle seam.',
      'const playbackWithXstyle: PlaybackTransportProps = { "aria-label": "Preview", ...callbacks, xstyle: {} };',
      'const defaultFader: FaderProps = { className: "consumer-fader", label: "Gain", value: 32 };',
      'const compactHorizontalFader: FaderProps = { density: "compact", label: "Pan", labelAccessory: "Reset", orientation: "horizontal", showLabel: true, showOutput: true, value: 64 };',
      '// @ts-expect-error Fader intentionally exposes no public xstyle seam.',
      'const faderWithXstyle: FaderProps = { label: "Gain", xstyle: {} };',
      '// @ts-expect-error Fader owns its children structure.',
      'const faderWithChildren: FaderProps = { children: "Unsupported", label: "Gain" };',
      "void [animatedRailStage, animatedRailStageWithXstyle, browser, chatComposer, chatComposerWithXstyle, chatMessage, chatMessageWithXstyle, compactHorizontalFader, core, defaultFader, faderWithChildren, faderWithXstyle, playbackByLabel, playbackByLabelledby, playbackWithBothNames, playbackWithoutName, playbackWithXstyle, rawRailItem, react, serverReact, stylex, typedRailItem];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(consumer, `tsconfig.${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          jsx: "react-jsx",
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["index.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.${mode.toLowerCase()}.json`,
    ], consumer);
  }

  await run([
    process.execPath,
    "add",
    "vite@8.1.5",
    "--ignore-scripts",
  ], consumer);
  await mkdir(join(consumer, "src"));
  await writeFile(
    join(consumer, "index.html"),
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  );
  await writeFile(
    join(consumer, "src/main.tsx"),
    [
      'import { createElement } from "react";',
      'import { Fragment } from "react";',
      'import { createRoot } from "react-dom/client";',
      'import { Search01Icon } from "@hugeicons/core-free-icons";',
      'import { Icon } from "@hraness/ui";',
      'import "@hraness/design-kit/styles.css";',
      'import { AnimatedRailStage, BottomBar, ChatComposer, ChatMessage, DitherSurface, DockedFooter, Fader, JellySurface, PageCanvas, PlaybackTransport, ProductionDataPreviewNotice, TopBar } from "@hraness/design-kit/react";',
      'const target = document.getElementById("root");',
      'if (target === null) throw new Error("Missing root");',
      'createRoot(target).render(createElement(Fragment, null, createElement(ProductionDataPreviewNotice, { surfaceOrigin: "https://preview.example.test" }), createElement(AnimatedRailStage, { stageKey: "vite-aggregate" }, "Stage"), createElement(ChatMessage, { actions: "Copy", avatar: "A", className: "consumer-chat-message", meta: "Now", name: "Assistant", role: "assistant" }, "Message"), createElement(ChatComposer, { "aria-label": "Aggregate composer", className: "consumer-chat-composer", onSubmit() {}, onValueChange() {}, value: "Draft" }), createElement(DitherSurface, { density: "coarse" }, "Dither"), createElement(TopBar, { position: "sticky", surface: "glass", title: "Top" }, "Content"), createElement(BottomBar, null, "Bottom"), createElement(PageCanvas, { as: "div", inset: "none", size: "wide" }, "Page"), createElement(DockedFooter, { position: "absolute", density: "compact" }, "Docked"), createElement(PlaybackTransport, { "aria-label": "Preview transport", onPlay() {}, onStop() {}, status: "pending" }), createElement(Fader, { className: "consumer-fader-default", label: "Gain", maxValue: 100, minValue: 0, orientation: "vertical", showLabel: true, showOutput: true, value: 32 }), createElement(Fader, { className: "consumer-fader-compact", density: "compact", label: "Pan", labelAccessory: createElement("span", null, "Reset"), maxValue: 100, minValue: 0, orientation: "horizontal", showLabel: true, showOutput: true, value: 64 }), createElement(Icon, { icon: Search01Icon }), createElement(JellySurface, { interaction: "press" }, createElement("button", { type: "button" }, "Run"))));',
      "",
    ].join("\n"),
  );
  await run([process.execPath, "x", "vite", "build"], consumer);
  const builtFiles = await filesBelow(join(consumer, "dist"));
  if (!builtFiles.some((path) => path.endsWith(".css"))) {
    throw new Error("Packed Vite consumer emitted no design stylesheet.");
  }
  if (builtFiles.filter((path) => path.endsWith(".js")).length < 2) {
    throw new Error("Packed Vite consumer did not preserve the dynamic Jelly chunk.");
  }
  const builtCss = (await Promise.all(
    builtFiles
      .filter((path) => path.endsWith(".css"))
      .map(async (path) => Bun.file(path).text()),
  )).join("\n");
  const noticeClasses = await Bun.file(join(consumer, "notice-classes.json")).json() as {
    readonly animatedRailStage: readonly string[];
    readonly aside: readonly string[];
    readonly chat: readonly string[];
    readonly dither: readonly string[];
    readonly fader: readonly string[];
    readonly icon: readonly string[];
    readonly layout: readonly string[];
    readonly playback: readonly string[];
    readonly playbackGlyph: readonly string[];
    readonly strong: readonly string[];
    readonly uiPriority5: readonly string[];
  };
  const generatedNoticeClasses = [...noticeClasses.aside, ...noticeClasses.strong]
    .filter((name) => name !== "hraness-design-production-data-preview-notice");
  if (generatedNoticeClasses.length === 0) {
    throw new Error("Packed notice exposes no generated StyleX classes to the Vite oracle.");
  }
  requireAtomicSelectorsPresent(builtCss, generatedNoticeClasses, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(
    builtCss,
    noticeClasses.animatedRailStage,
    "Packed aggregate Vite CSS",
  );
  requireAtomicSelectorsPresent(builtCss, noticeClasses.dither, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.chat, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.fader, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.icon, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.layout, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.playback, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.playbackGlyph, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.uiPriority5, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, packedShellClasses, "Packed aggregate Vite CSS");
  for (const layerName of [
    "components.hraness-ui.priority2",
    "components.hraness-ui.priority3",
    "components.hraness-ui.priority4",
    "components.hraness-ui.priority5",
    "components.hraness-ui.priority6",
    "components.hraness-ui.priority7",
    "components.hraness-design-kit.priority2",
    "components.hraness-design-kit.priority3",
    "components.hraness-design-kit.priority4",
    "components.hraness-design-kit.priority5",
    "components.hraness-design-kit.priority6",
    "components.hraness-design-kit.priority7",
    "components.hraness-design-kit.priority8",
  ]) {
    requireLayerBlockExactlyOnce(builtCss, layerName, "Packed aggregate Vite CSS");
  }
  requireNoticePresentation(builtCss, "Packed aggregate Vite CSS");
  requireAnimatedRailStagePresentation(builtCss, "Packed aggregate Vite CSS");
  requireDitherPresentation(builtCss, "Packed aggregate Vite CSS");
  requireLayoutSurfacePresentation(
    builtCss,
    packedJavaScript,
    "Packed aggregate Vite CSS",
  );
  requirePlaybackTransportPresentation(builtCss, "Packed aggregate Vite CSS");
  requireFaderPresentation(builtCss, "Packed aggregate Vite CSS");
  requireChatPresentation(
    builtCss,
    packedReactJavaScript,
    "Packed aggregate Vite CSS",
  );
  requireShellNavigationRouteThemePresentation(
    builtCss,
    packedReactJavaScript,
    "Packed aggregate Vite CSS",
  );
  if (migratedAnimatedRailStageLegacySelector.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained a migrated legacy AnimatedRailStage recipe.");
  }
  if (/\.hraness-design-production-data-preview-notice\s*(?:\{|,)/u.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained the migrated legacy notice recipe.");
  }
  if (/\.hraness-design-dither-surface\s*(?:\{|\[|,)/u.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained the migrated legacy DitherSurface recipe.");
  }
  if (migratedLayoutLegacySelector.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained a migrated legacy layout-surface recipe.");
  }
  if (migratedPlaybackLegacySelector.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained a migrated legacy PlaybackTransport recipe.");
  }
  if (migratedFaderLegacySelector.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained a migrated legacy Fader recipe.");
  }
  if (migratedChatLegacySelector.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained a migrated legacy Chat recipe.");
  }
  if (migratedShellNavigationRouteLegacySelector.test(builtCss)
    || migratedThemeRootLegacySelector.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained a migrated shell, navigation, route, or theme recipe.");
  }

  await writeFile(
    join(consumer, "src/main.tsx"),
    [
      'import { createElement } from "react";',
      'import { createRoot } from "react-dom/client";',
      'import "@hraness/design-kit/components.css";',
      'import { AnimatedRailStage, BottomBar, ChatComposer, ChatMessage, DitherSurface, DockedFooter, Fader, PageCanvas, PlaybackTransport, ProductionDataPreviewNotice, TopBar } from "@hraness/design-kit/react";',
      'const target = document.getElementById("root");',
      'if (target === null) throw new Error("Missing root");',
      'createRoot(target).render(createElement("div", null, createElement(ProductionDataPreviewNotice, { surfaceOrigin: "https://preview.example.test" }), createElement(AnimatedRailStage, { stageKey: "vite-narrow" }, "Stage"), createElement(ChatMessage, { actions: "Copy", avatar: "A", className: "consumer-chat-message", meta: "Now", name: "Assistant", role: "assistant" }, "Message"), createElement(ChatComposer, { "aria-label": "Narrow composer", className: "consumer-chat-composer", onSubmit() {}, onValueChange() {}, value: "Draft" }), createElement(DitherSurface, { density: "coarse" }, "Dither"), createElement(TopBar, { position: "sticky", surface: "glass", title: "Top" }, "Content"), createElement(BottomBar, null, "Bottom"), createElement(PageCanvas, { as: "div", inset: "none", size: "wide" }, "Page"), createElement(DockedFooter, { position: "absolute", density: "compact" }, "Docked"), createElement(PlaybackTransport, { "aria-label": "Preview transport", onPlay() {}, onStop() {}, status: "pending" }), createElement(Fader, { className: "consumer-fader-default", label: "Gain", maxValue: 100, minValue: 0, orientation: "vertical", showLabel: true, showOutput: true, value: 32 }), createElement(Fader, { className: "consumer-fader-compact", density: "compact", label: "Pan", labelAccessory: createElement("span", null, "Reset"), maxValue: 100, minValue: 0, orientation: "horizontal", showLabel: true, showOutput: true, value: 64 })));',
      "",
    ].join("\n"),
  );
  await run([
    process.execPath,
    "x",
    "vite",
    "build",
    "--outDir",
    "dist-components",
    "--emptyOutDir",
  ], consumer);
  const narrowBuiltFiles = await filesBelow(join(consumer, "dist-components"));
  const narrowBuiltCss = (await Promise.all(
    narrowBuiltFiles
      .filter((path) => path.endsWith(".css"))
      .map(async (path) => Bun.file(path).text()),
  )).join("\n");
  if (narrowBuiltCss.length === 0) {
    throw new Error("Packed narrow components.css Vite consumer emitted no stylesheet.");
  }
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    generatedNoticeClasses,
    "Packed narrow components.css Vite CSS",
  );
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    noticeClasses.animatedRailStage,
    "Packed narrow components.css Vite CSS",
  );
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    noticeClasses.dither,
    "Packed narrow components.css Vite CSS",
  );
  requireAtomicSelectorsPresent(
    narrowBuiltCss,
    noticeClasses.chat,
    "Packed narrow components.css Vite CSS",
  );
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    noticeClasses.fader,
    "Packed narrow components.css Vite CSS",
  );
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    noticeClasses.layout,
    "Packed narrow components.css Vite CSS",
  );
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    noticeClasses.playback,
    "Packed narrow components.css Vite CSS",
  );
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    noticeClasses.playbackGlyph,
    "Packed narrow components.css Vite CSS",
  );
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    packedShellClasses,
    "Packed narrow components.css Vite CSS",
  );
  requireNoticePresentation(narrowBuiltCss, "Packed narrow components.css Vite CSS");
  requireAnimatedRailStagePresentation(
    narrowBuiltCss,
    "Packed narrow components.css Vite CSS",
  );
  requireDitherPresentation(narrowBuiltCss, "Packed narrow components.css Vite CSS");
  requireLayoutSurfacePresentation(
    narrowBuiltCss,
    packedJavaScript,
    "Packed narrow components.css Vite CSS",
  );
  requirePlaybackTransportPresentation(narrowBuiltCss, "Packed narrow components.css Vite CSS");
  requireFaderPresentation(narrowBuiltCss, "Packed narrow components.css Vite CSS");
  requireChatPresentation(
    narrowBuiltCss,
    packedReactJavaScript,
    "Packed narrow components.css Vite CSS",
  );
  requireShellNavigationRouteThemePresentation(
    narrowBuiltCss,
    packedReactJavaScript,
    "Packed narrow components.css Vite CSS",
  );
  if (migratedAnimatedRailStageLegacySelector.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained a migrated legacy AnimatedRailStage recipe.");
  }
  if (/\.hraness-design-production-data-preview-notice\s*(?:\{|,)/u.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained the migrated legacy notice recipe.");
  }
  if (/\.hraness-design-dither-surface\s*(?:\{|\[|,)/u.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained the migrated legacy DitherSurface recipe.");
  }
  if (migratedLayoutLegacySelector.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained a migrated legacy layout-surface recipe.");
  }
  if (migratedPlaybackLegacySelector.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained a migrated legacy PlaybackTransport recipe.");
  }
  if (migratedFaderLegacySelector.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained a migrated legacy Fader recipe.");
  }
  if (migratedChatLegacySelector.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained a migrated legacy Chat recipe.");
  }
  if (migratedShellNavigationRouteLegacySelector.test(narrowBuiltCss)
    || migratedThemeRootLegacySelector.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained a migrated shell, navigation, route, or theme recipe.");
  }

  await run([
    process.execPath,
    "add",
    ...Object.entries(publicCollectorToolchain).map(
      ([dependency, version]) => `${dependency}@${version}`,
    ),
    "--ignore-scripts",
  ], consumer);
  for (const [dependency, version] of Object.entries(publicCollectorToolchain)) {
    const manifest = record(
      await Bun.file(join(
        consumer,
        "node_modules",
        ...dependency.split("/"),
        "package.json",
      )).json() as unknown,
      `${dependency} package.json`,
    );
    assert.equal(
      manifest.version,
      version,
      `Compiler consumer resolved ${dependency} to the wrong version.`,
    );
  }
  for (const retiredCompilerPackage of ["@stylexjs/unplugin", "unplugin"]) {
    if (await Bun.file(join(
      consumer,
      "node_modules",
      ...retiredCompilerPackage.split("/"),
      "package.json",
    )).exists()) {
      throw new Error(
        `Compiler consumer installed retired private adapter ${retiredCompilerPackage}.`,
      );
    }
  }

  await writeFile(
    join(consumer, "package-author.ts"),
    [
      'import * as stylex from "@stylexjs/stylex";',
      'import type { RailItemProps } from "@hraness/design-kit/react";',
      'import { STYLEX_COMPLETE_RECORD_SCHEMA_VERSION, STYLEX_GENERATION_SCHEMA_VERSION, STYLEX_PACKAGE_MANIFEST_SCHEMA_VERSION, auditCssWithoutStylexUnionNamespace, compilerContract, createStylexGeneration, createStylexTransformCollector, finalizeStylexGeneration, prepareStylexProducedTemplate, readStylexPackageManifest, sealStylexProducedTemplate, serializeStylexPackageRules, serializeStylexRuleUnionV1, stylexUnionPolicy, stylexUnionPolicySha256, type StylexCompleteRecordV2, type StylexGenerationPlanV2, type StylexPackageManifestV1, type StylexStandaloneSerializerV1 } from "@hraness/ui/stylex-build";',
      'import { collectBunStylexGraph } from "@hraness/ui/stylex-build/bun";',
      'const styles = stylex.create({ railItem: { color: "rebeccapurple" } });',
      'const typedRailItem: RailItemProps = { href: "/package-author", label: "Package author", xstyle: styles.railItem };',
      '// @ts-expect-error Packed RailItem declarations reject uncompiled raw style objects.',
      'const rawRailItem: RailItemProps = { href: "/package-author", label: "Package author", xstyle: { color: "rebeccapurple" } };',
      'const serializer = { before: ["components.fixture.legacy"], prefix: "components.fixture" } as const satisfies StylexStandaloneSerializerV1;',
      'const schemaVersion: StylexPackageManifestV1["schemaVersion"] = STYLEX_PACKAGE_MANIFEST_SCHEMA_VERSION;',
      'const generationSchemaVersion: StylexGenerationPlanV2["schemaVersion"] = STYLEX_GENERATION_SCHEMA_VERSION;',
      'const completeSchemaVersion: StylexCompleteRecordV2["schemaVersion"] = STYLEX_COMPLETE_RECORD_SCHEMA_VERSION;',
      'const generationPolicyDigest: StylexGenerationPlanV2["unionPolicySha256"] = stylexUnionPolicySha256;',
      'const completePolicyDigest: StylexCompleteRecordV2["unionPolicySha256"] = stylexUnionPolicySha256;',
      'const collector = createStylexTransformCollector(process.cwd());',
      'const css: string = serializeStylexPackageRules([], serializer);',
      'const unionCss: string = serializeStylexRuleUnionV1([], [serializer]);',
      'auditCssWithoutStylexUnionNamespace("@layer components.fixture.legacy;", "typed package-author foundation");',
      'if (stylexUnionPolicy.prefix !== "components.hraness-stylex") throw new Error("StyleX union policy prefix changed");',
      'void [collectBunStylexGraph, collector, compilerContract, completePolicyDigest, completeSchemaVersion, createStylexGeneration, css, finalizeStylexGeneration, generationPolicyDigest, generationSchemaVersion, prepareStylexProducedTemplate, rawRailItem, readStylexPackageManifest, schemaVersion, sealStylexProducedTemplate, typedRailItem, unionCss];',
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(consumer, `tsconfig.package-author-${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          jsx: "react-jsx",
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
          types: ["bun"],
        },
        include: ["package-author.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.package-author-${mode.toLowerCase()}.json`,
    ], consumer);
  }

  await writeFile(
    join(consumer, "final-app.tsx"),
    [
      'import * as stylex from "@stylexjs/stylex";',
      'import { Link } from "@hraness/ui";',
      'import { RailItem } from "@hraness/design-kit/react";',
      'import { createElement } from "react";',
      'const styles = stylex.create({ root: { display: "grid", gap: "1rem" }, railItem: { color: "rebeccapurple" } });',
      'export function FinalApp() { const presentation = stylex.props(styles.root); return createElement("main", { className: presentation.className, "data-final-app": "ready" }, createElement(Link, { href: "/ui" }, "UI"), createElement(RailItem, { href: "/design-kit", label: "Design kit", xstyle: styles.railItem })); }',
      "",
    ].join("\n"),
  );
  await writeFile(
    join(consumer, "final-client.tsx"),
    [
      'import "@hraness/design-kit/compiler-foundation.css";',
      'import { createElement } from "react";',
      'import { createRoot } from "react-dom/client";',
      'import { FinalApp } from "./final-app.js";',
      'const target = document.getElementById("root");',
      'if (target === null) throw new Error("Final application root is missing");',
      'createRoot(target).render(createElement(FinalApp));',
      "",
    ].join("\n"),
  );
  await writeFile(
    join(consumer, "final-render.tsx"),
    [
      'import { writeFile } from "node:fs/promises";',
      'import { createElement } from "react";',
      'import { renderToString } from "react-dom/server";',
      'import { FinalApp } from "./final-app.js";',
      'const outputPath = process.argv[2];',
      'const clientHref = process.argv[3];',
      'const foundationHref = process.argv[4];',
      'if (outputPath === undefined) throw new Error("Final application output path is required");',
      'if (clientHref === undefined || !clientHref.startsWith("/graphs/client/")) throw new Error("Final application client href is invalid");',
      'if (foundationHref === undefined || !foundationHref.startsWith("/graphs/client/")) throw new Error("Final application foundation href is invalid");',
      `const html = '<!doctype html><html><head><link rel="stylesheet" href="' + foundationHref + '"><link rel="stylesheet" href="${STYLEX_TEMPLATE_CSS_PLACEHOLDER}"></head><body><div id="root">' + renderToString(createElement(FinalApp)) + '</div><script type="module" src="' + clientHref + '"></script></body></html>';`,
      'await writeFile(outputPath, html, { flag: "wx" });',
      "",
    ].join("\n"),
  );
  const compilerOutputDirectory = join(consumer, "stylex-generations");
  await mkdir(compilerOutputDirectory);
  const compilerManifestPaths = [
    logicalPath(consumer, installedUiManifestPath, "UI manifest locator"),
    logicalPath(consumer, installedManifestPath, "design-kit manifest locator"),
  ];
  const finalGeneration = await createStylexGeneration({
    expectedGraphs: [
      {
        adapter: "bun",
        entrypoints: ["final-client.tsx"],
        id: "client",
        kind: "client",
      },
      {
        adapter: "bun",
        entrypoints: ["final-render.tsx"],
        id: "ssr",
        kind: "ssr",
      },
    ],
    finalCssPath: "stylex.css",
    generationId: "mixed-final-app",
    outputDirectory: compilerOutputDirectory,
    packageManifests: compilerManifestPaths,
    rootDirectory: consumer,
    templates: [{
      cssHref: "/stylex.css",
      graphId: "ssr",
      outputPath: "index.html",
      sourcePath: "index.html",
      stylesheetGraphId: "client",
    }],
  });
  const clientReceipt = await collectBunStylexGraph({
    build: { minify: true },
    generation: finalGeneration,
    graphId: "client",
    rootDirectory: consumer,
  });
  const clientEntries = clientReceipt.outputs.filter(
    ({ path }) => /(?:^|\/)entries\/final-client-[^/]+\.js$/u.test(path),
  );
  const foundationOutputs = clientReceipt.outputs.filter(({ path }) => path.endsWith(".css"));
  assert.equal(clientEntries.length, 1, "Final client graph must emit one client entry.");
  assert.equal(
    foundationOutputs.length,
    1,
    "Final client graph must emit one combined compiler-foundation stylesheet.",
  );
  const clientEntry = clientEntries[0];
  const foundationOutput = foundationOutputs[0];
  assert.ok(clientEntry !== undefined && foundationOutput !== undefined);
  for (const manifest of [installedUiManifest, installedManifest]) {
    const expectedFoundation = manifest.stylesheets.find(
      ({ path }) => path === manifest.compilerFoundation,
    );
    assert.ok(expectedFoundation !== undefined);
    const suffix = `${manifest.package.name}/${manifest.compilerFoundation}`;
    const matches = clientReceipt.inputs.filter(({ bytes, path, sha256 }) =>
      path.endsWith(suffix)
        && bytes === expectedFoundation.bytes
        && sha256 === expectedFoundation.sha256);
    assert.equal(
      matches.length,
      1,
      `Final client graph must bind ${manifest.package.name}'s exact compiler foundation once.`,
    );
  }
  if (clientReceipt.inputs.some(({ path }) => /(?:^|\/)dist\/stylex\.css$/u.test(path))) {
    throw new Error("Compiler consumer mixed a standalone package StyleX stylesheet into its graph.");
  }
  const foundationCssPath = join(
    finalGeneration.directory,
    ...clientReceipt.outputRoot.split("/"),
    ...foundationOutput.path.split("/"),
  );
  const finalFoundationCss = await readFile(foundationCssPath, "utf8");
  if (!finalFoundationCss.includes("components.hraness-design-kit.legacy")
    || !finalFoundationCss.includes("--navigation-rail-width")) {
    throw new Error("Final client foundation lost design-kit legacy or token content.");
  }
  auditCssWithoutStylexUnionNamespace(
    finalFoundationCss,
    "Final client foundation",
  );
  assert.throws(
    () => auditCssWithoutStylexUnionNamespace(
      '@import "./fixture.css" layer(components.hraness-stylex.priority99);',
      "Reserved-union import control",
    ),
    /reserved StyleX rule-union namespace/u,
  );
  if (/@layer\s+components\.hraness-(?:ui|design-kit)\.priority/u.test(finalFoundationCss)
    || /(?:^|\/)stylex\.css/iu.test(finalFoundationCss)) {
    throw new Error("Final client foundation contains package recipe output.");
  }
  const ssrReceipt = await collectBunStylexGraph({
    build: { minify: true },
    generation: finalGeneration,
    graphId: "ssr",
    rootDirectory: consumer,
  });
  assert.equal(
    ssrReceipt.outputs.filter(({ path }) => path.endsWith(".css")).length,
    0,
    "Final SSR graph must not emit a second foundation stylesheet.",
  );
  assert.deepEqual(clientReceipt.packages, ssrReceipt.packages);
  assert.deepEqual(
    clientReceipt.packages.map(({ name }) => name).sort(),
    ["@hraness/design-kit", "@hraness/ui"],
    "Final graphs must bind exactly the UI and design-kit manifests.",
  );
  const rendererOutputs = ssrReceipt.outputs.filter(
    ({ path }) => /(?:^|\/)entries\/final-render-[^/]+\.js$/u.test(path),
  );
  assert.equal(rendererOutputs.length, 1, "Final SSR graph must emit one renderer entry.");
  const rendererOutput = rendererOutputs[0];
  assert.ok(rendererOutput !== undefined);
  const preparedTemplate = await prepareStylexProducedTemplate(
    finalGeneration,
    "index.html",
  );
  const rendererPath = join(
    finalGeneration.directory,
    ...ssrReceipt.outputRoot.split("/"),
    ...rendererOutput.path.split("/"),
  );
  const clientHref = `/graphs/client/${clientEntry.path}`;
  const foundationHref = `/graphs/client/${foundationOutput.path}`;
  await run([
    process.execPath,
    rendererPath,
    preparedTemplate.sourcePath,
    clientHref,
    foundationHref,
  ], consumer);
  await sealStylexProducedTemplate(finalGeneration, "index.html");
  const finalDirectory = await finalizeStylexGeneration({
    generation: finalGeneration,
    outputDirectory: compilerOutputDirectory,
    rootDirectory: consumer,
  });
  assert.equal(finalDirectory, join(compilerOutputDirectory, "mixed-final-app"));
  const finalCss = await readFile(join(finalDirectory, "stylex.css"), "utf8");
  assert.equal(
    finalCss,
    serializeStylexRuleUnionV1(
      [
        ...installedUiManifest.rules,
        ...installedManifest.rules,
        ...clientReceipt.rules,
        ...ssrReceipt.rules,
      ],
      [
        installedUiManifest.standaloneSerializer,
        installedManifest.standaloneSerializer,
      ],
    ),
    "Final application CSS must be one canonical package-and-application rule union.",
  );
  requireAtomicSelectorsPresent(
    finalCss,
    packedShellClasses,
    "Final application StyleX CSS",
  );
  const finalLayerNames = [
    "components.hraness-stylex.priority2",
    "components.hraness-stylex.priority3",
    "components.hraness-stylex.priority4",
    "components.hraness-stylex.priority5",
    "components.hraness-stylex.priority6",
    "components.hraness-stylex.priority7",
    "components.hraness-stylex.priority8",
  ];
  for (const layerName of finalLayerNames) {
    requireLayerBlockExactlyOnce(finalCss, layerName, "Final application StyleX CSS");
  }
  const finalLayerIndexes = finalLayerNames.map((layerName) =>
    finalCss.indexOf(`@layer ${layerName}`));
  assert.ok(
    finalLayerIndexes.every((index, position) =>
      index >= 0 && (position === 0 || index > (finalLayerIndexes[position - 1] ?? -1))),
    "Final application priority layers must remain in ascending canonical order.",
  );
  if (/components\.hraness-(?:ui|design-kit)\.priority/u.test(finalCss)) {
    throw new Error("Final application CSS retained a package-local standalone priority namespace.");
  }
  const finalHtml = await readFile(join(finalDirectory, "index.html"), "utf8");
  assert.equal(finalHtml.split(foundationHref).length - 1, 1);
  assert.equal(finalHtml.split('/stylex.css').length - 1, 1);
  assert.ok(
    finalHtml.indexOf(foundationHref) < finalHtml.indexOf('/stylex.css'),
    "Compiler foundation must precede the one final application StyleX stylesheet.",
  );
  const complete = record(
    JSON.parse(await readFile(join(finalDirectory, "stylex-complete.json"), "utf8")) as unknown,
    "stylex-complete.json",
  );
  assert.equal(complete.state, "complete");
  assert.deepEqual(
    (complete.graphs as readonly { readonly id: string }[]).map(({ id }) => id).sort(),
    ["client", "ssr"],
  );
  assert.deepEqual(
    (complete.packages as readonly { readonly name: string }[])
      .map(({ name }) => name)
      .sort(),
    ["@hraness/design-kit", "@hraness/ui"],
  );
  assert.equal((complete.finalCss as { readonly path: string }).path, "stylex.css");
  assert.equal(complete.schemaVersion, STYLEX_COMPLETE_RECORD_SCHEMA_VERSION);
  assert.equal(complete.unionPolicySha256, stylexUnionPolicySha256);
  assert.equal(complete.planSha256, finalGeneration.planSha256);

  // The public minimal route uses the same package manifests and exact
  // foundation gate, while a product retains its system typography.
  await writeFile(join(consumer, "palette-client.tsx"), [
    'import "@hraness/design-kit/compiler-palettes.css";',
    'import { createElement } from "react";',
    'import { createRoot } from "react-dom/client";',
    'import { Button } from "@hraness/ui";',
    'import { DesignPaletteProvider, DesignPaletteMenuButton } from "@hraness/design-kit/react";',
    'const root = document.getElementById("root"); if (root === null) throw new Error("Missing palette root");',
    'createRoot(root).render(createElement(DesignPaletteProvider, null, createElement(DesignPaletteMenuButton), createElement(Button, null, "Continue")));',
    "",
  ].join("\n"));
  const paletteGeneration = await createStylexGeneration({
    expectedGraphs: [{ adapter: "bun", entrypoints: ["palette-client.tsx"], id: "client", kind: "client" }],
    finalCssPath: "stylex.css", generationId: "palette-final-app", outputDirectory: compilerOutputDirectory,
    packageManifests: compilerManifestPaths, rootDirectory: consumer,
    templates: [{ cssHref: "/stylex.css", graphId: "client", outputPath: "index.html", sourcePath: "palette-template.html", stylesheetGraphId: "client" }],
  });
  const paletteReceipt = await collectBunStylexGraph({ generation: paletteGeneration, graphId: "client", rootDirectory: consumer });
  assert.ok(paletteReceipt.outputs.every(({ path }) => /\.(?:js|css)$/u.test(path)), "Minimal palette graph emitted a font or other asset");
  assert.ok(paletteReceipt.inputs.every(({ path }) => !/\.(?:woff2?|otf|ttf)$|\/fonts\.css$|\/compiler-tokens\.css$/u.test(path)),
    "Minimal palette graph imported typography assets");
  const paletteFoundations = paletteReceipt.outputs.filter(({ path }) => path.endsWith(".css"));
  assert.equal(paletteFoundations.length, 1);
  const paletteFoundation = paletteFoundations[0];
  assert.ok(paletteFoundation !== undefined);
  const paletteFoundationCss = await readFile(join(paletteGeneration.directory, paletteReceipt.outputRoot, paletteFoundation.path), "utf8");
  assert.ok(!/@font-face|url\(|components\.hraness-(?:ui|design-kit|stylex)\.priority/u.test(paletteFoundationCss),
    "Minimal palette foundation mixed font loading or atomic recipes into its global CSS");
  for (const manifest of [installedUiManifest, installedManifest]) {
    const foundation = manifest.stylesheets.find(({ path }) => path === manifest.compilerFoundation);
    assert.ok(foundation !== undefined);
    const captured = paletteReceipt.inputs.filter(({ path }) => path.endsWith(`${manifest.package.name}/${manifest.compilerFoundation}`));
    assert.equal(captured.length, 1, "Minimal palette graph must capture each exact required foundation once");
    assert.equal(captured[0]?.bytes, foundation.bytes);
    assert.equal(captured[0]?.sha256, foundation.sha256);
  }
  const paletteTemplate = await prepareStylexProducedTemplate(paletteGeneration, "index.html");
  await writeFile(paletteTemplate.sourcePath,
    `<!doctype html><html><head><link rel="stylesheet" href="/graphs/client/${paletteFoundation.path}"><link rel="stylesheet" href="${STYLEX_TEMPLATE_CSS_PLACEHOLDER}"></head><body><div id="root"></div></body></html>\n`,
    { flag: "wx" });
  await sealStylexProducedTemplate(paletteGeneration, "index.html");
  const paletteDirectory = await finalizeStylexGeneration({ generation: paletteGeneration, outputDirectory: compilerOutputDirectory, rootDirectory: consumer });
  assert.equal(await readFile(join(paletteDirectory, "stylex.css"), "utf8"), serializeStylexRuleUnionV1(
    [...installedUiManifest.rules, ...installedManifest.rules, ...paletteReceipt.rules],
    [installedUiManifest.standaloneSerializer, installedManifest.standaloneSerializer],
  ), "Minimal palette consumer must emit one canonical package-and-application rule union");

  await writeFile(
    join(consumer, "negative-template.html"),
    `<!doctype html><link rel="stylesheet" href="${STYLEX_TEMPLATE_CSS_PLACEHOLDER}"><main></main>\n`,
  );
  await writeFile(
    join(consumer, "missing-foundation.ts"),
    'import "@hraness/ui/compiler-foundation.css"; export const value = true;\n',
  );
  await writeFile(
    join(consumer, "mixed-standalone.ts"),
    'import "@hraness/design-kit/compiler-foundation.css"; import "@hraness/design-kit/stylex.css"; export const value = true;\n',
  );
  const createNegativeGeneration = async (
    generationId: string,
    entrypoint: string,
  ) => createStylexGeneration({
    expectedGraphs: [{
      adapter: "bun",
      entrypoints: [entrypoint],
      id: "client",
      kind: "client",
    }],
    finalCssPath: "stylex.css",
    generationId,
    outputDirectory: compilerOutputDirectory,
    packageManifests: compilerManifestPaths,
    rootDirectory: consumer,
    templates: [{
      cssHref: "/stylex.css",
      outputPath: "index.html",
      sourcePath: "negative-template.html",
      stylesheetGraphId: "client",
    }],
  });
  const missingFoundationGeneration = await createNegativeGeneration(
    "missing-foundation",
    "missing-foundation.ts",
  );
  await expectRejected(
    () => collectBunStylexGraph({
      generation: missingFoundationGeneration,
      graphId: "client",
      rootDirectory: consumer,
    }),
    /must include the compiler foundation for @hraness\/design-kit/u,
    "Missing design-kit foundation control",
  );
  const mixedStandaloneGeneration = await createNegativeGeneration(
    "mixed-standalone",
    "mixed-standalone.ts",
  );
  await expectRejected(
    () => collectBunStylexGraph({
      generation: mixedStandaloneGeneration,
      graphId: "client",
      rootDirectory: consumer,
    }),
    /standalone recipe|independently serialized recipe/iu,
    "Mixed standalone/compiler route control",
  );
  await expectRejected(
    () => createStylexGeneration({
      expectedGraphs: [{
        adapter: "bun",
        entrypoints: ["missing-foundation.ts"],
        id: "client",
        kind: "client",
      }],
      generationId: "duplicate-manifest",
      outputDirectory: compilerOutputDirectory,
      packageManifests: [installedManifestPath, installedManifestPath],
      rootDirectory: consumer,
    }),
    /packageManifests must be unique/u,
    "Duplicate package-manifest control",
  );

  const overlapPackageRoot = join(consumer, "overlap-package");
  await mkdir(join(overlapPackageRoot, "src"), { recursive: true });
  await mkdir(join(overlapPackageRoot, "dist"), { recursive: true });
  await writeFile(
    join(overlapPackageRoot, "package.json"),
    `${JSON.stringify({ name: "@fixture/overlap", type: "module", version: "1.0.0" }, null, 2)}\n`,
  );
  const overlapFoundationPath = join(overlapPackageRoot, "src/compiler-foundation.css");
  const overlapFoundation = "@layer base, components;\n@layer components.hraness-design-kit.nested.legacy { .fixture { display: block; } }\n";
  await writeFile(overlapFoundationPath, overlapFoundation);
  const overlapSerializer = {
    before: ["components.hraness-design-kit.nested.legacy"],
    prefix: "components.hraness-design-kit.nested",
  } as const satisfies StylexStandaloneSerializerV1;
  await writeFile(
    join(overlapPackageRoot, "dist/stylex.css"),
    serializeStylexPackageRules([], overlapSerializer),
  );
  const overlapManifest = validateStylexPackageManifest({
    buildTools: [],
    compiler: compilerContract,
    compilerFoundation: "src/compiler-foundation.css",
    compilerSha256,
    kind: "hraness-stylex-package-manifest",
    package: { name: "@fixture/overlap", version: "1.0.0" },
    rules: [],
    rulesSha256: stylexRulesSha256([]),
    runtime: [],
    schemaVersion: STYLEX_PACKAGE_MANIFEST_SCHEMA_VERSION,
    standaloneCss: await artifactForFile(overlapPackageRoot, "dist/stylex.css"),
    standaloneSerializer: overlapSerializer,
    stylesheets: [await artifactForFile(overlapPackageRoot, "src/compiler-foundation.css")],
  });
  const overlapManifestPath = join(overlapPackageRoot, "dist/stylex-manifest.json");
  await writeFile(overlapManifestPath, `${canonicalJson(overlapManifest)}\n`);
  await readStylexPackageManifest(overlapManifestPath, overlapPackageRoot);
  await expectRejected(
    () => createStylexGeneration({
      expectedGraphs: [{
        adapter: "bun",
        entrypoints: ["missing-foundation.ts"],
        id: "client",
        kind: "client",
      }],
      generationId: "overlapping-namespace",
      outputDirectory: compilerOutputDirectory,
      packageManifests: [installedManifestPath, overlapManifestPath],
      rootDirectory: consumer,
    }),
    /overlapping standalone StyleX namespaces/u,
    "Overlapping standalone namespace control",
  );
  await writeFile(overlapFoundationPath, overlapFoundation.replace("block", "grid "));
  await expectRejected(
    () => readStylexPackageManifest(overlapManifestPath, overlapPackageRoot),
    /Artifact hash changed: src\/compiler-foundation\.css/u,
    "Tampered compiler-foundation control",
  );

  const wrongPrefixSerializer = {
    before: ["components.hraness-design-kit-tampered.legacy"],
    prefix: "components.hraness-design-kit-tampered",
  } as const satisfies StylexStandaloneSerializerV1;
  const wrongPrefixManifest = validateStylexPackageManifest({
    ...installedManifest,
    standaloneSerializer: wrongPrefixSerializer,
  });
  const wrongPrefixManifestPath = join(installed, "dist/stylex-manifest-wrong-prefix.json");
  await writeFile(wrongPrefixManifestPath, `${canonicalJson(wrongPrefixManifest)}\n`);
  await expectRejected(
    () => readStylexPackageManifest(wrongPrefixManifestPath, installed),
    /Standalone StyleX CSS differs from its declared rules and serializer/u,
    "Wrong standalone prefix control",
  );
  const wrongOrderManifest = validateStylexPackageManifest({
    ...installedManifest,
    standaloneSerializer: {
      before: [
        "components.hraness-design-kit.legacy.nested",
        "components.hraness-design-kit.legacy",
      ],
      prefix: "components.hraness-design-kit",
    },
  });
  const wrongOrderManifestPath = join(installed, "dist/stylex-manifest-wrong-order.json");
  await writeFile(wrongOrderManifestPath, `${canonicalJson(wrongOrderManifest)}\n`);
  await expectRejected(
    () => readStylexPackageManifest(wrongOrderManifestPath, installed),
    /Standalone StyleX CSS differs from its declared rules and serializer/u,
    "Wrong standalone legacy-order control",
  );

  const react18Consumer = join(work, "consumer-react18");
  await mkdir(react18Consumer);
  await writeFile(
    join(react18Consumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await run([
    process.execPath,
    "add",
    uiInstallSource,
    "@types/react@18.3.28",
    "@types/react-dom@18.3.7",
    "react@18.3.1",
    "react-dom@18.3.1",
    "typescript@^6.0.3",
    "--ignore-scripts",
  ], react18Consumer);
  await run([
    process.execPath,
    "add",
    archive,
    "--ignore-scripts",
  ], react18Consumer);
  await run([
    "node",
    "--input-type=module",
    "-e",
    "await Promise.all([import('@hraness/design-kit'), import('@hraness/design-kit/react'), import('@hraness/design-kit/react/server'), import('@hraness/design-kit/syntax-highlighting')])",
  ], react18Consumer);
  await writeFile(
    join(react18Consumer, "notice-react18.mjs"),
    [
      'import { AnimatedRailStage, BottomBar, ChatComposer, ChatMessage, DitherSurface, DockedFooter, Fader, PageCanvas, PlaybackTransport, ProductionDataPreviewNotice, TopBar } from "@hraness/design-kit/react";',
      'import { createElement } from "react";',
      'import { renderToStaticMarkup } from "react-dom/server";',
      'const html = renderToStaticMarkup(createElement(ProductionDataPreviewNotice, { surfaceOrigin: "https://preview.example.test" }));',
      'const asideClasses = /<aside[^>]*class="([^"]+)"/u.exec(html)?.[1]?.split(" ").filter(Boolean);',
      'const strongClasses = /<strong[^>]*class="([^"]+)"/u.exec(html)?.[1]?.split(" ").filter(Boolean);',
      'if (asideClasses === undefined || !asideClasses.includes("hraness-design-production-data-preview-notice") || asideClasses.length < 2) throw new Error("React 18 packed notice lost stable or atomic classes.");',
      'if (strongClasses === undefined || strongClasses.length === 0) throw new Error("React 18 packed notice emphasis lost atomic classes.");',
      'if (!html.includes(\'role="alert"\') || !html.includes(\'aria-label="Production data preview warning"\')) throw new Error("React 18 packed notice lost alert semantics.");',
      'if (html.includes("style=")) throw new Error("React 18 packed notice emitted inline presentation.");',
      'const animatedRailStage = renderToStaticMarkup(createElement(AnimatedRailStage, { className: "consumer-animated-rail-stage", stageKey: "/workspace/detail" }, "Detail"));',
      'const animatedRailStageClasses = /<div[^>]*class="([^"]+)"/u.exec(animatedRailStage)?.[1]?.split(" ").filter(Boolean);',
      'if (animatedRailStageClasses === undefined || animatedRailStageClasses[0] !== "hraness-design-animated-rail-stage" || animatedRailStageClasses.at(-1) !== "consumer-animated-rail-stage" || animatedRailStageClasses.length !== 5 || !animatedRailStage.includes(`data-stage-key="/workspace/detail"`) || !animatedRailStage.includes(`style="opacity:1;transform:none"`)) throw new Error("React 18 packed AnimatedRailStage lost stable, atomic, caller-last, stage identity, or wait-mode render behavior.");',
      'const chatTag = (markup, stableClass) => { const classMatch = [...markup.matchAll(/class="([^"]+)"/gu)].find((match) => match[1]?.split(" ").includes(stableClass)); const marker = classMatch?.index ?? -1; const start = markup.lastIndexOf("<", marker); const end = markup.indexOf(">", marker); if (marker < 0 || start < 0 || end < 0) throw new Error(`React 18 packed Chat has no complete ${stableClass} tag.`); return markup.slice(start, end + 1); };',
      'const chatClasses = (markup, stableClass) => { const classes = /class="([^"]+)"/u.exec(chatTag(markup, stableClass))?.[1]?.split(" ").filter(Boolean); if (classes === undefined || classes[0] !== stableClass) throw new Error(`React 18 packed Chat lost stable-first ${stableClass} classes.`); return classes; };',
      'const chatMessage = renderToStaticMarkup(createElement(ChatMessage, { actions: createElement("button", { type: "button" }, "Copy"), avatar: "A", className: "consumer-chat-message", meta: "Now", name: "Assistant", role: "assistant" }, "Ready"));',
      'const chatMessageContracts = [["hraness-design-chat-message", 5], ["hraness-design-chat-message__content", 2], ["hraness-design-chat-message__header", 8], ["hraness-design-chat-message__body", 2], ["hraness-design-chat-message__actions", 5]];',
      'for (const [hook, count] of chatMessageContracts) { const tag = chatTag(chatMessage, hook); const classes = chatClasses(chatMessage, hook); if (classes.length !== count || tag.includes("style=")) throw new Error(`React 18 packed ChatMessage ${hook} lost its exact atomic or extracted presentation contract.`); }',
      'if (chatClasses(chatMessage, "hraness-design-chat-message").at(-1) !== "consumer-chat-message" || !chatTag(chatMessage, "hraness-design-chat-message").includes(`data-role="assistant"`) || !chatMessage.includes("hraness-design-chat-message__avatar") || !chatMessage.includes(">Assistant</strong>") || !chatMessage.includes(">Now</span>") || !chatMessage.includes(">Ready</div>") || !chatMessage.includes(">Copy</button>")) throw new Error("React 18 packed ChatMessage lost role, slot, or caller-last behavior.");',
      'const chatComposer = renderToStaticMarkup(createElement(ChatComposer, { action: "/reply", "aria-label": "Reply composer", className: "consumer-chat-composer", "data-react18-chat": "ready", method: "post", onSubmit() {}, onValueChange() {}, placeholder: "Reply", sendLabel: "Send reply", style: { color: "red" }, title: "Native form", value: "Draft" }));',
      'const chatComposerTag = chatTag(chatComposer, "hraness-design-chat-composer");',
      'const chatComposerClasses = chatClasses(chatComposer, "hraness-design-chat-composer");',
      'if (chatComposerClasses.length !== 7 || chatComposerClasses.at(-1) !== "consumer-chat-composer" || !chatComposerTag.includes(`action="/reply"`) || !chatComposerTag.includes(`aria-label="Reply composer"`) || !chatComposerTag.includes(`data-react18-chat="ready"`) || !chatComposerTag.includes(`method="post"`) || !chatComposerTag.includes(`style="color:red"`) || !chatComposerTag.includes(`title="Native form"`) || !chatComposer.includes("hraness-design-chat-composer__field") || !chatComposer.includes("hraness-design-chat-composer__send") || !chatComposer.includes(`rows="2"`) || !chatComposer.includes(`>Draft</textarea>`) || !chatComposer.includes(`type="submit"`) || !chatComposer.includes(`data-slot="button-label">Send reply</span>`)) throw new Error("React 18 packed ChatComposer lost atomic, caller-last, native form, controlled field, or submit semantics.");',
      'for (const density of ["coarse", "fine", "medium"]) { const dither = renderToStaticMarkup(createElement(DitherSurface, { as: "article", density, tone: "secondary" }, density)); if (!dither.includes(`data-density="${density}"`) || !dither.includes("hraness-themed-surface") || !dither.includes("hraness-design-dither-surface") || !dither.includes(`data-slot="themed-surface"`) || dither.includes("style=")) throw new Error(`React 18 packed DitherSurface lost its ${density} semantic or extracted presentation contract.`); }',
      'const callerDither = renderToStaticMarkup(createElement(DitherSurface, { density: "fine", style: { "--hraness-design-dither-size": "11px", backgroundImage: "none", backgroundSize: "11px 11px" } }));',
      'if (!callerDither.includes("--hraness-design-dither-size:11px") || !callerDither.includes("background-image:none") || !callerDither.includes("background-size:11px 11px")) throw new Error("React 18 packed DitherSurface lost caller-last native presentation.");',
      'const layout = [renderToStaticMarkup(createElement(TopBar, { className: "consumer-top", position: "sticky", style: { zIndex: 123 }, surface: "glass", title: "Top" }, "Content")), renderToStaticMarkup(createElement(BottomBar, { className: "consumer-bottom", title: "Native title" }, "Bottom")), renderToStaticMarkup(createElement(PageCanvas, { as: "div", className: "consumer-page", inset: "none", size: "wide" }, "Page")), renderToStaticMarkup(createElement(DockedFooter, { className: "consumer-docked", contentClassName: "consumer-docked-content", density: "compact", inset: "none", position: "absolute", size: "wide", surface: "glass" }, "Docked"))];',
      'for (const [index, stableClass] of ["hraness-design-top-bar", "hraness-design-bottom-bar", "hraness-design-page-canvas", "hraness-design-docked-footer"].entries()) { const markup = layout[index]; const classes = new RegExp(`class="([^"]*${stableClass}[^"]*)"`, "u").exec(markup)?.[1]?.split(" ").filter(Boolean); if (classes === undefined || classes[0] !== stableClass || classes.length < 3) throw new Error(`React 18 packed ${stableClass} lost stable or atomic presentation.`); }',
      'if (!layout[0].includes(`data-position="sticky"`) || !layout[0].includes(`data-surface="glass"`) || !layout[0].includes(`style="z-index:123"`)) throw new Error("React 18 packed TopBar lost variants or native style.");',
      'if (!layout[1].startsWith(`<footer`) || !layout[1].includes(`title="Native title"`)) throw new Error("React 18 packed BottomBar lost native semantics.");',
      'if (!layout[2].startsWith(`<div`) || !layout[2].includes(`data-inset="none"`) || !layout[2].includes(`data-size="wide"`)) throw new Error("React 18 packed PageCanvas lost native semantics or variants.");',
      'if (!layout[3].includes(`data-position="absolute"`) || !layout[3].includes(`data-surface="glass"`) || !layout[3].includes(`data-density="compact"`) || !layout[3].includes("consumer-docked-content")) throw new Error("React 18 packed DockedFooter lost root or content behavior.");',
      'const playback = Object.fromEntries(["idle", "pending", "playing"].map((status) => [status, renderToStaticMarkup(createElement(PlaybackTransport, { "aria-label": "Preview", className: "consumer-playback", onPlay() {}, onStop() {}, status }))]));',
      'for (const [status, markup] of Object.entries(playback)) { const classes = /<div(?=[^>]*role="toolbar")(?=[^>]*class="([^"]+)")[^>]*>/u.exec(markup)?.[1]?.split(" ").filter(Boolean); if (classes === undefined || classes[0] !== "hraness-toolbar" || !classes.includes("hraness-design-playback-transport") || classes.at(-1) !== "consumer-playback" || !markup.includes(`data-playback-status="${status}"`) || !markup.includes("hraness-design-playback-transport__button") || markup.includes("style=")) throw new Error(`React 18 packed PlaybackTransport lost its ${status} semantic or extracted presentation contract.`); }',
      'if (!playback.idle.includes(`aria-label="Play"`) || !playback.idle.includes(`data-slot="icon"`) || !playback.pending.includes(`aria-label="Cancel playback start"`) || !playback.pending.includes(`data-slot="spinner"`) || !playback.pending.includes(`aria-busy="true"`) || !playback.playing.includes(`aria-label="Stop"`) || !playback.playing.includes(`data-slot="icon"`)) throw new Error("React 18 packed PlaybackTransport lost its lifecycle command contract.");',
      'const faderMarkup = { defaultVertical: renderToStaticMarkup(createElement(Fader, { className: "consumer-fader-default", label: "Gain", maxValue: 100, minValue: 0, orientation: "vertical", showLabel: true, showOutput: true, value: 32 })), horizontalCompact: renderToStaticMarkup(createElement(Fader, { className: "consumer-fader-compact", density: "compact", label: "Pan", labelAccessory: createElement("button", { type: "button" }, "Reset"), maxValue: 100, minValue: 0, orientation: "horizontal", showLabel: true, showOutput: true, value: 64 })) };',
      'const faderContracts = { defaultVertical: { callerClass: "consumer-fader-default", density: "default", orientation: "vertical", value: "32" }, horizontalCompact: { callerClass: "consumer-fader-compact", density: "compact", orientation: "horizontal", value: "64" } };',
      'const faderTag = (markup, stableClass) => { const classMatch = [...markup.matchAll(/class="([^"]+)"/gu)].find((match) => match[1]?.split(" ").includes(stableClass)); const marker = classMatch?.index ?? -1; const start = markup.lastIndexOf("<", marker); const end = markup.indexOf(">", marker); if (marker < 0 || start < 0 || end < 0) throw new Error(`React 18 packed Fader has no complete ${stableClass} tag.`); return markup.slice(start, end + 1); };',
      'const faderClasses = (markup, stableClass) => { const classes = /class="([^"]+)"/u.exec(faderTag(markup, stableClass))?.[1]?.split(" ").filter(Boolean); if (classes === undefined || classes[0] !== stableClass || classes.length < 2) throw new Error(`React 18 packed Fader lost stable or generated ${stableClass} classes.`); return classes; };',
      'for (const [variant, markup] of Object.entries(faderMarkup)) { const contract = faderContracts[variant]; const rootTag = faderTag(markup, "hraness-design-fader"); const rootClasses = faderClasses(markup, "hraness-design-fader"); if (rootClasses.at(-1) !== contract.callerClass || !rootTag.includes(`data-density="${contract.density}"`) || !rootTag.includes(`data-orientation="${contract.orientation}"`) || !rootTag.includes(`role="group"`) || rootTag.includes("style=")) throw new Error(`React 18 packed ${variant} Fader lost stable, generated, caller-last, variant, or extracted root presentation.`); const hooks = ["hraness-design-fader", ...(variant === "horizontalCompact" ? ["hraness-design-fader__label-row"] : []), "hraness-design-fader__label", "hraness-design-fader__output", "hraness-design-fader__track", "hraness-design-fader__track-rail", "hraness-design-fader__fill-rail", "hraness-design-fader__thumb"]; for (const hook of hooks) faderClasses(markup, hook); const labelTag = faderTag(markup, "hraness-design-fader__label"); const outputTag = faderTag(markup, "hraness-design-fader__output"); const trackTag = faderTag(markup, "hraness-design-fader__track"); if (labelTag.includes("style=") || outputTag.includes("style=") || !trackTag.includes(`style="position:relative;touch-action:none"`) || /(?:block-size|inline-size|--hraness-design-fader)/u.test(trackTag)) throw new Error(`React 18 packed ${variant} Fader leaked package-owned inline presentation.`); const range = /<input(?=[^>]*type="range")[^>]*>/u.exec(markup)?.[0]; if (range === undefined || !range.includes(`min="0"`) || !range.includes(`max="100"`) || !range.includes(`step="1"`) || !range.includes(`aria-orientation="${contract.orientation}"`) || !range.includes(`value="${contract.value}"`)) throw new Error(`React 18 packed ${variant} Fader lost native range semantics.`); for (const rail of ["hraness-design-fader__track-rail", "hraness-design-fader__fill-rail"]) { const matches = markup.match(new RegExp(`<span(?=[^>]*aria-hidden="true")(?=[^>]*class="[^"]*${rail}[^"]*")[^>]*>`, "gu")) ?? []; if (matches.length !== 1) throw new Error(`React 18 packed ${variant} Fader lost its single aria-hidden ${rail} hook.`); } }',
      'if (!faderMarkup.defaultVertical.includes(">Gain</label>") || !faderMarkup.defaultVertical.includes(">32</output>") || !faderMarkup.horizontalCompact.includes(">Pan</label>") || !faderMarkup.horizontalCompact.includes(`<span class="hraness-design-fader__label-accessory"><button type="button">Reset</button></span>`) || !faderMarkup.horizontalCompact.includes(">64</output>")) throw new Error("React 18 packed Fader lost its label, accessory, or output contract.");',
      "",
    ].join("\n"),
  );
  await run(["node", "./notice-react18.mjs"], react18Consumer);
  await writeFile(
    join(react18Consumer, "index.ts"),
    [
      'import * as clientReact from "@hraness/design-kit/react";',
      'import type { AnimatedRailStageProps, ChatComposerProps, ChatMessageProps, FaderProps, PlaybackTransportProps, RailItemProps } from "@hraness/design-kit/react";',
      'import * as serverReact from "@hraness/design-kit/react/server";',
      'import * as stylex from "@stylexjs/stylex";',
      'const callbacks = { onPlay() {}, onStop() {}, status: "idle" } as const;',
      'const railItemStyles = stylex.create({ root: { color: "rebeccapurple" } });',
      'const typedRailItem: RailItemProps = { href: "/library", label: "Library", xstyle: railItemStyles.root };',
      '// @ts-expect-error RailItem xstyle rejects uncompiled raw style objects.',
      'const rawRailItem: RailItemProps = { href: "/library", label: "Library", xstyle: { color: "rebeccapurple" } };',
      'const animatedRailStage: AnimatedRailStageProps = { children: "Detail", className: "consumer-stage", stageKey: "/workspace/detail" };',
      '// @ts-expect-error AnimatedRailStage intentionally exposes no public xstyle seam.',
      'const animatedRailStageWithXstyle: AnimatedRailStageProps = { children: "Detail", stageKey: "/workspace/detail", xstyle: {} };',
      'const chatMessage: ChatMessageProps = { children: "Ready", className: "consumer-chat-message", role: "assistant" };',
      '// @ts-expect-error ChatMessage intentionally exposes no public xstyle seam.',
      'const chatMessageWithXstyle: ChatMessageProps = { children: "Ready", role: "assistant", xstyle: {} };',
      'const chatComposer: ChatComposerProps = { action: "/reply", "aria-label": "Reply composer", className: "consumer-chat-composer", method: "post", onSubmit() {}, onValueChange() {}, style: { color: "red" }, value: "Draft" };',
      '// @ts-expect-error ChatComposer intentionally exposes no public xstyle seam.',
      'const chatComposerWithXstyle: ChatComposerProps = { onSubmit() {}, onValueChange() {}, value: "Draft", xstyle: {} };',
      'const playbackByLabel: PlaybackTransportProps = { "aria-label": "Preview", buttonAriaKeyShortcuts: "Space", buttonId: "preview", buttonRef: { current: null }, className: "consumer", ...callbacks };',
      'const playbackByLabelledby: PlaybackTransportProps = { "aria-labelledby": "preview-label", ...callbacks };',
      '// @ts-expect-error PlaybackTransport requires exactly one accessible naming strategy.',
      'const playbackWithoutName: PlaybackTransportProps = { ...callbacks };',
      '// @ts-expect-error PlaybackTransport rejects two accessible naming strategies.',
      'const playbackWithBothNames: PlaybackTransportProps = { "aria-label": "Preview", "aria-labelledby": "preview-label", ...callbacks };',
      '// @ts-expect-error PlaybackTransport intentionally exposes no public xstyle seam.',
      'const playbackWithXstyle: PlaybackTransportProps = { "aria-label": "Preview", ...callbacks, xstyle: {} };',
      'const defaultFader: FaderProps = { className: "consumer-fader", label: "Gain", value: 32 };',
      'const compactHorizontalFader: FaderProps = { density: "compact", label: "Pan", labelAccessory: "Reset", orientation: "horizontal", showLabel: true, showOutput: true, value: 64 };',
      '// @ts-expect-error Fader intentionally exposes no public xstyle seam.',
      'const faderWithXstyle: FaderProps = { label: "Gain", xstyle: {} };',
      '// @ts-expect-error Fader owns its children structure.',
      'const faderWithChildren: FaderProps = { children: "Unsupported", label: "Gain" };',
      "void [animatedRailStage, animatedRailStageWithXstyle, chatComposer, chatComposerWithXstyle, chatMessage, chatMessageWithXstyle, clientReact, compactHorizontalFader, defaultFader, faderWithChildren, faderWithXstyle, playbackByLabel, playbackByLabelledby, playbackWithBothNames, playbackWithoutName, playbackWithXstyle, rawRailItem, serverReact, stylex, typedRailItem];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(react18Consumer, `tsconfig.${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          jsx: "react-jsx",
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["index.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.${mode.toLowerCase()}.json`,
    ], react18Consumer);
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
