import {
  ARTICLE_BYLINE_PREFIX,
  ARTICLE_SOURCES_HEADING,
  ARTICLE_TOC_LABEL,
  articleProvenanceSentence,
  assertArticleAuthor,
  assertArticleCalloutTone,
  assertArticleDates,
  assertArticleHref,
  formatArticleDate
} from "./chunk-zzq7bdj8.js";

// src/palette-color.ts
function channels(hex) {
  if (!/^#[0-9a-f]{6}$/iu.test(hex))
    throw new Error("Palette colors must be six-digit hex values.");
  return [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
}
function mixPaletteColor(color, toward, amount) {
  const target = channels(toward);
  return `#${channels(color).map((value, index) => Math.round(value * (1 - amount) + (target[index] ?? 0) * amount).toString(16).padStart(2, "0")).join("")}`;
}
function luminance(hex) {
  const linearize = (channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const [red, green, blue] = channels(hex);
  return linearize(red) * 0.2126 + linearize(green) * 0.7152 + linearize(blue) * 0.0722;
}
function paletteContrast(a, b) {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
function readablePaletteColor(color, toward, backgrounds, minimum) {
  for (let step = 0;step <= 100; step += 1) {
    const candidate = mixPaletteColor(color, toward, step / 100);
    if (backgrounds.every((background) => paletteContrast(candidate, background) >= minimum))
      return candidate;
  }
  throw new Error("The authored palette cannot meet its contrast contract.");
}

// src/palettes.ts
var designPalettes = ["catppuccin", "gruvbox", "rose-pine", "tokyo-night", "paper"];
var designPaletteLabels = {
  catppuccin: "Catppuccin",
  gruvbox: "Gruvbox",
  "rose-pine": "Rosé Pine",
  "tokyo-night": "Tokyo Night",
  paper: "Paper"
};
function isDesignPalette(value) {
  return typeof value === "string" && designPalettes.some((palette) => palette === value);
}
var designPaletteSources = {
  paper: {
    light: {
      background: "#f8f7f4",
      surface: "#fffefa",
      raised: "#fffefa",
      hover: "#ebe8e3",
      text: "#1c1917",
      muted: "#6f6962",
      border: "#8b8278",
      primary: "#1f5eea",
      danger: "#b23c34",
      warning: "#a65f00",
      success: "#26814d",
      info: "#1f5eea",
      violet: "#7959a5",
      rose: "#a44b65"
    },
    dark: {
      background: "#12100f",
      surface: "#1d1a18",
      raised: "#211d1a",
      hover: "#292522",
      text: "#f5f2ed",
      muted: "#aaa29a",
      border: "#827a72",
      primary: "#8fb0ff",
      danger: "#ef8c82",
      warning: "#efae55",
      success: "#5fc98b",
      info: "#8fb0ff",
      violet: "#b7a0dc",
      rose: "#db91aa"
    }
  },
  catppuccin: {
    dark: {
      background: "#1e1e2e",
      surface: "#181825",
      raised: "#313244",
      hover: "#45475a",
      text: "#cdd6f4",
      muted: "#a6adc8",
      border: "#7f849c",
      primary: "#89b4fa",
      danger: "#f38ba8",
      warning: "#f9e2af",
      success: "#a6e3a1",
      info: "#89dceb",
      violet: "#cba6f7",
      rose: "#f5c2e7"
    },
    light: {
      background: "#eff1f5",
      surface: "#e6e9ef",
      raised: "#dce0e8",
      hover: "#ccd0da",
      text: "#4c4f69",
      muted: "#6c6f85",
      border: "#7c7f93",
      primary: "#1e66f5",
      danger: "#d20f39",
      warning: "#df8e1d",
      success: "#40a02b",
      info: "#179299",
      violet: "#8839ef",
      rose: "#ea76cb"
    }
  },
  gruvbox: {
    dark: {
      background: "#282828",
      surface: "#1d2021",
      raised: "#3c3836",
      hover: "#504945",
      text: "#ebdbb2",
      muted: "#bdae93",
      border: "#928374",
      primary: "#83a598",
      danger: "#fb4934",
      warning: "#fabd2f",
      success: "#b8bb26",
      info: "#8ec07c",
      violet: "#d3869b",
      rose: "#fe8019"
    },
    light: {
      background: "#fbf1c7",
      surface: "#f9f5d7",
      raised: "#ebdbb2",
      hover: "#d5c4a1",
      text: "#3c3836",
      muted: "#665c54",
      border: "#7c6f64",
      primary: "#076678",
      danger: "#9d0006",
      warning: "#b57614",
      success: "#79740e",
      info: "#427b58",
      violet: "#8f3f71",
      rose: "#af3a03"
    }
  },
  "rose-pine": {
    dark: {
      background: "#191724",
      surface: "#1f1d2e",
      raised: "#26233a",
      hover: "#403d52",
      text: "#e0def4",
      muted: "#908caa",
      border: "#908caa",
      primary: "#c4a7e7",
      danger: "#eb6f92",
      warning: "#f6c177",
      success: "#9ccfd8",
      info: "#ebbcba",
      violet: "#c4a7e7",
      rose: "#ebbcba"
    },
    light: {
      background: "#faf4ed",
      surface: "#fffaf3",
      raised: "#f2e9e1",
      hover: "#dfdad9",
      text: "#575279",
      muted: "#797593",
      border: "#797593",
      primary: "#907aa9",
      danger: "#b4637a",
      warning: "#ea9d34",
      success: "#286983",
      info: "#56949f",
      violet: "#907aa9",
      rose: "#d7827e"
    }
  },
  "tokyo-night": {
    dark: {
      background: "#1a1b26",
      surface: "#16161e",
      raised: "#24283b",
      hover: "#292e42",
      text: "#c0caf5",
      muted: "#a9b1d6",
      border: "#737aa2",
      primary: "#7aa2f7",
      danger: "#f7768e",
      warning: "#e0af68",
      success: "#9ece6a",
      info: "#7dcfff",
      violet: "#bb9af7",
      rose: "#ff9e64"
    },
    light: {
      background: "#e1e2e7",
      surface: "#d0d5e3",
      raised: "#c4c8da",
      hover: "#b7c1e3",
      text: "#3760bf",
      muted: "#6172b0",
      border: "#6172b0",
      primary: "#2e7de9",
      danger: "#f52a65",
      warning: "#8c6c3e",
      success: "#587539",
      info: "#007197",
      violet: "#9854f1",
      rose: "#b15c00"
    }
  }
};
function createPalette(source, mode) {
  const surfaces = [source.background, source.surface, source.raised, source.hover];
  const endpoint = mode === "dark" ? "#ffffff" : "#000000";
  const foreground = readablePaletteColor(source.text, endpoint, surfaces, 7);
  const muted = readablePaletteColor(source.muted, endpoint, surfaces, 4.6);
  const status = (seed) => {
    const soft = mixPaletteColor(source.background, seed, 0.12);
    const color = readablePaletteColor(seed, endpoint, [...surfaces, soft], 4.6);
    const onColor = paletteContrast(color, source.background) >= 4.5 ? source.background : endpoint === "#ffffff" ? "#000000" : "#ffffff";
    return {
      color,
      foreground: onColor,
      soft
    };
  };
  const primary = status(source.primary);
  const danger = status(source.danger);
  const warning = status(source.warning);
  const success = status(source.success);
  const info = status(source.info);
  return Object.freeze({
    background: source.background,
    foreground,
    muted,
    faint: muted,
    grid: source.raised,
    line: source.hover,
    controlBorder: readablePaletteColor(source.border, endpoint, surfaces, 3.1),
    surface: source.surface,
    surfaceRaised: source.raised,
    surfaceHover: source.hover,
    card: source.surface,
    cardForeground: foreground,
    popover: source.raised,
    popoverForeground: foreground,
    primary: primary.color,
    primaryForeground: primary.foreground,
    primarySoft: primary.soft,
    secondary: source.raised,
    secondaryForeground: foreground,
    accent: primary.soft,
    accentForeground: foreground,
    focus: primary.color,
    scrim: mode === "dark" ? "#000000b8" : "#00000070",
    disabled: source.raised,
    disabledForeground: muted,
    inverse: foreground,
    inverseForeground: source.background,
    danger: danger.color,
    dangerForeground: danger.foreground,
    dangerSoft: danger.soft,
    warning: warning.color,
    warningForeground: warning.foreground,
    warningSoft: warning.soft,
    success: success.color,
    successForeground: success.foreground,
    successSoft: success.soft,
    info: info.color,
    infoForeground: info.foreground,
    infoSoft: info.soft,
    chart1: readablePaletteColor(source.rose, endpoint, surfaces, 4.6),
    chart2: success.color,
    chart3: info.color,
    chart4: warning.color,
    chart5: readablePaletteColor(source.violet, endpoint, surfaces, 4.6)
  });
}
var paletteColors = Object.freeze({
  paper: Object.freeze({
    light: Object.freeze({
      ...createPalette(designPaletteSources.paper.light, "light"),
      grid: "#dfdcd6",
      line: "#b9b3ab",
      secondary: "#ebe8e3"
    }),
    dark: Object.freeze({
      ...createPalette(designPaletteSources.paper.dark, "dark"),
      grid: "#302b27",
      line: "#514a44",
      secondary: "#292522"
    })
  }),
  catppuccin: Object.freeze({
    light: createPalette(designPaletteSources.catppuccin.light, "light"),
    dark: createPalette(designPaletteSources.catppuccin.dark, "dark")
  }),
  gruvbox: Object.freeze({
    light: createPalette(designPaletteSources.gruvbox.light, "light"),
    dark: createPalette(designPaletteSources.gruvbox.dark, "dark")
  }),
  "rose-pine": Object.freeze({
    light: createPalette(designPaletteSources["rose-pine"].light, "light"),
    dark: createPalette(designPaletteSources["rose-pine"].dark, "dark")
  }),
  "tokyo-night": Object.freeze({
    light: createPalette(designPaletteSources["tokyo-night"].light, "light"),
    dark: createPalette(designPaletteSources["tokyo-night"].dark, "dark")
  })
});
// src/appearance.ts
var designThemes = ["light", "dark", "system"];
var defaultDesignTheme = "system";
var designThemeStorageKey = "hraness-design-theme-v1";
function isDesignTheme(value) {
  return typeof value === "string" && designThemes.some((theme) => theme === value);
}
function normalizeDesignTheme(value) {
  return isDesignTheme(value) ? value : defaultDesignTheme;
}
function designThemeLabel(theme, labels) {
  return labels?.[theme] ?? `${theme.charAt(0).toUpperCase()}${theme.slice(1)}`;
}
function resolveDesignTheme(theme, systemPrefersDark) {
  return theme === "system" ? systemPrefersDark ? "dark" : "light" : theme;
}

// src/palette-appearance.ts
var defaultDesignPalettePreference = Object.freeze({
  palette: "catppuccin",
  mode: "dark"
});
var designPaletteStorageKey = "hraness-design-palette-v1";
function parseDesignPalettePreference(value) {
  if (typeof value === "string") {
    if (value.length > 256)
      return null;
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  const record = value;
  if (!isDesignPalette(record.palette) || !isDesignTheme(record.mode))
    return null;
  return Object.freeze({
    palette: record.palette,
    mode: record.mode
  });
}
function normalizeDesignPalettePreference(value, fallback = defaultDesignPalettePreference) {
  return parseDesignPalettePreference(value) ?? parseDesignPalettePreference(fallback) ?? defaultDesignPalettePreference;
}
function resolveDesignPalettePreference(preference, systemPrefersDark) {
  return {
    palette: preference.palette,
    mode: resolveDesignTheme(preference.mode, systemPrefersDark)
  };
}
// src/palette-themes.ts
import * as stylex from "@stylexjs/stylex";

// src/palette-tokens.stylex.ts
var catppuccinLight = {
  x18acsur: "xadus2s x18acsur",
  $$css: true
};
var catppuccinDark = {
  x18acsur: "x18wthyl x18acsur",
  $$css: true
};
var gruvboxLight = {
  x18acsur: "xdktuxt x18acsur",
  $$css: true
};
var gruvboxDark = {
  x18acsur: "x1fsd05x x18acsur",
  $$css: true
};
var rosePineLight = {
  x18acsur: "x131glkb x18acsur",
  $$css: true
};
var rosePineDark = {
  x18acsur: "xivpxii x18acsur",
  $$css: true
};
var tokyoNightLight = {
  x18acsur: "x11phk89 x18acsur",
  $$css: true
};
var tokyoNightDark = {
  x18acsur: "xgp1gpt x18acsur",
  $$css: true
};
var paperLight = {
  x18acsur: "xjfxk3y x18acsur",
  $$css: true
};
var paperDark = {
  x18acsur: "x1lresar x18acsur",
  $$css: true
};

// src/palette-themes.ts
var classes = {
  paper: {
    light: stylex.props(paperLight).className,
    dark: stylex.props(paperDark).className
  },
  catppuccin: {
    light: stylex.props(catppuccinLight).className,
    dark: stylex.props(catppuccinDark).className
  },
  gruvbox: {
    light: stylex.props(gruvboxLight).className,
    dark: stylex.props(gruvboxDark).className
  },
  "rose-pine": {
    light: stylex.props(rosePineLight).className,
    dark: stylex.props(rosePineDark).className
  },
  "tokyo-night": {
    light: stylex.props(tokyoNightLight).className,
    dark: stylex.props(tokyoNightDark).className
  }
};
function getDesignPaletteTheme(palette, mode) {
  return {
    className: `hraness-palette ${classes[palette][mode]}`,
    background: paletteColors[palette][mode].background
  };
}
// src/article-html.ts
var ROOT_CLASS = "plain-site plain-publication plain-publication--embedded";
var SEPARATOR = '<span aria-hidden="true"> · </span>';
var ESCAPES = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&#x27;",
  "<": "&lt;",
  ">": "&gt;"
};
function escapeArticleHtml(value) {
  return value.replace(/["&'<>]/gu, (character) => ESCAPES[character] ?? character);
}
function classes2(...values) {
  return values.filter((value) => value !== undefined && value !== "").join(" ");
}
function dateHtml(label, value) {
  return `${label} <time dateTime="${escapeArticleHtml(value)}">${escapeArticleHtml(formatArticleDate(value))}</time>`;
}
function present(value) {
  return value !== undefined && value !== "";
}
function renderArticleBylineHtml(author) {
  assertArticleAuthor(author);
  const name = escapeArticleHtml(author.name);
  const linked = author.href === undefined ? name : `<a href="${escapeArticleHtml(author.href)}" rel="author">${name}</a>`;
  return `<span class="plain-publication__byline" data-author-kind="${author.kind}">${ARTICLE_BYLINE_PREFIX} ${linked}</span>`;
}
function renderArticleProvenanceHtml(provenance) {
  const sentence = articleProvenanceSentence(provenance);
  return `<p class="plain-publication__provenance" data-drafting="${escapeArticleHtml(provenance.drafting)}" data-reviewer-type="${escapeArticleHtml(provenance.review?.reviewerType ?? "none")}">${escapeArticleHtml(sentence)}</p>`;
}
function renderArticleHtml(input) {
  const headingId = input.headingId ?? "article-title";
  const {
    published,
    updated
  } = input;
  assertArticleDates(updated === undefined ? {
    published
  } : {
    published,
    updated
  });
  const toc = input.toc ?? [];
  for (const item of toc) {
    if (!item.href.startsWith("#") || item.href.length < 2)
      throw new RangeError("Contents links must point to a heading in this article.");
  }
  const tocId = `${headingId}-contents`;
  const meta = [input.author === undefined ? "" : renderArticleBylineHtml(input.author) + SEPARATOR, dateHtml("Published", published), updated === undefined ? "" : SEPARATOR + dateHtml("Updated", updated)].join("");
  const header = ['<header class="plain-publication__article-header">', present(input.eyebrow) ? `<p class="plain-publication__eyebrow">${escapeArticleHtml(input.eyebrow)}</p>` : "", `<h1 id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(input.heading)}</h1>`, present(input.dek) ? `<p class="plain-publication__article-dek">${escapeArticleHtml(input.dek)}</p>` : "", `<p class="plain-publication__article-meta">${meta}</p>`, input.provenance === null ? "" : renderArticleProvenanceHtml(input.provenance), "</header>"].join("");
  const nav = toc.length === 0 ? "" : [`<nav aria-labelledby="${escapeArticleHtml(tocId)}" class="plain-publication__toc">`, `<p id="${escapeArticleHtml(tocId)}">${escapeArticleHtml(input.tocLabel ?? ARTICLE_TOC_LABEL)}</p>`, "<ol>", ...toc.map((item) => `<li><a href="${escapeArticleHtml(item.href)}">${escapeArticleHtml(item.label)}</a></li>`), "</ol></nav>"].join("");
  return [`<article aria-labelledby="${escapeArticleHtml(headingId)}" class="${escapeArticleHtml(classes2(ROOT_CLASS, "plain-publication__article", input.className))}" data-hraness-article="" data-toc="${toc.length > 0 ? "aside" : "none"}"${input.id === undefined ? "" : ` id="${escapeArticleHtml(input.id)}"`}>`, header, '<div class="plain-publication__article-layout">', nav, `<div class="plain-publication__article-body">${input.bodyHtml}</div>`, "</div>", present(input.afterHtml) ? `<footer class="plain-publication__article-footer">${input.afterHtml}</footer>` : "", "</article>"].join("");
}
function renderArticleSourcesHtml({
  heading = ARTICLE_SOURCES_HEADING,
  headingId = "article-sources",
  sources
}) {
  if (sources.length === 0)
    return "";
  for (const source of sources)
    assertArticleHref(source.href);
  return [`<section aria-labelledby="${escapeArticleHtml(headingId)}" class="plain-publication__sources">`, `<h2 id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(heading)}</h2>`, "<ol>", ...sources.map((source) => [`<li><a href="${escapeArticleHtml(source.href)}">${escapeArticleHtml(source.title)}</a>`, "<span>", present(source.publisher) ? escapeArticleHtml(source.publisher) + SEPARATOR : "", dateHtml("Checked", source.checkedOn), "</span></li>"].join("")), "</ol></section>"].join("");
}
function renderArticleCalloutHtml(input) {
  const tone = input.tone ?? "note";
  assertArticleCalloutTone(tone);
  const body = input.text === undefined ? input.bodyHtml : `<p>${escapeArticleHtml(input.text)}</p>`;
  return `<div class="plain-publication__callout" data-tone="${tone}" role="note">${present(input.label) ? `<strong>${escapeArticleHtml(input.label)}</strong>` : ""}${body}</div>`;
}
function assertArticleMark(mark) {
  if (!mark.startsWith("data:image/svg+xml,"))
    assertArticleHref(mark);
}
function renderArticleRelatedHtml({
  heading = "Related products",
  headingId = "article-related-products",
  items
}) {
  if (items.length === 0)
    return "";
  for (const item of items) {
    assertArticleHref(item.href);
    if (present(item.mark))
      assertArticleMark(item.mark);
  }
  return [`<section aria-labelledby="${escapeArticleHtml(headingId)}" class="plain-publication__related">`, `<div class="plain-publication__section-heading"><h2 id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(heading)}</h2></div>`, '<div class="plain-publication__related-grid">', ...items.map((item) => [`<a href="${escapeArticleHtml(item.href)}">`, present(item.mark) ? `<img alt="" class="plain-publication__related-mark" decoding="async" height="44" src="${escapeArticleHtml(item.mark)}" width="44">` : "", `<span class="plain-publication__related-text"><strong>${escapeArticleHtml(item.name)}</strong>`, `<span>${escapeArticleHtml(item.role ?? item.relationship)}</span></span></a>`].join("")), "</div></section>"].join("");
}
function renderArticleIndexHtml({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  summary
}) {
  if (![1, 2, 3, 4, 5].includes(headingLevel))
    throw new RangeError("Article index heading level must be 1 to 5.");
  const hrefs = new Set;
  for (const item of items) {
    assertArticleHref(item.href);
    assertArticleDates(item.updated === undefined ? {
      published: item.published
    } : {
      published: item.published,
      updated: item.updated
    });
    if (hrefs.has(item.href))
      throw new RangeError(`Article index lists ${item.href} more than once.`);
    hrefs.add(item.href);
  }
  const heading1 = `h${headingLevel}`;
  const entry = `h${headingLevel + 1}`;
  return [`<section aria-labelledby="${escapeArticleHtml(headingId)}" class="${escapeArticleHtml(classes2(ROOT_CLASS, "plain-publication__list", className))}" data-hraness-article-index=""${id === undefined ? "" : ` id="${escapeArticleHtml(id)}"`}>`, `<div class="plain-publication__section-heading"><${heading1} id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(heading)}</${heading1}>`, present(summary) ? `<p>${escapeArticleHtml(summary)}</p>` : "", "</div>", '<div class="plain-publication__article-list">', ...items.map((item) => ['<article class="plain-publication__entry">', present(item.eyebrow) ? `<p class="plain-publication__entry-label">${escapeArticleHtml(item.eyebrow)}</p>` : "", `<${entry} class="plain-publication__entry-title"><a href="${escapeArticleHtml(item.href)}">${escapeArticleHtml(item.title)}</a></${entry}>`, `<p class="plain-publication__entry-dek">${escapeArticleHtml(item.dek)}</p>`, '<p class="plain-publication__entry-meta">', dateHtml("Published", item.published), item.updated === undefined ? "" : SEPARATOR + dateHtml("Updated", item.updated), "</p></article>"].join("")), "</div></section>"].join("");
}
// src/status-page.ts
var STATUS_PAGE_MAX_NEXT = 3;
var STATUS_PAGE_MAX_ROUTES = 2000;
var STATUS_PAGE_BACK_LABEL = "Go back";
var STATUS_PAGE_HINT_PREFIX = "Did you mean";
var STATUS_PAGE_NEXT_HEADING_ID = "hraness-status-page-next";
var STATUS_PAGE_AGENT_PREFIX = "AI agents can start at";
var defaults = {
  "not-found": {
    glyph: "404",
    title: "We can’t find that page",
    summary: "The link may be out of date or mistyped."
  },
  error: {
    glyph: "!",
    title: "This view could not load",
    summary: "Retry this view, or return home and continue from there."
  }
};
function assertText(name, value, limit) {
  if (value.trim() === "" || value.length > limit) {
    throw new RangeError(`Status page ${name} must be 1–${limit} characters.`);
  }
}
function assertLink(name, link) {
  assertArticleHref(link.href);
  assertText(`${name} label`, link.label, 48);
  if (link.description !== undefined)
    assertText(`${name} description`, link.description, 90);
}
function resolveStatusPage(content = {}) {
  const kind = content.kind ?? "not-found";
  const base = defaults[kind];
  const siteName = content.siteName?.trim();
  if (siteName !== undefined)
    assertText("siteName", siteName, 40);
  const glyph = content.glyph ?? base.glyph;
  assertText("glyph", glyph, 4);
  const title = content.title ?? base.title;
  assertText("title", title, 60);
  const summary = content.summary ?? base.summary;
  assertText("summary", summary, 160);
  const primaryAction = content.primaryAction ?? {
    href: "/",
    label: siteName ? `Go to ${siteName}` : "Go to the homepage"
  };
  assertLink("primaryAction", primaryAction);
  const next = content.next ?? [];
  if (next.length > STATUS_PAGE_MAX_NEXT) {
    throw new RangeError(`A status page lists at most ${STATUS_PAGE_MAX_NEXT} next links; pick the ones that lead to your product.`);
  }
  next.forEach((link) => assertLink("next", link));
  const nextHeading = content.nextHeading ?? "Or start here";
  assertText("nextHeading", nextHeading, 40);
  const routes = (content.routes ?? []).slice(0, STATUS_PAGE_MAX_ROUTES);
  routes.forEach((link) => assertLink("route", link));
  if (content.agentIndexHref !== undefined)
    assertArticleHref(content.agentIndexHref);
  return {
    kind,
    glyph,
    title,
    summary,
    primaryAction,
    next,
    nextHeading,
    routes: routes.filter((route) => isSitePath(route.href)),
    ...content.agentIndexHref === undefined ? {} : {
      agentIndexHref: content.agentIndexHref
    }
  };
}
function isSitePath(href) {
  return /^\/(?![/\\])/u.test(href);
}
function statusPageRoutesAttribute(routes) {
  if (routes.length === 0)
    return;
  return JSON.stringify(routes.map(({
    href,
    label
  }) => [href, label]));
}
function parseStatusPageRoutes(value) {
  if (!value)
    return [];
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed))
    return [];
  const routes = [];
  for (const entry of parsed.slice(0, STATUS_PAGE_MAX_ROUTES)) {
    if (!Array.isArray(entry))
      continue;
    const [href, label] = entry;
    if (typeof href !== "string" || typeof label !== "string")
      continue;
    if (!isSitePath(href) || label.trim() === "")
      continue;
    routes.push({
      href,
      label
    });
  }
  return routes;
}
var MAX_PATH = 160;
function normalizeStatusPath(value) {
  let path = value.replace(/[?#].*$/su, "");
  try {
    path = decodeURIComponent(path);
  } catch {}
  path = path.toLowerCase().replace(/\/{2,}/gu, "/").replace(/(?:\/index)?\.html?$/u, "");
  if (path.length > 1)
    path = path.replace(/\/+$/u, "");
  if (!path.startsWith("/"))
    path = `/${path}`;
  return path.slice(0, MAX_PATH);
}
var MAX_EDITS = 3;
var BEYOND = MAX_EDITS + 1;
function editDistance(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit)
    return limit + 1;
  const columns = b.length + 1;
  let before = new Int32Array(columns).fill(BEYOND);
  let previous = Int32Array.from({
    length: columns
  }, (_, index) => Math.min(index, BEYOND));
  let current = new Int32Array(columns).fill(BEYOND);
  for (let i = 1;i <= a.length; i++) {
    const low = Math.max(1, i - limit);
    const high = Math.min(b.length, i + limit);
    current[low - 1] = low === 1 ? Math.min(i, BEYOND) : BEYOND;
    if (high < b.length)
      current[high + 1] = BEYOND;
    let rowMin = BEYOND;
    for (let j = low;j <= high; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min((previous[j] ?? BEYOND) + 1, (current[j - 1] ?? BEYOND) + 1, (previous[j - 1] ?? BEYOND) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, (before[j - 2] ?? BEYOND) + 1);
      }
      current[j] = Math.min(value, BEYOND);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > limit)
      return limit + 1;
    [before, previous, current] = [previous, current, before];
  }
  return Math.min(previous[b.length] ?? BEYOND, limit + 1);
}
function words(path) {
  return path.split(/[/\-_.]+/u).filter((word) => word.length > 0);
}
function wordAllowance(word) {
  if (word.length < 4)
    return 0;
  return word.length < 8 ? 1 : 2;
}
function wordsMatch(missing, candidate) {
  return missing.every((word) => {
    const allowance = wordAllowance(word);
    return candidate.some((other) => other === word || allowance > 0 && editDistance(word, other, allowance) <= allowance);
  });
}
function candidate(path) {
  const parts = words(path);
  return {
    path,
    words: parts,
    joined: parts.join(""),
    last: path.slice(path.lastIndexOf("/") + 1)
  };
}
function score(missing, page) {
  if (page.path === missing.path)
    return 0;
  if (missing.joined.length >= 6 && missing.joined === page.joined)
    return 0.1;
  const longest = Math.max(missing.path.length, page.path.length);
  const limit = Math.min(MAX_EDITS, Math.floor(longest / 4));
  if (limit > 0 && wordsMatch(missing.words, page.words)) {
    const distance = editDistance(missing.path, page.path, limit);
    if (distance <= limit)
      return distance / longest;
  }
  if (missing.last.length >= 6 && missing.last === page.last)
    return 0.5;
  const longer = missing.words.filter((word) => word.length >= 3);
  if (longer.length >= 2 && longer.length === missing.words.length && longer.every((word) => page.words.includes(word)))
    return 0.6;
  return;
}
function suggestStatusRoute(pathname, routes) {
  const normalized = normalizeStatusPath(pathname);
  if (normalized === "/")
    return;
  const exactOnly = normalized.length < 5;
  const missing = candidate(normalized);
  let best;
  for (const route of routes.slice(0, STATUS_PAGE_MAX_ROUTES)) {
    if (!isSitePath(route.href))
      continue;
    const path = normalizeStatusPath(route.href);
    if (path === "/" || exactOnly && path !== normalized)
      continue;
    const value = score(missing, candidate(path));
    if (value === undefined)
      continue;
    if (best === undefined || value < best.score || value === best.score && (path.length < best.path.length || path.length === best.path.length && path < best.path)) {
      best = {
        route,
        score: value,
        path
      };
    }
  }
  return best?.route;
}
// src/status-page-html.ts
function renderStatusPageHtml(options = {}) {
  const page = resolveStatusPage(options);
  const level = options.titleLevel ?? 1;
  const root = options.rootElement ?? "main";
  const notFound = page.kind === "not-found";
  const routes = notFound ? statusPageRoutesAttribute(page.routes) : undefined;
  const next = page.next.length === 0 ? "" : [`<nav aria-labelledby="${STATUS_PAGE_NEXT_HEADING_ID}" class="hraness-status-page__next">`, `<h${level + 1} class="hraness-status-page__next-heading" id="${STATUS_PAGE_NEXT_HEADING_ID}">${escapeArticleHtml(page.nextHeading)}</h${level + 1}>`, '<ul class="hraness-status-page__next-list">', ...page.next.map((link) => [`<li><a class="hraness-status-page__next-link" href="${escapeArticleHtml(link.href)}">`, `<span class="hraness-status-page__next-label">${escapeArticleHtml(link.label)}</span>`, link.description === undefined ? "" : `<span class="hraness-status-page__next-description">${escapeArticleHtml(link.description)}</span>`, "</a></li>"].join("")), "</ul></nav>"].join("");
  const agent = page.agentIndexHref === undefined ? "" : `<p class="hraness-status-page__agent">${STATUS_PAGE_AGENT_PREFIX} <a href="${escapeArticleHtml(page.agentIndexHref)}">${escapeArticleHtml(page.agentIndexHref)}</a></p>`;
  return [`<${root} class="hraness-status-page"${routes === undefined ? "" : ` data-hraness-status-routes="${escapeArticleHtml(routes)}"`} data-kind="${page.kind}">`, '<div class="hraness-status-page__inner">', `<div aria-hidden="true" class="hraness-status-page__code"><span class="hraness-status-page__glyph">${escapeArticleHtml(page.glyph)}</span><canvas class="hraness-status-page__field"></canvas></div>`, `<h${level} class="hraness-status-page__title">${escapeArticleHtml(page.title)}</h${level}>`, `<p class="hraness-status-page__summary">${escapeArticleHtml(page.summary)}</p>`, notFound ? `<p class="hraness-status-page__hint" hidden="">${STATUS_PAGE_HINT_PREFIX} <a class="hraness-status-page__hint-link" href="/"></a>?</p>` : "", '<div class="hraness-status-page__actions">', `<a class="hraness-status-page__action hraness-foil" data-emphasis="primary" data-foil="" href="${escapeArticleHtml(page.primaryAction.href)}">${escapeArticleHtml(page.primaryAction.label)}</a>`, `<a class="hraness-status-page__back" hidden="" href="/">${STATUS_PAGE_BACK_LABEL}</a>`, "</div>", next, agent, "</div>", `</${root}>`].join("");
}
// src/relative-time.ts
var second = 1000;
var minute = 60 * second;
var hour = 60 * minute;
var day = 24 * hour;
var week = 7 * day;
var year = 365.2425 * day;
var month = year / 12;
var buckets = [{
  unit: "second",
  milliseconds: second,
  limit: 60
}, {
  unit: "minute",
  milliseconds: minute,
  limit: 60
}, {
  unit: "hour",
  milliseconds: hour,
  limit: 24
}, {
  unit: "day",
  milliseconds: day,
  limit: 7
}, {
  unit: "week",
  milliseconds: week,
  limit: 4
}, {
  unit: "month",
  milliseconds: month,
  limit: 12
}, {
  unit: "year",
  milliseconds: year,
  limit: Number.POSITIVE_INFINITY
}];
var relativeTimeUnits = Object.freeze(buckets.map((bucket) => bucket.unit));
var maximumTime = 8640000000000000;
var isoDate = /^(\d{4})-(\d{2})-(\d{2})$/u;
var isoDateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:\d{2})$/u;
function describe(value) {
  if (typeof value === "string")
    return JSON.stringify(value);
  if (value instanceof Date)
    return "an invalid Date";
  return String(value);
}
function fromTime(time, label, original) {
  if (!Number.isFinite(time) || Math.abs(time) > maximumTime) {
    throw new RangeError(`${label} must be a valid instant; received ${describe(original)}.`);
  }
  return new Date(time);
}
function parseIsoString(value, label) {
  const date = isoDate.exec(value);
  const dateTime = date === null ? isoDateTime.exec(value) : null;
  const parts = date ?? dateTime;
  if (parts === null) {
    throw new RangeError(`${label} must be an ISO 8601 date (YYYY-MM-DD) or a date-time with Z or an offset; received ${describe(value)}.`);
  }
  const [yearText, monthText, dayText, hourText = "00", minuteText = "00", secondText = "00", fraction = "", zone = "Z"] = parts.slice(1);
  const fields = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  const [y, mo, d, h, mi, s] = fields;
  const offsetHours = zone === "Z" ? 0 : Number(zone.slice(1, 3));
  const offsetRest = zone === "Z" ? 0 : Number(zone.slice(4, 6));
  const offsetMinutes = (zone.startsWith("-") ? -1 : 1) * (offsetHours * 60 + offsetRest);
  const milliseconds = Number(fraction.padEnd(3, "0").slice(0, 3));
  const wall = new Date(0);
  wall.setUTCFullYear(y, mo - 1, d);
  wall.setUTCHours(h, mi, s, milliseconds);
  const valid = h < 24 && mi < 60 && s < 60 && offsetHours < 24 && offsetRest < 60 && wall.getUTCFullYear() === y && wall.getUTCMonth() === mo - 1 && wall.getUTCDate() === d;
  if (!valid)
    throw new RangeError(`${label} must name a real calendar instant; received ${describe(value)}.`);
  return fromTime(wall.getTime() - offsetMinutes * minute, label, value);
}
function parseRelativeTimeInput(value, label = "time") {
  if (value instanceof Date)
    return fromTime(value.getTime(), label, value);
  if (typeof value === "number")
    return fromTime(value, label, value);
  if (typeof value === "string")
    return parseIsoString(value.trim(), label);
  throw new TypeError(`${label} must be a Date, epoch milliseconds, or an ISO 8601 string.`);
}
function parseReference(value) {
  if (value === undefined)
    return new Date;
  if (value instanceof Date || typeof value === "number")
    return parseRelativeTimeInput(value, "now");
  throw new TypeError("now must be a Date or epoch milliseconds.");
}
function parseNumeric(value) {
  if (value === undefined)
    return "auto";
  if (value === "auto" || value === "always")
    return value;
  throw new TypeError(`numeric must be "auto" or "always"; received ${describe(value)}.`);
}
function parseLocale(value) {
  if (value === undefined)
    return;
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError("locale must be a non-empty BCP 47 language tag.");
  }
  return value;
}
function resolveRelativeTime(differenceMilliseconds) {
  if (!Number.isFinite(differenceMilliseconds)) {
    throw new RangeError("The time difference must be a finite number of milliseconds.");
  }
  const magnitude = Math.abs(differenceMilliseconds);
  const sign = differenceMilliseconds < 0 || Object.is(differenceMilliseconds, -0) ? -1 : 1;
  for (const bucket of buckets) {
    const amount = Math.round(magnitude / bucket.milliseconds);
    if (amount < bucket.limit) {
      return {
        unit: bucket.unit,
        value: sign * amount
      };
    }
  }
  throw new RangeError("No relative time unit matched.");
}
var formatters = new Map;
function formatterFor(locale, numeric) {
  const key = `${locale ?? ""}\x00${numeric}`;
  let formatter = formatters.get(key);
  if (formatter === undefined) {
    formatter = new Intl.RelativeTimeFormat(locale, {
      numeric,
      style: "long"
    });
    formatters.set(key, formatter);
  }
  return formatter;
}
function formatRelativeTime(target, options = {}) {
  const instant = parseRelativeTimeInput(target, "target");
  const reference = parseReference(options.now);
  const numeric = parseNumeric(options.numeric);
  const locale = parseLocale(options.locale);
  const {
    unit,
    value
  } = resolveRelativeTime(instant.getTime() - reference.getTime());
  return formatterFor(locale, numeric).format(value, unit);
}

// src/index.ts
var colors = {
  light: {
    background: "#fbf6f2",
    foreground: "#201b19",
    muted: "#6b625d",
    faint: "#6b625d",
    grid: "#eaded8",
    line: "#bbaaa2",
    controlBorder: "#8f8f8f",
    surface: "#ffffff",
    surfaceRaised: "#f3ece8",
    surfaceHover: "#eaded8",
    card: "#ffffff",
    cardForeground: "#201b19",
    popover: "#ffffff",
    popoverForeground: "#201b19",
    primary: "#201b19",
    primaryForeground: "#fbf6f2",
    secondary: "#f3ece8",
    secondaryForeground: "#201b19",
    accent: "#eaded8",
    accentForeground: "#201b19",
    info: "#0d61ac",
    infoSoft: "#d8eaff",
    focus: "#0d61ac",
    scrim: "rgba(2, 2, 2, 0.44)",
    disabled: "#e8ded9",
    disabledForeground: "#717171",
    inverse: "#201b19",
    inverseForeground: "#fbf6f2",
    success: "#2d6a42",
    successSoft: "rgba(45, 106, 66, 0.12)",
    warning: "#785f28",
    warningSoft: "rgba(120, 95, 40, 0.12)",
    danger: "#9f3631",
    dangerSoft: "rgba(159, 54, 49, 0.12)"
  },
  dark: {
    background: "#000000",
    foreground: "#f2f2ed",
    muted: "#8f938c",
    faint: "#8f938c",
    grid: "#1c1e1b",
    line: "#5f645d",
    controlBorder: "#666666",
    surface: "#0d0e0c",
    surfaceRaised: "#161814",
    surfaceHover: "#1c1e1b",
    card: "#0d0e0c",
    cardForeground: "#f2f2ed",
    popover: "#161814",
    popoverForeground: "#f2f2ed",
    primary: "#f2f2ed",
    primaryForeground: "#0d0e0c",
    secondary: "#252820",
    secondaryForeground: "#f2f2ed",
    accent: "#1c1e1b",
    accentForeground: "#f2f2ed",
    info: "#6aa9ed",
    infoSoft: "#152d46",
    focus: "#6aa9ed",
    scrim: "rgba(0, 0, 0, 0.72)",
    disabled: "#262626",
    disabledForeground: "#777777",
    inverse: "#f2f2ed",
    inverseForeground: "#0d0e0c",
    success: "#76b38e",
    successSoft: "rgba(118, 179, 142, 0.12)",
    warning: "#c9ad74",
    warningSoft: "rgba(201, 173, 116, 0.12)",
    danger: "#e18982",
    dangerSoft: "rgba(225, 137, 130, 0.12)"
  }
};
var auroraColors = {
  light: {
    violet: "oklch(0.82 0.048 312)",
    rose: "oklch(0.85 0.044 12)",
    gold: "oklch(0.92 0.036 96)",
    mint: "oklch(0.9 0.036 172)",
    cyan: "oklch(0.84 0.042 236)"
  },
  dark: {
    violet: "oklch(0.58 0.045 312)",
    rose: "oklch(0.61 0.04 12)",
    gold: "oklch(0.69 0.035 96)",
    mint: "oklch(0.63 0.035 172)",
    cyan: "oklch(0.6 0.04 236)"
  }
};
var chromeColors = {
  light: {
    deep: "rgb(52 52 64)",
    shadow: "rgb(58 58 72)",
    mid: "rgb(92 92 106)",
    high: "rgb(88 88 100)",
    glint: "rgb(100 100 112)"
  },
  dark: {
    deep: "rgb(100 102 122)",
    shadow: "rgb(112 114 136)",
    mid: "rgb(166 168 190)",
    high: "rgb(158 160 182)",
    glint: "rgb(178 180 200)"
  }
};
var chromeGradientStops = {
  light: [[0, "rgb(52 52 64)"], [10, "rgb(88 88 100)"], [20, "rgb(58 58 72)"], [32, "rgb(100 100 112)"], [42, "rgb(64 64 78)"], [52, "rgb(92 92 106)"], [62, "rgb(54 54 68)"], [72, "rgb(86 86 100)"], [82, "rgb(56 56 70)"], [91, "rgb(80 80 94)"], [100, "rgb(60 60 74)"]],
  dark: [[0, "rgb(100 102 122)"], [10, "rgb(158 160 182)"], [20, "rgb(112 114 136)"], [32, "rgb(178 180 200)"], [42, "rgb(122 124 148)"], [52, "rgb(166 168 190)"], [62, "rgb(106 108 132)"], [72, "rgb(160 162 186)"], [82, "rgb(110 112 136)"], [91, "rgb(152 154 178)"], [100, "rgb(118 120 142)"]]
};
var spacing = [0, 4, 8, 12, 16, 20, 24, 32, 48, 64];
var radius = {
  sharp: 0,
  sm: 4,
  md: 8,
  lg: 12,
  round: 999
};
var controlRadius = 16;
var layout = {
  chromeInset: 8,
  edgeInset: 24
};
var siteThemes = {
  plain: {
    bodyClassName: "plain-site",
    footerClassName: "plain-footer",
    pageClassName: "plain-page"
  }
};
var interaction = {
  compactTarget: 40,
  minimumTarget: 48,
  controlHeight: 52,
  primaryControlHeight: 56,
  transportControlHeight: 64
};
var motion = {
  duration: {
    instant: 0,
    fast: 120,
    standard: 180,
    slow: 280
  },
  distance: {
    railEnter: 14,
    railExit: 10
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.16, 1, 0.3, 1)"
  }
};
var elevation = {
  none: "none",
  low: "0 1px 2px oklch(0 0 0 / 0.08)",
  raised: "0 8px 24px -12px oklch(0 0 0 / 0.22)",
  overlay: "0 18px 48px -18px oklch(0 0 0 / 0.32)"
};
var stacking = {
  chrome: 50,
  modal: 2000,
  tooltip: 3000,
  skipLink: 4000
};
var breakpoints = {
  compact: 480,
  medium: 768,
  wide: 1200,
  canvas: 1440
};
var iconography = {
  size: 20,
  strokeWidth: 1.5
};
var typeScale = {
  caption: 12,
  label: 14,
  body: 16,
  control: 16,
  controlGlyph: 20,
  heading: 24,
  title: 32,
  display: 56
};
var fontWeights = {
  regular: 450,
  medium: 550,
  bold: 700
};
var fontFamilies = {
  heading: "Nebula Sans",
  mono: "ui-monospace",
  text: "Nebula Sans"
};
var fontFallbacks = {
  mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
  text: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
};
var webTextStack = '"Nebula Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
var webMonoStack = 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace';
var typography = {
  fontText: webTextStack,
  fontHeading: webTextStack,
  fontMono: webMonoStack,
  fontGeistMono: '"Geist Mono", ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
  fontSans: webTextStack
};
function themeFor(mode) {
  return colors[mode];
}

export { designPalettes, designPaletteLabels, isDesignPalette, designPaletteSources, paletteColors, designThemes, defaultDesignTheme, designThemeStorageKey, isDesignTheme, normalizeDesignTheme, designThemeLabel, resolveDesignTheme, defaultDesignPalettePreference, designPaletteStorageKey, parseDesignPalettePreference, normalizeDesignPalettePreference, resolveDesignPalettePreference, getDesignPaletteTheme, escapeArticleHtml, renderArticleBylineHtml, renderArticleProvenanceHtml, renderArticleHtml, renderArticleSourcesHtml, renderArticleCalloutHtml, renderArticleRelatedHtml, renderArticleIndexHtml, STATUS_PAGE_MAX_NEXT, STATUS_PAGE_MAX_ROUTES, STATUS_PAGE_BACK_LABEL, STATUS_PAGE_HINT_PREFIX, STATUS_PAGE_NEXT_HEADING_ID, STATUS_PAGE_AGENT_PREFIX, resolveStatusPage, statusPageRoutesAttribute, parseStatusPageRoutes, normalizeStatusPath, suggestStatusRoute, renderStatusPageHtml, relativeTimeUnits, parseRelativeTimeInput, resolveRelativeTime, formatRelativeTime, colors, auroraColors, chromeColors, chromeGradientStops, spacing, radius, controlRadius, layout, siteThemes, interaction, motion, elevation, stacking, breakpoints, iconography, typeScale, fontWeights, fontFamilies, fontFallbacks, typography, themeFor };
