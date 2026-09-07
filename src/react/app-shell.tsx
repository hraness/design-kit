"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { DialogContent, DialogTrigger, Icon, IconButton, cn } from "@hraness/ui";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { appShellStyles } from "./app-shell.stylex.js";

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
  const rootPresentation = stylex.props(appShellStyles.root);
  const topPresentation = stylex.props(appShellStyles.top);
  const railPresentation = stylex.props(appShellStyles.rail);
  const mobileTriggerPresentation = stylex.props(appShellStyles.mobileTrigger);
  const drawerPresentation = stylex.props(appShellStyles.drawer);
  const pagePresentation = stylex.props(appShellStyles.page);
  const bottomPresentation = stylex.props(appShellStyles.bottom);

  useEffect(() => {
    setMobileOpen(false);
  }, [navigationKey]);

  return (
    <div
      {...rootPresentation}
      className={cn(
        "hraness-design-app-shell",
        rootPresentation.className,
        className,
      )}
    >
      <div
        {...topPresentation}
        className={cn(
          "hraness-design-app-shell__top",
          topPresentation.className,
        )}
      >
        {topBar}
      </div>
      <div
        {...railPresentation}
        className={cn(
          "hraness-design-app-shell__rail",
          railPresentation.className,
        )}
      >
        {rail}
      </div>
      <div
        {...mobileTriggerPresentation}
        className={cn(
          "hraness-design-app-shell__mobile-trigger",
          mobileTriggerPresentation.className,
        )}
      >
        <DialogTrigger isOpen={mobileOpen} onOpenChange={setMobileOpen}>
          <IconButton aria-label={openNavigationLabel} size="compact">
            <Icon icon={Menu01Icon} />
          </IconButton>
          <DialogContent
            className={cn(
              "hraness-design-app-shell__drawer",
              drawerPresentation.className,
            )}
            size="small"
            title={mobileNavigationLabel}
          >
            {rail}
          </DialogContent>
        </DialogTrigger>
      </div>
      <div
        {...pagePresentation}
        className={cn(
          "hraness-design-app-shell__page",
          pagePresentation.className,
        )}
      >
        {children}
      </div>
      {bottomBar === undefined
        ? null
        : (
            <div
              {...bottomPresentation}
              className={cn(
                "hraness-design-app-shell__bottom",
                bottomPresentation.className,
              )}
            >
              {bottomBar}
            </div>
          )}
    </div>
  );
}
