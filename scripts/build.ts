import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const repository = process.cwd();
const outdir = join(repository, "dist");
await rm(outdir, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [
    join(repository, "src/index.ts"),
    join(repository, "src/react/index.ts"),
    join(repository, "src/react/server.ts"),
    join(repository, "src/syntax-highlighting.ts"),
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  format: "esm",
  minify: false,
  naming: "[dir]/[name].[ext]",
  outdir,
  packages: "external",
  root: join(repository, "src"),
  splitting: true,
  target: "browser",
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

// Keep the standards-only browser entry self-contained. Bun currently loses
// live re-export bindings when this entry shares the root appearance module in
// a split multi-entry graph.
const browserResult = await Bun.build({
  entrypoints: [join(repository, "src/browser/index.ts")],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  format: "esm",
  minify: false,
  naming: "[dir]/[name].[ext]",
  outdir,
  packages: "external",
  root: join(repository, "src"),
  splitting: false,
  target: "browser",
});

if (!browserResult.success) {
  for (const log of browserResult.logs) console.error(log);
  process.exit(1);
}

const reactEntry = join(outdir, "react/index.js");
const source = await Bun.file(reactEntry).text();
const directive = '"use client";\n';
const directiveLine = /^"use client";\r?\n?/gmu;
const normalizedSource = directive + source.replace(directiveLine, "");
await writeFile(reactEntry, normalizedSource);

for await (const relativePath of new Bun.Glob("**/*.js").scan({ cwd: outdir })) {
  const path = join(outdir, relativePath);
  const builtSource = await Bun.file(path).text();
  const directives = builtSource.match(/^"use client";\r?$/gmu) ?? [];
  if (path === reactEntry) {
    if (!builtSource.startsWith(directive) || directives.length !== 1) {
      throw new Error("The React client entry must contain one leading use-client directive.");
    }
  } else if (directives.length > 0) {
    throw new Error(
      `Only the React client entry may contain a use-client directive: ${relativePath}`,
    );
  }
}
