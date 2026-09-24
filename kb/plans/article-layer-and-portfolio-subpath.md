---
title: Article layer and portfolio subpath
type: plan
area: articles
status: in-progress
tags:
  - articles
  - portfolio
---

# Article layer and portfolio subpath

## Outcome

Hraness product hosts publish long-form articles with one shared shape, one drafting and review note, and one admission rubric, and read shared product facts from `@hraness/design-kit/portfolio` instead of copying them.

## Context

The owner decided on 2026-09-23, as relayed to this task:

- Product-host posts and the technique series may be indexed after a disclosed, independent AI review. The reviewer type says AI, AI review is never called human review, and `humanReview` stays null unless a person reviews.
- The byline is "Hraness" and the drafting and review note is visible on every host. Ben is never credited for AI-drafted posts.
- Volume is as high as the evidence supports. The title formulas "Introducing X" and "How X uses Y" are allowed.
- Shared facts ship as a generated subpath of design-kit. No new repository.

The earlier planning synthesis proposed a separate `@hraness/portfolio-facts` package and a hraness.com-only note; both are superseded by these decisions.

## Scope

v0.17.0 (this change):

- `src/article.ts`: article, source, index, provenance, and `ArticleAdmission` types; `assertArticleAdmissions()`; deterministic dates; `articleProvenanceSentence()`.
- `src/article-html.ts`: static renderer with markup identical to the React components.
- `src/react/article.tsx`: `MarketingArticle`, `ArticleByline`, `ArticleProvenance`, `ArticleSources`, `ArticleCallout`, `ArticleRelatedProducts`, and `ArticleIndex`, exported from `./react/server` and `./react`.
- `plain-publication--embedded` styles in `src/plain-publication.css`.
- `ARTICLE_COPY.md` with the canonical `hraness-articles` AGENTS block.
- The `./portfolio` subpath is reserved in `AGENTS.md`, not exported.

Non-goals: product content, feed or sitemap builders (those belong in `@hraness/web-discovery`), and the shared `check:copy` script.

## Decisions

- Article styles extend `plain-publication.css` instead of adding a StyleX module or a new stylesheet. The document grammar already lives in the global CSS boundary, static sites without a compiler need it, and a new file would widen the three stylesheet inventories.
- One markup contract for React and static HTML, enforced by byte-equality and property tests.
- The provenance sentence is generated, never typed, so "human" appears only for `reviewerType: "human-editor"`.
- `reassessOn` is checked against `review.reviewedOn`. A quarantined record without a review has no window yet.

## Portfolio subpath (next)

Populate `./portfolio` in a later minor release:

1. Generate `src/portfolio.generated.json` from the public portfolio contract (`hraness.portfolio-public/v1`) plus the public name and one-liner projection. The generator lives in the source repository that owns the data, and this package receives only the generated file.
2. Ship `src/portfolio.ts` with typed `products` (name, oneLiner, canonicalUrl, status, aliases) and `relations` (id, source, target, kind, detail), plus helpers: `relatedFor(id)` for `MarketingRelated` and `ArticleRelatedProducts` items, `usesPostPairs()` for relations with a reviewed `detail`, and `assertAuthored()`.
3. Export `./portfolio` from `package.json`, add it to the package smoke and public boundary tests, and pin a facts digest in a test.
4. Nothing else in the package imports it, and it contains no components or copy beyond the generated facts.

## Verification

`bun run check`, including the new unit, property, parity, and CSS contract tests and the gallery browser run.

## Recovery

The layer is additive. Reverting the release commit removes it; no existing export changes.
