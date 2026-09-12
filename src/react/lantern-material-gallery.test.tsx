import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";

import { LanternMaterialGallery } from "./lantern-material-gallery";

test("Lantern examples keep reading planes, real controls and explicit theme islands", () => {
  const { document } = parseHTML(renderToStaticMarkup(<LanternMaterialGallery />));
  const islands = [...document.querySelectorAll("[data-gallery-lantern]")];
  expect(islands.map((island) => island.getAttribute("data-theme"))).toEqual(["light", "dark"]);
  for (const island of islands) {
    expect(island.getAttribute("data-hraness-material")).toBe("lantern");
    expect(island.getAttribute("data-hraness-theme")).toBe("paper");
    expect(island.getAttribute("data-palette")).toBe("paper");
    expect(island.classList.contains("hraness-palette")).toBe(true);
    expect(island.querySelector(".hraness-material-pane .hraness-material-rows")).not.toBeNull();
    expect(island.querySelectorAll(".hraness-material-disclosure > summary")).toHaveLength(3);
    expect(island.querySelectorAll("input")).toHaveLength(1);
    expect(island.querySelector("button[data-gallery-lantern-filter]")?.getAttribute("aria-pressed")).toBe("false");
    expect(island.querySelector(".hraness-button.hraness-material-control")).toBeNull();
    expect(island.querySelector("[style]")).toBeNull();
  }
  expect(islands[0]?.className).not.toBe(islands[1]?.className);
  const labels = [...document.querySelectorAll("input[id]")].map((input) => input.id);
  expect(new Set(labels).size).toBe(labels.length);
  expect(document.querySelector('.hraness-button[aria-busy="true"] > button[data-pending="true"][aria-disabled="true"]')).not.toBeNull();
  expect(document.querySelector("button[disabled]")).not.toBeNull();
  expect(document.querySelector('input[aria-invalid="true"]')).not.toBeNull();
  expect(document.querySelector('[role="menu"]')).toBeNull();
});
