import type {
  HTMLAttributes,
  ReactNode,
} from "react";
import { forwardRef } from "react";
import * as stylex from "@stylexjs/stylex";

import { ThemedSurface, cn, type ThemedSurfaceProps } from "@hraness/ui";

import {
  ditherSurfaceStyles,
  layoutSurfaceStyles,
} from "./surfaces.stylex.js";

export type DitherSurfaceDensity = "coarse" | "fine" | "medium";

export interface DitherSurfaceProps extends ThemedSurfaceProps {
  readonly density?: DitherSurfaceDensity;
}

const ditherSurfaceDensityStyles = {
  coarse: ditherSurfaceStyles.coarse,
  fine: ditherSurfaceStyles.fine,
  medium: undefined,
} as const satisfies Readonly<Record<DitherSurfaceDensity, unknown>>;

export function DitherSurface({
  className,
  density = "medium",
  xstyle,
  ...props
}: DitherSurfaceProps) {
  return (
    <ThemedSurface
      {...props}
      className={cn("hraness-design-dither-surface", className)}
      data-density={density}
      xstyle={[
        ditherSurfaceStyles.texture,
        // The public ThemedSurface seam intentionally types standard CSS
        // properties. StyleX still extracts this package-owned literal custom
        // property, so keep the narrow cast at the composition boundary.
        ditherSurfaceDensityStyles[density] as ThemedSurfaceProps["xstyle"],
        xstyle,
      ]}
    />
  );
}

export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  readonly actions?: ReactNode;
  readonly leading?: ReactNode;
  readonly position?: "static" | "sticky";
  readonly surface?: "glass" | "solid";
  readonly title?: ReactNode;
}

export function TopBar({
  actions,
  children,
  className,
  leading,
  position = "static",
  surface = "solid",
  title,
  ...props
}: TopBarProps) {
  const rootPresentation = stylex.props(
    layoutSurfaceStyles.surface,
    layoutSurfaceStyles.bar,
    layoutSurfaceStyles.topBar,
    position === "sticky"
      ? layoutSurfaceStyles.topBarSticky
      : layoutSurfaceStyles.topBarStatic,
    surface === "glass" && layoutSurfaceStyles.topBarGlass,
  );
  const leadingPresentation = stylex.props(layoutSurfaceStyles.barPart);
  const titlePresentation = stylex.props(layoutSurfaceStyles.topBarTitle);
  const contentPresentation = stylex.props(
    layoutSurfaceStyles.barPart,
    layoutSurfaceStyles.barContent,
  );
  const actionsPresentation = stylex.props(
    layoutSurfaceStyles.barPart,
    layoutSurfaceStyles.topBarActions,
  );

  return (
    <header
      {...rootPresentation}
      {...props}
      className={cn(
        "hraness-design-top-bar",
        rootPresentation.className,
        className,
      )}
      data-position={position}
      data-surface={surface}
    >
      <div
        {...leadingPresentation}
        className={cn(
          "hraness-design-top-bar__leading",
          leadingPresentation.className,
        )}
      >
        {leading}
        {title === undefined
          ? null
          : (
              <div
                {...titlePresentation}
                className={cn(
                  "hraness-design-top-bar__title",
                  titlePresentation.className,
                )}
              >
                {title}
              </div>
            )}
      </div>
      {children === undefined
        ? null
        : (
            <div
              {...contentPresentation}
              className={cn(
                "hraness-design-top-bar__content",
                contentPresentation.className,
              )}
            >
              {children}
            </div>
          )}
      {actions === undefined
        ? null
        : (
            <div
              {...actionsPresentation}
              className={cn(
                "hraness-design-top-bar__actions",
                actionsPresentation.className,
              )}
            >
              {actions}
            </div>
          )}
    </header>
  );
}

export interface BottomBarProps extends HTMLAttributes<HTMLElement> {
  readonly actions?: ReactNode;
  readonly leading?: ReactNode;
}

export function BottomBar({ actions, children, className, leading, ...props }: BottomBarProps) {
  const rootPresentation = stylex.props(
    layoutSurfaceStyles.surface,
    layoutSurfaceStyles.bar,
    layoutSurfaceStyles.bottomBar,
  );
  const leadingPresentation = stylex.props(layoutSurfaceStyles.barPart);
  const contentPresentation = stylex.props(
    layoutSurfaceStyles.barPart,
    layoutSurfaceStyles.barContent,
  );
  const actionsPresentation = stylex.props(layoutSurfaceStyles.barPart);

  return (
    <footer
      {...rootPresentation}
      {...props}
      className={cn(
        "hraness-design-bottom-bar",
        rootPresentation.className,
        className,
      )}
    >
      {leading === undefined
        ? null
        : (
            <div
              {...leadingPresentation}
              className={cn(
                "hraness-design-bottom-bar__leading",
                leadingPresentation.className,
              )}
            >
              {leading}
            </div>
          )}
      <div
        {...contentPresentation}
        className={cn(
          "hraness-design-bottom-bar__content",
          contentPresentation.className,
        )}
      >
        {children}
      </div>
      {actions === undefined
        ? null
        : (
            <div
              {...actionsPresentation}
              className={cn(
                "hraness-design-bottom-bar__actions",
                actionsPresentation.className,
              )}
            >
              {actions}
            </div>
          )}
    </footer>
  );
}

export interface PageCanvasProps extends HTMLAttributes<HTMLElement> {
  readonly as?: "div" | "main";
  readonly inset?: "content" | "none";
  readonly size?: "default" | "full" | "wide";
}

export function PageCanvas({
  as = "main",
  className,
  inset = "content",
  size = "default",
  ...props
}: PageCanvasProps) {
  const Element = as;
  const presentation = stylex.props(
    layoutSurfaceStyles.pageCanvas,
    inset === "content"
      ? layoutSurfaceStyles.pageContentInset
      : layoutSurfaceStyles.pageNoInset,
    size === "wide" && layoutSurfaceStyles.wideSize,
    size === "full" && layoutSurfaceStyles.fullSize,
  );

  return (
    <Element
      {...presentation}
      {...props}
      className={cn(
        "hraness-design-page-canvas",
        presentation.className,
        className,
      )}
      data-inset={inset}
      data-size={size}
    />
  );
}

export interface DockedFooterProps extends HTMLAttributes<HTMLElement> {
  readonly contentClassName?: string;
  readonly density?: "compact" | "default";
  readonly inset?: "content" | "none";
  readonly position?: "absolute" | "fixed" | "sticky";
  readonly size?: "default" | "full" | "wide";
  readonly surface?: "glass" | "solid";
}

export const DockedFooter = forwardRef<HTMLElement, DockedFooterProps>(function DockedFooter(
  {
    children,
    className,
    contentClassName,
    density = "default",
    inset = "content",
    position = "fixed",
    size = "default",
    surface = "solid",
    ...props
  },
  ref,
) {
  const rootPresentation = stylex.props(
    layoutSurfaceStyles.surface,
    layoutSurfaceStyles.dockedFooter,
    position === "absolute"
      ? layoutSurfaceStyles.dockedAbsolute
      : position === "sticky"
        ? layoutSurfaceStyles.dockedSticky
        : layoutSurfaceStyles.dockedFixed,
  );
  const contentPresentation = stylex.props(
    layoutSurfaceStyles.dockedContent,
    density === "compact"
      ? inset === "content"
        ? layoutSurfaceStyles.dockedContentCompactInset
        : layoutSurfaceStyles.dockedContentCompactNoInset
      : inset === "content"
        ? layoutSurfaceStyles.dockedContentDefaultInset
        : layoutSurfaceStyles.dockedContentDefaultNoInset,
    size === "wide" && layoutSurfaceStyles.wideSize,
    size === "full" && layoutSurfaceStyles.fullSize,
  );

  return (
    <footer
      {...rootPresentation}
      {...props}
      className={cn(
        "hraness-design-docked-footer",
        rootPresentation.className,
        className,
      )}
      data-position={position}
      data-surface={surface}
      ref={ref}
    >
      <div
        {...contentPresentation}
        className={cn(
          "hraness-design-docked-footer__content",
          contentPresentation.className,
          contentClassName,
        )}
        data-density={density}
        data-inset={inset}
        data-size={size}
      >
        {children}
      </div>
    </footer>
  );
});
