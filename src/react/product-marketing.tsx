import type { ReactNode } from "react";

export type MarketingHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

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

function classNames(...values: readonly (string | undefined)[]): string {
  return values.filter((value): value is string => value !== undefined && value.length > 0).join(" ");
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
  switch (level) {
    case 1: return <h1 {...properties} />;
    case 2: return <h2 {...properties} />;
    case 3: return <h3 {...properties} />;
    case 4: return <h4 {...properties} />;
    case 5: return <h5 {...properties} />;
    case 6: return <h6 {...properties} />;
  }
  throw new TypeError("Marketing heading level must be between one and six.");
}

function childHeadingLevel(level: MarketingHeadingLevel): MarketingHeadingLevel {
  return Math.min(level + 1, 6) as MarketingHeadingLevel;
}

function MarketingActions({ actions }: Readonly<{ actions: readonly MarketingAction[] }>) {
  if (actions.length === 0) return null;
  return (
    <div className="hraness-marketing-hero__actions">
      {actions.map((action, index) => (
        <a
          className="hraness-marketing-action"
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
        <li className="hraness-marketing-flow__step" key={`${String(index)}-${step.label}`}>
          <span aria-hidden="true" className="hraness-marketing-flow__number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="hraness-marketing-flow__body">
            <strong className="hraness-marketing-flow__label">{step.label}</strong>
            {step.code === undefined
              ? null
              : <code className="hraness-marketing-flow__code">{step.code}</code>}
            {step.detail === undefined
              ? null
              : <p className="hraness-marketing-flow__detail">{step.detail}</p>}
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
    >
      {facts.map((fact) => (
        <div key={`${fact.label}-${fact.value}`}>
          <dt>{fact.label}</dt>
          <dd>
            <strong>{fact.value}</strong>
            {fact.detail === undefined ? null : <span>{fact.detail}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export interface ProductHeroProps {
  readonly actions?: readonly MarketingAction[];
  readonly boundary?: string;
  readonly className?: string;
  readonly eyebrow: string;
  readonly facts?: readonly MarketingFact[];
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
}

export function ProductHero({
  actions = [],
  boundary,
  className,
  eyebrow,
  facts = [],
  heading,
  headingId,
  headingLevel = 1,
  name,
  proof,
  summary,
}: Readonly<ProductHeroProps>) {
  return (
    <header
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-hero", className)}
      data-hraness-marketing="hero"
    >
      <div className="hraness-marketing-hero__copy">
        <p className="hraness-marketing-hero__eyebrow">{eyebrow}</p>
        <p className="hraness-marketing-hero__name">{name}</p>
        <Heading className="hraness-marketing-hero__heading" id={headingId} level={headingLevel}>
          {heading}
        </Heading>
        <p className="hraness-marketing-hero__summary">{summary}</p>
        <MarketingActions actions={actions} />
        {boundary === undefined
          ? null
          : <p className="hraness-marketing-hero__boundary">{boundary}</p>}
      </div>
      {proof === undefined
        ? null
        : (
          <aside className="hraness-marketing-proof" aria-labelledby={`${headingId}-proof`}>
            {proof.kicker === undefined
              ? null
              : <p className="hraness-marketing-proof__kicker">{proof.kicker}</p>}
            <Heading
              className="hraness-marketing-proof__heading"
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
      <div className="hraness-marketing-install__heading-group">
        <p className="hraness-marketing-install__eyebrow">{eyebrow}</p>
        <Heading className="hraness-marketing-install__heading" id={headingId} level={headingLevel}>
          {heading}
        </Heading>
      </div>
      <div className="hraness-marketing-install__commands">{children}</div>
    </section>
  );
}

export function MarketingProofFrame({
  caption,
  children,
  className,
  credit,
}: Readonly<{
  caption: string;
  children: ReactNode;
  className?: string;
  credit?: string;
}>) {
  return (
    <figure
      className={classNames("hraness-marketing-proof-frame", className)}
      data-hraness-marketing="proof-frame"
    >
      <div className="hraness-marketing-proof-frame__content">{children}</div>
      <figcaption className="hraness-marketing-proof-frame__caption">
        <span>{caption}</span>
        {credit === undefined ? null : <small>{credit}</small>}
      </figcaption>
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
}: Readonly<{
  children: ReactNode;
  className?: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  label: string;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-section", className)}
      data-hraness-marketing="section"
      id={id}
    >
      <div className="hraness-marketing-section__heading-group">
        <p className="hraness-marketing-section__label">{label}</p>
        <Heading className="hraness-marketing-section__heading" id={headingId} level={headingLevel}>
          {heading}
        </Heading>
      </div>
      <div className="hraness-marketing-section__body">{children}</div>
    </section>
  );
}

interface MarketingCollectionHeaderProps {
  readonly heading: string;
  readonly headingId: string;
  readonly headingLevel: MarketingHeadingLevel;
  readonly label: string;
  readonly prefix: "interfaces" | "questions" | "trust";
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
    <header className={`hraness-marketing-${prefix}__header`}>
      <p className={`hraness-marketing-${prefix}__label`}>{label}</p>
      <Heading className={`hraness-marketing-${prefix}__heading`} id={headingId} level={headingLevel}>
        {heading}
      </Heading>
      {summary === undefined ? null : <p>{summary}</p>}
    </header>
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
      <div className="hraness-marketing-interface-grid">
        {interfaces.map((entry) => (
          <article className="hraness-marketing-interface" key={entry.label}>
            <Heading
              className="hraness-marketing-interface__heading"
              level={childHeadingLevel(headingLevel)}
            >
              {entry.label}
            </Heading>
            <p>{entry.summary}</p>
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
      <dl className="hraness-marketing-trust-grid">
        {items.map((item) => (
          <div className="hraness-marketing-trust-item" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.detail}</dd>
          </div>
        ))}
      </dl>
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
      <div className="hraness-marketing-question-list">
        {questions.map((question) => (
          <details className="hraness-marketing-question" key={question.question}>
            <summary>{question.question}</summary>
            <div className="hraness-marketing-question__answer">{question.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function MarketingCallToAction({
  actions,
  className,
  eyebrow,
  heading,
  headingId,
  headingLevel = 2,
  id,
  summary,
}: Readonly<{
  actions: readonly MarketingAction[];
  className?: string;
  eyebrow: string;
  heading: string;
  headingId: string;
  headingLevel?: MarketingHeadingLevel;
  id?: string;
  summary?: string;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("hraness-marketing-cta", className)}
      data-hraness-marketing="cta"
      id={id}
    >
      <p className="hraness-marketing-cta__eyebrow">{eyebrow}</p>
      <Heading className="hraness-marketing-cta__heading" id={headingId} level={headingLevel}>
        {heading}
      </Heading>
      {summary === undefined ? null : <p className="hraness-marketing-cta__summary">{summary}</p>}
      <div className="hraness-marketing-cta__actions">
        {actions.map((action, index) => (
          <a
            className="hraness-marketing-action"
            data-emphasis={action.emphasis ?? (index === 0 ? "primary" : "secondary")}
            href={action.href}
            key={`${action.href}-${action.label}`}
          >
            {action.label}
          </a>
        ))}
      </div>
    </section>
  );
}
