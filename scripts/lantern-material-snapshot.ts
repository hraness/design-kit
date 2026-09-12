import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { lstat, mkdir, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import {
  checkLanternMaterialSnapshot,
  createLanternMaterialSnapshot,
  lanternSnapshotFileLimits,
  lanternSnapshotPaths,
} from "./check-lantern-material-snapshot.mjs";
import type { LanternMaterialSnapshot, LanternSnapshotArtifact } from "./check-lantern-material-snapshot.mjs";

export { checkLanternMaterialSnapshot, createLanternMaterialSnapshot, lanternSnapshotPaths, parseLanternMaterialSnapshot } from "./check-lantern-material-snapshot.mjs";
export type { LanternMaterialSnapshot } from "./check-lantern-material-snapshot.mjs";

const names = Object.keys(lanternSnapshotPaths) as LanternSnapshotArtifact[];
const missing = (error: unknown) => typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
type DirectoryIdentity = { readonly dev: number; readonly ino: number };
type Previous = { readonly identity: DirectoryIdentity; readonly manifest: LanternMaterialSnapshot | undefined };

async function previousSnapshot(directory: string): Promise<Previous | undefined> {
  let identity;
  try { identity = await lstat(directory); } catch (error) { if (missing(error)) return undefined; throw error; }
  if (!identity.isDirectory() || identity.isSymbolicLink()) throw new Error("Snapshot destination must be a physical directory.");
  const entries = await readdir(directory);
  return { identity, manifest: entries.length === 0 ? undefined : await checkLanternMaterialSnapshot(directory) };
}

async function assertPrevious(directory: string, previous: Previous): Promise<void> {
  const current = await previousSnapshot(directory);
  if (current === undefined || current.identity.dev !== previous.identity.dev || current.identity.ino !== previous.identity.ino
    || JSON.stringify(current.manifest) !== JSON.stringify(previous.manifest)) throw new Error("Snapshot changed during installation.");
}

export async function writeLanternMaterialSnapshot(directory: string, commit: string, sourceRoot = resolve(import.meta.dir, "..")): Promise<void> {
  if (!/^[a-f0-9]{40}$/u.test(commit)) throw new Error("Snapshot source must be a full lowercase Git commit.");
  const git = (args: readonly string[], maximum = 1024) => execFileSync("git", ["--no-pager", "--no-optional-locks", "--no-replace-objects", ...args], {
    cwd: sourceRoot, maxBuffer: maximum, timeout: 30_000, stdio: ["ignore", "pipe", "pipe"],
  });
  if (git(["cat-file", "-t", commit]).toString("utf8").trim() !== "commit") {
    throw new Error("Snapshot source must name a commit object, not a tree or tag object.");
  }
  // Every source mode and byte is read from the exact Git object before any
  // destination mutation. A dirty checkout cannot change the admitted payload.
  const files = Object.fromEntries(names.map((name) => {
    const path = lanternSnapshotPaths[name];
    const entry = git(["ls-tree", commit, "--", path]).toString("utf8").trim();
    if (!/^100644 blob [a-f0-9]{40}\t/u.test(entry) || entry.split("\t")[1] !== path) throw new Error(`Snapshot source ${path} must be one regular Git blob.`);
    return [name, git(["show", "--no-textconv", `${commit}:${path}`], lanternSnapshotFileLimits[name])];
  })) as Record<LanternSnapshotArtifact, Buffer>;
  const manifest = createLanternMaterialSnapshot(commit, files);
  directory = resolve(directory);
  const previous = await previousSnapshot(directory);
  await mkdir(dirname(directory), { recursive: true });
  // Resolve an existing parent once; do not stage through a changing symlink.
  directory = join(await realpath(dirname(directory)), basename(directory));
  if (previous !== undefined) await assertPrevious(directory, previous);
  else if (await previousSnapshot(directory) !== undefined) throw new Error("Snapshot destination appeared during installation.");
  const stage = `${directory}.stage-${randomUUID()}`;
  const backup = `${directory}.previous-${randomUUID()}`;
  let backedUp = false;
  try {
    await mkdir(stage, { mode: 0o700 });
    for (const name of names) await writeFile(join(stage, name), files[name], { flag: "wx", mode: 0o600 });
    await writeFile(join(stage, "provenance.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx", mode: 0o600 });
    await checkLanternMaterialSnapshot(stage);
    if (previous !== undefined) {
      await assertPrevious(directory, previous);
      await rename(directory, backup);
      backedUp = true;
      await assertPrevious(backup, previous);
    } else if (await previousSnapshot(directory) !== undefined) throw new Error("Snapshot destination appeared during installation.");
    await rename(stage, directory);
    const installed = await checkLanternMaterialSnapshot(directory);
    if (JSON.stringify(installed) !== JSON.stringify(manifest)) throw new Error("Installed snapshot differs from its immutable source.");
    if (backedUp && previous !== undefined) {
      await assertPrevious(backup, previous);
      await rm(backup, { recursive: true });
    }
  } catch (error) {
    if (backedUp) {
      // Never inspect or remove an unexpected destination while recovering the
      // admitted previous directory. Keep the backup if any path now exists.
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
    console.log(`Lantern material snapshot verified at ${(await checkLanternMaterialSnapshot(resolve(directory))).source.commit}.`);
  } else if (operation === "--write" && directory !== undefined && flag === "--source-commit" && commit !== undefined && extra.length === 0) {
    await writeLanternMaterialSnapshot(directory, commit);
    console.log(`Lantern material snapshot installed from ${commit}.`);
  } else throw new Error("Usage: bun scripts/lantern-material-snapshot.ts --check DIRECTORY | --write DIRECTORY --source-commit FULL_COMMIT");
}
