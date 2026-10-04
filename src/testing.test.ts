import { describe, expect, test } from "bun:test";

import { parseArticleAdmissions, type ArticleAdmission } from "./article.js";
import {
  assertFakeHandles,
  assertNoHeadings,
  assertRoleImgWithLabel,
  assertWalkthroughCopy,
  blogConformance,
  ConformanceError,
  htmlText,
  renderMatrix,
  stripMockupSamples,
  type BlogConformanceConfig,
  type BlogConformancePost,
} from "./testing.js";

const site = "https://relay.example";

function admission(href: string, lifecycle: "indexable" | "quarantined"): ArticleAdmission {
  return parseArticleAdmissions([{
    href,
    lifecycle,
    readerJob: `How does ${href} work?`,
    nonObviousAnswer: "Render both from one pure function and compare bytes in a test.",
    originalContribution: "A parity test that renders both paths from generated inputs.",
    hostFit: "The host ships the renderer this post describes.",
    nearestUrls: [],
    sources: [{ title: "Release notes", url: "https://relay.example/releases/v1", checkedOn: "2026-09-20" }],
    observations: ["The renderers disagreed on attribute casing.", "Escaping differed only with apostrophes."],
    scores: { readerUtility: 2, originalEvidence: 2, factualConfidence: 2, hostFit: 1, voiceIntegrity: 1, maintenanceValue: 1 },
    owner: "Relay maintainers",
    drafting: "ai-from-source",
    review: { reviewer: "Claude Opus 5.5 (claude-opus-5-5) editorial review", reviewerType: "ai", reviewedOn: "2026-09-23" },
    humanReview: null,
    reassessOn: "2026-10-28",
    harmIfWrong: "A reader ships a renderer that drifts from the preview.",
    refreshTriggers: ["release tag bump"],
  }])[0] as ArticleAdmission;
}

const posts: readonly BlogConformancePost[] = [
  {
    slug: "one-renderer",
    path: "/blog/one-renderer",
    heading: "Keep the preview and the export on one renderer",
    description: "How Relay renders its static export and its live preview from one function, and the test that keeps them equal.",
    dek: "One function renders both, and a byte comparison runs on every change.",
  },
  {
    slug: "draft-notes",
    path: "/blog/draft-notes",
    heading: "Notes on queue retries",
    description: "Early notes on how Relay retries a failed job, kept out of the index until the numbers are checked.",
    dek: "Retries wait longer each time and stop after five tries.",
  },
];

function page(post: BlogConformancePost, body = ""): string {
  return `<article data-hraness-article=""><h1>${post.heading}</h1><p>${post.dek}</p>${body}<script type="application/ld+json">{}</script></article>`;
}

function config(overrides: Partial<BlogConformanceConfig<BlogConformancePost>> = {}): BlogConformanceConfig<BlogConformancePost> {
  return {
    siteUrl: site,
    posts,
    admissions: [admission("/blog/one-renderer", "indexable"), admission("/blog/draft-notes", "quarantined")],
    renderPost: (post) => page(post),
    renderIndex: () => `<a href="/blog/one-renderer">One</a>`,
    sitemapUrls: () => [`${site}/blog/one-renderer`],
    feedXml: () => `<feed><entry><link href="${site}/blog/one-renderer"/></entry></feed>`,
    robots: (post) => ({ index: post.slug === "one-renderer", follow: true }),
    listedDates: () => ["2026-09-20", "2026-09-01"],
    ...overrides,
  };
}

async function failures(value: BlogConformanceConfig<BlogConformancePost>): Promise<readonly string[]> {
  const messages: string[] = [];
  for (const check of blogConformance(value)) {
    try {
      await check.run();
    } catch (error) {
      expect(error).toBeInstanceOf(ConformanceError);
      messages.push((error as Error).message);
    }
  }
  return messages;
}

describe("blogConformance", () => {
  test("a conforming blog passes every check", async () => {
    expect(blogConformance(config()).map((check) => check.name)).toHaveLength(8);
    expect(await failures(config())).toEqual([]);
  });

  test("optional checks run only when configured", () => {
    const minimal = blogConformance({ siteUrl: site, posts, admissions: config().admissions, renderPost: (post) => page(post) });
    expect(minimal).toHaveLength(5);
  });

  test("a quarantined post in the sitemap, index, or feed fails", async () => {
    const leaked = await failures(config({
      renderIndex: () => `<a href="/blog/one-renderer"></a><a href="/blog/draft-notes"></a>`,
    }));
    expect(leaked).toEqual(["The index lists /blog/draft-notes."]);
    expect(await failures(config({ sitemapUrls: () => [] }))).toEqual(["The sitemap omits /blog/one-renderer."]);
    expect(await failures(config({ feedXml: () => `<feed>${site}/blog/one-renderer & more</feed>` }))).toEqual(["The feed has an unescaped ampersand."]);
  });

  test("robots must follow the lifecycle", async () => {
    expect(await failures(config({ robots: () => ({ index: true, follow: true }) })))
      .toEqual(["/blog/draft-notes robots index=true disagrees with its lifecycle."]);
  });

  test("markup, copy, and ordering problems are named", async () => {
    const messages = await failures(config({
      renderPost: (post) => page(post, '<h1>Two</h1><a href="#missing">x</a>'),
      listedDates: () => ["2026-09-01", "2026-09-20"],
    }));
    expect(messages.some((message) => message.includes("renders 2 h1 elements"))).toBe(true);
    expect(messages).toContain("Listed posts are not newest first.");
    const hype = await failures(config({ renderPost: (post) => page(post, "<p>This is a game-changer!</p>") }));
    expect(hype.join("\n")).toMatch(/game-changer|"!"/u);
  });

  test("mockup sample text does not count as article prose", async () => {
    const figure = '<figure><div role="img" aria-label="Illustration."><span class="hkm-sample">Wow!</span><p data-sample-skip="">Amazing!</p></div></figure>';
    expect(await failures(config({ renderPost: (post) => page(post, figure), sampleAttributes: ["data-sample-skip"] }))).toEqual([]);
  });

  test("a missing admission record fails", async () => {
    expect(await failures(config({ admissions: [admission("/blog/one-renderer", "indexable")] })))
      .toContain("1 admission records for 2 posts.");
  });
});

describe("markup helpers", () => {
  test("htmlText decodes entities and drops scripts", () => {
    expect(htmlText("<p>It&#x27;s &amp; <b>bold</b></p><script>x()</script>")).toBe("It's & bold");
  });

  test("stripMockupSamples drops sample leaves and marked elements", () => {
    const html = '<p>Keep</p><span class="hkm-sample">Drop</span><div data-skip>Also drop</div>';
    expect(htmlText(stripMockupSamples(html, ["data-skip"]))).toBe("Keep");
  });

  test("renderMatrix rejects cases that render the same markup", () => {
    expect(renderMatrix((theme: string) => `<div data-theme="${theme}"></div>`, { light: "light", dark: "dark" })).toHaveLength(2);
    expect(() => renderMatrix(() => "<div></div>", { light: "light", dark: "dark" })).toThrow('Cases "light" and "dark" render the same markup.');
    expect(renderMatrix(() => "<div></div>", { a: 1, b: 2 }, { allowIdentical: true })).toHaveLength(2);
  });

  test("assertNoHeadings and assertRoleImgWithLabel", () => {
    expect(() => assertNoHeadings("<div><h3>x</h3></div>")).toThrow("heading");
    expect(() => assertNoHeadings('<div role="heading">x</div>')).toThrow("heading");
    const ok = '<div role="img" aria-label="Illustration of a chat." data-nosnippet=""><span>hi</span></div>';
    expect(() => assertRoleImgWithLabel(ok)).not.toThrow();
    expect(() => assertRoleImgWithLabel('<div role="img" aria-label=" " data-nosnippet=""></div>')).toThrow("aria-label");
    expect(() => assertRoleImgWithLabel('<div role="img" aria-label="x"></div>')).toThrow("data-nosnippet");
    expect(() => assertRoleImgWithLabel('<div aria-label="x" data-nosnippet=""></div>')).toThrow('role="img"');
    expect(() => assertRoleImgWithLabel('<div role="img" aria-label="x" data-nosnippet=""><button>x</button></div>')).toThrow("interactive");
  });

  test("assertFakeHandles allows only invented handles and reserved domains", () => {
    expect(() => assertFakeHandles("<p>@mira wrote to mira@relay.example</p>", ["mira"])).not.toThrow();
    expect(() => assertFakeHandles("<p>@realperson</p>", ["mira"])).toThrow("@realperson");
    expect(() => assertFakeHandles("<p>ask me@gmail.com</p>", [])).toThrow("gmail.com");
    expect(() => assertFakeHandles('<a href="https://github.com/x">x</a>', [])).toThrow("github.com");
    expect(() => assertFakeHandles('<a href="https://docs.example.com/x">x</a>', [])).not.toThrow();
  });

  test("assertWalkthroughCopy keeps step labels and hints short", () => {
    expect(() => assertWalkthroughCopy([{ id: "join", label: "Join duplicates", hint: "Records that share an email become one person." }])).not.toThrow();
    expect(() => assertWalkthroughCopy([{ id: "join", label: "Join all the duplicates", hint: "Short." }])).toThrow("4 words");
    expect(() => assertWalkthroughCopy([{ id: "join", label: "Join", hint: "x".repeat(61) }])).toThrow("61 characters");
    expect(() => assertWalkthroughCopy([{ id: "join", label: "Join", hint: "One. Two." }])).toThrow("more than one sentence");
    expect(() => assertWalkthroughCopy([{ id: "join", label: "Join", hint: "  " }])).not.toThrow();
  });
});
