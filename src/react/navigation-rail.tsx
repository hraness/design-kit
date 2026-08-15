"use client";

import {
  Link,
  cn,
  type ContentHeadingLevel,
  type LinkProps,
} from "@hraness/ui";
import type { HTMLAttributes, ReactNode } from "react";

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
  return (
    <aside {...props} aria-label={ariaLabel} className={cn("hraness-design-navigation-rail", className)}>
      {header === undefined ? null : <header className="hraness-design-navigation-rail__header">{header}</header>}
      <nav aria-label={ariaLabel} className="hraness-design-navigation-rail__navigation">{children}</nav>
      {footer === undefined ? null : <footer className="hraness-design-navigation-rail__footer">{footer}</footer>}
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
  return (
    <section {...props} className={cn("hraness-design-rail-section", className)}>
      {title === undefined ? null : <Heading className="hraness-design-rail-section__title">{title}</Heading>}
      <div className="hraness-design-rail-section__items">{children}</div>
    </section>
  );
}

export interface RailItemProps extends Omit<LinkProps, "children" | "className"> {
  readonly badge?: ReactNode;
  readonly className?: string;
  readonly description?: ReactNode;
  readonly icon?: ReactNode;
  readonly isActive?: boolean;
  readonly label: ReactNode;
}

export function RailItem({
  badge,
  className,
  description,
  href,
  icon,
  isActive = false,
  label,
  ...props
}: RailItemProps) {
  return (
    <Link
      {...props}
      aria-current={isActive ? "page" : undefined}
      className={cn("hraness-design-rail-item", className)}
      href={href}
    >
      {icon === undefined ? null : <span aria-hidden="true" className="hraness-design-rail-item__icon">{icon}</span>}
      <span className="hraness-design-rail-item__copy">
        <span className="hraness-design-rail-item__label">{label}</span>
        {description === undefined ? null : <span className="hraness-design-rail-item__description">{description}</span>}
      </span>
      {badge === undefined ? null : <span className="hraness-design-rail-item__badge">{badge}</span>}
    </Link>
  );
}
