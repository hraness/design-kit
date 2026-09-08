import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";
import { DesignPaletteProvider, DesignPaletteMenuButton } from "./design-palette";
import { useDesignPortalClassName, useDesignPortalTheme } from "./design-theme-context";
import { ThemeMenuButton } from "./theme";

function PortalProbe() {
  return <span className={useDesignPortalClassName()} data-theme={useDesignPortalTheme()}>Overlay</span>;
}

test("palette SSR renders one native appearance control and no inline CSP dependencies", () => {
  const html = renderToStaticMarkup(<DesignPaletteProvider><ThemeMenuButton /><PortalProbe /></DesignPaletteProvider>);
  const document = parseHTML(html).document;
  expect(document.querySelectorAll("script, style, [style]")).toHaveLength(0);
  expect(document.querySelectorAll("details")).toHaveLength(1);
  expect(document.querySelectorAll("summary")).toHaveLength(1);
  expect(document.querySelector("summary")?.getAttribute("aria-label")).toBe("Appearance: Catppuccin, Dark");
  expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(7);
  expect(document.querySelectorAll("fieldset")).toHaveLength(2);
  expect(Array.from(document.querySelectorAll("legend"), (legend) => legend.textContent)).toEqual(["Theme", "Appearance"]);
  expect(document.querySelectorAll('input[checked]')).toHaveLength(2);
  expect(document.querySelector('[data-theme="dark"]')?.className).toContain("hraness-palette");
});

test("forced preview SSR projects its palette and mode through portal context", () => {
  const html = renderToStaticMarkup(<DesignPaletteProvider forcedPreference={{ palette: "rose-pine", mode: "light" }}><DesignPaletteMenuButton /><PortalProbe /></DesignPaletteProvider>);
  expect(html).toContain('aria-label="Appearance: Rosé Pine, Light"');
  expect(html).toContain('data-theme="light"');
  expect(html).toContain('aria-disabled="true"');
  expect(html).not.toContain("<script");
});
