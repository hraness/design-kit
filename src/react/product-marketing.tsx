import type { ReactNode } from "react";
import { marketingClassName as classNames, marketingFactCellVariant } from "./product-marketing.stylex.js";

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

function MarketingActions({
  actions,
  className,
  tone,
  context,
}: Readonly<{ actions: readonly MarketingAction[]; className: string; tone: MarketingTone; context: "hero" | "cta" }>) {
  if (actions.length === 0) return null;
  return (
    <div className={className}>
      {actions.map((action, index) => (
        <a
          className={classNames("hraness-marketing-action", undefined, tone === "accent"
            ? `${context}-${action.emphasis ?? (index === 0 ? "primary" : "secondary")}`
            : (action.emphasis ?? (index === 0 ? "primary" : "secondary")) === "primary" ? "primary" : "default")}
          data-emphasis={action.emphasis ?? (index === 0 ? "primary" : "secondary")}
          href={action.href}
          key={`${action.href}-${action.label}`}
        >
          {action.label}
        </a>
      ))}
    </div>
  );
}

/**
 * Page root. Binds the marketing tokens, the text face, and the horizontal
 * gutter for every direct child role. Products set `--hraness-site-accent`
 * on this element or on a parent.
 */
export function MarketingPage({
  children,
  className,
  id,
}: Readonly<{
  children: ReactNode;
  className?: string;
  id?: string;
}>) {
  return (
    <div className={classNames("hraness-marketing-page", className)} data-hraness-marketing="page" id={id}>
      {children}
    </div>
  );
}

export function MarketingSiteHeader({
  action,
  ariaLabel = "Site",
  brand,
  brandHref = "/",
  brandLabel,
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
  className?: string;
  links: readonly MarketingLink[];
  trailing?: ReactNode;
  /** Keep embedded previews in document flow; product headers stick by default. */
  sticky?: boolean;
}>) {
  const brandProperties = brandLabel === undefined ? {} : { "aria-label": brandLabel };
  return (
    <header className={classNames("hraness-marketing-header", className, sticky ? "default" : "static")} data-hraness-marketing="header">
      <div className={classNames("hraness-marketing-header__inner")}>
        <a className={classNames("hraness-marketing-header__brand")} href={brandHref} {...brandProperties}>
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
              : <code className={classNames("hraness-marketing-flow__code")}>{step.code}</code>}
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
  facts,
}: Readonly<{
  className?: string;
  facts: readonly MarketingFact[];
}>) {
  if (facts.length === 0) return null;
  return (
    <dl
      className={classNames("hraness-marketing-facts", className)}
      data-hraness-marketing="facts"
      style={{ "--hraness-marketing-fact-columns": String(facts.length) } as Record<string, string>}
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
  readonly boundary?: string;
  readonly className?: string;
  /** A concrete request a reader could make, shown under the summary. */
  readonly example?: string;
  readonly eyebrow: string;
  readonly facts?: readonly MarketingFact[];
  /** A product frame or other proof rendered full width below the copy. */
  readonly frame?: ReactNode;
  readonly heading: string;
  readonly headingId: string;
  readonly headingLevel?: MarketingHeadingLevel;
  readonly name: string;
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
  frame,
  heading,
  headingId,
  headingLevel = 1,
  name,
  proof,
  summary,
  tone = "paper",
}: Readonly<ProductHeroProps>) {
  return (
    <header
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-hero", className, tone === "accent" ? "accent" : "default")}
      data-align={align}
      data-hraness-marketing="hero"
      data-tone={tone}
    >
      <div className={classNames("hraness-marketing-hero__copy", undefined, align === "start" ? "start" : "default")}>
        <p className={classNames("hraness-marketing-hero__eyebrow", undefined, tone === "accent" ? "accent" : "default")}>{eyebrow}</p>
        <p className={classNames("hraness-marketing-hero__name")}>{name}</p>
        <Heading className={classNames("hraness-marketing-hero__heading")} id={headingId} level={headingLevel}>
          {heading}
        </Heading>
        <p className={classNames("hraness-marketing-hero__summary")}>{summary}</p>
        {example === undefined
          ? null
          : <p className={classNames("hraness-marketing-hero__example")}>{example}</p>}
        <MarketingActions actions={actions} className={classNames("hraness-marketing-hero__actions", undefined, align === "start" ? "start" : "default")} context="hero" tone={tone} />
        {boundary === undefined
          ? null
          : <p className={classNames("hraness-marketing-hero__boundary")}>{boundary}</p>}
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
      <MarketingFacts facts={facts} />
    </header>
  );
}

export interface MarketingPillar {
  readonly label: string;
  readonly summary: string;
}

export function MarketingPillars({
  ariaLabel,
  className,
  pillars,
}: Readonly<{
  ariaLabel: string;
  className?: string;
  pillars: readonly MarketingPillar[];
}>) {
  if (pillars.length === 0) return null;
  return (
    <dl
      aria-label={ariaLabel}
      className={classNames("hraness-marketing-pillars", className)}
      data-hraness-marketing="pillars"
      style={{ "--hraness-marketing-pillar-columns": String(pillars.length) } as Record<string, string>}
    >
      {pillars.map((pillar, index) => (
        <div className={classNames("hraness-marketing-pillars__item", undefined, index === 0 ? "default" : "later")} key={pillar.label}>
          <dt className={classNames("hraness-marketing-pillars__label")}>{pillar.label}</dt>
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
}: Readonly<{
  children: ReactNode;
  className?: string;
  eyebrow: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-install", className)}
      data-hraness-marketing="install"
      id={id}
    >
      <div className={classNames("hraness-marketing-install__heading-group")}>
        <p className={classNames("hraness-marketing-install__eyebrow")}>{eyebrow}</p>
        <Heading className={classNames("hraness-marketing-install__heading")} id={headingId} level={headingLevel}>
          {heading}
        </Heading>
      </div>
      <div className={classNames("hraness-marketing-install__commands")}>{children}</div>
    </section>
  );
}

export function MarketingProofFrame({
  caption,
  children,
  className,
  credit,
  title,
}: Readonly<{
  caption?: string;
  children: ReactNode;
  className?: string;
  credit?: string;
  /** Renders window chrome with this title above the content. */
  title?: string;
}>) {
  return (
    <figure
      className={classNames("hraness-marketing-proof-frame", className)}
      data-hraness-marketing="proof-frame"
    >
      {title === undefined
        ? null
        : (
          <div aria-hidden="true" className={classNames("hraness-marketing-proof-frame__chrome")}>
            <span className={classNames("hraness-marketing-proof-frame__lights")}>
              <span className={classNames("hraness-marketing-proof-frame__light")} />
              <span className={classNames("hraness-marketing-proof-frame__light")} />
              <span className={classNames("hraness-marketing-proof-frame__light")} />
            </span>
            <span className={classNames("hraness-marketing-proof-frame__title")}>{title}</span>
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

export function MarketingSection({
  children,
  className,
  heading,
  headingId,
  headingLevel = 2,
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
  id?: string;
  label: string;
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
        <p className={classNames("hraness-marketing-section__label")}>{label}</p>
        <Heading className={classNames("hraness-marketing-section__heading")} id={headingId} level={headingLevel}>
          {heading}
        </Heading>
        {summary === undefined
          ? null
          : <p className={classNames("hraness-marketing-section__summary")}>{summary}</p>}
      </div>
      <div className={classNames("hraness-marketing-section__body")}>{children}</div>
    </section>
  );
}

type MarketingCollectionPrefix = "interfaces" | "pricing" | "primitives" | "questions" | "quotes" | "trust";

interface MarketingCollectionHeaderProps {
  readonly heading: string;
  readonly headingId: string;
  readonly headingLevel: MarketingHeadingLevel;
  readonly label: string;
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
      <p className={classNames(`hraness-marketing-${prefix}__label`)}>{label}</p>
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
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  label,
  summary,
}: Readonly<{
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  items: readonly MarketingPrimitive[];
  label: string;
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
      <ol className={classNames("hraness-marketing-primitives__list")}>
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

export interface MarketingStat {
  readonly detail?: string;
  readonly label: string;
  readonly value: string;
}

export function MarketingStatStrip({
  ariaLabel,
  className,
  source,
  stats,
}: Readonly<{
  ariaLabel: string;
  className?: string;
  /** Where the numbers come from and when they were checked. */
  source?: ReactNode;
  stats: readonly MarketingStat[];
}>) {
  if (stats.length === 0) return null;
  return (
    <section
      aria-label={ariaLabel}
      className={classNames("hraness-marketing-stats", className)}
      data-hraness-marketing="stats"
    >
      <dl
        className={classNames("hraness-marketing-stats__list")}
        style={{ "--hraness-marketing-fact-columns": String(stats.length) } as Record<string, string>}
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
  readonly summary: string;
}

export function MarketingInterfaceGrid({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  interfaces,
  label,
  summary,
}: Readonly<{
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  interfaces: readonly MarketingInterface[];
  label: string;
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
      <div className={classNames("hraness-marketing-interface-grid")}>
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
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  label,
  summary,
}: Readonly<{
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  items: readonly MarketingTrustItem[];
  label: string;
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
      <dl className={classNames("hraness-marketing-trust-grid")}>
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
  label: string;
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
  label: string;
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
  label: string;
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
  links = [],
  portrait,
}: Readonly<{
  children: ReactNode;
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  label: string;
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
        <p className={classNames("hraness-marketing-maker__label")}>{label}</p>
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
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          )}
      </div>
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
      {eyebrow === undefined ? null : <p className={classNames("hraness-marketing-cta__eyebrow")}>{eyebrow}</p>}
      <Heading className={classNames("hraness-marketing-cta__heading")} id={headingId} level={headingLevel}>
        {heading}
      </Heading>
      {summary === undefined ? null : <p className={classNames("hraness-marketing-cta__summary")}>{summary}</p>}
      <MarketingActions actions={actions} className={classNames("hraness-marketing-cta__actions")} context="cta" tone={tone} />
      {footnote === undefined ? null : <p className={classNames("hraness-marketing-cta__footnote")}>{footnote}</p>}
    </section>
  );
}
