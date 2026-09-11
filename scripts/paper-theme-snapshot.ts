import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = "https://github.com/hraness/design-kit";
const artifacts = ["paper-theme.css", "LICENSE"] as const;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export interface PaperThemeSnapshot {
  readonly schemaVersion: 1;
  readonly contractVersion: 1;
  readonly source: {
    readonly repository: typeof repository;
    readonly commit: string;
    readonly export: "@hraness/design-kit/paper-theme.css";
  };
  readonly files: Readonly<Record<(typeof artifacts)[number], { readonly path: string; readonly sha256: string }>>;
}

export function createPaperThemeSnapshot(commit: string, css: string, license: string): PaperThemeSnapshot {
  if (!/^[a-f0-9]{40}$/u.test(commit)) throw new Error("Snapshot source must be a full lowercase Git commit.");
  return {
    schemaVersion: 1, contractVersion: 1,
    source: { repository, commit, export: "@hraness/design-kit/paper-theme.css" },
    files: {
      "paper-theme.css": { path: "src/paper-theme.css", sha256: digest(css) },
      LICENSE: { path: "LICENSE", sha256: digest(license) },
    },
  };
}

export function parsePaperThemeSnapshot(value: unknown): PaperThemeSnapshot {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.contractVersion !== 1
    || !isRecord(value.source) || value.source.repository !== repository
    || value.source.export !== "@hraness/design-kit/paper-theme.css"
    || typeof value.source.commit !== "string" || !/^[a-f0-9]{40}$/u.test(value.source.commit)
    || !isRecord(value.files) || Object.keys(value.files).sort().join(",") !== "LICENSE,paper-theme.css") {
    throw new Error("Invalid Paper theme provenance manifest.");
  }
  for (const name of artifacts) {
    const artifact = value.files[name];
    const path = name === "LICENSE" ? "LICENSE" : "src/paper-theme.css";
    if (!isRecord(artifact) || artifact.path !== path || typeof artifact.sha256 !== "string" || !/^[a-f0-9]{64}$/u.test(artifact.sha256)) {
      throw new Error(`Invalid ${name} provenance.`);
    }
  }
  return value as unknown as PaperThemeSnapshot;
}

export async function checkPaperThemeSnapshot(directory: string): Promise<PaperThemeSnapshot> {
  const value: unknown = JSON.parse(await readFile(resolve(directory, "provenance.json"), "utf8"));
  const manifest = parsePaperThemeSnapshot(value);
  for (const name of artifacts) {
    if (digest(await readFile(resolve(directory, name), "utf8")) !== manifest.files[name].sha256) {
      throw new Error(`${name} differs from its immutable snapshot; keep local adaptations in a separate stylesheet.`);
    }
  }
  return manifest;
}

export async function writePaperThemeSnapshot(directory: string, commit: string, sourceRoot = resolve(import.meta.dir, "..")): Promise<void> {
  if (!/^[a-f0-9]{40}$/u.test(commit)) throw new Error("Snapshot source must be a full lowercase Git commit.");
  const committed = (path: string) => execFileSync("git", ["show", `${commit}:${path}`], { cwd: sourceRoot, encoding: "utf8", maxBuffer: 1024 * 1024 });
  const css = committed("src/paper-theme.css");
  const license = committed("LICENSE");
  const manifest = createPaperThemeSnapshot(commit, css, license);
  // Existing snapshots must still be intact before an intentional upgrade.
  try {
    await readFile(resolve(directory, "provenance.json"));
    await checkPaperThemeSnapshot(directory);
  } catch (error) {
    if (!(isRecord(error) && error.code === "ENOENT")) throw error;
    for (const name of artifacts) {
      try { await readFile(resolve(directory, name)); }
      catch (missing) { if (isRecord(missing) && missing.code === "ENOENT") continue; throw missing; }
      throw new Error(`Refusing to overwrite ${name} without snapshot provenance.`);
    }
  }
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "paper-theme.css"), css);
  await writeFile(resolve(directory, "LICENSE"), license);
  await writeFile(resolve(directory, "provenance.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await checkPaperThemeSnapshot(directory);
}

if (import.meta.main) {
  const [operation, directory, flag, commit, ...extra] = process.argv.slice(2);
  if (operation === "--check" && directory !== undefined && flag === undefined) {
    const result = await checkPaperThemeSnapshot(resolve(directory));
    console.log(`Paper theme snapshot verified at ${result.source.commit}.`);
  } else if (operation === "--write" && directory !== undefined && flag === "--source-commit" && commit !== undefined && extra.length === 0) {
    await writePaperThemeSnapshot(resolve(directory), commit);
    console.log(`Paper theme snapshot installed from ${commit}.`);
  } else throw new Error("Usage: bun scripts/paper-theme-snapshot.ts --check DIRECTORY | --write DIRECTORY --source-commit FULL_COMMIT");
}
