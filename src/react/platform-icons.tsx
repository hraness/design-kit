import type { ReactNode } from "react";

import { isPlatformId, platformLabel, platformMark, type PlatformId } from "../platforms.js";
import { platformInstallClassName } from "./platform-install.stylex.js";

export type PlatformIconSize = "sm" | "md" | "lg" | "inherit";

export interface PlatformIconProps {
  readonly platform: PlatformId;
  readonly className?: string;
  /**
   * Decorative by default: pair the icon with a visible platform name. Pass a
   * label only when the icon stands alone; it then renders as a named image.
   */
  readonly label?: string;
  /** `inherit` (the default) follows the surrounding font size; `sm`, `md`, and `lg` are 1, 1.25, and 1.5rem. */
  readonly size?: PlatformIconSize;
}

const sizeParts = { inherit: undefined, lg: "iconLg", md: "iconMd", sm: "iconSm" } as const;

/**
 * A monochrome platform mark drawn in `currentColor`: the Apple logo for
 * macOS, Tux for Linux, the four-pane window for Windows, and a neutral
 * terminal glyph for any other id.
 */
export function PlatformIcon({ className, label, platform, size = "inherit" }: PlatformIconProps) {
  if (!isPlatformId(platform)) throw new RangeError(`Platform ids are lowercase slugs; received ${JSON.stringify(platform)}.`);
  if (!(size in sizeParts)) throw new RangeError(`Unknown platform icon size: ${String(size)}.`);
  if (label !== undefined && label.trim() === "") throw new RangeError("A platform icon label must not be blank.");
  const mark = platformMark(platform);
  return (
    <svg
      aria-hidden={label === undefined ? true : undefined}
      aria-label={label}
      className={platformInstallClassName(["icon", sizeParts[size]], className)}
      data-platform={platform}
      fill="currentColor"
      focusable="false"
      role={label === undefined ? undefined : "img"}
      viewBox={mark.viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={mark.path} />
    </svg>
  );
}

export interface PlatformBadge {
  readonly id: PlatformId;
  /** Defaults to the known display name (`macOS`, `Linux`, `Windows`) or the id. */
  readonly label?: string;
  /** A short qualifier shown after the name, such as "Apple silicon". */
  readonly note?: ReactNode;
}

export interface PlatformBadgesProps {
  /** Platform ids or badge records, in display order. */
  readonly platforms: readonly (PlatformId | PlatformBadge)[];
  readonly className?: string;
  /** The visible lead-in and list name. Defaults to "Runs on"; pass `null` to omit the visible text. */
  readonly label?: string | null;
}

function toBadge(entry: PlatformId | PlatformBadge): PlatformBadge {
  return typeof entry === "string" ? { id: entry } : entry;
}

/** A compact "Runs on" row: one icon and name per supported platform. */
export function PlatformBadges({ className, label = "Runs on", platforms }: PlatformBadgesProps) {
  const badges = platforms.map(toBadge);
  if (badges.length === 0) throw new RangeError("PlatformBadges needs at least one platform.");
  const seen = new Set<string>();
  for (const badge of badges) {
    if (!isPlatformId(badge.id)) throw new RangeError(`Platform ids are lowercase slugs; received ${JSON.stringify(badge.id)}.`);
    if (seen.has(badge.id)) throw new RangeError(`Duplicate platform id: ${badge.id}.`);
    seen.add(badge.id);
  }
  const listName = label ?? "Supported platforms";
  return (
    <div className={platformInstallClassName(["badges"], className)} data-hraness-platform-badges="">
      {label === null ? null : <span aria-hidden="true" className={platformInstallClassName(["badgesLabel"])}>{label}</span>}
      <ul aria-label={listName} className={platformInstallClassName(["badgesList"])}>
        {badges.map((badge) => (
          <li className={platformInstallClassName(["badge"])} data-platform={badge.id} key={badge.id}>
            <PlatformIcon platform={badge.id} />
            <span>{badge.label ?? platformLabel(badge.id)}</span>
            {badge.note === undefined ? null : <span className={platformInstallClassName(["badgeNote"])}>{badge.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
