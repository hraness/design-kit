import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";

import { mockupFixtureHandles, mockupFixtures, MockupsFixture } from "../../gallery/mockups-fixture.js";
import { assertFakeHandles, assertNoHeadings, assertRoleImgWithLabel, htmlText, renderMatrix, stripMockupSamples } from "../testing.js";
import * as clientApi from "./client.js";
import * as api from "./index.js";

function must<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Expected a value.");
  return value;
}

const css = await readFile(new URL("../mockups.css", import.meta.url), "utf8");
const fixtures = mockupFixtures(api);
type Theme = "light" | "dark";

function classesIn(html: string): Set<string> {
  const names = new Set<string>();
  for (const match of html.matchAll(/\sclass="([^"]*)"/gu)) {
    for (const token of (match[1] ?? "").split(/\s+/u)) if (token.startsWith("hkm-")) names.add(token);
  }
  return names;
}

/**
 * Hook classes that carry no rules of their own: the root kind modifier for
 * kinds styled through their frame, the sample-text marker that tests and
 * detectors select, and the step-through variant hooks for product overrides.
 */
const hookClasses = new Set(["hkm-browser", "hkm-phone", "hkm-sample", "hkm-steps", "hkm-step-tabs"]);

function defined(name: string): boolean {
  if (hookClasses.has(name)) return true;
  return new RegExp(`\\.${name}(?![a-z0-9-])`, "u").test(css);
}

const showcaseHtml = renderToStaticMarkup(
  <clientApi.ModeShowcase
    caption="Illustration. Names and text are made up."
    modes={[
      { id: "plain", label: "Plain", hint: "Shows the text as written." },
      { id: "marked", label: "Marked", hint: "Marks the sample text." },
    ]}
    options={[{ id: "low", label: "Low", hint: "Marks less." }, { id: "high", label: "High", hint: "Marks more." }]}
    optionInactiveModes={["plain"]}
    status={({ mode }) => `Showing ${mode}.`}
    surfaces={fixtures.slice(0, 2).map((fixture) => ({ id: fixture.kind, label: fixture.name, render: ({ theme }: { theme: api.MockupTheme | undefined }) => fixture.render(theme ?? "light") }))}
  />,
);

const stepHtml = renderToStaticMarkup(
  <clientApi.StepThrough
    caption="Illustration. Names and text are made up."
    steps={fixtures.slice(2, 4).map((fixture) => ({ id: fixture.kind, label: fixture.name, hint: `Shows the ${fixture.name.toLowerCase()}.`, render: ({ theme }) => fixture.render(theme ?? "dark") }))}
  />,
);

describe("mockup roots", () => {
  for (const fixture of fixtures) {
    test(`${fixture.name} renders one labelled image in light and dark`, () => {
      const matrix = renderMatrix((theme: Theme) => renderToStaticMarkup(fixture.render(theme)), { light: "light", dark: "dark" });
      for (const { html, props: theme } of matrix) {
        assertRoleImgWithLabel(html, fixture.name);
        assertNoHeadings(html, fixture.name);
        assertFakeHandles(html, mockupFixtureHandles, fixture.name);
        expect(html).toStartWith(`<div`);
        expect(html).toContain(`data-hkm-kind="${fixture.kind}"`);
        expect(html).toContain(`data-hkm-theme="${theme}"`);
        expect(html).toContain('data-nosnippet=""');
        for (const [tag] of html.matchAll(/<[a-z]+\b[^>]*\sstyle="[^"]*(?:#|rgb|hsl)[^>]*>/gu)) {
          expect(tag).toMatch(/class="[^"]*hkm-(?:avatar|photo)/u);
        }
      }
    });
  }

  test("sample text leaves carry the opt-out attributes and strip cleanly", () => {
    const html = renderToStaticMarkup(must(fixtures.find((fixture) => fixture.kind === "inbox")).render("light"));
    const samples = [...html.matchAll(/<span\b[^>]*class="hkm-sample"[^>]*>/gu)];
    expect(samples.length).toBeGreaterThan(4);
    for (const [tag] of samples) expect(tag).toContain('data-sample-skip=""');
    expect(stripMockupSamples(html)).not.toContain("upstairs room");
  });

  test("a missing description fails before rendering", () => {
    expect(() => renderToStaticMarkup(<api.BrowserFrame describe=" " url="https://relay.example"><p>x</p></api.BrowserFrame>)).toThrow("describe");
    expect(() => renderToStaticMarkup(<api.BrowserFrame describe="Illustration." optOut={{ "data-Bad": "" } as never} url="https://relay.example"><p>x</p></api.BrowserFrame>)).toThrow("data- attribute");
  });

  test("addresses stay on reserved example hosts", () => {
    expect(api.mockupAddress("https://relay.example/settings?tab=1")).toEqual({ host: "relay.example", path: "/settings?tab=1" });
    expect(() => api.mockupAddress("https://github.com/org")).toThrow();
  });

  test("client shells render a static first paint without transitions", () => {
    for (const html of [showcaseHtml, stepHtml]) {
      expect(html).not.toContain("data-hkm-animated");
      expect(html).toContain('role="tablist"');
      assertNoHeadings(html, "showcase");
    }
    expect(showcaseHtml).toContain('aria-pressed="true"');
    expect(showcaseHtml).toContain("Illustration. Names and text are made up.");
  });
});

describe("mockups.css parity", () => {
  test("every hkm class the components render is defined in mockups.css", () => {
    const html = [
      renderToStaticMarkup(<MockupsFixture api={api} />),
      showcaseHtml,
      stepHtml,
      renderToStaticMarkup(<api.Hotspot label="Tap here" x={40} y={60} />),
      renderToStaticMarkup(<api.PlaceholderPhoto seed="market" />),
      renderToStaticMarkup(<api.ScrollFade height={120}><p>x</p></api.ScrollFade>),
      renderToStaticMarkup(<api.ChatThread describe="Illustration." messages={[{ from: "them", text: "hi" }]} typing variant="chat" />),
      renderToStaticMarkup(<api.AgentSession agent="generic-chat" describe="Illustration." turns={[{ role: "agent", text: "Done." }, { role: "tool", text: "x", tool: "Edit file", status: "running" }]} />),
    ].join("");
    const missing = [...classesIn(html)].filter((name) => !defined(name));
    expect(missing).toEqual([]);
  });

  test("the stylesheet is layered, themed, container-aware, and motion-safe", () => {
    expect(css).toContain("@layer components.hraness-design-kit.legacy {");
    expect(css).toContain('[data-hkm-theme="light"]');
    expect(css).toContain('[data-hkm-theme="dark"]');
    expect(css).toContain("@container hkm (");
    expect(css).toContain("@media (prefers-reduced-motion: no-preference)");
    const transitions = css.split("\n").filter((line) => /^\s*transition\s*:/u.test(line)).length;
    const motionBlock = css.slice(css.indexOf("@media (prefers-reduced-motion: no-preference)"));
    expect(motionBlock.split("\n").filter((line) => /^\s*transition\s*:/u.test(line)).length).toBe(transitions);
    expect(css).not.toMatch(/@import|url\(\s*["']?https?:/u);
  });

  test("tokens borrowed from the page always have a fallback", () => {
    const local = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gu)].map((match) => match[1]));
    const bare = [...css.matchAll(/var\((--(?!hkm-)[a-z0-9-]+)\)/gu)].map((match) => match[1]).filter((name) => !local.has(name));
    expect(bare).toEqual([]);
  });
});

describe("mockup copy details", () => {
  test("counts read as singular only for exactly one", () => {
    const article = (count: number) => renderToStaticMarkup(
      <api.ArticlePage
        byline="Mira Okafor"
        comments={Array.from({ length: count }, (_, index) => ({ name: `Reader ${String(index)}`, time: "1h", text: "Sounds good." }))}
        describe="Illustration of an article."
        paragraphs={["One paragraph."]}
        title="A title"
      />,
    );
    expect(article(1)).toContain(">1 comment<");
    expect(article(2)).toContain(">2 comments<");
    const work = renderToStaticMarkup(
      <api.WorkPost headline="Operations lead" name="Jonas Berg" reactions={[1, 1, 3]} text="One post." time="1d" />,
    );
    expect(htmlText(work)).toContain("1 reaction");
    expect(htmlText(work)).toContain("1 comment · 3 reposts");
  });

  test("an article byline is a name, not a sentence", () => {
    expect(() => renderToStaticMarkup(<api.ArticlePage byline="By Mira Okafor" describe="Illustration of an article." paragraphs={["One."]} title="A title" />)).toThrow(/author's name/u);
    expect(renderToStaticMarkup(<api.ArticlePage byline="Mira Okafor" describe="Illustration of an article." paragraphs={["One."]} title="A title" />)).not.toContain("By By");
  });

  test("the generic phone keeps children clear of the status bar", () => {
    const markup = renderToStaticMarkup(<api.PhoneFrame describe="Illustration of a phone."><p>Today</p></api.PhoneFrame>);
    expect(markup).toContain('<div class="hkm-phone-body"><p>Today</p></div>');
  });
});
