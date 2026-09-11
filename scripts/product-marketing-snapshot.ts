import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstat, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const repository = "https://github.com/hraness/design-kit";
export const marketingSnapshotPaths = {
  "product-marketing-preset.css": "src/product-marketing-preset.css",
  "fonts/instrument-serif/instrument-serif-latin-400.woff2": "src/fonts/instrument-serif/instrument-serif-latin-400.woff2",
  "fonts/instrument-serif/OFL.txt": "src/fonts/instrument-serif/OFL.txt",
  "fonts/instrument-serif/UPSTREAM.md": "src/fonts/instrument-serif/UPSTREAM.md",
  "marketing-assets/grain.svg": "src/marketing-assets/grain.svg",
  "marketing-assets/cells.svg": "src/marketing-assets/cells.svg",
  "marketing-assets/UPSTREAM.md": "src/marketing-assets/UPSTREAM.md",
  LICENSE: "LICENSE",
} as const;
type Artifact = keyof typeof marketingSnapshotPaths;
const artifacts = Object.keys(marketingSnapshotPaths) as Artifact[];
const digest = (value: Uint8Array) => createHash("sha256").update(value).digest("hex");
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const missing = (error: unknown) => isRecord(error) && error.code === "ENOENT";

export interface MarketingSnapshot {
  readonly schemaVersion: 1;
  readonly contractVersion: 1;
  readonly source: { readonly repository: typeof repository; readonly commit: string; readonly export: "@hraness/design-kit/product-marketing-preset.css" };
  readonly files: Readonly<Record<Artifact, { readonly path: string; readonly sha256: string }>>;
}

export function createMarketingSnapshot(commit: string, files: Readonly<Record<Artifact, Uint8Array>>): MarketingSnapshot {
  if (!/^[a-f0-9]{40}$/u.test(commit)) throw new Error("Snapshot source must be a full lowercase Git commit.");
  return {
    schemaVersion: 1, contractVersion: 1,
    source: { repository, commit, export: "@hraness/design-kit/product-marketing-preset.css" },
    files: Object.fromEntries(artifacts.map((name) => [name, { path: marketingSnapshotPaths[name], sha256: digest(files[name]) }])) as MarketingSnapshot["files"],
  };
}

export function parseMarketingSnapshot(value: unknown): MarketingSnapshot {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.contractVersion !== 1
    || !isRecord(value.source) || value.source.repository !== repository
    || value.source.export !== "@hraness/design-kit/product-marketing-preset.css"
    || typeof value.source.commit !== "string" || !/^[a-f0-9]{40}$/u.test(value.source.commit)
    || !isRecord(value.files) || Object.keys(value.files).sort().join("\n") !== [...artifacts].sort().join("\n")) {
    throw new Error("Invalid marketing snapshot provenance.");
  }
  for (const name of artifacts) {
    const file = value.files[name];
    if (!isRecord(file) || file.path !== marketingSnapshotPaths[name] || typeof file.sha256 !== "string" || !/^[a-f0-9]{64}$/u.test(file.sha256)) {
      throw new Error(`Invalid ${name} provenance.`);
    }
  }
  return value as unknown as MarketingSnapshot;
}

async function inventory(directory: string, prefix = ""): Promise<string[]> {
  const details = await lstat(directory);
  if (!details.isDirectory() || details.isSymbolicLink()) throw new Error("Snapshot directories must be physical directories.");
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Snapshot contains a symbolic link: ${path}`);
    if (entry.isDirectory()) {
      if (!artifacts.some((name) => name.startsWith(`${path}/`))) throw new Error(`Snapshot contains an unowned directory: ${path}`);
      files.push(...await inventory(join(directory, entry.name), `${path}/`));
    }
    else if (entry.isFile()) files.push(path);
    else throw new Error(`Snapshot contains a non-file: ${path}`);
  }
  return files.sort();
}

export async function checkMarketingSnapshot(directory: string): Promise<MarketingSnapshot> {
  const expected = [...artifacts, "provenance.json"].sort();
  if ((await inventory(directory)).join("\n") !== expected.join("\n")) throw new Error("Snapshot has missing or unowned files.");
  const value: unknown = JSON.parse(await readFile(join(directory, "provenance.json"), "utf8"));
  const manifest = parseMarketingSnapshot(value);
  for (const name of artifacts) {
    if (digest(await readFile(join(directory, name))) !== manifest.files[name].sha256) throw new Error(`${name} differs from its immutable snapshot.`);
  }
  return manifest;
}

export async function writeMarketingSnapshot(directory: string, commit: string, sourceRoot = resolve(import.meta.dir, "..")): Promise<void> {
  if (!/^[a-f0-9]{40}$/u.test(commit)) throw new Error("Snapshot source must be a full lowercase Git commit.");
  directory = resolve(directory);
  // Read immutable bytes before touching the destination. Never copy a dirty tree.
  const files = Object.fromEntries(artifacts.map((name) => [name, execFileSync("git", ["show", `${commit}:${marketingSnapshotPaths[name]}`], {
    cwd: sourceRoot, maxBuffer: 2 * 1024 * 1024, timeout: 30_000,
  })])) as Record<Artifact, Buffer>;
  const manifest = createMarketingSnapshot(commit, files);
  let previous: MarketingSnapshot | undefined;
  let existed = false;
  try {
    const present = await inventory(directory);
    existed = true;
    if (present.length > 0) previous = await checkMarketingSnapshot(directory);
  } catch (error) { if (!missing(error)) throw error; }
  await mkdir(dirname(directory), { recursive: true });
  const stage = `${directory}.stage-${randomUUID()}`;
  const backup = `${directory}.previous-${randomUUID()}`;
  let backedUp = false;
  try {
    await mkdir(stage);
    for (const name of artifacts) {
      await mkdir(dirname(join(stage, name)), { recursive: true });
      await writeFile(join(stage, name), files[name]);
    }
    await writeFile(join(stage, "provenance.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    await checkMarketingSnapshot(stage);
    if (existed) {
      if (previous === undefined) {
        if ((await inventory(directory)).length !== 0) throw new Error("Unowned files appeared in the snapshot destination.");
      } else if (JSON.stringify(await checkMarketingSnapshot(directory)) !== JSON.stringify(previous)) throw new Error("Snapshot changed during installation.");
      await rename(directory, backup);
      backedUp = true;
      // Check again after moving the exact directory before replacing it.
      if (previous === undefined ? (await inventory(backup)).length !== 0 : JSON.stringify(await checkMarketingSnapshot(backup)) !== JSON.stringify(previous)) throw new Error("Snapshot changed during installation.");
    }
    await rename(stage, directory);
    await checkMarketingSnapshot(directory);
    if (backedUp) await rm(backup, { recursive: true });
  } catch (error) {
    if (backedUp) {
      try { await lstat(directory); } catch (absent) { if (missing(absent)) await rename(backup, directory); }
    }
    throw error;
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const [operation, directory, flag, commit, ...extra] = process.argv.slice(2);
  if (operation === "--check" && directory !== undefined && flag === undefined) {
    console.log(`Marketing snapshot verified at ${(await checkMarketingSnapshot(resolve(directory))).source.commit}.`);
  } else if (operation === "--write" && directory !== undefined && flag === "--source-commit" && commit !== undefined && extra.length === 0) {
    await writeMarketingSnapshot(resolve(directory), commit);
    console.log(`Marketing snapshot installed from ${commit}.`);
  } else throw new Error("Usage: bun scripts/product-marketing-snapshot.ts --check DIRECTORY | --write DIRECTORY --source-commit FULL_COMMIT");
}
