import type * as Marketing from "../src/react/product-marketing.js";

/** Closed, named coverage shared by the DOM tests and retained browser receipt. */
export const productMarketingCoverage = [
  ["MarketingPage", ".hraness-marketing-page", 1],
  ["MarketingSiteHeader", ".hraness-marketing-header", 2],
  ["MarketingMain", ".hraness-marketing-main", 1],
  ["sticky sibling", "[data-hraness-sticky]", 1],
  ["MarketingCardRow", ".hraness-marketing-card-row", 2],
  ["MarketingCard", ".hraness-marketing-card", 4],
  ["MarketingCardArt", ".hraness-marketing-card__art", 2],
  ["card icon", ".hraness-marketing-card__icon", 2],
  ["card copy", ".hraness-marketing-card__copy", 2],
  ["MarketingSiteFooter", ".hraness-marketing-footer", 1],
  ["ProductHero", ".hraness-marketing-hero", 4],
  ["MarketingFlow", ".hraness-marketing-flow", 5],
  ["MarketingFacts", ".hraness-marketing-facts", 5],
  ["MarketingPillars", ".hraness-marketing-pillars", 1],
  ["MarketingInstallPanel", ".hraness-marketing-install", 1],
  ["MarketingProofFrame", ".hraness-marketing-proof-frame", 8],
  ["window chrome", '.hraness-marketing-proof-frame[data-chrome="window"]', 4],
  ["browser chrome", '.hraness-marketing-proof-frame[data-chrome="browser"]', 1],
  ["browser address", ".hraness-marketing-proof-frame__address", 1],
  ["terminal chrome", '.hraness-marketing-proof-frame[data-chrome="terminal"]', 1],
  ["MarketingDataTable", ".hraness-marketing-data-table", 1],
  ["data table column head", ".hraness-marketing-data-table__heading", 3],
  ["data table row heading", ".hraness-marketing-data-table__row-heading", 3],
  ["numeric column", ".hraness-marketing-data-table :where(th, td)[data-numeric]", 4],
  ["toned cell", ".hraness-marketing-data-table__cell[data-tone]", 2],
  ["MarketingCodeBlock", "pre.hraness-marketing-code", 1],
  ["code block syntax", "pre.hraness-marketing-code > code.syntax-code", 1],
  ["MarketingSection", ".hraness-marketing-section", 4],
  ["body section label", '.hraness-marketing-section__label[data-size="body"]', 1],
  ["MarketingPrimitives", ".hraness-marketing-primitives", 1],
  ["MarketingStatStrip", ".hraness-marketing-stats", 1],
  ["MarketingNotice", ".hraness-marketing-notice", 3],
  ["error notice", '.hraness-marketing-notice[data-tone="error"][role="alert"]', 1],
  ["MarketingInterfaceGrid", ".hraness-marketing-interfaces", 1],
  ["MarketingTrustBoundary", ".hraness-marketing-trust", 1],
  ["MarketingQuoteGrid", ".hraness-marketing-quotes", 1],
  ["MarketingPricing", ".hraness-marketing-pricing", 1],
  ["MarketingQuestionList", ".hraness-marketing-questions", 1],
  ["MarketingMaker", ".hraness-marketing-maker", 1],
  ["MarketingRelated", ".hraness-marketing-related", 1],
  ["related group", ".hraness-marketing-related__group", 2],
  ["related groups", ".hraness-marketing-related__groups", 1],
  ["related lists", ".hraness-marketing-related__list", 2],
  ["related domain", ".hraness-marketing-related__card-domain", 1],
  ["related group heading", ".hraness-marketing-related__group-heading", 2],
  ["related group summary", ".hraness-marketing-related__group-summary", 1],
  ["related card", ".hraness-marketing-related__card", 3],
  ["related card mark", ".hraness-marketing-related__card-mark", 3],
  ["related card name", ".hraness-marketing-related__card-name", 3],
  ["related card role", ".hraness-marketing-related__card-role", 3],
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
  "proof-image", "proof-video", "proof-browser", "proof-terminal", "install-pre", "install-code",
  "section-first-stack", "section-last-stack", "section-link-stack", "section-code-stack",
  "section-first-split", "section-last-split", "section-link-split", "section-code-split",
  "section-first-split-reverse", "section-last-split-reverse", "section-link-split-reverse", "section-code-split-reverse",
  "primitive-pre", "primitive-code", "primitive-paragraph", "interface-paragraph", "interface-pre", "interface-code",
  "question-first", "question-last", "question-single", "maker-portrait", "maker-first", "maker-last", "stats-strong", "stats-span",
  "data-table-note",
  "hero-notice", "install-note", "footer-brand-svg", "footer-note",
] as const;

/** The verifier passes the built server entry. Unit tests pass the source entry. */
/** A same-document data-URL mark, the shape portfolio items carry. */
const fixtureMark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%232474d4' d='M4 4h16v16H4z'/%3E%3C/svg%3E";

export function ProductMarketingFixture({ api }: Readonly<{ api: typeof Marketing }>) {
  const { MarketingPage, MarketingSiteHeader, MarketingMain, MarketingCardRow, ProductHero,
    MarketingFlow, MarketingFacts, MarketingPillars, MarketingInstallPanel, MarketingProofFrame,
    MarketingDataTable, MarketingCodeBlock,
    MarketingSection, MarketingPrimitives, MarketingStatStrip, MarketingNotice, MarketingInterfaceGrid,
    MarketingTrustBoundary, MarketingQuoteGrid, MarketingPricing, MarketingQuestionList,
    MarketingMaker, MarketingRelated, MarketingCallToAction, MarketingSectionLabel, MarketingSiteFooter } = api;
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
      <MarketingMain>
      <div className="hraness-sticky-below-chrome" data-hraness-sticky>Index</div>
      {(["paper", "accent"] as const).flatMap((tone) => (["center", "start"] as const).map((align) => (
        <ProductHero layout={align === "start" ? "split" : "stack"} actions={actions} align={align} boundary="Local, optional sync." eyebrow="Reference tool"
          className={tone === "paper" && align === "start" ? "fixture-role-tokens" : ""}
          notice={tone === "paper" && align === "start" ? <p data-marketing-oracle="hero-notice">Consumer-owned notice.</p> : undefined}
          example="Ask for one inspectable receipt." facts={facts} heading="Keep every result visible."
          headingId={`hero-${tone}-${align}`} headingLevel={2} key={`${tone}-${align}`} name="Relay"
          proof={{ kicker: "Working model", heading: "Two native steps", content: <MarketingFlow ariaLabel="Proof flow" steps={steps} /> }}
          frame={<MarketingProofFrame caption="A real component specimen." credit="Deterministic fixture" title="receipt.json"><pre data-marketing-oracle={`proof-pre-${tone}-${align}`}><code>{'{"complete":true}'}</code></pre></MarketingProofFrame>}
          summary="One owned job across interfaces." tone={tone} />
      )))}
      <MarketingProofFrame caption="Image content."><img data-marketing-oracle="proof-image" alt="A square fixture" width={120} height={60} src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%2760%27%3E%3Crect width=%27120%27 height=%2760%27 fill=%27%23555%27/%3E%3C/svg%3E" /></MarketingProofFrame>
      <MarketingProofFrame caption="Browser chrome." chrome="browser" url="https://relay.example/runs/job-01"><p data-marketing-oracle="proof-browser">Run complete.</p></MarketingProofFrame>
      <MarketingProofFrame caption="Terminal chrome." chrome="terminal" title="relay run job-01"><pre data-marketing-oracle="proof-terminal"><code>$ relay run job-01</code></pre></MarketingProofFrame>
      <MarketingProofFrame caption="Native media sizing."><video data-marketing-oracle="proof-video" aria-label="No-source sizing fixture" width={120} height={60} /></MarketingProofFrame>
      <MarketingDataTable caption="Observed resume trial" columns={[
        { label: "Strategy" },
        { label: "Input tokens", numeric: true },
        { label: "Recalled the task?" },
      ]} meta="17 September 2026"
        note={<span data-marketing-oracle="data-table-note">One session; not a guarantee.</span>}
        rows={[
          ["no compaction", "312,722", "yes"],
          ["elide", "219,167", { content: "yes", tone: "positive" }],
          ["autocompact", "56,300", { content: "no", tone: "negative" }],
        ]} />
      <MarketingCodeBlock code={'relay run --receipt job-01.json'} language="sh" />
      <MarketingPillars ariaLabel="Three pillars" pillars={facts.slice(0, 3).map(({ label, detail }) => ({ label, summary: detail }))} />
      <MarketingInstallPanel eyebrow="Install" heading="Run locally." headingId="install-title" id="install"
        note={<p data-marketing-oracle="install-note">Choose the release for your platform.</p>}>
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
      <MarketingNotice>Nothing changed.</MarketingNotice>
      <MarketingNotice tone="success">Device authorized.</MarketingNotice>
      <MarketingNotice tone="error">That link expired.</MarketingNotice>
      <MarketingStatStrip ariaLabel="Observed counts" source={<>Snapshot <strong data-marketing-oracle="stats-strong">today</strong><span data-marketing-oracle="stats-span">only</span></>} stats={facts} />
      <MarketingInterfaceGrid heading="Choose an interface." headingId="interfaces-title" id="interfaces" label="Interfaces" summary="One result." interfaces={[
        { label: "CLI", summary: "For terminal users.", example: <p data-marketing-oracle="interface-paragraph">Consumer paragraph.</p> },
        { label: "SDK", summary: "For typed code.", example: <pre data-marketing-oracle="interface-pre"><code data-marketing-oracle="interface-code">relay.run()</code></pre> },
      ]} />
      <MarketingCardRow ariaLabel="Release radar" cards={[
        { art: <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" /></svg>, href: "#fixture", title: "Grok 4.7", meta: "First observed 21 September 2026." },
        { art: <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>, href: "#quotes", title: "GLM 5.3 Flash", meta: "First observed 26 August 2026. Early DeepSWE 63.4% pass@1 across four runs on OpenRouter." },
      ]} />
      <MarketingCardRow ariaLabel="Icon comparisons" cards={[
        { icon: <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="56" height="56"><circle cx="12" cy="12" r="8" /></svg>, href: "#fixture", title: "Local notes", meta: "Keep your notes on your own computer." },
        { icon: <img alt="" src={fixtureMark} width="56" height="56" />, href: "#quotes", title: "Search across decisions", meta: "Find decisions in your notes and project history, including longer explanations that wrap on a phone." },
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
      <MarketingMaker heading="Built by a maker." headingId="maker" label="Maker" links={[{ href: "#fixture", label: "About" }]} linkClassName="fixture-maker-link"
        portrait={<svg data-marketing-oracle="maker-portrait" viewBox="0 0 24 24" aria-label="Illustrated portrait"><circle cx="12" cy="12" r="10" /></svg>}>
        <p data-marketing-oracle="maker-first">First biography paragraph.</p><p data-marketing-oracle="maker-last">Last biography paragraph.</p>
      </MarketingMaker>
      <MarketingRelated heading="Other tools from our studio" headingId="related" groups={[
        { heading: "Relationships", headingId: "related-tools", tone: "rose", items: [
          { art: <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M4 4h16v16H4z" /></svg>, href: "#fixture", name: "Ledger", relationship: "Ledger keeps the receipt Relay writes.", role: "A local receipt store" },
          { href: "#interfaces", mark: fixtureMark, name: "Index", domain: "index.example", role: "A local search index" },
        ] },
        { heading: "Knowledge", headingId: "related-infra", tone: "indigo", summary: "One capability layer under every product.", items: [
          { art: <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="9" /></svg>, href: "#fixture", name: "Conduit", relationship: "Conduit carries the receipts every sibling produces.", role: "A typed job transport" },
        ] },
      ]} />
      {(["paper", "accent"] as const).map((tone) => (
        <MarketingCallToAction actions={actions} eyebrow="Ready" heading="Keep the next result." headingId={`cta-${tone}`} key={tone}
          summary="Run one exact job." footnote="Local use remains available." tone={tone} />
      ))}
      <MarketingSection className="fixture-caller-last" heading="Caller presentation." headingId="caller" label="Caller">
        <MarketingSectionLabel className="fixture-body-label" size="body">Body-sized label</MarketingSectionLabel>
        <p>Unlayered caller styles win.</p>
      </MarketingSection>
      </MarketingMain>
      <MarketingSiteFooter
        brand={<svg data-marketing-oracle="footer-brand-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 2h20v20H2z" /></svg>}
        brandLabel="Relay home"
        links={[{ href: "#interfaces", label: "Interfaces" }, { href: "#install", label: "Install", current: true }]}
        name="Relay"
      >
        <p data-marketing-oracle="footer-note">Local by default.</p>
      </MarketingSiteFooter>
    </MarketingPage>
  );
}
