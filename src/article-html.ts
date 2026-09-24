/**
 * Framework-neutral static HTML for the article layer. Static-site builders
 * that do not run React call these functions and load plain-publication.css
 * (or styles.css). The markup matches the React components in
 * `@hraness/design-kit/react/server` element for element; tests bind the two.
 *
 * Text arguments are escaped. Fields named `*Html` take trusted HTML the site
 * already rendered, such as the output of its Markdown pipeline. Never pass
 * reader input through them.
 */
import {
  ARTICLE_BYLINE_PREFIX,
  ARTICLE_SOURCES_HEADING,
  ARTICLE_TOC_LABEL,
  articleProvenanceSentence,
  assertArticleAuthor,
  assertArticleCalloutTone,
  assertArticleDates,
  assertArticleHref,
  formatArticleDate,
  type ArticleAuthor,
  type ArticleCalloutTone,
  type ArticleIndexItem,
  type ArticleIsoDate,
  type ArticleProvenanceRecord,
  type ArticleSourceItem,
  type ArticleTocItem,
} from "./article.js";

const ROOT_CLASS = "plain-site plain-publication plain-publication--embedded";
const SEPARATOR = '<span aria-hidden="true"> · </span>';

const ESCAPES: Readonly<Record<string, string>> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&#x27;",
  "<": "&lt;",
  ">": "&gt;",
};

/** Escape text for an HTML text node or a double-quoted attribute. */
export function escapeArticleHtml(value: string): string {
  return value.replace(/["&'<>]/gu, (character) => ESCAPES[character] ?? character);
}

function classes(...values: readonly (string | undefined)[]): string {
  return values.filter((value) => value !== undefined && value !== "").join(" ");
}

function dateHtml(label: string, value: ArticleIsoDate): string {
  return `${label} <time dateTime="${escapeArticleHtml(value)}">${escapeArticleHtml(formatArticleDate(value))}</time>`;
}

function present(value: string | undefined): value is string {
  return value !== undefined && value !== "";
}

export function renderArticleBylineHtml(author: ArticleAuthor): string {
  assertArticleAuthor(author);
  const name = escapeArticleHtml(author.name);
  const linked = author.href === undefined
    ? name
    : `<a href="${escapeArticleHtml(author.href)}" rel="author">${name}</a>`;
  return `<span class="plain-publication__byline" data-author-kind="${author.kind}">${ARTICLE_BYLINE_PREFIX} ${linked}</span>`;
}

export function renderArticleProvenanceHtml(provenance: ArticleProvenanceRecord): string {
  const sentence = articleProvenanceSentence(provenance);
  return `<p class="plain-publication__provenance" data-drafting="${escapeArticleHtml(provenance.drafting)}" data-reviewer-type="${escapeArticleHtml(provenance.review?.reviewerType ?? "none")}">${escapeArticleHtml(sentence)}</p>`;
}

export interface ArticleHtmlInput {
  /** Trusted HTML placed after the body, such as sources and related links. */
  readonly afterHtml?: string;
  readonly author?: ArticleAuthor;
  /** Trusted HTML for the article body. */
  readonly bodyHtml: string;
  readonly className?: string;
  readonly dek?: string;
  readonly eyebrow?: string;
  readonly heading: string;
  readonly headingId?: string;
  readonly id?: string;
  readonly provenance: ArticleProvenanceRecord | null;
  readonly published: ArticleIsoDate;
  readonly toc?: readonly ArticleTocItem[];
  readonly tocLabel?: string;
  readonly updated?: ArticleIsoDate;
}

/** The static equivalent of `MarketingArticle`. */
export function renderArticleHtml(input: ArticleHtmlInput): string {
  const headingId = input.headingId ?? "article-title";
  const { published, updated } = input;
  assertArticleDates(updated === undefined ? { published } : { published, updated });
  const toc = input.toc ?? [];
  for (const item of toc) {
    if (!item.href.startsWith("#") || item.href.length < 2) throw new RangeError("Contents links must point to a heading in this article.");
  }
  const tocId = `${headingId}-contents`;
  const meta = [
    input.author === undefined ? "" : renderArticleBylineHtml(input.author) + SEPARATOR,
    dateHtml("Published", published),
    updated === undefined ? "" : SEPARATOR + dateHtml("Updated", updated),
  ].join("");
  const header = [
    '<header class="plain-publication__article-header">',
    present(input.eyebrow) ? `<p class="plain-publication__eyebrow">${escapeArticleHtml(input.eyebrow)}</p>` : "",
    `<h1 id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(input.heading)}</h1>`,
    present(input.dek) ? `<p class="plain-publication__article-dek">${escapeArticleHtml(input.dek)}</p>` : "",
    `<p class="plain-publication__article-meta">${meta}</p>`,
    input.provenance === null ? "" : renderArticleProvenanceHtml(input.provenance),
    "</header>",
  ].join("");
  const nav = toc.length === 0 ? "" : [
    `<nav aria-labelledby="${escapeArticleHtml(tocId)}" class="plain-publication__toc">`,
    `<p id="${escapeArticleHtml(tocId)}">${escapeArticleHtml(input.tocLabel ?? ARTICLE_TOC_LABEL)}</p>`,
    "<ol>",
    ...toc.map((item) => `<li><a href="${escapeArticleHtml(item.href)}">${escapeArticleHtml(item.label)}</a></li>`),
    "</ol></nav>",
  ].join("");
  return [
    `<article aria-labelledby="${escapeArticleHtml(headingId)}" class="${escapeArticleHtml(classes(ROOT_CLASS, "plain-publication__article", input.className))}" data-hraness-article="" data-toc="${toc.length > 0 ? "aside" : "none"}"${input.id === undefined ? "" : ` id="${escapeArticleHtml(input.id)}"`}>`,
    header,
    '<div class="plain-publication__article-layout">',
    nav,
    `<div class="plain-publication__article-body">${input.bodyHtml}</div>`,
    "</div>",
    present(input.afterHtml) ? `<footer class="plain-publication__article-footer">${input.afterHtml}</footer>` : "",
    "</article>",
  ].join("");
}

/** The static equivalent of `ArticleSources`. Returns an empty string for no sources. */
export function renderArticleSourcesHtml({
  heading = ARTICLE_SOURCES_HEADING,
  headingId = "article-sources",
  sources,
}: Readonly<{ heading?: string; headingId?: string; sources: readonly ArticleSourceItem[] }>): string {
  if (sources.length === 0) return "";
  for (const source of sources) assertArticleHref(source.href);
  return [
    `<section aria-labelledby="${escapeArticleHtml(headingId)}" class="plain-publication__sources">`,
    `<h2 id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(heading)}</h2>`,
    "<ol>",
    ...sources.map((source) => [
      `<li><a href="${escapeArticleHtml(source.href)}">${escapeArticleHtml(source.title)}</a>`,
      "<span>",
      present(source.publisher) ? escapeArticleHtml(source.publisher) + SEPARATOR : "",
      dateHtml("Checked", source.checkedOn),
      "</span></li>",
    ].join("")),
    "</ol></section>",
  ].join("");
}

/** The static equivalent of `ArticleCallout`. `bodyHtml` is trusted; pass `text` for escaped plain text. */
export function renderArticleCalloutHtml(input: Readonly<{
  label?: string;
  tone?: ArticleCalloutTone;
} & ({ bodyHtml: string; text?: undefined } | { bodyHtml?: undefined; text: string })>): string {
  const tone = input.tone ?? "note";
  assertArticleCalloutTone(tone);
  const body = input.text === undefined ? input.bodyHtml : `<p>${escapeArticleHtml(input.text)}</p>`;
  return `<div class="plain-publication__callout" data-tone="${tone}" role="note">${present(input.label) ? `<strong>${escapeArticleHtml(input.label)}</strong>` : ""}${body}</div>`;
}

export interface ArticleRelatedLink {
  readonly href: string;
  readonly name: string;
  /** What the two products do together, in one sentence from the registered relation. */
  readonly relationship: string;
}

/**
 * Related products for static pages, using the plain-publication related
 * grid. React hosts use `ArticleRelatedProducts`, which renders the marketing
 * card row instead.
 */
export function renderArticleRelatedHtml({
  heading = "Related products",
  headingId = "article-related-products",
  items,
}: Readonly<{ heading?: string; headingId?: string; items: readonly ArticleRelatedLink[] }>): string {
  if (items.length === 0) return "";
  for (const item of items) assertArticleHref(item.href);
  return [
    `<section aria-labelledby="${escapeArticleHtml(headingId)}" class="plain-publication__related">`,
    `<div class="plain-publication__section-heading"><h2 id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(heading)}</h2></div>`,
    '<div class="plain-publication__related-grid">',
    ...items.map((item) => `<a href="${escapeArticleHtml(item.href)}"><strong>${escapeArticleHtml(item.name)}</strong><span>${escapeArticleHtml(item.relationship)}</span></a>`),
    "</div></section>",
  ].join("");
}

/** The static equivalent of `ArticleIndex`. */
export function renderArticleIndexHtml({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  summary,
}: Readonly<{
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5;
  id?: string;
  items: readonly ArticleIndexItem[];
  summary?: string;
}>): string {
  if (![1, 2, 3, 4, 5].includes(headingLevel)) throw new RangeError("Article index heading level must be 1 to 5.");
  const hrefs = new Set<string>();
  for (const item of items) {
    assertArticleHref(item.href);
    assertArticleDates(item.updated === undefined ? { published: item.published } : { published: item.published, updated: item.updated });
    if (hrefs.has(item.href)) throw new RangeError(`Article index lists ${item.href} more than once.`);
    hrefs.add(item.href);
  }
  const heading1 = `h${headingLevel}`;
  const entry = `h${headingLevel + 1}`;
  return [
    `<section aria-labelledby="${escapeArticleHtml(headingId)}" class="${escapeArticleHtml(classes(ROOT_CLASS, "plain-publication__list", className))}" data-hraness-article-index=""${id === undefined ? "" : ` id="${escapeArticleHtml(id)}"`}>`,
    `<div class="plain-publication__section-heading"><${heading1} id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(heading)}</${heading1}>`,
    present(summary) ? `<p>${escapeArticleHtml(summary)}</p>` : "",
    "</div>",
    '<div class="plain-publication__article-list">',
    ...items.map((item) => [
      '<article class="plain-publication__entry">',
      present(item.eyebrow) ? `<p class="plain-publication__entry-label">${escapeArticleHtml(item.eyebrow)}</p>` : "",
      `<${entry} class="plain-publication__entry-title"><a href="${escapeArticleHtml(item.href)}">${escapeArticleHtml(item.title)}</a></${entry}>`,
      `<p class="plain-publication__entry-dek">${escapeArticleHtml(item.dek)}</p>`,
      '<p class="plain-publication__entry-meta">',
      dateHtml("Published", item.published),
      item.updated === undefined ? "" : SEPARATOR + dateHtml("Updated", item.updated),
      "</p></article>",
    ].join("")),
    "</div></section>",
  ].join("");
}
