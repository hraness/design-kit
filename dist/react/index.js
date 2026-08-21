"use client";
import {
  colors,
  motion
} from "../chunk-t88hdxxm.js";
import {
  BottomBar,
  DitherSurface,
  DockedFooter,
  PageCanvas,
  ParticleHalo,
  ProceduralBackdrop,
  SyntaxCode,
  TopBar,
  createParticleHaloRecipe,
  createProceduralBackdropRecipe,
  proceduralBackdropVariants,
  proceduralRecipeVersion
} from "../chunk-6e002fdt.js";
import"../chunk-djxa5bgc.js";
import {
  __require
} from "../chunk-5gtx3pza.js";

// src/react/animated-rail-stage.tsx
import { AnimatePresence, motion as Motion, useReducedMotion } from "motion/react";
import { cn } from "@hraness/ui";
import { jsx } from "react/jsx-runtime";
function railStageMotion(reduceMotion) {
  const duration = reduceMotion ? 0 : motion.duration.standard / 1000;
  return {
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : -motion.distance.railExit },
    initial: { opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : motion.distance.railEnter },
    transition: { duration, ease: "easeOut" }
  };
}
function AnimatedRailStage({ children, className, stageKey }) {
  const reduceMotion = useReducedMotion();
  const stageMotion = railStageMotion(reduceMotion ?? false);
  return /* @__PURE__ */ jsx(AnimatePresence, {
    initial: false,
    mode: "wait",
    children: /* @__PURE__ */ jsx(Motion.div, {
      animate: stageMotion.animate,
      className: cn("hraness-design-animated-rail-stage", className),
      "data-stage-key": String(stageKey),
      exit: stageMotion.exit,
      initial: stageMotion.initial,
      transition: stageMotion.transition,
      children
    }, stageKey)
  });
}
// src/react/app-shell.tsx
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { DialogContent, DialogTrigger, Icon, IconButton, cn as cn2 } from "@hraness/ui";
import { useEffect, useState } from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function AppShell({
  bottomBar,
  children,
  className,
  mobileNavigationLabel = "Navigation",
  navigationKey,
  openNavigationLabel = "Open navigation",
  rail,
  topBar
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setMobileOpen(false);
  }, [navigationKey]);
  return /* @__PURE__ */ jsxs("div", {
    className: cn2("hraness-design-app-shell", className),
    children: [
      /* @__PURE__ */ jsx2("div", {
        className: "hraness-design-app-shell__top",
        children: topBar
      }),
      /* @__PURE__ */ jsx2("div", {
        className: "hraness-design-app-shell__rail",
        children: rail
      }),
      /* @__PURE__ */ jsx2("div", {
        className: "hraness-design-app-shell__mobile-trigger",
        children: /* @__PURE__ */ jsxs(DialogTrigger, {
          isOpen: mobileOpen,
          onOpenChange: setMobileOpen,
          children: [
            /* @__PURE__ */ jsx2(IconButton, {
              "aria-label": openNavigationLabel,
              size: "compact",
              children: /* @__PURE__ */ jsx2(Icon, {
                icon: Menu01Icon
              })
            }),
            /* @__PURE__ */ jsx2(DialogContent, {
              className: "hraness-design-app-shell__drawer",
              size: "small",
              title: mobileNavigationLabel,
              children: rail
            })
          ]
        })
      }),
      /* @__PURE__ */ jsx2("div", {
        className: "hraness-design-app-shell__page",
        children
      }),
      bottomBar === undefined ? null : /* @__PURE__ */ jsx2("div", {
        className: "hraness-design-app-shell__bottom",
        children: bottomBar
      })
    ]
  });
}
// src/react/phaser-dots.tsx
import { useEffect as useEffect2, useRef } from "react";
import { cn as cn3 } from "@hraness/ui";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var DOT_PATTERN = "hraness-design-phaser-dots__static";
var DEFAULT_DOT_STYLE = {
  color: "var(--phaser-dots-static-color, var(--foreground))",
  opacity: "var(--phaser-dots-static-opacity, 0.025)"
};
var DEFAULT_TRAIL_STYLE = {
  color: "var(--phaser-dots-trail-color, var(--foreground))",
  opacity: "var(--phaser-dots-trail-opacity, 0.25)"
};
var INERT_PROPS = { inert: true };
function PhaserDots({
  className,
  fadeDirection = "none",
  mouseGlow = false,
  dotClassName,
  trailClassName,
  style,
  ...props
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect2(() => {
    if (!mouseGlow)
      return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas)
      return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx)
      return;
    const DOT_STEP = 6;
    const PRIMARY_TRAIL_ALPHA = 0.48;
    const PRIMARY_TRAIL_DECAY_MS = 3800;
    const SECONDARY_TRAIL_ALPHA = 0.34;
    const SECONDARY_TRAIL_DECAY_MS = 10500;
    const MAX_TRAIL_POINTS = 160;
    const POINT_SPACING = DOT_STEP;
    const MAX_INTERPOLATION_STEPS = 2;
    const MAX_RENDERED_PRIMARY_TRAIL_POINTS = 24;
    const MAX_RENDERED_SECONDARY_TRAIL_POINTS = 16;
    const CLICK_TRAIL_STAMP = [
      { dx: 0, dy: 0 },
      { dx: DOT_STEP, dy: 0 },
      { dx: -DOT_STEP, dy: 0 },
      { dx: 0, dy: DOT_STEP },
      { dx: 0, dy: -DOT_STEP }
    ];
    const HOVER_BRUSH_RADIUS = 54;
    const HOVER_BRUSH_ALPHA = 0.6;
    const HOVER_BRUSH_DECAY_MS = 900;
    const MAX_HOVER_POINTS = 6;
    const INTERACTION_PAD = HOVER_BRUSH_RADIUS;
    const RECT_CACHE_MS = 180;
    const FRAME_MIN_INTERVAL_MS = 33;
    const COLOR_CACHE_MS = 1000;
    const DOT_KEY_STRIDE = 8192;
    const CANVAS_DOT_SIZE = 2;
    const CANVAS_DOT_HALF = CANVAS_DOT_SIZE / 2;
    const trail = [];
    const hoverBrush = [];
    const dotAlpha = new Map;
    const hoverOffsets = [];
    let lastPoint = null;
    let lastHoverPoint = null;
    let pendingMove = null;
    let pendingDown = null;
    let cachedRect = container.getBoundingClientRect();
    let lastRectRead = 0;
    let lastFrameTime = 0;
    let lastColorRead = 0;
    let drawColor = getComputedStyle(canvas).color;
    let raf = 0;
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let canvasWidth = Math.max(1, Math.round(cachedRect.width));
    let canvasHeight = Math.max(1, Math.round(cachedRect.height));
    const snapToGrid = (value) => Math.round(value / DOT_STEP) * DOT_STEP;
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      cachedRect = rect;
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const nextDpr = Math.max(1, window.devicePixelRatio || 1);
      if (width === canvasWidth && height === canvasHeight && nextDpr === dpr && canvas.width === Math.round(width * nextDpr) && canvas.height === Math.round(height * nextDpr)) {
        return;
      }
      canvasWidth = width;
      canvasHeight = height;
      dpr = nextDpr;
      canvas.width = Math.round(canvasWidth * dpr);
      canvas.height = Math.round(canvasHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    };
    for (let dx = -HOVER_BRUSH_RADIUS;dx <= HOVER_BRUSH_RADIUS; dx += DOT_STEP) {
      for (let dy = -HOVER_BRUSH_RADIUS;dy <= HOVER_BRUSH_RADIUS; dy += DOT_STEP) {
        const dist = Math.hypot(dx, dy);
        if (dist > HOVER_BRUSH_RADIUS)
          continue;
        hoverOffsets.push({
          dx,
          dy,
          weight: 1 - dist / HOVER_BRUSH_RADIUS
        });
      }
    }
    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);
    const getContainerRect = (now) => {
      if (now - lastRectRead > RECT_CACHE_MS) {
        cachedRect = container.getBoundingClientRect();
        lastRectRead = now;
      }
      return cachedRect;
    };
    const getLocalPoint = (clientX, clientY, now) => {
      const rect = getContainerRect(now);
      const nearContainer = clientX >= rect.left - INTERACTION_PAD && clientX <= rect.right + INTERACTION_PAD && clientY >= rect.top - INTERACTION_PAD && clientY <= rect.bottom + INTERACTION_PAD;
      if (!nearContainer)
        return null;
      return {
        x: snapToGrid(clientX - rect.left),
        y: snapToGrid(clientY - rect.top)
      };
    };
    const putDot = (x, y, alpha) => {
      if (alpha <= 0)
        return;
      const sx = snapToGrid(x);
      const sy = snapToGrid(y);
      if (sx < 0 || sy < 0 || sx > canvasWidth || sy > canvasHeight)
        return;
      const key = sx + sy * DOT_KEY_STRIDE;
      const prev = dotAlpha.get(key);
      if (prev === undefined || alpha > prev) {
        dotAlpha.set(key, alpha);
      }
    };
    const pushHoverBrushPoint = (x, y) => {
      if (lastHoverPoint?.x === x && lastHoverPoint.y === y)
        return;
      hoverBrush.push({ x, y, t: performance.now() });
      if (hoverBrush.length > MAX_HOVER_POINTS) {
        hoverBrush.splice(0, hoverBrush.length - MAX_HOVER_POINTS);
      }
      lastHoverPoint = { x, y };
    };
    const pushTrailPoint = (x, y) => {
      const now = performance.now();
      if (!lastPoint) {
        trail.push({ x, y, t: now });
      } else {
        const dx = x - lastPoint.x;
        const dy = y - lastPoint.y;
        const dist = Math.hypot(dx, dy);
        if (dist < POINT_SPACING)
          return;
        const steps = Math.min(MAX_INTERPOLATION_STEPS, Math.max(1, Math.floor(dist / POINT_SPACING)));
        for (let i = 1;i <= steps; i += 1) {
          const ratio = i / steps;
          const px = snapToGrid(lastPoint.x + dx * ratio);
          const py = snapToGrid(lastPoint.y + dy * ratio);
          if (trail[trail.length - 1]?.x === px && trail[trail.length - 1]?.y === py) {
            continue;
          }
          trail.push({ x: px, y: py, t: now });
        }
      }
      if (trail.length > MAX_TRAIL_POINTS) {
        trail.splice(0, trail.length - MAX_TRAIL_POINTS);
      }
      lastPoint = { x, y };
    };
    const stampClickTrail = (x, y, t) => {
      for (const offset of CLICK_TRAIL_STAMP) {
        trail.push({
          x: snapToGrid(x + offset.dx),
          y: snapToGrid(y + offset.dy),
          t
        });
      }
      if (trail.length > MAX_TRAIL_POINTS) {
        trail.splice(0, trail.length - MAX_TRAIL_POINTS);
      }
    };
    const renderDots = (now) => {
      dotAlpha.clear();
      for (let i = hoverBrush.length - 1;i >= 0; i -= 1) {
        const p = hoverBrush[i];
        if (p === undefined)
          continue;
        const baseAlpha = HOVER_BRUSH_ALPHA * Math.max(0, 1 - (now - p.t) / HOVER_BRUSH_DECAY_MS);
        if (baseAlpha <= 0)
          continue;
        for (let j = 0;j < hoverOffsets.length; j += 1) {
          const off = hoverOffsets[j];
          if (off === undefined)
            continue;
          putDot(p.x + off.dx, p.y + off.dy, baseAlpha * off.weight);
        }
      }
      let primaryCount = 0;
      let secondaryCount = 0;
      let sampledPrimaryCounter = 0;
      let sampledSecondaryCounter = 0;
      for (let i = trail.length - 1;i >= 0 && (primaryCount < MAX_RENDERED_PRIMARY_TRAIL_POINTS || secondaryCount < MAX_RENDERED_SECONDARY_TRAIL_POINTS); i -= 1) {
        const p = trail[i];
        if (p === undefined)
          continue;
        const agePrimary = (now - p.t) / PRIMARY_TRAIL_DECAY_MS;
        const ageSecondary = (now - p.t) / SECONDARY_TRAIL_DECAY_MS;
        if (ageSecondary > 1)
          continue;
        if (primaryCount < MAX_RENDERED_PRIMARY_TRAIL_POINTS && agePrimary <= 1) {
          if (agePrimary > 0.35) {
            const stride = agePrimary > 0.75 ? 4 : 2;
            if (sampledPrimaryCounter % stride !== 0) {
              sampledPrimaryCounter += 1;
            } else {
              putDot(p.x, p.y, PRIMARY_TRAIL_ALPHA * Math.max(0, 1 - agePrimary));
              primaryCount += 1;
              sampledPrimaryCounter += 1;
            }
          } else {
            putDot(p.x, p.y, PRIMARY_TRAIL_ALPHA * Math.max(0, 1 - agePrimary));
            primaryCount += 1;
          }
        }
        if (secondaryCount < MAX_RENDERED_SECONDARY_TRAIL_POINTS) {
          if (ageSecondary > 0.3) {
            const stride = ageSecondary > 0.75 ? 5 : 3;
            if (sampledSecondaryCounter % stride !== 0) {
              sampledSecondaryCounter += 1;
              continue;
            }
            sampledSecondaryCounter += 1;
          }
          putDot(p.x, p.y, SECONDARY_TRAIL_ALPHA * Math.max(0, 1 - ageSecondary));
          secondaryCount += 1;
        }
      }
      if (dotAlpha.size === 0) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        return;
      }
      if (now - lastColorRead > COLOR_CACHE_MS) {
        drawColor = getComputedStyle(canvas).color;
        lastColorRead = now;
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = drawColor;
      for (const [key, alpha] of dotAlpha) {
        const x = key % DOT_KEY_STRIDE;
        const y = (key - x) / DOT_KEY_STRIDE;
        ctx.globalAlpha = alpha;
        ctx.fillRect(x - CANVAS_DOT_HALF, y - CANVAS_DOT_HALF, CANVAS_DOT_SIZE, CANVAS_DOT_SIZE);
      }
      ctx.globalAlpha = 1;
    };
    const tick = (frameTime) => {
      if (lastFrameTime !== 0 && frameTime - lastFrameTime < FRAME_MIN_INTERVAL_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrameTime = frameTime;
      const now = performance.now();
      if (pendingDown) {
        const point = getLocalPoint(pendingDown.x, pendingDown.y, now);
        pendingDown = null;
        if (point) {
          pushHoverBrushPoint(point.x, point.y);
          stampClickTrail(point.x, point.y, now);
          pushTrailPoint(point.x, point.y);
        }
      }
      if (pendingMove) {
        const point = getLocalPoint(pendingMove.x, pendingMove.y, now);
        pendingMove = null;
        if (point) {
          pushHoverBrushPoint(point.x, point.y);
          pushTrailPoint(point.x, point.y);
        } else {
          lastPoint = null;
          lastHoverPoint = null;
        }
      }
      while (true) {
        const oldest = hoverBrush[0];
        if (oldest === undefined || now - oldest.t <= HOVER_BRUSH_DECAY_MS)
          break;
        hoverBrush.shift();
      }
      while (true) {
        const oldest = trail[0];
        if (oldest === undefined || now - oldest.t <= SECONDARY_TRAIL_DECAY_MS)
          break;
        trail.shift();
      }
      if (hoverBrush.length === 0 && trail.length === 0) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        raf = 0;
        return;
      }
      renderDots(now);
      raf = requestAnimationFrame(tick);
    };
    const handleMove = (e) => {
      pendingMove = { x: e.clientX, y: e.clientY };
      if (!raf)
        raf = requestAnimationFrame(tick);
    };
    const handleDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0)
        return;
      pendingDown = { x: e.clientX, y: e.clientY };
      if (!raf)
        raf = requestAnimationFrame(tick);
    };
    const handleUp = () => {
      lastPoint = null;
    };
    const passive = { passive: true };
    document.addEventListener("pointermove", handleMove, passive);
    document.addEventListener("pointerdown", handleDown, passive);
    document.addEventListener("pointerup", handleUp, passive);
    document.addEventListener("pointercancel", handleUp, passive);
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerdown", handleDown);
      document.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointercancel", handleUp);
      resizeObserver.disconnect();
      if (raf)
        cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    };
  }, [mouseGlow]);
  const maskGradient = fadeDirection === "top" ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)" : fadeDirection === "bottom" ? "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)" : fadeDirection === "left" ? "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)" : fadeDirection === "right" ? "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)" : undefined;
  const mergedStyle = maskGradient ? {
    ...style,
    WebkitMaskImage: maskGradient,
    maskImage: maskGradient
  } : style;
  return /* @__PURE__ */ jsxs2("div", {
    ...props,
    ...INERT_PROPS,
    ref: containerRef,
    role: "presentation",
    "aria-hidden": "true",
    className: cn3("hraness-design-phaser-dots", className),
    style: mergedStyle,
    children: [
      /* @__PURE__ */ jsx3("div", {
        className: cn3(DOT_PATTERN, dotClassName),
        style: dotClassName ? undefined : DEFAULT_DOT_STYLE
      }),
      mouseGlow && /* @__PURE__ */ jsx3("canvas", {
        ref: canvasRef,
        className: cn3("hraness-design-phaser-dots__trail", trailClassName),
        style: trailClassName ? undefined : DEFAULT_TRAIL_STYLE
      })
    ]
  });
}

// src/react/aurora-dots-background.tsx
import { jsx as jsx4, jsxs as jsxs3, Fragment } from "react/jsx-runtime";
function AuroraDotsBackground() {
  return /* @__PURE__ */ jsxs3(Fragment, {
    children: [
      /* @__PURE__ */ jsx4("div", {
        "aria-hidden": "true",
        className: "hraness-design-aurora-background"
      }),
      /* @__PURE__ */ jsx4("div", {
        "aria-hidden": "true",
        className: "hraness-design-aurora-dots",
        children: /* @__PURE__ */ jsx4(PhaserDots, {
          mouseGlow: true
        })
      })
    ]
  });
}
// src/react/charts.tsx
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";
import {
  useId
} from "react";
import { cn as cn4 } from "@hraness/ui";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
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
function accessibleChartCaption({ ariaLabel }) {
  if (ariaLabel.trim() === "")
    throw new TypeError("Charts require a nonblank accessible label.");
  return /* @__PURE__ */ jsx5("figcaption", {
    className: "hraness-design-visually-hidden",
    children: ariaLabel
  });
}
function ChartRow({
  children,
  id,
  isSelected,
  onSelectionChange
}) {
  if (onSelectionChange === undefined) {
    return /* @__PURE__ */ jsx5("div", {
      className: "hraness-design-chart-row",
      "data-selected": isSelected || undefined,
      children
    });
  }
  return /* @__PURE__ */ jsx5("button", {
    "aria-pressed": isSelected,
    className: "hraness-design-chart-row hraness-design-chart-row--selectable",
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
  domain = [0, Math.max(1, ...data.map(({ value }) => finiteOr(value, 0)))],
  formatValue = (value) => String(value),
  onSelectionChange,
  selectedId = null
}) {
  const [minimum, maximum] = domain;
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum >= maximum) {
    throw new RangeError("Bar chart domain must be finite and ascending.");
  }
  return /* @__PURE__ */ jsxs4("figure", {
    className: cn4("hraness-design-bar-list-chart", className),
    children: [
      accessibleChartCaption({ ariaLabel }),
      /* @__PURE__ */ jsx5("div", {
        className: "hraness-design-bar-list-chart__rows",
        children: data.map((datum) => {
          const value = finiteOr(datum.value, minimum);
          const width = normalizedPercent(value, minimum, maximum);
          const style = {
            "--hraness-design-chart-color": datum.color ?? "var(--info)",
            "--hraness-design-chart-value": `${String(width)}%`
          };
          return /* @__PURE__ */ jsxs4(ChartRow, {
            id: datum.id,
            isSelected: selectedId === datum.id,
            onSelectionChange,
            children: [
              /* @__PURE__ */ jsxs4("span", {
                className: "hraness-design-chart-row__heading",
                children: [
                  /* @__PURE__ */ jsx5("span", {
                    className: "hraness-design-chart-row__label",
                    children: datum.label
                  }),
                  /* @__PURE__ */ jsx5("span", {
                    className: "hraness-design-chart-row__value",
                    children: formatValue(value)
                  })
                ]
              }),
              /* @__PURE__ */ jsx5("span", {
                "aria-hidden": "true",
                className: "hraness-design-bar-list-chart__track",
                style,
                children: /* @__PURE__ */ jsx5("span", {
                  className: "hraness-design-bar-list-chart__bar"
                })
              }),
              datum.detail === undefined ? null : /* @__PURE__ */ jsx5("span", {
                className: "hraness-design-chart-row__detail",
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
  return /* @__PURE__ */ jsxs4("div", {
    className: "hraness-design-chart-tooltip",
    children: [
      /* @__PURE__ */ jsx5("strong", {
        children: typeof label === "string" ? label : "Benchmark"
      }),
      /* @__PURE__ */ jsx5("dl", {
        children: payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const value = typeof item.value === "number" && Number.isFinite(item.value) ? item.value.toFixed(1) : "–";
          return /* @__PURE__ */ jsxs4("div", {
            children: [
              /* @__PURE__ */ jsxs4("dt", {
                children: [
                  /* @__PURE__ */ jsx5("i", {
                    "aria-hidden": "true",
                    style: { background: item.color }
                  }),
                  labels.get(key) ?? key
                ]
              }),
              /* @__PURE__ */ jsx5("dd", {
                children: value
              })
            ]
          }, key);
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
  const effectiveSelectedId = series.some(({ id }) => id === selectedId) ? selectedId : null;
  const data = axes.map((axis) => {
    const row = { axis: axis.label };
    for (const item of series)
      row[item.id] = finiteOr(item.values[axis.id] ?? 0, 0);
    return row;
  });
  return /* @__PURE__ */ jsxs4("figure", {
    className: cn4("hraness-design-radar-profile-chart", className),
    children: [
      accessibleChartCaption({ ariaLabel }),
      /* @__PURE__ */ jsx5("div", {
        "aria-hidden": "true",
        className: "hraness-design-radar-profile-chart__plot",
        children: /* @__PURE__ */ jsx5(ResponsiveContainer, {
          height: "100%",
          initialDimension: { height: 280, width: 360 },
          width: "100%",
          children: /* @__PURE__ */ jsxs4(RadarChart, {
            data,
            margin: { bottom: 22, left: 28, right: 28, top: 22 },
            children: [
              /* @__PURE__ */ jsx5(PolarGrid, {
                gridType: "polygon",
                stroke: "var(--grid)",
                strokeDasharray: "2 5"
              }),
              /* @__PURE__ */ jsx5(PolarAngleAxis, {
                dataKey: "axis",
                tick: { fill: "var(--muted)", fontFamily: "var(--font-text)", fontSize: 11 },
                tickLine: false
              }),
              /* @__PURE__ */ jsx5(PolarRadiusAxis, {
                axisLine: false,
                domain: [0, 100],
                tick: false
              }),
              /* @__PURE__ */ jsx5(RechartsTooltip, {
                content: /* @__PURE__ */ jsx5(RadarProfileTooltip, {
                  series
                }),
                cursor: false,
                isAnimationActive: false
              }),
              /* @__PURE__ */ jsx5("defs", {
                children: series.map((item, index) => {
                  const gradientId = `${gradientPrefix}-${String(index)}`;
                  return /* @__PURE__ */ jsxs4("radialGradient", {
                    id: gradientId,
                    children: [
                      /* @__PURE__ */ jsx5("stop", {
                        offset: "0%",
                        stopColor: item.color,
                        stopOpacity: "0.06"
                      }),
                      /* @__PURE__ */ jsx5("stop", {
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
                return /* @__PURE__ */ jsx5(Radar, {
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
      /* @__PURE__ */ jsx5("div", {
        "aria-label": "Profiles",
        className: "hraness-design-radar-profile-chart__legend",
        role: "group",
        children: series.map((item) => /* @__PURE__ */ jsxs4(ChartRow, {
          id: item.id,
          isSelected: selectedId === item.id,
          onSelectionChange,
          children: [
            /* @__PURE__ */ jsx5("i", {
              "aria-hidden": "true",
              style: { background: item.color }
            }),
            /* @__PURE__ */ jsx5("span", {
              children: item.label
            })
          ]
        }, item.id))
      }),
      /* @__PURE__ */ jsxs4("table", {
        className: "hraness-design-visually-hidden",
        children: [
          /* @__PURE__ */ jsx5("caption", {
            children: ariaLabel
          }),
          /* @__PURE__ */ jsx5("thead", {
            children: /* @__PURE__ */ jsxs4("tr", {
              children: [
                /* @__PURE__ */ jsx5("th", {
                  scope: "col",
                  children: "Benchmark"
                }),
                series.map((item) => /* @__PURE__ */ jsx5("th", {
                  scope: "col",
                  children: item.label
                }, item.id))
              ]
            })
          }),
          /* @__PURE__ */ jsx5("tbody", {
            children: axes.map((axis) => /* @__PURE__ */ jsxs4("tr", {
              children: [
                /* @__PURE__ */ jsx5("th", {
                  scope: "row",
                  children: axis.label
                }),
                series.map((item) => /* @__PURE__ */ jsx5("td", {
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
  return /* @__PURE__ */ jsxs4("figure", {
    className: cn4("hraness-design-range-plot-chart", className),
    children: [
      accessibleChartCaption({ ariaLabel }),
      /* @__PURE__ */ jsx5("div", {
        className: "hraness-design-range-plot-chart__rows",
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
          return /* @__PURE__ */ jsxs4(ChartRow, {
            id: datum.id,
            isSelected: selectedId === datum.id,
            onSelectionChange,
            children: [
              /* @__PURE__ */ jsxs4("span", {
                className: "hraness-design-chart-row__heading",
                children: [
                  /* @__PURE__ */ jsx5("span", {
                    className: "hraness-design-chart-row__label",
                    children: datum.label
                  }),
                  /* @__PURE__ */ jsxs4("span", {
                    className: "hraness-design-chart-row__value",
                    children: [
                      formatValue(minimum),
                      "–",
                      formatValue(maximum)
                    ]
                  })
                ]
              }),
              /* @__PURE__ */ jsxs4("span", {
                "aria-hidden": "true",
                className: "hraness-design-range-plot-chart__track",
                style,
                children: [
                  /* @__PURE__ */ jsx5("span", {
                    className: "hraness-design-range-plot-chart__range"
                  }),
                  /* @__PURE__ */ jsx5("span", {
                    className: "hraness-design-range-plot-chart__median"
                  })
                ]
              }),
              datum.detail === undefined ? null : /* @__PURE__ */ jsx5("span", {
                className: "hraness-design-chart-row__detail",
                children: datum.detail
              })
            ]
          }, datum.id);
        })
      })
    ]
  });
}
// src/react/chat.tsx
import { Button, TextAreaField, cn as cn5 } from "@hraness/ui";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function ChatMessage({
  actions,
  avatar,
  children,
  className,
  meta,
  name,
  role
}) {
  return /* @__PURE__ */ jsxs5("article", {
    className: cn5("hraness-design-chat-message", className),
    "data-role": role,
    children: [
      avatar === undefined ? null : /* @__PURE__ */ jsx6("div", {
        className: "hraness-design-chat-message__avatar",
        children: avatar
      }),
      /* @__PURE__ */ jsxs5("div", {
        className: "hraness-design-chat-message__content",
        children: [
          name === undefined && meta === undefined ? null : /* @__PURE__ */ jsxs5("header", {
            className: "hraness-design-chat-message__header",
            children: [
              name === undefined ? null : /* @__PURE__ */ jsx6("strong", {
                children: name
              }),
              meta === undefined ? null : /* @__PURE__ */ jsx6("span", {
                children: meta
              })
            ]
          }),
          /* @__PURE__ */ jsx6("div", {
            className: "hraness-design-chat-message__body",
            children
          }),
          actions === undefined ? null : /* @__PURE__ */ jsx6("footer", {
            className: "hraness-design-chat-message__actions",
            children: actions
          })
        ]
      })
    ]
  });
}
function ChatComposer({
  className,
  isDisabled = false,
  isPending = false,
  label = "Message",
  onSubmit,
  onValueChange,
  placeholder,
  sendLabel = "Send",
  value,
  ...props
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (isDisabled || isPending || value.trim().length === 0)
      return;
    onSubmit();
  };
  return /* @__PURE__ */ jsxs5("form", {
    ...props,
    className: cn5("hraness-design-chat-composer", className),
    onSubmit: handleSubmit,
    children: [
      /* @__PURE__ */ jsx6(TextAreaField, {
        ...placeholder === undefined ? {} : { placeholder },
        className: "hraness-design-chat-composer__field",
        isDisabled,
        label,
        onChange: onValueChange,
        showLabel: false,
        surface: "pane",
        textAreaProps: { rows: 2 },
        value
      }),
      /* @__PURE__ */ jsx6(Button, {
        className: "hraness-design-chat-composer__send",
        isDisabled: isDisabled || value.trim().length === 0,
        isPending,
        type: "submit",
        variant: "primary",
        children: sendLabel
      })
    ]
  });
}
// src/react/design-theme-context.tsx
import { createContext, useContext, useMemo } from "react";
import { jsx as jsx7 } from "react/jsx-runtime";
var DesignThemeContext = createContext({});
function DesignPortalThemeProvider({
  children,
  portalClassName,
  theme
}) {
  const value = useMemo(() => ({
    ...portalClassName === undefined ? {} : { portalClassName },
    ...theme === undefined ? {} : { theme }
  }), [portalClassName, theme]);
  return /* @__PURE__ */ jsx7(DesignThemeContext.Provider, {
    value,
    children
  });
}
function useDesignPortalTheme() {
  return useContext(DesignThemeContext).theme;
}
function useDesignPortalClassName() {
  return useContext(DesignThemeContext).portalClassName;
}
// src/react/design-gallery.tsx
import {
  Badge,
  Button as Button2,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon as Icon3,
  LinkButton,
  SegmentedControl as SegmentedControl2,
  Slider,
  Tag,
  ThemedSurface,
  ViewportFrame,
  WrappingRow
} from "@hraness/ui";
import { Chart01Icon, CodeIcon, DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { useState as useState2 } from "react";

// src/react/fader.tsx
import {
  Label,
  Slider as AriaSlider,
  SliderFill,
  SliderOutput,
  SliderThumb,
  SliderTrack
} from "react-aria-components";
import { cn as cn6 } from "@hraness/ui";
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
function Fader({
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
}) {
  return /* @__PURE__ */ jsxs6(AriaSlider, {
    ...props,
    className: cn6("hraness-design-fader", className),
    "data-density": density,
    orientation,
    ref: faderRef,
    children: [
      showLabel && labelAccessory !== undefined ? /* @__PURE__ */ jsxs6("div", {
        className: "hraness-design-fader__label-row",
        children: [
          /* @__PURE__ */ jsx8(Label, {
            className: "hraness-design-fader__label",
            children: label
          }),
          /* @__PURE__ */ jsx8("span", {
            className: "hraness-design-fader__label-accessory",
            children: labelAccessory
          })
        ]
      }) : showLabel ? /* @__PURE__ */ jsx8(Label, {
        className: "hraness-design-fader__label",
        children: label
      }) : /* @__PURE__ */ jsx8(Label, {
        className: "hraness-design-visually-hidden",
        children: label
      }),
      showOutput ? /* @__PURE__ */ jsx8(SliderOutput, {
        className: "hraness-design-fader__output"
      }) : null,
      /* @__PURE__ */ jsxs6(SliderTrack, {
        className: "hraness-design-fader__track",
        children: [
          /* @__PURE__ */ jsx8(SliderFill, {
            className: "hraness-design-fader__fill"
          }),
          /* @__PURE__ */ jsx8(SliderThumb, {
            className: "hraness-design-fader__thumb",
            ...inputRef === undefined ? {} : { inputRef }
          })
        ]
      })
    ]
  });
}

// src/react/jelly-surface.tsx
import {
  createElement,
  forwardRef,
  useCallback,
  useEffect as useEffect3,
  useRef as useRef2
} from "react";
import { cn as cn7 } from "@hraness/ui";

// src/react/jelly-runtime.ts
function createRetryableJellyRuntimeLoader(loader) {
  let runtime;
  return () => {
    runtime ??= loader().catch((error) => {
      runtime = undefined;
      throw error;
    });
    return runtime;
  };
}
var loadBrowserJellyRuntime = createRetryableJellyRuntimeLoader(() => import("../chunk-v6dxv8rs.js"));
var themeRequest = 0;
function loadJellyRuntime() {
  if (typeof window === "undefined")
    return null;
  return loadBrowserJellyRuntime();
}
async function ensureJellyRuntime() {
  try {
    await loadJellyRuntime();
  } catch {}
}
function applyJellyThemeMode(runtime, mode) {
  runtime.setThemeMode(mode);
}
async function setJellyThemeMode(mode) {
  if (typeof window === "undefined" || typeof document === "undefined")
    return false;
  const request = ++themeRequest;
  if (mode === "auto")
    document.documentElement.removeAttribute("data-jelly-mode");
  else
    document.documentElement.setAttribute("data-jelly-mode", mode);
  let runtime;
  try {
    runtime = await loadJellyRuntime();
  } catch {
    return false;
  }
  if (runtime === null || request !== themeRequest)
    return false;
  applyJellyThemeMode(runtime, mode);
  return true;
}

// src/react/jelly-surface.tsx
var JellyCard = "jelly-card";
function composeJellyCapture(consumer, internal) {
  return (event) => {
    consumer?.(event);
    if (!event.defaultPrevented)
      internal(event);
  };
}
function isJellySurfaceDisabled(target) {
  return target.matches("[data-disabled], [data-pending]");
}
function ownsJellyInteraction(host, target) {
  return target instanceof Element && target.closest(".hraness-design-jelly-surface") === host;
}
function bindJellyPointerRelease(target, pointerId, onRelease) {
  let active = true;
  const dispose = () => {
    if (!active)
      return;
    active = false;
    target.removeEventListener("blur", handleBlur);
    target.removeEventListener("pointercancel", handlePointerFinish);
    target.removeEventListener("pointerup", handlePointerFinish);
  };
  const finish = () => {
    if (!active)
      return;
    dispose();
    onRelease();
  };
  const handleBlur = () => finish();
  const handlePointerFinish = (event) => {
    const candidate = event;
    if (candidate.pointerId === pointerId)
      finish();
  };
  target.addEventListener("blur", handleBlur);
  target.addEventListener("pointercancel", handlePointerFinish);
  target.addEventListener("pointerup", handlePointerFinish);
  return dispose;
}
function assignRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}
var JellySurface = forwardRef(function JellySurface2({
  children,
  className,
  interaction = "passive",
  isDisabled = false,
  isPending = false,
  onBlurCapture,
  onFocusCapture,
  onInputCapture,
  onKeyDownCapture,
  onKeyUpCapture,
  onPointerDownCapture,
  onPointerEnter,
  onPointerLeave,
  onPointerMoveCapture,
  surfaceRef,
  tone = "neutral",
  ...props
}, forwardedRef) {
  const hostRef = useRef2(null);
  const activePointer = useRef2(null);
  const activeReleaseListeners = useRef2(null);
  const setHost = useCallback((host) => {
    hostRef.current = host;
    assignRef(surfaceRef, host);
    assignRef(forwardedRef, host);
  }, [forwardedRef, surfaceRef]);
  const release = useCallback(() => {
    activeReleaseListeners.current?.();
    activeReleaseListeners.current = null;
    activePointer.current = null;
    const host = hostRef.current;
    host?.removeAttribute("data-pressed");
    host?.releaseBody?.();
  }, []);
  useEffect3(() => {
    ensureJellyRuntime();
    return release;
  }, [release]);
  const handlePointerDown = (event) => {
    if (interaction === "passive" || activePointer.current !== null || !ownsJellyInteraction(event.currentTarget, event.target) || isJellySurfaceDisabled(event.currentTarget))
      return;
    activePointer.current = event.pointerId;
    const host = hostRef.current;
    host?.setAttribute("data-pressed", "true");
    host?.pressAt?.(event.clientX, event.clientY);
    activeReleaseListeners.current = bindJellyPointerRelease(globalThis, event.pointerId, release);
  };
  const handlePointerMove = (event) => {
    if (event.pointerId === activePointer.current) {
      hostRef.current?.moveAt?.(event.clientX, event.clientY);
    }
  };
  return createElement(JellyCard, {
    ...props,
    className: cn7("hraness-design-jelly-surface", className),
    "data-disabled": isDisabled ? "true" : undefined,
    "data-pending": isPending ? "true" : undefined,
    "data-interaction": interaction,
    "data-tone": tone,
    onBlurCapture: (event) => {
      onBlurCapture?.(event);
      if (!event.currentTarget.contains(event.relatedTarget)) {
        event.currentTarget.removeAttribute("data-focus-within");
        release();
      }
    },
    onFocusCapture: (event) => {
      onFocusCapture?.(event);
      event.currentTarget.setAttribute("data-focus-within", "true");
      if (ownsJellyInteraction(event.currentTarget, event.target) && !isJellySurfaceDisabled(event.currentTarget)) {
        hostRef.current?.centerPop?.(interaction === "field" ? 0.55 : 0.35);
      }
    },
    onInputCapture: (event) => {
      onInputCapture?.(event);
      if (interaction === "field" && ownsJellyInteraction(event.currentTarget, event.target) && !isJellySurfaceDisabled(event.currentTarget)) {
        hostRef.current?.centerPop?.(0.16);
      }
    },
    onKeyDownCapture: (event) => {
      onKeyDownCapture?.(event);
      if (interaction === "press" && !event.defaultPrevented && !event.repeat && ownsJellyInteraction(event.currentTarget, event.target) && !isJellySurfaceDisabled(event.currentTarget) && (event.key === "Enter" || event.key === " ")) {
        event.currentTarget.setAttribute("data-pressed", "true");
        hostRef.current?.centerPulse?.(1.12);
      }
    },
    onKeyUpCapture: (event) => {
      onKeyUpCapture?.(event);
      if (interaction === "press" && (event.key === "Enter" || event.key === " "))
        release();
    },
    onPointerDownCapture: composeJellyCapture(onPointerDownCapture, handlePointerDown),
    onPointerEnter: (event) => {
      onPointerEnter?.(event);
      if (!ownsJellyInteraction(event.currentTarget, event.target) || isJellySurfaceDisabled(event.currentTarget))
        return;
      event.currentTarget.setAttribute("data-hovered", "true");
      if (interaction !== "passive")
        hostRef.current?.centerPop?.(0.18);
    },
    onPointerLeave: (event) => {
      onPointerLeave?.(event);
      event.currentTarget.removeAttribute("data-hovered");
    },
    onPointerMoveCapture: composeJellyCapture(onPointerMoveCapture, handlePointerMove),
    ref: setHost
  }, children);
});

// src/react/navigation-rail.tsx
import {
  Link,
  cn as cn8
} from "@hraness/ui";
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
function NavigationRail({
  "aria-label": ariaLabel = "Primary navigation",
  children,
  className,
  footer,
  header,
  ...props
}) {
  return /* @__PURE__ */ jsxs7("aside", {
    ...props,
    "aria-label": ariaLabel,
    className: cn8("hraness-design-navigation-rail", className),
    children: [
      header === undefined ? null : /* @__PURE__ */ jsx9("header", {
        className: "hraness-design-navigation-rail__header",
        children: header
      }),
      /* @__PURE__ */ jsx9("nav", {
        "aria-label": ariaLabel,
        className: "hraness-design-navigation-rail__navigation",
        children
      }),
      footer === undefined ? null : /* @__PURE__ */ jsx9("footer", {
        className: "hraness-design-navigation-rail__footer",
        children: footer
      })
    ]
  });
}
function RailSection({
  children,
  className,
  title,
  titleAs = "h2",
  ...props
}) {
  const Heading = titleAs;
  return /* @__PURE__ */ jsxs7("section", {
    ...props,
    className: cn8("hraness-design-rail-section", className),
    children: [
      title === undefined ? null : /* @__PURE__ */ jsx9(Heading, {
        className: "hraness-design-rail-section__title",
        children: title
      }),
      /* @__PURE__ */ jsx9("div", {
        className: "hraness-design-rail-section__items",
        children
      })
    ]
  });
}
function RailItem({
  badge,
  className,
  description,
  href,
  icon,
  isActive = false,
  label,
  ...props
}) {
  return /* @__PURE__ */ jsxs7(Link, {
    ...props,
    "aria-current": isActive ? "page" : undefined,
    className: cn8("hraness-design-rail-item", className),
    href,
    children: [
      icon === undefined ? null : /* @__PURE__ */ jsx9("span", {
        "aria-hidden": "true",
        className: "hraness-design-rail-item__icon",
        children: icon
      }),
      /* @__PURE__ */ jsxs7("span", {
        className: "hraness-design-rail-item__copy",
        children: [
          /* @__PURE__ */ jsx9("span", {
            className: "hraness-design-rail-item__label",
            children: label
          }),
          description === undefined ? null : /* @__PURE__ */ jsx9("span", {
            className: "hraness-design-rail-item__description",
            children: description
          })
        ]
      }),
      badge === undefined ? null : /* @__PURE__ */ jsx9("span", {
        className: "hraness-design-rail-item__badge",
        children: badge
      })
    ]
  });
}

// src/react/playback-transport.tsx
import {
  PlayIcon,
  StopIcon
} from "@hugeicons/core-free-icons";
import { Icon as Icon2, IconButton as IconButton2, Spinner, Toolbar, cn as cn9 } from "@hraness/ui";
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
function PlaybackTransport({
  buttonAriaKeyShortcuts,
  buttonId,
  buttonRef,
  className,
  isPlayDisabled = false,
  onPlay,
  onStop,
  pendingLabel = "Cancel playback start",
  playLabel = "Play",
  status,
  stopLabel = "Stop",
  trailingControls,
  ...accessibleName
}) {
  const isPending = status === "pending";
  const isIdle = status === "idle";
  const commandLabel = isIdle ? playLabel : isPending ? pendingLabel : stopLabel;
  return /* @__PURE__ */ jsxs8(Toolbar, {
    ...accessibleName,
    className: cn9("hraness-design-playback-transport", className),
    "data-playback-status": status,
    children: [
      /* @__PURE__ */ jsx10(IconButton2, {
        "aria-busy": isPending || undefined,
        "aria-label": commandLabel,
        ...buttonAriaKeyShortcuts === undefined ? {} : { "aria-keyshortcuts": buttonAriaKeyShortcuts },
        ...buttonId === undefined ? {} : { id: buttonId },
        ...buttonRef === undefined ? {} : { buttonRef },
        className: "hraness-design-playback-transport__button",
        "data-playback-command": isIdle ? "play" : "stop",
        isDisabled: isIdle && isPlayDisabled,
        onPress: () => {
          if (isIdle) {
            if (!isPlayDisabled)
              onPlay();
            return;
          }
          onStop();
        },
        size: "large",
        variant: "primary",
        children: isPending ? /* @__PURE__ */ jsx10(Spinner, {}) : /* @__PURE__ */ jsx10(Icon2, {
          icon: isIdle ? PlayIcon : StopIcon,
          size: 24
        })
      }),
      trailingControls
    ]
  });
}

// src/react/production-data-preview-notice.tsx
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
function ProductionDataPreviewNotice({
  surfaceOrigin
}) {
  if (surfaceOrigin === undefined || surfaceOrigin === "")
    return null;
  return /* @__PURE__ */ jsxs9("aside", {
    "aria-label": "Production data preview warning",
    className: "hraness-design-production-data-preview-notice",
    role: "alert",
    children: [
      /* @__PURE__ */ jsx11("strong", {
        children: "Production data preview"
      }),
      /* @__PURE__ */ jsx11("span", {
        children: "This preview uses production data. Actions are real and affect production."
      })
    ]
  });
}

// src/react/theme.tsx
import {
  AppearanceIcon,
  IconButton as IconButton3,
  Menu,
  MenuItem,
  MenuTrigger,
  SegmentedControl,
  cn as cn10
} from "@hraness/ui";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import {
  useEffect as useEffect4,
  useSyncExternalStore
} from "react";
import { jsx as jsx12, jsxs as jsxs10, Fragment as Fragment2 } from "react/jsx-runtime";
var designThemes = ["light", "dark", "system"];
var defaultDesignTheme = "system";
var concreteThemes = ["light", "dark"];
var emptySubscribe = () => () => {
  return;
};
function isDesignTheme(value) {
  return typeof value === "string" && designThemes.some((theme) => theme === value);
}
function normalizeDesignTheme(value) {
  return isDesignTheme(value) ? value : defaultDesignTheme;
}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
function themeStorageGuardScript(storageKey) {
  const serializedKey = JSON.stringify(storageKey).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
  return `(()=>{try{const key=${serializedKey};const value=localStorage.getItem(key);if(value!==null&&value!=="light"&&value!=="dark"&&value!=="system")localStorage.setItem(key,"${defaultDesignTheme}")}catch{}})();`;
}
function PersistedThemeNormalizer() {
  const { setTheme, theme } = useTheme();
  useEffect4(() => {
    if (theme !== undefined && !isDesignTheme(theme))
      setTheme(defaultDesignTheme);
  }, [setTheme, theme]);
  return null;
}
function JellyThemeSync() {
  const { resolvedTheme } = useTheme();
  useEffect4(() => {
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      setJellyThemeMode(resolvedTheme);
    }
  }, [resolvedTheme]);
  return null;
}
function PortalThemeBridge({
  children,
  forcedTheme
}) {
  const { resolvedTheme } = useTheme();
  const portalTheme = resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : forcedTheme;
  return /* @__PURE__ */ jsx12(DesignPortalThemeProvider, {
    theme: portalTheme,
    children
  });
}
function DesignThemeProvider({
  children,
  forcedTheme,
  nonce,
  storageKey = "hraness-design-theme-v1"
}) {
  return /* @__PURE__ */ jsxs10(Fragment2, {
    children: [
      forcedTheme === undefined ? /* @__PURE__ */ jsx12("script", {
        ...nonce === undefined ? {} : { nonce },
        "data-hraness-design-theme-guard": "",
        dangerouslySetInnerHTML: { __html: themeStorageGuardScript(storageKey) },
        suppressHydrationWarning: true
      }) : null,
      /* @__PURE__ */ jsxs10(NextThemeProvider, {
        ...nonce === undefined ? {} : { nonce },
        attribute: "data-theme",
        defaultTheme: forcedTheme ?? defaultDesignTheme,
        disableTransitionOnChange: true,
        enableSystem: forcedTheme === undefined,
        forcedTheme,
        storageKey,
        themes: [...concreteThemes],
        children: [
          forcedTheme === undefined ? /* @__PURE__ */ jsx12(PersistedThemeNormalizer, {}) : null,
          /* @__PURE__ */ jsx12(JellyThemeSync, {}),
          /* @__PURE__ */ jsx12(PortalThemeBridge, {
            forcedTheme,
            children
          })
        ]
      })
    ]
  });
}
function themeToggleLabel(id, labels) {
  return labels?.[id] ?? `${id[0]?.toUpperCase() ?? ""}${id.slice(1)}`;
}
function themeToggleItems(labels) {
  return [
    { id: "light", label: themeToggleLabel("light", labels) },
    { id: "dark", label: themeToggleLabel("dark", labels) },
    { id: "system", label: themeToggleLabel("system", labels) }
  ];
}
function themeToggleIcon(id) {
  return /* @__PURE__ */ jsx12(AppearanceIcon, {
    name: id
  });
}
function themeToggleIconItems(labels) {
  return [
    {
      ariaLabel: themeToggleLabel("light", labels),
      id: "light",
      label: themeToggleIcon("light")
    },
    {
      ariaLabel: themeToggleLabel("dark", labels),
      id: "dark",
      label: themeToggleIcon("dark")
    },
    {
      ariaLabel: themeToggleLabel("system", labels),
      id: "system",
      label: themeToggleIcon("system")
    }
  ];
}
function ThemeToggle({
  "aria-label": ariaLabel = "Appearance",
  className,
  display = "icons",
  labels,
  onChange,
  presentation = "segmented",
  size = "compact",
  value: controlledValue
}) {
  const hydrated = useHydrated();
  const { setTheme, theme } = useTheme();
  const controlled = controlledValue !== undefined;
  const ready = controlled || hydrated;
  const value = controlledValue ?? (hydrated ? normalizeDesignTheme(theme) : defaultDesignTheme);
  const items = display === "icons" ? themeToggleIconItems(labels) : themeToggleItems(labels);
  const changeTheme = (nextTheme) => {
    if (controlled)
      onChange?.(nextTheme);
    else
      setTheme(nextTheme);
  };
  const currentLabel = themeToggleLabel(value, labels);
  return /* @__PURE__ */ jsx12("div", {
    "aria-busy": !ready || undefined,
    className: cn10("hraness-design-theme-toggle", className),
    "data-display": presentation === "menu" ? "icons" : display,
    "data-presentation": presentation,
    "data-ready": ready ? "true" : "false",
    "data-theme-value": value,
    children: presentation === "menu" ? /* @__PURE__ */ jsxs10(MenuTrigger, {
      children: [
        /* @__PURE__ */ jsx12(IconButton3, {
          "aria-label": `${ariaLabel}: ${currentLabel}`,
          isDisabled: !ready,
          size,
          tooltip: `${ariaLabel}: ${currentLabel}`,
          children: themeToggleIcon(value)
        }),
        /* @__PURE__ */ jsx12(Menu, {
          "aria-label": ariaLabel,
          className: "hraness-design-theme-toggle__menu",
          disallowEmptySelection: true,
          onAction: (key) => {
            if (isDesignTheme(key))
              changeTheme(key);
          },
          popoverClassName: "hraness-design-theme-toggle__popover",
          selectedKeys: [value],
          selectionMode: "single",
          children: designThemes.map((id) => /* @__PURE__ */ jsx12(MenuItem, {
            "data-theme-value": id,
            id,
            leading: themeToggleIcon(id),
            textValue: themeToggleLabel(id, labels),
            children: themeToggleLabel(id, labels)
          }, id))
        })
      ]
    }) : /* @__PURE__ */ jsx12(SegmentedControl, {
      "aria-label": ariaLabel,
      isDisabled: !ready,
      items,
      onChange: changeTheme,
      size,
      value
    })
  });
}
function themeColorFor(resolvedTheme, values) {
  return resolvedTheme === "dark" ? values.dark : values.light;
}
function ThemeColorSync({
  darkColor = colors.dark.background,
  lightColor = colors.light.background,
  metaName = "theme-color"
}) {
  const { resolvedTheme } = useTheme();
  useEffect4(() => {
    const existing = Array.from(document.head.querySelectorAll("meta[name]")).find((meta2) => meta2.name === metaName && !meta2.hasAttribute("media"));
    const meta = existing ?? document.createElement("meta");
    if (existing === undefined) {
      meta.name = metaName;
      document.head.append(meta);
    }
    meta.content = themeColorFor(resolvedTheme, { dark: darkColor, light: lightColor });
  }, [darkColor, lightColor, metaName, resolvedTheme]);
  return null;
}

// src/react/design-gallery.tsx
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
var designGallerySections = [
  { id: "foundation", label: "Foundation" },
  { id: "shells", label: "Shells" },
  { id: "data", label: "Data" },
  { id: "effects", label: "Effects" },
  { id: "syntax", label: "Syntax" }
];
var designGalleryTouchKinds = [
  "button",
  "link",
  "radio",
  "range"
];
var designGalleryRecipeCoverage = [
  "@hraness/ui primitives",
  "application shells",
  "charts",
  "Jelly presentation",
  "plain site and publication grammar",
  "procedural effects",
  "production preview notice",
  "syntax highlighting"
];
function resolveGalleryTheme(theme, prefersDark) {
  return theme === "system" ? prefersDark ? "dark" : "light" : theme;
}
var barData = [
  { id: "alpha", label: "Alpha", value: 72, detail: "72 requests" },
  { id: "beta", label: "Beta", value: 48, detail: "48 requests" },
  { id: "gamma", label: "Gamma", value: 31, detail: "31 requests" }
];
var rangeData = [
  { id: "north", label: "North", minimum: 24, median: 51, maximum: 78 },
  { id: "south", label: "South", minimum: 38, median: 64, maximum: 82 }
];
function DesignSystemGallery({
  isNestedInMain = false
}) {
  const [density, setDensity] = useState2("default");
  const [faderValue, setFaderValue] = useState2(64);
  const [playbackStatus, setPlaybackStatus] = useState2("idle");
  const Root = isNestedInMain ? "div" : "main";
  return /* @__PURE__ */ jsxs11(Root, {
    className: "design-gallery",
    "data-design-gallery": "public",
    children: [
      /* @__PURE__ */ jsxs11("header", {
        className: "design-gallery__intro",
        children: [
          /* @__PURE__ */ jsx13(Badge, {
            tone: "info",
            children: "@hraness/design-kit"
          }),
          /* @__PURE__ */ jsx13("h1", {
            children: "Presentation and composition reference"
          }),
          /* @__PURE__ */ jsx13("p", {
            children: "Portable controls come from @hraness/ui. This package adds application shells, charts, effects, syntax, haptics, and optional Jelly paint."
          }),
          /* @__PURE__ */ jsx13("p", {
            children: "System follows your device on the first visit. Choosing Light, Dark, or System saves that preference."
          }),
          /* @__PURE__ */ jsxs11(WrappingRow, {
            children: [
              /* @__PURE__ */ jsx13(ThemeToggle, {
                presentation: "segmented"
              }),
              /* @__PURE__ */ jsx13(SegmentedControl2, {
                "aria-label": "Gallery density",
                items: [
                  { id: "compact", label: "Compact" },
                  { id: "default", label: "Default" }
                ],
                onChange: setDensity,
                size: "compact",
                value: density
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsxs11("section", {
        className: "design-gallery__section",
        id: "foundation",
        children: [
          /* @__PURE__ */ jsx13("h2", {
            children: "Foundation boundary"
          }),
          /* @__PURE__ */ jsx13(ProductionDataPreviewNotice, {
            surfaceOrigin: "https://preview.example.test"
          }),
          /* @__PURE__ */ jsxs11("div", {
            className: "design-gallery__grid",
            children: [
              /* @__PURE__ */ jsxs11(Card, {
                children: [
                  /* @__PURE__ */ jsxs11(CardHeader, {
                    children: [
                      /* @__PURE__ */ jsx13(CardTitle, {
                        children: "Portable control"
                      }),
                      /* @__PURE__ */ jsx13(CardDescription, {
                        children: "Rendered directly by @hraness/ui."
                      })
                    ]
                  }),
                  /* @__PURE__ */ jsx13(CardContent, {
                    children: /* @__PURE__ */ jsxs11(WrappingRow, {
                      children: [
                        /* @__PURE__ */ jsx13(Button2, {
                          variant: "primary",
                          children: "Primary action"
                        }),
                        /* @__PURE__ */ jsx13(LinkButton, {
                          href: "#shells",
                          children: "Open shells"
                        }),
                        /* @__PURE__ */ jsx13(Tag, {
                          variant: "outline",
                          children: "public core"
                        })
                      ]
                    })
                  })
                ]
              }),
              /* @__PURE__ */ jsx13(JellySurface, {
                className: "design-gallery__jelly",
                interaction: "press",
                tone: "neutral",
                children: /* @__PURE__ */ jsx13(Button2, {
                  variant: "quiet",
                  children: "Semantic button with optional Jelly paint"
                })
              })
            ]
          }),
          /* @__PURE__ */ jsxs11("div", {
            "aria-label": "Plain site link presentation",
            className: "design-gallery__plain-theme plain-site plain-publication",
            children: [
              /* @__PURE__ */ jsx13("header", {
                className: "plain-header",
                children: /* @__PURE__ */ jsxs11("div", {
                  className: "plain-header__inner",
                  "data-layout": "responsive-wrap",
                  children: [
                    /* @__PURE__ */ jsx13("a", {
                      className: "plain-wordmark",
                      href: "#foundation",
                      children: "project-name.example"
                    }),
                    /* @__PURE__ */ jsxs11("nav", {
                      "aria-label": "Plain site example",
                      className: "plain-nav",
                      children: [
                        /* @__PURE__ */ jsx13("a", {
                          href: "#foundation",
                          children: "Articles"
                        }),
                        /* @__PURE__ */ jsx13("a", {
                          href: "#shells",
                          children: "About"
                        })
                      ]
                    })
                  ]
                })
              }),
              /* @__PURE__ */ jsx13("div", {
                className: "plain-page",
                children: /* @__PURE__ */ jsxs11("p", {
                  className: "design-gallery__plain-link-example",
                  children: [
                    "Ordinary ",
                    /* @__PURE__ */ jsx13("a", {
                      href: "#foundation",
                      children: "blue links"
                    }),
                    " stay quiet until interaction."
                  ]
                })
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsxs11("section", {
        className: "design-gallery__section",
        id: "shells",
        children: [
          /* @__PURE__ */ jsx13("h2", {
            children: "Application shells"
          }),
          /* @__PURE__ */ jsx13(ViewportFrame, {
            className: "design-gallery__shell-preview",
            children: /* @__PURE__ */ jsx13(AppShell, {
              navigationKey: "gallery",
              rail: /* @__PURE__ */ jsx13(NavigationRail, {
                children: /* @__PURE__ */ jsxs11(RailSection, {
                  title: "Workspace",
                  children: [
                    /* @__PURE__ */ jsx13(RailItem, {
                      href: "#foundation",
                      icon: /* @__PURE__ */ jsx13(Icon3, {
                        icon: DashboardSquare01Icon
                      }),
                      isActive: true,
                      label: "Overview"
                    }),
                    /* @__PURE__ */ jsx13(RailItem, {
                      href: "#data",
                      icon: /* @__PURE__ */ jsx13(Icon3, {
                        icon: Chart01Icon
                      }),
                      label: "Data"
                    }),
                    /* @__PURE__ */ jsx13(RailItem, {
                      href: "#syntax",
                      icon: /* @__PURE__ */ jsx13(Icon3, {
                        icon: CodeIcon
                      }),
                      label: "Syntax"
                    })
                  ]
                })
              }),
              topBar: /* @__PURE__ */ jsx13(TopBar, {
                title: "Reference workspace"
              }),
              children: /* @__PURE__ */ jsx13(PageCanvas, {
                as: "div",
                children: /* @__PURE__ */ jsx13(AnimatedRailStage, {
                  stageKey: density,
                  children: /* @__PURE__ */ jsxs11(ThemedSurface, {
                    as: "section",
                    tone: "card",
                    children: [
                      /* @__PURE__ */ jsxs11("h3", {
                        children: [
                          density === "compact" ? "Compact" : "Default",
                          " composition"
                        ]
                      }),
                      /* @__PURE__ */ jsx13("p", {
                        children: "The route body changes while persistent navigation remains in place."
                      })
                    ]
                  })
                })
              })
            })
          })
        ]
      }),
      /* @__PURE__ */ jsxs11("section", {
        className: "design-gallery__section",
        id: "data",
        children: [
          /* @__PURE__ */ jsx13("h2", {
            children: "Data and instrument compositions"
          }),
          /* @__PURE__ */ jsxs11("div", {
            className: "design-gallery__grid",
            children: [
              /* @__PURE__ */ jsx13(BarListChart, {
                "aria-label": "Example request volume",
                data: barData
              }),
              /* @__PURE__ */ jsx13(RangePlotChart, {
                "aria-label": "Example regional ranges",
                data: rangeData
              }),
              /* @__PURE__ */ jsxs11("div", {
                className: "design-gallery__instrument",
                children: [
                  /* @__PURE__ */ jsx13(Fader, {
                    "aria-label": "Example level",
                    className: "design-gallery__vertical-fader",
                    density: "compact",
                    label: "Level",
                    maxValue: 100,
                    minValue: 0,
                    onChange: setFaderValue,
                    showLabel: true,
                    showOutput: true,
                    value: faderValue
                  }),
                  /* @__PURE__ */ jsx13(Fader, {
                    "aria-label": "Example horizontal level",
                    className: "design-gallery__horizontal-fader",
                    density: "compact",
                    label: "Horizontal level",
                    maxValue: 100,
                    minValue: 0,
                    onChange: setFaderValue,
                    orientation: "horizontal",
                    showLabel: true,
                    showOutput: true,
                    value: faderValue
                  }),
                  /* @__PURE__ */ jsx13(Slider, {
                    label: "Balance",
                    maxValue: 100,
                    minValue: 0,
                    value: 50
                  }),
                  /* @__PURE__ */ jsx13(PlaybackTransport, {
                    "aria-label": "Preview transport",
                    onPlay: () => setPlaybackStatus("playing"),
                    onStop: () => setPlaybackStatus("idle"),
                    status: playbackStatus
                  })
                ]
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsxs11("section", {
        className: "design-gallery__section",
        id: "effects",
        children: [
          /* @__PURE__ */ jsx13("h2", {
            children: "Decorative effects"
          }),
          /* @__PURE__ */ jsxs11("div", {
            className: "design-gallery__effect",
            children: [
              /* @__PURE__ */ jsx13(AuroraDotsBackground, {}),
              /* @__PURE__ */ jsx13(ProceduralBackdrop, {
                seed: "public-gallery",
                variant: "composite"
              }),
              /* @__PURE__ */ jsxs11("div", {
                className: "design-gallery__effect-copy",
                children: [
                  /* @__PURE__ */ jsx13("h3", {
                    children: "Semantic content stays ordinary DOM"
                  }),
                  /* @__PURE__ */ jsx13("p", {
                    children: "Decorative paint is pointer-transparent and removable in forced colors."
                  })
                ]
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsxs11("section", {
        className: "design-gallery__section",
        id: "syntax",
        children: [
          /* @__PURE__ */ jsx13("h2", {
            children: "Server syntax"
          }),
          /* @__PURE__ */ jsx13("pre", {
            className: "design-gallery__syntax",
            children: /* @__PURE__ */ jsx13(SyntaxCode, {
              code: `import { AppShell } from "@hraness/design-kit/react";

export const shell = <AppShell rail={null}>Content</AppShell>;`,
              language: "typescript"
            })
          })
        ]
      })
    ]
  });
}
// src/react/haptics.ts
import { useCallback as useCallback2, useEffect as useEffect5 } from "react";
var HAPTIC_FEEDBACK_EVENT_NAME = "hraness-design:haptic-feedback";
function isHapticBrowserEnvironment(environment = globalThis) {
  return typeof environment.window === "object" && typeof environment.document === "object" && typeof environment.navigator === "object";
}
function hapticInputForFeedback(feedback) {
  switch (feedback) {
    case "error":
      return "error";
    case "press":
      return "medium";
    case "selection":
      return "selection";
    case "success":
      return "success";
    case "warning":
      return "warning";
  }
}
function hasCustomEventConstructor(candidate) {
  return typeof candidate === "object" && candidate !== null && "CustomEvent" in candidate && typeof candidate.CustomEvent === "function";
}
function hasEventDispatcher(candidate) {
  return typeof candidate === "object" && candidate !== null && "dispatchEvent" in candidate && typeof candidate.dispatchEvent === "function";
}
function dispatchHapticFeedbackEvent(environment, detail) {
  if (!hasCustomEventConstructor(environment.window) || !hasEventDispatcher(environment.document))
    return;
  try {
    environment.document.dispatchEvent(new environment.window.CustomEvent(HAPTIC_FEEDBACK_EVENT_NAME, { detail }));
  } catch {}
}
function cancelAndDestroy(candidate) {
  try {
    candidate.cancel();
  } catch {}
  try {
    candidate.destroy();
  } catch {}
}
function createHapticFeedbackController(environment, loadModule) {
  let engine = null;
  let enginePromise = null;
  let engineGeneration = 0;
  const loadEngine = async () => {
    if (!isHapticBrowserEnvironment(environment))
      return null;
    if (engine !== null)
      return engine;
    if (enginePromise !== null)
      return enginePromise;
    const generation = engineGeneration;
    const pendingEngine = loadModule().then(({ WebHaptics }) => {
      if (!isHapticBrowserEnvironment(environment))
        return null;
      const candidate = new WebHaptics({ debug: false, showSwitch: false });
      if (generation !== engineGeneration) {
        cancelAndDestroy(candidate);
        return null;
      }
      engine = candidate;
      return candidate;
    }).catch(() => null);
    enginePromise = pendingEngine;
    pendingEngine.finally(() => {
      if (enginePromise === pendingEngine)
        enginePromise = null;
    });
    return pendingEngine;
  };
  return {
    cancel() {
      if (engine === null)
        return false;
      try {
        engine.cancel();
        return true;
      } catch {
        return false;
      }
    },
    dispose() {
      engineGeneration += 1;
      const activeEngine = engine;
      engine = null;
      enginePromise = null;
      if (activeEngine !== null)
        cancelAndDestroy(activeEngine);
    },
    async prepare() {
      return await loadEngine() !== null;
    },
    async trigger(feedback = "press") {
      try {
        const activeEngine = await loadEngine();
        if (activeEngine === null)
          return false;
        const input = hapticInputForFeedback(feedback);
        await activeEngine.trigger(input);
        dispatchHapticFeedbackEvent(environment, { feedback, input });
        return true;
      } catch {
        return false;
      }
    }
  };
}
var browserHaptics = createHapticFeedbackController(globalThis, async () => {
  const { WebHaptics } = await import("web-haptics");
  return { WebHaptics };
});
async function prepareHapticFeedback() {
  return await browserHaptics.prepare();
}
async function triggerHapticFeedback(feedback = "press") {
  return await browserHaptics.trigger(feedback);
}
function cancelHapticFeedback() {
  return browserHaptics.cancel();
}
function disposeHapticFeedback() {
  browserHaptics.dispose();
}
function useHapticFeedback(enabled = true) {
  useEffect5(() => {
    if (enabled)
      prepareHapticFeedback();
  }, [enabled]);
  return useCallback2(async (feedback = "press") => enabled ? await triggerHapticFeedback(feedback) : false, [enabled]);
}
// src/react/keyboard-shortcuts.ts
import { useEffect as useEffect6, useRef as useRef3 } from "react";
var interactiveTargetSelector = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "summary",
  "textarea",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='button']",
  "[role='checkbox']",
  "[role='combobox']",
  "[role='gridcell']",
  "[role='link']",
  "[role='menuitem']",
  "[role='option']",
  "[role='radio']",
  "[role='slider']",
  "[role='spinbutton']",
  "[role='switch']",
  "[role='tab']",
  "[role='textbox']",
  "[tabindex]:not([tabindex='-1'])"
].join(",");
var textEntryTargetSelector = [
  "input:not([type='button']):not([type='checkbox']):not([type='color']):not([type='file']):not([type='hidden']):not([type='image']):not([type='radio']):not([type='range']):not([type='reset']):not([type='submit'])",
  "select",
  "textarea",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='combobox']",
  "[role='textbox']"
].join(",");
function hasClosest(target) {
  return target !== null && "closest" in target && typeof target.closest === "function";
}
function isKeyboardInteractionTarget(target) {
  return hasClosest(target) && target.closest(interactiveTargetSelector) !== null;
}
function isKeyboardTextEntryTarget(target) {
  return hasClosest(target) && target.closest(textEntryTargetSelector) !== null;
}
function normalizedKey(key) {
  switch (key) {
    case "Esc":
      return "Escape";
    case "Left":
      return "ArrowLeft";
    case "Right":
      return "ArrowRight";
    case "Up":
      return "ArrowUp";
    case "Down":
      return "ArrowDown";
    case "Space":
    case "Spacebar":
      return " ";
    default:
      return key.length === 1 ? key.toLocaleLowerCase("en-US") : key;
  }
}
function matchesKeyboardShortcut(event, shortcut) {
  return normalizedKey(event.key) === normalizedKey(shortcut.key) && event.altKey === (shortcut.altKey ?? false) && event.ctrlKey === (shortcut.ctrlKey ?? false) && event.metaKey === (shortcut.metaKey ?? false) && event.shiftKey === (shortcut.shiftKey ?? false);
}
function decideKeyboardShortcut(shortcuts, event, context = {}) {
  if (context.isDisabled === true)
    return { kind: "ignore", reason: "disabled" };
  if (event.defaultPrevented)
    return { kind: "ignore", reason: "default-prevented" };
  if (event.isComposing)
    return { kind: "ignore", reason: "composing" };
  let suppressedReason = null;
  for (const [bindingIndex, shortcut] of shortcuts.entries()) {
    if (shortcut.isDisabled === true || !matchesKeyboardShortcut(event, shortcut))
      continue;
    if (event.repeat && shortcut.allowRepeat !== true) {
      suppressedReason ??= "repeat";
      continue;
    }
    if (context.isEditableTarget === true && shortcut.allowWhenEditable !== true) {
      suppressedReason ??= "editable-target";
      continue;
    }
    if (context.isInteractiveTarget === true && context.isEditableTarget !== true && shortcut.allowWhenInteractive !== true && shortcut.allowWhenInteractiveTarget?.(context.target ?? null) !== true) {
      suppressedReason ??= "interactive-target";
      continue;
    }
    return { bindingId: shortcut.id, bindingIndex, kind: "handle" };
  }
  return { kind: "ignore", reason: suppressedReason ?? "no-match" };
}
function isNode(target) {
  return target !== null && typeof Node !== "undefined" && target instanceof Node;
}
function useKeyboardShortcuts(bindings, options = {}) {
  const latestRef = useRef3({ bindings, isDisabled: options.isDisabled ?? false });
  latestRef.current = { bindings, isDisabled: options.isDisabled ?? false };
  const scopeRef = options.scopeRef;
  useEffect6(() => {
    const onKeyDown = (event) => {
      if (scopeRef !== undefined) {
        const scope = scopeRef.current;
        if (scope === null || !isNode(event.target) || !scope.contains(event.target))
          return;
      }
      const current = latestRef.current;
      const decision = decideKeyboardShortcut(current.bindings, event, {
        isDisabled: current.isDisabled,
        isEditableTarget: isKeyboardTextEntryTarget(event.target),
        isInteractiveTarget: isKeyboardInteractionTarget(event.target),
        target: event.target
      });
      if (decision.kind === "ignore")
        return;
      event.preventDefault();
      current.bindings[decision.bindingIndex]?.onAction(event);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [scopeRef]);
}
// src/react/route-state.tsx
import {
  Button as Button3,
  EmptyState,
  LinkButton as LinkButton2,
  Skeleton,
  Spinner as Spinner2
} from "@hraness/ui";
import { useEffect as useEffect7, useId as useId2 } from "react";
import { jsx as jsx14, jsxs as jsxs12, Fragment as Fragment3 } from "react/jsx-runtime";
function RouteActions({ children }) {
  return /* @__PURE__ */ jsx14("div", {
    className: "hraness-design-route-state__actions",
    children
  });
}
function RouteNotFoundPage({
  canvasAs = "main",
  showThemeToggle = true,
  titleAs = "h1"
} = {}) {
  return /* @__PURE__ */ jsx14(PageCanvas, {
    as: canvasAs,
    className: "hraness-design-route-state",
    children: /* @__PURE__ */ jsx14(EmptyState, {
      action: /* @__PURE__ */ jsxs12(RouteActions, {
        children: [
          /* @__PURE__ */ jsx14(LinkButton2, {
            href: "/",
            variant: "primary",
            children: "Return home"
          }),
          showThemeToggle ? /* @__PURE__ */ jsx14(ThemeToggle, {}) : null
        ]
      }),
      description: "The address may be out of date, or this page may have moved.",
      icon: /* @__PURE__ */ jsx14("span", {
        "aria-hidden": "true",
        children: "404"
      }),
      title: "Page not found",
      titleAs
    })
  });
}
function RouteErrorPage({
  announce = true,
  autoFocus = true,
  canvasAs = "main",
  error,
  reset,
  showThemeToggle = true,
  titleAs = "h1"
}) {
  const focusId = `${useId2()}-route-error`;
  useEffect7(() => {
    if (autoFocus)
      document.getElementById(focusId)?.focus();
  }, [autoFocus, error, focusId]);
  return /* @__PURE__ */ jsx14(PageCanvas, {
    "aria-label": "This view could not load",
    "aria-live": announce ? "assertive" : undefined,
    as: canvasAs,
    className: "hraness-design-route-state",
    id: focusId,
    tabIndex: -1,
    children: /* @__PURE__ */ jsx14(EmptyState, {
      action: /* @__PURE__ */ jsxs12(RouteActions, {
        children: [
          /* @__PURE__ */ jsx14(Button3, {
            onPress: reset,
            variant: "primary",
            children: "Try again"
          }),
          /* @__PURE__ */ jsx14(LinkButton2, {
            href: "/",
            children: "Return home"
          }),
          showThemeToggle ? /* @__PURE__ */ jsx14(ThemeToggle, {}) : null
        ]
      }),
      description: "Retry this view, or return home and continue from there.",
      icon: /* @__PURE__ */ jsx14("span", {
        "aria-hidden": "true",
        children: "!"
      }),
      title: "This view could not load",
      titleAs
    })
  });
}
function RouteLoadingPage({
  announce = true,
  canvasAs = "main"
} = {}) {
  return /* @__PURE__ */ jsx14(PageCanvas, {
    "aria-busy": announce ? "true" : undefined,
    as: canvasAs,
    className: "hraness-design-route-state",
    children: /* @__PURE__ */ jsxs12("section", {
      className: "hraness-design-route-state__loading",
      role: announce ? "status" : undefined,
      children: [
        /* @__PURE__ */ jsxs12("div", {
          className: "hraness-design-route-state__loading-title",
          children: [
            /* @__PURE__ */ jsx14(Spinner2, {}),
            /* @__PURE__ */ jsx14("strong", {
              children: "Loading page"
            })
          ]
        }),
        /* @__PURE__ */ jsxs12("div", {
          "aria-hidden": "true",
          className: "hraness-design-route-state__skeletons",
          children: [
            /* @__PURE__ */ jsx14(Skeleton, {
              height: "1rem",
              isText: true,
              width: "88%"
            }),
            /* @__PURE__ */ jsx14(Skeleton, {
              height: "1rem",
              isText: true,
              width: "64%"
            }),
            /* @__PURE__ */ jsx14(Skeleton, {
              height: "8rem",
              width: "100%"
            })
          ]
        })
      ]
    })
  });
}
function GlobalErrorDocument({
  bodyClassName,
  diagnostics,
  theme = defaultDesignTheme,
  ...props
}) {
  const content = /* @__PURE__ */ jsxs12(Fragment3, {
    children: [
      diagnostics,
      /* @__PURE__ */ jsx14(RouteErrorPage, {
        ...props,
        showThemeToggle: false
      })
    ]
  });
  return /* @__PURE__ */ jsx14("html", {
    "data-theme": theme === "system" ? "light" : theme,
    lang: "en",
    suppressHydrationWarning: true,
    children: /* @__PURE__ */ jsx14("body", {
      className: bodyClassName,
      children: theme === "system" ? /* @__PURE__ */ jsxs12(DesignThemeProvider, {
        children: [
          /* @__PURE__ */ jsx14(ThemeColorSync, {}),
          content
        ]
      }) : content
    })
  });
}
export {
  useKeyboardShortcuts,
  useHapticFeedback,
  useDesignPortalTheme,
  useDesignPortalClassName,
  triggerHapticFeedback,
  themeToggleItems,
  themeColorFor,
  resolveGalleryTheme,
  railStageMotion,
  proceduralRecipeVersion,
  proceduralBackdropVariants,
  prepareHapticFeedback,
  normalizeDesignTheme,
  matchesKeyboardShortcut,
  isKeyboardTextEntryTarget,
  isKeyboardInteractionTarget,
  isJellySurfaceDisabled,
  isHapticBrowserEnvironment,
  isDesignTheme,
  hapticInputForFeedback,
  disposeHapticFeedback,
  designThemes,
  designGalleryTouchKinds,
  designGallerySections,
  designGalleryRecipeCoverage,
  defaultDesignTheme,
  decideKeyboardShortcut,
  createProceduralBackdropRecipe,
  createParticleHaloRecipe,
  createHapticFeedbackController,
  composeJellyCapture,
  cancelHapticFeedback,
  bindJellyPointerRelease,
  TopBar,
  ThemeToggle,
  ThemeColorSync,
  SyntaxCode,
  RouteNotFoundPage,
  RouteLoadingPage,
  RouteErrorPage,
  RangePlotChart,
  RailSection,
  RailItem,
  RadarProfileChart,
  ProductionDataPreviewNotice,
  ProceduralBackdrop,
  PlaybackTransport,
  PhaserDots,
  ParticleHalo,
  PageCanvas,
  NavigationRail,
  JellySurface,
  HAPTIC_FEEDBACK_EVENT_NAME,
  GlobalErrorDocument,
  Fader,
  DockedFooter,
  DitherSurface,
  DesignThemeProvider,
  DesignSystemGallery,
  DesignPortalThemeProvider,
  ChatMessage,
  ChatComposer,
  BottomBar,
  BarListChart,
  AuroraDotsBackground,
  AppShell,
  AnimatedRailStage
};
