import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "playwright-core";

/** Card wrapping follows its available reading width, including enlarged text. */
export async function inspectMarketingCardWrapping(page: Page, label: string, output: string): Promise<void> {
  const viewport = page.viewportSize();
  assert(viewport !== null, "Card verification needs a viewport");
  const originalFont = await page.evaluate(() => document.documentElement.style.fontSize);
  const evidence = [];
  try {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: viewport.height });
      for (const zoom of [100, 200]) {
        await page.evaluate(async (percent) => {
          document.documentElement.style.fontSize = `${percent}%`;
          await document.fonts.ready;
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        }, zoom);
        const cards = await page.locator('.hraness-marketing-card[data-layout="icon"]').evaluateAll((nodes) => nodes.map((card) => {
          const icon = card.querySelector<HTMLElement>(".hraness-marketing-card__icon");
          const copy = card.querySelector<HTMLElement>(".hraness-marketing-card__copy");
          if (icon === null || copy === null) throw new Error("Missing icon card slots");
          const box = (node: Element) => { const rect = node.getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height }; };
          const style = getComputedStyle(card);
          return { card: box(card), icon: box(icon), copy: box(copy),
            available: card.clientWidth - Number.parseFloat(style.paddingInlineStart) - Number.parseFloat(style.paddingInlineEnd),
            rootFont: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
            gap: Number.parseFloat(style.columnGap), direction: style.direction,
            text: [...copy.querySelectorAll<HTMLElement>("h3, p")].map((node) => ({ box: box(node), width: node.clientWidth, scrollWidth: node.scrollWidth, height: node.clientHeight, scrollHeight: node.scrollHeight })),
          };
        }));
        assert.equal(cards.length, 2, `${label}: both icon card variants are present`);
        for (const card of cards) {
          const context = `${label}/${width}/${zoom}: ${JSON.stringify(card)}`;
          const readableWidth = 10 * card.rootFont;
          assert(card.copy.width >= Math.min(readableWidth, card.available) - 1, `${context}: preserve reading width`);
          assert(Math.abs(card.icon.width - 3.5 * card.rootFont) < 1 && Math.abs(card.icon.height - card.icon.width) < 1, `${context}: preserve square mark proportions`);
          const sideBySide = card.available >= card.icon.width + card.gap + readableWidth - 0.5;
          if (sideBySide) {
            assert(Math.abs(card.icon.top + card.icon.bottom - card.copy.top - card.copy.bottom) < 2, `${context}: center the mark beside complete copy`);
            assert(card.direction === "rtl" ? card.icon.left > card.copy.right : card.icon.right < card.copy.left, `${context}: preserve inline-start icon placement`);
          } else {
            assert(card.copy.top >= card.icon.bottom + card.gap - 1, `${context}: wrap copy below before it gets squeezed`);
          }
          assert(card.icon.left >= card.card.left && card.icon.right <= card.card.right && card.copy.left >= card.card.left && card.copy.right <= card.card.right, `${context}: contain both slots`);
          for (const text of card.text) assert(text.scrollWidth <= text.width + 1 && text.scrollHeight <= text.height + 1 && text.box.bottom <= card.card.bottom, `${context}: show complete text`);
        }
        evidence.push({ width, zoom, cards });
        // Isolate the card row in its evidence image; the unrelated sticky
        // fixture chrome otherwise paints across the first enlarged card.
        if (width === 320 || width === 390) {
          const chrome = await page.evaluateHandle(() => [...document.querySelectorAll<HTMLElement | SVGElement>(".hraness-marketing-header, .hraness-marketing-header *, [data-hraness-sticky]")].map((node) => ({
            node,
            visibility: node.style.getPropertyValue("visibility"),
            priority: node.style.getPropertyPriority("visibility"),
          })));
          try {
            // CSSOM property writes preserve the fixture's strict style-src
            // policy; Playwright's screenshot style option injects a style tag.
            await chrome.evaluate((items) => { for (const { node } of items) node.style.setProperty("visibility", "hidden", "important"); });
            await page.locator('.hraness-marketing-card-row[aria-label="Icon comparisons"]').screenshot({ path: join(output, `${label}-${width}-${zoom}-card-wrap.png`) });
          } finally {
            await chrome.evaluate((items) => { for (const { node, visibility, priority } of items) {
              if (visibility) node.style.setProperty("visibility", visibility, priority);
              else node.style.removeProperty("visibility");
            } });
            await chrome.dispose();
          }
        }
      }
    }
    await writeFile(join(output, `${label}-card-wrap.json`), JSON.stringify(evidence, null, 2) + "\n");
  } finally {
    await page.evaluate((font) => { document.documentElement.style.fontSize = font; }, originalFont);
    await page.setViewportSize(viewport);
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  }
}
