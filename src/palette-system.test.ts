import { expect, test } from "bun:test";
import { designPalettes, paletteColors } from "./palettes.js";

test("every palette has complete light/dark prepaint without overriding explicit saved modes", async () => {
  const css = await Bun.file(new URL("./palette-system.css", import.meta.url)).text();
  for (const palette of designPalettes) {
    expect(css).toContain(`:root[data-palette="${palette}"]:not([data-theme])`);
    for (const key of Object.keys(paletteColors[palette].light)) {
      const role = key as keyof typeof paletteColors[typeof palette]["light"];
      expect(css).toContain(`light-dark(${paletteColors[palette].light[role]}, ${paletteColors[palette].dark[role]})`);
    }
  }
  expect(css.match(/color-scheme: light dark/gu)).toHaveLength(designPalettes.length);
  expect(css).not.toContain("@font-face");
  expect(css).not.toContain("url(");
});
