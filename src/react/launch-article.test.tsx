import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";

import { launchFixtureBeats, launchFixtureMessaging, launchFixtureUrl } from "../../gallery/launch-fixture.js";
import { articleVideoJsonLd, type ArticleVideoRecord } from "../index.js";
import { buildSocialKit, resolveLaunchBeats } from "../launch.js";
import { assertNoHeadings } from "../testing.js";
import { SocialKitPanel } from "./index.js";
import {
  ArticleBarChart,
  ArticleFigure,
  ArticleTable,
  ArticleVideo,
  ComparisonTable,
  LaunchBeats,
  launchBeatAnchor,
} from "./server.js";

const css = await readFile(new URL("../plain-publication.css", import.meta.url), "utf8");

const video: ArticleVideoRecord = {
  name: "Sending one message to three channels",
  description: "A recording of one message going out to three channels and the replies coming back.",
  sources: [
    { src: "/media/relay-send.mp4", type: "video/mp4" },
    { src: "/media/relay-send.webm", type: "video/webm" },
  ],
  poster: "/media/relay-send.jpg",
  captions: "/media/relay-send.en.vtt",
  width: 1280,
  height: 720,
  duration: "PT48S",
  uploadDate: "2026-09-20",
};

const beats = resolveLaunchBeats(launchFixtureBeats, {
  channelCount: { value: "6", source: "src/channels.ts" },
  historyDays: { value: "90", source: "release notes v0.4.0" },
});

function classesIn(html: string): Set<string> {
  return new Set([...html.matchAll(/\sclass="([^"]*)"/gu)].flatMap((match) => (match[1] ?? "").split(/\s+/u)).filter((name) => name.startsWith("plain-publication__")));
}

describe("article figures", () => {
  test("ArticleFigure preserves kind metadata and useful captions without automatic labels", () => {
    const html = renderToStaticMarkup(
      <ArticleFigure caption="The settings page." credit="Relay" id="fig-settings" kind="screenshot" width="wide"><img alt="" src="/a.png" /></ArticleFigure>,
    );
    expect(html).toContain('<figure class="plain-publication__figure" data-figure-kind="screenshot"');
    expect(html).toContain('id="fig-settings"');
    expect(html).toContain('data-width="wide"');
    expect(html).not.toContain("Screenshot.");
    expect(html).toContain("The settings page.");
    expect(html).toContain("Relay");
  });

  test("a figure can use its accessible label without repeating it as visible copy", () => {
    const html = renderToStaticMarkup(<ArticleFigure kind="illustration" label="Search returns the source note."><img alt="Search result" src="/a.png" /></ArticleFigure>);
    expect(html).toContain('aria-label="Search returns the source note."');
    expect(html).not.toContain("<figcaption");
    const creditOnly = renderToStaticMarkup(<ArticleFigure kind="screenshot" credit="September 2026"><img alt="Settings" src="/a.png" /></ArticleFigure>);
    expect(creditOnly).toContain("September 2026");
  });

  test("ArticleVideo lists WebM first and always carries captions", () => {
    const html = renderToStaticMarkup(<ArticleVideo caption="Sending one message." video={video} />);
    expect(html.indexOf("video/webm")).toBeLessThan(html.indexOf("video/mp4"));
    expect(html).toMatch(/<track [^>]*kind="captions"/u);
    expect(html).toContain('preload="metadata"');
    expect(html).toContain('poster="/media/relay-send.jpg"');
    expect(() => renderToStaticMarkup(<ArticleVideo caption="x" video={{ ...video, captions: "/media/x.srt" }} />)).toThrow("WebVTT");
  });

  test("articleVideoJsonLd emits an absolute VideoObject", () => {
    const json = articleVideoJsonLd(video, "https://relay.example");
    expect(json).toMatchObject({
      "@type": "VideoObject",
      contentUrl: "https://relay.example/media/relay-send.mp4",
      thumbnailUrl: "https://relay.example/media/relay-send.jpg",
      duration: "PT48S",
    });
    expect(() => articleVideoJsonLd({ ...video, duration: "PT" }, "https://relay.example")).toThrow("duration");
  });

  test("ArticleTable is a captioned, scrollable, keyboard-reachable table", () => {
    const html = renderToStaticMarkup(
      <ArticleTable caption="Send times" columns={[{ label: "Channel" }, { label: "Median", numeric: true }]} note="Measured on 20 September." rows={[["Mail", "1.2 s"], ["Chat", "0.4 s"]]} />,
    );
    expect(html).toContain("<caption");
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("Measured on 20 September.");
  });

  test("ArticleBarChart keeps exact values readable", () => {
    const html = renderToStaticMarkup(
      <ArticleBarChart caption="Median send time" data={[{ label: "Mail", value: 1.2, display: "1.2 s" }, { label: "Chat", value: 0.4, display: "0.4 s", highlight: true }]} />,
    );
    expect(html).toContain("<dl");
    expect(html).toContain("1.2 s");
    expect(html).toContain("--plain-bar:100%");
    expect(html).toContain('data-highlight=""');
  });

  test("ComparisonTable pairs every glyph with a word", () => {
    const html = renderToStaticMarkup(
      <ComparisonTable caption="What each option covers" highlight={0} options={["Relay", "Shared inbox"]} rows={[
        { label: "Replies in one thread", values: [true, "partial"] },
        { label: "Phone app", values: [true, false], note: "Shared inbox has a web view only." },
        { label: "History", values: [{ text: "90 days" }, { text: "30 days" }] },
      ]} />,
    );
    for (const word of ["Yes", "Partly", "No", "90 days"]) expect(html).toContain(word);
    expect(html.match(/<svg[^>]*aria-hidden="true"/gu)?.length).toBe(4);
    expect(() => renderToStaticMarkup(<ComparisonTable caption="x" options={["A", "B"]} rows={[{ label: "r", values: [true] }]} />)).toThrow();
  });
});

describe("launch beats and social kit", () => {
  test("LaunchBeats gives every beat an anchor, a heading, and one visual", () => {
    const html = renderToStaticMarkup(
      <LaunchBeats beats={beats} headingLevel={2} renderVisual={(beat) => <img alt="" src={`/v/${beat.id}.png`} />} />,
    );
    for (const beat of beats) {
      expect(html).toContain(`id="${launchBeatAnchor(beat)}"`);
      expect(html).toContain(`src="/v/${beat.id}.png"`);
    }
    expect(html.match(/<h2\b/gu)?.length).toBe(beats.length);
    expect(html.match(/<figure\b/gu)?.length).toBe(beats.length);
    expect(html).toContain("in Preview");
    expect(() => renderToStaticMarkup(<LaunchBeats beats={beats.slice(1)} renderVisual={() => <span />} />)).toThrow();
  });

  test("SocialKitPanel is a closed disclosure with a counter per post", () => {
    const kit = buildSocialKit(beats, launchFixtureMessaging, { status: "Preview" }, launchFixtureUrl);
    const html = renderToStaticMarkup(<SocialKitPanel kit={kit} />);
    expect(html).toStartWith("<details");
    expect(html).not.toContain(" open");
    expect(html).toContain("Social posts for this launch");
    expect(html).toContain('aria-live="polite"');
    expect(html.match(/<button\b/gu)?.length).toBeGreaterThanOrEqual(kit.x.length);
    assertNoHeadings(html, "SocialKitPanel");
  });

  test("every plain-publication class the new components render has a rule", () => {
    const kit = buildSocialKit(beats, launchFixtureMessaging, { status: "Preview" }, launchFixtureUrl);
    const html = [
      renderToStaticMarkup(<LaunchBeats beats={beats} renderVisual={() => <span />} />),
      renderToStaticMarkup(<SocialKitPanel kit={kit} />),
      renderToStaticMarkup(<ArticleVideo caption="x" credit="y" video={video} width="wide" />),
      renderToStaticMarkup(<ArticleTable caption="x" columns={[{ label: "a" }]} note="n" rows={[["1"]]} />),
      renderToStaticMarkup(<ArticleBarChart caption="x" credit="y" data={[{ label: "a", value: 1, display: "1", highlight: true }]} />),
      renderToStaticMarkup(<ComparisonTable caption="x" highlight={0} note="n" options={["A"]} rows={[{ label: "r", values: ["partial"], note: "n" }]} />),
    ].join("");
    const missing = [...classesIn(html)].filter((name) => !new RegExp(`\\.${name}(?![a-z0-9_-])`, "u").test(css));
    expect(missing).toEqual([]);
  });
});
