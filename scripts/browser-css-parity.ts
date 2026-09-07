import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { canonicalJson, compilerContract, compilerSha256 } from "@hraness/ui/stylex-build";
import { transform } from "lightningcss";

/** A zero percentage and a zero length both anchor the image at the origin. */
export function normalizeBackgroundPosition(value: string): string {
  return value.split(",").map((layer) => {
    const position = layer.trim();
    return /^0(?:px|%)?\s+0(?:px|%)?$/u.test(position) ? "0 0" : position;
  }).join(", ");
}

export function equalBackgroundValues(
  actual: readonly string[],
  expected: readonly string[],
  positionIndex: number,
): boolean {
  return actual.length === expected.length && actual.every((value, index) => {
    const comparison = expected[index];
    if (comparison === undefined) return false;
    return index === positionIndex
      ? normalizeBackgroundPosition(value) === normalizeBackgroundPosition(comparison)
      : value === comparison;
  });
}

export interface CssColorToken {
  readonly start: number;
  readonly end: number;
  readonly value: string;
}

export interface BrowserColorRequest {
  readonly value: string;
  readonly currentColor: string;
  readonly colorScheme: string;
  readonly serialization?: "native";
}

export interface CssColorObservation {
  /** Non-color text stays byte-exact, including geometry and layer order. */
  readonly parts: readonly string[];
  readonly colors: readonly (readonly [number, number, number, number])[];
  readonly tokens?: readonly string[];
  readonly projections?: readonly (NativeColorProjection | null)[];
}

const colorHash = (value: string | Uint8Array): string => createHash("sha256").update(value).digest("hex");
const numeric = "[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?";
const okColor = new RegExp(`^(oklab|oklch)\\(\\s*(${numeric})\\s+(${numeric})\\s+(${numeric})(?:\\s*\\/\\s*(${numeric}))?\\s*\\)$`, "iu");
const labColor = new RegExp(`^lab\\((${numeric})%? (${numeric}) (${numeric})(?: / (${numeric})(%)?)?\\)$`, "u");
const projectionOptions = Object.freeze({ filename: compilerContract.css.filename, minify: false,
  targets: Object.freeze({ ...compilerContract.css.targets }) });

export function colorProjectionCompilerIdentity() {
  const path = join(dirname(dirname(createRequire(import.meta.url).resolve("lightningcss"))), "package.json");
  const source = readFileSync(path);
  const manifest: unknown = JSON.parse(source.toString("utf8"));
  assert.ok(typeof manifest === "object" && manifest !== null && "version" in manifest && manifest.version === "1.33.0", "Color projection requires exactly Lightning CSS 1.33.0");
  assert.equal(compilerContract.tools.lightningcss, "1.33.0");
  return { compilerSha256, lightningcss: "1.33.0", packageManifestSha256: colorHash(source), options: projectionOptions,
    optionsSha256: colorHash(canonicalJson(projectionOptions)) };
}

function labChannels(token: string): readonly [number, number, number, number] {
  const channels = labColor.exec(token);
  assert.ok(channels !== null, "Projected Lab color must contain only finite numeric channels");
  return [Number(channels[1]), Number(channels[2]), Number(channels[3]), channels[4] === undefined ? 1 : Number(channels[4]) / (channels[5] === "%" ? 100 : 1)];
}

/** One ordinary selector, exactly one RGB fallback followed by unconditional Lab. */
export function readProjectedColorRule(css: string): { fallback: string; projected: string } {
  const match = /^\.color-parity\s*\{\s*color:\s*(#[a-f\d]+|rgba?\([^;{}]+\));\s*color:\s*(lab\([^;{}]+\));\s*\}\s*$/u.exec(css);
  assert.ok(match !== null, "Color projection must emit exactly the ordered RGB fallback and unconditional Lab declaration");
  const fallback = match[1];
  assert.ok(fallback !== undefined, "Color projection lost its RGB fallback");
  if (fallback.startsWith("#")) assert.match(fallback, /^#(?:[a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/u, "Invalid projected hex fallback");
  else {
    const channel = `${numeric}%?`;
    assert(new RegExp(`^rgba?\\((?:${channel}\\s+${channel}\\s+${channel}(?:\\s*/\\s*${channel})?|${channel}\\s*,\\s*${channel}\\s*,\\s*${channel}(?:\\s*,\\s*${channel})?)\\)$`, "u").test(fallback), "Invalid projected RGB fallback syntax");
    const channels = fallback.slice(fallback.indexOf("(") + 1, -1).replaceAll(",", " ").replaceAll("/", " ").trim().split(/\s+/u);
    assert(channels.length === 3 || channels.length === 4, "Invalid projected RGB fallback arity");
    for (const [index, channel] of channels.entries()) {
      assert(new RegExp(`^${numeric}%?$`, "u").test(channel), "Invalid projected RGB fallback channel");
      const value = Number(channel.replace(/%$/u, ""));
      const maximum = channel.endsWith("%") ? 100 : index === 3 ? 1 : 255;
      assert(Number.isFinite(value) && value >= 0 && value <= maximum, "Projected RGB fallback would require clamping");
    }
  }
  const projected = match[2];
  assert.ok(projected !== undefined, "Color projection lost its Lab declaration");
  const values = labChannels(projected);
  assert.ok(values.every(Number.isFinite) && values[0] >= 0 && values[0] <= 100 && values[3] >= 0 && values[3] <= 1,
    "Projected Lab lightness or alpha would require clamping");
  return { fallback, projected };
}

export interface CompilerColorProjection {
  readonly original: string;
  readonly projected: string;
  readonly fallback: string;
  readonly outputCss: string;
  readonly originalSha256: string;
  readonly inputCssSha256: string;
  readonly outputCssSha256: string;
  readonly compiler: ReturnType<typeof colorProjectionCompilerIdentity>;
}
export interface NativeColorProjection {
  readonly compiler: CompilerColorProjection;
  readonly serialized: string;
  readonly xyz: readonly [number, number, number, number];
  readonly wholeSerialized: string;
  readonly wholeXyz: readonly [number, number, number, number];
  readonly fallbackSerialized: string;
  readonly fallbackXyz: readonly [number, number, number, number];
  readonly oklch?: Readonly<{
    expression: string;
    serialized: string;
    xyz: readonly [number, number, number, number];
  }>;
}

export function projectCompilerColor(original: string): CompilerColorProjection | null {
  const channels = okColor.exec(original);
  if (channels === null) return null;
  const lightness = Number(channels[2]);
  const alpha = channels[5] === undefined ? 1 : Number(channels[5]);
  assert.ok([lightness, Number(channels[3]), Number(channels[4]), alpha].every(Number.isFinite)
    && lightness >= 0 && lightness <= 1 && alpha >= 0 && alpha <= 1
    && (channels[1]?.toLowerCase() !== "oklch" || Number(channels[3]) >= 0), "Original OK color would require clamping");
  const compiler = colorProjectionCompilerIdentity();
  const input = `.color-parity { color: ${original}; }\n`;
  const result = transform({ ...projectionOptions, code: Buffer.from(input) });
  assert.equal(result.warnings.length, 0, "Pinned color projection emitted compiler warnings");
  const css = Buffer.from(result.code).toString("utf8");
  let rule: ReturnType<typeof readProjectedColorRule>;
  try { rule = readProjectedColorRule(css); }
  catch { return null; } // Other native-equivalent colors need no compiler exception.
  assert.equal(labChannels(rule.projected)[3], alpha, "Compiler projection changed alpha");
  return { original, ...rule, outputCss: css, originalSha256: colorHash(original), inputCssSha256: colorHash(input), outputCssSha256: colorHash(css), compiler };
}

export interface CssSourceColorProjection {
  readonly start: number;
  readonly end: number;
  readonly original: string;
  readonly projected: string;
  readonly originalSha256: string;
  readonly projectedSha256: string;
  readonly compilerInputSha256: string;
  readonly compilerOutputSha256: string;
}

export interface ProjectedCssColorSource {
  readonly creatorSha256: string;
  readonly projectedCss: string;
  readonly projectedSha256: string;
  readonly projections: readonly CssSourceColorProjection[];
  readonly sourceSha256: string;
}

const cssSourceProjectionContract = Object.freeze({
  algorithm: "exact-css-token-span-oklab-oklch-to-pinned-lab-v1",
  kind: "hraness-native-oracle-color-projection",
  schemaVersion: 1,
});

/**
 * Project only complete finite numeric OKLab/OKLCH tokens in authored CSS.
 * Every byte outside the recorded token spans is copied from the source. The
 * surrounding browser still evaluates var(), color-mix(), gradients and the
 * cascade, so delivery values never become reference inputs.
 */
export function projectCssOkColorSource(source: string): ProjectedCssColorSource {
  assert.ok(Buffer.byteLength(source) <= 4 * 1024 * 1024, "CSS color-projection source exceeds its byte bound");
  const projections: CssSourceColorProjection[] = [];

  function quotedEnd(start: number, end: number): number {
    const quote = source[start];
    for (let index = start + 1; index < end; index += 1) {
      if (source[index] === "\\") { index += 1; continue; }
      if (source[index] === quote) return index + 1;
    }
    throw new Error("Unterminated string in CSS color-projection source");
  }

  function commentEnd(start: number, end: number): number {
    const close = source.indexOf("*/", start + 2);
    if (close < 0 || close + 2 > end) throw new Error("Unterminated comment in CSS color-projection source");
    return close + 2;
  }

  function functionEnd(start: number, end: number): number {
    let depth = 1;
    for (let index = start + 1; index < end; index += 1) {
      const character = source[index];
      if (character === '"' || character === "'") { index = quotedEnd(index, end) - 1; continue; }
      if (character === "/" && source[index + 1] === "*") { index = commentEnd(index, end) - 1; continue; }
      if (character === "\\") { index += 1; continue; }
      if (character === "(") depth += 1;
      else if (character === ")" && --depth === 0) return index + 1;
    }
    throw new Error("Unterminated function in CSS color-projection source");
  }

  function scan(start: number, end: number, depth: number): void {
    assert.ok(depth <= 32, "CSS color-projection nesting exceeds its bound");
    for (let index = start; index < end;) {
      const character = source[index];
      if (character === '"' || character === "'") { index = quotedEnd(index, end); continue; }
      if (character === "/" && source[index + 1] === "*") { index = commentEnd(index, end); continue; }
      if (character === "\\") { index += 2; continue; }
      const identifier = /^[a-z_-][a-z0-9_-]*/iu.exec(source.slice(index, end));
      if (identifier === null) { index += 1; continue; }
      const name = identifier[0];
      const afterName = index + name.length;
      if (source[afterName] !== "(") { index = afterName; continue; }
      const afterFunction = functionEnd(afterName, end);
      if (/^url$/iu.test(name)) { index = afterFunction; continue; }
      if (/^okl(?:ab|ch)$/iu.test(name)) {
        const original = source.slice(index, afterFunction);
        const compiler = projectCompilerColor(original);
        if (compiler !== null) {
          projections.push({
            compilerInputSha256: compiler.inputCssSha256,
            compilerOutputSha256: compiler.outputCssSha256,
            end: afterFunction,
            original,
            originalSha256: compiler.originalSha256,
            projected: compiler.projected,
            projectedSha256: colorHash(compiler.projected),
            start: index,
          });
          assert.ok(projections.length <= 4096, "CSS color-projection token count exceeds its bound");
        } else scan(afterName + 1, afterFunction - 1, depth + 1);
      } else {
        scan(afterName + 1, afterFunction - 1, depth + 1);
      }
      index = afterFunction;
    }
  }

  scan(0, source.length, 0);
  let cursor = 0;
  let projectedCss = "";
  for (const projection of projections) {
    assert.ok(projection.start >= cursor && projection.end > projection.start
      && source.slice(projection.start, projection.end) === projection.original,
    "CSS color-projection token spans overlap or changed");
    projectedCss += source.slice(cursor, projection.start) + projection.projected;
    cursor = projection.end;
  }
  projectedCss += source.slice(cursor);
  const compiler = colorProjectionCompilerIdentity();
  return {
    creatorSha256: colorHash(canonicalJson({ ...cssSourceProjectionContract, compiler })),
    projectedCss,
    projectedSha256: colorHash(projectedCss),
    projections,
    sourceSha256: colorHash(source),
  };
}

/** Self-contained browser callback: apply the complete, byte-exact compiler rule. */
export function browserCompilerColorProjections(requests: readonly { outputCss: string; projected: string; fallback: string }[]) {
  if (requests.length > 1024) throw new Error("Native compiler color probe exceeds its bound");
  if (!CSS.supports("color", "lab(50% 0 0)") || !CSS.supports("color", "color(from red xyz-d65 x y z / alpha)")) throw new Error("Compiler color proof requires native Lab and relative XYZ support");
  const host = document.createElement("div");
  host.style.cssText = "all: initial !important; display: none !important; forced-color-adjust: none !important";
  const shadow = host.attachShadow({ mode: "closed" });
  const stylesheet = document.createElement("style");
  const probe = document.createElement("span");
  probe.style.setProperty("forced-color-adjust", "none", "important");
  shadow.append(stylesheet, probe); document.documentElement.append(host);
  try {
    return requests.map(({ outputCss, projected, fallback }) => {
      if (outputCss.length > 4096) throw new Error("Compiler color rule exceeds its bound");
      stylesheet.textContent = outputCss;
      if (stylesheet.textContent !== outputCss || stylesheet.sheet?.cssRules.length !== 1) throw new Error("Compiler color rule did not parse as one native rule");
      probe.style.removeProperty("color"); probe.className = "color-parity";
      const wholeSerialized = getComputedStyle(probe).color;
      probe.className = "";
      const native = (value: string) => {
        if (!CSS.supports("color", value)) throw new Error("Browser rejected a compiler color token");
        probe.style.setProperty("color", value, "important");
        return getComputedStyle(probe).color;
      };
      const serialized = native(projected);
      const fallbackSerialized = native(fallback);
      if (!serialized.startsWith("lab(") || wholeSerialized !== serialized || wholeSerialized === fallbackSerialized) throw new Error("Complete compiler rule did not select the final native Lab declaration");
      const xyz = (value: string) => {
        const result = native(`color(from ${value} xyz-d65 x y z / alpha)`);
        if (!result.startsWith("color(xyz-d65 ")) throw new Error("Projected color lost floating XYZ serialization");
        return result;
      };
      const finalXyz = xyz(serialized);
      const wholeXyz = xyz(wholeSerialized);
      if (finalXyz !== wholeXyz) throw new Error("Whole compiler rule differs from its final Lab coordinates");
      // color-mix(in oklch, ...) can serialize the compiler's Lab token in
      // OKLCH. Derive that one representation from the exact compiler input,
      // never from the observed delivery color or its RGB fallback.
      const expression = `oklch(from ${projected} l c h / alpha)`;
      const oklchSerialized = native(expression);
      if (!oklchSerialized.startsWith("oklch(")) throw new Error("Browser did not retain native relative OKLCH representation");
      return { serialized, wholeSerialized, fallbackSerialized, xyz: finalXyz, wholeXyz, fallbackXyz: xyz(fallbackSerialized),
        oklch: { expression, serialized: oklchSerialized, xyz: xyz(oklchSerialized) } };
    });
  } finally { host.remove(); }
}

const colorFunctions = /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)$/iu;
const colorProperties = new Set([
  "color", "background-color", "background-image", "border-image-source",
  "border-block-start-color", "border-block-end-color", "border-inline-start-color", "border-inline-end-color",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "outline-color", "text-decoration-color", "text-emphasis-color", "caret-color", "accent-color",
  "box-shadow", "text-shadow", "filter", "backdrop-filter", "-webkit-backdrop-filter", "list-style-image",
]);

/** Locate candidate color tokens without rewriting numbers, URLs or strings. */
export function cssColorTokens(property: string, value: string): readonly CssColorToken[] {
  if (!colorProperties.has(property)) return [];
  if (value.length > 65_536) throw new Error("Computed CSS color value exceeds its bound");
  const output: CssColorToken[] = [];
  function quotedEnd(start: number, end: number): number {
    const quote = value[start];
    for (let index = start + 1; index < end; index += 1) {
      if (value[index] === "\\") { index += 1; continue; }
      if (value[index] === quote) return index + 1;
    }
    throw new Error("Unterminated string in computed CSS");
  }
  function commentEnd(start: number, end: number): number {
    const close = value.indexOf("*/", start + 2);
    if (close < 0 || close + 2 > end) throw new Error("Unterminated comment in computed CSS");
    return close + 2;
  }
  function functionEnd(start: number, end: number): number {
    let depth = 1;
    for (let index = start + 1; index < end; index += 1) {
      const character = value[index];
      if (character === '"' || character === "'") { index = quotedEnd(index, end) - 1; continue; }
      if (character === "/" && value[index + 1] === "*") { index = commentEnd(index, end) - 1; continue; }
      if (character === "\\") { index += 1; continue; }
      if (character === "(") depth += 1;
      if (character === ")" && --depth === 0) return index + 1;
    }
    throw new Error("Unterminated function in computed CSS");
  }
  function scan(start: number, end: number, depth: number): void {
    if (depth > 32) throw new Error("Computed CSS nesting exceeds its bound");
    for (let index = start; index < end;) {
      const character = value[index];
      if (character === '"' || character === "'") { index = quotedEnd(index, end); continue; }
      if (character === "/" && value[index + 1] === "*") { index = commentEnd(index, end); continue; }
      if (character === "\\") { index += 2; continue; }
      const token = /^(?:#[a-z0-9]+|[a-z_-][a-z0-9_-]*)/iu.exec(value.slice(index, end));
      if (token === null) { index += 1; continue; }
      const name = token[0];
      const afterName = index + name.length;
      if (value[afterName] === "(") {
        const afterFunction = functionEnd(afterName, end);
        if (colorFunctions.test(name)) output.push({ start: index, end: afterFunction, value: value.slice(index, afterFunction) });
        else if (!/^url$/iu.test(name)) scan(afterName + 1, afterFunction - 1, depth + 1);
        index = afterFunction;
      } else {
        output.push({ start: index, end: afterName, value: name });
        index = afterName;
      }
      if (output.length > 4096) throw new Error("Computed CSS color token count exceeds its bound");
    }
  }
  scan(0, value.length, 0);
  return output;
}

/**
 * Execute directly in the browser realm. Relative color conversion retains
 * floating XYZ coordinates, including negative and above-one values, without
 * display-gamut mapping, canvas pixels or 8-bit channel quantization.
 * https://www.w3.org/TR/css-color-5/#relative-color-function
 */
export function browserCssColors(requests: readonly BrowserColorRequest[]): readonly (string | null)[] {
  if (requests.length > 20_000) throw new Error("Browser color request count exceeds its bound");
  if (!CSS.supports("color", "color(from red xyz-d65 x y z / alpha)")) {
    throw new Error("Browser must support relative color conversion to XYZ D65");
  }
  const host = document.createElement("div");
  const probe = document.createElement("span");
  host.style.cssText = "all: initial !important; display: none !important; forced-color-adjust: none !important";
  probe.style.cssText = "all: initial !important; forced-color-adjust: none !important";
  host.append(probe);
  document.documentElement.append(host);
  const cache = new Map<string, string | null>();
  try {
    return requests.map(({ value, currentColor, colorScheme, serialization }) => {
      const key = JSON.stringify([value, currentColor, colorScheme, serialization]);
      if (cache.has(key)) return cache.get(key) ?? null;
      if (/^(?:inherit|initial|unset|revert|revert-layer)$/iu.test(value) || !CSS.supports("color", value)) {
        cache.set(key, null);
        return null;
      }
      if (!CSS.supports("color", currentColor) || !CSS.supports("color-scheme", colorScheme)) {
        throw new Error("Color observation has an invalid computed context");
      }
      host.style.setProperty("color", currentColor, "important");
      host.style.setProperty("color-scheme", colorScheme, "important");
      probe.style.setProperty("color-scheme", colorScheme, "important");
      probe.style.removeProperty("color");
      probe.style.setProperty("color", serialization === "native" ? value : `color(from ${value} xyz-d65 x y z / alpha)`, "important");
      if (probe.style.getPropertyValue("color") === "") throw new Error(`Browser rejected relative color conversion: ${value}`);
      const converted = getComputedStyle(probe).color;
      if (serialization !== "native" && !converted.startsWith("color(xyz-d65 ")) throw new Error(`Browser did not serialize floating XYZ D65: ${converted}`);
      cache.set(key, converted);
      return converted;
    });
  } finally { host.remove(); }
}

export function observeCssColors(
  value: string,
  tokens: readonly CssColorToken[],
  converted: readonly (string | null)[],
  serialized?: readonly (string | null)[],
): CssColorObservation {
  if (tokens.length !== converted.length) throw new Error("CSS color conversion inventory differs");
  if (serialized !== undefined && tokens.length !== serialized.length) throw new Error("CSS color serialization inventory differs");
  const parts: string[] = [];
  const colors: [number, number, number, number][] = [];
  const nativeTokens: string[] = [];
  const number = "([+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?)";
  const xyz = new RegExp(`^color\\(xyz-d65 ${number} ${number} ${number}(?: / ${number})?\\)$`, "iu");
  let cursor = 0;
  let previousEnd = 0;
  tokens.forEach((token, index) => {
    if (!Number.isSafeInteger(token.start) || !Number.isSafeInteger(token.end)
      || token.start < previousEnd || token.end <= token.start || token.end > value.length
      || value.slice(token.start, token.end) !== token.value) throw new Error("Invalid CSS color token boundary");
    previousEnd = token.end;
    const normalized = converted[index];
    if (normalized === null) return;
    if (normalized === undefined) throw new Error("Missing CSS color conversion");
    const match = xyz.exec(normalized);
    if (match === null) throw new Error(`Non-numeric native XYZ color: ${normalized}`);
    const coordinates: [number, number, number, number] = [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])];
    if (!coordinates.every(Number.isFinite) || coordinates[3] < 0 || coordinates[3] > 1) throw new Error("Invalid native XYZ coordinates");
    parts.push(value.slice(cursor, token.start));
    colors.push(coordinates);
    const nativeToken = serialized === undefined ? token.value : serialized[index];
    if (typeof nativeToken !== "string" || nativeToken.length === 0) throw new Error("Native color token is missing");
    nativeTokens.push(nativeToken);
    cursor = token.end;
  });
  parts.push(value.slice(cursor));
  return { parts, colors, tokens: nativeTokens };
}

// Native serialization bounds only. Compiler color-conversion drift is a
// distinct one-way exact-token proof below, never a wider numeric tolerance.
export const CSS_COLOR_XYZ_EPSILON = 0.000002;
export const CSS_COLOR_ALPHA_EPSILON = 0.000001;

function validCoordinates(color: readonly number[]): boolean {
  const alpha = color[3];
  return color.length === 4 && alpha !== undefined && color.every(Number.isFinite) && alpha >= 0 && alpha <= 1;
}

function coordinate(color: readonly number[], index: number): number {
  const value = color[index];
  if (value === undefined) throw new Error("Missing native color coordinate");
  return value;
}

export function equalCssColors(actual: CssColorObservation, expected: CssColorObservation): boolean {
  return actual.parts.length === actual.colors.length + 1
    && expected.parts.length === expected.colors.length + 1
    && actual.parts.length === expected.parts.length
    && actual.parts.every((part, index) => part === expected.parts[index])
    && actual.colors.length === expected.colors.length
    && actual.colors.every((color, index) => {
      const reference = expected.colors[index];
      return reference !== undefined && validCoordinates(color) && validCoordinates(reference)
        && color.every((channel, channelIndex) => {
          const other = reference[channelIndex];
          return other !== undefined && Number.isFinite(channel) && Number.isFinite(other)
            && Math.abs(channel - other) <= (channelIndex === 3 ? CSS_COLOR_ALPHA_EPSILON : CSS_COLOR_XYZ_EPSILON);
        });
    });
}

export function proveCssColorParity(actual: CssColorObservation, original: CssColorObservation) {
  if (actual.parts.length !== actual.colors.length + 1 || original.parts.length !== original.colors.length + 1
    || actual.parts.length !== original.parts.length || actual.parts.some((part, index) => part !== original.parts[index])
    || actual.colors.length !== original.colors.length) return null;
  const projections = [];
  for (let index = 0; index < actual.colors.length; index += 1) {
    const actualXyz = actual.colors[index];
    const originalXyz = original.colors[index];
    if (actualXyz === undefined || originalXyz === undefined) return null;
    if (!validCoordinates(actualXyz) || !validCoordinates(originalXyz)) return null;
    if (equalCssColors({ parts: ["", ""], colors: [actualXyz] }, { parts: ["", ""], colors: [originalXyz] })) continue;
    const projection = original.projections?.[index];
    const originalToken = original.tokens?.[index];
    const actualToken = actual.tokens?.[index];
    if (projection === undefined || projection === null || originalToken === undefined || actualToken === undefined
      || projection.compiler.original !== originalToken || labColor.exec(projection.serialized) === null
      || projection.wholeSerialized !== projection.serialized || projection.wholeSerialized === projection.fallbackSerialized
      || JSON.stringify(projection.wholeXyz) !== JSON.stringify(projection.xyz)
      || !validCoordinates(projection.xyz) || !validCoordinates(projection.wholeXyz) || !validCoordinates(projection.fallbackXyz)) return null;
    // Re-derive only the original's projection. Delivery colors are never compiled.
    if (canonicalJson(projectCompilerColor(originalToken)) !== canonicalJson(projection.compiler)) return null;
    let representation: "lab" | "oklch" = "lab";
    let nativeVariant: (NonNullable<NativeColorProjection["oklch"]> & { deltaFromLab: number[] }) | null = null;
    if (actualToken !== projection.serialized || JSON.stringify(actualXyz) !== JSON.stringify(projection.xyz)) {
      const variant = projection.oklch;
      const channels = okColor.exec(variant?.serialized ?? "");
      if (variant === undefined || variant.expression !== `oklch(from ${projection.compiler.projected} l c h / alpha)`
        || channels === null || channels[1] !== "oklch"
        || ![Number(channels[2]), Number(channels[3]), Number(channels[4])].every(Number.isFinite)
        || Number(channels[2]) < 0 || Number(channels[2]) > 1 || Number(channels[3]) < 0
        || Number(channels[5] ?? 1) !== labChannels(projection.serialized)[3]
        || actualToken !== variant.serialized || JSON.stringify(actualXyz) !== JSON.stringify(variant.xyz)
        || variant.xyz[3] !== projection.xyz[3]
        || !equalCssColors({ parts: ["", ""], colors: [variant.xyz] }, { parts: ["", ""], colors: [projection.xyz] })) return null;
      representation = "oklch";
      nativeVariant = { ...variant, deltaFromLab: variant.xyz.map((channel, index) => channel - coordinate(projection.xyz, index)) };
    }
    projections.push({ index, nativeEquivalent: false, representation, nativeVariant, originalToken, actualToken, projectedToken: projection.serialized,
      originalXyz, actualXyz, projectedXyz: projection.xyz,
      wholeRuleToken: projection.wholeSerialized, wholeRuleXyz: projection.wholeXyz,
      fallbackToken: projection.fallbackSerialized, fallbackXyz: projection.fallbackXyz,
      actualDelta: actualXyz.map((channel, index) => channel - coordinate(originalXyz, index)),
      projectedDelta: projection.xyz.map((channel, index) => channel - coordinate(originalXyz, index)), compiler: projection.compiler });
  }
  return projections;
}
