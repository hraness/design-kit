"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  LinkButton,
  SegmentedControl,
  Slider,
  Tag,
  ViewportFrame,
  WrappingRow,
} from "@hraness/ui";
import { Chart01Icon, CodeIcon, DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";

import { AnimatedRailStage } from "./animated-rail-stage.js";
import { AppShell } from "./app-shell.js";
import {
  ArticleCallout,
  ArticleIndex,
  ArticleSources,
  MarketingArticle,
} from "./article.js";
import { AuroraDotsBackground } from "./aurora-dots-background.js";
import { BarListChart, RangePlotChart } from "./charts.js";
import { ChatComposer, ChatMessage } from "./chat.js";
import { Fader } from "./fader.js";
import { FoilCardDeck, FoilCardSurface } from "./foil-card-surface.js";
import { FoilMark } from "./foil-mark.js";
import { foilClassName } from "./foil.stylex.js";
import { LanternMaterialGallery } from "./lantern-material-gallery.js";
import { NavigationRail, RailItem, RailSection } from "./navigation-rail.js";
import { PlaybackTransport, type PlaybackTransportStatus } from "./playback-transport.js";
import { ProceduralBackdrop } from "./procedural-backdrop.js";
import { ProductionDataPreviewNotice } from "./production-data-preview-notice.js";
import {
  MarketingCallToAction,
  MarketingCardRow,
  MarketingFlow,
  MarketingField,
  MarketingInstallPanel,
  MarketingInterfaceGrid,
  MarketingMain,
  MarketingMaker,
  MarketingPage,
  MarketingPillars,
  MarketingPricing,
  MarketingPrimitives,
  MarketingProofFrame,
  MarketingQuestionList,
  MarketingRelated,
  MarketingQuoteGrid,
  MarketingSection,
  MarketingSectionLabel,
  MarketingSiteFooter,
  MarketingSiteHeader,
  MarketingStatStrip,
  MarketingTrustBoundary,
  ProductHero,
} from "./product-marketing.js";
import {
  BottomBar,
  DitherSurface,
  DockedFooter,
  PageCanvas,
  TopBar,
} from "./surfaces.js";
import { SyntaxCode } from "./syntax-code.js";
import { type ConcreteDesignTheme, type DesignTheme } from "./theme.js";

export const designGallerySections = [
  { id: "foundation", label: "Foundation" },
  { id: "paper-theme", label: "Paper theme" },
  { id: "lantern", label: "Lantern" },
  { id: "marketing", label: "Marketing" },
  { id: "articles", label: "Articles" },
  { id: "shells", label: "Shells" },
  { id: "data", label: "Data" },
  { id: "effects", label: "Effects" },
  { id: "syntax", label: "Syntax" },
] as const;

/** Representative semantic control kinds every gallery consumer must exercise. */
export const designGalleryTouchKinds = [
  "button",
  "link",
  "radio",
  "range",
] as const;

export const designGalleryRecipeCoverage = [
  "@hraness/ui primitives",
  "animated rail stage",
  "application shells",
  "article layer",
  "charts",
  "chat message and composer",
  "dither surface",
  "fader",
  "foil card surface",
  "layout surfaces",
  "Lantern material",
  "playback transport",
  "plain site and publication grammar",
  "product-marketing grammar",
  "Nebula Sans typography",
  "procedural effects",
  "production preview notice",
  "syntax highlighting",
] as const;

/** Resolves the gallery's System choice through the live OS preference. */
export function resolveGalleryTheme(
  theme: DesignTheme,
  prefersDark: boolean,
): ConcreteDesignTheme {
  return theme === "system" ? (prefersDark ? "dark" : "light") : theme;
}

const barData = [
  { id: "alpha", label: "Alpha", value: 72, detail: "72 requests" },
  { id: "beta", label: "Beta", value: 48, detail: "48 requests" },
  { id: "gamma", label: "Gamma", value: 31, detail: "31 requests" },
] as const;

const rangeData = [
  { id: "north", label: "North", minimum: 24, median: 51, maximum: 78 },
  { id: "south", label: "South", minimum: 38, median: 64, maximum: 82 },
] as const;

const foilDeckExamples = [
  { label: "Corner frame", ornament: "corners", preset: "prism" },
  { label: "Rail frame", ornament: "rails", preset: "etched" },
  { label: "Circuit frame", ornament: "circuit", preset: "fast" },
  { label: "Radial frame", ornament: "radial", preset: "aurora" },
  { label: "Facet frame", ornament: "facets", preset: "max" },
] as const;

/** Product-neutral executable reference for the public composition layer. */
export function DesignSystemGallery({
  isNestedInMain = false,
}: Readonly<{ isNestedInMain?: boolean }>) {
  const [density, setDensity] = useState<"compact" | "default">("default");
  const [chatDraft, setChatDraft] = useState("Review the presentation contract");
  const [chatSubmission, setChatSubmission] = useState("");
  const [faderValue, setFaderValue] = useState(64);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackTransportStatus>("idle");
  const Root = isNestedInMain ? "div" : "main";

  return (
    <Root
      className="design-gallery"
      data-design-gallery="public"
      data-design-gallery-nested={isNestedInMain ? "true" : "false"}
    >
      <header className="design-gallery__intro">
        <Badge tone="info">@hraness/design-kit</Badge>
        <h1>Presentation and composition reference</h1>
        <p>
          Portable controls come from @hraness/ui. This package adds application
          shells, charts, effects, syntax, and haptics.
        </p>
        <p>
          System follows your device on the first visit. Choosing Light, Dark,
          or System saves that preference.
        </p>
        <WrappingRow>
          <SegmentedControl
            aria-label="Gallery density"
            items={[
              { id: "compact", label: "Compact" },
              { id: "default", label: "Default" },
            ]}
            onChange={setDensity}
            size="compact"
            value={density}
          />
        </WrappingRow>
      </header>

      <section className="design-gallery__section" id="foundation">
        <h2>Foundation boundary</h2>
        <ProductionDataPreviewNotice surfaceOrigin="https://preview.example.test" />
        <div className="design-gallery__grid">
          <Card>
            <CardHeader>
              <CardTitle>Portable control</CardTitle>
              <CardDescription>Rendered directly by @hraness/ui.</CardDescription>
            </CardHeader>
            <CardContent>
              <WrappingRow>
                <Button variant="primary">Primary action</Button>
                <LinkButton href="#shells">Open shells</LinkButton>
                <Tag variant="outline">public core</Tag>
              </WrappingRow>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Typography roles</CardTitle>
              <CardDescription>Nebula Sans for proportional text; mono stays explicit.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="design-gallery__type-specimen">
                <p data-gallery-font="proportional">Nebula Sans sets both headings and body text.</p>
                <code data-gallery-font="mono">const role = "mono";</code>
              </div>
            </CardContent>
          </Card>
        </div>
        <div
          aria-label="Plain site link presentation"
          className="design-gallery__plain-theme plain-site plain-publication"
        >
          <header className="plain-header">
            <div className="plain-header__inner" data-layout="responsive-wrap">
              <a className="plain-wordmark" href="#foundation">project-name.example</a>
              <nav aria-label="Plain site example" className="plain-nav">
                <a href="#foundation">Articles</a>
                <a href="#shells">About</a>
              </nav>
            </div>
          </header>
          <div className="plain-page">
            <p className="design-gallery__plain-link-example">
              Ordinary <a href="#foundation">blue links</a> stay quiet until interaction.
            </p>
          </div>
        </div>
      </section>

      <section className="design-gallery__section" id="paper-theme">
        <h2>Paper theme</h2>
        <p>Import paper-theme.css to share warm neutral colors and compact typography without replacing layouts or saved appearance choices.</p>
        <div className="design-gallery__paper" data-hraness-theme="paper" data-theme="light">
          <MarketingSiteHeader brand="Light paper" brandHref="#paper-theme" links={[{ href: "#foundation", label: "Foundation" }]} sticky={false} />
          <TopBar surface="glass" title="Glass application header" data-gallery-glass-top-bar="" />
          <h3>Light paper</h3><p>Headers blur scrolling content and become opaque when reduced transparency is preferred.</p>
          <p><a className="design-gallery__paper-link" href="#foundation">Read about the foundation</a></p>
          <Button variant="primary">Create note</Button>
        </div>
        <div className="design-gallery__paper" data-hraness-theme="paper" data-theme="dark">
          <MarketingSiteHeader brand="Dark paper" brandHref="#paper-theme" links={[{ href: "#foundation", label: "Foundation" }]} sticky={false} />
          <TopBar surface="glass" title="Glass application header" data-gallery-glass-top-bar="" />
          <h3>Dark paper</h3><p>The same header treatment follows an explicit dark preference.</p>
          <p><a className="design-gallery__paper-link" href="#foundation">Read about the foundation</a></p>
          <Button variant="primary">Open notes</Button>
        </div>
      </section>

      <LanternMaterialGallery />

      <section className="design-gallery__section" id="marketing">
        <h2>Product-marketing grammar</h2>
        <MarketingPage className="design-gallery__marketing">
          <MarketingSiteHeader
            action={{ href: "#gallery-install", label: "Install Relay" }}
            brand="Relay"
            sticky={false}
            links={[
              { current: true, href: "#marketing", label: "How it works" },
              { href: "#gallery-install", label: "Install" },
              { href: "#shells", label: "Docs" },
            ]}
          />
          <MarketingMain>
          <ProductHero
            actions={[
              { href: "#gallery-install", label: "Install Relay" },
              { href: "#shells", label: "See the workspace" },
            ]}
            boundary="Free for local use on macOS and Linux · version 1.2.3"
            className="design-gallery__marketing-hero"
            example="Ask your agent to run the nightly job and show you the log."
            eyebrow="A reference developer tool"
            facts={[
              { detail: "Any Git checkout.", label: "Input", value: "Repository" },
              { detail: "Plain JSON you can read.", label: "Output", value: "Run log" },
              { detail: "Terminal or TypeScript.", label: "Interfaces", value: "CLI + SDK" },
            ]}
            factsColumns={3}
            frame={(
              <MarketingProofFrame
                caption="The log written by the example job."
                credit="Captured 5 September 2026"
                title="relay run job-01"
              >
                <pre className="design-gallery__marketing-command"><SyntaxCode code={'{"status":"complete","job":"job-01","durationMs":412}'} styles="classes" /></pre>
              </MarketingProofFrame>
            )}
            heading="Run a job from your terminal, your code, or your agent"
            headingId="design-gallery-marketing-title"
            headingLevel={3}
            name="Relay"
            notice={<p data-gallery-marketing-slot="notice">This example release runs locally.</p>}
            summary="Relay runs the same job wherever you start it and writes a log you can read afterward: inputs, outputs, and how long it took."
          />
          <MarketingPillars
            ariaLabel="Relay in three points"
            columns={3}
            pillars={[
              { label: "No hosted service", summary: "Jobs run on your machine and never wait on a server." },
              { label: "A log for every run", summary: "Open it to see what went in, what came out, and when." },
              { label: "Your files stay put", summary: "Source files and credentials never leave your machine." },
            ]}
          />
          <MarketingInstallPanel
            eyebrow="Local release"
            heading="Install Relay and run your first job."
            headingId="design-gallery-install-title"
            headingLevel={3}
            id="gallery-install"
            note={<p data-gallery-marketing-slot="note">Requires Bun 1.3.14.</p>}
          >
            <pre className="design-gallery__marketing-command"><SyntaxCode code="bun add --global relay@1.2.3" styles="classes" /></pre>
            <MarketingFlow
              ariaLabel="First Relay job"
              steps={[
                { code: "relay init", detail: "Create a workspace.", label: "Initialize" },
                { code: "relay run job-01", detail: "Run a job by name.", label: "Run" },
                { code: "relay inspect job-01", detail: "Read its log.", label: "Inspect" },
              ]}
            />
          </MarketingInstallPanel>
          <MarketingPrimitives
            heading="Three objects cover most work."
            headingId="design-gallery-primitives-title"
            headingLevel={3}
            items={[
              { label: "Jobs", summary: "A named task with declared inputs and outputs." },
              { label: "Logs", summary: "The record of one run, readable by people and agents." },
              { label: "Schedules", summary: "Run a job on a schedule without a separate daemon." },
            ]}
            label="Primitives"
            summary="People and agents use the same three objects, so a job you start by hand is one an agent can rerun."
          />
          <MarketingSection heading="A job keeps its name everywhere." headingId="gallery-marketing-section" headingLevel={3} label="Workflow" layout="split-reverse" summary="Start it from the CLI and check on it from code; both see the same job.">
            <MarketingSectionLabel size="body">Reference</MarketingSectionLabel>
            <p>Consumer-owned content can include <a href="#gallery-install">links</a> and <code>inline code</code>.</p>
          </MarketingSection>
          <MarketingInterfaceGrid heading="Choose your interface." headingId="gallery-marketing-interfaces" headingLevel={3} label="Interfaces" interfaces={[
            { label: "CLI", summary: "Run a named job.", example: <pre><code>relay run job-01</code></pre> },
            { label: "SDK", summary: "Use typed application code." },
          ]} />
          <MarketingCardRow ariaLabel="Release radar" cards={[
            { art: <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" /></svg>, href: "#marketing", title: "Grok 4.7", meta: "First observed 21 September 2026." },
            { art: <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>, href: "#gallery-install", title: "GLM 5.3 Flash", meta: "First observed 26 August 2026. Early DeepSWE coverage on OpenRouter." },
          ]} />
          <MarketingTrustBoundary heading="What leaves your machine." headingId="gallery-marketing-trust" headingLevel={3} label="Boundary" items={[
            { label: "Stays local", detail: "Source files and credentials." },
            { label: "Shared", detail: "Only the logs you choose to sync." },
          ]} />
          <MarketingStatStrip
            ariaLabel="Relay usage"
            columns={3}
            source="Counted from the public example repository on 5 September 2026."
            stats={[
              { label: "Example jobs", value: "12" },
              { label: "Interfaces", detail: "CLI, SDK, Agent Skill", value: "3" },
              { label: "Accounts required", value: "0" },
            ]}
          />
          <MarketingQuoteGrid
            heading="From the people building with it."
            headingId="design-gallery-quotes-title"
            headingLevel={3}
            label="Quotes"
            quotes={[
              { name: "A. Example", quote: "A placeholder quote for the gallery only. Product sites render real, attributed quotes or none.", role: "@example" },
            ]}
          />
          <MarketingPricing
            heading="Free for local use."
            headingId="design-gallery-pricing-title"
            headingLevel={3}
            label="Pricing"
            plans={[
              {
                action: { href: "#gallery-install", label: "Install Relay" },
                emphasis: "primary",
                features: ["Every feature", "Unlimited local jobs", "All future updates"],
                name: "Local",
                period: "forever",
                price: "$0",
                summary: "Full-featured, with no trial or expiration.",
              },
              {
                action: { href: "#shells", label: "Read about sync" },
                features: ["Everything in Local", "Encrypted sync", "Priority email support"],
                name: "Sync",
                note: "Cancel any time.",
                period: "per year",
                price: "$49",
                summary: "Keep logs in step across your machines.",
              },
            ]}
          />
          <MarketingQuestionList
            heading="Questions before installing."
            headingId="design-gallery-questions-title"
            headingLevel={3}
            label="Questions"
            questions={[
              { answer: <p>No. The local workflow works without one.</p>, question: "Does it require an account?" },
              { answer: <p>Nothing leaves your machine unless you turn on sync.</p>, question: "Does it phone home?" },
            ]}
          />
          <MarketingRelated
            groups={[
              {
                heading: "Sibling tools",
                headingId: "design-gallery-related-tools",
                items: [
                  {
                    href: "#gallery-install",
                    name: "Ledger",
                    relationship: "Ledger keeps every log Relay writes, so old runs stay searchable.",
                    role: "Long-term storage for run logs",
                  },
                  {
                    href: "#marketing",
                    name: "Index",
                    relationship: "Index searches the logs Relay and Ledger keep.",
                    role: "A local search index",
                  },
                ],
              },
              {
                heading: "Shared infrastructure",
                headingId: "design-gallery-related-infra",
                items: [
                  {
                    href: "#marketing",
                    name: "Relay",
                    relationship: "Every other tool in the family starts its jobs through Relay.",
                    role: "The shared job runner",
                  },
                ],
                summary: "The runner the other tools depend on.",
              },
            ]}
            heading="Related tools."
            headingId="design-gallery-related-title"
            headingLevel={3}
            label="Related"
            summary="Each is a separate release. Its card says how it works with Relay."
          />
          <MarketingMaker
            heading="Who builds Relay"
            headingId="design-gallery-maker-title"
            headingLevel={3}
            label="Built by"
            linkClassName="design-gallery__maker-link"
            links={[{ href: "#marketing", label: "Personal site" }]}
          >
            <p>A short, plain-words bio: who made it, what they did before, where they are, and why this product exists.</p>
          </MarketingMaker>
          <MarketingCallToAction
            actions={[{ href: "#gallery-install", label: "Install Relay" }]}
            footnote="Free for local use on macOS and Linux."
            heading="Start with one job."
            headingId="design-gallery-cta-title"
            headingLevel={3}
          />
          <div className="design-gallery__foil-note">
            <p>
              Metallic wordmarks and exact-shape marks share a restrained rainbow reflection. Wordmarks use{" "}
              <code>.hraness-foil-text</code>, primary calls to action use <code>.hraness-foil</code>,
              and <code>attachFoil</code> eases the pointer inputs on <code>data-foil</code> targets.
            </p>
            <p className="design-gallery__foil-row">
              <a className={foilClassName("text", "design-gallery__foil-wordmark")} data-foil="" href="#marketing"><FoilMark src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z'/%3E%3C/svg%3E" /> Relay</a>
              <a className={foilClassName("surface", "design-gallery__foil-action")} data-foil="" href="#gallery-install">Install Relay</a>
            </p>
          </div>
          </MarketingMain>
        </MarketingPage>
        <MarketingPage preset="editorial" className="design-gallery__marketing-preset">
          <MarketingField>
            <ProductHero name="Relay" heading="Run a job from your terminal, your code, or your agent" headingId="gallery-editorial-title" headingLevel={3}
              summary="The editorial preset sets a serif display heading on a textured field."
              actions={[{ href: "#gallery-minimal-title", label: "See the compact preset" }]} />
          </MarketingField>
        </MarketingPage>
        <MarketingPage preset="minimal" className="design-gallery__marketing-preset">
          <MarketingSiteHeader brand="Relay" brandHref="#marketing" links={[]} sticky={false} />
          <ProductHero name="Relay" heading="A quieter public page." headingId="gallery-minimal-title" headingLevel={3}
            summary="The same shared system, with compact sans headings and a plain surface." />
          <MarketingSiteFooter
            brand={<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="currentColor" /></svg>}
            brandHref="#marketing"
            brandLabel="Relay home"
            links={[{ href: "#marketing", label: "Marketing" }]}
            name="Relay"
          />
        </MarketingPage>
      </section>

      <section className="design-gallery__section" id="articles">
        <h2>Article layer</h2>
        <MarketingArticle
          after={(
            <ArticleSources
              headingId="gallery-article-sources"
              sources={[
                { checkedOn: "2026-09-20", href: "#articles", publisher: "Relay", title: "Relay 2.4 release notes" },
              ]}
            />
          )}
          author={{ kind: "organization", name: "Relay" }}
          dek="Relay replays a failed webhook from the stored request body, so the retry sends the same bytes the provider signed."
          eyebrow="Technique"
          heading="Replaying webhooks without breaking signatures"
          headingId="gallery-article-title"
          provenance={{
            drafting: "ai-from-source",
            review: { reviewer: "an independent AI editorial review", reviewerType: "ai" },
          }}
          published="2026-09-10"
          toc={[
            { href: "#gallery-article-problem", label: "The problem" },
            { href: "#gallery-article-approach", label: "The approach" },
          ]}
          updated="2026-09-20"
        >
          <h2 id="gallery-article-problem">The problem</h2>
          <p>
            A provider signs the exact request body. Parsing the JSON and serializing it again changes
            whitespace and key order, and the signature check then fails on every retry.
          </p>
          <ArticleCallout label="Limit" tone="limit">
            This applies to providers that sign the raw body. Header-only schemes need no stored copy.
          </ArticleCallout>
          <h2 id="gallery-article-approach">The approach</h2>
          <p>Store the body as bytes next to the parsed event, and send those bytes on replay.</p>
          <pre><code>{"await replay(event.id, { body: stored.raw });"}</code></pre>
          <figure>
            <table>
              <thead>
                <tr><th scope="col">Step</th><th scope="col">Stored</th><th scope="col">Sent on replay</th></tr>
              </thead>
              <tbody>
                <tr><td>Receive</td><td>Raw body and headers</td><td>Nothing</td></tr>
                <tr><td>Retry</td><td>Attempt count</td><td>The stored raw body</td></tr>
              </tbody>
            </table>
            <figcaption>What Relay keeps for each delivery, and what a replay sends.</figcaption>
          </figure>
        </MarketingArticle>
        <ArticleIndex
          heading="Recent writing"
          headingId="gallery-article-index"
          headingLevel={3}
          items={[
            {
              dek: "Relay replays a failed webhook from the stored request body.",
              eyebrow: "Technique",
              href: "#gallery-article-title",
              published: "2026-09-10",
              title: "Replaying webhooks without breaking signatures",
              updated: "2026-09-20",
            },
            {
              dek: "Relay 2.4 adds per-endpoint retry limits.",
              eyebrow: "Release",
              href: "#articles",
              published: "2026-09-02",
              title: "Introducing Relay 2.4",
            },
          ]}
        />
      </section>

      <section className="design-gallery__section" id="shells">
        <h2>Application shells</h2>
        <ViewportFrame className="design-gallery__shell-preview">
          <AppShell
            bottomBar={(
              <BottomBar
                actions={<span>Synced</span>}
                data-gallery-layout-bottom-bar=""
                leading={<span>Ready</span>}
              >
                Reference footer
              </BottomBar>
            )}
            navigationKey="gallery"
            rail={(
              <NavigationRail>
                <RailSection title="Workspace">
                  <RailItem href="#foundation" icon={<Icon icon={DashboardSquare01Icon} />} isActive label="Overview" />
                  <RailItem href="#data" icon={<Icon icon={Chart01Icon} />} label="Data" />
                  <RailItem href="#syntax" icon={<Icon icon={CodeIcon} />} label="Syntax" />
                </RailSection>
              </NavigationRail>
            )}
            topBar={(
              <TopBar
                data-gallery-layout-top-bar=""
                title="Reference workspace"
              />
            )}
          >
            <PageCanvas as="div" data-gallery-layout-page-canvas="">
              <AnimatedRailStage
                className="design-gallery__animated-rail-stage"
                stageKey={density}
              >
                <DitherSurface
                  as="section"
                  data-gallery-dither=""
                  density={density === "compact" ? "fine" : "medium"}
                  tone="card"
                >
                  <h3>{density === "compact" ? "Compact" : "Default"} composition</h3>
                  <p>The route body changes while persistent navigation remains in place.</p>
                </DitherSurface>
              </AnimatedRailStage>
            </PageCanvas>
          </AppShell>
        </ViewportFrame>
        <div
          className="design-gallery__docked-footer-preview"
          data-gallery-layout-docked-frame=""
        >
          <p>Docked commands remain inside their positioning owner.</p>
          <DockedFooter
            data-gallery-layout-docked-footer=""
            density="compact"
            position="absolute"
          >
            Reference commands
          </DockedFooter>
        </div>
      </section>

      <section className="design-gallery__section" id="data">
        <h2>Data and instrument compositions</h2>
        <div className="design-gallery__grid">
          <BarListChart aria-label="Example request volume" data={barData} />
          <RangePlotChart aria-label="Example regional ranges" data={rangeData} />
          <div className="design-gallery__instrument">
            <Fader
              aria-label="Example level"
              className="design-gallery__vertical-fader"
              data-gallery-fader="vertical"
              density="default"
              label="Level"
              labelAccessory={<span data-gallery-fader-accessory="">dB</span>}
              maxValue={100}
              minValue={0}
              onChange={setFaderValue}
              showLabel
              showOutput
              value={faderValue}
            />
            <Fader
              aria-label="Example horizontal level"
              className="design-gallery__horizontal-fader"
              data-gallery-fader="horizontal"
              density="compact"
              label="Horizontal level"
              maxValue={100}
              minValue={0}
              onChange={setFaderValue}
              orientation="horizontal"
              showLabel
              showOutput
              value={faderValue}
            />
            <Slider label="Balance" maxValue={100} minValue={0} value={50} />
            <PlaybackTransport
              aria-label="Preview transport"
              buttonAriaKeyShortcuts="Space"
              buttonId="design-gallery-playback-command"
              className="design-gallery__playback-transport"
              onPlay={() => setPlaybackStatus("playing")}
              onStop={() => setPlaybackStatus("idle")}
              status={playbackStatus}
            />
          </div>
        </div>
        <div
          className="design-gallery__chat"
          data-gallery-chat=""
          data-gallery-chat-submission={chatSubmission}
        >
          <ChatMessage
            actions={<Button variant="quiet">Copy response</Button>}
            avatar={<span aria-hidden="true" className="design-gallery__chat-avatar">AI</span>}
            className="design-gallery__chat-message"
            meta="Now"
            name="Assistant"
            role="assistant"
          >
            <p>A complete message keeps its ordinary article and slot semantics.</p>
          </ChatMessage>
          <ChatMessage role="user">
            <p>Responsive composition belongs to the extracted package recipe.</p>
          </ChatMessage>
          <ChatComposer
            action="/gallery-chat-submit"
            aria-label="Gallery message composer"
            className="design-gallery__chat-composer"
            onSubmit={() => {
              setChatSubmission(chatDraft);
              setChatDraft("");
            }}
            onValueChange={setChatDraft}
            placeholder="Write a message"
            sendLabel="Send message"
            value={chatDraft}
          />
        </div>
      </section>

      <section className="design-gallery__section" id="effects">
        <h2>Decorative effects</h2>
        <FoilCardDeck
          aria-label="Delegated foil ornament examples"
          className="design-gallery__foil-deck"
        >
          {foilDeckExamples.map((example) => (
            <FoilCardSurface
              className="design-gallery__foil-example"
              intensity="standard"
              key={example.ornament}
              ornament={example.ornament}
              preset={example.preset}
              renderMode="interactive"
              seed={`public-gallery-foil-${example.ornament}`}
            >
              <article className="design-gallery__foil-card">
                <Tag variant="outline">{example.label}</Tag>
                <div>
                  <h3>Semantic card content</h3>
                  <p>One deck controller decorates ordinary articles.</p>
                </div>
              </article>
            </FoilCardSurface>
          ))}
        </FoilCardDeck>
        <div className="design-gallery__effect">
          <AuroraDotsBackground />
          <ProceduralBackdrop seed="public-gallery" variant="composite" />
          <div className="design-gallery__effect-copy">
            <h3>Semantic content stays ordinary DOM</h3>
            <p>Decorative paint is pointer-transparent and removable in forced colors.</p>
          </div>
        </div>
      </section>

      <section className="design-gallery__section" id="syntax">
        <h2>Server syntax</h2>
        <pre className="design-gallery__syntax">
          <SyntaxCode
            code={'import { AppShell } from "@hraness/design-kit/react";\n\nexport const shell = <AppShell rail={null}>Content</AppShell>;'}
            styles="classes"
          />
        </pre>
      </section>
    </Root>
  );
}
