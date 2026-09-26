import {
  ARTICLE_BYLINE_PREFIX,
  ARTICLE_SOURCES_HEADING,
  ARTICLE_TOC_LABEL,
  articleProvenanceSentence,
  assertArticleAuthor,
  assertArticleCalloutTone,
  assertArticleDates,
  assertArticleHref,
  formatArticleDate
} from "./chunk-zzq7bdj8.js";
import {
  highlightCode
} from "./chunk-kspdf9ch.js";
import {
  providerMark,
  providerMarkFallback,
  providerMarkOnAccent
} from "./chunk-eh71jz57.js";

// src/react/foil.stylex.ts
import * as stylex from "@stylexjs/stylex";
var foilSurfaceImage = "linear-gradient(var(--hraness-foil-surface, var(--surface, var(--background, Canvas))), var(--hraness-foil-surface, var(--surface, var(--background, Canvas)))), radial-gradient(ellipse 28% 100% at var(--hraness-foil-x, 50%) var(--hraness-foil-y, 50%), color-mix(in srgb, white calc(60% + var(--hraness-foil-glow, 0) * 24%), transparent) 0%, transparent 72%), radial-gradient(ellipse 80% 180% at calc(100% - var(--hraness-foil-x, 50%)) calc(100% - var(--hraness-foil-y, 50%)), color-mix(in srgb, white var(--hraness-foil-sheen-opacity, 28%), transparent) 0%, transparent 78%), linear-gradient(115deg, var(--_hraness-foil-1), var(--_hraness-foil-2), var(--_hraness-foil-3), var(--_hraness-foil-4), var(--_hraness-foil-5), var(--_hraness-foil-6))";
var foilTextImage = "var(--hraness-foil-image, radial-gradient(ellipse 24% 85% at var(--hraness-foil-x, 50%) var(--hraness-foil-y, 50%), color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 80%, var(--background, Canvas)) 0%, transparent 68%), radial-gradient(ellipse 65% 160% at calc(100% - var(--hraness-foil-x, 50%)) calc(100% - var(--hraness-foil-y, 50%)), color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 98%, var(--background, Canvas)) 0%, transparent 72%), linear-gradient(115deg, color-mix(in srgb, var(--_hraness-foil-1) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-2) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-3) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-4) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-5) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-6) var(--hraness-foil-reflection, 14%), transparent)), linear-gradient(115deg, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 90%, var(--background, Canvas)) 0%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 100%, var(--background, Canvas)) 24%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 86%, var(--background, Canvas)) 39%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 100%, var(--background, Canvas)) 56%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 84%, var(--background, Canvas)) 82%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 100%, var(--background, Canvas)) 100%))";
var foilSurfaceBackgroundClip = "padding-box, border-box, border-box, border-box";
var foilHalo = "0 1px 4px color-mix(in srgb, var(--foreground, CanvasText) 12%, transparent)";
var foilTextHalo = "none";
var foilStyles = {
  surface: {
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    kp1lYL: "xamhcws",
    kj6szv: "xyy74w7",
    kFnvHg: "xlxy82",
    kr1EtK: "x19sr0n1",
    kbouuQ: "x13fuv20",
    kdrUmJ: "x32b0ac",
    kk3gbz: "x1q0q8m5",
    kBLvaE: "x19ypqd9",
    kQDVEZ: "x1v8p93f xnvbotg",
    kkqsfi: "xhe5wa1 x1w6ug",
    k3smXN: "x16stqrj xaj2e6u",
    kzT0vu: "x1g4hjc xdhbxfy",
    kL20gf: "xtok3t1 x9yvj25",
    kb5WsR: "x110o44i xhobzj1",
    kVHNYi: "x1gqfdwy",
    kUtEtU: "x123zpmm",
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
  return [hook, stylex.props(foilStyles[kind]).className, caller].filter((value) => value !== undefined && value.length > 0).join(" ");
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
  return [hook, stylex.props(markStyles[part]).className, caller].filter(Boolean).join(" ");
}

// src/react/foil-mark.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function FoilMark({
  src,
  className,
  label,
  size = 24,
  fallback
}) {
  if (!Number.isFinite(size) || size <= 0)
    throw new RangeError("FoilMark size must be positive and finite.");
  return /* @__PURE__ */ jsxs("span", {
    "aria-hidden": label === undefined ? true : undefined,
    "aria-label": label,
    className: foilMarkClassName("root", className),
    "data-foil": "",
    role: label === undefined ? undefined : "img",
    style: {
      "--hraness-foil-size": `${size}px`
    },
    children: [
      fallback ?? /* @__PURE__ */ jsx("img", {
        alt: "",
        className: foilMarkClassName("image"),
        decoding: "async",
        height: size,
        src,
        width: size
      }),
      /* @__PURE__ */ jsx("span", {
        "aria-hidden": "true",
        className: foilMarkClassName("paint"),
        style: {
          "--hraness-foil-mask": `url(${JSON.stringify(src)})`
        }
      })
    ]
  });
}

// src/react/syntax-code.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function SyntaxCode({
  className,
  code,
  language,
  styles
}) {
  const highlighted = highlightCode(code, language, styles === undefined ? {} : {
    styles
  });
  const classes = className === undefined ? highlighted.className : `${highlighted.className} ${className}`;
  return /* @__PURE__ */ jsx2("code", {
    className: classes,
    "data-language": highlighted.language,
    dangerouslySetInnerHTML: {
      __html: highlighted.html
    }
  });
}

// src/react/product-marketing.tsx
import { HeroBackdrop } from "@hraness/design-kit/react/hero-backdrop";

// src/react/product-marketing.stylex.ts
import * as stylex2 from "@stylexjs/stylex";
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
    kOIVth: "x339ura",
    kYk0Dm: "xvueqy4",
    kJVvJu: "xy8kwyo",
    kR2Kwr: "x174t0ru",
    kF3gjK: "x9nclcg",
    $$css: true
  },
  header__brand: {
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
  header__nav: {
    k1xSpc: "x78zum5",
    kR2Kwr: "x1a02dak",
    kkeX5w: "x6s0dn4",
    kOIVth: "xrfvb6r x7csx6o",
    kImiAN: "xvc5jky",
    kayTVb: "x61vft0",
    kULEZF: "x191frmh",
    $$css: true
  },
  header__link: {
    kMwMTN: "xs87ocq x16tyrwk",
    kLh5Sq: "x1qzg9v8",
    ko3Kzr: "xk50ysn",
    kyVV8l: "x1hl2dhg",
    $$css: true
  },
  header__linkCurrent: {
    kMwMTN: "xtylnni",
    kLh5Sq: "x1qzg9v8",
    ko3Kzr: "xk50ysn",
    kyVV8l: "x1hl2dhg",
    $$css: true
  },
  header__actions: {
    k1xSpc: "x78zum5",
    kkeX5w: "x6s0dn4",
    kOIVth: "x13z6uf9",
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
    kb5WsR: "x1tu0gag xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x1c7cvlu x1ug5rqp",
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
    kmVPX3: "xvnrejc",
    k99D8V: "x1ycrnls x18z9243",
    kNdqCV: "x10bp9g4 xv2i73l",
    kLjGic: "xh5xj37 xtthz4l",
    kpfRUI: "x10c7sm8 xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1e6avla",
    kL20gf: "x5pkgvi x9yvj25",
    kb5WsR: "x18o3ruo xhobzj1",
    k2EZ2Y: "x1y4qj14 x2c5uud",
    kevRTx: "x103pssi x1ug5rqp",
    kt02CW: "x182nak8 x1pjo12s",
    kVHNYi: "x12koezg xzln6ae",
    kUtEtU: "x1u7o2vf x1tzqu68",
    kdutIq: "x1fdtg7e xcrev8p",
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
    kmVPX3: "xvnrejc",
    k99D8V: "x1ycrnls x18z9243",
    kNdqCV: "x10bp9g4 xv2i73l",
    kLjGic: "xh5xj37 xtthz4l",
    kpfRUI: "x10c7sm8 xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x1e6avla",
    kL20gf: "x3bf0mw",
    kb5WsR: "x18o3ruo",
    k2EZ2Y: "x1y4qj14",
    kevRTx: "x103pssi",
    kt02CW: "x182nak8",
    kVHNYi: "x12koezg",
    kUtEtU: "x1u7o2vf",
    kdutIq: "x1fdtg7e",
    kQDVEZ: "xvsa0ys",
    kkqsfi: "x5nxu0g",
    k3smXN: "x1h0034l",
    kzT0vu: "x14bglue",
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
    kdYMnH: "xesnm00",
    kogj98: "x1ghz6dp",
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
    khsPd: "xlejusl",
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
    khsPd: "xlejusl",
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
    khsPd: "xlejusl",
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
    khsPd: "xlejusl",
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
    khsPd: "xlejusl",
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
  related__group: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xru8eyw",
    kdYMnH: "xesnm00",
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
    knIRL8: "xb0810w",
    ko3Kzr: "x7cedwp",
    kUEKN5: "x154du55",
    kN5DiO: "x16b8c5l",
    kYjUv9: "x1w2vvpw",
    kLh5Sq: "xksl5lr",
    $$css: true
  },
  related__group_summary: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xs87ocq",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1c3i2sq",
    kN5DiO: "x1evy7pa",
    $$css: true
  },
  related__card: {
    k1xSpc: "x78zum5",
    kvQiKF: "x1q0g3np",
    kkeX5w: "x6s0dn4",
    kVAEAm: "x1n2onr6",
    kHBbk8: "xc8icb0",
    kdYMnH: "xesnm00",
    kVQ08L: "x1ljpu7r",
    k29mPU: "xkh2ocl",
    kOIVth: "x8fetqu",
    kmVPX3: "x14nneff",
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
    kTJQHc: "x1io0m3d x15rgdgi xwaqzdf",
    kMwMTN: "x1heor9g xs5hli",
    kyVV8l: "x1hl2dhg",
    kI3sdo: "x13mrud1",
    kVtf5F: "x7s97pk",
    $$css: true
  },
  related__card_mark: {
    kVZ5iK: "x1c4vz4f",
    kEE5IU: "x2lah0s",
    kR2Kky: "xdl72j9",
    k1xSpc: "x3nfvp2",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kULEZF: "x166urtk",
    kLWsYc: "x1cd9x91",
    $$css: true
  },
  related__card_text: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xvh977a",
    kdYMnH: "xesnm00",
    $$css: true
  },
  related__card_name: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1603h9y",
    ko3Kzr: "x1xlr1w8",
    kUEKN5: "xjat59b",
    kN5DiO: "x132q4wb",
    k7QVf6: "xj0a0fe",
    $$css: true
  },
  related__card_role: {
    kogj98: "x1ghz6dp",
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kLh5Sq: "x1lkfr7t",
    kN5DiO: "xfrs9s4",
    kYjUv9: "x1fzhlzt",
    $$css: true
  },
  trust: {
    kMwMTN: "xtylnni",
    knIRL8: "xrtw95r",
    kULEZF: "x19vpta5",
    kdYMnH: "xesnm00",
    kYk0Dm: "xvueqy4",
    kF3gjK: "x1e7ni4k",
    khsPd: "xlejusl",
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
    khsPd: "xlejusl",
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
    khsPd: "xlejusl",
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
    khsPd: "xlejusl",
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
    khsPd: "xlejusl",
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
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kohv2D: "xe8uvvx",
    kOIVth: "x8fetqu",
    kg9kkx: "xeonaw6",
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
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kOIVth: "x8fetqu",
    kg9kkx: "x1p797x9",
    $$css: true
  },
  trust_grid: {
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kOIVth: "x8fetqu",
    kg9kkx: "x1p797x9",
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
    k1xSpc: "xrvj5dj",
    kkeX5w: "x1qjc9v5",
    kogj98: "x1ghz6dp",
    kOIVth: "x8fetqu",
    kg9kkx: "x1p797x9",
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
    kyVV8l: "x1hl2dhg xt0b8zv",
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
    kLigFv: "x1bz48vb",
    $$css: true
  },
  question__answer: {
    k2kXS: "xjq529q",
    kF3gjK: "xs0puwk",
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
    khsPd: "xlejusl",
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
    k99D8V: "xn57pnr x18z9243",
    kNdqCV: "x8a5x8j xv2i73l",
    kLjGic: "xu8467y xtthz4l",
    kpfRUI: "x1q5zsyi xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "x1itpb23 x1612i37 x9yvj25",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kMwMTN: "xtylnni xs5hli",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    $$css: true
  },
  actionPrimary: {
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x8txlsq x13ub6g4",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "x1n99sos x4tl7fj",
    kNdqCV: "xfhlmeg xg6qco4",
    kLjGic: "xsk4iu xw5ezrz",
    kpfRUI: "xflieqs x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq xmi9hcf xwvh9j7",
    kb5WsR: "x110o44i x1388job x1gsbfz3 xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x1gqfdwy xavt58p xnu620s xzln6ae",
    kUtEtU: "x123zpmm xbnmzcp xt5c5zx x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "x102ovp5 x1a46atw",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    $$css: true
  },
  headerAction: {
    k1xSpc: "x3nfvp2",
    kVQ08L: "x24yzcb",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "xn57pnr x18z9243",
    kNdqCV: "x8a5x8j xv2i73l",
    kLjGic: "xu8467y xtthz4l",
    kpfRUI: "x1q5zsyi xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "x1itpb23 x1612i37 x9yvj25",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kMwMTN: "xtylnni xs5hli",
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
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x8txlsq x13ub6g4",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x24yzcb",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "x1n99sos x4tl7fj",
    kNdqCV: "xfhlmeg xg6qco4",
    kLjGic: "xsk4iu xw5ezrz",
    kpfRUI: "xflieqs x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq xmi9hcf xwvh9j7",
    kb5WsR: "x110o44i x1388job x1gsbfz3 xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x1gqfdwy xavt58p xnu620s xzln6ae",
    kUtEtU: "x123zpmm xbnmzcp xt5c5zx x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "x102ovp5 x1a46atw",
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
    k99D8V: "xn57pnr x18z9243",
    kNdqCV: "x8a5x8j xv2i73l",
    kLjGic: "xu8467y xtthz4l",
    kpfRUI: "x1q5zsyi xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "x1itpb23 x1612i37 x9yvj25",
    kb5WsR: "x18o3ruo xn3cpwa xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x12koezg xzsr2ly xzln6ae",
    kUtEtU: "x1u7o2vf xb3gsto x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kMwMTN: "xtylnni xs5hli",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    k24iC1: "x1lqcxt8",
    $$css: true
  },
  planActionPrimary: {
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x8txlsq x13ub6g4",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "x1n99sos x4tl7fj",
    kNdqCV: "xfhlmeg xg6qco4",
    kLjGic: "xsk4iu xw5ezrz",
    kpfRUI: "xflieqs x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq xmi9hcf xwvh9j7",
    kb5WsR: "x110o44i x1388job x1gsbfz3 xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl x2c5uud",
    kevRTx: "x103pssi x1vgyi1t x1ug5rqp",
    kt02CW: "x182nak8 x1ddkqqy x1pjo12s",
    kVHNYi: "x1gqfdwy xavt58p xnu620s xzln6ae",
    kUtEtU: "x123zpmm xbnmzcp xt5c5zx x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf xcrev8p",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "x102ovp5 x1a46atw",
    knIRL8: "xrtw95r",
    kLh5Sq: "xyr29y3",
    ko3Kzr: "xk50ysn",
    kN5DiO: "x1u7k74",
    kyVV8l: "x1hl2dhg x1lku1pv",
    k24iC1: "x1lqcxt8",
    $$css: true
  },
  heroActionPrimary: {
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x12pzqlm x1y7wltu",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "x1n99sos x4tl7fj",
    kNdqCV: "xfhlmeg xg6qco4",
    kLjGic: "xsk4iu xw5ezrz",
    kpfRUI: "xflieqs x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq x1xh63g1 x1pjirtg",
    kb5WsR: "x110o44i x1388job x1gsbfz3 xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl",
    kevRTx: "x103pssi x1vgyi1t",
    kt02CW: "x182nak8 x1ddkqqy",
    kVHNYi: "x1gqfdwy xavt58p xnu620s xzln6ae",
    kUtEtU: "x123zpmm xbnmzcp xt5c5zx x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "xoh73e0 x1ac5u26",
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
    k99D8V: "xn57pnr x18z9243",
    kNdqCV: "x8a5x8j xv2i73l",
    kLjGic: "xu8467y xtthz4l",
    kpfRUI: "x1q5zsyi xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xjbqb8w x1n5bzlp",
    kb5WsR: "x18o3ruo xn3cpwa",
    k2EZ2Y: "x1y4qj14 xduu9rl",
    kevRTx: "x103pssi x1vgyi1t",
    kt02CW: "x182nak8 x1ddkqqy",
    kVHNYi: "x12koezg xzsr2ly",
    kUtEtU: "x1u7o2vf xb3gsto",
    kdutIq: "x1fdtg7e xgildtf",
    kMwMTN: "x102ovp5 xucth70",
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
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    "--hraness-foil-surface": "x12pzqlm",
    k1xSpc: "x3nfvp2",
    kVQ08L: "x1kopacs x9me654",
    kkeX5w: "x6s0dn4",
    kGmCso: "xl56j7k",
    kOIVth: "x1rcpt3j",
    kmVPX3: "x19qf9ol",
    k99D8V: "x1n99sos x4tl7fj",
    kNdqCV: "xfhlmeg xg6qco4",
    kLjGic: "xsk4iu xw5ezrz",
    kpfRUI: "xflieqs x1bvw2bm",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xtok3t1 xr4j8zq x1xh63g1 x1pjirtg",
    kb5WsR: "x110o44i x1388job x1gsbfz3 xhobzj1",
    k2EZ2Y: "x1y4qj14 xduu9rl",
    kevRTx: "x103pssi x1vgyi1t",
    kt02CW: "x182nak8 x1ddkqqy",
    kVHNYi: "x1gqfdwy xavt58p xnu620s xzln6ae",
    kUtEtU: "x123zpmm xbnmzcp xt5c5zx x1tzqu68",
    kdutIq: "x1fdtg7e xgildtf",
    kTJQHc: "x1csdrso x1njw758 x1gof2l0 xwaqzdf",
    kMwMTN: "xoh73e0 x1ac5u26",
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
    k99D8V: "xn57pnr x18z9243",
    kNdqCV: "x8a5x8j xv2i73l",
    kLjGic: "xu8467y xtthz4l",
    kpfRUI: "x1q5zsyi xug5yj",
    kbZlsR: "x18sabzy x1cfjbvc",
    kAFNHU: "x1jleocg x1a4igh8",
    kyY1tn: "x1pjjote xsdpl10",
    kCh6Gp: "x1e53mt7 x1sz4vi2",
    kzSjEv: "xgkqhyc x4aylkk",
    kvZwPi: "x19hin1r",
    kL20gf: "xjbqb8w x1n5bzlp",
    kb5WsR: "x18o3ruo xn3cpwa",
    k2EZ2Y: "x1y4qj14 xduu9rl",
    kevRTx: "x103pssi x1vgyi1t",
    kt02CW: "x182nak8 x1ddkqqy",
    kVHNYi: "x12koezg xzsr2ly",
    kUtEtU: "x1u7o2vf xb3gsto",
    kdutIq: "x1fdtg7e xgildtf",
    kMwMTN: "x102ovp5 xucth70",
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
    later: marketingStyles.pillars__itemLater
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
    default: marketingStyles.proof_frame__title
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
  "hraness-marketing-related__group": {
    default: marketingStyles.related__group
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
    default: marketingStyles.card
  },
  "hraness-marketing-card__art": {
    default: marketingStyles.card__art
  },
  "hraness-marketing-card__title": {
    default: marketingStyles.card__title
  },
  "hraness-marketing-card__meta": {
    default: marketingStyles.card__meta
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
function marketingColumnClassName(hook, caller, columns) {
  if (columns !== undefined && columns !== 1 && columns !== 2 && columns !== 3 && columns !== 4) {
    throw new RangeError("Marketing columns must be 1, 2, 3, or 4 when specified.");
  }
  const columnRecipe = columns === undefined ? undefined : (hook === "hraness-marketing-pillars" ? pillarColumns : factColumns)[columns];
  return [hook, stylex2.props(recipes[hook].default, columnRecipe).className, caller].filter((value) => value !== undefined && value.length > 0).join(" ");
}
function marketingClassName(hook, caller, variant = "default") {
  const variants = recipes[hook];
  if (!Object.hasOwn(variants, variant))
    throw new Error(`Unknown marketing variant: ${hook}/${variant}`);
  const selected = variants[variant];
  return [hook, stylex2.props(selected, hook === "hraness-marketing-action" && marketingStyles.actionFocus, hook === "hraness-marketing-question" && questionMarker).className, caller].filter((value) => value !== undefined && value.length > 0).join(" ");
}
function marketingFactCellVariant(index) {
  return index === 0 ? "default" : index < 2 ? "later" : index % 2 === 0 ? "row-odd" : "row";
}

// src/react/product-marketing.tsx
import { jsx as jsx3, jsxs as jsxs2, Fragment } from "react/jsx-runtime";
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
      return /* @__PURE__ */ jsx3("a", {
        className: marketingClassName("hraness-marketing-action", undefined, tone === "accent" ? `${context}-${emphasis}` : emphasis === "primary" ? "primary" : "default"),
        "data-emphasis": emphasis,
        "data-foil": emphasis === "primary" ? "" : undefined,
        href: action.href,
        children: action.label
      }, `${action.href}-${action.label}`);
    })
  });
}
function MarketingPage({
  children,
  className,
  id,
  preset,
  pattern
}) {
  if (preset !== undefined && preset !== "editorial" && preset !== "minimal")
    throw new RangeError("Unknown marketing preset.");
  assertMarketingPattern(pattern);
  return /* @__PURE__ */ jsx3("div", {
    className: marketingClassName("hraness-marketing-page", className),
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
  className
}) {
  return /* @__PURE__ */ jsxs2("div", {
    "aria-label": ariaLabel,
    className: marketingClassName("hraness-marketing-card-row", className),
    "data-hraness-marketing": "card-row",
    children: [
      cards?.map((card) => /* @__PURE__ */ jsx3(MarketingCard, {
        title: card.title,
        ...card.art === undefined ? {} : {
          art: card.art
        },
        ...card.href === undefined ? {} : {
          href: card.href
        },
        ...card.meta === undefined ? {} : {
          meta: card.meta
        }
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
  meta,
  title
}) {
  const body = /* @__PURE__ */ jsxs2(Fragment, {
    children: [
      isPresentNode(art) ? /* @__PURE__ */ jsx3(MarketingCardArt, {
        children: art
      }) : null,
      /* @__PURE__ */ jsx3("h3", {
        className: marketingClassName("hraness-marketing-card__title"),
        children: title
      }),
      meta === undefined || meta === "" ? null : /* @__PURE__ */ jsx3("p", {
        className: marketingClassName("hraness-marketing-card__meta"),
        children: meta
      }),
      isPresentNode(children) ? /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-card__body"),
        children
      }) : null
    ]
  });
  if (href === undefined) {
    return /* @__PURE__ */ jsx3("article", {
      className: marketingClassName("hraness-marketing-card", className),
      "data-hraness-marketing": "card",
      children: body
    });
  }
  return /* @__PURE__ */ jsx3("a", {
    className: marketingClassName("hraness-marketing-card", className),
    "data-hraness-marketing": "card",
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
    children: /* @__PURE__ */ jsxs2("div", {
      className: marketingClassName("hraness-marketing-header__inner"),
      children: [
        /* @__PURE__ */ jsxs2("a", {
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
        action === undefined && trailing === undefined ? null : /* @__PURE__ */ jsxs2("div", {
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
    children: /* @__PURE__ */ jsxs2("div", {
      className: marketingClassName("hraness-marketing-footer__inner"),
      children: [
        /* @__PURE__ */ jsxs2("a", {
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
    children: steps.map((step, index) => /* @__PURE__ */ jsxs2("li", {
      className: marketingClassName("hraness-marketing-flow__step", undefined, index === 0 ? "first" : "default"),
      children: [
        /* @__PURE__ */ jsx3("span", {
          "aria-hidden": "true",
          className: marketingClassName("hraness-marketing-flow__number"),
          children: String(index + 1).padStart(2, "0")
        }),
        /* @__PURE__ */ jsxs2("div", {
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
    children: facts.map((fact, index) => /* @__PURE__ */ jsxs2("div", {
      className: marketingClassName("hraness-marketing-facts__item", undefined, marketingFactCellVariant(index)),
      children: [
        /* @__PURE__ */ jsx3("dt", {
          className: marketingClassName("hraness-marketing-facts__label"),
          children: fact.label
        }),
        /* @__PURE__ */ jsxs2("dd", {
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
  backdrop,
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
  name,
  notice,
  proof,
  summary,
  tone = "paper"
}) {
  return /* @__PURE__ */ jsxs2("header", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-hero", className, tone === "accent" ? "accent" : "default"),
    "data-align": align,
    "data-hraness-marketing": "hero",
    "data-tone": tone,
    children: [
      backdrop === false ? null : /* @__PURE__ */ jsx3(HeroBackdrop, {
        seed: headingId,
        children: backdrop
      }),
      /* @__PURE__ */ jsxs2("div", {
        className: marketingClassName("hraness-marketing-hero__copy", undefined, align === "start" ? "start" : "default"),
        children: [
          eyebrow === undefined || eyebrow === "" ? null : /* @__PURE__ */ jsx3("p", {
            className: marketingClassName("hraness-marketing-hero__eyebrow", undefined, tone === "accent" ? "accent" : "default"),
            children: eyebrow
          }),
          /* @__PURE__ */ jsx3("p", {
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
      proof === undefined ? null : /* @__PURE__ */ jsxs2("aside", {
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
  pillars
}) {
  const rootClassName = marketingColumnClassName("hraness-marketing-pillars", className, columns);
  if (pillars.length === 0)
    return null;
  return /* @__PURE__ */ jsx3("dl", {
    "aria-label": ariaLabel,
    className: rootClassName,
    "data-hraness-marketing": "pillars",
    style: columns === undefined ? {
      "--hraness-marketing-pillar-columns": String(pillars.length)
    } : undefined,
    children: pillars.map((pillar, index) => /* @__PURE__ */ jsxs2("div", {
      className: marketingClassName("hraness-marketing-pillars__item", undefined, index === 0 ? "default" : "later"),
      children: [
        /* @__PURE__ */ jsx3("dt", {
          className: marketingClassName("hraness-marketing-pillars__label"),
          children: pillar.label
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
  return /* @__PURE__ */ jsxs2("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-install", className),
    "data-hraness-marketing": "install",
    id,
    children: [
      /* @__PURE__ */ jsxs2("div", {
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
function MarketingProofFrame({
  caption,
  children,
  className,
  credit,
  title
}) {
  return /* @__PURE__ */ jsxs2("figure", {
    className: marketingClassName("hraness-marketing-proof-frame", className),
    "data-hraness-marketing": "proof-frame",
    children: [
      title === undefined ? null : /* @__PURE__ */ jsxs2("div", {
        "aria-hidden": "true",
        className: marketingClassName("hraness-marketing-proof-frame__chrome"),
        children: [
          /* @__PURE__ */ jsxs2("span", {
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
          /* @__PURE__ */ jsx3("span", {
            className: marketingClassName("hraness-marketing-proof-frame__title"),
            children: title
          })
        ]
      }),
      /* @__PURE__ */ jsx3("div", {
        className: marketingClassName("hraness-marketing-proof-frame__content"),
        children
      }),
      caption === undefined && credit === undefined ? null : /* @__PURE__ */ jsxs2("figcaption", {
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
  id,
  label,
  layout = "stack",
  summary
}) {
  return /* @__PURE__ */ jsxs2("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-section", className, layout === "stack" ? "default" : "split"),
    "data-hraness-marketing": "section",
    "data-layout": layout,
    id,
    children: [
      /* @__PURE__ */ jsxs2("div", {
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
          })
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
  return /* @__PURE__ */ jsxs2("header", {
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
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  label,
  summary
}) {
  return /* @__PURE__ */ jsxs2("section", {
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
        className: marketingClassName("hraness-marketing-primitives__list"),
        children: items.map((item, index) => /* @__PURE__ */ jsxs2("li", {
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
  return /* @__PURE__ */ jsxs2("section", {
    "aria-label": ariaLabel,
    className: marketingClassName("hraness-marketing-stats", className),
    "data-hraness-marketing": "stats",
    children: [
      /* @__PURE__ */ jsx3("dl", {
        className: listClassName,
        style: columns === undefined ? {
          "--hraness-marketing-fact-columns": String(stats.length)
        } : undefined,
        children: stats.map((stat, index) => /* @__PURE__ */ jsxs2("div", {
          className: marketingClassName("hraness-marketing-facts__item", undefined, marketingFactCellVariant(index)),
          children: [
            /* @__PURE__ */ jsx3("dt", {
              className: marketingClassName("hraness-marketing-facts__label"),
              children: stat.label
            }),
            /* @__PURE__ */ jsxs2("dd", {
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
  heading,
  headingId,
  headingLevel = 2,
  id,
  interfaces,
  label,
  summary
}) {
  return /* @__PURE__ */ jsxs2("section", {
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
        className: marketingClassName("hraness-marketing-interface-grid"),
        children: interfaces.map((entry) => /* @__PURE__ */ jsxs2("article", {
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
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  label,
  summary
}) {
  return /* @__PURE__ */ jsxs2("section", {
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
        className: marketingClassName("hraness-marketing-trust-grid"),
        children: items.map((item) => /* @__PURE__ */ jsxs2("div", {
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
  return /* @__PURE__ */ jsxs2("section", {
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
          children: /* @__PURE__ */ jsxs2("figure", {
            className: marketingClassName("hraness-marketing-quote"),
            children: [
              /* @__PURE__ */ jsx3("blockquote", {
                className: marketingClassName("hraness-marketing-quote__body"),
                children: /* @__PURE__ */ jsx3("p", {
                  className: marketingClassName("hraness-marketing-quote__text"),
                  children: entry.quote
                })
              }),
              /* @__PURE__ */ jsxs2("figcaption", {
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
  return /* @__PURE__ */ jsxs2("section", {
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
        children: plans.map((plan) => /* @__PURE__ */ jsxs2("li", {
          className: marketingClassName("hraness-marketing-plan", undefined, plan.emphasis === "primary" ? "primary" : "default"),
          "data-emphasis": plan.emphasis ?? "secondary",
          children: [
            /* @__PURE__ */ jsx3(Heading, {
              className: marketingClassName("hraness-marketing-plan__name"),
              level: childHeadingLevel(headingLevel),
              children: plan.name
            }),
            /* @__PURE__ */ jsxs2("p", {
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
  return /* @__PURE__ */ jsxs2("section", {
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
        children: questions.map((question, index) => /* @__PURE__ */ jsxs2("details", {
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
  return /* @__PURE__ */ jsxs2("section", {
    "aria-labelledby": headingId,
    className: marketingClassName("hraness-marketing-maker", className),
    "data-hraness-marketing": "maker",
    id,
    children: [
      /* @__PURE__ */ jsxs2("header", {
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
      /* @__PURE__ */ jsxs2("div", {
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
  items,
  level
}) {
  return /* @__PURE__ */ jsx3(Fragment, {
    children: items.map((item) => /* @__PURE__ */ jsxs2("a", {
      className: marketingClassName("hraness-marketing-related__card"),
      "data-foil": "",
      "data-hraness-marketing": "card",
      href: item.href,
      children: [
        isPresentNode(item.art) || item.mark !== undefined && item.mark !== "" ? /* @__PURE__ */ jsx3("span", {
          "aria-hidden": "true",
          className: marketingClassName("hraness-marketing-related__card-mark"),
          children: isPresentNode(item.art) ? item.art : /* @__PURE__ */ jsx3(FoilMark, {
            size: 44,
            src: item.mark ?? ""
          })
        }) : null,
        /* @__PURE__ */ jsxs2("span", {
          className: marketingClassName("hraness-marketing-related__card-text"),
          children: [
            /* @__PURE__ */ jsx3(Heading, {
              className: marketingClassName("hraness-marketing-related__card-name"),
              level,
              children: item.name
            }),
            /* @__PURE__ */ jsx3("span", {
              className: marketingClassName("hraness-marketing-related__card-role"),
              children: item.role
            })
          ]
        })
      ]
    }, item.name))
  });
}
function MarketingRelated({
  className,
  heading,
  headingId,
  headingLevel = 2,
  id,
  items,
  groups,
  label,
  summary
}) {
  return /* @__PURE__ */ jsxs2("section", {
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
      groups === undefined ? /* @__PURE__ */ jsx3(MarketingCardRow, {
        children: /* @__PURE__ */ jsx3(MarketingRelatedCards, {
          items,
          level: childHeadingLevel(headingLevel)
        })
      }) : groups.map((group) => /* @__PURE__ */ jsxs2("div", {
        className: marketingClassName("hraness-marketing-related__group"),
        children: [
          /* @__PURE__ */ jsxs2("div", {
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
          /* @__PURE__ */ jsx3(MarketingCardRow, {
            ariaLabel: group.heading,
            children: /* @__PURE__ */ jsx3(MarketingRelatedCards, {
              items: group.items,
              level: childHeadingLevel(childHeadingLevel(headingLevel))
            })
          })
        ]
      }, group.headingId))
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
  return /* @__PURE__ */ jsxs2("section", {
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
import { jsx as jsx4, jsxs as jsxs3, Fragment as Fragment2 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs3(Fragment2, {
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
  return /* @__PURE__ */ jsxs3("span", {
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
  return /* @__PURE__ */ jsxs3("article", {
    "aria-labelledby": headingId,
    className: joinClasses(ROOT_CLASS, "plain-publication__article", className),
    "data-hraness-article": "",
    "data-toc": tocItems.length > 0 ? "aside" : "none",
    id,
    children: [
      /* @__PURE__ */ jsxs3("header", {
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
          /* @__PURE__ */ jsxs3("p", {
            className: "plain-publication__article-meta",
            children: [
              author === undefined ? null : /* @__PURE__ */ jsxs3(Fragment2, {
                children: [
                  /* @__PURE__ */ jsx4(ArticleByline, {
                    author
                  }),
                  /* @__PURE__ */ jsx4(Separator, {})
                ]
              }),
              /* @__PURE__ */ jsx4(ArticleDate, {
                label: "Published",
                value: published
              }),
              updated === undefined ? null : /* @__PURE__ */ jsxs3(Fragment2, {
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
      /* @__PURE__ */ jsxs3("div", {
        className: "plain-publication__article-layout",
        children: [
          tocItems.length === 0 ? null : /* @__PURE__ */ jsxs3("nav", {
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
  sources
}) {
  if (sources.length === 0)
    return null;
  for (const source of sources)
    assertArticleHref(source.href);
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: "plain-publication__sources",
    children: [
      /* @__PURE__ */ jsx4("h2", {
        id: headingId,
        children: heading
      }),
      /* @__PURE__ */ jsx4("ol", {
        children: sources.map((source) => /* @__PURE__ */ jsxs3("li", {
          children: [
            /* @__PURE__ */ jsx4("a", {
              href: source.href,
              children: source.title
            }),
            /* @__PURE__ */ jsxs3("span", {
              children: [
                source.publisher === undefined || source.publisher === "" ? null : /* @__PURE__ */ jsxs3(Fragment2, {
                  children: [
                    source.publisher,
                    /* @__PURE__ */ jsx4(Separator, {})
                  ]
                }),
                /* @__PURE__ */ jsx4(ArticleDate, {
                  label: "Checked",
                  value: source.checkedOn
                })
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
  return /* @__PURE__ */ jsxs3("div", {
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
  return /* @__PURE__ */ jsxs3("section", {
    "aria-labelledby": headingId,
    className: joinClasses(ROOT_CLASS, "plain-publication__list", className),
    "data-hraness-article-index": "",
    id,
    children: [
      /* @__PURE__ */ jsxs3("div", {
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
        children: items.map((item) => /* @__PURE__ */ jsxs3("article", {
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
            /* @__PURE__ */ jsxs3("p", {
              className: "plain-publication__entry-meta",
              children: [
                /* @__PURE__ */ jsx4(ArticleDate, {
                  label: "Published",
                  value: item.published
                }),
                item.updated === undefined ? null : /* @__PURE__ */ jsxs3(Fragment2, {
                  children: [
                    /* @__PURE__ */ jsx4(Separator, {}),
                    /* @__PURE__ */ jsx4(ArticleDate, {
                      label: "Updated",
                      value: item.updated
                    })
                  ]
                })
              ]
            })
          ]
        }, item.href))
      })
    ]
  });
}

// src/react/surfaces.tsx
import { forwardRef } from "react";
import * as stylex3 from "@stylexjs/stylex";
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
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var ditherSurfaceDensityStyles = {
  coarse: ditherSurfaceStyles.coarse,
  fine: ditherSurfaceStyles.fine,
  medium: undefined
};
function DitherSurface({
  className,
  density = "medium",
  xstyle,
  ...props4
}) {
  return /* @__PURE__ */ jsx5(ThemedSurface, {
    ...props4,
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
  ...props4
}) {
  const rootPresentation = stylex3.props(layoutSurfaceStyles.surface, layoutSurfaceStyles.bar, layoutSurfaceStyles.topBar, position === "sticky" ? layoutSurfaceStyles.topBarSticky : layoutSurfaceStyles.topBarStatic, surface === "glass" && layoutSurfaceStyles.topBarGlass);
  const leadingPresentation = stylex3.props(layoutSurfaceStyles.barPart);
  const titlePresentation = stylex3.props(layoutSurfaceStyles.topBarTitle);
  const contentPresentation = stylex3.props(layoutSurfaceStyles.barPart, layoutSurfaceStyles.barContent);
  const actionsPresentation = stylex3.props(layoutSurfaceStyles.barPart, layoutSurfaceStyles.topBarActions);
  return /* @__PURE__ */ jsxs4("header", {
    ...rootPresentation,
    ...props4,
    className: cn("hraness-design-top-bar", rootPresentation.className, className),
    "data-position": position,
    "data-surface": surface,
    children: [
      /* @__PURE__ */ jsxs4("div", {
        ...leadingPresentation,
        className: cn("hraness-design-top-bar__leading", leadingPresentation.className),
        children: [
          leading,
          title === undefined ? null : /* @__PURE__ */ jsx5("div", {
            ...titlePresentation,
            className: cn("hraness-design-top-bar__title", titlePresentation.className),
            children: title
          })
        ]
      }),
      children === undefined ? null : /* @__PURE__ */ jsx5("div", {
        ...contentPresentation,
        className: cn("hraness-design-top-bar__content", contentPresentation.className),
        children
      }),
      actions === undefined ? null : /* @__PURE__ */ jsx5("div", {
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
  ...props4
}) {
  const rootPresentation = stylex3.props(layoutSurfaceStyles.surface, layoutSurfaceStyles.bar, layoutSurfaceStyles.bottomBar);
  const leadingPresentation = stylex3.props(layoutSurfaceStyles.barPart);
  const contentPresentation = stylex3.props(layoutSurfaceStyles.barPart, layoutSurfaceStyles.barContent);
  const actionsPresentation = stylex3.props(layoutSurfaceStyles.barPart);
  return /* @__PURE__ */ jsxs4("footer", {
    ...rootPresentation,
    ...props4,
    className: cn("hraness-design-bottom-bar", rootPresentation.className, className),
    children: [
      leading === undefined ? null : /* @__PURE__ */ jsx5("div", {
        ...leadingPresentation,
        className: cn("hraness-design-bottom-bar__leading", leadingPresentation.className),
        children: leading
      }),
      /* @__PURE__ */ jsx5("div", {
        ...contentPresentation,
        className: cn("hraness-design-bottom-bar__content", contentPresentation.className),
        children
      }),
      actions === undefined ? null : /* @__PURE__ */ jsx5("div", {
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
  ...props4
}) {
  const Element = as;
  const presentation = stylex3.props(layoutSurfaceStyles.pageCanvas, inset === "content" ? layoutSurfaceStyles.pageContentInset : layoutSurfaceStyles.pageNoInset, size === "wide" && layoutSurfaceStyles.wideSize, size === "full" && layoutSurfaceStyles.fullSize);
  return /* @__PURE__ */ jsx5(Element, {
    ...presentation,
    ...props4,
    className: cn("hraness-design-page-canvas", presentation.className, className),
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
  ...props4
}, ref) {
  const rootPresentation = stylex3.props(layoutSurfaceStyles.surface, layoutSurfaceStyles.dockedFooter, position === "absolute" ? layoutSurfaceStyles.dockedAbsolute : position === "sticky" ? layoutSurfaceStyles.dockedSticky : layoutSurfaceStyles.dockedFixed);
  const contentPresentation = stylex3.props(layoutSurfaceStyles.dockedContent, density === "compact" ? inset === "content" ? layoutSurfaceStyles.dockedContentCompactInset : layoutSurfaceStyles.dockedContentCompactNoInset : inset === "content" ? layoutSurfaceStyles.dockedContentDefaultInset : layoutSurfaceStyles.dockedContentDefaultNoInset, size === "wide" && layoutSurfaceStyles.wideSize, size === "full" && layoutSurfaceStyles.fullSize);
  return /* @__PURE__ */ jsx5("footer", {
    ...rootPresentation,
    ...props4,
    className: cn("hraness-design-docked-footer", rootPresentation.className, className),
    "data-position": position,
    "data-surface": surface,
    ref,
    children: /* @__PURE__ */ jsx5("div", {
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
import * as stylex4 from "@stylexjs/stylex";

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
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
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
  ...props5
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
  const rootPresentation = stylex4.props(effectsStyles.proceduralRoot);
  const atmospherePresentation = stylex4.props(effectsStyles.proceduralSlot, effectsStyles.proceduralAtmosphere);
  const cloudPresentation = stylex4.props(effectsStyles.proceduralCloud);
  const gridPresentation = stylex4.props(effectsStyles.proceduralSlot, effectsStyles.proceduralGrid);
  const ripplesPresentation = stylex4.props(effectsStyles.proceduralSlot, effectsStyles.proceduralRipples);
  const ripplePresentation = stylex4.props(effectsStyles.proceduralRipple);
  return /* @__PURE__ */ jsxs5("div", {
    ...props5,
    ...INERT_PROPS,
    "aria-hidden": "true",
    className: cn2("hraness-design-procedural-backdrop", rootPresentation.className, className),
    "data-recipe-version": recipe.version,
    "data-variation": recipe.variation,
    "data-variant": recipe.variant,
    role: "presentation",
    style: rootStyle,
    children: [
      showAtmosphere ? /* @__PURE__ */ jsx6("span", {
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
          return /* @__PURE__ */ jsx6("i", {
            className: cn2("hraness-design-procedural-backdrop__cloud", cloudPresentation.className),
            style: layerStyle
          }, index);
        })
      }) : null,
      showGrid ? /* @__PURE__ */ jsx6("span", {
        className: cn2("hraness-design-procedural-backdrop__grid", gridPresentation.className),
        style: gridStyle
      }) : null,
      showRipple ? /* @__PURE__ */ jsx6("span", {
        className: cn2("hraness-design-procedural-backdrop__ripples", ripplesPresentation.className),
        style: rippleStyle,
        children: recipe.ripple.contours.map((contour, index) => {
          const contourStyle = {
            "--hraness-design-procedural-ripple-delay": `${contour.delay}ms`,
            "--hraness-design-procedural-ripple-duration": `${contour.duration}ms`,
            "--hraness-design-procedural-ripple-opacity": contour.opacity,
            "--hraness-design-procedural-ripple-size": `${contour.size}%`
          };
          return /* @__PURE__ */ jsx6("i", {
            className: cn2("hraness-design-procedural-backdrop__ripple", ripplePresentation.className),
            style: contourStyle
          }, index);
        })
      }) : null
    ]
  });
}

// src/react/provider-mark.stylex.ts
import * as stylex5 from "@stylexjs/stylex";
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
    kKwaWg: "xs51ml9 xhobzj1",
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
  glyph: {
    kZKoxP: "x1f6yev3",
    k1xSpc: "x3nfvp2",
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
  const hook = part === "tile" ? "hraness-provider-mark" : `hraness-provider-mark__${part.replaceAll(/[A-Z]/gu, (c) => `-${c.toLowerCase()}`)}`;
  return [hook, stylex5.props(providerMarkStyles[part]).className, caller].filter(Boolean).join(" ");
}

// src/react/provider-mark.tsx
import { jsx as jsx7, jsxs as jsxs6, Fragment as Fragment3 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs6(Fragment3, {
    children: [
      /* @__PURE__ */ jsx7("svg", {
        "aria-hidden": "true",
        className: providerMarkClassName("glyph"),
        dangerouslySetInnerHTML: {
          __html: mark.glyph.body
        },
        fill: "currentColor",
        viewBox: mark.glyph.viewBox
      }),
      art === null ? null : /* @__PURE__ */ jsx7("svg", {
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
  return /* @__PURE__ */ jsxs6("span", {
    "aria-hidden": label === undefined ? true : undefined,
    "aria-label": label,
    className: [providerMarkClassName("tile"), tone === "tile" ? "" : providerMarkClassName(tone), className].filter(Boolean).join(" "),
    role: label === undefined ? undefined : "img",
    style,
    children: [
      hasArtwork ? /* @__PURE__ */ jsx7(Artwork, {
        mark: resolved,
        tone
      }) : null,
      /* @__PURE__ */ jsx7("span", {
        "aria-hidden": "true",
        className: [providerMarkClassName("monogram"), hasArtwork ? "" : providerMarkClassName("monogramOnly")].filter(Boolean).join(" "),
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
  return /* @__PURE__ */ jsxs6("span", {
    className: providerMarkClassName("chip"),
    style: {
      "--_mark-size": `${rest.size ?? 32}px`
    },
    children: [
      /* @__PURE__ */ jsx7(ProviderMark, {
        mark: resolved,
        ...rest
      }),
      /* @__PURE__ */ jsx7("span", {
        className: providerMarkClassName("chipName"),
        children: name ?? resolved.name
      })
    ]
  });
}

// src/react/particle-halo.tsx
import { cn as cn3 } from "@hraness/ui";
import * as stylex6 from "@stylexjs/stylex";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
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
  ...props7
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
  const rootPresentation = stylex6.props(effectsStyles.particleRoot);
  const fieldPresentation = stylex6.props(effectsStyles.particleField);
  const particlePresentation = stylex6.props(effectsStyles.particle);
  const contentPresentation = stylex6.props(effectsStyles.particleContent);
  return /* @__PURE__ */ jsxs7("div", {
    ...props7,
    className: cn3("hraness-design-particle-halo", rootPresentation.className, className),
    "data-recipe-version": recipe.version,
    "data-variation": recipe.variation,
    style: rootStyle,
    children: [
      /* @__PURE__ */ jsx8("span", {
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
          return /* @__PURE__ */ jsx8("i", {
            className: cn3("hraness-design-particle-halo__particle", particlePresentation.className),
            style: particleStyle
          }, index);
        })
      }),
      /* @__PURE__ */ jsx8("div", {
        className: cn3("hraness-design-particle-halo__content", contentPresentation.className),
        children
      })
    ]
  });
}

export { foilSurfaceImage, foilTextImage, foilSurfaceBackgroundClip, foilHalo, foilTextHalo, foilStyles, foilClassName, foilMarkClassName, FoilMark, SyntaxCode, marketingPatterns, MarketingPage, MarketingField, MarketingMain, MarketingCardRow, MarketingCardArt, MarketingCard, MarketingSiteHeader, MarketingSiteFooter, MarketingFlow, MarketingFacts, ProductHero, MarketingPillars, MarketingInstallPanel, MarketingProofFrame, MarketingSectionLabel, MarketingSection, MarketingPrimitives, MarketingStatStrip, MarketingInterfaceGrid, MarketingTrustBoundary, MarketingQuoteGrid, MarketingPricing, MarketingQuestionList, MarketingMaker, MarketingRelated, MarketingCallToAction, ArticleByline, ArticleProvenance, MarketingArticle, ArticleSources, ArticleCallout, ArticleRelatedProducts, ArticleIndex, effectsStyles, DitherSurface, TopBar, BottomBar, PageCanvas, DockedFooter, proceduralBackdropVariants, proceduralRecipeVersion, createProceduralBackdropRecipe, createParticleHaloRecipe, ProceduralBackdrop, ProviderMark, ProviderMarkChip, ParticleHalo };
