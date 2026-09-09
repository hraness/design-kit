import assert from "node:assert/strict";
import "./generate-palettes.js";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

import {
  STYLEX_PACKAGE_MANIFEST_SCHEMA_VERSION,
  artifactForFile,
  canonicalJson,
  compilerContract,
  compilerSha256,
  createStylexTransformCollector,
  readStylexPackageManifest,
  serializeStylexPackageRules,
  stylexRulesSha256,
  validateStylexPackageManifest,
  type StylexArtifactV1,
  type StylexPackageManifestV1,
  type StylexStandaloneSerializerV1,
} from "@hraness/ui/stylex-build";

const COMPILER_FOUNDATION = "src/compiler-palettes.css";
const COMPILER_STYLESHEET_PATHS = [
  "src/appearance-menu.css",
  "src/charts.css",
  "src/compiler-components.css",
  "src/compiler-foundation.css",
  COMPILER_FOUNDATION,
  "src/compiler-tokens.css",
  "src/components.css",
  "src/design-gallery.css",
  "src/effects.css",
  "src/fonts.css",
  "src/jelly.css",
  "src/palette-bridge.css",
  "src/palettes.css",
  "src/plain-publication.css",
  "src/plain-site.css",
  "src/product-marketing-foundation.css",
  "src/product-marketing.css",
  "src/reset.css",
  "src/styles.css",
  "src/syntax-highlighting.css",
  "src/tokens.css",
  "src/typography.css",
] as const;
const STANDALONE_SERIALIZER = {
  before: ["components.hraness-design-kit.legacy"],
  prefix: "components.hraness-design-kit",
} as const satisfies StylexStandaloneSerializerV1;

function relativeBelow(root: string, path: string, description: string): string {
  const logical = relative(root, path).split(sep).join("/");
  assert.ok(
    logical.length > 0
      && logical !== ".."
      && !logical.startsWith("../")
      && !logical.startsWith("/"),
    `${description} escapes the package root`,
  );
  return logical;
}

function loaderFor(path: string): "js" | "jsx" | "ts" | "tsx" {
  switch (extname(path).toLowerCase()) {
    case ".ts":
    case ".mts":
    case ".cts":
      return "ts";
    case ".tsx":
    case ".mtsx":
    case ".ctsx":
      return "tsx";
    case ".jsx":
    case ".mjsx":
    case ".cjsx":
      return "jsx";
    default:
      return "js";
  }
}

async function filesBelow(root: string, directory = root): Promise<string[]> {
  const output: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    assert.ok(
      !entry.isSymbolicLink(),
      `Build output contains a symlink: ${relativeBelow(root, path, "build output")}`,
    );
    if (entry.isDirectory()) output.push(...await filesBelow(root, path));
    else {
      assert.ok(
        entry.isFile(),
        `Build output is not an ordinary file: ${relativeBelow(root, path, "build output")}`,
      );
      output.push(relativeBelow(root, path, "build output"));
    }
  }
  return output.sort();
}

function requireBuildSuccess(
  result: Awaited<ReturnType<typeof Bun.build>>,
  description: string,
): void {
  if (!result.success) {
    throw new Error(`${description} failed:\n${result.logs.map(String).join("\n")}`);
  }
}

async function artifacts(
  repository: string,
  paths: readonly string[],
): Promise<readonly StylexArtifactV1[]> {
  return await Promise.all(
    [...paths].sort().map((path) => artifactForFile(repository, path)),
  );
}

export async function buildPackage(
  repository: string,
  outdir = join(resolve(repository), "dist"),
): Promise<void> {
  assert.equal(Bun.version, "1.3.14", "Package builds require Bun 1.3.14");
  repository = resolve(repository);
  outdir = resolve(outdir);
  relativeBelow(repository, outdir, "build output directory");
  await rm(outdir, { recursive: true, force: true });

  const originalNodeEnvironment = process.env.NODE_ENV;
  const originalWorkingDirectory = process.cwd();
  process.env.NODE_ENV = "production";
  process.chdir(repository);

  try {
    const sourceRoot = join(repository, "src");
    const escapedSourceRoot = sourceRoot.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const collector = createStylexTransformCollector(repository);
    const plugin: Bun.BunPlugin = {
      name: "hraness-design-kit-package-stylex",
      setup(build) {
        build.onLoad(
          { filter: new RegExp(`^${escapedSourceRoot}/.*\\.[cm]?[jt]sx?$`, "u") },
          async ({ path }) => {
            const source = await readFile(path, "utf8");
            const transformed = await collector.transform(source, path);
            return { contents: transformed.code, loader: loaderFor(path) };
          },
        );
      },
    };
    const result = await Bun.build({
      conditions: ["production", "browser", "module"],
      entrypoints: [
        join(sourceRoot, "index.ts"),
        join(sourceRoot, "fonts/nebula-sans/social-fonts.generated.ts"),
        // Keep the optional chart runtime behind its own split boundary. This
        // lets consumers tree-shake the React barrel without first loading
        // Recharts' legacy main/module package root into their build graph.
        join(sourceRoot, "react/charts.tsx"),
        join(sourceRoot, "react/index.ts"),
        join(sourceRoot, "react/server.ts"),
        join(sourceRoot, "syntax-highlighting.ts"),
      ],
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
      },
      env: "disable",
      format: "esm",
      metafile: true,
      minify: false,
      naming: "[dir]/[name].[ext]",
      outdir,
      packages: "external",
      plugins: [plugin],
      root: sourceRoot,
      splitting: true,
      target: "browser",
      throw: false,
    });
    requireBuildSuccess(result, "Package build");

    // Keep the standards-only browser entry self-contained. Bun currently loses
    // live re-export bindings when this entry shares the root appearance module in
    // a split multi-entry graph.
    const browserResult = await Bun.build({
      conditions: ["production", "browser", "module"],
      entrypoints: [join(sourceRoot, "browser/index.ts")],
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
      },
      env: "disable",
      format: "esm",
      minify: false,
      naming: "[dir]/[name].[ext]",
      outdir,
      packages: "external",
      plugins: [plugin],
      root: sourceRoot,
      splitting: false,
      target: "browser",
      throw: false,
    });
    requireBuildSuccess(browserResult, "Browser package build");
    const rules = collector.seal();
    assert.ok(rules.length > 0, "Package build collected no StyleX rules");

    const reactEntry = join(outdir, "react/index.js");
    const directive = '"use client";\n';
    const directiveLine = /^"use client";\r?\n?/gmu;
    for (const relativePath of (await filesBelow(outdir)).filter((path) => path.endsWith(".js"))) {
      const path = join(outdir, relativePath);
      const builtSource = await Bun.file(path).text();
      // Bun may carry a source directive into a shared split chunk. Normalize
      // every emitted module, then mark only the public aggregate React entry
      // as the client boundary consumers import.
      const normalizedSource = path === reactEntry
        ? directive + builtSource.replace(directiveLine, "")
        : builtSource.replace(directiveLine, "");
      if (normalizedSource !== builtSource) await writeFile(path, normalizedSource);
      const directives = normalizedSource.match(/^"use client";\r?$/gmu) ?? [];
      if (path === reactEntry) {
        if (!normalizedSource.startsWith(directive) || directives.length !== 1) {
          throw new Error("The React client entry must contain one leading use-client directive.");
        }
      } else if (directives.length > 0) {
        throw new Error(
          `Only the React client entry may contain a use-client directive: ${relativePath}`,
        );
      }
    }

    const standaloneCssPath = join(outdir, "stylex.css");
    await writeFile(
      standaloneCssPath,
      serializeStylexPackageRules(rules, STANDALONE_SERIALIZER),
      { flag: "wx", mode: 0o644 },
    );

    const rawPackage: unknown = JSON.parse(await readFile(join(repository, "package.json"), "utf8"));
    assert.ok(typeof rawPackage === "object" && rawPackage !== null && !Array.isArray(rawPackage));
    const packageRecord = rawPackage as Record<string, unknown>;
    assert.ok(typeof packageRecord.name === "string" && packageRecord.name.length > 0);
    assert.ok(typeof packageRecord.version === "string" && packageRecord.version.length > 0);
    assert.ok(
      typeof packageRecord.exports === "object"
        && packageRecord.exports !== null
        && !Array.isArray(packageRecord.exports),
      "Package exports must be an object",
    );
    const packageExports = packageRecord.exports as Record<string, unknown>;
    assert.equal(packageExports["./compiler-foundation.css"], "./src/compiler-foundation.css",
      "Package must retain its full compiler presentation entry");
    assert.equal(
      packageExports["./compiler-palettes.css"],
      `./${COMPILER_FOUNDATION}`,
      "Package must export its compiler foundation",
    );
    assert.equal(
      packageExports["./stylex-manifest.json"],
      "./dist/stylex-manifest.json",
      "Package must export its StyleX manifest",
    );

    const runtimePaths = (await filesBelow(outdir))
      .filter((path) => path.endsWith(".js"))
      .map((path) => relativeBelow(repository, join(outdir, path), "runtime artifact"));
    const standaloneCss = relativeBelow(repository, standaloneCssPath, "standalone CSS");
    const manifest: StylexPackageManifestV1 = validateStylexPackageManifest({
      buildTools: [],
      compiler: compilerContract,
      compilerFoundation: COMPILER_FOUNDATION,
      compilerSha256,
      kind: "hraness-stylex-package-manifest",
      package: { name: packageRecord.name, version: packageRecord.version },
      rules,
      rulesSha256: stylexRulesSha256(rules),
      runtime: await artifacts(repository, runtimePaths),
      schemaVersion: STYLEX_PACKAGE_MANIFEST_SCHEMA_VERSION,
      standaloneCss: await artifactForFile(repository, standaloneCss),
      standaloneSerializer: STANDALONE_SERIALIZER,
      stylesheets: await artifacts(repository, COMPILER_STYLESHEET_PATHS),
    });
    const manifestPath = join(outdir, "stylex-manifest.json");
    await writeFile(manifestPath, `${canonicalJson(manifest)}\n`, { flag: "wx", mode: 0o644 });
    assert.deepEqual(
      await readStylexPackageManifest(manifestPath, repository),
      manifest,
      "Written StyleX manifest differs from the verified package contract",
    );
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
