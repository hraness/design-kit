"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { DialogContent, DialogTrigger, Icon, IconButton, cn } from "@hraness/ui";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export interface AppShellProps {
  readonly bottomBar?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  readonly mobileNavigationLabel?: string;
  /** Close the mobile navigation when an app-owned route identity changes. */
  readonly navigationKey?: string | number;
  readonly openNavigationLabel?: string;
  readonly rail: ReactNode;
  readonly topBar?: ReactNode;
}

/** Persistent desktop rail with a focus-trapped mobile navigation drawer. */
export function AppShell({
  bottomBar,
  children,
  className,
  mobileNavigationLabel = "Navigation",
  navigationKey,
  openNavigationLabel = "Open navigation",
  rail,
  topBar,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [navigationKey]);

  return (
    <div className={cn("hraness-design-app-shell", className)}>
      <div className="hraness-design-app-shell__top">{topBar}</div>
      <div className="hraness-design-app-shell__rail">{rail}</div>
      <div className="hraness-design-app-shell__mobile-trigger">
        <DialogTrigger isOpen={mobileOpen} onOpenChange={setMobileOpen}>
          <IconButton aria-label={openNavigationLabel} size="compact">
            <Icon icon={Menu01Icon} />
          </IconButton>
          <DialogContent className="hraness-design-app-shell__drawer" size="small" title={mobileNavigationLabel}>
            {rail}
          </DialogContent>
        </DialogTrigger>
      </div>
      <div className="hraness-design-app-shell__page">{children}</div>
      {bottomBar === undefined ? null : <div className="hraness-design-app-shell__bottom">{bottomBar}</div>}
    </div>
  );
}
