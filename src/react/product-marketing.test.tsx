import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  MarketingCallToAction,
  MarketingFlow,
  MarketingInstallPanel,
  MarketingInterfaceGrid,
  MarketingMaker,
  MarketingPage,
  MarketingPillars,
  MarketingPricing,
  MarketingPrimitives,
  MarketingProofFrame,
  MarketingQuestionList,
  MarketingQuoteGrid,
  MarketingSection,
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

test("empty quote and pillar collections render nothing", () => {
  expect(renderToStaticMarkup(
    <MarketingQuoteGrid heading="Quotes." headingId="q" label="Quotes" quotes={[]} />,
  )).toBe("");
  expect(renderToStaticMarkup(<MarketingPillars ariaLabel="Pillars" pillars={[]} />)).toBe("");
});
