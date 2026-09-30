import { providerMarkAssets, type ProviderMarkArtwork } from "./provider-marks.generated.js";
import { paletteContrast } from "./palette-color.js";

/**
 * Canonical provider and agent identity for product surfaces. Each mark pairs
 * a retintable monochrome glyph (`glyph`, every fill resolves to
 * currentColor) with vendor-colored artwork when the source publishes one
 * (`art`). `accent` is our chosen tile color: the vendor's brand fill where
 * one exists, otherwise a compatible tone. Assets are vendored under
 * `vendor/provider-marks/` with provenance in that directory's UPSTREAM.md.
 */

export type ProviderMarkKind = "agent" | "vendor";

interface ProviderMarkSpec {
  readonly accent: string;
  readonly aliases: readonly string[];
  readonly kind: ProviderMarkKind;
  readonly name: string;
}

export interface ProviderMarkDescriptor extends ProviderMarkSpec {
  readonly art: ProviderMarkArtwork | null;
  readonly glyph: ProviderMarkArtwork;
  readonly id: string;
  readonly monogram: string;
}

const MARK_SPECS = {
  aider: { accent: "#14b014", aliases: ["aider"], kind: "agent", name: "Aider" },
  alibabacloud: { accent: "#ff6a00", aliases: ["alibaba", "alibaba cloud"], kind: "vendor", name: "Alibaba Cloud" },
  amp: { accent: "#f34e3f", aliases: ["amp"], kind: "agent", name: "Amp" },
  anthropic: { accent: "#d97757", aliases: ["anthropic"], kind: "vendor", name: "Anthropic" },
  claude: { accent: "#d97757", aliases: ["claude"], kind: "vendor", name: "Claude" },
  claudecode: { accent: "#d97757", aliases: ["claude code", "claude-code"], kind: "agent", name: "Claude Code" },
  codex: { accent: "#111418", aliases: ["codex", "codex cli"], kind: "agent", name: "Codex" },
  crush: { accent: "#ff388b", aliases: ["crush", "charm crush"], kind: "agent", name: "Crush" },
  cursor: { accent: "#1f2328", aliases: ["cursor"], kind: "agent", name: "Cursor" },
  deepseek: { accent: "#4d6bfe", aliases: ["deepseek"], kind: "vendor", name: "DeepSeek" },
  devin: { accent: "#3969ca", aliases: ["devin", "cognition"], kind: "agent", name: "Devin" },
  gemini: { accent: "#3186ff", aliases: ["gemini", "google", "google deepmind", "google ai"], kind: "vendor", name: "Gemini" },
  geminicli: { accent: "#3186ff", aliases: ["gemini cli", "gemini-cli"], kind: "agent", name: "Gemini CLI" },
  githubcopilot: { accent: "#1f2328", aliases: ["github copilot", "github-copilot", "copilot"], kind: "agent", name: "GitHub Copilot" },
  goose: { accent: "#0e7c86", aliases: ["goose", "block goose"], kind: "agent", name: "Goose" },
  mem0: { accent: "#cbb2ff", aliases: ["mem0", "memzero"], kind: "vendor", name: "Mem0" },
  meta: { accent: "#0082fb", aliases: ["meta", "meta ai", "llama"], kind: "vendor", name: "Meta" },
  mistral: { accent: "#fa500f", aliases: ["mistral", "mistral ai"], kind: "vendor", name: "Mistral" },
  moonshot: { accent: "#5b5bd6", aliases: ["moonshot", "moonshot ai", "kimi"], kind: "vendor", name: "Moonshot AI" },
  nvidia: { accent: "#74b71b", aliases: ["nvidia"], kind: "vendor", name: "NVIDIA" },
  obsidian: { accent: "#7c3aed", aliases: ["obsidian", "obsidian md"], kind: "vendor", name: "Obsidian" },
  openai: { accent: "#0f1014", aliases: ["openai", "chatgpt", "gpt"], kind: "vendor", name: "OpenAI" },
  perplexity: { accent: "#22b8cd", aliases: ["perplexity", "perplexity ai"], kind: "vendor", name: "Perplexity" },
  opencode: { accent: "#d97706", aliases: ["opencode", "open code"], kind: "agent", name: "opencode" },
  qwen: { accent: "#615ced", aliases: ["qwen", "tongyi"], kind: "vendor", name: "Qwen" },
  supermemory: { accent: "#2563eb", aliases: ["supermemory", "supermemory ai"], kind: "vendor", name: "Supermemory" },
  xai: { accent: "#1a1a1a", aliases: ["xai", "x.ai", "grok", "spacexai"], kind: "vendor", name: "xAI" },
  zai: { accent: "#2d4d9e", aliases: ["zai", "z.ai", "z ai", "zhipu"], kind: "vendor", name: "Z.AI" },
} as const satisfies Record<keyof typeof providerMarkAssets, ProviderMarkSpec>;

export type ProviderMarkId = keyof typeof MARK_SPECS;

function foldedIdentity(identity: string): string {
  return identity.toLowerCase().replaceAll(/[^a-z0-9]/gu, "");
}

/** An opaque glyph color at 4.5:1 or better on a six-digit brand accent. */
export function providerMarkOnAccent(mark: Pick<ProviderMarkDescriptor, "accent">): string {
  if (!/^#[0-9a-f]{6}$/iu.test(mark.accent)) throw new RangeError("Solid provider mark accents must be opaque six-digit hex colors.");
  const moreReadable = (light: string, dark: string): string =>
    paletteContrast(light, mark.accent) >= paletteContrast(dark, mark.accent) ? light : dark;
  const preferred = moreReadable("#f7f6f2", "#1c1917");
  // Retain warm ink where it passes; middle luminances may need pure ink.
  return paletteContrast(preferred, mark.accent) >= 4.5
    ? preferred
    : moreReadable("#ffffff", "#000000");
}

/** Two-letter uppercase monogram from a display name, for uncovered marks. */
export function providerMarkMonogram(displayName: string): string {
  const monogram = displayName
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .replaceAll(/[^A-Z0-9]/gu, "")
    .slice(0, 2);
  return monogram || "AI";
}

const aliasesByFold: ReadonlyMap<string, ProviderMarkId> = new Map(
  (Object.entries(MARK_SPECS) as [ProviderMarkId, ProviderMarkSpec][]).flatMap(([id, spec]) =>
    [spec.name, ...spec.aliases].map((alias) => [foldedIdentity(alias), id] as const),
  ),
);

/** Resolves a display name, slug, or alias to a registered mark. */
export function providerMark(identity: string): ProviderMarkDescriptor | undefined {
  const id = aliasesByFold.get(foldedIdentity(identity));
  if (id === undefined) return undefined;
  return { ...MARK_SPECS[id], ...providerMarkAssets[id], id, monogram: providerMarkMonogram(MARK_SPECS[id].name) };
}

export const providerMarks: readonly ProviderMarkDescriptor[] = (Object.keys(MARK_SPECS) as ProviderMarkId[]).map(
  (id) => ({ ...MARK_SPECS[id], ...providerMarkAssets[id], id, monogram: providerMarkMonogram(MARK_SPECS[id].name) }),
);

/**
 * A neutral descriptor for identities outside the registry: monogram only,
 * no artwork, so surfaces never pretend an official mark exists.
 */
export function providerMarkFallback(displayName: string): ProviderMarkDescriptor {
  return {
    accent: "#6f6962",
    aliases: [],
    art: null,
    glyph: { body: "", viewBox: "0 0 24 24" },
    id: `fallback:${foldedIdentity(displayName) || "unknown"}`,
    kind: "vendor",
    monogram: providerMarkMonogram(displayName),
    name: displayName,
  };
}

function svgDocument(artwork: ProviderMarkArtwork, fill?: string): string {
  const fillAttribute = fill === undefined ? "" : ` fill="${fill}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${artwork.viewBox}"${fillAttribute}>${artwork.body}</svg>`;
}

/** Data URI for the monochrome glyph retinted to `color`, for CSS masks. */
export function providerMarkGlyphDataUri(mark: ProviderMarkDescriptor, color: string): string {
  const artwork = { ...mark.glyph, body: mark.glyph.body.replaceAll("currentColor", color) };
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgDocument(artwork, color))}`;
}

/** Data URI for the vendor-colored artwork, or null when none is published. */
export function providerMarkArtDataUri(mark: ProviderMarkDescriptor): string | null {
  if (mark.art === null) return null;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgDocument(mark.art, ""))}`;
}
