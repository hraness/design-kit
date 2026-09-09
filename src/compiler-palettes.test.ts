import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bundleAsync } from "lightningcss";

const entry = fileURLToPath(new URL("./compiler-palettes.css", import.meta.url));

test("the minimal compiler foundation bundles portable controls and palette roles without fonts or atomic recipes", async () => {
  const inputs = new Map<string, number>();
  const result = await bundleAsync({
    filename: entry,
    analyzeDependencies: true,
    resolver: {
      resolve(specifier, from) {
        return specifier.startsWith("@hraness/ui/")
          ? fileURLToPath(import.meta.resolve(specifier))
          : resolve(dirname(from), specifier);
      },
      read(path) {
        inputs.set(path, (inputs.get(path) ?? 0) + 1);
        return readFileSync(path, "utf8");
      },
    },
  });
  const css = Buffer.from(result.code).toString("utf8");
  expect(result.warnings).toEqual([]);
  expect(result.dependencies).toEqual([]);
  expect(css).not.toMatch(/@font-face|@import|url\(|Nebula Sans|components\.hraness-(?:ui|design-kit|stylex)\.priority/u);
  expect(css).toContain("--background: var(--hraness-palette-background)");
  expect(css).toContain("--ui-primary: var(--hraness-palette-primary)");
  expect(css).toContain("forced-colors: active");
  expect(css).toContain(".hraness-field__input::placeholder");
  expect([...inputs.values()].every((count) => count === 1)).toBe(true);
  expect([...inputs.keys()].filter((path) => path.endsWith("/palette-bridge.css"))).toHaveLength(1);
  expect([...inputs.keys()].filter((path) => path.endsWith("/compiler-foundation.css"))).toEqual([
    fileURLToPath(import.meta.resolve("@hraness/ui/compiler-foundation.css")),
  ]);
  expect([...inputs.keys()].some((path) => /(?:fonts|marketing|dist\/stylex)\./u.test(path))).toBe(false);
});

test("full compiler presentation reaches the manifest-bound palette foundation once", () => {
  const full = readFileSync(new URL("./compiler-foundation.css", import.meta.url), "utf8");
  expect(full.split('@import "./compiler-palettes.css";')).toHaveLength(2);
  expect(full).not.toContain('@import "./palette-bridge.css";');
  expect(full).not.toContain('@import "@hraness/ui/compiler-foundation.css";');
  expect(full).toContain('@import "./compiler-tokens.css";');
  expect(full).toContain('@import "./product-marketing-foundation.css";');
});
