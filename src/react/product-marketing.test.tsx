import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  MarketingCallToAction,
  MarketingCard,
  MarketingCardArt,
  MarketingCardRow,
  MarketingFlow,
  MarketingField,
  MarketingInstallPanel,
  MarketingInterfaceGrid,
  MarketingMain,
  MarketingMaker,
  MarketingPage,
  MarketingPillars,
  MarketingPricing,
  MarketingPrimitives,
  MarketingProofFrame,
  MarketingQuestionList,
  MarketingQuoteGrid,
  MarketingRelated,
  MarketingSection,
  MarketingSiteFooter,
  MarketingSiteHeader,
  MarketingStatStrip,
  MarketingTrustBoundary,
  ProductHero,
} from "./product-marketing";

// Presentation atoms may change, while stable hooks, order, and native markup may not.
function marketingMarkupPattern(snippet: string): RegExp {
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(snippet.split(/(class="[^"]*")/gu).map((part) => {
    if (!part.startsWith('class="')) return escape(part);
    const tokens = part.slice(7, -1).split(" ").map(escape);
    return 'class="' + tokens.join('(?: [^" ]+)* ') + '(?: [^" ]+)*"';
  }).join(""), "u");
}

const steps = [
  { code: "tool init", detail: "Create one exact workspace.", label: "Initialize" },
  { code: "tool run job-01", detail: "Run the named job.", label: "Execute" },
] as const;

test("the product hero renders a complete semantic narrative without client behavior", () => {
  const html = renderToStaticMarkup(
    <ProductHero
      actions={[
        { href: "#install", label: "Install Relay" },
        { href: "#workflow", label: "See the workflow" },
      ]}
      boundary="Local CLI · version 1.2.3 · sync optional"
      className="product-hero"
      eyebrow="A reference developer tool"
      facts={[
        { detail: "One exact source.", label: "Input", value: "Repository" },
        { detail: "One inspectable result.", label: "Output", value: "Receipt" },
      ]}
      heading="Move one exact job across every interface."
      headingId="relay-title"
      name="Relay"
      proof={{
        content: <MarketingFlow ariaLabel="First Relay job" steps={steps} />,
        heading: "One job, two observable transitions",
        kicker: "Working model",
      }}
      summary="The same owned job can be initialized, run, and inspected from a human or agent surface."
    />,
  );

  expect(html.match(/<h1\b/gu)).toHaveLength(1);
  expect(html).toContain('<header aria-labelledby="relay-title"');
  expect(html).toMatch(marketingMarkupPattern('class="hraness-marketing-hero product-hero"'));
  expect(html).toMatch(marketingMarkupPattern('<aside class="hraness-marketing-proof" aria-labelledby="relay-title-proof">'));
  expect(html).toMatch(marketingMarkupPattern('<h2 class="hraness-marketing-proof__heading" id="relay-title-proof">'));
  expect(html).toContain('<ol aria-label="First Relay job"');
  expect(html).toContain('data-emphasis="primary"');
  expect(html).toContain('data-emphasis="secondary"');
  expect(html).toMatch(marketingMarkupPattern('<dl class="hraness-marketing-facts"'));
  expect(html).toContain("01");
  expect(html).toContain("tool run job-01");
  expect(html).not.toMatch(/onClick|<script\b/iu);
});

test("the marketing compositions preserve headings, native disclosure, and product-owned examples", () => {
  const html = renderToStaticMarkup(
    <>
      <MarketingInstallPanel
        eyebrow="Local release"
        heading="Install the verified tool."
        headingId="install-title"
        id="install"
      >
        <pre><code>bun add --global relay@1.2.3</code></pre>
      </MarketingInstallPanel>
      <MarketingProofFrame caption="Receipt produced by the checked example." credit="Verified 1 September 2026">
        <pre><code>{'{"status":"complete"}'}</code></pre>
      </MarketingProofFrame>
      <MarketingSection heading="Start from one durable object." headingId="workflow-title" id="workflow" label="Workflow">
        <p>The object keeps its identity while interfaces change.</p>
      </MarketingSection>
      <MarketingInterfaceGrid
        heading="One operation, three interfaces."
        headingId="interfaces-title"
        interfaces={[
          { example: <pre><code>relay run</code></pre>, label: "CLI", summary: "For terminals and scripts." },
          { label: "SDK", summary: "For typed application code." },
          { label: "Skill", summary: "For coding-agent instruction." },
        ]}
        label="Interfaces"
      />
      <MarketingTrustBoundary
        heading="The authority stays legible."
        headingId="trust-title"
        items={[
          { detail: "Source files and credentials.", label: "Stays local" },
          { detail: "The exact requested generation input.", label: "Sent by choice" },
        ]}
        label="Boundary"
      />
      <MarketingQuestionList
        heading="Questions before installation."
        headingId="questions-title"
        label="Questions"
        questions={[
          { answer: <p>No. The local workflow works without one.</p>, question: "Does it require an account?" },
        ]}
      />
      <MarketingCallToAction
        actions={[{ href: "#install", label: "Install Relay" }]}
        eyebrow="Ready"
        heading="Run the first exact job."
        headingId="cta-title"
        summary="Free local release for macOS and Linux."
      />
    </>,
  );

  expect(html).toContain('data-hraness-marketing="install"');
  expect(html).toContain('data-hraness-marketing="proof-frame"');
  expect(html).toContain('data-hraness-marketing="section"');
  expect(html).toContain('data-hraness-marketing="interfaces"');
  expect(html).toContain('data-hraness-marketing="trust"');
  expect(html).toContain('data-hraness-marketing="questions"');
  expect(html).toContain('data-hraness-marketing="cta"');
  expect(html).toContain("bun add --global relay@1.2.3");
  expect(html).toMatch(marketingMarkupPattern('<details class="hraness-marketing-question">'));
  expect(html).toContain("Does it require an account?</summary>");
  expect(html).toContain("For typed application code.");
  expect(html).toContain("Source files and credentials.");
  expect(html).toMatch(marketingMarkupPattern('<h3 class="hraness-marketing-interface__heading">CLI</h3>'));
});

test("the related-products composition links each sibling through the featured product", () => {
  const html = renderToStaticMarkup(
    <MarketingRelated
      heading="The rest of the local stack."
      headingId="related-title"
      items={[
        {
          href: "https://relay.example",
          name: "Relay",
          relationship: "Relay runs the exact job the featured product prepares.",
          role: "A reference job runner",
        },
        {
          art: <img alt="" src="/mark.svg" />,
          href: "https://ledger.example",
          name: "Ledger",
          relationship: "Ledger keeps the receipt the featured product writes.",
          role: "A local receipt store",
        },
      ]}
      label="Related"
      summary="Separate tools with separate release cadences."
    />,
  );

  expect(html).toContain('<section aria-labelledby="related-title"');
  expect(html).toContain('data-hraness-marketing="related"');
  expect(html).toMatch(marketingMarkupPattern('<p class="hraness-marketing-related__label">Related</p>'));
  expect(html).toMatch(marketingMarkupPattern('<h2 class="hraness-marketing-related__heading" id="related-title">'));
  expect(html).toContain("Separate tools with separate release cadences.");
  const cards = [...html.matchAll(/<a class="[^"]*hraness-marketing-card[^"]*" data-hraness-marketing="card" href="([^"]+)"/gu)];
  expect(cards.map((match) => match[1])).toEqual(["https://relay.example", "https://ledger.example"]);
  expect(html.match(/hraness-marketing-card__title/gu)).toHaveLength(2);
  expect(html).toContain("A reference job runner");
  expect(html).toContain("Ledger keeps the receipt the featured product writes.");
  expect(html).toContain('src="/mark.svg"');
  expect(html).not.toMatch(/onClick|<script\b/iu);
});

test("the related-products composition groups sibling tiers under their own headings", () => {
  const html = renderToStaticMarkup(
    <MarketingRelated
      groups={[
        {
          heading: "Sibling tools",
          headingId: "related-tools",
          items: [
            {
              href: "https://relay.example",
              name: "Relay",
              relationship: "Relay runs the exact job the featured product prepares.",
              role: "A reference job runner",
            },
          ],
        },
        {
          heading: "Shared infrastructure",
          headingId: "related-infra",
          items: [
            {
              href: "https://conduit.example",
              name: "Conduit",
              relationship: "Conduit carries the receipt every sibling produces.",
              role: "A typed job transport",
            },
          ],
          summary: "One capability layer under every product.",
        },
      ]}
      heading="The rest of the local stack."
      headingId="related-title"
      label="Related"
    />,
  );

  expect(html).toContain('<section aria-labelledby="related-title"');
  expect(html).toContain('data-hraness-marketing="related"');
  const groups = [...html.matchAll(/<div class="[^"]*hraness-marketing-related__group(?!-)[^"]*">/gu)];
  expect(groups).toHaveLength(2);
  expect(html).toMatch(marketingMarkupPattern('<h3 class="hraness-marketing-related__group-heading" id="related-tools">Sibling tools</h3>'));
  expect(html).toMatch(marketingMarkupPattern('<h3 class="hraness-marketing-related__group-heading" id="related-infra">Shared infrastructure</h3>'));
  expect(html).toContain("One capability layer under every product.");
  const rows = [...html.matchAll(/<div aria-label="([^"]+)" class="[^"]*hraness-marketing-card-row[^"]*"/gu)];
  expect(rows.map((match) => match[1])).toEqual(["Sibling tools", "Shared infrastructure"]);
  const cards = [...html.matchAll(/<a class="[^"]*hraness-marketing-card[^"]*" data-hraness-marketing="card" href="([^"]+)"/gu)];
  expect(cards.map((match) => match[1])).toEqual(["https://relay.example", "https://conduit.example"]);
  expect(html).not.toMatch(/onClick|<script\b/iu);
});

test("an embedded hero advances its proof heading without adding another h1", () => {
  const html = renderToStaticMarkup(
    <ProductHero
      eyebrow="Gallery specimen"
      heading="A bounded example."
      headingId="embedded-title"
      headingLevel={2}
      name="Relay"
      proof={{
        content: <MarketingFlow ariaLabel="Embedded flow" steps={steps} />,
        heading: "Inspect the flow",
      }}
      summary="A compact product-neutral example."
    />,
  );

  expect(html).not.toContain("<h1");
  expect(html).toMatch(marketingMarkupPattern('<h2 class="hraness-marketing-hero__heading" id="embedded-title">'));
  expect(html).toMatch(marketingMarkupPattern('<h3 class="hraness-marketing-proof__heading" id="embedded-title-proof">'));
});

test("every public heading level renders its matching native element", () => {
  for (const headingLevel of [1, 2, 3, 4, 5, 6] as const) {
    const html = renderToStaticMarkup(
      <MarketingSection
        heading={`Level ${String(headingLevel)}`}
        headingId={`level-${String(headingLevel)}`}
        headingLevel={headingLevel}
        label="Heading contract"
      >
        <p>Consumer-owned content.</p>
      </MarketingSection>,
    );

    expect(html).toMatch(
      marketingMarkupPattern(`<h${String(headingLevel)} class="hraness-marketing-section__heading" id="level-${String(headingLevel)}">`),
    );
  }
});

test("the premium roles render semantic, server-only HTML with the shared data hooks", () => {
  const html = renderToStaticMarkup(
    <MarketingPage>
      <MarketingSiteHeader
        action={{ href: "#install", label: "Install Relay" }}
        brand="Relay"
        links={[
          { current: true, href: "#how", label: "How it works" },
          { href: "#pricing", label: "Pricing" },
        ]}
      />
      <ProductHero
        actions={[{ href: "#install", label: "Install Relay" }]}
        example="Ask your agent to run the nightly job."
        eyebrow="A reference developer tool"
        frame={(
          <MarketingProofFrame caption="One receipt." title="relay run job-01">
            <pre><code>{'{"status":"complete"}'}</code></pre>
          </MarketingProofFrame>
        )}
        heading="Move one job across every interface"
        headingId="relay-title"
        name="Relay"
        summary="Relay runs the same job from a terminal, typed code, or a coding agent."
        tone="accent"
      />
      <MarketingPillars
        ariaLabel="Relay in three points"
        pillars={[
          { label: "Fast", summary: "Runs locally." },
          { label: "Legible", summary: "Leaves a receipt." },
          { label: "Yours", summary: "Stays on your machine." },
        ]}
      />
      <MarketingSection heading="Split layout." headingId="split-title" label="Layout" layout="split" summary="A lead.">
        <p>Body.</p>
      </MarketingSection>
      <MarketingPrimitives
        heading="Small building blocks."
        headingId="primitives-title"
        items={[
          { label: "Jobs", summary: "A named unit of work." },
          { label: "Receipts", summary: "The record of one run." },
        ]}
        label="Primitives"
      />
      <MarketingStatStrip
        ariaLabel="Relay usage"
        source="Counted on 5 September 2026."
        stats={[
          { label: "Example jobs", value: "12" },
          { label: "Accounts required", value: "0" },
        ]}
      />
      <MarketingQuoteGrid
        heading="From people building with it."
        headingId="quotes-title"
        label="Quotes"
        quotes={[{ href: "https://example.com/a", name: "A. Example", quote: "It works.", role: "@example" }]}
      />
      <MarketingPricing
        heading="Free for local use."
        headingId="pricing-title"
        label="Pricing"
        plans={[
          {
            action: { href: "#install", label: "Install Relay" },
            emphasis: "primary",
            features: ["Every feature"],
            name: "Local",
            period: "forever",
            price: "$0",
          },
        ]}
      />
      <MarketingMaker
        heading="Built by a maker."
        headingId="maker-title"
        label="Built by"
        links={[{ href: "https://example.com", label: "Personal site" }]}
      >
        <p>A short bio.</p>
      </MarketingMaker>
      <MarketingCallToAction
        actions={[{ href: "#install", label: "Install Relay" }]}
        footnote="Free for local use."
        heading="Give every job the same room."
        headingId="cta-title"
        tone="accent"
      />
    </MarketingPage>,
  );

  expect(html).toMatch(marketingMarkupPattern('class="hraness-marketing-page"'));
  expect(html).toContain('data-hraness-marketing="header"');
  expect(html).toMatch(marketingMarkupPattern('<nav aria-label="Site" class="hraness-marketing-header__nav">'));
  expect(html).toContain('aria-current="page"');
  expect(html).toContain('data-hraness-marketing="hero" data-tone="accent"');
  expect(html).toMatch(marketingMarkupPattern('<p class="hraness-marketing-hero__example">Ask your agent to run the nightly job.</p>'));
  expect(html).toMatch(marketingMarkupPattern('<div class="hraness-marketing-hero__frame">'));
  expect(html).toMatch(marketingMarkupPattern('<span class="hraness-marketing-proof-frame__title">relay run job-01</span>'));
  expect(html).toContain('data-hraness-marketing="pillars"');
  expect(html).toContain("--hraness-marketing-pillar-columns:3");
  expect(html).toContain('data-layout="split"');
  expect(html).toMatch(marketingMarkupPattern('<p class="hraness-marketing-section__summary">A lead.</p>'));
  expect(html).toContain('data-hraness-marketing="primitives"');
  expect(html).toMatch(marketingMarkupPattern('<h3 class="hraness-marketing-primitive__heading">Jobs</h3>'));
  expect(html).toContain('data-hraness-marketing="stats"');
  expect(html).toMatch(marketingMarkupPattern('<p class="hraness-marketing-stats__source">Counted on 5 September 2026.</p>'));
  expect(html).toContain('data-hraness-marketing="quotes"');
  expect(html).toMatch(marketingMarkupPattern('<a class="hraness-marketing-quote__link" href="https://example.com/a">@example</a>'));
  expect(html).toContain('data-hraness-marketing="pricing"');
  expect(html).toMatch(marketingMarkupPattern('<li class="hraness-marketing-plan" data-emphasis="primary">'));
  expect(html).toMatch(marketingMarkupPattern('<strong class="hraness-marketing-plan__value">$0</strong><span class="hraness-marketing-plan__period">forever</span>'));
  expect(html).toContain('data-hraness-marketing="maker"');
  expect(html).toMatch(marketingMarkupPattern('<ul class="hraness-marketing-maker__links">'));
  expect(html).toContain('data-hraness-marketing="cta" data-tone="accent"');
  expect(html).toMatch(marketingMarkupPattern('<p class="hraness-marketing-cta__footnote">Free for local use.</p>'));
  expect(html.match(/<h1\b/gu)).toHaveLength(1);
  expect(html).not.toMatch(/onClick|<script\b/iu);
});

test("the site header publishes a sticky position hook for clearance", () => {
  const sticky = renderToStaticMarkup(<MarketingSiteHeader brand="Relay" links={[]} />);
  expect(sticky).toContain('data-position="sticky"');
  expect(sticky).toMatch(marketingMarkupPattern('class="hraness-marketing-header"'));
  const embedded = renderToStaticMarkup(<MarketingSiteHeader brand="Relay" links={[]} sticky={false} />);
  expect(embedded).toContain('data-position="static"');
  expect(embedded).toMatch(marketingMarkupPattern('class="hraness-marketing-header"'));
});

test("the main landmark binds skip and hash targets to the sticky offset", () => {
  const html = renderToStaticMarkup(<MarketingMain><p>Owned content.</p></MarketingMain>);
  expect(html).toContain('id="main-content"');
  expect(html).toContain('data-hraness-marketing="main"');
  expect(html).not.toContain("data-hraness-clearance");
  expect(html).toMatch(marketingMarkupPattern('class="hraness-marketing-main"'));
  const padded = renderToStaticMarkup(<MarketingMain clearance="pad" id="article"><p>Owned content.</p></MarketingMain>);
  expect(padded).toContain('id="article"');
  expect(padded).toContain('data-hraness-clearance="pad"');
  expect(() => renderToStaticMarkup(<MarketingMain clearance={"fixed" as "scroll"}>Bad</MarketingMain>))
    .toThrow("Marketing main clearance must be scroll or pad.");
});

test("marketing card rows stretch equal-height items and reserve two-line meta", () => {
  const html = renderToStaticMarkup(
    <MarketingCardRow ariaLabel="Release radar" cards={[
      { art: <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>, href: "#short", title: "Grok 4.7", meta: "First observed 21 September 2026." },
      { title: "GLM 5.3 Flash", meta: "First observed 26 August 2026. Early DeepSWE 63.4% pass@1." },
    ]}>
      <MarketingCard title="A wrapped product title that must stay complete">Extra body.</MarketingCard>
    </MarketingCardRow>,
  );
  expect(html).toContain('aria-label="Release radar"');
  expect(html).toContain('data-hraness-marketing="card-row"');
  expect(html).toMatch(marketingMarkupPattern('class="hraness-marketing-card-row"'));
  expect(html).toContain('href="#short"');
  expect(html).toContain("A wrapped product title that must stay complete");
  expect(html).toMatch(marketingMarkupPattern('class="hraness-marketing-card__title"'));
  expect(html).toMatch(marketingMarkupPattern('class="hraness-marketing-card__meta"'));
  expect(html).toMatch(marketingMarkupPattern('class="hraness-marketing-card__body"'));
  expect(html).toMatch(marketingMarkupPattern('class="hraness-marketing-card__art"'));
  expect(html).toContain('data-hraness-marketing="card-art"');
  expect(html.match(/data-hraness-marketing="card"/gu)).toHaveLength(3);
  expect(html.match(/data-hraness-marketing="card-art"/gu)).toHaveLength(1);
  expect(html).not.toMatch(/line-clamp|text-overflow: ellipsis/u);
  expect(renderToStaticMarkup(<MarketingCard title="No art" />)).not.toContain("hraness-marketing-card__art");
  expect(renderToStaticMarkup(<MarketingCardArt>Mark</MarketingCardArt>)).toMatch(
    marketingMarkupPattern('class="hraness-marketing-card__art"'),
  );
});

test("empty quote and pillar collections render nothing", () => {
  expect(renderToStaticMarkup(
    <MarketingQuoteGrid heading="Quotes." headingId="q" label="Quotes" quotes={[]} />,
  )).toBe("");
  expect(renderToStaticMarkup(<MarketingPillars ariaLabel="Pillars" pillars={[]} />)).toBe("");
});


test("a compact hero can omit its eyebrow without rendering an empty label", () => {
  const html = renderToStaticMarkup(<ProductHero name="Relay" heading="Run the next job" headingId="compact-title" summary="Keep your work in one place." />);
  expect(html).not.toContain("hraness-marketing-hero__eyebrow");
  expect(html).toContain("Run the next job");
  const labeled = renderToStaticMarkup(<ProductHero eyebrow="Developer tools" name="Relay" heading="Run the next job" headingId="labeled-title" summary="Keep your work in one place." />);
  expect(labeled).toContain("hraness-marketing-hero__eyebrow");
  expect(labeled).toContain("Developer tools");
});


test("editorial and minimal presets remain explicit, server-safe composition boundaries", () => {
  for (const preset of ["editorial", "minimal"] as const) {
    const html = renderToStaticMarkup(<MarketingPage preset={preset}><MarketingField className="product-opening"><MarketingSection heading="One clear heading" headingId="clear">Product-owned content</MarketingSection></MarketingField></MarketingPage>);
    expect(html).toContain(`data-hraness-marketing-preset="${preset}"`);
    expect(html).toContain('class="hraness-marketing-field product-opening"');
    expect(html).not.toContain('hraness-marketing-section__label');
    expect(html).not.toMatch(/<script|<img|style=/u);
  }
  expect(renderToStaticMarkup(<MarketingPage>Default content</MarketingPage>)).not.toContain("data-hraness-marketing-preset");
  expect(() => renderToStaticMarkup(<MarketingPage preset={"unknown" as "editorial"}>Invalid</MarketingPage>)).toThrow();
});

test("optional generic labels omit their slots while factual labels remain visible", () => {
  const html = renderToStaticMarkup(<><MarketingQuestionList heading="Questions" headingId="questions" questions={[{ question: "How?", answer: "A concrete answer." }]} /><MarketingInstallPanel heading="Install" headingId="install"><code>relay run</code></MarketingInstallPanel><MarketingMaker heading="Maker" headingId="maker"><p>Product-owned biography.</p></MarketingMaker></>);
  expect(html).not.toContain("hraness-marketing-questions__label");
  expect(html).not.toContain("hraness-marketing-install__eyebrow");
  expect(html).not.toContain("hraness-marketing-maker__label");
  expect(html).toContain("A concrete answer.");
});

test("empty legacy-compatible React eyebrows omit their atomic display slot", () => {
  const html = renderToStaticMarkup(<ProductHero eyebrow="" name="Relay" heading="Clear" headingId="clear-empty" summary="Factual summary." />);
  expect(html).not.toContain("hraness-marketing-hero__eyebrow");
});

test("the in-flow site footer renders the product lockup, note, and quiet navigation", () => {
  const mark = <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 2h20v20H2z" /></svg>;
  const html = renderToStaticMarkup(
    <MarketingSiteFooter
      brand={mark}
      brandHref="/"
      brandLabel="Relay home"
      links={[{ href: "/docs", label: "Docs" }, { current: true, href: "/install", label: "Install" }]}
      name="Relay"
    >
      <p>Local by default.</p>
    </MarketingSiteFooter>,
  );
  expect(html).toMatch(marketingMarkupPattern('<footer aria-label="Site" class="hraness-marketing-footer" data-hraness-marketing="footer">'));
  expect(html).toMatch(marketingMarkupPattern('<a class="hraness-marketing-footer__brand" href="/" aria-label="Relay home">'));
  expect(html).toMatch(marketingMarkupPattern('<span class="hraness-marketing-footer__name">Relay</span>'));
  expect(html.indexOf("<svg")).toBeLessThan(html.indexOf("hraness-marketing-footer__name"));
  expect(html).toMatch(marketingMarkupPattern('<nav aria-label="Footer navigation" class="hraness-marketing-footer__nav">'));
  expect(html).toContain('aria-current="page"');
  expect(html).toContain("Local by default.");
  expect(html).not.toMatch(/onClick|<script\b|style=/iu);
});

test("the in-flow site footer omits empty navigation and keeps the landmark distinct", () => {
  const html = renderToStaticMarkup(
    <MarketingSiteFooter ariaLabel="Wordcell" brand={<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 2h20v20H2z" /></svg>} name="Wordcell" />,
  );
  expect(html).toContain('<footer aria-label="Wordcell"');
  expect(html).not.toContain("<nav");
  expect(html).toContain('href="/"');
  expect(html).toMatch(marketingMarkupPattern('<span class="hraness-marketing-footer__name">Wordcell</span>'));
});
