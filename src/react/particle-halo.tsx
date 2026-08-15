import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@hraness/ui";
import {
  createParticleHaloRecipe,
  type ProceduralColorRole,
  type ProceduralEffectInput,
} from "./procedural-recipe.js";

type ProceduralStyle = CSSProperties & Record<`--hraness-design-${string}`, string | number>;

export type ParticleHaloProps = ProceduralEffectInput
  & Omit<HTMLAttributes<HTMLDivElement>, "aria-hidden" | "children"> & Readonly<{
    children: ReactNode;
  }>;

const colorVariables = {
  highlight: "var(--hraness-design-procedural-highlight)",
  key: "var(--hraness-design-procedural-key)",
  shadow: "var(--hraness-design-procedural-shadow)",
  support: "var(--hraness-design-procedural-support)",
} as const satisfies Readonly<Record<ProceduralColorRole, string>>;

/**
 * Wraps ordinary semantic artwork in a deterministic decorative particle
 * field. The children stay visible and remain the only meaningful content.
 */
export function ParticleHalo({
  children,
  className,
  palette,
  seed,
  style,
  variation,
  ...props
}: ParticleHaloProps) {
  const recipe = createParticleHaloRecipe({
    seed,
    ...(palette === undefined ? {} : { palette }),
    ...(variation === undefined ? {} : { variation }),
  });
  const rootStyle: ProceduralStyle = {
    ...style,
    "--hraness-design-procedural-highlight": recipe.palette.highlight,
    "--hraness-design-procedural-key": recipe.palette.key,
    "--hraness-design-procedural-shadow": recipe.palette.shadow,
    "--hraness-design-procedural-support": recipe.palette.support,
  };

  return (
    <div
      {...props}
      className={cn("hraness-design-particle-halo", className)}
      data-recipe-version={recipe.version}
      data-variation={recipe.variation}
      style={rootStyle}
    >
      <span
        aria-hidden="true"
        className="hraness-design-particle-halo__particles"
        role="presentation"
      >
        {recipe.particles.map((particle, index) => {
          const particleStyle: ProceduralStyle = {
            "--hraness-design-particle-color": colorVariables[particle.color],
            "--hraness-design-particle-delay": `${particle.delay}ms`,
            "--hraness-design-particle-drift-x": `${particle.driftX}px`,
            "--hraness-design-particle-drift-y": `${particle.driftY}px`,
            "--hraness-design-particle-duration": `${particle.duration}ms`,
            "--hraness-design-particle-opacity": particle.opacity,
            "--hraness-design-particle-size": `${particle.size}px`,
            "--hraness-design-particle-x": `${particle.x}%`,
            "--hraness-design-particle-y": `${particle.y}%`,
          };
          return (
            <i
              className="hraness-design-particle-halo__particle"
              key={index}
              style={particleStyle}
            />
          );
        })}
      </span>
      <div className="hraness-design-particle-halo__content">{children}</div>
    </div>
  );
}
