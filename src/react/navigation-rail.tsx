"use client";

import {
  Link,
  cn,
  type ContentHeadingLevel,
  type LinkProps,
} from "@hraness/ui";
import * as stylex from "@stylexjs/stylex";
import type { HTMLAttributes, ReactNode } from "react";

import { navigationRailStyles } from "./navigation-rail.stylex.js";

export interface NavigationRailProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  readonly "aria-label"?: string;
  readonly footer?: ReactNode;
  readonly header?: ReactNode;
}

export function NavigationRail({
  "aria-label": ariaLabel = "Primary navigation",
  children,
  className,
  footer,
  header,
  ...props
}: NavigationRailProps) {
  const rootPresentation = stylex.props(navigationRailStyles.rail);
  const edgePresentation = stylex.props(navigationRailStyles.railEdge);
  const navigationPresentation = stylex.props(navigationRailStyles.navigation);

  return (
    <aside
      {...rootPresentation}
      {...props}
      aria-label={ariaLabel}
      className={cn(
        "hraness-design-navigation-rail",
        rootPresentation.className,
        className,
      )}
    >
      {header === undefined
        ? null
        : (
            <header
              {...edgePresentation}
              className={cn(
                "hraness-design-navigation-rail__header",
                edgePresentation.className,
              )}
            >
              {header}
            </header>
          )}
      <nav
        {...navigationPresentation}
        aria-label={ariaLabel}
        className={cn(
          "hraness-design-navigation-rail__navigation",
          navigationPresentation.className,
        )}
      >
        {children}
      </nav>
      {footer === undefined
        ? null
        : (
            <footer
              {...edgePresentation}
              className={cn(
                "hraness-design-navigation-rail__footer",
                edgePresentation.className,
              )}
            >
              {footer}
            </footer>
          )}
    </aside>
  );
}

export interface RailSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  readonly title?: ReactNode;
  readonly titleAs?: ContentHeadingLevel;
}

export function RailSection({
  children,
  className,
  title,
  titleAs = "h2",
  ...props
}: RailSectionProps) {
  const Heading = titleAs;
  const rootPresentation = stylex.props(navigationRailStyles.section);
  const titlePresentation = stylex.props(navigationRailStyles.sectionTitle);
  const itemsPresentation = stylex.props(navigationRailStyles.sectionItems);

  return (
    <section
      {...rootPresentation}
      {...props}
      className={cn(
        "hraness-design-rail-section",
        rootPresentation.className,
        className,
      )}
    >
      {title === undefined
        ? null
        : (
            <Heading
              {...titlePresentation}
              className={cn(
                "hraness-design-rail-section__title",
                titlePresentation.className,
              )}
            >
              {title}
            </Heading>
          )}
      <div
        {...itemsPresentation}
        className={cn(
          "hraness-design-rail-section__items",
          itemsPresentation.className,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export interface RailItemProps extends Omit<
  LinkProps,
  "children" | "className" | "xstyle"
> {
  readonly badge?: ReactNode;
  readonly className?: string;
  readonly description?: ReactNode;
  readonly icon?: ReactNode;
  readonly isActive?: boolean;
  readonly label: ReactNode;
  /** Typed StyleX presentation applied after the RailItem recipe. */
  readonly xstyle?: LinkProps["xstyle"];
}

export function RailItem({
  badge,
  className,
  description,
  href,
  icon,
  isActive = false,
  label,
  xstyle,
  ...props
}: RailItemProps) {
  const iconPresentation = stylex.props(navigationRailStyles.itemIcon);
  const copyPresentation = stylex.props(navigationRailStyles.itemCopy);
  const labelPresentation = stylex.props(navigationRailStyles.itemLabel);
  const descriptionPresentation = stylex.props(
    navigationRailStyles.itemDescription,
  );

  return (
    <Link
      {...props}
      aria-current={isActive ? "page" : undefined}
      className={cn("hraness-design-rail-item", className)}
      href={href}
      xstyle={[
        navigationRailStyles.item,
        navigationRailStyles.itemNativeInteractionFallbacks,
        isActive && navigationRailStyles.itemActive,
        xstyle,
      ]}
    >
      {icon === undefined
        ? null
        : (
            <span
              {...iconPresentation}
              aria-hidden="true"
              className={cn(
                "hraness-design-rail-item__icon",
                iconPresentation.className,
              )}
            >
              {icon}
            </span>
          )}
      <span
        {...copyPresentation}
        className={cn(
          "hraness-design-rail-item__copy",
          copyPresentation.className,
        )}
      >
        <span
          {...labelPresentation}
          className={cn(
            "hraness-design-rail-item__label",
            labelPresentation.className,
          )}
        >
          {label}
        </span>
        {description === undefined
          ? null
          : (
              <span
                {...descriptionPresentation}
                className={cn(
                  "hraness-design-rail-item__description",
                  descriptionPresentation.className,
                )}
              >
                {description}
              </span>
            )}
      </span>
      {badge === undefined ? null : <span className="hraness-design-rail-item__badge">{badge}</span>}
    </Link>
  );
}
