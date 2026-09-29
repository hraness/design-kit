import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

test("compatibility stylesheet is the exact canonical action fallback", async () => {
  const source = await readFile(new URL("./product-marketing.css", import.meta.url), "utf8");
  const compatibility = await readFile(new URL("./marketing-forced-colors.css", import.meta.url), "utf8");
  const marker = source.indexOf("/* Marketing action forced-colors compatibility:");
  expect(marker).toBeGreaterThanOrEqual(0);
  expect(compatibility).toBe(source.slice(marker));
  const manifest = await Bun.file(new URL("../package.json", import.meta.url)).json();
  expect(manifest.exports["./marketing-forced-colors.css"]).toBe("./src/marketing-forced-colors.css");
});
