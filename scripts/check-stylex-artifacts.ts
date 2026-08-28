import { readFile, readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const DESIGN_COMPONENTS_IMPORT = '@import "./components.css";';
const DESIGN_STYLEX_IMPORT = '@import "../dist/stylex.css";';
const GALLERY_LAYER_CONFLICT_SENTINEL = "data-design-kit-stylex-";
const LOCAL_LAYER_PRELUDE =
  "@layer components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4;";
const PORTFOLIO_LAYER_PRELUDE =
  "@layer components.hraness-ui.legacy, components.hraness-ui.priority1, components.hraness-ui.priority2, components.hraness-ui.priority3, components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4;";
const TOP_LEVEL_LAYER_PRELUDE = "@layer base, components;";
const UI_COMPONENTS_IMPORT = '@import "@hraness/ui/components.css";';
const UI_STYLEX_IMPORT = '@import "@hraness/ui/stylex.css";';

const DESIGN_STYLEX_LAYERS = [
  "components.hraness-design-kit.priority1",
  "components.hraness-design-kit.priority2",
  "components.hraness-design-kit.priority3",
  "components.hraness-design-kit.priority4",
] as const;
const UI_LEGACY_LAYERS = [
  "components.hraness-ui.legacy.base",
  "components.hraness-ui.legacy",
] as const;
const UI_STYLEX_LAYERS = [
  "components.hraness-ui.priority1",
  "components.hraness-ui.priority2",
  "components.hraness-ui.priority3",
] as const;

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

function requireOnlyLayerBlocks(
  source: string,
  allowedLayers: ReadonlySet<string>,
  description: string,
): string[] {
  const statements = topLevelStatements(source, description);
  if (statements.length === 0) {
    throw new Error(`${description} must contain a named layer block`);
  }

  return statements.map((statement) => {
    const layer = statement.match(/^@layer\s+([A-Za-z0-9_.-]+)\s*\{/u)?.[1];
    if (layer === undefined || !allowedLayers.has(layer)) {
      throw new Error(
        `${description} contains top-level content outside its allowed named layers`,
      );
    }
    return layer;
  });
}

function requireGeneratedLayerContract(
  source: string,
  allowedLayers: readonly string[],
  description: string,
  requiredLayers: readonly string[] = allowedLayers,
): void {
  const layers = requireOnlyLayerBlocks(
    source,
    new Set(allowedLayers),
    description,
  );
  for (const layer of requiredLayers) {
    if (!layers.includes(layer)) {
      throw new Error(`${description} must declare ${layer}`);
    }
  }
}

function requireLocalComponentsContract(source: string): void {
  const statements = topLevelStatements(source, "src/components.css");
  const legacyLayer = statements[2]?.match(
    /^@layer\s+(components\.hraness-design-kit\.legacy)\s*\{/u,
  )?.[1];
  if (statements.length !== 3
    || statements[0] !== LOCAL_LAYER_PRELUDE
    || statements[1] !== DESIGN_STYLEX_IMPORT
    || legacyLayer !== "components.hraness-design-kit.legacy") {
    throw new Error(
      "src/components.css must contain the exact local layer prelude, one StyleX import, and one legacy layer block with no bare or unlayered rules",
    );
  }
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
    '@import "./design-gallery.css";',
  ];
  const statements = topLevelStatements(source, "src/styles.css");
  if (statements.length !== expectedStatements.length
    || statements.some((statement, index) => statement !== expectedStatements[index])) {
    throw new Error(
      "src/styles.css must contain the exact base < components and UI legacy < UI priority1/2/3 < design-kit legacy < design-kit priority1/2/3/4 preludes before its ordered imports",
    );
  }
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
  designCompiledJavaScript: string,
  uiCompiledCss: string,
  localComponents: string,
  aggregateStylesheet: string,
): number {
  const localLegacyLayer = "@layer components.hraness-design-kit.legacy {";
  const invertedLocalPrelude =
    "@layer components.hraness-design-kit.legacy, components.hraness-design-kit.priority2, components.hraness-design-kit.priority1, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4;";
  const invertedPortfolioPrelude =
    "@layer components.hraness-ui.legacy, components.hraness-ui.priority1, components.hraness-ui.priority2, components.hraness-design-kit.legacy, components.hraness-ui.priority3, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4;";
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
    [
      "missing local StyleX import",
      replaceExactlyOnce(
        localComponents,
        `${DESIGN_STYLEX_IMPORT}\n`,
        "",
        "missing local StyleX import",
      ),
    ],
    [
      "duplicate local StyleX import",
      replaceExactlyOnce(
        localComponents,
        DESIGN_STYLEX_IMPORT,
        `${DESIGN_STYLEX_IMPORT}\n${DESIGN_STYLEX_IMPORT}`,
        "duplicate local StyleX import",
      ),
    ],
    [
      "inverted local layer prelude",
      replaceExactlyOnce(
        localComponents,
        LOCAL_LAYER_PRELUDE,
        invertedLocalPrelude,
        "inverted local layer prelude",
      ),
    ],
    [
      "missing local layer prelude",
      replaceExactlyOnce(
        localComponents,
        `${LOCAL_LAYER_PRELUDE}\n`,
        "",
        "missing local layer prelude",
      ),
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
      ),
    ],
    [
      "undeclared generated design-kit priority layer",
      () => requireGeneratedLayerContract(
        `${designCompiledCss}\n@layer components.hraness-design-kit.priority5 { .x-design-priority5-mutation { color: red; } }\n`,
        DESIGN_STYLEX_LAYERS,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "unlayered generated UI rule",
      () => requireGeneratedLayerContract(
        `${uiCompiledCss}\n.x-ui-unlayered-mutation { color: red; }\n`,
        UI_STYLEX_LAYERS,
        "mutated @hraness/ui stylex.css",
      ),
    ],
    [
      "undeclared generated UI priority layer",
      () => requireGeneratedLayerContract(
        `${uiCompiledCss}\n@layer components.hraness-ui.priority4 { .x-ui-priority4-mutation { color: red; } }\n`,
        UI_STYLEX_LAYERS,
        "mutated @hraness/ui stylex.css",
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
        replaceExactlyOnce(
          designCompiledCss,
          "inline-size: 1.5rem;",
          "width: 1.5rem;",
          "physical PlaybackTransport glyph width substitution",
        ),
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical PlaybackTransport glyph height substitution",
      () => requirePlaybackTransportDeclarationContract(
        replaceExactlyOnce(
          designCompiledCss,
          "block-size: 1.5rem;",
          "height: 1.5rem;",
          "physical PlaybackTransport glyph height substitution",
        ),
        designCompiledJavaScript,
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
        "mutated dist/stylex.css",
      ),
    ],
    [
      "mutated ChatMessage grid columns",
      () => requireChatDeclarationContract(
        mutatedChatMessageColumns,
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "physical ChatMessage header margin substitution",
      () => requireChatDeclarationContract(
        physicalChatMessageHeaderMargin,
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "mutated ChatComposer compact columns",
      () => requireChatDeclarationContract(
        mutatedChatComposerCompactColumns,
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "relocated ChatComposer compact rule",
      () => requireChatDeclarationContract(
        relocatedChatComposerCompactRule,
        designCompiledJavaScript,
        "mutated dist/stylex.css",
      ),
    ],
  ] as const;

  for (const [description, mutation] of localMutations) {
    requireMutationRejected(
      description,
      () => {
        requireLocalComponentsContract(mutation);
        requireAnimatedRailStageLegacyRemoval(mutation, "mutated src/components.css");
        requirePlaybackTransportLegacyRemoval(mutation, "mutated src/components.css");
        requireFaderLegacyRemoval(mutation, "mutated src/components.css");
        requireChatLegacyRemoval(mutation, "mutated src/components.css");
      },
    );
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

  return localMutations.length + aggregateMutations.length + generatedMutations.length;
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
const javaScriptPaths = await JavaScriptBelow(dist);
const javaScriptSources = new Map(await Promise.all(
  javaScriptPaths.map(async (path) => [path, await readFile(path, "utf8")] as const),
));
const [
  compiledCss,
  orderedStylesheet,
  legacyComponents,
  uiLegacyComponents,
  uiCompiledCss,
] = await Promise.all([
  readFile(resolve(dist, "stylex.css"), "utf8"),
  readFile(resolve(repository, "src/styles.css"), "utf8"),
  readFile(resolve(repository, "src/components.css"), "utf8"),
  readFile(resolve(repository, "node_modules/@hraness/ui/src/components.css"), "utf8"),
  readFile(resolve(repository, "node_modules/@hraness/ui/dist/stylex.css"), "utf8"),
]);
const compiledJavaScript = [...javaScriptSources.values()].join("\n");

if (compiledCss.trim().length === 0) {
  throw new Error("dist/stylex.css is empty");
}

requireMatch(
  compiledCss,
  /@layer components\.hraness-design-kit\.priority1\s*\{/u,
  "the package-owned priority1 layer",
);
requireMatch(
  compiledCss,
  /@layer components\.hraness-design-kit\.priority3\s*\{/u,
  "the package-owned priority3 layer",
);
requireMatch(
  compiledCss,
  /@layer components\.hraness-design-kit\.priority2\s*\{/u,
  "the package-owned priority2 layer",
);
requireMatch(
  compiledCss,
  /@layer components\.hraness-design-kit\.priority4\s*\{/u,
  "the package-owned priority4 layer",
);
const ditherDeclarations: readonly (readonly [RegExp, string])[] = [
  [
    /@layer components\.hraness-design-kit\.priority1\s*\{[\s\S]*?--hraness-design-dither-size:\s*3px;[\s\S]*?--hraness-design-dither-size:\s*7px;/u,
    "literal fine and coarse density variables in priority1",
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

const layoutSurfacePhysicalSubstitutions: readonly (readonly [RegExp, string])[] = [
  [/border-bottom-color:\s*var\(--line\);/u, "physical block-end border color substitution"],
  [/border-bottom-width:\s*1px;/u, "physical block-end border width substitution"],
  [/border-top-color:\s*var\(--line\);/u, "physical block-start border color substitution"],
  [/border-top-width:\s*1px;/u, "physical block-start border width substitution"],
  [/min-width:\s*0;/u, "physical min-width substitution"],
  [/min-height:\s*var\(--bottom-bar-height\);/u, "physical BottomBar min-height substitution"],
  [/min-height:\s*var\(--top-bar-height\);/u, "physical TopBar min-height substitution"],
  [/width:\s*min\(100%,\s*var\(--page-canvas-width\)\);/u, "physical width substitution"],
  [/max-width:\s*none;/u, "physical full-size max-width substitution"],
  [/max-width:\s*var\(--page-canvas-wide\);/u, "physical wide-size max-width substitution"],
];

function requireLayoutSurfaceDeclarationContract(source: string, label: string): void {
  for (const [pattern, description] of layoutSurfaceDeclarations) {
    requireMatch(source, pattern, `${label} layout-surface ${description} declaration`);
  }
  for (const [pattern, description] of layoutSurfacePhysicalSubstitutions) {
    forbid(source, pattern, `${label} layout-surface ${description}`);
  }
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

  const layerStarts = DESIGN_STYLEX_LAYERS.map((layer) => ({
    index: css.indexOf(`@layer ${layer} {`),
    priority: layer.slice(layer.lastIndexOf(".") + 1),
  }));
  if (layerStarts.some(({ index }) => index < 0)) {
    throw new Error(`${label} is missing a design-kit priority layer`);
  }
  const priorityFor = (index: number): string | undefined =>
    layerStarts.find(({ index: start }, layerIndex) => {
      const next = layerStarts[layerIndex + 1]?.index ?? css.length;
      return index > start && index < next;
    })?.priority;

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
    return `${priorityFor(rules[0].index) ?? "missing"}\u0000${body}`;
  });
  const expected = [
    "priority2\u0000transition: none !important;",
    "priority3\u0000min-inline-size: 0;",
    "priority3\u0000transform: none !important;",
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

function requireChatDeclarationContract(
  css: string,
  javaScript: string,
  label: string,
): void {
  const styleMap = compiledChatStyleMap(javaScript, label);
  const expectedBranches = {
    composer: [
      ["align-items: end;", "priority3"],
      ["display: grid;", "priority3"],
      ["gap: var(--space-2);", "priority2"],
      ["grid-template-columns: minmax(0, 1fr) auto;", "priority3"],
      ["grid-template-columns: 1fr;", "priority3"],
    ],
    message: [
      ["display: grid;", "priority3"],
      ["gap: var(--space-3);", "priority2"],
      ["grid-template-columns: auto minmax(0, 1fr);", "priority3"],
    ],
    messageHeader: [
      ["color: var(--muted);", "priority3"],
      ["font-size: var(--text-caption);", "priority3"],
      ["margin-block-end: var(--space-1);", "priority3"],
    ],
    messageMinInline: [
      ["min-inline-size: 0;", "priority3"],
    ],
    messageRow: [
      ["align-items: center;", "priority3"],
      ["display: flex;", "priority3"],
      ["flex-wrap: wrap;", "priority3"],
      ["gap: var(--space-2);", "priority2"],
    ],
  } as const;
  const actualBranchNames = [...styleMap.matchAll(
    /^ {2}([A-Za-z][A-Za-z0-9]*):\s*\{/gmu,
  )].map((match) => match[1]);
  if (JSON.stringify(actualBranchNames) !== JSON.stringify(Object.keys(expectedBranches))) {
    throw new Error(`${label} exposes the wrong Chat recipe branches`);
  }

  const layerStarts = DESIGN_STYLEX_LAYERS.map((layer) => ({
    index: css.indexOf(`@layer ${layer} {`),
    priority: layer.slice(layer.lastIndexOf(".") + 1),
  }));
  if (layerStarts.some(({ index }) => index < 0)) {
    throw new Error(`${label} is missing a design-kit priority layer`);
  }
  const priorityFor = (index: number): string | undefined =>
    layerStarts.find(({ index: start }, layerIndex) => {
      const next = layerStarts[layerIndex + 1]?.index ?? css.length;
      return index > start && index < next;
    })?.priority;

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
        `${priorityFor(match.index ?? -1) ?? "missing"}\u0000${(match[1] ?? "").replace(/\s+/gu, " ").trim()}`);
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
  forbid(css, /min-width:\s*0;/u, `${label} physical Chat minimum inline-size`);
}

function requireFaderDeclarationContract(
  css: string,
  javaScript: string,
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
      ["font-size: var(--text-caption);", "priority3"],
    ],
    compact: [
      ["--hraness-design-fader-thumb-block-size: .75rem;", "priority1"],
      ["--hraness-design-fader-thumb-inline-size: 1.5rem;", "priority1"],
      ["--hraness-design-fader-track-length: var(--interactive-target-min);", "priority1"],
    ],
    fillRail: [
      ["background-color: var(--primary);", "priority3"],
      ["block-size: 100%;", "priority3"],
      ["inset-block-end: 0;", "priority3"],
    ],
    focusVisible: [
      ["outline-color: var(--focus);", "priority3"],
      ["outline-offset: 3px;", "priority3"],
      ["outline-style: solid;", "priority3"],
      ["outline-width: 3px;", "priority3"],
    ],
    horizontalRoot: [
      ["min-inline-size: 8rem;", "priority3"],
    ],
    horizontalTrack: [
      ["block-size: var(--interactive-target-min);", "priority3"],
      ["inline-size: 100%;", "priority3"],
    ],
    labelRow: [
      ["align-items: center;", "priority3"],
      ["display: flex;", "priority3"],
      ["gap: var(--space-1);", "priority2"],
    ],
    rail: [
      ["border-radius: var(--radius-round);", "priority2"],
      ["inline-size: 4px;", "priority3"],
      ["inset-inline: calc(50% - 2px);", "priority2"],
      ["position: absolute;", "priority3"],
    ],
    root: [
      ["--hraness-design-fader-thumb-block-size: 1.125rem;", "priority1"],
      ["--hraness-design-fader-thumb-inline-size: 1.75rem;", "priority1"],
      ["--hraness-design-fader-track-length: 6rem;", "priority1"],
      ["display: grid;", "priority3"],
      ["gap: var(--space-2);", "priority2"],
      ["justify-items: center;", "priority3"],
      ["min-inline-size: var(--interactive-target-min);", "priority3"],
    ],
    thumb: [
      ["background-color: var(--primary);", "priority3"],
      ["block-size: var(--hraness-design-fader-thumb-block-size);", "priority3"],
      ["border-color: var(--background);", "priority2"],
      ["border-radius: var(--radius-sm);", "priority2"],
      ["border-style: solid;", "priority2"],
      ["border-width: 2px;", "priority2"],
      ["box-shadow: 0 0 0 1px var(--line);", "priority3"],
      ["inline-size: var(--hraness-design-fader-thumb-inline-size);", "priority3"],
      ["left: 50%;", "priority4"],
      ["top: 50%;", "priority4"],
    ],
    track: [
      ["block-size: var(--hraness-design-fader-track-length);", "priority3"],
      ["inline-size: var(--interactive-target-min);", "priority3"],
      ["position: relative;", "priority3"],
    ],
    trackRail: [
      ["background-color: var(--grid);", "priority3"],
      ["inset-block: 0;", "priority2"],
    ],
  } as const;

  const actualBranchNames = [...styleMap.matchAll(
    /^ {2}([A-Za-z][A-Za-z0-9]*):\s*\{/gmu,
  )].map((match) => match[1]);
  const expectedBranchNames = Object.keys(expectedBranches);
  if (JSON.stringify(actualBranchNames) !== JSON.stringify(expectedBranchNames)) {
    throw new Error(`${label} exposes the wrong Fader recipe branches`);
  }

  const layerStarts = DESIGN_STYLEX_LAYERS.map((layer) => ({
    index: css.indexOf(`@layer ${layer} {`),
    priority: layer.slice(layer.lastIndexOf(".") + 1),
  }));
  if (layerStarts.some(({ index }) => index < 0)) {
    throw new Error(`${label} is missing a design-kit priority layer`);
  }
  const priorityFor = (index: number): string | undefined =>
    layerStarts.find(({ index: start }, layerIndex) => {
      const next = layerStarts[layerIndex + 1]?.index ?? css.length;
      return index > start && index < next;
    })?.priority;
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
      return `${priorityFor(matches[0].index) ?? "missing"}\u0000${body}`;
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
  const layerStarts = [
    "priority1",
    "priority2",
    "priority3",
    "priority4",
  ].map((priority) => ({
    index: css.indexOf(`@layer components.hraness-design-kit.${priority} {`),
    priority,
  }));
  if (layerStarts.some(({ index }) => index < 0)) {
    throw new Error(`${label} is missing a design-kit priority layer`);
  }
  const priorityFor = (index: number): string | undefined =>
    layerStarts.find(({ index: start }, layerIndex) => {
      const next = layerStarts[layerIndex + 1]?.index ?? css.length;
      return index > start && index < next;
    })?.priority;
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
      priority: priorityFor(matches[0].index),
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
    !expectedGlyph.has(body) || priority !== "priority3")
    || rootRules.some(({ body, priority }) =>
      !expectedRoot.has(body)
      || priority !== (body.startsWith("gap:") ? "priority2" : "priority3"))) {
    throw new Error(
      `${label} does not preserve the exact PlaybackTransport priority2/priority3 recipe`,
    );
  }
  if (new Set(glyphRules.map(({ body }) => body)).size !== expectedGlyph.size
    || new Set(rootRules.map(({ body }) => body)).size !== expectedRoot.size) {
    throw new Error(`${label} duplicates or omits a PlaybackTransport declaration`);
  }
  if ([...glyphRules, ...rootRules].some(({ priority }) =>
    priority === "priority1" || priority === "priority4" || priority === undefined)) {
    throw new Error(`${label} leaked PlaybackTransport output outside priority2/priority3`);
  }
  for (const { body } of glyphRules) {
    if (/(?:^|\s)(?:height|width):\s*1\.5rem;/u.test(body)) {
      throw new Error(`${label} physicalized a PlaybackTransport logical glyph size`);
    }
  }
}
requireLayoutSurfaceDeclarationContract(compiledCss, "the compiled");
requireLayoutSurfaceLogicalAtomicContract(
  compiledCss,
  compiledJavaScript,
  "the compiled artifact",
);
requireAnimatedRailStageDeclarationContract(
  compiledCss,
  compiledJavaScript,
  "the compiled artifact",
);
requireChatDeclarationContract(
  compiledCss,
  compiledJavaScript,
  "the compiled artifact",
);
requirePlaybackTransportDeclarationContract(
  compiledCss,
  compiledJavaScript,
  "the compiled artifact",
);
requireFaderDeclarationContract(
  compiledCss,
  compiledJavaScript,
  "the compiled artifact",
);
const noticeDeclarations: readonly (readonly [RegExp, string])[] = [
  [/align-items:\s*center;/u, "root align-items"],
  [/background-color:\s*(?:#ffcc33|#fc3);/u, "root background-color"],
  [/border-bottom-color:\s*#5c1906;/u, "root border-block-end color"],
  [/border-bottom-style:\s*solid;/u, "root border-block-end style"],
  [/border-bottom-width:\s*2px;/u, "root border-block-end width"],
  [/box-shadow:\s*0\s+3px\s+12px\s+#24140059;/u, "root box-shadow"],
  [/color:\s*#241400;/u, "root color"],
  [/display:\s*flex;/u, "root display"],
  [/flex-wrap:\s*wrap;/u, "root flex-wrap"],
  [/font-family:\s*var\(--font-text,\s*system-ui,\s*sans-serif\);/u, "root font-family"],
  [/font-size:\s*var\(--text-label,\s*0?\.875rem\);/u, "root font-size"],
  [/gap:\s*var\(--space-1,\s*0?\.25rem\)\s+var\(--space-3,\s*0?\.75rem\);/u, "root gap"],
  [/top:\s*0;/u, "root logical block-start inset"],
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
requireAnimatedRailStageLegacyRemoval(legacyComponents, "src/components.css");
requirePlaybackTransportLegacyRemoval(legacyComponents, "src/components.css");
requireFaderLegacyRemoval(legacyComponents, "src/components.css");
requireChatLegacyRemoval(legacyComponents, "src/components.css");
requireGeneratedLayerContract(
  compiledCss,
  DESIGN_STYLEX_LAYERS,
  "dist/stylex.css",
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
);
requireMatch(
  uiCompiledCss,
  /@layer components\.hraness-ui\.priority3\s*\{[\s\S]*?padding-top:\s*var\(--space-5,\s*1\.25rem\);/u,
  "the pinned @hraness/ui QuietSite priority3 padding declaration",
);
requireLocalComponentsContract(legacyComponents);
requireAggregateContract(orderedStylesheet);
const rejectedMutationCount = requireMutationNegativeContracts(
  compiledCss,
  compiledJavaScript,
  uiCompiledCss,
  legacyComponents,
  orderedStylesheet,
);
forbid(
  `${compiledJavaScript}\n${compiledCss}\n${legacyComponents}\n${orderedStylesheet}`,
  new RegExp(GALLERY_LAYER_CONFLICT_SENTINEL, "u"),
  "the gallery-only cross-package layer sentinel in package output",
);

console.log(
  `StyleX package artifacts match the compiler contract and reject ${String(rejectedMutationCount)} malformed layer mutations`,
);
