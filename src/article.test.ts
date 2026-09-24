import { describe, expect, test } from "bun:test";
import {
  ARTICLE_ADMISSION_MINIMUM,
  ArticleAdmissionError,
  articleAdmissionPasses,
  articleAdmissionScore,
  articleAdmissionsDue,
  articleDaysBetween,
  articleProvenanceFromAdmission,
  articleProvenanceSentence,
  articleReviewerTypes,
  assertArticleAdmissions,
  assertArticleAuthor,
  assertArticleDates,
  assertArticleHref,
  formatArticleDate,
  isArticleIndexable,
  isArticleIsoDate,
  parseArticleAdmissions,
  type ArticleAdmission,
  type ArticleScores,
} from "./index.js";

const passing: ArticleScores = {
  readerUtility: 2,
  originalEvidence: 2,
  factualConfidence: 2,
  hostFit: 1,
  voiceIntegrity: 1,
  maintenanceValue: 1,
};

function admission(overrides: Partial<Record<keyof ArticleAdmission, unknown>> = {}): Record<string, unknown> {
  return {
    href: "/blog/example-technique",
    lifecycle: "indexable",
    readerJob: "How do I keep a static export and a live preview in sync?",
    nonObviousAnswer: "Render both from one pure function and compare bytes in a test.",
    originalContribution: "A parity test that renders both paths from generated inputs.",
    hostFit: "The host ships the renderer this post describes.",
    nearestUrls: [{ url: "/blog/rendering", distinction: "Covers React only; this post covers static output." }],
    sources: [{ title: "Release notes", url: "https://example.com/releases/v1", checkedOn: "2026-09-20" }],
    observations: [
      "The two renderers disagreed on attribute casing until the test existed.",
      "Escaping differences only showed up with apostrophes in titles.",
    ],
    scores: passing,
    owner: "Example maintainers",
    drafting: "ai-from-source",
    review: { reviewer: "Claude Opus 5.5 (claude-opus-5-5) editorial review", reviewerType: "ai", reviewedOn: "2026-09-23" },
    humanReview: null,
    reassessOn: "2026-10-28",
    harmIfWrong: "A reader ships a renderer that drifts from the preview.",
    refreshTriggers: ["release tag bump", "renderer API change"],
    ...overrides,
  };
}

function issuesOf(value: unknown): readonly string[] {
  try {
    assertArticleAdmissions(value);
  } catch (error) {
    if (error instanceof ArticleAdmissionError) return error.issues;
    throw error;
  }
  return [];
}

describe("dates", () => {
  test("accepts only real calendar dates", () => {
    expect(isArticleIsoDate("2026-09-23")).toBe(true);
    expect(isArticleIsoDate("2028-02-29")).toBe(true);
    expect(isArticleIsoDate("2026-02-29")).toBe(false);
    expect(isArticleIsoDate("2026-13-01")).toBe(false);
    expect(isArticleIsoDate("2026-9-23")).toBe(false);
    expect(isArticleIsoDate("2026-09-23T00:00:00Z")).toBe(false);
    expect(isArticleIsoDate(20_260_923)).toBe(false);
  });

  test("formats dates without locale or time zone", () => {
    expect(formatArticleDate("2026-09-23")).toBe("23 September 2026");
    expect(formatArticleDate("2027-01-01")).toBe("1 January 2027");
    expect(() => formatArticleDate("2026-02-30")).toThrow(RangeError);
  });

  test("counts whole days across month and leap boundaries", () => {
    expect(articleDaysBetween("2026-09-23", "2026-10-21")).toBe(28);
    expect(articleDaysBetween("2028-02-28", "2028-03-01")).toBe(2);
    expect(articleDaysBetween("2026-10-21", "2026-09-23")).toBe(-28);
  });

  test("an update cannot precede publication", () => {
    expect(() => assertArticleDates({ published: "2026-09-23" })).not.toThrow();
    expect(() => assertArticleDates({ published: "2026-09-23", updated: "2026-09-23" })).not.toThrow();
    expect(() => assertArticleDates({ published: "2026-09-23", updated: "2026-09-22" })).toThrow(/cannot precede/u);
  });
});

describe("links and bylines", () => {
  test("allows web, mail, and relative links", () => {
    for (const href of ["https://example.com/a", "http://example.com", "mailto:hi@example.com", "/blog/a", "#section", "./a", "../a", "?page=2"]) {
      expect(() => assertArticleHref(href)).not.toThrow();
    }
  });

  test("rejects script, data, protocol-relative, and whitespace links", () => {
    for (const href of ["javascript:alert(1)", "JavaScript:alert(1)", "data:text/html,x", "//evil.example", "blog/a", "", "https://example.com/a b", "/a\nb", "vbscript:x"]) {
      expect(() => assertArticleHref(href)).toThrow(RangeError);
    }
  });

  test("an author needs a kind and a name", () => {
    expect(() => assertArticleAuthor({ kind: "organization", name: "Hraness" })).not.toThrow();
    expect(() => assertArticleAuthor({ kind: "organization", name: " " })).toThrow(/name/u);
    expect(() => assertArticleAuthor({ kind: "robot" as "person", name: "X" })).toThrow(RangeError);
    expect(() => assertArticleAuthor({ kind: "person", name: "X", href: "javascript:x" })).toThrow(RangeError);
  });
});

describe("provenance", () => {
  test("states AI drafting and AI review without calling it human", () => {
    const sentence = articleProvenanceSentence({
      drafting: "ai-from-source",
      review: { reviewer: "Claude Opus 5.5 (claude-opus-5-5) editorial review", reviewerType: "ai" },
    });
    expect(sentence).toBe("Drafted with AI from the source code and reviewed by Claude Opus 5.5 (claude-opus-5-5) editorial review.");
    expect(sentence.toLowerCase()).not.toContain("human");
  });

  test("names each reviewer type and says human only for a human editor", () => {
    for (const reviewerType of articleReviewerTypes) {
      const sentence = articleProvenanceSentence({ drafting: "ai", review: { reviewer: "Reviewer.", reviewerType } });
      expect(sentence.startsWith("Drafted with AI and reviewed by Reviewer")).toBe(true);
      expect(sentence.endsWith(".")).toBe(true);
      expect(sentence).not.toContain("..");
      expect(/human/iu.test(sentence)).toBe(reviewerType === "human-editor");
    }
  });

  test("a missing review makes no review claim", () => {
    expect(articleProvenanceSentence({ drafting: "ai-from-source", review: null }))
      .toBe("Drafted with AI from the source code. It has not been reviewed yet.");
    expect(articleProvenanceSentence({ drafting: "author", review: null }))
      .toBe("Written by the author. It has not been reviewed yet.");
    expect(articleProvenanceSentence({ drafting: "ai-assisted", review: { reviewer: "Sam", reviewerType: "author" } }))
      .toBe("Written with AI assistance and reviewed by Sam, the author.");
  });

  test("rejects unknown kinds and blank reviewers", () => {
    expect(() => articleProvenanceSentence({ drafting: "ghost" as "ai", review: null })).toThrow(RangeError);
    expect(() => articleProvenanceSentence({ drafting: "ai", review: { reviewer: "X", reviewerType: "robot" as "ai" } })).toThrow(RangeError);
    expect(() => articleProvenanceSentence({ drafting: "ai", review: { reviewer: "  ", reviewerType: "ai" } })).toThrow(/name/u);
  });

  test("derives the rendered provenance from the admission record", () => {
    const record = parseArticleAdmissions([admission()])[0];
    expect(record).toBeDefined();
    if (record === undefined) return;
    expect(articleProvenanceFromAdmission(record)).toEqual({
      drafting: "ai-from-source",
      review: { reviewer: "Claude Opus 5.5 (claude-opus-5-5) editorial review", reviewerType: "ai" },
    });
  });
});

describe("admission rubric", () => {
  test("nine with no zero passes; eight or any zero fails", () => {
    expect(ARTICLE_ADMISSION_MINIMUM).toBe(9);
    expect(articleAdmissionScore(passing)).toBe(9);
    expect(articleAdmissionPasses(passing)).toBe(true);
    expect(articleAdmissionPasses({ ...passing, maintenanceValue: 0, readerUtility: 2, hostFit: 2, voiceIntegrity: 2 })).toBe(false);
    expect(articleAdmissionPasses({ ...passing, readerUtility: 1 })).toBe(false);
  });

  test("a complete indexable record validates", () => {
    expect(issuesOf([admission()])).toEqual([]);
    expect(isArticleIndexable({ lifecycle: "indexable" })).toBe(true);
    expect(isArticleIndexable({ lifecycle: "quarantined" })).toBe(false);
  });

  test("indexable requires passing scores, review, sources, observations, and triggers", () => {
    const issues = issuesOf([admission({
      scores: { ...passing, voiceIntegrity: 0 },
      review: null,
      sources: [],
      observations: ["One."],
      refreshTriggers: [],
    })]);
    expect(issues.some((issue) => issue.includes("score of at least 9/12"))).toBe(true);
    expect(issues.some((issue) => issue.includes("need a review"))).toBe(true);
    expect(issues.some((issue) => issue.includes("at least one source"))).toBe(true);
    expect(issues.some((issue) => issue.includes("two observations"))).toBe(true);
    expect(issues.some((issue) => issue.includes("refresh trigger"))).toBe(true);
  });

  test("a quarantined draft may fail the rubric", () => {
    expect(issuesOf([admission({ lifecycle: "quarantined", scores: { ...passing, hostFit: 0 }, review: null, sources: [], observations: [], refreshTriggers: [] })])).toEqual([]);
  });

  test("reassessOn falls 28 to 56 days after review", () => {
    expect(issuesOf([admission({ reassessOn: "2026-10-21" })])).toEqual([]);
    expect(issuesOf([admission({ reassessOn: "2026-11-18" })])).toEqual([]);
    expect(issuesOf([admission({ reassessOn: "2026-10-20" })])[0]).toContain("found 27");
    expect(issuesOf([admission({ reassessOn: "2026-11-19" })])[0]).toContain("found 57");
  });

  test("human review stays separate from AI review", () => {
    expect(issuesOf([admission({ humanReview: { reviewer: "Model", reviewerType: "ai", reviewedOn: "2026-09-23" } })])[0])
      .toContain("cannot record an AI reviewer");
    expect(issuesOf([admission({ review: null, lifecycle: "quarantined", humanReview: { reviewer: "Sam", reviewerType: "human-editor", reviewedOn: "2026-09-23" } })])[0])
      .toContain("before adding humanReview");
    expect(issuesOf([admission({ humanReview: { reviewer: "Sam", reviewerType: "subject-expert", reviewedOn: "2026-09-23" } })])).toEqual([]);
  });

  test("sources checked after the review, duplicates, and malformed fields are reported together", () => {
    const issues = issuesOf([
      admission({ sources: [{ title: "Late", url: "https://example.com", checkedOn: "2026-09-24" }] }),
      admission(),
      admission({ href: "/b", scores: { ...passing, extra: 2 }, reassessOn: "2026-02-30", nearestUrls: [1, 2, 3, 4], drafting: "robot" }),
      "not a record",
    ]);
    expect(issues.some((issue) => issue.includes('source "Late" was checked after the review'))).toBe(true);
    expect(issues.some((issue) => issue.includes("appears more than once"))).toBe(true);
    expect(issues.some((issue) => issue.includes("unknown score extra"))).toBe(true);
    expect(issues.some((issue) => issue.includes("reassessOn must be a real calendar date"))).toBe(true);
    expect(issues.some((issue) => issue.includes("at most three"))).toBe(true);
    expect(issues.some((issue) => issue.includes("drafting must be one of"))).toBe(true);
    expect(issues.some((issue) => issue.includes("admission 3: must be a record"))).toBe(true);
  });

  test("the registry must be a list", () => {
    expect(issuesOf({})).toEqual(["The admission registry must be a list."]);
  });

  test("due records exclude archived pages", () => {
    const registry = parseArticleAdmissions([
      admission(),
      admission({ href: "/old", lifecycle: "archived" }),
      admission({ href: "/later", review: { reviewer: "Model", reviewerType: "ai", reviewedOn: "2026-10-01" }, reassessOn: "2026-11-15" }),
    ]);
    expect(articleAdmissionsDue(registry, "2026-10-27").map((item) => item.href)).toEqual([]);
    expect(articleAdmissionsDue(registry, "2026-10-28").map((item) => item.href)).toEqual(["/blog/example-technique"]);
    expect(articleAdmissionsDue(registry, "2026-12-01").map((item) => item.href)).toEqual(["/blog/example-technique", "/later"]);
  });
});
