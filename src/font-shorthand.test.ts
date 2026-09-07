import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

// CSS Fonts 4 lists font-language-override as reset-only, but font-palette
// cascades independently of the font shorthand, including `font: inherit`.
for (const file of ["theme", "jelly-surface", "charts"]) {
  test(`${file} preserves the exact font inheritance boundary`, async () => {
    const source = await readFile(new URL(`./react/${file}.stylex.ts`, import.meta.url), "utf8");
    expect(source).toContain('fontLanguageOverride: "inherit"');
    expect(source).not.toContain("fontPalette:");
  });
}
