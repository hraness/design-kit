# Writing for the marketing components

The product-marketing components give every Hraness site the same page shape. This guide says what each slot is for, so the shape does not also produce the same prose. `STYLE.md` still owns voice and conventions; this file covers the slots.

A reader arrives asking "What is this, and is it for me?" Answer that in the hero, show evidence next, and keep build details for the documentation.

## Slots

Limits are maximums. Count characters in the rendered text.

| Slot | Write | Limit | Avoid |
| --- | --- | --- | --- |
| `ProductHero` `heading` | One sentence that says what the reader can do with the product. | 60 characters | Verbless slogans ("All your subscriptions. One router."), lists of three verbs, and claims a competitor could publish unchanged. |
| `ProductHero` `summary` | One or two sentences: what it is, who it is for, and the mechanism in the reader's words. | 240 characters | Stacking four mechanisms into one clause; "the first" or "the only" without a source. |
| `eyebrow` | The product's category from the portfolio registry, or nothing. | Four words | A tagline or a second headline. |
| `boundary` | Price or license, requirements, and release state, once and plainly: "Free and open source · Needs Rust 1.85 or newer · Latest release: v0.2.1". | 110 characters | Governance terms such as "verified release", "admitted", "qualified", or "source pilot". |
| `notice` | Status only when it changes what the reader can do today. | One sentence | A second copy of the boundary, or caveats a reader cannot act on. |
| `MarketingProofFrame` | Output a reader can reproduce with the current release. Put the capture date in `credit` and label a historical record as historical. | | Commands or flags the current release rejects; "Live qualification" as a label. |
| `MarketingPillars`, `MarketingPrimitives` | Two to four items. Labels name a thing or state a fact ("A log for every run"); each summary is one sentence. | Label: five words. Summary: 120 characters | Adjective triads ("Fast / Legible / Yours") and abstract nouns ("durable objects"). |
| Section `heading` | Sentence case. A full sentence in the editorial preset may end with a period; other headings do not. | 70 characters | Slogans and headings that promise more than the section shows. |
| `MarketingTrustBoundary` | What stays on the reader's machine, what is shared, and what the product will not do, each stated once on the page. | Four items | Authority, custody, admission, or lease vocabulary. |
| `MarketingRelated` `role` | The sibling product's own one-line description from the portfolio registry. It is the only text the card shows, under the product's mark and name. | One line | A new description invented for this page. |
| `MarketingRelated` `mark` | The sibling product's portfolio mark, such as a `relatedFor()` item's `mark`. | | Artwork the sibling does not use. |
| `MarketingQuestionList` | Questions readers actually ask. The first sentence of each answer answers it. Generate any FAQ JSON-LD from the same array. | Eight questions | Questions written to deliver a talking point. |
| `MarketingCallToAction` | The next concrete step. | Section heading limit | Decorative closers ("Give every job the same room to run in."). |

## Plain-string props

Most text props (`summary`, `detail`, `caption`, `boundary`, `role`) are plain strings and render as text. Backticks show up literally on the page. Name a command in prose there, or put code in a slot that accepts elements (`example`, `children`, `answer`).

## Before and after

These come from live Hraness pages.

- "every turn lands on one eligible account, bounded, with custody proven at settlement." Better: "Each task runs on one of your accounts that is signed in, idle, and not at a known quota limit, and xcb keeps that account locked until the provider process exits."
- "A policy over your transcripts, not a new editor." Better: "You decide when to compact and how."
- "Current verified release v0.2.1." Better: "Latest release: v0.2.1."
- "Automatic replies remain a separate choice, requiring a qualified agent, an enabled contact and global resume." Better: "Automatic replies stay off until you connect an AI account, turn them on for this contact, and resume the butler."

## Check before publishing

Read the hero and the first two sections aloud. Every command must run on the current release. Render the page at 1280px and 375px wide; monospace proof frames need to fit about 32 characters per line on a phone.
