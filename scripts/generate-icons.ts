import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const repository = resolve(import.meta.dir, "..");
const iconsDirectory = join(repository, "src", "icons");
const setsDirectory = join(iconsDirectory, "sets");
const receiptsDirectory = join(iconsDirectory, "receipts");
const manifestPath = join(iconsDirectory, "manifest.json");
const modulePath = join(repository, "src", "icons.generated.ts");

/**
 * Icon library admission and assembly. The authored inputs are the set
 * manifests under `src/icons/sets/` (the same documents `slopcamera image
 * icon --set` consumes) plus the vetted artwork under `src/icons/<set>/`.
 * This script measures every admitted file, enforces the per-context and
 * family-consistency bounds, and emits the machine-readable manifest and the
 * typed asset module. Running it without `--write` verifies instead of
 * writing, so `bun run check:icons` fails on drift or unvetted artwork.
 */

export interface IconSetMemberSpec {
  readonly context?: "card" | "hero" | "inline" | undefined;
  readonly purpose?: "illustration" | "mark" | undefined;
  readonly slug: string;
  readonly subject: string;
}

export interface IconSetSpec {
  readonly context?: "card" | "hero" | "inline" | undefined;
  readonly ink?: string | undefined;
  readonly members: readonly IconSetMemberSpec[];
  readonly name?: string | undefined;
  readonly references?: readonly { slug: string; svg: string }[] | undefined;
}

export interface IconMeasuredMetrics {
  readonly aspectRatio: number;
  readonly bytes: number;
  readonly coverageRatio: number;
  readonly pathCount: number;
  readonly strokePx: number;
}

export interface IconManifestEntry {
  readonly bytes: number;
  readonly context: "card" | "hero" | "inline";
  readonly file: string;
  readonly id: string;
  readonly ink: string;
  readonly metrics: IconMeasuredMetrics;
  readonly purpose: "illustration" | "mark";
  readonly receipt: string | null;
  readonly set: string;
  readonly slug: string;
  readonly subject: string;
  readonly svgSha256: string;
  readonly viewBox: string;
}

export interface IconPendingMember {
  readonly context: "card" | "hero" | "inline";
  readonly file: string;
  readonly id: string;
  readonly purpose: "illustration" | "mark";
  readonly set: string;
  readonly slug: string;
  readonly subject: string;
}

export interface IconManifest {
  readonly icons: readonly IconManifestEntry[];
  /** Declared set members whose vetted artwork has not landed yet. */
  readonly pending: readonly IconPendingMember[];
  readonly version: 1;
}

const FORBIDDEN = /<script|on[a-z]+\s*=|javascript:|href=|url\(|<image|<foreignObject|<iframe|<use/iu;
const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/u;
const HEX = /^#[0-9a-f]{6}$/u;
const MEASURE_EDGE = 512;

/** Per-context admission bands; mirrors slopcamera's context profiles. */
const BOUNDS = {
  illustration: {
    card: { aspect: 1.8, bytes: 64_000, coverage: [0.08, 0.55], paths: 64, strokeMin: 8 },
    hero: { aspect: 1.8, bytes: 96_000, coverage: [0.05, 0.65], paths: 96, strokeMin: 5 },
    inline: { aspect: 1.5, bytes: 32_000, coverage: [0.14, 0.55], paths: 32, strokeMin: 12 },
  },
  mark: {
    shared: { aspect: 1.8, bytes: 24_000, coverage: [0.14, 0.72], paths: 16, strokeMin: 0 },
  },
} as const;

function problem(message: string): never {
  throw new Error(`[icons] ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseIconSetSpec(value: unknown, file: string): IconSetSpec {
  if (!isRecord(value)) problem(`${file} must be a JSON object.`);
  const members = value.members;
  if (!Array.isArray(members) || members.length === 0 || members.length > 24) {
    problem(`${file} members must be an array of 1-24 entries.`);
  }
  const seen = new Set<string>();
  const parsedMembers = members.map((member, index): IconSetMemberSpec => {
    if (!isRecord(member)) problem(`${file} member ${index} must be an object.`);
    const slug = member.slug;
    if (typeof slug !== "string" || !SLUG.test(slug)) {
      problem(`${file} member ${index} needs a kebab-case slug.`);
    }
    if (seen.has(slug)) problem(`${file} duplicates slug "${slug}".`);
    seen.add(slug);
    const subject = member.subject;
    if (
      typeof subject !== "string" ||
      subject.trim().length === 0 ||
      Buffer.byteLength(subject, "utf8") > 1024
    ) {
      problem(`${file} member "${slug}" needs a bounded non-empty subject.`);
    }
    const purpose = member.purpose;
    if (purpose !== undefined && purpose !== "illustration" && purpose !== "mark") {
      problem(`${file} member "${slug}" purpose must be illustration or mark.`);
    }
    const context = member.context;
    if (
      context !== undefined &&
      context !== "card" &&
      context !== "hero" &&
      context !== "inline"
    ) {
      problem(`${file} member "${slug}" context must be card, hero, or inline.`);
    }
    const parsed: {
      context?: IconSetMemberSpec["context"];
      purpose?: IconSetMemberSpec["purpose"];
      slug: string;
      subject: string;
    } = { slug, subject: (subject as string).trim() };
    if (context !== undefined) {
      parsed.context = context as IconSetMemberSpec["context"];
    }
    if (purpose !== undefined) {
      parsed.purpose = purpose as IconSetMemberSpec["purpose"];
    }
    return parsed;
  });
  const context = value.context;
  if (
    context !== undefined &&
    context !== "card" &&
    context !== "hero" &&
    context !== "inline"
  ) {
    problem(`${file} context must be card, hero, or inline.`);
  }
  const ink = value.ink;
  if (ink !== undefined && (typeof ink !== "string" || !HEX.test(ink))) {
    problem(`${file} ink must be a #rrggbb color.`);
  }
  const name = value.name;
  if (name !== undefined && (typeof name !== "string" || name.length > 120)) {
    problem(`${file} name must be a bounded label.`);
  }
  const parsed: {
    context?: IconSetSpec["context"];
    ink?: string;
    members: IconSetMemberSpec[];
    name?: string;
  } = { members: parsedMembers };
  if (context !== undefined) {
    parsed.context = context as IconSetSpec["context"];
  }
  if (ink !== undefined) parsed.ink = ink as string;
  if (name !== undefined) parsed.name = name as string;
  return parsed;
}

/** Rasterize and measure one admitted SVG against the shared metric scale. */
export function measureIconSvg(svg: string): {
  readonly ink: string;
  readonly metrics: IconMeasuredMetrics;
  readonly viewBox: string;
} {
  const viewBox = /viewBox="([^"]+)"/u.exec(svg)?.[1];
  if (viewBox === undefined) problem("admitted artwork needs a viewBox.");
  if (FORBIDDEN.test(svg)) problem("admitted artwork contains forbidden markup.");
  const viewBoxParts = viewBox.split(/\s+/u).map(Number);
  if (
    viewBoxParts.length !== 4 ||
    viewBoxParts.some(part => !Number.isFinite(part) || part < 0) ||
    viewBoxParts[2] === 0 ||
    viewBoxParts[3] === 0
  ) {
    problem(`admitted artwork has an invalid viewBox "${viewBox}".`);
  }
  const fills = [...svg.matchAll(/fill="([^"]+)"/gu)].map(match => (match[1] ?? "").toLowerCase());
  const strokes = [...svg.matchAll(/stroke="([^"]+)"/gu)].map(match => (match[1] ?? "").toLowerCase());
  const colors = [...new Set([...fills, ...strokes])].filter(color => color !== "none");
  const inkColor = colors[0] ?? "";
  if (colors.length !== 1 || !HEX.test(inkColor)) {
    problem(`admitted artwork must use exactly one ink color, found ${colors.join(", ") || "none"}.`);
  }
  const pathCount = (svg.match(/<path/gu) ?? []).length;

  const viewBoxWidth = viewBoxParts[2] ?? 0;
  const viewBoxHeight = viewBoxParts[3] ?? 0;
  const scale = MEASURE_EDGE / Math.max(viewBoxWidth, viewBoxHeight);
  const width = Math.max(1, Math.round(viewBoxWidth * scale));
  const rendered = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  }).render();
  const pixels = rendered.pixels;

  let minX = rendered.width;
  let minY = rendered.height;
  let maxX = -1;
  let maxY = -1;
  let inkPixels = 0;
  const mask = new Uint8Array(rendered.width * rendered.height);
  for (let y = 0; y < rendered.height; y += 1) {
    for (let x = 0; x < rendered.width; x += 1) {
      const alpha = pixels[(y * rendered.width + x) * 4 + 3] ?? 0;
      if (alpha < 24) continue;
      mask[y * rendered.width + x] = 1;
      inkPixels += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) problem("admitted artwork contains no visible ink.");
  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;
  const margin = Math.ceil(Math.max(boxWidth, boxHeight) * 0.08);
  const coverageRatio = inkPixels / ((boxWidth + 2 * margin) * (boxHeight + 2 * margin));

  let strokes2 = mask;
  let remaining = inkPixels;
  let rounds = 0;
  while (rounds < 32 && remaining > inkPixels * 0.1) {
    const next = new Uint8Array(strokes2.length);
    let count = 0;
    for (let y = 1; y < rendered.height - 1; y += 1) {
      for (let x = 1; x < rendered.width - 1; x += 1) {
        const index = y * rendered.width + x;
        if (
          strokes2[index] === 1 &&
          strokes2[index - 1] === 1 &&
          strokes2[index + 1] === 1 &&
          strokes2[index - rendered.width] === 1 &&
          strokes2[index + rendered.width] === 1
        ) {
          next[index] = 1;
          count += 1;
        }
      }
    }
    strokes2 = next;
    remaining = count;
    rounds += 1;
  }

  return {
    ink: inkColor,
    metrics: {
      aspectRatio: Math.max(boxWidth / boxHeight, boxHeight / boxWidth),
      bytes: Buffer.byteLength(svg, "utf8"),
      coverageRatio,
      pathCount,
      strokePx: rounds * 2 * (MEASURE_EDGE / Math.max(rendered.width, rendered.height)),
    },
    viewBox,
  };
}

/** Deterministic admission bounds for one measured icon. */
export function iconAdmissionProblems(entry: IconManifestEntry): readonly string[] {
  const bound =
    entry.purpose === "mark" ? BOUNDS.mark.shared : BOUNDS.illustration[entry.context];
  const problems: string[] = [];
  if (entry.metrics.aspectRatio > bound.aspect) {
    problems.push(`${entry.id} is too elongated for ${entry.purpose}/${entry.context}`);
  }
  if (entry.metrics.coverageRatio < bound.coverage[0]) {
    problems.push(`${entry.id} is too sparse for ${entry.purpose}/${entry.context}`);
  }
  if (entry.metrics.coverageRatio > bound.coverage[1]) {
    problems.push(`${entry.id} is too dense for ${entry.purpose}/${entry.context}`);
  }
  if (entry.metrics.pathCount > bound.paths) {
    problems.push(`${entry.id} carries too much vector detail`);
  }
  if (entry.metrics.strokePx < bound.strokeMin) {
    problems.push(`${entry.id} strokes are too thin for ${entry.purpose}/${entry.context}`);
  }
  if (entry.bytes > bound.bytes) problems.push(`${entry.id} exceeds its byte budget`);
  return problems;
}

/** Family coherence: every set member stays within ±45%/±50% of its median.
 *  Coverage tracks slopcamera's crop-relative band; stroke is looser because
 *  blob thickness on filled-plane art legitimately varies ~2× across subjects. */
export function familyProblems(entries: readonly IconManifestEntry[]): readonly string[] {
  const problems: string[] = [];
  const bySet = new Map<string, IconManifestEntry[]>();
  for (const entry of entries) {
    const set = bySet.get(entry.set) ?? [];
    set.push(entry);
    bySet.set(entry.set, set);
  }
  const median = (values: readonly number[]): number => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1
      ? (sorted[middle] ?? 0)
      : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  };
  for (const [set, members] of bySet) {
    if (members.length < 2) continue;
    const coverageMedian = median(members.map(member => member.metrics.coverageRatio));
    const strokeMedian = median(members.map(member => member.metrics.strokePx));
    for (const member of members) {
      const coverageSpan = Math.max(0.06, coverageMedian * 0.45);
      const strokeSpan = Math.max(4, strokeMedian * 0.5);
      if (Math.abs(member.metrics.coverageRatio - coverageMedian) > coverageSpan) {
        problems.push(`${member.id} coverage ${member.metrics.coverageRatio.toFixed(3)} drifts from the ${set} family (${coverageMedian.toFixed(3)})`);
      }
      if (Math.abs(member.metrics.strokePx - strokeMedian) > strokeSpan) {
        problems.push(`${member.id} stroke ${member.metrics.strokePx.toFixed(1)}px drifts from the ${set} family (${strokeMedian.toFixed(1)}px)`);
      }
    }
  }
  return problems;
}

async function readSetSpecs(): Promise<Map<string, IconSetSpec>> {
  const specs = new Map<string, IconSetSpec>();
  const files = (await readdir(setsDirectory).catch(() => [] as string[]))
    .filter(file => file.endsWith(".json"))
    .sort();
  for (const file of files) {
    const spec = parseIconSetSpec(JSON.parse(await readFile(join(setsDirectory, file), "utf8")), file);
    specs.set(file.replace(/\.json$/u, ""), spec);
  }
  return specs;
}

function svgBody(svg: string): string {
  const body = /<svg[^>]*>(?<body>[\s\S]*)<\/svg>/u.exec(svg)?.groups?.body;
  if (body === undefined || body.trim() === "") problem("admitted artwork has no body.");
  return body.trim();
}

/** Measure every set member's admitted file and build the manifest. */
export async function iconManifest(): Promise<IconManifest> {
  const specs = await readSetSpecs();
  if (specs.size === 0) problem("no icon set manifests under src/icons/sets/.");
  const receipts = new Set(await readdir(receiptsDirectory).catch(() => [] as string[]));
  const entries: IconManifestEntry[] = [];
  const pending: IconPendingMember[] = [];
  for (const [set, spec] of [...specs.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const member of spec.members) {
      const id = `${set}/${member.slug}`;
      const file = `${set}/${member.slug}.svg`;
      let svg: string | undefined;
      try {
        svg = await readFile(join(iconsDirectory, file), "utf8");
      } catch {
        svg = undefined;
      }
      if (svg === undefined) {
        pending.push({
          context: member.context ?? spec.context ?? "card",
          file,
          id,
          purpose: member.purpose ?? "illustration",
          set,
          slug: member.slug,
          subject: member.subject,
        });
        continue;
      }
      const measured = measureIconSvg(svg);
      const ink = normalizedInk(spec.ink ?? measured.ink);
      if (measured.ink !== ink) {
        problem(`${id} uses ink ${measured.ink} but the set declares ${ink}.`);
      }
      entries.push({
        bytes: measured.metrics.bytes,
        context: member.context ?? spec.context ?? "card",
        file,
        id,
        ink,
        metrics: measured.metrics,
        purpose: member.purpose ?? "illustration",
        receipt: receipts.has(`${set}.receipt.json`) ? `receipts/${set}.receipt.json` : null,
        set,
        slug: member.slug,
        subject: member.subject,
        svgSha256: createHash("sha256").update(svg).digest("hex"),
        viewBox: measured.viewBox,
      });
    }
  }
  const problems = [
    ...entries.flatMap(iconAdmissionProblems),
    ...familyProblems(entries),
  ];
  if (problems.length > 0) problem(problems.join("\n"));
  return { icons: entries, pending, version: 1 };
}

function normalizedInk(ink: string): string {
  return ink.length === 4
    ? `#${ink[1]}${ink[1]}${ink[2]}${ink[2]}${ink[3]}${ink[3]}`
    : ink;
}

export async function iconsModule(manifest: IconManifest): Promise<string> {
  const entries: string[] = [];
  for (const icon of manifest.icons) {
    const svg = await readFile(join(iconsDirectory, icon.file), "utf8");
    entries.push(`  ${JSON.stringify(icon.id)}: {
    body: ${JSON.stringify(svgBody(svg))},
    context: ${JSON.stringify(icon.context)},
    file: ${JSON.stringify(icon.file)},
    ink: ${JSON.stringify(icon.ink)},
    purpose: ${JSON.stringify(icon.purpose)},
    set: ${JSON.stringify(icon.set)},
    slug: ${JSON.stringify(icon.slug)},
    subject: ${JSON.stringify(icon.subject)},
    viewBox: ${JSON.stringify(icon.viewBox)},
  },`);
  }
  return `/* Generated by scripts/generate-icons.ts. Do not edit. */

export interface HranessIconAsset {
  /** Sanitized inner SVG artwork for inline rendering. */
  readonly body: string;
  /** Presentation context the icon was generated and admitted for. */
  readonly context: "card" | "hero" | "inline";
  /** Canonical file path inside the package's \`./icons/*\` export. */
  readonly file: string;
  readonly ink: string;
  readonly purpose: "illustration" | "mark";
  readonly set: string;
  readonly slug: string;
  readonly subject: string;
  readonly viewBox: string;
}

export const hranessIconAssets = {
${entries.join("\n")}
} as const satisfies Record<string, HranessIconAsset>;
`;
}

const manifest = await iconManifest();
const moduleSource = await iconsModule(manifest);
const manifestSource = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes("--write")) {
  await writeFile(manifestPath, manifestSource);
  await writeFile(modulePath, moduleSource);
  console.log(`icons: measured and admitted ${manifest.icons.length} icons across ${(await readSetSpecs()).size} sets.`);
} else {
  const drift: string[] = [];
  if ((await readFile(manifestPath, "utf8").catch(() => "")) !== manifestSource) {
    drift.push("src/icons/manifest.json is stale");
  }
  if ((await readFile(modulePath, "utf8").catch(() => "")) !== moduleSource) {
    drift.push("src/icons.generated.ts is stale");
  }
  if (drift.length > 0) {
    problem(`${drift.join("; ")}. Run bun run generate:icons.`);
  }
  console.log(`icons: ${manifest.icons.length} admitted icons verified.`);
}
