import { expect, test } from "bun:test";

const [plainSiteCss, publicationCss, stylesCss] = await Promise.all([
  Bun.file(new URL("./plain-site.css", import.meta.url)).text(),
  Bun.file(new URL("./plain-publication.css", import.meta.url)).text(),
  Bun.file(new URL("./styles.css", import.meta.url)).text(),
]);
const packageManifest = await Bun.file(
  new URL("../package.json", import.meta.url),
).json() as { exports?: Record<string, string> };

test("plain-site exposes one compact, product-neutral site shell", () => {
  for (const selector of [
    ".plain-header",
    ".plain-header__inner",
    ".plain-wordmark",
    ".plain-nav",
    ".plain-footer",
    ".plain-footer__links",
  ]) {
    expect(plainSiteCss).toContain(selector);
  }

  expect(plainSiteCss).toContain("--plain-shell-measure: 34rem;");
  expect(plainSiteCss).toMatch(
    /\.plain-page\s*\{[^}]*inline-size:\s*100%;[^}]*max-width:\s*var\(--plain-shell-measure\);/su,
  );
  expect(plainSiteCss).toContain("max-width: var(--plain-shell-measure);");
  expect(plainSiteCss).toMatch(
    /\.plain-footer\s*\{[^}]*flex-wrap:\s*wrap;/su,
  );
  expect(plainSiteCss).toMatch(
    /\.plain-header__inner\s*\{[^}]*align-items:\s*center;[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap;/su,
  );
  expect(plainSiteCss).toMatch(
    /\.plain-wordmark\s*\{[^}]*flex:\s*1 1 auto;[^}]*min-inline-size:\s*var\(--plain-link-target-min\);[^}]*overflow-wrap:\s*anywhere;/su,
  );
  expect(plainSiteCss).toMatch(
    /\.plain-nav\s*\{[^}]*justify-content:\s*flex-end;[^}]*margin-inline-start:\s*auto;[^}]*max-inline-size:\s*100%;[^}]*min-inline-size:\s*0;/su,
  );
  expect(plainSiteCss).toMatch(
    /@media \(pointer: coarse\)\s*\{[\s\S]*?\.plain-site\s*\{[^}]*--plain-link-target-min:\s*var\(--interactive-target-min, 48px\);/u,
  );
  expect(plainSiteCss).toMatch(
    /:root\[data-verification-pointer="coarse"\] \.plain-site\s*\{[^}]*--plain-link-target-min:\s*var\(--interactive-target-min, 48px\);/su,
  );
  expect(plainSiteCss).toMatch(
    /\.plain-nav a,[\s\S]*?\.plain-footer__links a\s*\{[^}]*min-block-size:\s*var\(--plain-link-target-min\);[^}]*min-inline-size:\s*var\(--plain-link-target-min\);/u,
  );
  expect(plainSiteCss).toMatch(
    /\.plain-footer :where\(a\)\s*\{[^}]*color:\s*inherit;[^}]*display:\s*inline-flex;[^}]*min-block-size:\s*var\(--plain-link-target-min\);[^}]*min-inline-size:\s*var\(--plain-link-target-min\);/u,
  );
  expect(plainSiteCss).not.toContain("jelly");
  expect(plainSiteCss).toMatch(
    /\.plain-site main:has\(> \.design-gallery\[data-design-gallery-nested="true"\]\)\s*\{[^}]*padding-inline:\s*max\(var\(--plain-shell-gutter\), var\(--space-6\)\);/su,
  );
  expect(plainSiteCss).toContain("env(safe-area-inset-right)");
  expect(plainSiteCss).toContain("env(safe-area-inset-left)");
  expect(plainSiteCss).toContain("@media (max-width: 42rem)");
  expect(plainSiteCss).toContain("@media (forced-colors: active)");
});

test("plain chrome preserves resolved themes, safe areas, and semantic link roles", () => {
  expect(plainSiteCss).not.toMatch(
    /\.plain-site\s*\{[^}]*\bcolor-scheme\s*:/su,
  );
  expect(plainSiteCss).toMatch(
    /\.plain-header__inner\s*\{[^}]*--plain-header-block-padding:\s*1\.15rem;[^}]*padding-top:\s*max\(\s*var\(--plain-header-block-padding\),\s*env\(safe-area-inset-top\)\s*\);[^}]*padding-bottom:\s*var\(--plain-header-block-padding\);/su,
  );
  expect(plainSiteCss).toMatch(
    /@media \(max-width: 42rem\)\s*\{[\s\S]*?\.plain-header__inner\s*\{[^}]*--plain-header-block-padding:\s*0\.65rem;[^}]*gap:\s*0\.35rem 0\.75rem;[^}]*\}/u,
  );
  expect(plainSiteCss).not.toMatch(
    /@media \(max-width: 42rem\)\s*\{[\s\S]*?\.plain-header__inner\s*\{[^}]*flex-direction:\s*column;/u,
  );
  expect(plainSiteCss).toMatch(
    /@media \(max-width: 42rem\)\s*\{[\s\S]*?\.plain-wordmark\s*\{[^}]*flex-basis:\s*min\(11rem, 100%\);/u,
  );

  expect(plainSiteCss).toContain(
    ":where(.plain-header a, .plain-page a, .plain-footer a)",
  );
  expect(plainSiteCss).toMatch(
    /:where\(\.plain-header a, \.plain-page a, \.plain-footer a\)\s*\{[^}]*text-decoration:\s*none;/su,
  );
  expect(plainSiteCss).toMatch(
    /\.plain-page a:is\(:hover, :focus-visible\)[\s\S]*?\{[^}]*text-decoration:\s*underline;/u,
  );
  expect(plainSiteCss).toContain(
    ".plain-site :where(\n  .plain-header a:focus-visible,",
  );
  expect(plainSiteCss).toMatch(
    /\.plain-wordmark\s*\{[^}]*color:\s*var\(--plain-foreground\);/su,
  );
  expect(plainSiteCss).toMatch(
    /\.plain-nav a,[\s\S]*?\.plain-footer__links a\s*\{[^}]*color:\s*var\(--plain-muted\);/u,
  );
  expect(publicationCss).toContain(
    ":where(.plain-site.plain-publication a:not(.hraness-design-skip-link))",
  );
  expect(publicationCss).toMatch(
    /:where\(\.plain-site\.plain-publication a:not\(\.hraness-design-skip-link\)\)\s*\{[^}]*text-decoration:\s*none;/su,
  );
  expect(publicationCss).toMatch(
    /a:not\(\.hraness-design-skip-link\):is\(:hover, :focus-visible\)[\s\S]*?\{[^}]*text-decoration:\s*underline;/u,
  );
  expect(publicationCss).not.toMatch(
    /\.plain-publication__(?:primary-link|entry h3 a|related-grid > a)\s*\{[^}]*text-decoration:\s*underline;/su,
  );
  expect(publicationCss).not.toMatch(
    /^\.plain-site\.plain-publication a:not\(\.hraness-design-skip-link\)/mu,
  );
});

test("plain-publication adds a complete long-form grammar without product identity", () => {
  for (const selector of [
    ".plain-site.plain-publication",
    ".plain-publication__shell",
    ".plain-publication__index-content",
    ".plain-publication__entry",
    ".plain-publication__article-header",
    ".plain-publication__article-layout",
    ".plain-publication__article-body",
    ".plain-publication__toc",
    ".plain-publication__callout",
    ".plain-publication__table-scroll",
    ".plain-publication__sources",
    ".plain-publication__related-grid",
  ]) {
    expect(publicationCss).toContain(selector);
  }

  expect(publicationCss).toContain("--plain-shell-measure: 43rem;");
  expect(publicationCss).toContain(
    ":where(.plain-site.plain-publication a:not(.hraness-design-skip-link))",
  );
  expect(publicationCss).not.toMatch(
    /\.plain-site\.plain-publication a\s*\{/u,
  );
  expect(publicationCss).toMatch(
    /\.plain-site\.plain-publication\s*\{[^}]*min-height:\s*100vh;[^}]*min-height:\s*100svh;[^}]*min-height:\s*100dvh;/su,
  );
  expect(publicationCss).toContain("line-height: var(--hraness-type-reading-leading, 1.7);");
  expect(publicationCss).toMatch(
    /\.plain-site\.plain-publication \.plain-publication__toc\s*\{[^}]*position:\s*static;/su,
  );
  expect(publicationCss).toMatch(
    /:root\[data-verification-pointer="coarse"\][\s\S]*?\.plain-publication__entry h3 a,[\s\S]*?\.plain-publication__primary-link,[\s\S]*?\.plain-publication__related-grid > a[\s\S]*?\{[^}]*display:\s*flex;[^}]*min-block-size:\s*var\(--interactive-target-min, 48px\);[^}]*min-inline-size:\s*var\(--interactive-target-min, 48px\);/u,
  );
  expect(publicationCss).toContain("@media (forced-colors: active)");
  expect(publicationCss).not.toMatch(/(?:linear|radial|conic)-gradient/iu);
});

test("the complete browser stylesheet includes the publication extension", () => {
  expect(packageManifest.exports?.["./plain-publication.css"]).toBe(
    "./src/plain-publication.css",
  );
  expect(stylesCss).toContain('@import "./plain-site.css";');
  expect(stylesCss).toContain('@import "./plain-publication.css";');
  expect(stylesCss.indexOf("plain-site.css")).toBeLessThan(
    stylesCss.indexOf("plain-publication.css"),
  );
});


test("reading surfaces preserve palette roles and long code without shrinking captions", () => {
  expect(plainSiteCss).toContain("[data-palette][data-palette] .plain-site");
  expect(plainSiteCss).toContain(".plain-site[data-palette][data-palette]");
  expect(plainSiteCss).toContain("--plain-background: var(--background, Canvas)");
  expect(plainSiteCss).toContain("--plain-link: var(--primary, LinkText)");
  expect(publicationCss).toContain("max-inline-size: var(--hraness-type-reading-measure, 70ch)");
  expect(publicationCss).toContain("scroll-margin-block-start: calc(var(--hraness-sticky-offset, 0px) + 1.5rem)");
  expect(publicationCss).toMatch(/article-body pre\s*\{[^}]*overflow-x: auto;[^}]*white-space: pre;[^}]*overflow-wrap: normal;/su);
  expect(publicationCss).not.toMatch(/font-size: 0\.(?:8|82|85)rem;/u);
});

test("the embedded article layer keeps a 68ch measure, host roles, and forced colors without motion", () => {
  const start = publicationCss.indexOf("/* Article layer");
  expect(start).toBeGreaterThan(0);
  const articleCss = publicationCss.slice(start);

  expect(articleCss).toContain("--plain-article-measure: 68ch;");
  expect(articleCss).toMatch(
    /\.plain-publication--embedded\s*\{[^}]*--plain-foreground:\s*var\(--foreground, CanvasText\);[^}]*--plain-link:\s*var\(--primary, LinkText\);[^}]*display:\s*block;[^}]*min-height:\s*0;[^}]*font-family:\s*inherit;/su,
  );
  expect(articleCss).toMatch(
    /\.plain-site \.plain-site\.plain-publication\.plain-publication--embedded\s*\{[^}]*--plain-foreground:\s*inherit;/su,
  );
  expect(articleCss).toMatch(
    /\.plain-publication--embedded \.plain-publication__article-body\s*\{[^}]*max-inline-size:\s*var\(--plain-article-measure\);/su,
  );
  for (const hook of [
    ".plain-publication__byline",
    ".plain-publication__provenance",
    ".plain-publication__article-footer",
    ".plain-publication__entry-title",
    ".plain-publication__entry-dek",
    "figcaption",
    "table:not(.plain-publication__table)",
    "blockquote",
  ]) {
    expect(articleCss).toContain(hook);
  }
  expect(articleCss).toMatch(
    /@media \(min-width: 64rem\)\s*\{[\s\S]*?\[data-toc="aside"\] \.plain-publication__toc\s*\{[^}]*position:\s*sticky;[^}]*top:\s*calc\(var\(--hraness-sticky-offset, 0px\) \+ 1\.5rem\);/u,
  );
  expect(articleCss).toMatch(
    /@media \(forced-colors: active\)\s*\{[\s\S]*?border-color:\s*CanvasText;[\s\S]*?\.plain-publication__callout\[data-tone\]\s*\{[^}]*border-left-color:\s*CanvasText;/u,
  );
  expect(articleCss).not.toMatch(/#[0-9a-f]{3,8}\b/iu);
  expect(articleCss).not.toMatch(/\b(?:transition|animation)(?:-[a-z]+)?\s*:/iu);
  expect(articleCss).not.toMatch(/(?:linear|radial|conic)-gradient/iu);
  expect(articleCss).not.toMatch(/:is\(\s*>/u);
});

test("the shared reading scale ships as an opt-in prose surface on shared tokens", () => {
  const readingCssPromise = Bun.file(
    new URL("./reading.css", import.meta.url),
  ).text();
  return readingCssPromise.then((readingCss) => {
    expect(packageManifest.exports?.["./reading.css"]).toBe(
      "./src/reading.css",
    );
    expect(stylesCss).toContain('@import "./reading.css";');
    expect(stylesCss.indexOf("plain-publication.css")).toBeLessThan(
      stylesCss.indexOf("reading.css"),
    );

    expect(readingCss).toMatch(
      /^\.hraness-prose\s*\{[^}]*max-inline-size:\s*var\(--hraness-type-reading-measure, 70ch\);[^}]*font-size:\s*var\(--hraness-type-reading-size,[^;}]*\);[^}]*line-height:\s*var\(--hraness-type-reading-leading, 1\.7\);/mu,
    );
    expect(readingCss).toMatch(
      /\.hraness-prose h1\s*\{[^}]*font-size:\s*var\(--hraness-type-h1-size,[^;}]*\);/su,
    );
    expect(readingCss).toMatch(
      /\.hraness-prose h2\s*\{[^}]*font-size:\s*var\(--hraness-type-h2-size,[^;}]*\);/su,
    );
    expect(readingCss).toMatch(
      /\.hraness-prose h3\s*\{[^}]*font-size:\s*var\(--hraness-type-h3-size,[^;}]*\);/su,
    );
    expect(readingCss).toMatch(
      /\.hraness-prose :is\(h4, h5, h6\)\s*\{[^}]*font-size:\s*var\(--hraness-type-h4-size,[^;}]*\);/su,
    );
    expect(readingCss).toContain('[data-hraness-reading-face="serif"]');
    expect(readingCss).toMatch(
      /\.hraness-prose :is\(h1, h2, h3\)\s*\{[^}]*font-family:\s*var\(--hraness-type-heading-font,[^;}]*\);[^}]*font-weight:\s*var\(--hraness-type-heading-weight,[^;}]*\);/su,
    );
    expect(readingCss).not.toMatch(/(?:linear|radial|conic)-gradient/iu);

    expect(publicationCss).toContain(
      "font-size: var(--hraness-type-reading-size,",
    );
    expect(publicationCss).toContain(
      "font-size: var(--hraness-type-h2-size,",
    );
    expect(publicationCss).toContain(
      "font-size: var(--hraness-type-h3-size,",
    );
    expect(publicationCss).toContain(
      "font-size: var(--hraness-type-h1-size,",
    );
    expect(publicationCss).toContain(
      "margin: var(--hraness-type-section-space,",
    );
  });
});
