// src/mockups/core.tsx
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
function joinMockupClasses(...values) {
  return values.filter((value) => typeof value === "string" && value !== "").join(" ");
}
function assertMockupDescription(describe, component) {
  if (typeof describe !== "string" || describe.trim() === "") {
    throw new TypeError(`${component} needs a describe string; it is the illustration's accessible name.`);
  }
}
function optOutAttributes(optOut) {
  if (optOut === undefined)
    return {};
  const attributes = {};
  for (const name of Object.keys(optOut)) {
    if (!/^data-[a-z0-9-]+$/u.test(name))
      throw new TypeError(`Mockup opt-out attribute ${JSON.stringify(name)} must be a lowercase data- attribute.`);
    attributes[name] = "";
  }
  return attributes;
}
function MockupRoot({
  children,
  className,
  describe,
  kind,
  optOut,
  style,
  theme
}) {
  assertMockupDescription(describe, kind);
  return /* @__PURE__ */ jsx("div", {
    ...optOutAttributes(optOut),
    "aria-label": describe.trim(),
    className: joinMockupClasses("hkm-root", `hkm-${kind}`, className),
    "data-hkm-kind": kind,
    "data-hkm-theme": theme,
    "data-nosnippet": "",
    role: "img",
    style,
    children
  });
}
function SampleText({
  children,
  optOut
}) {
  return /* @__PURE__ */ jsx("span", {
    ...optOutAttributes(optOut),
    className: "hkm-sample",
    children
  });
}
function SampleParagraphs({
  className,
  optOut,
  text
}) {
  return /* @__PURE__ */ jsx(Fragment, {
    children: text.split(/\n{2,}/u).map((paragraph, index) => /* @__PURE__ */ jsx("p", {
      className,
      children: /* @__PURE__ */ jsx(SampleText, {
        ...optOut === undefined ? {} : {
          optOut
        },
        children: paragraph
      })
    }, index))
  });
}
function compact(value) {
  if (!Number.isFinite(value))
    throw new RangeError("compact() needs a finite number.");
  const sign = value < 0 ? "-" : "";
  const n = Math.abs(value);
  const scaled = (divisor, suffix) => {
    const quotient = n / divisor;
    const text = quotient < 10 ? (Math.floor(quotient * 10) / 10).toFixed(1).replace(/\.0$/u, "") : String(Math.floor(quotient));
    return `${sign}${text}${suffix}`;
  };
  if (n < 1000)
    return `${sign}${Math.round(n)}`;
  if (n < 1e6)
    return scaled(1000, "K");
  if (n < 1e9)
    return scaled(1e6, "M");
  return scaled(1e9, "B");
}
function mockupHash(text) {
  let hash = 2166136261;
  for (let index = 0;index < text.length; index += 1)
    hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return hash >>> 0;
}
var GRADIENTS = [["#f6a57b", "#c2556b"], ["#7fb3ff", "#4c5fd7"], ["#8fdcb4", "#2f8f7a"], ["#f7d774", "#e0823d"], ["#c9a2ff", "#7653c8"], ["#ff9fb8", "#c24a86"], ["#9ad8e8", "#3a7fa3"], ["#d6c2a8", "#8a6a4b"]];
function gradientFor(seed, shift = 0) {
  return GRADIENTS[(mockupHash(seed) >>> shift) % GRADIENTS.length] ?? GRADIENTS[0];
}
function mockupInitials(name) {
  const isNameCharacter = (character) => character.toLowerCase() !== character.toUpperCase() || /[0-9]/u.test(character) || (character.codePointAt(0) ?? 0) >= 12288;
  return name.split(/\s+/u).map((word) => Array.from(word).find(isNameCharacter) ?? "").filter(Boolean).slice(0, 2).map((initial) => initial.toUpperCase()).join("");
}
function Avatar({
  name,
  size = 40,
  square = false
}) {
  const [from, to] = gradientFor(name);
  const style = {
    background: `linear-gradient(135deg, ${from}, ${to})`,
    borderRadius: square ? Math.round(size * 0.22) : "50%",
    fontSize: Math.round(size * 0.38),
    height: size,
    width: size
  };
  return /* @__PURE__ */ jsx("span", {
    "aria-hidden": "true",
    className: "hkm-avatar",
    style,
    children: mockupInitials(name)
  });
}
function PlaceholderPhoto({
  className,
  ratio = "16 / 9",
  seed
}) {
  const [a, b] = gradientFor(seed);
  const [c] = gradientFor(seed, 3);
  return /* @__PURE__ */ jsx("span", {
    "aria-hidden": "true",
    className: joinMockupClasses("hkm-photo", className),
    style: {
      aspectRatio: ratio,
      background: `radial-gradient(120% 90% at 20% 15%, ${a}cc, transparent 60%), radial-gradient(90% 80% at 85% 90%, ${c}bb, transparent 65%), linear-gradient(160deg, ${b}, ${a})`
    }
  });
}
function ScrollFade({
  children,
  className,
  fadeHeight = 56,
  height
}) {
  if (!(height > 0))
    throw new RangeError("ScrollFade needs a positive height.");
  return /* @__PURE__ */ jsx("div", {
    className: joinMockupClasses("hkm-scroll-fade", className),
    style: {
      "--hkm-fade-height": `${fadeHeight}px`,
      "--hkm-scroll-height": `${height}px`
    },
    children
  });
}
function Hotspot({
  label,
  x,
  y
}) {
  for (const [axis, value] of [["x", x], ["y", y]]) {
    if (!Number.isFinite(value) || value < 0 || value > 100)
      throw new RangeError(`Hotspot ${axis} must be a percentage from 0 to 100.`);
  }
  return /* @__PURE__ */ jsxs("span", {
    "aria-hidden": "true",
    className: "hkm-hotspot",
    "data-hkm-side": x > 60 ? "start" : "end",
    style: {
      insetBlockStart: `${y}%`,
      insetInlineStart: `${x}%`
    },
    children: [
      /* @__PURE__ */ jsx("span", {
        className: "hkm-hotspot-ring"
      }),
      label === undefined || label === "" ? null : /* @__PURE__ */ jsx("span", {
        className: "hkm-hotspot-label",
        children: label
      })
    ]
  });
}
var GLYPHS = {
  archive: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("rect", {
        height: "4",
        rx: "1",
        width: "17",
        x: "3.5",
        y: "4.5"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5M10 12.5h4"
      })
    ]
  }),
  back: /* @__PURE__ */ jsx("path", {
    d: "m14.5 6-6 6 6 6"
  }),
  bell: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("path", {
        d: "M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M10 20.5a2.2 2.2 0 0 0 4 0"
      })
    ]
  }),
  bookmark: /* @__PURE__ */ jsx("path", {
    d: "M6.5 4h11v16.5L12 16.5l-5.5 4z"
  }),
  chart: /* @__PURE__ */ jsx("path", {
    d: "M5 20V12M10 20V6M15 20v-9M20 20V9"
  }),
  check: /* @__PURE__ */ jsx("path", {
    d: "m6.5 12.5 3.5 3.5 7.5-8"
  }),
  clock: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("circle", {
        cx: "12",
        cy: "12",
        r: "8"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M12 7.5V12l3 2"
      })
    ]
  }),
  comment: /* @__PURE__ */ jsx("path", {
    d: "M4.5 5.5h15v10h-9l-4.5 4v-4h-1.5z"
  }),
  file: /* @__PURE__ */ jsx("path", {
    d: "M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4"
  }),
  forward: /* @__PURE__ */ jsx("path", {
    d: "m9.5 6 6 6-6 6"
  }),
  grid: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("rect", {
        height: "6",
        rx: "1.2",
        width: "6",
        x: "4",
        y: "4"
      }),
      /* @__PURE__ */ jsx("rect", {
        height: "6",
        rx: "1.2",
        width: "6",
        x: "14",
        y: "4"
      }),
      /* @__PURE__ */ jsx("rect", {
        height: "6",
        rx: "1.2",
        width: "6",
        x: "4",
        y: "14"
      }),
      /* @__PURE__ */ jsx("rect", {
        height: "6",
        rx: "1.2",
        width: "6",
        x: "14",
        y: "14"
      })
    ]
  }),
  heart: /* @__PURE__ */ jsx("path", {
    d: "M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"
  }),
  home: /* @__PURE__ */ jsx("path", {
    d: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"
  }),
  inbox: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("path", {
        d: "M4 13.5 6.5 5h11l2.5 8.5V19H4z"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M4 13.5h4.5l1 2h5l1-2H20"
      })
    ]
  }),
  lock: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("rect", {
        height: "9",
        rx: "1.5",
        width: "12",
        x: "6",
        y: "10.5"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"
      })
    ]
  }),
  mail: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("rect", {
        height: "14",
        rx: "2",
        width: "18",
        x: "3",
        y: "5"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "m3.5 6.5 8.5 6.5 8.5-6.5"
      })
    ]
  }),
  menu: /* @__PURE__ */ jsx("path", {
    d: "M4 7h16M4 12h16M4 17h16"
  }),
  more: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("circle", {
        cx: "5.5",
        cy: "12",
        fill: "currentColor",
        r: "1.4",
        stroke: "none"
      }),
      /* @__PURE__ */ jsx("circle", {
        cx: "12",
        cy: "12",
        fill: "currentColor",
        r: "1.4",
        stroke: "none"
      }),
      /* @__PURE__ */ jsx("circle", {
        cx: "18.5",
        cy: "12",
        fill: "currentColor",
        r: "1.4",
        stroke: "none"
      })
    ]
  }),
  pencil: /* @__PURE__ */ jsx("path", {
    d: "M4.5 19.5 5.5 15 15.5 5a2 2 0 0 1 3 3l-10 10zM13.5 7l3 3"
  }),
  people: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("circle", {
        cx: "9",
        cy: "9",
        r: "3.2"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M3.5 19c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5"
      }),
      /* @__PURE__ */ jsx("circle", {
        cx: "16.5",
        cy: "8.5",
        r: "2.6"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M16 13.6c2.3.1 4 1.6 4.6 4.4"
      })
    ]
  }),
  plus: /* @__PURE__ */ jsx("path", {
    d: "M12 5v14M5 12h14"
  }),
  reload: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("path", {
        d: "M19 12a7 7 0 1 1-2.1-5"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M17.5 3.5V7.5h-4"
      })
    ]
  }),
  reply: /* @__PURE__ */ jsx("path", {
    d: "M12 19.5c4.7 0 8.5-3.2 8.5-7.3S16.7 5 12 5 3.5 8.1 3.5 12.2c0 1.8.7 3.4 2 4.7L5 20.5l3.6-1.6c1 .4 2.2.6 3.4.6z"
  }),
  repost: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("path", {
        d: "M7 5 4 8l3 3"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M4 8h11a4 4 0 0 1 4 4v1"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "m17 19 3-3-3-3"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M20 16H9a4 4 0 0 1-4-4v-1"
      })
    ]
  }),
  search: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("circle", {
        cx: "11",
        cy: "11",
        r: "6.5"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "m16 16 4.5 4.5"
      })
    ]
  }),
  send: /* @__PURE__ */ jsx("path", {
    d: "m20.5 3.5-17 7 7 2.5 2.5 7zM10.5 13l10-9.5"
  }),
  share: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("path", {
        d: "M12 15V4"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "m7.5 8.5 4.5-4.5 4.5 4.5"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"
      })
    ]
  }),
  sidebar: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("rect", {
        height: "15",
        rx: "2.5",
        width: "18",
        x: "3",
        y: "4.5"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M9 4.5v15"
      })
    ]
  }),
  sparkle: /* @__PURE__ */ jsx("path", {
    d: "M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2z"
  }),
  star: /* @__PURE__ */ jsx("path", {
    d: "m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"
  }),
  terminal: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("rect", {
        height: "15",
        rx: "2.5",
        width: "18",
        x: "3",
        y: "4.5"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "m7 9.5 3 2.5-3 2.5M12 15h5"
      })
    ]
  }),
  thumb: /* @__PURE__ */ jsx("path", {
    d: "M7.5 10.5v9h-3v-9zM7.5 10.5l3.5-6.5c1.4 0 2.3 1 2 2.4l-.6 3.1h5.1c1.2 0 2 1 1.8 2.2l-1.2 6.2c-.2 1-1 1.6-2 1.6H7.5"
  }),
  trash: /* @__PURE__ */ jsx("path", {
    d: "M5 7h14M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"
  }),
  user: /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx("circle", {
        cx: "12",
        cy: "8.5",
        r: "3.8"
      }),
      /* @__PURE__ */ jsx("path", {
        d: "M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"
      })
    ]
  })
};
var mockupGlyphNames = Object.freeze(Object.keys(GLYPHS));
function MockupGlyph({
  className,
  filled = false,
  name,
  size = 20
}) {
  return /* @__PURE__ */ jsx("svg", {
    "aria-hidden": "true",
    className: joinMockupClasses("hkm-glyph", className),
    fill: filled ? "currentColor" : "none",
    focusable: "false",
    height: size,
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.75,
    viewBox: "0 0 24 24",
    width: size,
    children: GLYPHS[name]
  });
}
function WindowLights() {
  return /* @__PURE__ */ jsxs("span", {
    "aria-hidden": "true",
    className: "hkm-lights",
    children: [
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {})
    ]
  });
}

export { joinMockupClasses, assertMockupDescription, MockupRoot, SampleText, SampleParagraphs, compact, mockupHash, mockupInitials, Avatar, PlaceholderPhoto, ScrollFade, Hotspot, mockupGlyphNames, MockupGlyph, WindowLights };
