import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const repository = new URL("../", import.meta.url);
const textExtensions = new Set([".css", ".json", ".md", ".mjs", ".ts", ".tsx", ".yml"]);

async function repositoryTextFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    if ([".git", "dist", "node_modules"].includes(entry.name)) return [];
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return repositoryTextFiles(path);
    return entry.isFile() && textExtensions.has(extname(entry.name)) ? [path] : [];
  }));
  return nested.flat().sort();
}

test("the repository contains only redistributable public identities", async () => {
  const root = repository.pathname;
  const files = await repositoryTextFiles(root);
  const forbiddenDigests = new Map([
    [6, new Set(["91ed2ef15eee7102873d33d852cae9a195eff25e758269de6457723b1d8dc29a"])],
    [8, new Set([
      "2fa58ad6299ceb2fe2861bd87e73f270953c148bc4b265962c0c582f93b8b18f",
      "9001c64629c4e504b9db9d50dff2560378194c2412d06f621dad5aabbe20cbcd",
    ])],
    [9, new Set(["ca6e46fe4bb60aaa3b834fc5d9addfdb20222e654e46b6f1e243cbef77b45634"])],
  ]);

  for (const file of files) {
    const source = (await Bun.file(file).text()).toLowerCase();
    for (const [length, digests] of forbiddenDigests) {
      for (let index = 0; index <= source.length - length; index += 1) {
        const digest = createHash("sha256")
          .update(source.slice(index, index + length))
          .digest("hex");
        if (digests.has(digest)) {
          throw new Error(`${relative(root, file)} contains a private identity`);
        }
      }
    }
  }
});

test("the package exposes compositions without a second primitive barrel", async () => {
  const packageJson = await Bun.file(new URL("../package.json", import.meta.url)).json();
  const reactBarrel = await Bun.file(new URL("./react/index.ts", import.meta.url)).text();
  const excludedPrimitiveModules = [
    "button",
    "card",
    "checkbox-field",
    "data-display",
    "list-box",
    "menu",
    "modal",
    "select-field",
    "tabs",
    "text-field",
    "toolbar",
    "tooltip",
  ];

  expect(packageJson.dependencies["@hraness/ui"]).toBeUndefined();
  expect(packageJson.version).toBe("0.5.0");
  expect(packageJson.peerDependencies["@hraness/ui"]).toBe(">=0.5.4 <0.6.0");
  expect(packageJson.peerDependenciesMeta["@hraness/ui"]).toEqual({ optional: true });
  expect(packageJson.devDependencies["@hraness/ui"]).toBe("github:hraness/ui#v0.5.4");
  expect(packageJson.devDependencies).toMatchObject({
    "@babel/core": "7.29.7",
    "@stylexjs/babel-plugin": "0.19.0",
    "@types/babel__core": "7.20.5",
    "@types/bun": "1.3.14",
    lightningcss: "1.33.0",
  });
  expect(packageJson.devDependencies["@stylexjs/unplugin"]).toBeUndefined();
  expect(packageJson.devDependencies.unplugin).toBeUndefined();
  expect(packageJson.scripts.prepublishOnly).toBe("bun run check:publication-ready");
  expect(packageJson.scripts["check:publication-ready"]).toBe(
    "bun run ./scripts/package-smoke.ts --publication",
  );
  expect(Object.keys(packageJson.exports)).not.toContain("./next-config");
  expect(packageJson.exports["./react/server"]).toEqual({
    types: "./src/react/server.ts",
    import: "./dist/react/server.js",
  });
  expect(packageJson.exports["./product-marketing.css"]).toBe(
    "./src/product-marketing.css",
  );
  expect(packageJson.exports["./compiler-foundation.css"]).toBe(
    "./src/compiler-foundation.css",
  );
  expect(packageJson.exports["./stylex-manifest.json"]).toBe(
    "./dist/stylex-manifest.json",
  );
  for (const path of [
    "src/compiler-components.css",
    "src/compiler-foundation.css",
    "src/compiler-tokens.css",
    "src/product-marketing-foundation.css",
    "src/react/app-shell.stylex.ts",
    "src/react/navigation-rail.stylex.ts",
    "src/react/product-marketing.stylex.ts",
    "src/react/route-state.stylex.ts",
    "src/react/theme.stylex.ts",
  ]) {
    expect(packageJson.files).toContain(path);
  }
  expect(reactBarrel).toContain('./product-marketing.js');
  expect(
    await Bun.file(new URL("./react/server.ts", import.meta.url)).text(),
  ).toContain('./product-marketing.js');
  for (const module of excludedPrimitiveModules) {
    expect(reactBarrel).not.toContain(`./${module}`);
  }
});

test("excluded source and font boundaries stay absent", async () => {
  const sourceFiles = await readdir(new URL("./react/", import.meta.url));
  const fontDirectories = (await readdir(new URL("./fonts/", import.meta.url))).sort();
  const restrictedEffect = "li" + "quid.tsx";
  const restrictedFontDirectory = "mono" + "lisa";

  expect(sourceFiles).not.toContain(restrictedEffect);
  expect(fontDirectories).toEqual(["geist-mono", "nebula-sans"]);
  expect(fontDirectories).not.toContain(restrictedFontDirectory);
});
