import { describe, expect, test } from "bun:test";
import fc from "fast-check";

import {
  MARKETING_MARQUEE_MAX_ITEMS,
  renderMarketingMarqueeHtml,
  resolveMarketingMarquee,
  type MarketingMarqueeInput,
} from "./marketing-marquee.js";
import { providerMark, providerMarkFallback } from "./provider-marks.js";

const services: MarketingMarqueeInput = {
  action: { href: "#providers", label: "See every provider" },
  id: "providers-band",
  items: [
    { name: "X" },
    { name: "LinkedIn" },
    { mark: "facebook", name: "Facebook" },
    { mark: "facebook", name: "Facebook Pages" },
    { mark: "csv", name: "Contact CSV" },
    { name: "Example Listings" },
  ],
  label: "Works with {count} services",
};

function mustMark(identity: string) {
  const mark = providerMark(identity);
  if (mark === undefined) throw new Error(`Expected a registered mark for ${identity}.`);
  return mark;
}

function lists(html: string): readonly string[] {
  return [...html.matchAll(/<ul( aria-hidden="true")? class="hraness-marketing-marquee__list">(.*?)<\/ul>/gu)].map((match) => match[0]);
}

function names(list: string): readonly string[] {
  return [...list.matchAll(/<span class="hraness-marketing-marquee__name">(.*?)<\/span>/gu)].map((match) => match[1] ?? "");
}

describe("resolveMarketingMarquee", () => {
  test("counts the items it shows and wires the label, pause control, and symbols", () => {
    const marquee = resolveMarketingMarquee(services);
    expect(marquee.label).toEqual({ after: " services", before: "Works with ", count: "6" });
    expect(marquee.labelId).toBe("providers-band-label");
    expect(marquee.toggleId).toBe("providers-band-pause");
    expect(marquee.align).toBe("start");
    expect(marquee.className).toBe("hraness-marketing-marquee");
    expect(marquee.pauseLabel).toBe("Pause scrolling");
    expect(marquee.copies).toBe(5);
    expect(marquee.items.map((item) => item.mark.kind)).toEqual(["glyph", "glyph", "glyph", "glyph", "glyph", "monogram"]);
    expect(marquee.items.at(-1)?.mark).toEqual({ kind: "monogram", monogram: "EL" });
  });

  test("shares one symbol between items that use the same mark", () => {
    const marquee = resolveMarketingMarquee(services);
    expect(marquee.symbols.map((symbol) => symbol.id)).toEqual([
      "providers-band-mark-0",
      "providers-band-mark-1",
      "providers-band-mark-2",
      "providers-band-mark-3",
    ]);
    const facebook = marquee.items.filter((item) => item.name.startsWith("Facebook")).map((item) => item.mark);
    expect(facebook).toEqual([
      { kind: "glyph", symbolId: "providers-band-mark-2" },
      { kind: "glyph", symbolId: "providers-band-mark-2" },
    ]);
    expect(marquee.symbols[2]?.body).toBe(providerMark("facebook")?.glyph.body);
  });

  test("renders descriptors directly and keeps fallback descriptors as monograms", () => {
    const marquee = resolveMarketingMarquee({
      id: "agents",
      items: [
        { mark: mustMark("claude code"), name: "Claude Code" },
        { mark: providerMarkFallback("Some Agent"), name: "Some Agent" },
      ],
      label: "{count} agents",
    });
    expect(marquee.items.map((item) => item.mark)).toEqual([
      { kind: "glyph", symbolId: "agents-mark-0" },
      { kind: "monogram", monogram: "SA" },
    ]);
    expect(marquee.label).toEqual({ after: " agents", before: "", count: "2" });
  });

  test("rejects input that would mislabel, duplicate, or break the band", () => {
    const valid = services;
    const cases: readonly [string, MarketingMarqueeInput][] = [
      ["no count", { ...valid, label: "Works with many services" }],
      ["two counts", { ...valid, label: "{count} of {count}" }],
      ["empty label", { ...valid, label: "   " }],
      ["no items", { ...valid, items: [] }],
      ["too many items", { ...valid, items: Array.from({ length: MARKETING_MARQUEE_MAX_ITEMS + 1 }, (_, index) => ({ name: `Service ${index}` })) }],
      ["duplicate names", { ...valid, items: [{ name: "X" }, { name: " X " }] }],
      ["empty name", { ...valid, items: [{ name: " " }] }],
      ["bad id", { ...valid, id: "1band" }],
      ["id with spaces", { ...valid, id: "provider band" }],
      ["unsafe action", { ...valid, action: { href: "javascript:alert(1)", label: "Open" } }],
      ["empty action label", { ...valid, action: { href: "/providers", label: "" } }],
      ["unknown align", { ...valid, align: "end" as "start" }],
      ["empty pause label", { ...valid, pauseLabel: "" }],
      ["scripted artwork", {
        ...valid,
        items: [{ mark: { ...mustMark("x"), glyph: { body: "<script>alert(1)</script>", viewBox: "0 0 24 24" } }, name: "X" }],
      }],
      ["broken viewBox", {
        ...valid,
        items: [{ mark: { ...mustMark("x"), glyph: { body: "<path d=\"M0 0h1\"/>", viewBox: "0 0 24 24\" onload=\"x" } }, name: "X" }],
      }],
    ];
    for (const [name, input] of cases) {
      expect(() => resolveMarketingMarquee(input), name).toThrow(RangeError);
    }
  });
});

describe("renderMarketingMarqueeHtml", () => {
  test("renders one accessible list and hidden duplicates that fill the loop", () => {
    const html = renderMarketingMarqueeHtml(services);
    expect(html.startsWith('<section aria-labelledby="providers-band-label" class="hraness-marketing-marquee" data-align="start" data-hraness-marketing="marquee" id="providers-band">')).toBe(true);
    expect(html).toContain('<p class="hraness-marketing-marquee__label" id="providers-band-label">Works with <strong class="hraness-marketing-marquee__count">6</strong> services</p>');
    expect(html).toContain('<a class="hraness-marketing-marquee__action hraness-text-link" href="#providers">See every provider</a>');
    expect(html).toContain('<input class="hraness-marketing-marquee__toggle" id="providers-band-pause" type="checkbox"/>');
    expect(html).toContain('<label class="hraness-marketing-marquee__control" for="providers-band-pause"><span class="hraness-marketing-marquee__control-text">Pause scrolling</span>');
    const rendered = lists(html);
    expect(rendered).toHaveLength(5);
    expect(rendered[0]?.startsWith('<ul class=')).toBe(true);
    for (const duplicate of rendered.slice(1)) expect(duplicate.startsWith('<ul aria-hidden="true" class=')).toBe(true);
    for (const list of rendered) expect(names(list)).toEqual(services.items.map((item) => item.name));
    expect(html).toContain('<span aria-hidden="true" class="hraness-marketing-marquee__monogram">EL</span>');
  });

  test("keeps artwork small and in the text color before the stylesheet loads", () => {
    const html = renderMarketingMarqueeHtml(services);
    expect(html).toContain('<svg aria-hidden="true" class="hraness-marketing-marquee__sprite" focusable="false" height="0" width="0">');
    expect(html).toContain('<svg aria-hidden="true" class="hraness-marketing-marquee__mark" fill="currentColor" focusable="false" height="20" width="20"><use href="#providers-band-mark-0"></use></svg>');
    expect(html.match(/class="hraness-marketing-marquee__control-icon" data-icon="(?:pause|play)" fill="currentColor" focusable="false" height="16" viewBox="0 0 16 16" width="16"/gu)).toHaveLength(2);
  });

  test("defines every referenced symbol once", () => {
    const html = renderMarketingMarqueeHtml(services);
    const defined = [...html.matchAll(/<symbol id="([^"]+)" viewBox="[^"]+">/gu)].map((match) => match[1]);
    const referenced = new Set([...html.matchAll(/<use href="#([^"]+)"><\/use>/gu)].map((match) => match[1]));
    expect(new Set(defined).size).toBe(defined.length);
    expect([...referenced].sort()).toEqual([...defined].sort());
  });

  test("escapes names, labels, links, and caller classes", () => {
    const html = renderMarketingMarqueeHtml({
      action: { href: "/sources?kind=all&sort=name", label: "Sources & limits" },
      className: 'product-band" data-x="1',
      id: "escaped",
      items: [{ name: "Tom & Jerry's <Shop>" }],
      label: "<b>{count}</b> \"sources\"",
      pauseLabel: "Pause <now>",
    });
    expect(html).toContain('class="hraness-marketing-marquee product-band&quot; data-x=&quot;1"');
    expect(html).toContain("Tom &amp; Jerry&#x27;s &lt;Shop&gt;");
    expect(html).toContain('href="/sources?kind=all&amp;sort=name">Sources &amp; limits</a>');
    expect(html).toContain("&lt;b&gt;<strong");
    expect(html).toContain("Pause &lt;now&gt;");
    expect(html).not.toContain("<Shop>");
  });

  test("omits the sprite when no item has registered artwork and centers on request", () => {
    const html = renderMarketingMarqueeHtml({ align: "center", id: "plain", items: [{ name: "Example One" }, { name: "Example Two" }], label: "{count} examples" });
    expect(html).not.toContain("__sprite");
    expect(html).toContain('data-align="center"');
  });

  test("any valid catalog renders an exact count, one accessible copy, and a gap-free loop", () => {
    const name = fc.string({ minLength: 1, maxLength: 24 }).map((value) => value.replaceAll(/\s+/gu, " ").trim()).filter((value) => value !== "");
    fc.assert(fc.property(
      fc.uniqueArray(name, { minLength: 1, maxLength: MARKETING_MARQUEE_MAX_ITEMS }),
      fc.string({ maxLength: 20 }).filter((value) => !value.includes("{count}")),
      fc.string({ maxLength: 20 }).filter((value) => !value.includes("{count}")),
      fc.constantFrom("start", "center"),
      (itemNames, before, after, align) => {
        const label = `${before}{count}${after}`;
        const input: MarketingMarqueeInput = { align, id: "band", items: itemNames.map((itemName) => ({ name: itemName })), label };
        const marquee = resolveMarketingMarquee(input);
        expect(marquee.label.count).toBe(String(itemNames.length));
        expect((marquee.copies - 1) * itemNames.length).toBeGreaterThanOrEqual(20);
        expect(marquee.copies).toBeGreaterThanOrEqual(2);
        const html = renderMarketingMarqueeHtml(input);
        const rendered = lists(html);
        expect(rendered).toHaveLength(marquee.copies);
        expect(rendered.filter((list) => !list.startsWith('<ul aria-hidden="true"'))).toHaveLength(1);
        const escapedNames = marquee.items.map((item) => item.name.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;"));
        expect(names(rendered[0] ?? "")).toEqual(escapedNames);
        const defined = new Set([...html.matchAll(/<symbol id="([^"]+)"/gu)].map((match) => match[1]));
        for (const match of html.matchAll(/<use href="#([^"]+)">/gu)) expect(defined.has(match[1])).toBe(true);
      },
    ), { numRuns: 300, seed: 20261004 });
  });
});
