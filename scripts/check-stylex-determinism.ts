import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { relative, resolve } from "node:path";

import { buildPackage } from "./build.js";

async function buildCopy(repository: string, destination: string): Promise<void> {
  await Promise.all([
    cp(resolve(repository, "src"), resolve(destination, "src"), {
      recursive: true,
    }),
    cp(resolve(repository, "vendor"), resolve(destination, "vendor"), {
      recursive: true,
    }),
  ]);
  await buildPackage(destination);
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
const work = await mkdtemp(resolve(tmpdir(), "hraness-design-kit-stylex-determinism-"));
const firstRoot = resolve(work, "first");
const secondRoot = resolve(work, "nested", "second");

try {
  await buildCopy(repository, firstRoot);
  await buildCopy(repository, secondRoot);

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
    "dist/react/index.js",
    "dist/react/server.js",
    "dist/stylex.css",
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
