"use client";

import type { ReactNode, Ref, RefObject } from "react";
import {
  Label,
  Slider as AriaSlider,
  SliderFill,
  SliderOutput,
  type SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import * as stylex from "@stylexjs/stylex";

import { cn } from "@hraness/ui";

import { faderStyles } from "./fader.stylex.js";

export type FaderProps = Omit<
  AriaSliderProps<number>,
  "children" | "className"
> & {
  readonly className?: string;
  readonly density?: "compact" | "default";
  readonly faderRef?: Ref<HTMLDivElement>;
  readonly inputRef?: RefObject<HTMLInputElement | null>;
  readonly label: ReactNode;
  /** Supplementary action rendered beside the real clickable slider label. */
  readonly labelAccessory?: ReactNode;
  readonly showLabel?: boolean;
  readonly showOutput?: boolean;
};

/** A single-value vertical slider with a touch-sized track and native keyboard semantics. */
export function Fader({
  className,
  density = "default",
  faderRef,
  inputRef,
  label,
  labelAccessory,
  orientation = "vertical",
  showLabel = false,
  showOutput = false,
  ...props
}: FaderProps) {
  const rootPresentation = stylex.props(
    faderStyles.root,
    density === "compact" && faderStyles.compact,
    orientation === "horizontal" && faderStyles.horizontalRoot,
  );
  const labelRowPresentation = stylex.props(faderStyles.labelRow);
  const captionPresentation = stylex.props(faderStyles.caption);
  const trackPresentation = stylex.props(
    faderStyles.track,
    orientation === "horizontal" && faderStyles.horizontalTrack,
  );
  const trackRailPresentation = stylex.props(
    faderStyles.rail,
    faderStyles.trackRail,
  );
  const fillRailPresentation = stylex.props(faderStyles.rail, faderStyles.fillRail);

  return (
    <AriaSlider
      {...props}
      className={cn(
        "hraness-design-fader",
        rootPresentation.className,
        className,
      )}
      data-density={density}
      orientation={orientation}
      ref={faderRef}
    >
      {showLabel && labelAccessory !== undefined ? (
        <div
          className={cn(
            "hraness-design-fader__label-row",
            labelRowPresentation.className,
          )}
        >
          <Label
            className={cn(
              "hraness-design-fader__label",
              captionPresentation.className,
            )}
          >
            {label}
          </Label>
          <span className="hraness-design-fader__label-accessory">{labelAccessory}</span>
        </div>
      ) : showLabel ? (
        <Label
          className={cn(
            "hraness-design-fader__label",
            captionPresentation.className,
          )}
        >
          {label}
        </Label>
      ) : (
        <Label className="hraness-design-visually-hidden">{label}</Label>
      )}
      {showOutput ? (
        <SliderOutput
          className={cn(
            "hraness-design-fader__output",
            captionPresentation.className,
          )}
        />
      ) : null}
      <SliderTrack
        className={cn(
          "hraness-design-fader__track",
          trackPresentation.className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "hraness-design-fader__track-rail",
            trackRailPresentation.className,
          )}
        />
        <SliderFill className="hraness-design-fader__fill">
          <span
            aria-hidden="true"
            className={cn(
              "hraness-design-fader__fill-rail",
              fillRailPresentation.className,
            )}
          />
        </SliderFill>
        <SliderThumb
          className={({ isFocusVisible }) => {
            const thumbPresentation = stylex.props(
              faderStyles.thumb,
              isFocusVisible && faderStyles.focusVisible,
            );
            return cn(
              "hraness-design-fader__thumb",
              thumbPresentation.className,
            );
          }}
          {...(inputRef === undefined ? {} : { inputRef })}
        />
      </SliderTrack>
    </AriaSlider>
  );
}
