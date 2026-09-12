import { expect, test } from "bun:test";
import fc from "fast-check";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { link, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type * as SnapshotChecker from "../scripts/check-lantern-material-snapshot.mjs";
import {
  checkLanternMaterialSnapshot,
  createLanternMaterialSnapshot,
  lanternSnapshotPaths,
  parseLanternMaterialSnapshot,
  writeLanternMaterialSnapshot,
} from "../scripts/lantern-material-snapshot.js";
import type { LanternSnapshotArtifact } from "../scripts/check-lantern-material-snapshot.mjs";

const artifacts = Object.keys(lanternSnapshotPaths) as LanternSnapshotArtifact[];
const sources = Object.fromEntries(await Promise.all(artifacts.map(async (name) => [name,
  await readFile(new URL(`../${lanternSnapshotPaths[name]}`, import.meta.url)),
]))) as Record<LanternSnapshotArtifact, Buffer>;
const commit = "a".repeat(40);
const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

async function withTemporary(operation: (root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "lantern-material-snapshot-"));
  try { await operation(root); } finally { await rm(root, { recursive: true, force: true }); }
}

async function fixtureSnapshot(root: string, files = sources): Promise<void> {
  await mkdir(root, { recursive: true });
  for (const name of artifacts) await writeFile(join(root, name), files[name]);
  await writeFile(join(root, "provenance.json"), JSON.stringify(createLanternMaterialSnapshot(commit, files)));
}

async function fixtureRepository(root: string) {
  await mkdir(root);
  for (const name of artifacts) {
    const path = join(root, lanternSnapshotPaths[name]);
    await mkdir(dirname(path), { recursive: true }); await writeFile(path, sources[name]);
  }
  const git = (...args: string[]) => execFileSync("git", ["-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", "-c", "tag.gpgsign=false",
    "-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", ...args], { cwd: root, encoding: "utf8", timeout: 10_000, stdio: ["ignore", "pipe", "pipe"] }).trim();
  git("init"); git("add", "."); git("commit", "-m", "Immutable Lantern fixture");
  return git;
}

test("Lantern provenance is exact, finite and separate from the marketing preset", () => {
  const valid = createLanternMaterialSnapshot(commit, sources);
  expect(parseLanternMaterialSnapshot(valid)).toEqual(valid);
  expect(Object.keys(valid.files).sort()).toEqual(["LICENSE", "check.d.mts", "check.mjs", "lantern-material.css"]);
  for (const invalid of [
    null, [], {}, { ...valid, extra: true }, { ...valid, schemaVersion: 2 }, { ...valid, contractVersion: 2 },
    { ...valid, source: { ...valid.source, commit: "main" } },
    { ...valid, source: { ...valid.source, commit: "A".repeat(40) } },
    { ...valid, source: { ...valid.source, branch: "main" } },
    { ...valid, source: { ...valid.source, repository: "https://example.test" } },
    { ...valid, source: { ...valid.source, export: "@hraness/design-kit/product-marketing-preset.css" } },
    { ...valid, files: { ...valid.files, "../outside": valid.files.LICENSE } },
    { ...valid, files: { ...valid.files, LICENSE: { ...valid.files.LICENSE, path: "../LICENSE" } } },
    { ...valid, files: { ...valid.files, LICENSE: { ...valid.files.LICENSE, sha256: "Z".repeat(64) } } },
    { ...valid, files: { ...valid.files, LICENSE: { ...valid.files.LICENSE, optional: true } } },
  ]) expect(() => parseLanternMaterialSnapshot(invalid)).toThrow();
  expect(() => createLanternMaterialSnapshot("main", sources)).toThrow();
  expect(() => createLanternMaterialSnapshot(commit, { ...sources, LICENSE: Buffer.alloc(0) })).toThrow();
  expect(() => createLanternMaterialSnapshot(commit, { ...sources, LICENSE: Buffer.alloc(64 * 1024 + 1) })).toThrow();
});

test("seeded byte inventories round trip and bind every admitted source byte", () => {
  fc.assert(fc.property(fc.array(fc.uint8Array({ minLength: 1, maxLength: 256 }), { minLength: 4, maxLength: 4 }), (values) => {
    const files = Object.fromEntries(artifacts.map((name, index) => [name, values[index]])) as Record<LanternSnapshotArtifact, Uint8Array>;
    const manifest = createLanternMaterialSnapshot(commit, files);
    expect(parseLanternMaterialSnapshot(JSON.parse(JSON.stringify(manifest)) as unknown)).toEqual(manifest);
    for (const name of artifacts) expect(manifest.files[name]).toEqual({ path: lanternSnapshotPaths[name], sha256: sha256(files[name]) });
  }), { seed: 20260912, numRuns: 32 });
});

test("seeded single-byte drift is rejected for every snapshot artifact", async () => {
  await withTemporary(async (root) => {
    await fc.assert(fc.asyncProperty(fc.constantFrom(...artifacts), fc.integer({ min: 0, max: 4095 }), fc.integer({ min: 1, max: 255 }), async (name, offset, mask) => {
      await fixtureSnapshot(root);
      const changed = Buffer.from(sources[name]); const index = offset % changed.length;
      changed[index] = (changed[index] ?? 0) ^ mask;
      await writeFile(join(root, name), changed);
      await expect(checkLanternMaterialSnapshot(root)).rejects.toThrow("differs from its immutable snapshot");
    }), { seed: 20260913, numRuns: 24 });
  });
});

test("immutable Git bytes install, upgrade, and verify with standalone Node and typed API", async () => {
  await withTemporary(async (root) => {
    const source = join(root, "source"), output = join(root, "snapshot");
    const git = await fixtureRepository(source); const first = git("rev-parse", "HEAD");
    await writeFile(join(source, "src/lantern-material.css"), "dirty checkout, never copied");
    await writeLanternMaterialSnapshot(output, first, source);
    expect(Buffer.compare(await readFile(join(output, "lantern-material.css")), sources["lantern-material.css"])).toBe(0);
    expect((await checkLanternMaterialSnapshot(output)).source.commit).toBe(first);
    expect(execFileSync("node", [join(output, "check.mjs")], { encoding: "utf8", timeout: 10_000 })).toContain(first);
    const checker = await import(join(output, "check.mjs")) as typeof SnapshotChecker;
    expect((await checker.checkLanternMaterialSnapshot()).source.commit).toBe(first);
    await writeLanternMaterialSnapshot(output, first, source);
    await writeFile(join(source, "src/lantern-material.css"), `${sources["lantern-material.css"].toString()}\n/* next immutable fixture */\n`);
    git("add", "."); git("commit", "-m", "Next immutable Lantern fixture"); const second = git("rev-parse", "HEAD");
    await writeLanternMaterialSnapshot(output, second, source);
    expect((await checkLanternMaterialSnapshot(output)).source.commit).toBe(second);
    expect(await readFile(join(output, "lantern-material.css"), "utf8")).toContain("next immutable fixture");
    git("replace", first, second);
    await writeLanternMaterialSnapshot(output, first, source);
    expect((await checkLanternMaterialSnapshot(output)).source.commit).toBe(first);
    expect(Buffer.compare(await readFile(join(output, "lantern-material.css")), sources["lantern-material.css"])).toBe(0);
    expect((await readdir(root)).sort()).toEqual(["snapshot", "source"]);
  });
});

test("floating, tree, tag, missing and symbolic Git sources fail before touching the destination", async () => {
  await withTemporary(async (root) => {
    const source = join(root, "source"), parent = join(root, "not-created"), output = join(parent, "snapshot");
    const git = await fixtureRepository(source); const first = git("rev-parse", "HEAD");
    git("tag", "--no-sign", "-a", "fixture", "-m", "Annotated fixture");
    for (const bad of ["main", git("rev-parse", "HEAD^{tree}"), git("rev-parse", "refs/tags/fixture"), "0".repeat(40)]) {
      await expect(writeLanternMaterialSnapshot(output, bad, source)).rejects.toThrow();
      expect(await lstat(parent).then(() => true, () => false)).toBe(false);
    }
    await rm(join(source, "src/lantern-material.css"));
    await symlink("../LICENSE", join(source, "src/lantern-material.css"));
    git("add", "."); git("commit", "-m", "Symbolic source fixture");
    await expect(writeLanternMaterialSnapshot(output, git("rev-parse", "HEAD"), source)).rejects.toThrow("regular Git blob");
    expect(await lstat(parent).then(() => true, () => false)).toBe(false);
    await writeLanternMaterialSnapshot(output, first, source);
    expect((await checkLanternMaterialSnapshot(output)).source.commit).toBe(first);
  });
});

test("replacement preserves modified and unowned destinations", async () => {
  await withTemporary(async (root) => {
    const source = join(root, "source"), output = join(root, "snapshot"); const git = await fixtureRepository(source);
    const sourceCommit = git("rev-parse", "HEAD");
    await mkdir(output); await writeLanternMaterialSnapshot(output, sourceCommit, source);
    await writeFile(join(output, "lantern-material.css"), "keep caller edit");
    await expect(writeLanternMaterialSnapshot(output, sourceCommit, source)).rejects.toThrow("differs");
    expect(await readFile(join(output, "lantern-material.css"), "utf8")).toBe("keep caller edit");
    await writeFile(join(output, "lantern-material.css"), sources["lantern-material.css"]);
    await writeFile(join(output, "unowned.txt"), "keep unrelated bytes");
    await expect(writeLanternMaterialSnapshot(output, sourceCommit, source)).rejects.toThrow("unowned");
    expect(await readFile(join(output, "unowned.txt"), "utf8")).toBe("keep unrelated bytes");
    expect((await readdir(root)).sort()).toEqual(["snapshot", "source"]);
  });
});

test("physical inventory rejects root links, file links, hardlinks, folders and missing files", async () => {
  await withTemporary(async (root) => {
    const snapshot = join(root, "snapshot"); await fixtureSnapshot(snapshot);
    await symlink(snapshot, join(root, "linked"));
    await expect(checkLanternMaterialSnapshot(join(root, "linked"))).rejects.toThrow("physical directory");
    for (const kind of ["symlink", "hardlink", "directory", "missing"] as const) {
      const path = join(snapshot, "LICENSE"); await rm(path, { recursive: true, force: true });
      if (kind === "symlink") { await writeFile(join(root, "license"), sources.LICENSE); await symlink(join(root, "license"), path); }
      if (kind === "hardlink") await link(join(root, "license"), path);
      if (kind === "directory") await mkdir(path);
      await expect(checkLanternMaterialSnapshot(snapshot)).rejects.toThrow();
    }
    await fixtureSnapshot(snapshot);
    await mkdir(join(snapshot, "empty-unowned"));
    await expect(checkLanternMaterialSnapshot(snapshot)).rejects.toThrow("unowned");
  });
});

test("same-file growth after admission is rejected within the original read budget", async () => {
  await withTemporary(async (root) => {
    // Isolate the I/O interception in Node so concurrent Bun tests retain their
    // real filesystem. Growth happens at the first read, after both stats.
    const driver = `
      import fs from "node:fs/promises";
      import { syncBuiltinESMExports } from "node:module";
      import { pathToFileURL } from "node:url";
      import { join } from "node:path";
      const [checker, root, mode] = process.argv.slice(2);
      const path = join(root, "LICENSE"), before = await fs.stat(path);
      const observed = { grew: false, consumed: 0, closed: false };
      const originalOpen = fs.open.bind(fs);
      fs.open = async (...args) => {
        const file = await originalOpen(...args);
        if (args[0] !== path) return file;
        const read = file.read.bind(file), readFile = file.readFile.bind(file), close = file.close.bind(file);
        const grow = async () => {
          if (mode === "grow" && !observed.grew) {
            observed.grew = true;
            await fs.appendFile(path, Buffer.alloc(64 * 1024 + 17, 120));
          }
        };
        file.read = async (buffer, offset, length, position) => {
          await grow();
          const result = await read(buffer, offset, Math.min(length, 7), position);
          observed.consumed += result.bytesRead;
          return result;
        };
        file.readFile = async (...args) => {
          await grow();
          const result = await readFile(...args);
          observed.consumed += result.byteLength;
          return result;
        };
        file.close = async () => { observed.closed = true; return close(); };
        return file;
      };
      syncBuiltinESMExports();
      const { checkLanternMaterialSnapshot } = await import(pathToFileURL(checker).href);
      let error = null, commit = null;
      try { commit = (await checkLanternMaterialSnapshot(root)).source.commit; }
      catch (failure) { error = failure.message; }
      const after = await fs.stat(path);
      console.log(JSON.stringify({ ...observed, error, commit, sameFile: before.dev === after.dev && before.ino === after.ino }));
    `;
    const driverPath = join(root, "growth-driver.mjs"); await writeFile(driverPath, driver);
    for (const mode of ["stable", "grow"] as const) {
      const snapshot = join(root, mode); await fixtureSnapshot(snapshot);
      const result = JSON.parse(execFileSync("node", [driverPath,
        fileURLToPath(new URL("../scripts/check-lantern-material-snapshot.mjs", import.meta.url)), snapshot, mode], {
        cwd: root, env: { PATH: process.env.PATH ?? "" }, encoding: "utf8", timeout: 10_000, maxBuffer: 4096,
      })) as { grew: boolean; consumed: number; closed: boolean; error: string | null; commit: string | null; sameFile: boolean };
      expect(result.sameFile).toBe(true);
      expect(result.closed).toBe(true);
      expect(result.grew).toBe(mode === "grow");
      expect(result.consumed).toBe(sources.LICENSE.length + (mode === "grow" ? 1 : 0));
      expect(result.error).toBe(mode === "grow" ? "Snapshot file changed while reading." : null);
      expect(result.commit).toBe(mode === "grow" ? null : commit);
    }
  });
});

test("the shipped CSS, documentation, checker and manifest inventories stay explicit", async () => {
  const packageText = await readFile(new URL("../package.json", import.meta.url), "utf8");
  const pkg = JSON.parse(packageText) as { exports: Record<string, unknown>; files: string[] };
  expect(pkg.exports["./lantern-material.css"]).toBe("./src/lantern-material.css");
  for (const path of [...Object.values(lanternSnapshotPaths), "LANTERN_MATERIAL.md", "scripts/lantern-material-snapshot.ts"].filter((path) => path !== "LICENSE")) {
    expect(pkg.files.filter((entry) => entry === path)).toHaveLength(1);
  }
  for (const path of ["scripts/build.ts", "scripts/check-stylex-artifacts.ts", "scripts/package-smoke.ts"]) {
    expect(await readFile(new URL(`../${path}`, import.meta.url), "utf8")).toContain('"src/lantern-material.css"');
  }
});
