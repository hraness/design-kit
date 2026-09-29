/**
 * Test helpers for product sites that use the article layer and the mockups.
 *
 * Framework-neutral: nothing here imports a test runner, React, or the DOM.
 * `blogConformance` returns named checks that throw on failure, so any runner
 * can wire them:
 *
 * ```ts
 * for (const check of blogConformance(config)) test(check.name, check.run);
 * ```
 *
 * The markup helpers take rendered HTML strings, such as the output of
 * `renderToStaticMarkup`.
 */
import { articleAdmissionScore, assertArticleAdmissions, isArticleIndexable, type ArticleAdmission } from "./article.js";
import { LAUNCH_INTERNAL_WORDS, launchCopyProblems } from "./launch.js";

export class ConformanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConformanceError";
  }
}

function fail(message: string): never {
  throw new ConformanceError(message);
}

export type ConformanceCheck = Readonly<{ name: string; run: () => void | Promise<void> }>;

/** Visible text of an HTML string: scripts, styles, and tags dropped, common entities decoded, whitespace collapsed. */
export function htmlText(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&#x27;|&#39;|&apos;/gu, "'")
    .replace(/&quot;/gu, '"')
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/\s+/gu, " ")
    .trim();
}

/**
 * Drop invented sample text from mockup markup before checking article prose.
 * Mockups wrap sample text in `.hkm-sample` leaves; products may pass their
 * own marker attributes too, such as a filter's skip marker.
 */
export function stripMockupSamples(html: string, attributes: readonly string[] = []): string {
  let result = html.replace(/<span\b[^>]*\sclass="[^"]*\bhkm-sample\b[^"]*"[^>]*>[^<]*<\/span>/gu, " ");
  for (const attribute of attributes) {
    const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    result = result.replace(new RegExp(`<(span|p|div)\\b[^>]*\\s${escaped}(=("[^"]*"|'[^']*'))?[^>]*>[^<]*</\\1>`, "gu"), " ");
  }
  return result;
}

export type BlogConformancePost = Readonly<{
  slug: string;
  /** `/blog/<slug>` or the product's own base path. */
  path: string;
  heading: string;
  description: string;
  dek: string;
  imageAlt?: string;
}>;

export type BlogConformanceLimits = Readonly<{
  heading: number;
  descriptionMin: number;
  descriptionMax: number;
  dek: number;
}>;

export const BLOG_CONFORMANCE_LIMITS: BlogConformanceLimits = Object.freeze({
  heading: 70,
  descriptionMin: 70,
  descriptionMax: 160,
  dek: 200,
});

export type BlogConformanceConfig<Post extends BlogConformancePost> = Readonly<{
  /** Absolute site origin without a trailing slash, such as `https://example.com`. */
  siteUrl: string;
  posts: readonly Post[];
  admissions: readonly ArticleAdmission[];
  /** Rendered post page HTML. */
  renderPost: (post: Post) => string | Promise<string>;
  /** Rendered blog index HTML. */
  renderIndex?: () => string | Promise<string>;
  /** Absolute sitemap URLs. */
  sitemapUrls?: () => readonly string[] | Promise<readonly string[]>;
  /** RSS or Atom feed XML. */
  feedXml?: () => string | Promise<string>;
  /** The robots metadata a post page emits. */
  robots?: (post: Post) => Readonly<{ index: boolean; follow: boolean }> | Promise<Readonly<{ index: boolean; follow: boolean }>>;
  /** Published dates of the listed posts, in listing order. */
  listedDates?: () => readonly string[];
  limits?: BlogConformanceLimits;
  /** Extra attributes that mark invented sample text inside figures. */
  sampleAttributes?: readonly string[];
}>;

function admissionFor(admissions: readonly ArticleAdmission[], post: BlogConformancePost, siteUrl: string): ArticleAdmission {
  const found = admissions.find((admission) => admission.href === post.path || admission.href === `${siteUrl}${post.path}`);
  return found ?? fail(`No admission record for ${post.path}.`);
}

/**
 * The shared blog checks: records pass the validator, indexable posts meet the
 * bar, copy follows the article style rules, each page has one h1 and JSON-LD,
 * robots follow the lifecycle, and the index, sitemap, and feed list exactly
 * the indexable posts. Optional checks run when their config field is given.
 */
export function blogConformance<Post extends BlogConformancePost>(config: BlogConformanceConfig<Post>): readonly ConformanceCheck[] {
  const limits = config.limits ?? BLOG_CONFORMANCE_LIMITS;
  const sampleAttributes = config.sampleAttributes ?? [];
  const indexable = (post: Post): boolean => isArticleIndexable(admissionFor(config.admissions, post, config.siteUrl));
  const checks: ConformanceCheck[] = [
    {
      name: "every post has one admission record that passes the validator",
      run: () => {
        assertArticleAdmissions(config.admissions);
        const paths = config.posts.map((post) => post.path);
        if (new Set(paths).size !== paths.length) fail("Two posts share a path.");
        if (config.admissions.length !== config.posts.length) fail(`${config.admissions.length} admission records for ${config.posts.length} posts.`);
        for (const post of config.posts) admissionFor(config.admissions, post, config.siteUrl);
      },
    },
    {
      name: "an indexable post has a real assessment, sources, and a review",
      run: () => {
        for (const post of config.posts.filter(indexable)) {
          const admission = admissionFor(config.admissions, post, config.siteUrl);
          if (articleAdmissionScore(admission.scores) < 9) fail(`${post.path} scores below 9.`);
          if (Object.values(admission.scores).includes(0)) fail(`${post.path} has a zero score.`);
          if (admission.review === null) fail(`${post.path} is indexable without a review.`);
          if (admission.sources.length === 0) fail(`${post.path} is indexable without sources.`);
          if (admission.observations.length < 2) fail(`${post.path} needs two observations.`);
        }
      },
    },
    {
      name: "headings, descriptions, and deks are unique and within limits",
      run: () => {
        for (const key of ["heading", "description", "dek"] as const) {
          const values = config.posts.map((post) => post[key]);
          if (new Set(values).size !== values.length) fail(`Two posts share a ${key}.`);
        }
        for (const post of config.posts) {
          if (post.heading.length > limits.heading) fail(`${post.path} heading is longer than ${limits.heading}.`);
          if (/\.$/u.test(post.heading)) fail(`${post.path} heading ends with a period.`);
          if (post.description.length < limits.descriptionMin || post.description.length > limits.descriptionMax) {
            fail(`${post.path} description is outside ${limits.descriptionMin} to ${limits.descriptionMax} characters.`);
          }
          if (post.dek.length > limits.dek) fail(`${post.path} dek is longer than ${limits.dek}.`);
        }
      },
    },
    {
      name: "every post renders with one h1, the article root, and JSON-LD",
      run: async () => {
        for (const post of config.posts) {
          const html = await config.renderPost(post);
          const h1 = html.match(/<h1\b/gu)?.length ?? 0;
          if (h1 !== 1) fail(`${post.path} renders ${h1} h1 elements.`);
          if (!html.includes("data-hraness-article")) fail(`${post.path} is missing the article root.`);
          if (!html.includes("application/ld+json")) fail(`${post.path} is missing JSON-LD.`);
          for (const match of html.matchAll(/href="#([^"]+)"/gu)) {
            if (!html.includes(`id="${match[1] ?? ""}"`)) fail(`${post.path} links to #${match[1] ?? ""}, which does not exist.`);
          }
        }
      },
    },
    {
      name: "public copy follows the article style rules",
      run: async () => {
        for (const post of config.posts) {
          const html = await config.renderPost(post);
          const fields = [post.heading, post.dek, post.description, post.imageAlt ?? ""].join(" ");
          const prose = `${fields} ${htmlText(stripMockupSamples(html, sampleAttributes))}`;
          // Launch rules cover posts too, minus the internal-word check on body text, which may quote records.
          const problems = launchCopyProblems(prose, post.path).filter(
            (problem) => !problem.includes("internal word") && !problem.includes("ends with a question mark") && !problem.includes("thread marker"),
          );
          if (problems.length > 0) fail(problems.join("\n"));
          const internal = new RegExp(`\\b(${LAUNCH_INTERNAL_WORDS.join("|")})s?\\b`, "iu").exec(fields);
          if (internal !== null) fail(`${post.path} uses the internal word "${internal[0]}" in its heading, dek, or description.`);
        }
      },
    },
  ];
  if (config.robots !== undefined) {
    const robots = config.robots;
    checks.push({
      name: "only indexable posts ask to be indexed",
      run: async () => {
        for (const post of config.posts) {
          const value = await robots(post);
          if (value.index !== indexable(post)) fail(`${post.path} robots index=${String(value.index)} disagrees with its lifecycle.`);
          if (!value.follow) fail(`${post.path} asks crawlers not to follow links.`);
        }
      },
    });
  }
  if (config.renderIndex !== undefined || config.sitemapUrls !== undefined || config.feedXml !== undefined) {
    checks.push({
      name: "the index, sitemap, and feed list exactly the indexable posts",
      run: async () => {
        const index = config.renderIndex === undefined ? null : await config.renderIndex();
        const urls = config.sitemapUrls === undefined ? null : new Set(await config.sitemapUrls());
        const feed = config.feedXml === undefined ? null : await config.feedXml();
        for (const post of config.posts) {
          const shown = indexable(post);
          const absolute = `${config.siteUrl}${post.path}`;
          if (index !== null && index.includes(`href="${post.path}"`) !== shown) fail(`The index ${shown ? "omits" : "lists"} ${post.path}.`);
          if (urls !== null && urls.has(absolute) !== shown) fail(`The sitemap ${shown ? "omits" : "lists"} ${post.path}.`);
          if (feed !== null && feed.includes(absolute) !== shown) fail(`The feed ${shown ? "omits" : "lists"} ${post.path}.`);
        }
        if (feed !== null && /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/iu.test(feed)) fail("The feed has an unescaped ampersand.");
      },
    });
  }
  if (config.listedDates !== undefined) {
    const listedDates = config.listedDates;
    checks.push({
      name: "listed posts are newest first",
      run: () => {
        const dates = listedDates();
        const sorted = dates.toSorted().toReversed();
        if (dates.some((date, index) => date !== sorted[index])) fail("Listed posts are not newest first.");
      },
    });
  }
  return Object.freeze(checks);
}

export type RenderMatrixEntry<Props> = Readonly<{ name: string; props: Props; html: string }>;

/**
 * Render one component across named prop sets (themes, states, sizes) with
 * the caller's renderer, such as `(props) => renderToStaticMarkup(<Frame {...props} />)`.
 * Throws when two cases render the same markup, which usually means a prop is ignored.
 */
export function renderMatrix<Props>(
  render: (props: Props) => string,
  cases: Readonly<Record<string, Props>>,
  options: Readonly<{ allowIdentical?: boolean }> = {},
): readonly RenderMatrixEntry<Props>[] {
  const entries = Object.entries(cases).map(([name, props]) => Object.freeze({ name, props, html: render(props) }));
  if (options.allowIdentical !== true) {
    const seen = new Map<string, string>();
    for (const entry of entries) {
      const previous = seen.get(entry.html);
      if (previous !== undefined) fail(`Cases "${previous}" and "${entry.name}" render the same markup.`);
      seen.set(entry.html, entry.name);
    }
  }
  return Object.freeze(entries);
}

/** Mockups sit inside articles and must not add to the page outline. */
export function assertNoHeadings(html: string, label = "markup"): void {
  const match = /<h[1-6]\b|role="heading"/iu.exec(html);
  if (match !== null) fail(`${label} contains a heading (${match[0]}); mockups must not add to the page outline.`);
}

/**
 * The root element is one image with a non-empty label, marked out of
 * snippets, and every descendant is hidden from assistive technology by it.
 */
export function assertRoleImgWithLabel(html: string, label = "markup"): void {
  const root = /^\s*<([a-z][a-z0-9-]*)\b([^>]*)>/iu.exec(html);
  if (root === null) fail(`${label} has no root element.`);
  const attributes = root[2] ?? "";
  if (!/\srole="img"/u.test(attributes)) fail(`${label} root is not role="img".`);
  const aria = /\saria-label="([^"]*)"/u.exec(attributes);
  if (aria === null || (aria[1] ?? "").trim().length === 0) fail(`${label} root has no aria-label.`);
  if (!/\sdata-nosnippet(=|\s|>|$)/u.test(attributes) && !attributes.includes("data-nosnippet")) fail(`${label} root is missing data-nosnippet.`);
  const inner = html.slice(root[0].length);
  if (/<(a|button|input|select|textarea)\b/iu.test(inner)) fail(`${label} contains an interactive element inside an image.`);
  if (/\stabindex="(?!-1")/iu.test(inner)) fail(`${label} contains a focusable element inside an image.`);
}

/** Domains reserved for documentation (RFC 2606 and RFC 6761). */
const RESERVED_HOST = /^([a-z0-9-]+\.)*(example\.(com|net|org)|[a-z0-9-]+\.(example|test|invalid|localhost))$/iu;

/**
 * Handles, emails, and links in mockup markup must be invented: handles from
 * the allow list, emails and links on reserved example domains only.
 */
export function assertFakeHandles(html: string, allowedHandles: readonly string[], label = "markup"): void {
  const text = htmlText(html);
  const allowed = new Set(allowedHandles.map((handle) => handle.replace(/^@/u, "").toLowerCase()));
  for (const match of text.matchAll(/(^|[\s(])@([a-z0-9_.]{2,30})\b/giu)) {
    const handle = (match[2] ?? "").toLowerCase();
    if (!allowed.has(handle)) fail(`${label} shows the handle @${handle}, which is not in the invented list.`);
  }
  for (const match of text.matchAll(/\b[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})\b/giu)) {
    if (!RESERVED_HOST.test(match[1] ?? "")) fail(`${label} shows the email ${match[0]}, which is not on a reserved example domain.`);
  }
  for (const match of html.matchAll(/\bhref="https?:\/\/([^/"]+)/giu)) {
    if (!RESERVED_HOST.test(match[1] ?? "")) fail(`${label} links to ${match[1] ?? ""}, which is not a reserved example domain.`);
  }
}
