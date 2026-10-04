import type { CSSProperties, ReactNode } from "react";

import { providerMark, providerMarkMonogram, providerMarkOnAccent } from "../provider-marks.js";

/*
 * Shared pieces for the code-built mockups. Server-safe plain React: no hooks,
 * no context, no StyleX, and no runtime dependency other than React, so a film
 * build can render these with renderToStaticMarkup and one stylesheet,
 * mockups.css.
 */

/** A mockup's own color scheme. Omit it to follow the page's `color-scheme`. */
export type MockupTheme = "light" | "dark";

/** Data attributes that tell a product's own runtime to skip the sample text, such as `{ "data-sample-skip": "" }`. */
export type MockupOptOut = Readonly<Record<`data-${string}`, "">>;

/** Props every mockup root takes. */
export type MockupRootProps = Readonly<{
  /** What the illustration shows, in one or two plain sentences. Becomes the root's accessible name. */
  describe: string;
  /** Pin the mockup to light or dark independently of the page. */
  theme?: MockupTheme;
  /** Data attributes placed on the root and on every sample text leaf the mockup renders. */
  optOut?: MockupOptOut;
  className?: string;
}>;

export function joinMockupClasses(...values: readonly (string | false | null | undefined)[]): string {
  return values.filter((value) => typeof value === "string" && value !== "").join(" ");
}

/** Throws when a mockup has no description, because the root would have no accessible name. */
export function assertMockupDescription(describe: string, component: string): void {
  if (typeof describe !== "string" || describe.trim() === "") {
    throw new TypeError(`${component} needs a describe string; it is the illustration's accessible name.`);
  }
}

function optOutAttributes(optOut: MockupOptOut | undefined): Record<string, ""> {
  if (optOut === undefined) return {};
  const attributes: Record<string, ""> = {};
  for (const name of Object.keys(optOut)) {
    if (!/^data-[a-z0-9-]+$/u.test(name)) throw new TypeError(`Mockup opt-out attribute ${JSON.stringify(name)} must be a lowercase data- attribute.`);
    attributes[name] = "";
  }
  return attributes;
}

/**
 * The root every mockup renders: one `role="img"` element whose name is the
 * description, marked `data-nosnippet` so search engines do not quote sample
 * text, with the theme and opt-out attributes applied.
 */
export function MockupRoot({
  children,
  className,
  describe,
  kind,
  optOut,
  style,
  theme,
}: MockupRootProps & Readonly<{ children: ReactNode; kind: string; style?: CSSProperties | undefined }>) {
  assertMockupDescription(describe, kind);
  return (
    <div
      {...optOutAttributes(optOut)}
      aria-label={describe.trim()}
      className={joinMockupClasses("hkm-root", `hkm-${kind}`, className)}
      data-hkm-kind={kind}
      data-hkm-theme={theme}
      data-nosnippet=""
      role="img"
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * Sample text inside a mockup. It carries the opt-out attributes on the leaf,
 * because some runtimes skip marked descendants but not the unit that holds
 * them.
 */
export function SampleText({ children, optOut }: Readonly<{ children: ReactNode; optOut?: MockupOptOut }>) {
  return <span {...optOutAttributes(optOut)} className="hkm-sample">{children}</span>;
}

/** Splits text on blank lines into paragraphs of sample text. */
export function SampleParagraphs({
  className,
  optOut,
  text,
}: Readonly<{ text: string; optOut?: MockupOptOut; className?: string }>) {
  return (
    <>
      {text.split(/\n{2,}/u).map((paragraph, index) => (
        <p className={className} key={index}>
          <SampleText {...(optOut === undefined ? {} : { optOut })}>{paragraph}</SampleText>
        </p>
      ))}
    </>
  );
}

/**
 * Formats a count the way feeds abbreviate it: 950, 1.2K, 12K, 3.4M.
 * Use it for invented sample metrics only; real numbers come from a facts module.
 */
export function compact(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError("compact() needs a finite number.");
  const sign = value < 0 ? "-" : "";
  const n = Math.abs(value);
  const scaled = (divisor: number, suffix: string): string => {
    const quotient = n / divisor;
    const text = quotient < 10 ? (Math.floor(quotient * 10) / 10).toFixed(1).replace(/\.0$/u, "") : String(Math.floor(quotient));
    return `${sign}${text}${suffix}`;
  };
  if (n < 1_000) return `${sign}${Math.round(n)}`;
  if (n < 1_000_000) return scaled(1_000, "K");
  if (n < 1_000_000_000) return scaled(1_000_000, "M");
  return scaled(1_000_000_000, "B");
}

/** FNV-1a, so generated avatars and photos are stable across renders and runtimes. */
export function mockupHash(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return hash >>> 0;
}

const GRADIENTS = [
  ["#f6a57b", "#c2556b"],
  ["#7fb3ff", "#4c5fd7"],
  ["#8fdcb4", "#2f8f7a"],
  ["#f7d774", "#e0823d"],
  ["#c9a2ff", "#7653c8"],
  ["#ff9fb8", "#c24a86"],
  ["#9ad8e8", "#3a7fa3"],
  ["#d6c2a8", "#8a6a4b"],
] as const;

function gradientFor(seed: string, shift = 0): readonly [string, string] {
  return GRADIENTS[(mockupHash(seed) >>> shift) % GRADIENTS.length] ?? GRADIENTS[0];
}

/** Up to two initials from a display name. */
export function mockupInitials(name: string): string {
  // Code points are compared directly: Next.js compiles dependencies with a
  // Babel build that cannot rewrite Unicode property escapes.
  const isNameCharacter = (character: string): boolean =>
    character.toLowerCase() !== character.toUpperCase() || /[0-9]/u.test(character) || (character.codePointAt(0) ?? 0) >= 0x3000;
  return name
    .split(/\s+/u)
    .map((word) => Array.from(word).find(isNameCharacter) ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .map((initial) => initial.toUpperCase())
    .join("");
}

/** A generated avatar: initials on a two-stop gradient picked from the name. Decorative. */
export function Avatar({
  name,
  size = 40,
  square = false,
}: Readonly<{ name: string; size?: number; square?: boolean }>) {
  const [from, to] = gradientFor(name);
  const style: CSSProperties = {
    background: `linear-gradient(135deg, ${from}, ${to})`,
    borderRadius: square ? Math.round(size * 0.22) : "50%",
    fontSize: Math.round(size * 0.38),
    height: size,
    width: size,
  };
  return (
    <span aria-hidden="true" className="hkm-avatar" style={style}>
      {mockupInitials(name)}
    </span>
  );
}

/**
 * A soft gradient block that stands in for a photo. It reads as a picture at a
 * glance and never as a real one. Decorative.
 */
export function PlaceholderPhoto({
  className,
  ratio = "16 / 9",
  seed,
}: Readonly<{ seed: string; ratio?: string; className?: string }>) {
  const [a, b] = gradientFor(seed);
  const [c] = gradientFor(seed, 3);
  return (
    <span
      aria-hidden="true"
      className={joinMockupClasses("hkm-photo", className)}
      style={{
        aspectRatio: ratio,
        background: `radial-gradient(120% 90% at 20% 15%, ${a}cc, transparent 60%), radial-gradient(90% 80% at 85% 90%, ${c}bb, transparent 65%), linear-gradient(160deg, ${b}, ${a})`,
      }}
    />
  );
}

/**
 * A fixed-height window onto longer content, with a fade at the bottom that
 * says the page keeps going.
 */
export function ScrollFade({
  children,
  className,
  fadeHeight = 56,
  height,
}: Readonly<{ height: number; fadeHeight?: number; children: ReactNode; className?: string }>) {
  if (!(height > 0)) throw new RangeError("ScrollFade needs a positive height.");
  return (
    <div
      className={joinMockupClasses("hkm-scroll-fade", className)}
      style={{ "--hkm-fade-height": `${fadeHeight}px`, "--hkm-scroll-height": `${height}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * A pulsing marker that points at one spot in a mockup, with a short label.
 * `x` and `y` are percentages of the nearest positioned ancestor.
 */
export function Hotspot({ label, x, y }: Readonly<{ x: number; y: number; label?: string }>) {
  for (const [axis, value] of [["x", x], ["y", y]] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new RangeError(`Hotspot ${axis} must be a percentage from 0 to 100.`);
  }
  return (
    <span aria-hidden="true" className="hkm-hotspot" data-hkm-side={x > 60 ? "start" : "end"} style={{ insetBlockStart: `${y}%`, insetInlineStart: `${x}%` }}>
      <span className="hkm-hotspot-ring" />
      {label === undefined || label === "" ? null : <span className="hkm-hotspot-label">{label}</span>}
    </span>
  );
}

const GLYPHS = {
  archive: <><rect height="4" rx="1" width="17" x="3.5" y="4.5" /><path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5M10 12.5h4" /></>,
  back: <path d="m14.5 6-6 6 6 6" />,
  bell: <><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /></>,
  bookmark: <path d="M6.5 4h11v16.5L12 16.5l-5.5 4z" />,
  chart: <path d="M5 20V12M10 20V6M15 20v-9M20 20V9" />,
  check: <path d="m6.5 12.5 3.5 3.5 7.5-8" />,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /></>,
  comment: <path d="M4.5 5.5h15v10h-9l-4.5 4v-4h-1.5z" />,
  file: <path d="M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4" />,
  forward: <path d="m9.5 6 6 6-6 6" />,
  grid: <><rect height="6" rx="1.2" width="6" x="4" y="4" /><rect height="6" rx="1.2" width="6" x="14" y="4" /><rect height="6" rx="1.2" width="6" x="4" y="14" /><rect height="6" rx="1.2" width="6" x="14" y="14" /></>,
  heart: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" />,
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  inbox: <><path d="M4 13.5 6.5 5h11l2.5 8.5V19H4z" /><path d="M4 13.5h4.5l1 2h5l1-2H20" /></>,
  lock: <><rect height="9" rx="1.5" width="12" x="6" y="10.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  mail: <><rect height="14" rx="2" width="18" x="3" y="5" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  more: <><circle cx="5.5" cy="12" fill="currentColor" r="1.4" stroke="none" /><circle cx="12" cy="12" fill="currentColor" r="1.4" stroke="none" /><circle cx="18.5" cy="12" fill="currentColor" r="1.4" stroke="none" /></>,
  pencil: <path d="M4.5 19.5 5.5 15 15.5 5a2 2 0 0 1 3 3l-10 10zM13.5 7l3 3" />,
  people: <><circle cx="9" cy="9" r="3.2" /><path d="M3.5 19c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5" /><circle cx="16.5" cy="8.5" r="2.6" /><path d="M16 13.6c2.3.1 4 1.6 4.6 4.4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  reload: <><path d="M19 12a7 7 0 1 1-2.1-5" /><path d="M17.5 3.5V7.5h-4" /></>,
  reply: <path d="M12 19.5c4.7 0 8.5-3.2 8.5-7.3S16.7 5 12 5 3.5 8.1 3.5 12.2c0 1.8.7 3.4 2 4.7L5 20.5l3.6-1.6c1 .4 2.2.6 3.4.6z" />,
  repost: <><path d="M7 5 4 8l3 3" /><path d="M4 8h11a4 4 0 0 1 4 4v1" /><path d="m17 19 3-3-3-3" /><path d="M20 16H9a4 4 0 0 1-4-4v-1" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  send: <path d="m20.5 3.5-17 7 7 2.5 2.5 7zM10.5 13l10-9.5" />,
  share: <><path d="M12 15V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" /></>,
  sidebar: <><rect height="15" rx="2.5" width="18" x="3" y="4.5" /><path d="M9 4.5v15" /></>,
  sparkle: <path d="M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2z" />,
  star: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" />,
  terminal: <><rect height="15" rx="2.5" width="18" x="3" y="4.5" /><path d="m7 9.5 3 2.5-3 2.5M12 15h5" /></>,
  thumb: <path d="M7.5 10.5v9h-3v-9zM7.5 10.5l3.5-6.5c1.4 0 2.3 1 2 2.4l-.6 3.1h5.1c1.2 0 2 1 1.8 2.2l-1.2 6.2c-.2 1-1 1.6-2 1.6H7.5" />,
  trash: <path d="M5 7h14M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" /></>,
} as const;

/** The neutral stroked glyphs the mockups draw with. */
export type MockupGlyphName = keyof typeof GLYPHS;
export const mockupGlyphNames = Object.freeze(Object.keys(GLYPHS) as MockupGlyphName[]);

/** A neutral stroked glyph. Decorative: always aria-hidden. */
export function MockupGlyph({
  className,
  filled = false,
  name,
  size = 20,
}: Readonly<{ name: MockupGlyphName; size?: number; className?: string; filled?: boolean }>) {
  return (
    <svg
      aria-hidden="true"
      className={joinMockupClasses("hkm-glyph", className)}
      fill={filled ? "currentColor" : "none"}
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      width={size}
    >
      {GLYPHS[name]}
    </svg>
  );
}

/**
 * A product's brand mark from the shared provider-mark registry, such as
 * "Apple Contacts", "LinkedIn", or "iMessage". `tile` draws the vendor glyph
 * in readable ink on the brand color, like an app icon; `glyph` follows the
 * surrounding text color. Names without a registered mark get a neutral
 * monogram tile, never an invented logo. Decorative: always aria-hidden, so
 * name the product in nearby text.
 */
export function MockupBrandMark({
  className,
  name,
  size = 32,
  variant = "tile",
}: Readonly<{ name: string; size?: number; variant?: "tile" | "glyph"; className?: string }>) {
  if (!(size > 0)) throw new RangeError("MockupBrandMark size must be positive.");
  const mark = providerMark(name);
  const style = { "--hkm-mark-size": `${String(size)}px`, ...(mark === undefined || variant !== "tile" ? {} : { "--hkm-mark-accent": mark.accent, "--hkm-mark-ink": providerMarkOnAccent(mark) }) } as CSSProperties;
  if (mark === undefined) {
    return <span aria-hidden="true" className={joinMockupClasses("hkm-brand-mark", className)} data-hkm-monogram="" style={style}>{providerMarkMonogram(name)}</span>;
  }
  return (
    <span aria-hidden="true" className={joinMockupClasses("hkm-brand-mark", className)} data-hkm-mark={mark.id} data-hkm-variant={variant} style={style}>
      {/* Generated from vendored, sanitized artwork in provider-marks.generated.ts. */}
      <svg dangerouslySetInnerHTML={{ __html: mark.glyph.body }} fill="currentColor" focusable="false" viewBox={mark.glyph.viewBox} />
    </span>
  );
}

/** The three window buttons at the start of a title bar. Decorative. */
export function WindowLights() {
  return (
    <span aria-hidden="true" className="hkm-lights">
      <i />
      <i />
      <i />
    </span>
  );
}
