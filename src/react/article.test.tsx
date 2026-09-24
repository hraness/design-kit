import { expect, test } from "bun:test";
import fc from "fast-check";
import { renderToStaticMarkup } from "react-dom/server";

import {
  renderArticleCalloutHtml,
  renderArticleHtml,
  renderArticleIndexHtml,
  renderArticleProvenanceHtml,
  renderArticleSourcesHtml,
  type ArticleIndexItem,
  type ArticleIsoDate,
  type ArticleProvenanceRecord,
} from "../index.js";
import {
  ArticleByline,
  ArticleCallout,
  ArticleIndex,
  ArticleProvenance,
  ArticleRelatedProducts,
  ArticleSources,
  MarketingArticle,
} from "./server.js";

const provenance: ArticleProvenanceRecord = {
  drafting: "ai-from-source",
  review: { reviewer: "Claude Opus 5.5 (claude-opus-5-5) editorial review", reviewerType: "ai" },
};

test("MarketingArticle renders the header, dated meta, provenance, contents, body, and footer", () => {
  const html = renderToStaticMarkup(
    <MarketingArticle
      after={<ArticleSources sources={[{ title: "Release notes", href: "https://example.com/r", publisher: "Example", checkedOn: "2026-09-20" }]} />}
      author={{ kind: "organization", name: "Hraness", href: "https://hraness.com" }}
      dek="One renderer serves both the preview and the static export."
      eyebrow="Technique"
      heading="Keeping two renderers byte-identical"
      provenance={provenance}
      published="2026-09-23"
      toc={[{ href: "#why", label: "Why" }]}
      updated="2026-09-24"
    >
      <h2 id="why">Why</h2>
      <p>Body.</p>
    </MarketingArticle>,
  );
  expect(html).toContain('class="plain-site plain-publication plain-publication--embedded plain-publication__article"');
  expect(html).toContain('data-toc="aside"');
  expect(html).toContain('<h1 id="article-title">Keeping two renderers byte-identical</h1>');
  expect(html).toContain('<p class="plain-publication__article-dek">One renderer serves both the preview and the static export.</p>');
  expect(html).toContain('By <a href="https://hraness.com" rel="author">Hraness</a>');
  expect(html).toContain('Published <time dateTime="2026-09-23">23 September 2026</time>');
  expect(html).toContain('Updated <time dateTime="2026-09-24">24 September 2026</time>');
  expect(html).toContain("Drafted with AI from the source code and reviewed by Claude Opus 5.5 (claude-opus-5-5) editorial review.");
  expect(html).toContain('data-reviewer-type="ai"');
  expect(html).not.toMatch(/human/iu);
  expect(html).toContain('<nav aria-labelledby="article-title-contents" class="plain-publication__toc">');
  expect(html).toContain('<footer class="plain-publication__article-footer"><section aria-labelledby="article-sources" class="plain-publication__sources">');
  expect(html).toContain("Example<span aria-hidden=\"true\"> · </span>Checked");
});

test("MarketingArticle omits empty slots and rejects bad dates and contents links", () => {
  const html = renderToStaticMarkup(
    <MarketingArticle heading="Plain" provenance={null} published="2026-09-23"><p>x</p></MarketingArticle>,
  );
  expect(html).toContain('data-toc="none"');
  expect(html).not.toContain("<nav");
  expect(html).not.toContain("<footer");
  expect(html).not.toContain("plain-publication__provenance");
  expect(html).not.toContain("By ");
  expect(() => renderToStaticMarkup(
    <MarketingArticle heading="x" provenance={null} published="2026-09-23" updated="2026-09-01"><p>x</p></MarketingArticle>,
  )).toThrow(/cannot precede/u);
  expect(() => renderToStaticMarkup(
    <MarketingArticle heading="x" provenance={null} published="2026-09-23" toc={[{ href: "#" as `#${string}`, label: "x" }]}><p>x</p></MarketingArticle>,
  )).toThrow(RangeError);
});

test("byline, provenance, and callout render stable hooks", () => {
  expect(renderToStaticMarkup(<ArticleByline author={{ kind: "person", name: "Sam" }} />))
    .toBe('<span class="plain-publication__byline" data-author-kind="person">By Sam</span>');
  expect(renderToStaticMarkup(<ArticleProvenance provenance={{ drafting: "ai", review: null }} />))
    .toBe('<p class="plain-publication__provenance" data-drafting="ai" data-reviewer-type="none">Drafted with AI. It has not been reviewed yet.</p>');
  expect(renderToStaticMarkup(<ArticleCallout label="Limit" tone="limit">Only one host.</ArticleCallout>))
    .toBe('<div class="plain-publication__callout" data-tone="limit" role="note"><strong>Limit</strong><p>Only one host.</p></div>');
  expect(renderToStaticMarkup(<ArticleSources sources={[]} />)).toBe("");
  expect(() => renderToStaticMarkup(<ArticleSources sources={[{ title: "x", href: "javascript:x", checkedOn: "2026-09-23" }]} />)).toThrow(RangeError);
});

test("ArticleRelatedProducts wraps MarketingRelated", () => {
  const html = renderToStaticMarkup(
    <ArticleRelatedProducts items={[{ href: "https://example.com", name: "Example", relationship: "Stores the files this one renders.", role: "Storage" }]} />,
  );
  expect(html.startsWith('<div class="plain-publication__related-products">')).toBe(true);
  expect(html).toContain("Related products");
  expect(html).toContain('id="article-related-products"');
  expect(html).toContain("Stores the files this one renders.");
});

test("ArticleIndex lists posts and rejects duplicates", () => {
  const items: ArticleIndexItem[] = [
    { href: "/blog/a", title: "A", dek: "Claim A.", published: "2026-09-20", eyebrow: "Series" },
    { href: "/blog/b", title: "B", dek: "Claim B.", published: "2026-09-10", updated: "2026-09-21" },
  ];
  const html = renderToStaticMarkup(<ArticleIndex heading="Writing" headingId="writing" items={items} />);
  expect(html).toContain('data-hraness-article-index=""');
  expect(html).toContain('<h2 id="writing">Writing</h2>');
  expect(html).toContain('<h3 class="plain-publication__entry-title"><a href="/blog/a">A</a></h3>');
  expect(html).toContain('<p class="plain-publication__entry-label">Series</p>');
  const [first] = items;
  if (first === undefined) throw new Error("Missing fixture.");
  expect(() => renderToStaticMarkup(<ArticleIndex heading="W" headingId="w" items={[first, first]} />)).toThrow(/more than once/u);
});

test("the static renderer matches the React components byte for byte", () => {
  const body = "<p>Body &amp; more.</p>";
  expect(renderArticleHtml({
    author: { kind: "organization", name: "Hraness" },
    bodyHtml: body,
    dek: "A claim.",
    eyebrow: "Technique",
    heading: "Title's <here>",
    provenance,
    published: "2026-09-23",
    toc: [{ href: "#a", label: "A" }],
    updated: "2026-09-24",
  })).toBe(renderToStaticMarkup(
    <MarketingArticle
      author={{ kind: "organization", name: "Hraness" }}
      dek="A claim."
      eyebrow="Technique"
      heading="Title's <here>"
      provenance={provenance}
      published="2026-09-23"
      toc={[{ href: "#a", label: "A" }]}
      updated="2026-09-24"
    >
      <p>Body &amp; more.</p>
    </MarketingArticle>,
  ));
  expect(renderArticleProvenanceHtml(provenance)).toBe(renderToStaticMarkup(<ArticleProvenance provenance={provenance} />));
  expect(renderArticleCalloutHtml({ label: "Note", text: "Plain & simple." }))
    .toBe(renderToStaticMarkup(<ArticleCallout label="Note">Plain &amp; simple.</ArticleCallout>));
  expect(renderArticleSourcesHtml({ sources: [] })).toBe("");
});

const textArb = fc.string({ maxLength: 40 });
const dateArb = fc.integer({ min: 10_957, max: 47_481 }).map((day) => new Date(day * 86_400_000).toISOString().slice(0, 10) as ArticleIsoDate);
const hrefArb = fc.constantFrom("/blog/a", "https://example.com/x?y=1&z=2", "#frag", "../up", "mailto:a@example.com");

test("property: static and React markup agree for generated articles", () => {
  fc.assert(fc.property(
    fc.record({
      heading: textArb,
      dek: fc.option(textArb, { nil: undefined }),
      eyebrow: fc.option(textArb, { nil: undefined }),
      author: fc.option(fc.record({ kind: fc.constantFrom("organization" as const, "person" as const), name: textArb.filter((v) => v.trim() !== "") }), { nil: undefined }),
      published: dateArb,
      toc: fc.array(fc.record({ href: fc.stringMatching(/^#[a-z][a-z0-9-]{0,8}$/u).map((v) => v as `#${string}`), label: textArb }), { maxLength: 3 }).map((items) => [...new Map(items.map((i) => [i.href, i])).values()]),
      reviewer: fc.option(textArb.filter((v) => v.trim() !== ""), { nil: null }),
    }),
    (input) => {
      const record: ArticleProvenanceRecord = {
        drafting: "ai-from-source",
        review: input.reviewer === null ? null : { reviewer: input.reviewer, reviewerType: "ai" },
      };
      const shared = {
        heading: input.heading,
        provenance: record,
        published: input.published,
        toc: input.toc,
        ...(input.dek === undefined ? {} : { dek: input.dek }),
        ...(input.eyebrow === undefined ? {} : { eyebrow: input.eyebrow }),
        ...(input.author === undefined ? {} : { author: input.author }),
      };
      const react = renderToStaticMarkup(<MarketingArticle {...shared}><p>b</p></MarketingArticle>);
      expect(renderArticleHtml({ ...shared, bodyHtml: "<p>b</p>" })).toBe(react);
    },
  ), { numRuns: 150 });
});

test("property: static and React index and sources markup agree", () => {
  fc.assert(fc.property(
    fc.uniqueArray(fc.record({
      href: hrefArb,
      title: textArb,
      dek: textArb,
      published: dateArb,
      eyebrow: fc.option(textArb, { nil: undefined }),
    }), { maxLength: 4, selector: (item) => item.href }),
    fc.array(fc.record({ title: textArb, href: hrefArb, publisher: fc.option(textArb, { nil: undefined }), checkedOn: dateArb }), { maxLength: 3 }),
    textArb,
    (rawItems, rawSources, heading) => {
      const items: ArticleIndexItem[] = rawItems.map(({ eyebrow, ...rest }) => (eyebrow === undefined ? rest : { ...rest, eyebrow }));
      const sources = rawSources.map(({ publisher, ...rest }) => (publisher === undefined ? rest : { ...rest, publisher }));
      expect(renderArticleIndexHtml({ heading, headingId: "idx", items }))
        .toBe(renderToStaticMarkup(<ArticleIndex heading={heading} headingId="idx" items={items} />));
      expect(renderArticleSourcesHtml({ sources }))
        .toBe(renderToStaticMarkup(<ArticleSources sources={sources} />));
    },
  ), { numRuns: 150 });
});
