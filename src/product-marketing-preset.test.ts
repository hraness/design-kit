import { expect, test } from "bun:test";
import { transform } from "lightningcss";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type * as SnapshotChecker from "../scripts/check-marketing-snapshot.mjs";
import { marketingTextures } from "../scripts/marketing-textures.js";
import { checkMarketingSnapshot, createMarketingSnapshot, marketingSnapshotPaths, parseMarketingSnapshot, writeMarketingSnapshot } from "../scripts/product-marketing-snapshot.js";

const css = await readFile(new URL("./product-marketing-preset.css", import.meta.url), "utf8");
const sources = Object.fromEntries(await Promise.all(Object.entries(marketingSnapshotPaths).map(async ([name, path]) => [name, await readFile(new URL(`../${path}`, import.meta.url))]))) as Record<keyof typeof marketingSnapshotPaths, Buffer>;

test("the preset retains the approved static assets and source-relative URLs", () => {
  for (const [name, contents] of Object.entries(marketingTextures())) expect(sources[`marketing-assets/${name}` as keyof typeof sources].toString()).toBe(contents);
  const hashes = {
    "marketing-assets/grain.svg": "b40c33a0e382c8e9d0518b4720321b5c262a929c28d40a190a902d07acd06553",
    "marketing-assets/cells.svg": "2391e9b3ee964e1178fedc55c766d12ac43bfeda92cfa44aab16c64a15f9d712",
    "fonts/instrument-serif/instrument-serif-latin-400.woff2": "60c06664b5a95c7de6cc3e00d1f9034d78bd1e40b564016b241674449a067d4d",
  } as const;
  for (const [name, digest] of Object.entries(hashes)) {
    expect(createHash("sha256").update(sources[name as keyof typeof sources]).digest("hex")).toBe(digest);
    expect(css).toContain(`url("./${name}")`);
  }
  expect(css).not.toMatch(/@import|!important|::before|::after|animation:|transition:/u);
  expect(css).toContain('--hraness-marketing-field-images: none');
  expect(css).toContain('--hraness-marketing-display-font: var(--font-text');
  expect(css).not.toContain('--hraness-marketing-accent:');
});

test("the soft cell field retains all seamless faces and dark-mode highlights", async () => {
  const cells = sources["marketing-assets/cells.svg"].toString();
  expect(cells).toContain('viewBox="0 0 768 768"');
  expect(cells).not.toMatch(/\bstroke(?:-|=)/u);
  expect([...cells.matchAll(/<linearGradient\b/gu)]).toHaveLength(64);
  expect([...cells.matchAll(/<path\b/gu)]).toHaveLength(64);
  for (let index = 0; index < 64; index++) {
    expect(cells).toContain(`<path d="M${index % 8 * 96} ${Math.floor(index / 8) * 96}h96v96h-96z" fill="url(#p${index})"/>`);
  }
  const highlights = [...cells.matchAll(/<stop stop-color="#fff" stop-opacity="([\d.]+)"/gu)].map(match => Number(match[1]));
  const shades = [...cells.matchAll(/<stop offset="1" stop-color="#000" stop-opacity="([\d.]+)"/gu)].map(match => Number(match[1]));
  expect(highlights).toHaveLength(64); expect(shades).toHaveLength(64);
  for (const value of highlights) { expect(value).toBeGreaterThanOrEqual(.025); expect(value).toBeLessThanOrEqual(.07); }
  for (const value of shades) { expect(value).toBeGreaterThanOrEqual(.008); expect(value).toBeLessThanOrEqual(.034); }
  const material = await readFile(new URL("./lantern-material.css", import.meta.url), "utf8");
  expect(material).toContain('--hraness-pattern-cells: linear-gradient(145deg, rgb(255 255 255 / 0.05), transparent 48%, rgb(0 0 0 / 0.035));');
});

test("both native header blur paths survive the installed optimizer", () => {
  const optimized = transform({ filename: "product-marketing-preset.css", code: Buffer.from(css), minify: true }).code.toString();
  expect(optimized).toContain("-webkit-backdrop-filter:var(--hraness-marketing-header-backdrop)");
  expect(optimized).toContain(";backdrop-filter:var(--hraness-marketing-header-backdrop)");
  expect(optimized).toContain("prefers-reduced-transparency:reduce");
  expect(optimized).toContain("forced-colors:active");
  expect(css).toContain('.hraness-marketing-header-surface,\n');
  expect(css).toContain(']):where(.hraness-marketing-header, .hraness-marketing-header-surface)');
  expect(css).toMatch(/\.hraness-marketing-field:where\([^)]*\.hraness-marketing-hero[^)]*\.hraness-marketing-trust[^)]*\.hraness-marketing-maker[^)]*\):not\(\[data-tone="accent"\]\)/u);
});

test("the legacy preset applies actual heading declarations without changing application headings", () => {
  expect(css).toMatch(/\.hraness-marketing-hero__heading\s*\{[^}]*font-family: var\(--hraness-marketing-display-font\);[^}]*font-size: var\(--hraness-marketing-h1-size\);[^}]*font-weight: var\(--hraness-marketing-display-weight\);/u);
  expect(css).toContain('font-size: var(--hraness-marketing-h2-size);');
  expect(css).not.toMatch(/(?:^|[,\n])\s*(?:h1|h2|body|html|:root)\b/u);
  expect(css).toContain('.hraness-marketing-hero__name');
  expect(css).toContain('):empty {\n    display: none;');
});

test("snapshot schema rejects floating sources, changed paths, and unknown assets", () => {
  const valid = createMarketingSnapshot("a".repeat(40), sources);
  expect(parseMarketingSnapshot(valid)).toEqual(valid);
  expect(() => createMarketingSnapshot("main", sources)).toThrow();
  for (const invalid of [null, {}, { ...valid, contractVersion: 2 }, { ...valid, source: { ...valid.source, commit: "main" } }, { ...valid, source: { ...valid.source, repository: "https://example.test" } }, { ...valid, files: { ...valid.files, "../outside": valid.files.LICENSE } }, { ...valid, files: { ...valid.files, LICENSE: { ...valid.files.LICENSE, path: "../LICENSE" } } }]) expect(() => parseMarketingSnapshot(invalid)).toThrow();
});

test("immutable snapshot installation rejects binary edits, unowned files, and symlinks", async () => {
  const root = await mkdtemp(join(tmpdir(), "marketing-snapshot-"));
  try {
    const source = join(root, "source"); const output = join(root, "snapshot");
    await mkdir(source);
    for (const [name, path] of Object.entries(marketingSnapshotPaths)) {
      await mkdir(dirname(join(source, path)), { recursive: true });
      await writeFile(join(source, path), sources[name as keyof typeof sources]);
    }
    const git = (...args: string[]) => execFileSync("git", args, { cwd: source, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    git("init"); git("add", "."); git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "commit", "--no-gpg-sign", "-m", "Snapshot fixture");
    const commit = git("rev-parse", "HEAD").trim();
    const tree = git("rev-parse", "HEAD^{tree}").trim();
    git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "tag", "--no-sign", "-a", "snapshot-fixture", "-m", "Fixture annotation");
    const tag = git("rev-parse", "refs/tags/snapshot-fixture").trim();
    for (const object of [tree, tag]) await expect(writeMarketingSnapshot(output, object, source)).rejects.toThrow("must name a commit object");
    expect(await Bun.file(join(output, "provenance.json")).exists()).toBe(false);
    await writeFile(join(source, "src/product-marketing-preset.css"), "dirty source");
    await writeMarketingSnapshot(output, commit, source);
    expect((await checkMarketingSnapshot(output)).source.commit).toBe(commit);
    const standalone = () => execFileSync("node", [join(output, "check.mjs")], { encoding: "utf8", timeout: 10_000, stdio: ["ignore", "pipe", "pipe"] });
    expect(standalone()).toContain(commit);
    const exported = await import(join(output, "check.mjs")) as typeof SnapshotChecker;
    expect((await exported.checkMarketingSnapshot(output)).source.commit).toBe(commit);
    expect(await readFile(join(output, "product-marketing-preset.css"), "utf8")).toBe(css);
    await writeMarketingSnapshot(output, commit, source);
    // Upgrade the previously admitted contract-1 inventory without erasing
    // unverified caller bytes. Only the checker artifact was absent there.
    const old = await checkMarketingSnapshot(output);
    const oldFiles = { ...old.files }; delete oldFiles["check.mjs"]; delete oldFiles["check.d.mts"];
    await rm(join(output, "check.mjs")); await rm(join(output, "check.d.mts"));
    await writeFile(join(output, "provenance.json"), JSON.stringify({ ...old, files: oldFiles }));
    await expect(checkMarketingSnapshot(output)).rejects.toThrow("provenance");
    await writeMarketingSnapshot(output, commit, source);
    expect(standalone()).toContain(commit);
    const font = "fonts/instrument-serif/instrument-serif-latin-400.woff2";
    await writeFile(join(output, font), "damaged font");
    await expect(checkMarketingSnapshot(output)).rejects.toThrow("differs");
    expect(standalone).toThrow();
    await expect(writeMarketingSnapshot(output, commit, source)).rejects.toThrow("differs");
    await writeFile(join(output, font), sources[font]);
    await writeFile(join(output, "unowned.txt"), "keep");
    await expect(writeMarketingSnapshot(output, commit, source)).rejects.toThrow("unowned");
    expect(await readFile(join(output, "unowned.txt"), "utf8")).toBe("keep");
    await rm(join(output, "unowned.txt")); await mkdir(join(output, "unowned"));
    await expect(writeMarketingSnapshot(output, commit, source)).rejects.toThrow("unowned directory");
    await rm(join(output, "unowned"), { recursive: true }); await rm(join(output, font));
    await symlink(join(source, marketingSnapshotPaths[font]), join(output, font));
    await expect(checkMarketingSnapshot(output)).rejects.toThrow("symbolic link");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("independent material and preset snapshots keep the same finite pattern contract", async () => {
  const material = await readFile(new URL("./lantern-material.css", import.meta.url), "utf8");
  for (const pattern of ["cells", "weave", "contour", "mesh", "none"]) {
    const selector = `[data-hraness-pattern="${pattern}"] {`;
    const block = (source: string) => {
      const start = source.indexOf(selector);
      expect(start).toBeGreaterThan(-1);
      return source.slice(start, source.indexOf("\n  }", start));
    };
    expect(block(css)).toBe(block(material));
  }
  for (const [filename, source] of [["preset.css", css], ["material.css", material]] as const) {
    const optimized = transform({ filename, code: Buffer.from(source), minify: true }).code.toString();
    expect(optimized).toContain("repeating-conic-gradient");
    expect(optimized).toContain("repeating-radial-gradient");
    expect(optimized).toContain("prefers-reduced-transparency:reduce");
    expect(optimized).toContain("forced-colors:active");
  }
  // A quiet document default must survive a descendant marketing scope.
  expect(css).toContain("--hraness-marketing-field-images: var(--hraness-pattern-decoration,");
  expect(css).not.toMatch(/--hraness-marketing-(?:field|terminal)-[\w-]+:\s*light-dark\(/u);
});
