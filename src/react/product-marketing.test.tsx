import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { parseHTML } from "linkedom";

import {
  MarketingActionLink,
  MarketingCallToAction,
  MarketingCard,
  MarketingCardArt,
  MarketingCardRow,
  MarketingCodeBlock,
  MarketingDataTable,
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

test("card and capability column caps remain server-safe and reject invalid counts", () => {
  for (const columns of [1, 2, 3, 4] as const) {
    const html = renderToStaticMarkup(<>
      <MarketingCardRow columns={columns} cards={[{ title: "One" }, { title: "Two" }]} />
      <MarketingPrimitives columns={columns} heading="Capabilities" headingId="capabilities"
        items={[{ label: "Search", summary: "Find the decision." }]} />
    </>);
    expect(html).not.toMatch(/\sstyle=/u);
    expect(html).toContain('data-hraness-marketing="card-row"');
    expect(html).toContain('aria-labelledby="capabilities"');
  }
  for (const columns of [0, 5, NaN, Infinity, 1.5]) {
    // @ts-expect-error Exercise untyped callers at the public boundary.
    expect(() => renderToStaticMarkup(<MarketingCardRow columns={columns} />)).toThrow(RangeError);
    expect(() => renderToStaticMarkup(
      // @ts-expect-error Exercise untyped callers at the public boundary.
      <MarketingPrimitives columns={columns} heading="Capabilities" headingId="capabilities" items={[]} />,
    )).toThrow(RangeError);
  }
});

test("composed card grids retain content and semantics while forwarding finite column limits", () => {
  const items = Array.from({ length: 4 }, (_, index) => ({ label: `Item ${index}`, detail: `Detail ${index}` }));
  const related = items.map(({ label, detail }) => ({ name: label, role: detail, href: "#products" }));
  for (const columns of [1, 2, 3, 4] as const) {
    const html = renderToStaticMarkup(<>
      <MarketingTrustBoundary columns={columns} heading="Boundaries" headingId="bounds" items={items} />
      <MarketingInterfaceGrid columns={columns} heading="Interfaces" headingId="interfaces" interfaces={items.map(({ label, detail }) => ({ label, summary: detail }))} />
      <MarketingRelated columns={columns} heading="Products" headingId="products" groups={[
        { heading: "Default", headingId: "default", items: related },
        { heading: "Override", headingId: "override", columns: 2, items: related },
      ]} />
    </>);
    const { document } = parseHTML(html);
    expect(document.querySelector("[style], style, script")).toBeNull();
    const trust = document.querySelector(".hraness-marketing-trust-grid");
    const interfaces = document.querySelector(".hraness-marketing-interface-grid");
    if (trust === null || interfaces === null) throw new Error("Composed grids must render their native list containers.");
    expect(trust.tagName).toBe("DL");
    expect(trust.querySelectorAll("dt")).toHaveLength(4);
    expect(trust.querySelectorAll("dd")).toHaveLength(4);
    expect(interfaces.children).toHaveLength(4);
    const rows = [...document.querySelectorAll(".hraness-marketing-related__list")];
    const expected = parseHTML(renderToStaticMarkup(<><MarketingRelated columns={columns} heading="Products" headingId="products-one" items={related} /><MarketingRelated columns={2} heading="Products" headingId="products-two" items={related} /></>)).document;
    expect(rows.map(row => row.className)).toEqual([...expected.querySelectorAll(".hraness-marketing-related__list")].map(row => row.className));
    expect(rows.every(row => row.tagName === "UL" && [...row.children].every(item => item.tagName === "LI"))).toBe(true);
    expect(rows.map(row => row.getAttribute("aria-label"))).toEqual(["Default", "Override"]);
    expect(rows.every(row => row.querySelectorAll("a").length === 4)).toBe(true);
  }
});

test("composed grid column limits reject invalid values at the rendered public boundary", () => {
  for (const value of [0, 5, NaN, Infinity, 1.5, null, "2"]) {
    // Deliberately emulate an untyped consumer.
    const columns = value as unknown as 2;
    for (const element of [
      <MarketingTrustBoundary columns={columns} heading="Boundaries" headingId="bounds" items={[]} />,
      <MarketingInterfaceGrid columns={columns} heading="Interfaces" headingId="interfaces" interfaces={[]} />,
      <MarketingRelated columns={columns} heading="Products" headingId="products" items={[]} />,
      <MarketingRelated heading="Products" headingId="products" groups={[{ heading: "Group", headingId: "group", columns, items: [] }]} />,
    ]) expect(() => renderToStaticMarkup(element)).toThrow(RangeError);
  }
});

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

test("the data table renders a captioned figure with row headings, numeric columns, and honest scope", () => {
  const html = renderToStaticMarkup(
    <MarketingDataTable
      caption="Observed resume trial"
      columns={[
        { label: "Strategy" },
        { label: "Input tokens", numeric: true },
        { label: "Recalled the task?" },
      ]}
      meta="17 September 2026"
      note="One session; not a guarantee."
      rows={[
        ["no compaction", "312,722", "yes"],
        ["elide", "219,167", { content: "yes", tone: "positive" }],
        ["autocompact", "56,300", { content: "no", tone: "negative" }],
      ]}
    />,
  );
  const { document } = parseHTML(html);
  const figure = document.querySelector("figure.hraness-marketing-data-table");
  expect(figure?.getAttribute("data-hraness-marketing")).toBe("data-table");
  const head = figure?.querySelector("figcaption");
  expect(head?.querySelector(".hraness-marketing-data-table__title")?.textContent).toBe("Observed resume trial");
  expect(head?.querySelector(".hraness-marketing-data-table__meta")?.textContent).toBe("17 September 2026");
  const headings = document.querySelectorAll('th[scope="col"]');
  expect(headings.length).toBe(3);
  expect(headings[1]?.hasAttribute("data-numeric")).toBe(true);
  const rows = [...document.querySelectorAll("tbody tr")];
  expect(rows.length).toBe(3);
  for (const row of rows) expect(row.querySelector('th[scope="row"]')).not.toBeNull();
  expect(document.querySelector('td[data-tone="positive"]')?.textContent).toBe("yes");
  expect(document.querySelector('td[data-tone="negative"]')?.textContent).toBe("no");
  expect(figure?.querySelector(".hraness-marketing-data-table__note")?.textContent).toContain("not a guarantee");
  expect(html).not.toMatch(/onClick|<script\b/iu);
});

test("the data table fails closed when a row disagrees with its columns", () => {
  expect(() => renderToStaticMarkup(
    <MarketingDataTable caption="Broken" columns={[{ label: "A" }]} rows={[["a", "b"]]} />,
  )).toThrow(RangeError);
  expect(() => renderToStaticMarkup(
    <MarketingDataTable caption="Broken" columns={[]} rows={[]} />,
  )).toThrow(RangeError);
});

test("the code block renders shared syntax markup inside a measured pre", () => {
  const html = renderToStaticMarkup(
    <MarketingCodeBlock className="product-code" code={'{"ok":true,"count":2}'} language="json" />,
  );
  const { document } = parseHTML(html);
  const block = document.querySelector("pre.hraness-marketing-code.product-code");
  expect(block?.getAttribute("data-hraness-marketing")).toBe("code");
  const code = block?.querySelector("code.syntax-code");
  expect(code?.getAttribute("data-language")).toBe("json");
  expect(code?.className.split(" ").at(0)).toBe("syntax-code");
  expect(code?.className).toContain("language-json");
  expect(code?.querySelector("[class^='sh__token']")).not.toBeNull();
  expect(html).not.toMatch(/onClick|<script\b|style=/iu);
});

test("the related-products composition shows each sibling's mark, name, and one-line role", () => {
  const mark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M0 0h16v16H0z'/%3E%3C/svg%3E";
  const html = renderToStaticMarkup(
    <MarketingRelated
      heading="The rest of the local stack."
      headingId="related-title"
      items={[
        {
          href: "https://relay.example",
          mark,
          name: "Relay",
          relationship: "Relay runs the exact job the featured product prepares.",
          role: "A reference job runner",
        },
        {
          art: <img alt="" src="/mark.svg" />,
          href: "https://ledger.example",
          mark,
          name: "Ledger",
          role: "A local receipt store",
        },
        { href: "https://index.example", name: "Index", role: "A local search index" },
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
  const { document } = parseHTML(html);
  const cards = [...document.querySelectorAll('a[data-hraness-marketing="card"]')];
  expect(cards.map((card) => card.getAttribute("href"))).toEqual(["https://relay.example", "https://ledger.example", "https://index.example"]);
  for (const card of cards) {
    expect(card.className.split(" ")[0]).toBe("hraness-marketing-related__card");
    expect(card.hasAttribute("data-foil")).toBe(true);
    // Card names sit one level below the section heading and never use the card-title hook.
    expect(card.querySelector("h3")?.className.split(" ")[0]).toBe("hraness-marketing-related__card-name");
    expect(card.querySelector(".hraness-marketing-card__title, .hraness-marketing-card__meta")).toBeNull();
  }
  expect(cards.map((card) => card.querySelector(".hraness-marketing-related__card-role")?.textContent)).toEqual([
    "A reference job runner", "A local receipt store", "A local search index",
  ]);
  // One line per product: the relation sentence is not rendered.
  expect(html).not.toContain("Relay runs the exact job");
  // A mark renders as a decorative foil mark; custom art wins; no mark leaves the slot out.
  const [relay, ledger, index] = cards;
  expect(relay?.querySelector('.hraness-marketing-related__card-mark[aria-hidden="true"] > [data-foil] img')?.getAttribute("src")).toBe(mark);
  expect(ledger?.querySelector(".hraness-marketing-related__card-mark img")?.getAttribute("src")).toBe("/mark.svg");
  expect(ledger?.querySelectorAll(".hraness-marketing-related__card-mark")).toHaveLength(1);
  expect(index?.querySelector(".hraness-marketing-related__card-mark")).toBeNull();
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
  const { document } = parseHTML(html);
  const groups = [...document.querySelectorAll(".hraness-marketing-related__group")];
  expect(groups).toHaveLength(2);
  expect(groups.map((group) => group.getAttribute("aria-labelledby"))).toEqual(["related-tools", "related-infra"]);
  expect(html).toMatch(marketingMarkupPattern('<h3 class="hraness-marketing-related__group-heading" id="related-tools">Sibling tools</h3>'));
  expect(html).toMatch(marketingMarkupPattern('<h3 class="hraness-marketing-related__group-heading" id="related-infra">Shared infrastructure</h3>'));
  expect(html).toContain("One capability layer under every product.");
  const lists = [...document.querySelectorAll(".hraness-marketing-related__list")];
  expect(lists).toHaveLength(2);
  expect(lists.every((list) => list.tagName === "UL")).toBe(true);
  const cards = [...html.matchAll(/<a class="[^"]*hraness-marketing-related__card[^"]*" data-foil="" data-hraness-marketing="card" href="([^"]+)"/gu)];
  expect(cards.map((match) => match[1])).toEqual(["https://relay.example", "https://conduit.example"]);
  // Card names nest under their tier heading.
  expect(html.match(/<h4 class="hraness-marketing-related__card-name[^"]*">/gu)).toHaveLength(2);
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

test("split sections keep a concrete next step with the heading and the result beside it", () => {
  const html = renderToStaticMarkup(
    <MarketingSection
      heading="Publish your work"
      headingContent={<><code>relay publish</code><MarketingActionLink href="/docs/publish" label="Publish a page" /></>}
      headingId="publish-title"
      label="Publish"
      layout="split"
      summary="Share a readable page."
    >
      <article aria-label="Published page">The published result.</article>
    </MarketingSection>,
  );
  const { document } = parseHTML(html);
  const lead = document.querySelector(".hraness-marketing-section__heading-content");
  expect(lead?.querySelector("code")?.textContent).toBe("relay publish");
  expect(lead?.querySelector("a")?.getAttribute("href")).toBe("/docs/publish");
  expect(lead?.querySelector("a")?.getAttribute("data-emphasis")).toBe("primary");
  expect(lead?.querySelector("article")).toBeNull();
  expect(document.querySelector("article")?.textContent).toBe("The published result.");
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

test("icon cards keep their identity beside complete copy and reject illustration mixing", () => {
  const icon = <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>;
  const { document } = parseHTML(renderToStaticMarkup(<MarketingCardRow cards={[
    { icon, href: "/compare", title: "Local notes", meta: "Read every decision." },
  ]} />));
  const card = document.querySelector("a.hraness-marketing-card");
  expect(card?.getAttribute("data-layout")).toBe("icon");
  expect(card?.getAttribute("href")).toBe("/compare");
  expect(card?.querySelector(".hraness-marketing-card__icon")?.getAttribute("aria-hidden")).toBe("true");
  expect(card?.querySelector(".hraness-marketing-card__copy > h3")?.textContent).toBe("Local notes");
  expect(card?.querySelector(".hraness-marketing-card__copy > p")?.textContent).toBe("Read every decision.");
  expect(card?.querySelector(".hraness-marketing-card__art")).toBeNull();
  expect(renderToStaticMarkup(<MarketingCard icon={icon} title="Card">Body</MarketingCard>)).toContain("hraness-marketing-card__body");
  expect(renderToStaticMarkup(<MarketingCard icon={null} title="No visual" />)).not.toContain('data-layout="icon"');
  expect(() => renderToStaticMarkup(
    // @ts-expect-error Art and icon must not be authored together; the runtime also rejects foreign props.
    <MarketingCard icon={icon} art={icon} title="Mixed" />,
  )).toThrow("Marketing cards accept either icon or art, not both.");
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


test("studio products carry the category tone, domain and compact decorative mark", () => {
  const { document } = parseHTML(renderToStaticMarkup(
    <MarketingRelated heading="Other tools from our studio" headingId="studio" groups={[
      { heading: "Relationships", headingId: "relationships", tone: "rose", items: [
        { href: "https://peopleblade.com", name: "PeopleBlade", domain: "peopleblade.com", mark: "/peopleblade.svg", role: "A private contact book" },
      ] },
    ]} />,
  ));
  expect(document.querySelector(".hraness-marketing-related__group")?.getAttribute("data-tone")).toBe("rose");
  expect(document.querySelector(".hraness-marketing-related__card-domain")?.textContent).toBe("peopleblade.com");
  expect(document.querySelector(".hraness-marketing-related__card-mark img")?.getAttribute("width")).toBe("28");
  expect(document.querySelectorAll(".hraness-marketing-related__item > a")).toHaveLength(1);
  expect(document.querySelector(".hraness-marketing-related__label, .hraness-marketing-related__summary")).toBeNull();
});

test("benefit pillars use concise terms with optional decorative icons", () => {
  const html = renderToStaticMarkup(<MarketingPillars ariaLabel="Benefits" columns={3} presentation="benefits" pillars={[{ label: "Your data", summary: "Keep a portable local copy.", icon: <svg /> }]} />);
  const { document } = parseHTML(html);
  expect(document.querySelector("dl")?.getAttribute("data-presentation")).toBe("benefits");
  expect(document.querySelector("dt")?.textContent).toBe("Your data");
  expect(document.querySelector("dd")?.textContent).toBe("Keep a portable local copy.");
  expect(document.querySelector("dt span")?.getAttribute("aria-hidden")).toBe("true");
  expect(document.querySelectorAll("[style]")).toHaveLength(0);
});

test("install-forward heroes place the command before actions and omit empty names", () => {
  const { document } = parseHTML(renderToStaticMarkup(<ProductHero heading="Start locally" headingId="install-hero" name="" summary="One command to begin." install={<code>relay install</code>} actions={[{ href: "/docs", label: "Docs" }]} />));
  expect(document.querySelector(".hraness-marketing-hero__name")).toBeNull();
  expect(document.querySelector(".hraness-marketing-hero__install")?.textContent).toBe("relay install");
  expect(document.querySelector(".hraness-marketing-hero__summary")?.nextElementSibling?.classList.contains("hraness-marketing-hero__install")).toBe(true);
});
