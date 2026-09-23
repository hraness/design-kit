import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

/** Follow actual emitted modules as an RSC consumer would, stopping only at an
 * explicit client directive. A source directive lost by splitting must fail. */
export async function assertServerBoundary(packageRoot: string): Promise<void> {
  const visited = new Set<string>();
  let foundBackdrop = false;
  const scan = new Bun.Transpiler({ loader: "js" });
  async function visit(path: string): Promise<void> {
    if (visited.has(path)) return;
    visited.add(path);
    const source = await readFile(path, "utf8");
    if (source.startsWith('"use client";\n')) {
      if (path === join(packageRoot, "dist/react/hero-backdrop.js")) foundBackdrop = true;
      return;
    }
    for (const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']react["']/gu)) {
      assert.doesNotMatch(match[1] ?? "", /\b(?:useEffect|useLayoutEffect|useState|useReducer|useRef|useContext|createContext)\b/u, `React client hook escaped its boundary: ${path}`);
    }
    for (const dependency of scan.scanImports(source)) {
      if (dependency.path.startsWith(".")) await visit(resolve(dirname(path), dependency.path));
      else if (dependency.path === "@hraness/design-kit/react/hero-backdrop") await visit(join(packageRoot, "dist/react/hero-backdrop.js"));
    }
  }
  await visit(join(packageRoot, "dist/react/server.js"));
  assert.equal(foundBackdrop, true, "Server hero must cross the emitted backdrop client boundary");
}
