import type { CSSProperties, ReactNode } from "react";
import {
  ARTICLE_BYLINE_PREFIX,
  ARTICLE_SOURCES_HEADING,
  ARTICLE_TOC_LABEL,
  articleProvenanceSentence,
  assertArticleAuthor,
  assertArticleCalloutTone,
  assertArticleDates,
  assertArticleHref,
  assertArticleVideo,
  formatArticleDate,
  orderedArticleVideoSources,
  type ArticleAuthor,
  type ArticleCalloutTone,
  type ArticleIndexItem,
  type ArticleIsoDate,
  type ArticleProvenanceRecord,
  type ArticleSourceItem,
  type ArticleTocItem,
  type ArticleVideoRecord,
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

/** What an article visual is, retained as machine-readable figure metadata. */
export const articleFigureKinds = ["illustration", "screenshot", "recording", "diagram", "chart", "table"] as const;
export type ArticleFigureKind = (typeof articleFigureKinds)[number];

function FigureCaption({ caption, credit }: Readonly<{ caption?: ReactNode; credit?: ReactNode }>) {
  if ((caption === undefined || caption === null || caption === false || caption === "")
    && (credit === undefined || credit === null || credit === false || credit === "")) return null;
  return (
    <figcaption className="plain-publication__figure-caption">
      {caption}
      {credit === undefined || credit === null || credit === "" ? null : <small className="plain-publication__figure-credit">{credit}</small>}
    </figcaption>
  );
}

/**
 * A figure with optional useful context and credit. Its children own their
 * accessible descriptions; use `label` for a composite visual without one.
 * `width="wide"` extends past the text measure on wide screens.
 */
export function ArticleFigure({
  caption,
  children,
  className,
  credit,
  id,
  kind,
  label,
  width = "text",
}: Readonly<{
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
  credit?: ReactNode;
  id?: string;
  kind: ArticleFigureKind;
  label?: string;
  width?: "text" | "wide";
}>) {
  if (!articleFigureKinds.includes(kind)) throw new RangeError(`Unknown article figure kind: ${String(kind)}.`);
  return (
    <figure aria-label={label} className={joinClasses("plain-publication__figure", className)} data-figure-kind={kind} data-width={width} id={id}>
      <div className="plain-publication__figure-body">{children}</div>
      <FigureCaption caption={caption} credit={credit} />
    </figure>
  );
}

/**
 * A captioned article recording with WebM and MP4 sources, a poster, and a
 * captions track. It never autoplays. Pair it with `articleVideoJsonLd()` in
 * the page's JSON-LD.
 */
export function ArticleVideo({
  caption,
  className,
  credit,
  id,
  video,
  width = "text",
}: Readonly<{
  caption: ReactNode;
  className?: string;
  credit?: ReactNode;
  id?: string;
  video: ArticleVideoRecord;
  width?: "text" | "wide";
}>) {
  assertArticleVideo(video);
  return (
    <ArticleFigure caption={caption} className={joinClasses("plain-publication__video", className)} credit={credit} kind="recording" width={width} {...(id === undefined ? {} : { id })}>
      <video
        aria-label={video.name}
        controls
        height={video.height}
        playsInline
        poster={video.poster}
        preload="metadata"
        width={video.width}
      >
        {orderedArticleVideoSources(video).map((source) => <source key={source.type} src={source.src} type={source.type} />)}
        <track default kind="captions" label="Captions" src={video.captions} srcLang={video.captionsLanguage ?? "en"} />
      </video>
    </ArticleFigure>
  );
}

export interface ArticleTableColumn {
  readonly label: string;
  /** Right-aligns the column with tabular figures. */
  readonly numeric?: boolean;
}

/**
 * A captioned data table. The first column heads each row, and the table
 * scrolls inside the measure on narrow screens instead of widening the page.
 */
export function ArticleTable({
  caption,
  className,
  columns,
  id,
  note,
  rows,
}: Readonly<{
  caption: string;
  className?: string;
  columns: readonly ArticleTableColumn[];
  id?: string;
  /** Scope or source of the numbers, under the table. */
  note?: ReactNode;
  rows: readonly (readonly ReactNode[])[];
}>) {
  if (columns.length === 0) throw new RangeError("Article table needs at least one column.");
  if (caption.trim() === "") throw new RangeError("Article table needs a caption.");
  for (const row of rows) if (row.length !== columns.length) throw new RangeError("Article table rows must match the column count.");
  return (
    <figure className={joinClasses("plain-publication__figure plain-publication__data-table", className)} data-figure-kind="table" id={id}>
      <div className="plain-publication__table-scroll" role="region" aria-label={caption} tabIndex={0}>
        <table className="plain-publication__table">
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column, index) => <th data-numeric={column.numeric === true ? "" : undefined} key={index} scope="col">{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => cellIndex === 0
                  ? <th key={cellIndex} scope="row">{cell}</th>
                  : <td data-numeric={columns[cellIndex]?.numeric === true ? "" : undefined} key={cellIndex}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note === undefined || note === null ? null : <p className="plain-publication__figure-note">{note}</p>}
    </figure>
  );
}

export type ArticleBarDatum = Readonly<{
  label: string;
  value: number;
  /** The value as readers see it, such as "1.2 s" or "38%". Take it from the facts module. */
  display: string;
  /** Draws this bar in the accent color. */
  highlight?: boolean;
}>;

/**
 * A horizontal bar chart drawn with CSS: no script, no canvas, and every value
 * written out, so it reads the same to screen readers and in forced colors.
 * Bars scale to `max` or the largest value.
 */
export function ArticleBarChart({
  caption,
  className,
  credit,
  data,
  id,
  max,
}: Readonly<{
  caption: ReactNode;
  className?: string;
  credit?: ReactNode;
  data: readonly ArticleBarDatum[];
  id?: string;
  max?: number;
}>) {
  if (data.length === 0) throw new RangeError("Article bar chart needs at least one bar.");
  for (const datum of data) {
    if (!Number.isFinite(datum.value) || datum.value < 0) throw new RangeError(`Article bar chart value for ${JSON.stringify(datum.label)} must be a finite number of at least 0.`);
    if (datum.display.trim() === "" || datum.label.trim() === "") throw new RangeError("Article bar chart bars need a label and a display value.");
  }
  const ceiling = max ?? Math.max(...data.map((datum) => datum.value));
  if (!Number.isFinite(ceiling) || ceiling <= 0) throw new RangeError("Article bar chart max must be greater than 0.");
  for (const datum of data) if (datum.value > ceiling) throw new RangeError(`Article bar chart value for ${JSON.stringify(datum.label)} exceeds max.`);
  return (
    <ArticleFigure caption={caption} className={joinClasses("plain-publication__bar-chart", className)} credit={credit} kind="chart" {...(id === undefined ? {} : { id })}>
      <dl className="plain-publication__bars">
        {data.map((datum) => (
          <div className="plain-publication__bar" data-highlight={datum.highlight === true ? "" : undefined} key={datum.label}>
            <dt>{datum.label}</dt>
            <dd>
              <span aria-hidden="true" className="plain-publication__bar-track">
                <span className="plain-publication__bar-fill" style={{ "--plain-bar": `${Math.round((datum.value / ceiling) * 10000) / 100}%` } as CSSProperties} />
              </span>
              <span className="plain-publication__bar-value">{datum.display}</span>
            </dd>
          </div>
        ))}
      </dl>
    </ArticleFigure>
  );
}

/** A comparison cell: yes, no, partly, or a short note. */
export type ComparisonValue = boolean | "partial" | Readonly<{ text: string }>;

export type ComparisonRow = Readonly<{
  label: string;
  /** One value per option, in column order. */
  values: readonly ComparisonValue[];
  /** A footnote shown under the label. */
  note?: string;
}>;

const COMPARISON_TEXT = { yes: "Yes", no: "No", partial: "Partly" } as const;

function ComparisonGlyph({ kind }: Readonly<{ kind: "yes" | "no" | "partial" }>) {
  const path = kind === "yes" ? "M3.5 8.5l3 3 6-7" : kind === "no" ? "M4.5 4.5l7 7m0-7l-7 7" : "M4 8h8";
  return (
    <svg aria-hidden="true" className="plain-publication__comparison-glyph" focusable="false" height="16" viewBox="0 0 16 16" width="16">
      <path d={path} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
    </svg>
  );
}

function ComparisonCell({ value }: Readonly<{ value: ComparisonValue }>) {
  if (typeof value === "object") return <>{value.text}</>;
  const kind = value === true ? "yes" : value === false ? "no" : "partial";
  return (
    <span className="plain-publication__comparison-value" data-value={kind}>
      <ComparisonGlyph kind={kind} />
      <span>{COMPARISON_TEXT[kind]}</span>
    </span>
  );
}

/**
 * A feature comparison with check, cross, and partial icons. Each icon keeps
 * its word beside it, so meaning never rests on the glyph or its color.
 * Name options plainly; comparisons with named competitors belong on
 * comparison pages, not launch posts.
 */
export function ComparisonTable({
  caption,
  className,
  highlight,
  id,
  note,
  options,
  rows,
}: Readonly<{
  caption: string;
  className?: string;
  /** Index of the option column to emphasize. */
  highlight?: number;
  id?: string;
  note?: ReactNode;
  options: readonly string[];
  rows: readonly ComparisonRow[];
}>) {
  if (options.length === 0) throw new RangeError("Comparison table needs at least one option.");
  if (caption.trim() === "") throw new RangeError("Comparison table needs a caption.");
  if (highlight !== undefined && (!Number.isInteger(highlight) || highlight < 0 || highlight >= options.length)) {
    throw new RangeError("Comparison table highlight must be an option index.");
  }
  for (const row of rows) if (row.values.length !== options.length) throw new RangeError(`Comparison row ${JSON.stringify(row.label)} must have one value per option.`);
  return (
    <figure className={joinClasses("plain-publication__figure plain-publication__comparison", className)} data-figure-kind="table" id={id}>
      <div className="plain-publication__table-scroll" role="region" aria-label={caption} tabIndex={0}>
        <table className="plain-publication__table">
          <caption>{caption}</caption>
          <thead>
            <tr>
              <td />
              {options.map((option, index) => <th data-highlight={index === highlight ? "" : undefined} key={option} scope="col">{option}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">
                  {row.label}
                  {row.note === undefined || row.note === "" ? null : <small className="plain-publication__comparison-note">{row.note}</small>}
                </th>
                {row.values.map((value, index) => (
                  <td data-highlight={index === highlight ? "" : undefined} key={index}><ComparisonCell value={value} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note === undefined || note === null ? null : <p className="plain-publication__figure-note">{note}</p>}
    </figure>
  );
}
