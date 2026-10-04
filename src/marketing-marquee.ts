/**
 * Framework-neutral provider marquee: a quiet, slowly scrolling band of
 * provider marks and names under a label that states how many there are.
 * `resolveMarketingMarquee` validates the input once; the static renderer here
 * and `MarketingMarquee` in `@hraness/design-kit/react/server` emit identical
 * markup from that model, styled by `marketing-marquee.css` (included in
 * `styles.css`).
 *
 * The band moves only with `prefers-reduced-motion: no-preference` on screen.
 * Otherwise, and in print, it is a wrapped static list. A native checkbox
 * pauses the motion without JavaScript, hovering pauses it, and duplicate
 * copies that fill the loop are hidden from assistive technology.
 */
import { assertArticleHref } from "./article.js";
import { escapeArticleHtml as escape } from "./article-html.js";
import { providerMark, providerMarkMonogram, type ProviderMarkDescriptor } from "./provider-marks.js";

/** The placeholder a label must contain once; it renders as the item count. */
export const MARKETING_MARQUEE_COUNT_TOKEN = "{count}";
export const MARKETING_MARQUEE_MAX_ITEMS = 64;
export const MARKETING_MARQUEE_DEFAULT_PAUSE_LABEL = "Pause scrolling";

/** Each loop renders at least this many items after its first copy, so wide viewports never show a gap. */
const MIN_LOOP_ITEMS = 20;
const MAX_NAME_LENGTH = 64;
const MAX_LABEL_LENGTH = 120;
const ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/u;
const FORBIDDEN_ARTWORK = /<script|<foreignObject|on[a-z]+\s*=|javascript:/iu;
const ROOT_CLASS = "hraness-marketing-marquee";

export type MarketingMarqueeAlign = "start" | "center";

export interface MarketingMarqueeItem {
  /** The visible name, which is also the item's accessible text. */
  readonly name: string;
  /**
   * A registered provider mark id, display name, or alias, or a descriptor
   * from the provider registry. Defaults to `name`. Identities outside the
   * registry show a two-letter monogram instead of invented artwork.
   */
  readonly mark?: ProviderMarkDescriptor | string;
}

export interface MarketingMarqueeAction {
  readonly href: string;
  readonly label: string;
}

export interface MarketingMarqueeInput {
  /** A unique element id; the label, pause control, and mark symbols derive their ids from it. */
  readonly id: string;
  /** One sentence containing `{count}` exactly once, such as "Works with {count} services". */
  readonly label: string;
  readonly items: readonly MarketingMarqueeItem[];
  /** An optional link beside the label, such as the full provider list. */
  readonly action?: MarketingMarqueeAction;
  readonly align?: MarketingMarqueeAlign;
  readonly className?: string;
  /** The pause checkbox's accessible name. */
  readonly pauseLabel?: string;
}

export interface MarketingMarqueeSymbol {
  readonly id: string;
  readonly viewBox: string;
  readonly body: string;
}

export type MarketingMarqueeMark =
  | Readonly<{ kind: "glyph"; symbolId: string }>
  | Readonly<{ kind: "monogram"; monogram: string }>;

export interface ResolvedMarketingMarqueeItem {
  readonly name: string;
  readonly mark: MarketingMarqueeMark;
}

export interface ResolvedMarketingMarquee {
  readonly id: string;
  readonly labelId: string;
  readonly toggleId: string;
  readonly className: string;
  readonly align: MarketingMarqueeAlign;
  /** The label split around the rendered count. */
  readonly label: Readonly<{ before: string; count: string; after: string }>;
  readonly items: readonly ResolvedMarketingMarqueeItem[];
  /** One symbol per distinct glyph, referenced by every copy. */
  readonly symbols: readonly MarketingMarqueeSymbol[];
  /** Total list copies: the accessible list plus hidden duplicates that fill the loop. */
  readonly copies: number;
  readonly action: MarketingMarqueeAction | null;
  readonly pauseLabel: string;
}

/** SVG paths for the pause control, drawn in a 16-unit square. */
export const MARKETING_MARQUEE_CONTROL_ICONS = {
  pause: "M5 3.25a1 1 0 0 1 1 1v7.5a1 1 0 0 1-2 0v-7.5a1 1 0 0 1 1-1Zm6 0a1 1 0 0 1 1 1v7.5a1 1 0 0 1-2 0v-7.5a1 1 0 0 1 1-1Z",
  play: "M5.25 3.6v8.8a.75.75 0 0 0 1.14.64l7.04-4.4a.75.75 0 0 0 0-1.28L6.39 2.96a.75.75 0 0 0-1.14.64Z",
} as const;

function requireText(value: string, field: string, limit: number): string {
  const text = value.trim();
  if (text === "") throw new RangeError(`Marketing marquee ${field} must not be empty.`);
  if (text.length > limit) throw new RangeError(`Marketing marquee ${field} must be at most ${limit} characters.`);
  return text;
}

function resolveMark(mark: ProviderMarkDescriptor | string | undefined, name: string): ProviderMarkDescriptor | undefined {
  if (mark === undefined) return providerMark(name);
  if (typeof mark === "string") return providerMark(mark);
  return mark;
}

/** Validate marquee input and compute everything both renderers need. */
export function resolveMarketingMarquee(input: MarketingMarqueeInput): ResolvedMarketingMarquee {
  if (!ID_PATTERN.test(input.id)) throw new RangeError("Marketing marquee id must start with a letter and use at most 64 letters, digits, hyphens, or underscores.");
  const label = requireText(input.label, "label", MAX_LABEL_LENGTH);
  const parts = label.split(MARKETING_MARQUEE_COUNT_TOKEN);
  if (parts.length !== 2) throw new RangeError(`Marketing marquee label must contain ${MARKETING_MARQUEE_COUNT_TOKEN} exactly once.`);
  if (input.items.length === 0) throw new RangeError("Marketing marquee needs at least one item.");
  if (input.items.length > MARKETING_MARQUEE_MAX_ITEMS) throw new RangeError(`Marketing marquee shows at most ${MARKETING_MARQUEE_MAX_ITEMS} items.`);
  if (input.align !== undefined && input.align !== "start" && input.align !== "center") throw new RangeError("Marketing marquee align must be start or center.");

  const names = new Set<string>();
  const symbols: MarketingMarqueeSymbol[] = [];
  const symbolIds = new Map<string, string>();
  const items = input.items.map((item): ResolvedMarketingMarqueeItem => {
    const name = requireText(item.name, "item name", MAX_NAME_LENGTH);
    if (names.has(name)) throw new RangeError(`Marketing marquee lists ${JSON.stringify(name)} more than once.`);
    names.add(name);
    const descriptor = resolveMark(item.mark, name);
    if (descriptor === undefined || descriptor.glyph.body === "") {
      return { name, mark: { kind: "monogram", monogram: descriptor?.monogram ?? providerMarkMonogram(name) } };
    }
    const { viewBox, body } = descriptor.glyph;
    if (FORBIDDEN_ARTWORK.test(body) || /["<>]/u.test(viewBox)) throw new RangeError(`Marketing marquee artwork for ${JSON.stringify(name)} contains unsupported markup.`);
    const key = `${viewBox}\n${body}`;
    let symbolId = symbolIds.get(key);
    if (symbolId === undefined) {
      symbolId = `${input.id}-mark-${symbols.length}`;
      symbolIds.set(key, symbolId);
      symbols.push({ body, id: symbolId, viewBox });
    }
    return { name, mark: { kind: "glyph", symbolId } };
  });

  let action: MarketingMarqueeAction | null = null;
  if (input.action !== undefined) {
    assertArticleHref(input.action.href);
    action = { href: input.action.href, label: requireText(input.action.label, "action label", MAX_LABEL_LENGTH) };
  }

  return {
    action,
    align: input.align ?? "start",
    className: [ROOT_CLASS, input.className?.trim()].filter(Boolean).join(" "),
    copies: Math.max(2, 1 + Math.ceil(MIN_LOOP_ITEMS / items.length)),
    id: input.id,
    items,
    label: { after: parts[1] ?? "", before: parts[0] ?? "", count: String(items.length) },
    labelId: `${input.id}-label`,
    pauseLabel: requireText(input.pauseLabel ?? MARKETING_MARQUEE_DEFAULT_PAUSE_LABEL, "pause label", MAX_LABEL_LENGTH),
    symbols,
    toggleId: `${input.id}-pause`,
  };
}

function itemHtml(item: ResolvedMarketingMarqueeItem): string {
  const mark = item.mark.kind === "glyph"
    ? `<svg aria-hidden="true" class="${ROOT_CLASS}__mark" fill="currentColor" focusable="false" height="20" width="20"><use href="#${item.mark.symbolId}"></use></svg>`
    : `<span aria-hidden="true" class="${ROOT_CLASS}__monogram">${escape(item.mark.monogram)}</span>`;
  return `<li class="${ROOT_CLASS}__item">${mark}<span class="${ROOT_CLASS}__name">${escape(item.name)}</span></li>`;
}

function controlIconHtml(icon: keyof typeof MARKETING_MARQUEE_CONTROL_ICONS): string {
  return `<svg aria-hidden="true" class="${ROOT_CLASS}__control-icon" data-icon="${icon}" fill="currentColor" focusable="false" height="16" viewBox="0 0 16 16" width="16"><path d="${MARKETING_MARQUEE_CONTROL_ICONS[icon]}"></path></svg>`;
}

/** Static HTML for a provider marquee. Pair it with `marketing-marquee.css` or `styles.css`. */
export function renderMarketingMarqueeHtml(input: MarketingMarqueeInput): string {
  const marquee = resolveMarketingMarquee(input);
  const items = marquee.items.map(itemHtml).join("");
  const lists = Array.from({ length: marquee.copies }, (_, index) => (
    `<ul${index === 0 ? "" : ' aria-hidden="true"'} class="${ROOT_CLASS}__list">${items}</ul>`
  )).join("");
  const sprite = marquee.symbols.length === 0
    ? ""
    : `<svg aria-hidden="true" class="${ROOT_CLASS}__sprite" focusable="false" height="0" width="0">${marquee.symbols.map((symbol) => (
      `<symbol id="${symbol.id}" viewBox="${symbol.viewBox}">${symbol.body}</symbol>`
    )).join("")}</svg>`;
  const action = marquee.action === null
    ? ""
    : `<a class="${ROOT_CLASS}__action hraness-text-link" href="${escape(marquee.action.href)}">${escape(marquee.action.label)}</a>`;
  return [
    `<section aria-labelledby="${marquee.labelId}" class="${escape(marquee.className)}" data-align="${marquee.align}" data-hraness-marketing="marquee" id="${marquee.id}">`,
    sprite,
    `<div class="${ROOT_CLASS}__header">`,
    `<p class="${ROOT_CLASS}__label" id="${marquee.labelId}">${escape(marquee.label.before)}<strong class="${ROOT_CLASS}__count">${marquee.label.count}</strong>${escape(marquee.label.after)}</p>`,
    action,
    "</div>",
    `<input class="${ROOT_CLASS}__toggle" id="${marquee.toggleId}" type="checkbox"/>`,
    `<div class="${ROOT_CLASS}__viewport"><div class="${ROOT_CLASS}__track">${lists}</div></div>`,
    `<label class="${ROOT_CLASS}__control" for="${marquee.toggleId}"><span class="${ROOT_CLASS}__control-text">${escape(marquee.pauseLabel)}</span>${controlIconHtml("pause")}${controlIconHtml("play")}</label>`,
    "</section>",
  ].join("");
}
