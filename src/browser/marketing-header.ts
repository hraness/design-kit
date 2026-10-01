export interface MarketingHeaderOptions {
  readonly brandHref?: string;
  readonly brandLabel?: string;
  readonly brandMark?: string;
  /** Fixed-theme and authentication pages may explicitly omit appearance. */
  readonly appearance?: "required" | "omitted";
  /** Turn off geometry only when inspecting an unrendered DOM in unit tests. */
  readonly measure?: boolean;
  /** Require hydrated sticky clearance to match the live header height. */
  readonly stickyOffset?: boolean;
}

export interface MarketingHeaderInspection {
  readonly headerCount: number;
  readonly appearanceCount: number;
  readonly brandHref: string | null;
  readonly brandLabel: string | null;
  readonly brandMark: string | null;
  readonly links: readonly Readonly<{ href: string; label: string }>[];
  readonly problems: readonly string[];
}

/**
 * Inspect a complete public page, including article, documentation, and status
 * routes. This read-only function is self-contained so browser runners can use
 * `page.evaluate(inspectMarketingHeader, options)` without loading a test script.
 */
export function inspectMarketingHeader(
  options: MarketingHeaderOptions = {},
  document: Document = globalThis.document,
): MarketingHeaderInspection {
  const problems: string[] = [];
  const headers = document.querySelectorAll('header[data-hraness-marketing="header"], header.hraness-marketing-header, header.hraness-marketing-header-surface');
  const appearances = document.querySelectorAll("[data-hraness-appearance-menu]");
  const mains = document.querySelectorAll("main");
  const header = headers[0];
  if (headers.length !== 1) problems.push(`Expected one product header; found ${headers.length}.`);
  if (mains.length !== 1) problems.push(`Expected one main landmark; found ${mains.length}.`);
  const appearanceCount = options.appearance === "omitted" ? 0 : 1;
  if (appearances.length !== appearanceCount) problems.push(`Expected ${appearanceCount} appearance controls; found ${appearances.length}.`);

  const brand = header?.querySelector<HTMLAnchorElement>("a.hraness-marketing-header__brand");
  const mark = brand?.querySelector(".hraness-foil-mark");
  const image = mark?.querySelector("img");
  const brandHref = brand?.getAttribute("href") ?? null;
  const brandLabel = (brand?.getAttribute("aria-label") ?? brand?.textContent)?.trim() || null;
  const brandMark = image?.getAttribute("src") ?? null;
  const nav = header?.querySelector("nav.hraness-marketing-header__nav");
  const links = [...(nav?.querySelectorAll("a[href]") ?? [])].map(link => ({
    href: link.getAttribute("href") ?? "",
    label: (link.getAttribute("aria-label") ?? link.textContent)?.trim() ?? "",
  }));
  if (header !== undefined) {
    const main = mains[0];
    if (main !== undefined && (main.contains(header) || header.contains(main) || !(header.compareDocumentPosition(main) & 4))) {
      problems.push("The product header must precede and sit outside the main landmark.");
    }
    if (brandHref !== (options.brandHref ?? "/")) problems.push("The product home link is missing or points to a different page.");
    if (brandLabel === null || (options.brandLabel !== undefined && brandLabel !== options.brandLabel)) problems.push("The product home link has a missing or inconsistent name.");
    if (brand?.hasAttribute("data-foil") !== true || mark === null || mark === undefined || image === null || image === undefined || !mark.querySelector(".hraness-foil-mark__paint") || !brandMark) {
      problems.push("The product home link is missing its foil mark and artwork fallback.");
    } else if (options.brandMark !== undefined && brandMark !== options.brandMark) {
      problems.push("The product header uses different mark artwork.");
    }
    if (!nav || !(nav.getAttribute("aria-label")?.trim() || nav.getAttribute("aria-labelledby")?.trim()) || links.length === 0 || links.some(link => !link.label)) {
      problems.push("The product header needs a named navigation with readable links.");
    }
    const appearance = appearances[0];
    const actions = header.querySelector(".hraness-marketing-header__actions");
    if (appearanceCount === 1 && appearance !== undefined) {
      if (!actions?.contains(appearance) || !actions.lastElementChild?.contains(appearance)) {
        problems.push("Appearance must be the final product-header action.");
      }
      if (!appearance.querySelector(":scope > summary, :scope > button, button.hraness-design-theme-toggle__trigger")) problems.push("Appearance is missing its trigger.");
    }

    if (options.measure !== false) {
      const view = document.defaultView;
      if (view === null) problems.push("Rendered header inspection requires a browser window.");
      else {
        const trigger = appearance?.querySelector(":scope > summary, :scope > button, button.hraness-design-theme-toggle__trigger");
        for (const [name, element] of [["header", header], ["brand", brand], ["mark", mark], ["navigation", nav], ["appearance", appearanceCount === 1 ? appearance : null], ["appearance trigger", appearanceCount === 1 ? trigger : null]] as const) {
          if (!element) continue;
          const box = element.getBoundingClientRect();
          let hidden = false;
          for (let ancestor: Element | null = element; ancestor !== null; ancestor = ancestor.parentElement) {
            const style = view.getComputedStyle(ancestor);
            if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || Number(style.opacity) === 0) hidden = true;
          }
          if (box.width <= 0 || box.height <= 0 || hidden) problems.push(`The product ${name} is not visible.`);
        }
        const box = header.getBoundingClientRect();
        if (box.left < -1 || box.right > view.innerWidth + 1) problems.push("The product header extends outside the viewport.");
        const inner = header.querySelector(".hraness-marketing-header__inner");
        if (!inner || !["grid", "flex"].includes(view.getComputedStyle(inner).display)) problems.push("The shared product-header layout styles are missing.");
        if (options.stickyOffset === true && view.getComputedStyle(header).position === "sticky") {
          for (const target of [document.documentElement, mains[0]]) {
            if (!target) continue;
            const offset = Number.parseFloat(view.getComputedStyle(target).getPropertyValue("--hraness-sticky-offset"));
            if (!Number.isFinite(offset) || Math.abs(offset - box.height) > 1) problems.push("Sticky clearance does not match the measured product header.");
          }
        }
        if (appearanceCount === 1 && trigger) {
          const triggerBox = trigger.getBoundingClientRect();
          if (triggerBox.width < 43.5 || triggerBox.height < 43.5) problems.push("The appearance trigger is smaller than 44px.");
          const actionLinks = actions?.querySelectorAll("a[href]") ?? [];
          if ([...actionLinks].some(link => link.getBoundingClientRect().right > triggerBox.right + 1)) problems.push("Appearance is not the rightmost header action.");
        }
      }
    }
  }
  return { headerCount: headers.length, appearanceCount: appearances.length, brandHref, brandLabel, brandMark, links, problems };
}
