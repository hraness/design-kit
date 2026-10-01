import { describe, expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import fc from "fast-check";
import { inspectMarketingHeader } from "./marketing-header";

const header = `<header data-hraness-marketing="header"><div class="hraness-marketing-header__inner">
  <a class="hraness-marketing-header__brand" data-foil href="/" aria-label="Relay home"><span class="hraness-foil-mark"><img src="/relay.svg" alt=""><span class="hraness-foil-mark__paint"></span></span>Relay</a>
  <nav class="hraness-marketing-header__nav" aria-label="Site"><a href="/docs">Docs</a></nav>
  <div class="hraness-marketing-header__actions"><a href="/#install">Install</a><details data-hraness-appearance-menu><summary aria-label="Appearance"></summary><div><input type="radio"></div></details></div>
</div></header>`;
const main = '<main><article><header><h1>A decision that lasts</h1></header></article></main>';
const options = { brandLabel: "Relay home", brandMark: "/relay.svg", measure: false } as const;
function inspect(html: string) {
  return inspectMarketingHeader(options, parseHTML(`<html><body>${html}</body></html>`).document as unknown as Document);
}

describe("complete public-page header inspection", () => {
  test("accepts an article header inside the shared product shell", () => {
    expect(inspect(header + main)).toMatchObject({ headerCount: 1, appearanceCount: 1, problems: [], links: [{ href: "/docs", label: "Docs" }] });
  });
  test("accepts a button appearance trigger as well as a native summary", () => {
    expect(inspect(header.replace('<summary aria-label="Appearance"></summary>', '<button aria-label="Appearance"></button>') + main).problems).toEqual([]);
  });
  test("accepts the React Aria trigger inside an icon-button wrapper", () => {
    expect(inspect(header.replace('<summary aria-label="Appearance"></summary>', '<span><button class="hraness-design-theme-toggle__trigger" aria-label="Appearance"></button></span>') + main).problems).toEqual([]);
  });
  test("catches the bare article navigation that previously passed page checks", () => {
    expect(inspect('<main><nav aria-label="Site"><a href="/">Relay home</a><a href="/docs">Docs</a></nav><h1>Article</h1></main>').problems).toContain("Expected one product header; found 0.");
  });
  test.each([
    [main + header, "The product header must precede and sit outside the main landmark."],
    [`<main>${header}<h1>Article</h1></main>`, "The product header must precede and sit outside the main landmark."],
    [header.replace('src="/relay.svg"', 'src="/other.svg"') + main, "The product header uses different mark artwork."],
    [header.replace('aria-label="Relay home"', 'aria-label="Other home"') + main, "The product home link has a missing or inconsistent name."],
    [header.replace('href="/"', 'href="/blog"') + main, "The product home link is missing or points to a different page."],
    [header.replace('aria-label="Site"', '') + main, "The product header needs a named navigation with readable links."],
    [header.replace('</details>', '</details><a href="/more">More</a>') + main, "Appearance must be the final product-header action."],
    [header + main + '<details data-hraness-appearance-menu><summary>Appearance</summary></details>', "Expected 1 appearance controls; found 2."],
  ])("rejects an inconsistent shell %#", (html, problem) => {
    expect(inspect(html).problems).toContain(problem);
  });
  test("the header count cannot pass vacuously or admit duplicates", () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 8 }), count => {
      const result = inspect(header.repeat(count) + main);
      expect(result.headerCount).toBe(count);
      expect(result.problems.some(problem => problem.startsWith("Expected one product header"))).toBe(count !== 1);
    }));
  });
  test("a fixed-theme page explicitly omits appearance", () => {
    const html = header.replace(/<details[\s\S]*?<\/details>/u, "") + main;
    const document = parseHTML(`<html><body>${html}</body></html>`).document as unknown as Document;
    expect(inspectMarketingHeader({ ...options, appearance: "omitted" }, document).problems).toEqual([]);
    expect(inspect(html).problems).toContain("Expected 1 appearance controls; found 0.");
  });
});
