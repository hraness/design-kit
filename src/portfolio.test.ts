import { describe, expect, test } from "bun:test";
import fc from "fast-check";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  PortfolioSyncError,
  buildPortfolioSnapshot,
  parseArtworkMarks,
  portfolioSnapshotDigest,
  renderPortfolioJson,
  renderPortfolioModule,
  sha256Hex,
  svgDataUrl,
  type PortfolioSnapshotSource,
} from "../scripts/sync-portfolio-facts.ts";
import { portfolioSnapshot } from "./portfolio.generated.js";
import {
  PortfolioFactsError,
  isPortfolioProductId,
  portfolioCopyStatuses,
  portfolioDigest,
  portfolioFacts,
  portfolioProductIds,
  portfolioProductStatuses,
  portfolioProducts,
  portfolioProvenance,
  portfolioRelationDirections,
  portfolioRelationKinds,
  portfolioRelations,
  product,
  relatedFor,
  usesPairs,
  type PortfolioProductId,
} from "./portfolio.js";

// Pinned facts. A snapshot regeneration must update these deliberately.
const PINNED_DIGEST = "sha256:bc450de6ae75caaf12cac87e85904616ecd2f6727bb89e84e9e4551a3a0b93ed";
const PINNED_COMMIT = "cd7ad529c7f821b224300277186f4c533655a8a1";

const jsonFile = new URL("./portfolio.generated.json", import.meta.url);
const moduleFile = new URL("./portfolio.generated.ts", import.meta.url);

describe("portfolio snapshot", () => {
  test("pins the digest and provenance", () => {
    expect(portfolioDigest).toBe(PINNED_DIGEST);
    expect(portfolioSnapshotDigest(portfolioFacts)).toBe(PINNED_DIGEST);
    expect(portfolioProvenance.registry).toBe("https://hraness.com/portfolio.json");
    expect(portfolioProvenance.commit).toBe(PINNED_COMMIT);
    expect(portfolioProvenance.committedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    expect(portfolioProvenance.upstreamContract).toBe("hraness.portfolio-public/v1");
    expect(portfolioProvenance.upstreamDigest).toMatch(/^sha256:[0-9a-f]{64}$/u);
    const paths = portfolioProvenance.files.map((file) => file.path);
    expect(paths.slice(0, 3)).toEqual([
      "portfolio.public.generated.json",
      "packages/brand-catalog/brands.yaml",
      "brand-artwork.json",
    ]);
    const markPaths = paths.slice(3);
    expect(markPaths).toEqual([...markPaths].sort());
    for (const path of markPaths) expect(path).toMatch(/^projects\/hraness\/public\/marks\/[a-z0-9-]+\.svg$/u);
    expect(markPaths.length).toBe(portfolioProductIds.length);
  });

  test("the JSON export and the module carry the same bytes", async () => {
    const json = await Bun.file(jsonFile).text();
    expect(json).toBe(renderPortfolioJson(portfolioSnapshot));
    expect(await Bun.file(moduleFile).text()).toBe(renderPortfolioModule(JSON.parse(json)));
  });

  test("pins the exact top-level and record shapes", () => {
    expect(Object.keys(portfolioFacts)).toEqual(["contract", "formatVersion", "provenance", "products", "relations", "digest"]);
    expect(portfolioFacts.contract).toBe("hraness.design-kit-portfolio/v1");
    expect(portfolioFacts.formatVersion).toBe(1);
    expect(portfolioProductIds.length).toBeGreaterThan(0);
    for (const id of portfolioProductIds) {
      const entry = portfolioProducts[id];
      expect(Object.keys(entry)).toEqual([
        "id", "name", "oneLiner", "brandDescription", "canonicalUrl", "status", "copyStatus", "aliases",
        "mark", "messaging",
      ]);
      expect(Object.hasOwn(entry.messaging, "superseded")).toBe(false);
      expect(entry.id).toBe(id);
      expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
      for (const value of [entry.name, entry.oneLiner, entry.brandDescription ?? "x", ...entry.aliases]) {
        expect(value.trim()).toBe(value);
        expect(value.length).toBeGreaterThan(0);
      }
      expect(new URL(entry.canonicalUrl).protocol).toBe("https:");
      // Marks are inert path artwork, safe unquoted in HTML and inside a double-quoted CSS url().
      expect(entry.mark).toMatch(/^data:image\/svg\+xml,%3Csvg [A-Za-z0-9 \-._~!$&'*+,;=:@/%]+%3C\/svg%3E$/u);
      expect(decodeURIComponent(entry.mark.slice("data:image/svg+xml,".length))).not.toMatch(/<(?!\/?(?:svg|g|path)[\s>])/u);
      expect(portfolioProductStatuses).toContain(entry.status);
      if (entry.copyStatus !== null) expect(portfolioCopyStatuses).toContain(entry.copyStatus);
      const lowered = entry.aliases.map((alias) => alias.toLowerCase());
      expect(new Set(lowered).size).toBe(lowered.length);
      expect(lowered).not.toContain(entry.name.toLowerCase());
    }
    const relationIds = new Set<string>();
    for (const relation of portfolioRelations) {
      expect(Object.keys(relation)).toEqual(["id", "source", "target", "kind", "direction", "label", "detail"]);
      expect(relationIds.has(relation.id)).toBe(false);
      relationIds.add(relation.id);
      expect(isPortfolioProductId(relation.source)).toBe(true);
      expect(isPortfolioProductId(relation.target)).toBe(true);
      expect(relation.source).not.toBe(relation.target);
      expect(portfolioRelationKinds).toContain(relation.kind);
      expect(portfolioRelationDirections).toContain(relation.direction);
      if (relation.detail !== null) expect(relation.detail.length).toBeGreaterThan(0);
    }
  });
});

describe("portfolio helpers", () => {
  test("the snapshot is frozen at runtime", () => {
    expect(Object.isFrozen(portfolioFacts)).toBe(true);
    expect(Object.isFrozen(portfolioRelations)).toBe(true);
    for (const id of portfolioProductIds) {
      expect(Object.isFrozen(portfolioProducts[id])).toBe(true);
      expect(Object.isFrozen(portfolioProducts[id].aliases)).toBe(true);
    }
    expect(() => {
      (portfolioProducts[portfolioProductIds[0] as PortfolioProductId] as { name: string }).name = "changed";
    }).toThrow(TypeError);
  });

  test("product() returns the record and rejects unknown ids", () => {
    const [first] = portfolioProductIds;
    expect(first).toBeDefined();
    expect(product(first as PortfolioProductId)).toBe(portfolioProducts[first as PortfolioProductId]);
    expect(() => product("not-a-product" as PortfolioProductId)).toThrow(PortfolioFactsError);
    expect(() => product("__proto__" as PortfolioProductId)).toThrow(PortfolioFactsError);
    expect(() => relatedFor("toString" as PortfolioProductId)).toThrow(PortfolioFactsError);
    expect(isPortfolioProductId("constructor")).toBe(false);
    expect(isPortfolioProductId(42)).toBe(false);
  });

  test("relatedFor() follows detailed relations in both directions, once per product", () => {
    for (const id of portfolioProductIds) {
      const items = relatedFor(id);
      const expected = new Set(portfolioRelations
        .filter((relation) => relation.detail !== null && (relation.source === id || relation.target === id))
        .map((relation) => (relation.source === id ? relation.target : relation.source)));
      expect(new Set(items.map((item) => item.productId))).toEqual(expected);
      expect(items.length).toBe(expected.size);
      for (const item of items) {
        const related = product(item.productId);
        const relation = portfolioRelations.find((candidate) => candidate.id === item.relationId);
        expect(item).toEqual({
          href: related.canonicalUrl,
          name: related.name,
          role: related.oneLiner,
          mark: related.mark,
          relationship: relation?.detail ?? "missing",
          productId: related.id,
          relationId: item.relationId,
        });
        expect(item.productId).not.toBe(id);
      }
    }
  });

  test("relatedFor() narrows by kind", () => {
    fc.assert(fc.property(
      fc.constantFrom(...portfolioProductIds),
      fc.subarray([...portfolioRelationKinds]),
      (id, kinds) => {
        const narrowed = relatedFor(id, { kinds });
        for (const item of narrowed) {
          const relation = portfolioRelations.find((candidate) => candidate.id === item.relationId);
          expect(relation === undefined ? undefined : kinds.includes(relation.kind)).toBe(true);
        }
        if (kinds.length === 0) expect(narrowed).toEqual([]);
      },
    ));
  });

  test("usesPairs() returns every detailed non-delivery relation with both products", () => {
    const pairs = usesPairs();
    expect(pairs.map((pair) => pair.relation.id)).toEqual(portfolioRelations
      .filter((relation) => relation.detail !== null && relation.kind !== "delivery")
      .map((relation) => relation.id));
    for (const pair of pairs) {
      expect(pair.source).toBe(product(pair.relation.source));
      expect(pair.target).toBe(product(pair.relation.target));
      expect(pair.relation.detail.length).toBeGreaterThan(0);
    }
  });
});

describe("portfolio boundary", () => {
  test("nothing else in the package imports the portfolio module", async () => {
    const root = new URL("./", import.meta.url).pathname;
    const importers: string[] = [];
    async function walk(directory: string): Promise<void> {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await walk(path);
        else if (/\.(?:ts|tsx)$/u.test(entry.name) && !/\.test\.tsx?$/u.test(entry.name)) {
          const source = await Bun.file(path).text();
          if (/from\s+["'][^"']*portfolio(?:\.generated)?(?:\.js|\.ts)?["']/u.test(source)) importers.push(relative(root, path));
        }
      }
    }
    await walk(root);
    expect(importers.sort()).toEqual(["portfolio.ts"]);
  });

  test("the module imports only its generated data", async () => {
    const source = await Bun.file(new URL("./portfolio.ts", import.meta.url)).text();
    expect([...source.matchAll(/^import .* from "([^"]+)";$/gmu)].map((match) => match[1])).toEqual([
      "./portfolio.generated.js",
    ]);
  });
});

const COMMIT = "0123456789abcdef0123456789abcdef01234567";

function upstream(body: Readonly<{ projects: unknown[]; relations?: unknown[] }>): string {
  const document = {
    contract: "hraness.portfolio-public/v1",
    formatVersion: 1,
    projects: body.projects,
    foundations: [{ id: "ui", name: "ui" }],
    relations: body.relations ?? [],
    url: "https://hraness.com/portfolio.json",
  };
  return JSON.stringify({ ...document, digest: `sha256:${sha256Hex(JSON.stringify(document))}` });
}

function messagingRecord(product: string, proseName: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    formatVersion: 1,
    product,
    names: { name: proseName },
    category: "test category",
    tagline: `${proseName} does one thing.`,
    short: `${product} short line`,
    meta: `${proseName} is a small test product that exists to pin the portfolio snapshot's shape in tests.`,
    medium: `${proseName} is a small test product. It pins the snapshot shape in tests.`,
    status: { default: "proposed" },
    ...extra,
  };
}

function project(id: string, url: string, name: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  const proseName = `${id[0]?.toUpperCase() ?? ""}${id.slice(1)}`;
  const messaging = messagingRecord(id, proseName, (extra.messaging ?? {}) as Record<string, unknown>);
  return {
    id,
    canonicalUrl: url,
    name,
    description: String(messaging.short).toLowerCase(),
    ...extra,
    messaging,
  };
}

const brands = [
  "brands:",
  "  - domain: alpha.example",
  "    name: Alpha",
  "    expanded_name: Alpha Expanded",
  "    description: Alpha brand description.",
  "    handle_x: private-handle",
  "  - domain: beta.example",
  "    name: beta",
  "    expanded_name: beta",
  "    description: TBD",
  "",
].join("\n");

const markSvg = (fill: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">\n  <path fill="${fill}" d="M0 0h16v16H0z"/>\n</svg>\n`;
const artwork = JSON.stringify({
  formatVersion: 1,
  products: ["alpha", "beta", "gamma"].map((id) => ({ id, illustration: `projects/hraness/public/icons/${id}.svg`, mark: `projects/hraness/public/marks/${id}.svg` })),
  reserved: [],
});
const marks: Readonly<Record<string, string>> = {
  "projects/hraness/public/marks/alpha.svg": markSvg("#2474d4"),
  "projects/hraness/public/marks/beta.svg": markSvg("#356a54"),
  "projects/hraness/public/marks/gamma.svg": markSvg("#858982"),
};
const markUrl = (fill: string) => svgDataUrl(markSvg(fill).trim());

function source(publicPortfolio: string, brandSource = brands): PortfolioSnapshotSource {
  return { commit: COMMIT, committedOn: "2026-09-23", publicPortfolio, brands: brandSource, artwork, marks };
}

describe("sync-portfolio-facts", () => {
  const fixture = upstream({
    projects: [
      project("alpha", "https://alpha.example", "ALPHA", {
        messaging: { status: { default: "authored" } },
      }),
      project("beta", "https://beta.example", "BETA"),
      project("gamma", "https://alpha.example/gamma", "GAMMA"),
    ],
    relations: [
      { id: "runtime:alpha:beta:uses", source: "alpha", target: "beta", kind: "runtime", direction: "forward", label: "uses", detail: "Alpha uses beta." },
      { id: "runtime:alpha:ui:uses", source: "alpha", target: "ui", kind: "runtime", direction: "forward", label: "uses" },
    ],
  });

  test("projects public facts, brand casing, and aliases", () => {
    const snapshot = buildPortfolioSnapshot(source(fixture));
    expect(snapshot.products).toEqual({
      alpha: {
        id: "alpha", name: "Alpha", oneLiner: "alpha short line", brandDescription: "Alpha brand description.",
        canonicalUrl: "https://alpha.example", status: "active", copyStatus: "authored", aliases: ["Alpha Expanded"],
        mark: markUrl("#2474d4"),
        messaging: messagingRecord("alpha", "Alpha", { status: { default: "authored" } }),
      },
      beta: {
        id: "beta", name: "beta", oneLiner: "beta short line", brandDescription: null,
        canonicalUrl: "https://beta.example", status: "active", copyStatus: "proposed", aliases: [],
        mark: markUrl("#356a54"),
        messaging: messagingRecord("beta", "Beta"),
      },
      gamma: {
        id: "gamma", name: "GAMMA", oneLiner: "gamma short line", brandDescription: null,
        canonicalUrl: "https://alpha.example/gamma", status: "active", copyStatus: "proposed", aliases: [],
        mark: markUrl("#858982"),
        messaging: messagingRecord("gamma", "Gamma"),
      },
    });
    expect(snapshot.relations).toEqual([
      { id: "runtime:alpha:beta:uses", source: "alpha", target: "beta", kind: "runtime", direction: "forward", label: "uses", detail: "Alpha uses beta." },
    ]);
    expect(renderPortfolioJson(snapshot)).not.toContain("private-handle");
    expect(snapshot.digest).toBe(portfolioSnapshotDigest(snapshot));
  });

  test("is deterministic and records exact provenance", () => {
    const first = renderPortfolioJson(buildPortfolioSnapshot(source(fixture)));
    expect(renderPortfolioJson(buildPortfolioSnapshot(source(fixture)))).toBe(first);
    const snapshot = buildPortfolioSnapshot(source(fixture));
    expect(snapshot.provenance).toEqual({
      registry: "https://hraness.com/portfolio.json",
      commit: COMMIT,
      committedOn: "2026-09-23",
      upstreamContract: "hraness.portfolio-public/v1",
      upstreamDigest: JSON.parse(fixture).digest,
      files: [
        { path: "portfolio.public.generated.json", sha256: sha256Hex(fixture) },
        { path: "packages/brand-catalog/brands.yaml", sha256: sha256Hex(brands) },
        { path: "brand-artwork.json", sha256: sha256Hex(artwork) },
        ...Object.keys(marks).sort().map((path) => ({ path, sha256: sha256Hex(marks[path] ?? "") })),
      ],
    });
  });

  test("encodes marks as compact data URLs that decode to the collapsed source", () => {
    const url = svgDataUrl(markSvg("#2474d4").trim());
    expect(url).toBe("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%232474d4' d='M0 0h16v16H0z'/%3E%3C/svg%3E");
    expect(decodeURIComponent(url.slice("data:image/svg+xml,".length))).toBe(markSvg("#2474d4").trim().replace(/\s+/gu, " ").replace(/> </gu, "><").replaceAll("\"", "'"));
    fc.assert(fc.property(fc.string({ maxLength: 80 }), (body) => {
      const encoded = svgDataUrl(body);
      expect(encoded).toMatch(/^data:image\/svg\+xml,[A-Za-z0-9 \-._~!$&'*+,;=:@/%]*$/u);
      expect(decodeURIComponent(encoded.slice("data:image/svg+xml,".length))).toBe(body.replace(/\s+/gu, " ").replace(/> </gu, "><").replaceAll("\"", "'"));
    }));
  });

  test("reads one mark path per product from the artwork registry", () => {
    expect([...parseArtworkMarks(artwork)]).toEqual([
      ["alpha", "projects/hraness/public/marks/alpha.svg"],
      ["beta", "projects/hraness/public/marks/beta.svg"],
      ["gamma", "projects/hraness/public/marks/gamma.svg"],
    ]);
  });

  test("any change to the upstream facts changes the digest", () => {
    const base = buildPortfolioSnapshot(source(fixture)).digest;
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 40 }).filter((value) => value.trim() === value && value.trim().length > 0 && value !== "alpha short line"), (line) => {
      const changed = upstream({ projects: [project("alpha", "https://alpha.example", "ALPHA", {
        description: line.toLowerCase(),
        messaging: { short: line },
      })] });
      expect(buildPortfolioSnapshot(source(changed)).digest).not.toBe(base);
    }));
  });

  test("fails closed on tampered or malformed upstream data", () => {
    const tampered = JSON.stringify({ ...JSON.parse(fixture), url: "https://example.com/portfolio.json" });
    const cases: readonly [string, PortfolioSnapshotSource][] = [
      ["digest", source(tampered)],
      ["short commit", { ...source(fixture), commit: "abc123" }],
      ["date", { ...source(fixture), committedOn: "23 Sept" }],
      ["json", source("{")],
      ["duplicate product", source(upstream({ projects: [project("alpha", "https://alpha.example", "A"), project("alpha", "https://alpha.example", "A")] }))],
      ["http url", source(upstream({ projects: [project("alpha", "http://alpha.example", "A")] }))],
      ["credential url", source(upstream({ projects: [project("alpha", "https://user:pass@alpha.example", "A")] }))],
      ["query url", source(upstream({ projects: [project("alpha", "https://alpha.example/?ref=x", "A")] }))],
      ["bad id", source(upstream({ projects: [project("Alpha", "https://alpha.example", "A")] }))],
      ["untrimmed name", source(upstream({ projects: [project("alpha", "https://alpha.example", " A")] }))],
      ["bad copy status", source(upstream({ projects: [project("alpha", "https://alpha.example", "A", { messaging: { status: { default: "live" } } })] }))],
      ["private ledger", source(upstream({ projects: [project("alpha", "https://alpha.example", "A", { messaging: { superseded: [{ tier: "tagline", text: "x", replacedOn: "2026-09-24" }] } })] }))],
      ["missing messaging", source(upstream({ projects: [{ id: "alpha", canonicalUrl: "https://alpha.example", name: "A", description: "x" }] }))],
      ["stale card line", source(upstream({ projects: [project("alpha", "https://alpha.example", "A", { description: "not the lowercased short" })] }))],
      ["bad relation kind", source(upstream({
        projects: [project("alpha", "https://alpha.example", "A"), project("beta", "https://beta.example", "B")],
        relations: [{ id: "x", source: "alpha", target: "beta", kind: "friendship", direction: "forward", label: "x" }],
      }))],
      ["duplicate relation", source(upstream({
        projects: [project("alpha", "https://alpha.example", "A"), project("beta", "https://beta.example", "B")],
        relations: [0, 1].map(() => ({ id: "x", source: "alpha", target: "beta", kind: "runtime", direction: "forward", label: "x" })),
      }))],
      ["duplicate brand", source(fixture, `${brands}  - domain: alpha.example\n    name: Again\n`)],
      ["no products", source(upstream({ projects: [] }))],
      ["missing artwork entry", { ...source(fixture), artwork: JSON.stringify({ formatVersion: 1, products: [], reserved: [] }) }],
      ["artwork json", { ...source(fixture), artwork: "{" }],
      ["artwork outside the marks root", { ...source(fixture), artwork: artwork.replace("public/marks/alpha.svg", "public/icons/alpha.svg") }],
      ["missing mark file", { ...source(fixture), marks: { ...marks, "projects/hraness/public/marks/alpha.svg": undefined as unknown as string } }],
      ...([
        ["script", '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'],
        ["image", '<svg xmlns="http://www.w3.org/2000/svg"><image href="x.png"/></svg>'],
        ["handler", '<svg xmlns="http://www.w3.org/2000/svg"><path onclick="x()" d="M0 0"/></svg>'],
        ["style", '<svg xmlns="http://www.w3.org/2000/svg"><path style="fill:red" d="M0 0"/></svg>'],
        ["reference", '<svg xmlns="http://www.w3.org/2000/svg"><path fill="url(#g)" d="M0 0"/></svg>'],
        ["single quote", "<svg xmlns=\"http://www.w3.org/2000/svg\"><path d='M0 0'/></svg>"],
        ["non-ascii", '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0" fill="ó"/></svg>'],
        ["no namespace", '<svg><path d="M0 0"/></svg>'],
        ["oversized", `<svg xmlns="http://www.w3.org/2000/svg"><path d="${"M0 0 ".repeat(8000)}"/></svg>`],
      ] as const).map(([name, svg]) => [`${name} mark`, { ...source(fixture), marks: { ...marks, "projects/hraness/public/marks/alpha.svg": svg } }] as [string, PortfolioSnapshotSource]),
    ];
    for (const [name, input] of cases) {
      expect(() => buildPortfolioSnapshot(input), name).toThrow(PortfolioSyncError);
    }
  });
});
