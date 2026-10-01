import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "playwright-core";

/** A graphic may scale inside a filled stage without inheriting its height or fitted type. */
export async function inspectNestedFit(page: Page, label: string, screenshots?: string, selector = "#fill-mixed") {
  const viewport = page.viewportSize();
  assert(viewport !== null, "The nested fit fixture needs a viewport");
  const originalFont = await page.evaluate(() => document.documentElement.style.fontSize);
  const states = [];
  const observe = (step: string) => page.evaluate(async ({ expected, selector }) => {
    let previous = "";
    let equalFrames = 0;
    const deadline = performance.now() + 3000;
    while (performance.now() < deadline) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      // Resolve the active panel after each paint; React may replace its contents.
      const root = document.querySelector(selector);
      const stage = root?.querySelector(".hkm-step-stage, .hkm-mode-stage");
      const tab = root?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      const panel = root?.querySelector('.hkm-step-panel[aria-hidden="false"], .hkm-mode-surface[aria-hidden="false"]');
      if (stage === undefined || stage === null || panel === null || panel === undefined || tab === null || tab === undefined || !tab.id.endsWith(`-tab-${expected.toLowerCase()}`) || !stage.hasAttribute("data-hkm-fitted")) continue;
      const frame = panel.querySelector<HTMLElement>(".hkm-window, .hkm-device");
      if (frame === null) continue;
      const nested = panel.querySelector<HTMLElement>(".hkm-fit .hkm-fit");
      const inner = nested?.querySelector<HTMLElement>(":scope > .hkm-fit-inner");
      const stageBox = stage.getBoundingClientRect();
      const box = frame.getBoundingClientRect();
      const snapshot = {
        step: expected, stageHeight: stageBox.height, stageWidth: stageBox.width,
        frameHeight: box.height, frameWidth: box.width,
        contained: box.left >= stageBox.left - 1 && box.right <= stageBox.right + 1 && box.top >= stageBox.top - 1 && box.bottom <= stageBox.bottom + 1,
        viewport: document.documentElement.clientWidth, documentWidth: document.documentElement.scrollWidth,
        rootFont: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
        graphic: nested === null || inner === null || inner === undefined ? null : {
          available: nested.clientWidth, layoutWidth: inner.offsetWidth, layoutHeight: inner.offsetHeight,
          visibleHeight: nested.getBoundingClientRect().height, scale: inner.getBoundingClientRect().width / inner.offsetWidth,
        },
        terminals: [...panel.querySelectorAll<HTMLElement>('[data-hkm-density="presentation"]')].map((body) => ({
          font: Number.parseFloat(getComputedStyle(body).fontSize), fittedSize: body.style.getPropertyValue("--hkm-terminal-presentation-size"),
          height: body.clientHeight, scrollHeight: body.scrollHeight, width: body.clientWidth, scrollWidth: body.scrollWidth,
        })),
        probes: root?.querySelectorAll("[data-hkm-measuring]").length ?? -1,
      };
      const serialized = JSON.stringify(snapshot);
      equalFrames = serialized === previous ? equalFrames + 1 : 0;
      previous = serialized;
      // The parent stage and the nested React fit have separate resize observers.
      // A stable parent snapshot can precede the child's scheduled state update.
      if (snapshot.graphic !== null && Math.abs(snapshot.graphic.scale - Math.min(1, snapshot.graphic.available / 640)) >= 0.01) continue;
      if (equalFrames >= 2) return snapshot;
    }
    throw new Error(`Mixed ${expected} frame did not settle: ${previous}`);
  }, { expected: step, selector });
  const select = async (step: string) => {
    await page.locator(selector).getByRole("tab", { name: step, exact: true }).click();
    return observe(step);
  };
  try {
    await page.waitForSelector(`${selector} [data-hkm-fitted]`);
    for (const zoom of [100, 200]) {
      await page.evaluate((percent) => { document.documentElement.style.fontSize = `${percent}%`; }, zoom);
      const group = [];
      for (const step of ["Phone", "Graphic", "Terminal"]) {
        const result = await select(step);
        assert(result.frameHeight > 80 && result.frameWidth > 80, `${label}/${zoom}/${step}: visible frame must not collapse: ${JSON.stringify(result)}`);
        assert(result.contained, `${label}/${zoom}/${step}: the complete frame fits its stage`);
        assert(result.documentWidth <= result.viewport, `${label}/${zoom}/${step}: no page overflow`);
        assert.equal(result.probes, 0, `${label}/${zoom}/${step}: measurement clones are removed`);
        if (step === "Graphic") {
          const graphic = result.graphic;
          assert(graphic !== null, `${label}: explicit graphic fit exists`);
          assert(Math.abs(graphic.layoutWidth - Math.max(640, graphic.available)) <= 1, `${label}: graphic retains its declared minimum width`);
          assert(Math.abs(graphic.scale - Math.min(1, graphic.available / 640)) < 0.01, `${label}: graphic scales only when needed`);
          assert(Math.abs(graphic.visibleHeight - graphic.layoutHeight * graphic.scale) < 1, `${label}: graphic reserves its scaled natural height`);
          assert(result.terminals.every((terminal) => terminal.fittedSize === ""), `${label}: type drawn inside the graphic is not independently enlarged`);
        } else if (step === "Terminal") {
          assert(result.terminals.every((terminal) => terminal.font >= result.rootFont && terminal.scrollHeight <= terminal.height + 1 && terminal.scrollWidth <= terminal.width + 1), `${label}/${zoom}: complete presentation text stays readable`);
          assert(Math.abs(result.frameHeight - (result.stageHeight - (selector === "#fill-mixed" ? 2 : 0))) < 1, `${label}/${zoom}: the presentation terminal fills the reserved stage`);
        }
        group.push(result);
        if (screenshots !== undefined) await page.locator(selector).screenshot({ path: join(screenshots, `nested-${selector.slice(1)}-${label.replaceAll("/", "-")}-${zoom}-${step}.png`) });
      }
      const stageHeights = group.map((result) => result.stageHeight);
      assert(Math.max(...stageHeights) - Math.min(...stageHeights) < 1, `${label}/${zoom}: mixed steps preserve one maximum`);
      const naturalFrames = group.filter((result) => result.step !== "Terminal").map((result) => result.frameHeight);
      assert(Math.max(...stageHeights) <= Math.max(...naturalFrames) + 32, `${label}/${zoom}: the stage does not reserve an unscaled graphic height`);
      states.push({ zoom, group });
    }
    await page.evaluate((font) => { document.documentElement.style.fontSize = font; }, originalFont);
    await select("Graphic");
    await page.setViewportSize({ ...viewport, width: viewport.width + 80 });
    const resized = await observe("Graphic");
    assert(resized.frameHeight > 80 && resized.contained, `${label}: resizing preserves the complete graphic`);
    assert(resized.graphic !== null && Math.abs(resized.graphic.scale - Math.min(1, resized.graphic.available / 640)) < 0.01, `${label}: resizing updates the graphic scale: ${JSON.stringify(resized)}`);
    return { label: `nested-${selector.slice(1)}-${label}`, states, resized };
  } catch (error) {
    if (screenshots !== undefined) await writeFile(join(screenshots, `nested-${selector.slice(1)}-failure.json`), JSON.stringify({ label, states, error: String(error) }, null, 2) + "\n");
    throw error;
  } finally {
    await page.evaluate((font) => { document.documentElement.style.fontSize = font; }, originalFont);
    await page.setViewportSize(viewport);
    await select("Phone");
  }
}
