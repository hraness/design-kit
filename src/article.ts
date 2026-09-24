/**
 * Framework-neutral article records shared by the React article components,
 * the static HTML renderer, and each site's editorial admission registry.
 *
 * Products own their article content and admission data. This module owns the
 * shared shapes, the admission rubric, deterministic date text, and the
 * provenance sentence so every host states drafting and review the same way.
 */

/** A calendar date written as `YYYY-MM-DD`. */
export type ArticleIsoDate = `${number}-${number}-${number}`;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/u;
const DAY_MS = 86_400_000;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Parse a real calendar date. Returns days since 1970-01-01 in UTC, or null. */
function isoDateDay(value: string): number | null {
  const match = ISO_DATE.exec(value);
  if (match === null) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return null;
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }
  return Math.round(time / DAY_MS);
}

export function isArticleIsoDate(value: unknown): value is ArticleIsoDate {
  return typeof value === "string" && isoDateDay(value) !== null;
}

function requireDay(value: string, label: string): number {
  const day = isoDateDay(value);
  if (day === null) throw new RangeError(`${label} must be a real calendar date written as YYYY-MM-DD.`);
  return day;
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function articleDaysBetween(from: ArticleIsoDate, to: ArticleIsoDate): number {
  return requireDay(to, "The end date") - requireDay(from, "The start date");
}

/** Deterministic English date text, such as "23 September 2026", independent of time zone and locale. */
export function formatArticleDate(value: ArticleIsoDate): string {
  requireDay(value, "An article date");
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export interface ArticleDates {
  readonly published: ArticleIsoDate;
  /** Omit unless the content changed after publication. */
  readonly updated?: ArticleIsoDate;
}

/** Reject impossible dates and an update that precedes publication. */
export function assertArticleDates(dates: ArticleDates): void {
  const published = requireDay(dates.published, "The published date");
  if (dates.updated === undefined) return;
  const updated = requireDay(dates.updated, "The updated date");
  if (updated < published) throw new RangeError("The updated date cannot precede the published date.");
}

/* ------------------------------------------------------------------------ */
/* Links, bylines, and provenance                                            */
/* ------------------------------------------------------------------------ */

const SAFE_HREF = /^(?:https?:\/\/|mailto:|\/(?!\/)|#|\.{1,2}\/|\?)/iu;

/** Accept web, mail, and relative links. Reject script, data, and protocol-relative URLs. */
function isSafeHref(href: string): boolean {
  return SAFE_HREF.test(href) && !/[\p{Cc}\s]/u.test(href);
}

/** Throw a RangeError unless `href` is a web, mail, or relative link. */
export function assertArticleHref(href: string): void {
  if (!isSafeHref(href)) {
    throw new RangeError(`Unsupported article link: ${JSON.stringify(href)}.`);
  }
}

export type ArticleTocItem = Readonly<{
  /** A fragment link to a heading in the article body. */
  href: `#${string}`;
  label: string;
}>;

export type ArticleSourceItem = Readonly<{
  title: string;
  href: string;
  publisher?: string;
  /** The date someone last opened the source and confirmed the cited claim. */
  checkedOn: ArticleIsoDate;
}>;

export type ArticleIndexItem = Readonly<{
  href: string;
  title: string;
  /** One concrete claim, as a complete sentence. */
  dek: string;
  published: ArticleIsoDate;
  updated?: ArticleIsoDate;
  /** A short category label, such as a series name. */
  eyebrow?: string;
}>;

export const articleCalloutTones = ["note", "limit", "warning"] as const;
export type ArticleCalloutTone = (typeof articleCalloutTones)[number];

export function assertArticleCalloutTone(tone: ArticleCalloutTone): void {
  if (!(articleCalloutTones as readonly string[]).includes(tone)) throw new RangeError("Unknown article callout tone.");
}

/** The byline text before the linked name. */
export const ARTICLE_BYLINE_PREFIX = "By";
export const ARTICLE_TOC_LABEL = "On this page";
export const ARTICLE_SOURCES_HEADING = "Sources";

export function assertArticleAuthor(author: ArticleAuthor): void {
  if (author.kind !== "organization" && author.kind !== "person") throw new RangeError("An article author is an organization or a person.");
  if (!nonBlank(author.name)) throw new RangeError("An article author needs a name.");
  if (author.href !== undefined) assertArticleHref(author.href);
}

export type ArticleAuthor = Readonly<{
  /** An organization byline such as "Hraness", or a person who wrote or adopted the post. */
  kind: "organization" | "person";
  name: string;
  href?: string;
}>;

export const articleReviewerTypes = ["author", "human-editor", "subject-expert", "ai"] as const;
export type ArticleReviewerType = (typeof articleReviewerTypes)[number];

export const articleDraftingKinds = ["ai-from-source", "ai", "ai-assisted", "author"] as const;
export type ArticleDraftingKind = (typeof articleDraftingKinds)[number];

export type ArticleReviewCredit = Readonly<{
  /** Who reviewed, by name. An AI reviewer names the model, for example "Claude Opus 5.5 (claude-opus-5-5) editorial review". */
  reviewer: string;
  reviewerType: ArticleReviewerType;
}>;

export type ArticleProvenanceRecord = Readonly<{
  drafting: ArticleDraftingKind;
  /** The review on record, or null when no review has happened yet. A null review makes no review claim. */
  review: ArticleReviewCredit | null;
}>;

const DRAFTING_PHRASES = {
  "ai-from-source": "Drafted with AI from the source code",
  ai: "Drafted with AI",
  "ai-assisted": "Written with AI assistance",
  author: "Written by the author",
} as const satisfies Record<ArticleDraftingKind, string>;

const REVIEWER_SUFFIXES = {
  ai: "",
  author: ", the author",
  "human-editor": ", a human editor",
  "subject-expert": ", a subject expert",
} as const satisfies Record<ArticleReviewerType, string>;

/** The word the provenance sentence reserves for human-editor reviews. */
const HUMAN_WORD = /human/iu;
/**
 * An AI reviewer's name must tell the reader it is AI, because the sentence
 * adds no suffix for it: "AI", "LLM", "model", or a model family name.
 */
const AI_WORD = /\b(?:ai|llm|model|claude|gpt|gemini|codex)\b/iu;

/** True when an AI reviewer's name says it is AI. */
export function articleReviewerNameDisclosesAi(reviewer: string): boolean {
  return AI_WORD.test(reviewer);
}

function isOneOf<const T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

function nonBlank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * The visible provenance note. For example: "Drafted with AI from the source
 * code and reviewed by Claude Opus 5.5 (claude-opus-5-5) editorial review."
 * The word "human" appears only for a human-editor review.
 */
export function articleProvenanceSentence(provenance: ArticleProvenanceRecord): string {
  if (!isOneOf(articleDraftingKinds, provenance.drafting)) throw new RangeError("Unknown article drafting kind.");
  const drafted = DRAFTING_PHRASES[provenance.drafting];
  const { review } = provenance;
  if (review === null) return `${drafted}. It has not been reviewed yet.`;
  if (!isOneOf(articleReviewerTypes, review.reviewerType)) throw new RangeError("Unknown article reviewer type.");
  if (!nonBlank(review.reviewer)) throw new RangeError("An article review must name its reviewer.");
  if (review.reviewerType !== "human-editor" && HUMAN_WORD.test(review.reviewer)) {
    throw new RangeError("Only a human-editor review may use the word \"human\" in its reviewer name.");
  }
  if (review.reviewerType === "ai" && !AI_WORD.test(review.reviewer)) {
    throw new RangeError("An AI review must name a reviewer that says it is AI, for example \"Claude Opus 5.5 (claude-opus-5-5) editorial review\".");
  }
  const reviewer = review.reviewer.trim().replace(/[.]+$/u, "");
  return `${drafted} and reviewed by ${reviewer}${REVIEWER_SUFFIXES[review.reviewerType]}.`;
}

/* ------------------------------------------------------------------------ */
/* Admission rubric                                                          */
/* ------------------------------------------------------------------------ */

export type ArticleScore = 0 | 1 | 2;

export const articleScoreKeys = [
  "readerUtility",
  "originalEvidence",
  "factualConfidence",
  "hostFit",
  "voiceIntegrity",
  "maintenanceValue",
] as const;
export type ArticleScoreKey = (typeof articleScoreKeys)[number];
export type ArticleScores = Readonly<Record<ArticleScoreKey, ArticleScore>>;

/** Minimum total of the six scores for an indexable article; any zero also fails. */
export const ARTICLE_ADMISSION_MINIMUM = 9;
/** Reassessment falls this many days after the review, inclusive. */
export const ARTICLE_REASSESS_WINDOW = { minimumDays: 28, maximumDays: 56 } as const;

export const articleLifecycles = ["quarantined", "indexable", "archived"] as const;
/**
 * `quarantined`: readable, noindex, and absent from sitemaps, feeds, llms.txt, and index lists.
 * `indexable`: passed admission and may enter every discovery surface.
 * `archived`: kept for existing links, noindex, and absent from discovery.
 */
export type ArticleLifecycle = (typeof articleLifecycles)[number];

export type ArticleReview = ArticleReviewCredit & Readonly<{ reviewedOn: ArticleIsoDate }>;
export type ArticleHumanReview = Readonly<{
  reviewer: string;
  reviewerType: Exclude<ArticleReviewerType, "ai">;
  reviewedOn: ArticleIsoDate;
}>;

export type ArticleSourceRecord = Readonly<{
  title: string;
  url: string;
  /** The date someone last opened the source and confirmed the cited claim. */
  checkedOn: ArticleIsoDate;
}>;

export type ArticleNearestUrl = Readonly<{
  url: string;
  /** Why this page stays separate from the neighbor, or why it should merge. */
  distinction: string;
}>;

export type ArticleAdmission = Readonly<{
  /** The canonical path or URL this record admits. */
  href: string;
  lifecycle: ArticleLifecycle;
  /** The question a reader arrives with, in their words. */
  readerJob: string;
  /** The answer a reader could not get from the obvious first result. */
  nonObviousAnswer: string;
  originalContribution: string;
  hostFit: string;
  /** Up to three closest pages, each with a keep-or-merge rationale. */
  nearestUrls: readonly ArticleNearestUrl[];
  sources: readonly ArticleSourceRecord[];
  /** Observations that are not paraphrases of the sources. Indexable records need two. */
  observations: readonly string[];
  scores: ArticleScores;
  owner: string;
  drafting: ArticleDraftingKind;
  /** The editorial review on record. Required before indexing. */
  review: ArticleReview | null;
  /** A separate human review. Stays null unless a person reviewed the page. */
  humanReview: ArticleHumanReview | null;
  reassessOn: ArticleIsoDate;
  harmIfWrong: string;
  /** Events that force a refresh, such as a release tag bump, a relation change, or a rename. */
  refreshTriggers: readonly string[];
}>;

export function articleAdmissionScore(scores: ArticleScores): number {
  return articleScoreKeys.reduce((total, key) => total + scores[key], 0);
}

/** True when the six scores total at least nine and none is zero. */
export function articleAdmissionPasses(scores: ArticleScores): boolean {
  return articleScoreKeys.every((key) => scores[key] > 0)
    && articleAdmissionScore(scores) >= ARTICLE_ADMISSION_MINIMUM;
}

export function isArticleIndexable(admission: Pick<ArticleAdmission, "lifecycle">): boolean {
  return admission.lifecycle === "indexable";
}

/** The provenance a page renders, derived from its admission record. */
export function articleProvenanceFromAdmission(
  admission: Pick<ArticleAdmission, "drafting" | "review">,
): ArticleProvenanceRecord {
  return {
    drafting: admission.drafting,
    review: admission.review === null
      ? null
      : { reviewer: admission.review.reviewer, reviewerType: admission.review.reviewerType },
  };
}

/** Records whose reassessment date is on or before `today`. */
export function articleAdmissionsDue(
  admissions: readonly ArticleAdmission[],
  today: ArticleIsoDate,
): readonly ArticleAdmission[] {
  const day = requireDay(today, "Today");
  return admissions.filter((admission) => admission.lifecycle !== "archived"
    && requireDay(admission.reassessOn, "reassessOn") <= day);
}

export class ArticleAdmissionError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Article admission failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
    this.name = "ArticleAdmissionError";
    this.issues = issues;
  }
}

type Issues = string[];

function record(value: unknown): Readonly<Record<string, unknown>> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : null;
}

function text(issues: Issues, where: string, value: unknown, field: string): string {
  if (!nonBlank(value)) {
    issues.push(`${where}: ${field} must be nonblank text.`);
    return "";
  }
  return value;
}

function date(issues: Issues, where: string, value: unknown, field: string): ArticleIsoDate | null {
  if (!isArticleIsoDate(value)) {
    issues.push(`${where}: ${field} must be a real calendar date written as YYYY-MM-DD.`);
    return null;
  }
  return value;
}

function list(issues: Issues, where: string, value: unknown, field: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    issues.push(`${where}: ${field} must be a list.`);
    return [];
  }
  return value;
}

function parseReview(issues: Issues, where: string, value: unknown, field: string): ArticleReview | null {
  if (value === null) return null;
  const review = record(value);
  if (review === null) {
    issues.push(`${where}: ${field} must be a review record or null.`);
    return null;
  }
  const reviewer = text(issues, where, review.reviewer, `${field}.reviewer`);
  if (!isOneOf(articleReviewerTypes, review.reviewerType)) {
    issues.push(`${where}: ${field}.reviewerType must be one of ${articleReviewerTypes.join(", ")}.`);
  }
  const reviewedOn = date(issues, where, review.reviewedOn, `${field}.reviewedOn`);
  if (!isOneOf(articleReviewerTypes, review.reviewerType) || reviewedOn === null) return null;
  if (review.reviewerType !== "human-editor" && HUMAN_WORD.test(reviewer)) {
    issues.push(`${where}: ${field}.reviewer may use the word "human" only when reviewerType is human-editor.`);
  }
  if (review.reviewerType === "ai" && !AI_WORD.test(reviewer)) {
    issues.push(`${where}: ${field}.reviewer must say it is AI when reviewerType is ai, for example by naming the model.`);
  }
  return { reviewer, reviewerType: review.reviewerType, reviewedOn };
}

function parseScores(issues: Issues, where: string, value: unknown): ArticleScores | null {
  const scores = record(value);
  if (scores === null) {
    issues.push(`${where}: scores must be a record of six 0-2 scores.`);
    return null;
  }
  const extra = Object.keys(scores).filter((key) => !isOneOf(articleScoreKeys, key));
  if (extra.length > 0) issues.push(`${where}: unknown score ${extra.sort().join(", ")}.`);
  let complete = true;
  for (const key of articleScoreKeys) {
    const score = scores[key];
    if (score !== 0 && score !== 1 && score !== 2) {
      issues.push(`${where}: scores.${key} must be 0, 1, or 2.`);
      complete = false;
    }
  }
  return complete ? scores as ArticleScores : null;
}

/**
 * Parse one admission record from untrusted data. Collects every problem
 * into `issues` and returns the typed record only when the shape is complete.
 */
function parseArticleAdmission(value: unknown, index: number, issues: Issues): ArticleAdmission | null {
  const start = issues.length;
  const input = record(value);
  if (input === null) {
    issues.push(`admission ${index}: must be a record.`);
    return null;
  }
  const where = nonBlank(input.href) ? input.href : `admission ${index}`;
  const href = text(issues, where, input.href, "href");
  if (!isOneOf(articleLifecycles, input.lifecycle)) {
    issues.push(`${where}: lifecycle must be one of ${articleLifecycles.join(", ")}.`);
  }
  const lifecycle = input.lifecycle as ArticleLifecycle;
  const readerJob = text(issues, where, input.readerJob, "readerJob");
  const nonObviousAnswer = text(issues, where, input.nonObviousAnswer, "nonObviousAnswer");
  const originalContribution = text(issues, where, input.originalContribution, "originalContribution");
  const hostFit = text(issues, where, input.hostFit, "hostFit");
  const owner = text(issues, where, input.owner, "owner");
  const harmIfWrong = text(issues, where, input.harmIfWrong, "harmIfWrong");
  if (!isOneOf(articleDraftingKinds, input.drafting)) {
    issues.push(`${where}: drafting must be one of ${articleDraftingKinds.join(", ")}.`);
  }
  const drafting = input.drafting as ArticleDraftingKind;

  const nearestUrls = list(issues, where, input.nearestUrls, "nearestUrls").map((item, position) => {
    const neighbor = record(item);
    if (neighbor === null) {
      issues.push(`${where}: nearestUrls[${position}] must be a record.`);
      return { url: "", distinction: "" };
    }
    return {
      url: text(issues, where, neighbor.url, `nearestUrls[${position}].url`),
      distinction: text(issues, where, neighbor.distinction, `nearestUrls[${position}].distinction`),
    };
  });
  if (nearestUrls.length > 3) issues.push(`${where}: nearestUrls lists at most three pages.`);

  const sources = list(issues, where, input.sources, "sources").map((item, position) => {
    const source = record(item);
    if (source === null) {
      issues.push(`${where}: sources[${position}] must be a record.`);
      return null;
    }
    const checkedOn = date(issues, where, source.checkedOn, `sources[${position}].checkedOn`);
    const url = text(issues, where, source.url, `sources[${position}].url`);
    if (url !== "" && !isSafeHref(url)) issues.push(`${where}: sources[${position}].url must be a web, mail, or relative link.`);
    return {
      title: text(issues, where, source.title, `sources[${position}].title`),
      url,
      checkedOn: checkedOn ?? "0000-00-00" as ArticleIsoDate,
    };
  }).filter((source) => source !== null);

  const observations = list(issues, where, input.observations, "observations").map((item, position) => (
    text(issues, where, item, `observations[${position}]`)
  ));
  const refreshTriggers = list(issues, where, input.refreshTriggers, "refreshTriggers").map((item, position) => (
    text(issues, where, item, `refreshTriggers[${position}]`)
  ));
  const scores = parseScores(issues, where, input.scores);
  const review = parseReview(issues, where, input.review, "review");
  const humanReviewValue = parseReview(issues, where, input.humanReview, "humanReview");
  if (humanReviewValue !== null && humanReviewValue.reviewerType === "ai") {
    issues.push(`${where}: humanReview cannot record an AI reviewer; keep AI review in review.`);
  }
  const reassessOn = date(issues, where, input.reassessOn, "reassessOn");

  if (issues.length > start || scores === null || reassessOn === null) return null;
  return {
    href,
    lifecycle,
    readerJob,
    nonObviousAnswer,
    originalContribution,
    hostFit,
    nearestUrls,
    sources,
    observations,
    scores,
    owner,
    drafting,
    review,
    humanReview: humanReviewValue as ArticleHumanReview | null,
    reassessOn,
    harmIfWrong,
    refreshTriggers,
  };
}

/** Rules that depend on dates and lifecycle, applied to a well-formed record. */
function admissionRuleIssues(admission: ArticleAdmission): string[] {
  const issues: string[] = [];
  const where = admission.href;
  const { review, humanReview } = admission;
  if (review !== null) {
    const days = articleDaysBetween(review.reviewedOn, admission.reassessOn);
    if (days < ARTICLE_REASSESS_WINDOW.minimumDays || days > ARTICLE_REASSESS_WINDOW.maximumDays) {
      issues.push(
        `${where}: reassessOn must fall ${ARTICLE_REASSESS_WINDOW.minimumDays} to ${ARTICLE_REASSESS_WINDOW.maximumDays} days after review.reviewedOn (found ${days}).`,
      );
    }
    for (const source of admission.sources) {
      if (articleDaysBetween(source.checkedOn, review.reviewedOn) < 0) {
        issues.push(`${where}: source "${source.title}" was checked after the review; review it again.`);
      }
    }
  }
  if (humanReview !== null && review === null) {
    issues.push(`${where}: record the editorial review in review before adding humanReview.`);
  }
  if (admission.lifecycle === "indexable") {
    if (!articleAdmissionPasses(admission.scores)) {
      issues.push(
        `${where}: indexable articles need a score of at least ${ARTICLE_ADMISSION_MINIMUM}/12 with no zero (found ${articleAdmissionScore(admission.scores)}).`,
      );
    }
    if (review === null) issues.push(`${where}: indexable articles need a review with reviewer, reviewerType, and reviewedOn.`);
    else if (review.reviewerType === "author") issues.push(`${where}: indexable articles need an independent review; the author cannot admit their own post.`);
    if (admission.sources.length === 0) issues.push(`${where}: indexable articles need at least one source with a check date.`);
    if (admission.observations.length < 2) issues.push(`${where}: indexable articles need two observations that are not paraphrases of the sources.`);
    if (admission.refreshTriggers.length === 0) issues.push(`${where}: indexable articles need at least one refresh trigger.`);
  }
  return issues;
}

/**
 * Validate a site's whole admission registry from untrusted data. Hrefs must
 * be unique, every record must be complete, and each indexable record must
 * pass the rubric: six 0-2 scores totalling at least nine with no zero, a
 * reviewer identity and type, sources with check dates, and a reassessment
 * date 28 to 56 days after review. Throws one error listing every problem.
 */
export function assertArticleAdmissions(value: unknown): asserts value is readonly ArticleAdmission[] {
  const issues: string[] = [];
  if (!Array.isArray(value)) throw new ArticleAdmissionError(["The admission registry must be a list."]);
  const seen = new Set<string>();
  value.forEach((item: unknown, index) => {
    const admission = parseArticleAdmission(item, index, issues);
    if (admission === null) return;
    if (seen.has(admission.href)) issues.push(`${admission.href}: appears more than once.`);
    seen.add(admission.href);
    issues.push(...admissionRuleIssues(admission));
  });
  if (issues.length > 0) throw new ArticleAdmissionError(issues);
}

/** Validate and return the typed registry. */
export function parseArticleAdmissions(value: unknown): readonly ArticleAdmission[] {
  assertArticleAdmissions(value);
  return value;
}
