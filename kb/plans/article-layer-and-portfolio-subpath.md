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
- The `./portfolio` subpath with its generator (below).

Non-goals: product content, feed or sitemap builders (those belong in `@hraness/web-discovery`), and the shared `check:copy` script.

## Decisions

- Article styles extend `plain-publication.css` instead of adding a StyleX module or a new stylesheet. The document grammar already lives in the global CSS boundary, static sites without a compiler need it, and a new file would widen the three stylesheet inventories.
- One markup contract for React and static HTML, enforced by byte-equality and property tests.
- The provenance sentence is generated, never typed, so "human" appears only for `reviewerType: "human-editor"`.
- `reassessOn` is checked against `review.reviewedOn`. A quarantined record without a review has no window yet.

## Portfolio subpath

Shipped in v0.17.0 alongside the article layer:

1. `scripts/sync-portfolio-facts.ts` reads `portfolio.public.generated.json` and the name, expanded name, and description fields of `packages/brand-catalog/brands.yaml` from one portfolio registry commit (`git show`, never the working tree), verifies the upstream digest, and writes `src/portfolio.generated.json` plus the identical `src/portfolio.generated.ts` literal. Without `--write` it fails when the committed files differ. It refuses commits that are not on the registry's `origin/main`, and `--allow-unmerged` only previews.
2. `src/portfolio.ts` exports frozen `portfolioFacts`, `portfolioProducts`, `portfolioRelations`, `portfolioProvenance`, `portfolioDigest`, the closed `PortfolioProductId` union, and `product()`, `relatedFor()`, `usesPairs()`, and `isPortfolioProductId()`.
3. Tests pin the digest, source commit, record shapes, JSON and module parity, helper laws, the import boundary, and the generator's fail-closed cases. The package smoke imports the subpath and JSON from a packed install.

Decisions:

- The generator lives here, not in the registry, because the task placed it with the consumer package; it reads the registry only through Git objects at an exact commit, so no sibling-path coupling reaches runtime or CI.
- `name` comes from the brand entry when the product owns its whole host; products served under a hraness.com path keep their portfolio name. `oneLiner` is the description the public portfolio serves; the brand description is kept separately as `brandDescription` because the two still disagree for several products.
- `status` is `active` for every product, because the public contract lists only active products and has no release-stage field. `copyStatus` carries the registry's `authored` or `proposed` marketing state.
- `aliases` lists the other names the registry uses (expanded and display names). The registry has no rename history yet, so "formerly" names are not available.
- Relations are limited to product-to-product edges. Edges to shared foundations, such as the Oh kernel, stay out until the registry maps a foundation to its product.
- `relatedFor()` and `usesPairs()` use only relations with a reviewed `detail`, because the label is not reader copy. `usesPairs()` excludes delivery relations and does not guess which side is the consumer.

Follow-ups:

- The v0.17.0 snapshot comes from registry commit `f1924d6ff`, before the brand-name reconciliation and the ten new integration relations reach the registry's `main`. Regenerate and cut a patch release once they merge.
- The registry should record former names and a release-stage status in the public contract so `aliases` and `status` can carry them.
- `assertAuthored()` from the earlier plan is not shipped; `copyStatus` lets a consumer enforce it.

## Verification

`bun run check`, including the new unit, property, parity, and CSS contract tests and the gallery browser run.

## Recovery

The layer is additive. Reverting the release commit removes it; no existing export changes.
