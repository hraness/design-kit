import type { CSSProperties } from "react";

import {
  providerMark,
  providerMarkFallback,
  providerMarkOnAccent,
  type ProviderMarkDescriptor,
} from "../provider-marks.js";
import { providerMarkClassName } from "./provider-mark.stylex.js";

export type ProviderMarkTone = "tile" | "solid" | "plain";

export interface ProviderMarkProps {
  readonly mark: ProviderMarkDescriptor | string;
  readonly className?: string;
  /** Decorative by default; pass a label only when no adjacent name exists. */
  readonly label?: string;
  readonly size?: number;
  readonly tone?: ProviderMarkTone;
}

interface MarkStyle extends CSSProperties {
  "--_mark-accent": string;
  "--_mark-on-accent"?: string;
  "--_mark-size": string;
}

function resolveMark(mark: ProviderMarkDescriptor | string): ProviderMarkDescriptor {
  if (typeof mark !== "string") return mark;
  return providerMark(mark) ?? providerMarkFallback(mark);
}

function Artwork({
  mark,
  tone,
}: Readonly<{ mark: ProviderMarkDescriptor; tone: ProviderMarkTone }>) {
  // Only the tinted tile carries vendor-colored art; solid and plain tones
  // use the retintable glyph so contrast stays in the surface's control.
  const art = tone === "tile" ? mark.art : null;
  return (
    <>
      <svg
        aria-hidden="true"
        className={providerMarkClassName("glyph")}
        dangerouslySetInnerHTML={{ __html: mark.glyph.body }}
        fill="currentColor"
        viewBox={mark.glyph.viewBox}
      />
      {art === null ? null : (
        <svg
          aria-hidden="true"
          className={providerMarkClassName("art")}
          dangerouslySetInnerHTML={{ __html: art.body }}
          viewBox={art.viewBox}
        />
      )}
    </>
  );
}

/**
 * One provider or agent identity: a soft accent-tinted tile by default, a
 * saturated accent tile with `tone="solid"`, or the bare glyph with
 * `tone="plain"`. Unknown identities render a monogram tile so surfaces
 * never imply an official mark that does not exist.
 */
export function ProviderMark({ mark, className, label, size = 32, tone = "tile" }: ProviderMarkProps) {
  if (!Number.isFinite(size) || size <= 0) throw new RangeError("ProviderMark size must be positive and finite.");
  const resolved = resolveMark(mark);
  const style: MarkStyle = {
    "--_mark-accent": resolved.accent,
    "--_mark-size": `${size}px`,
  };
  if (tone === "solid") style["--_mark-on-accent"] = providerMarkOnAccent(resolved);
  const hasArtwork = resolved.glyph.body !== "";
  return (
    <span
      aria-hidden={label === undefined ? true : undefined}
      aria-label={label}
      className={[
        providerMarkClassName("tile"),
        tone === "tile" ? "" : providerMarkClassName(tone),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={label === undefined ? undefined : "img"}
      style={style}
    >
      {hasArtwork ? <Artwork mark={resolved} tone={tone} /> : null}
      <span
        aria-hidden="true"
        className={[
          providerMarkClassName("monogram"),
          hasArtwork ? "" : providerMarkClassName("monogramOnly"),
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {resolved.monogram}
      </span>
    </span>
  );
}

export interface ProviderMarkChipProps extends Omit<ProviderMarkProps, "label"> {
  /** Visible name; defaults to the registered display name. */
  readonly name?: string;
}

/** The mark tile beside its display name; labels itself for a11y. */
export function ProviderMarkChip({ mark, name, ...rest }: ProviderMarkChipProps) {
  const resolved = resolveMark(mark);
  return (
    <span className={providerMarkClassName("chip")} style={{ "--_mark-size": `${rest.size ?? 32}px` } as CSSProperties}>
      <ProviderMark mark={resolved} {...rest} />
      <span className={providerMarkClassName("chipName")}>{name ?? resolved.name}</span>
    </span>
  );
}
