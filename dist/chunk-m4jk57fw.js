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
} from "./chunk-77391vmq.js";
import {
  providerMark,
  providerMarkMonogram
} from "./chunk-1vqmtbrs.js";

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
function classes(...values) {
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
    updated,
    showDates = true
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
  const meta = [input.author === undefined ? "" : renderArticleBylineHtml(input.author), showDates ? dateHtml("Published", published) : "", showDates && updated !== undefined ? dateHtml("Updated", updated) : ""].filter(Boolean).join(SEPARATOR);
  const header = ['<header class="plain-publication__article-header">', present(input.eyebrow) ? `<p class="plain-publication__eyebrow">${escapeArticleHtml(input.eyebrow)}</p>` : "", `<h1 id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(input.heading)}</h1>`, present(input.dek) ? `<p class="plain-publication__article-dek">${escapeArticleHtml(input.dek)}</p>` : "", meta === "" ? "" : `<p class="plain-publication__article-meta">${meta}</p>`, input.provenance === null ? "" : renderArticleProvenanceHtml(input.provenance), "</header>"].join("");
  const nav = toc.length === 0 ? "" : [`<nav aria-labelledby="${escapeArticleHtml(tocId)}" class="plain-publication__toc">`, `<p id="${escapeArticleHtml(tocId)}">${escapeArticleHtml(input.tocLabel ?? ARTICLE_TOC_LABEL)}</p>`, "<ol>", ...toc.map((item) => `<li><a href="${escapeArticleHtml(item.href)}">${escapeArticleHtml(item.label)}</a></li>`), "</ol></nav>"].join("");
  return [`<article aria-labelledby="${escapeArticleHtml(headingId)}" class="${escapeArticleHtml(classes(ROOT_CLASS, "plain-publication__article", input.className))}" data-hraness-article="" data-toc="${toc.length > 0 ? "aside" : "none"}"${input.id === undefined ? "" : ` id="${escapeArticleHtml(input.id)}"`}>`, header, '<div class="plain-publication__article-layout">', nav, `<div class="plain-publication__article-body">${input.bodyHtml}</div>`, "</div>", present(input.afterHtml) ? `<footer class="plain-publication__article-footer">${input.afterHtml}</footer>` : "", "</article>"].join("");
}
function renderArticleSourcesHtml({
  heading = ARTICLE_SOURCES_HEADING,
  headingId = "article-sources",
  showDates = true,
  sources
}) {
  if (sources.length === 0)
    return "";
  for (const source of sources) {
    assertArticleHref(source.href);
    formatArticleDate(source.checkedOn);
  }
  return [`<section aria-labelledby="${escapeArticleHtml(headingId)}" class="plain-publication__sources">`, `<h2 id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(heading)}</h2>`, "<ol>", ...sources.map((source) => {
    const meta = [present(source.publisher) ? escapeArticleHtml(source.publisher) : "", showDates ? dateHtml("Checked", source.checkedOn) : ""].filter(Boolean).join(SEPARATOR);
    return [`<li><a href="${escapeArticleHtml(source.href)}">${escapeArticleHtml(source.title)}</a>`, meta === "" ? "" : `<span>${meta}</span>`, "</li>"].join("");
  }), "</ol></section>"].join("");
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
  showDates = true,
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
  return [`<section aria-labelledby="${escapeArticleHtml(headingId)}" class="${escapeArticleHtml(classes(ROOT_CLASS, "plain-publication__list", className))}" data-hraness-article-index=""${id === undefined ? "" : ` id="${escapeArticleHtml(id)}"`}>`, `<div class="plain-publication__section-heading"><${heading1} id="${escapeArticleHtml(headingId)}">${escapeArticleHtml(heading)}</${heading1}>`, present(summary) ? `<p>${escapeArticleHtml(summary)}</p>` : "", "</div>", '<div class="plain-publication__article-list">', ...items.map((item) => ['<article class="plain-publication__entry">', present(item.eyebrow) ? `<p class="plain-publication__entry-label">${escapeArticleHtml(item.eyebrow)}</p>` : "", `<${entry} class="plain-publication__entry-title"><a href="${escapeArticleHtml(item.href)}">${escapeArticleHtml(item.title)}</a></${entry}>`, `<p class="plain-publication__entry-dek">${escapeArticleHtml(item.dek)}</p>`, showDates ? ['<p class="plain-publication__entry-meta">', dateHtml("Published", item.published), item.updated === undefined ? "" : SEPARATOR + dateHtml("Updated", item.updated), "</p>"].join("") : "", "</article>"].join("")), "</div></section>"].join("");
}

// src/marketing-marquee.ts
var MARKETING_MARQUEE_COUNT_TOKEN = "{count}";
var MARKETING_MARQUEE_MAX_ITEMS = 64;
var MARKETING_MARQUEE_DEFAULT_PAUSE_LABEL = "Pause scrolling";
var MIN_LOOP_ITEMS = 20;
var MAX_NAME_LENGTH = 64;
var MAX_LABEL_LENGTH = 120;
var ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/u;
var FORBIDDEN_ARTWORK = /<script|<foreignObject|on[a-z]+\s*=|javascript:/iu;
var ROOT_CLASS2 = "hraness-marketing-marquee";
var MARKETING_MARQUEE_CONTROL_ICONS = {
  pause: "M5 3.25a1 1 0 0 1 1 1v7.5a1 1 0 0 1-2 0v-7.5a1 1 0 0 1 1-1Zm6 0a1 1 0 0 1 1 1v7.5a1 1 0 0 1-2 0v-7.5a1 1 0 0 1 1-1Z",
  play: "M5.25 3.6v8.8a.75.75 0 0 0 1.14.64l7.04-4.4a.75.75 0 0 0 0-1.28L6.39 2.96a.75.75 0 0 0-1.14.64Z"
};
function requireText(value, field, limit) {
  const text = value.trim();
  if (text === "")
    throw new RangeError(`Marketing marquee ${field} must not be empty.`);
  if (text.length > limit)
    throw new RangeError(`Marketing marquee ${field} must be at most ${limit} characters.`);
  return text;
}
function resolveMark(mark, name) {
  if (mark === undefined)
    return providerMark(name);
  if (typeof mark === "string")
    return providerMark(mark);
  return mark;
}
function resolveMarketingMarquee(input) {
  if (!ID_PATTERN.test(input.id))
    throw new RangeError("Marketing marquee id must start with a letter and use at most 64 letters, digits, hyphens, or underscores.");
  const label = requireText(input.label, "label", MAX_LABEL_LENGTH);
  const parts = label.split(MARKETING_MARQUEE_COUNT_TOKEN);
  if (parts.length !== 2)
    throw new RangeError(`Marketing marquee label must contain ${MARKETING_MARQUEE_COUNT_TOKEN} exactly once.`);
  if (input.items.length === 0)
    throw new RangeError("Marketing marquee needs at least one item.");
  if (input.items.length > MARKETING_MARQUEE_MAX_ITEMS)
    throw new RangeError(`Marketing marquee shows at most ${MARKETING_MARQUEE_MAX_ITEMS} items.`);
  if (input.align !== undefined && input.align !== "start" && input.align !== "center")
    throw new RangeError("Marketing marquee align must be start or center.");
  const names = new Set;
  const symbols = [];
  const symbolIds = new Map;
  const items = input.items.map((item) => {
    const name = requireText(item.name, "item name", MAX_NAME_LENGTH);
    if (names.has(name))
      throw new RangeError(`Marketing marquee lists ${JSON.stringify(name)} more than once.`);
    names.add(name);
    const descriptor = resolveMark(item.mark, name);
    if (descriptor === undefined || descriptor.glyph.body === "") {
      return {
        name,
        mark: {
          kind: "monogram",
          monogram: descriptor?.monogram ?? providerMarkMonogram(name)
        }
      };
    }
    const {
      viewBox,
      body
    } = descriptor.glyph;
    if (FORBIDDEN_ARTWORK.test(body) || /["<>]/u.test(viewBox))
      throw new RangeError(`Marketing marquee artwork for ${JSON.stringify(name)} contains unsupported markup.`);
    const key = `${viewBox}
${body}`;
    let symbolId = symbolIds.get(key);
    if (symbolId === undefined) {
      symbolId = `${input.id}-mark-${symbols.length}`;
      symbolIds.set(key, symbolId);
      symbols.push({
        body,
        id: symbolId,
        viewBox
      });
    }
    return {
      name,
      mark: {
        kind: "glyph",
        symbolId
      }
    };
  });
  let action = null;
  if (input.action !== undefined) {
    assertArticleHref(input.action.href);
    action = {
      href: input.action.href,
      label: requireText(input.action.label, "action label", MAX_LABEL_LENGTH)
    };
  }
  return {
    action,
    align: input.align ?? "start",
    className: [ROOT_CLASS2, input.className?.trim()].filter(Boolean).join(" "),
    copies: Math.max(2, 1 + Math.ceil(MIN_LOOP_ITEMS / items.length)),
    id: input.id,
    items,
    label: {
      after: parts[1] ?? "",
      before: parts[0] ?? "",
      count: String(items.length)
    },
    labelId: `${input.id}-label`,
    pauseLabel: requireText(input.pauseLabel ?? MARKETING_MARQUEE_DEFAULT_PAUSE_LABEL, "pause label", MAX_LABEL_LENGTH),
    symbols,
    toggleId: `${input.id}-pause`
  };
}
function itemHtml(item) {
  const mark = item.mark.kind === "glyph" ? `<svg aria-hidden="true" class="${ROOT_CLASS2}__mark" fill="currentColor" focusable="false" height="20" width="20"><use href="#${item.mark.symbolId}"></use></svg>` : `<span aria-hidden="true" class="${ROOT_CLASS2}__monogram">${escapeArticleHtml(item.mark.monogram)}</span>`;
  return `<li class="${ROOT_CLASS2}__item">${mark}<span class="${ROOT_CLASS2}__name">${escapeArticleHtml(item.name)}</span></li>`;
}
function controlIconHtml(icon) {
  return `<svg aria-hidden="true" class="${ROOT_CLASS2}__control-icon" data-icon="${icon}" fill="currentColor" focusable="false" height="16" viewBox="0 0 16 16" width="16"><path d="${MARKETING_MARQUEE_CONTROL_ICONS[icon]}"></path></svg>`;
}
function renderMarketingMarqueeHtml(input) {
  const marquee = resolveMarketingMarquee(input);
  const items = marquee.items.map(itemHtml).join("");
  const lists = Array.from({
    length: marquee.copies
  }, (_, index) => `<ul${index === 0 ? "" : ' aria-hidden="true"'} class="${ROOT_CLASS2}__list">${items}</ul>`).join("");
  const sprite = marquee.symbols.length === 0 ? "" : `<svg aria-hidden="true" class="${ROOT_CLASS2}__sprite" focusable="false" height="0" width="0">${marquee.symbols.map((symbol) => `<symbol id="${symbol.id}" viewBox="${symbol.viewBox}">${symbol.body}</symbol>`).join("")}</svg>`;
  const action = marquee.action === null ? "" : `<a class="${ROOT_CLASS2}__action hraness-text-link" href="${escapeArticleHtml(marquee.action.href)}">${escapeArticleHtml(marquee.action.label)}</a>`;
  return [`<section aria-labelledby="${marquee.labelId}" class="${escapeArticleHtml(marquee.className)}" data-align="${marquee.align}" data-hraness-marketing="marquee" id="${marquee.id}">`, sprite, `<div class="${ROOT_CLASS2}__header">`, `<p class="${ROOT_CLASS2}__label" id="${marquee.labelId}">${escapeArticleHtml(marquee.label.before)}<strong class="${ROOT_CLASS2}__count">${marquee.label.count}</strong>${escapeArticleHtml(marquee.label.after)}</p>`, action, "</div>", `<input class="${ROOT_CLASS2}__toggle" id="${marquee.toggleId}" type="checkbox"/>`, `<div class="${ROOT_CLASS2}__viewport"><div class="${ROOT_CLASS2}__track">${lists}</div></div>`, `<label class="${ROOT_CLASS2}__control" for="${marquee.toggleId}"><span class="${ROOT_CLASS2}__control-text">${escapeArticleHtml(marquee.pauseLabel)}</span>${controlIconHtml("pause")}${controlIconHtml("play")}</label>`, "</section>"].join("");
}

// src/diagrams.ts
var diagramMetrics = Object.freeze({
  labelSize: 20,
  detailSize: 16,
  strokeWidth: 1.5,
  arrowheadSize: 6,
  nodePadding: 24,
  nodeGap: 48,
  minimumCanvasWidth: 640,
  fontFamily: '"Nebula Sans", ui-sans-serif, system-ui, sans-serif'
});

export { escapeArticleHtml, renderArticleBylineHtml, renderArticleProvenanceHtml, renderArticleHtml, renderArticleSourcesHtml, renderArticleCalloutHtml, renderArticleRelatedHtml, renderArticleIndexHtml, MARKETING_MARQUEE_COUNT_TOKEN, MARKETING_MARQUEE_MAX_ITEMS, MARKETING_MARQUEE_DEFAULT_PAUSE_LABEL, MARKETING_MARQUEE_CONTROL_ICONS, resolveMarketingMarquee, renderMarketingMarqueeHtml, diagramMetrics };
