import type * as Marketing from "../src/react/product-marketing.js";

/** Closed, named coverage shared by the DOM tests and retained browser receipt. */
export const productMarketingCoverage = [
  ["MarketingPage", ".hraness-marketing-page", 1],
  ["MarketingSiteHeader", ".hraness-marketing-header", 2],
  ["ProductHero", ".hraness-marketing-hero", 4],
  ["MarketingFlow", ".hraness-marketing-flow", 5],
  ["MarketingFacts", ".hraness-marketing-facts", 5],
  ["MarketingPillars", ".hraness-marketing-pillars", 1],
  ["MarketingInstallPanel", ".hraness-marketing-install", 1],
  ["MarketingProofFrame", ".hraness-marketing-proof-frame", 6],
  ["MarketingSection", ".hraness-marketing-section", 4],
  ["MarketingPrimitives", ".hraness-marketing-primitives", 1],
  ["MarketingStatStrip", ".hraness-marketing-stats", 1],
  ["MarketingInterfaceGrid", ".hraness-marketing-interfaces", 1],
  ["MarketingTrustBoundary", ".hraness-marketing-trust", 1],
  ["MarketingQuoteGrid", ".hraness-marketing-quotes", 1],
  ["MarketingPricing", ".hraness-marketing-pricing", 1],
  ["MarketingQuestionList", ".hraness-marketing-questions", 1],
  ["MarketingMaker", ".hraness-marketing-maker", 1],
  ["MarketingCallToAction", ".hraness-marketing-cta", 2],
  ["hero paper center", '.hraness-marketing-hero[data-tone="paper"][data-align="center"]', 1],
  ["hero paper start", '.hraness-marketing-hero[data-tone="paper"][data-align="start"]', 1],
  ["hero accent center", '.hraness-marketing-hero[data-tone="accent"][data-align="center"]', 1],
  ["hero accent start", '.hraness-marketing-hero[data-tone="accent"][data-align="start"]', 1],
  ["section stack", '.hraness-marketing-section[data-layout="stack"]', 2],
  ["section split", '.hraness-marketing-section[data-layout="split"]', 1],
  ["section reversed", '.hraness-marketing-section[data-layout="split-reverse"]', 1],
  ["CTA paper", '.hraness-marketing-cta[data-tone="paper"]', 1],
  ["CTA accent", '.hraness-marketing-cta[data-tone="accent"]', 1],
  ["primary plan", '.hraness-marketing-plan[data-emphasis="primary"]', 1],
  ["secondary plan", '.hraness-marketing-plan[data-emphasis="secondary"]', 1],
  ["primary actions", '.hraness-marketing-action[data-emphasis="primary"]', 8],
  ["secondary actions", '.hraness-marketing-action[data-emphasis="secondary"]', 8],
  ["native disclosures", "details.hraness-marketing-question > summary", 2],
  ["static header", ".fixture-static-header", 1],
] as const;

export const productMarketingConsumerCoverage = [
  "brand-svg", "proof-pre-paper-center", "proof-pre-paper-start", "proof-pre-accent-center", "proof-pre-accent-start",
  "proof-image", "proof-video", "install-pre", "install-code",
  "section-first-stack", "section-last-stack", "section-link-stack", "section-code-stack",
  "section-first-split", "section-last-split", "section-link-split", "section-code-split",
  "section-first-split-reverse", "section-last-split-reverse", "section-link-split-reverse", "section-code-split-reverse",
  "primitive-pre", "primitive-code", "primitive-paragraph", "interface-paragraph", "interface-pre", "interface-code",
  "question-first", "question-last", "question-single", "maker-portrait", "maker-first", "maker-last", "stats-strong", "stats-span",
] as const;

/** The verifier passes the built server entry. Unit tests pass the source entry. */
export function ProductMarketingFixture({ api }: Readonly<{ api: typeof Marketing }>) {
  const { MarketingPage, MarketingSiteHeader, ProductHero, MarketingFlow, MarketingFacts,
    MarketingPillars, MarketingInstallPanel, MarketingProofFrame, MarketingSection,
    MarketingPrimitives, MarketingStatStrip, MarketingInterfaceGrid, MarketingTrustBoundary,
    MarketingQuoteGrid, MarketingPricing, MarketingQuestionList, MarketingMaker,
    MarketingCallToAction } = api;
  const actions = [{ href: "#install", label: "Install" }, { href: "#interfaces", label: "Explore" }] as const;
  const facts = Array.from({ length: 4 }, (_, index) => ({
    label: `Fact ${index + 1}`, value: `${index + 1}`, detail: "An exact observation.",
  }));
  const steps = [{ label: "Initialize", code: "relay init", detail: "Create a workspace." },
    { label: "Run", code: "relay run", detail: "Inspect the receipt." }];
  return (
    <MarketingPage className="marketing-fixture" id="fixture">
      <MarketingSiteHeader action={actions[0]} brand={<><svg data-marketing-oracle="brand-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 2h20v20H2z" /></svg>Relay</>}
        links={[{ href: "#interfaces", label: "Interfaces", current: true }, { href: "#install", label: "Install" }]} />
      <MarketingSiteHeader action={{ ...actions[1], emphasis: "secondary" }} brand="Embedded" className="fixture-static-header" links={[]} sticky={false} trailing={<span>Consumer trailing</span>} />
      {(["paper", "accent"] as const).flatMap((tone) => (["center", "start"] as const).map((align) => (
        <ProductHero actions={actions} align={align} boundary="Local, optional sync." eyebrow="Reference tool"
          className={tone === "paper" && align === "start" ? "fixture-role-tokens" : ""}
          example="Ask for one inspectable receipt." facts={facts} heading="Keep every result visible."
          headingId={`hero-${tone}-${align}`} headingLevel={2} key={`${tone}-${align}`} name="Relay"
          proof={{ kicker: "Working model", heading: "Two native steps", content: <MarketingFlow ariaLabel="Proof flow" steps={steps} /> }}
          frame={<MarketingProofFrame caption="A real component specimen." credit="Deterministic fixture" title="receipt.json"><pre data-marketing-oracle={`proof-pre-${tone}-${align}`}><code>{'{"complete":true}'}</code></pre></MarketingProofFrame>}
          summary="One owned job across interfaces." tone={tone} />
      )))}
      <MarketingProofFrame caption="Image content."><img data-marketing-oracle="proof-image" alt="A square fixture" width={120} height={60} src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%2760%27%3E%3Crect width=%27120%27 height=%2760%27 fill=%27%23555%27/%3E%3C/svg%3E" /></MarketingProofFrame>
      <MarketingProofFrame caption="Native media sizing."><video data-marketing-oracle="proof-video" aria-label="No-source sizing fixture" width={120} height={60} /></MarketingProofFrame>
      <MarketingPillars ariaLabel="Three pillars" pillars={facts.slice(0, 3).map(({ label, detail }) => ({ label, summary: detail }))} />
      <MarketingInstallPanel eyebrow="Install" heading="Run locally." headingId="install-title" id="install">
        <pre data-marketing-oracle="install-pre"><code data-marketing-oracle="install-code">bun add relay</code></pre>
        <MarketingFlow ariaLabel="Installation steps" steps={steps} />
        <MarketingFacts facts={facts.slice(0, 1)} />
      </MarketingInstallPanel>
      {(["stack", "split", "split-reverse"] as const).map((layout) => (
        <MarketingSection heading={`A ${layout} narrative.`} headingId={`section-${layout}`} key={layout} label="Workflow" layout={layout} summary="The product owns the content.">
          <p data-marketing-oracle={`section-first-${layout}`}>First paragraph with <a data-marketing-oracle={`section-link-${layout}`} href="#install">a link</a> and <code data-marketing-oracle={`section-code-${layout}`}>code</code>.</p><p data-marketing-oracle={`section-last-${layout}`}>Last paragraph.</p>
        </MarketingSection>
      ))}
      <MarketingPrimitives heading="Durable objects." headingId="primitives" label="Primitives" summary="A small vocabulary." items={[
        { label: "Job", summary: "One exact unit.", example: <pre data-marketing-oracle="primitive-pre"><code data-marketing-oracle="primitive-code">job-01</code></pre> },
        { label: "Receipt", summary: "One observable result.", example: <p data-marketing-oracle="primitive-paragraph">Consumer example paragraph.</p> },
      ]} />
      <MarketingStatStrip ariaLabel="Observed counts" source={<>Snapshot <strong data-marketing-oracle="stats-strong">today</strong><span data-marketing-oracle="stats-span">only</span></>} stats={facts} />
      <MarketingInterfaceGrid heading="Choose an interface." headingId="interfaces-title" id="interfaces" label="Interfaces" summary="One result." interfaces={[
        { label: "CLI", summary: "For terminal users.", example: <p data-marketing-oracle="interface-paragraph">Consumer paragraph.</p> },
        { label: "SDK", summary: "For typed code.", example: <pre data-marketing-oracle="interface-pre"><code data-marketing-oracle="interface-code">relay.run()</code></pre> },
      ]} />
      <MarketingTrustBoundary heading="Make authority visible." headingId="trust" label="Trust" summary="No implicit sharing." items={[
        { label: "Local", detail: "Your source." }, { label: "Shared", detail: "An explicit receipt." },
      ]} />
      <MarketingQuoteGrid heading="Attributed examples." headingId="quotes" label="Quotes" summary="Fixture text only." quotes={[
        { name: "Example One", quote: "A deterministic fixture quote.", role: "Author", href: "#fixture" },
        { name: "Example Two", quote: "Another fixture quote.", role: "Reviewer" },
      ]} />
      <MarketingPricing heading="Choose a plan." headingId="pricing" label="Pricing" summary="Two clear boundaries." plans={[
        { name: "Local", price: "$0", period: "forever", emphasis: "primary", summary: "Full local access.", features: ["Local jobs", "Receipts"], action: actions[0], note: "No account." },
        { name: "Sync", price: "$9", period: "monthly", summary: "Optional sharing.", features: ["Explicit sync"], action: actions[1] },
      ]} />
      <MarketingQuestionList heading="Questions." headingId="questions" label="Questions" summary="Native disclosures." questions={[
        { question: "Does it stay local?", answer: <><p data-marketing-oracle="question-first">Yes, unless you choose to share.</p><p data-marketing-oracle="question-last">Last paragraph.</p></> },
        { question: "Does it need JavaScript?", answer: <p data-marketing-oracle="question-single">The disclosure uses native details.</p> },
      ]} />
      <MarketingMaker heading="Built by a maker." headingId="maker" label="Maker" links={[{ href: "#fixture", label: "About" }]}
        portrait={<svg data-marketing-oracle="maker-portrait" viewBox="0 0 24 24" aria-label="Illustrated portrait"><circle cx="12" cy="12" r="10" /></svg>}>
        <p data-marketing-oracle="maker-first">First biography paragraph.</p><p data-marketing-oracle="maker-last">Last biography paragraph.</p>
      </MarketingMaker>
      {(["paper", "accent"] as const).map((tone) => (
        <MarketingCallToAction actions={actions} eyebrow="Ready" heading="Keep the next result." headingId={`cta-${tone}`} key={tone}
          summary="Run one exact job." footnote="Local use remains available." tone={tone} />
      ))}
      <MarketingSection className="fixture-caller-last" heading="Caller presentation." headingId="caller" label="Caller"><p>Unlayered caller styles win.</p></MarketingSection>
    </MarketingPage>
  );
}
