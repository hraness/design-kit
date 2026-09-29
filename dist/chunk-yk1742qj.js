// src/launch.ts
var launchBeatParts = ["what", "does", "how", "who", "vision", "limits", "status"];
var LAUNCH_LIMITS = Object.freeze({
  beatsMin: 7,
  beatsMax: 10,
  headline: 70,
  post: 250,
  alt: 125,
  x: 280,
  xUrl: 23,
  bluesky: 300,
  threads: 500,
  linkedin: 3000,
  linkedinHook: 210,
  productHuntTagline: 60,
  productHuntDescription: 260
});
var LAUNCH_BANNED_WORDS = Object.freeze(["actually", "amid", "blazing", "cutting-edge", "delve", "elevate", "empower", "game-changer", "genuinely", "harness", "in today's world", "journey", "landscape", "leverage", "notable", "pivotal", "powerful", "realm", "revolutionary", "revolutionize", "robust", "seamless", "seamlessly", "showcase", "significant", "supercharge", "tapestry", "testament", "underscore", "unlock"]);
var LAUNCH_INTERNAL_WORDS = Object.freeze(["admission", "admitted", "attest", "bounded", "boundary", "custody", "gate", "lane", "lease", "manifest", "projection", "qualification", "quarantined", "receipt", "settlement", "surface"]);
var HOOK_PATTERNS = [/\bhere'?s why\b/iu, /\bhere'?s how\b/iu, /\ba thread\b/iu, /\bthread below\b/iu, /\bwait (for|until)\b/iu, /\byou won'?t believe\b/iu];
var THREAD_MARKER = /(^|\s)\d+\s*\/\s*\d*(\s|$)|\u{1F9F5}/u;
var INSTALL_PATTERN = /\b(install|installs|installing|npm i|npx|bunx|pip|brew|download|get it (now|here)|try it (now|today)|sign up)\b|curl\s[^|]*\|\s*(ba|z)?sh/iu;
var TRACKING_PARAM = /[?&](utm_[a-z]+|ref|ref_src|fbclid|gclid|mc_[a-z]+|s)=/iu;
var EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}]/u;
var HASHTAG = /(^|\s)#[A-Za-z0-9_À-ɏͰ-ϿЀ-ӿ]+/u;
var PLACEHOLDER = /\{([a-z][a-zA-Z0-9_.-]*)\}/gu;
var BEAT_ID = /^[a-z0-9][a-z0-9-]*$/u;
var STATUS_LABEL = /^(In development|Preview|Beta|Latest release: v\d+\.\d+\.\d+|Paused|Retired)$/u;
var SCHEME_URL = /\bhttps?:\/\/[^\s]+/giu;
var BARE_DOMAIN = /\b[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)*\.(com|net|org|dev|app|io|ai|co|sh|so|xyz|me|site|page|tech)(\/[^\s]*)?\b/giu;

class LaunchKitError extends Error {
  problems;
  constructor(problems) {
    super(`Launch kit check failed:
- ${problems.join(`
- `)}`);
    this.name = "LaunchKitError";
    this.problems = Object.freeze([...problems]);
  }
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
function wordPattern(words) {
  const alternatives = words.map((word) => escapeRegExp(word).replace(/'/gu, "['’]").replace(/-/gu, "[- ]?"));
  return new RegExp(`(?<![A-Za-z0-9\\u00C0-\\u024F])(${alternatives.join("|")})(s|es|d|ed|ing)?(?![A-Za-z0-9\\u00C0-\\u024F])`, "iu");
}
var BANNED_PATTERN = wordPattern(LAUNCH_BANNED_WORDS);
var INTERNAL_PATTERN = wordPattern(LAUNCH_INTERNAL_WORDS);
function launchCopyProblems(text, label = "text") {
  const problems = [];
  const banned = BANNED_PATTERN.exec(text);
  if (banned !== null)
    problems.push(`${label} uses the banned word "${banned[0]}".`);
  const internal = INTERNAL_PATTERN.exec(text);
  if (internal !== null)
    problems.push(`${label} uses the internal word "${internal[0]}".`);
  if (text.includes("—"))
    problems.push(`${label} contains an em dash.`);
  if (text.includes("!"))
    problems.push(`${label} contains an exclamation mark.`);
  if (/\?["'”’)]*$/u.test(text.trim()))
    problems.push(`${label} ends with a question mark.`);
  if (EMOJI.test(text))
    problems.push(`${label} contains an emoji.`);
  if (HASHTAG.test(text))
    problems.push(`${label} contains a hashtag.`);
  if (THREAD_MARKER.test(text))
    problems.push(`${label} contains a thread marker.`);
  return problems;
}
function codePoints(text) {
  return Array.from(text.normalize("NFC")).length;
}
function graphemes(text) {
  const segmenter = new Intl.Segmenter("en", {
    granularity: "grapheme"
  });
  return Array.from(segmenter.segment(text.normalize("NFC"))).length;
}
function xWeight(codePoint) {
  const narrow = codePoint >= 0 && codePoint <= 4351 || codePoint >= 8192 && codePoint <= 8205 || codePoint >= 8208 && codePoint <= 8223 || codePoint >= 8242 && codePoint <= 8247;
  return narrow ? 1 : 2;
}
function xPostLength(text) {
  let links = 0;
  const withoutLinks = text.normalize("NFC").replace(SCHEME_URL, () => {
    links += 1;
    return "";
  }).replace(BARE_DOMAIN, () => {
    links += 1;
    return "";
  });
  let length = links * LAUNCH_LIMITS.xUrl;
  const segmenter = new Intl.Segmenter("en", {
    granularity: "grapheme"
  });
  for (const {
    segment
  } of segmenter.segment(withoutLinks)) {
    if (EMOJI.test(segment)) {
      length += 2;
      continue;
    }
    for (const char of segment)
      length += xWeight(char.codePointAt(0) ?? 0);
  }
  return length;
}
function blueskyPostLength(text) {
  return graphemes(text);
}
function characterLength(text) {
  return codePoints(text);
}
function visualKey(visual) {
  switch (visual.kind) {
    case "mockup":
      return `mockup:${visual.id}:${JSON.stringify(Object.entries(visual.state).toSorted(([a], [b]) => a.localeCompare(b)))}`;
    case "clip":
      return `clip:${visual.scene}`;
    case "diagram":
      return `diagram:${visual.src}`;
  }
}
function beatShapeProblems(beats) {
  const problems = [];
  if (beats.length < LAUNCH_LIMITS.beatsMin || beats.length > LAUNCH_LIMITS.beatsMax) {
    problems.push(`A launch post has ${LAUNCH_LIMITS.beatsMin} to ${LAUNCH_LIMITS.beatsMax} beats; this one has ${beats.length}.`);
  }
  const ids = new Set;
  const visuals = new Set;
  let previous = -1;
  const counts = new Map;
  for (const beat of beats) {
    const label = `Beat "${beat.id}"`;
    if (!BEAT_ID.test(beat.id))
      problems.push(`${label} needs a lowercase slug id.`);
    if (ids.has(beat.id))
      problems.push(`${label} is repeated.`);
    ids.add(beat.id);
    const order = launchBeatParts.indexOf(beat.part);
    if (order < 0)
      problems.push(`${label} has an unknown part "${String(beat.part)}".`);
    else if (order < previous)
      problems.push(`${label} (${beat.part}) is out of order; beats run ${launchBeatParts.join(", ")}.`);
    previous = Math.max(previous, order);
    counts.set(beat.part, (counts.get(beat.part) ?? 0) + 1);
    const key = visualKey(beat.visual);
    if (visuals.has(key))
      problems.push(`${label} reuses another beat's visual; every beat needs its own.`);
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
function beatTextProblems(beat) {
  const label = `Beat "${beat.id}"`;
  const problems = [];
  const headline = beat.headline.trim();
  if (headline.length === 0)
    problems.push(`${label} needs a headline.`);
  if (characterLength(headline) > LAUNCH_LIMITS.headline)
    problems.push(`${label} headline is longer than ${LAUNCH_LIMITS.headline} characters.`);
  if (/\.$/u.test(headline))
    problems.push(`${label} headline ends with a period.`);
  if (/^[a-zß-öø-ÿ]/u.test(headline))
    problems.push(`${label} headline starts in lowercase.`);
  if (/\s[A-ZÀ-Þ][a-zß-ÿ]+\s[A-ZÀ-Þ][a-zß-ÿ]+\s[A-ZÀ-Þ][a-zß-ÿ]+/u.test(headline))
    problems.push(`${label} headline looks like title case; use sentence case.`);
  if (characterLength(beat.post) > LAUNCH_LIMITS.post)
    problems.push(`${label} post is longer than ${LAUNCH_LIMITS.post} characters.`);
  if (beat.post.trim().length === 0)
    problems.push(`${label} needs a post.`);
  if (/\b(above|below|next post|previous post|as mentioned|see thread)\b/iu.test(beat.post)) {
    problems.push(`${label} post refers to another post; each post stands alone.`);
  }
  if (characterLength(beat.alt) > LAUNCH_LIMITS.alt)
    problems.push(`${label} alt text is longer than ${LAUNCH_LIMITS.alt} characters.`);
  if (beat.alt.trim().length === 0)
    problems.push(`${label} needs alt text.`);
  if (beat.visual.kind === "mockup" && !/\billustration\b/iu.test(beat.alt)) {
    problems.push(`${label} shows a mockup, so its alt text says "Illustration".`);
  }
  for (const [field, text] of [["headline", beat.headline], ["post", beat.post], ["alt", beat.alt]]) {
    problems.push(...launchCopyProblems(text, `${label} ${field}`));
  }
  if (beat.part === "what" && beat.post.includes("?"))
    problems.push(`${label} is the first post; it states what the product does and asks nothing.`);
  if (beat.part === "what") {
    for (const pattern of HOOK_PATTERNS)
      if (pattern.test(beat.post))
        problems.push(`${label} opens with a teaser; state what the product does.`);
  }
  return problems;
}
function assertLaunchBeats(beats) {
  const problems = [...beatShapeProblems(beats), ...beats.flatMap(beatTextProblems)];
  if (problems.length > 0)
    throw new LaunchKitError(problems);
}
function launchPlaceholders(text) {
  return [...text.matchAll(PLACEHOLDER)].map((match) => match[1] ?? "");
}
function resolveLaunchBeats(beats, facts, options = {}) {
  const problems = [];
  const allowed = options.allowNumerals ?? [];
  for (const [key, fact] of Object.entries(facts)) {
    if (fact.value.trim().length === 0)
      problems.push(`Fact "${key}" has no value.`);
    if (fact.source.trim().length === 0)
      problems.push(`Fact "${key}" has no source.`);
  }
  const resolved = beats.map((beat) => {
    const listed = new Set(beat.facts ?? []);
    for (const key of listed)
      if (!Object.hasOwn(facts, key))
        problems.push(`Beat "${beat.id}" lists the unknown fact "${key}".`);
    const fill = (text, field) => {
      let authored = text.replace(PLACEHOLDER, " ");
      for (const name of allowed)
        authored = authored.split(name).join(" ");
      authored = authored.replace(SCHEME_URL, " ");
      if (/\d/u.test(authored))
        problems.push(`Beat "${beat.id}" ${field} types a number; put it in the facts module and use a {placeholder}.`);
      return text.replace(PLACEHOLDER, (match, key) => {
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
      alt: fill(beat.alt, "alt")
    });
  });
  if (problems.length > 0)
    throw new LaunchKitError(problems);
  return Object.freeze(resolved);
}
function assertCanonicalUrl(url) {
  const parsed = /^([a-z][a-z0-9+.-]*):\/\/([^/?#\s]+)([^?#\s]*)(\?[^#\s]*)?(#\S*)?$/iu.exec(url);
  if (parsed === null)
    throw new LaunchKitError([`The canonical URL "${url}" is not a URL.`]);
  const [, scheme = "", , , search = "", hash = ""] = parsed;
  const problems = [];
  if (scheme.toLowerCase() !== "https")
    problems.push("The canonical URL must use https.");
  if (TRACKING_PARAM.test(search))
    problems.push("The canonical URL must not carry tracking parameters.");
  if (hash !== "")
    problems.push("The canonical URL must point at the post, not an anchor.");
  if (problems.length > 0)
    throw new LaunchKitError(problems);
}
function buildSocialKit(beats, messaging, release, canonicalUrl) {
  assertLaunchBeats(beats);
  assertCanonicalUrl(canonicalUrl);
  const unresolved = beats.filter((beat) => launchPlaceholders(`${beat.headline} ${beat.post} ${beat.alt}`).length > 0);
  if (unresolved.length > 0) {
    throw new LaunchKitError(unresolved.map((beat) => `Beat "${beat.id}" still has placeholders; run resolveLaunchBeats first.`));
  }
  const posts = beats.map((beat, index) => index === beats.length - 1 ? `${beat.post.trim()}

${canonicalUrl}` : beat.post.trim());
  const sources = {
    "productHunt.tagline": "messaging.tagline",
    "productHunt.description": "messaging.meta",
    "productHunt.tags": "release.tags",
    status: "release.status",
    url: "canonicalUrl"
  };
  beats.forEach((beat, index) => {
    for (const channel of ["x", "bluesky", "threads"])
      sources[`${channel}.${index}`] = `beat:${beat.id}`;
  });
  const [first, ...rest] = beats;
  const linkedin = [first?.post.trim() ?? "", ...rest.slice(0, -1).map((beat) => beat.post.trim()), posts.at(-1) ?? ""].join(`

`);
  sources.linkedin = beats.map((beat) => `beat:${beat.id}`).join(",");
  const showHnFacts = [messaging.tagline, ...beats.filter((beat) => beat.part !== "vision").map((beat) => beat.post.trim()), `${release.status}. ${canonicalUrl}`];
  return Object.freeze({
    x: Object.freeze([...posts]),
    bluesky: Object.freeze([...posts]),
    threads: Object.freeze([...posts]),
    linkedin,
    productHunt: Object.freeze({
      tagline: messaging.tagline,
      description: messaging.meta,
      tags: Object.freeze([...release.tags ?? []])
    }),
    showHnFacts: Object.freeze(showHnFacts),
    sources: Object.freeze(sources)
  });
}
function assertLaunchKit(beats, kit, options) {
  const problems = [];
  try {
    assertLaunchBeats(beats);
  } catch (error) {
    if (error instanceof LaunchKitError)
      problems.push(...error.problems);
    else
      throw error;
  }
  if (!STATUS_LABEL.test(options.status))
    problems.push(`"${options.status}" is not a STYLE.md status label.`);
  if (options.canonicalUrl !== undefined) {
    try {
      assertCanonicalUrl(options.canonicalUrl);
    } catch (error) {
      if (error instanceof LaunchKitError)
        problems.push(...error.problems);
      else
        throw error;
    }
  }
  const forbidden = (options.forbiddenNames ?? []).filter((name) => name.trim().length > 0);
  const forbiddenPattern = forbidden.length === 0 ? null : wordPattern(forbidden);
  const checkText = (text, label) => {
    problems.push(...launchCopyProblems(text, label));
    if (forbiddenPattern !== null) {
      const hit = forbiddenPattern.exec(text);
      if (hit !== null)
        problems.push(`${label} names "${hit[0]}"; comparisons belong on comparison pages.`);
    }
    if (!options.publicInstall && INSTALL_PATTERN.test(text)) {
      problems.push(`${label} asks readers to install, but the release has no public install.`);
    }
    for (const match of text.matchAll(SCHEME_URL)) {
      if (TRACKING_PARAM.test(match[0]))
        problems.push(`${label} links with tracking parameters.`);
    }
  };
  const threads = [["x", kit.x, xPostLength, LAUNCH_LIMITS.x], ["bluesky", kit.bluesky, blueskyPostLength, LAUNCH_LIMITS.bluesky], ["threads", kit.threads, characterLength, LAUNCH_LIMITS.threads]];
  for (const [channel, posts, measure, limit] of threads) {
    if (posts.length === 0)
      problems.push(`The ${channel} thread is empty.`);
    if (posts.length > beats.length)
      problems.push(`The ${channel} thread has more posts than beats.`);
    posts.forEach((post, index) => {
      const label = `${channel} post ${index + 1}`;
      const length = measure(post);
      if (length > limit)
        problems.push(`${label} is ${length} long; the limit is ${limit}.`);
      checkText(post, label);
    });
    const last = posts.at(-1) ?? "";
    if (!last.includes(options.status))
      problems.push(`The last ${channel} post must state the status "${options.status}".`);
    if (options.canonicalUrl !== undefined && !last.trimEnd().endsWith(options.canonicalUrl)) {
      problems.push(`The last ${channel} post must end with the canonical URL.`);
    }
    posts.slice(0, -1).forEach((post, index) => {
      if (/\bhttps?:\/\//u.test(post))
        problems.push(`${channel} post ${index + 1} carries a link; only the last post links.`);
    });
  }
  if (characterLength(kit.linkedin) > LAUNCH_LIMITS.linkedin)
    problems.push(`The LinkedIn post is longer than ${LAUNCH_LIMITS.linkedin} characters.`);
  const hook = kit.linkedin.split(/\n\s*\n/u)[0] ?? "";
  if (characterLength(hook) > LAUNCH_LIMITS.linkedinHook)
    problems.push(`The LinkedIn opening paragraph is longer than ${LAUNCH_LIMITS.linkedinHook} characters.`);
  if (!kit.linkedin.includes(options.status))
    problems.push(`The LinkedIn post must state the status "${options.status}".`);
  checkText(kit.linkedin, "LinkedIn post");
  const {
    productHunt
  } = kit;
  if (characterLength(productHunt.tagline) > LAUNCH_LIMITS.productHuntTagline)
    problems.push(`The Product Hunt tagline is longer than ${LAUNCH_LIMITS.productHuntTagline} characters.`);
  if (characterLength(productHunt.description) > LAUNCH_LIMITS.productHuntDescription) {
    problems.push(`The Product Hunt description is longer than ${LAUNCH_LIMITS.productHuntDescription} characters.`);
  }
  if (options.tagline !== undefined && productHunt.tagline !== options.tagline)
    problems.push("The Product Hunt tagline must be the messaging tagline.");
  if (kit.sources["productHunt.tagline"] !== "messaging.tagline")
    problems.push("The Product Hunt tagline must come from the messaging record.");
  if (kit.sources.status !== "release.status")
    problems.push("The status must come from the release record.");
  checkText(productHunt.tagline, "Product Hunt tagline");
  checkText(productHunt.description, "Product Hunt description");
  kit.showHnFacts.forEach((fact, index) => checkText(fact, `fact ${index + 1}`));
  if (problems.length > 0)
    throw new LaunchKitError([...new Set(problems)]);
}

export { launchBeatParts, LAUNCH_LIMITS, LAUNCH_BANNED_WORDS, LAUNCH_INTERNAL_WORDS, LaunchKitError, launchCopyProblems, xPostLength, blueskyPostLength, characterLength, assertLaunchBeats, launchPlaceholders, resolveLaunchBeats, buildSocialKit, assertLaunchKit };
