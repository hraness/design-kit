import type * as Marketing from "../src/react/product-marketing.js";

/** One compact public contract, rendered by the real built server entry. */
export function ProductMarketingPresetFixture({ api }: Readonly<{ api: typeof Marketing }>) {
  const { MarketingPage, MarketingField, ProductHero, MarketingSection, MarketingInstallPanel } = api;
  return <>
    <header className="hraness-marketing-header-surface fixture-quiet-header" data-hraness-marketing-preset="minimal">Relay</header>
    <MarketingPage preset="editorial">
      <MarketingField>
        <ProductHero name="Relay" eyebrow="" heading="Every job, one clear next step." headingId="editorial-title"
          summary="A short promise with room to show the product at work."
          actions={[{ href: "#next", label: "Start a job" }]} />
      </MarketingField>
      <MarketingSection id="next" heading="Keep the work visible." headingId="section-title">
        <p>A factual account of what happens next.</p>
        <h2 className="fixture-product-heading">Embedded product heading</h2>
      </MarketingSection>
      <MarketingInstallPanel eyebrow="Verified release" heading="Try one command." headingId="install-title"><code>relay run</code></MarketingInstallPanel>
      <MarketingPage preset="minimal">
        <MarketingField><ProductHero name="Relay" heading="A compact page." headingId="minimal-title" summary="No textured field in the minimal preset." /></MarketingField>
      </MarketingPage>
    </MarketingPage>
  </>;
}
