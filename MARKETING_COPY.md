# Writing for the marketing components

The product-marketing components give every Hraness site the same page shape. This guide says what each slot is for, so the shape does not also produce the same prose. `STYLE.md` still owns voice and conventions; this file covers the slots.

A reader arrives asking "What is this, and is it for me?" Answer that in the hero, show evidence next, and keep build details for the documentation.

## Slots

| Slot | Write | Avoid |
| --- | --- | --- |
| `ProductHero` `heading` | One sentence that says what the reader can do with the product. | Verbless slogans ("All your subscriptions. One router."), lists of three verbs, and claims a competitor could publish unchanged. |
| `ProductHero` `summary` | One or two sentences: what it is, who it is for, and the mechanism in the reader's words. | Stacking four mechanisms into one clause; "the first" or "the only" without a source. |
| `boundary`, `footnote` | Price or license, requirements, and release state, once and plainly: "Free and open source. Needs Rust 1.85 or newer. Latest release: v0.2.1." | Governance terms such as "verified release", "admitted", "qualified", or "source pilot". |
| `notice` | Status only when it changes what the reader can do today. | A second copy of the boundary, or caveats a reader cannot act on. |
| `MarketingProofFrame` | Output a reader can reproduce with the current release. Use `credit` for the date and label a historical record as historical. | Commands or flags the current release rejects; "Live qualification" as a label. |
| `MarketingPillars`, `MarketingPrimitives` | Labels that name a thing or state a fact ("A log for every run"). | Adjective triads ("Fast / Legible / Yours") and abstract nouns ("durable objects"). |
| `MarketingTrustBoundary` | What stays on the reader's machine, what is shared, and what the product will not do. | Authority, custody, admission, or lease vocabulary. |
| `MarketingRelated` `role` | The sibling product's own one-line description from the portfolio registry. | A new description invented for this page. |
| `MarketingRelated` `relationship` | What the two products do together, in one sentence. | Claims about the sibling that its own site does not make. |
| `MarketingQuestionList` | Questions readers actually ask, answered directly in the first sentence. | Questions written to deliver a talking point. |
| `MarketingCallToAction` | The next concrete step. | Decorative closers ("Give every job the same room to run in."). |

## Plain-string props

Most text props (`summary`, `detail`, `caption`, `boundary`, `role`, `relationship`) are plain strings and render as text. Backticks show up literally on the page. Name a command in prose there, or put code in a slot that accepts elements (`example`, `children`, `answer`).

## Before and after

These come from live Hraness pages.

- "every turn lands on one eligible account, bounded, with custody proven at settlement." Better: "Each task runs on one account with quota left, and xcb holds that account until the task finishes."
- "A policy over your transcripts, not a new editor." Better: "You decide when to compact and how."
- "Current verified release v0.2.1." Better: "Latest release: v0.2.1."
- "Automatic replies remain a separate choice, requiring a qualified agent, an enabled contact and global resume." Better: "Automatic replies aren't available yet. You write and send every reply."

## Check before publishing

Read the hero and the first two sections aloud. Every command must run on the current release. Render the page at 1280px and 375px wide; monospace proof frames need to fit about 32 characters per line on a phone.
