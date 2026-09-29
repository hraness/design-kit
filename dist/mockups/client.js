"use client";
import {
  joinMockupClasses
} from "../chunk-evb02bc1.js";
import"../chunk-5gtx3pza.js";

// src/mockups/client.tsx
import { useId, useLayoutEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var useIsomorphicLayoutEffect = typeof document === "undefined" ? () => {
  return;
} : useLayoutEffect;
function assertUniqueIds(items, what) {
  if (items.length === 0)
    throw new RangeError(`${what} needs at least one entry.`);
  const seen = new Set;
  for (const item of items) {
    if (typeof item.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/u.test(item.id)) {
      throw new TypeError(`${what} ids must be lowercase letters, digits, and dashes: ${JSON.stringify(item.id)}`);
    }
    if (seen.has(item.id))
      throw new RangeError(`${what} ids must be unique: ${item.id}`);
    seen.add(item.id);
  }
}
function itemAt(items, index, what) {
  const item = items[index];
  if (item === undefined)
    throw new RangeError(`${what} has no entry at ${String(index)}.`);
  return item;
}
function assertCaption(caption, component) {
  if (typeof caption !== "string" || caption.trim() === "") {
    throw new TypeError(`${component} needs a caption that says the picture is an illustration.`);
  }
}
function nextTabIndex(key, index, count) {
  if (key === "ArrowRight" || key === "ArrowDown")
    return (index + 1) % count;
  if (key === "ArrowLeft" || key === "ArrowUp")
    return (index - 1 + count) % count;
  if (key === "Home")
    return 0;
  if (key === "End")
    return count - 1;
  return;
}
function FitToWidth({
  children,
  className,
  minWidth = 400
}) {
  if (!(minWidth > 0))
    throw new RangeError("FitToWidth minWidth must be positive.");
  const outer = useRef(null);
  const inner = useRef(null);
  const [fit, setFit] = useState(null);
  useIsomorphicLayoutEffect(() => {
    const stage = outer.current;
    const content = inner.current;
    if (stage === null || content === null || typeof ResizeObserver === "undefined")
      return;
    const measure = () => {
      const available = stage.clientWidth;
      if (available <= 0)
        return;
      const width = Math.max(available, minWidth);
      const scale = available / width;
      const height = content.offsetHeight * scale;
      setFit((current) => current !== null && current.width === width && current.scale === scale && current.height === height ? current : {
        height,
        scale,
        width
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(content);
    return () => observer.disconnect();
  }, [minWidth]);
  const scaled = fit !== null && fit.scale < 1;
  return /* @__PURE__ */ jsx("div", {
    className: joinMockupClasses("hkm-fit", className),
    ref: outer,
    style: scaled ? {
      height: fit.height
    } : undefined,
    children: /* @__PURE__ */ jsx("div", {
      className: "hkm-fit-inner",
      "data-hkm-scaled": scaled ? "" : undefined,
      ref: inner,
      style: scaled ? {
        transform: `scale(${fit.scale})`,
        width: fit.width
      } : undefined,
      children
    })
  });
}
function ModeShowcase({
  caption,
  className,
  height = 440,
  initial,
  label,
  minWidth = 400,
  modeLabel = "Mode",
  modes,
  optionInactiveModes = [],
  optionLabel = "Option",
  options,
  status,
  surfaces,
  theme
}) {
  assertUniqueIds(surfaces, "ModeShowcase surface");
  assertUniqueIds(modes, "ModeShowcase mode");
  if (options !== undefined)
    assertUniqueIds(options, "ModeShowcase option");
  assertCaption(caption, "ModeShowcase");
  if (!(height > 0))
    throw new RangeError("ModeShowcase height must be positive.");
  const id = useId();
  const firstSurface = surfaces.find((surface2) => surface2.id === initial?.surface) ?? itemAt(surfaces, 0, "ModeShowcase surfaces");
  const firstMode = modes.find((mode2) => mode2.id === initial?.mode) ?? itemAt(modes, 0, "ModeShowcase modes");
  const firstOption = options === undefined ? undefined : options.find((option2) => option2.id === initial?.option) ?? itemAt(options, 0, "ModeShowcase options");
  const [surfaceId, setSurfaceId] = useState(firstSurface.id);
  const [mode, setMode] = useState(firstMode.id);
  const [previousMode, setPreviousMode] = useState(firstMode.id);
  const [option, setOption] = useState(firstOption?.id);
  const [animated, setAnimated] = useState(false);
  const tabs = useRef(new Map);
  const surface = surfaces.find((entry) => entry.id === surfaceId) ?? itemAt(surfaces, 0, "ModeShowcase surfaces");
  const modeChoice = modes.find((entry) => entry.id === mode) ?? itemAt(modes, 0, "ModeShowcase modes");
  const optionChoice = options?.find((entry) => entry.id === option);
  const optionInactive = optionInactiveModes.includes(mode);
  const chooseMode = (next) => {
    if (next === mode)
      return;
    setPreviousMode(mode);
    setMode(next);
    setAnimated(true);
  };
  const chooseOption = (next) => {
    if (next === option)
      return;
    setOption(next);
    setAnimated(true);
  };
  const onTabKey = (event) => {
    const index = surfaces.findIndex((entry) => entry.id === surface.id);
    const next = nextTabIndex(event.key, index, surfaces.length);
    if (next === undefined)
      return;
    event.preventDefault();
    const target = itemAt(surfaces, next, "ModeShowcase surfaces").id;
    setSurfaceId(target);
    tabs.current.get(target)?.focus();
  };
  const statusNode = status?.({
    mode,
    option,
    surface: surface.id
  });
  return /* @__PURE__ */ jsxs("figure", {
    "aria-label": label?.(surface) ?? `Illustration of ${surface.label.toLowerCase()}`,
    className: joinMockupClasses("hkm-showcase", className),
    "data-hkm-theme": theme,
    "data-nosnippet": "",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className: "hkm-showcase-controls",
        children: [
          surfaces.length > 1 ? /* @__PURE__ */ jsx("div", {
            "aria-label": "Surface",
            className: "hkm-tabs",
            role: "tablist",
            children: surfaces.map((entry) => /* @__PURE__ */ jsx("button", {
              "aria-controls": `${id}-panel`,
              "aria-selected": entry.id === surface.id,
              className: "hkm-tab",
              id: `${id}-tab-${entry.id}`,
              onClick: () => setSurfaceId(entry.id),
              onKeyDown: onTabKey,
              ref: (element) => {
                if (element === null)
                  tabs.current.delete(entry.id);
                else
                  tabs.current.set(entry.id, element);
              },
              role: "tab",
              tabIndex: entry.id === surface.id ? 0 : -1,
              type: "button",
              children: entry.label
            }, entry.id))
          }) : null,
          /* @__PURE__ */ jsxs("div", {
            className: "hkm-showcase-settings",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className: "hkm-showcase-row",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "hkm-showcase-label",
                    id: `${id}-mode`,
                    children: modeLabel
                  }),
                  /* @__PURE__ */ jsx("div", {
                    "aria-labelledby": `${id}-mode`,
                    className: "hkm-segmented",
                    role: "group",
                    children: modes.map((entry) => /* @__PURE__ */ jsx("button", {
                      "aria-pressed": entry.id === mode,
                      onClick: () => chooseMode(entry.id),
                      type: "button",
                      children: entry.label
                    }, entry.id))
                  })
                ]
              }),
              options === undefined ? null : /* @__PURE__ */ jsxs("div", {
                className: "hkm-showcase-row",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "hkm-showcase-label",
                    id: `${id}-option`,
                    children: optionLabel
                  }),
                  /* @__PURE__ */ jsx("div", {
                    "aria-labelledby": `${id}-option`,
                    className: "hkm-segmented",
                    role: "group",
                    children: options.map((entry) => /* @__PURE__ */ jsx("button", {
                      "aria-pressed": entry.id === option,
                      disabled: optionInactive,
                      onClick: () => chooseOption(entry.id),
                      type: "button",
                      children: entry.label
                    }, entry.id))
                  })
                ]
              })
            ]
          }),
          /* @__PURE__ */ jsxs("p", {
            className: "hkm-showcase-hint",
            children: [
              modeChoice.hint,
              optionChoice === undefined || optionInactive ? null : ` ${optionChoice.hint}`
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsx("div", {
        "aria-labelledby": surfaces.length > 1 ? `${id}-tab-${surface.id}` : undefined,
        className: "hkm-showcase-stage",
        "data-hkm-animated": animated ? "" : undefined,
        "data-hkm-from": animated ? previousMode : undefined,
        id: `${id}-panel`,
        role: surfaces.length > 1 ? "tabpanel" : undefined,
        style: {
          "--hkm-page-height": `${height}px`
        },
        children: /* @__PURE__ */ jsx(FitToWidth, {
          minWidth,
          children: surface.render({
            animated,
            mode,
            option,
            previousMode,
            theme
          })
        })
      }),
      /* @__PURE__ */ jsxs("figcaption", {
        className: "hkm-showcase-caption",
        children: [
          statusNode === undefined ? null : /* @__PURE__ */ jsx("span", {
            "aria-live": "polite",
            className: "hkm-showcase-status",
            children: statusNode
          }),
          /* @__PURE__ */ jsx("span", {
            children: caption
          })
        ]
      })
    ]
  });
}
function StepThrough({
  caption,
  className,
  initial,
  label = "Steps",
  minWidth = 400,
  steps,
  theme
}) {
  assertUniqueIds(steps, "StepThrough step");
  assertCaption(caption, "StepThrough");
  const id = useId();
  const [index, setIndex] = useState(() => Math.max(0, steps.findIndex((step2) => step2.id === initial)));
  const [animated, setAnimated] = useState(false);
  const tabs = useRef(new Map);
  const current = Math.min(index, steps.length - 1);
  const step = itemAt(steps, current, "StepThrough steps");
  const go = (next, focus = false) => {
    if (next < 0 || next >= steps.length || next === current)
      return;
    setIndex(next);
    setAnimated(true);
    if (focus)
      tabs.current.get(next)?.focus();
  };
  const onTabKey = (event) => {
    const next = nextTabIndex(event.key, current, steps.length);
    if (next === undefined)
      return;
    event.preventDefault();
    go(next, true);
  };
  return /* @__PURE__ */ jsxs("figure", {
    "aria-label": `Illustration: ${label.toLowerCase()}`,
    className: joinMockupClasses("hkm-showcase", "hkm-steps", className),
    "data-hkm-theme": theme,
    "data-nosnippet": "",
    children: [
      /* @__PURE__ */ jsx("div", {
        className: "hkm-showcase-controls",
        children: /* @__PURE__ */ jsx("div", {
          "aria-label": label,
          className: "hkm-tabs hkm-step-tabs",
          role: "tablist",
          children: steps.map((entry, position) => /* @__PURE__ */ jsxs("button", {
            "aria-controls": `${id}-panel`,
            "aria-selected": position === current,
            className: "hkm-tab",
            "data-hkm-done": position < current ? "" : undefined,
            id: `${id}-tab-${entry.id}`,
            onClick: () => go(position),
            onKeyDown: onTabKey,
            ref: (element) => {
              if (element === null)
                tabs.current.delete(position);
              else
                tabs.current.set(position, element);
            },
            role: "tab",
            tabIndex: position === current ? 0 : -1,
            type: "button",
            children: [
              /* @__PURE__ */ jsx("span", {
                "aria-hidden": "true",
                className: "hkm-step-number",
                children: position + 1
              }),
              entry.label
            ]
          }, entry.id))
        })
      }),
      /* @__PURE__ */ jsx("div", {
        "aria-labelledby": `${id}-tab-${step.id}`,
        className: "hkm-showcase-stage",
        "data-hkm-animated": animated ? "" : undefined,
        id: `${id}-panel`,
        role: "tabpanel",
        children: /* @__PURE__ */ jsx(FitToWidth, {
          minWidth,
          children: step.render({
            animated,
            theme
          })
        })
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "hkm-step-nav",
        children: [
          /* @__PURE__ */ jsx("button", {
            className: "hkm-step-button",
            disabled: current === 0,
            onClick: () => go(current - 1),
            type: "button",
            children: "Back"
          }),
          /* @__PURE__ */ jsxs("span", {
            "aria-live": "polite",
            className: "hkm-showcase-status",
            children: [
              "Step ",
              current + 1,
              " of ",
              steps.length,
              step.hint === undefined ? "" : `. ${step.hint}`
            ]
          }),
          /* @__PURE__ */ jsx("button", {
            className: "hkm-step-button",
            "data-hkm-primary": "",
            disabled: current === steps.length - 1,
            onClick: () => go(current + 1),
            type: "button",
            children: "Next"
          })
        ]
      }),
      /* @__PURE__ */ jsx("figcaption", {
        className: "hkm-showcase-caption",
        children: /* @__PURE__ */ jsx("span", {
          children: caption
        })
      })
    ]
  });
}
export {
  StepThrough,
  ModeShowcase,
  FitToWidth
};
