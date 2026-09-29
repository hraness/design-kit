// Prepare a release bump in one command: `bun run release:prepare <x.y.z>`.
//
// package.json is the only authored copy of the version. This script writes it
// there, updates the derived copies that tests compare against it (the
// portfolio inventory component and the README install pin and stable pair),
// and rebuilds `dist` so the StyleX manifest carries the new identity. Release
// notes stay hand-written.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;
const repository = process.cwd();

function fail(message: string): never {
  console.error(`release:prepare: ${message}`);
  process.exit(1);
}

function parse(version: string): readonly [number, number, number] {
  const match = semver.exec(version);
  if (match === null) fail(`"${version}" is not a stable x.y.z version.`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function newer(next: readonly number[], current: readonly number[]): boolean {
  for (let index = 0; index < 3; index += 1) {
    const left = next[index] ?? 0;
    const right = current[index] ?? 0;
    if (left !== right) return left > right;
  }
  return false;
}

async function replaceOnce(path: string, before: string, after: string): Promise<void> {
  const file = join(repository, path);
  const source = await readFile(file, "utf8");
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${path} must contain ${JSON.stringify(before)} exactly once (found ${count}).`);
  await writeFile(file, source.replace(before, after));
}

const next = process.argv[2];
if (next === undefined || process.argv.length > 3) fail("usage: bun run release:prepare <x.y.z>");
const packageJson = JSON.parse(await readFile(join(repository, "package.json"), "utf8")) as { version?: unknown };
if (typeof packageJson.version !== "string") fail("package.json has no version.");
const current = packageJson.version;
if (!newer(parse(next), parse(current))) fail(`${next} must be newer than ${current}.`);

await replaceOnce("package.json", `"version": "${current}",`, `"version": "${next}",`);
await replaceOnce("portfolio-inventory.json", `"version": "${current}"`, `"version": "${next}"`);
await replaceOnce(
  "README.md",
  `"@hraness/design-kit": "github:hraness/design-kit#v${current}"`,
  `"@hraness/design-kit": "github:hraness/design-kit#v${next}"`,
);
await replaceOnce(
  "README.md",
  "with `@hraness/design-kit` `v" + current + "`.",
  "with `@hraness/design-kit` `v" + next + "`.",
);

const build = Bun.spawnSync(["bun", "run", "build"], { cwd: repository, stdout: "inherit", stderr: "inherit" });
if (build.exitCode !== 0) fail("bun run build failed.");

console.log(`Prepared v${next}. Add the release notes to README.md, then run \`bun run check\`.`);
