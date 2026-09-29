# Writing articles

The article components (`MarketingArticle`, `ArticleIndex`, and the static `renderArticleHtml` functions) give every Hraness host the same article shape. This guide says what goes in each part and which posts a host may publish. `STYLE.md` still owns voice and conventions, and `MARKETING_COPY.md` owns the product-page slots.

A reader arrives with one question. The title names it, the dek answers it in one sentence, and the body shows the evidence.

## Parts of an article

Limits are maximums. Count characters in the rendered text.

| Part | Write | Limit | Avoid |
| --- | --- | --- | --- |
| `heading` | The question or the result, in sentence case with no period. | 70 characters | Clickbait, a question the article does not answer, and a colon followed by a second title. |
| `dek` | One concrete claim, as a complete sentence, that a reader could check. | 200 characters | A summary of the article's sections, "In this post", and claims with no source in the body. |
| `eyebrow` | The series or post type: "Technique", "Release", "Integration". | Three words | A tagline. |
| `author` | The organization byline on every host: `{ kind: "organization", name: "Hraness" }`. | | A person's name on a post that person did not adopt. |
| `provenance` | The drafting kind and the review on record. | | Omitting it on an AI-drafted post. |
| `toc` | One entry per `h2`, only when the article has four or more. | Eight entries | Entries for `h3` headings. |
| Body headings | Sentence case, each naming what the section shows. | 70 characters | Signpost headings such as "Overview", "Conclusion", or "Key takeaways". |
| `ArticleSources` | Primary sources a reader can open, each with the date someone last checked the cited claim. | | Secondary summaries when the primary source is public. |
| `ArticleRelatedProducts` | Siblings from the registered relations for this article, each shown with its mark, name, and one-line description. | Three items | Every product in the portfolio. |
| `ArticleCallout` | A limit or warning the reader must see before acting. | One short paragraph | Decorative asides and restated body text. |

## Post shapes

### Introducing a product

Title: "Introducing <product>". It lives on the product's own host, and each active product gets one. The reader's job is to decide whether to try it, so the admission record says `readerJob: "decide whether to try it"`.

The post keeps five parts, written as beats:

1. **What it is.** One plain sentence, then the problem it solves in the reader's terms, with one concrete case.
2. **What it does today.** Only shipped behavior. One beat per surface or mode, and only when that beat has its own visual.
3. **How it works and who it is for.** How it works in the reader's terms, then the reader who has the problem and who should use something else.
4. **The vision.** Where the product is going and why, stated as intent, not as a shipped feature or a date.
5. **Limits and status.** What it does not do yet, then the status sentence and how to get it.

It explains the reason for the product. It does not repeat the feature grid on the home page. A paused product says so in the status sentence; a retired or legacy product gets no introduction.

#### Beats

A beat is one short section that makes one claim and shows one visual. Write 7 to 10 beats, about 40 to 60 words each, in this order:

| Part | Beats | Write |
| --- | --- | --- |
| `what` | 1 | What the product does, stated plainly. No question, teaser, or "here's why". |
| `does` | 1 or more | One surface or mode each, tied to one mockup state or clip. |
| `how` | 1 | How it works, in the reader's terms. |
| `who` | 1 | Who it is for, and who should use something else. |
| `vision` | 1 | Where it is going, as intent. |
| `limits` | 1 | What it does not do yet, once, at its true scope. |
| `status` | 1 | The status label and how to get it. |

- The hero holds the title, the registry `meta` as the dek, the status line from release data, and the film when there is one.
- Each beat has a headline of 70 characters or fewer, in sentence case with no period, and a post of 250 characters or fewer that works on its own as one social post.
- Each beat has exactly one visual, and no two beats share one. Alt text is 125 characters or fewer. A mockup is labelled as an illustration in its alt text and caption.
- Render beats with `LaunchBeats` from `@hraness/design-kit/react`. Each beat gets a `#beat-<id>` anchor.
- After the beats: "Go deeper" links named for the reader's next task, then the social kit, then sources and the drafting and review note.
- Technical depth, comparisons with other products, and tables go in companion posts or `/compare` pages. Link them from the beat with `detailHref`.

#### Launch data

`@hraness/design-kit/launch` holds the shapes and checks. It has no React.

```ts
type LaunchBeat = {
  id: string;              // lowercase slug, rendered as #beat-<id>
  part: "what" | "does" | "how" | "who" | "vision" | "limits" | "status";
  headline: string;        // may hold {fact} placeholders
  post: string;            // may hold {fact} placeholders
  visual:
    | { kind: "mockup"; id: string; state: Record<string, string> }
    | { kind: "clip"; scene: string }
    | { kind: "diagram"; src: string };
  alt: string;
  facts?: string[];        // every placeholder key the beat uses
  detailHref?: string;     // a companion post
};

type LaunchFacts = Record<string, { value: string; source: string }>;

type SocialKit = {
  x: string[];
  bluesky: string[];
  threads: string[];
  linkedin: string;
  productHunt: { tagline: string; description: string; tags: string[] };
  showHnFacts: string[];   // facts for a person to write from
  sources: Record<string, string>;
};
```

- **Facts.** Type every number once, in the product's `LaunchFacts` module, with its source: versions, sizes, rates, counts, and prices. The post, the social kit, film captions, and store listings all import it. `resolveLaunchBeats(beats, facts)` fills `{key}` placeholders and rejects a beat that types a digit by hand.
- **Checks.** `assertLaunchBeats(beats)` checks the order, the counts, the limits, and the wording rules. `buildSocialKit(beats, messaging, release, canonicalUrl)` builds each channel's posts from the beats, the Product Hunt fields from portfolio messaging, and the status from the release record. `assertLaunchKit(beats, kit, options)` checks each channel's length. It also checks that only the last post links, that the last post carries the status and the canonical URL without tracking parameters, that nothing asks the reader to install before a public install exists, and that no other product is named.
- **Social kit.** Build it only from an `indexable` post. A quarantined post has no social kit. Render it with `SocialKitPanel`, a closed `<details>` with a copy button and a character count per post. A person writes the Show HN post and the first Product Hunt comment; the kit gives them the facts.
- **Words.** Social posts follow the rules below, plus: no hashtags, no emoji, and no thread markers such as "1/n".
- **Admission.** A launch post passes the same admission gate as every other article. The launch helpers do not change it.

### How one product uses another

Title: "How <consumer> uses <provider>". It lives on the consumer's host.

1. **The reader's problem.** The job the consumer's user is trying to get done.
2. **What the provider does.** In plain words, for a reader who has never used it.
3. **How the consumer uses it.** The code path, configuration, or data flow, from the consumer's side.
4. **What that buys the user.** The concrete result a user of the consumer sees.
5. **Limits.** What the integration does not cover, once, at its true scope.
6. **Links.** The provider's home page and hub page, and the consumer's introduction.

- Write one only for a relation registered in `@hraness/design-kit/portfolio` that has a reviewed `detail` sentence. The post expands that sentence; it does not claim more.
- Outside its hub page, the provider's host adds at most one descriptive link to the post, and only after both pages are live.
- When the relation changes or is removed, update or archive the post in the same change.

### Provider hub page

A provider may keep one page, such as "Built on <provider>", that lists the products using it. Each entry is the registered relation's own sentence and a link to the consumer's "How <consumer> uses <provider>" post when one exists. The hub is an index. It does not restate each post.

### Technique posts in two halves

A technique post teaches one method, such as property tests, model checking, or proofs. It lives on hraness.com, and a product host may carry a product-specific version that shows the technique inside that product.

- **First half, for any reader.** Ground it in problems people already know, such as vibe-coded slop (software a model wrote quickly that looks finished and breaks on the second use) and fragile foundations (a product built on code nobody checked). Use one familiar failure ("It only breaks if you save, lose connection, then reopen"). Then describe the brighter alternative: what it is like when a whole class of that failure cannot happen. No code or notation in this half.
- **Second half, how Hraness does it.** Show the method with durable examples: laws, invariants, and small code excerpts that still read correctly after a refactor. Cite the repository file that holds the real example. Avoid line numbers and file names that change often, and keep internal jargon to the one term the technique needs.
- End on the last supported fact. State what the technique does not prove, once, at its true scope.

## Titles and formulas

- Keep titles to 70 characters or fewer. Most search results cut longer ones.
- The fixed formulas "Introducing <product>" and "How <consumer> uses <provider>" are allowed. Every other title in a series needs its own wording.
- Vary openings, closing sections, and headings across a series. Check the other posts before publishing: no repeated first sentence pattern, closing heading, closing checklist, or disclaimer paragraph.

## Words and numbers

- Follow `STYLE.md`. Do not use em dashes anywhere in the article, including the title, dek, captions, and alt text.
- Do not use these words: delve, tapestry, testament, landscape (for a market), realm, seamless, seamlessly, robust (without the specific property), leverage (as a verb), unlock, empower, elevate, supercharge, game-changer, cutting-edge, revolutionize, harness (as a verb), journey (for a process), and "in today's world".
- Keep internal vocabulary out of articles: admission, admitted, qualification, qualified, custody, settlement, receipt, attest, bounded, boundary, gate, lane, surface, projection, manifest, lease, and the other words `STYLE.md` lists under "Write for the reader, not the build". A technique post may define one of these once when it is the subject.
- Do not invent numbers, benchmarks, quotes, customers, or dates. Every number has a source or a date in the text. Every quote has a named person who agreed to it.
- Type each number once. Versions, sizes, rates, counts, and prices in a launch post come from the product's launch facts, not from the article text.
- State product status once with one of the `STYLE.md` labels: In development, Preview, Beta, Latest release: vX.Y.Z, Paused, or Retired.

## Dual-use products

Some products can be pointed at other people's accounts or data: authenticated browser adapters, automated messaging, exposure scans, clipping tools, and media import. Articles about them:

- describe the owner's own accounts and data, used with the owner's authorization;
- show previews, confirmation steps, and consent before anything is sent or changed;
- say what the product will not do;
- never frame the product as scraping, impersonation, or outreach at scale.

## Drafting and review note

Every article states who drafted it and who reviewed it, visibly, on every host. The owner decided this on 2026-09-23, as relayed to the task that added this guide. It applies to articles only; other pages follow `STYLE.md`.

- Render `ArticleProvenance`, or the `provenance` prop of `MarketingArticle`, from the admission record with `articleProvenanceFromAdmission()`. Do not type the sentence by hand.
- An AI-drafted post from repository sources reads: "Drafted with AI from the source code and reviewed by <reviewer>."
- Name the reviewer as it is. An AI reviewer has `reviewerType: "ai"` and a name that says it is AI, for example "Claude Opus 5.5 (claude-opus-5-5) editorial review". The sentence says "human" only when `reviewerType` is `human-editor`.
- Keep `humanReview` null unless a person reviewed the article. Never describe AI review as human review.
- The byline is "Hraness" on every host. Do not credit a person, including the owner, for an AI-drafted post. A person who later adopts a post may switch the byline to their own name; the drafting and review note stays.
- A post with no review on record renders "It has not been reviewed yet." and stays quarantined.

## Admission and indexing

Every article URL has an `ArticleAdmission` record in its host's registry, checked by `assertArticleAdmissions()` in tests.

- A new post starts `quarantined`: readable, `noindex`, and absent from the sitemap, feeds, `llms.txt`, and index lists.
- It becomes `indexable` only when the record passes: six scores of 0 to 2 totalling at least 9 with no zero, a review with reviewer and `reviewerType`, at least one source with a check date, two observations that are not paraphrases of the sources, and at least one refresh trigger.
- An independent, disclosed AI review can admit a post. Record it as `reviewerType: "ai"`. The validator rejects an AI reviewer name that does not say it is AI (for example by naming the model), and it rejects `reviewerType: "author"` for an indexable post, because the author cannot admit their own post.
- `archived` keeps an old URL working without listing it.

## Freshness

- Every record has `reassessOn`, 28 to 56 days after `review.reviewedOn`. `articleAdmissionsDue(registry, today)` lists the records to look at again.
- Render versions, release dates, and status labels from release data (`package.json`, a published release file, or the portfolio facts). Never type a version into an article body.
- Each record names its refresh triggers: a release tag bump, a change to a relation's `detail`, a rename, or a change to the feature the post describes.
- When a product is renamed, update article bodies, titles, and slugs (with redirects) in the same change as the rename.
- When a feature an article describes changes, refresh the article or archive it. Update the `updated` date only when the content changed.

## Interlinking

- Add a link only when it is the reader's next useful action. Use a descriptive anchor.
- Follow registered relations. Do not link every product to every other product.
- No minimum link counts, reciprocal link swaps, or footer link farms.
- Every article stands on its own. A reader who follows no link still gets the answer.
- Link to another host only after both URLs are live.

## Check before publishing

Read the title, dek, and first paragraph aloud. Open every source and confirm the cited claim on the check date. Render the article at 1280px and 375px wide; code blocks scroll sideways and tables stay readable on a phone. Run `assertArticleAdmissions()` on the registry.

## Block for product repositories

Paste this block into the `AGENTS.md` of every product repository that publishes articles. Keep the markers so the block can be synced.

```md
<!-- hraness-articles:start -->
## Articles

- Take product names, one-liners, URLs, status, and relations from `@hraness/design-kit/portfolio`. Do not copy them into article text by hand.
- Write "How <consumer> uses <provider>" only for a relation registered there with a `detail` sentence. Change the relation and the post in the same change.
- Give every post an `ArticleAdmission` record with a `reassessOn` date 28 to 56 days after its review, and keep `assertArticleAdmissions()` in the tests.
- Render versions, release dates, and status from release data. Never type a version into an article.
- When a product is renamed, update article bodies, titles, and slugs in the same change. When a feature an article describes changes, refresh or archive the article.
- Follow `ARTICLE_COPY.md` in `@hraness/design-kit` for article shapes, the drafting and review note, and interlinking.
<!-- hraness-articles:end -->
```
