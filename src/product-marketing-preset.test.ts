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
    "marketing-assets/cells.svg": "dc687b71a46c4767f052a0546485f6621b5f4c8f4003127807521e02a3c92d4c",
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

test("both native header blur paths survive the installed optimizer", () => {
  const optimized = transform({ filename: "product-marketing-preset.css", code: Buffer.from(css), minify: true }).code.toString();
  expect(optimized).toContain("-webkit-backdrop-filter:var(--hraness-marketing-header-backdrop)");
  expect(optimized).toContain(";backdrop-filter:var(--hraness-marketing-header-backdrop)");
  expect(optimized).toContain("prefers-reduced-transparency:reduce");
  expect(optimized).toContain("forced-colors:active");
  expect(css).toContain(']):where(.hraness-marketing-header, .hraness-marketing-header-surface)');
  expect(css).toContain('.hraness-marketing-field:where(.hraness-marketing-hero, .hraness-marketing-section)');
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
