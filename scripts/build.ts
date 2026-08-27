import stylex from "@stylexjs/unplugin/esbuild";
import { rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { stylexCompilerOptions } from "./stylex-config.js";

export async function buildPackage(
  repository: string,
  outdir = join(resolve(repository), "dist"),
): Promise<void> {
  repository = resolve(repository);
  await rm(outdir, { recursive: true, force: true });

  const originalNodeEnvironment = process.env.NODE_ENV;
  const originalWorkingDirectory = process.cwd();
  process.env.NODE_ENV = "production";
  process.chdir(repository);

  try {
    const result = await Bun.build({
      conditions: ["production", "browser", "module"],
      entrypoints: [
        join(repository, "src/index.ts"),
        join(repository, "src/fonts/nebula-sans/social-fonts.generated.ts"),
        join(repository, "src/react/index.ts"),
        join(repository, "src/react/server.ts"),
        join(repository, "src/syntax-highlighting.ts"),
      ],
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
      },
      format: "esm",
      metafile: true,
      minify: false,
      naming: "[dir]/[name].[ext]",
      outdir,
      packages: "external",
      plugins: [stylex(stylexCompilerOptions(repository))],
      root: join(repository, "src"),
      splitting: true,
      target: "browser",
    });

    if (!result.success) {
      for (const log of result.logs) console.error(log);
      throw new Error("Package build failed");
    }

    // Keep the standards-only browser entry self-contained. Bun currently loses
    // live re-export bindings when this entry shares the root appearance module in
    // a split multi-entry graph.
    const browserResult = await Bun.build({
      conditions: ["production", "browser", "module"],
      entrypoints: [join(repository, "src/browser/index.ts")],
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
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
      throw new Error("Browser package build failed");
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
  } finally {
    process.chdir(originalWorkingDirectory);
    if (originalNodeEnvironment === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnvironment;
    }
  }
}

if (import.meta.main) await buildPackage(process.cwd());
