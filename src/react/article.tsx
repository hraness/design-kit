import type { ReactNode } from "react";
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
} from "../article.js";
import {
  MarketingRelated,
  type MarketingHeadingLevel,
  type MarketingRelatedGroup,
  type MarketingRelatedProduct,
} from "./product-marketing.js";

/*
 * Server-safe article compositions. Every element uses the plain-publication
 * BEM hooks, so the React components and the static HTML renderer in the
 * framework-neutral root produce the same markup and share one stylesheet:
 * plain-publication.css (also included in styles.css).
 */

const ROOT_CLASS = "plain-site plain-publication plain-publication--embedded";

const HEADING_TAGS = { 1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const;

function joinClasses(...values: readonly (string | undefined)[]): string {
  return values.filter((value) => value !== undefined && value !== "").join(" ");
}

function ArticleDate({ label, value }: Readonly<{ label: string; value: ArticleIsoDate }>) {
  return <>{label} <time dateTime={value}>{formatArticleDate(value)}</time></>;
}

function Separator() {
  return <span aria-hidden="true"> · </span>;
}

/** An organization or person byline. The name links with rel="author" when `href` is given. */
export function ArticleByline({ author }: Readonly<{ author: ArticleAuthor }>) {
  assertArticleAuthor(author);
  return (
    <span className="plain-publication__byline" data-author-kind={author.kind}>
      {ARTICLE_BYLINE_PREFIX}{" "}
      {author.href === undefined ? author.name : <a href={author.href} rel="author">{author.name}</a>}
    </span>
  );
}

/**
 * The visible drafting and review note, for example "Drafted with AI from the
 * source code and reviewed by Claude Opus 5.5 (claude-opus-5-5) editorial
 * review." A null review states that no review has happened.
 */
export function ArticleProvenance({ provenance }: Readonly<{ provenance: ArticleProvenanceRecord }>) {
  const sentence = articleProvenanceSentence(provenance);
  return (
    <p
      className="plain-publication__provenance"
      data-drafting={provenance.drafting}
      data-reviewer-type={provenance.review?.reviewerType ?? "none"}
    >
      {sentence}
    </p>
  );
}

export interface MarketingArticleProps {
  readonly after?: ReactNode;
  readonly author?: ArticleAuthor;
  readonly children: ReactNode;
  readonly className?: string;
  /** One concrete claim, as a complete sentence. */
  readonly dek?: string;
  readonly eyebrow?: string;
  readonly heading: string;
  readonly headingId?: string;
  readonly id?: string;
  /** Required so every article decides its drafting note. Pass null only for writing with no AI involvement and no review record. */
  readonly provenance: ArticleProvenanceRecord | null;
  readonly published: ArticleIsoDate;
  readonly toc?: readonly ArticleTocItem[];
  readonly tocLabel?: string;
  readonly updated?: ArticleIsoDate;
}

/**
 * Long-form article: eyebrow, title, dek, byline with published and updated
 * dates, provenance note, an optional contents list that becomes a side
 * column on wide screens, the body, and an optional footer slot for sources
 * and related products.
 */
export function MarketingArticle({
  after,
  author,
  children,
  className,
  dek,
  eyebrow,
  heading,
  headingId = "article-title",
  id,
  provenance,
  published,
  toc,
  tocLabel = ARTICLE_TOC_LABEL,
  updated,
}: Readonly<MarketingArticleProps>) {
  assertArticleDates(updated === undefined ? { published } : { published, updated });
  const tocItems = toc ?? [];
  for (const item of tocItems) {
    if (!item.href.startsWith("#") || item.href.length < 2) throw new RangeError("Contents links must point to a heading in this article.");
  }
  const tocId = `${headingId}-contents`;
  return (
    <article
      aria-labelledby={headingId}
      className={joinClasses(ROOT_CLASS, "plain-publication__article", className)}
      data-hraness-article=""
      data-toc={tocItems.length > 0 ? "aside" : "none"}
      id={id}
    >
      <header className="plain-publication__article-header">
        {eyebrow === undefined || eyebrow === "" ? null : <p className="plain-publication__eyebrow">{eyebrow}</p>}
        <h1 id={headingId}>{heading}</h1>
        {dek === undefined || dek === "" ? null : <p className="plain-publication__article-dek">{dek}</p>}
        <p className="plain-publication__article-meta">
          {author === undefined ? null : <><ArticleByline author={author} /><Separator /></>}
          <ArticleDate label="Published" value={published} />
          {updated === undefined ? null : <><Separator /><ArticleDate label="Updated" value={updated} /></>}
        </p>
        {provenance === null ? null : <ArticleProvenance provenance={provenance} />}
      </header>
      <div className="plain-publication__article-layout">
        {tocItems.length === 0 ? null : (
          <nav aria-labelledby={tocId} className="plain-publication__toc">
            <p id={tocId}>{tocLabel}</p>
            <ol>
              {tocItems.map((item) => <li key={item.href}><a href={item.href}>{item.label}</a></li>)}
            </ol>
          </nav>
        )}
        <div className="plain-publication__article-body">{children}</div>
      </div>
      {after === undefined || after === null ? null : <footer className="plain-publication__article-footer">{after}</footer>}
    </article>
  );
}

/** Numbered primary sources, each with the date its claim was last checked. */
export function ArticleSources({
  heading = ARTICLE_SOURCES_HEADING,
  headingId = "article-sources",
  sources,
}: Readonly<{
  heading?: string;
  headingId?: string;
  sources: readonly ArticleSourceItem[];
}>) {
  if (sources.length === 0) return null;
  for (const source of sources) assertArticleHref(source.href);
  return (
    <section aria-labelledby={headingId} className="plain-publication__sources">
      <h2 id={headingId}>{heading}</h2>
      <ol>
        {sources.map((source) => (
          <li key={`${source.href}-${source.title}`}>
            <a href={source.href}>{source.title}</a>
            <span>
              {source.publisher === undefined || source.publisher === "" ? null : <>{source.publisher}<Separator /></>}
              <ArticleDate label="Checked" value={source.checkedOn} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** A note, limit, or warning inside the article body. String children become one paragraph. */
export function ArticleCallout({
  children,
  label,
  tone = "note",
}: Readonly<{
  children: ReactNode;
  label?: string;
  tone?: ArticleCalloutTone;
}>) {
  assertArticleCalloutTone(tone);
  return (
    <div className="plain-publication__callout" data-tone={tone} role="note">
      {label === undefined || label === "" ? null : <strong>{label}</strong>}
      {typeof children === "string" ? <p>{children}</p> : children}
    </div>
  );
}

type ArticleRelatedBody =
  | Readonly<{ groups: readonly MarketingRelatedGroup[]; items?: undefined }>
  | Readonly<{ groups?: undefined; items: readonly MarketingRelatedProduct[] }>;

/**
 * Sibling products at the end of an article, rendered by MarketingRelated.
 * Pass items from the registered relations for this article only.
 */
export function ArticleRelatedProducts({
  heading = "Related products",
  headingId = "article-related-products",
  headingLevel = 2,
  label,
  summary,
  ...body
}: Readonly<{
  heading?: string;
  headingId?: string;
  headingLevel?: MarketingHeadingLevel;
  label?: string;
  summary?: string;
}> & ArticleRelatedBody) {
  const optional = {
    ...(label === undefined ? {} : { label }),
    ...(summary === undefined ? {} : { summary }),
  };
  return (
    <div className="plain-publication__related-products">
      {body.groups === undefined
        ? <MarketingRelated heading={heading} headingId={headingId} headingLevel={headingLevel} items={body.items} {...optional} />
        : <MarketingRelated groups={body.groups} heading={heading} headingId={headingId} headingLevel={headingLevel} {...optional} />}
    </div>
  );
}

/** A list of posts, newest first as given, each with its title, dek, and dates. */
export function ArticleIndex({
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
}>) {
  if (![1, 2, 3, 4, 5].includes(headingLevel)) throw new RangeError("Article index heading level must be 1 to 5.");
  const hrefs = new Set<string>();
  for (const item of items) {
    assertArticleHref(item.href);
    assertArticleDates(item.updated === undefined ? { published: item.published } : { published: item.published, updated: item.updated });
    if (hrefs.has(item.href)) throw new RangeError(`Article index lists ${item.href} more than once.`);
    hrefs.add(item.href);
  }
  const HeadingTag = HEADING_TAGS[headingLevel];
  const EntryTag = HEADING_TAGS[(headingLevel + 1) as 2 | 3 | 4 | 5 | 6];
  return (
    <section
      aria-labelledby={headingId}
      className={joinClasses(ROOT_CLASS, "plain-publication__list", className)}
      data-hraness-article-index=""
      id={id}
    >
      <div className="plain-publication__section-heading">
        <HeadingTag id={headingId}>{heading}</HeadingTag>
        {summary === undefined || summary === "" ? null : <p>{summary}</p>}
      </div>
      <div className="plain-publication__article-list">
        {items.map((item) => (
          <article className="plain-publication__entry" key={item.href}>
            {item.eyebrow === undefined || item.eyebrow === "" ? null : <p className="plain-publication__entry-label">{item.eyebrow}</p>}
            <EntryTag className="plain-publication__entry-title"><a href={item.href}>{item.title}</a></EntryTag>
            <p className="plain-publication__entry-dek">{item.dek}</p>
            <p className="plain-publication__entry-meta">
              <ArticleDate label="Published" value={item.published} />
              {item.updated === undefined ? null : <><Separator /><ArticleDate label="Updated" value={item.updated} /></>}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
