import { expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { paperThemeCss } from "../scripts/generate-paper-theme.js";
import { checkPaperThemeSnapshot, createPaperThemeSnapshot, parsePaperThemeSnapshot, writePaperThemeSnapshot } from "../scripts/paper-theme-snapshot.js";

test("portable paper CSS stays generated, opt-in, and independent of runtime and assets", async () => {
  const css = await readFile(new URL("./paper-theme.css", import.meta.url), "utf8");
  expect(css).toBe(paperThemeCss);
  expect(css).not.toMatch(/@import\b|url\(|@font-face|@layer|!important/u);
  expect(css).toContain('[data-hraness-theme="paper"]');
  expect(css).toContain(':where(:not([data-palette]), [data-palette="paper"])');
  expect(css).toContain('light-dark(#f8f7f4, #12100f)');
  expect(css).toContain('--plain-background: var(--background)');
  expect(css).toContain('--ui-input: var(--control-border)');
  expect(css).not.toMatch(/(?:^|\n)(?:html|body|:root|\*)\s*\{/u);
});

test("snapshot verification is offline and detects changes to either redistributed artifact", async () => {
  const directory = await mkdtemp(join(tmpdir(), "paper-snapshot-test-"));
  try {
    const license = await readFile(new URL("../LICENSE", import.meta.url), "utf8");
    const manifest = createPaperThemeSnapshot("a".repeat(40), paperThemeCss, license);
    await writeFile(join(directory, "paper-theme.css"), paperThemeCss);
    await writeFile(join(directory, "LICENSE"), license);
    await writeFile(join(directory, "provenance.json"), JSON.stringify(manifest));
    expect(await checkPaperThemeSnapshot(directory)).toEqual(manifest);
    await writeFile(join(directory, "paper-theme.css"), `${paperThemeCss}\n/* local edit */`);
    await expect(checkPaperThemeSnapshot(directory)).rejects.toThrow("paper-theme.css differs");
    await writeFile(join(directory, "paper-theme.css"), paperThemeCss);
    await writeFile(join(directory, "LICENSE"), "changed");
    await expect(checkPaperThemeSnapshot(directory)).rejects.toThrow("LICENSE differs");
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("snapshot provenance rejects floating refs, paths, exports, and extra artifact names", () => {
  expect(() => createPaperThemeSnapshot("main", "", "")).toThrow();
  const valid = createPaperThemeSnapshot("a".repeat(40), "", "");
  for (const invalid of [null, {}, { ...valid, schemaVersion: 2 }, { ...valid, source: { ...valid.source, commit: "v1" } },
    { ...valid, source: { ...valid.source, export: "elsewhere.css" } },
    { ...valid, files: { ...valid.files, "../outside": valid.files.LICENSE } },
    { ...valid, files: { ...valid.files, LICENSE: { ...valid.files.LICENSE, path: "../LICENSE" } } }]) {
    expect(() => parsePaperThemeSnapshot(invalid)).toThrow();
  }
});


test("marketing size tokens preserve established defaults in standalone and compiled recipes", async () => {
  const [css, stylex] = await Promise.all([
    readFile(new URL("./product-marketing.css", import.meta.url), "utf8"),
    readFile(new URL("./react/product-marketing.stylex.ts", import.meta.url), "utf8"),
  ]);
  for (const contract of [
    "var(--hraness-paper-heading-size, clamp(2.5rem, 5vw, 4.25rem))",
    "var(--hraness-paper-summary-size, clamp(1.125rem, 1.6vw, 1.3rem))",
    "var(--hraness-paper-section-heading-size, clamp(1.75rem, 3vw, 2.5rem))",
    "var(--hraness-paper-section-heading-size, clamp(2rem, 4vw, 3.25rem))",
  ]) { expect(css).toContain(contract); expect(stylex).toContain(contract); }
});

test("the installer takes bytes from the named commit even when its checkout is dirty", async () => {
  const root = await mkdtemp(join(tmpdir(), "paper-committed-source-"));
  try {
    const source = join(root, "source");
    const output = join(root, "snapshot");
    await mkdir(join(source, "src"), { recursive: true });
    await writeFile(join(source, "src/paper-theme.css"), paperThemeCss);
    await writeFile(join(source, "LICENSE"), "MIT license fixture\n");
    const git = (...args: string[]) => execFileSync("git", args, { cwd: source, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    git("init"); git("add", "src/paper-theme.css", "LICENSE");
    git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "commit", "--no-gpg-sign", "-m", "Fixture source");
    const commit = git("rev-parse", "HEAD").trim();
    await writeFile(join(source, "src/paper-theme.css"), "dirty bytes");
    await writeFile(join(source, "LICENSE"), "dirty license");
    await writePaperThemeSnapshot(output, commit, source);
    expect(await readFile(join(output, "paper-theme.css"), "utf8")).toBe(paperThemeCss);
    expect(await readFile(join(output, "LICENSE"), "utf8")).toBe("MIT license fixture\n");
    expect((await checkPaperThemeSnapshot(output)).source.commit).toBe(commit);
    await writePaperThemeSnapshot(output, commit, source);
    await writeFile(join(output, "paper-theme.css"), "local changes");
    await expect(writePaperThemeSnapshot(output, commit, source)).rejects.toThrow("paper-theme.css differs");
  } finally { await rm(root, { recursive: true, force: true }); }
});
