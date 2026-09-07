"use client";

import {
  Button,
  EmptyState,
  LinkButton,
  Skeleton,
  Spinner,
  cn,
  type ContentHeadingLevel,
} from "@hraness/ui";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useId, type ReactNode } from "react";

import { colors } from "../index.js";
import { PageCanvas } from "./surfaces.js";
import { routeStateStyles } from "./route-state.stylex.js";
import {
  defaultDesignTheme,
  DesignThemeProvider,
  type DesignTheme,
  ThemeColorSync,
  ThemeMenuButton,
} from "./theme.js";

export interface RouteErrorPageProps {
  /** Set false only for an already-visible, inert demonstration of this state. */
  readonly announce?: boolean;
  /** Disable only when the full-page composition is rendered as an inert preview. */
  readonly autoFocus?: boolean;
  readonly canvasAs?: "div" | "main";
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
  /** Adds a standalone header menu; product layouts should normally own it. */
  readonly showThemeToggle?: boolean;
  readonly titleAs?: ContentHeadingLevel;
}

export interface RouteNotFoundPageProps {
  readonly canvasAs?: "div" | "main";
  /** Adds a standalone header menu; product layouts should normally own it. */
  readonly showThemeToggle?: boolean;
  readonly titleAs?: ContentHeadingLevel;
}

export interface RouteLoadingPageProps {
  /** Set false only for an already-visible, inert demonstration of this state. */
  readonly announce?: boolean;
  readonly canvasAs?: "div" | "main";
}

export interface GlobalErrorDocumentProps extends RouteErrorPageProps {
  readonly bodyClassName?: string;
  /** Browser chrome color used whenever the resolved appearance is Dark. */
  readonly darkColor?: string;
  readonly diagnostics?: ReactNode;
  /** Browser chrome color used whenever the resolved appearance is Light. */
  readonly lightColor?: string;
  /** Defaults to the shared stored preference with a System first-visit choice. */
  readonly theme?: DesignTheme;
}

function RouteActions({ children }: Readonly<{ children: ReactNode }>) {
  const presentation = stylex.props(routeStateStyles.row);
  return (
    <div
      {...presentation}
      className={cn(
        "hraness-design-route-state__actions",
        presentation.className,
      )}
    >
      {children}
    </div>
  );
}

/** Shared root-segment 404 treatment for Next products. */
export function RouteNotFoundPage({
  canvasAs = "main",
  showThemeToggle = false,
  titleAs = "h1",
}: RouteNotFoundPageProps = {}) {
  const rootPresentation = stylex.props(routeStateStyles.root);
  const headerPresentation = stylex.props(routeStateStyles.header);
  const contentPresentation = stylex.props(routeStateStyles.content);

  return (
    <PageCanvas
      as={canvasAs}
      className={cn(
        "hraness-design-route-state",
        rootPresentation.className,
      )}
    >
      {showThemeToggle ? (
        <header
          {...headerPresentation}
          className={cn(
            "hraness-design-route-state__header",
            headerPresentation.className,
          )}
        >
          <ThemeMenuButton />
        </header>
      ) : null}
      <div
        {...contentPresentation}
        className={cn(
          "hraness-design-route-state__content",
          contentPresentation.className,
        )}
      >
        <EmptyState
          action={<LinkButton href="/" variant="primary">Return home</LinkButton>}
          description="The address may be out of date, or this page may have moved."
          icon={<span aria-hidden="true">404</span>}
          title="Page not found"
          titleAs={titleAs}
        />
      </div>
    </PageCanvas>
  );
}

/** Shared recoverable route-error treatment for Next products. */
export function RouteErrorPage({
  announce = true,
  autoFocus = true,
  canvasAs = "main",
  error,
  reset,
  showThemeToggle = false,
  titleAs = "h1",
}: RouteErrorPageProps) {
  const focusId = `${useId()}-route-error`;
  const rootPresentation = stylex.props(routeStateStyles.root);
  const headerPresentation = stylex.props(routeStateStyles.header);
  const contentPresentation = stylex.props(routeStateStyles.content);
  useEffect(() => {
    if (autoFocus) document.getElementById(focusId)?.focus();
  }, [autoFocus, error, focusId]);

  return (
    <PageCanvas
      aria-label="This view could not load"
      aria-live={announce ? "assertive" : undefined}
      as={canvasAs}
      className={cn(
        "hraness-design-route-state",
        rootPresentation.className,
      )}
      id={focusId}
      tabIndex={-1}
    >
      {showThemeToggle ? (
        <header
          {...headerPresentation}
          className={cn(
            "hraness-design-route-state__header",
            headerPresentation.className,
          )}
        >
          <ThemeMenuButton />
        </header>
      ) : null}
      <div
        {...contentPresentation}
        className={cn(
          "hraness-design-route-state__content",
          contentPresentation.className,
        )}
      >
        <EmptyState
          action={(
            <RouteActions>
              <Button onPress={reset} variant="primary">Try again</Button>
              <LinkButton href="/">Return home</LinkButton>
            </RouteActions>
          )}
          description="Retry this view, or return home and continue from there."
          icon={<span aria-hidden="true">!</span>}
          title="This view could not load"
          titleAs={titleAs}
        />
      </div>
    </PageCanvas>
  );
}

/** Shared root loading treatment for Next products. */
export function RouteLoadingPage({
  announce = true,
  canvasAs = "main",
}: RouteLoadingPageProps = {}) {
  const rootPresentation = stylex.props(routeStateStyles.root);
  const loadingPresentation = stylex.props(routeStateStyles.loading);
  const titlePresentation = stylex.props(routeStateStyles.row);
  const skeletonPresentation = stylex.props(routeStateStyles.skeletons);

  return (
    <PageCanvas
      aria-busy={announce ? "true" : undefined}
      as={canvasAs}
      className={cn(
        "hraness-design-route-state",
        rootPresentation.className,
      )}
    >
      <section
        {...loadingPresentation}
        className={cn(
          "hraness-design-route-state__loading",
          loadingPresentation.className,
        )}
        role={announce ? "status" : undefined}
      >
        <div
          {...titlePresentation}
          className={cn(
            "hraness-design-route-state__loading-title",
            titlePresentation.className,
          )}
        >
          <Spinner />
          <strong>Loading page</strong>
        </div>
        <div
          {...skeletonPresentation}
          aria-hidden="true"
          className={cn(
            "hraness-design-route-state__skeletons",
            skeletonPresentation.className,
          )}
        >
          <Skeleton height="1rem" isText width="88%" />
          <Skeleton height="1rem" isText width="64%" />
          <Skeleton height="8rem" width="100%" />
        </div>
      </section>
    </PageCanvas>
  );
}

/**
 * Last-resort Next boundary. It owns the document because global-error replaces
 * the root layout, including its normal appearance provider.
 */
export function GlobalErrorDocument({
  bodyClassName,
  darkColor = colors.dark.background,
  diagnostics,
  lightColor = colors.light.background,
  theme = defaultDesignTheme,
  ...props
}: GlobalErrorDocumentProps) {
  const content = (
    <>
      {diagnostics}
      <RouteErrorPage {...props} showThemeToggle={false} />
    </>
  );

  return (
    <html data-theme={theme === "system" ? "light" : theme} lang="en" suppressHydrationWarning>
      <head>
        <meta
          content={theme === "system" ? "light dark" : theme}
          name="color-scheme"
        />
        {theme === "system" ? (
          <>
            <meta
              content={lightColor}
              media="(prefers-color-scheme: light)"
              name="theme-color"
            />
            <meta
              content={darkColor}
              media="(prefers-color-scheme: dark)"
              name="theme-color"
            />
          </>
        ) : (
          <meta
            content={theme === "dark" ? darkColor : lightColor}
            name="theme-color"
          />
        )}
      </head>
      <body className={bodyClassName}>
        {theme === "system" ? (
          <DesignThemeProvider>
            <ThemeColorSync darkColor={darkColor} lightColor={lightColor} />
            {content}
          </DesignThemeProvider>
        ) : content}
      </body>
    </html>
  );
}
