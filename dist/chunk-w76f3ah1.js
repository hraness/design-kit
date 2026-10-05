import {
  SyntaxCode,
  platformInstallClassName
} from "./chunk-6ts4955n.js";
import {
  MARKETING_MARQUEE_CONTROL_ICONS,
  diagramMetrics,
  resolveMarketingMarquee
} from "./chunk-6mx403v5.js";
import {
  isPlatformId,
  platformLabel,
  platformMark
} from "./chunk-wzvdn8ey.js";
import {
  ARTICLE_BYLINE_PREFIX,
  ARTICLE_SOURCES_HEADING,
  ARTICLE_TOC_LABEL,
  articleProvenanceSentence,
  assertArticleAuthor,
  assertArticleCalloutTone,
  assertArticleDates,
  assertArticleHref,
  assertArticleVideo,
  formatArticleDate,
  orderedArticleVideoSources
} from "./chunk-77391vmq.js";
import {
  assertLaunchBeats
} from "./chunk-cejpzyfh.js";
import {
  providerMark,
  providerMarkFallback,
  providerMarkOnAccent
} from "./chunk-w1y1m3m7.js";

// src/react/provider-mark.stylex.ts
import * as stylex from "@stylexjs/stylex";
var providerMarkStyles = {
  tile: {
    kGNEyG: "x6s0dn4",
    kOBAk4: "x1plog1",
    kWkggS: "x1mpd0sc x9yvj25",
    kKwaWg: "x1hkejs3 xhobzj1",
    kaIpWk: "x1qfbufn",
    kGVxlE: "xdp0uy8 xwaqzdf",
    kB7OPa: "x9f619",
    kMwMTN: "x2634if",
    k1xSpc: "x3nfvp2",
    kmuXW: "x2lah0s",
    kzqmXN: "xnsd1i0",
    kjj79g: "xl56j7k",
    kI3sdo: "xydrj4t xidp9i6",
    kInvED: "x1g40iwv",
    kVAEAm: "x1n2onr6",
    kXLuUW: "xxymvpz",
    $$css: true
  },
  solid: {
    kWkggS: "xpipt50 x9yvj25",
    kKwaWg: "x18o3ruo",
    kGVxlE: "x1gnnqk1",
    kMwMTN: "x3mibv",
    kI3sdo: "x15sqzv3 xidp9i6",
    $$css: true
  },
  plain: {
    kWkggS: "xjbqb8w",
    kKwaWg: "x18o3ruo",
    kGVxlE: "x1gnnqk1",
    kMwMTN: "x121n0qk",
    kI3sdo: "x1a2a7pz",
    $$css: true
  },
  inherit: {
    kWkggS: "xjbqb8w",
    kKwaWg: "x18o3ruo",
    kGVxlE: "x1gnnqk1",
    kMwMTN: "x1heor9g",
    kI3sdo: "x1a2a7pz",
    $$css: true
  },
  glyph: {
    kZKoxP: "x1f6yev3",
    kMwMTN: "x1heor9g",
    k1xSpc: "x3nfvp2",
    kDwRjp: "x117rol3",
    kzqmXN: "x1endk3i",
    $$css: true
  },
  art: {
    kZKoxP: "x1n6l62j",
    k1xSpc: "x3nfvp2 x1c7sf14",
    kzqmXN: "x19app5s",
    kpwlN0: "x10a8y8t",
    kogj98: "x1bpp3o7",
    kVAEAm: "x10l6tqk",
    $$css: true
  },
  monogram: {
    kGNEyG: "x6s0dn4",
    kMwMTN: "x1heor9g",
    k1xSpc: "x1s85apg x2pbqq",
    kGuDYH: "x68snkw",
    k63SB2: "x1xlr1w8",
    kpwlN0: "x10a8y8t",
    kjj79g: "xl56j7k",
    kb6lSQ: "x16q24ku",
    kLWn49: "xo5v014",
    kVAEAm: "x10l6tqk",
    $$css: true
  },
  monogramOnly: {
    k1xSpc: "x3nfvp2",
    kVAEAm: "x1uhb9sk",
    $$css: true
  },
  chip: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x3nfvp2",
    kOIVth: "xnromcf",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  chipName: {
    kMwMTN: "xm06a53",
    kGuDYH: "xzsou7g",
    k63SB2: "xh88oxj",
    kb6lSQ: "xjat59b",
    kLWn49: "x1u7k74",
    k7Eaqz: "xeuugli",
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    khDVqt: "xuxw1ft",
    $$css: true
  }
};
function providerMarkClassName(part, caller) {
  const parts = typeof part === "string" ? [part] : part;
  const hooks = parts.map((entry) => entry === "tile" ? "hraness-provider-mark" : `hraness-provider-mark__${entry.replaceAll(/[A-Z]/gu, (c) => `-${c.toLowerCase()}`)}`);
  return [...hooks, stylex.props(...parts.map((entry) => providerMarkStyles[entry])).className, caller].filter(Boolean).join(" ");
}

// src/react/provider-mark.tsx
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
function resolveMark(mark) {
  if (typeof mark !== "string")
    return mark;
  return providerMark(mark) ?? providerMarkFallback(mark);
}
function Artwork({
  mark,
  tone
}) {
  const art = tone === "tile" ? mark.art : null;
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("svg", {
        "aria-hidden": "true",
        className: providerMarkClassName("glyph"),
        dangerouslySetInnerHTML: {
          __html: mark.glyph.body
        },
        fill: "currentColor",
        viewBox: mark.glyph.viewBox
      }),
      art === null ? null : /* @__PURE__ */ jsx("svg", {
        "aria-hidden": "true",
        className: providerMarkClassName("art"),
        dangerouslySetInnerHTML: {
          __html: art.body
        },
        viewBox: art.viewBox
      })
    ]
  });
}
function ProviderMark({
  mark,
  className,
  label,
  size = 32,
  tone = "tile"
}) {
  if (!Number.isFinite(size) || size <= 0)
    throw new RangeError("ProviderMark size must be positive and finite.");
  const resolved = resolveMark(mark);
  const style = {
    "--_mark-accent": resolved.accent,
    "--_mark-size": `${size}px`
  };
  if (tone === "solid")
    style["--_mark-on-accent"] = providerMarkOnAccent(resolved);
  const hasArtwork = resolved.glyph.body !== "";
  return /* @__PURE__ */ jsxs("span", {
    "aria-hidden": label === undefined ? true : undefined,
    "aria-label": label,
    className: providerMarkClassName(tone === "tile" ? ["tile"] : ["tile", tone], className),
    role: label === undefined ? undefined : "img",
    style,
    children: [
      hasArtwork ? /* @__PURE__ */ jsx(Artwork, {
        mark: resolved,
        tone
      }) : null,
      /* @__PURE__ */ jsx("span", {
        "aria-hidden": "true",
        className: providerMarkClassName(hasArtwork ? "monogram" : ["monogram", "monogramOnly"]),
        children: resolved.monogram
      })
    ]
  });
}
function ProviderMarkChip({
  mark,
  name,
  ...rest
}) {
  const resolved = resolveMark(mark);
  return /* @__PURE__ */ jsxs("span", {
    className: providerMarkClassName("chip"),
    style: {
      "--_mark-size": `${rest.size ?? 32}px`
    },
    children: [
      /* @__PURE__ */ jsx(ProviderMark, {
        mark: resolved,
        ...rest
      }),
      /* @__PURE__ */ jsx("span", {
        className: providerMarkClassName("chipName"),
        children: name ?? resolved.name
      })
    ]
  });
}

// src/react/foil.stylex.ts
import * as stylex2 from "@stylexjs/stylex";
var foilEdge = "var(--_hraness-foil-edge, light-dark(black, white))";
var foilTextImage = "var(--hraness-foil-image, radial-gradient(ellipse 24% 85% at var(--hraness-foil-x, 50%) var(--hraness-foil-y, 50%), color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 80%, var(--background, Canvas)) 0%, transparent 68%), radial-gradient(ellipse 65% 160% at calc(100% - var(--hraness-foil-x, 50%)) calc(100% - var(--hraness-foil-y, 50%)), color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 98%, var(--background, Canvas)) 0%, transparent 72%), linear-gradient(115deg, color-mix(in srgb, var(--_hraness-foil-1) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-2) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-3) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-4) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-5) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-6) var(--hraness-foil-reflection, 14%), transparent)), linear-gradient(115deg, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 90%, var(--background, Canvas)) 0%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 100%, var(--background, Canvas)) 24%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 86%, var(--background, Canvas)) 39%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 100%, var(--background, Canvas)) 56%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 84%, var(--background, Canvas)) 82%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 100%, var(--background, Canvas)) 100%))";
var foilHalo = "0 1px 4px color-mix(in srgb, var(--foreground, CanvasText) 12%, transparent)";
var foilTextHalo = "none";
var foilStyles = {
  surface: {
    "--_hraness-foil-edge": "x1ioxxix x1ewxtse",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    kp1lYL: "xamhcws",
    kj6szv: "xyy74w7",
    kFnvHg: "xlxy82",
    kr1EtK: "x19sr0n1",
    kbouuQ: "x13fuv20",
    kdrUmJ: "x32b0ac",
    kk3gbz: "x1q0q8m5",
    kBLvaE: "x19ypqd9",
    kQDVEZ: "x1e8o6a4 xnvbotg",
    kkqsfi: "x1wficvu x1w6ug",
    k3smXN: "x1fzgaqn xaj2e6u",
    kzT0vu: "x14tnc88 xdhbxfy",
    kL20gf: "xtok3t1 x9yvj25",
    kTJQHc: "x1csdrso xwaqzdf",
    kMwMTN: "xs5hli",
    $$css: true
  },
  text: {
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs xqglqw9",
    kb5WsR: "x1cbihlw xhobzj1",
    kKB9KO: "x1t23j8t",
    kUtEtU: "x1ta4xzc",
    kMwMTN: "x19co3pv xs5hli",
    k4aAMt: "xg7jpbn x1iqhqvn",
    ku685b: "xkcp37y",
    $$css: true
  }
};
var foilHooks = {
  surface: "hraness-foil",
  text: "hraness-foil-text"
};
function foilClassName(kind, caller) {
  const hook = foilHooks[kind];
  return [hook, stylex2.props(foilStyles[kind]).className, caller].filter((value) => value !== undefined && value.length > 0).join(" ");
}
var markStyles = {
  root: {
    k1xSpc: "x3nfvp2",
    kVAEAm: "x1n2onr6",
    kEE5IU: "x2lah0s",
    kMwMTN: "xm06a53",
    kN5DiO: "x14ju556",
    kG2bcC: "xxymvpz",
    kULEZF: "x1oizhx2",
    kLWsYc: "x3cr0vx",
    $$css: true
  },
  image: {
    k1xSpc: "x1lliihq",
    kULEZF: "xiuoait",
    kLWsYc: "xuxy95z",
    kKBYww: "x19kjcj4",
    $$css: true
  },
  paint: {
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    k1xSpc: "x1g1hdg2",
    "--_hraness-foil-mark-display": "x543tnb xrpgoez x1hrs4vd",
    kVAEAm: "x10l6tqk",
    kpwlN0: "x10a8y8t",
    kLXb5Q: "x47corl",
    kb5WsR: "x1cbihlw",
    kPmxSn: "xm1fs8r",
    kerMeY: "x5e4rk6",
    kUpoC4: "x16fucec",
    kQEFwb: "x1rudrqi",
    k5bwKO: "x2k2kcx",
    $$css: true
  }
};
function foilMarkClassName(part, caller) {
  const hook = part === "root" ? "hraness-foil-mark" : `hraness-foil-mark__${part}`;
  return [hook, stylex2.props(markStyles[part]).className, caller].filter(Boolean).join(" ");
}

// src/react/foil-mark.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function FoilMark({
  src,
  className,
  label,
  size = 24,
  fallback
}) {
  if (!Number.isFinite(size) || size <= 0)
    throw new RangeError("FoilMark size must be positive and finite.");
  return /* @__PURE__ */ jsxs2("span", {
    "aria-hidden": label === undefined ? true : undefined,
    "aria-label": label,
    className: foilMarkClassName("root", className),
    "data-foil": "",
    role: label === undefined ? undefined : "img",
    style: {
      "--hraness-foil-size": `${size}px`
    },
    children: [
      fallback ?? /* @__PURE__ */ jsx2("img", {
        alt: "",
        className: foilMarkClassName("image"),
        decoding: "async",
        height: size,
        src,
        width: size
      }),
      /* @__PURE__ */ jsx2("span", {
        "aria-hidden": "true",
        className: foilMarkClassName("paint"),
        style: {
          "--hraness-foil-mask": `url(${JSON.stringify(src)})`
        }
      })
    ]
  });
}

// src/react/product-marketing.stylex.ts
import * as stylex3 from "@stylexjs/stylex";
var questionMarker = {
  x1mw0dh9: "x1mw0dh9",
  $$css: true
};
var marketingStyles = {
  factColumns1: {
    "--hraness-marketing-fact-columns": "x1fyigdq",
    $$css: true
  },
  factColumns2: {
    "--hraness-marketing-fact-columns": "xhlljzi",
    $$css: true
  },
  factColumns3: {
    "--hraness-marketing-fact-columns": "xhjkyrr",
    $$css: true
  },
  factColumns4: {
    "--hraness-marketing-fact-columns": "x1mdspvo",
    $$css: true
  },
  pillarColumns1: {
    "--hraness-marketing-pillar-columns": "xphms39",
    $$css: true
  },
  pillarColumns2: {
    "--hraness-marketing-pillar-columns": "xavnjml",
    $$css: true
  },
  pillarColumns3: {
    "--hraness-marketing-pillar-columns": "xz1jsh7",
    $$css: true
  },
  pillarColumns4: {
    "--hraness-marketing-pillar-columns": "xj4arhr",
    $$css: true
  },
  gridColumns1: {
    "--hraness-marketing-grid-columns": "x166dvhg",
    $$css: true
  },
  gridColumns2: {
    "--hraness-marketing-grid-columns": "x10q4e6v",
    $$css: true
  },
  gridColumns3: {
    "--hraness-marketing-grid-columns": "xyqi4l0",
    $$css: true
  },
  gridColumns4: {
    "--hraness-marketing-grid-columns": "x1g57y38",
    $$css: true
  },
  actionFocus: {
    kI3sdo: "x13mrud1",
    kVtf5F: "x7s97pk",
    $$css: true
  },
  page: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kL20gf: "xnrqjil",
    kb5WsR: "x18o3ruo",
    k2EZ2Y: "x1y4qj14",
    kevRTx: "x103pssi",
    kt02CW: "x182nak8",
    kVHNYi: "x12koezg",
    kUtEtU: "x1u7o2vf",
    kdutIq: "x1fdtg7e",
    kLh5Sq: "x1jchvi3",
    kN5DiO: "x1jjo3f5",
    kNmBvv: "x101abm8",
    khuThh: "xvmahel",
    $$css: true
  },
  header: {
    "--hraness-marketing-header-control-target": "xlhppvv",
    "--hraness-sticky-offset": "x1ez4kp7",
    kMwMTN: "xtylnni xs5hli",
    knIRL8: "xrtw95r",
    kVAEAm: "x7wzq59",
    kUvb1J: "xlb5a52",
    kVCA4M: "xf5e64p",
    ke4D0g: "xothggy x1j9yjdw",
    kL20gf: "x1vch632 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kzkQIJ: "x1ts91e6",
    kNGHLb: "x117uaps",
    k99D8V: "x18z9243",
    kNdqCV: "xv2i73l",
    kLjGic: "xtthz4l",
    kpfRUI: "xug5yj",
    kbZlsR: "x1cfjbvc",
    kAFNHU: "x1a4igh8",
    kyY1tn: "xsdpl10",
    kCh6Gp: "x1sz4vi2",
    kzSjEv: "x4aylkk",
    kTJQHc: "xs301gt xwaqzdf",
    $$css: true
  },
  headerStatic: {
    kMwMTN: "xtylnni xs5hli",
    knIRL8: "xrtw95r",
    kVAEAm: "x1uhb9sk",
    kUvb1J: "xlb5a52",
    kVCA4M: "xf5e64p",
    ke4D0g: "xothggy x1j9yjdw",
    kL20gf: "x1vch632 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kzkQIJ: "x1ts91e6",
    kNGHLb: "x117uaps",
    k99D8V: "x18z9243",
    kNdqCV: "xv2i73l",
    kLjGic: "xtthz4l",
    kpfRUI: "xug5yj",
    kbZlsR: "x1cfjbvc",
    kAFNHU: "x1a4igh8",
    kyY1tn: "xsdpl10",
    kCh6Gp: "x1sz4vi2",
    kzSjEv: "x4aylkk",
    kTJQHc: "xs301gt xwaqzdf",
    $$css: true
  },
  main: {
    kdYMnH: "xesnm00",
    ksh8PN: "xtnlt7k",
    $$css: true
  },
  mainPad: {
    kdYMnH: "xesnm00",
    kS5dFF: "xln4sw3",
    ksh8PN: "xtnlt7k",
    $$css: true
  },
  header__inner: {
    k1xSpc: "x78zum5",
    kULEZF: "x19vpta5",
    kVQ08L: "x1jqubh4",
    kkeX5w: "x6s0dn4",
    kOIVth: "x339ura x15qaewu",
    kYk0Dm: "xvueqy4",
    kJVvJu: "xy8kwyo",
    kR2Kwr: "x174t0ru",
    kF3gjK: "x1pggmif",
    $$css: true
  },
  header__brand: {
    ksq1ai: "x6mezaz",
    k1xSpc: "x3nfvp2",
    kkeX5w: "x6s0dn4",
    kOIVth: "x1neeqzj",
    kMwMTN: "x19co3pv xs5hli",
    kVQ08L: "xyiis5",
    kdYMnH: "x1l2grcz",
    kLh5Sq: "x6u19be",
    ko3Kzr: "x1xlr1w8",
    kUEKN5: "xo2cfqc",
    kyVV8l: "x1hl2dhg",
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs xqglqw9",
    kb5WsR: "x1cbihlw xhobzj1",
    kKB9KO: "x1t23j8t",
    kUtEtU: "x1ta4xzc",
    k4aAMt: "xg7jpbn x1iqhqvn",
    ku685b: "xkcp37y x1ejh6ix",
    $$css: true
  },
  header__nav: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak x1nvbnac",
    kkeX5w: "x6s0dn4",
    kOIVth: "xrfvb6r x1csspt3",
    kImiAN: "xvc5jky x1e5rwe6",
    kapXaI: "xqlems",
    kayTVb: "x61vft0",
    kVZ5iK: "xlo9dwz",
    kEE5IU: "x1j56c9r",
    kR2Kky: "x1hzc8rf",
    kF3gjK: "xbdo7qo",
    kJVvJu: "x9qo5wx",
    kNmBvv: "xhasza",
    kMome8: "x5ou8ow",
    ktR8K2: "xptyyiz",
    $$css: true
  },
  header__link: {
    kMwMTN: "xs87ocq x16tyrwk",
    k1xSpc: "x17ilr5v",
    kEE5IU: "x1j56c9r",
    kkeX5w: "x8ua4lr",
    kVQ08L: "xyiis5",
    kBYq9C: "x1m0kxdo",
    kLh5Sq: "x1qzg9v8",
    ko3Kzr: "xk50ysn",
    kyVV8l: "x1hl2dhg",
    $$css: true
  },
  header__linkCurrent: {
    kMwMTN: "xtylnni",
    k1xSpc: "x17ilr5v",
    kEE5IU: "x1j56c9r",
    kkeX5w: "x8ua4lr",
    kVQ08L: "xyiis5",
    kBYq9C: "x1m0kxdo",
    kLh5Sq: "x1qzg9v8",
    ko3Kzr: "xk50ysn",
    kyVV8l: "x1hl2dhg",
    $$css: true
  },
  header__actions: {
    k1xSpc: "x78zum5",
    kkeX5w: "x6s0dn4",
    kOIVth: "x13z6uf9",
    kImiAN: "x1mqiwji",
    $$css: true
  },
  footer: {
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x7oktz0",
    khsPd: "xlejusl",
    $$css: true
  },
  footer__inner: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x6s0dn4",
    kOIVth: "x1lx4akv",
    kULEZF: "x19vpta5",
    kYk0Dm: "xvueqy4",
    kF3gjK: "xosp1vk",
    kJVvJu: "xy8kwyo",
    $$css: true
  },
  footer__brand: {
    k1xSpc: "x3nfvp2",
    kkeX5w: "x6s0dn4",
    kOIVth: "x1neeqzj",
    kMwMTN: "xtylnni",
    kLh5Sq: "x6u19be",
    ko3Kzr: "x1xlr1w8",
    kUEKN5: "xo2cfqc",
    kyVV8l: "x1hl2dhg",
    $$css: true
  },
  footer__brandFoil: {
    k1xSpc: "x3nfvp2",
    kkeX5w: "x6s0dn4",
    kOIVth: "x1neeqzj",
    kMwMTN: "x19co3pv xs5hli",
    kLh5Sq: "x6u19be",
    ko3Kzr: "x1xlr1w8",
    kUEKN5: "xo2cfqc",
    kyVV8l: "x1hl2dhg",
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs xqglqw9",
    kb5WsR: "x1cbihlw xhobzj1",
    kKB9KO: "x1t23j8t",
    kUtEtU: "x1ta4xzc",
    k4aAMt: "xg7jpbn x1iqhqvn",
    ku685b: "xkcp37y x1ejh6ix",
    $$css: true
  },
  footer__name: {
    ksq1ai: "x6mezaz",
    kVQacm: "xb3r6kr",
    kd00dl: "xlyipyv",
    kBYq9C: "xuxw1ft",
    $$css: true
  },
  footer__nav: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x6s0dn4",
    kOIVth: "xrfvb6r",
    kImiAN: "xvc5jky",
    $$css: true
  },
  footer__link: {
    kMwMTN: "xs87ocq x16tyrwk",
    kLh5Sq: "x1qzg9v8",
    ko3Kzr: "xk50ysn",
    kyVV8l: "x1hl2dhg",
    $$css: true
  },
  footer__linkCurrent: {
    kMwMTN: "xtylnni",
    kLh5Sq: "x1qzg9v8",
    ko3Kzr: "xk50ysn",
    kyVV8l: "x1hl2dhg",
    $$css: true
  },
  heroSplit: {
    kg9kkx: "x1mkdm3x x13f99nf",
    kkeX5w: "x6s0dn4",
    $$css: true
  },
  hero: {
    kVAEAm: "x1n2onr6",
    kHBbk8: "xc8icb0",
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    k1xSpc: "xrvj5dj",
    kOIVth: "x1kfhdh0",
    kF3gjK: "xgu4rd8",
    $$css: true
  },
  heroAccent: {
    kVAEAm: "x1n2onr6",
    kHBbk8: "xc8icb0",
    kMwMTN: "x102ovp5 xs5hli",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    k1xSpc: "xrvj5dj",
    kOIVth: "x1kfhdh0",
    kF3gjK: "xgu4rd8",
    kL20gf: "xvor1dj x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "x5kubdt xwaqzdf",
    keKwNi: "xmdugnb",
    k99D8V: "x18z9243",
    kNdqCV: "xv2i73l",
    kLjGic: "xtthz4l",
    kpfRUI: "xug5yj",
    kbZlsR: "x1cfjbvc",
    kAFNHU: "x1a4igh8",
    kyY1tn: "xsdpl10",
    kCh6Gp: "x1sz4vi2",
    kzSjEv: "x4aylkk",
    $$css: true
  },
  hero__copy: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    k9dNZF: "x1o2pa38",
    kOIVth: "x15iy025",
    kMCLAl: "x2b8uid",
    $$css: true
  },
  hero__copyStart: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    k9dNZF: "x619ttb",
    kOIVth: "x15iy025",
    kMCLAl: "x1yc453h",
    $$css: true
  },
  hero__eyebrow: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq xs5hli",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    k1xSpc: "x3nfvp2",
    kkeX5w: "x6s0dn4",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x1717udv",
    k99D8V: "x6umtig",
    kNdqCV: "x1tj6v8e",
    kLjGic: "xaqea5y",
    kpfRUI: "xwqakj",
    kbZlsR: "x18sabzy",
    kAFNHU: "x1jleocg",
    kyY1tn: "x1pjjote",
    kCh6Gp: "x1e53mt7",
    kzSjEv: "xgkqhyc",
    kvZwPi: "x2u8bby",
    kL20gf: "xjbqb8w",
    kb5WsR: "x18o3ruo",
    k2EZ2Y: "x1y4qj14",
    kevRTx: "x103pssi",
    kt02CW: "x182nak8",
    kVHNYi: "x12koezg",
    kUtEtU: "x1u7o2vf",
    kdutIq: "x1fdtg7e",
    $$css: true
  },
  hero__eyebrowAccent: {
    kogj98: "x1ghz6dp",
    kMwMTN: "x102ovp5",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    k1xSpc: "x3nfvp2",
    kkeX5w: "x6s0dn4",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x1717udv",
    k99D8V: "x6umtig",
    kNdqCV: "x1tj6v8e",
    kLjGic: "xaqea5y",
    kpfRUI: "xwqakj",
    kbZlsR: "x18sabzy",
    kAFNHU: "x1jleocg",
    kyY1tn: "x1pjjote",
    kCh6Gp: "x1e53mt7",
    kzSjEv: "xgkqhyc",
    kvZwPi: "x2u8bby",
    kL20gf: "xjbqb8w",
    kb5WsR: "x18o3ruo",
    k2EZ2Y: "x1y4qj14",
    kevRTx: "x103pssi",
    kt02CW: "x182nak8",
    kVHNYi: "x12koezg",
    kUtEtU: "x1u7o2vf",
    kdutIq: "x1fdtg7e",
    $$css: true
  },
  hero__name: {
    kogj98: "xkdpibf",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    kVAEAm: "x10l6tqk",
    kULEZF: "xi8173g",
    kLWsYc: "xpoyz9m",
    kmVPX3: "x1717udv",
    kVQacm: "xb3r6kr",
    kMcinP: "xeh89do",
    keKwNi: "x1hyvwdk",
    kBYq9C: "xuxw1ft",
    k99D8V: "x6umtig",
    kNdqCV: "x1tj6v8e",
    kLjGic: "xaqea5y",
    kpfRUI: "xwqakj",
    kbZlsR: "x18sabzy",
    kAFNHU: "x1jleocg",
    kyY1tn: "x1pjjote",
    kCh6Gp: "x1e53mt7",
    kzSjEv: "xgkqhyc",
    $$css: true
  },
  hero__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x1y508rd",
    kN5DiO: "xkj4vsn",
    kYjUv9: "x1w2vvpw",
    k2kXS: "x17152no x6ri7ij",
    kLh5Sq: "xbs339",
    $$css: true
  },
  hero__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1h87l4j",
    kN5DiO: "x1nt6xn0",
    k2kXS: "x1l2wkh2",
    $$css: true
  },
  hero__install: {
    kULEZF: "xsjjiva",
    kdYMnH: "xesnm00",
    kAiAap: "x1n5adje",
    kMCLAl: "x1yc453h",
    $$css: true
  },
  hero__example: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1ksoetq",
    kN5DiO: "x1evy7pa",
    k2kXS: "x1ic370k",
    kAiAap: "xcf5i7g",
    $$css: true
  },
  hero__actions: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x6s0dn4",
    kOIVth: "x5m0csh",
    kGmCso: "xl56j7k",
    kAiAap: "xphehyp",
    $$css: true
  },
  hero__actionsStart: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x6s0dn4",
    kOIVth: "x5m0csh",
    kGmCso: "x1nhvcw1",
    kAiAap: "xphehyp",
    $$css: true
  },
  hero__boundary: {
    k2kXS: "x1l2wkh2",
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "x1nrrp6k",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  hero__frame: {
    kdYMnH: "xesnm00",
    $$css: true
  },
  proof: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kOIVth: "x8fetqu",
    kmVPX3: "x12fqarx",
    k99D8V: "x17p5ghk x18z9243",
    kNdqCV: "x16x8cr2 xv2i73l",
    kLjGic: "x1w0e1mo xtthz4l",
    kpfRUI: "x72sy0d xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "xtnh2io xwaqzdf",
    kMwMTN: "xs5hli",
    $$css: true
  },
  proof__kicker: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  proof__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    k2kXS: "x1nrp9oy",
    kLh5Sq: "xksl5lr",
    $$css: true
  },
  flow: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kohv2D: "xe8uvvx",
    $$css: true
  },
  flow__step: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kogj98: "x1ghz6dp",
    kF3gjK: "xgepmj6",
    khsPd: "xlejusl",
    kOIVth: "x94aazo",
    kg9kkx: "x17bfdo5",
    $$css: true
  },
  flow__stepFirst: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kogj98: "x1ghz6dp",
    kF3gjK: "xgepmj6",
    khsPd: "x1cjc3ue",
    kOIVth: "x94aazo",
    kg9kkx: "x17bfdo5",
    $$css: true
  },
  flow__number: {
    kS5dFF: "x17lzgkz",
    kMwMTN: "xoh73e0",
    knIRL8: "x1pkbhk2",
    kLh5Sq: "xboafo0",
    ko3Kzr: "xk50ysn",
    $$css: true
  },
  flow__body: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kOIVth: "x1neeqzj",
    $$css: true
  },
  flow__label: {
    k1xSpc: "x1lliihq",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "x1s688f",
    $$css: true
  },
  flow__code: {
    k1xSpc: "x1lliihq",
    kULEZF: "x6n8wx1",
    k2kXS: "xgyk9h7",
    kmVPX3: "x1yen4p6",
    kvZwPi: "x18jy0o0",
    kL20gf: "x1218lln",
    kb5WsR: "x18o3ruo",
    k2EZ2Y: "x1y4qj14",
    kevRTx: "x103pssi",
    kt02CW: "x182nak8",
    kVHNYi: "x12koezg",
    kUtEtU: "x1u7o2vf",
    kdutIq: "x1fdtg7e",
    kMwMTN: "x1heor9g",
    knIRL8: "x1pkbhk2",
    kLh5Sq: "xgommxb",
    k7QVf6: "xj0a0fe",
    $$css: true
  },
  flow__detail: {
    k1xSpc: "x1lliihq",
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "x1nrrp6k",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  facts: {
    k1xSpc: "xrvj5dj",
    kogj98: "x1ghz6dp",
    kPTwvd: "xqjagye",
    kg9kkx: "x3g07o8 xr827i4",
    $$css: true
  },
  facts__item: {
    kdYMnH: "xesnm00",
    kmVPX3: "x1dk9mx5",
    k50O2T: "xuk7mnp",
    $$css: true
  },
  facts__itemLater: {
    kdYMnH: "xesnm00",
    kmVPX3: "x1dk9mx5",
    k50O2T: "x9l8fd4",
    $$css: true
  },
  facts__itemOdd: {
    kdYMnH: "xesnm00",
    kmVPX3: "x1dk9mx5",
    k50O2T: "x9l8fd4 xuk7mnp",
    $$css: true
  },
  facts__itemRow: {
    kdYMnH: "xesnm00",
    kmVPX3: "x1dk9mx5",
    k50O2T: "x9l8fd4",
    khsPd: "x1rzon3k",
    $$css: true
  },
  facts__itemRowOdd: {
    kdYMnH: "xesnm00",
    kmVPX3: "x1dk9mx5",
    k50O2T: "x9l8fd4 xuk7mnp",
    khsPd: "x1rzon3k",
    $$css: true
  },
  facts__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    klAkkO: "x19u27g3",
    $$css: true
  },
  facts__body: {
    kogj98: "x1ghz6dp",
    $$css: true
  },
  facts__value: {
    k1xSpc: "x1lliihq",
    kLh5Sq: "x1ksoetq",
    ko3Kzr: "x1s688f",
    $$css: true
  },
  facts__detail: {
    k1xSpc: "x1lliihq",
    kAiAap: "x2qgizq",
    kMwMTN: "xs87ocq",
    kLh5Sq: "x1qzg9v8",
    kN5DiO: "xfrs9s4",
    $$css: true
  },
  stats: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    k1xSpc: "xrvj5dj",
    kOIVth: "x8233eu",
    kF3gjK: "x1nyyes6",
    $$css: true
  },
  stats__list: {
    k1xSpc: "xrvj5dj",
    kogj98: "x1ghz6dp",
    kPTwvd: "xqjagye",
    kg9kkx: "x3g07o8 xr827i4",
    $$css: true
  },
  notice: {
    kHjnXC: "x9f619",
    kULEZF: "xovzq4p",
    kdYMnH: "xesnm00",
    kCbEA6: "xvljh0b",
    kYk0Dm: "xvueqy4",
    kF3gjK: "xo0yzjp",
    kJVvJu: "xnxx81d",
    k50O2T: "x1xhxxw4",
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    kN5DiO: "x1evy7pa",
    k7QVf6: "xj0a0fe",
    $$css: true
  },
  noticeSuccess: {
    kEreRy: "x2t7zc3",
    $$css: true
  },
  noticeError: {
    kEreRy: "xn0urz2",
    $$css: true
  },
  stats__source: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "x1qzg9v8",
    $$css: true
  },
  stats__value: {
    k1xSpc: "x1lliihq",
    knIRL8: "xb0810w",
    kLh5Sq: "x1cic291",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x72az59",
    kN5DiO: "x1159mfc",
    kNUL7p: "xss6m8b",
    $$css: true
  },
  pillars: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    k1xSpc: "xrvj5dj",
    kCbEA6: "x10im51j",
    kF3gjK: "xt970qd",
    kPTwvd: "xqjagye",
    kg9kkx: "x1hqbthl xj7gdfw",
    $$css: true
  },
  pillarsBenefits: {
    kPTwvd: "x4st1jw",
    kOIVth: "xia337e",
    $$css: true
  },
  pillars__benefit: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kNk6WL: "x10ukxgv",
    kOIVth: "x8233eu",
    kmVPX3: "x1717udv",
    kPTwvd: "x4st1jw",
    kSHCDd: "x5jh6js",
    $$css: true
  },
  pillars__icon: {
    k1xSpc: "x1lliihq",
    kULEZF: "xsta65m",
    kLWsYc: "xkl2xug",
    klAkkO: "xe92vt",
    kMwMTN: "xzwifym",
    $$css: true
  },
  pillars__item: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kNk6WL: "x10ukxgv",
    kOIVth: "x1rcpt3j",
    kmVPX3: "xskt5hv",
    $$css: true
  },
  pillars__itemLater: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kNk6WL: "x10ukxgv",
    kOIVth: "x1rcpt3j",
    kmVPX3: "xskt5hv",
    k50O2T: "x9l8fd4 xuk7mnp",
    khsPd: "x1rzon3k",
    $$css: true
  },
  pillars__label: {
    kLh5Sq: "x1ksoetq",
    ko3Kzr: "x1s688f",
    kUEKN5: "xjat59b",
    $$css: true
  },
  pillars__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "xyr29y3",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  proof_frame: {
    kMwMTN: "xtylnni xs5hli",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kCbEA6: "x10im51j",
    kYk0Dm: "xvueqy4",
    kVQacm: "x7giv3",
    k99D8V: "x17p5ghk x18z9243",
    kNdqCV: "x16x8cr2 xv2i73l",
    kLjGic: "x1w0e1mo xtthz4l",
    kpfRUI: "x72sy0d xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "xtnh2io xwaqzdf",
    $$css: true
  },
  proof_frame__chrome: {
    k1xSpc: "x78zum5",
    kkeX5w: "x6s0dn4",
    kOIVth: "x8233eu",
    kmVPX3: "x86o7ao",
    kb5WsR: "x1drtmal xhobzj1",
    kTJQHc: "xs301gt xwaqzdf",
    ke4D0g: "xothggy x1j9yjdw",
    kMwMTN: "xs87ocq",
    kLh5Sq: "xp1qmoa",
    $$css: true
  },
  proof_frame__lights: {
    k1xSpc: "x3nfvp2",
    kOIVth: "x73f2yu",
    $$css: true
  },
  proof_frame__light: {
    kULEZF: "x19a4nw2",
    kLWsYc: "x10oi0ya",
    kvZwPi: "x1e6avla",
    kL20gf: "xw7x07y",
    kb5WsR: "x18o3ruo",
    k2EZ2Y: "x1y4qj14",
    kevRTx: "x103pssi",
    kt02CW: "x182nak8",
    kVHNYi: "x12koezg",
    kUtEtU: "x1u7o2vf",
    kdutIq: "x1fdtg7e",
    $$css: true
  },
  proof_frame__title: {
    kUk6DE: "x12lumcd",
    kVQacm: "xb3r6kr",
    kMCLAl: "x2b8uid",
    kd00dl: "xlyipyv",
    kBYq9C: "xuxw1ft",
    $$css: true
  },
  proof_frame__content: {
    kdYMnH: "xesnm00",
    kVQacm: "xysyzu8",
    $$css: true
  },
  proof_frame__caption: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kGmCso: "x1qughib",
    kOIVth: "x4upkte",
    kmVPX3: "xslvvub",
    khsPd: "xlejusl",
    kMwMTN: "xs87ocq",
    kLh5Sq: "xym1t2f",
    kN5DiO: "xfrs9s4",
    $$css: true
  },
  proof_frame__credit: {
    kLh5Sq: "xp1qmoa",
    $$css: true
  },
  proof_frame__title_mono: {
    kUk6DE: "x12lumcd",
    kVQacm: "xb3r6kr",
    knIRL8: "x1pkbhk2",
    kMCLAl: "x2b8uid",
    kd00dl: "xlyipyv",
    kBYq9C: "xuxw1ft",
    $$css: true
  },
  proof_frame__address: {
    kUk6DE: "xxszbp0",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kmVPX3: "xo16nda",
    kVQacm: "xb3r6kr",
    kvZwPi: "x1e6avla",
    kL20gf: "x1lvhz8c x9yvj25",
    kI3sdo: "x1a2a7pz x1sah7t",
    kMwMTN: "xs87ocq",
    knIRL8: "x1pkbhk2",
    kLh5Sq: "x142gn8v",
    kMCLAl: "x2b8uid",
    kd00dl: "xlyipyv",
    kBYq9C: "xuxw1ft",
    $$css: true
  },
  data_table: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kCbEA6: "x10im51j",
    kYk0Dm: "xvueqy4",
    kLh5Sq: "xyr29y3",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  data_table__head: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x1pha0wt",
    kGmCso: "x1qughib",
    kOIVth: "x1a0l8n0",
    klAkkO: "x16287ni",
    $$css: true
  },
  data_table__title: {
    kMwMTN: "xtylnni",
    ko3Kzr: "x7cedwp",
    kUEKN5: "xjat59b",
    $$css: true
  },
  data_table__meta: {
    kMwMTN: "xs87ocq xs5hli",
    kLh5Sq: "xym1t2f",
    $$css: true
  },
  data_table__scroll: {
    k2kXS: "xgyk9h7",
    kNmBvv: "xw2csxc",
    khsPd: "xlejusl x1ndh9ne",
    ke4D0g: "xknh1wj x1j9yjdw",
    $$css: true
  },
  data_table__table: {
    kULEZF: "xiuoait",
    kZnR7y: "x1mwwwfo",
    kNUL7p: "xss6m8b",
    $$css: true
  },
  data_table__heading: {
    kmVPX3: "x3699eh",
    kG2bcC: "x11njtxf",
    kMwMTN: "xs87ocq xs5hli",
    kLh5Sq: "xgommxb",
    ko3Kzr: "xk50ysn",
    kBYq9C: "xuxw1ft",
    $$css: true
  },
  data_table__row_heading: {
    kmVPX3: "x3699eh",
    kG2bcC: "x11njtxf",
    kMwMTN: "xtylnni",
    ko3Kzr: "xk50ysn",
    khsPd: "xlejusl x1ndh9ne",
    $$css: true
  },
  data_table__cell: {
    kmVPX3: "x3699eh",
    kG2bcC: "x11njtxf",
    khsPd: "xlejusl x1ndh9ne",
    $$css: true
  },
  data_table__note: {
    kogj98: "x1ghz6dp",
    kAiAap: "x4pwpt2",
    k2kXS: "xjq529q",
    kMwMTN: "xs87ocq xs5hli",
    kLh5Sq: "xyr29y3",
    $$css: true
  },
  code: {
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kCbEA6: "x10im51j",
    kYk0Dm: "xvueqy4",
    $$css: true
  },
  install: {
    kMwMTN: "xtylnni xs5hli",
    knIRL8: "xrtw95r",
    kULEZF: "x1ool8vb",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    k1xSpc: "xrvj5dj",
    kmVPX3: "x1cje537",
    k99D8V: "xzdcvt0 x18z9243",
    kNdqCV: "xl0qb3l xv2i73l",
    kLjGic: "x1ld2yh7 xtthz4l",
    kpfRUI: "xm9c49u xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kOIVth: "xmpxahs",
    kg9kkx: "x1xdnkkc xj7gdfw",
    ksh8PN: "x1ctcpvu",
    kTJQHc: "xwaqzdf",
    $$css: true
  },
  install__heading_group: {
    k1xSpc: "xrvj5dj",
    kNk6WL: "x10ukxgv",
    kOIVth: "x13z6uf9",
    $$css: true
  },
  install__eyebrow: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  install__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    k2kXS: "x14vmqpl x1h8pmfy",
    kLh5Sq: "xafhd6w",
    $$css: true
  },
  install__commands: {
    kdYMnH: "xesnm00",
    k1xSpc: "xrvj5dj",
    kOIVth: "x8233eu",
    $$css: true
  },
  section: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13p3q8k",
    $$css: true
  },
  sectionSplit: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13p3q8k",
    kkeX5w: "x6s0dn4",
    kg9kkx: "x1bu5on4 xj7gdfw",
    $$css: true
  },
  section__heading_group: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x8233eu",
    $$css: true
  },
  section__heading_groupSplit: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1tec7hu",
    kOIVth: "x8233eu",
    $$css: true
  },
  section__heading_groupReverse: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1tec7hu",
    kOIVth: "x8233eu",
    kayTVb: "x14yy4lh xnf0n60",
    $$css: true
  },
  section__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  sectionLabelBody: {
    kLh5Sq: "x1jchvi3",
    $$css: true
  },
  section__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xixn193",
    $$css: true
  },
  section__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  section__heading_content: {
    k1xSpc: "xrvj5dj",
    kOIVth: "x15iy025",
    kdYMnH: "xesnm00",
    kAiAap: "xsyyole",
    k9dNZF: "x619ttb",
    $$css: true
  },
  section__body: {
    kdYMnH: "xesnm00",
    k1xSpc: "xrvj5dj",
    kOIVth: "x8fetqu",
    $$css: true
  },
  primitives: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13p3q8k",
    $$css: true
  },
  primitives__header: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x8233eu",
    $$css: true
  },
  primitives__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  primitives__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xixn193",
    $$css: true
  },
  primitives__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  interfaces: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13p3q8k",
    $$css: true
  },
  interfaces__header: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x8233eu",
    $$css: true
  },
  interfaces__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  interfaces__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xixn193",
    $$css: true
  },
  interfaces__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  related: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13p3q8k",
    $$css: true
  },
  related__header: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x8233eu",
    $$css: true
  },
  related__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  related__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xixn193",
    $$css: true
  },
  related__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  related__groups: {
    k1xSpc: "xrvj5dj",
    kg9kkx: "xdkhdln",
    kOIVth: "x1h7ehgl",
    kkeX5w: "x7a106z",
    $$css: true
  },
  related__group: {
    "--hraness-marketing-related-tone": "x1fe84dw x3te53c",
    k1xSpc: "xrvj5dj",
    kOIVth: "x8fetqu",
    kdYMnH: "xesnm00",
    khsPd: "x19fofvp",
    kS5dFF: "x10sryfm",
    $$css: true
  },
  related__group_header: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x13z6uf9",
    $$css: true
  },
  related__group_heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    ko3Kzr: "x1s688f",
    kUEKN5: "xjat59b",
    kN5DiO: "x1xfvgam",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "x1c3i2sq",
    $$css: true
  },
  related__group_summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1jchvi3",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  related__list: {
    "--hraness-marketing-grid-columns": "xogmzgw",
    "--_hraness-marketing-grid-track": "x1275dpl",
    kg9kkx: "x1h695s4",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13z6uf9",
    kohv2D: "xe8uvvx",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kdYMnH: "xesnm00",
    $$css: true
  },
  related__item: {
    kogj98: "x1ghz6dp",
    kdYMnH: "xesnm00",
    $$css: true
  },
  related__card: {
    k1xSpc: "x78zum5",
    kvQiKF: "x1q0g3np",
    kkeX5w: "x1cy8zhl",
    kVAEAm: "x1n2onr6",
    kdYMnH: "xesnm00",
    kVQ08L: "x4q3qzj",
    kOIVth: "x94aazo",
    kmVPX3: "x1v5tq4r",
    kYk0Dm: "xrxpjvj",
    k99D8V: "x6umtig",
    kNdqCV: "x1tj6v8e",
    kLjGic: "xaqea5y",
    kpfRUI: "xwqakj",
    kvZwPi: "x6i6fhv",
    kL20gf: "xjbqb8w xjoriyk",
    kMwMTN: "xtylnni",
    kyVV8l: "x1hl2dhg",
    kTJQHc: "x1gnnqk1",
    kI3sdo: "xg81e2w",
    kVtf5F: "x1bqaal",
    $$css: true
  },
  related__card_mark: {
    "--hraness-foil-text-base": "x74bjxz",
    kMwMTN: "xq5ojvh",
    kVZ5iK: "x1c4vz4f",
    kEE5IU: "x2lah0s",
    kR2Kky: "xdl72j9",
    k1xSpc: "x3nfvp2",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kULEZF: "x1mgeycz",
    kLWsYc: "x18i7o63",
    kAiAap: "x1lepkon",
    $$css: true
  },
  related__card_text: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xl8vk3q",
    kdYMnH: "xesnm00",
    $$css: true
  },
  related__card_heading: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x1pha0wt",
    kpnIzl: "x19hr0qk",
    $$css: true
  },
  related__card_name: {
    ksq1ai: "x6mezaz",
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1lkfr7t",
    ko3Kzr: "x1s688f",
    kUEKN5: "xjat59b",
    kN5DiO: "x1xfvgam",
    k7QVf6: "xj0a0fe",
    kXaGww: "xujl8zx",
    kCBxTS: "xi2nhp4",
    kRHfhz: "x4k6xgu",
    kKoZWP: "xyi4chj",
    k1PBYE: "x1ohr1zr",
    $$css: true
  },
  related__card_domain: {
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1dcheo9",
    ko3Kzr: "xo1l8bm",
    kN5DiO: "x1evy7pa",
    k7QVf6: "xj0a0fe",
    $$css: true
  },
  related__card_role: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x6u19be",
    kN5DiO: "xfrs9s4",
    k7QVf6: "xj0a0fe",
    kYjUv9: "x1fzhlzt",
    $$css: true
  },
  relatedToneRose: {
    "--hraness-marketing-related-tone": "xguwbwv x3te53c",
    $$css: true
  },
  relatedToneIndigo: {
    "--hraness-marketing-related-tone": "xw4kusz x3te53c",
    $$css: true
  },
  relatedToneAmber: {
    "--hraness-marketing-related-tone": "xk35eb0 x3te53c",
    $$css: true
  },
  relatedToneEmerald: {
    "--hraness-marketing-related-tone": "x1kw80uk x3te53c",
    $$css: true
  },
  trust: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13p3q8k",
    $$css: true
  },
  trust__header: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x8233eu",
    $$css: true
  },
  trust__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  trust__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xixn193",
    $$css: true
  },
  trust__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  quotes: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13p3q8k",
    $$css: true
  },
  quotes__header: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x8233eu",
    $$css: true
  },
  quotes__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  quotes__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xixn193",
    $$css: true
  },
  quotes__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  pricing: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13p3q8k",
    $$css: true
  },
  pricing__header: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x8233eu",
    $$css: true
  },
  pricing__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  pricing__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xixn193",
    $$css: true
  },
  pricing__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  questions: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kOIVth: "x13p3q8k",
    $$css: true
  },
  questions__header: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x8233eu",
    $$css: true
  },
  questions__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  questions__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xixn193",
    $$css: true
  },
  questions__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  maker: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    ksh8PN: "x1ctcpvu",
    k1xSpc: "xrvj5dj",
    kkeX5w: "x7a106z",
    kOIVth: "x13p3q8k",
    kg9kkx: "x19eo8ko xj7gdfw",
    $$css: true
  },
  maker__header: {
    k1xSpc: "xrvj5dj",
    k2kXS: "x1l2wkh2",
    kOIVth: "x8233eu",
    $$css: true
  },
  maker__label: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  maker__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "xjnvrkt",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xixn193",
    $$css: true
  },
  primitives__list: {
    "--hraness-marketing-grid-columns": "xogmzgw",
    "--_hraness-marketing-grid-track": "xwl1ywu",
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kohv2D: "xe8uvvx",
    kOIVth: "x8fetqu",
    kg9kkx: "x1ui45ma",
    $$css: true
  },
  primitive: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kVQ08L: "x1ljpu7r",
    kNk6WL: "x10ukxgv",
    kOIVth: "x1uma3xh",
    kmVPX3: "x1nn0urv",
    k99D8V: "x17p5ghk x18z9243",
    kNdqCV: "x16x8cr2 xv2i73l",
    kLjGic: "x1w0e1mo xtthz4l",
    kpfRUI: "x72sy0d xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "x1io0m3d xwaqzdf",
    kMwMTN: "xs5hli",
    $$css: true
  },
  primitive__number: {
    kMwMTN: "xoh73e0",
    knIRL8: "x1pkbhk2",
    kLh5Sq: "xp1qmoa",
    ko3Kzr: "xk50ysn",
    $$css: true
  },
  primitive__heading: {
    kogj98: "x1ghz6dp",
    kLh5Sq: "x1hptrd9",
    ko3Kzr: "x1s688f",
    kUEKN5: "xjat59b",
    $$css: true
  },
  primitive__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "xyr29y3",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  interface_grid: {
    "--hraness-marketing-grid-columns": "xogmzgw",
    "--_hraness-marketing-grid-track": "x9wro72",
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kOIVth: "x8fetqu",
    kg9kkx: "x1v4bfo1",
    $$css: true
  },
  trust_grid: {
    "--hraness-marketing-grid-columns": "xogmzgw",
    "--_hraness-marketing-grid-track": "x9wro72",
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kOIVth: "x8fetqu",
    kg9kkx: "x1v4bfo1",
    $$css: true
  },
  interface: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kVQ08L: "x1ljpu7r",
    kNk6WL: "x10ukxgv",
    kOIVth: "x13z6uf9",
    kmVPX3: "x1nn0urv",
    k99D8V: "x17p5ghk x18z9243",
    kNdqCV: "x16x8cr2 xv2i73l",
    kLjGic: "x1w0e1mo xtthz4l",
    kpfRUI: "x72sy0d xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "x1io0m3d xwaqzdf",
    kMwMTN: "xs5hli",
    $$css: true
  },
  trust_item: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kVQ08L: "x1ljpu7r",
    kNk6WL: "x10ukxgv",
    kOIVth: "x13z6uf9",
    kmVPX3: "x1nn0urv",
    k99D8V: "x17p5ghk x18z9243",
    kNdqCV: "x16x8cr2 xv2i73l",
    kLjGic: "x1w0e1mo xtthz4l",
    kpfRUI: "x72sy0d xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "x1io0m3d xwaqzdf",
    kMwMTN: "xs5hli",
    $$css: true
  },
  interface__heading: {
    kogj98: "x1ghz6dp",
    kLh5Sq: "x1ksoetq",
    ko3Kzr: "x1s688f",
    kUEKN5: "xjat59b",
    $$css: true
  },
  interface__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "xyr29y3",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  trust_item__label: {
    kogj98: "x1ghz6dp",
    kLh5Sq: "x1ksoetq",
    ko3Kzr: "x1s688f",
    kUEKN5: "xjat59b",
    $$css: true
  },
  trust_item__detail: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "xyr29y3",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  card_row: {
    "--hraness-marketing-grid-columns": "xogmzgw",
    "--_hraness-marketing-grid-track": "x9wro72",
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kOIVth: "x8fetqu",
    kg9kkx: "x1v4bfo1",
    $$css: true
  },
  card: {
    k1xSpc: "x78zum5",
    kvQiKF: "xdt5ytf",
    kVAEAm: "x1n2onr6",
    kHBbk8: "xc8icb0",
    kdYMnH: "xesnm00",
    kVQ08L: "x1ljpu7r",
    k29mPU: "xkh2ocl",
    kOIVth: "x13z6uf9",
    kmVPX3: "x1nn0urv",
    k99D8V: "x17p5ghk x18z9243",
    kNdqCV: "x16x8cr2 xv2i73l",
    kLjGic: "x1w0e1mo xtthz4l",
    kpfRUI: "x72sy0d xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "x1io0m3d xwaqzdf",
    kMwMTN: "x1heor9g xs5hli",
    kyVV8l: "x1hl2dhg",
    $$css: true
  },
  cardIcon: {
    k1xSpc: "x78zum5",
    kvQiKF: "x1q0g3np",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x6s0dn4",
    kOIVth: "x8fetqu",
    kmVPX3: "x1aetswf",
    kI3sdo: "xg81e2w",
    kVtf5F: "xj3ae5l",
    $$css: true
  },
  card__icon: {
    k1xSpc: "x78zum5",
    kVZ5iK: "x1c4vz4f",
    kEE5IU: "x2lah0s",
    kR2Kky: "x1vhnul8",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kULEZF: "x1pf0uk5",
    kLWsYc: "x1vlpzvb",
    kdYMnH: "xesnm00",
    kLXb5Q: "x47corl",
    $$css: true
  },
  card__copy: {
    k1xSpc: "xrvj5dj",
    kVZ5iK: "x1iyjqo2",
    kEE5IU: "xs83m0k",
    kR2Kky: "x1kfky9y",
    kNk6WL: "xc26acl",
    kdYMnH: "xesnm00",
    kOIVth: "x73f2yu",
    $$css: true
  },
  cardMetaIcon: {
    kVQacm: "x1rea2x4",
    kVQ08L: "x159srwy",
    kLO5vc: "x1vj640n",
    k7QVf6: "xj0a0fe",
    $$css: true
  },
  card__art: {
    k1xSpc: "x78zum5",
    kVZ5iK: "x1c4vz4f",
    kEE5IU: "x2lah0s",
    kR2Kky: "xdl72j9",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kVAEAm: "x1n2onr6",
    kHBbk8: "xc8icb0",
    ktR8K2: "x16qrkmw",
    kVQacm: "xb3r6kr",
    kdYMnH: "xesnm00",
    k2kXS: "xgyk9h7",
    kULEZF: "xiuoait",
    kVQ08L: "x4q3qzj",
    k99D8V: "x18z9243",
    kNdqCV: "xv2i73l",
    kLjGic: "xtthz4l",
    kpfRUI: "xug5yj",
    kvZwPi: "x19hin1r",
    kL20gf: "x13ysuu0 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "xwaqzdf",
    kMwMTN: "xs5hli",
    $$css: true
  },
  card__title: {
    kogj98: "x1ghz6dp",
    kLh5Sq: "x1ksoetq",
    ko3Kzr: "x1s688f",
    kUEKN5: "xjat59b",
    k7QVf6: "xj0a0fe",
    $$css: true
  },
  card__meta: {
    kVQacm: "xb3r6kr",
    kVQ08L: "x1rmki91",
    kLO5vc: "xeutgw3",
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "x1qzg9v8",
    kN5DiO: "xfrs9s4",
    $$css: true
  },
  card__body: {
    k1xSpc: "x78zum5",
    kVZ5iK: "x1iyjqo2",
    kEE5IU: "xs83m0k",
    kR2Kky: "xdl72j9",
    kvQiKF: "xdt5ytf",
    kVQ08L: "x159srwy",
    kOIVth: "x73f2yu",
    $$css: true
  },
  quote_grid: {
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kohv2D: "xe8uvvx",
    kOIVth: "x8fetqu",
    kg9kkx: "xeonaw6",
    $$css: true
  },
  quote: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kVQ08L: "x1ljpu7r",
    kNk6WL: "xcdzlcm",
    kOIVth: "x15iy025",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1nn0urv",
    k99D8V: "x17p5ghk x18z9243",
    kNdqCV: "x16x8cr2 xv2i73l",
    kLjGic: "x1w0e1mo xtthz4l",
    kpfRUI: "x72sy0d xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "x1io0m3d xwaqzdf",
    kMwMTN: "xs5hli",
    $$css: true
  },
  quote__body: {
    kogj98: "x1ghz6dp",
    kLh5Sq: "x1jchvi3",
    kN5DiO: "x1jjo3f5",
    $$css: true
  },
  quote__text: {
    kogj98: "x1ghz6dp",
    $$css: true
  },
  quote__attribution: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x1pha0wt",
    kOIVth: "x38wis9",
    kMwMTN: "xs87ocq",
    kLh5Sq: "x16vn6xf",
    $$css: true
  },
  quote__name: {
    kMwMTN: "xtylnni",
    ko3Kzr: "x1s688f",
    $$css: true
  },
  quote__link: {
    kMwMTN: "x1heor9g",
    kXaGww: "xujl8zx",
    kCBxTS: "xi2nhp4",
    kRHfhz: "x4k6xgu x9ojkr9 x1e7jyuc",
    kKoZWP: "xyi4chj",
    k1PBYE: "x1ohr1zr",
    $$css: true
  },
  plan_grid: {
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kohv2D: "xe8uvvx",
    kOIVth: "x8fetqu",
    kg9kkx: "x1vfedg7",
    $$css: true
  },
  plan: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kVQ08L: "x1ljpu7r",
    kNk6WL: "x10ukxgv",
    kOIVth: "x8fetqu",
    kmVPX3: "xe0tb4u",
    k99D8V: "x17p5ghk x18z9243",
    kNdqCV: "x16x8cr2 xv2i73l",
    kLjGic: "x1w0e1mo xtthz4l",
    kpfRUI: "x72sy0d xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "x1io0m3d xwaqzdf",
    kMwMTN: "xs5hli",
    $$css: true
  },
  planPrimary: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kNk6WL: "x10ukxgv",
    kOIVth: "x8fetqu",
    kmVPX3: "xe0tb4u",
    k99D8V: "x17p5ghk x18z9243",
    kNdqCV: "x16x8cr2 xv2i73l",
    kLjGic: "x1w0e1mo xtthz4l",
    kpfRUI: "x72sy0d xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1eubfot",
    kL20gf: "x1itpb23 x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "xcbldvc xwaqzdf",
    kMwMTN: "xs5hli",
    kQDVEZ: "x1v8p93f x19dwuzr",
    kkqsfi: "xhe5wa1 x13dgt7z",
    k3smXN: "x16stqrj xszdk7l",
    kzT0vu: "x1g4hjc xiqg0gh",
    $$css: true
  },
  plan__name: {
    kogj98: "x1ghz6dp",
    kLh5Sq: "x1hptrd9",
    ko3Kzr: "x1s688f",
    $$css: true
  },
  plan__price: {
    k1xSpc: "x78zum5",
    kkeX5w: "x1pha0wt",
    kOIVth: "x73f2yu",
    kogj98: "x1ghz6dp",
    $$css: true
  },
  plan__value: {
    knIRL8: "xb0810w",
    kLh5Sq: "xdhfpv1",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x72az59",
    kN5DiO: "xo5v014",
    $$css: true
  },
  plan__period: {
    kMwMTN: "xs87ocq",
    kLh5Sq: "xyr29y3",
    $$css: true
  },
  plan__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "xyr29y3",
    $$css: true
  },
  plan__features: {
    k1xSpc: "xrvj5dj",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kohv2D: "xe8uvvx",
    kOIVth: "x13z6uf9",
    kLh5Sq: "xyr29y3",
    $$css: true
  },
  plan__feature: {
    k1xSpc: "xrvj5dj",
    kOIVth: "x1uma3xh",
    kg9kkx: "x1h5ziqk",
    kgeoSG: "x1cpjm7i",
    kD3LhG: "x744x14",
    kpZEWb: "x1qqnood",
    kQ4b1s: "xxri6bu",
    ktSOKV: "x1n6dlnu",
    kTrdHi: "x1bsen3a",
    kKGq1z: "xccne2d",
    kj0ZxJ: "x1wnb18t",
    krBdt5: "x18w0hwz",
    k1GynX: "x3epuvs",
    kN6ckz: "x1fdwaee",
    kMcOlf: "x1iobno9",
    kJeZdJ: "x1r2x5xj",
    $$css: true
  },
  plan__note: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "x1qzg9v8",
    $$css: true
  },
  question_list: {
    k1xSpc: "xrvj5dj",
    $$css: true
  },
  question: {
    khsPd: "xlejusl",
    $$css: true
  },
  questionLast: {
    khsPd: "xlejusl",
    ke4D0g: "xknh1wj",
    $$css: true
  },
  question__summary: {
    kI3sdo: "x13mrud1",
    kVtf5F: "x7s97pk",
    kvZwPi: "xj8ojqv",
    k1xSpc: "x78zum5",
    kVQ08L: "xo67i2s x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "x1qughib",
    kOIVth: "x8fetqu",
    kF3gjK: "xgepmj6",
    kJVvJu: "x18wjirm",
    kMwMTN: "xtylnni",
    kkrTdU: "x1ypdohk",
    kLh5Sq: "x1ksoetq",
    ko3Kzr: "xk50ysn",
    kohv2D: "xe8uvvx",
    kGqHtl: "x1i5lizr",
    k5JduY: "x14lfh4t",
    krxQOp: "x1wt17lb",
    kB1Fuz: "xox5txm",
    kNmtQP: "x1h4a8v0",
    kF3crb: "x17thtq2",
    kJ3DBm: "x1ioofie",
    kLZV2q: "x78hkw1 x4oqjru",
    kVDYEw: "xjocvvi",
    k7kefo: "x15fj410",
    kLigFv: "xba5a1s",
    $$css: true
  },
  question__answer: {
    k2kXS: "xjq529q",
    kF3gjK: "xs0puwk",
    kJVvJu: "x18wjirm",
    kMwMTN: "xs87ocq",
    kN5DiO: "x1dbl2gt",
    $$css: true
  },
  maker__portrait: {
    kULEZF: "x6qm275",
    kLWsYc: "x18o2qet",
    kVQacm: "xb3r6kr",
    kvZwPi: "x1e6avla",
    kL20gf: "x5pkgvi",
    kb5WsR: "x18o3ruo",
    k2EZ2Y: "x1y4qj14",
    kevRTx: "x103pssi",
    kt02CW: "x182nak8",
    kVHNYi: "x12koezg",
    kUtEtU: "x1u7o2vf",
    kdutIq: "x1fdtg7e",
    $$css: true
  },
  maker__body: {
    k1xSpc: "xrvj5dj",
    kdYMnH: "xesnm00",
    kOIVth: "x8fetqu",
    $$css: true
  },
  maker__links: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kOIVth: "x339ura",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kohv2D: "xe8uvvx",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    $$css: true
  },
  cta: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    k1xSpc: "xrvj5dj",
    k9dNZF: "x1o2pa38",
    kOIVth: "x15iy025",
    kF3gjK: "x1e7ni4k",
    kMCLAl: "x2b8uid",
    $$css: true
  },
  ctaAccent: {
    kMwMTN: "x102ovp5 xs5hli",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    k1xSpc: "xrvj5dj",
    k9dNZF: "x1o2pa38",
    kOIVth: "x15iy025",
    kF3gjK: "x1e7ni4k",
    khsPd: "x1cjc3ue",
    kMCLAl: "x2b8uid",
    kL20gf: "xvor1dj x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
    kTJQHc: "x5kubdt xwaqzdf",
    keKwNi: "xmdugnb",
    k99D8V: "x18z9243",
    kNdqCV: "xv2i73l",
    kLjGic: "xtthz4l",
    kpfRUI: "xug5yj",
    kbZlsR: "x1cfjbvc",
    kAFNHU: "x1a4igh8",
    kyY1tn: "xsdpl10",
    kCh6Gp: "x1sz4vi2",
    kzSjEv: "x4aylkk",
    $$css: true
  },
  cta__eyebrow: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "xkpwil5",
    ko3Kzr: "xk50ysn",
    kUEKN5: "x12oo3zp",
    kN5DiO: "x37zpob",
    ksq1ai: "x6mezaz",
    $$css: true
  },
  cta__heading: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "xbujoek",
    kN5DiO: "x1kptsu5",
    kYjUv9: "x1w2vvpw",
    k2kXS: "x1mq39nd",
    kLh5Sq: "x1qczpk7",
    $$css: true
  },
  cta__summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    k2kXS: "x1l2wkh2",
    $$css: true
  },
  cta__actions: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x6s0dn4",
    kOIVth: "x5m0csh",
    kGmCso: "xl56j7k",
    kAiAap: "xphehyp",
    $$css: true
  },
  cta__footnote: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    kLh5Sq: "x1nrrp6k",
    $$css: true
  },
  action: {
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xn57pnr x11qe1k5",
    kNdqCV: "x8a5x8j x1mlwb19",
    kLjGic: "xu8467y xjdclpy",
    kpfRUI: "x1q5zsyi xoap1yo",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "x1itpb23 x1612i37 x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kMwMTN: "xtylnni x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    $$css: true
  },
  actionPrimary: {
    "--_hraness-foil-edge": "x1ioxxix x1ewxtse",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x8txlsq x13ub6g4",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xe5pac1 x4tl7fj",
    kNdqCV: "x1koopx7 xg6qco4",
    kLjGic: "xq2vf8v xw5ezrz",
    kpfRUI: "xnzc5uu x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "x102ovp5 x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    $$css: true
  },
  headerAction: {
    k1xSpc: "x3nfvp2",
    kVQ08L: "x24yzcb xn27wch",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xn57pnr x11qe1k5",
    kNdqCV: "x8a5x8j x1mlwb19",
    kLjGic: "xu8467y xjdclpy",
    kpfRUI: "x1q5zsyi xoap1yo",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "x1itpb23 x1612i37 x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kMwMTN: "xtylnni x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1qzg9v8",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    kF3gjK: "xla58y3",
    kJVvJu: "xlmytos",
    $$css: true
  },
  headerActionPrimary: {
    "--_hraness-foil-edge": "x1ioxxix x1ewxtse",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x8txlsq x13ub6g4",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x24yzcb xn27wch",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xe5pac1 x4tl7fj",
    kNdqCV: "x1koopx7 xg6qco4",
    kLjGic: "xq2vf8v xw5ezrz",
    kpfRUI: "xnzc5uu x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "x102ovp5 x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1qzg9v8",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    kF3gjK: "xla58y3",
    kJVvJu: "xlmytos",
    $$css: true
  },
  planAction: {
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xn57pnr x11qe1k5",
    kNdqCV: "x8a5x8j x1mlwb19",
    kLjGic: "xu8467y xjdclpy",
    kpfRUI: "x1q5zsyi xoap1yo",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "x1itpb23 x1612i37 x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kMwMTN: "xtylnni x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    k24iC1: "x1lqcxt8",
    $$css: true
  },
  planActionPrimary: {
    "--_hraness-foil-edge": "x1ioxxix x1ewxtse",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x8txlsq x13ub6g4",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xe5pac1 x4tl7fj",
    kNdqCV: "x1koopx7 xg6qco4",
    kLjGic: "xq2vf8v xw5ezrz",
    kpfRUI: "xnzc5uu x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "x102ovp5 x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    k24iC1: "x1lqcxt8",
    $$css: true
  },
  heroActionPrimary: {
    "--_hraness-foil-edge": "x1ioxxix x1ewxtse",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x12pzqlm x1y7wltu",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xe5pac1 x4tl7fj",
    kNdqCV: "x1koopx7 xg6qco4",
    kLjGic: "xq2vf8v xw5ezrz",
    kpfRUI: "xnzc5uu x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "xoh73e0 x1ac5u26 xme02mz x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    $$css: true
  },
  heroActionSecondary: {
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xn57pnr x11qe1k5",
    kNdqCV: "x8a5x8j x1mlwb19",
    kLjGic: "xu8467y xjdclpy",
    kpfRUI: "x1q5zsyi xoap1yo",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xjbqb8w x1n5bzlp x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa",
    k2EZ2Y: "x1y4qj14 xduu9rl",
    kevRTx: "x103pssi x1vgyi1t",
    kt02CW: "x182nak8 x1ddkqqy",
    kVHNYi: "x12koezg xzsr2ly",
    kUtEtU: "x1u7o2vf xb3gsto",
    kdutIq: "x1fdtg7e xgildtf",
    kMwMTN: "x102ovp5 xucth70 xme02mz x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    kQDVEZ: "x12hoani x15f2en",
    kkqsfi: "xdnfbz9 x1hno62o",
    k3smXN: "x1go9fhr x15600lq",
    kzT0vu: "x169jq7m xssc3wh",
    $$css: true
  },
  ctaActionPrimary: {
    "--_hraness-foil-edge": "x1ioxxix x1ewxtse",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x12pzqlm",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xe5pac1 x4tl7fj",
    kNdqCV: "x1koopx7 xg6qco4",
    kLjGic: "xq2vf8v xw5ezrz",
    kpfRUI: "xnzc5uu x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "xoh73e0 x1ac5u26 xme02mz x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    $$css: true
  },
  ctaActionSecondary: {
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xn57pnr x11qe1k5",
    kNdqCV: "x8a5x8j x1mlwb19",
    kLjGic: "xu8467y xjdclpy",
    kpfRUI: "x1q5zsyi xoap1yo",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xjbqb8w x1n5bzlp x1tvaz0g xnwy5bs",
    kb5WsR: "x18o3ruo xn3cpwa",
    k2EZ2Y: "x1y4qj14 xduu9rl",
    kevRTx: "x103pssi x1vgyi1t",
    kt02CW: "x182nak8 x1ddkqqy",
    kVHNYi: "x12koezg xzsr2ly",
    kUtEtU: "x1u7o2vf xb3gsto",
    kdutIq: "x1fdtg7e xgildtf",
    kMwMTN: "x102ovp5 xucth70 xme02mz x1ggml12",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    $$css: true
  }
};
var recipes = {
  "hraness-marketing-page": {
    default: marketingStyles.page
  },
  "hraness-marketing-header": {
    default: marketingStyles.header,
    static: marketingStyles.headerStatic
  },
  "hraness-marketing-header__inner": {
    default: marketingStyles.header__inner
  },
  "hraness-marketing-header__brand": {
    default: marketingStyles.header__brand
  },
  "hraness-marketing-header__nav": {
    default: marketingStyles.header__nav
  },
  "hraness-marketing-header__link": {
    default: marketingStyles.header__link,
    current: marketingStyles.header__linkCurrent
  },
  "hraness-marketing-header__actions": {
    default: marketingStyles.header__actions
  },
  "hraness-marketing-main": {
    default: marketingStyles.main,
    pad: marketingStyles.mainPad
  },
  "hraness-marketing-footer": {
    default: marketingStyles.footer
  },
  "hraness-marketing-footer__inner": {
    default: marketingStyles.footer__inner
  },
  "hraness-marketing-footer__brand": {
    default: marketingStyles.footer__brand,
    foil: marketingStyles.footer__brandFoil
  },
  "hraness-marketing-footer__name": {
    default: marketingStyles.footer__name
  },
  "hraness-marketing-footer__nav": {
    default: marketingStyles.footer__nav
  },
  "hraness-marketing-footer__link": {
    default: marketingStyles.footer__link,
    current: marketingStyles.footer__linkCurrent
  },
  "hraness-marketing-hero": {
    default: marketingStyles.hero,
    accent: marketingStyles.heroAccent
  },
  "hraness-marketing-hero__copy": {
    default: marketingStyles.hero__copy,
    start: marketingStyles.hero__copyStart
  },
  "hraness-marketing-hero__eyebrow": {
    default: marketingStyles.hero__eyebrow,
    accent: marketingStyles.hero__eyebrowAccent
  },
  "hraness-marketing-hero__name": {
    default: marketingStyles.hero__name
  },
  "hraness-marketing-hero__heading": {
    default: marketingStyles.hero__heading
  },
  "hraness-marketing-hero__summary": {
    default: marketingStyles.hero__summary
  },
  "hraness-marketing-hero__install": {
    default: marketingStyles.hero__install
  },
  "hraness-marketing-hero__example": {
    default: marketingStyles.hero__example
  },
  "hraness-marketing-hero__actions": {
    default: marketingStyles.hero__actions,
    start: marketingStyles.hero__actionsStart
  },
  "hraness-marketing-hero__boundary": {
    default: marketingStyles.hero__boundary
  },
  "hraness-marketing-hero__frame": {
    default: marketingStyles.hero__frame
  },
  "hraness-marketing-proof": {
    default: marketingStyles.proof
  },
  "hraness-marketing-proof__kicker": {
    default: marketingStyles.proof__kicker
  },
  "hraness-marketing-proof__heading": {
    default: marketingStyles.proof__heading
  },
  "hraness-marketing-flow": {
    default: marketingStyles.flow
  },
  "hraness-marketing-flow__step": {
    default: marketingStyles.flow__step,
    first: marketingStyles.flow__stepFirst
  },
  "hraness-marketing-flow__number": {
    default: marketingStyles.flow__number
  },
  "hraness-marketing-flow__body": {
    default: marketingStyles.flow__body
  },
  "hraness-marketing-flow__label": {
    default: marketingStyles.flow__label
  },
  "hraness-marketing-flow__code": {
    default: marketingStyles.flow__code
  },
  "hraness-marketing-flow__detail": {
    default: marketingStyles.flow__detail
  },
  "hraness-marketing-facts": {
    default: marketingStyles.facts
  },
  "hraness-marketing-facts__item": {
    default: marketingStyles.facts__item,
    later: marketingStyles.facts__itemLater,
    odd: marketingStyles.facts__itemOdd,
    row: marketingStyles.facts__itemRow,
    "row-odd": marketingStyles.facts__itemRowOdd
  },
  "hraness-marketing-facts__label": {
    default: marketingStyles.facts__label
  },
  "hraness-marketing-facts__body": {
    default: marketingStyles.facts__body
  },
  "hraness-marketing-facts__value": {
    default: marketingStyles.facts__value
  },
  "hraness-marketing-facts__detail": {
    default: marketingStyles.facts__detail
  },
  "hraness-marketing-stats": {
    default: marketingStyles.stats
  },
  "hraness-marketing-notice": {
    default: marketingStyles.notice,
    success: [marketingStyles.notice, marketingStyles.noticeSuccess],
    error: [marketingStyles.notice, marketingStyles.noticeError]
  },
  "hraness-marketing-stats__list": {
    default: marketingStyles.stats__list
  },
  "hraness-marketing-stats__source": {
    default: marketingStyles.stats__source
  },
  "hraness-marketing-stats__value": {
    default: marketingStyles.stats__value
  },
  "hraness-marketing-pillars": {
    default: marketingStyles.pillars
  },
  "hraness-marketing-pillars__item": {
    default: marketingStyles.pillars__item,
    later: marketingStyles.pillars__itemLater,
    benefit: marketingStyles.pillars__benefit
  },
  "hraness-marketing-pillars__icon": {
    default: marketingStyles.pillars__icon
  },
  "hraness-marketing-pillars__label": {
    default: marketingStyles.pillars__label
  },
  "hraness-marketing-pillars__summary": {
    default: marketingStyles.pillars__summary
  },
  "hraness-marketing-proof-frame": {
    default: marketingStyles.proof_frame
  },
  "hraness-marketing-proof-frame__chrome": {
    default: marketingStyles.proof_frame__chrome
  },
  "hraness-marketing-proof-frame__lights": {
    default: marketingStyles.proof_frame__lights
  },
  "hraness-marketing-proof-frame__light": {
    default: marketingStyles.proof_frame__light
  },
  "hraness-marketing-proof-frame__title": {
    default: marketingStyles.proof_frame__title,
    terminal: marketingStyles.proof_frame__title_mono
  },
  "hraness-marketing-proof-frame__address": {
    default: marketingStyles.proof_frame__address
  },
  "hraness-marketing-proof-frame__content": {
    default: marketingStyles.proof_frame__content
  },
  "hraness-marketing-proof-frame__caption": {
    default: marketingStyles.proof_frame__caption
  },
  "hraness-marketing-proof-frame__credit": {
    default: marketingStyles.proof_frame__credit
  },
  "hraness-marketing-data-table": {
    default: marketingStyles.data_table
  },
  "hraness-marketing-data-table__head": {
    default: marketingStyles.data_table__head
  },
  "hraness-marketing-data-table__title": {
    default: marketingStyles.data_table__title
  },
  "hraness-marketing-data-table__meta": {
    default: marketingStyles.data_table__meta
  },
  "hraness-marketing-data-table__scroll": {
    default: marketingStyles.data_table__scroll
  },
  "hraness-marketing-data-table__table": {
    default: marketingStyles.data_table__table
  },
  "hraness-marketing-data-table__heading": {
    default: marketingStyles.data_table__heading
  },
  "hraness-marketing-data-table__row-heading": {
    default: marketingStyles.data_table__row_heading
  },
  "hraness-marketing-data-table__cell": {
    default: marketingStyles.data_table__cell
  },
  "hraness-marketing-data-table__note": {
    default: marketingStyles.data_table__note
  },
  "hraness-marketing-code": {
    default: marketingStyles.code
  },
  "hraness-marketing-install": {
    default: marketingStyles.install
  },
  "hraness-marketing-install__heading-group": {
    default: marketingStyles.install__heading_group
  },
  "hraness-marketing-install__eyebrow": {
    default: marketingStyles.install__eyebrow
  },
  "hraness-marketing-install__heading": {
    default: marketingStyles.install__heading
  },
  "hraness-marketing-install__commands": {
    default: marketingStyles.install__commands
  },
  "hraness-marketing-section": {
    default: marketingStyles.section,
    split: marketingStyles.sectionSplit
  },
  "hraness-marketing-section__heading-group": {
    default: marketingStyles.section__heading_group,
    split: marketingStyles.section__heading_groupSplit,
    reverse: marketingStyles.section__heading_groupReverse
  },
  "hraness-marketing-section__label": {
    default: marketingStyles.section__label,
    body: [marketingStyles.section__label, marketingStyles.sectionLabelBody]
  },
  "hraness-marketing-section__heading": {
    default: marketingStyles.section__heading
  },
  "hraness-marketing-section__summary": {
    default: marketingStyles.section__summary
  },
  "hraness-marketing-section__heading-content": {
    default: marketingStyles.section__heading_content
  },
  "hraness-marketing-section__body": {
    default: marketingStyles.section__body
  },
  "hraness-marketing-primitives": {
    default: marketingStyles.primitives
  },
  "hraness-marketing-primitives__header": {
    default: marketingStyles.primitives__header
  },
  "hraness-marketing-primitives__label": {
    default: marketingStyles.primitives__label
  },
  "hraness-marketing-primitives__heading": {
    default: marketingStyles.primitives__heading
  },
  "hraness-marketing-primitives__summary": {
    default: marketingStyles.primitives__summary
  },
  "hraness-marketing-interfaces": {
    default: marketingStyles.interfaces
  },
  "hraness-marketing-interfaces__header": {
    default: marketingStyles.interfaces__header
  },
  "hraness-marketing-interfaces__label": {
    default: marketingStyles.interfaces__label
  },
  "hraness-marketing-interfaces__heading": {
    default: marketingStyles.interfaces__heading
  },
  "hraness-marketing-interfaces__summary": {
    default: marketingStyles.interfaces__summary
  },
  "hraness-marketing-related": {
    default: marketingStyles.related
  },
  "hraness-marketing-related__header": {
    default: marketingStyles.related__header
  },
  "hraness-marketing-related__label": {
    default: marketingStyles.related__label
  },
  "hraness-marketing-related__heading": {
    default: marketingStyles.related__heading
  },
  "hraness-marketing-related__summary": {
    default: marketingStyles.related__summary
  },
  "hraness-marketing-related__groups": {
    default: marketingStyles.related__groups
  },
  "hraness-marketing-related__list": {
    default: marketingStyles.related__list
  },
  "hraness-marketing-related__item": {
    default: marketingStyles.related__item
  },
  "hraness-marketing-related__card-heading": {
    default: marketingStyles.related__card_heading
  },
  "hraness-marketing-related__card-domain": {
    default: marketingStyles.related__card_domain
  },
  "hraness-marketing-related__group": {
    default: marketingStyles.related__group,
    neutral: marketingStyles.related__group,
    rose: [marketingStyles.related__group, marketingStyles.relatedToneRose],
    indigo: [marketingStyles.related__group, marketingStyles.relatedToneIndigo],
    amber: [marketingStyles.related__group, marketingStyles.relatedToneAmber],
    emerald: [marketingStyles.related__group, marketingStyles.relatedToneEmerald]
  },
  "hraness-marketing-related__group-header": {
    default: marketingStyles.related__group_header
  },
  "hraness-marketing-related__group-heading": {
    default: marketingStyles.related__group_heading
  },
  "hraness-marketing-related__group-summary": {
    default: marketingStyles.related__group_summary
  },
  "hraness-marketing-related__card": {
    default: marketingStyles.related__card
  },
  "hraness-marketing-related__card-mark": {
    default: marketingStyles.related__card_mark
  },
  "hraness-marketing-related__card-text": {
    default: marketingStyles.related__card_text
  },
  "hraness-marketing-related__card-name": {
    default: marketingStyles.related__card_name
  },
  "hraness-marketing-related__card-role": {
    default: marketingStyles.related__card_role
  },
  "hraness-marketing-trust": {
    default: marketingStyles.trust
  },
  "hraness-marketing-trust__header": {
    default: marketingStyles.trust__header
  },
  "hraness-marketing-trust__label": {
    default: marketingStyles.trust__label
  },
  "hraness-marketing-trust__heading": {
    default: marketingStyles.trust__heading
  },
  "hraness-marketing-trust__summary": {
    default: marketingStyles.trust__summary
  },
  "hraness-marketing-quotes": {
    default: marketingStyles.quotes
  },
  "hraness-marketing-quotes__header": {
    default: marketingStyles.quotes__header
  },
  "hraness-marketing-quotes__label": {
    default: marketingStyles.quotes__label
  },
  "hraness-marketing-quotes__heading": {
    default: marketingStyles.quotes__heading
  },
  "hraness-marketing-quotes__summary": {
    default: marketingStyles.quotes__summary
  },
  "hraness-marketing-pricing": {
    default: marketingStyles.pricing
  },
  "hraness-marketing-pricing__header": {
    default: marketingStyles.pricing__header
  },
  "hraness-marketing-pricing__label": {
    default: marketingStyles.pricing__label
  },
  "hraness-marketing-pricing__heading": {
    default: marketingStyles.pricing__heading
  },
  "hraness-marketing-pricing__summary": {
    default: marketingStyles.pricing__summary
  },
  "hraness-marketing-questions": {
    default: marketingStyles.questions
  },
  "hraness-marketing-questions__header": {
    default: marketingStyles.questions__header
  },
  "hraness-marketing-questions__label": {
    default: marketingStyles.questions__label
  },
  "hraness-marketing-questions__heading": {
    default: marketingStyles.questions__heading
  },
  "hraness-marketing-questions__summary": {
    default: marketingStyles.questions__summary
  },
  "hraness-marketing-maker": {
    default: marketingStyles.maker
  },
  "hraness-marketing-maker__header": {
    default: marketingStyles.maker__header
  },
  "hraness-marketing-maker__label": {
    default: marketingStyles.maker__label
  },
  "hraness-marketing-maker__heading": {
    default: marketingStyles.maker__heading
  },
  "hraness-marketing-primitives__list": {
    default: marketingStyles.primitives__list
  },
  "hraness-marketing-primitive": {
    default: marketingStyles.primitive
  },
  "hraness-marketing-primitive__number": {
    default: marketingStyles.primitive__number
  },
  "hraness-marketing-primitive__heading": {
    default: marketingStyles.primitive__heading
  },
  "hraness-marketing-primitive__summary": {
    default: marketingStyles.primitive__summary
  },
  "hraness-marketing-interface-grid": {
    default: marketingStyles.interface_grid
  },
  "hraness-marketing-trust-grid": {
    default: marketingStyles.trust_grid
  },
  "hraness-marketing-interface": {
    default: marketingStyles.interface
  },
  "hraness-marketing-trust-item": {
    default: marketingStyles.trust_item
  },
  "hraness-marketing-interface__heading": {
    default: marketingStyles.interface__heading
  },
  "hraness-marketing-interface__summary": {
    default: marketingStyles.interface__summary
  },
  "hraness-marketing-trust-item__label": {
    default: marketingStyles.trust_item__label
  },
  "hraness-marketing-trust-item__detail": {
    default: marketingStyles.trust_item__detail
  },
  "hraness-marketing-card-row": {
    default: marketingStyles.card_row
  },
  "hraness-marketing-card": {
    default: marketingStyles.card,
    icon: [marketingStyles.card, marketingStyles.cardIcon]
  },
  "hraness-marketing-card__icon": {
    default: marketingStyles.card__icon
  },
  "hraness-marketing-card__copy": {
    default: marketingStyles.card__copy
  },
  "hraness-marketing-card__art": {
    default: marketingStyles.card__art
  },
  "hraness-marketing-card__title": {
    default: marketingStyles.card__title
  },
  "hraness-marketing-card__meta": {
    default: marketingStyles.card__meta,
    icon: [marketingStyles.card__meta, marketingStyles.cardMetaIcon]
  },
  "hraness-marketing-card__body": {
    default: marketingStyles.card__body
  },
  "hraness-marketing-quote-grid": {
    default: marketingStyles.quote_grid
  },
  "hraness-marketing-quote": {
    default: marketingStyles.quote
  },
  "hraness-marketing-quote__body": {
    default: marketingStyles.quote__body
  },
  "hraness-marketing-quote__text": {
    default: marketingStyles.quote__text
  },
  "hraness-marketing-quote__attribution": {
    default: marketingStyles.quote__attribution
  },
  "hraness-marketing-quote__name": {
    default: marketingStyles.quote__name
  },
  "hraness-marketing-quote__link": {
    default: marketingStyles.quote__link
  },
  "hraness-marketing-plan-grid": {
    default: marketingStyles.plan_grid
  },
  "hraness-marketing-plan": {
    default: marketingStyles.plan,
    primary: marketingStyles.planPrimary
  },
  "hraness-marketing-plan__name": {
    default: marketingStyles.plan__name
  },
  "hraness-marketing-plan__price": {
    default: marketingStyles.plan__price
  },
  "hraness-marketing-plan__value": {
    default: marketingStyles.plan__value
  },
  "hraness-marketing-plan__period": {
    default: marketingStyles.plan__period
  },
  "hraness-marketing-plan__summary": {
    default: marketingStyles.plan__summary
  },
  "hraness-marketing-plan__features": {
    default: marketingStyles.plan__features
  },
  "hraness-marketing-plan__feature": {
    default: marketingStyles.plan__feature
  },
  "hraness-marketing-plan__note": {
    default: marketingStyles.plan__note
  },
  "hraness-marketing-question-list": {
    default: marketingStyles.question_list
  },
  "hraness-marketing-question": {
    default: marketingStyles.question,
    last: marketingStyles.questionLast
  },
  "hraness-marketing-question__summary": {
    default: marketingStyles.question__summary
  },
  "hraness-marketing-question__answer": {
    default: marketingStyles.question__answer
  },
  "hraness-marketing-maker__portrait": {
    default: marketingStyles.maker__portrait
  },
  "hraness-marketing-maker__body": {
    default: marketingStyles.maker__body
  },
  "hraness-marketing-maker__links": {
    default: marketingStyles.maker__links
  },
  "hraness-marketing-cta": {
    default: marketingStyles.cta,
    accent: marketingStyles.ctaAccent
  },
  "hraness-marketing-cta__eyebrow": {
    default: marketingStyles.cta__eyebrow
  },
  "hraness-marketing-cta__heading": {
    default: marketingStyles.cta__heading
  },
  "hraness-marketing-cta__summary": {
    default: marketingStyles.cta__summary
  },
  "hraness-marketing-cta__actions": {
    default: marketingStyles.cta__actions
  },
  "hraness-marketing-cta__footnote": {
    default: marketingStyles.cta__footnote
  },
  "hraness-marketing-action": {
    default: marketingStyles.action,
    primary: marketingStyles.actionPrimary,
    "header-secondary": marketingStyles.headerAction,
    "header-primary": marketingStyles.headerActionPrimary,
    "plan-secondary": marketingStyles.planAction,
    "plan-primary": marketingStyles.planActionPrimary,
    "hero-primary": marketingStyles.heroActionPrimary,
    "hero-secondary": marketingStyles.heroActionSecondary,
    "cta-primary": marketingStyles.ctaActionPrimary,
    "cta-secondary": marketingStyles.ctaActionSecondary
  }
};
var factColumns = {
  1: marketingStyles.factColumns1,
  2: marketingStyles.factColumns2,
  3: marketingStyles.factColumns3,
  4: marketingStyles.factColumns4
};
var pillarColumns = {
  1: marketingStyles.pillarColumns1,
  2: marketingStyles.pillarColumns2,
  3: marketingStyles.pillarColumns3,
  4: marketingStyles.pillarColumns4
};
var gridColumns = {
  1: marketingStyles.gridColumns1,
  2: marketingStyles.gridColumns2,
  3: marketingStyles.gridColumns3,
  4: marketingStyles.gridColumns4
};
function marketingColumnClassName(hook, caller, columns, presentation = "default") {
  if (columns !== undefined && columns !== 1 && columns !== 2 && columns !== 3 && columns !== 4) {
    throw new RangeError("Marketing columns must be 1, 2, 3, or 4 when specified.");
  }
  const columnRecipe = columns === undefined ? undefined : (hook === "hraness-marketing-pillars" ? pillarColumns : hook === "hraness-marketing-card-row" || hook === "hraness-marketing-primitives__list" || hook === "hraness-marketing-interface-grid" || hook === "hraness-marketing-trust-grid" || hook === "hraness-marketing-related__list" ? gridColumns : factColumns)[columns];
  return [hook, stylex3.props(recipes[hook].default, columnRecipe, hook === "hraness-marketing-pillars" && presentation === "benefits" && marketingStyles.pillarsBenefits).className, caller].filter((value) => value !== undefined && value.length > 0).join(" ");
}
function marketingClassName(hook, caller, variant = "default") {
  const variants = recipes[hook];
  if (!Object.hasOwn(variants, variant))
    throw new Error(`Unknown marketing variant: ${hook}/${variant}`);
  const selected = variants[variant];
  return [hook, stylex3.props(selected, hook === "hraness-marketing-action" && marketingStyles.actionFocus, hook === "hraness-marketing-question" && questionMarker).className, caller].filter((value) => value !== undefined && value.length > 0).join(" ");
}
function marketingHeroClassName(caller, tone, split) {
  return ["hraness-marketing-hero", {
    0: {
      className: "x1n2onr6 xc8icb0 xtylnni xrtw95r x19vpta5 xesnm00 xvueqy4 xrvj5dj x1kfhdh0 xgu4rd8"
    },
    2: {
      className: "x1n2onr6 xc8icb0 x102ovp5 xs5hli xrtw95r x19vpta5 xesnm00 xvueqy4 xrvj5dj x1kfhdh0 xgu4rd8 xvor1dj x9yvj25 x18o3ruo xhobzj1 x1y4qj14 x2c5uud x103pssi x1ug5rqp x182nak8 x1pjo12s x12koezg xzln6ae x1u7o2vf x1tzqu68 x1fdtg7e xcrev8p x5kubdt xwaqzdf xmdugnb x18z9243 xv2i73l xtthz4l xug5yj x1cfjbvc x1a4igh8 xsdpl10 x1sz4vi2 x4aylkk"
    },
    1: {
      className: "x1n2onr6 xc8icb0 xtylnni xrtw95r x19vpta5 xesnm00 xvueqy4 xrvj5dj x1kfhdh0 xgu4rd8 x1mkdm3x x13f99nf x6s0dn4"
    },
    3: {
      className: "x1n2onr6 xc8icb0 x102ovp5 xs5hli xrtw95r x19vpta5 xesnm00 xvueqy4 xrvj5dj x1kfhdh0 xgu4rd8 xvor1dj x9yvj25 x18o3ruo xhobzj1 x1y4qj14 x2c5uud x103pssi x1ug5rqp x182nak8 x1pjo12s x12koezg xzln6ae x1u7o2vf x1tzqu68 x1fdtg7e xcrev8p x5kubdt xwaqzdf xmdugnb x18z9243 xv2i73l xtthz4l xug5yj x1cfjbvc x1a4igh8 xsdpl10 x1sz4vi2 x4aylkk x1mkdm3x x13f99nf x6s0dn4"
    }
  }[!!(tone === "accent") << 1 | !!split << 0].className, caller].filter((value) => value !== undefined && value.length > 0).join(" ");
}
function marketingFactCellVariant(index) {
  return index === 0 ? "default" : index < 2 ? "later" : index % 2 === 0 ? "row-odd" : "row";
}

// src/react/product-marketing.tsx
import { jsx as jsx3, jsxs as jsxs3, Fragment as Fragment2 } from "react/jsx-runtime";
import { createElement } from "react";
var MARKETING_HEADING_TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6"
};
var marketingPatterns = ["cells", "weave", "contour", "mesh", "none"];
function assertMarketingPattern(pattern) {
  if (pattern !== undefined && !marketingPatterns.includes(pattern))
    throw new RangeError("Unknown marketing pattern.");
}
function Heading({
  children,
  className,
  id,
  level
}) {
  const properties = {
    children,
    className,
    id
  };
  const HeadingTag = MARKETING_HEADING_TAGS[level];
  return /* @__PURE__ */ jsx3(HeadingTag, {
    ...properties
  });
}
function childHeadingLevel(level) {
  return Math.min(level + 1, 6);
}
function MarketingActionLink({
  className,
  context = "cta",
  emphasis = "primary",
  href,
  label,
  tone = "paper"
}) {
  return /* @__PURE__ */ jsx3("a", {
    className: marketingClassName("hraness-marketing-action", className, tone === "accent" ? `${context}-${emphasis}` : emphasis === "primary" ? "primary" : "default"),
    "data-emphasis": emphasis,
    "data-foil": emphasis === "primary" ? "" : undefined,
    href,
    children: label
  });
}
function MarketingActions({
  actions,
  className,
  tone,
  context
}) {
  if (actions.length === 0)
    return null;
  return /* @__PURE__ */ jsx3("div", {
    className,
    children: actions.map((action, index) => {
      const emphasis = action.emphasis ?? (index === 0 ? "primary" : "secondary");
      return /* @__PURE__ */ createElement(MarketingActionLink, {
        ...action,
        context,
        emphasis,
        key: `${action.href}-${action.label}`,
        tone
      });
    })
  });
}
function MarketingPage({
  children,
  className,
  id,
  landscape,
  preset,
  pattern
}) {
  if (preset !== undefined && preset !== "editorial" && preset !== "minimal")
    throw new RangeError("Unknown marketing preset.");
  if (landscape !== undefined && landscape !== "page" && landscape !== "contained" && landscape !== "off")
    throw new RangeError("Unknown landscape host.");
  assertMarketingPattern(pattern);
  return /* @__PURE__ */ jsx3("div", {
    className: marketingClassName("hraness-marketing-page", className),
    "data-hraness-landscape": landscape,
    "data-hraness-marketing": "page",
    "data-hraness-marketing-preset": preset,
    "data-hraness-pattern": pattern,
    id,
    children
  });
}
function MarketingField({
  children,
  className,
  pattern
}) {
  assertMarketingPattern(pattern);
  return /* @__PURE__ */ jsx3("div", {
    className: ["hraness-marketing-field", className].filter(Boolean).join(" "),
    "data-hraness-marketing": "field",
    "data-hraness-pattern": pattern,
    children
  });
}
function MarketingMain({
  children,
  className,
  clearance = "scroll",
  id = "main-content"
}) {
  if (clearance !== "scroll" && clearance !== "pad")
    throw new RangeError("Marketing main clearance must be scroll or pad.");
  return /* @__PURE__ */ jsx3("main", {
    className: marketingClassName("hraness-marketing-main", className, clearance === "pad" ? "pad" : "default"),
    "data-hraness-clearance": clearance === "pad" ? "pad" : undefined,
    "data-hraness-marketing": "main",
    id,
    children
  });
}
function MarketingCardRow({
  ariaLabel,
  cards,
  children,
  className,
  columns
}) {
  return /* @__PURE__ */ jsxs3("div", {
    "aria-label": ariaLabel,
    className: marketingColumnClassName("hraness-marketing-card-row", className, columns),
    "data-hraness-marketing": "card-row",
    children: [
      cards?.map((card) => /* @__PURE__ */ jsx3(MarketingCard, {
        ...card
      }, card.title)),
      children
    ]
  });
}
function MarketingCardArt({
  children,
  className
}) {
  return /* @__PURE__ */ jsx3("div", {
    className: marketingClassName("hraness-marketing-card__art", className),
    "data-hraness-marketing": "card-art",
    children
  });
}
function isPresentNode(value) {
  return value !== undefined && value !== false && value !== null && value !== "";
}
function MarketingCard({
  art,
  children,
  className,
  href,
  icon,
  meta,
  title
}) {
  const hasIcon = isPresentNode(icon);
  if (hasIcon && isPresentNode(art))
    throw new RangeError("Marketing cards accept either icon or art, not both.");
  const copy = /* @__PURE__ */ jsxs3(Fragment2, {
    children: [
      /* @__PURE__ */ jsx3("h3", {
        className: marketingClassName("hraness-marketing-card__title"),
        children: title
      }),
      isPresentNode(meta) ? /* @__PURE__ */ jsx3("p", {
        className: marketingClassName("hraness-marketing-card__meta", undefined, hasIcon ? "icon" : "default"),
        children: meta
      }) : null,
      isPresentNode(children) ? /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-card__body"),
        children
      }) : null
    ]
  });
  const body = hasIcon ? /* @__PURE__ */ jsxs3(Fragment2, {
    children: [
      /* @__PURE__ */ jsx3("div", {
        "aria-hidden": "true",
        className: marketingClassName("hraness-marketing-card__icon"),
        children: icon
      }),
      /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-card__copy"),
        children: copy
      })
    ]
  }) : /* @__PURE__ */ jsxs3(Fragment2, {
    children: [
      isPresentNode(art) ? /* @__PURE__ */ jsx3(MarketingCardArt, {
        children: art
      }) : null,
      copy
    ]
  });
  const cardClassName = marketingClassName("hraness-marketing-card", className, hasIcon ? "icon" : "default");
  if (href === undefined) {
    return /* @__PURE__ */ jsx3("article", {
      className: cardClassName,
      "data-hraness-marketing": "card",
      "data-layout": hasIcon ? "icon" : undefined,
      children: body
    });
  }
  return /* @__PURE__ */ jsx3("a", {
    className: cardClassName,
    "data-hraness-marketing": "card",
    "data-layout": hasIcon ? "icon" : undefined,
    href,
    children: body
  });
}
function MarketingSiteHeader({
  action,
  ariaLabel = "Site",
  brand,
  brandHref = "/",
  brandLabel,
  brandMark,
  className,
  links,
  trailing,
  sticky = true
}) {
  const brandProperties = brandLabel === undefined ? {} : {
    "aria-label": brandLabel
  };
  return /* @__PURE__ */ jsx3("header", {
    className: marketingClassName("hraness-marketing-header", className, sticky ? "default" : "static"),
    "data-hraness-marketing": "header",
    "data-position": sticky ? "sticky" : "static",
    children: /* @__PURE__ */ jsxs3("div", {
      className: marketingClassName("hraness-marketing-header__inner"),
      children: [
        /* @__PURE__ */ jsxs3("a", {
          className: marketingClassName("hraness-marketing-header__brand"),
          "data-foil": "",
          href: brandHref,
          ...brandProperties,
          children: [
            brandMark === undefined ? null : /* @__PURE__ */ jsx3(FoilMark, {
              src: brandMark
            }),
            brand
          ]
        }),
        /* @__PURE__ */ jsx3("nav", {
          "aria-label": ariaLabel,
          className: marketingClassName("hraness-marketing-header__nav"),
          children: links.map((link) => /* @__PURE__ */ jsx3("a", {
            "aria-current": link.current === true ? "page" : undefined,
            className: marketingClassName("hraness-marketing-header__link", undefined, link.current === true ? "current" : "default"),
            href: link.href,
            children: link.label
          }, `${link.href}-${link.label}`))
        }),
        action === undefined && trailing === undefined ? null : /* @__PURE__ */ jsxs3("div", {
          className: marketingClassName("hraness-marketing-header__actions"),
          children: [
            action === undefined ? null : /* @__PURE__ */ jsx3("a", {
              className: marketingClassName("hraness-marketing-action", undefined, `header-${action.emphasis ?? "primary"}`),
              "data-emphasis": action.emphasis ?? "primary",
              "data-foil": (action.emphasis ?? "primary") === "primary" ? "" : undefined,
              href: action.href,
              children: action.label
            }),
            trailing
          ]
        })
      ]
    })
  });
}
function MarketingSiteFooter({
  ariaLabel = "Site",
  brand,
  brandHref = "/",
  brandLabel,
  brandMark,
  children,
  className,
  links = [],
  linksLabel = "Footer navigation",
  name
}) {
  const brandProperties = brandLabel === undefined ? {} : {
    "aria-label": brandLabel
  };
  const foilBrand = brandMark !== undefined;
  return /* @__PURE__ */ jsx3("footer", {
    "aria-label": ariaLabel,
    className: marketingClassName("hraness-marketing-footer", className),
    "data-hraness-marketing": "footer",
    children: /* @__PURE__ */ jsxs3("div", {
      className: marketingClassName("hraness-marketing-footer__inner"),
      children: [
        /* @__PURE__ */ jsxs3("a", {
          className: marketingClassName("hraness-marketing-footer__brand", undefined, foilBrand ? "foil" : "default"),
          "data-foil": foilBrand ? "" : undefined,
          href: brandHref,
          ...brandProperties,
          children: [
            foilBrand ? /* @__PURE__ */ jsx3(FoilMark, {
              fallback: brand,
              size: 18,
              src: brandMark
            }) : brand,
            /* @__PURE__ */ jsx3("span", {
              className: marketingClassName("hraness-marketing-footer__name"),
              children: name
            })
          ]
        }),
        children,
        links.length === 0 ? null : /* @__PURE__ */ jsx3("nav", {
          "aria-label": linksLabel,
          className: marketingClassName("hraness-marketing-footer__nav"),
          children: links.map((link) => /* @__PURE__ */ jsx3("a", {
            "aria-current": link.current === true ? "page" : undefined,
            className: marketingClassName("hraness-marketing-footer__link", undefined, link.current === true ? "current" : "default"),
            href: link.href,
            children: link.label
          }, `${link.href}-${link.label}`))
        })
      ]
    })
  });
}
function MarketingFlow({
  ariaLabel,
  className,
  steps
}) {
  return /* @__PURE__ */ jsx3("ol", {
    "aria-label": ariaLabel,
    className: marketingClassName("hraness-marketing-flow", className),
    "data-hraness-marketing": "flow",
    children: steps.map((step, index) => /* @__PURE__ */ jsxs3("li", {
      className: marketingClassName("hraness-marketing-flow__step", undefined, index === 0 ? "first" : "default"),
      children: [
        /* @__PURE__ */ jsx3("span", {
          "aria-hidden": "true",
          className: marketingClassName("hraness-marketing-flow__number"),
          children: String(index + 1).padStart(2, "0")
        }),
        /* @__PURE__ */ jsxs3("div", {
          className: marketingClassName("hraness-marketing-flow__body"),
          children: [
            /* @__PURE__ */ jsx3("strong", {
              className: marketingClassName("hraness-marketing-flow__label"),
              children: step.label
            }),
            step.code === undefined ? null : /* @__PURE__ */ jsx3(SyntaxCode, {
              className: marketingClassName("hraness-marketing-flow__code"),
              code: step.code,
              styles: "classes"
            }),
            step.detail === undefined ? null : /* @__PURE__ */ jsx3("p", {
              className: marketingClassName("hraness-marketing-flow__detail"),
              children: step.detail
            })
          ]
        })
      ]
    }, `${String(index)}-${step.label}`))
  });
}
function MarketingFacts({
  className,
  columns,
  facts
}) {
  const rootClassName = marketingColumnClassName("hraness-marketing-facts", className, columns);
  if (facts.length === 0)
    return null;
  return /* @__PURE__ */ jsx3("dl", {
    className: rootClassName,
    "data-hraness-marketing": "facts",
    style: columns === undefined ? {
      "--hraness-marketing-fact-columns": String(facts.length)
    } : undefined,
    children: facts.map((fact, index) => /* @__PURE__ */ jsxs3("div", {
      className: marketingClassName("hraness-marketing-facts__item", undefined, marketingFactCellVariant(index)),
      children: [
        /* @__PURE__ */ jsx3("dt", {
          className: marketingClassName("hraness-marketing-facts__label"),
          children: fact.label
        }),
        /* @__PURE__ */ jsxs3("dd", {
          className: marketingClassName("hraness-marketing-facts__body"),
          children: [
            /* @__PURE__ */ jsx3("strong", {
              className: marketingClassName("hraness-marketing-facts__value"),
              children: fact.value
            }),
            fact.detail === undefined ? null : /* @__PURE__ */ jsx3("span", {
              className: marketingClassName("hraness-marketing-facts__detail"),
              children: fact.detail
            })
          ]
        })
      ]
    }, `${fact.label}-${fact.value}`))
  });
}
function ProductHero({
  actions = [],
  align = "center",
  boundary,
  className,
  example,
  eyebrow,
  facts = [],
  factsColumns,
  frame,
  heading,
  headingId,
  headingLevel = 1,
  install,
  layout = "stack",
  name,
  notice,
  proof,
  summary,
  tone = "paper"
}) {
  if (layout !== "stack" && layout !== "split")
    throw new RangeError("Hero layout must be stack or split.");
  const split = layout === "split" && isPresentNode(frame);
  return /* @__PURE__ */ jsxs3("header", {
    "aria-labelledby": headingId,
    className: marketingHeroClassName(className, tone, split),
    "data-align": align,
    "data-hraness-marketing": "hero",
    "data-layout": split ? "split" : undefined,
    "data-tone": tone,
    children: [
      /* @__PURE__ */ jsxs3("div", {
        className: marketingClassName("hraness-marketing-hero__copy", undefined, align === "start" ? "start" : "default"),
        children: [
          eyebrow === undefined || eyebrow === "" ? null : /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-hero__eyebrow", undefined, tone === "accent" ? "accent" : "default"),
            children: eyebrow
          }),
          name === "" ? null : /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-hero__name"),
            children: name
          }),
          /* @__PURE__ */ jsx3(Heading, {
            className: marketingClassName("hraness-marketing-hero__heading"),
            id: headingId,
            level: headingLevel,
            children: heading
          }),
          /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-hero__summary"),
            children: summary
          }),
          install === undefined ? null : /* @__PURE__ */ jsx3("div", {
            className: marketingClassName("hraness-marketing-hero__install"),
            children: install
          }),
          example === undefined ? null : /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-hero__example"),
            children: example
          }),
          /* @__PURE__ */ jsx3(MarketingActions, {
            actions,
            className: marketingClassName("hraness-marketing-hero__actions", undefined, align === "start" ? "start" : "default"),
            context: "hero",
            tone
          }),
          boundary === undefined ? null : /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-hero__boundary"),
            children: boundary
          }),
          notice
        ]
      }),
      frame === undefined ? null : /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-hero__frame"),
        children: frame
      }),
      proof === undefined ? null : /* @__PURE__ */ jsxs3("aside", {
        className: marketingClassName("hraness-marketing-proof"),
        "aria-labelledby": `${headingId}-proof`,
        children: [
          proof.kicker === undefined ? null : /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-proof__kicker"),
            children: proof.kicker
          }),
          /* @__PURE__ */ jsx3(Heading, {
            className: marketingClassName("hraness-marketing-proof__heading"),
            id: `${headingId}-proof`,
            level: childHeadingLevel(headingLevel),
            children: proof.heading
          }),
          proof.content
        ]
      }),
      /* @__PURE__ */ jsx3(MarketingFacts, {
        facts,
        ...factsColumns === undefined ? {} : {
          columns: factsColumns
        }
      })
    ]
  });
}
function MarketingPillars({
  ariaLabel,
  className,
  columns,
  pillars,
  presentation = "columns"
}) {
  const rootClassName = marketingColumnClassName("hraness-marketing-pillars", className, columns, presentation === "benefits" ? "benefits" : "default");
  if (pillars.length === 0)
    return null;
  return /* @__PURE__ */ jsx3("dl", {
    "aria-label": ariaLabel,
    className: rootClassName,
    "data-hraness-marketing": "pillars",
    "data-presentation": presentation,
    style: columns === undefined ? {
      "--hraness-marketing-pillar-columns": String(pillars.length)
    } : undefined,
    children: pillars.map((pillar, index) => /* @__PURE__ */ jsxs3("div", {
      className: marketingClassName("hraness-marketing-pillars__item", undefined, presentation === "benefits" ? "benefit" : index === 0 ? "default" : "later"),
      children: [
        /* @__PURE__ */ jsxs3("dt", {
          className: marketingClassName("hraness-marketing-pillars__label"),
          children: [
            pillar.icon === undefined ? null : /* @__PURE__ */ jsx3("span", {
              "aria-hidden": "true",
              className: marketingClassName("hraness-marketing-pillars__icon"),
              children: pillar.icon
            }),
            pillar.label
          ]
        }),
        /* @__PURE__ */ jsx3("dd", {
          className: marketingClassName("hraness-marketing-pillars__summary"),
          children: pillar.summary
        })
      ]
    }, pillar.label))
  });
}
function MarketingInstallPanel({
  children,
  className,
  eyebrow,
  heading,
  headingId,
  headingLevel = 2,
  id,
  note
}) {
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-install", className),
    "data-hraness-marketing": "install",
    id,
    children: [
      /* @__PURE__ */ jsxs3("div", {
        className: marketingClassName("hraness-marketing-install__heading-group"),
        children: [
          eyebrow === undefined || eyebrow === "" ? null : /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-install__eyebrow"),
            children: eyebrow
          }),
          /* @__PURE__ */ jsx3(Heading, {
            className: marketingClassName("hraness-marketing-install__heading"),
            id: headingId,
            level: headingLevel,
            children: heading
          }),
          note
        ]
      }),
      /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-install__commands"),
        children
      })
    ]
  });
}
function marketingProofFrameAddress(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new RangeError(`Proof frame url must be an absolute URL; received ${JSON.stringify(url)}.`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
    throw new RangeError("Proof frame url must use http or https.");
  const path = parsed.pathname === "/" ? "" : parsed.pathname;
  return `${parsed.host}${path}`;
}
function MarketingProofFrame({
  caption,
  children,
  chrome,
  className,
  credit,
  title,
  url
}) {
  if (chrome !== undefined && chrome !== "window" && chrome !== "browser" && chrome !== "terminal") {
    throw new RangeError(`Unknown proof frame chrome: ${String(chrome)}.`);
  }
  if (url !== undefined && chrome !== "browser")
    throw new RangeError('Proof frame url needs chrome="browser".');
  const bar = chrome ?? (title === undefined ? undefined : "window");
  const label = bar === "browser" ? url === undefined ? title : marketingProofFrameAddress(url) : title;
  if (bar !== undefined && (label === undefined || label.trim() === "")) {
    throw new RangeError(`Proof frame chrome=${bar} needs ${bar === "browser" ? "a url or title" : "a title"}.`);
  }
  return /* @__PURE__ */ jsxs3("figure", {
    className: marketingClassName("hraness-marketing-proof-frame", className),
    "data-chrome": bar,
    "data-hraness-marketing": "proof-frame",
    children: [
      bar === undefined ? null : /* @__PURE__ */ jsxs3("div", {
        "aria-hidden": "true",
        className: marketingClassName("hraness-marketing-proof-frame__chrome"),
        children: [
          /* @__PURE__ */ jsxs3("span", {
            className: marketingClassName("hraness-marketing-proof-frame__lights"),
            children: [
              /* @__PURE__ */ jsx3("span", {
                className: marketingClassName("hraness-marketing-proof-frame__light")
              }),
              /* @__PURE__ */ jsx3("span", {
                className: marketingClassName("hraness-marketing-proof-frame__light")
              }),
              /* @__PURE__ */ jsx3("span", {
                className: marketingClassName("hraness-marketing-proof-frame__light")
              })
            ]
          }),
          bar === "browser" ? /* @__PURE__ */ jsx3("span", {
            className: marketingClassName("hraness-marketing-proof-frame__address"),
            children: label
          }) : /* @__PURE__ */ jsx3("span", {
            className: marketingClassName("hraness-marketing-proof-frame__title", undefined, bar === "terminal" ? "terminal" : "default"),
            children: label
          })
        ]
      }),
      /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-proof-frame__content"),
        children
      }),
      caption === undefined && credit === undefined ? null : /* @__PURE__ */ jsxs3("figcaption", {
        className: marketingClassName("hraness-marketing-proof-frame__caption"),
        children: [
          caption === undefined ? null : /* @__PURE__ */ jsx3("span", {
            children: caption
          }),
          credit === undefined ? null : /* @__PURE__ */ jsx3("small", {
            className: marketingClassName("hraness-marketing-proof-frame__credit"),
            children: credit
          })
        ]
      })
    ]
  });
}
function dataTableCell(cell) {
  if (cell !== null && typeof cell === "object" && !Array.isArray(cell) && "content" in cell) {
    return cell;
  }
  return {
    content: cell
  };
}
function MarketingDataTable({
  caption,
  className,
  columns,
  meta,
  note,
  rows
}) {
  if (columns.length === 0)
    throw new RangeError("Marketing data table needs at least one column.");
  for (const row of rows) {
    if (row.length !== columns.length)
      throw new RangeError("Marketing data table rows must match the column count.");
  }
  return /* @__PURE__ */ jsxs3("figure", {
    className: marketingClassName("hraness-marketing-data-table", className),
    "data-hraness-marketing": "data-table",
    children: [
      /* @__PURE__ */ jsxs3("figcaption", {
        className: marketingClassName("hraness-marketing-data-table__head"),
        children: [
          /* @__PURE__ */ jsx3("span", {
            className: marketingClassName("hraness-marketing-data-table__title"),
            children: caption
          }),
          meta === undefined ? null : /* @__PURE__ */ jsx3("span", {
            className: marketingClassName("hraness-marketing-data-table__meta"),
            children: meta
          })
        ]
      }),
      /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-data-table__scroll"),
        children: /* @__PURE__ */ jsxs3("table", {
          className: marketingClassName("hraness-marketing-data-table__table"),
          children: [
            /* @__PURE__ */ jsx3("thead", {
              children: /* @__PURE__ */ jsx3("tr", {
                children: columns.map((column, index) => /* @__PURE__ */ jsx3("th", {
                  className: marketingClassName("hraness-marketing-data-table__heading"),
                  "data-numeric": column.numeric === true ? "" : undefined,
                  scope: "col",
                  children: column.label
                }, index))
              })
            }),
            /* @__PURE__ */ jsx3("tbody", {
              children: rows.map((row, rowIndex) => /* @__PURE__ */ jsx3("tr", {
                children: row.map((cell, cellIndex) => {
                  const {
                    content,
                    tone
                  } = dataTableCell(cell);
                  if (cellIndex === 0) {
                    return /* @__PURE__ */ jsx3("th", {
                      className: marketingClassName("hraness-marketing-data-table__row-heading"),
                      "data-numeric": columns[0]?.numeric === true ? "" : undefined,
                      scope: "row",
                      children: content
                    }, cellIndex);
                  }
                  return /* @__PURE__ */ jsx3("td", {
                    className: marketingClassName("hraness-marketing-data-table__cell"),
                    "data-numeric": columns[cellIndex]?.numeric === true ? "" : undefined,
                    "data-tone": tone,
                    children: content
                  }, cellIndex);
                })
              }, rowIndex))
            })
          ]
        })
      }),
      note === undefined ? null : /* @__PURE__ */ jsx3("p", {
        className: marketingClassName("hraness-marketing-data-table__note"),
        children: note
      })
    ]
  });
}
function MarketingCodeBlock({
  className,
  code,
  language
}) {
  return /* @__PURE__ */ jsx3("pre", {
    className: marketingClassName("hraness-marketing-code", className),
    "data-hraness-marketing": "code",
    children: /* @__PURE__ */ jsx3(SyntaxCode, {
      code,
      ...language === undefined ? {} : {
        language
      },
      styles: "classes"
    })
  });
}
function MarketingSectionLabel({
  children,
  className,
  size = "default"
}) {
  if (size !== "default" && size !== "body")
    throw new RangeError("Marketing label size must be default or body.");
  return /* @__PURE__ */ jsx3("p", {
    className: marketingClassName("hraness-marketing-section__label", className, size),
    "data-size": size === "body" ? "body" : undefined,
    children
  });
}
function MarketingSection({
  children,
  className,
  heading,
  headingId,
  headingLevel = 2,
  headingContent,
  id,
  label,
  layout = "stack",
  summary
}) {
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-section", className, layout === "stack" ? "default" : "split"),
    "data-hraness-marketing": "section",
    "data-layout": layout,
    id,
    children: [
      /* @__PURE__ */ jsxs3("div", {
        className: marketingClassName("hraness-marketing-section__heading-group", undefined, layout === "stack" ? "default" : layout === "split" ? "split" : "reverse"),
        children: [
          label === undefined || label === "" ? null : /* @__PURE__ */ jsx3(MarketingSectionLabel, {
            children: label
          }),
          /* @__PURE__ */ jsx3(Heading, {
            className: marketingClassName("hraness-marketing-section__heading"),
            id: headingId,
            level: headingLevel,
            children: heading
          }),
          summary === undefined ? null : /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-section__summary"),
            children: summary
          }),
          isPresentNode(headingContent) ? /* @__PURE__ */ jsx3("div", {
            className: marketingClassName("hraness-marketing-section__heading-content"),
            children: headingContent
          }) : null
        ]
      }),
      /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-section__body"),
        children
      })
    ]
  });
}
function MarketingCollectionHeader({
  heading,
  headingId,
  headingLevel,
  label,
  prefix,
  summary
}) {
  return /* @__PURE__ */ jsxs3("header", {
    className: marketingClassName(`hraness-marketing-${prefix}__header`),
    children: [
      label === undefined || label === "" ? null : /* @__PURE__ */ jsx3("p", {
        className: marketingClassName(`hraness-marketing-${prefix}__label`),
        children: label
      }),
      /* @__PURE__ */ jsx3(Heading, {
        className: marketingClassName(`hraness-marketing-${prefix}__heading`),
        id: headingId,
        level: headingLevel,
        children: heading
      }),
      summary === undefined ? null : /* @__PURE__ */ jsx3("p", {
        className: marketingClassName(`hraness-marketing-${prefix}__summary`),
        children: summary
      })
    ]
  });
}
function MarketingPrimitives({
  className,
  columns,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  label,
  summary
}) {
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-primitives", className),
    "data-hraness-marketing": "primitives",
    id,
    children: [
      /* @__PURE__ */ jsx3(MarketingCollectionHeader, {
        ...{
          heading,
          headingId,
          headingLevel,
          label,
          summary
        },
        prefix: "primitives"
      }),
      /* @__PURE__ */ jsx3("ol", {
        className: marketingColumnClassName("hraness-marketing-primitives__list", undefined, columns),
        children: items.map((item, index) => /* @__PURE__ */ jsxs3("li", {
          className: marketingClassName("hraness-marketing-primitive"),
          children: [
            /* @__PURE__ */ jsx3("span", {
              "aria-hidden": "true",
              className: marketingClassName("hraness-marketing-primitive__number"),
              children: String(index + 1).padStart(2, "0")
            }),
            /* @__PURE__ */ jsx3(Heading, {
              className: marketingClassName("hraness-marketing-primitive__heading"),
              level: childHeadingLevel(headingLevel),
              children: item.label
            }),
            /* @__PURE__ */ jsx3("p", {
              className: marketingClassName("hraness-marketing-primitive__summary"),
              children: item.summary
            }),
            item.example
          ]
        }, item.label))
      })
    ]
  });
}
function MarketingNotice({
  children,
  className,
  tone = "info"
}) {
  if (tone !== "info" && tone !== "success" && tone !== "error")
    throw new RangeError("Marketing notice tone must be info, success, or error.");
  return /* @__PURE__ */ jsx3("p", {
    className: marketingClassName("hraness-marketing-notice", className, tone === "info" ? "default" : tone),
    "data-hraness-marketing": "notice",
    "data-tone": tone,
    role: tone === "error" ? "alert" : "status",
    children
  });
}
function MarketingStatStrip({
  ariaLabel,
  className,
  columns,
  source,
  stats
}) {
  const listClassName = marketingColumnClassName("hraness-marketing-stats__list", undefined, columns);
  if (stats.length === 0)
    return null;
  return /* @__PURE__ */ jsxs3("section", {
    "aria-label": ariaLabel,
    className: marketingClassName("hraness-marketing-stats", className),
    "data-hraness-marketing": "stats",
    children: [
      /* @__PURE__ */ jsx3("dl", {
        className: listClassName,
        style: columns === undefined ? {
          "--hraness-marketing-fact-columns": String(stats.length)
        } : undefined,
        children: stats.map((stat, index) => /* @__PURE__ */ jsxs3("div", {
          className: marketingClassName("hraness-marketing-facts__item", undefined, marketingFactCellVariant(index)),
          children: [
            /* @__PURE__ */ jsx3("dt", {
              className: marketingClassName("hraness-marketing-facts__label"),
              children: stat.label
            }),
            /* @__PURE__ */ jsxs3("dd", {
              className: marketingClassName("hraness-marketing-facts__body"),
              children: [
                /* @__PURE__ */ jsx3("strong", {
                  className: marketingClassName("hraness-marketing-stats__value"),
                  children: stat.value
                }),
                stat.detail === undefined ? null : /* @__PURE__ */ jsx3("span", {
                  className: marketingClassName("hraness-marketing-facts__detail"),
                  children: stat.detail
                })
              ]
            })
          ]
        }, `${stat.label}-${stat.value}`))
      }),
      source === undefined ? null : /* @__PURE__ */ jsx3("p", {
        className: marketingClassName("hraness-marketing-stats__source"),
        children: source
      })
    ]
  });
}
function MarketingInterfaceGrid({
  className,
  columns,
  heading,
  headingId,
  headingLevel = 2,
  id,
  interfaces,
  label,
  summary
}) {
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-interfaces", className),
    "data-hraness-marketing": "interfaces",
    id,
    children: [
      /* @__PURE__ */ jsx3(MarketingCollectionHeader, {
        ...{
          heading,
          headingId,
          headingLevel,
          label,
          summary
        },
        prefix: "interfaces"
      }),
      /* @__PURE__ */ jsx3("div", {
        className: marketingColumnClassName("hraness-marketing-interface-grid", undefined, columns),
        children: interfaces.map((entry) => /* @__PURE__ */ jsxs3("article", {
          className: marketingClassName("hraness-marketing-interface"),
          children: [
            /* @__PURE__ */ jsx3(Heading, {
              className: marketingClassName("hraness-marketing-interface__heading"),
              level: childHeadingLevel(headingLevel),
              children: entry.label
            }),
            /* @__PURE__ */ jsx3("p", {
              className: marketingClassName("hraness-marketing-interface__summary"),
              children: entry.summary
            }),
            entry.example
          ]
        }, entry.label))
      })
    ]
  });
}
function MarketingTrustBoundary({
  className,
  columns,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  label,
  summary
}) {
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-trust", className),
    "data-hraness-marketing": "trust",
    id,
    children: [
      /* @__PURE__ */ jsx3(MarketingCollectionHeader, {
        ...{
          heading,
          headingId,
          headingLevel,
          label,
          summary
        },
        prefix: "trust"
      }),
      /* @__PURE__ */ jsx3("dl", {
        className: marketingColumnClassName("hraness-marketing-trust-grid", undefined, columns),
        children: items.map((item) => /* @__PURE__ */ jsxs3("div", {
          className: marketingClassName("hraness-marketing-trust-item"),
          children: [
            /* @__PURE__ */ jsx3("dt", {
              className: marketingClassName("hraness-marketing-trust-item__label"),
              children: item.label
            }),
            /* @__PURE__ */ jsx3("dd", {
              className: marketingClassName("hraness-marketing-trust-item__detail"),
              children: item.detail
            })
          ]
        }, item.label))
      })
    ]
  });
}
function MarketingQuoteGrid({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  label,
  quotes,
  summary
}) {
  if (quotes.length === 0)
    return null;
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-quotes", className),
    "data-hraness-marketing": "quotes",
    id,
    children: [
      /* @__PURE__ */ jsx3(MarketingCollectionHeader, {
        ...{
          heading,
          headingId,
          headingLevel,
          label,
          summary
        },
        prefix: "quotes"
      }),
      /* @__PURE__ */ jsx3("ul", {
        className: marketingClassName("hraness-marketing-quote-grid"),
        children: quotes.map((entry) => /* @__PURE__ */ jsx3("li", {
          children: /* @__PURE__ */ jsxs3("figure", {
            className: marketingClassName("hraness-marketing-quote"),
            children: [
              /* @__PURE__ */ jsx3("blockquote", {
                className: marketingClassName("hraness-marketing-quote__body"),
                children: /* @__PURE__ */ jsx3("p", {
                  className: marketingClassName("hraness-marketing-quote__text"),
                  children: entry.quote
                })
              }),
              /* @__PURE__ */ jsxs3("figcaption", {
                className: marketingClassName("hraness-marketing-quote__attribution"),
                children: [
                  /* @__PURE__ */ jsx3("strong", {
                    className: marketingClassName("hraness-marketing-quote__name"),
                    children: entry.name
                  }),
                  entry.role === undefined ? null : entry.href === undefined ? /* @__PURE__ */ jsx3("span", {
                    children: entry.role
                  }) : /* @__PURE__ */ jsx3("a", {
                    className: marketingClassName("hraness-marketing-quote__link"),
                    href: entry.href,
                    children: entry.role
                  })
                ]
              })
            ]
          })
        }, `${entry.name}-${entry.quote.slice(0, 24)}`))
      })
    ]
  });
}
function MarketingPricing({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  label,
  plans,
  summary
}) {
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-pricing", className),
    "data-hraness-marketing": "pricing",
    id,
    children: [
      /* @__PURE__ */ jsx3(MarketingCollectionHeader, {
        ...{
          heading,
          headingId,
          headingLevel,
          label,
          summary
        },
        prefix: "pricing"
      }),
      /* @__PURE__ */ jsx3("ul", {
        className: marketingClassName("hraness-marketing-plan-grid"),
        children: plans.map((plan) => /* @__PURE__ */ jsxs3("li", {
          className: marketingClassName("hraness-marketing-plan", undefined, plan.emphasis === "primary" ? "primary" : "default"),
          "data-emphasis": plan.emphasis ?? "secondary",
          children: [
            /* @__PURE__ */ jsx3(Heading, {
              className: marketingClassName("hraness-marketing-plan__name"),
              level: childHeadingLevel(headingLevel),
              children: plan.name
            }),
            /* @__PURE__ */ jsxs3("p", {
              className: marketingClassName("hraness-marketing-plan__price"),
              children: [
                /* @__PURE__ */ jsx3("strong", {
                  className: marketingClassName("hraness-marketing-plan__value"),
                  children: plan.price
                }),
                plan.period === undefined ? null : /* @__PURE__ */ jsx3("span", {
                  className: marketingClassName("hraness-marketing-plan__period"),
                  children: plan.period
                })
              ]
            }),
            plan.summary === undefined ? null : /* @__PURE__ */ jsx3("p", {
              className: marketingClassName("hraness-marketing-plan__summary"),
              children: plan.summary
            }),
            plan.features.length === 0 ? null : /* @__PURE__ */ jsx3("ul", {
              className: marketingClassName("hraness-marketing-plan__features"),
              children: plan.features.map((feature) => /* @__PURE__ */ jsx3("li", {
                className: marketingClassName("hraness-marketing-plan__feature"),
                children: feature
              }, feature))
            }),
            plan.action === undefined ? null : /* @__PURE__ */ jsx3("a", {
              className: marketingClassName("hraness-marketing-action", undefined, `plan-${plan.action.emphasis ?? plan.emphasis ?? "secondary"}`),
              "data-emphasis": plan.action.emphasis ?? plan.emphasis ?? "secondary",
              "data-foil": (plan.action.emphasis ?? plan.emphasis ?? "secondary") === "primary" ? "" : undefined,
              href: plan.action.href,
              children: plan.action.label
            }),
            plan.note === undefined ? null : /* @__PURE__ */ jsx3("p", {
              className: marketingClassName("hraness-marketing-plan__note"),
              children: plan.note
            })
          ]
        }, plan.name))
      })
    ]
  });
}
function MarketingQuestionList({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  label,
  questions,
  summary
}) {
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-questions", className),
    "data-hraness-marketing": "questions",
    id,
    children: [
      /* @__PURE__ */ jsx3(MarketingCollectionHeader, {
        ...{
          heading,
          headingId,
          headingLevel,
          label,
          summary
        },
        prefix: "questions"
      }),
      /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-question-list"),
        children: questions.map((question, index) => /* @__PURE__ */ jsxs3("details", {
          className: marketingClassName("hraness-marketing-question", undefined, index === questions.length - 1 ? "last" : "default"),
          children: [
            /* @__PURE__ */ jsx3("summary", {
              className: marketingClassName("hraness-marketing-question__summary"),
              children: question.question
            }),
            /* @__PURE__ */ jsx3("div", {
              className: marketingClassName("hraness-marketing-question__answer"),
              children: question.answer
            })
          ]
        }, question.question))
      })
    ]
  });
}
function MarketingMaker({
  children,
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  label,
  linkClassName,
  links = [],
  portrait
}) {
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-maker", className),
    "data-hraness-marketing": "maker",
    id,
    children: [
      /* @__PURE__ */ jsxs3("header", {
        className: marketingClassName("hraness-marketing-maker__header"),
        children: [
          portrait === undefined ? null : /* @__PURE__ */ jsx3("div", {
            className: marketingClassName("hraness-marketing-maker__portrait"),
            children: portrait
          }),
          label === undefined || label === "" ? null : /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-maker__label"),
            children: label
          }),
          /* @__PURE__ */ jsx3(Heading, {
            className: marketingClassName("hraness-marketing-maker__heading"),
            id: headingId,
            level: headingLevel,
            children: heading
          })
        ]
      }),
      /* @__PURE__ */ jsxs3("div", {
        className: marketingClassName("hraness-marketing-maker__body"),
        children: [
          children,
          links.length === 0 ? null : /* @__PURE__ */ jsx3("ul", {
            className: marketingClassName("hraness-marketing-maker__links"),
            children: links.map((link) => /* @__PURE__ */ jsx3("li", {
              children: /* @__PURE__ */ jsx3("a", {
                className: linkClassName,
                href: link.href,
                children: link.label
              })
            }, `${link.href}-${link.label}`))
          })
        ]
      })
    ]
  });
}
function MarketingRelatedCards({
  ariaLabel,
  columns,
  items,
  level
}) {
  return /* @__PURE__ */ jsx3("ul", {
    "aria-label": ariaLabel,
    className: marketingColumnClassName("hraness-marketing-related__list", undefined, columns),
    children: items.map((item) => /* @__PURE__ */ jsx3("li", {
      className: marketingClassName("hraness-marketing-related__item"),
      children: /* @__PURE__ */ jsxs3("a", {
        className: marketingClassName("hraness-marketing-related__card"),
        "data-foil": "",
        "data-hraness-marketing": "card",
        href: item.href,
        children: [
          isPresentNode(item.art) || item.mark !== undefined && item.mark !== "" ? /* @__PURE__ */ jsx3("span", {
            "aria-hidden": "true",
            className: marketingClassName("hraness-marketing-related__card-mark"),
            children: isPresentNode(item.art) ? item.art : /* @__PURE__ */ jsx3(FoilMark, {
              size: 28,
              src: item.mark ?? ""
            })
          }) : null,
          /* @__PURE__ */ jsxs3("div", {
            className: marketingClassName("hraness-marketing-related__card-text"),
            children: [
              /* @__PURE__ */ jsxs3("div", {
                className: marketingClassName("hraness-marketing-related__card-heading"),
                children: [
                  /* @__PURE__ */ jsx3(Heading, {
                    className: marketingClassName("hraness-marketing-related__card-name"),
                    level,
                    children: item.name
                  }),
                  item.domain === undefined ? null : /* @__PURE__ */ jsx3("span", {
                    className: marketingClassName("hraness-marketing-related__card-domain"),
                    children: item.domain
                  })
                ]
              }),
              /* @__PURE__ */ jsx3("span", {
                className: marketingClassName("hraness-marketing-related__card-role"),
                children: item.role
              })
            ]
          })
        ]
      })
    }, item.name))
  });
}
function MarketingRelated({
  className,
  columns,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  groups,
  label,
  summary
}) {
  const defaultColumnProps = columns === undefined ? {} : {
    columns
  };
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-related", className),
    "data-hraness-marketing": "related",
    id,
    children: [
      /* @__PURE__ */ jsx3(MarketingCollectionHeader, {
        heading,
        headingId,
        headingLevel,
        label,
        prefix: "related",
        summary
      }),
      groups === undefined ? /* @__PURE__ */ jsx3(MarketingRelatedCards, {
        ...defaultColumnProps,
        items,
        level: childHeadingLevel(headingLevel)
      }) : /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-related__groups"),
        children: groups.map((group) => /* @__PURE__ */ jsxs3("div", {
          "aria-labelledby": group.headingId,
          className: marketingClassName("hraness-marketing-related__group", undefined, group.tone ?? "neutral"),
          "data-tone": group.tone ?? "neutral",
          children: [
            /* @__PURE__ */ jsxs3("div", {
              className: marketingClassName("hraness-marketing-related__group-header"),
              children: [
                /* @__PURE__ */ jsx3(Heading, {
                  className: marketingClassName("hraness-marketing-related__group-heading"),
                  id: group.headingId,
                  level: childHeadingLevel(headingLevel),
                  children: group.heading
                }),
                group.summary === undefined ? null : /* @__PURE__ */ jsx3("p", {
                  className: marketingClassName("hraness-marketing-related__group-summary"),
                  children: group.summary
                })
              ]
            }),
            /* @__PURE__ */ jsx3(MarketingRelatedCards, {
              ariaLabel: group.heading,
              ...group.columns === undefined ? defaultColumnProps : {
                columns: group.columns
              },
              items: group.items,
              level: childHeadingLevel(childHeadingLevel(headingLevel))
            })
          ]
        }, group.headingId))
      })
    ]
  });
}
function MarketingCallToAction({
  actions,
  className,
  eyebrow,
  footnote,
  heading,
  headingId,
  headingLevel = 2,
  id,
  summary,
  tone = "paper"
}) {
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-cta", className, tone === "accent" ? "accent" : "default"),
    "data-hraness-marketing": "cta",
    "data-tone": tone,
    id,
    children: [
      eyebrow === undefined || eyebrow === "" ? null : /* @__PURE__ */ jsx3("p", {
        className: marketingClassName("hraness-marketing-cta__eyebrow"),
        children: eyebrow
      }),
      /* @__PURE__ */ jsx3(Heading, {
        className: marketingClassName("hraness-marketing-cta__heading"),
        id: headingId,
        level: headingLevel,
        children: heading
      }),
      summary === undefined ? null : /* @__PURE__ */ jsx3("p", {
        className: marketingClassName("hraness-marketing-cta__summary"),
        children: summary
      }),
      /* @__PURE__ */ jsx3(MarketingActions, {
        actions,
        className: marketingClassName("hraness-marketing-cta__actions"),
        context: "cta",
        tone
      }),
      footnote === undefined ? null : /* @__PURE__ */ jsx3("p", {
        className: marketingClassName("hraness-marketing-cta__footnote"),
        children: footnote
      })
    ]
  });
}

// src/react/article.tsx
import { jsx as jsx4, jsxs as jsxs4, Fragment as Fragment3 } from "react/jsx-runtime";
var ROOT_CLASS = "plain-site plain-publication plain-publication--embedded";
var HEADING_TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6"
};
function joinClasses(...values) {
  return values.filter((value) => value !== undefined && value !== "").join(" ");
}
function ArticleDate({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs4(Fragment3, {
    children: [
      label,
      " ",
      /* @__PURE__ */ jsx4("time", {
        dateTime: value,
        children: formatArticleDate(value)
      })
    ]
  });
}
function Separator() {
  return /* @__PURE__ */ jsx4("span", {
    "aria-hidden": "true",
    children: " · "
  });
}
function ArticleByline({
  author
}) {
  assertArticleAuthor(author);
  return /* @__PURE__ */ jsxs4("span", {
    className: "plain-publication__byline",
    "data-author-kind": author.kind,
    children: [
      ARTICLE_BYLINE_PREFIX,
      " ",
      author.href === undefined ? author.name : /* @__PURE__ */ jsx4("a", {
        href: author.href,
        rel: "author",
        children: author.name
      })
    ]
  });
}
function ArticleProvenance({
  provenance
}) {
  const sentence = articleProvenanceSentence(provenance);
  return /* @__PURE__ */ jsx4("p", {
    className: "plain-publication__provenance",
    "data-drafting": provenance.drafting,
    "data-reviewer-type": provenance.review?.reviewerType ?? "none",
    children: sentence
  });
}
function MarketingArticle({
  after,
  author,
  children,
  className,
  dek,
  eyebrow,
  heading,
  headingId = "article-title",
  id,
  provenance,
  published,
  showDates = true,
  toc,
  tocLabel = ARTICLE_TOC_LABEL,
  updated
}) {
  assertArticleDates(updated === undefined ? {
    published
  } : {
    published,
    updated
  });
  const tocItems = toc ?? [];
  for (const item of tocItems) {
    if (!item.href.startsWith("#") || item.href.length < 2)
      throw new RangeError("Contents links must point to a heading in this article.");
  }
  const tocId = `${headingId}-contents`;
  return /* @__PURE__ */ jsxs4("article", {
    "aria-labelledby": headingId,
    className: joinClasses(ROOT_CLASS, "plain-publication__article", className),
    "data-hraness-article": "",
    "data-toc": tocItems.length > 0 ? "aside" : "none",
    id,
    children: [
      /* @__PURE__ */ jsxs4("header", {
        className: "plain-publication__article-header",
        children: [
          eyebrow === undefined || eyebrow === "" ? null : /* @__PURE__ */ jsx4("p", {
            className: "plain-publication__eyebrow",
            children: eyebrow
          }),
          /* @__PURE__ */ jsx4("h1", {
            id: headingId,
            children: heading
          }),
          dek === undefined || dek === "" ? null : /* @__PURE__ */ jsx4("p", {
            className: "plain-publication__article-dek",
            children: dek
          }),
          author === undefined && !showDates ? null : /* @__PURE__ */ jsxs4("p", {
            className: "plain-publication__article-meta",
            children: [
              author === undefined ? null : /* @__PURE__ */ jsxs4(Fragment3, {
                children: [
                  /* @__PURE__ */ jsx4(ArticleByline, {
                    author
                  }),
                  showDates ? /* @__PURE__ */ jsx4(Separator, {}) : null
                ]
              }),
              showDates ? /* @__PURE__ */ jsx4(ArticleDate, {
                label: "Published",
                value: published
              }) : null,
              !showDates || updated === undefined ? null : /* @__PURE__ */ jsxs4(Fragment3, {
                children: [
                  /* @__PURE__ */ jsx4(Separator, {}),
                  /* @__PURE__ */ jsx4(ArticleDate, {
                    label: "Updated",
                    value: updated
                  })
                ]
              })
            ]
          }),
          provenance === null ? null : /* @__PURE__ */ jsx4(ArticleProvenance, {
            provenance
          })
        ]
      }),
      /* @__PURE__ */ jsxs4("div", {
        className: "plain-publication__article-layout",
        children: [
          tocItems.length === 0 ? null : /* @__PURE__ */ jsxs4("nav", {
            "aria-labelledby": tocId,
            className: "plain-publication__toc",
            children: [
              /* @__PURE__ */ jsx4("p", {
                id: tocId,
                children: tocLabel
              }),
              /* @__PURE__ */ jsx4("ol", {
                children: tocItems.map((item) => /* @__PURE__ */ jsx4("li", {
                  children: /* @__PURE__ */ jsx4("a", {
                    href: item.href,
                    children: item.label
                  })
                }, item.href))
              })
            ]
          }),
          /* @__PURE__ */ jsx4("div", {
            className: "plain-publication__article-body",
            children
          })
        ]
      }),
      after === undefined || after === null ? null : /* @__PURE__ */ jsx4("footer", {
        className: "plain-publication__article-footer",
        children: after
      })
    ]
  });
}
function ArticleSources({
  heading = ARTICLE_SOURCES_HEADING,
  headingId = "article-sources",
  showDates = true,
  sources
}) {
  if (sources.length === 0)
    return null;
  for (const source of sources) {
    assertArticleHref(source.href);
    formatArticleDate(source.checkedOn);
  }
  return /* @__PURE__ */ jsxs4("section", {
    "aria-labelledby": headingId,
    className: "plain-publication__sources",
    children: [
      /* @__PURE__ */ jsx4("h2", {
        id: headingId,
        children: heading
      }),
      /* @__PURE__ */ jsx4("ol", {
        children: sources.map((source) => /* @__PURE__ */ jsxs4("li", {
          children: [
            /* @__PURE__ */ jsx4("a", {
              href: source.href,
              children: source.title
            }),
            !showDates && (source.publisher === undefined || source.publisher === "") ? null : /* @__PURE__ */ jsxs4("span", {
              children: [
                source.publisher === undefined || source.publisher === "" ? null : /* @__PURE__ */ jsxs4(Fragment3, {
                  children: [
                    source.publisher,
                    showDates ? /* @__PURE__ */ jsx4(Separator, {}) : null
                  ]
                }),
                showDates ? /* @__PURE__ */ jsx4(ArticleDate, {
                  label: "Checked",
                  value: source.checkedOn
                }) : null
              ]
            })
          ]
        }, `${source.href}-${source.title}`))
      })
    ]
  });
}
function ArticleCallout({
  children,
  label,
  tone = "note"
}) {
  assertArticleCalloutTone(tone);
  return /* @__PURE__ */ jsxs4("div", {
    className: "plain-publication__callout",
    "data-tone": tone,
    role: "note",
    children: [
      label === undefined || label === "" ? null : /* @__PURE__ */ jsx4("strong", {
        children: label
      }),
      typeof children === "string" ? /* @__PURE__ */ jsx4("p", {
        children
      }) : children
    ]
  });
}
function ArticleRelatedProducts({
  heading = "Related products",
  headingId = "article-related-products",
  headingLevel = 2,
  label,
  summary,
  ...body
}) {
  const optional = {
    ...label === undefined ? {} : {
      label
    },
    ...summary === undefined ? {} : {
      summary
    }
  };
  return /* @__PURE__ */ jsx4("div", {
    className: "plain-publication__related-products",
    children: body.groups === undefined ? /* @__PURE__ */ jsx4(MarketingRelated, {
      heading,
      headingId,
      headingLevel,
      items: body.items,
      ...optional
    }) : /* @__PURE__ */ jsx4(MarketingRelated, {
      groups: body.groups,
      heading,
      headingId,
      headingLevel,
      ...optional
    })
  });
}
function ArticleIndex({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  showDates = true,
  summary
}) {
  if (![1, 2, 3, 4, 5].includes(headingLevel))
    throw new RangeError("Article index heading level must be 1 to 5.");
  const hrefs = new Set;
  for (const item of items) {
    assertArticleHref(item.href);
    assertArticleDates(item.updated === undefined ? {
      published: item.published
    } : {
      published: item.published,
      updated: item.updated
    });
    if (hrefs.has(item.href))
      throw new RangeError(`Article index lists ${item.href} more than once.`);
    hrefs.add(item.href);
  }
  const HeadingTag = HEADING_TAGS[headingLevel];
  const EntryTag = HEADING_TAGS[headingLevel + 1];
  return /* @__PURE__ */ jsxs4("section", {
    "aria-labelledby": headingId,
    className: joinClasses(ROOT_CLASS, "plain-publication__list", className),
    "data-hraness-article-index": "",
    id,
    children: [
      /* @__PURE__ */ jsxs4("div", {
        className: "plain-publication__section-heading",
        children: [
          /* @__PURE__ */ jsx4(HeadingTag, {
            id: headingId,
            children: heading
          }),
          summary === undefined || summary === "" ? null : /* @__PURE__ */ jsx4("p", {
            children: summary
          })
        ]
      }),
      /* @__PURE__ */ jsx4("div", {
        className: "plain-publication__article-list",
        children: items.map((item) => /* @__PURE__ */ jsxs4("article", {
          className: "plain-publication__entry",
          children: [
            item.eyebrow === undefined || item.eyebrow === "" ? null : /* @__PURE__ */ jsx4("p", {
              className: "plain-publication__entry-label",
              children: item.eyebrow
            }),
            /* @__PURE__ */ jsx4(EntryTag, {
              className: "plain-publication__entry-title",
              children: /* @__PURE__ */ jsx4("a", {
                href: item.href,
                children: item.title
              })
            }),
            /* @__PURE__ */ jsx4("p", {
              className: "plain-publication__entry-dek",
              children: item.dek
            }),
            showDates ? /* @__PURE__ */ jsxs4("p", {
              className: "plain-publication__entry-meta",
              children: [
                /* @__PURE__ */ jsx4(ArticleDate, {
                  label: "Published",
                  value: item.published
                }),
                item.updated === undefined ? null : /* @__PURE__ */ jsxs4(Fragment3, {
                  children: [
                    /* @__PURE__ */ jsx4(Separator, {}),
                    /* @__PURE__ */ jsx4(ArticleDate, {
                      label: "Updated",
                      value: item.updated
                    })
                  ]
                })
              ]
            }) : null
          ]
        }, item.href))
      })
    ]
  });
}
var articleFigureKinds = ["illustration", "screenshot", "recording", "diagram", "chart", "table"];
function FigureCaption({
  caption,
  credit
}) {
  if ((caption === undefined || caption === null || caption === false || caption === "") && (credit === undefined || credit === null || credit === false || credit === ""))
    return null;
  return /* @__PURE__ */ jsxs4("figcaption", {
    className: "plain-publication__figure-caption",
    children: [
      caption,
      credit === undefined || credit === null || credit === "" ? null : /* @__PURE__ */ jsx4("small", {
        className: "plain-publication__figure-credit",
        children: credit
      })
    ]
  });
}
function ArticleFigure({
  caption,
  children,
  className,
  credit,
  id,
  kind,
  label,
  width = "text"
}) {
  if (!articleFigureKinds.includes(kind))
    throw new RangeError(`Unknown article figure kind: ${String(kind)}.`);
  return /* @__PURE__ */ jsxs4("figure", {
    "aria-label": label,
    className: joinClasses("plain-publication__figure", className),
    "data-figure-kind": kind,
    "data-width": width,
    id,
    children: [
      /* @__PURE__ */ jsx4("div", {
        className: "plain-publication__figure-body",
        children
      }),
      /* @__PURE__ */ jsx4(FigureCaption, {
        caption,
        credit
      })
    ]
  });
}
function ArticleVideo({
  caption,
  className,
  credit,
  id,
  video,
  width = "text"
}) {
  assertArticleVideo(video);
  return /* @__PURE__ */ jsx4(ArticleFigure, {
    caption,
    className: joinClasses("plain-publication__video", className),
    credit,
    kind: "recording",
    width,
    ...id === undefined ? {} : {
      id
    },
    children: /* @__PURE__ */ jsxs4("video", {
      "aria-label": video.name,
      controls: true,
      height: video.height,
      playsInline: true,
      poster: video.poster,
      preload: "metadata",
      width: video.width,
      children: [
        orderedArticleVideoSources(video).map((source) => /* @__PURE__ */ jsx4("source", {
          src: source.src,
          type: source.type
        }, source.type)),
        /* @__PURE__ */ jsx4("track", {
          default: true,
          kind: "captions",
          label: "Captions",
          src: video.captions,
          srcLang: video.captionsLanguage ?? "en"
        })
      ]
    })
  });
}
function ArticleTable({
  caption,
  className,
  columns,
  id,
  note,
  rows
}) {
  if (columns.length === 0)
    throw new RangeError("Article table needs at least one column.");
  if (caption.trim() === "")
    throw new RangeError("Article table needs a caption.");
  for (const row of rows)
    if (row.length !== columns.length)
      throw new RangeError("Article table rows must match the column count.");
  return /* @__PURE__ */ jsxs4("figure", {
    className: joinClasses("plain-publication__figure plain-publication__data-table", className),
    "data-figure-kind": "table",
    id,
    children: [
      /* @__PURE__ */ jsx4("div", {
        className: "plain-publication__table-scroll",
        role: "region",
        "aria-label": caption,
        tabIndex: 0,
        children: /* @__PURE__ */ jsxs4("table", {
          className: "plain-publication__table",
          children: [
            /* @__PURE__ */ jsx4("caption", {
              children: caption
            }),
            /* @__PURE__ */ jsx4("thead", {
              children: /* @__PURE__ */ jsx4("tr", {
                children: columns.map((column, index) => /* @__PURE__ */ jsx4("th", {
                  "data-numeric": column.numeric === true ? "" : undefined,
                  scope: "col",
                  children: column.label
                }, index))
              })
            }),
            /* @__PURE__ */ jsx4("tbody", {
              children: rows.map((row, rowIndex) => /* @__PURE__ */ jsx4("tr", {
                children: row.map((cell, cellIndex) => cellIndex === 0 ? /* @__PURE__ */ jsx4("th", {
                  scope: "row",
                  children: cell
                }, cellIndex) : /* @__PURE__ */ jsx4("td", {
                  "data-numeric": columns[cellIndex]?.numeric === true ? "" : undefined,
                  children: cell
                }, cellIndex))
              }, rowIndex))
            })
          ]
        })
      }),
      note === undefined || note === null ? null : /* @__PURE__ */ jsx4("p", {
        className: "plain-publication__figure-note",
        children: note
      })
    ]
  });
}
function ArticleBarChart({
  caption,
  className,
  credit,
  data,
  id,
  max
}) {
  if (data.length === 0)
    throw new RangeError("Article bar chart needs at least one bar.");
  for (const datum of data) {
    if (!Number.isFinite(datum.value) || datum.value < 0)
      throw new RangeError(`Article bar chart value for ${JSON.stringify(datum.label)} must be a finite number of at least 0.`);
    if (datum.display.trim() === "" || datum.label.trim() === "")
      throw new RangeError("Article bar chart bars need a label and a display value.");
  }
  const ceiling = max ?? Math.max(...data.map((datum) => datum.value));
  if (!Number.isFinite(ceiling) || ceiling <= 0)
    throw new RangeError("Article bar chart max must be greater than 0.");
  for (const datum of data)
    if (datum.value > ceiling)
      throw new RangeError(`Article bar chart value for ${JSON.stringify(datum.label)} exceeds max.`);
  return /* @__PURE__ */ jsx4(ArticleFigure, {
    caption,
    className: joinClasses("plain-publication__bar-chart", className),
    credit,
    kind: "chart",
    ...id === undefined ? {} : {
      id
    },
    children: /* @__PURE__ */ jsx4("dl", {
      className: "plain-publication__bars",
      children: data.map((datum) => /* @__PURE__ */ jsxs4("div", {
        className: "plain-publication__bar",
        "data-highlight": datum.highlight === true ? "" : undefined,
        children: [
          /* @__PURE__ */ jsx4("dt", {
            children: datum.label
          }),
          /* @__PURE__ */ jsxs4("dd", {
            children: [
              /* @__PURE__ */ jsx4("span", {
                "aria-hidden": "true",
                className: "plain-publication__bar-track",
                children: /* @__PURE__ */ jsx4("span", {
                  className: "plain-publication__bar-fill",
                  style: {
                    "--plain-bar": `${Math.round(datum.value / ceiling * 1e4) / 100}%`
                  }
                })
              }),
              /* @__PURE__ */ jsx4("span", {
                className: "plain-publication__bar-value",
                children: datum.display
              })
            ]
          })
        ]
      }, datum.label))
    })
  });
}
var COMPARISON_TEXT = {
  yes: "Yes",
  no: "No",
  partial: "Partly"
};
function ComparisonGlyph({
  kind,
  className
}) {
  const path = kind === "yes" ? "M3.5 8.5l3 3 6-7" : kind === "no" ? "M4.5 4.5l7 7m0-7l-7 7" : "M4 8h8";
  return /* @__PURE__ */ jsx4("svg", {
    "aria-hidden": "true",
    className: joinClasses("plain-publication__comparison-glyph", className),
    focusable: "false",
    height: "16",
    viewBox: "0 0 16 16",
    width: "16",
    children: /* @__PURE__ */ jsx4("path", {
      d: path,
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.75"
    })
  });
}
function ComparisonCell({
  value
}) {
  if (typeof value === "object")
    return /* @__PURE__ */ jsx4(Fragment3, {
      children: value.text
    });
  const kind = value === true ? "yes" : value === false ? "no" : "partial";
  return /* @__PURE__ */ jsxs4("span", {
    className: "plain-publication__comparison-value",
    "data-value": kind,
    children: [
      /* @__PURE__ */ jsx4(ComparisonGlyph, {
        kind
      }),
      /* @__PURE__ */ jsx4("span", {
        children: COMPARISON_TEXT[kind]
      })
    ]
  });
}
function ComparisonTable({
  caption,
  className,
  highlight,
  id,
  note,
  options,
  rows
}) {
  if (options.length === 0)
    throw new RangeError("Comparison table needs at least one option.");
  if (caption.trim() === "")
    throw new RangeError("Comparison table needs a caption.");
  if (highlight !== undefined && (!Number.isInteger(highlight) || highlight < 0 || highlight >= options.length)) {
    throw new RangeError("Comparison table highlight must be an option index.");
  }
  for (const row of rows)
    if (row.values.length !== options.length)
      throw new RangeError(`Comparison row ${JSON.stringify(row.label)} must have one value per option.`);
  return /* @__PURE__ */ jsxs4("figure", {
    className: joinClasses("plain-publication__figure plain-publication__comparison", className),
    "data-figure-kind": "table",
    id,
    children: [
      /* @__PURE__ */ jsx4("div", {
        className: "plain-publication__table-scroll",
        role: "region",
        "aria-label": caption,
        tabIndex: 0,
        children: /* @__PURE__ */ jsxs4("table", {
          className: "plain-publication__table",
          children: [
            /* @__PURE__ */ jsx4("caption", {
              children: caption
            }),
            /* @__PURE__ */ jsx4("thead", {
              children: /* @__PURE__ */ jsxs4("tr", {
                children: [
                  /* @__PURE__ */ jsx4("td", {}),
                  options.map((option, index) => /* @__PURE__ */ jsx4("th", {
                    "data-highlight": index === highlight ? "" : undefined,
                    scope: "col",
                    children: option
                  }, option))
                ]
              })
            }),
            /* @__PURE__ */ jsx4("tbody", {
              children: rows.map((row) => /* @__PURE__ */ jsxs4("tr", {
                children: [
                  /* @__PURE__ */ jsxs4("th", {
                    scope: "row",
                    children: [
                      row.label,
                      row.note === undefined || row.note === "" ? null : /* @__PURE__ */ jsx4("small", {
                        className: "plain-publication__comparison-note",
                        children: row.note
                      })
                    ]
                  }),
                  row.values.map((value, index) => /* @__PURE__ */ jsx4("td", {
                    "data-highlight": index === highlight ? "" : undefined,
                    children: /* @__PURE__ */ jsx4(ComparisonCell, {
                      value
                    })
                  }, index))
                ]
              }, row.label))
            })
          ]
        })
      }),
      note === undefined || note === null ? null : /* @__PURE__ */ jsx4("p", {
        className: "plain-publication__figure-note",
        children: note
      })
    ]
  });
}

// src/react/marketing-account.tsx
import * as stylex4 from "@stylexjs/stylex";

// src/react/marketing-account.stylex.ts
var marketingAccountStyles = {
  section: {
    kGNEyG: "x6s0dn4",
    k99D8V: "xbzzath",
    kMwMTN: "x11jfisy",
    k1xSpc: "xrvj5dj",
    kOIVth: "xm2penl",
    kumcoG: "x1mkdm3x x2k1869",
    k8WAf4: "xgqmzqw",
    k4rD7h: "x1f21ie9",
    $$css: true
  },
  copy: {
    k7Eaqz: "xeuugli",
    $$css: true
  },
  heading: {
    kMv6JI: "x1d3so1v",
    kGuDYH: "xnwvzbp",
    k63SB2: "xh88oxj",
    kb6lSQ: "x72az59",
    kLWn49: "x1uo3zyz",
    kogj98: "x1ghz6dp",
    kN2L0X: "x1w2vvpw",
    $$css: true
  },
  summary: {
    kMwMTN: "x17j02y5",
    kGuDYH: "x1jchvi3",
    kLWn49: "x1dbl2gt",
    keoZOQ: "xj1urod",
    ks0D6T: "x1dq269h",
    kN2L0X: "x1fzhlzt",
    $$css: true
  },
  content: {
    k7Eaqz: "xeuugli",
    $$css: true
  },
  actions: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kwnvtZ: "x1a02dak",
    kOIVth: "xilar1o",
    $$css: true
  },
  primary: {
    kGNEyG: "x6s0dn4",
    kWkggS: "x8qxh4v x1eb7ohu xnwy5bs",
    kMzoRj: "xmkeg23",
    ksu8eU: "x1y0btm7",
    kVAM5u: "x9r1u3d x1ylmb6m",
    kaIpWk: "xmx9ex2",
    kMwMTN: "xgbnldg x1ggml12",
    k1xSpc: "x3nfvp2",
    kMv6JI: "x1d3so1v",
    kGuDYH: "x1lkfr7t",
    k63SB2: "xh88oxj",
    kjj79g: "xl56j7k",
    kLWn49: "xwn7fz2",
    ks0D6T: "x193iq5w",
    kAzted: "x13gjtz1",
    kI3sdo: "x10s4vih",
    kInvED: "xj3ae5l",
    k8WAf4: "x142x9wm",
    kg3NbH: "xzsmjar",
    k9WMMc: "x2b8uid",
    kybGjl: "x1hl2dhg",
    $$css: true
  },
  signIn: {
    kGNEyG: "x6s0dn4",
    kMwMTN: "x11jfisy x1ljrylj",
    k1xSpc: "x3nfvp2",
    kMv6JI: "x1d3so1v",
    kGuDYH: "x1lkfr7t",
    k63SB2: "x10p5zqr",
    kLWn49: "xwn7fz2",
    kAzted: "x13gjtz1",
    kI3sdo: "x10s4vih",
    kInvED: "xj3ae5l",
    kMnn75: "xujl8zx",
    kmVMDM: "xi2nhp4",
    k1TLXF: "x6k6sr1 x9ojkr9 x1e7jyuc xnnf6oi",
    kNySMw: "xyi4chj",
    kcSHmL: "xdsgf93",
    $$css: true
  }
};

// src/react/marketing-account.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function MarketingAccount({
  children,
  className,
  heading = "Your account",
  id = "account",
  summary
}) {
  const presentation = stylex4.props(marketingAccountStyles.section);
  return /* @__PURE__ */ jsxs5("section", {
    ...presentation,
    "aria-labelledby": `${id}-heading`,
    className: ["hraness-marketing-account", presentation.className, className].filter(Boolean).join(" "),
    id,
    children: [
      /* @__PURE__ */ jsxs5("div", {
        ...stylex4.props(marketingAccountStyles.copy),
        children: [
          /* @__PURE__ */ jsx5("h2", {
            ...stylex4.props(marketingAccountStyles.heading),
            id: `${id}-heading`,
            children: heading
          }),
          /* @__PURE__ */ jsx5("div", {
            ...stylex4.props(marketingAccountStyles.summary),
            children: summary
          })
        ]
      }),
      /* @__PURE__ */ jsx5("div", {
        ...stylex4.props(marketingAccountStyles.content),
        children
      })
    ]
  });
}
function MarketingAccountActions({
  primary,
  signIn
}) {
  return /* @__PURE__ */ jsxs5("div", {
    ...stylex4.props(marketingAccountStyles.actions),
    className: `hraness-marketing-account__actions ${stylex4.props(marketingAccountStyles.actions).className}`,
    children: [
      /* @__PURE__ */ jsx5("a", {
        ...stylex4.props(marketingAccountStyles.primary),
        className: `hraness-marketing-account__primary ${stylex4.props(marketingAccountStyles.primary).className}`,
        "data-analytics-event": primary.analyticsEvent,
        "data-analytics-id": primary.analyticsId,
        "data-emphasis": "primary",
        href: primary.href,
        children: primary.label
      }),
      signIn === undefined ? null : /* @__PURE__ */ jsx5("a", {
        ...stylex4.props(marketingAccountStyles.signIn),
        className: `hraness-marketing-account__sign-in ${stylex4.props(marketingAccountStyles.signIn).className}`,
        "data-analytics-event": signIn.analyticsEvent,
        "data-analytics-id": signIn.analyticsId,
        href: signIn.href,
        children: "Sign in"
      })
    ]
  });
}

// src/react/marketing-comparison.tsx
import * as stylex5 from "@stylexjs/stylex";

// src/react/marketing-comparison.stylex.ts
var comparisonStyles = {
  figure: {
    kogj98: "x1ghz6dp",
    kdYMnH: "xesnm00",
    kMwMTN: "x1sl809t",
    knIRL8: "x1d3so1v",
    $$css: true
  },
  scroll: {
    kNmBvv: "xw2csxc",
    k2kXS: "xgyk9h7",
    kI3sdo: "x10s4vih",
    kVtf5F: "xj3ae5l",
    $$css: true
  },
  table: {
    kULEZF: "xiuoait",
    kZnR7y: "x1mwwwfo",
    kMCLAl: "x1yc453h",
    kLh5Sq: "x6u19be",
    kN5DiO: "x37zpob",
    $$css: true
  },
  caption: {
    kgDt7k: "x1x9z3lm",
    kMCLAl: "x1yc453h",
    kLh5Sq: "x1c3i2sq",
    ko3Kzr: "xh88oxj",
    kMwMTN: "x11jfisy",
    $$css: true
  },
  corner: {
    kdYMnH: "x927zys",
    ke4D0g: "xvnnzik",
    $$css: true
  },
  option: {
    kmVPX3: "x1uz70x1",
    kdYMnH: "x31wxcc",
    ke4D0g: "xvnnzik",
    kG2bcC: "x3ajldb",
    ko3Kzr: "x1s688f",
    $$css: true
  },
  optionLabel: {
    k1xSpc: "x78zum5",
    kkeX5w: "x6s0dn4",
    kOIVth: "x1uma3xh",
    $$css: true
  },
  mark: {
    kKBYww: "x19kjcj4",
    kEE5IU: "x2lah0s",
    kULEZF: "xsta65m",
    kLWsYc: "xkl2xug",
    $$css: true
  },
  rowLabel: {
    kmVPX3: "x3hm25i",
    kdYMnH: "x927zys",
    k2kXS: "x1vophnm",
    ke4D0g: "xvnnzik",
    kG2bcC: "x16dsc37",
    ko3Kzr: "xk50ysn",
    $$css: true
  },
  cell: {
    kmVPX3: "x1uz70x1",
    ke4D0g: "xvnnzik",
    kG2bcC: "x16dsc37",
    $$css: true
  },
  highlight: {
    kL20gf: "x1sstqva x9yvj25",
    kMwMTN: "x11jfisy",
    $$css: true
  },
  value: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xvh977a",
    $$css: true
  },
  label: {
    k1xSpc: "x78zum5",
    kkeX5w: "x1cy8zhl",
    kOIVth: "x1rcpt3j",
    $$css: true
  },
  glyph: {
    kEE5IU: "x2lah0s",
    kAiAap: "x1lepkon",
    kULEZF: "x1ri1nt6",
    kLWsYc: "xf7zn63",
    $$css: true
  },
  positive: {
    kMwMTN: "x1tvez03 xs5hli",
    $$css: true
  },
  negative: {
    kMwMTN: "x17j02y5 xs5hli",
    $$css: true
  },
  conditional: {
    kMwMTN: "x1tjwi9f xs5hli",
    $$css: true
  },
  text: {
    kNUL7p: "xss6m8b",
    $$css: true
  },
  detail: {
    k1xSpc: "x1lliihq",
    kMwMTN: "x17j02y5",
    kLh5Sq: "x1dcheo9",
    ko3Kzr: "xo1l8bm",
    kN5DiO: "xfrs9s4",
    kAiAap: "xo4pzau",
    k2kXS: "x1wuf55a",
    $$css: true
  },
  note: {
    kMwMTN: "x17j02y5",
    kLh5Sq: "xkpwil5",
    kN5DiO: "x1evy7pa",
    kAiAap: "xm3oedo",
    k2kXS: "xlf9zpa",
    $$css: true
  }
};

// src/react/marketing-comparison.tsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
import { createElement as createElement2 } from "react";
var labels = {
  yes: "Yes",
  no: "No",
  partial: "Partly",
  optional: "Optional",
  depends: "Depends"
};
function presentation(slot, props6) {
  const hook = slot.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
  return {
    ...props6,
    className: `hraness-marketing-comparison__${hook} ${props6.className}`
  };
}
function Value({
  value
}) {
  if (typeof value === "string" && value !== "partial")
    return /* @__PURE__ */ jsx6("span", {
      ...presentation("text", stylex5.props(comparisonStyles.text)),
      children: value
    });
  const status = typeof value === "object" ? value.status : value === true ? "yes" : value === false ? "no" : "partial";
  const label = typeof value === "object" ? value.label ?? labels[status] : labels[status];
  const detail = typeof value === "object" ? value.detail : undefined;
  return /* @__PURE__ */ jsxs6("div", {
    ...presentation("value", stylex5.props(comparisonStyles.value)),
    "data-comparison-status": status,
    children: [
      /* @__PURE__ */ jsxs6("span", {
        ...presentation("label", stylex5.props(comparisonStyles.label)),
        children: [
          /* @__PURE__ */ jsx6(ComparisonGlyph, {
            className: `hraness-marketing-comparison__glyph ${stylex5.props(comparisonStyles.glyph, status === "yes" ? comparisonStyles.positive : status === "no" ? comparisonStyles.negative : comparisonStyles.conditional).className}`,
            kind: status === "yes" || status === "no" ? status : "partial"
          }),
          /* @__PURE__ */ jsx6("span", {
            children: label
          })
        ]
      }),
      detail === undefined ? null : /* @__PURE__ */ jsx6("small", {
        ...presentation("detail", stylex5.props(comparisonStyles.detail)),
        children: detail
      })
    ]
  });
}
function MarketingComparison({
  caption,
  className,
  highlight,
  id,
  note,
  options,
  rows
}) {
  if (caption.trim() === "")
    throw new RangeError("Marketing comparison needs a caption.");
  if (options.length === 0)
    throw new RangeError("Marketing comparison needs at least one option.");
  if (highlight !== undefined && (!Number.isInteger(highlight) || highlight < 0 || highlight >= options.length))
    throw new RangeError("Marketing comparison highlight must be an option index.");
  for (const row of rows)
    if (row.values.length !== options.length)
      throw new RangeError(`Marketing comparison row ${JSON.stringify(row.label)} must have one value per option.`);
  return /* @__PURE__ */ jsxs6("figure", {
    ...presentation("figure", stylex5.props(comparisonStyles.figure)),
    className: ["hraness-marketing-comparison", stylex5.props(comparisonStyles.figure).className, className].filter(Boolean).join(" "),
    id,
    children: [
      /* @__PURE__ */ jsx6("div", {
        ...presentation("scroll", stylex5.props(comparisonStyles.scroll)),
        "aria-label": caption,
        role: "region",
        tabIndex: 0,
        children: /* @__PURE__ */ jsxs6("table", {
          ...presentation("table", stylex5.props(comparisonStyles.table)),
          children: [
            /* @__PURE__ */ jsx6("caption", {
              ...presentation("caption", stylex5.props(comparisonStyles.caption)),
              children: caption
            }),
            /* @__PURE__ */ jsx6("thead", {
              children: /* @__PURE__ */ jsxs6("tr", {
                children: [
                  /* @__PURE__ */ jsx6("td", {
                    ...presentation("corner", stylex5.props(comparisonStyles.corner))
                  }),
                  options.map((option, index) => /* @__PURE__ */ createElement2("th", {
                    ...presentation("option", stylex5.props(comparisonStyles.option, index === highlight && comparisonStyles.highlight)),
                    "data-highlight": index === highlight ? "" : undefined,
                    key: option.name,
                    scope: "col"
                  }, /* @__PURE__ */ jsxs6("span", {
                    ...presentation("optionLabel", stylex5.props(comparisonStyles.optionLabel)),
                    children: [
                      option.mark === undefined ? null : /* @__PURE__ */ jsx6("img", {
                        alt: "",
                        ...presentation("mark", stylex5.props(comparisonStyles.mark)),
                        height: 24,
                        src: option.mark,
                        width: 24
                      }),
                      /* @__PURE__ */ jsx6("span", {
                        children: option.name
                      })
                    ]
                  })))
                ]
              })
            }),
            /* @__PURE__ */ jsx6("tbody", {
              children: rows.map((row) => /* @__PURE__ */ jsxs6("tr", {
                children: [
                  /* @__PURE__ */ jsxs6("th", {
                    ...presentation("rowLabel", stylex5.props(comparisonStyles.rowLabel)),
                    scope: "row",
                    children: [
                      row.label,
                      row.note === undefined ? null : /* @__PURE__ */ jsx6("small", {
                        ...presentation("detail", stylex5.props(comparisonStyles.detail)),
                        children: row.note
                      })
                    ]
                  }),
                  row.values.map((value, index) => /* @__PURE__ */ createElement2("td", {
                    ...presentation("cell", stylex5.props(comparisonStyles.cell, index === highlight && comparisonStyles.highlight)),
                    "data-highlight": index === highlight ? "" : undefined,
                    key: index
                  }, /* @__PURE__ */ jsx6(Value, {
                    value
                  })))
                ]
              }, row.label))
            })
          ]
        })
      }),
      note === undefined || note === null ? null : /* @__PURE__ */ jsx6("figcaption", {
        ...presentation("note", stylex5.props(comparisonStyles.note)),
        children: note
      })
    ]
  });
}

// src/react/marketing-marquee.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var ROOT_CLASS2 = "hraness-marketing-marquee";
function MarqueeItem({
  item
}) {
  return /* @__PURE__ */ jsxs7("li", {
    className: `${ROOT_CLASS2}__item`,
    children: [
      item.mark.kind === "glyph" ? /* @__PURE__ */ jsx7("svg", {
        "aria-hidden": "true",
        className: `${ROOT_CLASS2}__mark`,
        fill: "currentColor",
        focusable: "false",
        height: "20",
        width: "20",
        children: /* @__PURE__ */ jsx7("use", {
          href: `#${item.mark.symbolId}`
        })
      }) : /* @__PURE__ */ jsx7("span", {
        "aria-hidden": "true",
        className: `${ROOT_CLASS2}__monogram`,
        children: item.mark.monogram
      }),
      /* @__PURE__ */ jsx7("span", {
        className: `${ROOT_CLASS2}__name`,
        children: item.name
      })
    ]
  });
}
function ControlIcon({
  icon
}) {
  return /* @__PURE__ */ jsx7("svg", {
    "aria-hidden": "true",
    className: `${ROOT_CLASS2}__control-icon`,
    "data-icon": icon,
    fill: "currentColor",
    focusable: "false",
    height: "16",
    viewBox: "0 0 16 16",
    width: "16",
    children: /* @__PURE__ */ jsx7("path", {
      d: MARKETING_MARQUEE_CONTROL_ICONS[icon]
    })
  });
}
function MarketingMarquee(props6) {
  const marquee = resolveMarketingMarquee(props6);
  const items = marquee.items.map((item) => /* @__PURE__ */ jsx7(MarqueeItem, {
    item
  }, item.name));
  return /* @__PURE__ */ jsxs7("section", {
    "aria-labelledby": marquee.labelId,
    className: marquee.className,
    "data-align": marquee.align,
    "data-hraness-marketing": "marquee",
    id: marquee.id,
    children: [
      marquee.symbols.length === 0 ? null : /* @__PURE__ */ jsx7("svg", {
        "aria-hidden": "true",
        className: `${ROOT_CLASS2}__sprite`,
        focusable: "false",
        height: "0",
        width: "0",
        children: marquee.symbols.map((symbol) => /* @__PURE__ */ jsx7("symbol", {
          dangerouslySetInnerHTML: {
            __html: symbol.body
          },
          id: symbol.id,
          viewBox: symbol.viewBox
        }, symbol.id))
      }),
      /* @__PURE__ */ jsxs7("div", {
        className: `${ROOT_CLASS2}__header`,
        children: [
          /* @__PURE__ */ jsxs7("p", {
            className: `${ROOT_CLASS2}__label`,
            id: marquee.labelId,
            children: [
              marquee.label.before,
              /* @__PURE__ */ jsx7("strong", {
                className: `${ROOT_CLASS2}__count`,
                children: marquee.label.count
              }),
              marquee.label.after
            ]
          }),
          marquee.action === null ? null : /* @__PURE__ */ jsx7("a", {
            className: `${ROOT_CLASS2}__action hraness-text-link`,
            href: marquee.action.href,
            children: marquee.action.label
          })
        ]
      }),
      /* @__PURE__ */ jsx7("input", {
        className: `${ROOT_CLASS2}__toggle`,
        id: marquee.toggleId,
        type: "checkbox"
      }),
      /* @__PURE__ */ jsx7("div", {
        className: `${ROOT_CLASS2}__viewport`,
        children: /* @__PURE__ */ jsx7("div", {
          className: `${ROOT_CLASS2}__track`,
          children: Array.from({
            length: marquee.copies
          }, (_, index) => /* @__PURE__ */ jsx7("ul", {
            "aria-hidden": index === 0 ? undefined : "true",
            className: `${ROOT_CLASS2}__list`,
            children: items
          }, index))
        })
      }),
      /* @__PURE__ */ jsxs7("label", {
        className: `${ROOT_CLASS2}__control`,
        htmlFor: marquee.toggleId,
        children: [
          /* @__PURE__ */ jsx7("span", {
            className: `${ROOT_CLASS2}__control-text`,
            children: marquee.pauseLabel
          }),
          /* @__PURE__ */ jsx7(ControlIcon, {
            icon: "pause"
          }),
          /* @__PURE__ */ jsx7(ControlIcon, {
            icon: "play"
          })
        ]
      })
    ]
  });
}

// src/react/marketing-diagram.tsx
import * as stylex6 from "@stylexjs/stylex";

// src/react/marketing-diagram.stylex.ts
var diagramStyles = {
  figure: {
    kogj98: "x1ghz6dp",
    kdYMnH: "xesnm00",
    kMwMTN: "x11jfisy",
    knIRL8: "x1d3so1v",
    $$css: true
  },
  scroll: {
    kNmBvv: "xw2csxc",
    k2kXS: "xgyk9h7",
    kI3sdo: "x10s4vih",
    kVtf5F: "xj3ae5l",
    $$css: true
  },
  canvas: {
    k1xSpc: "x1lliihq",
    kULEZF: "xiuoait",
    kdYMnH: "xze7o54",
    kLWsYc: "xzlj3eo",
    knIRL8: "x1d3so1v",
    kLh5Sq: "xwsyq91",
    kMwMTN: "xzwifym",
    $$css: true
  },
  caption: {
    kAiAap: "xm3oedo",
    k2kXS: "xlf9zpa",
    kMwMTN: "x17j02y5",
    kLh5Sq: "xkpwil5",
    kN5DiO: "x1evy7pa",
    $$css: true
  }
};

// src/react/marketing-diagram.tsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function DiagramArrowhead({
  id
}) {
  if (id.trim() === "" || /\s/u.test(id))
    throw new RangeError("Diagram arrowhead needs one nonempty SVG ID.");
  return /* @__PURE__ */ jsx8("marker", {
    id,
    markerHeight: diagramMetrics.arrowheadSize,
    markerUnits: "userSpaceOnUse",
    markerWidth: diagramMetrics.arrowheadSize,
    orient: "auto-start-reverse",
    refX: "5.5",
    refY: "3",
    viewBox: "0 0 6 6",
    children: /* @__PURE__ */ jsx8("path", {
      d: "M0 0 L6 3 L0 6 Z",
      fill: "context-stroke"
    })
  });
}
function MarketingDiagram({
  caption,
  children,
  className,
  height,
  label,
  width
}) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw new RangeError("Marketing diagram dimensions must be positive.");
  if (label.trim() === "")
    throw new RangeError("Marketing diagram needs a useful accessible label.");
  return /* @__PURE__ */ jsxs8("figure", {
    className: ["hraness-diagram", stylex6.props(diagramStyles.figure).className, className].filter(Boolean).join(" "),
    children: [
      /* @__PURE__ */ jsx8("div", {
        ...stylex6.props(diagramStyles.scroll),
        className: `hraness-diagram__scroll ${stylex6.props(diagramStyles.scroll).className}`,
        "aria-label": label,
        role: "region",
        tabIndex: 0,
        children: /* @__PURE__ */ jsx8("svg", {
          ...stylex6.props(diagramStyles.canvas),
          className: `hraness-diagram__canvas ${stylex6.props(diagramStyles.canvas).className}`,
          "aria-label": label,
          height,
          role: "img",
          viewBox: `0 0 ${width} ${height}`,
          width,
          children
        })
      }),
      caption === undefined || caption === null ? null : /* @__PURE__ */ jsx8("figcaption", {
        ...stylex6.props(diagramStyles.caption),
        children: caption
      })
    ]
  });
}

// src/react/surfaces.tsx
import { forwardRef } from "react";
import * as stylex7 from "@stylexjs/stylex";
import { ThemedSurface, cn } from "@hraness/ui";

// src/react/surfaces.stylex.ts
var ditherSurfaceStyles = {
  coarse: {
    "--hraness-design-dither-size": "xvx1b6g",
    $$css: true
  },
  fine: {
    "--hraness-design-dither-size": "xgcu659",
    $$css: true
  },
  texture: {
    kKwaWg: "xa4utgr xhobzj1",
    kgSjnq: "x150knr0",
    $$css: true
  }
};
var layoutSurfaceStyles = {
  bar: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kOIVth: "x96y02u",
    kdYMnH: "xesnm00",
    $$css: true
  },
  barContent: {
    kUk6DE: "x12lumcd",
    $$css: true
  },
  barPart: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kOIVth: "xmgkybt",
    kdYMnH: "xesnm00",
    $$css: true
  },
  bottomBar: {
    kmc9e2: "x3so8kt",
    kT8eP4: "x1b1eqt9",
    kVQ08L: "x1b207tk",
    kF3gjK: "x1dtp59r",
    kJVvJu: "xfmotut",
    $$css: true
  },
  dockedAbsolute: {
    kVAEAm: "x10l6tqk",
    $$css: true
  },
  dockedContent: {
    kULEZF: "xvaqoh0",
    kYk0Dm: "xvueqy4",
    $$css: true
  },
  dockedContentCompactInset: {
    kF3gjK: "x19cf7fd",
    kJVvJu: "x2qnaq3",
    $$css: true
  },
  dockedContentCompactNoInset: {
    kF3gjK: "x19cf7fd",
    kJVvJu: "x10wq4n4",
    $$css: true
  },
  dockedContentDefaultInset: {
    kF3gjK: "x1noa3k7",
    kJVvJu: "x2qnaq3",
    $$css: true
  },
  dockedContentDefaultNoInset: {
    kF3gjK: "x1noa3k7",
    kJVvJu: "x10wq4n4",
    $$css: true
  },
  dockedFixed: {
    kVAEAm: "xixxii4",
    $$css: true
  },
  dockedFooter: {
    kmc9e2: "x3so8kt",
    kT8eP4: "x1b1eqt9",
    kctUWg: "xuufnwz",
    khdm6U: "x17y0mx6",
    kY2c9j: "x1nmkd3v",
    $$css: true
  },
  dockedSticky: {
    kVAEAm: "x7wzq59",
    $$css: true
  },
  fullSize: {
    k2kXS: "x1tec7hu",
    $$css: true
  },
  pageCanvas: {
    kULEZF: "xvaqoh0",
    kYk0Dm: "xvueqy4",
    kdYMnH: "xesnm00",
    $$css: true
  },
  pageContentInset: {
    kF3gjK: "xkdeioa",
    kJVvJu: "x1w88gy1",
    $$css: true
  },
  pageNoInset: {
    kF3gjK: "xt970qd",
    kJVvJu: "xnjsko4",
    $$css: true
  },
  surface: {
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "x11gw9ax x9yvj25",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    k4V0xq: "xtsjrx0 x14bdpvh",
    kpvK8V: "xjttvrd x108usdd",
    kffDkL: "x1j8yxcv x1x0u81l",
    kEreRy: "xmmcp6y xjslfuv",
    $$css: true
  },
  topBar: {
    k4V0xq: "x8dl5b2 x14bdpvh",
    krFJ6x: "xn5uptl",
    kP1A0P: "x1ae7zus",
    kVQ08L: "x8k30ic",
    $$css: true
  },
  topBarActions: {
    kImiAN: "xvc5jky",
    $$css: true
  },
  topBarGlass: {
    kNGHLb: "x1fqaf3z",
    kzkQIJ: "x4b736z",
    kWkggS: "xdral45 x9yvj25",
    $$css: true
  },
  topBarSticky: {
    kUvb1J: "xlb5a52",
    kF3gjK: "xh0s0sg",
    kJVvJu: "x10wq4n4",
    kVAEAm: "x7wzq59",
    kY2c9j: "x1nmkd3v",
    $$css: true
  },
  topBarStatic: {
    kF3gjK: "x1dtp59r",
    kJVvJu: "xfmotut",
    $$css: true
  },
  topBarTitle: {
    k63SB2: "x1lvx875",
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    khDVqt: "xuxw1ft",
    $$css: true
  },
  wideSize: {
    k2kXS: "x1bdwxy3",
    $$css: true
  }
};

// src/react/surfaces.tsx
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var ditherSurfaceDensityStyles = {
  coarse: ditherSurfaceStyles.coarse,
  fine: ditherSurfaceStyles.fine,
  medium: undefined
};
function DitherSurface({
  className,
  density = "medium",
  xstyle,
  ...props8
}) {
  return /* @__PURE__ */ jsx9(ThemedSurface, {
    ...props8,
    className: cn("hraness-design-dither-surface", className),
    "data-density": density,
    xstyle: [
      ditherSurfaceStyles.texture,
      ditherSurfaceDensityStyles[density],
      xstyle
    ]
  });
}
function TopBar({
  actions,
  children,
  className,
  leading,
  position = "static",
  surface = "solid",
  title,
  ...props8
}) {
  const rootPresentation = stylex7.props(layoutSurfaceStyles.surface, layoutSurfaceStyles.bar, layoutSurfaceStyles.topBar, position === "sticky" ? layoutSurfaceStyles.topBarSticky : layoutSurfaceStyles.topBarStatic, surface === "glass" && layoutSurfaceStyles.topBarGlass);
  const leadingPresentation = stylex7.props(layoutSurfaceStyles.barPart);
  const titlePresentation = stylex7.props(layoutSurfaceStyles.topBarTitle);
  const contentPresentation = stylex7.props(layoutSurfaceStyles.barPart, layoutSurfaceStyles.barContent);
  const actionsPresentation = stylex7.props(layoutSurfaceStyles.barPart, layoutSurfaceStyles.topBarActions);
  return /* @__PURE__ */ jsxs9("header", {
    ...rootPresentation,
    ...props8,
    className: cn("hraness-design-top-bar", rootPresentation.className, className),
    "data-position": position,
    "data-surface": surface,
    children: [
      /* @__PURE__ */ jsxs9("div", {
        ...leadingPresentation,
        className: cn("hraness-design-top-bar__leading", leadingPresentation.className),
        children: [
          leading,
          title === undefined ? null : /* @__PURE__ */ jsx9("div", {
            ...titlePresentation,
            className: cn("hraness-design-top-bar__title", titlePresentation.className),
            children: title
          })
        ]
      }),
      children === undefined ? null : /* @__PURE__ */ jsx9("div", {
        ...contentPresentation,
        className: cn("hraness-design-top-bar__content", contentPresentation.className),
        children
      }),
      actions === undefined ? null : /* @__PURE__ */ jsx9("div", {
        ...actionsPresentation,
        className: cn("hraness-design-top-bar__actions", actionsPresentation.className),
        children: actions
      })
    ]
  });
}
function BottomBar({
  actions,
  children,
  className,
  leading,
  ...props8
}) {
  const rootPresentation = stylex7.props(layoutSurfaceStyles.surface, layoutSurfaceStyles.bar, layoutSurfaceStyles.bottomBar);
  const leadingPresentation = stylex7.props(layoutSurfaceStyles.barPart);
  const contentPresentation = stylex7.props(layoutSurfaceStyles.barPart, layoutSurfaceStyles.barContent);
  const actionsPresentation = stylex7.props(layoutSurfaceStyles.barPart);
  return /* @__PURE__ */ jsxs9("footer", {
    ...rootPresentation,
    ...props8,
    className: cn("hraness-design-bottom-bar", rootPresentation.className, className),
    children: [
      leading === undefined ? null : /* @__PURE__ */ jsx9("div", {
        ...leadingPresentation,
        className: cn("hraness-design-bottom-bar__leading", leadingPresentation.className),
        children: leading
      }),
      /* @__PURE__ */ jsx9("div", {
        ...contentPresentation,
        className: cn("hraness-design-bottom-bar__content", contentPresentation.className),
        children
      }),
      actions === undefined ? null : /* @__PURE__ */ jsx9("div", {
        ...actionsPresentation,
        className: cn("hraness-design-bottom-bar__actions", actionsPresentation.className),
        children: actions
      })
    ]
  });
}
function PageCanvas({
  as = "main",
  className,
  inset = "content",
  size = "default",
  ...props8
}) {
  const Element = as;
  const presentation2 = stylex7.props(layoutSurfaceStyles.pageCanvas, inset === "content" ? layoutSurfaceStyles.pageContentInset : layoutSurfaceStyles.pageNoInset, size === "wide" && layoutSurfaceStyles.wideSize, size === "full" && layoutSurfaceStyles.fullSize);
  return /* @__PURE__ */ jsx9(Element, {
    ...presentation2,
    ...props8,
    className: cn("hraness-design-page-canvas", presentation2.className, className),
    "data-inset": inset,
    "data-size": size
  });
}
var DockedFooter = forwardRef(function DockedFooter2({
  children,
  className,
  contentClassName,
  density = "default",
  inset = "content",
  position = "fixed",
  size = "default",
  surface = "solid",
  ...props8
}, ref) {
  const rootPresentation = stylex7.props(layoutSurfaceStyles.surface, layoutSurfaceStyles.dockedFooter, position === "absolute" ? layoutSurfaceStyles.dockedAbsolute : position === "sticky" ? layoutSurfaceStyles.dockedSticky : layoutSurfaceStyles.dockedFixed);
  const contentPresentation = stylex7.props(layoutSurfaceStyles.dockedContent, density === "compact" ? inset === "content" ? layoutSurfaceStyles.dockedContentCompactInset : layoutSurfaceStyles.dockedContentCompactNoInset : inset === "content" ? layoutSurfaceStyles.dockedContentDefaultInset : layoutSurfaceStyles.dockedContentDefaultNoInset, size === "wide" && layoutSurfaceStyles.wideSize, size === "full" && layoutSurfaceStyles.fullSize);
  return /* @__PURE__ */ jsx9("footer", {
    ...rootPresentation,
    ...props8,
    className: cn("hraness-design-docked-footer", rootPresentation.className, className),
    "data-position": position,
    "data-surface": surface,
    ref,
    children: /* @__PURE__ */ jsx9("div", {
      ...contentPresentation,
      className: cn("hraness-design-docked-footer__content", contentPresentation.className, contentClassName),
      "data-density": density,
      "data-inset": inset,
      "data-size": size,
      children
    })
  });
});

// src/react/procedural-recipe.ts
var proceduralBackdropVariants = ["atmosphere", "grid", "ripple", "composite"];
var proceduralRecipeVersion = 1;
var defaultProceduralEffectPalette = {
  highlight: "var(--aurora-gold)",
  key: "var(--aurora-rose)",
  shadow: "var(--aurora-violet)",
  support: "var(--aurora-cyan)"
};
var colorRoles = ["key", "support", "highlight", "shadow"];
function normalizeSeed(seed) {
  const normalized = seed.trim();
  if (normalized.length === 0) {
    throw new RangeError("A procedural effect seed must contain a non-whitespace character.");
  }
  return normalized;
}
function normalizeVariation(variation) {
  const normalized = variation ?? 0;
  if (!Number.isSafeInteger(normalized)) {
    throw new RangeError("A procedural effect variation must be a safe integer.");
  }
  return normalized === 0 ? 0 : normalized;
}
function normalizePalette(palette) {
  const normalized = palette ?? defaultProceduralEffectPalette;
  for (const role of colorRoles) {
    if (normalized[role].trim().length === 0) {
      throw new RangeError(`A procedural effect palette requires a nonblank ${role} color.`);
    }
  }
  return {
    highlight: normalized.highlight.trim(),
    key: normalized.key.trim(),
    shadow: normalized.shadow.trim(),
    support: normalized.support.trim()
  };
}
function seedHash(value) {
  let hash = 2166136261;
  for (let index = 0;index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function seededUnitSequence(seed) {
  let state = seedHash(seed);
  return () => {
    state = state + 1831565813 >>> 0;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
function rounded(value, places = 3) {
  const scale = 10 ** places;
  const result = Math.round(value * scale) / scale;
  return result === 0 ? 0 : result;
}
function between(next, minimum, maximum) {
  return rounded(minimum + next() * (maximum - minimum));
}
function integerBetween(next, minimum, maximum) {
  return Math.floor(minimum + next() * (maximum - minimum + 1));
}
function negativeIntegerBetween(next, minimum, maximum) {
  const value = integerBetween(next, minimum, maximum);
  return value === 0 ? 0 : -value;
}
function colorRole(next) {
  return colorRoles[integerBetween(next, 0, colorRoles.length - 1)] ?? "key";
}
function proceduralIdentity(input, recipeName) {
  const seed = normalizeSeed(input.seed);
  const variation = normalizeVariation(input.variation);
  return {
    next: seededUnitSequence(`hraness-design-procedural-v${proceduralRecipeVersion}\x00${recipeName}\x00${seed}\x00${variation}`),
    palette: normalizePalette(input.palette),
    seed,
    variation
  };
}
function createProceduralBackdropRecipe(input) {
  const {
    next,
    palette,
    seed,
    variation
  } = proceduralIdentity(input, "backdrop");
  const variant = input.variant ?? "composite";
  if (!proceduralBackdropVariants.includes(variant)) {
    throw new RangeError(`Unsupported procedural backdrop variant: ${variant}.`);
  }
  const atmosphere = Array.from({
    length: 5
  }, () => ({
    blur: between(next, 24, 54),
    color: colorRole(next),
    delay: negativeIntegerBetween(next, 0, 9000),
    driftX: between(next, -18, 18),
    driftY: between(next, -14, 14),
    duration: integerBetween(next, 1e4, 18000),
    height: between(next, 34, 68),
    opacity: between(next, 0.16, 0.34),
    rotation: between(next, -28, 28),
    scale: between(next, 1.02, 1.12),
    width: between(next, 42, 78),
    x: between(next, 8, 92),
    y: between(next, 8, 92)
  }));
  const gridSize = integerBetween(next, 42, 72);
  const grid = {
    offsetX: integerBetween(next, 0, gridSize - 1),
    offsetY: integerBetween(next, 0, gridSize - 1),
    opacity: between(next, 0.045, 0.095),
    rotation: between(next, -2.5, 2.5),
    size: gridSize
  };
  const ripple = {
    aspect: between(next, 0.62, 0.9),
    color: colorRole(next),
    contours: Array.from({
      length: 4
    }, (_, index) => ({
      delay: negativeIntegerBetween(next, 0, 7000),
      duration: integerBetween(next, 8000, 14000),
      opacity: between(next, 0.08, 0.18),
      size: between(next, 28 + index * 13, 36 + index * 16)
    })),
    rotation: between(next, -18, 18),
    x: between(next, 24, 76),
    y: between(next, 22, 78)
  };
  return {
    atmosphere,
    grid,
    palette,
    ripple,
    seed,
    variation,
    variant,
    version: proceduralRecipeVersion
  };
}
function createParticleHaloRecipe(input) {
  const {
    next,
    palette,
    seed,
    variation
  } = proceduralIdentity(input, "halo");
  const particles = Array.from({
    length: 24
  }, (_, index) => {
    const angle = index / 24 * Math.PI * 2 + between(next, -0.11, 0.11);
    const radiusX = between(next, 35, 49);
    const radiusY = between(next, 34, 48);
    return {
      color: colorRole(next),
      delay: negativeIntegerBetween(next, 0, 7000),
      driftX: between(next, -7, 7),
      driftY: between(next, -7, 7),
      duration: integerBetween(next, 7000, 13000),
      opacity: between(next, 0.26, 0.62),
      size: between(next, 2, 6),
      x: rounded(50 + Math.cos(angle) * radiusX),
      y: rounded(50 + Math.sin(angle) * radiusY)
    };
  });
  return {
    palette,
    particles,
    seed,
    variation,
    version: proceduralRecipeVersion
  };
}

// src/react/procedural-backdrop.tsx
import { cn as cn2 } from "@hraness/ui";
import * as stylex8 from "@stylexjs/stylex";

// src/react/effects.stylex.ts
var effectsStyles = {
  auroraBackground: {
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "xk26fvh",
    kKwaWg: "x1xeixd2",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x103pssi",
    k1xSpc: "x1c7sf14",
    ku685b: "x2g5esg",
    kpwlN0: "x10a8y8t",
    kVQacm: "xb3r6kr",
    kfzvcC: "x47corl",
    kVAEAm: "xixxii4",
    kY2c9j: "x1ja2u2z",
    kGFycz: "x1r2x5xj",
    k2irxo: "x1iobno9",
    kLkRvE: "x1p58mzm",
    k3DiCg: "xaazngd",
    khXQ3S: "x1fdwaee",
    kuPSpR: "x1p4wkd0",
    kTP8oX: "x1n53xtc",
    k836YN: "xoyff0v",
    kgeoSG: "x1cpjm7i",
    kVjEmB: "x1wq4w3b",
    kFcpXp: "x18267p7",
    k5QlbN: "x1i9jdp0",
    kEoFBp: "x1hmns74",
    kcTAPf: "xgqsyu6",
    kg3FMZ: "x5f4bmu",
    kM2ZXO: "xm2d366",
    ks3ayO: "xyhc2n1",
    kNctxI: "x1rlmepj",
    kJM1pu: "x1x9a357",
    kgUb28: "xdyatyv",
    kIWj2l: "xnktifx",
    kakxe6: "x1m8cr3k",
    k5JduY: "x1s928wv",
    kJPAYR: "x1bfd30r",
    kv0HGH: "x9xjp18",
    kR4hYe: "x4itrw6",
    kypkao: "x1wxgyrg",
    kwXMNM: "x1j6awrg",
    $$css: true
  },
  auroraDots: {
    "--phaser-dots-static-color": "x18tcw9x",
    "--phaser-dots-static-opacity": "x1vfo4py",
    "--phaser-dots-trail-color": "xy4ijj0",
    "--phaser-dots-trail-opacity": "x9pog29",
    k1xSpc: "x1c7sf14",
    kpwlN0: "x10a8y8t",
    kfzvcC: "x47corl",
    kVAEAm: "xixxii4",
    kY2c9j: "x1ja2u2z",
    $$css: true
  },
  phaserSlot: {
    kpwlN0: "x10a8y8t",
    kfzvcC: "x47corl",
    kVAEAm: "x10l6tqk",
    $$css: true
  },
  phaserRoot: {
    kY2c9j: "x1ja2u2z",
    $$css: true
  },
  phaserStatic: {
    kKwaWg: "x1q249qf",
    kgSjnq: "x1fzb6q7",
    $$css: true
  },
  phaserStaticDefault: {
    kMwMTN: "xioxg94",
    kSiTet: "xyb8fk4",
    $$css: true
  },
  phaserTrail: {
    kZKoxP: "x5yr21d",
    kzqmXN: "xh8yej3",
    $$css: true
  },
  phaserTrailDefault: {
    kMwMTN: "x1qqhz67",
    kSiTet: "x1asn0e8",
    $$css: true
  },
  proceduralRoot: {
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "x11gw9ax",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x103pssi",
    kMwMTN: "x11jfisy",
    kpwlN0: "x10a8y8t",
    kHBbk8: "xc8icb0",
    kVQacm: "xb3r6kr",
    kfzvcC: "x47corl",
    kVAEAm: "x10l6tqk",
    kfSwDN: "x87ps6o",
    kY2c9j: "x1ja2u2z",
    $$css: true
  },
  proceduralSlot: {
    kpwlN0: "x10a8y8t",
    kfzvcC: "x47corl",
    kVAEAm: "x10l6tqk",
    $$css: true
  },
  proceduralAtmosphere: {
    k1xSpc: "x1c7sf14",
    kY2c9j: "x1ja2u2z",
    $$css: true
  },
  proceduralCloud: {
    kKxzle: "xvgw50p",
    kILWW9: "xpz12be",
    k44tkh: "x9wl2nn",
    ko0y90: "xa4qsjk",
    kWV6AL: "x1ir97tl",
    k5bvn2: "xoj058f",
    kKVMdj: "xze2bu8 x1aquc0h",
    kyAemX: "xb8h89d",
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "xjbqb8w",
    kKwaWg: "x154ao60",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x103pssi",
    kaIpWk: "x18tx71f",
    ku685b: "xwu42zd",
    kZKoxP: "x9tupou",
    kbCHJM: "x1xpsit7",
    kSiTet: "xdrg79x",
    kVAEAm: "x10l6tqk",
    k87sOh: "xd2kmy7",
    k3aq6I: "x8z89yc",
    kzqmXN: "x1oarmvm",
    $$css: true
  },
  proceduralGrid: {
    k44tkh: "xjq15ov",
    ko0y90: "xa4qsjk",
    kWV6AL: "x1ir97tl",
    k5bvn2: "xoj058f",
    kKxzle: "x1uzojwf",
    kILWW9: "x1s0aqod",
    kKVMdj: "x1lt3hix x1aquc0h",
    kyAemX: "x1esw782",
    kKwaWg: "x1ejv2sn",
    k1YJky: "x1r53nyk",
    kgSjnq: "x1vi7tfv",
    k1xSpc: "x1c7sf14",
    kpwlN0: "x1l7mm2i",
    kX1K2I: "x885qll",
    kSiTet: "x151ipfs",
    k3aq6I: "x17o6enw",
    kAExgp: "x1gjg8y4",
    kY2c9j: "x1vjfegm",
    $$css: true
  },
  proceduralRipples: {
    k1xSpc: "x1c7sf14",
    k3aq6I: "xnoptka",
    kY2c9j: "xhtitgo",
    $$css: true
  },
  proceduralRipple: {
    kawU7v: "x18sabzy",
    k5BUTg: "x1jleocg",
    kqOd84: "x1pjjote",
    kzPi7L: "x1e53mt7",
    kEz803: "xgkqhyc",
    kKxzle: "xwcsn50",
    kILWW9: "xpz12be",
    k44tkh: "x16i0x8k",
    ko0y90: "xa4qsjk",
    kWV6AL: "x1ir97tl",
    k5bvn2: "xoj058f",
    kKVMdj: "x1kamihp x1aquc0h",
    kyAemX: "x1om7lm2",
    kOBAk4: "x116o27y",
    kVAM5u: "x1agitey",
    kaIpWk: "x16rqkct",
    ksu8eU: "x1y0btm7",
    kMzoRj: "xmkeg23",
    kGVxlE: "x1i3fbbh",
    kbCHJM: "x926dwu",
    kSiTet: "x1gkxhgx",
    kVAEAm: "x10l6tqk",
    k87sOh: "xuluyjk",
    k3aq6I: "x62qcw2",
    kzqmXN: "xs75vpj",
    $$css: true
  },
  particleRoot: {
    k1xSpc: "xwz0xwf",
    kHBbk8: "xc8icb0",
    kgQiWS: "x1ku5rj1",
    kVAEAm: "x1n2onr6",
    $$css: true
  },
  particleField: {
    k1xSpc: "x1c7sf14",
    kpwlN0: "x1fsnwvr",
    kVQacm: "x1rea2x4",
    kfzvcC: "x47corl",
    kVAEAm: "x10l6tqk",
    kY2c9j: "x1ja2u2z",
    $$css: true
  },
  particle: {
    kKxzle: "x6z0ubo",
    kILWW9: "xpz12be",
    k44tkh: "xyjyscg",
    ko0y90: "xa4qsjk",
    kWV6AL: "x1ir97tl",
    k5bvn2: "xoj058f",
    kKVMdj: "x1t1kwt8 x1aquc0h",
    kyAemX: "xb8h89d",
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "x10mczmc",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x103pssi",
    kaIpWk: "x18j2vf1",
    kGVxlE: "x5bbp7p",
    kZKoxP: "xdsa8hg",
    kbCHJM: "xh64h8m",
    kSiTet: "x5wl7ns",
    kVAEAm: "x10l6tqk",
    k87sOh: "x5mhnyq",
    k3aq6I: "x1pb4uno",
    kzqmXN: "xy4ag0o",
    $$css: true
  },
  particleContent: {
    k7Eaqz: "xeuugli",
    kVAEAm: "x1n2onr6",
    kY2c9j: "x1vjfegm",
    $$css: true
  }
};

// src/react/procedural-backdrop.tsx
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var colorVariables = {
  highlight: "var(--hraness-design-procedural-highlight)",
  key: "var(--hraness-design-procedural-key)",
  shadow: "var(--hraness-design-procedural-shadow)",
  support: "var(--hraness-design-procedural-support)"
};
var INERT_PROPS = {
  inert: true
};
function ProceduralBackdrop({
  className,
  palette,
  seed,
  style,
  variation,
  variant,
  ...props9
}) {
  const recipe = createProceduralBackdropRecipe({
    seed,
    ...palette === undefined ? {} : {
      palette
    },
    ...variation === undefined ? {} : {
      variation
    },
    ...variant === undefined ? {} : {
      variant
    }
  });
  const rootStyle = {
    "--hraness-design-procedural-highlight": recipe.palette.highlight,
    "--hraness-design-procedural-key": recipe.palette.key,
    "--hraness-design-procedural-shadow": recipe.palette.shadow,
    "--hraness-design-procedural-support": recipe.palette.support,
    ...style
  };
  const showAtmosphere = recipe.variant === "atmosphere" || recipe.variant === "composite";
  const showGrid = recipe.variant === "grid" || recipe.variant === "composite";
  const showRipple = recipe.variant === "ripple" || recipe.variant === "composite";
  const gridStyle = {
    "--hraness-design-procedural-grid-offset-x": `${recipe.grid.offsetX}px`,
    "--hraness-design-procedural-grid-offset-y": `${recipe.grid.offsetY}px`,
    "--hraness-design-procedural-grid-opacity": recipe.grid.opacity,
    "--hraness-design-procedural-grid-rotation": `${recipe.grid.rotation}deg`,
    "--hraness-design-procedural-grid-size": `${recipe.grid.size}px`
  };
  const rippleStyle = {
    "--hraness-design-procedural-ripple-aspect": recipe.ripple.aspect,
    "--hraness-design-procedural-ripple-color": colorVariables[recipe.ripple.color],
    "--hraness-design-procedural-ripple-rotation": `${recipe.ripple.rotation}deg`,
    "--hraness-design-procedural-ripple-x": `${recipe.ripple.x}%`,
    "--hraness-design-procedural-ripple-y": `${recipe.ripple.y}%`
  };
  const rootPresentation = stylex8.props(effectsStyles.proceduralRoot);
  const atmospherePresentation = stylex8.props(effectsStyles.proceduralSlot, effectsStyles.proceduralAtmosphere);
  const cloudPresentation = stylex8.props(effectsStyles.proceduralCloud);
  const gridPresentation = stylex8.props(effectsStyles.proceduralSlot, effectsStyles.proceduralGrid);
  const ripplesPresentation = stylex8.props(effectsStyles.proceduralSlot, effectsStyles.proceduralRipples);
  const ripplePresentation = stylex8.props(effectsStyles.proceduralRipple);
  return /* @__PURE__ */ jsxs10("div", {
    ...props9,
    ...INERT_PROPS,
    "aria-hidden": "true",
    className: cn2("hraness-design-procedural-backdrop", rootPresentation.className, className),
    "data-recipe-version": recipe.version,
    "data-variation": recipe.variation,
    "data-variant": recipe.variant,
    role: "presentation",
    style: rootStyle,
    children: [
      showAtmosphere ? /* @__PURE__ */ jsx10("span", {
        className: cn2("hraness-design-procedural-backdrop__atmosphere", atmospherePresentation.className),
        children: recipe.atmosphere.map((layer, index) => {
          const layerStyle = {
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
            "--hraness-design-procedural-layer-y": `${layer.y}%`
          };
          return /* @__PURE__ */ jsx10("i", {
            className: cn2("hraness-design-procedural-backdrop__cloud", cloudPresentation.className),
            style: layerStyle
          }, index);
        })
      }) : null,
      showGrid ? /* @__PURE__ */ jsx10("span", {
        className: cn2("hraness-design-procedural-backdrop__grid", gridPresentation.className),
        style: gridStyle
      }) : null,
      showRipple ? /* @__PURE__ */ jsx10("span", {
        className: cn2("hraness-design-procedural-backdrop__ripples", ripplesPresentation.className),
        style: rippleStyle,
        children: recipe.ripple.contours.map((contour, index) => {
          const contourStyle = {
            "--hraness-design-procedural-ripple-delay": `${contour.delay}ms`,
            "--hraness-design-procedural-ripple-duration": `${contour.duration}ms`,
            "--hraness-design-procedural-ripple-opacity": contour.opacity,
            "--hraness-design-procedural-ripple-size": `${contour.size}%`
          };
          return /* @__PURE__ */ jsx10("i", {
            className: cn2("hraness-design-procedural-backdrop__ripple", ripplePresentation.className),
            style: contourStyle
          }, index);
        })
      }) : null
    ]
  });
}

// src/react/platform-icons.tsx
import { jsx as jsx11, jsxs as jsxs11 } from "react/jsx-runtime";
var sizeParts = {
  inherit: undefined,
  lg: "iconLg",
  md: "iconMd",
  sm: "iconSm"
};
function PlatformIcon({
  className,
  label,
  platform,
  size = "inherit"
}) {
  if (!isPlatformId(platform))
    throw new RangeError(`Platform ids are lowercase slugs; received ${JSON.stringify(platform)}.`);
  if (!(size in sizeParts))
    throw new RangeError(`Unknown platform icon size: ${String(size)}.`);
  if (label !== undefined && label.trim() === "")
    throw new RangeError("A platform icon label must not be blank.");
  const mark = platformMark(platform);
  return /* @__PURE__ */ jsx11("svg", {
    "aria-hidden": label === undefined ? true : undefined,
    "aria-label": label,
    className: platformInstallClassName(["icon", sizeParts[size]], className),
    "data-platform": platform,
    fill: "currentColor",
    focusable: "false",
    role: label === undefined ? undefined : "img",
    viewBox: mark.viewBox,
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx11("path", {
      d: mark.path
    })
  });
}
function toBadge(entry) {
  return typeof entry === "string" ? {
    id: entry
  } : entry;
}
function PlatformBadges({
  className,
  label = "Runs on",
  platforms
}) {
  const badges = platforms.map(toBadge);
  if (badges.length === 0)
    throw new RangeError("PlatformBadges needs at least one platform.");
  const seen = new Set;
  for (const badge of badges) {
    if (!isPlatformId(badge.id))
      throw new RangeError(`Platform ids are lowercase slugs; received ${JSON.stringify(badge.id)}.`);
    if (seen.has(badge.id))
      throw new RangeError(`Duplicate platform id: ${badge.id}.`);
    seen.add(badge.id);
  }
  const listName = label ?? "Supported platforms";
  return /* @__PURE__ */ jsxs11("div", {
    className: platformInstallClassName(["badges"], className),
    "data-hraness-platform-badges": "",
    children: [
      label === null ? null : /* @__PURE__ */ jsx11("span", {
        "aria-hidden": "true",
        className: platformInstallClassName(["badgesLabel"]),
        children: label
      }),
      /* @__PURE__ */ jsx11("ul", {
        "aria-label": listName,
        className: platformInstallClassName(["badgesList"]),
        children: badges.map((badge) => /* @__PURE__ */ jsxs11("li", {
          className: platformInstallClassName(["badge"]),
          "data-platform": badge.id,
          children: [
            /* @__PURE__ */ jsx11(PlatformIcon, {
              platform: badge.id
            }),
            /* @__PURE__ */ jsx11("span", {
              children: badge.label ?? platformLabel(badge.id)
            }),
            badge.note === undefined ? null : /* @__PURE__ */ jsx11("span", {
              className: platformInstallClassName(["badgeNote"]),
              children: badge.note
            })
          ]
        }, badge.id))
      })
    ]
  });
}

// src/react/particle-halo.tsx
import { cn as cn3 } from "@hraness/ui";
import * as stylex9 from "@stylexjs/stylex";
import { jsx as jsx12, jsxs as jsxs12 } from "react/jsx-runtime";
var colorVariables2 = {
  highlight: "var(--hraness-design-procedural-highlight)",
  key: "var(--hraness-design-procedural-key)",
  shadow: "var(--hraness-design-procedural-shadow)",
  support: "var(--hraness-design-procedural-support)"
};
function ParticleHalo({
  children,
  className,
  palette,
  seed,
  style,
  variation,
  ...props10
}) {
  const recipe = createParticleHaloRecipe({
    seed,
    ...palette === undefined ? {} : {
      palette
    },
    ...variation === undefined ? {} : {
      variation
    }
  });
  const rootStyle = {
    "--hraness-design-procedural-highlight": recipe.palette.highlight,
    "--hraness-design-procedural-key": recipe.palette.key,
    "--hraness-design-procedural-shadow": recipe.palette.shadow,
    "--hraness-design-procedural-support": recipe.palette.support,
    ...style
  };
  const rootPresentation = stylex9.props(effectsStyles.particleRoot);
  const fieldPresentation = stylex9.props(effectsStyles.particleField);
  const particlePresentation = stylex9.props(effectsStyles.particle);
  const contentPresentation = stylex9.props(effectsStyles.particleContent);
  return /* @__PURE__ */ jsxs12("div", {
    ...props10,
    className: cn3("hraness-design-particle-halo", rootPresentation.className, className),
    "data-recipe-version": recipe.version,
    "data-variation": recipe.variation,
    style: rootStyle,
    children: [
      /* @__PURE__ */ jsx12("span", {
        "aria-hidden": "true",
        className: cn3("hraness-design-particle-halo__particles", fieldPresentation.className),
        role: "presentation",
        children: recipe.particles.map((particle, index) => {
          const particleStyle = {
            "--hraness-design-particle-color": colorVariables2[particle.color],
            "--hraness-design-particle-delay": `${particle.delay}ms`,
            "--hraness-design-particle-drift-x": `${particle.driftX}px`,
            "--hraness-design-particle-drift-y": `${particle.driftY}px`,
            "--hraness-design-particle-duration": `${particle.duration}ms`,
            "--hraness-design-particle-opacity": particle.opacity,
            "--hraness-design-particle-size": `${particle.size}px`,
            "--hraness-design-particle-x": `${particle.x}%`,
            "--hraness-design-particle-y": `${particle.y}%`
          };
          return /* @__PURE__ */ jsx12("i", {
            className: cn3("hraness-design-particle-halo__particle", particlePresentation.className),
            style: particleStyle
          }, index);
        })
      }),
      /* @__PURE__ */ jsx12("div", {
        className: cn3("hraness-design-particle-halo__content", contentPresentation.className),
        children
      })
    ]
  });
}

// src/react/launch-beats.tsx
import { jsx as jsx13, jsxs as jsxs13 } from "react/jsx-runtime";
var HEADING_TAGS2 = {
  2: "h2",
  3: "h3",
  4: "h4"
};
function figureKind(beat) {
  switch (beat.visual.kind) {
    case "mockup":
      return "illustration";
    case "clip":
      return "recording";
    case "diagram":
      return "diagram";
  }
}
function launchBeatAnchor(beat) {
  return `beat-${beat.id}`;
}
function LaunchBeats({
  beats,
  className,
  detailLabel = "More on this",
  headingLevel = 2,
  renderVisual,
  caption
}) {
  assertLaunchBeats(beats);
  const Heading2 = HEADING_TAGS2[headingLevel];
  if (Heading2 === undefined)
    throw new RangeError("Launch beat heading level must be 2 to 4.");
  return /* @__PURE__ */ jsx13("div", {
    className: ["plain-publication__beats", className].filter(Boolean).join(" "),
    "data-hraness-launch-beats": "",
    children: beats.map((beat) => {
      const anchor = launchBeatAnchor(beat);
      const visual = renderVisual(beat);
      if (visual === null || visual === undefined || visual === false)
        throw new RangeError(`Launch beat ${JSON.stringify(beat.id)} needs a visual.`);
      return /* @__PURE__ */ jsxs13("section", {
        "aria-labelledby": `${anchor}-heading`,
        className: "plain-publication__beat",
        "data-part": beat.part,
        id: anchor,
        children: [
          /* @__PURE__ */ jsx13(Heading2, {
            id: `${anchor}-heading`,
            children: beat.headline
          }),
          /* @__PURE__ */ jsx13("p", {
            children: beat.post
          }),
          /* @__PURE__ */ jsx13(ArticleFigure, {
            caption: caption?.(beat),
            kind: figureKind(beat),
            label: beat.alt,
            children: visual
          }),
          beat.detailHref === undefined ? null : /* @__PURE__ */ jsx13("p", {
            className: "plain-publication__beat-detail",
            children: /* @__PURE__ */ jsx13("a", {
              href: beat.detailHref,
              children: detailLabel
            })
          })
        ]
      }, beat.id);
    })
  });
}

export { ProviderMark, ProviderMarkChip, foilEdge, foilTextImage, foilHalo, foilTextHalo, foilStyles, foilClassName, foilMarkClassName, FoilMark, marketingPatterns, MarketingActionLink, MarketingPage, MarketingField, MarketingMain, MarketingCardRow, MarketingCardArt, MarketingCard, MarketingSiteHeader, MarketingSiteFooter, MarketingFlow, MarketingFacts, ProductHero, MarketingPillars, MarketingInstallPanel, marketingProofFrameAddress, MarketingProofFrame, MarketingDataTable, MarketingCodeBlock, MarketingSectionLabel, MarketingSection, MarketingPrimitives, MarketingNotice, MarketingStatStrip, MarketingInterfaceGrid, MarketingTrustBoundary, MarketingQuoteGrid, MarketingPricing, MarketingQuestionList, MarketingMaker, MarketingRelated, MarketingCallToAction, ArticleByline, ArticleProvenance, MarketingArticle, ArticleSources, ArticleCallout, ArticleRelatedProducts, ArticleIndex, articleFigureKinds, ArticleFigure, ArticleVideo, ArticleTable, ArticleBarChart, ComparisonGlyph, ComparisonTable, effectsStyles, MarketingAccount, MarketingAccountActions, MarketingComparison, MarketingMarquee, DiagramArrowhead, MarketingDiagram, DitherSurface, TopBar, BottomBar, PageCanvas, DockedFooter, proceduralBackdropVariants, proceduralRecipeVersion, createProceduralBackdropRecipe, createParticleHaloRecipe, ProceduralBackdrop, PlatformIcon, PlatformBadges, ParticleHalo, launchBeatAnchor, LaunchBeats };
