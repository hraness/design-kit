import type { CSSProperties, ReactNode } from "react";
import { foilMarkClassName } from "./foil.stylex.js";

export interface FoilMarkProps {
  /** Transparent, same-origin or data-URL artwork; its alpha defines the mark. */
  readonly src: string;
  readonly className?: string;
  /** Decorative by default; name the enclosing link instead when possible. */
  readonly label?: string;
  readonly size?: number;
  /** Optional original inline vector for a currentColor forced-color fallback. */
  readonly fallback?: ReactNode;
}

/** Static metallic paint over the exact source silhouette, with an intact fallback. */
export function FoilMark({ src, className, label, size = 24, fallback }: FoilMarkProps) {
  if (!Number.isFinite(size) || size <= 0) throw new RangeError("FoilMark size must be positive and finite.");
  return (
    <span
      aria-hidden={label === undefined ? true : undefined}
      aria-label={label}
      className={foilMarkClassName("root", className)}
      data-foil=""
      role={label === undefined ? undefined : "img"}
      style={{ "--hraness-foil-size": `${size}px` } as CSSProperties}
    >
      {fallback ?? <img alt="" className={foilMarkClassName("image")} decoding="async" height={size} src={src} width={size} />}
      <span
        aria-hidden="true"
        className={foilMarkClassName("paint")}
        style={{ "--hraness-foil-mask": `url(${JSON.stringify(src)})` } as CSSProperties}
      />
    </span>
  );
}
