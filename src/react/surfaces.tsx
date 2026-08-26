import type {
  HTMLAttributes,
  ReactNode,
} from "react";
import { forwardRef } from "react";

import { ThemedSurface, cn, type ThemedSurfaceProps } from "@hraness/ui";

import { ditherSurfaceStyles } from "./surfaces.stylex.js";

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
  return (
    <header
      {...props}
      className={cn("hraness-design-top-bar", className)}
      data-position={position}
      data-surface={surface}
    >
      <div className="hraness-design-top-bar__leading">
        {leading}
        {title === undefined ? null : <div className="hraness-design-top-bar__title">{title}</div>}
      </div>
      {children === undefined ? null : <div className="hraness-design-top-bar__content">{children}</div>}
      {actions === undefined ? null : <div className="hraness-design-top-bar__actions">{actions}</div>}
    </header>
  );
}

export interface BottomBarProps extends HTMLAttributes<HTMLElement> {
  readonly actions?: ReactNode;
  readonly leading?: ReactNode;
}

export function BottomBar({ actions, children, className, leading, ...props }: BottomBarProps) {
  return (
    <footer {...props} className={cn("hraness-design-bottom-bar", className)}>
      {leading === undefined ? null : <div className="hraness-design-bottom-bar__leading">{leading}</div>}
      <div className="hraness-design-bottom-bar__content">{children}</div>
      {actions === undefined ? null : <div className="hraness-design-bottom-bar__actions">{actions}</div>}
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
  return (
    <Element
      {...props}
      className={cn("hraness-design-page-canvas", className)}
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
  return (
    <footer
      {...props}
      className={cn("hraness-design-docked-footer", className)}
      data-position={position}
      data-surface={surface}
      ref={ref}
    >
      <div
        className={cn("hraness-design-docked-footer__content", contentClassName)}
        data-density={density}
        data-inset={inset}
        data-size={size}
      >
        {children}
      </div>
    </footer>
  );
});
