# Shared visual direction

The incumbent Paper palettes, Nebula Sans body and heading type, and crisp product identities remain the foundation. Lantern is an independent material option for application screens, not a replacement palette.

## Quiet marketing direction

Public product pages follow the Quiet direction, taken from the structure of algal.computer:

- A thin sticky header: the foil product lockup, three to six plain links, one primary action, and the appearance menu as the right-most control. On phones the links move to their own row, which scrolls sideways without a visible scrollbar; the brand, action, and appearance menu stay on the first row. Every control keeps a 44px target and nothing overlaps or clips.
- A sans hero: a small plain eyebrow, one large heading in Nebula Sans at weight 550 with tight tracking, a summary of two or three sentences within about 42rem, one primary button and at most one text link, and optionally one line of plain facts such as license, platforms, or price.
- Explain the product's central benefit immediately after the hero, with a terminal or code block, a static screenshot with `alt` text, or compact real output. A mockup from `@hraness/design-kit/mockups`, or a `ModeShowcase` with a few of its states, can demonstrate the result. It uses invented names on example domains and an accurate accessible description. Add visible captions only when they contribute useful context.
- Ruled sections: each has an eyebrow, a heading, one short paragraph, and one concrete element such as steps, code, a table, or a small figure. Prefer rows and lists to walls of equal cards. Keep a bounded reading width.
- A flat palette background with content on opaque surfaces and hairline edges. Mono only for code, commands, and small labels.
- Optionally, one product landscape: a detailed, product-specific drawing tinted from the palette, kept in the margins, and tiled behind the marketing, documentation, and blog pages. Over it, reading surfaces stay opaque with rounded edges and small cards and callouts become frosted panels. See [Product landscape](LANDSCAPE.md).

Retired as shared defaults and as decoration, and no longer produced by any shared default: hero backdrops and pointer-driven light (`ProductHero` `backdrop`, `HeroBackdrop`, `attachHeroLight`, `data-hraness-hero-item`), background textures and patterns (grain, cells, weave, contour, mesh, grid tiling, gradients behind text), serif display headings, glass or blur on cards and content outside a product landscape, heavy shadows and glowing edges, and large interactive app mockups on marketing pages. The retired component names stay exported and do nothing, so products can remove them on their own schedule. A product may bring motion, depth, or rendering back in one place only as a signature moment that meets every rule in [Sharded identity](#sharded-identity); the shared defaults stay flat. See [Hero fields](HERO_FIELDS.md) and [Marketing preset](MARKETING_PRESET.md).

Blur remains allowed on a sticky header with real content scrolling behind it, and on small cards and callouts over a product landscape. Both turn opaque without backdrop support, with reduced transparency, and in forced colors.

## Sharded identity

The portfolio reads as one studio's work with distinct products in it. Every site keeps the same core, and each product adds a shard: one accent, one motif, and at most two signature moments where real craft shows. The reference is what the best design engineers do with tools like Paper, shaders, and WebGPU: subtle, physically plausible, surprising once, then quiet, so the product can speak for itself. The bar for the result is the polish of Stripe, Vercel, or Shopify.

### The core every site keeps

- The Paper palettes and the five-palette appearance menu as the final header control.
- Nebula Sans at weight 550 for display headings, on the editorial type scale.
- The foil brand lockup in the thin sticky header, and the same header on every public page.
- Hairline rules, opaque reading surfaces, and the flat palette background.
- Ruled sections: eyebrow, heading, one short paragraph, one concrete object.
- The product landscape stays one of the sanctioned forms: one product-specific drawing in the margins, as described in [Product landscape](LANDSCAPE.md).

### The shard each product adds

- One accent palette role. The product binds `--hraness-marketing-accent` (with `--hraness-marketing-accent-soft` and `--hraness-marketing-accent-ink`) to one hue that holds across every palette and both appearances. Buttons, links, diagram strokes, chart bars, and the signature moments all use that one hue; a second accent appears only where data needs a second series.
- One signature motif: a recurring drawn form taken from the product's mechanism, such as the fold of a compacted transcript, a route threading a bank of accounts, three records joining into one, a trail of sources becoming a report, a paused program resuming, posts travelling between peers, or notes on a piano roll. The motif recurs in the product landscape, the mechanism diagram, the social image, and the blog card images, drawn in the product's palette with that one accent. It never alters the wordmark or the mark.
- At most two signature moments, defined below.

### Signature moments

A signature moment is one place on a site where motion, depth, or rendering goes beyond the Quiet defaults. Each one meets every rule below. A moment that fails one rule is decoration, and decoration stays retired.

1. It demonstrates the product's mechanism: compaction squeezing a transcript, a route finding the one idle account, a contact book joining three sources into one record, a research trail turning into a cited report, a program pausing and resuming, signed posts flowing between peers, notes streaming down a piano roll. A reader who watches it learns how the product works. Decoration with no mechanism is out.
2. It never sits behind text. Reading surfaces stay opaque. It lives in the hero proof frame, in a section figure, or in the product landscape margins.
3. It respects `prefers-reduced-motion: reduce` with a static final frame that still shows the result, `forced-colors: active` with system colors or no drawing at all, and `prefers-reduced-transparency: reduce` with opaque surfaces. It reads correctly in both appearances and in every palette.
4. It reserves its box before it loads, so it causes no layout shift, and it is skipped by search snippets and assistive technology: the drawing carries `aria-hidden="true"`, and its meaning lives in visible copy or in the accurate `alt` of the static fallback.
5. It is product-owned CSS, SVG, canvas, or WebGL/WebGPU with a static fallback (an SVG or image) that renders without JavaScript and when a GPU or rendering context is unavailable. It loads lazily after first paint, and its script stays under about 60 KB compressed.
6. It is tested at 375px and 1280px in light and dark, with reduced motion and forced colors, in the site's own browser checks.
7. Each site has at most two. Everything else stays Quiet.

Mark each moment with `data-hraness-signature` on its outermost element, with a value that names the mechanism (`data-hraness-signature="compaction"`). The attribute is the hook the site's own tests use to count moments, find the reduced-motion branch, and locate the static fallback. The kit's stylesheets do not style it and the kit's snapshot checks do not read it; the rules above are the site's to enforce.

### Mockups, diagrams, and benchmarks

Rich mockups and diagrams are the main tools for showing the product. Every landing page carries at least:

- One real proof object above the fold: real command output in `MarketingProofFrame` (`chrome="terminal"`, capture date in `credit`), a real screen (`chrome="window"` or `chrome="browser"` with its `url`), or a mockup from `@hraness/design-kit/mockups`, optionally in a `ModeShowcase` with a few of its states. Mockups use invented names on example domains and an accurate accessible description.
- One mechanism diagram: an SVG in `MarketingDiagram` (or `ArticleFigure` in a post), drawn in the product's palette with one dominant accent, legible in both appearances, with an accurate `alt`. One idea per drawing.
- One benchmark or measurement figure, where real data exists: `ArticleBarChart` or `ComparisonTable`, with the task, metric and unit, baseline, product version, sample, and measurement date beside the result, as [Benchmarks](MARKETING_COPY.md#benchmarks) describes. A toy fixture is engineering evidence, not a benchmark; a page with no real data carries no figure.

## Launch posts

An "Introducing" post reads as a column of beats: a short headline, one claim, and one visual each, anchored as `#beat-<id>`. Visuals are mockups, short clips, or diagrams in an `ArticleFigure`, with accurate accessible descriptions and optional useful captions. Depth, comparison tables, and charts go in companion posts, drawn with `ArticleTable`, `ArticleBarChart`, and `ComparisonTable`. The social kit sits in a closed disclosure after the beats. The gallery renders every mockup frame in light and dark from `gallery/mockups-fixture.tsx`.

## Application surfaces

Every filled control pairs a semantic background and foreground. Text on selected, hover and active states must meet 4.5:1 contrast in every supported palette and mode; large text and meaningful non-text marks meet their applicable 3:1 requirement. Never combine an accent fill with hardcoded white text. Customizing a fill requires reviewing its paired foreground, including nested themes and forced colors.

Borrow the architectural logic of Maison Hermès for application material: a consistent module, diffused light, a cool exterior and warm occupied spaces. Readable content sits on opaque planes. Never filter text, logos or meaningful diagrams.

Everyday application screens stay quiet. Selection receives a warm paired fill and foreground; success, warning, danger and focus retain their semantic meaning. Reserve glazing for chrome with real scrolling content behind it and for key transitions. Honor light/dark preference, nested themes, reduced transparency, reduced motion and forced colors.

Information architecture precedes decoration: bounded reading widths, meaningful groups, rows for collections, secondary details in native disclosures, critical availability visible before action, and one primary next step per section. Avoid equal-height card walls, dense technical labels in marketing and competing footer calls to action.

See [Lantern material](LANTERN_MATERIAL.md) for the application material contract.

Brand foil uses contrast-bearing neutral metal bands with a restrained rainbow reflection. Apply it to the exact existing logo silhouette and wordmark, retain the original artwork fallback, and keep it legible at rest without animation. Forced colors use the original mark and system text. Bordered emphasis surfaces — `.hraness-foil` and primary actions — keep a flat fill under one theme-aware monochrome edge (`--hraness-foil-edge`: black on light, white on dark) instead of the spectrum.

Product wordmarks use the exact canonical display name from `messaging.names.name`, including internal capitals, acronyms, spaces, dots, and intentionally lowercase names. Typography and foil never change that spelling. Keep domains, commands, package names, and other technical identifiers separate; neither lowercasing in source nor CSS `text-transform` is a branding option. See [Product names](MARKETING_COPY.md#product-names).

The canonical site header carries one brand lockup: a home anchor with `data-foil`, the foil-text product name, and the product mark in the foil-mark structure: a flat `__image` under a `__paint` layer masked by the mark's own alpha. React sites emit it through `MarketingSiteHeader` `brandMark` or `FoilMark` directly; hand-authored sites emit the same three-node markup and keep `--hraness-foil-size`/`--hraness-foil-mask` in the stylesheet, never inline, so strict style CSPs hold. `attachFoil` from `@hraness/design-kit/browser` eases the pointer inputs while `--hraness-foil-glow` stays CSS-owned. A site keeps the lockup uniform with a gate that asserts the wrapper, paint layer, and mask on every page's home anchor.

The same product header serves the homepage, articles, documentation, and normal status pages. It sits before and outside `main`, with one appearance menu as the final header action. A breadcrumb or a row of reading links does not replace it. Use `inspectMarketingHeader` from the browser entry in each public-route test; it checks header presence before testing geometry and compares the visible `brandName` with the canonical messaging name, independently of accessible labels, and can compare artwork with the homepage.
