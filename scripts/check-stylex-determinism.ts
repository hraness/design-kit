import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { relative, resolve } from "node:path";

async function buildInFreshProcess(
  buildScript: string,
  destination: string,
): Promise<void> {
  // Give each absolute-root proof a fresh collector so extracted rules cannot
  // leak between roots before their generated outputs are compared.
  const subprocess = Bun.spawn({
    cmd: [process.execPath, buildScript],
    cwd: destination,
    env: process.env,
    stderr: "pipe",
    stdout: "pipe",
  });
  const [exitCode, stderr, stdout] = await Promise.all([
    subprocess.exited,
    new Response(subprocess.stderr).text(),
    new Response(subprocess.stdout).text(),
  ]);
  if (exitCode !== 0) {
    const diagnostic = [stdout.trim(), stderr.trim()]
      .filter((output) => output.length > 0)
      .join("\n");
    throw new Error(
      `StyleX determinism build failed in ${destination}${diagnostic.length > 0 ? `:\n${diagnostic}` : ""}`,
    );
  }
}

async function buildCopy(
  repository: string,
  destination: string,
  buildScript: string,
): Promise<void> {
  await Promise.all([
    cp(resolve(repository, "package.json"), resolve(destination, "package.json")),
    cp(resolve(repository, "src"), resolve(destination, "src"), {
      recursive: true,
    }),
    cp(resolve(repository, "vendor"), resolve(destination, "vendor"), {
      recursive: true,
    }),
  ]);
  await buildInFreshProcess(buildScript, destination);
}

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  }));
  return nested.flat();
}

const repository = process.cwd();
const buildScript = resolve(repository, "scripts/build.ts");
const work = await mkdtemp(resolve(tmpdir(), "hraness-design-kit-stylex-determinism-"));
const firstRoot = resolve(work, "first");
const secondRoot = resolve(work, "nested", "second");

try {
  await buildCopy(repository, firstRoot, buildScript);
  await buildCopy(repository, secondRoot, buildScript);

  const [firstFiles, secondFiles] = await Promise.all([
    filesBelow(resolve(firstRoot, "dist")),
    filesBelow(resolve(secondRoot, "dist")),
  ]);
  const firstRelative = firstFiles
    .map((path) => relative(firstRoot, path))
    .sort();
  const secondRelative = secondFiles
    .map((path) => relative(secondRoot, path))
    .sort();
  if (JSON.stringify(firstRelative) !== JSON.stringify(secondRelative)) {
    throw new Error(
      `StyleX determinism builds emitted different file sets: ${JSON.stringify({ firstRelative, secondRelative })}`,
    );
  }
  const requiredOutputs = [
    "dist/browser/index.js",
    "dist/index.js",
    "dist/react/charts.js",
    "dist/react/index.js",
    "dist/react/server.js",
    "dist/stylex.css",
    "dist/stylex-manifest.json",
    "dist/syntax-highlighting.js",
  ] as const;
  const missingOutputs = requiredOutputs.filter(
    (relativePath) => !firstRelative.includes(relativePath),
  );
  if (missingOutputs.length > 0) {
    throw new Error(
      `StyleX determinism builds omitted required outputs: ${missingOutputs.join(", ")}`,
    );
  }

  for (const relativePath of firstRelative) {
    const [first, second] = await Promise.all([
      readFile(resolve(firstRoot, relativePath)),
      readFile(resolve(secondRoot, relativePath)),
    ]);
    if (!first.equals(second)) {
      throw new Error(`${relativePath} differs across absolute build roots`);
    }
  }
  console.log(
    `StyleX JS and CSS are byte-identical across absolute roots (${String(firstRelative.length)} files)`,
  );
} finally {
  await rm(work, { force: true, recursive: true });
}
