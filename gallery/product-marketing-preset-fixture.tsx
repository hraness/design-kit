import type * as Marketing from "../src/react/product-marketing.js";

/** One compact public contract, rendered by the real built server entry. */
export function ProductMarketingPresetFixture({ api }: Readonly<{ api: typeof Marketing }>) {
  const { MarketingPage, MarketingSiteHeader, MarketingField, ProductHero, MarketingSection, MarketingCallToAction, MarketingTrustBoundary, MarketingInstallPanel } = api;
  return <>
    <header className="hraness-marketing-header-surface fixture-standalone-header">Public reading page</header>
    <header className="hraness-marketing-header-surface fixture-quiet-header" data-hraness-marketing-preset="minimal">Relay</header>
    <MarketingPage preset="editorial">
      <MarketingSiteHeader brand="Relay" brandHref="#editorial-title" links={[]} action={{ href: "#next", label: "Start a job" }} />
      <MarketingField>
        <ProductHero name="Relay" eyebrow="" heading="Every job, one clear next step." headingId="editorial-title"
          summary="A short promise with room to show the product at work."
          actions={[{ href: "#next", label: "Start a job" }]} />
        <MarketingTrustBoundary heading="Your workspace stays local." headingId="field-trust-title"
          items={[{ label: "Local files", detail: "A field-muted detail below the product promise." }]} />
      </MarketingField>
      <MarketingSection id="next" heading="Keep the work visible." headingId="section-title">
        <p>A factual account of what happens next.</p>
        <h2 className="fixture-product-heading">Embedded product heading</h2>
      </MarketingSection>
      <MarketingInstallPanel eyebrow="Verified release" heading="Try one command." headingId="install-title"><code>relay run</code></MarketingInstallPanel>
      <MarketingCallToAction heading="Make the next move." headingId="editorial-cta-title" actions={[{ href: "#next", label: "Start a job" }]} />
      <MarketingPage preset="minimal">
        <MarketingField><ProductHero name="Relay" heading="A compact page." headingId="minimal-title" summary="No textured field in the minimal preset." /></MarketingField>
        <MarketingCallToAction heading="Continue from here." headingId="minimal-cta-title" actions={[{ href: "#next", label: "Continue" }]} />
      </MarketingPage>
    </MarketingPage>
  </>;
}
