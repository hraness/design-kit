import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@hraness/ui";
import * as stylex from "@stylexjs/stylex";

import { effectsStyles } from "./effects.stylex.js";
import {
  createProceduralBackdropRecipe,
  type ProceduralBackdropInput,
  type ProceduralColorRole,
} from "./procedural-recipe.js";

type ProceduralStyle = CSSProperties & Record<`--hraness-design-${string}`, string | number>;

export type ProceduralBackdropProps = ProceduralBackdropInput
  & Omit<
    HTMLAttributes<HTMLDivElement>,
    | "accessKey"
    | "aria-hidden"
    | "children"
    | "contentEditable"
    | "inert"
    | "role"
    | "suppressContentEditableWarning"
    | "tabIndex"
  >;

const colorVariables = {
  highlight: "var(--hraness-design-procedural-highlight)",
  key: "var(--hraness-design-procedural-key)",
  shadow: "var(--hraness-design-procedural-shadow)",
  support: "var(--hraness-design-procedural-support)",
} as const satisfies Readonly<Record<ProceduralColorRole, string>>;

const INERT_PROPS = { inert: true } as unknown as HTMLAttributes<HTMLDivElement>;

/**
 * A deterministic, server-rendered atmosphere, grid, ripple, or composite
 * field. It never captures or replaces the semantic page beneath it.
 */
export function ProceduralBackdrop({
  className,
  palette,
  seed,
  style,
  variation,
  variant,
  ...props
}: ProceduralBackdropProps) {
  const recipe = createProceduralBackdropRecipe({
    seed,
    ...(palette === undefined ? {} : { palette }),
    ...(variation === undefined ? {} : { variation }),
    ...(variant === undefined ? {} : { variant }),
  });
  const rootStyle: ProceduralStyle = {
    "--hraness-design-procedural-highlight": recipe.palette.highlight,
    "--hraness-design-procedural-key": recipe.palette.key,
    "--hraness-design-procedural-shadow": recipe.palette.shadow,
    "--hraness-design-procedural-support": recipe.palette.support,
    ...style,
  };
  const showAtmosphere = recipe.variant === "atmosphere"
    || recipe.variant === "composite";
  const showGrid = recipe.variant === "grid" || recipe.variant === "composite";
  const showRipple = recipe.variant === "ripple"
    || recipe.variant === "composite";
  const gridStyle: ProceduralStyle = {
    "--hraness-design-procedural-grid-offset-x": `${recipe.grid.offsetX}px`,
    "--hraness-design-procedural-grid-offset-y": `${recipe.grid.offsetY}px`,
    "--hraness-design-procedural-grid-opacity": recipe.grid.opacity,
    "--hraness-design-procedural-grid-rotation": `${recipe.grid.rotation}deg`,
    "--hraness-design-procedural-grid-size": `${recipe.grid.size}px`,
  };
  const rippleStyle: ProceduralStyle = {
    "--hraness-design-procedural-ripple-aspect": recipe.ripple.aspect,
    "--hraness-design-procedural-ripple-color":
      colorVariables[recipe.ripple.color],
    "--hraness-design-procedural-ripple-rotation":
      `${recipe.ripple.rotation}deg`,
    "--hraness-design-procedural-ripple-x": `${recipe.ripple.x}%`,
    "--hraness-design-procedural-ripple-y": `${recipe.ripple.y}%`,
  };
  const rootPresentation = stylex.props(effectsStyles.proceduralRoot);
  const atmospherePresentation = stylex.props(
    effectsStyles.proceduralSlot,
    effectsStyles.proceduralAtmosphere,
  );
  const cloudPresentation = stylex.props(effectsStyles.proceduralCloud);
  const gridPresentation = stylex.props(
    effectsStyles.proceduralSlot,
    effectsStyles.proceduralGrid,
  );
  const ripplesPresentation = stylex.props(
    effectsStyles.proceduralSlot,
    effectsStyles.proceduralRipples,
  );
  const ripplePresentation = stylex.props(effectsStyles.proceduralRipple);

  return (
    <div
      {...props}
      {...INERT_PROPS}
      aria-hidden="true"
      className={cn(
        "hraness-design-procedural-backdrop",
        rootPresentation.className,
        className,
      )}
      data-recipe-version={recipe.version}
      data-variation={recipe.variation}
      data-variant={recipe.variant}
      role="presentation"
      style={rootStyle}
    >
      {showAtmosphere ? (
        <span
          className={cn(
            "hraness-design-procedural-backdrop__atmosphere",
            atmospherePresentation.className,
          )}
        >
          {recipe.atmosphere.map((layer, index) => {
            const layerStyle: ProceduralStyle = {
              "--hraness-design-procedural-layer-blur": `${layer.blur}px`,
              "--hraness-design-procedural-layer-color": colorVariables[layer.color],
              "--hraness-design-procedural-layer-delay": `${layer.delay}ms`,
              "--hraness-design-procedural-layer-drift-x": `${layer.driftX}px`,
              "--hraness-design-procedural-layer-drift-y": `${layer.driftY}px`,
              "--hraness-design-procedural-layer-duration": `${layer.duration}ms`,
              "--hraness-design-procedural-layer-height": `${layer.height}%`,
              "--hraness-design-procedural-layer-opacity": layer.opacity,
              "--hraness-design-procedural-layer-rotation": `${layer.rotation}deg`,
              "--hraness-design-procedural-layer-scale": layer.scale,
              "--hraness-design-procedural-layer-width": `${layer.width}%`,
              "--hraness-design-procedural-layer-x": `${layer.x}%`,
              "--hraness-design-procedural-layer-y": `${layer.y}%`,
            };
            return (
              <i
                className={cn(
                  "hraness-design-procedural-backdrop__cloud",
                  cloudPresentation.className,
                )}
                key={index}
                style={layerStyle}
              />
            );
          })}
        </span>
      ) : null}
      {showGrid ? (
        <span
          className={cn(
            "hraness-design-procedural-backdrop__grid",
            gridPresentation.className,
          )}
          style={gridStyle}
        />
      ) : null}
      {showRipple ? (
        <span
          className={cn(
            "hraness-design-procedural-backdrop__ripples",
            ripplesPresentation.className,
          )}
          style={rippleStyle}
        >
          {recipe.ripple.contours.map((contour, index) => {
            const contourStyle: ProceduralStyle = {
              "--hraness-design-procedural-ripple-delay": `${contour.delay}ms`,
              "--hraness-design-procedural-ripple-duration":
                `${contour.duration}ms`,
              "--hraness-design-procedural-ripple-opacity": contour.opacity,
              "--hraness-design-procedural-ripple-size": `${contour.size}%`,
            };
            return (
              <i
                className={cn(
                  "hraness-design-procedural-backdrop__ripple",
                  ripplePresentation.className,
                )}
                key={index}
                style={contourStyle}
              />
            );
          })}
        </span>
      ) : null}
    </div>
  );
}
