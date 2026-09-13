/** Original deterministic Hraness textures. Grain stays behind content. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export function marketingTextures(): Readonly<Record<"grain.svg" | "cells.svg", string>> {
let seed = 4652026;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const stipple = ["", ""];
for (let y = 0; y < 128; y++) {
  for (let x = 0; x < 128; x++) {
    const value = random();
    if (value < .65) stipple[value < .325 ? 0 : 1] += `M${x} ${y}h1v1h-1z`;
  }
}
const grain = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g opacity=".03"><path fill="#000" d="${stipple[0]}"/><path fill="#fff" d="${stipple[1]}"/></g></svg>\n`;
const gradients: string[] = [];
const faces: string[] = [];
// Eight by eight original faces form a seamless repeating field. Each pane
// has its own light direction and transmission; no visible grid is drawn.
for (let row = 0; row < 8; row++) {
  for (let column = 0; column < 8; column++) {
    const id = `p${row * 8 + column}`;
    const angle = Math.round(20 + random() * 65);
    const light = (0.025 + random() * 0.045).toFixed(3);
    const shade = (0.02 + random() * 0.055).toFixed(3);
    gradients.push(`<linearGradient id="${id}" x2="${angle}%" y2="100%"><stop stop-color="#fff" stop-opacity="${light}"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${shade}"/></linearGradient>`);
    faces.push(`<path d="M${column * 96} ${row * 96}h96v96h-96z" fill="url(#${id})"/>`);
  }
}
const cells = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 768"><defs>${gradients.join("")}</defs>${faces.join("")}</svg>\n`;

return { "grain.svg": grain, "cells.svg": cells };
}

if (import.meta.main) {
  const writing = process.argv.slice(2).join(" ") === "--write";
  for (const [name, contents] of Object.entries(marketingTextures())) {
    const path = resolve(import.meta.dir, "../src/marketing-assets", name);
    if (writing) await writeFile(path, contents);
    else assert.equal(await readFile(path, "utf8"), contents, `${name} differs from its checked source.`);
  }
}
