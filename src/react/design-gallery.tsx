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
  ThemedSurface,
  ViewportFrame,
  WrappingRow,
} from "@hraness/ui";
import { Chart01Icon, CodeIcon, DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";

import { AnimatedRailStage } from "./animated-rail-stage.js";
import { AppShell } from "./app-shell.js";
import { AuroraDotsBackground } from "./aurora-dots-background.js";
import { BarListChart, RangePlotChart } from "./charts.js";
import { Fader } from "./fader.js";
import { JellySurface } from "./jelly-surface.js";
import { NavigationRail, RailItem, RailSection } from "./navigation-rail.js";
import { PlaybackTransport, type PlaybackTransportStatus } from "./playback-transport.js";
import { ProceduralBackdrop } from "./procedural-backdrop.js";
import { ProductionDataPreviewNotice } from "./production-data-preview-notice.js";
import { PageCanvas, TopBar } from "./surfaces.js";
import { SyntaxCode } from "./syntax-code.js";
import { type ConcreteDesignTheme, type DesignTheme, ThemeToggle } from "./theme.js";

export const designGallerySections = [
  { id: "foundation", label: "Foundation" },
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
  "application shells",
  "charts",
  "Jelly presentation",
  "plain site and publication grammar",
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

/** Product-neutral executable reference for the public composition layer. */
export function DesignSystemGallery({
  isNestedInMain = false,
}: Readonly<{ isNestedInMain?: boolean }>) {
  const [density, setDensity] = useState<"compact" | "default">("default");
  const [faderValue, setFaderValue] = useState(64);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackTransportStatus>("idle");
  const Root = isNestedInMain ? "div" : "main";

  return (
    <Root className="design-gallery" data-design-gallery="public">
      <header className="design-gallery__intro">
        <Badge tone="info">@hraness/design-kit</Badge>
        <h1>Presentation and composition reference</h1>
        <p>
          Portable controls come from @hraness/ui. This package adds application
          shells, charts, effects, syntax, haptics, and optional Jelly paint.
        </p>
        <WrappingRow>
          <ThemeToggle presentation="segmented" />
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

      <section className="design-gallery__section" id="shells">
        <h2>Application shells</h2>
        <ViewportFrame className="design-gallery__shell-preview">
          <AppShell
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
            topBar={<TopBar title="Reference workspace" />}
          >
            <PageCanvas as="div">
              <AnimatedRailStage stageKey={density}>
                <ThemedSurface as="section" tone="card">
                  <h3>{density === "compact" ? "Compact" : "Default"} composition</h3>
                  <p>The route body changes while persistent navigation remains in place.</p>
                </ThemedSurface>
              </AnimatedRailStage>
            </PageCanvas>
          </AppShell>
        </ViewportFrame>
      </section>

      <section className="design-gallery__section" id="data">
        <h2>Data and instrument compositions</h2>
        <div className="design-gallery__grid">
          <BarListChart aria-label="Example request volume" data={barData} />
          <RangePlotChart aria-label="Example regional ranges" data={rangeData} />
          <div className="design-gallery__instrument">
            <Fader
              aria-label="Example level"
              density="compact"
              label="Level"
              maxValue={100}
              minValue={0}
              onChange={setFaderValue}
              showLabel
              showOutput
              value={faderValue}
            />
            <Slider label="Balance" maxValue={100} minValue={0} value={50} />
            <PlaybackTransport
              aria-label="Preview transport"
              onPlay={() => setPlaybackStatus("playing")}
              onStop={() => setPlaybackStatus("idle")}
              status={playbackStatus}
            />
          </div>
        </div>
      </section>

      <section className="design-gallery__section" id="effects">
        <h2>Decorative effects</h2>
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
