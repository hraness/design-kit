import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { diagramMetrics } from "../diagrams.js";
import { diagramStyles as styles } from "./marketing-diagram.stylex.js";

/** A bounded arrowhead whose paint follows its connector's stroke. IDs are caller-owned. */
export function DiagramArrowhead({ id }: Readonly<{ id: string }>) {
  if (id.trim() === "" || /\s/u.test(id)) throw new RangeError("Diagram arrowhead needs one nonempty SVG ID.");
  return <marker id={id} markerHeight={diagramMetrics.arrowheadSize} markerUnits="userSpaceOnUse" markerWidth={diagramMetrics.arrowheadSize} orient="auto-start-reverse" refX="5.5" refY="3" viewBox="0 0 6 6">
    <path d="M0 0 L6 3 L0 6 Z" fill="context-stroke" />
  </marker>;
}

/** An accessible SVG frame. Layout and facts stay with the consuming product. */
export function MarketingDiagram({ caption, children, className, height, label, width }: Readonly<{
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
  height: number;
  label: string;
  width: number;
}>) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new RangeError("Marketing diagram dimensions must be positive.");
  if (label.trim() === "") throw new RangeError("Marketing diagram needs a useful accessible label.");
  return <figure className={["hraness-diagram", stylex.props(styles.figure).className, className].filter(Boolean).join(" ")}>
    <div {...stylex.props(styles.scroll)} className={`hraness-diagram__scroll ${stylex.props(styles.scroll).className}`} aria-label={label} role="region" tabIndex={0}>
      <svg {...stylex.props(styles.canvas)} className={`hraness-diagram__canvas ${stylex.props(styles.canvas).className}`} aria-label={label} height={height} role="img" viewBox={`0 0 ${width} ${height}`} width={width}>
        {children}
      </svg>
    </div>
    {caption === undefined || caption === null ? null : <figcaption {...stylex.props(styles.caption)}>{caption}</figcaption>}
  </figure>;
}
