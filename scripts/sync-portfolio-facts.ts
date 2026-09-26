/**
 * Regenerates the `@hraness/design-kit/portfolio` facts snapshot from a local
 * checkout of the Hraness portfolio registry repository at one exact ref, and
 * fails when the committed
 * snapshot has drifted from that ref.
 *
 *   bun run ./scripts/sync-portfolio-facts.ts --registry <checkout> --ref origin/main
 *   bun run ./scripts/sync-portfolio-facts.ts --registry <checkout> --ref origin/main --write
 *
 * Only public facts leave the registry: the served public portfolio contract
 * (`portfolio.public.generated.json`), the name, expanded name, and
 * description of each public product's brand entry, and each product's
 * portfolio mark (the same artwork hraness.com serves under `/marks/`, joined
 * through `brand-artwork.json`). Nothing else from `brands.yaml` or the
 * artwork registry is read into the output.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export const PORTFOLIO_SNAPSHOT_CONTRACT = "hraness.design-kit-portfolio/v1";
/** The public home of the upstream contract; the registry repository itself is private. */
export const PORTFOLIO_REGISTRY_URL = "https://hraness.com/portfolio.json";
const UPSTREAM_CONTRACT = "hraness.portfolio-public/v1";
const PUBLIC_PATH = "portfolio.public.generated.json";
const BRANDS_PATH = "packages/brand-catalog/brands.yaml";
const ARTWORK_PATH = "brand-artwork.json";
/** Marks are compact path artwork; anything larger is not a registry mark. */
const MARK_MAX_BYTES = 32 * 1024;
const MARK_PATH_PATTERN = /^projects\/hraness\/public\/marks\/[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/u;
const RELATION_KINDS = ["runtime", "development", "contract", "delivery"] as const;
const RELATION_DIRECTIONS = ["forward", "shared"] as const;
const COPY_STATUSES = ["authored", "proposed"] as const;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const SHA_PATTERN = /^[0-9a-f]{40}$/u;
/** Brand descriptions that are placeholders, not copy. */
const PLACEHOLDER_DESCRIPTIONS = new Set(["tbd", "todo"]);

export type SnapshotRelationKind = (typeof RELATION_KINDS)[number];

export type PortfolioSnapshotSource = Readonly<{
  /** The resolved 40-character registry commit. */
  commit: string;
  /** The commit date (YYYY-MM-DD, committer time zone), so regeneration is deterministic. */
  committedOn: string;
  /** Raw bytes of `portfolio.public.generated.json` at that commit. */
  publicPortfolio: string;
  /** Raw bytes of `packages/brand-catalog/brands.yaml` at that commit. */
  brands: string;
  /** Raw bytes of `brand-artwork.json` at that commit. */
  artwork: string;
  /** Raw bytes of every mark `brand-artwork.json` names, keyed by registry path. */
  marks: Readonly<Record<string, string>>;
}>;

export class PortfolioSyncError extends Error {
  override readonly name = "PortfolioSyncError";
}

function fail(message: string): never {
  throw new PortfolioSyncError(message);
}

function record(value: unknown, where: string): Readonly<Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(`${where} must be an object.`);
  return value as Readonly<Record<string, unknown>>;
}

function list(value: unknown, where: string): readonly unknown[] {
  if (!Array.isArray(value)) fail(`${where} must be an array.`);
  return value;
}

function text(value: unknown, where: string): string {
  if (typeof value !== "string" || value.trim().length === 0 || value !== value.trim()) {
    fail(`${where} must be a non-empty trimmed string.`);
  }
  return value;
}

function optionalText(value: unknown, where: string): string | null {
  return value === undefined || value === null ? null : text(value, where);
}

function oneOf<const T extends readonly string[]>(value: unknown, options: T, where: string): T[number] {
  if (typeof value !== "string" || !options.includes(value)) fail(`${where} must be one of ${options.join(", ")}.`);
  return value as T[number];
}

function httpsUrl(value: unknown, where: string): URL {
  const raw = text(value, where);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    fail(`${where} must be an absolute URL.`);
  }
  if (
    url.protocol !== "https:" || url.username !== "" || url.password !== ""
    || url.search !== "" || url.hash !== "" || (url.href !== raw && url.href !== `${raw}/`)
  ) {
    fail(`${where} must be a canonical https URL without credentials, query, or fragment.`);
  }
  return url;
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** The digest recipe the upstream schema documents for `hraness.portfolio-public/v1`. */
function upstreamDigest(document: Readonly<Record<string, unknown>>): string {
  return `sha256:${sha256Hex(JSON.stringify({
    contract: document.contract,
    formatVersion: document.formatVersion,
    projects: document.projects,
    foundations: document.foundations,
    relations: document.relations,
    url: document.url,
  }))}`;
}

/** Digest of a snapshot: SHA-256 of its compact JSON without the `digest` key. */
export function portfolioSnapshotDigest(snapshot: Readonly<Record<string, unknown>>): string {
  const body = Object.fromEntries(Object.entries(snapshot).filter(([key]) => key !== "digest"));
  return `sha256:${sha256Hex(JSON.stringify(body))}`;
}

type Brand = Readonly<{ name: string; expandedName: string | null; description: string | null }>;

function parseBrands(source: string): ReadonlyMap<string, Brand> {
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(source);
  } catch (error) {
    fail(`${BRANDS_PATH} is not valid YAML: ${error instanceof Error ? error.message : String(error)}`);
  }
  const brands = new Map<string, Brand>();
  list(record(parsed, BRANDS_PATH).brands, `${BRANDS_PATH} brands`).forEach((entry, index) => {
    const where = `${BRANDS_PATH} brands[${index}]`;
    const brand = record(entry, where);
    const domain = text(brand.domain, `${where}.domain`).toLowerCase();
    if (brands.has(domain)) fail(`${BRANDS_PATH} lists ${domain} twice.`);
    const description = optionalText(brand.description, `${where}.description`);
    // Read only the three public fields; everything else in the entry stays in the registry.
    brands.set(domain, {
      name: text(brand.name, `${where}.name`),
      expandedName: optionalText(brand.expanded_name, `${where}.expanded_name`),
      description: description === null || PLACEHOLDER_DESCRIPTIONS.has(description.toLowerCase()) ? null : description,
    });
  });
  return brands;
}

/** Product id to registry mark path, from the artwork registry's `products` list. */
export function parseArtworkMarks(source: string): ReadonlyMap<string, string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    fail(`${ARTWORK_PATH} is not valid JSON.`);
  }
  const document = record(parsed, ARTWORK_PATH);
  if (document.formatVersion !== 1) fail(`${ARTWORK_PATH} must have formatVersion 1.`);
  const marks = new Map<string, string>();
  list(document.products, `${ARTWORK_PATH} products`).forEach((entry, index) => {
    const where = `${ARTWORK_PATH} products[${index}]`;
    const artwork = record(entry, where);
    const id = text(artwork.id, `${where}.id`);
    if (marks.has(id)) fail(`${ARTWORK_PATH} lists ${id} twice.`);
    const mark = text(artwork.mark, `${where}.mark`);
    if (!MARK_PATH_PATTERN.test(mark)) fail(`${where}.mark must be a portfolio mark path.`);
    marks.set(id, mark);
  });
  return marks;
}

/**
 * Checks that a mark is inert path artwork, the same class the registry's
 * compositor admits: an svg root holding only g and path elements, no
 * scripts, styles, references, embedded images, or event handlers.
 */
function inertMark(svg: string, where: string): string {
  if (new TextEncoder().encode(svg).byteLength > MARK_MAX_BYTES) fail(`${where} exceeds ${MARK_MAX_BYTES} bytes.`);
  const trimmed = svg.trim();
  if (!/^<svg\s[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*>[\s\S]*<\/svg>$/u.test(trimmed)) {
    fail(`${where} must be one svg element.`);
  }
  for (const [, name] of trimmed.matchAll(/<\/?([A-Za-z][\w:-]*)/gu)) {
    if (name !== "svg" && name !== "g" && name !== "path") fail(`${where} contains a <${String(name)}> element.`);
  }
  const printable = [...trimmed].every((character) => {
    const code = character.codePointAt(0) ?? 0;
    return (code >= 0x20 && code <= 0x7e) || character === "\t" || character === "\n" || character === "\r";
  });
  if (!printable || /\s(?:on[a-z]+|style|href|xlink:href|class)\s*=|url\(|<!|<\?|'/iu.test(trimmed)) {
    fail(`${where} is not inert path artwork.`);
  }
  return trimmed;
}

/**
 * A compact `data:image/svg+xml` URL for inert path artwork. Whitespace runs
 * collapse, double quotes become single quotes, and every character outside
 * the URL-safe set is percent-encoded, so the URL is safe unquoted in HTML
 * attributes and inside a double-quoted CSS `url()`.
 */
export function svgDataUrl(svg: string): string {
  const compact = svg.replace(/\s+/gu, " ").replace(/> </gu, "><").replaceAll("\"", "'");
  const bytes = (character: string) => [...new TextEncoder().encode(character)]
    .map((byte) => `%${byte.toString(16).toUpperCase().padStart(2, "0")}`)
    .join("");
  return `data:image/svg+xml,${compact.replace(/[^A-Za-z0-9 \-._~!$&'*+,;=:@/]/gu, bytes)}`;
}

function sameName(left: string, right: string): boolean {
  return left.localeCompare(right, "en", { sensitivity: "accent" }) === 0;
}

export function buildPortfolioSnapshot(source: PortfolioSnapshotSource): Readonly<Record<string, unknown>> {
  if (!SHA_PATTERN.test(source.commit)) fail("The source commit must be a full 40-character SHA.");
  if (!DATE_PATTERN.test(source.committedOn)) fail("The source commit date must be YYYY-MM-DD.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(source.publicPortfolio);
  } catch {
    fail(`${PUBLIC_PATH} is not valid JSON.`);
  }
  const document = record(parsed, PUBLIC_PATH);
  if (document.contract !== UPSTREAM_CONTRACT || document.formatVersion !== 1) {
    fail(`${PUBLIC_PATH} is not a ${UPSTREAM_CONTRACT} document with formatVersion 1.`);
  }
  const declaredDigest = text(document.digest, `${PUBLIC_PATH}.digest`);
  if (declaredDigest !== upstreamDigest(document)) {
    fail(`${PUBLIC_PATH} digest does not match its contents; regenerate it in the registry first.`);
  }
  const brands = parseBrands(source.brands);
  const markPaths = parseArtworkMarks(source.artwork);

  const products: Record<string, unknown> = {};
  list(document.projects, `${PUBLIC_PATH}.projects`).forEach((entry, index) => {
    const where = `${PUBLIC_PATH}.projects[${index}]`;
    const project = record(entry, where);
    const id = text(project.id, `${where}.id`);
    if (!ID_PATTERN.test(id)) fail(`${where}.id is not a portfolio id.`);
    if (Object.hasOwn(products, id)) fail(`${PUBLIC_PATH} lists product ${id} twice.`);
    const url = httpsUrl(project.canonicalUrl, `${where}.canonicalUrl`);
    const displayName = text(project.name, `${where}.name`);
    // A brand belongs to a product only when the product owns the whole host.
    // Products served under a hraness.com path keep their portfolio name.
    const brand = url.pathname === "/" ? brands.get(url.host) : undefined;
    const name = brand?.name ?? displayName;
    // The canonical messaging record rides the public contract verbatim; the
    // private superseded ledger is stripped upstream and must stay absent here.
    const messaging = record(project.messaging, `${where}.messaging`);
    if (Object.hasOwn(messaging, "superseded")) {
      fail(`${where}.messaging must not carry the private superseded ledger.`);
    }
    const names = record(messaging.names, `${where}.messaging.names`);
    const proseName = text(names.name, `${where}.messaging.names.name`);
    const status = record(messaging.status, `${where}.messaging.status`);
    const short = text(messaging.short, `${where}.messaging.short`);
    // The upstream `description` is the lowercased card projection of `short`;
    // requiring the match keeps a half-regenerated registry from drifting in.
    const cardLine = text(project.description, `${where}.description`);
    if (cardLine !== short.toLocaleLowerCase("en-US")) {
      fail(`${where}.description must equal messaging.short lowercased.`);
    }
    const aliases: string[] = [];
    const formerly = names.formerly === undefined
      ? []
      : list(names.formerly, `${where}.messaging.names.formerly`)
        .map((entry, entryIndex) => text(entry, `${where}.messaging.names.formerly[${entryIndex}]`));
    for (const candidate of [brand?.expandedName ?? null, displayName, proseName, ...formerly]) {
      if (candidate !== null && !sameName(candidate, name) && !aliases.some((alias) => sameName(alias, candidate))) {
        aliases.push(candidate);
      }
    }
    const markPath = markPaths.get(id) ?? fail(`${ARTWORK_PATH} has no mark for product ${id}.`);
    const markSource = Object.hasOwn(source.marks, markPath) ? source.marks[markPath] : undefined;
    if (markSource === undefined) fail(`The registry source is missing ${markPath}.`);
    products[id] = {
      id,
      name,
      oneLiner: short,
      brandDescription: brand?.description ?? null,
      canonicalUrl: text(project.canonicalUrl, `${where}.canonicalUrl`),
      status: "active",
      copyStatus: oneOf(status.default, COPY_STATUSES, `${where}.messaging.status.default`),
      aliases,
      mark: svgDataUrl(inertMark(markSource, markPath)),
      messaging,
    };
  });
  if (Object.keys(products).length === 0) fail(`${PUBLIC_PATH} lists no products.`);

  const relationIds = new Set<string>();
  const relations = list(document.relations, `${PUBLIC_PATH}.relations`).flatMap((entry, index) => {
    const where = `${PUBLIC_PATH}.relations[${index}]`;
    const relation = record(entry, where);
    const id = text(relation.id, `${where}.id`);
    if (relationIds.has(id)) fail(`${PUBLIC_PATH} lists relation ${id} twice.`);
    relationIds.add(id);
    const sourceId = text(relation.source, `${where}.source`);
    const targetId = text(relation.target, `${where}.target`);
    const kind = oneOf(relation.kind, RELATION_KINDS, `${where}.kind`);
    const direction = oneOf(relation.direction, RELATION_DIRECTIONS, `${where}.direction`);
    const label = text(relation.label, `${where}.label`);
    const detail = optionalText(relation.detail, `${where}.detail`);
    // Public products only: edges to shared foundations stay out of this subpath.
    if (!Object.hasOwn(products, sourceId) || !Object.hasOwn(products, targetId)) return [];
    if (sourceId === targetId) fail(`${where} relates ${sourceId} to itself.`);
    return [{ id, source: sourceId, target: targetId, kind, direction, label, detail }];
  });

  const snapshot = {
    contract: PORTFOLIO_SNAPSHOT_CONTRACT,
    formatVersion: 1,
    provenance: {
      registry: PORTFOLIO_REGISTRY_URL,
      commit: source.commit,
      committedOn: source.committedOn,
      upstreamContract: UPSTREAM_CONTRACT,
      upstreamDigest: declaredDigest,
      files: [
        { path: PUBLIC_PATH, sha256: sha256Hex(source.publicPortfolio) },
        { path: BRANDS_PATH, sha256: sha256Hex(source.brands) },
        { path: ARTWORK_PATH, sha256: sha256Hex(source.artwork) },
        ...Object.keys(products)
          .map((id) => markPaths.get(id) ?? "")
          .filter((path, index, paths) => paths.indexOf(path) === index)
          .sort()
          .map((path) => ({ path, sha256: sha256Hex(source.marks[path] ?? "") })),
      ],
    },
    products,
    relations,
  };
  return { ...snapshot, digest: portfolioSnapshotDigest(snapshot) };
}

export function renderPortfolioJson(snapshot: Readonly<Record<string, unknown>>): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

export function renderPortfolioModule(snapshot: Readonly<Record<string, unknown>>): string {
  return [
    "// Generated by scripts/sync-portfolio-facts.ts from the Hraness portfolio registry. Do not edit.",
    `export const portfolioSnapshot = ${JSON.stringify(snapshot, null, 2)} as const;`,
    "",
  ].join("\n");
}

function git(checkout: string, args: readonly string[]): string {
  const result = Bun.spawnSync(["git", "-C", checkout, ...args], { stderr: "pipe", stdout: "pipe" });
  if (result.exitCode !== 0) {
    fail(`git ${args.join(" ")} failed: ${result.stderr.toString().trim()}`);
  }
  return result.stdout.toString();
}

export function readRegistrySource(checkout: string, ref: string, options: Readonly<{ allowUnmerged: boolean }>): PortfolioSnapshotSource {
  const commit = git(checkout, ["rev-parse", "--verify", `${ref}^{commit}`]).trim();
  if (!options.allowUnmerged) {
    const merged = Bun.spawnSync(["git", "-C", checkout, "merge-base", "--is-ancestor", commit, "origin/main"]);
    if (merged.exitCode !== 0) {
      fail(`${ref} (${commit}) is not on the registry's origin/main. Fetch first, or pass --allow-unmerged for a local preview that must not be committed.`);
    }
  }
  const artwork = git(checkout, ["show", `${commit}:${ARTWORK_PATH}`]);
  const marks: Record<string, string> = {};
  for (const path of new Set(parseArtworkMarks(artwork).values())) {
    marks[path] = git(checkout, ["show", `${commit}:${path}`]);
  }
  return {
    commit,
    committedOn: git(checkout, ["show", "-s", "--format=%cs", commit]).trim(),
    publicPortfolio: git(checkout, ["show", `${commit}:${PUBLIC_PATH}`]),
    brands: git(checkout, ["show", `${commit}:${BRANDS_PATH}`]),
    artwork,
    marks,
  };
}

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

export const PORTFOLIO_JSON_PATH = "src/portfolio.generated.json";
export const PORTFOLIO_MODULE_PATH = "src/portfolio.generated.ts";

if (import.meta.main) {
  const checkout = argument("--registry");
  const ref = argument("--ref") ?? "origin/main";
  if (checkout === undefined) {
    fail("Pass --registry <path to a portfolio registry checkout> and optionally --ref <ref> (default origin/main).");
  }
  if (process.argv.includes("--allow-unmerged") && process.argv.includes("--write")) {
    fail("--allow-unmerged only previews drift; the committed snapshot must come from a commit on the registry's origin/main.");
  }
  const root = resolve(import.meta.dir, "..");
  const snapshot = buildPortfolioSnapshot(readRegistrySource(resolve(checkout), ref, {
    allowUnmerged: process.argv.includes("--allow-unmerged"),
  }));
  const outputs = [
    [resolve(root, PORTFOLIO_JSON_PATH), renderPortfolioJson(snapshot)],
    [resolve(root, PORTFOLIO_MODULE_PATH), renderPortfolioModule(snapshot)],
  ] as const;
  if (process.argv.includes("--write")) {
    for (const [path, contents] of outputs) await writeFile(path, contents);
    console.log(`Wrote portfolio facts ${String(snapshot.digest)} from the portfolio registry at ${String((snapshot.provenance as { commit: string }).commit)}.`);
  } else {
    for (const [path, contents] of outputs) {
      const current = await readFile(path, "utf8").catch(() => "");
      if (current !== contents) {
        fail(`${path} has drifted from the portfolio registry at ${ref}. Review the change, then rerun with --write.`);
      }
    }
    console.log(`Portfolio facts match the portfolio registry at ${ref}.`);
  }
}
