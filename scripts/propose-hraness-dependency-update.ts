import { appendFile, lstat, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const dependencySections = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const;
const exactSpecifierPattern =
  /^github:hraness\/([a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)#v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;
const maxManifestBytes = 2 * 1_024 * 1_024;
const maxManifests = 2_000;
const maxReleaseResponseBytes = 4 * 1_024 * 1_024;

type JsonObject = Record<string, unknown>;

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export type StableVersion = Readonly<{
  major: number;
  minor: number;
  patch: number;
  tag: `v${number}.${number}.${number}`;
}>;

export type HranessDependencyPin = Readonly<{
  dependency: string;
  manifestPath: string;
  repository: `hraness/${string}`;
  section: string;
  specifier: string;
  version: StableVersion;
}>;

export type HranessDependencyUpdate = Readonly<{
  dependencies: readonly string[];
  fromTags: readonly string[];
  repository: `hraness/${string}`;
  target: StableVersion;
}>;

function object(value: unknown, label: string): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value as JsonObject;
}

function safeVersionPart(source: string): number | undefined {
  const value = Number(source);
  return Number.isSafeInteger(value) ? value : undefined;
}

export function parseStableVersion(value: unknown): StableVersion | undefined {
  if (typeof value !== "string") return undefined;
  const match = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u.exec(value);
  if (match === null) return undefined;
  const majorSource = match[1];
  const minorSource = match[2];
  const patchSource = match[3];
  if (
    majorSource === undefined
    || minorSource === undefined
    || patchSource === undefined
  ) {
    return undefined;
  }
  const major = safeVersionPart(majorSource);
  const minor = safeVersionPart(minorSource);
  const patch = safeVersionPart(patchSource);
  if (major === undefined || minor === undefined || patch === undefined) {
    return undefined;
  }
  return { major, minor, patch, tag: value as StableVersion["tag"] };
}

export function compareStableVersions(
  left: StableVersion,
  right: StableVersion,
): number {
  return left.major - right.major
    || left.minor - right.minor
    || left.patch - right.patch;
}

function compareStableTags(left: string, right: string): number {
  const leftVersion = parseStableVersion(left);
  const rightVersion = parseStableVersion(right);
  if (leftVersion === undefined || rightVersion === undefined) {
    throw new TypeError("Stable-tag comparison received an invalid version.");
  }
  return compareStableVersions(leftVersion, rightVersion);
}

export function parseExactHranessSpecifier(
  value: unknown,
): Readonly<{
  repository: `hraness/${string}`;
  version: StableVersion;
}> | undefined {
  if (typeof value !== "string") return undefined;
  const match = exactSpecifierPattern.exec(value);
  if (match === null) return undefined;
  const version = parseStableVersion(`v${match[2]}.${match[3]}.${match[4]}`);
  if (version === undefined) return undefined;
  return {
    repository: `hraness/${match[1]}`,
    version,
  };
}

function pinsInSection(
  value: unknown,
  manifestPath: string,
  section: string,
): HranessDependencyPin[] {
  if (value === undefined) return [];
  const dependencies = object(value, `${manifestPath} ${section}`);
  return Object.entries(dependencies).flatMap(([dependency, specifier]) => {
    const parsed = parseExactHranessSpecifier(specifier);
    return parsed === undefined
      ? []
      : [{
          dependency,
          manifestPath,
          repository: parsed.repository,
          section,
          specifier: specifier as string,
          version: parsed.version,
        }];
  });
}

export function collectManifestPins(
  manifestPath: string,
  manifestValue: unknown,
): readonly HranessDependencyPin[] {
  const manifest = object(manifestValue, manifestPath);
  const directPins = dependencySections.flatMap((section) =>
    pinsInSection(manifest[section], manifestPath, section));
  const workspaces = manifest.workspaces === undefined
    ? undefined
    : object(manifest.workspaces, `${manifestPath} workspaces`);
  const catalogPins = pinsInSection(
    workspaces?.catalog,
    manifestPath,
    "workspaces.catalog",
  );
  return [...directPins, ...catalogPins].toSorted((left, right) =>
    compareText(left.repository, right.repository)
    || compareText(left.dependency, right.dependency)
    || compareText(left.manifestPath, right.manifestPath)
    || compareText(left.section, right.section));
}

export function immutableStableVersions(value: unknown): readonly StableVersion[] {
  if (!Array.isArray(value)) {
    throw new TypeError("GitHub releases response must be an array.");
  }
  const byTag = new Map<string, StableVersion>();
  for (const [index, entry] of value.entries()) {
    const release = object(entry, `GitHub releases[${String(index)}]`);
    if (
      release.draft !== false
      || release.prerelease !== false
      || release.immutable !== true
    ) {
      continue;
    }
    const version = parseStableVersion(release.tag_name);
    if (version !== undefined) byTag.set(version.tag, version);
  }
  return [...byTag.values()].toSorted(compareStableVersions);
}

export function chooseDependencyUpdate(
  pins: readonly HranessDependencyPin[],
  releases: ReadonlyMap<string, readonly StableVersion[]>,
): HranessDependencyUpdate | undefined {
  const repositories = [...new Set(pins.map(({ repository }) => repository))]
    .toSorted(compareText);
  for (const repository of repositories) {
    const versions = releases.get(repository);
    if (versions === undefined || versions.length === 0) continue;
    const target = versions.at(-1);
    if (target === undefined) continue;
    const matching = pins.filter((pin) =>
      pin.repository === repository
      && compareStableVersions(pin.version, target) < 0);
    if (matching.length === 0) continue;
    return {
      dependencies: [...new Set(matching.map(({ dependency }) => dependency))]
        .toSorted(compareText),
      fromTags: [...new Set(matching.map(({ version }) => version.tag))]
        .toSorted(compareStableTags),
      repository,
      target,
    };
  }
  return undefined;
}

function updateSection(
  value: unknown,
  plan: HranessDependencyUpdate,
): number {
  if (value === undefined) return 0;
  const dependencies = object(value, "dependency section");
  let changes = 0;
  for (const [dependency, specifier] of Object.entries(dependencies)) {
    const parsed = parseExactHranessSpecifier(specifier);
    if (
      parsed?.repository === plan.repository
      && compareStableVersions(parsed.version, plan.target) < 0
    ) {
      dependencies[dependency] = `github:${plan.repository}#${plan.target.tag}`;
      changes += 1;
    }
  }
  return changes;
}

export function applyUpdateToManifest(
  manifestValue: unknown,
  plan: HranessDependencyUpdate,
): Readonly<{ changes: number; manifest: JsonObject }> {
  const manifest = structuredClone(object(manifestValue, "package.json"));
  let changes = 0;
  for (const section of dependencySections) {
    changes += updateSection(manifest[section], plan);
  }
  if (manifest.workspaces !== undefined) {
    const workspaces = object(manifest.workspaces, "package.json workspaces");
    changes += updateSection(workspaces.catalog, plan);
  }
  return { changes, manifest };
}

function trackedPackageManifests(repositoryRoot: string): readonly string[] {
  const trackedResult = Bun.spawnSync({
    cmd: ["git", "ls-files", "-z"],
    cwd: repositoryRoot,
    stderr: "pipe",
    stdout: "pipe",
  });
  if (trackedResult.exitCode !== 0) {
    throw new Error(`git ls-files failed: ${trackedResult.stderr.toString().trim()}`);
  }
  const deletedResult = Bun.spawnSync({
    cmd: ["git", "ls-files", "-z", "--deleted"],
    cwd: repositoryRoot,
    stderr: "pipe",
    stdout: "pipe",
  });
  if (deletedResult.exitCode !== 0) {
    throw new Error(`git ls-files --deleted failed: ${deletedResult.stderr.toString().trim()}`);
  }
  const deleted = new Set(deletedResult.stdout.toString().split("\0").filter(Boolean));
  const paths = trackedResult.stdout.toString().split("\0")
    .filter((path) =>
      (path === "package.json" || path.endsWith("/package.json"))
      && !deleted.has(path))
    .toSorted(compareText);
  if (paths.length === 0 || paths.length > maxManifests) {
    throw new Error(`Expected between 1 and ${String(maxManifests)} tracked package manifests.`);
  }
  return paths;
}

async function readManifest(
  repositoryRoot: string,
  path: string,
): Promise<Readonly<{ value: unknown }>> {
  const absolutePath = resolve(repositoryRoot, path);
  const stats = await lstat(absolutePath);
  if (!stats.isFile() || stats.size > maxManifestBytes) {
    throw new Error(`${path} must be a regular package manifest no larger than ${String(maxManifestBytes)} bytes.`);
  }
  const source = await readFile(absolutePath, "utf8");
  return { value: JSON.parse(source) as unknown };
}

async function fetchImmutableReleases(
  repository: `hraness/${string}`,
): Promise<readonly StableVersion[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "hraness-dependency-proposal",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token !== undefined && token.length > 0) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(
    `https://api.github.com/repos/${repository}/releases?per_page=100`,
    {
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!response.ok) {
    throw new Error(`GitHub release lookup for ${repository} failed with HTTP ${String(response.status)}.`);
  }
  const declaredLength = response.headers.get("content-length");
  if (declaredLength !== null && Number(declaredLength) > maxReleaseResponseBytes) {
    throw new Error(`GitHub release lookup for ${repository} exceeded the response limit.`);
  }
  const source = await response.text();
  if (Buffer.byteLength(source) > maxReleaseResponseBytes) {
    throw new Error(`GitHub release lookup for ${repository} exceeded the response limit.`);
  }
  const versions = immutableStableVersions(JSON.parse(source) as unknown);
  if (versions.length === 0) {
    throw new Error(`${repository} has no immutable stable GitHub Release.`);
  }
  return versions;
}

function parseArguments(args: readonly string[]): Readonly<{
  apply: boolean;
  excludedRepositories: ReadonlySet<string>;
  githubOutput?: string;
}> {
  let apply = false;
  const excludedRepositories = new Set<string>();
  let githubOutput: string | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--apply") {
      apply = true;
      continue;
    }
    if (argument === "--github-output") {
      const path = args[index + 1];
      if (path === undefined || path.length === 0) {
        throw new TypeError("--github-output requires a path.");
      }
      githubOutput = path;
      index += 1;
      continue;
    }
    if (argument === "--exclude-repository") {
      const repository = args[index + 1];
      if (
        repository === undefined
        || !/^hraness\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/u.test(repository)
      ) {
        throw new TypeError("--exclude-repository requires a Hraness repository slug.");
      }
      excludedRepositories.add(repository);
      index += 1;
      continue;
    }
    throw new TypeError(`Unknown argument: ${argument ?? ""}`);
  }
  return githubOutput === undefined
    ? { apply, excludedRepositories }
    : { apply, excludedRepositories, githubOutput };
}

async function writeOutputs(
  path: string | undefined,
  values: Readonly<Record<string, string>>,
): Promise<void> {
  if (path === undefined) return;
  for (const [key, value] of Object.entries(values)) {
    if (!/^[a-z_]+$/u.test(key) || !/^[A-Za-z0-9@/.,_-]*$/u.test(value)) {
      throw new Error("Refusing to write an unsafe GitHub Actions output.");
    }
  }
  await appendFile(path, Object.entries(values).map(([key, value]) =>
    `${key}=${value}\n`).join(""));
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseArguments(args);
  const repositoryRoot = process.cwd();
  const paths = trackedPackageManifests(repositoryRoot);
  const manifests = new Map<string, Awaited<ReturnType<typeof readManifest>>>();
  const pins: HranessDependencyPin[] = [];
  for (const path of paths) {
    const manifest = await readManifest(repositoryRoot, path);
    manifests.set(path, manifest);
    pins.push(...collectManifestPins(path, manifest.value));
  }
  const repositories = [...new Set(pins.map(({ repository }) => repository))]
    .filter((repository) => !options.excludedRepositories.has(repository))
    .toSorted(compareText);
  let plan: HranessDependencyUpdate | undefined;
  for (const repository of repositories) {
    const versions = await fetchImmutableReleases(repository);
    plan = chooseDependencyUpdate(
      pins.filter((pin) => pin.repository === repository),
      new Map([[repository, versions]]),
    );
    if (plan !== undefined) break;
  }

  if (plan === undefined) {
    await writeOutputs(options.githubOutput, { changed: "false" });
    console.log("All exact Hraness Git-tag dependencies are current.");
    return;
  }

  let changes = 0;
  if (options.apply) {
    for (const [path, manifest] of manifests) {
      const updated = applyUpdateToManifest(manifest.value, plan);
      if (updated.changes === 0) continue;
      await writeFile(
        resolve(repositoryRoot, path),
        `${JSON.stringify(updated.manifest, null, 2)}\n`,
      );
      changes += updated.changes;
    }
    if (changes === 0) {
      throw new Error("The selected dependency update did not change a package manifest.");
    }
  }

  const repositoryName = plan.repository.slice("hraness/".length);
  await writeOutputs(options.githubOutput, {
    branch_slug: `${repositoryName}-${plan.target.tag}`,
    changed: options.apply ? "true" : "false",
    dependencies: plan.dependencies.join(","),
    from_tags: plan.fromTags.join(","),
    repository: plan.repository,
    target_tag: plan.target.tag,
  });
  console.log(
    `${options.apply ? "Updated" : "Would update"} ${plan.dependencies.join(", ")} `
    + `from ${plan.fromTags.join(", ")} to ${plan.target.tag}.`,
  );
}

if (import.meta.main) await main();
