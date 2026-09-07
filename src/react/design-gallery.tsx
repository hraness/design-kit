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
import { AuroraDotsBackground } from "./aurora-dots-background.js";
import { BarListChart, RangePlotChart } from "./charts.js";
import { ChatComposer, ChatMessage } from "./chat.js";
import { Fader } from "./fader.js";
import { FoilCardDeck, FoilCardSurface } from "./foil-card-surface.js";
import { JellySurface } from "./jelly-surface.js";
import { NavigationRail, RailItem, RailSection } from "./navigation-rail.js";
import { PlaybackTransport, type PlaybackTransportStatus } from "./playback-transport.js";
import { ProceduralBackdrop } from "./procedural-backdrop.js";
import { ProductionDataPreviewNotice } from "./production-data-preview-notice.js";
import {
  MarketingCallToAction,
  MarketingFlow,
  MarketingInstallPanel,
  MarketingInterfaceGrid,
  MarketingMaker,
  MarketingPage,
  MarketingPillars,
  MarketingPricing,
  MarketingPrimitives,
  MarketingProofFrame,
  MarketingQuestionList,
  MarketingQuoteGrid,
  MarketingSection,
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
  { id: "marketing", label: "Marketing" },
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
  "charts",
  "chat message and composer",
  "dither surface",
  "fader",
  "foil card surface",
  "layout surfaces",
  "Jelly presentation",
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
          shells, charts, effects, syntax, haptics, and optional Jelly paint.
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
                <p data-gallery-font="proportional">More shape, less noise.</p>
                <code data-gallery-font="mono">const role = "mono";</code>
              </div>
            </CardContent>
          </Card>
          <JellySurface className="design-gallery__jelly" interaction="press" tone="neutral">
            <Button variant="quiet">Semantic button with optional Jelly paint</Button>
          </JellySurface>
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
          <ProductHero
            actions={[
              { href: "#gallery-install", label: "Install Relay" },
              { href: "#shells", label: "See the workspace" },
            ]}
            boundary="Free for local use on macOS and Linux · version 1.2.3"
            className="design-gallery__marketing-hero"
            example="Ask your agent to run the nightly job and show you the receipt."
            eyebrow="A reference developer tool"
            facts={[
              { detail: "One exact source.", label: "Input", value: "Repository" },
              { detail: "One inspectable result.", label: "Output", value: "Receipt" },
              { detail: "Terminal and typed code.", label: "Interfaces", value: "CLI + SDK" },
            ]}
            factsColumns={3}
            frame={(
              <MarketingProofFrame
                caption="Receipt produced by the checked example."
                credit="Captured 5 September 2026"
                title="relay run job-01"
              >
                <pre className="design-gallery__marketing-command"><code>{'{"status":"complete","job":"job-01","durationMs":412}'}</code></pre>
              </MarketingProofFrame>
            )}
            heading="Move one job across every interface"
            headingId="design-gallery-marketing-title"
            headingLevel={3}
            name="Relay"
            summary="Relay runs the same job from a terminal, typed code, or a coding agent, and hands back one receipt you can read."
          />
          <MarketingPillars
            ariaLabel="Relay in three points"
            columns={3}
            pillars={[
              { label: "Fast", summary: "Runs locally with no service in the loop." },
              { label: "Legible", summary: "Every run leaves a receipt you can open." },
              { label: "Yours", summary: "Source files and credentials stay on your machine." },
            ]}
          />
          <MarketingInstallPanel
            eyebrow="Local release"
            heading="Install the verified tool."
            headingId="design-gallery-install-title"
            headingLevel={3}
            id="gallery-install"
          >
            <pre className="design-gallery__marketing-command"><code>bun add --global relay@1.2.3</code></pre>
            <MarketingFlow
              ariaLabel="First Relay job"
              steps={[
                { code: "relay init", detail: "Create one workspace.", label: "Initialize" },
                { code: "relay run job-01", detail: "Run the named job.", label: "Execute" },
                { code: "relay inspect job-01", detail: "Read the resulting receipt.", label: "Inspect" },
              ]}
            />
          </MarketingInstallPanel>
          <MarketingPrimitives
            heading="Small building blocks for serious workflows."
            headingId="design-gallery-primitives-title"
            headingLevel={3}
            items={[
              { label: "Jobs", summary: "A named unit of work with declared inputs and outputs." },
              { label: "Receipts", summary: "The durable record of one run, readable by people and agents." },
              { label: "Schedules", summary: "Run a job on a cadence without another daemon." },
            ]}
            label="Primitives"
            summary="Relay gives agents a few durable objects to compose around the work in front of them."
          />
          <MarketingSection heading="One durable object." headingId="gallery-marketing-section" headingLevel={3} label="Workflow" layout="split-reverse" summary="Interfaces share the same identity.">
            <p>Consumer-owned content can include <a href="#gallery-install">links</a> and <code>inline code</code>.</p>
          </MarketingSection>
          <MarketingInterfaceGrid heading="Choose your interface." headingId="gallery-marketing-interfaces" headingLevel={3} label="Interfaces" interfaces={[
            { label: "CLI", summary: "Run a named job.", example: <pre><code>relay run job-01</code></pre> },
            { label: "SDK", summary: "Use typed application code." },
          ]} />
          <MarketingTrustBoundary heading="Keep authority visible." headingId="gallery-marketing-trust" headingLevel={3} label="Boundary" items={[
            { label: "Local", detail: "Source files and credentials." },
            { label: "Shared", detail: "Only the chosen receipt." },
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
                summary: "Keep receipts in step across your machines.",
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
          <MarketingMaker
            heading="Built by a reference maker."
            headingId="design-gallery-maker-title"
            headingLevel={3}
            label="Built by"
            links={[{ href: "#marketing", label: "Personal site" }]}
          >
            <p>A short, plain-words bio: who made it, what they did before, where they are, and why this product exists.</p>
          </MarketingMaker>
          <MarketingCallToAction
            actions={[{ href: "#gallery-install", label: "Install Relay" }]}
            footnote="Free for local use on macOS and Linux."
            heading="Give every job the same room to run in."
            headingId="design-gallery-cta-title"
            headingLevel={3}
          />
        </MarketingPage>
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
            language="typescript"
          />
        </pre>
      </section>
    </Root>
  );
}
