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

const reactEntry = join(outdir, "react/index.js");
const source = await Bun.file(reactEntry).text();
const directive = '"use client";\n';
if (!source.startsWith(directive)) await writeFile(reactEntry, directive + source);
