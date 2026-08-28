import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { chromium, type Page } from "playwright-core";

import { colors } from "../src/index.js";
import { themeColorSyncActiveAttribute } from "../src/react/theme-color-sync.js";

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

function invariant(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
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

function requireChatRuleAncestry(
  rule: CssRuleRange,
  label: string,
  compact: boolean,
): void {
  const layers = rule.ancestry.filter(({ name }) => name === "layer");
  const conditions = rule.ancestry.filter(({ name }) => name !== "layer");
  invariant(
    layers.length === 1
      && layers[0]?.prelude === "components.hraness-design-kit.priority3",
    `${label} placed a Chat declaration outside the sole design-kit priority3 layer.`,
  );
  invariant(
    compact
      ? conditions.length === 1
        && conditions[0]?.name === "media"
        && /^\(width\s*<=\s*48rem\)$/u.test(conditions[0].prelude)
      : conditions.length === 0,
    `${label} placed a Chat declaration under the wrong conditional ancestry.`,
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
  return [...new Map(rules.map((rule) => [`${String(rule.start)}:${String(rule.end)}`, rule])).values()];
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
  requireChatRuleAncestry(wideMessageRule, label, false);
  requireChatRuleAncestry(wideComposerRule, label, false);
  requireChatRuleAncestry(compactRule, label, true);
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
  requireChatRuleAncestry(headerMarginRule, label, false);
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
  const [builtCss, stylexCss, compiledReactJavaScript] = await Promise.all([
    Bun.file(join(work, stylesheet)).text(),
    Bun.file(join(repository, "dist/stylex.css")).text(),
    Bun.file(join(repository, "dist/react/index.js")).text(),
  ]);
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
  for (const layerName of [
    "components.hraness-ui.priority1",
    "components.hraness-ui.priority2",
    "components.hraness-ui.priority3",
    "components.hraness-design-kit.priority1",
    "components.hraness-design-kit.priority2",
    "components.hraness-design-kit.priority3",
    "components.hraness-design-kit.priority4",
  ]) {
    const escaped = layerName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const count = builtCss.match(new RegExp(`@layer\\s+${escaped}\\s*\\{`, "gu"))?.length ?? 0;
    invariant(
      count === 1,
      `Gallery CSS contains ${String(count)} ${layerName} blocks instead of one.`,
    );
  }
  invariant(
    /@layer\s+components\.hraness-ui\.priority3\s*\{[\s\S]*?padding-top:\s*var\(--space-5,\s*1\.25rem\)/u.test(builtCss),
    "Gallery CSS lost the pinned UI QuietSite priority3 output.",
  );
  invariant(
    /@layer\s+components\.hraness-design-kit\.priority2\s*\{[\s\S]*?gap:\s*var\(--space-2\)/u.test(builtCss)
      && /@layer\s+components\.hraness-design-kit\.priority3\s*\{[\s\S]*?block-size:\s*1\.5rem/u.test(builtCss)
      && /@layer\s+components\.hraness-design-kit\.priority3\s*\{[\s\S]*?inline-size:\s*1\.5rem/u.test(builtCss)
      && !/@layer\s+components\.hraness-design-kit\.priority5/u.test(builtCss),
    "Gallery CSS lost the PlaybackTransport priority2/priority3 logical recipe.",
  );
  invariant(
    /--hraness-design-fader-thumb-block-size:\s*1\.125rem/u.test(builtCss)
      && /--hraness-design-fader-thumb-block-size:\s*\.?75rem/u.test(builtCss)
      && /--hraness-design-fader-thumb-inline-size:\s*1\.75rem/u.test(builtCss)
      && /--hraness-design-fader-thumb-inline-size:\s*1\.5rem/u.test(builtCss)
      && /--hraness-design-fader-track-length:\s*6rem/u.test(builtCss)
      && /inline-size:\s*4px/u.test(builtCss)
      && /outline-offset:\s*3px/u.test(builtCss)
      && !/@layer\s+components\.hraness-design-kit\.priority(?:5|6)/u.test(builtCss),
    "Gallery CSS lost the Fader default, compact, rail, or focus recipe.",
  );
  requireChatStaticPresentation(
    stylexCss,
    compiledReactJavaScript,
    "Gallery design-kit StyleX CSS",
  );
  requireChatStaticPresentation(builtCss, compiledReactJavaScript, "Gallery CSS");
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
        await page.waitForFunction(() =>
          document.querySelector(
            '[data-gallery-fader="vertical"] .hraness-design-fader__thumb',
          )?.hasAttribute("data-focus-visible"));
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
        await page.waitForFunction(() =>
          document.querySelector(
            '[data-gallery-fader="horizontal"] .hraness-design-fader__thumb',
          )?.hasAttribute("data-focus-visible"));
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
        const appearanceChoices = await appearanceMenu
          .locator('[role="menuitemradio"]')
          .allTextContents();
        invariant(
          appearanceChoices.map((choice) => choice.trim()).join("\0") === "Light\0Dark\0System",
          `${layout.id}: appearance choices are ${JSON.stringify(appearanceChoices)}`,
        );
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await page.locator('html[data-theme="dark"]').waitFor();
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
