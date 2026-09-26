// src/article.ts
var ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/u;
var DAY_MS = 86400000;
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function isoDateDay(value) {
  const match = ISO_DATE.exec(value);
  if (match === null)
    return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1)
    return null;
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return Math.round(time / DAY_MS);
}
function isArticleIsoDate(value) {
  return typeof value === "string" && isoDateDay(value) !== null;
}
function requireDay(value, label) {
  const day = isoDateDay(value);
  if (day === null)
    throw new RangeError(`${label} must be a real calendar date written as YYYY-MM-DD.`);
  return day;
}
function articleDaysBetween(from, to) {
  return requireDay(to, "The end date") - requireDay(from, "The start date");
}
function formatArticleDate(value) {
  requireDay(value, "An article date");
  const [year, month, day] = value.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
function assertArticleDates(dates) {
  const published = requireDay(dates.published, "The published date");
  if (dates.updated === undefined)
    return;
  const updated = requireDay(dates.updated, "The updated date");
  if (updated < published)
    throw new RangeError("The updated date cannot precede the published date.");
}
var SAFE_HREF = /^(?:https?:\/\/|mailto:|\/(?![/\\])|#|\.{1,2}\/|\?)/iu;
function hasControlOrSpace(href) {
  for (const character of href) {
    const code = character.codePointAt(0) ?? 0;
    if (code <= 31 || code >= 127 && code <= 159 || /\s/u.test(character))
      return true;
  }
  return false;
}
function isSafeHref(href) {
  return SAFE_HREF.test(href) && !hasControlOrSpace(href);
}
function assertArticleHref(href) {
  if (!isSafeHref(href)) {
    throw new RangeError(`Unsupported article link: ${JSON.stringify(href)}.`);
  }
}
var articleCalloutTones = ["note", "limit", "warning"];
function assertArticleCalloutTone(tone) {
  if (!articleCalloutTones.includes(tone))
    throw new RangeError("Unknown article callout tone.");
}
var ARTICLE_BYLINE_PREFIX = "By";
var ARTICLE_TOC_LABEL = "On this page";
var ARTICLE_SOURCES_HEADING = "Sources";
function assertArticleAuthor(author) {
  if (author.kind !== "organization" && author.kind !== "person")
    throw new RangeError("An article author is an organization or a person.");
  if (!nonBlank(author.name))
    throw new RangeError("An article author needs a name.");
  if (author.href !== undefined)
    assertArticleHref(author.href);
}
var articleReviewerTypes = ["author", "human-editor", "subject-expert", "ai"];
var articleDraftingKinds = ["ai-from-source", "ai", "ai-assisted", "author"];
var DRAFTING_PHRASES = {
  "ai-from-source": "Drafted with AI from the source code",
  ai: "Drafted with AI",
  "ai-assisted": "Written with AI assistance",
  author: "Written by the author"
};
var REVIEWER_SUFFIXES = {
  ai: "",
  author: ", the author",
  "human-editor": ", a human editor",
  "subject-expert": ", a subject expert"
};
var HUMAN_WORD = /human/iu;
var AI_WORD = /\b(?:ai|llm|model|claude|gpt|gemini|codex)\b/iu;
function articleReviewerNameDisclosesAi(reviewer) {
  return AI_WORD.test(reviewer);
}
function isOneOf(values, value) {
  return typeof value === "string" && values.includes(value);
}
function withoutTrailingPeriods(value) {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 46)
    end -= 1;
  return value.slice(0, end);
}
function nonBlank(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function articleProvenanceSentence(provenance) {
  if (!isOneOf(articleDraftingKinds, provenance.drafting))
    throw new RangeError("Unknown article drafting kind.");
  const drafted = DRAFTING_PHRASES[provenance.drafting];
  const {
    review
  } = provenance;
  if (review === null)
    return `${drafted}. It has not been reviewed yet.`;
  if (!isOneOf(articleReviewerTypes, review.reviewerType))
    throw new RangeError("Unknown article reviewer type.");
  if (!nonBlank(review.reviewer))
    throw new RangeError("An article review must name its reviewer.");
  if (review.reviewerType !== "human-editor" && HUMAN_WORD.test(review.reviewer)) {
    throw new RangeError('Only a human-editor review may use the word "human" in its reviewer name.');
  }
  if (review.reviewerType === "ai" && !AI_WORD.test(review.reviewer)) {
    throw new RangeError('An AI review must name a reviewer that says it is AI, for example "Claude Opus 5.5 (claude-opus-5-5) editorial review".');
  }
  const reviewer = withoutTrailingPeriods(review.reviewer.trim());
  return `${drafted} and reviewed by ${reviewer}${REVIEWER_SUFFIXES[review.reviewerType]}.`;
}
var articleScoreKeys = ["readerUtility", "originalEvidence", "factualConfidence", "hostFit", "voiceIntegrity", "maintenanceValue"];
var ARTICLE_ADMISSION_MINIMUM = 9;
var ARTICLE_REASSESS_WINDOW = {
  minimumDays: 28,
  maximumDays: 56
};
var articleLifecycles = ["quarantined", "indexable", "archived"];
function articleAdmissionScore(scores) {
  return articleScoreKeys.reduce((total, key) => total + scores[key], 0);
}
function articleAdmissionPasses(scores) {
  return articleScoreKeys.every((key) => scores[key] > 0) && articleAdmissionScore(scores) >= ARTICLE_ADMISSION_MINIMUM;
}
function isArticleIndexable(admission) {
  return admission.lifecycle === "indexable";
}
function articleProvenanceFromAdmission(admission) {
  return {
    drafting: admission.drafting,
    review: admission.review === null ? null : {
      reviewer: admission.review.reviewer,
      reviewerType: admission.review.reviewerType
    }
  };
}
function articleAdmissionsDue(admissions, today) {
  const day = requireDay(today, "Today");
  return admissions.filter((admission) => admission.lifecycle !== "archived" && requireDay(admission.reassessOn, "reassessOn") <= day);
}

class ArticleAdmissionError extends Error {
  issues;
  constructor(issues) {
    super(`Article admission failed:
${issues.map((issue) => `- ${issue}`).join(`
`)}`);
    this.name = "ArticleAdmissionError";
    this.issues = issues;
  }
}
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
}
function text(issues, where, value, field) {
  if (!nonBlank(value)) {
    issues.push(`${where}: ${field} must be nonblank text.`);
    return "";
  }
  return value;
}
function date(issues, where, value, field) {
  if (!isArticleIsoDate(value)) {
    issues.push(`${where}: ${field} must be a real calendar date written as YYYY-MM-DD.`);
    return null;
  }
  return value;
}
function list(issues, where, value, field) {
  if (!Array.isArray(value)) {
    issues.push(`${where}: ${field} must be a list.`);
    return [];
  }
  return value;
}
function parseReview(issues, where, value, field) {
  if (value === null)
    return null;
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
  if (!isOneOf(articleReviewerTypes, review.reviewerType) || reviewedOn === null)
    return null;
  if (review.reviewerType !== "human-editor" && HUMAN_WORD.test(reviewer)) {
    issues.push(`${where}: ${field}.reviewer may use the word "human" only when reviewerType is human-editor.`);
  }
  if (review.reviewerType === "ai" && !AI_WORD.test(reviewer)) {
    issues.push(`${where}: ${field}.reviewer must say it is AI when reviewerType is ai, for example by naming the model.`);
  }
  return {
    reviewer,
    reviewerType: review.reviewerType,
    reviewedOn
  };
}
function parseScores(issues, where, value) {
  const scores = record(value);
  if (scores === null) {
    issues.push(`${where}: scores must be a record of six 0-2 scores.`);
    return null;
  }
  const extra = Object.keys(scores).filter((key) => !isOneOf(articleScoreKeys, key));
  if (extra.length > 0)
    issues.push(`${where}: unknown score ${extra.sort().join(", ")}.`);
  let complete = true;
  for (const key of articleScoreKeys) {
    const score = scores[key];
    if (score !== 0 && score !== 1 && score !== 2) {
      issues.push(`${where}: scores.${key} must be 0, 1, or 2.`);
      complete = false;
    }
  }
  return complete ? scores : null;
}
function parseArticleAdmission(value, index, issues) {
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
  const lifecycle = input.lifecycle;
  const readerJob = text(issues, where, input.readerJob, "readerJob");
  const nonObviousAnswer = text(issues, where, input.nonObviousAnswer, "nonObviousAnswer");
  const originalContribution = text(issues, where, input.originalContribution, "originalContribution");
  const hostFit = text(issues, where, input.hostFit, "hostFit");
  const owner = text(issues, where, input.owner, "owner");
  const harmIfWrong = text(issues, where, input.harmIfWrong, "harmIfWrong");
  if (!isOneOf(articleDraftingKinds, input.drafting)) {
    issues.push(`${where}: drafting must be one of ${articleDraftingKinds.join(", ")}.`);
  }
  const drafting = input.drafting;
  const nearestUrls = list(issues, where, input.nearestUrls, "nearestUrls").map((item, position) => {
    const neighbor = record(item);
    if (neighbor === null) {
      issues.push(`${where}: nearestUrls[${position}] must be a record.`);
      return {
        url: "",
        distinction: ""
      };
    }
    return {
      url: text(issues, where, neighbor.url, `nearestUrls[${position}].url`),
      distinction: text(issues, where, neighbor.distinction, `nearestUrls[${position}].distinction`)
    };
  });
  if (nearestUrls.length > 3)
    issues.push(`${where}: nearestUrls lists at most three pages.`);
  const sources = list(issues, where, input.sources, "sources").map((item, position) => {
    const source = record(item);
    if (source === null) {
      issues.push(`${where}: sources[${position}] must be a record.`);
      return null;
    }
    const checkedOn = date(issues, where, source.checkedOn, `sources[${position}].checkedOn`);
    const url = text(issues, where, source.url, `sources[${position}].url`);
    if (url !== "" && !isSafeHref(url))
      issues.push(`${where}: sources[${position}].url must be a web, mail, or relative link.`);
    return {
      title: text(issues, where, source.title, `sources[${position}].title`),
      url,
      checkedOn: checkedOn ?? "0000-00-00"
    };
  }).filter((source) => source !== null);
  const observations = list(issues, where, input.observations, "observations").map((item, position) => text(issues, where, item, `observations[${position}]`));
  const refreshTriggers = list(issues, where, input.refreshTriggers, "refreshTriggers").map((item, position) => text(issues, where, item, `refreshTriggers[${position}]`));
  const scores = parseScores(issues, where, input.scores);
  const review = parseReview(issues, where, input.review, "review");
  const humanReviewValue = parseReview(issues, where, input.humanReview, "humanReview");
  if (humanReviewValue !== null && humanReviewValue.reviewerType === "ai") {
    issues.push(`${where}: humanReview cannot record an AI reviewer; keep AI review in review.`);
  }
  const reassessOn = date(issues, where, input.reassessOn, "reassessOn");
  if (issues.length > start || scores === null || reassessOn === null)
    return null;
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
    humanReview: humanReviewValue,
    reassessOn,
    harmIfWrong,
    refreshTriggers
  };
}
function admissionRuleIssues(admission) {
  const issues = [];
  const where = admission.href;
  const {
    review,
    humanReview
  } = admission;
  if (review !== null) {
    const days = articleDaysBetween(review.reviewedOn, admission.reassessOn);
    if (days < ARTICLE_REASSESS_WINDOW.minimumDays || days > ARTICLE_REASSESS_WINDOW.maximumDays) {
      issues.push(`${where}: reassessOn must fall ${ARTICLE_REASSESS_WINDOW.minimumDays} to ${ARTICLE_REASSESS_WINDOW.maximumDays} days after review.reviewedOn (found ${days}).`);
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
      issues.push(`${where}: indexable articles need a score of at least ${ARTICLE_ADMISSION_MINIMUM}/12 with no zero (found ${articleAdmissionScore(admission.scores)}).`);
    }
    if (review === null)
      issues.push(`${where}: indexable articles need a review with reviewer, reviewerType, and reviewedOn.`);
    else if (review.reviewerType === "author")
      issues.push(`${where}: indexable articles need an independent review; the author cannot admit their own post.`);
    if (admission.sources.length === 0)
      issues.push(`${where}: indexable articles need at least one source with a check date.`);
    if (admission.observations.length < 2)
      issues.push(`${where}: indexable articles need two observations that are not paraphrases of the sources.`);
    if (admission.refreshTriggers.length === 0)
      issues.push(`${where}: indexable articles need at least one refresh trigger.`);
  }
  return issues;
}
function assertArticleAdmissions(value) {
  const issues = [];
  if (!Array.isArray(value))
    throw new ArticleAdmissionError(["The admission registry must be a list."]);
  const seen = new Set;
  value.forEach((item, index) => {
    const admission = parseArticleAdmission(item, index, issues);
    if (admission === null)
      return;
    if (seen.has(admission.href))
      issues.push(`${admission.href}: appears more than once.`);
    seen.add(admission.href);
    issues.push(...admissionRuleIssues(admission));
  });
  if (issues.length > 0)
    throw new ArticleAdmissionError(issues);
}
function parseArticleAdmissions(value) {
  assertArticleAdmissions(value);
  return value;
}

export { isArticleIsoDate, articleDaysBetween, formatArticleDate, assertArticleDates, assertArticleHref, articleCalloutTones, assertArticleCalloutTone, ARTICLE_BYLINE_PREFIX, ARTICLE_TOC_LABEL, ARTICLE_SOURCES_HEADING, assertArticleAuthor, articleReviewerTypes, articleDraftingKinds, articleReviewerNameDisclosesAi, articleProvenanceSentence, articleScoreKeys, ARTICLE_ADMISSION_MINIMUM, ARTICLE_REASSESS_WINDOW, articleLifecycles, articleAdmissionScore, articleAdmissionPasses, isArticleIndexable, articleProvenanceFromAdmission, articleAdmissionsDue, ArticleAdmissionError, assertArticleAdmissions, parseArticleAdmissions };
