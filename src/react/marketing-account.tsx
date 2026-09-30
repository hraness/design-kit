import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { marketingAccountStyles as styles } from "./marketing-account.stylex.js";

/** Optional account access near the end of a product's marketing page. */
export function MarketingAccount({
  children,
  className,
  heading = "Your account",
  id = "account",
  summary,
}: Readonly<{
  children: ReactNode;
  className?: string;
  heading?: string;
  id?: string;
  summary: ReactNode;
}>) {
  const presentation = stylex.props(styles.section);
  return (
    <section
      {...presentation}
      aria-labelledby={`${id}-heading`}
      className={["hraness-marketing-account", presentation.className, className].filter(Boolean).join(" ")}
      id={id}
    >
      <div {...stylex.props(styles.copy)}>
        <h2 {...stylex.props(styles.heading)} id={`${id}-heading`}>{heading}</h2>
        <div {...stylex.props(styles.summary)}>{summary}</div>
      </div>
      <div {...stylex.props(styles.content)}>{children}</div>
    </section>
  );
}

export interface MarketingAccountAction {
  readonly href: string;
  readonly analyticsEvent?: string;
  readonly analyticsId?: string;
}

/** One prominent account action and an optional, equally tall sign-in link. */
export function MarketingAccountActions({ primary, signIn }: Readonly<{
  primary: MarketingAccountAction & Readonly<{ label: string }>;
  signIn?: MarketingAccountAction;
}>) {
  return (
    <div {...stylex.props(styles.actions)} className={`hraness-marketing-account__actions ${stylex.props(styles.actions).className}`}>
      <a
        {...stylex.props(styles.primary)}
        className={`hraness-marketing-account__primary ${stylex.props(styles.primary).className}`}
        data-analytics-event={primary.analyticsEvent}
        data-analytics-id={primary.analyticsId}
        data-emphasis="primary"
        href={primary.href}
      >{primary.label}</a>
      {signIn === undefined ? null : (
        <a
          {...stylex.props(styles.signIn)}
          className={`hraness-marketing-account__sign-in ${stylex.props(styles.signIn).className}`}
          data-analytics-event={signIn.analyticsEvent}
          data-analytics-id={signIn.analyticsId}
          href={signIn.href}
        >Sign in</a>
      )}
    </div>
  );
}
