// src/react/charts.tsx
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { cn } from "@hraness/ui";

// src/react/charts.stylex.ts
var chartStyles = {
  bar: {
    kawU7v: "x1cfjbvc",
    k5BUTg: "x1a4igh8",
    kqOd84: "xsdpl10",
    kzPi7L: "x1sz4vi2",
    kEz803: "x4aylkk",
    kKxzle: "x1uzojwf",
    kILWW9: "x1s0aqod",
    k44tkh: "x1fi45qw",
    kWV6AL: "x1u6ievf",
    ko0y90: "x1v7wizp",
    kKVMdj: "x1no39iu x1aquc0h",
    k5bvn2: "xoj058f",
    kyAemX: "xb8h89d",
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "xjbqb8w x9yvj25",
    kKwaWg: "x1mfw0er xhobzj1",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    k4V0xq: "x14bdpvh",
    krFJ6x: "x11m3xgt",
    kP1A0P: "x7kxraq",
    kpvK8V: "x108usdd",
    kmc9e2: "x3n6nq7",
    kT8eP4: "x2dkq5d",
    kffDkL: "x1x0u81l",
    kgBrHk: "xf1j0q2",
    k7sjHc: "xmzn1mo",
    kEreRy: "xjslfuv",
    krzo0S: "x1gbqego",
    kYh6hf: "xjg5lhu",
    kaIpWk: "x1pjcqnp",
    krVfgx: "x1ey2m1c",
    kGVxlE: "x4ytacr",
    kAXs8y: "xr5dkdi",
    kbCHJM: "xu96u03",
    kVAEAm: "x10l6tqk",
    kCIrl2: "xwukr4l",
    k87sOh: "x13vifvy",
    k3nNDw: "x1nf803f",
    kzqmXN: "x1i0xg0u",
    $$css: true
  },
  detail: {
    kMwMTN: "x17j02y5",
    kMv6JI: "xpw0y0u",
    kGuDYH: "x1k6wstc",
    kcqcaj: "xss6m8b",
    $$css: true
  },
  heading: {
    kGNEyG: "x1pha0wt",
    k1xSpc: "x78zum5",
    kOIVth: "x96y02u",
    kjj79g: "x1qughib",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  indicator: {
    kaIpWk: "x18j2vf1",
    k1xSpc: "x1rg5ohu",
    kCS8Yb: "xdl72j9",
    kzQI83: "x1c4vz4f",
    kmuXW: "x2lah0s",
    kZKoxP: "xqu0tyb",
    kzqmXN: "xsmyaan",
    $$css: true
  },
  label: {
    kGuDYH: "xaasd0c",
    k63SB2: "x1e4wzip",
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    khDVqt: "xuxw1ft",
    $$css: true
  },
  legend: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kwnvtZ: "x1a02dak",
    kOIVth: "x111l7ma",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  legendRow: {
    kGNEyG: "x6s0dn4",
    kaIpWk: "x18j2vf1",
    k1xSpc: "x3nfvp2",
    kCS8Yb: "xdl72j9",
    kzQI83: "x1c4vz4f",
    kmuXW: "xs83m0k",
    kGuDYH: "x1j6dyjg",
    kOIVth: "xmgkybt",
    kAzted: "x1ig0bsw",
    kzqmXN: "x14atkfc",
    kLKAdn: "x15koebe",
    kpe85a: "x1gecdg7",
    kGO01o: "xw080dc",
    kE3dHu: "x6enc3n",
    $$css: true
  },
  median: {
    kawU7v: "x18sabzy",
    k5BUTg: "x1jleocg",
    kqOd84: "x1pjjote",
    kzPi7L: "x1e53mt7",
    kEz803: "xgkqhyc",
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "x1hnzg9s x9yvj25",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    k4V0xq: "xynn2ba x14bdpvh",
    krFJ6x: "xn5uptl",
    kP1A0P: "xhjnd2s x7kxraq",
    kpvK8V: "x13lo9x4 x108usdd",
    kmc9e2: "x3so8kt",
    kT8eP4: "x1csoyw0 x2dkq5d",
    kffDkL: "xg5eh3q x1x0u81l",
    kgBrHk: "x18b5jzi",
    k7sjHc: "x1alpsbp xmzn1mo",
    kEreRy: "x1jc7w92 xjslfuv",
    krzo0S: "x1t7ytsu",
    kYh6hf: "xyumdvf xjg5lhu",
    kaIpWk: "x16rqkct",
    kGVxlE: "x18sgsy5",
    kAXs8y: "xr5dkdi",
    kZKoxP: "x170jfvy",
    kbCHJM: "x1czmu4s",
    kVAEAm: "x10l6tqk",
    k87sOh: "xwa60dl",
    k3aq6I: "x11lhmoz",
    kzqmXN: "x1fsd2vl",
    $$css: true
  },
  plot: {
    kZKoxP: "x1ycyw8g",
    kzqmXN: "xh8yej3",
    kAzted: "xjjci79",
    $$css: true
  },
  range: {
    kawU7v: "x1cfjbvc",
    k5BUTg: "x1a4igh8",
    kqOd84: "xsdpl10",
    kzPi7L: "x1sz4vi2",
    kEz803: "x4aylkk",
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "x1hnzg9s x9yvj25",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    k4V0xq: "x14bdpvh",
    krFJ6x: "x11m3xgt",
    kP1A0P: "x7kxraq",
    kpvK8V: "x108usdd",
    kmc9e2: "x3n6nq7",
    kT8eP4: "x2dkq5d",
    kffDkL: "x1x0u81l",
    kgBrHk: "xf1j0q2",
    k7sjHc: "xmzn1mo",
    kEreRy: "xjslfuv",
    krzo0S: "x1gbqego",
    kYh6hf: "xjg5lhu",
    kaIpWk: "x18j2vf1",
    kAXs8y: "xr5dkdi",
    kZKoxP: "x1ycjhwn",
    kbCHJM: "x7sgyhr",
    kSiTet: "xmu36h7",
    kVAEAm: "x10l6tqk",
    k87sOh: "xwa60dl",
    k3aq6I: "x1cb1t30",
    kzqmXN: "x11r28uo",
    $$css: true
  },
  rangeTrack: {
    kZKoxP: "x36qwtl",
    kqGvvJ: "x15j7jsh",
    kVQacm: "x1rea2x4",
    $$css: true
  },
  root: {
    kMwMTN: "x11jfisy",
    kMv6JI: "x1d3so1v",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  row: {
    kMwMTN: "x1heor9g",
    k1xSpc: "xrvj5dj",
    kMv6JI: "xjb2p0i",
    kV0H8L: "x10rt0pk",
    krGR0G: "xvmqkbn",
    kqBzK6: "x1rcybi7",
    kHiXq7: "x61gc8y",
    kC21eY: "xd4aj15",
    ka26j: "xkyhvkk",
    kGuDYH: "x1qlqyl8",
    kQqvRs: "x1xh6y1q",
    kKX8nH: "x1t35e8",
    kjAs5C: "x1aazh3f",
    k63SB2: "x1pd3egz",
    kOIVth: "xm15xud",
    kLWn49: "x15bjb6t",
    k7Eaqz: "xeuugli",
    kLKAdn: "x1mg8snn",
    kpe85a: "x1gecdg7",
    kGO01o: "x19a4mjr",
    kE3dHu: "x6enc3n",
    k9WMMc: "x1yc453h",
    $$css: true
  },
  rows: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xmgkybt",
    $$css: true
  },
  selectableRow: {
    kawU7v: "x18sabzy",
    k5BUTg: "x1jleocg",
    kqOd84: "x1pjjote",
    kzPi7L: "x1e53mt7",
    kEz803: "xgkqhyc",
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "xjbqb8w x133yyvb",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    k4V0xq: "xi11yse",
    krFJ6x: "x198t27z",
    kP1A0P: "x1fvpbjb",
    kpvK8V: "x1rfstpp",
    kmc9e2: "x8et30q",
    kT8eP4: "xnh6zc7",
    kffDkL: "x1273586",
    kgBrHk: "x18oe1m7",
    k7sjHc: "x10w94by",
    kEreRy: "x1mi4oqr",
    krzo0S: "xstzfhl",
    kYh6hf: "x14e42zd",
    kaIpWk: "xhe58dl",
    kkrTdU: "x1ypdohk",
    kAzted: "x1pjshk2",
    kjBf7l: "x5q2f2h",
    kInvED: "x13iak60",
    k3XXqK: "x9v5kkp",
    kMeerF: "x784prv",
    kIr0Dl: "x1ahifba",
    kIyJzY: "xcgntbv",
    k1ekBW: "x15406qy",
    kAMwcw: "x1iashqr",
    kzqmXN: "xh8yej3",
    $$css: true
  },
  selectedRow: {
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "x8fiqwk",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    $$css: true
  },
  tooltip: {
    kawU7v: "x18sabzy",
    k5BUTg: "x1jleocg",
    kqOd84: "x1pjjote",
    kzPi7L: "x1e53mt7",
    kEz803: "xgkqhyc",
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "x1cmuqeg",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    k4V0xq: "xtsjrx0",
    krFJ6x: "xn5uptl",
    kP1A0P: "x1ae7zus",
    kpvK8V: "xjttvrd",
    kmc9e2: "x3so8kt",
    kT8eP4: "x1b1eqt9",
    kffDkL: "x1j8yxcv",
    kgBrHk: "x18b5jzi",
    k7sjHc: "x1lun4ml",
    kEreRy: "xmmcp6y",
    krzo0S: "x1t7ytsu",
    kYh6hf: "xpilrb4",
    kaIpWk: "xjb54qr",
    kGVxlE: "x13akli3",
    kMwMTN: "x1gjcqpb",
    kGuDYH: "xaasd0c",
    k7Eaqz: "xhb15b9",
    kF3gjK: "x1dk652i",
    kJVvJu: "x27hgv3",
    $$css: true
  },
  tooltipItem: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "xrvj5dj",
    kOIVth: "xzci21y",
    kumcoG: "xju1xpo",
    $$css: true
  },
  tooltipList: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xm15xud",
    kCbEA6: "x10im51j",
    kYk0Dm: "xrxpjvj",
    $$css: true
  },
  tooltipTerm: {
    kGNEyG: "x6s0dn4",
    kMwMTN: "x17j02y5",
    k1xSpc: "x3nfvp2",
    kOIVth: "xmgkybt",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  tooltipTitle: {
    k1xSpc: "x1lliihq",
    k63SB2: "x1e4wzip",
    k1K539: "xcftyxh",
    $$css: true
  },
  tooltipValue: {
    kMv6JI: "xpw0y0u",
    kcqcaj: "xss6m8b",
    kCbEA6: "x10im51j",
    kYk0Dm: "xrxpjvj",
    $$css: true
  },
  track: {
    kawU7v: "x1cfjbvc",
    k5BUTg: "x1a4igh8",
    kqOd84: "xsdpl10",
    kzPi7L: "x1sz4vi2",
    kEz803: "x4aylkk",
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "x1uh4jhl x9yvj25",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    k4V0xq: "x14bdpvh",
    krFJ6x: "x11m3xgt",
    kP1A0P: "x7kxraq",
    kpvK8V: "x108usdd",
    kmc9e2: "x3n6nq7",
    kT8eP4: "x2dkq5d",
    kffDkL: "x1x0u81l",
    kgBrHk: "xf1j0q2",
    k7sjHc: "xmzn1mo",
    kEreRy: "xjslfuv",
    krzo0S: "x1gbqego",
    kYh6hf: "xjg5lhu",
    kaIpWk: "x18j2vf1",
    k1xSpc: "x1lliihq",
    kAXs8y: "xr5dkdi",
    kZKoxP: "xdk7pt",
    kVQacm: "xb3r6kr",
    kVAEAm: "x1n2onr6",
    kzqmXN: "xh8yej3",
    $$css: true
  },
  value: {
    kCS8Yb: "xdl72j9",
    kzQI83: "x1c4vz4f",
    kmuXW: "x2lah0s",
    kMv6JI: "xpw0y0u",
    kGuDYH: "xaasd0c",
    kcqcaj: "xss6m8b",
    $$css: true
  }
};

// src/react/charts.tsx
import { jsx, jsxs } from "react/jsx-runtime";
import { createElement } from "react";
function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}
function normalizedPercent(value, minimum, maximum) {
  const span = maximum - minimum;
  if (!Number.isFinite(span) || span <= 0)
    return 0;
  const bounded = Math.max(0, Math.min(100, (finiteOr(value, minimum) - minimum) / span * 100));
  return Math.round(bounded * 1e4) / 1e4;
}
function accessibleChartCaption({
  ariaLabel
}) {
  if (ariaLabel.trim() === "")
    throw new TypeError("Charts require a nonblank accessible label.");
  return /* @__PURE__ */ jsx("figcaption", {
    className: "hraness-design-visually-hidden",
    children: ariaLabel
  });
}
function ChartRow({
  children,
  id,
  isSelected,
  onSelectionChange,
  variant = "default"
}) {
  const presentation = stylex.props(chartStyles.row, onSelectionChange !== undefined && chartStyles.selectableRow, isSelected && chartStyles.selectedRow, variant === "legend" && chartStyles.legendRow);
  if (onSelectionChange === undefined) {
    return /* @__PURE__ */ jsx("div", {
      ...presentation,
      className: cn("hraness-design-chart-row", presentation.className),
      "data-selected": isSelected || undefined,
      children
    });
  }
  return /* @__PURE__ */ jsx("button", {
    ...presentation,
    "aria-pressed": isSelected,
    className: cn("hraness-design-chart-row", "hraness-design-chart-row--selectable", presentation.className),
    "data-selected": isSelected || undefined,
    onClick: () => onSelectionChange(id),
    type: "button",
    children
  });
}
function BarListChart({
  "aria-label": ariaLabel,
  className,
  data,
  domain = [0, Math.max(1, ...data.map(({
    value
  }) => finiteOr(value, 0)))],
  formatValue = (value) => String(value),
  onSelectionChange,
  selectedId = null
}) {
  const [minimum, maximum] = domain;
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum >= maximum) {
    throw new RangeError("Bar chart domain must be finite and ascending.");
  }
  const rootPresentation = stylex.props(chartStyles.root);
  const rowsPresentation = stylex.props(chartStyles.rows);
  const headingPresentation = stylex.props(chartStyles.heading);
  const labelPresentation = stylex.props(chartStyles.label);
  const valuePresentation = stylex.props(chartStyles.value);
  const detailPresentation = stylex.props(chartStyles.detail);
  const trackPresentation = stylex.props(chartStyles.track);
  const barPresentation = stylex.props(chartStyles.bar);
  return /* @__PURE__ */ jsxs("figure", {
    ...rootPresentation,
    className: cn("hraness-design-bar-list-chart", rootPresentation.className, className),
    children: [
      accessibleChartCaption({
        ariaLabel
      }),
      /* @__PURE__ */ jsx("div", {
        ...rowsPresentation,
        className: cn("hraness-design-bar-list-chart__rows", rowsPresentation.className),
        children: data.map((datum) => {
          const value = finiteOr(datum.value, minimum);
          const width = normalizedPercent(value, minimum, maximum);
          const style = {
            "--hraness-design-chart-color": datum.color ?? "var(--info)",
            "--hraness-design-chart-value": `${String(width)}%`
          };
          return /* @__PURE__ */ jsxs(ChartRow, {
            id: datum.id,
            isSelected: selectedId === datum.id,
            onSelectionChange,
            children: [
              /* @__PURE__ */ jsxs("span", {
                ...headingPresentation,
                className: cn("hraness-design-chart-row__heading", headingPresentation.className),
                children: [
                  /* @__PURE__ */ jsx("span", {
                    ...labelPresentation,
                    className: cn("hraness-design-chart-row__label", labelPresentation.className),
                    children: datum.label
                  }),
                  /* @__PURE__ */ jsx("span", {
                    ...valuePresentation,
                    className: cn("hraness-design-chart-row__value", valuePresentation.className),
                    children: formatValue(value)
                  })
                ]
              }),
              /* @__PURE__ */ jsx("span", {
                ...trackPresentation,
                "aria-hidden": "true",
                className: cn("hraness-design-bar-list-chart__track", trackPresentation.className),
                style,
                children: /* @__PURE__ */ jsx("span", {
                  ...barPresentation,
                  className: cn("hraness-design-bar-list-chart__bar", barPresentation.className)
                })
              }),
              datum.detail === undefined ? null : /* @__PURE__ */ jsx("span", {
                ...detailPresentation,
                className: cn("hraness-design-chart-row__detail", detailPresentation.className),
                children: datum.detail
              })
            ]
          }, datum.id);
        })
      })
    ]
  });
}
function RadarProfileTooltip({
  active,
  label,
  payload,
  series
}) {
  if (active !== true || payload === undefined || payload.length === 0)
    return null;
  const labels = new Map(series.map((item) => [item.id, item.label]));
  const tooltipPresentation = stylex.props(chartStyles.tooltip);
  const titlePresentation = stylex.props(chartStyles.tooltipTitle);
  const listPresentation = stylex.props(chartStyles.tooltipList);
  const itemPresentation = stylex.props(chartStyles.tooltipItem);
  const termPresentation = stylex.props(chartStyles.tooltipTerm);
  const indicatorPresentation = stylex.props(chartStyles.indicator);
  const valuePresentation = stylex.props(chartStyles.tooltipValue);
  return /* @__PURE__ */ jsxs("div", {
    ...tooltipPresentation,
    className: cn("hraness-design-chart-tooltip", tooltipPresentation.className),
    children: [
      /* @__PURE__ */ jsx("strong", {
        ...titlePresentation,
        className: titlePresentation.className,
        children: typeof label === "string" ? label : "Benchmark"
      }),
      /* @__PURE__ */ jsx("dl", {
        ...listPresentation,
        className: listPresentation.className,
        children: payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const value = typeof item.value === "number" && Number.isFinite(item.value) ? item.value.toFixed(1) : "–";
          return /* @__PURE__ */ createElement("div", {
            ...itemPresentation,
            className: itemPresentation.className,
            key
          }, /* @__PURE__ */ jsxs("dt", {
            ...termPresentation,
            className: termPresentation.className,
            children: [
              /* @__PURE__ */ jsx("i", {
                ...indicatorPresentation,
                "aria-hidden": "true",
                className: indicatorPresentation.className,
                style: {
                  backgroundColor: item.color
                }
              }),
              labels.get(key) ?? key
            ]
          }), /* @__PURE__ */ jsx("dd", {
            ...valuePresentation,
            className: valuePresentation.className,
            children: value
          }));
        })
      })
    ]
  });
}
function RadarProfileChart({
  "aria-label": ariaLabel,
  axes,
  className,
  onSelectionChange,
  selectedId = null,
  series
}) {
  const gradientPrefix = useId().replaceAll(":", "");
  const effectiveSelectedId = series.some(({
    id
  }) => id === selectedId) ? selectedId : null;
  const data = axes.map((axis) => {
    const row = {
      axis: axis.label
    };
    for (const item of series)
      row[item.id] = finiteOr(item.values[axis.id] ?? 0, 0);
    return row;
  });
  const rootPresentation = stylex.props(chartStyles.root);
  const plotPresentation = stylex.props(chartStyles.plot);
  const legendPresentation = stylex.props(chartStyles.legend);
  const indicatorPresentation = stylex.props(chartStyles.indicator);
  return /* @__PURE__ */ jsxs("figure", {
    ...rootPresentation,
    className: cn("hraness-design-radar-profile-chart", rootPresentation.className, className),
    children: [
      accessibleChartCaption({
        ariaLabel
      }),
      /* @__PURE__ */ jsx("div", {
        ...plotPresentation,
        "aria-hidden": "true",
        className: cn("hraness-design-radar-profile-chart__plot", plotPresentation.className),
        children: /* @__PURE__ */ jsx(ResponsiveContainer, {
          height: "100%",
          initialDimension: {
            height: 280,
            width: 360
          },
          width: "100%",
          children: /* @__PURE__ */ jsxs(RadarChart, {
            data,
            margin: {
              bottom: 22,
              left: 28,
              right: 28,
              top: 22
            },
            children: [
              /* @__PURE__ */ jsx(PolarGrid, {
                gridType: "polygon",
                stroke: "var(--grid)",
                strokeDasharray: "2 5"
              }),
              /* @__PURE__ */ jsx(PolarAngleAxis, {
                dataKey: "axis",
                tick: {
                  fill: "var(--muted)",
                  fontFamily: "var(--font-text)",
                  fontSize: 11
                },
                tickLine: false
              }),
              /* @__PURE__ */ jsx(PolarRadiusAxis, {
                axisLine: false,
                domain: [0, 100],
                tick: false
              }),
              /* @__PURE__ */ jsx(RechartsTooltip, {
                content: /* @__PURE__ */ jsx(RadarProfileTooltip, {
                  series
                }),
                cursor: false,
                isAnimationActive: false
              }),
              /* @__PURE__ */ jsx("defs", {
                children: series.map((item, index) => {
                  const gradientId = `${gradientPrefix}-${String(index)}`;
                  return /* @__PURE__ */ jsxs("radialGradient", {
                    id: gradientId,
                    children: [
                      /* @__PURE__ */ jsx("stop", {
                        offset: "0%",
                        stopColor: item.color,
                        stopOpacity: "0.06"
                      }),
                      /* @__PURE__ */ jsx("stop", {
                        offset: "100%",
                        stopColor: item.color,
                        stopOpacity: "0.72"
                      })
                    ]
                  }, item.id);
                })
              }),
              series.map((item, index) => {
                const gradientId = `${gradientPrefix}-${String(index)}`;
                const dimmed = effectiveSelectedId !== null && effectiveSelectedId !== item.id;
                return /* @__PURE__ */ jsx(Radar, {
                  dataKey: item.id,
                  fill: `url(#${gradientId})`,
                  fillOpacity: dimmed ? 0.05 : 0.17,
                  isAnimationActive: false,
                  name: item.label,
                  stroke: item.color,
                  strokeOpacity: dimmed ? 0.2 : 0.88,
                  strokeWidth: dimmed ? 1 : 1.75
                }, item.id);
              })
            ]
          })
        })
      }),
      /* @__PURE__ */ jsx("div", {
        ...legendPresentation,
        "aria-label": "Profiles",
        className: cn("hraness-design-radar-profile-chart__legend", legendPresentation.className),
        role: "group",
        children: series.map((item) => /* @__PURE__ */ jsxs(ChartRow, {
          id: item.id,
          isSelected: selectedId === item.id,
          onSelectionChange,
          variant: "legend",
          children: [
            /* @__PURE__ */ jsx("i", {
              ...indicatorPresentation,
              "aria-hidden": "true",
              className: indicatorPresentation.className,
              style: {
                backgroundColor: item.color
              }
            }),
            /* @__PURE__ */ jsx("span", {
              children: item.label
            })
          ]
        }, item.id))
      }),
      /* @__PURE__ */ jsxs("table", {
        className: "hraness-design-visually-hidden",
        children: [
          /* @__PURE__ */ jsx("caption", {
            children: ariaLabel
          }),
          /* @__PURE__ */ jsx("thead", {
            children: /* @__PURE__ */ jsxs("tr", {
              children: [
                /* @__PURE__ */ jsx("th", {
                  scope: "col",
                  children: "Benchmark"
                }),
                series.map((item) => /* @__PURE__ */ jsx("th", {
                  scope: "col",
                  children: item.label
                }, item.id))
              ]
            })
          }),
          /* @__PURE__ */ jsx("tbody", {
            children: axes.map((axis) => /* @__PURE__ */ jsxs("tr", {
              children: [
                /* @__PURE__ */ jsx("th", {
                  scope: "row",
                  children: axis.label
                }),
                series.map((item) => /* @__PURE__ */ jsx("td", {
                  children: finiteOr(item.values[axis.id] ?? 0, 0).toFixed(1)
                }, item.id))
              ]
            }, axis.id))
          })
        ]
      })
    ]
  });
}
function RangePlotChart({
  "aria-label": ariaLabel,
  className,
  data,
  domain = [0, 100],
  formatValue = (value) => String(value),
  onSelectionChange,
  selectedId = null
}) {
  const [domainMinimum, domainMaximum] = domain;
  if (!Number.isFinite(domainMinimum) || !Number.isFinite(domainMaximum) || domainMinimum >= domainMaximum) {
    throw new RangeError("Range plot domain must be finite and ascending.");
  }
  const rootPresentation = stylex.props(chartStyles.root);
  const rowsPresentation = stylex.props(chartStyles.rows);
  const headingPresentation = stylex.props(chartStyles.heading);
  const labelPresentation = stylex.props(chartStyles.label);
  const valuePresentation = stylex.props(chartStyles.value);
  const detailPresentation = stylex.props(chartStyles.detail);
  const trackPresentation = stylex.props(chartStyles.track, chartStyles.rangeTrack);
  const rangePresentation = stylex.props(chartStyles.range);
  const medianPresentation = stylex.props(chartStyles.median);
  return /* @__PURE__ */ jsxs("figure", {
    ...rootPresentation,
    className: cn("hraness-design-range-plot-chart", rootPresentation.className, className),
    children: [
      accessibleChartCaption({
        ariaLabel
      }),
      /* @__PURE__ */ jsx("div", {
        ...rowsPresentation,
        className: cn("hraness-design-range-plot-chart__rows", rowsPresentation.className),
        children: data.map((datum) => {
          const minimum = finiteOr(datum.minimum, domainMinimum);
          const maximum = finiteOr(datum.maximum, domainMaximum);
          const median = finiteOr(datum.median, minimum);
          const left = normalizedPercent(Math.min(minimum, maximum), domainMinimum, domainMaximum);
          const right = normalizedPercent(Math.max(minimum, maximum), domainMinimum, domainMaximum);
          const middle = normalizedPercent(median, domainMinimum, domainMaximum);
          const style = {
            "--hraness-design-chart-color": datum.color ?? "var(--info)",
            "--hraness-design-chart-range-left": `${String(left)}%`,
            "--hraness-design-chart-range-width": `${String(Math.max(0, right - left))}%`,
            "--hraness-design-chart-median": `${String(middle)}%`
          };
          return /* @__PURE__ */ jsxs(ChartRow, {
            id: datum.id,
            isSelected: selectedId === datum.id,
            onSelectionChange,
            children: [
              /* @__PURE__ */ jsxs("span", {
                ...headingPresentation,
                className: cn("hraness-design-chart-row__heading", headingPresentation.className),
                children: [
                  /* @__PURE__ */ jsx("span", {
                    ...labelPresentation,
                    className: cn("hraness-design-chart-row__label", labelPresentation.className),
                    children: datum.label
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    ...valuePresentation,
                    className: cn("hraness-design-chart-row__value", valuePresentation.className),
                    children: [
                      formatValue(minimum),
                      "–",
                      formatValue(maximum)
                    ]
                  })
                ]
              }),
              /* @__PURE__ */ jsxs("span", {
                ...trackPresentation,
                "aria-hidden": "true",
                className: cn("hraness-design-range-plot-chart__track", trackPresentation.className),
                style,
                children: [
                  /* @__PURE__ */ jsx("span", {
                    ...rangePresentation,
                    className: cn("hraness-design-range-plot-chart__range", rangePresentation.className)
                  }),
                  /* @__PURE__ */ jsx("span", {
                    ...medianPresentation,
                    className: cn("hraness-design-range-plot-chart__median", medianPresentation.className)
                  })
                ]
              }),
              datum.detail === undefined ? null : /* @__PURE__ */ jsx("span", {
                ...detailPresentation,
                className: cn("hraness-design-chart-row__detail", detailPresentation.className),
                children: datum.detail
              })
            ]
          }, datum.id);
        })
      })
    ]
  });
}

export { BarListChart, RadarProfileChart, RangePlotChart };
