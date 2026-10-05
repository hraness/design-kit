import type { ReactNode } from "react";
import { FoilMark } from "./foil-mark.js";
import { SyntaxCode } from "./syntax-code.js";
import { marketingClassName as classNames, marketingColumnClassName, marketingFactCellVariant, marketingHeroClassName } from "./product-marketing.stylex.js";
import type { MarketingColumnCount } from "./product-marketing.stylex.js";

export type { MarketingColumnCount } from "./product-marketing.stylex.js";

export type MarketingHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const MARKETING_HEADING_TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

export type MarketingTone = "paper" | "accent";
export type MarketingPreset = "editorial" | "minimal";
/**
 * Accepted `data-hraness-pattern` values. Patterns are retired: `cells`,
 * `weave`, `contour`, and `mesh` stay valid for compatibility but render
 * exactly like `none`.
 */
export const marketingPatterns = ["cells", "weave", "contour", "mesh", "none"] as const;
/** @deprecated Patterns are retired; every value renders as `none`. */
export type MarketingPattern = (typeof marketingPatterns)[number];

function assertMarketingPattern(pattern: MarketingPattern | undefined): void {
  if (pattern !== undefined && !marketingPatterns.includes(pattern)) throw new RangeError("Unknown marketing pattern.");
}

export interface MarketingAction {
  readonly emphasis?: "primary" | "secondary";
  readonly href: string;
  readonly label: string;
}

export interface MarketingFact {
  readonly detail?: string;
  readonly label: string;
  readonly value: string;
}

export interface MarketingStep {
  readonly code?: string;
  readonly detail?: string;
  readonly label: string;
}

export interface MarketingLink {
  readonly current?: boolean;
  readonly href: string;
  readonly label: string;
}

function Heading({
  children,
  className,
  id,
  level,
}: Readonly<{
  children: ReactNode;
  className?: string;
  id?: string;
  level: MarketingHeadingLevel;
}>) {
  const properties = { children, className, id };
  const HeadingTag = MARKETING_HEADING_TAGS[level];
  return <HeadingTag {...properties} />;
}

function childHeadingLevel(level: MarketingHeadingLevel): MarketingHeadingLevel {
  return Math.min(level + 1, 6) as MarketingHeadingLevel;
}

/** A concrete next step using the same presentation as hero and closing actions. */
export function MarketingActionLink({
  className,
  context = "cta",
  emphasis = "primary",
  href,
  label,
  tone = "paper",
}: MarketingAction & Readonly<{
  className?: string;
  context?: "hero" | "cta";
  tone?: MarketingTone;
}>) {
  return (
    <a
      className={classNames("hraness-marketing-action", className, tone === "accent"
        ? `${context}-${emphasis}`
        : emphasis === "primary" ? "primary" : "default")}
      data-emphasis={emphasis}
      data-foil={emphasis === "primary" ? "" : undefined}
      href={href}
    >
      {label}
    </a>
  );
}

function MarketingActions({
  actions,
  className,
  tone,
  context,
}: Readonly<{ actions: readonly MarketingAction[]; className: string; tone: MarketingTone; context: "hero" | "cta" }>) {
  if (actions.length === 0) return null;
  return (
    <div className={className}>
      {actions.map((action, index) => {
        const emphasis = action.emphasis ?? (index === 0 ? "primary" : "secondary");
        return (
          <MarketingActionLink
            {...action}
            context={context}
            emphasis={emphasis}
            key={`${action.href}-${action.label}`}
            tone={tone}
          />
        );
      })}
    </div>
  );
}

/**
 * Page root. Binds the marketing tokens, the text face, and the horizontal
 * gutter for every direct child role. Products set `--hraness-site-accent`
 * on this element or on a parent.
 */
/** Where a product landscape draws (see LANDSCAPE.md): behind the whole page, behind one element, or nowhere. */
export type ProductLandscapeHost = "page" | "contained" | "off";

export function MarketingPage({
  children,
  className,
  id,
  landscape,
  preset,
  pattern,
}: Readonly<{
  children: ReactNode;
  className?: string;
  id?: string;
  /** Draw the product landscape from product-landscape.css behind this page. */
  landscape?: ProductLandscapeHost;
  /** Opt in to the separately imported product-marketing-preset.css contract. */
  preset?: MarketingPreset;
  /**
   * @deprecated Patterns are retired. Every value, including the default,
   * paints the flat palette background; the attribute is still emitted for
   * compatibility with existing selectors.
   */
  pattern?: MarketingPattern;
}>) {
  if (preset !== undefined && preset !== "editorial" && preset !== "minimal") throw new RangeError("Unknown marketing preset.");
  if (landscape !== undefined && landscape !== "page" && landscape !== "contained" && landscape !== "off") throw new RangeError("Unknown landscape host.");
  assertMarketingPattern(pattern);
  return (
    <div className={classNames("hraness-marketing-page", className)} data-hraness-landscape={landscape} data-hraness-marketing="page" data-hraness-marketing-preset={preset} data-hraness-pattern={pattern} id={id}>
      {children}
    </div>
  );
}

/**
 * Opening container for the hero. It paints the flat palette background: the
 * retired grain, cell, and pattern textures no longer render. It never creates
 * an overlay or a fixed-position containing block.
 */
export function MarketingField({ children, className, pattern }: Readonly<{
  children: ReactNode;
  className?: string;
  /** @deprecated Patterns are retired; every value renders as `none`. */
  pattern?: MarketingPattern;
}>) {
  assertMarketingPattern(pattern);
  return <div className={["hraness-marketing-field", className].filter(Boolean).join(" ")} data-hraness-marketing="field" data-hraness-pattern={pattern}>{children}</div>;
}

export type MarketingMainClearance = "scroll" | "pad";

/**
 * Main landmark that inherits --hraness-sticky-offset from a preceding sticky
 * header. Hash and skip targets use the offset as scroll-margin. Pass
 * clearance="pad" when the header is out of flow.
 */
export function MarketingMain({
  children,
  className,
  clearance = "scroll",
  id = "main-content",
}: Readonly<{
  children: ReactNode;
  className?: string;
  clearance?: MarketingMainClearance;
  id?: string;
}>) {
  if (clearance !== "scroll" && clearance !== "pad") throw new RangeError("Marketing main clearance must be scroll or pad.");
  return (
    <main
      className={classNames("hraness-marketing-main", className, clearance === "pad" ? "pad" : "default")}
      data-hraness-clearance={clearance === "pad" ? "pad" : undefined}
      data-hraness-marketing="main"
      id={id}
    >
      {children}
    </main>
  );
}

/** A compact identity icon and a full-width illustration are separate card layouts. */
type MarketingCardVisual =
  | Readonly<{ art?: ReactNode; icon?: never }>
  | Readonly<{ art?: never; icon: ReactNode }>;

export type MarketingCardItem = MarketingCardVisual & Readonly<{
  readonly href?: string;
  readonly meta?: ReactNode;
  readonly title: string;
}>;

/**
 * Stretching product card row. Direct children share the tallest item's
 * height. Icon cards place complete copy beside a compact mark; illustration
 * cards reserve a two-line meta block. Titles wrap without clamping.
 */
export function MarketingCardRow({
  ariaLabel,
  cards,
  children,
  className,
  columns,
}: Readonly<{
  ariaLabel?: string;
  cards?: readonly MarketingCardItem[];
  children?: ReactNode;
  className?: string;
  /** Maximum columns; cards wrap to fit the available container width. */
  columns?: MarketingColumnCount;
}>) {
  return (
    <div
      aria-label={ariaLabel}
      className={marketingColumnClassName("hraness-marketing-card-row", className, columns)}
      data-hraness-marketing="card-row"
    >
      {cards?.map((card) => (
        <MarketingCard
          key={card.title}
          {...card}
        />
      ))}
      {children}
    </div>
  );
}

/** Clipped media well. Keep logo and background paint inside the card. */
export function MarketingCardArt({
  children,
  className,
}: Readonly<{
  children?: ReactNode;
  className?: string;
}>) {
  return (
    <div className={classNames("hraness-marketing-card__art", className)} data-hraness-marketing="card-art">
      {children}
    </div>
  );
}

function isPresentNode(value: ReactNode): boolean {
  return value !== undefined && value !== false && value !== null && value !== "";
}

export function MarketingCard({
  art,
  children,
  className,
  href,
  icon,
  meta,
  title,
}: MarketingCardItem & Readonly<{
  children?: ReactNode;
  className?: string;
}>) {
  const hasIcon = isPresentNode(icon);
  if (hasIcon && isPresentNode(art)) throw new RangeError("Marketing cards accept either icon or art, not both.");
  const copy = <>
    <h3 className={classNames("hraness-marketing-card__title")}>{title}</h3>
    {isPresentNode(meta) ? <p className={classNames("hraness-marketing-card__meta", undefined, hasIcon ? "icon" : "default")}>{meta}</p> : null}
    {isPresentNode(children) ? <div className={classNames("hraness-marketing-card__body")}>{children}</div> : null}
  </>;
  const body = hasIcon ? <>
    <div aria-hidden="true" className={classNames("hraness-marketing-card__icon")}>{icon}</div>
    <div className={classNames("hraness-marketing-card__copy")}>{copy}</div>
  </> : <>
    {isPresentNode(art) ? <MarketingCardArt>{art}</MarketingCardArt> : null}
    {copy}
  </>;
  const cardClassName = classNames("hraness-marketing-card", className, hasIcon ? "icon" : "default");
  if (href === undefined) {
    return (
      <article className={cardClassName} data-hraness-marketing="card" data-layout={hasIcon ? "icon" : undefined}>
        {body}
      </article>
    );
  }
  return (
    <a className={cardClassName} data-hraness-marketing="card" data-layout={hasIcon ? "icon" : undefined} href={href}>
      {body}
    </a>
  );
}

export function MarketingSiteHeader({
  action,
  ariaLabel = "Site",
  brand,
  brandHref = "/",
  brandLabel,
  brandMark,
  className,
  links,
  trailing,
  sticky = true,
}: Readonly<{
  action?: MarketingAction;
  ariaLabel?: string;
  brand: ReactNode;
  brandHref?: string;
  brandLabel?: string;
  /** Transparent product mark; the original image remains the fallback. */
  brandMark?: string;
  className?: string;
  links: readonly MarketingLink[];
  trailing?: ReactNode;
  /** Keep embedded previews in document flow; product headers stick by default. */
  sticky?: boolean;
}>) {
  const brandProperties = brandLabel === undefined ? {} : { "aria-label": brandLabel };
  return (
    <header
      className={classNames("hraness-marketing-header", className, sticky ? "default" : "static")}
      data-hraness-marketing="header"
      data-position={sticky ? "sticky" : "static"}
    >
      <div className={classNames("hraness-marketing-header__inner")}>
        <a className={classNames("hraness-marketing-header__brand")} data-foil="" href={brandHref} {...brandProperties}>
          {brandMark === undefined ? null : <FoilMark src={brandMark} />}
          {brand}
        </a>
        <nav aria-label={ariaLabel} className={classNames("hraness-marketing-header__nav")}>
          {links.map((link) => (
            <a
              aria-current={link.current === true ? "page" : undefined}
              className={classNames("hraness-marketing-header__link", undefined, link.current === true ? "current" : "default")}
              href={link.href}
              key={`${link.href}-${link.label}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        {action === undefined && trailing === undefined
          ? null
          : (
            <div className={classNames("hraness-marketing-header__actions")}>
              {action === undefined
                ? null
                : (
                  <a
                    className={classNames("hraness-marketing-action", undefined, `header-${action.emphasis ?? "primary"}`)}
                    data-emphasis={action.emphasis ?? "primary"}
                    data-foil={(action.emphasis ?? "primary") === "primary" ? "" : undefined}
                    href={action.href}
                  >
                    {action.label}
                  </a>
                )}
              {trailing}
            </div>
          )}
      </div>
    </header>
  );
}

/**
 * In-flow site footer. The brand lockup is always the product mark followed by
 * its name; optional children carry a product note and optional links a quiet
 * footer navigation. It rests at the end of document flow; when the shared
 * network footer follows it directly, the marketing grammar joins the pair
 * into one band.
 */
export function MarketingSiteFooter({
  ariaLabel = "Site",
  brand,
  brandHref = "/",
  brandLabel,
  brandMark,
  children,
  className,
  links = [],
  linksLabel = "Footer navigation",
  name,
}: Readonly<{
  /** Landmark label; keep it distinct from the network footer on the same page. */
  ariaLabel?: string;
  /** The product mark, conventionally one inline SVG; rendered before `name`. */
  brand: ReactNode;
  brandHref?: string;
  brandLabel?: string;
  /**
   * Transparent product mark. When set, the lockup renders the shared foil
   * icon-plus-text treatment like the site header; `brand` remains the
   * forced-color and no-mask fallback for that mark.
   */
  brandMark?: string;
  /** Product-owned note content between the lockup and the navigation. */
  children?: ReactNode;
  className?: string;
  links?: readonly MarketingLink[];
  linksLabel?: string;
  /** The product name rendered inside the home link after `brand`. */
  name: string;
}>) {
  const brandProperties = brandLabel === undefined ? {} : { "aria-label": brandLabel };
  const foilBrand = brandMark !== undefined;
  return (
    <footer aria-label={ariaLabel} className={classNames("hraness-marketing-footer", className)} data-hraness-marketing="footer">
      <div className={classNames("hraness-marketing-footer__inner")}>
        <a
          className={classNames("hraness-marketing-footer__brand", undefined, foilBrand ? "foil" : "default")}
          data-foil={foilBrand ? "" : undefined}
          href={brandHref}
          {...brandProperties}
        >
          {foilBrand ? <FoilMark fallback={brand} size={18} src={brandMark} /> : brand}
          <span className={classNames("hraness-marketing-footer__name")}>{name}</span>
        </a>
        {children}
        {links.length === 0
          ? null
          : (
            <nav aria-label={linksLabel} className={classNames("hraness-marketing-footer__nav")}>
              {links.map((link) => (
                <a
                  aria-current={link.current === true ? "page" : undefined}
                  className={classNames("hraness-marketing-footer__link", undefined, link.current === true ? "current" : "default")}
                  href={link.href}
                  key={`${link.href}-${link.label}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
      </div>
    </footer>
  );
}

export function MarketingFlow({
  ariaLabel,
  className,
  steps,
}: Readonly<{
  ariaLabel: string;
  className?: string;
  steps: readonly MarketingStep[];
}>) {
  return (
    <ol
      aria-label={ariaLabel}
      className={classNames("hraness-marketing-flow", className)}
      data-hraness-marketing="flow"
    >
      {steps.map((step, index) => (
        <li className={classNames("hraness-marketing-flow__step", undefined, index === 0 ? "first" : "default")} key={`${String(index)}-${step.label}`}>
          <span aria-hidden="true" className={classNames("hraness-marketing-flow__number")}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className={classNames("hraness-marketing-flow__body")}>
            <strong className={classNames("hraness-marketing-flow__label")}>{step.label}</strong>
            {step.code === undefined
              ? null
              : <SyntaxCode className={classNames("hraness-marketing-flow__code")} code={step.code} styles="classes" />}
            {step.detail === undefined
              ? null
              : <p className={classNames("hraness-marketing-flow__detail")}>{step.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function MarketingFacts({
  className,
  columns,
  facts,
}: Readonly<{
  className?: string;
  /** Static desktop columns without inline styles; omission uses the collection length. Mobile stays two columns. */
  columns?: MarketingColumnCount;
  facts: readonly MarketingFact[];
}>) {
  const rootClassName = marketingColumnClassName("hraness-marketing-facts", className, columns);
  if (facts.length === 0) return null;
  return (
    <dl
      className={rootClassName}
      data-hraness-marketing="facts"
      style={columns === undefined ? { "--hraness-marketing-fact-columns": String(facts.length) } as Record<string, string> : undefined}
    >
      {facts.map((fact, index) => (
        <div className={classNames("hraness-marketing-facts__item", undefined, marketingFactCellVariant(index))} key={`${fact.label}-${fact.value}`}>
          <dt className={classNames("hraness-marketing-facts__label")}>{fact.label}</dt>
          <dd className={classNames("hraness-marketing-facts__body")}>
            <strong className={classNames("hraness-marketing-facts__value")}>{fact.value}</strong>
            {fact.detail === undefined ? null : <span className={classNames("hraness-marketing-facts__detail")}>{fact.detail}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export interface ProductHeroProps {
  readonly actions?: readonly MarketingAction[];
  readonly align?: "center" | "start";
  /**
   * @deprecated Hero backdrops are retired. The hero renders no decorative
   * artwork, light field, or blur, whatever this holds. Show real product
   * proof in `frame` instead.
   */
  readonly backdrop?: ReactNode | false;
  readonly boundary?: string;
  readonly className?: string;
  /** A concrete request a reader could make, shown under the summary. */
  readonly example?: string;
  readonly eyebrow?: string;
  readonly facts?: readonly MarketingFact[];
  /** Static fact columns without inline styles; omission uses the facts length. Mobile stays two columns. */
  readonly factsColumns?: MarketingColumnCount;
  /** A product frame below the copy, or beside it in the split layout. */
  readonly frame?: ReactNode;
  readonly heading: string;
  readonly headingId: string;
  readonly headingLevel?: MarketingHeadingLevel;
  /** An install command or installer selector directly below the summary. */
  readonly install?: ReactNode;
  /** Split copy and frame into two columns on wide screens. */
  readonly layout?: "stack" | "split";
  readonly name: string;
  /** Product-owned notice after the copy boundary, without an added wrapper. */
  readonly notice?: ReactNode;
  readonly proof?: Readonly<{
    readonly content: ReactNode;
    readonly heading: string;
    readonly kicker?: string;
  }>;
  readonly summary: string;
  readonly tone?: MarketingTone;
}

export function ProductHero({
  actions = [],
  align = "center",
  boundary,
  className,
  example,
  eyebrow,
  facts = [],
  factsColumns,
  frame,
  heading,
  headingId,
  headingLevel = 1,
  install,
  layout = "stack",
  name,
  notice,
  proof,
  summary,
  tone = "paper",
}: Readonly<ProductHeroProps>) {
  if (layout !== "stack" && layout !== "split") throw new RangeError("Hero layout must be stack or split.");
  const split = layout === "split" && isPresentNode(frame);
  return (
    <header
      aria-labelledby={headingId}
      className={marketingHeroClassName(className, tone, split)}
      data-align={align}
      data-hraness-marketing="hero"
      data-layout={split ? "split" : undefined}
      data-tone={tone}
    >
      <div className={classNames("hraness-marketing-hero__copy", undefined, align === "start" ? "start" : "default")}>
        {eyebrow === undefined || eyebrow === "" ? null : <p className={classNames("hraness-marketing-hero__eyebrow", undefined, tone === "accent" ? "accent" : "default")}>{eyebrow}</p>}
        {name === "" ? null : <p className={classNames("hraness-marketing-hero__name")}>{name}</p>}
        <Heading className={classNames("hraness-marketing-hero__heading")} id={headingId} level={headingLevel}>
          {heading}
        </Heading>
        <p className={classNames("hraness-marketing-hero__summary")}>{summary}</p>
        {install === undefined ? null : <div className={classNames("hraness-marketing-hero__install")}>{install}</div>}
        {example === undefined
          ? null
          : <p className={classNames("hraness-marketing-hero__example")}>{example}</p>}
        <MarketingActions actions={actions} className={classNames("hraness-marketing-hero__actions", undefined, align === "start" ? "start" : "default")} context="hero" tone={tone} />
        {boundary === undefined
          ? null
          : <p className={classNames("hraness-marketing-hero__boundary")}>{boundary}</p>}
        {notice}
      </div>
      {frame === undefined
        ? null
        : <div className={classNames("hraness-marketing-hero__frame")}>{frame}</div>}
      {proof === undefined
        ? null
        : (
          <aside className={classNames("hraness-marketing-proof")} aria-labelledby={`${headingId}-proof`}>
            {proof.kicker === undefined
              ? null
              : <p className={classNames("hraness-marketing-proof__kicker")}>{proof.kicker}</p>}
            <Heading
              className={classNames("hraness-marketing-proof__heading")}
              id={`${headingId}-proof`}
              level={childHeadingLevel(headingLevel)}
            >
              {proof.heading}
            </Heading>
            {proof.content}
          </aside>
        )}
      <MarketingFacts facts={facts} {...(factsColumns === undefined ? {} : { columns: factsColumns })} />
    </header>
  );
}

export interface MarketingPillar {
  readonly icon?: ReactNode;
  readonly label: string;
  readonly summary: string;
}

export function MarketingPillars({
  ariaLabel,
  className,
  columns,
  pillars,
  presentation = "columns",
}: Readonly<{
  ariaLabel: string;
  className?: string;
  /** Static desktop columns without inline styles; omission uses the collection length. Mobile stays one column. */
  columns?: MarketingColumnCount;
  pillars: readonly MarketingPillar[];
  presentation?: "columns" | "benefits";
}>) {
  const rootClassName = marketingColumnClassName("hraness-marketing-pillars", className, columns, presentation === "benefits" ? "benefits" : "default");
  if (pillars.length === 0) return null;
  return (
    <dl
      aria-label={ariaLabel}
      className={rootClassName}
      data-hraness-marketing="pillars"
      data-presentation={presentation}
      style={columns === undefined ? { "--hraness-marketing-pillar-columns": String(pillars.length) } as Record<string, string> : undefined}
    >
      {pillars.map((pillar, index) => (
        <div className={classNames("hraness-marketing-pillars__item", undefined, presentation === "benefits" ? "benefit" : index === 0 ? "default" : "later")} key={pillar.label}>
          <dt className={classNames("hraness-marketing-pillars__label")}>{pillar.icon === undefined ? null : <span aria-hidden="true" className={classNames("hraness-marketing-pillars__icon")}>{pillar.icon}</span>}{pillar.label}</dt>
          <dd className={classNames("hraness-marketing-pillars__summary")}>{pillar.summary}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MarketingInstallPanel({
  children,
  className,
  eyebrow,
  heading,
  headingId,
  headingLevel = 2,
  id,
  note,
}: Readonly<{
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  /** Product-owned supporting copy directly after the heading. */
  note?: ReactNode;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-install", className)}
      data-hraness-marketing="install"
      id={id}
    >
      <div className={classNames("hraness-marketing-install__heading-group")}>
        {eyebrow === undefined || eyebrow === "" ? null : <p className={classNames("hraness-marketing-install__eyebrow")}>{eyebrow}</p>}
        <Heading className={classNames("hraness-marketing-install__heading")} id={headingId} level={headingLevel}>
          {heading}
        </Heading>
        {note}
      </div>
      <div className={classNames("hraness-marketing-install__commands")}>{children}</div>
    </section>
  );
}

export type MarketingProofFrameChrome = "window" | "browser" | "terminal";

/** Reads a frame URL for display: host and path, no scheme, no query or fragment. */
export function marketingProofFrameAddress(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new RangeError(`Proof frame url must be an absolute URL; received ${JSON.stringify(url)}.`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new RangeError("Proof frame url must use http or https.");
  const path = parsed.pathname === "/" ? "" : parsed.pathname;
  return `${parsed.host}${path}`;
}

/**
 * A captioned frame around a screenshot, recording, or code-built mockup.
 * `chrome` draws a window title bar, a browser address bar, or a terminal
 * title bar above the content. A `title` without `chrome` keeps the window
 * bar. The browser bar shows `url` as host and path. A window or terminal
 * bar without a title draws only the window lights.
 */
export function MarketingProofFrame({
  caption,
  children,
  chrome,
  className,
  credit,
  title,
  url,
}: Readonly<{
  caption?: string;
  children: ReactNode;
  /** The title bar drawn above the content. Defaults to `window` when `title` is given, otherwise none. */
  chrome?: MarketingProofFrameChrome;
  className?: string;
  credit?: string;
  /** Window or terminal title; for the browser bar, the address shown when `url` is omitted. */
  title?: string;
  /** The page address shown in the browser bar. */
  url?: string;
}>) {
  if (chrome !== undefined && chrome !== "window" && chrome !== "browser" && chrome !== "terminal") {
    throw new RangeError(`Unknown proof frame chrome: ${String(chrome)}.`);
  }
  if (url !== undefined && chrome !== "browser") throw new RangeError("Proof frame url needs chrome=\"browser\".");
  const bar = chrome ?? (title === undefined ? undefined : "window");
  const label = bar === "browser" ? (url === undefined ? title : marketingProofFrameAddress(url)) : title;
  if (bar === "browser" && (label === undefined || label.trim() === "")) {
    throw new RangeError("Proof frame chrome=browser needs a url or title.");
  }
  return (
    <figure
      className={classNames("hraness-marketing-proof-frame", className)}
      data-chrome={bar}
      data-hraness-marketing="proof-frame"
    >
      {bar === undefined
        ? null
        : (
          <div aria-hidden="true" className={classNames("hraness-marketing-proof-frame__chrome")}>
            <span className={classNames("hraness-marketing-proof-frame__lights")}>
              <span className={classNames("hraness-marketing-proof-frame__light")} />
              <span className={classNames("hraness-marketing-proof-frame__light")} />
              <span className={classNames("hraness-marketing-proof-frame__light")} />
            </span>
            {bar === "browser"
              ? <span className={classNames("hraness-marketing-proof-frame__address")}>{label}</span>
              : label === undefined || label.trim() === ""
                ? null
                : <span className={classNames("hraness-marketing-proof-frame__title", undefined, bar === "terminal" ? "terminal" : "default")}>{label}</span>}
          </div>
        )}
      <div className={classNames("hraness-marketing-proof-frame__content")}>{children}</div>
      {caption === undefined && credit === undefined
        ? null
        : (
          <figcaption className={classNames("hraness-marketing-proof-frame__caption")}>
            {caption === undefined ? null : <span>{caption}</span>}
            {credit === undefined ? null : <small className={classNames("hraness-marketing-proof-frame__credit")}>{credit}</small>}
          </figcaption>
        )}
    </figure>
  );
}

export interface MarketingDataTableColumn {
  readonly label: string;
  /** Right-aligns the column and keeps values on one line. */
  readonly numeric?: boolean;
}

export interface MarketingDataTableCell {
  readonly content: ReactNode;
  /** Marks a notable outcome: `positive` accents the value, `negative` mutes it. */
  readonly tone?: "positive" | "negative";
}

function dataTableCell(cell: ReactNode | MarketingDataTableCell): {
  content: ReactNode;
  tone?: "positive" | "negative";
} {
  if (cell !== null && typeof cell === "object" && !Array.isArray(cell) && "content" in cell) {
    return cell as MarketingDataTableCell;
  }
  return { content: cell };
}

/**
 * A dated, captioned comparison table. Renders a ruled figure whose scrollable
 * region never escapes the measure; the first column is each row's heading and
 * `note` keeps the measurement's scope honest underneath.
 */
export function MarketingDataTable({
  caption,
  className,
  columns,
  meta,
  note,
  rows,
}: Readonly<{
  /** Headline naming the measurement. */
  caption: ReactNode;
  className?: string;
  columns: readonly MarketingDataTableColumn[];
  /** Date, source, or sample size — rendered muted beside the caption. */
  meta?: ReactNode;
  /** Caveat rendered under the table; keep the measurement's scope honest. */
  note?: ReactNode;
  rows: readonly ReadonlyArray<ReactNode | MarketingDataTableCell>[];
}>) {
  if (columns.length === 0) throw new RangeError("Marketing data table needs at least one column.");
  for (const row of rows) {
    if (row.length !== columns.length) throw new RangeError("Marketing data table rows must match the column count.");
  }
  return (
    <figure
      className={classNames("hraness-marketing-data-table", className)}
      data-hraness-marketing="data-table"
    >
      <figcaption className={classNames("hraness-marketing-data-table__head")}>
        <span className={classNames("hraness-marketing-data-table__title")}>{caption}</span>
        {meta === undefined ? null : <span className={classNames("hraness-marketing-data-table__meta")}>{meta}</span>}
      </figcaption>
      <div className={classNames("hraness-marketing-data-table__scroll")}>
        <table className={classNames("hraness-marketing-data-table__table")}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  className={classNames("hraness-marketing-data-table__heading")}
                  data-numeric={column.numeric === true ? "" : undefined}
                  key={index}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const { content, tone } = dataTableCell(cell);
                  if (cellIndex === 0) {
                    return (
                      <th
                        className={classNames("hraness-marketing-data-table__row-heading")}
                        data-numeric={columns[0]?.numeric === true ? "" : undefined}
                        key={cellIndex}
                        scope="row"
                      >
                        {content}
                      </th>
                    );
                  }
                  return (
                    <td
                      className={classNames("hraness-marketing-data-table__cell")}
                      data-numeric={columns[cellIndex]?.numeric === true ? "" : undefined}
                      data-tone={tone}
                      key={cellIndex}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note === undefined ? null : <p className={classNames("hraness-marketing-data-table__note")}>{note}</p>}
    </figure>
  );
}

/**
 * A mono code block with shared syntax highlighting. Wraps `SyntaxCode` in the
 * `pre` the marketing grammar styles and scrolls inside the measure when a
 * line overflows.
 */
export function MarketingCodeBlock({
  className,
  code,
  language,
}: Readonly<{
  className?: string;
  code: string;
  /** A language/fence hint; omitted hints use conservative automatic selection. */
  language?: string;
}>) {
  return (
    <pre className={classNames("hraness-marketing-code", className)} data-hraness-marketing="code">
      <SyntaxCode code={code} {...(language === undefined ? {} : { language })} styles="classes" />
    </pre>
  );
}

/** The section's native paragraph label, reusable by product-owned prose. */
export function MarketingSectionLabel({
  children,
  className,
  size = "default",
}: Readonly<{
  children: string;
  className?: string;
  size?: "default" | "body";
}>) {
  if (size !== "default" && size !== "body") throw new RangeError("Marketing label size must be default or body.");
  return <p className={classNames("hraness-marketing-section__label", className, size)}
    data-size={size === "body" ? "body" : undefined}>{children}</p>;
}

export function MarketingSection({
  children,
  className,
  heading,
  headingId,
  headingLevel = 2,
  headingContent,
  id,
  label,
  layout = "stack",
  summary,
}: Readonly<{
  children: ReactNode;
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  /** Commands or actions below the lead copy, beside the visual in split layouts. */
  headingContent?: ReactNode;
  id?: string;
  label?: string;
  layout?: "split" | "split-reverse" | "stack";
  summary?: string;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-section", className, layout === "stack" ? "default" : "split")}
      data-hraness-marketing="section"
      data-layout={layout}
      id={id}
    >
      <div className={classNames("hraness-marketing-section__heading-group", undefined, layout === "stack" ? "default" : layout === "split" ? "split" : "reverse")}>
        {label === undefined || label === "" ? null : <MarketingSectionLabel>{label}</MarketingSectionLabel>}
        <Heading className={classNames("hraness-marketing-section__heading")} id={headingId} level={headingLevel}>
          {heading}
        </Heading>
        {summary === undefined
          ? null
          : <p className={classNames("hraness-marketing-section__summary")}>{summary}</p>}
        {isPresentNode(headingContent) ? <div className={classNames("hraness-marketing-section__heading-content")}>{headingContent}</div> : null}
      </div>
      <div className={classNames("hraness-marketing-section__body")}>{children}</div>
    </section>
  );
}

type MarketingCollectionPrefix = "interfaces" | "pricing" | "primitives" | "questions" | "quotes" | "related" | "trust";

interface MarketingCollectionHeaderProps {
  readonly heading: string;
  readonly headingId: string;
  readonly headingLevel: MarketingHeadingLevel;
  readonly label: string | undefined;
  readonly prefix: MarketingCollectionPrefix;
  readonly summary: string | undefined;
}

function MarketingCollectionHeader({
  heading,
  headingId,
  headingLevel,
  label,
  prefix,
  summary,
}: Readonly<MarketingCollectionHeaderProps>) {
  return (
    <header className={classNames(`hraness-marketing-${prefix}__header`)}>
      {label === undefined || label === "" ? null : <p className={classNames(`hraness-marketing-${prefix}__label`)}>{label}</p>}
      <Heading className={classNames(`hraness-marketing-${prefix}__heading`)} id={headingId} level={headingLevel}>
        {heading}
      </Heading>
      {summary === undefined ? null : <p className={classNames(`hraness-marketing-${prefix}__summary`)}>{summary}</p>}
    </header>
  );
}

export interface MarketingPrimitive {
  readonly example?: ReactNode;
  readonly label: string;
  readonly summary: string;
}

export function MarketingPrimitives({
  className,
  columns,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  label,
  summary,
}: Readonly<{
  className?: string;
  /** Maximum columns; items wrap to fit the available container width. */
  columns?: MarketingColumnCount;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  items: readonly MarketingPrimitive[];
  label?: string;
  summary?: string;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-primitives", className)}
      data-hraness-marketing="primitives"
      id={id}
    >
      <MarketingCollectionHeader {...{ heading, headingId, headingLevel, label, summary }} prefix="primitives" />
      <ol className={marketingColumnClassName("hraness-marketing-primitives__list", undefined, columns)}>
        {items.map((item, index) => (
          <li className={classNames("hraness-marketing-primitive")} key={item.label}>
            <span aria-hidden="true" className={classNames("hraness-marketing-primitive__number")}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <Heading className={classNames("hraness-marketing-primitive__heading")} level={childHeadingLevel(headingLevel)}>
              {item.label}
            </Heading>
            <p className={classNames("hraness-marketing-primitive__summary")}>{item.summary}</p>
            {item.example}
          </li>
        ))}
      </ol>
    </section>
  );
}

export type MarketingNoticeTone = "info" | "success" | "error";

/**
 * One status or alert line inside the page column, such as a confirmation
 * after a redirect. Errors are announced as alerts; other tones as status.
 */
export function MarketingNotice({
  children,
  className,
  tone = "info",
}: Readonly<{
  children: ReactNode;
  className?: string;
  tone?: MarketingNoticeTone;
}>) {
  if (tone !== "info" && tone !== "success" && tone !== "error") throw new RangeError("Marketing notice tone must be info, success, or error.");
  return (
    <p
      className={classNames("hraness-marketing-notice", className, tone === "info" ? "default" : tone)}
      data-hraness-marketing="notice"
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

export interface MarketingStat {
  readonly detail?: string;
  readonly label: string;
  readonly value: string;
}

export function MarketingStatStrip({
  ariaLabel,
  className,
  columns,
  source,
  stats,
}: Readonly<{
  ariaLabel: string;
  className?: string;
  /** Static desktop columns without inline styles; omission uses the collection length. Mobile stays two columns. */
  columns?: MarketingColumnCount;
  /** Where the numbers come from and when they were checked. */
  source?: ReactNode;
  stats: readonly MarketingStat[];
}>) {
  const listClassName = marketingColumnClassName("hraness-marketing-stats__list", undefined, columns);
  if (stats.length === 0) return null;
  return (
    <section
      aria-label={ariaLabel}
      className={classNames("hraness-marketing-stats", className)}
      data-hraness-marketing="stats"
    >
      <dl
        className={listClassName}
        style={columns === undefined ? { "--hraness-marketing-fact-columns": String(stats.length) } as Record<string, string> : undefined}
      >
        {stats.map((stat, index) => (
          <div className={classNames("hraness-marketing-facts__item", undefined, marketingFactCellVariant(index))} key={`${stat.label}-${stat.value}`}>
            <dt className={classNames("hraness-marketing-facts__label")}>{stat.label}</dt>
            <dd className={classNames("hraness-marketing-facts__body")}>
              <strong className={classNames("hraness-marketing-stats__value")}>{stat.value}</strong>
              {stat.detail === undefined ? null : <span className={classNames("hraness-marketing-facts__detail")}>{stat.detail}</span>}
            </dd>
          </div>
        ))}
      </dl>
      {source === undefined ? null : <p className={classNames("hraness-marketing-stats__source")}>{source}</p>}
    </section>
  );
}

export interface MarketingInterface {
  readonly example?: ReactNode;
  readonly label: string;
  /** A reference link pinned to the foot of the card, aligned to the end. */
  readonly link?: MarketingLink;
  readonly summary: string;
}

export function MarketingInterfaceGrid({
  className,
  columns,
  heading,
  headingId,
  headingLevel = 2,
  id,
  interfaces,
  label,
  summary,
}: Readonly<{
  className?: string;
  /** Maximum columns; cards wrap within the available container width. */
  columns?: MarketingColumnCount;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  interfaces: readonly MarketingInterface[];
  label?: string;
  summary?: string;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-interfaces", className)}
      data-hraness-marketing="interfaces"
      id={id}
    >
      <MarketingCollectionHeader {...{ heading, headingId, headingLevel, label, summary }} prefix="interfaces" />
      <div className={marketingColumnClassName("hraness-marketing-interface-grid", undefined, columns)}>
        {interfaces.map((entry) => (
          <article className={classNames("hraness-marketing-interface")} key={entry.label}>
            <Heading
              className={classNames("hraness-marketing-interface__heading")}
              level={childHeadingLevel(headingLevel)}
            >
              {entry.label}
            </Heading>
            <p className={classNames("hraness-marketing-interface__summary")}>{entry.summary}</p>
            {entry.example}
            {entry.link === undefined
              ? null
              : (
                <p className={classNames("hraness-marketing-interface__action")}>
                  <a className={classNames("hraness-marketing-interface__link")} href={entry.link.href}>{entry.link.label}</a>
                </p>
              )}
          </article>
        ))}
      </div>
    </section>
  );
}

export interface MarketingTrustItem {
  readonly detail: string;
  readonly label: string;
}

export function MarketingTrustBoundary({
  className,
  columns,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  label,
  summary,
}: Readonly<{
  className?: string;
  /** Maximum columns; cards wrap within the available container width. */
  columns?: MarketingColumnCount;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  items: readonly MarketingTrustItem[];
  label?: string;
  summary?: string;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-trust", className)}
      data-hraness-marketing="trust"
      id={id}
    >
      <MarketingCollectionHeader {...{ heading, headingId, headingLevel, label, summary }} prefix="trust" />
      <dl className={marketingColumnClassName("hraness-marketing-trust-grid", undefined, columns)}>
        {items.map((item) => (
          <div className={classNames("hraness-marketing-trust-item")} key={item.label}>
            <dt className={classNames("hraness-marketing-trust-item__label")}>{item.label}</dt>
            <dd className={classNames("hraness-marketing-trust-item__detail")}>{item.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export interface MarketingQuote {
  /** Optional profile link for the attribution. */
  readonly href?: string;
  readonly name: string;
  readonly quote: string;
  /** Handle, title, or affiliation shown after the name. */
  readonly role?: string;
}

/**
 * Attributed quotes. Only real, permissioned quotes belong here; render
 * nothing rather than fill the grid with placeholders.
 */
export function MarketingQuoteGrid({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  label,
  quotes,
  summary,
}: Readonly<{
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  label?: string;
  quotes: readonly MarketingQuote[];
  summary?: string;
}>) {
  if (quotes.length === 0) return null;
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-quotes", className)}
      data-hraness-marketing="quotes"
      id={id}
    >
      <MarketingCollectionHeader {...{ heading, headingId, headingLevel, label, summary }} prefix="quotes" />
      <ul className={classNames("hraness-marketing-quote-grid")}>
        {quotes.map((entry) => (
          <li key={`${entry.name}-${entry.quote.slice(0, 24)}`}>
            <figure className={classNames("hraness-marketing-quote")}>
              <blockquote className={classNames("hraness-marketing-quote__body")}>
                <p className={classNames("hraness-marketing-quote__text")}>{entry.quote}</p>
              </blockquote>
              <figcaption className={classNames("hraness-marketing-quote__attribution")}>
                <strong className={classNames("hraness-marketing-quote__name")}>{entry.name}</strong>
                {entry.role === undefined
                  ? null
                  : entry.href === undefined
                    ? <span>{entry.role}</span>
                    : <a className={classNames("hraness-marketing-quote__link")} href={entry.href}>{entry.role}</a>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface MarketingPlan {
  readonly action?: MarketingAction;
  readonly emphasis?: "primary" | "secondary";
  readonly features: readonly string[];
  readonly name: string;
  readonly note?: string;
  /** Billing period or qualifier shown after the price, such as "per year". */
  readonly period?: string;
  readonly price: string;
  readonly summary?: string;
}

export function MarketingPricing({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  label,
  plans,
  summary,
}: Readonly<{
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  label?: string;
  plans: readonly MarketingPlan[];
  summary?: string;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-pricing", className)}
      data-hraness-marketing="pricing"
      id={id}
    >
      <MarketingCollectionHeader {...{ heading, headingId, headingLevel, label, summary }} prefix="pricing" />
      <ul className={classNames("hraness-marketing-plan-grid")}>
        {plans.map((plan) => (
          <li className={classNames("hraness-marketing-plan", undefined, plan.emphasis === "primary" ? "primary" : "default")} data-emphasis={plan.emphasis ?? "secondary"} key={plan.name}>
            <Heading className={classNames("hraness-marketing-plan__name")} level={childHeadingLevel(headingLevel)}>
              {plan.name}
            </Heading>
            <p className={classNames("hraness-marketing-plan__price")}>
              <strong className={classNames("hraness-marketing-plan__value")}>{plan.price}</strong>
              {plan.period === undefined ? null : <span className={classNames("hraness-marketing-plan__period")}>{plan.period}</span>}
            </p>
            {plan.summary === undefined ? null : <p className={classNames("hraness-marketing-plan__summary")}>{plan.summary}</p>}
            {plan.features.length === 0
              ? null
              : (
                <ul className={classNames("hraness-marketing-plan__features")}>
                  {plan.features.map((feature) => <li className={classNames("hraness-marketing-plan__feature")} key={feature}>{feature}</li>)}
                </ul>
              )}
            {plan.action === undefined
              ? null
              : (
                <a
                  className={classNames("hraness-marketing-action", undefined, `plan-${plan.action.emphasis ?? plan.emphasis ?? "secondary"}`)}
                  data-emphasis={plan.action.emphasis ?? plan.emphasis ?? "secondary"}
                  data-foil={(plan.action.emphasis ?? plan.emphasis ?? "secondary") === "primary" ? "" : undefined}
                  href={plan.action.href}
                >
                  {plan.action.label}
                </a>
              )}
            {plan.note === undefined ? null : <p className={classNames("hraness-marketing-plan__note")}>{plan.note}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface MarketingQuestion {
  readonly answer: ReactNode;
  readonly question: string;
}

export function MarketingQuestionList({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  label,
  questions,
  summary,
}: Readonly<{
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  label?: string;
  questions: readonly MarketingQuestion[];
  summary?: string;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-questions", className)}
      data-hraness-marketing="questions"
      id={id}
    >
      <MarketingCollectionHeader {...{ heading, headingId, headingLevel, label, summary }} prefix="questions" />
      <div className={classNames("hraness-marketing-question-list")}>
        {questions.map((question, index) => (
          <details className={classNames("hraness-marketing-question", undefined, index === questions.length - 1 ? "last" : "default")} key={question.question}>
            <summary className={classNames("hraness-marketing-question__summary")}>{question.question}</summary>
            <div className={classNames("hraness-marketing-question__answer")}>{question.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * The person behind the product, in plain words. `children` is the bio as one
 * or more paragraphs.
 */
export function MarketingMaker({
  children,
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  label,
  linkClassName,
  links = [],
  portrait,
}: Readonly<{
  children: ReactNode;
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  label?: string;
  /** Added only to listed links, never to caller-owned biography content. */
  linkClassName?: string;
  links?: readonly MarketingLink[];
  portrait?: ReactNode;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-maker", className)}
      data-hraness-marketing="maker"
      id={id}
    >
      <header className={classNames("hraness-marketing-maker__header")}>
        {portrait === undefined ? null : <div className={classNames("hraness-marketing-maker__portrait")}>{portrait}</div>}
        {label === undefined || label === "" ? null : <p className={classNames("hraness-marketing-maker__label")}>{label}</p>}
        <Heading className={classNames("hraness-marketing-maker__heading")} id={headingId} level={headingLevel}>
          {heading}
        </Heading>
      </header>
      <div className={classNames("hraness-marketing-maker__body")}>
        {children}
        {links.length === 0
          ? null
          : (
            <ul className={classNames("hraness-marketing-maker__links")}>
              {links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <a className={linkClassName} href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          )}
      </div>
    </section>
  );
}

export interface MarketingRelatedProduct {
  /** Custom artwork in place of `mark`, drawn in the same 28px slot. */
  readonly art?: ReactNode;
  /** Optional public host, displayed beside the product name. */
  readonly domain?: string;
  readonly href: string;
  /** Transparent product mark, such as a portfolio item's `mark`; drawn as a foil mark before the name. */
  readonly mark?: string;
  readonly name: string;
  /**
   * @deprecated Cards show `role` only. Kept so existing item lists still
   * type-check; the relation sentence is not rendered.
   */
  readonly relationship?: ReactNode;
  /** The product's one-line description, shown under its name. */
  readonly role: string;
}

export type MarketingRelatedTone = "rose" | "indigo" | "amber" | "emerald" | "neutral";

export interface MarketingRelatedGroup {
  /** Maximum columns for this group, overriding the section default. */
  readonly columns?: MarketingColumnCount;
  /** Heading naming this tier of siblings, rendered one level below the section heading. */
  readonly heading: string;
  readonly headingId: string;
  readonly items: readonly MarketingRelatedProduct[];
  readonly summary?: string;
  /** The category color used on the studio portfolio. */
  readonly tone?: MarketingRelatedTone;
}

function MarketingRelatedCards({
  ariaLabel,
  columns,
  items,
  level,
}: Readonly<{
  ariaLabel?: string;
  columns?: MarketingColumnCount;
  items: readonly MarketingRelatedProduct[];
  level: MarketingHeadingLevel;
}>) {
  return (
    <ul aria-label={ariaLabel} className={marketingColumnClassName("hraness-marketing-related__list", undefined, columns)}>
      {items.map((item) => (
        <li className={classNames("hraness-marketing-related__item")} key={item.name}>
          <a className={classNames("hraness-marketing-related__card")} data-foil="" data-hraness-marketing="card" href={item.href}>
            {isPresentNode(item.art) || (item.mark !== undefined && item.mark !== "")
              ? (
                <span aria-hidden="true" className={classNames("hraness-marketing-related__card-mark")}>
                  {isPresentNode(item.art) ? item.art : <FoilMark size={28} src={item.mark ?? ""} />}
                </span>
              )
              : null}
            <div className={classNames("hraness-marketing-related__card-text")}>
              <div className={classNames("hraness-marketing-related__card-heading")}>
                <Heading className={classNames("hraness-marketing-related__card-name")} level={level}>{item.name}</Heading>
                {item.domain === undefined ? null : <span className={classNames("hraness-marketing-related__card-domain")}>{item.domain}</span>}
              </div>
              <span className={classNames("hraness-marketing-related__card-role")}>{item.role}</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

type MarketingRelatedBody =
  | Readonly<{ groups: readonly MarketingRelatedGroup[]; items?: undefined }>
  | Readonly<{ groups?: undefined; items: readonly MarketingRelatedProduct[] }>;

/** Compact studio product rows, grouped by portfolio category when supplied. */
export function MarketingRelated({
  className,
  columns,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  groups,
  label,
  summary,
}: Readonly<{
  className?: string;
  /** Maximum columns for each card row; a group can override it. */
  columns?: MarketingColumnCount;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  label?: string;
  summary?: string;
}> &
  MarketingRelatedBody) {
  const defaultColumnProps = columns === undefined ? {} : { columns };
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-related", className)}
      data-hraness-marketing="related"
      id={id}
    >
      <MarketingCollectionHeader
        heading={heading}
        headingId={headingId}
        headingLevel={headingLevel}
        label={label}
        prefix="related"
        summary={summary}
      />
      {groups === undefined
        ? <MarketingRelatedCards {...defaultColumnProps} items={items} level={childHeadingLevel(headingLevel)} />
        : (
          <div className={classNames("hraness-marketing-related__groups")}>
            {groups.map((group) => (
              <div
                aria-labelledby={group.headingId}
                className={classNames("hraness-marketing-related__group", undefined, group.tone ?? "neutral")}
                data-tone={group.tone ?? "neutral"}
                key={group.headingId}
              >
                <div className={classNames("hraness-marketing-related__group-header")}>
                  <Heading
                    className={classNames("hraness-marketing-related__group-heading")}
                    id={group.headingId}
                    level={childHeadingLevel(headingLevel)}
                  >
                    {group.heading}
                  </Heading>
                  {group.summary === undefined
                    ? null
                    : <p className={classNames("hraness-marketing-related__group-summary")}>{group.summary}</p>}
                </div>
                <MarketingRelatedCards ariaLabel={group.heading} {...(group.columns === undefined ? defaultColumnProps : { columns: group.columns })} items={group.items} level={childHeadingLevel(childHeadingLevel(headingLevel))} />
              </div>
            ))}
          </div>
        )}
    </section>
  );
}

export function MarketingCallToAction({
  actions,
  className,
  eyebrow,
  footnote,
  heading,
  headingId,
  headingLevel = 2,
  id,
  summary,
  tone = "paper",
}: Readonly<{
  actions: readonly MarketingAction[];
  className?: string;
  eyebrow?: string;
  footnote?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  summary?: string;
  tone?: MarketingTone;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-cta", className, tone === "accent" ? "accent" : "default")}
      data-hraness-marketing="cta"
      data-tone={tone}
      id={id}
    >
      {eyebrow === undefined || eyebrow === "" ? null : <p className={classNames("hraness-marketing-cta__eyebrow")}>{eyebrow}</p>}
      <Heading className={classNames("hraness-marketing-cta__heading")} id={headingId} level={headingLevel}>
        {heading}
      </Heading>
      {summary === undefined ? null : <p className={classNames("hraness-marketing-cta__summary")}>{summary}</p>}
      <MarketingActions actions={actions} className={classNames("hraness-marketing-cta__actions")} context="cta" tone={tone} />
      {footnote === undefined ? null : <p className={classNames("hraness-marketing-cta__footnote")}>{footnote}</p>}
    </section>
  );
}
