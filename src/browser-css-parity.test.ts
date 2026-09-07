import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { compilerContract } from "@hraness/ui/stylex-build";
import { transform } from "lightningcss";

import {
  cssColorTokens, equalBackgroundValues, equalCssColors, normalizeBackgroundPosition, observeCssColors,
  colorProjectionCompilerIdentity, projectCompilerColor, projectCssOkColorSource, proveCssColorParity, readProjectedColorRule,
} from "../scripts/browser-css-parity.js";

test("background parity accepts only equivalent zero-origin serialization", () => {
  for (const value of ["0 0", "0% 0%", "0px 0px", "0% 0px", "0px 0%"])
    expect(normalizeBackgroundPosition(value)).toBe("0 0");
  expect(normalizeBackgroundPosition("0% 0%, 0px 0px")).toBe("0 0, 0 0");
  for (const value of ["1% 0%", "0% 1px", "0px 0%, 1px 0px", "left top", "0em 0em"])
    expect(normalizeBackgroundPosition(value)).not.toBe("0 0");
});

test("background parity preserves layer counts and all other property contracts", () => {
  expect(equalBackgroundValues(["red", "0px 0px"], ["red", "0% 0%"], 1)).toBe(true);
  expect(equalBackgroundValues(["blue", "0px 0px"], ["red", "0% 0%"], 1)).toBe(false);
  expect(equalBackgroundValues(["0px 0px"], ["0% 0%, 0% 0%"], 0)).toBe(false);
  expect(equalBackgroundValues(["0px 0px"], ["0% 0%", "repeat"], 0)).toBe(false);
  expect(equalBackgroundValues(["1px 0px"], ["1% 0%"], 0)).toBe(false);
  expect(equalBackgroundValues(["0px 0px"], ["0% 0%"], 1)).toBe(false);
});

const redXyz = "color(xyz-d65 0.412391 0.212639 0.019331)";
const blueXyz = "color(xyz-d65 0.180481 0.072192 0.950532)";
function colored(property: string, value: string, color: string) {
  const tokens = cssColorTokens(property, value);
  return observeCssColors(value, tokens, tokens.map((token) => /^(?:rgb|lab|oklch|color)\(/u.test(token.value) ? color : null));
}
function required<T>(value: T | null | undefined): T {
  expect(value).not.toBeNull();
  expect(value).not.toBeUndefined();
  if (value === null || value === undefined) throw new Error("Missing color parity test value");
  return value;
}

test("color token boundaries preserve nested geometry, interpolation spaces, strings and URLs", () => {
  const value = 'linear-gradient(90deg in oklch, lab(45.417 18.6059 -73.635) 10%, color-mix(in srgb, red, blue) 90%), url("rgb(1,2,3).svg")';
  const tokens = cssColorTokens("background-image", value);
  expect(tokens.filter(({ value }) => value.includes("(")).map(({ value }) => value)).toEqual([
    "lab(45.417 18.6059 -73.635)", "color-mix(in srgb, red, blue)",
  ]);
  expect(tokens.some(({ value }) => value.includes(".svg"))).toBe(false);
  for (const token of tokens) expect(value.slice(token.start, token.end)).toBe(token.value);
  expect(cssColorTokens("content", '"red rgb(1,2,3)"')).toEqual([]);
  expect(cssColorTokens("font-family", "red, blue")).toEqual([]);
  expect(cssColorTokens("box-shadow", 'url(rgb(1,2,3)) /* blue */ "red"')).toEqual([]);
  expect(() => cssColorTokens("background-image", "linear-gradient(red, blue")).toThrow();
  expect(() => cssColorTokens("background-image", 'url("unterminated)')).toThrow();
});

test("numeric XYZ comparison accepts equivalent browser records with serialization-scale error only", () => {
  const a = colored("color", "rgb(255, 0, 0)", redXyz);
  const b = colored("color", "color(srgb 1 0 0)", "color(xyz-d65 0.4123908 0.212639 0.0193308 / 1)");
  expect(equalCssColors(a, b)).toBe(true);
  expect(equalCssColors(a, colored("color", "rgb(0, 0, 255)", blueXyz))).toBe(false);
  for (const different of [
    "color(xyz-d65 0.412391 0.212649 0.019331)",
    "color(xyz-d65 0.412401 0.212639 0.019331)",
    "color(xyz-d65 0.412391 0.212639 0.019341)",
    "color(xyz-d65 0.412391 0.212639 0.019331 / 0.99999)",
  ]) expect(equalCssColors(a, colored("color", "color(srgb 1 0 0)", different))).toBe(false);
});

test("color comparison retains alpha and out-of-gamut channels without clamping or premultiplication", () => {
  const extended = colored("color", "color(xyz-d65 -0.25 1.5 2 / .5)", "color(xyz-d65 -0.25 1.5 2 / 0.5)");
  expect(extended.colors).toEqual([[-0.25, 1.5, 2, 0.5]]);
  expect(equalCssColors(extended, colored("color", "rgb(0,255,255)", "color(xyz-d65 0 1 1 / 0.5)"))).toBe(false);
  const invisible = colored("color", "rgb(255 0 0 / 0)", "color(xyz-d65 0.412391 0.212639 0.019331 / 0)");
  expect(equalCssColors(invisible, colored("color", "rgb(0 0 255 / 0)", "color(xyz-d65 0.180481 0.072192 0.950532 / 0)"))).toBe(false);
});

test("nested color normalization cannot erase gradient/shadow geometry, layer counts or order", () => {
  const a = colored("box-shadow", "lab(45.417 18.6059 -73.635) 0px 1px 2px", redXyz);
  const b = colored("box-shadow", "oklch(0.55 0.21 262) 0px 1px 2px", redXyz);
  expect(equalCssColors(a, b)).toBe(true);
  for (const value of [
    "oklch(0.55 0.21 262) 0px 2px 2px", "inset oklch(0.55 0.21 262) 0px 1px 2px",
    "oklch(0.55 0.21 262) 0px 1px 2px, oklch(0.55 0.21 262) 0px 1px 2px",
  ]) expect(equalCssColors(a, colored("box-shadow", value, redXyz))).toBe(false);
  const gradient = colored("background-image", "linear-gradient(90deg in srgb, rgb(255 0 0) 10%, rgb(0 0 255) 90%)", redXyz);
  expect(equalCssColors(gradient, colored("background-image", "linear-gradient(90deg in oklch, rgb(255 0 0) 10%, rgb(0 0 255) 90%)", redXyz))).toBe(false);
  expect(equalCssColors({ parts: ["", " ", ""], colors: [[1, 0, 0, 1], [0, 0, 1, 1]] },
    { parts: ["", " ", ""], colors: [[0, 0, 1, 1], [1, 0, 0, 1]] })).toBe(false);
});

test("malformed, missing, nonfinite or reordered native color records fail closed", () => {
  const tokens = cssColorTokens("color", "red");
  for (const value of ["rgb(255, 0, 0)", "color(xyz-d65 none 0 0)", "color(xyz-d65 NaN 0 0)", "color(xyz-d65 1e999 0 0)", "color(xyz-d65 0 0 0 / 1.01)"]) {
    expect(() => observeCssColors("red", tokens, [value])).toThrow();
  }
  expect(() => observeCssColors("red", tokens, [])).toThrow();
  expect(() => observeCssColors("red", [{ start: 0, end: 3, value: "blue" }], [redXyz])).toThrow();
  expect(() => observeCssColors("red red", [{ start: 4, end: 7, value: "red" }, { start: 0, end: 3, value: "red" }], [redXyz, redXyz])).toThrow();
  expect(equalCssColors({ parts: ["", ""], colors: [[NaN, 0, 0, 1]] }, { parts: ["", ""], colors: [[NaN, 0, 0, 1]] })).toBe(false);
  expect(observeCssColors("none", cssColorTokens("background-image", "none"), [null])).toEqual({ parts: ["none"], colors: [], tokens: [] });
});

const originalToken = "oklch(0.55 0.21 262)";
const originalXyz = "color(xyz-d65 0.201977 0.157482 0.793032)";
const projectedXyz = "color(xyz-d65 0.201953 0.157476 0.792927)";
const serializedLab = "lab(45.417 18.6059 -73.635)";
const retainedCompilerCss = ".color-parity {\n  color: #2366e9;\n  color: lab(45.417% 18.6059 -73.635);\n}\n";
test("retained OKLCH token has one exact fallback followed by unconditional pinned compiler Lab", () => {
  const result = transform({ filename: compilerContract.css.filename, minify: false, targets: compilerContract.css.targets,
    code: Buffer.from(`.color-parity { color: ${originalToken}; }\n`) });
  expect(result.warnings).toEqual([]);
  expect(Buffer.from(result.code).toString("utf8")).toBe(retainedCompilerCss);
  expect(readProjectedColorRule(retainedCompilerCss)).toEqual({ fallback: "#2366e9", projected: "lab(45.417% 18.6059 -73.635)" });
});

test("source projection rewrites only exact numeric OK color spans with pinned compiler receipts", () => {
  const first = "oklch(0.55 0.21 262)";
  const second = "OKLab( 0.55  0.1 -0.1 / .5 )";
  const nested = "oklch(0.6 0.2 120)";
  const source = `.probe {
  --accent: ${first};
  background: color-mix(in oklch, ${second} 18%, transparent);
  --relative: oklch(from ${nested} l c h);
  content: "${first}";
  mask-image: url(data:image/svg+xml,${first});
  --dynamic: oklch(var(--lightness) .2 20);
}
/* ${second} */
`;
  const firstProjection = projectCompilerColor(first);
  const secondProjection = projectCompilerColor(second);
  const nestedProjection = projectCompilerColor(nested);
  expect(firstProjection).not.toBeNull();
  expect(secondProjection).not.toBeNull();
  expect(nestedProjection).not.toBeNull();
  if (firstProjection === null || secondProjection === null || nestedProjection === null) {
    throw new Error("Missing source projection fixture");
  }
  const projected = projectCssOkColorSource(source);
  expect(projected.projections).toHaveLength(3);
  expect(projected.projectedCss).toBe(source
    .replace(first, firstProjection.projected)
    .replace(second, secondProjection.projected)
    .replace(nested, nestedProjection.projected));
  expect(projected.projectedCss).toContain(`content: "${first}"`);
  expect(projected.projectedCss).toContain(`url(data:image/svg+xml,${first})`);
  expect(projected.projectedCss).toContain("oklch(var(--lightness) .2 20)");
  expect(projected.projections.map(({ original }) => original)).toEqual([first, second, nested]);
  for (const receipt of projected.projections) {
    expect(source.slice(receipt.start, receipt.end)).toBe(receipt.original);
    expect(receipt.originalSha256).toBe(createHash("sha256").update(receipt.original).digest("hex"));
    expect(receipt.projectedSha256).toBe(createHash("sha256").update(receipt.projected).digest("hex"));
    expect(receipt.compilerInputSha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(receipt.compilerOutputSha256).toMatch(/^[a-f0-9]{64}$/u);
  }
  expect(projected.sourceSha256).toBe(createHash("sha256").update(source).digest("hex"));
  expect(projected.projectedSha256).toBe(createHash("sha256").update(projected.projectedCss).digest("hex"));
  expect(projected.creatorSha256).toMatch(/^[a-f0-9]{64}$/u);
  expect(() => projectCssOkColorSource(".x { color: oklch(0.5 0.2 20); /* unterminated"))
    .toThrow("Unterminated comment");
});
function projectedOriginal(property = "color", value = originalToken) {
  const original = colored(property, value, originalXyz);
  const compiler = projectCompilerColor(originalToken);
  expect(compiler).not.toBeNull();
  if (compiler === null) throw new Error("Missing exact pinned projection");
  // Synthetic whole-rule selection records test the pure proof boundary. The
  // native probe obtains all three records independently in the browser.
  const projection = { compiler, serialized: serializedLab, xyz: [0.201953, 0.157476, 0.792927, 1] as const,
    wholeSerialized: serializedLab, wholeXyz: [0.201953, 0.157476, 0.792927, 1] as const,
    fallbackSerialized: "rgb(35, 102, 233)", fallbackXyz: [0.201, 0.157, 0.792, 1] as const };
  return { ...original, projections: original.colors.map(() => projection) };
}

test("pinned projection identifies real compiler conversion drift instead of widening native equality", () => {
  const original = projectedOriginal();
  const projection = required(original.projections[0]);
  expect(projection.compiler.projected).toBe("lab(45.417% 18.6059 -73.635)");
  expect(projection.compiler.fallback).toBe("#2366e9");
  expect(projection.compiler.outputCss).toBe(retainedCompilerCss);
  const actual = colored("color", projection.serialized, projectedXyz);
  expect(equalCssColors(actual, original)).toBe(false);
  const proof = proveCssColorParity(actual, original);
  expect(proof).toHaveLength(1);
  expect(proof?.[0]?.nativeEquivalent).toBe(false);
  expect(proof?.[0]?.actualDelta[2]).toBeCloseTo(-0.000105, 12);
  expect(proof?.[0]?.actualXyz).toEqual(proof?.[0]?.projectedXyz);
  expect(proof?.[0]?.wholeRuleToken).toBe(proof?.[0]?.actualToken);
  expect(proof?.[0]?.wholeRuleToken).not.toBe(proof?.[0]?.fallbackToken);
  expect(proof?.[0]?.wholeRuleXyz).toEqual(proof?.[0]?.projectedXyz);
  expect(proveCssColorParity(original, actual)).toBeNull();
  const identity = colorProjectionCompilerIdentity();
  expect(identity.lightningcss).toBe("1.33.0");
  expect(identity.options).toEqual({ filename: "stylex.css", minify: false, targets: { chrome: 7143424, firefox: 7536640, ios_saf: 1049600, safari: 1049600 } });
  for (const key of [identity.compilerSha256, identity.optionsSha256, identity.packageManifestSha256, projection.compiler.inputCssSha256, projection.compiler.outputCssSha256]) expect(key).toMatch(/^[a-f0-9]{64}$/u);
});

test("one-way compiler proof rejects changed L/C/H/alpha, nearby Lab tokens and forged provenance", () => {
  const original = projectedOriginal();
  for (const changed of ["oklch(0.56 0.21 262)", "oklch(0.55 0.22 262)", "oklch(0.55 0.21 263)", "oklch(0.55 0.21 262 / 0.5)"]) {
    const mutant = projectCompilerColor(changed);
    expect(mutant).not.toBeNull();
    expect(mutant?.projected).not.toBe(required(original.projections[0]).serialized);
    // Identical supplied coordinates still cannot authorize a different token.
    expect(proveCssColorParity(colored("color", required(mutant).projected, projectedXyz), original)).toBeNull();
  }
  expect(proveCssColorParity(colored("color", "lab(45.417001 18.6059 -73.635)", projectedXyz), original)).toBeNull();
  const native = required(original.projections[0]);
  const actual = colored("color", native.serialized, projectedXyz);
  expect(proveCssColorParity(actual, { ...original, projections: [{ ...native, compiler: { ...native.compiler, outputCssSha256: "0".repeat(64) } }] })).toBeNull();
  expect(proveCssColorParity(actual, { ...original, projections: [{ ...native, xyz: [0.201953, 0.157476, 0.792928, 1] }] })).toBeNull();
  expect(proveCssColorParity(actual, { ...original, projections: [{ ...native, wholeSerialized: native.fallbackSerialized }] })).toBeNull();
  expect(proveCssColorParity(actual, { ...original, projections: [{ ...native, fallbackSerialized: native.serialized }] })).toBeNull();
  expect(proveCssColorParity(actual, { ...original, projections: [{ ...native, wholeXyz: [0.201953, 0.157476, 0.792928, 1] }] })).toBeNull();
  expect(proveCssColorParity(colored("color", native.fallbackSerialized, projectedXyz), original)).toBeNull();
  expect(proveCssColorParity(actual, { ...original, projections: [{ ...native, compiler: { ...native.compiler, outputCss: retainedCompilerCss.replace("#2366e9", "#2366e8") } }] })).toBeNull();
  expect(proveCssColorParity(actual, { ...original, colors: [[NaN, 0.157482, 0.793032, 1]] })).toBeNull();
  expect(proveCssColorParity(actual, { ...original, projections: [{ ...native, fallbackXyz: [0.201, 0.157, 0.792, 1.1] }] })).toBeNull();
  expect(proveCssColorParity(actual, { ...original, projections: [{ ...native, compiler: { ...native.compiler, compiler: { ...native.compiler.compiler, optionsSha256: "0".repeat(64) } } }] })).toBeNull();
});

test("projection excludes reordered, extra, conditional, malformed and clamped output shapes", () => {
  for (const source of [
    ".color-parity { color: red; }", ".color-parity { color: lab(45 1 2); color: #123; }",
    ".color-parity { color: lab(45 1 2); color: lab(46 1 2); }",
    `@supports (color: lab(0 0 0)) { ${retainedCompilerCss} }`, `@layer color { ${retainedCompilerCss} }`,
    retainedCompilerCss.replace(".color-parity", ".color-parity, .other"),
    retainedCompilerCss.replace("}\n", "background: red; }\n"),
    retainedCompilerCss + retainedCompilerCss,
    retainedCompilerCss.replace("45.417%", "110%"),
    retainedCompilerCss.replace("-73.635)", "-73.635 / 1.1)"),
    retainedCompilerCss.replace("45.417%", "none"),
    retainedCompilerCss.replace("#2366e9", "rgb(300 0 0)"),
    retainedCompilerCss.replace("#2366e9", "rgb(-1 0 0)"),
    retainedCompilerCss.replace("#2366e9", "rgb(0 0 0 / 1.1)"),
    retainedCompilerCss.replace("#2366e9", "rgb(0, 0 / 0, 1)"),
    retainedCompilerCss.replace("#2366e9", "rgb(0 0 0 1)"),
    retainedCompilerCss.replace("#2366e9", "#12345"),
  ]) expect(() => readProjectedColorRule(source)).toThrow();
  for (const fallback of ["rgb(35 102 233)", "rgb(35, 102, 233)", "rgba(35, 102, 233, 0.5)", "rgb(10% 20% 30% / 50%)"])
    expect(readProjectedColorRule(retainedCompilerCss.replace("#2366e9", fallback)).fallback).toBe(fallback);
  for (const token of ["oklch(1.1 0.21 262)", "oklch(0.55 -0.21 262)", "oklab(0.5 0 0 / 1.1)"]) expect(() => projectCompilerColor(token)).toThrow();
  for (const token of ["rgb(255 0 0)", "color(xyz-d65 -0.25 1.5 2)", "color-mix(in oklch, red, blue)", "oklch(from red l c h)"]) expect(projectCompilerColor(token)).toBeNull();
  expect(projectCompilerColor("oklch(0.7 0.4 40)")?.projected).toMatch(/^lab\(/u);
  expect(proveCssColorParity(colored("color", "rgb(255 0 0)", redXyz), projectedOriginal())).toBeNull();
});

test("nested compiler proof preserves geometry, interpolation, color order and layer counts", () => {
  const original = projectedOriginal("box-shadow", `${originalToken} 0px 1px 2px`);
  const lab = required(original.projections[0]).serialized;
  expect(proveCssColorParity(colored("box-shadow", `${lab} 0px 1px 2px`, projectedXyz), original)).toHaveLength(1);
  for (const value of [`${lab} 0px 2px 2px`, `inset ${lab} 0px 1px 2px`, `${lab} 0px 1px 2px, ${lab} 0px 1px 2px`]) expect(proveCssColorParity(colored("box-shadow", value, projectedXyz), original)).toBeNull();
  const gradient = projectedOriginal("background-image", `linear-gradient(90deg in srgb, ${originalToken} 0%, ${originalToken} 100%)`);
  expect(proveCssColorParity(colored("background-image", `linear-gradient(90deg in srgb, ${lab} 0%, ${lab} 100%)`, projectedXyz), gradient)).toHaveLength(2);
  expect(proveCssColorParity(colored("background-image", `linear-gradient(90deg in oklch, ${lab} 0%, ${lab} 100%)`, projectedXyz), gradient)).toBeNull();
  expect(proveCssColorParity(colored("background-image", `linear-gradient(90deg in srgb, ${lab} 0%, rgb(35, 102, 233) 100%)`, projectedXyz), gradient)).toBeNull();
});

const mixedOriginalToken = "oklch(0.55 0.21 262 / 0.1)";
const mixedActualToken = "oklch(0.54999 0.209982 261.996 / 0.1)";
const mixedActualXyz = "color(xyz-d65 0.201953 0.157476 0.792926 / 0.1)";
function mixedOriginal(property = "color", value = mixedOriginalToken) {
  const original = colored(property, value, "color(xyz-d65 0.201977 0.157482 0.793032 / 0.1)");
  const compiler = projectCompilerColor(mixedOriginalToken);
  if (compiler === null) throw new Error("Missing exact alpha compiler projection");
  const projection = { compiler, serialized: "lab(45.417 18.6059 -73.635 / 0.1)", xyz: [0.201953, 0.157476, 0.792927, 0.1] as const,
    wholeSerialized: "lab(45.417 18.6059 -73.635 / 0.1)", wholeXyz: [0.201953, 0.157476, 0.792927, 0.1] as const,
    fallbackSerialized: "rgba(35, 102, 233, 0.1)", fallbackXyz: [0.201, 0.157, 0.792, 0.1] as const,
    oklch: { expression: `oklch(from ${compiler.projected} l c h / alpha)`, serialized: mixedActualToken, xyz: [0.201953, 0.157476, 0.792926, 0.1] as const } };
  return { ...original, projections: original.colors.map(() => projection) };
}

test("exact relative OKLCH representation stays bound to compiler Lab and its existing native epsilon", () => {
  const original = mixedOriginal();
  const actual = colored("color", mixedActualToken, mixedActualXyz);
  expect(equalCssColors(actual, original)).toBeFalse();
  const proof = proveCssColorParity(actual, original);
  expect(proof).toHaveLength(1);
  expect(proof?.[0]?.representation).toBe("oklch");
  expect(proof?.[0]?.nativeEquivalent).toBeFalse();
  expect(proof?.[0]?.nativeVariant?.expression).toBe(`oklch(from ${required(original.projections[0]).compiler.projected} l c h / alpha)`);
  expect(proof?.[0]?.nativeVariant?.xyz).toEqual(actual.colors[0]);
  expect(proof?.[0]?.nativeVariant?.deltaFromLab[2]).toBeCloseTo(-0.000001, 12);
  expect(proof?.[0]?.projectedToken).toBe("lab(45.417 18.6059 -73.635 / 0.1)");
  expect(proof?.[0]?.actualDelta[2]).toBeCloseTo(-0.000106, 12);
  expect(proof?.[0]?.compiler.outputCss).toContain("color: lab(45.417% 18.6059 -73.635 / .1)");
  const native = required(original.projections[0]);
  for (const changed of [
    { ...native.oklch, expression: `oklch(from ${native.compiler.fallback} l c h / alpha)` },
    { ...native.oklch, expression: `oklch(from ${mixedActualToken} l c h / alpha)` },
    { ...native.oklch, expression: `oklch(from ${native.compiler.projected} l c h / 0.1)` },
    { ...native.oklch, xyz: [0.201953, 0.157476, 0.792923, 0.1] as const },
  ]) {
    const forged = { ...original, projections: [{ ...native, oklch: changed }] };
    const forgedActual = { ...actual, colors: [changed.xyz] };
    expect(proveCssColorParity(forgedActual, forged)).toBeNull();
  }
  expect(proveCssColorParity(actual, { ...original, projections: [{ ...native, wholeSerialized: native.fallbackSerialized }] })).toBeNull();
});

test("nearby relative color tokens, alpha and nested geometry cannot share a compiler exception", () => {
  const original = mixedOriginal();
  for (const mutant of [
    "oklch(0.549991 0.209982 261.996 / 0.1)", "oklch(0.54999 0.209983 261.996 / 0.1)",
    "oklch(0.54999 0.209982 261.9961 / 0.1)", "oklch(0.54999 0.209982 261.996 / 0.1000001)",
  ]) expect(proveCssColorParity(colored("color", mutant, mixedActualXyz), original)).toBeNull();
  const native = required(original.projections[0]);
  const forgedAlphaToken = mixedActualToken.replace("/ 0.1", "/ 0.1000001");
  expect(proveCssColorParity(colored("color", forgedAlphaToken, mixedActualXyz), { ...original, projections: [{ ...native,
    oklch: { ...native.oklch, serialized: forgedAlphaToken } }] })).toBeNull();
  for (const clamped of ["oklch(1.1 0.209982 261.996 / 0.1)", "oklch(0.54999 -0.1 261.996 / 0.1)"])
    expect(proveCssColorParity(colored("color", clamped, mixedActualXyz), { ...original, projections: [{ ...native,
      oklch: { ...native.oklch, serialized: clamped } }] })).toBeNull();
  const shadow = mixedOriginal("box-shadow", `${mixedOriginalToken} 0px 1px 2px`);
  expect(proveCssColorParity(colored("box-shadow", `${mixedActualToken} 0px 1px 2px`, mixedActualXyz), shadow)).toHaveLength(1);
  expect(proveCssColorParity(colored("box-shadow", `${mixedActualToken} 0px 2px 2px`, mixedActualXyz), shadow)).toBeNull();
  const gradient = mixedOriginal("background-image", `linear-gradient(90deg in srgb, ${mixedOriginalToken} 0%, ${mixedOriginalToken} 100%)`);
  expect(proveCssColorParity(colored("background-image", `linear-gradient(90deg in srgb, ${mixedActualToken} 0%, ${mixedActualToken} 100%)`, mixedActualXyz), gradient)).toHaveLength(2);
  expect(proveCssColorParity(colored("background-image", `linear-gradient(90deg in oklch, ${mixedActualToken} 0%, ${mixedActualToken} 100%)`, mixedActualXyz), gradient)).toBeNull();
});
