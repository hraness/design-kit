import type * as Marketing from "../src/react/product-marketing.js";

/** The browser verifier supplies the built public server entry. */
export function ProductMarketingCspFixture({ api, columns }: Readonly<{ api: typeof Marketing; columns?: Marketing.MarketingColumnCount }>) {
  const { MarketingPage, MarketingSiteHeader, ProductHero, MarketingPillars,
    MarketingStatStrip, MarketingQuestionList, MarketingInstallPanel, MarketingMaker, MarketingSectionLabel,
    MarketingCardRow, MarketingPrimitives } = api;
  const facts = Array.from({ length: 4 }, (_, index) => ({
    label: `Fact ${index + 1}`, value: String(index + 1), detail: "A finite public layout.",
  }));
  return (
    <MarketingPage>
      <MarketingSiteHeader brand="Relay" links={[{ href: "#questions", label: "Questions" }]} sticky={false} />
      <ProductHero eyebrow="Static presentation" name="Relay" heading="Compiled columns without inline styles."
        headingId="strict-heading" summary="Public server-rendered compositions under a strict content policy."
        notice={<p data-strict-slot="notice">A product-owned notice.</p>}
        facts={facts} factsColumns={columns ?? 4} />
      <MarketingPillars ariaLabel="Three pillars" columns={columns ?? 3}
        pillars={facts.slice(0, 3).map(({ label, detail }) => ({ label, summary: detail }))} />
      <MarketingStatStrip ariaLabel="Four observations" columns={columns ?? 4} stats={facts} />
      <MarketingCardRow className="strict-capped-cards" ariaLabel="Four comparisons" columns={columns ?? 2}
        cards={facts.map(({ label, detail }) => ({ title: label, meta: detail }))} />
      <MarketingPrimitives className="strict-capped-primitives" heading="Four capabilities" headingId="strict-primitives" columns={columns ?? 2}
        items={facts.map(({ label, detail }) => ({ label, summary: detail }))} />
      <MarketingCardRow ariaLabel="Nested collections" columns={1}>
        <MarketingCardRow className="strict-natural-cards" ariaLabel="Natural comparisons"
          cards={facts.map(({ label, detail }) => ({ title: label, meta: detail }))} />
        <MarketingPrimitives className="strict-natural-primitives" heading="Natural capabilities" headingId="strict-natural-primitives"
          items={facts.map(({ label, detail }) => ({ label, summary: detail }))} />
      </MarketingCardRow>
      <MarketingInstallPanel eyebrow="One command" heading="Install locally." headingId="strict-install"
        note={<p data-strict-slot="note">Choose the release for your platform.</p>}>
        <pre><code>bun add relay</code></pre>
      </MarketingInstallPanel>
      <MarketingMaker heading="Maintained by its authors." headingId="strict-maker" label="Maker"
        links={[{ href: "#strict-maker", label: "About" }]} linkClassName="strict-maker-link">
        <p>Read the <a href="#strict-install">installation notes</a>.</p>
      </MarketingMaker>
      <MarketingSectionLabel className="strict-default-label">Section</MarketingSectionLabel>
      <MarketingSectionLabel className="strict-body-label" size="body">Reference</MarketingSectionLabel>
      <MarketingQuestionList heading="Questions" headingId="questions" label="Native interaction"
        questions={[{ question: "Does this require inline styles?", answer: <p>No. The finite recipes are compiled.</p> }]} />
    </MarketingPage>
  );
}

export const productMarketingCspGrids = [
  { selector: ".hraness-marketing-facts", items: 4, desktopColumns: 4, narrowColumns: 2 },
  { selector: ".hraness-marketing-pillars", items: 3, desktopColumns: 3, narrowColumns: 1 },
  { selector: ".hraness-marketing-stats__list", items: 4, desktopColumns: 4, narrowColumns: 2 },
  { selector: ".strict-capped-cards", items: 4, desktopColumns: 2, narrowColumns: 1 },
  { selector: ".strict-capped-primitives > ol", items: 4, desktopColumns: 2, narrowColumns: 1 },
] as const;
