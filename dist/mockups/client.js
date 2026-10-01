"use client";
import {
  joinMockupClasses
} from "../chunk-evb02bc1.js";
import"../chunk-5gtx3pza.js";

// src/mockups/client.tsx
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
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
function optionalText(value, component) {
  if (value === undefined)
    return;
  if (typeof value !== "string")
    throw new TypeError(`${component} text must be a string.`);
  return value.trim() || undefined;
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
    "data-hkm-min-width": minWidth,
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
  fit = "natural",
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
  const captionText = optionalText(caption, "ModeShowcase");
  if (!Number.isFinite(height) || !(height > 0))
    throw new RangeError("ModeShowcase height must be finite and positive.");
  if (fit !== "natural" && fit !== "fill")
    throw new RangeError("ModeShowcase fit must be natural or fill.");
  if (fit === "fill" && surfaces.length * modes.length * (options?.length ?? 1) > 128)
    throw new RangeError("ModeShowcase fill supports up to 128 surface, mode, and option combinations.");
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
  const measurements = useMemo(() => fit !== "fill" ? null : surfaces.flatMap((entry) => modes.flatMap((choice) => (options ?? [{
    id: undefined
  }]).map((optionChoice2) => /* @__PURE__ */ jsx("div", {
    "aria-hidden": "true",
    className: "hkm-mode-surface",
    "data-hkm-measurement": "",
    hidden: true,
    inert: true,
    children: /* @__PURE__ */ jsx("div", {
      className: "hkm-fit",
      children: /* @__PURE__ */ jsx("div", {
        className: "hkm-fit-inner",
        children: entry.render({
          animated: false,
          mode: choice.id,
          option: optionChoice2.id,
          previousMode: choice.id,
          theme
        })
      })
    })
  }, JSON.stringify([entry.id, choice.id, optionChoice2.id]))))), [fit, modes, options, surfaces, theme]);
  const stage = useFittedShowcaseStage(fit, measurements, JSON.stringify([mode, option]), height);
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
  const hint = [modeChoice.hint, optionInactive ? undefined : optionChoice?.hint].map((text) => optionalText(text, "ModeShowcase hint")).filter((text) => text !== undefined).join(" ");
  const hasStatus = statusNode !== undefined && statusNode !== null && statusNode !== false && statusNode !== "";
  return /* @__PURE__ */ jsxs("figure", {
    "aria-label": label?.(surface) ?? `Illustration of ${surface.label.toLowerCase()}`,
    className: joinMockupClasses("hkm-showcase", "hkm-modes", className),
    "data-hkm-fit": fit === "fill" ? fit : undefined,
    "data-hkm-theme": theme,
    "data-nosnippet": "",
    children: [
      surfaces.length > 1 ? /* @__PURE__ */ jsx("div", {
        "aria-label": "Surface",
        className: "hkm-tabs hkm-folder-tabs",
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
        "aria-labelledby": surfaces.length > 1 ? `${id}-tab-${surface.id}` : undefined,
        className: "hkm-showcase-stage hkm-mode-panel",
        id: `${id}-panel`,
        role: surfaces.length > 1 ? "tabpanel" : undefined,
        style: {
          "--hkm-page-height": `${height}px`
        },
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "hkm-showcase-controls",
            children: [
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
              hint === "" ? null : /* @__PURE__ */ jsx("p", {
                className: "hkm-showcase-hint",
                children: hint
              })
            ]
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "hkm-mode-stage",
            ref: stage,
            children: [
              measurements,
              surfaces.map((entry) => /* @__PURE__ */ jsx("div", {
                "aria-hidden": entry.id !== surface.id,
                className: "hkm-mode-surface",
                "data-hkm-animated": entry.id === surface.id && animated ? "" : undefined,
                "data-hkm-from": entry.id === surface.id && animated ? previousMode : undefined,
                inert: entry.id !== surface.id,
                children: /* @__PURE__ */ jsx(FitToWidth, {
                  minWidth: fit === "fill" ? 1 : minWidth,
                  children: entry.render({
                    animated: entry.id === surface.id && animated,
                    mode,
                    option,
                    previousMode,
                    theme
                  })
                })
              }, entry.id))
            ]
          })
        ]
      }),
      !hasStatus && captionText === undefined ? null : /* @__PURE__ */ jsxs("figcaption", {
        className: "hkm-showcase-caption",
        children: [
          hasStatus ? /* @__PURE__ */ jsx("span", {
            "aria-live": "polite",
            className: "hkm-showcase-status",
            children: statusNode
          }) : null,
          captionText === undefined ? null : /* @__PURE__ */ jsx("span", {
            children: captionText
          })
        ]
      })
    ]
  });
}
function fillFrames(stage) {
  const frames = [];
  for (const panel of stage.querySelectorAll(":scope > .hkm-step-panel, :scope > .hkm-mode-surface")) {
    const fit = panel.querySelector(":scope > .hkm-fit");
    if (fit === null)
      continue;
    for (const root of fit.querySelectorAll(".hkm-root")) {
      const enclosingRoot = root.parentElement?.closest(".hkm-root");
      if (root.closest(".hkm-fit") === fit && (enclosingRoot === null || enclosingRoot === undefined || !fit.contains(enclosingRoot)))
        frames.push(root);
    }
  }
  return frames;
}
function presentationBodies(stage) {
  return fillFrames(stage).flatMap((frame) => [...frame.querySelectorAll(':scope > .hkm-window > [data-hkm-density="presentation"]')]);
}
function measureNestedFits(stage) {
  const fits = [...stage.querySelectorAll("[data-hkm-min-width]")].filter((fit) => fit.parentElement?.classList.contains("hkm-step-panel") !== true && fit.parentElement?.classList.contains("hkm-mode-surface") !== true);
  for (const fit of fits) {
    const inner = fit.querySelector(":scope > .hkm-fit-inner");
    if (inner === null)
      continue;
    fit.style.removeProperty("height");
    inner.style.removeProperty("transform");
    inner.style.width = `${Math.max(fit.clientWidth, Number(fit.dataset.hkmMinWidth))}px`;
  }
  for (const fit of fits.reverse()) {
    const inner = fit.querySelector(":scope > .hkm-fit-inner");
    if (inner === null || inner.offsetWidth <= 0)
      continue;
    const scale = Math.min(1, fit.clientWidth / inner.offsetWidth);
    fit.style.height = `${inner.offsetHeight * scale}px`;
    inner.style.transform = `scale(${scale})`;
  }
}
function fitShowcaseStage(stage, minimumHeight) {
  const owner = stage.parentElement;
  if (owner === null || stage.clientWidth <= 0)
    return;
  for (const frame of fillFrames(stage))
    frame.setAttribute("data-hkm-fill-frame", "");
  const probe = stage.cloneNode(true);
  probe.setAttribute("aria-hidden", "true");
  probe.setAttribute("inert", "");
  probe.setAttribute("data-hkm-measuring", "");
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;inset:0 auto auto 0;inline-size:${stage.getBoundingClientRect().width}px;block-size:auto;`;
  for (const sentinel of probe.querySelectorAll("[data-hkm-font-sentinel]"))
    sentinel.remove();
  for (const node of probe.querySelectorAll("[id]"))
    node.removeAttribute("id");
  for (const node of probe.querySelectorAll("[data-hkm-animated]"))
    node.removeAttribute("data-hkm-animated");
  for (const body of presentationBodies(probe))
    body.style.removeProperty("--hkm-terminal-presentation-size");
  for (const fixture of probe.querySelectorAll("[data-hkm-measurement]"))
    fixture.hidden = false;
  for (const node of [probe, ...probe.querySelectorAll("*")]) {
    node.style.setProperty("transition", "none", "important");
    node.style.setProperty("animation", "none", "important");
  }
  owner.append(probe);
  try {
    measureNestedFits(probe);
    const naturalHeight = Math.max(minimumHeight, Math.ceil(probe.getBoundingClientRect().height));
    stage.style.setProperty("--hkm-showcase-fill-height", `${naturalHeight}px`);
    for (const fixture of probe.querySelectorAll("[data-hkm-measurement]"))
      fixture.remove();
    probe.style.blockSize = `${naturalHeight}px`;
    probe.removeAttribute("data-hkm-measuring");
    const bodies = presentationBodies(stage).filter((body) => body.closest("[data-hkm-measurement]") === null);
    const copies = presentationBodies(probe);
    for (const [index, copy] of copies.entries()) {
      const body = bodies[index];
      if (body === undefined)
        continue;
      const lines = [...copy.querySelectorAll(".hkm-terminal-line")];
      const wrappedRows = (line) => Math.ceil((line.getBoundingClientRect().height - 0.5) / Number.parseFloat(getComputedStyle(line).lineHeight));
      const baselineRows = lines.map(wrappedRows);
      let low = 1;
      let high = 4;
      for (let attempt = 0;attempt < 9; attempt += 1) {
        const candidate = (low + high) / 2;
        copy.style.setProperty("--hkm-terminal-presentation-size", `${candidate}rem`);
        if (copy.scrollHeight <= copy.clientHeight + 1 && copy.scrollWidth <= copy.clientWidth + 1 && lines.every((line, index2) => {
          const baseline = baselineRows[index2];
          return baseline !== undefined && wrappedRows(line) <= baseline;
        }))
          low = candidate;
        else
          high = candidate;
      }
      body.style.setProperty("--hkm-terminal-presentation-size", `${Math.floor(low * 1000) / 1000}rem`);
    }
    stage.setAttribute("data-hkm-fitted", "");
  } finally {
    probe.remove();
  }
}
function useFittedShowcaseStage(fit, source, variation = "", minimumHeight = 0) {
  const stage = useRef(null);
  useIsomorphicLayoutEffect(() => {
    const node = stage.current;
    if (fit !== "fill" || node === null || typeof ResizeObserver === "undefined")
      return;
    const fontSentinel = document.createElement("span");
    fontSentinel.setAttribute("data-hkm-font-sentinel", "");
    fontSentinel.setAttribute("aria-hidden", "true");
    fontSentinel.inert = true;
    fontSentinel.style.cssText = "position:absolute;inline-size:1rem;block-size:1rem;visibility:hidden;pointer-events:none;inset:0 auto auto 0;";
    node.append(fontSentinel);
    let previous = "";
    let disposed = false;
    const measure = () => {
      if (disposed)
        return;
      const key = `${node.clientWidth}/${getComputedStyle(document.documentElement).fontSize}`;
      if (key === previous)
        return;
      previous = key;
      fitShowcaseStage(node, minimumHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(document.documentElement);
    observer.observe(fontSentinel);
    document.fonts.ready.then(() => {
      previous = "";
      measure();
    });
    return () => {
      disposed = true;
      observer.disconnect();
      fontSentinel.remove();
      node.style.removeProperty("--hkm-showcase-fill-height");
      node.removeAttribute("data-hkm-fitted");
      for (const body of presentationBodies(node))
        body.style.removeProperty("--hkm-terminal-presentation-size");
      for (const frame of fillFrames(node))
        frame.removeAttribute("data-hkm-fill-frame");
    };
  }, [fit, source, variation, minimumHeight]);
  return stage;
}
function StepThrough({
  caption,
  className,
  initial,
  fit = "natural",
  label = "Steps",
  minWidth = 400,
  steps,
  theme
}) {
  assertUniqueIds(steps, "StepThrough step");
  if (fit !== "natural" && fit !== "fill")
    throw new RangeError("StepThrough fit must be natural or fill.");
  const stage = useFittedShowcaseStage(fit, steps);
  const captionText = optionalText(caption, "StepThrough");
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
    "data-hkm-fit": fit === "fill" ? fit : undefined,
    "data-hkm-theme": theme,
    "data-nosnippet": "",
    children: [
      /* @__PURE__ */ jsx("div", {
        className: "hkm-showcase-controls",
        children: /* @__PURE__ */ jsx("div", {
          "aria-label": label,
          className: "hkm-tabs hkm-folder-tabs hkm-step-tabs",
          role: "tablist",
          children: steps.map((entry, position) => /* @__PURE__ */ jsxs("button", {
            "aria-controls": `${id}-panel-${entry.id}`,
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
        className: "hkm-showcase-stage hkm-step-stage",
        ref: stage,
        children: steps.map((entry, position) => /* @__PURE__ */ jsx("div", {
          "aria-hidden": position !== current,
          "aria-labelledby": `${id}-tab-${entry.id}`,
          className: "hkm-step-panel",
          "data-hkm-animated": position === current && animated ? "" : undefined,
          id: `${id}-panel-${entry.id}`,
          inert: position !== current,
          role: "tabpanel",
          children: fit === "fill" ? /* @__PURE__ */ jsx("div", {
            className: "hkm-fit",
            children: /* @__PURE__ */ jsx("div", {
              className: "hkm-fit-inner",
              children: entry.render({
                animated: position === current && animated,
                theme
              })
            })
          }) : /* @__PURE__ */ jsx(FitToWidth, {
            minWidth,
            children: entry.render({
              animated: position === current && animated,
              theme
            })
          })
        }, entry.id))
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "hkm-step-nav",
        children: [
          /* @__PURE__ */ jsx("button", {
            "aria-label": "Back",
            className: "hkm-step-button",
            disabled: current === 0,
            onClick: () => go(current - 1),
            type: "button",
            children: /* @__PURE__ */ jsx("svg", {
              "aria-hidden": "true",
              focusable: "false",
              height: "28",
              viewBox: "0 0 24 24",
              width: "28",
              children: /* @__PURE__ */ jsx("path", {
                d: "m14.5 5-7 7 7 7",
                fill: "none",
                stroke: "currentColor",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "1.75"
              })
            })
          }),
          /* @__PURE__ */ jsxs("span", {
            "aria-live": "polite",
            className: "hkm-showcase-status hkm-step-announcement",
            children: [
              "Step ",
              current + 1,
              " of ",
              steps.length,
              step.hint === undefined ? "" : `. ${step.hint}`
            ]
          }),
          /* @__PURE__ */ jsx("button", {
            "aria-label": "Next",
            className: "hkm-step-button",
            "data-hkm-primary": "",
            disabled: current === steps.length - 1,
            onClick: () => go(current + 1),
            type: "button",
            children: /* @__PURE__ */ jsx("svg", {
              "aria-hidden": "true",
              focusable: "false",
              height: "28",
              viewBox: "0 0 24 24",
              width: "28",
              children: /* @__PURE__ */ jsx("path", {
                d: "m9.5 5 7 7-7 7",
                fill: "none",
                stroke: "currentColor",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "1.75"
              })
            })
          })
        ]
      }),
      captionText === undefined ? null : /* @__PURE__ */ jsx("figcaption", {
        className: "hkm-showcase-caption",
        children: /* @__PURE__ */ jsx("span", {
          children: captionText
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
