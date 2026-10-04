import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import { parseHTML } from "linkedom";

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
          expect(tag).toMatch(/class="[^"]*hkm-(?:avatar|photo|brand-mark)/u);
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
  test("showcases need no caption or hint to keep their controls and visual accessible", () => {
    const html = renderToStaticMarkup(<clientApi.ModeShowcase
      modes={[{ id: "exact", label: "Exact words" }, { id: "meaning", label: "Meaning" }]}
      surfaces={[{ id: "terminal", label: "Terminal", render: () => <api.TerminalFrame describe="Search returns the rule and its file." lines={[{ kind: "output", text: "parser timeout" }]} /> }]}
    />);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-label="Illustration of terminal"');
    expect(html).toContain('aria-label="Search returns the rule and its file."');
    expect(html).not.toContain("hkm-showcase-hint");
    expect(html).not.toContain("<figcaption");
  });

  test("optional context and live status render independently", () => {
    const surfaces = [{ id: "terminal", label: "Terminal", render: () => <span>Result</span> }];
    const modes = [{ id: "exact", label: "Exact words" }];
    const captioned = renderToStaticMarkup(<clientApi.ModeShowcase modes={modes} surfaces={surfaces} caption="Matches include the source file." />);
    expect(captioned).toContain("Matches include the source file.");
    const live = renderToStaticMarkup(<clientApi.ModeShowcase modes={modes} surfaces={surfaces} status={() => "One match"} />);
    expect(live).toContain('aria-live="polite"');
    expect(live).toContain("One match");
    expect(live).not.toContain("undefined");
    const steps = renderToStaticMarkup(<clientApi.StepThrough steps={[{ id: "review", label: "Review", render: () => <span>Ready</span> }]} />);
    expect(steps).toContain('role="tablist"');
    expect(steps).toContain("Step 1 of 1");
    expect(steps).not.toContain("<figcaption");
  });

  test("showcase explanations include the surface and reserve inactive complete choices without exposing them", () => {
    const html = renderToStaticMarkup(<clientApi.ModeShowcase
      modes={[{ id: "short", label: "Short", hint: "Ready." }, { id: "long", label: "Long", hint: "Review every recorded source before opening the result." }]}
      options={[{ id: "brief", label: "Brief", hint: "One passage." }, { id: "full", label: "Full", hint: "Read the surrounding paragraphs too." }]}
      surfaces={[{ id: "document", label: "Document", hint: "Shows the saved document.", render: () => <span>Document</span> }]}
    />);
    expect(html).toContain("Shows the saved document. Ready. One passage.");
    expect(html).toContain("Shows the saved document. Review every recorded source before opening the result. Read the surrounding paragraphs too.");
    const reserved: string[] = [];
    new HTMLRewriter().on('[data-hkm-reserving]', { element(element) {
      expect(element.getAttribute("aria-hidden")).toBe("true");
      expect(element.hasAttribute("inert")).toBe(true);
      reserved.push(element.tagName);
    } }).transform(html);
    expect(reserved).toHaveLength(3);
  });

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

test("step walkthroughs reserve all panels while exposing only the selected one", () => {
  const html = renderToStaticMarkup(<clientApi.StepThrough steps={[
    { id: "first", label: "Choose", hint: "Private helper text.", render: () => <div>First view</div> },
    { id: "second", label: "Review", render: () => <div>Tall view</div> },
  ]} />);
  expect(html).toContain('class="hkm-step-panel"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('inert=""');
  expect(html).toContain('class="hkm-showcase-status hkm-step-announcement"');
  expect(html).toContain('aria-label="Back"');
  expect(html).toContain('aria-label="Next"');
  expect(html).toContain("First view");
  expect(html).toContain("Tall view");
  const { document } = parseHTML(html);
  const panels = [...document.querySelectorAll(".hkm-step-panel")];
  expect(panels.map((panel) => panel.hasAttribute("inert"))).toEqual([false, true]);
  expect(panels.map((panel) => panel.getAttribute("aria-hidden"))).toEqual(["false", "true"]);
});

test("mode surfaces and measuring copies retain the actual inert attribute only when inactive", () => {
  const html = renderToStaticMarkup(<clientApi.ModeShowcase
    fit="fill"
    modes={[{ id: "plain", label: "Plain" }]}
    surfaces={[
      { id: "first", label: "First", render: () => <button type="button">First action</button> },
      { id: "second", label: "Second", render: () => <button type="button">Second action</button> },
    ]}
  />);
  const { document } = parseHTML(html);
  const surfaces = [...document.querySelectorAll(".hkm-mode-surface:not([data-hkm-measurement])")];
  expect(surfaces.map((surface) => surface.hasAttribute("inert"))).toEqual([false, true]);
  const measurements = [...document.querySelectorAll("[data-hkm-measurement]")];
  expect(measurements).toHaveLength(2);
  for (const measurement of measurements) {
    expect(measurement.hasAttribute("inert")).toBe(true);
    expect(measurement.hasAttribute("hidden")).toBe(true);
  }
  expect(html).not.toContain('inert="false"');
});


test("filled steps and presentation terminals are explicit server-safe options", () => {
  const lines = [{ kind: "input" as const, text: "relay run" }];
  const terminal = <api.TerminalFrame density="presentation" describe="A terminal starts a job." lines={lines} />;
  const html = renderToStaticMarkup(<clientApi.StepThrough fit="fill" steps={[{ id: "run", label: "Run", render: () => terminal }]} />);
  expect(html).toContain('data-hkm-fit="fill"');
  expect(html).toContain('data-hkm-density="presentation"');
  expect(html).not.toContain("--hkm-showcase-fill-height");
  expect(html).not.toContain("--hkm-terminal-presentation-size");
  expect(renderToStaticMarkup(<api.TerminalFrame describe="A terminal starts a job." lines={lines} />)).not.toContain("data-hkm-density");
  expect(() => renderToStaticMarkup(<api.TerminalFrame density={"small" as "standard"} describe="A terminal starts a job." lines={lines} />)).toThrow("Terminal density");
  expect(() => renderToStaticMarkup(<clientApi.StepThrough fit={"small" as "natural"} steps={[{ id: "run", label: "Run", render: () => terminal }]} />)).toThrow("StepThrough fit");
});

test("step navigation leads the preview and descriptions stay associated with their tabs", () => {
  const html = renderToStaticMarkup(<clientApi.StepThrough initial="read" label="Review a run" steps={[
    { id: "start", label: "Start", hint: "Choose the input.", render: () => <span>Input</span> },
    { id: "read", label: "Read", hint: "Read the saved result and its source.", render: () => <span>Result</span> },
    { id: "keep", label: "Keep", hint: "  ", render: () => <span>Saved</span> },
  ]} />);
  const document = parseHTML(html).document;
  const navigation = must(document.querySelector(".hkm-step-nav") ?? undefined);
  expect(navigation.firstElementChild?.getAttribute("aria-label")).toBe("Back");
  expect(navigation.lastElementChild?.getAttribute("aria-label")).toBe("Next");
  expect(document.querySelector(".hkm-step-controls")?.nextElementSibling?.className).toContain("hkm-step-stage");
  // Tabs attach to the preview's edge, so compact explanations follow the preview.
  expect(document.querySelector(".hkm-step-stage")?.nextElementSibling?.className).toBe("hkm-step-descriptions");
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  expect(tabs.map((tab) => tab.getAttribute("aria-label"))).toEqual(["Start", "Read", "Keep"]);
  expect(tabs.map((tab) => tab.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
  for (const tab of tabs) {
    const descriptionId = tab.getAttribute("aria-describedby");
    if (descriptionId === null) expect(tab.getAttribute("aria-label")).toBe("Keep");
    else expect(document.getElementById(descriptionId)?.className).toBe("hkm-step-hint");
    const panel = document.getElementById(must(tab.getAttribute("aria-controls") ?? undefined));
    expect(panel?.getAttribute("aria-labelledby")).toBe(tab.id);
    expect(panel?.getAttribute("tabindex")).toBe(tab.getAttribute("tabindex"));
  }
  expect(document.querySelector("figcaption")).toBeNull();
  expect(document.querySelector('[aria-live="polite"]')?.textContent).toContain("Step 2 of 3. Read the saved result and its source.");
});


test("filled mode showcases reserve all authored combinations with inert nonanimated fixtures", () => {
  const calls: Array<{ mode: string; option: string | undefined; animated: boolean }> = [];
  const modes = [{ id: "short", label: "Short" }, { id: "long", label: "Long" }];
  const options = [{ id: "normal", label: "Normal" }, { id: "full", label: "Full" }];
  const surfaces = [{ id: "terminal", label: "Terminal", render: (state: { mode: string; option: string | undefined; animated: boolean }) => { calls.push(state); return <span>{state.mode}/{state.option}</span>; } }];
  const html = renderToStaticMarkup(<clientApi.ModeShowcase fit="fill" height={280} modes={modes} options={options} surfaces={surfaces} />);
  expect(html.match(/data-hkm-measurement=""/gu)).toHaveLength(4);
  expect(html.match(/data-hkm-measurement="" hidden="" inert=""/gu)).toHaveLength(4);
  expect(calls).toHaveLength(5);
  expect(calls.every((call) => !call.animated)).toBe(true);
  expect(calls.filter((call) => call.mode === "long").map((call) => call.option)).toEqual(["normal", "full"]);
  expect(html).toContain('data-hkm-fit="fill"');
  expect(html).not.toContain("--hkm-showcase-fill-height");
  expect(renderToStaticMarkup(<clientApi.ModeShowcase modes={modes} surfaces={surfaces} />)).not.toContain("data-hkm-measurement");
  expect(() => renderToStaticMarkup(<clientApi.ModeShowcase fit={"other" as "natural"} modes={modes} surfaces={surfaces} />)).toThrow("ModeShowcase fit");
  expect(() => renderToStaticMarkup(<clientApi.ModeShowcase height={Infinity} modes={modes} surfaces={surfaces} />)).toThrow("finite");
  expect(() => renderToStaticMarkup(<clientApi.ModeShowcase fit="fill" modes={Array.from({ length: 129 }, (_, index) => ({ id: String(index), label: String(index) }))} surfaces={surfaces} />)).toThrow("128");
});

test("brand marks draw registered vendor glyphs and never invent a logo", () => {
  const document = parseHTML(`<div>${renderToStaticMarkup(<>
    <api.MockupBrandMark name="Apple Contacts" />
    <api.MockupBrandMark name="LinkedIn export" size={24} />
    <api.MockupBrandMark name="iMessage" variant="glyph" />
    <api.MockupBrandMark name="Unknown Source" />
  </>)}</div>`).document;
  const marks = [...document.querySelectorAll(".hkm-brand-mark")];
  expect(marks.map((mark) => mark.getAttribute("data-hkm-mark"))).toEqual(["apple", "linkedin", "imessage", null]);
  for (const mark of marks) expect(mark.getAttribute("aria-hidden")).toBe("true");
  expect(marks[0]?.getAttribute("style")).toContain("--hkm-mark-accent:#000000");
  expect(marks[1]?.getAttribute("style")).toContain("--hkm-mark-size:24px");
  expect(marks[1]?.getAttribute("style")).toContain("--hkm-mark-accent:#0a66c2");
  expect(marks[2]?.getAttribute("style")).not.toContain("--hkm-mark-accent");
  for (const mark of marks.slice(0, 3)) expect(mark.querySelector("svg path")).not.toBeNull();
  expect(marks[3]?.querySelector("svg")).toBeNull();
  expect(marks[3]?.textContent).toBe("US");
  expect(() => renderToStaticMarkup(<api.MockupBrandMark name="LinkedIn" size={0} />)).toThrow("size");
  expect(css).toContain(".hkm-root .hkm-brand-mark {");
});
