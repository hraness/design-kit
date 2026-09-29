/**
 * Launch beats, launch facts, and the social kit built from them.
 *
 * Data and checks only: no React, no DOM, and no portfolio import, so tests,
 * film builds, and plain scripts can load it. `ARTICLE_COPY.md` describes the
 * "Introducing a product" beats this module types, and `GENERATION_STYLE.md`
 * (hraness/.github) gives the voice rules `assertLaunchKit` enforces.
 */

/** Beat parts in reading order. `does` may repeat, once per surface or mode, each with its own visual. */
export const launchBeatParts = ["what", "does", "how", "who", "vision", "limits", "status"] as const;
export type LaunchBeatPart = (typeof launchBeatParts)[number];

export type LaunchVisual =
  | Readonly<{ kind: "mockup"; id: string; state: Readonly<Record<string, string>> }>
  | Readonly<{ kind: "clip"; scene: string }>
  | Readonly<{ kind: "diagram"; src: string }>;

export type LaunchBeat = Readonly<{
  /** Lowercase slug; the post renders it as the `#beat-<id>` anchor. */
  id: string;
  part: LaunchBeatPart;
  /** Sentence case, no final period. May hold `{fact}` placeholders. */
  headline: string;
  /** One claim that stands alone as a social post. May hold `{fact}` placeholders. */
  post: string;
  visual: LaunchVisual;
  /** Says "Illustration" when the visual is a mockup. May hold `{fact}` placeholders. */
  alt: string;
  /** Keys into the product's launch facts. Every placeholder must be listed here. */
  facts?: readonly string[];
  /** A companion post that goes deeper. */
  detailHref?: string;
}>;

/** One number, size, rate, or label, with where it came from. */
export type LaunchFact = Readonly<{ value: string; source: string }>;
/** The one typed place for every launch number. The post, kit, film captions, and store listing import it. */
export type LaunchFacts = Readonly<Record<string, LaunchFact>>;

/** Status labels from `STYLE.md`. */
export type LaunchStatus =
  | "In development"
  | "Preview"
  | "Beta"
  | `Latest release: v${number}.${number}.${number}`
  | "Paused"
  | "Retired";

/** The messaging fields a kit reads. The portfolio `PortfolioMessaging` record satisfies it. */
export type LaunchMessaging = Readonly<{
  names: Readonly<{ name: string }>;
  tagline: string;
  meta: string;
}>;

export type LaunchRelease = Readonly<{
  status: LaunchStatus;
  /** Product Hunt topics. */
  tags?: readonly string[];
}>;

export type SocialKit = Readonly<{
  x: readonly string[];
  bluesky: readonly string[];
  threads: readonly string[];
  linkedin: string;
  productHunt: Readonly<{ tagline: string; description: string; tags: readonly string[] }>;
  /** Facts for a person writing Show HN or a first comment. The kit never writes those. */
  showHnFacts: readonly string[];
  /** Where each kit field came from, keyed by field path (`x.0`, `productHunt.tagline`). */
  sources: Readonly<Record<string, string>>;
}>;

export type LaunchKitOptions = Readonly<{
  status: LaunchStatus;
  /** True only when the release record shows a public install. */
  publicInstall: boolean;
  /** The messaging tagline; when given, the Product Hunt tagline must equal it. */
  tagline?: string;
  /** The canonical launch post URL; when given, the last post of every thread must end with it. */
  canonicalUrl?: string;
  /** Names that must not appear in social posts, such as competitors. */
  forbiddenNames?: readonly string[];
}>;

export const LAUNCH_LIMITS = Object.freeze({
  beatsMin: 7,
  beatsMax: 10,
  headline: 70,
  post: 250,
  alt: 125,
  /** X counts most characters as 1, wide characters and emoji as 2, and every link as 23. */
  x: 280,
  xUrl: 23,
  bluesky: 300,
  threads: 500,
  linkedin: 3000,
  /** LinkedIn shows about this much before "see more". */
  linkedinHook: 210,
  productHuntTagline: 60,
  productHuntDescription: 260,
});

/** STYLE.md, GENERATION_STYLE.md, and ARTICLE_COPY.md: words readers take as filler or hype. */
export const LAUNCH_BANNED_WORDS: readonly string[] = Object.freeze([
  "actually",
  "amid",
  "blazing",
  "cutting-edge",
  "delve",
  "elevate",
  "empower",
  "game-changer",
  "genuinely",
  "harness",
  "in today's world",
  "journey",
  "landscape",
  "leverage",
  "notable",
  "pivotal",
  "powerful",
  "realm",
  "revolutionary",
  "revolutionize",
  "robust",
  "seamless",
  "seamlessly",
  "showcase",
  "significant",
  "supercharge",
  "tapestry",
  "testament",
  "underscore",
  "unlock",
]);

/** Internal delivery vocabulary from AGENTS.md; never in public copy. */
export const LAUNCH_INTERNAL_WORDS: readonly string[] = Object.freeze([
  "admission",
  "admitted",
  "attest",
  "bounded",
  "boundary",
  "custody",
  "gate",
  "lane",
  "lease",
  "manifest",
  "projection",
  "qualification",
  "quarantined",
  "receipt",
  "settlement",
  "surface",
]);

/** Openers GENERATION_STYLE.md rules out for the first post, and thread markers anywhere. */
const HOOK_PATTERNS: readonly RegExp[] = [
  /\bhere'?s why\b/iu,
  /\bhere'?s how\b/iu,
  /\ba thread\b/iu,
  /\bthread below\b/iu,
  /\bwait (for|until)\b/iu,
  /\byou won'?t believe\b/iu,
];
const THREAD_MARKER = /(^|\s)\d+\s*\/\s*\d*(\s|$)|\u{1F9F5}/u;
const INSTALL_PATTERN =
  /\b(install|installs|installing|npm i|npx|bunx|pip|brew|download|get it (now|here)|try it (now|today)|sign up)\b|curl\s[^|]*\|\s*(ba|z)?sh/iu;
const TRACKING_PARAM = /[?&](utm_[a-z]+|ref|ref_src|fbclid|gclid|mc_[a-z]+|s)=/iu;
// Explicit ranges, not `\p{…}` escapes, because Next.js compiles dependencies
// with a Babel build that cannot rewrite Unicode property escapes.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}]/u;
const HASHTAG = /(^|\s)#[A-Za-z0-9_À-ɏͰ-ϿЀ-ӿ]+/u;
const PLACEHOLDER = /\{([a-z][a-zA-Z0-9_.-]*)\}/gu;
const BEAT_ID = /^[a-z0-9][a-z0-9-]*$/u;
const STATUS_LABEL = /^(In development|Preview|Beta|Latest release: v\d+\.\d+\.\d+|Paused|Retired)$/u;
const SCHEME_URL = /\bhttps?:\/\/[^\s]+/giu;
const BARE_DOMAIN = /\b[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)*\.(com|net|org|dev|app|io|ai|co|sh|so|xyz|me|site|page|tech)(\/[^\s]*)?\b/giu;

export class LaunchKitError extends Error {
  readonly problems: readonly string[];

  constructor(problems: readonly string[]) {
    super(`Launch kit check failed:\n- ${problems.join("\n- ")}`);
    this.name = "LaunchKitError";
    this.problems = Object.freeze([...problems]);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function wordPattern(words: readonly string[]): RegExp {
  const alternatives = words.map((word) => escapeRegExp(word).replace(/'/gu, "['’]").replace(/-/gu, "[- ]?"));
  // Plural and verb endings count: "surfaces", "leveraging", "unlocks".
  return new RegExp(`(?<![A-Za-z0-9\\u00C0-\\u024F])(${alternatives.join("|")})(s|es|d|ed|ing)?(?![A-Za-z0-9\\u00C0-\\u024F])`, "iu");
}

const BANNED_PATTERN = wordPattern(LAUNCH_BANNED_WORDS);
const INTERNAL_PATTERN = wordPattern(LAUNCH_INTERNAL_WORDS);

/**
 * Style problems in one piece of public launch text: banned and internal
 * words, em dashes, exclamation marks, trailing questions, emoji, hashtags,
 * and thread markers. Returns an empty list when the text is clean.
 */
export function launchCopyProblems(text: string, label = "text"): string[] {
  const problems: string[] = [];
  const banned = BANNED_PATTERN.exec(text);
  if (banned !== null) problems.push(`${label} uses the banned word "${banned[0]}".`);
  const internal = INTERNAL_PATTERN.exec(text);
  if (internal !== null) problems.push(`${label} uses the internal word "${internal[0]}".`);
  if (text.includes("—")) problems.push(`${label} contains an em dash.`);
  if (text.includes("!")) problems.push(`${label} contains an exclamation mark.`);
  if (/\?["'”’)]*$/u.test(text.trim())) problems.push(`${label} ends with a question mark.`);
  if (EMOJI.test(text)) problems.push(`${label} contains an emoji.`);
  if (HASHTAG.test(text)) problems.push(`${label} contains a hashtag.`);
  if (THREAD_MARKER.test(text)) problems.push(`${label} contains a thread marker.`);
  return problems;
}

function codePoints(text: string): number {
  return Array.from(text.normalize("NFC")).length;
}

function graphemes(text: string): number {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  return Array.from(segmenter.segment(text.normalize("NFC"))).length;
}

function xWeight(codePoint: number): number {
  const narrow =
    (codePoint >= 0 && codePoint <= 4351) ||
    (codePoint >= 8192 && codePoint <= 8205) ||
    (codePoint >= 8208 && codePoint <= 8223) ||
    (codePoint >= 8242 && codePoint <= 8247);
  return narrow ? 1 : 2;
}

/**
 * The weighted length X shows for a post: most Latin characters count 1,
 * wide characters and emoji count 2, and each link counts 23 whatever its length.
 */
export function xPostLength(text: string): number {
  let links = 0;
  const withoutLinks = text
    .normalize("NFC")
    .replace(SCHEME_URL, () => {
      links += 1;
      return "";
    })
    .replace(BARE_DOMAIN, () => {
      links += 1;
      return "";
    });
  let length = links * LAUNCH_LIMITS.xUrl;
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  for (const { segment } of segmenter.segment(withoutLinks)) {
    // An emoji sequence counts as one wide character.
    if (EMOJI.test(segment)) {
      length += 2;
      continue;
    }
    for (const char of segment) length += xWeight(char.codePointAt(0) ?? 0);
  }
  return length;
}

/** Bluesky counts graphemes. */
export function blueskyPostLength(text: string): number {
  return graphemes(text);
}

/** Threads and LinkedIn count characters. */
export function characterLength(text: string): number {
  return codePoints(text);
}

function visualKey(visual: LaunchVisual): string {
  switch (visual.kind) {
    case "mockup":
      return `mockup:${visual.id}:${JSON.stringify(Object.entries(visual.state).toSorted(([a], [b]) => a.localeCompare(b)))}`;
    case "clip":
      return `clip:${visual.scene}`;
    case "diagram":
      return `diagram:${visual.src}`;
  }
}

function beatShapeProblems(beats: readonly LaunchBeat[]): string[] {
  const problems: string[] = [];
  if (beats.length < LAUNCH_LIMITS.beatsMin || beats.length > LAUNCH_LIMITS.beatsMax) {
    problems.push(`A launch post has ${LAUNCH_LIMITS.beatsMin} to ${LAUNCH_LIMITS.beatsMax} beats; this one has ${beats.length}.`);
  }
  const ids = new Set<string>();
  const visuals = new Set<string>();
  let previous = -1;
  const counts = new Map<LaunchBeatPart, number>();
  for (const beat of beats) {
    const label = `Beat "${beat.id}"`;
    if (!BEAT_ID.test(beat.id)) problems.push(`${label} needs a lowercase slug id.`);
    if (ids.has(beat.id)) problems.push(`${label} is repeated.`);
    ids.add(beat.id);
    const order = launchBeatParts.indexOf(beat.part);
    if (order < 0) problems.push(`${label} has an unknown part "${String(beat.part)}".`);
    else if (order < previous) problems.push(`${label} (${beat.part}) is out of order; beats run ${launchBeatParts.join(", ")}.`);
    previous = Math.max(previous, order);
    counts.set(beat.part, (counts.get(beat.part) ?? 0) + 1);
    const key = visualKey(beat.visual);
    if (visuals.has(key)) problems.push(`${label} reuses another beat's visual; every beat needs its own.`);
    visuals.add(key);
    if (beat.detailHref !== undefined && !/^(\/(?!\/)|https:\/\/)/u.test(beat.detailHref)) {
      problems.push(`${label} detailHref must be a site path or an https URL.`);
    }
  }
  for (const part of launchBeatParts) {
    const count = counts.get(part) ?? 0;
    if (part === "does" ? count < 1 : count !== 1) {
      problems.push(part === "does" ? 'A launch post needs at least one "does" beat.' : `A launch post needs exactly one "${part}" beat; it has ${count}.`);
    }
  }
  return problems;
}

function beatTextProblems(beat: LaunchBeat): string[] {
  const label = `Beat "${beat.id}"`;
  const problems: string[] = [];
  const headline = beat.headline.trim();
  if (headline.length === 0) problems.push(`${label} needs a headline.`);
  if (characterLength(headline) > LAUNCH_LIMITS.headline) problems.push(`${label} headline is longer than ${LAUNCH_LIMITS.headline} characters.`);
  if (/\.$/u.test(headline)) problems.push(`${label} headline ends with a period.`);
  if (/^[a-zß-öø-ÿ]/u.test(headline)) problems.push(`${label} headline starts in lowercase.`);
  if (/\s[A-ZÀ-Þ][a-zß-ÿ]+\s[A-ZÀ-Þ][a-zß-ÿ]+\s[A-ZÀ-Þ][a-zß-ÿ]+/u.test(headline)) problems.push(`${label} headline looks like title case; use sentence case.`);
  if (characterLength(beat.post) > LAUNCH_LIMITS.post) problems.push(`${label} post is longer than ${LAUNCH_LIMITS.post} characters.`);
  if (beat.post.trim().length === 0) problems.push(`${label} needs a post.`);
  if (/\b(above|below|next post|previous post|as mentioned|see thread)\b/iu.test(beat.post)) {
    problems.push(`${label} post refers to another post; each post stands alone.`);
  }
  if (characterLength(beat.alt) > LAUNCH_LIMITS.alt) problems.push(`${label} alt text is longer than ${LAUNCH_LIMITS.alt} characters.`);
  if (beat.alt.trim().length === 0) problems.push(`${label} needs alt text.`);
  if (beat.visual.kind === "mockup" && !/\billustration\b/iu.test(beat.alt)) {
    problems.push(`${label} shows a mockup, so its alt text says "Illustration".`);
  }
  for (const [field, text] of [["headline", beat.headline], ["post", beat.post], ["alt", beat.alt]] as const) {
    problems.push(...launchCopyProblems(text, `${label} ${field}`));
  }
  if (beat.part === "what" && beat.post.includes("?")) problems.push(`${label} is the first post; it states what the product does and asks nothing.`);
  if (beat.part === "what") {
    for (const pattern of HOOK_PATTERNS) if (pattern.test(beat.post)) problems.push(`${label} opens with a teaser; state what the product does.`);
  }
  return problems;
}

/**
 * Check beat order, parts, ids, one visual per beat, lengths, and style.
 * Throws a `LaunchKitError` that lists every problem.
 */
export function assertLaunchBeats(beats: readonly LaunchBeat[]): void {
  const problems = [...beatShapeProblems(beats), ...beats.flatMap(beatTextProblems)];
  if (problems.length > 0) throw new LaunchKitError(problems);
}

/** Every `{key}` placeholder in a piece of beat text. */
export function launchPlaceholders(text: string): string[] {
  return [...text.matchAll(PLACEHOLDER)].map((match) => match[1] ?? "");
}

/**
 * Fill `{key}` placeholders from the launch facts. A beat may use only the
 * keys it lists in `facts`, and its authored text may contain no digits, so
 * every number in the post comes from the facts module. Names containing
 * digits can be allowed with `allowNumerals`.
 */
export function resolveLaunchBeats(
  beats: readonly LaunchBeat[],
  facts: LaunchFacts,
  options: Readonly<{ allowNumerals?: readonly string[] }> = {},
): readonly LaunchBeat[] {
  const problems: string[] = [];
  const allowed = options.allowNumerals ?? [];
  for (const [key, fact] of Object.entries(facts)) {
    if (fact.value.trim().length === 0) problems.push(`Fact "${key}" has no value.`);
    if (fact.source.trim().length === 0) problems.push(`Fact "${key}" has no source.`);
  }
  const resolved = beats.map((beat) => {
    const listed = new Set(beat.facts ?? []);
    for (const key of listed) if (!Object.hasOwn(facts, key)) problems.push(`Beat "${beat.id}" lists the unknown fact "${key}".`);
    const fill = (text: string, field: string): string => {
      let authored = text.replace(PLACEHOLDER, " ");
      for (const name of allowed) authored = authored.split(name).join(" ");
      authored = authored.replace(SCHEME_URL, " ");
      if (/\d/u.test(authored)) problems.push(`Beat "${beat.id}" ${field} types a number; put it in the facts module and use a {placeholder}.`);
      return text.replace(PLACEHOLDER, (match, key: string) => {
        if (!listed.has(key)) {
          problems.push(`Beat "${beat.id}" ${field} uses {${key}} without listing it in facts.`);
          return match;
        }
        return facts[key]?.value ?? match;
      });
    };
    return Object.freeze({
      ...beat,
      headline: fill(beat.headline, "headline"),
      post: fill(beat.post, "post"),
      alt: fill(beat.alt, "alt"),
    });
  });
  if (problems.length > 0) throw new LaunchKitError(problems);
  return Object.freeze(resolved);
}

function assertCanonicalUrl(url: string): void {
  // Parsed as a string so this module needs no DOM or Node URL global.
  const parsed = /^([a-z][a-z0-9+.-]*):\/\/([^/?#\s]+)([^?#\s]*)(\?[^#\s]*)?(#\S*)?$/iu.exec(url);
  if (parsed === null) throw new LaunchKitError([`The canonical URL "${url}" is not a URL.`]);
  const [, scheme = "", , , search = "", hash = ""] = parsed;
  const problems: string[] = [];
  if (scheme.toLowerCase() !== "https") problems.push("The canonical URL must use https.");
  if (TRACKING_PARAM.test(search)) problems.push("The canonical URL must not carry tracking parameters.");
  if (hash !== "") problems.push("The canonical URL must point at the post, not an anchor.");
  if (problems.length > 0) throw new LaunchKitError(problems);
}

/**
 * Build the social kit from resolved beats: one post per beat on X, Bluesky,
 * and Threads, one LinkedIn post, Product Hunt fields from the messaging
 * record, and a fact sheet. The last post of each thread ends with the
 * canonical URL. Run `resolveLaunchBeats` first so every number comes from facts.
 */
export function buildSocialKit(
  beats: readonly LaunchBeat[],
  messaging: LaunchMessaging,
  release: LaunchRelease,
  canonicalUrl: string,
): SocialKit {
  assertLaunchBeats(beats);
  assertCanonicalUrl(canonicalUrl);
  const unresolved = beats.filter((beat) => launchPlaceholders(`${beat.headline} ${beat.post} ${beat.alt}`).length > 0);
  if (unresolved.length > 0) {
    throw new LaunchKitError(unresolved.map((beat) => `Beat "${beat.id}" still has placeholders; run resolveLaunchBeats first.`));
  }
  const posts = beats.map((beat, index) => (index === beats.length - 1 ? `${beat.post.trim()}\n\n${canonicalUrl}` : beat.post.trim()));
  const sources: Record<string, string> = {
    "productHunt.tagline": "messaging.tagline",
    "productHunt.description": "messaging.meta",
    "productHunt.tags": "release.tags",
    status: "release.status",
    url: "canonicalUrl",
  };
  beats.forEach((beat, index) => {
    for (const channel of ["x", "bluesky", "threads"] as const) sources[`${channel}.${index}`] = `beat:${beat.id}`;
  });
  const [first, ...rest] = beats;
  const linkedin = [first?.post.trim() ?? "", ...rest.slice(0, -1).map((beat) => beat.post.trim()), posts.at(-1) ?? ""].join("\n\n");
  sources.linkedin = beats.map((beat) => `beat:${beat.id}`).join(",");
  const showHnFacts = [
    messaging.tagline,
    ...beats.filter((beat) => beat.part !== "vision").map((beat) => beat.post.trim()),
    `${release.status}. ${canonicalUrl}`,
  ];
  return Object.freeze({
    x: Object.freeze([...posts]),
    bluesky: Object.freeze([...posts]),
    threads: Object.freeze([...posts]),
    linkedin,
    productHunt: Object.freeze({
      tagline: messaging.tagline,
      description: messaging.meta,
      tags: Object.freeze([...(release.tags ?? [])]),
    }),
    showHnFacts: Object.freeze(showHnFacts),
    sources: Object.freeze(sources),
  });
}

/**
 * Check a launch kit before it ships: channel limits, style rules, no install
 * call to action unless the release has a public install, the status label in
 * the last post, and the tagline and URL from their records.
 * Throws a `LaunchKitError` that lists every problem.
 */
export function assertLaunchKit(beats: readonly LaunchBeat[], kit: SocialKit, options: LaunchKitOptions): void {
  const problems: string[] = [];
  try {
    assertLaunchBeats(beats);
  } catch (error) {
    if (error instanceof LaunchKitError) problems.push(...error.problems);
    else throw error;
  }
  if (!STATUS_LABEL.test(options.status)) problems.push(`"${options.status}" is not a STYLE.md status label.`);
  if (options.canonicalUrl !== undefined) {
    try {
      assertCanonicalUrl(options.canonicalUrl);
    } catch (error) {
      if (error instanceof LaunchKitError) problems.push(...error.problems);
      else throw error;
    }
  }
  const forbidden = (options.forbiddenNames ?? []).filter((name) => name.trim().length > 0);
  const forbiddenPattern = forbidden.length === 0 ? null : wordPattern(forbidden);
  const checkText = (text: string, label: string): void => {
    problems.push(...launchCopyProblems(text, label));
    if (forbiddenPattern !== null) {
      const hit = forbiddenPattern.exec(text);
      if (hit !== null) problems.push(`${label} names "${hit[0]}"; comparisons belong on comparison pages.`);
    }
    if (!options.publicInstall && INSTALL_PATTERN.test(text)) {
      problems.push(`${label} asks readers to install, but the release has no public install.`);
    }
    for (const match of text.matchAll(SCHEME_URL)) {
      if (TRACKING_PARAM.test(match[0])) problems.push(`${label} links with tracking parameters.`);
    }
  };
  const threads = [
    ["x", kit.x, xPostLength, LAUNCH_LIMITS.x],
    ["bluesky", kit.bluesky, blueskyPostLength, LAUNCH_LIMITS.bluesky],
    ["threads", kit.threads, characterLength, LAUNCH_LIMITS.threads],
  ] as const;
  for (const [channel, posts, measure, limit] of threads) {
    if (posts.length === 0) problems.push(`The ${channel} thread is empty.`);
    if (posts.length > beats.length) problems.push(`The ${channel} thread has more posts than beats.`);
    posts.forEach((post, index) => {
      const label = `${channel} post ${index + 1}`;
      const length = measure(post);
      if (length > limit) problems.push(`${label} is ${length} long; the limit is ${limit}.`);
      checkText(post, label);
    });
    const last = posts.at(-1) ?? "";
    if (!last.includes(options.status)) problems.push(`The last ${channel} post must state the status "${options.status}".`);
    if (options.canonicalUrl !== undefined && !last.trimEnd().endsWith(options.canonicalUrl)) {
      problems.push(`The last ${channel} post must end with the canonical URL.`);
    }
    posts.slice(0, -1).forEach((post, index) => {
      if (/\bhttps?:\/\//u.test(post)) problems.push(`${channel} post ${index + 1} carries a link; only the last post links.`);
    });
  }
  if (characterLength(kit.linkedin) > LAUNCH_LIMITS.linkedin) problems.push(`The LinkedIn post is longer than ${LAUNCH_LIMITS.linkedin} characters.`);
  const hook = kit.linkedin.split(/\n\s*\n/u)[0] ?? "";
  if (characterLength(hook) > LAUNCH_LIMITS.linkedinHook) problems.push(`The LinkedIn opening paragraph is longer than ${LAUNCH_LIMITS.linkedinHook} characters.`);
  if (!kit.linkedin.includes(options.status)) problems.push(`The LinkedIn post must state the status "${options.status}".`);
  checkText(kit.linkedin, "LinkedIn post");
  const { productHunt } = kit;
  if (characterLength(productHunt.tagline) > LAUNCH_LIMITS.productHuntTagline) problems.push(`The Product Hunt tagline is longer than ${LAUNCH_LIMITS.productHuntTagline} characters.`);
  if (characterLength(productHunt.description) > LAUNCH_LIMITS.productHuntDescription) {
    problems.push(`The Product Hunt description is longer than ${LAUNCH_LIMITS.productHuntDescription} characters.`);
  }
  if (options.tagline !== undefined && productHunt.tagline !== options.tagline) problems.push("The Product Hunt tagline must be the messaging tagline.");
  if (kit.sources["productHunt.tagline"] !== "messaging.tagline") problems.push("The Product Hunt tagline must come from the messaging record.");
  if (kit.sources.status !== "release.status") problems.push("The status must come from the release record.");
  checkText(productHunt.tagline, "Product Hunt tagline");
  checkText(productHunt.description, "Product Hunt description");
  kit.showHnFacts.forEach((fact, index) => checkText(fact, `fact ${index + 1}`));
  if (problems.length > 0) throw new LaunchKitError([...new Set(problems)]);
}
