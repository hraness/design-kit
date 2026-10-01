import { expect, test } from "bun:test";
import fc from "fast-check";

import { providerMarkAssets } from "./provider-marks.generated";
import { paletteContrast } from "./palette-color";
import {
  providerMark,
  providerMarkArtDataUri,
  providerMarkFallback,
  providerMarkGlyphDataUri,
  providerMarkMonogram,
  providerMarkOnAccent,
  providerMarks,
  type ProviderMarkId,
} from "./provider-marks";

const REQUIRED_IDENTITIES: readonly ProviderMarkId[] = [
  "aider",
  "anthropic",
  "beeper",
  "imessage",
  "ollama",
  "vercel",
  "whatsapp",
  "claude",
  "claudecode",
  "codex",
  "crush",
  "devin",
  "gemini",
  "goose",
  "openai",
  "opencode",
];

test("every consumer-facing provider and agent has a registered mark", () => {
  const ids = new Set(providerMarks.map((mark) => mark.id));
  for (const id of REQUIRED_IDENTITIES) expect(ids.has(id)).toBe(true);
});

test("registry specs and generated artwork cover the same ids", () => {
  const specIds = providerMarks.map((mark) => mark.id).sort();
  const assetIds = Object.keys(providerMarkAssets).sort();
  expect(specIds).toEqual(assetIds);
});

test("every mark has a glyph, a display name, an accent, and a monogram", () => {
  for (const mark of providerMarks) {
    expect(mark.glyph.body.length).toBeGreaterThan(0);
    const viewBox = mark.glyph.viewBox.split(/\s+/u).map(Number);
    expect(viewBox).toHaveLength(4);
    expect(viewBox.every(Number.isFinite)).toBe(true);
    expect(viewBox[2]).toBeGreaterThan(0);
    expect(viewBox[3]).toBeGreaterThan(0);
    expect(mark.name.length).toBeGreaterThan(0);
    expect(mark.accent).toMatch(/^#[0-9a-f]{6}$/u);
    expect(mark.monogram.length).toBeGreaterThan(0);
  }
});

test("aliases fold case, spaces, and punctuation to the same mark", () => {
  expect(providerMark("claude code")?.id).toBe("claudecode");
  expect(providerMark("Claude Code")?.id).toBe("claudecode");
  expect(providerMark("claude-code")?.id).toBe("claudecode");
  expect(providerMark("Z.AI")?.id).toBe("zai");
  expect(providerMark("Kimi")?.id).toBe("moonshot");
  expect(providerMark("Google DeepMind")?.id).toBe("gemini");
  expect(providerMark("x.ai")?.id).toBe("xai");
  expect(providerMark("Cognition")?.id).toBe("devin");
});

test("provider and agent identities stay distinct", () => {
  expect(providerMark("anthropic")?.id).not.toBe(providerMark("claudecode")?.id);
  expect(providerMark("openai")?.id).not.toBe(providerMark("codex")?.id);
  expect(providerMark("gemini")?.id).not.toBe(providerMark("geminicli")?.id);
});

test("unknown identities resolve to undefined, and the fallback never claims artwork", () => {
  expect(providerMark("Not A Provider")).toBeUndefined();
  const fallback = providerMarkFallback("Not A Provider");
  expect(fallback.art).toBeNull();
  expect(fallback.glyph.body).toBe("");
  expect(fallback.monogram).toBe("NA");
  expect(fallback.name).toBe("Not A Provider");
});

test("monograms take at most two uppercase letters", () => {
  expect(providerMarkMonogram("Claude Code")).toBe("CC");
  expect(providerMarkMonogram("OpenAI")).toBe("O");
  expect(providerMarkMonogram("  ")).toBe("AI");
});

function mustMark(identity: string) {
  const mark = providerMark(identity);
  if (mark === undefined) throw new Error(`Expected a registered mark for ${identity}.`);
  return mark;
}

test("glyph data uris carry a complete svg retinted to the requested color", () => {
  const uri = providerMarkGlyphDataUri(mustMark("openai"), "#f7f6f2");
  expect(uri.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
  const svg = decodeURIComponent(uri.slice("data:image/svg+xml;charset=utf-8,".length));
  expect(svg).toContain("<svg");
  expect(svg).toContain('fill="#f7f6f2"');
  expect(svg).not.toContain("currentColor");
  expect(svg).not.toContain("script");
});

test("art data uris exist only where vendor-colored art exists", () => {
  expect(providerMarkArtDataUri(mustMark("claudecode"))).toContain("data:image/svg");
  expect(providerMarkArtDataUri(mustMark("openai"))).toBeNull();
});

test("on-accent colors flip between light and dark for contrast", () => {
  expect(providerMarkOnAccent({ accent: "#111418" })).toBe("#f7f6f2");
  expect(providerMarkOnAccent({ accent: "#ffde59" })).toBe("#1c1917");
});

test("solid ink rejects colors whose opacity and contrast cannot be measured", () => {
  for (const accent of ["#f00", "red", "#ff000080", "transparent", "var(--brand)", "#gg0000"]) {
    expect(() => providerMarkOnAccent({ accent })).toThrow(RangeError);
  }
});

test("solid brand marks pair every registered accent with readable ink", () => {
  for (const mark of providerMarks) {
    expect(paletteContrast(providerMarkOnAccent(mark), mark.accent)).toBeGreaterThanOrEqual(4.5);
  }
  // Brightness alone picked pale ink on these midtone brand colors.
  for (const accent of ["#d97757", "#ff6a00", "#3186ff", "#74b71b"]) {
    expect(providerMarkOnAccent({ accent })).toBe("#1c1917");
  }
});

test("solid brand ink meets contrast across arbitrary opaque sRGB accents", () => {
  fc.assert(fc.property(fc.integer({ min: 0, max: 0xffffff }), (value) => {
    const accent = `#${value.toString(16).padStart(6, "0")}`;
    expect(paletteContrast(providerMarkOnAccent({ accent }), accent)).toBeGreaterThanOrEqual(4.5);
  }), { numRuns: 2048, seed: 20260930 });
});

test("no artwork carries scriptable or event-handler markup", () => {
  for (const mark of providerMarks) {
    for (const artwork of [mark.glyph, mark.art]) {
      if (artwork === null) continue;
      expect(artwork.body).not.toMatch(/<script|on[a-z]+\s*=|javascript:/iu);
    }
  }
});
