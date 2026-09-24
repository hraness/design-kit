import { expect, test } from "bun:test";
import fc from "fast-check";
import {
  ARTICLE_ADMISSION_MINIMUM,
  ARTICLE_REASSESS_WINDOW,
  ArticleAdmissionError,
  articleAdmissionPasses,
  articleAdmissionScore,
  articleDaysBetween,
  articleDraftingKinds,
  articleProvenanceSentence,
  articleReviewerTypes,
  articleScoreKeys,
  assertArticleAdmissions,
  escapeArticleHtml,
  formatArticleDate,
  isArticleIsoDate,
  type ArticleIsoDate,
  type ArticleScore,
  type ArticleScores,
} from "./index.js";

const DAY_MS = 86_400_000;
const EPOCH_2000 = Date.UTC(2000, 0, 1) / DAY_MS;
const EPOCH_2099 = Date.UTC(2099, 11, 31) / DAY_MS;

function isoFromDay(day: number): ArticleIsoDate {
  return new Date(day * DAY_MS).toISOString().slice(0, 10) as ArticleIsoDate;
}

const dayArb = fc.integer({ min: EPOCH_2000, max: EPOCH_2099 });
const scoreArb = fc.constantFrom<ArticleScore>(0, 1, 2);
const scoresArb = fc.tuple(scoreArb, scoreArb, scoreArb, scoreArb, scoreArb, scoreArb).map((values) => (
  Object.fromEntries(articleScoreKeys.map((key, index) => [key, values[index]])) as ArticleScores
));

test("scoring law: passes exactly when the total reaches nine and no score is zero", () => {
  fc.assert(fc.property(scoresArb, (scores) => {
    const values = articleScoreKeys.map((key) => scores[key]);
    const total = values.reduce<number>((sum, value) => sum + value, 0);
    expect(articleAdmissionScore(scores)).toBe(total);
    expect(articleAdmissionPasses(scores)).toBe(total >= ARTICLE_ADMISSION_MINIMUM && !values.includes(0));
  }));
});

test("dates round-trip through day counts and format deterministically", () => {
  fc.assert(fc.property(dayArb, fc.integer({ min: -400, max: 400 }), (day, offset) => {
    const from = isoFromDay(day);
    const to = isoFromDay(day + offset);
    expect(isArticleIsoDate(from)).toBe(true);
    expect(articleDaysBetween(from, to)).toBe(offset);
    const [year, month, date] = from.split("-").map(Number) as [number, number, number];
    expect(formatArticleDate(from)).toMatch(new RegExp(`^${date} [A-Z][a-z]+ ${year}$`, "u"));
    expect(month).toBeGreaterThanOrEqual(1);
  }));
});

test("reassessment window: exactly 28 to 56 days after review is accepted", () => {
  fc.assert(fc.property(dayArb, fc.integer({ min: 0, max: 90 }), (reviewDay, gap) => {
    const record = {
      href: "/p",
      lifecycle: "quarantined",
      readerJob: "q",
      nonObviousAnswer: "a",
      originalContribution: "c",
      hostFit: "h",
      nearestUrls: [],
      sources: [],
      observations: [],
      scores: { readerUtility: 1, originalEvidence: 1, factualConfidence: 1, hostFit: 1, voiceIntegrity: 1, maintenanceValue: 1 },
      owner: "o",
      drafting: "ai",
      review: { reviewer: "Model", reviewerType: "ai", reviewedOn: isoFromDay(reviewDay) },
      humanReview: null,
      reassessOn: isoFromDay(reviewDay + gap),
      harmIfWrong: "x",
      refreshTriggers: [],
    };
    const inside = gap >= ARTICLE_REASSESS_WINDOW.minimumDays && gap <= ARTICLE_REASSESS_WINDOW.maximumDays;
    if (inside) {
      expect(() => assertArticleAdmissions([record])).not.toThrow();
    } else {
      expect(() => assertArticleAdmissions([record])).toThrow(ArticleAdmissionError);
    }
  }));
});

test("provenance never says human unless a human editor reviewed", () => {
  fc.assert(fc.property(
    fc.constantFrom(...articleDraftingKinds),
    fc.constantFrom(...articleReviewerTypes),
    fc.oneof(fc.string({ minLength: 1 }), fc.string().map((value) => `${value}Human${value}`))
      .filter((value) => value.trim().length > 0),
    (drafting, reviewerType, reviewer) => {
      if (reviewerType !== "human-editor" && /human/iu.test(reviewer)) {
        expect(() => articleProvenanceSentence({ drafting, review: { reviewer, reviewerType } })).toThrow(RangeError);
        return;
      }
      const sentence = articleProvenanceSentence({ drafting, review: { reviewer, reviewerType } });
      expect(/human/iu.test(sentence)).toBe(reviewerType === "human-editor");
      expect(sentence.endsWith(".")).toBe(true);
    },
  ));
});

test("escaping leaves no markup characters and decodes back to the input", () => {
  fc.assert(fc.property(fc.string(), (value) => {
    const escaped = escapeArticleHtml(value);
    expect(escaped).not.toMatch(/[<>"']/u);
    const decoded = escaped
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#x27;", "'")
      .replaceAll("&amp;", "&");
    expect(decoded).toBe(value);
  }));
});
