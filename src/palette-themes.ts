import * as stylex from "@stylexjs/stylex";
import type { ConcreteDesignTheme } from "./appearance.js";
import { paletteColors, type DesignPalette } from "./palettes.js";
import {
  catppuccinDark, catppuccinLight, gruvboxDark, gruvboxLight,
  rosePineDark, rosePineLight, tokyoNightDark, tokyoNightLight,
} from "./palette-tokens.stylex.js";

const classes = {
  catppuccin: { light: stylex.props(catppuccinLight).className, dark: stylex.props(catppuccinDark).className },
  gruvbox: { light: stylex.props(gruvboxLight).className, dark: stylex.props(gruvboxDark).className },
  "rose-pine": { light: stylex.props(rosePineLight).className, dark: stylex.props(rosePineDark).className },
  "tokyo-night": { light: stylex.props(tokyoNightLight).className, dark: stylex.props(tokyoNightDark).className },
} as const;

/** Compiled classes only: this helper never injects CSS or writes browser state. */
export function getDesignPaletteTheme(palette: DesignPalette, mode: ConcreteDesignTheme): Readonly<{ className: string; background: string }> {
  return {
    className: `hraness-palette ${classes[palette][mode]}`,
    background: paletteColors[palette][mode].background,
  };
}
