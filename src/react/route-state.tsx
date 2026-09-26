"use client";

import {
  Skeleton,
  Spinner,
  cn,
  type ContentHeadingLevel,
} from "@hraness/ui";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { attachStatusPage } from "../browser/status-page.js";
import { colors } from "../index.js";
import {
  STATUS_PAGE_AGENT_PREFIX,
  STATUS_PAGE_BACK_LABEL,
  STATUS_PAGE_HINT_PREFIX,
  STATUS_PAGE_NEXT_HEADING_ID,
  resolveStatusPage,
  statusPageRoutesAttribute,
  type StatusPageContent,
} from "../status-page.js";
import { PageCanvas } from "./surfaces.js";
import { routeStateStyles } from "./route-state.stylex.js";
import {
  defaultDesignTheme,
  DesignThemeProvider,
  type DesignTheme,
  ThemeColorSync,
  ThemeMenuButton,
} from "./theme.js";

type StatusHeadingLevel = Exclude<ContentHeadingLevel, "h6">;

export interface StatusPageProps extends StatusPageContent {
  readonly canvasAs?: "div" | "main";
  /** Adds a standalone header menu; product layouts should normally own it. */
  readonly showThemeToggle?: boolean;
  readonly titleAs?: StatusHeadingLevel;
  /** Error pages only: renders Try again as the primary action. */
  readonly onRetry?: () => void;
  /** Error pages only: moves focus to the page and announces it. */
  readonly announce?: boolean;
  readonly autoFocus?: boolean;
}

const lowerHeading: Readonly<Record<StatusHeadingLevel, ContentHeadingLevel>> = {
  h1: "h2", h2: "h3", h3: "h4", h4: "h5", h5: "h6",
};

/**
 * Shared full-page status composition: the 404 page and recoverable errors.
 * Markup matches `renderStatusPageHtml`, styled by `status-page.css`; the
 * browser enhancement adds the dot field, the closest-page hint, and Back.
 */
export function StatusPage({
  announce = true,
  autoFocus = true,
  canvasAs = "main",
  onRetry,
  showThemeToggle = false,
  titleAs = "h1",
  ...content
}: StatusPageProps) {
  const page = resolveStatusPage(content);
  const rootRef = useRef<HTMLElement>(null);
  const focusId = `${useId()}-status`;
  const error = page.kind === "error";
  const notFound = page.kind === "not-found";
  const routes = notFound ? statusPageRoutesAttribute(page.routes) : undefined;
  const Root = canvasAs;
  const Title = titleAs;
  const NextHeading = lowerHeading[titleAs];
  const headerPresentation = stylex.props(routeStateStyles.header);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return attachStatusPage(root);
  }, [routes]);
  useEffect(() => {
    if (error && autoFocus) rootRef.current?.focus();
  }, [autoFocus, error]);

  return (
    <Root
      aria-label={error ? page.title : undefined}
      aria-live={error && announce ? "assertive" : undefined}
      className="hraness-status-page"
      data-hraness-status-routes={routes}
      data-kind={page.kind}
      id={error ? focusId : undefined}
      ref={rootRef as never}
      tabIndex={error ? -1 : undefined}
    >
      {showThemeToggle ? (
        <header
          {...headerPresentation}
          className={cn("hraness-design-route-state__header", headerPresentation.className)}
        >
          <ThemeMenuButton />
        </header>
      ) : null}
      <div className="hraness-status-page__inner">
        <div aria-hidden="true" className="hraness-status-page__code">
          <span className="hraness-status-page__glyph">{page.glyph}</span>
          <canvas className="hraness-status-page__field" />
        </div>
        <Title className="hraness-status-page__title">{page.title}</Title>
        <p className="hraness-status-page__summary">{page.summary}</p>
        {notFound ? (
          <p className="hraness-status-page__hint" hidden>
            {STATUS_PAGE_HINT_PREFIX} <a className="hraness-status-page__hint-link" href="/" />?
          </p>
        ) : null}
        <div className="hraness-status-page__actions">
          {onRetry ? (
            <>
              <button
                className="hraness-status-page__action hraness-foil"
                data-emphasis="primary"
                data-foil=""
                onClick={onRetry}
                type="button"
              >
                Try again
              </button>
              <a className="hraness-status-page__action" href={page.primaryAction.href}>
                {page.primaryAction.label}
              </a>
            </>
          ) : (
            <a
              className="hraness-status-page__action hraness-foil"
              data-emphasis="primary"
              data-foil=""
              href={page.primaryAction.href}
            >
              {page.primaryAction.label}
            </a>
          )}
          <a className="hraness-status-page__back" hidden href="/">{STATUS_PAGE_BACK_LABEL}</a>
        </div>
        {page.next.length === 0 ? null : (
          <nav aria-labelledby={STATUS_PAGE_NEXT_HEADING_ID} className="hraness-status-page__next">
            <NextHeading className="hraness-status-page__next-heading" id={STATUS_PAGE_NEXT_HEADING_ID}>
              {page.nextHeading}
            </NextHeading>
            <ul className="hraness-status-page__next-list">
              {page.next.map((link, index) => (
                <li key={`${String(index)}:${link.href}`}>
                  <a className="hraness-status-page__next-link" href={link.href}>
                    <span className="hraness-status-page__next-label">{link.label}</span>
                    {link.description === undefined ? null : (
                      <span className="hraness-status-page__next-description">{link.description}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {page.agentIndexHref === undefined ? null : (
          <p className="hraness-status-page__agent">
            {STATUS_PAGE_AGENT_PREFIX} <a href={page.agentIndexHref}>{page.agentIndexHref}</a>
          </p>
        )}
      </div>
    </Root>
  );
}

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
  readonly titleAs?: StatusHeadingLevel;
  /** Product name for the home action ("Go to Sponge"). */
  readonly siteName?: string;
  readonly homeHref?: string;
}

export type RouteNotFoundPageProps = Omit<StatusPageProps, "kind" | "onRetry" | "announce" | "autoFocus">;

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

/** Shared root-segment 404 treatment for Next products. */
export function RouteNotFoundPage(props: RouteNotFoundPageProps = {}) {
  return <StatusPage {...props} kind="not-found" />;
}

/** Shared recoverable route-error treatment for Next products. */
export function RouteErrorPage({
  announce = true,
  autoFocus = true,
  canvasAs = "main",
  error,
  homeHref = "/",
  reset,
  showThemeToggle = false,
  siteName,
  titleAs = "h1",
}: RouteErrorPageProps) {
  return (
    <StatusPage
      announce={announce}
      autoFocus={autoFocus}
      canvasAs={canvasAs}
      key={error.digest ?? error.message}
      kind="error"
      onRetry={reset}
      primaryAction={{ href: homeHref, label: siteName ? `Go to ${siteName}` : "Return home" }}
      showThemeToggle={showThemeToggle}
      titleAs={titleAs}
    />
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
