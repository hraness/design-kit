import { describe, expect, test } from "bun:test";

import {
  assertLaunchBeats,
  assertLaunchKit,
  blueskyPostLength,
  buildSocialKit,
  characterLength,
  LAUNCH_LIMITS,
  LaunchKitError,
  launchCopyProblems,
  launchPlaceholders,
  resolveLaunchBeats,
  socialBeats,
  xPostLength,
} from "./launch.js";
import { launchFixtureBeats as beats, launchFixtureFacts as facts, launchFixtureMessaging as messaging, launchFixtureUrl } from "../gallery/launch-fixture.js";

function must<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Expected a value.");
  return value;
}

const URL = launchFixtureUrl;

function problemsOf(run: () => unknown): readonly string[] {
  try {
    run();
  } catch (error) {
    if (error instanceof LaunchKitError) return error.problems;
    throw error;
  }
  return [];
}

describe("launch beats", () => {
  test("a complete set passes", () => {
    expect(() => assertLaunchBeats(beats)).not.toThrow();
  });

  test("rejects too few beats, missing parts, and out-of-order parts", () => {
    const problems = problemsOf(() => assertLaunchBeats([must(beats[1]), must(beats[0])]));
    expect(problems.some((problem) => problem.includes("7 to 10 beats"))).toBe(true);
    expect(problems.some((problem) => problem.includes("out of order"))).toBe(true);
    expect(problems.some((problem) => problem.includes('exactly one "status"'))).toBe(true);
  });

  test("needs at least one does beat and one visual per beat", () => {
    const withoutDoes = beats.filter((beat) => beat.part !== "does");
    expect(problemsOf(() => assertLaunchBeats(withoutDoes)).join("\n")).toContain('at least one "does" beat');
    const reused = beats.map((beat) => (beat.id === "does-inbox" ? { ...beat, visual: must(beats[0]).visual } : beat));
    expect(problemsOf(() => assertLaunchBeats(reused)).join("\n")).toContain("reuses another beat's visual");
  });

  test("checks headline case, length, and mockup alt text", () => {
    const edited = beats.map((beat) =>
      beat.id === "who"
        ? { ...beat, headline: "Made For Small Teams With Many Channels." }
        : beat.id === "vision"
          ? { ...beat, alt: "A thread moving between people." }
          : beat,
    );
    const problems = problemsOf(() => assertLaunchBeats(edited)).join("\n");
    expect(problems).toContain("title case");
    expect(problems).toContain("ends with a period");
    expect(problems).toContain('says "Illustration"');
    const long = beats.map((beat) => (beat.id === "who" ? { ...beat, headline: `A${"a".repeat(LAUNCH_LIMITS.headline)}` } : beat));
    expect(problemsOf(() => assertLaunchBeats(long)).join("\n")).toContain("headline is longer");
  });

  test("the first beat states what the product does", () => {
    const teaser = beats.map((beat, index) => (index === 0 ? { ...beat, post: "Ever wondered where your replies go?" } : beat));
    expect(problemsOf(() => assertLaunchBeats(teaser)).join("\n")).toContain("asks nothing");
  });

  test("rejects duplicate or malformed ids", () => {
    const edited = beats.map((beat) => (beat.id === "who" ? { ...beat, id: "Who Is It" } : beat));
    expect(problemsOf(() => assertLaunchBeats(edited)).join("\n")).toContain("lowercase slug");
  });
});

describe("launch copy rules", () => {
  test("flags banned words, em dashes, exclamation marks, emoji, and hashtags", () => {
    const problems = launchCopyProblems("A seamless tool — try it! 🚀 #launch", "post").join("\n");
    expect(problems).toContain("seamless");
    expect(problems).toContain("em dash");
    expect(problems).toContain("exclamation mark");
    expect(problems.toLowerCase()).toContain("emoji");
    expect(problems.toLowerCase()).toContain("hashtag");
  });

  test("plain copy passes", () => {
    expect(launchCopyProblems("Relay keeps replies in one thread.", "post")).toEqual([]);
  });

  test("counts characters the way each channel does", () => {
    expect(xPostLength(`Read it ${URL}`)).toBe("Read it ".length + LAUNCH_LIMITS.xUrl);
    expect(xPostLength("日本")).toBe(4);
    expect(blueskyPostLength("é")).toBe(1);
    expect(characterLength("a\u{1F600}")).toBe(2);
  });
});

describe("launch facts", () => {
  test("fills placeholders from facts", () => {
    const resolved = resolveLaunchBeats(beats, facts);
    expect(resolved.find((beat) => beat.id === "how")?.post).toContain("sends 6 message types");
    expect(resolved.find((beat) => beat.id === "limits")?.post).toContain("for 90 days");
    expect(launchPlaceholders(resolved.map((beat) => beat.post).join(" "))).toEqual([]);
  });

  test("rejects typed numbers, unlisted keys, unknown facts, and facts without a source", () => {
    const typed = beats.map((beat) => (beat.id === "who" ? { ...beat, post: "Relay is for teams of 5." } : beat));
    expect(problemsOf(() => resolveLaunchBeats(typed, facts)).join("\n")).toContain("types a number");
    const unlisted = beats.map((beat) => (beat.id === "how" ? { ...beat, facts: [] } : beat));
    expect(problemsOf(() => resolveLaunchBeats(unlisted, facts)).join("\n")).toContain("without listing it");
    const unknown = beats.map((beat) => (beat.id === "how" ? { ...beat, facts: ["channelCount", "missing"] } : beat));
    expect(problemsOf(() => resolveLaunchBeats(unknown, facts)).join("\n")).toContain('unknown fact "missing"');
    expect(problemsOf(() => resolveLaunchBeats(beats, { ...facts, historyDays: { value: "90", source: " " } })).join("\n")).toContain("no source");
  });

  test("allowNumerals admits names that contain digits", () => {
    const named = beats.map((beat) => (beat.id === "who" ? { ...beat, post: "Relay is for teams on Plan9 and anywhere else." } : beat));
    expect(() => resolveLaunchBeats(named, facts, { allowNumerals: ["Plan9"] })).not.toThrow();
  });
});

describe("social kit", () => {
  const resolved = resolveLaunchBeats(beats, facts);
  const release = { status: "Preview", tags: ["Productivity"] } as const;
  const kit = buildSocialKit(resolved, messaging, release, URL);
  const options = { status: "Preview", publicInstall: false, tagline: messaging.tagline, canonicalUrl: URL } as const;

  test("builds one post per social beat with the URL only on the last", () => {
    expect(kit.x).toHaveLength(beats.length - 1);
    expect(kit.x.at(-1)?.endsWith(URL)).toBe(true);
    expect(kit.x.slice(0, -1).some((post) => post.includes("https://"))).toBe(false);
    expect(kit.bluesky).toEqual(kit.x);
    expect(kit.linkedin.startsWith(must(resolved[0]).post)).toBe(true);
    expect(kit.productHunt).toEqual({ tagline: messaging.tagline, description: messaging.meta, tags: ["Productivity"] });
    expect(kit.sources["x.0"]).toBe("beat:what");
    expect(Object.isFrozen(kit)).toBe(true);
  });

  test("keeps the limits beat in the launch post", () => {
    const limits = must(resolved.find((beat) => beat.part === "limits")).post;
    expect(socialBeats(resolved).some((beat) => beat.part === "limits")).toBe(false);
    for (const text of [...kit.x, ...kit.bluesky, ...kit.threads, kit.linkedin, ...kit.showHnFacts]) expect(text).not.toContain(limits);
    expect(Object.values(kit.sources).join(",")).not.toContain("beat:limits");
  });

  test("skips beats marked social: false and uses socialPost wording", () => {
    const edited = resolved.map((beat) =>
      beat.id === "does-phone"
        ? { ...beat, social: false }
        : beat.id === "who"
          ? { ...beat, post: `${beat.post} Teams with one channel need something simpler.`, socialPost: "Relay is for small teams that answer customers in several places." }
          : beat,
    );
    const cut = buildSocialKit(edited, messaging, release, URL);
    expect(cut.x).toHaveLength(beats.length - 2);
    expect(cut.x.join("\n")).not.toContain("phone app");
    expect(cut.x).toContain("Relay is for small teams that answer customers in several places.");
    expect(cut.linkedin).not.toContain("something simpler");
    expect(cut.showHnFacts.join("\n")).not.toContain("something simpler");
    expect(() => assertLaunchKit(edited, cut, options)).not.toThrow();
  });

  test("socialPost placeholders resolve from facts", () => {
    const withSocial = beats.map((beat) => (beat.id === "how" ? { ...beat, socialPost: "Relay sends {channelCount} message types." } : beat));
    const filled = resolveLaunchBeats(withSocial, facts);
    expect(must(filled.find((beat) => beat.id === "how")).socialPost).not.toContain("{");
    expect(problemsOf(() => resolveLaunchBeats(withSocial.map((beat) => (beat.id === "how" ? { ...beat, socialPost: "Relay sends 12 types." } : beat)), facts)).join("\n")).toContain(
      "socialPost types a number",
    );
  });

  test("rejects a kit that carries a caveat beat, and misplaced social flags", () => {
    const limits = must(resolved.find((beat) => beat.part === "limits")).post;
    const leaked = { ...kit, x: [kit.x[0] ?? "", limits, ...kit.x.slice(1)], linkedin: `${limits}\n\n${kit.linkedin}` };
    const problems = problemsOf(() => assertLaunchKit(resolved, leaked, options)).join("\n");
    expect(problems).toContain('x post 2 carries beat "limits"');
    expect(problems).toContain('LinkedIn post carries beat "limits"');
    expect(problems).toContain("more posts than social beats");
    const flags = beats.map((beat) =>
      beat.part === "status" ? { ...beat, social: false } : beat.part === "limits" ? { ...beat, socialPost: "Relay keeps history." } : beat,
    );
    const flagProblems = problemsOf(() => assertLaunchBeats(flags)).join("\n");
    expect(flagProblems).toContain("cannot be marked social: false");
    expect(flagProblems).toContain("cannot carry a socialPost");
  });

  test("the built kit passes assertLaunchKit", () => {
    expect(() => assertLaunchKit(resolved, kit, options)).not.toThrow();
  });

  test("refuses unresolved beats and tracking URLs", () => {
    expect(problemsOf(() => buildSocialKit(beats, messaging, release, URL)).join("\n")).toContain("still has placeholders");
    expect(problemsOf(() => buildSocialKit(resolved, messaging, release, `${URL}?utm_source=x`)).join("\n")).toContain("tracking");
    expect(problemsOf(() => buildSocialKit(resolved, messaging, release, `${URL}#beat-how`)).join("\n")).toContain("anchor");
  });

  test("rejects install calls without a public install, a missing status, and links mid-thread", () => {
    const edited = {
      ...kit,
      x: [`${kit.x[0]} Install it today.`, `See ${URL}`, ...kit.x.slice(2, -1), `Read more.\n\n${URL}`],
    };
    const problems = problemsOf(() => assertLaunchKit(resolved, edited, options)).join("\n");
    expect(problems).toContain("no public install");
    expect(problems).toContain('status "Preview"');
    expect(problems).toContain("only the last post links");
    expect(() => assertLaunchKit(resolved, { ...kit, x: edited.x.map((post) => post.replace("Install it today.", "")) }, { ...options, publicInstall: true })).toThrow(
      LaunchKitError,
    );
  });

  test("catches piped shell installs and stays linear on hostile input", () => {
    const piped = { ...kit, x: [`${kit.x[0]} curl -fsSL https://relay.example/i | sh`, ...kit.x.slice(1)] };
    expect(problemsOf(() => assertLaunchKit(resolved, piped, options)).join("\n")).toContain("no public install");
    const hostile = { ...kit, x: [`${"curl ".repeat(20_000)}`, ...kit.x.slice(1)] };
    const started = performance.now();
    problemsOf(() => assertLaunchKit(resolved, hostile, options));
    expect(problemsOf(() => buildSocialKit(resolved, messaging, release, `a://!${"!!".repeat(20_000)} `)).join("\n")).toContain("not a URL");
    expect(performance.now() - started).toBeLessThan(1_000);
    expect(() => buildSocialKit(resolved, messaging, release, `${URL}`)).not.toThrow();
  });

  test("checks the tagline source, forbidden names, and channel limits", () => {
    const wrongTagline = { ...kit, productHunt: { ...kit.productHunt, tagline: "Something else" } };
    expect(problemsOf(() => assertLaunchKit(resolved, wrongTagline, options)).join("\n")).toContain("messaging tagline");
    const named = problemsOf(() => assertLaunchKit(resolved, kit, { ...options, forbiddenNames: ["inbox"] })).join("\n");
    expect(named).toContain("comparison pages");
    const long = { ...kit, x: [`A ${"word ".repeat(80)}`, ...kit.x.slice(1)] };
    expect(problemsOf(() => assertLaunchKit(resolved, long, options)).join("\n")).toContain("the limit is 280");
    expect(problemsOf(() => assertLaunchKit(resolved, kit, { ...options, status: "Soon" as never })).join("\n")).toContain("status label");
  });
});
