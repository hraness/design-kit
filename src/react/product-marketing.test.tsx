import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  MarketingCallToAction,
  MarketingFlow,
  MarketingInstallPanel,
  MarketingInterfaceGrid,
  MarketingProofFrame,
  MarketingQuestionList,
  MarketingSection,
  MarketingTrustBoundary,
  ProductHero,
} from "./product-marketing";

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
  expect(html).toContain('class="hraness-marketing-hero product-hero"');
  expect(html).toContain('<aside class="hraness-marketing-proof" aria-labelledby="relay-title-proof">');
  expect(html).toContain('<h2 class="hraness-marketing-proof__heading" id="relay-title-proof">');
  expect(html).toContain('<ol aria-label="First Relay job"');
  expect(html).toContain('data-emphasis="primary"');
  expect(html).toContain('data-emphasis="secondary"');
  expect(html).toContain('<dl class="hraness-marketing-facts"');
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
  expect(html).toContain('<details class="hraness-marketing-question">');
  expect(html).toContain("Does it require an account?</summary>");
  expect(html).toContain("For typed application code.");
  expect(html).toContain("Source files and credentials.");
  expect(html).toContain('<h3 class="hraness-marketing-interface__heading">CLI</h3>');
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
  expect(html).toContain('<h2 class="hraness-marketing-hero__heading" id="embedded-title">');
  expect(html).toContain('<h3 class="hraness-marketing-proof__heading" id="embedded-title-proof">');
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

    expect(html).toContain(
      `<h${String(headingLevel)} class="hraness-marketing-section__heading" id="level-${String(headingLevel)}">`,
    );
  }
});
