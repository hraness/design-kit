"use client";
import {
  colors,
  defaultDesignTheme,
  designThemeLabel,
  designThemeStorageKey,
  designThemes,
  isDesignTheme,
  motion,
  normalizeDesignTheme
} from "../chunk-vy764dh1.js";
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
} from "../chunk-cdje4gw1.js";
import"../chunk-djxa5bgc.js";
import {
  __require
} from "../chunk-5gtx3pza.js";

// src/react/animated-rail-stage.tsx
import { AnimatePresence, motion as Motion, useReducedMotion } from "motion/react";
import * as stylex from "@stylexjs/stylex";
import { cn } from "@hraness/ui";

// src/react/animated-rail-stage.stylex.ts
var animatedRailStageStyles = {
  root: {
    kdYMnH: "xesnm00",
    k3aq6I: "x9jhkrq",
    kmkexE: "x82x5i2",
    $$css: true
  }
};

// src/react/animated-rail-stage.tsx
import { jsx } from "react/jsx-runtime";
function railStageMotion(reduceMotion) {
  const duration = reduceMotion ? 0 : motion.duration.standard / 1000;
  return {
    animate: {
      opacity: 1,
      x: 0
    },
    exit: {
      opacity: 0,
      x: reduceMotion ? 0 : -motion.distance.railExit
    },
    initial: {
      opacity: reduceMotion ? 1 : 0,
      x: reduceMotion ? 0 : motion.distance.railEnter
    },
    transition: {
      duration,
      ease: "easeOut"
    }
  };
}
function AnimatedRailStage({
  children,
  className,
  stageKey
}) {
  const reduceMotion = useReducedMotion();
  const stageMotion = railStageMotion(reduceMotion ?? false);
  const presentation = stylex.props(animatedRailStageStyles.root);
  return /* @__PURE__ */ jsx(AnimatePresence, {
    initial: false,
    mode: "wait",
    children: /* @__PURE__ */ jsx(Motion.div, {
      animate: stageMotion.animate,
      className: cn("hraness-design-animated-rail-stage", presentation.className, className),
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
  ...props2
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
    ...props2,
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
  ...props2
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (isDisabled || isPending || value.trim().length === 0)
      return;
    onSubmit();
  };
  return /* @__PURE__ */ jsxs5("form", {
    ...props2,
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
  SegmentedControl,
  Slider,
  Tag,
  ViewportFrame,
  WrappingRow
} from "@hraness/ui";
import { Chart01Icon, CodeIcon, DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { useState as useState2 } from "react";

// src/react/fader.tsx
import { Label, Slider as AriaSlider, SliderFill, SliderOutput, SliderThumb, SliderTrack } from "react-aria-components";
import * as stylex2 from "@stylexjs/stylex";
import { cn as cn6 } from "@hraness/ui";

// src/react/fader.stylex.ts
var faderStyles = {
  caption: {
    kGuDYH: "xaasd0c",
    $$css: true
  },
  compact: {
    "--hraness-design-fader-thumb-block-size": "x157jks9",
    "--hraness-design-fader-thumb-inline-size": "x11jzih6",
    "--hraness-design-fader-track-length": "x1jd1xi1",
    $$css: true
  },
  fillRail: {
    kWkggS: "x8qxh4v",
    kLWsYc: "xuxy95z",
    kctUWg: "xuufnwz",
    $$css: true
  },
  focusVisible: {
    kjBf7l: "x1ozvyeg",
    kInvED: "x1ewu8gn",
    k3XXqK: "xaatb59",
    kMeerF: "x1s780dp",
    $$css: true
  },
  horizontalRoot: {
    kdYMnH: "x1dc76y4",
    $$css: true
  },
  horizontalTrack: {
    kLWsYc: "xmuazpc",
    kULEZF: "xiuoait",
    $$css: true
  },
  labelRow: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kOIVth: "xm15xud",
    $$css: true
  },
  rail: {
    kaIpWk: "x18j2vf1",
    kULEZF: "x1n10oyr",
    khdm6U: "xfpd54u",
    kVAEAm: "x10l6tqk",
    $$css: true
  },
  root: {
    "--hraness-design-fader-thumb-block-size": "xzmbhks",
    "--hraness-design-fader-thumb-inline-size": "xo319r4",
    "--hraness-design-fader-track-length": "x1ywzl2e",
    k1xSpc: "xrvj5dj",
    kOIVth: "xmgkybt",
    kAPf3g: "x1o2pa38",
    kdYMnH: "xct6bk3",
    $$css: true
  },
  thumb: {
    kWkggS: "x8qxh4v",
    kLWsYc: "x1v98byi",
    kVAM5u: "x1g4gko8",
    kaIpWk: "x1sybd2c",
    ksu8eU: "x1y0btm7",
    kMzoRj: "xdh2fpr",
    kGVxlE: "x123c105",
    kULEZF: "x1lmdbwv",
    kbCHJM: "x1nrll8i",
    k87sOh: "xwa60dl",
    $$css: true
  },
  track: {
    kLWsYc: "x1du97gc",
    kULEZF: "xofvnd4",
    kVAEAm: "x1n2onr6",
    $$css: true
  },
  trackRail: {
    kWkggS: "x1uslotl",
    kygpup: "x10no89f",
    $$css: true
  }
};

// src/react/fader.tsx
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
  ...props3
}) {
  const rootPresentation = stylex2.props(faderStyles.root, density === "compact" && faderStyles.compact, orientation === "horizontal" && faderStyles.horizontalRoot);
  const labelRowPresentation = stylex2.props(faderStyles.labelRow);
  const captionPresentation = stylex2.props(faderStyles.caption);
  const trackPresentation = stylex2.props(faderStyles.track, orientation === "horizontal" && faderStyles.horizontalTrack);
  const trackRailPresentation = stylex2.props(faderStyles.rail, faderStyles.trackRail);
  const fillRailPresentation = stylex2.props(faderStyles.rail, faderStyles.fillRail);
  return /* @__PURE__ */ jsxs6(AriaSlider, {
    ...props3,
    className: cn6("hraness-design-fader", rootPresentation.className, className),
    "data-density": density,
    orientation,
    ref: faderRef,
    children: [
      showLabel && labelAccessory !== undefined ? /* @__PURE__ */ jsxs6("div", {
        className: cn6("hraness-design-fader__label-row", labelRowPresentation.className),
        children: [
          /* @__PURE__ */ jsx8(Label, {
            className: cn6("hraness-design-fader__label", captionPresentation.className),
            children: label
          }),
          /* @__PURE__ */ jsx8("span", {
            className: "hraness-design-fader__label-accessory",
            children: labelAccessory
          })
        ]
      }) : showLabel ? /* @__PURE__ */ jsx8(Label, {
        className: cn6("hraness-design-fader__label", captionPresentation.className),
        children: label
      }) : /* @__PURE__ */ jsx8(Label, {
        className: "hraness-design-visually-hidden",
        children: label
      }),
      showOutput ? /* @__PURE__ */ jsx8(SliderOutput, {
        className: cn6("hraness-design-fader__output", captionPresentation.className)
      }) : null,
      /* @__PURE__ */ jsxs6(SliderTrack, {
        className: cn6("hraness-design-fader__track", trackPresentation.className),
        children: [
          /* @__PURE__ */ jsx8("span", {
            "aria-hidden": "true",
            className: cn6("hraness-design-fader__track-rail", trackRailPresentation.className)
          }),
          /* @__PURE__ */ jsx8(SliderFill, {
            className: "hraness-design-fader__fill",
            children: /* @__PURE__ */ jsx8("span", {
              "aria-hidden": "true",
              className: cn6("hraness-design-fader__fill-rail", fillRailPresentation.className)
            })
          }),
          /* @__PURE__ */ jsx8(SliderThumb, {
            className: ({
              isFocusVisible
            }) => {
              const thumbPresentation = stylex2.props(faderStyles.thumb, isFocusVisible && faderStyles.focusVisible);
              return cn6("hraness-design-fader__thumb", thumbPresentation.className);
            },
            ...inputRef === undefined ? {} : {
              inputRef
            }
          })
        ]
      })
    ]
  });
}

// src/react/foil-card-surface.tsx
import * as stylex3 from "@stylexjs/stylex";
import { cn as cn7 } from "@hraness/ui";
import { createContext as createContext2, useCallback, useContext as useContext2, useEffect as useEffect3, useMemo as useMemo2, useRef as useRef2 } from "react";

// src/react/foil-card-math.ts
function normalizedSeed(seed) {
  const normalized = seed.trim();
  if (normalized.length === 0) {
    throw new RangeError("A foil card seed must contain a non-whitespace character.");
  }
  return normalized;
}
function rounded(value, places = 3) {
  const scale = 10 ** places;
  const result = Math.round(value * scale) / scale;
  return result === 0 ? 0 : result;
}
function unitFromHash(hash) {
  return hash / 4294967296;
}
function mixedHash(hash, salt) {
  let value = (hash ^ salt) >>> 0;
  value = Math.imul(value ^ value >>> 16, 569420461);
  value = Math.imul(value ^ value >>> 15, 1935289751);
  return (value ^ value >>> 15) >>> 0;
}
function hashFoilCardSeed(seed) {
  const normalized = normalizedSeed(seed);
  let hash = 2166136261;
  for (let index = 0;index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function createFoilCardSeedPose(seed) {
  const hash = hashFoilCardSeed(seed);
  const value = (salt) => unitFromHash(mixedHash(hash, salt));
  return {
    highlightX: rounded(38 + value(608135816) * 24),
    highlightY: rounded(38 + value(2242054355) * 24),
    rotateX: rounded(-1.2 + value(320440878) * 2.4),
    rotateY: rounded(-1.4 + value(57701188) * 2.8),
    spectrumAngle: rounded(value(2752067618) * 360)
  };
}
function finiteUnit(value, label) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number.`);
  }
  return Math.min(1, Math.max(0, value));
}
function createFoilCardPointerPose(normalizedX, normalizedY) {
  const x = finiteUnit(normalizedX, "Foil card pointer x");
  const y = finiteUnit(normalizedY, "Foil card pointer y");
  const rawSpectrumAngle = Math.atan2(y - 0.5, x - 0.5) * 180 / Math.PI + 90;
  const spectrumAngle = (rawSpectrumAngle + 360) % 360;
  return {
    highlightX: rounded(x * 100),
    highlightY: rounded(y * 100),
    rotateX: rounded((0.5 - y) * 10),
    rotateY: rounded((x - 0.5) * 12),
    spectrumAngle: rounded(spectrumAngle)
  };
}

// src/react/foil-card-surface.stylex.ts
var foilCardSurfaceStyles = {
  base: {
    kWkggS: "x1scxome x9yvj25",
    kaIpWk: "x1ec2q3q",
    kGVxlE: "xt1wfgu xwaqzdf",
    kMwMTN: "x1gu5z8g",
    ktR8K2: "x16qrkmw",
    k1xSpc: "xrvj5dj",
    kHBbk8: "xc8icb0",
    kjBf7l: "x14ytart",
    kInvED: "x1g40iwv",
    k3XXqK: "xaatb59",
    kMeerF: "x1qgsegg xqswhxe",
    kVQacm: "xb3r6kr",
    k3nNDw: "x1g0ag68",
    kmaZ5I: "x1oyok0e",
    $$css: true
  },
  interactive: {
    k3aq6I: "x1c071of x1gibbwo",
    kIyJzY: "x9dyr19 x12w9bfk",
    k1ekBW: "x16n73rl",
    kAMwcw: "xvxnene",
    k6sLGO: "x1dwv3re",
    $$css: true
  },
  active: {
    kGVxlE: "xl1q07f",
    k6sLGO: "x1so62im",
    $$css: true
  },
  static: {
    k3aq6I: "x1c071of",
    kIyJzY: "x1mq3mr6",
    k1ekBW: "x13b0p5u",
    k6sLGO: "x1dwv3re",
    $$css: true
  },
  content: {
    kWZpDQ: "x1wh1ruo",
    kEXP64: "xcrlgei",
    kpJH7q: "xf9r7lm",
    k1lYIM: "x1agbcgv",
    kY2c9j: "xhtitgo",
    $$css: true
  },
  layer: {
    k1xSpc: "x1lliihq x1c7sf14",
    kWZpDQ: "x1wh1ruo",
    kEXP64: "xcrlgei",
    kpJH7q: "xf9r7lm",
    k1lYIM: "x1agbcgv",
    kfzvcC: "x47corl",
    $$css: true
  },
  baseLayer: {
    k1YJky: "xw2ojrw",
    kgSjnq: "x1ofto9s",
    ku685b: "x2g5esg",
    kY2c9j: "x1ja2u2z",
    $$css: true
  },
  spectrumLayer: {
    k1YJky: "xw2ojrw",
    kgSjnq: "x57svv3",
    k9M9Na: "x19mdvtv",
    kIyJzY: "x6bc4kz x12w9bfk",
    k1ekBW: "x6c7wse",
    kAMwcw: "xcj1dhv",
    kY2c9j: "x1vjfegm",
    $$css: true
  },
  sheenLayer: {
    kKwaWg: "xz94db0",
    k9M9Na: "x19mdvtv",
    kIyJzY: "x6bc4kz x12w9bfk",
    k1ekBW: "x10lvbrj",
    kAMwcw: "xcj1dhv",
    kY2c9j: "x1vjfegm",
    $$css: true
  },
  textureLayer: {
    kKwaWg: "x1mkn4gm",
    kgSjnq: "xrji9p8",
    k9M9Na: "x1poe65g",
    k1YJky: "xw2ojrw",
    kY2c9j: "x1vjfegm",
    $$css: true
  },
  ornamentLayer: {
    kz484i: "xiy17q3",
    kaIpWk: "x1pjcqnp",
    ku685b: "xldhu1s",
    k9M9Na: "x19mdvtv",
    kY2c9j: "xzkaem6",
    $$css: true
  },
  prismBase: {
    kKwaWg: "x1l7r8nm",
    $$css: true
  },
  prismSpectrum: {
    kKwaWg: "x1ly227q",
    $$css: true
  },
  prismTexture: {
    kgSjnq: "x8xkuhf",
    $$css: true
  },
  auroraBase: {
    kKwaWg: "x16epytu",
    $$css: true
  },
  auroraSpectrum: {
    kKwaWg: "xnxuazn",
    $$css: true
  },
  auroraTexture: {
    kKwaWg: "xivesky",
    kgSjnq: "x1h4uluw",
    $$css: true
  },
  etchedBase: {
    kKwaWg: "x72ax6r",
    $$css: true
  },
  etchedSpectrum: {
    kKwaWg: "xug9hmr",
    k9M9Na: "xwgxeq8",
    $$css: true
  },
  etchedTexture: {
    kKwaWg: "xlzw5va",
    kgSjnq: "xcdf9qb",
    k9M9Na: "xwgxeq8",
    $$css: true
  },
  goldBase: {
    kKwaWg: "x13cdjw9",
    $$css: true
  },
  goldSpectrum: {
    kKwaWg: "xouwedw",
    $$css: true
  },
  goldTexture: {
    kKwaWg: "x1rojf3q",
    kgSjnq: "xc65i0c",
    $$css: true
  },
  fastBase: {
    kKwaWg: "x1q95she",
    $$css: true
  },
  fastSpectrum: {
    kKwaWg: "x1peed02",
    kgSjnq: "x1fwwnkn",
    $$css: true
  },
  fastTexture: {
    kKwaWg: "x1qry69x",
    kgSjnq: "xeutlqa",
    $$css: true
  },
  maxBase: {
    kKwaWg: "xgzkpls",
    $$css: true
  },
  maxSpectrum: {
    kKwaWg: "x1lr92ue",
    $$css: true
  },
  maxTexture: {
    kKwaWg: "xwzb1fz",
    kgSjnq: "xlpqoug",
    $$css: true
  },
  baseSubtle: {
    kSiTet: "xi7uqbu xb083x5",
    $$css: true
  },
  baseStandard: {
    kSiTet: "x10bp2pq x1szd8p8",
    $$css: true
  },
  baseVivid: {
    kSiTet: "x16x8d5k xbp4rgc",
    $$css: true
  },
  spectrumSubtle: {
    kSiTet: "x1pnhqfb xfrgnfc",
    $$css: true
  },
  spectrumStandard: {
    kSiTet: "x15nu2d2 x1szd8p8",
    $$css: true
  },
  spectrumVivid: {
    kSiTet: "xta48a9 xu6icd1",
    $$css: true
  },
  sheenSubtle: {
    kSiTet: "xuhx63e x194v72f",
    $$css: true
  },
  sheenStandard: {
    kSiTet: "xa69gww xb083x5",
    $$css: true
  },
  sheenVivid: {
    kSiTet: "xkxdd59 x1fp9yqv",
    $$css: true
  },
  textureSubtle: {
    kSiTet: "x1ytbps3 x17zl6lg",
    $$css: true
  },
  textureStandard: {
    kSiTet: "xjkwg1t xfpeqwo",
    $$css: true
  },
  textureVivid: {
    kSiTet: "xcwlixh x2132ul",
    $$css: true
  },
  ornamentSubtle: {
    kSiTet: "x16xcxh8",
    $$css: true
  },
  ornamentStandard: {
    kSiTet: "x10b34n9",
    $$css: true
  },
  ornamentVivid: {
    kSiTet: "x1m2aqx4",
    $$css: true
  },
  ornamentNone: {
    k1xSpc: "x1s85apg",
    $$css: true
  },
  ornamentCorners: {
    kKwaWg: "xk14mg1",
    k1YJky: "xhsufdf",
    kgSjnq: "x160majy",
    $$css: true
  },
  ornamentRails: {
    kKwaWg: "x10gea7a",
    k1YJky: "x8owtp4",
    kgSjnq: "xzvt7yr",
    $$css: true
  },
  ornamentCircuit: {
    kKwaWg: "x6wo6xk",
    k1YJky: "x9ylygx",
    kgSjnq: "xxeqw4r",
    $$css: true
  },
  ornamentRadial: {
    kKwaWg: "xn77bxw",
    k1YJky: "x1akr6q6",
    kgSjnq: "x42se0v",
    $$css: true
  },
  ornamentFacets: {
    kKwaWg: "x14ln0l",
    k1YJky: "x1akr6q6",
    kgSjnq: "x1kza8ck",
    $$css: true
  }
};

// src/react/foil-card-surface.tsx
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
var foilCardPresets = ["prism", "aurora", "etched", "gold", "fast", "max"];
var foilCardIntensities = ["subtle", "standard", "vivid"];
var foilCardRenderModes = ["interactive", "static"];
var foilCardOrnaments = ["none", "corners", "rails", "circuit", "radial", "facets"];
var FoilDeckContext = createContext2(null);
var delegatedSurfaceSelector = ".hraness-design-foil-card-surface[data-foil-controller='deck']";
var presetStyles = {
  aurora: {
    base: foilCardSurfaceStyles.auroraBase,
    spectrum: foilCardSurfaceStyles.auroraSpectrum,
    texture: foilCardSurfaceStyles.auroraTexture
  },
  etched: {
    base: foilCardSurfaceStyles.etchedBase,
    spectrum: foilCardSurfaceStyles.etchedSpectrum,
    texture: foilCardSurfaceStyles.etchedTexture
  },
  fast: {
    base: foilCardSurfaceStyles.fastBase,
    spectrum: foilCardSurfaceStyles.fastSpectrum,
    texture: foilCardSurfaceStyles.fastTexture
  },
  gold: {
    base: foilCardSurfaceStyles.goldBase,
    spectrum: foilCardSurfaceStyles.goldSpectrum,
    texture: foilCardSurfaceStyles.goldTexture
  },
  max: {
    base: foilCardSurfaceStyles.maxBase,
    spectrum: foilCardSurfaceStyles.maxSpectrum,
    texture: foilCardSurfaceStyles.maxTexture
  },
  prism: {
    base: foilCardSurfaceStyles.prismBase,
    spectrum: foilCardSurfaceStyles.prismSpectrum,
    texture: foilCardSurfaceStyles.prismTexture
  }
};
var intensityStyles = {
  subtle: {
    base: foilCardSurfaceStyles.baseSubtle,
    sheen: foilCardSurfaceStyles.sheenSubtle,
    spectrum: foilCardSurfaceStyles.spectrumSubtle,
    texture: foilCardSurfaceStyles.textureSubtle,
    ornament: foilCardSurfaceStyles.ornamentSubtle
  },
  standard: {
    base: foilCardSurfaceStyles.baseStandard,
    sheen: foilCardSurfaceStyles.sheenStandard,
    spectrum: foilCardSurfaceStyles.spectrumStandard,
    texture: foilCardSurfaceStyles.textureStandard,
    ornament: foilCardSurfaceStyles.ornamentStandard
  },
  vivid: {
    base: foilCardSurfaceStyles.baseVivid,
    sheen: foilCardSurfaceStyles.sheenVivid,
    spectrum: foilCardSurfaceStyles.spectrumVivid,
    texture: foilCardSurfaceStyles.textureVivid,
    ornament: foilCardSurfaceStyles.ornamentVivid
  }
};
var ornamentStyles = {
  circuit: foilCardSurfaceStyles.ornamentCircuit,
  corners: foilCardSurfaceStyles.ornamentCorners,
  facets: foilCardSurfaceStyles.ornamentFacets,
  none: foilCardSurfaceStyles.ornamentNone,
  radial: foilCardSurfaceStyles.ornamentRadial,
  rails: foilCardSurfaceStyles.ornamentRails
};
var foilOpacityByIntensity = {
  subtle: {
    active: {
      base: 0.52,
      ornament: 0.46,
      sheen: 0.22,
      spectrum: 0.28,
      texture: 0.1
    },
    idle: {
      base: 0.34,
      ornament: 0.14,
      sheen: 0.03,
      spectrum: 0.08,
      texture: 0.04
    }
  },
  standard: {
    active: {
      base: 0.68,
      ornament: 0.66,
      sheen: 0.35,
      spectrum: 0.42,
      texture: 0.16
    },
    idle: {
      base: 0.44,
      ornament: 0.2,
      sheen: 0.04,
      spectrum: 0.12,
      texture: 0.06
    }
  },
  vivid: {
    active: {
      base: 0.84,
      ornament: 0.88,
      sheen: 0.52,
      spectrum: 0.6,
      texture: 0.24
    },
    idle: {
      base: 0.56,
      ornament: 0.26,
      sheen: 0.06,
      spectrum: 0.18,
      texture: 0.08
    }
  }
};
function poseStyle(pose, intensity) {
  const opacity = foilOpacityByIntensity[intensity].idle;
  return {
    "--foil-activity": "0",
    "--foil-base-opacity": String(opacity.base),
    "--foil-light-x": `${String(pose.highlightX)}%`,
    "--foil-light-y": `${String(pose.highlightY)}%`,
    "--foil-rotate-x": `${String(pose.rotateX)}deg`,
    "--foil-rotate-y": `${String(pose.rotateY)}deg`,
    "--foil-ornament-opacity": String(opacity.ornament),
    "--foil-sheen-opacity": String(opacity.sheen),
    "--foil-spectrum-opacity": String(opacity.spectrum),
    "--foil-spectrum-angle": `${String(pose.spectrumAngle ?? 0)}deg`,
    "--foil-texture-opacity": String(opacity.texture)
  };
}
function applyPose(element, pose) {
  element.style.setProperty("--foil-light-x", `${String(pose.highlightX)}%`);
  element.style.setProperty("--foil-light-y", `${String(pose.highlightY)}%`);
  element.style.setProperty("--foil-rotate-x", `${String(pose.rotateX)}deg`);
  element.style.setProperty("--foil-rotate-y", `${String(pose.rotateY)}deg`);
  if (pose.spectrumAngle !== undefined) {
    element.style.setProperty("--foil-spectrum-angle", `${String(pose.spectrumAngle)}deg`);
  }
}
function focusPose(seedPose) {
  const pose = {
    highlightX: seedPose.highlightX,
    highlightY: seedPose.highlightY,
    rotateX: 0,
    rotateY: 0
  };
  return seedPose.spectrumAngle === undefined ? pose : {
    ...pose,
    spectrumAngle: seedPose.spectrumAngle
  };
}
function setActive(element, activeClassName, active) {
  const intensity = element.getAttribute("data-foil-intensity");
  const selectedIntensity = intensity !== null && intensity in foilOpacityByIntensity ? intensity : "standard";
  const opacity = foilOpacityByIntensity[selectedIntensity][active ? "active" : "idle"];
  element.style.setProperty("--foil-activity", active ? "1" : "0");
  element.style.setProperty("--foil-base-opacity", String(opacity.base));
  element.style.setProperty("--foil-spectrum-opacity", String(opacity.spectrum));
  element.style.setProperty("--foil-sheen-opacity", String(opacity.sheen));
  element.style.setProperty("--foil-texture-opacity", String(opacity.texture));
  element.style.setProperty("--foil-ornament-opacity", String(opacity.ornament));
  if (active)
    element.setAttribute("data-foil-active", "true");
  else
    element.removeAttribute("data-foil-active");
  if (activeClassName !== undefined) {
    for (const className of activeClassName.split(/\s+/u)) {
      if (className.length > 0)
        element.classList.toggle(className, active);
    }
  }
}
function motionIsEnabled(finePointer, reducedMotion, forcedColors) {
  return finePointer.matches && !reducedMotion.matches && !forcedColors.matches;
}
function addMediaListener(media, listener) {
  if (typeof media.addEventListener !== "function")
    return () => {
      return;
    };
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
function FoilCardDeck({
  children,
  className,
  ...props4
}) {
  const rootRef = useRef2(null);
  const registrations = useRef2(new Map);
  const activeElement = useRef2(null);
  const focusedElement = useRef2(null);
  const pointerElement = useRef2(null);
  const activeBounds = useRef2(null);
  const pendingInteraction = useRef2(null);
  const frame = useRef2(null);
  const resizeObserver = useRef2(null);
  const deactivate = useCallback((element) => {
    const registration = registrations.current.get(element);
    if (registration !== undefined) {
      applyPose(element, registration.seedPose);
      setActive(element, registration.activeClassName, false);
    }
    if (activeElement.current === element) {
      resizeObserver.current?.unobserve(element);
      activeElement.current = null;
      activeBounds.current = null;
    }
  }, []);
  const register = useCallback((element, registration) => {
    registrations.current.set(element, registration);
    return () => {
      if (pendingInteraction.current?.element === element) {
        pendingInteraction.current = null;
      }
      if (focusedElement.current === element)
        focusedElement.current = null;
      if (pointerElement.current === element)
        pointerElement.current = null;
      deactivate(element);
      registrations.current.delete(element);
    };
  }, [deactivate]);
  const contextValue = useMemo2(() => ({
    register
  }), [register]);
  useEffect3(() => {
    const root = rootRef.current;
    if (root === null || typeof window.matchMedia !== "function" || typeof window.requestAnimationFrame !== "function" || typeof window.cancelAnimationFrame !== "function") {
      return;
    }
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    if (typeof window.ResizeObserver === "function") {
      resizeObserver.current = new window.ResizeObserver(() => {
        activeBounds.current = null;
      });
    }
    const deactivateCurrent = () => {
      const current = activeElement.current;
      if (current !== null)
        deactivate(current);
    };
    const activate = (element) => {
      if (activeElement.current !== element) {
        deactivateCurrent();
        activeElement.current = element;
        activeBounds.current = null;
        resizeObserver.current?.observe(element);
      }
      const registration = registrations.current.get(element);
      if (registration !== undefined) {
        setActive(element, registration.activeClassName, true);
      }
    };
    const activateFocus = (element) => {
      const registration = registrations.current.get(element);
      if (registration === undefined)
        return;
      activate(element);
      activeBounds.current = null;
      applyPose(element, focusPose(registration.seedPose));
    };
    const restoreFocus = () => {
      const focused = focusedElement.current;
      if (focused !== null && registrations.current.has(focused)) {
        activateFocus(focused);
      }
    };
    const renderPendingInteraction = () => {
      frame.current = null;
      const interaction = pendingInteraction.current;
      pendingInteraction.current = null;
      if (interaction === null)
        return;
      if (interaction.kind === "reset") {
        deactivate(interaction.element);
        restoreFocus();
        return;
      }
      let bounds = activeBounds.current;
      if (bounds === null) {
        bounds = interaction.element.getBoundingClientRect();
        activeBounds.current = bounds;
      }
      if (bounds.width <= 0 || bounds.height <= 0)
        return;
      applyPose(interaction.element, createFoilCardPointerPose((interaction.clientX - bounds.left) / bounds.width, (interaction.clientY - bounds.top) / bounds.height));
    };
    const schedule = (interaction) => {
      pendingInteraction.current = interaction;
      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(renderPendingInteraction);
      }
    };
    const findRegisteredSurface = (target) => {
      if (!(target instanceof Element))
        return null;
      const surface = target.closest(delegatedSurfaceSelector);
      return surface !== null && root.contains(surface) && registrations.current.has(surface) ? surface : null;
    };
    const findRegisteredFocusSurface = (target) => {
      const ancestorSurface = findRegisteredSurface(target);
      if (ancestorSurface !== null)
        return ancestorSurface;
      if (!(target instanceof Element) || !root.contains(target))
        return null;
      let match = null;
      for (const candidate of target.querySelectorAll(delegatedSurfaceSelector)) {
        if (!registrations.current.has(candidate))
          continue;
        if (match !== null)
          return null;
        match = candidate;
      }
      return match;
    };
    const handlePointerMove = (event) => {
      if (event.pointerType !== "mouse" || !motionIsEnabled(finePointer, reducedMotion, forcedColors))
        return;
      const element = findRegisteredSurface(event.target);
      if (element === null) {
        pointerElement.current = null;
        const current = activeElement.current;
        if (current !== null)
          schedule({
            element: current,
            kind: "reset"
          });
        return;
      }
      pointerElement.current = element;
      activate(element);
      schedule({
        clientX: event.clientX,
        clientY: event.clientY,
        element,
        kind: "pointer"
      });
    };
    const handlePointerLeave = (event) => {
      if (event.pointerType !== "mouse")
        return;
      pointerElement.current = null;
      const current = activeElement.current;
      if (current !== null)
        schedule({
          element: current,
          kind: "reset"
        });
    };
    const handleFocusIn = (event) => {
      if (forcedColors.matches)
        return;
      const element = findRegisteredFocusSurface(event.target);
      if (element === null)
        return;
      focusedElement.current = element;
      activateFocus(element);
    };
    const handleFocusOut = (event) => {
      const element = findRegisteredFocusSurface(event.target);
      if (element === null || focusedElement.current !== element)
        return;
      const next = findRegisteredFocusSurface(event.relatedTarget);
      if (next === element)
        return;
      focusedElement.current = next;
      if (next !== null && !forcedColors.matches) {
        activateFocus(next);
      } else if (activeElement.current === element && pointerElement.current !== element) {
        deactivate(element);
      }
    };
    const invalidateBounds = () => {
      activeBounds.current = null;
    };
    const handleMediaChange = () => {
      if (!motionIsEnabled(finePointer, reducedMotion, forcedColors)) {
        pendingInteraction.current = null;
        pointerElement.current = null;
        deactivateCurrent();
        if (!forcedColors.matches)
          restoreFocus();
      }
    };
    root.addEventListener("pointermove", handlePointerMove, {
      passive: true
    });
    root.addEventListener("pointerleave", handlePointerLeave, {
      passive: true
    });
    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);
    window.addEventListener("resize", invalidateBounds, {
      passive: true
    });
    window.addEventListener("scroll", invalidateBounds, {
      capture: true,
      passive: true
    });
    const removeMediaListeners = [addMediaListener(finePointer, handleMediaChange), addMediaListener(reducedMotion, handleMediaChange), addMediaListener(forcedColors, handleMediaChange)];
    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("resize", invalidateBounds);
      window.removeEventListener("scroll", invalidateBounds, true);
      for (const remove of removeMediaListeners)
        remove();
      if (frame.current !== null)
        window.cancelAnimationFrame(frame.current);
      pendingInteraction.current = null;
      focusedElement.current = null;
      pointerElement.current = null;
      deactivateCurrent();
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;
    };
  }, [deactivate]);
  return /* @__PURE__ */ jsx9(FoilDeckContext.Provider, {
    value: contextValue,
    children: /* @__PURE__ */ jsx9("div", {
      ...props4,
      className: cn7("hraness-design-foil-card-deck", className),
      "data-foil-card-deck": "",
      ref: rootRef,
      children
    })
  });
}
function requirePublicValue(value, supported, label) {
  if (!supported.includes(value)) {
    throw new RangeError(`Unsupported foil card ${label}: ${value}.`);
  }
}
function FoilCardSurface({
  children,
  className,
  intensity,
  ornament = "none",
  preset,
  renderMode,
  seed
}) {
  requirePublicValue(intensity, foilCardIntensities, "intensity");
  requirePublicValue(preset, foilCardPresets, "preset");
  requirePublicValue(renderMode, foilCardRenderModes, "render mode");
  requirePublicValue(ornament, foilCardOrnaments, "ornament");
  const deck = useContext2(FoilDeckContext);
  const rootRef = useRef2(null);
  const seedPose = useMemo2(() => createFoilCardSeedPose(seed), [seed]);
  const seededStyle = poseStyle(seedPose, intensity);
  const selectedPreset = presetStyles[preset];
  const selectedIntensity = intensityStyles[intensity];
  const rootPresentation = stylex3.props(foilCardSurfaceStyles.base, renderMode === "interactive" ? foilCardSurfaceStyles.interactive : foilCardSurfaceStyles.static);
  const basePresentation = stylex3.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.baseLayer, selectedPreset.base, selectedIntensity.base);
  const spectrumPresentation = stylex3.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.spectrumLayer, selectedPreset.spectrum, selectedIntensity.spectrum);
  const sheenPresentation = stylex3.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.sheenLayer, selectedIntensity.sheen);
  const texturePresentation = stylex3.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.textureLayer, selectedPreset.texture, selectedIntensity.texture);
  const ornamentPresentation = stylex3.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.ornamentLayer, ornamentStyles[ornament], selectedIntensity.ornament);
  const contentPresentation = stylex3.props(foilCardSurfaceStyles.content);
  const activePresentation = stylex3.props(foilCardSurfaceStyles.active);
  useEffect3(() => {
    if (renderMode !== "interactive")
      return;
    const root = rootRef.current;
    if (root === null)
      return;
    if (deck !== null) {
      return deck.register(root, {
        activeClassName: activePresentation.className,
        seedPose
      });
    }
    if (typeof window.matchMedia !== "function" || typeof window.requestAnimationFrame !== "function" || typeof window.cancelAnimationFrame !== "function") {
      return;
    }
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    let pointerMotionEnabled = motionIsEnabled(finePointer, reducedMotion, forcedColors);
    let bounds = null;
    let frame = null;
    let pendingInteraction = null;
    const renderPendingInteraction = () => {
      frame = null;
      const interaction = pendingInteraction;
      pendingInteraction = null;
      if (interaction === null)
        return;
      if (interaction.kind === "pose") {
        applyPose(root, interaction.pose);
        setActive(root, activePresentation.className, false);
        bounds = null;
        return;
      }
      bounds ??= root.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0)
        return;
      applyPose(root, createFoilCardPointerPose((interaction.clientX - bounds.left) / bounds.width, (interaction.clientY - bounds.top) / bounds.height));
    };
    const scheduleInteraction = (interaction) => {
      pendingInteraction = interaction;
      if (frame === null) {
        frame = window.requestAnimationFrame(renderPendingInteraction);
      }
    };
    const handlePointerMove = (event) => {
      if (event.pointerType !== "mouse" || !pointerMotionEnabled)
        return;
      setActive(root, activePresentation.className, true);
      scheduleInteraction({
        clientX: event.clientX,
        clientY: event.clientY,
        kind: "pointer"
      });
    };
    const handlePointerLeave = (event) => {
      if (event.pointerType === "mouse" && pointerMotionEnabled) {
        scheduleInteraction({
          kind: "pose",
          pose: seedPose
        });
      }
    };
    const handleFocusIn = () => {
      if (forcedColors.matches)
        return;
      applyPose(root, focusPose(seedPose));
      setActive(root, activePresentation.className, true);
    };
    const handleFocusOut = (event) => {
      if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget))
        return;
      applyPose(root, seedPose);
      setActive(root, activePresentation.className, false);
      bounds = null;
    };
    const handleMediaChange = () => {
      const containsFocus = document.activeElement instanceof Node && root.contains(document.activeElement);
      pointerMotionEnabled = motionIsEnabled(finePointer, reducedMotion, forcedColors);
      if (pointerMotionEnabled && !forcedColors.matches)
        return;
      pendingInteraction = null;
      if (frame !== null)
        window.cancelAnimationFrame(frame);
      frame = null;
      applyPose(root, seedPose);
      setActive(root, activePresentation.className, false);
      bounds = null;
      if (containsFocus && !forcedColors.matches) {
        applyPose(root, focusPose(seedPose));
        setActive(root, activePresentation.className, true);
      }
    };
    root.addEventListener("pointermove", handlePointerMove, {
      passive: true
    });
    root.addEventListener("pointerleave", handlePointerLeave, {
      passive: true
    });
    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);
    const removeMediaListeners = [addMediaListener(finePointer, handleMediaChange), addMediaListener(reducedMotion, handleMediaChange), addMediaListener(forcedColors, handleMediaChange)];
    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
      for (const remove of removeMediaListeners)
        remove();
      if (frame !== null)
        window.cancelAnimationFrame(frame);
      setActive(root, activePresentation.className, false);
    };
  }, [activePresentation.className, deck, renderMode, seedPose]);
  return /* @__PURE__ */ jsxs7("div", {
    ...rootPresentation,
    className: cn7("hraness-design-foil-card-surface", rootPresentation.className, className),
    "data-foil-intensity": intensity,
    "data-foil-controller": deck === null ? "standalone" : "deck",
    "data-foil-ornament": ornament,
    "data-foil-preset": preset,
    "data-foil-render-mode": renderMode,
    ref: rootRef,
    style: seededStyle,
    children: [
      /* @__PURE__ */ jsx9("span", {
        ...basePresentation,
        "aria-hidden": "true"
      }),
      /* @__PURE__ */ jsx9("div", {
        ...contentPresentation,
        children
      }),
      /* @__PURE__ */ jsx9("span", {
        ...spectrumPresentation,
        "aria-hidden": "true"
      }),
      /* @__PURE__ */ jsx9("span", {
        ...sheenPresentation,
        "aria-hidden": "true"
      }),
      /* @__PURE__ */ jsx9("span", {
        ...texturePresentation,
        "aria-hidden": "true"
      }),
      /* @__PURE__ */ jsx9("span", {
        ...ornamentPresentation,
        "aria-hidden": "true"
      })
    ]
  });
}

// src/react/jelly-surface.tsx
import {
  createElement,
  forwardRef,
  useCallback as useCallback2,
  useEffect as useEffect4,
  useRef as useRef3
} from "react";
import { cn as cn8 } from "@hraness/ui";

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
function shouldLoadJellyRuntime(documentRoot) {
  return documentRoot.querySelector(".hraness-design-jelly-surface") !== null;
}
function applyJellyRootMode(root, mode) {
  if (mode === "auto")
    root.removeAttribute("data-jelly-mode");
  else
    root.setAttribute("data-jelly-mode", mode);
}
function readJellyRootMode(root) {
  const mode = root.getAttribute("data-jelly-mode");
  return mode === "light" || mode === "dark" ? mode : "auto";
}
async function loadJellyRuntimeForRoot(loader, root) {
  try {
    const runtime = await loader();
    applyJellyThemeMode(runtime, readJellyRootMode(root));
    return true;
  } catch {
    return false;
  }
}
async function synchronizeJellyThemeMode(documentRoot, mode, loader, isCurrent = () => true) {
  applyJellyRootMode(documentRoot.documentElement, mode);
  if (!shouldLoadJellyRuntime(documentRoot))
    return true;
  let runtime;
  try {
    runtime = await loader();
  } catch {
    return false;
  }
  if (!isCurrent())
    return false;
  applyJellyThemeMode(runtime, mode);
  return true;
}
async function ensureJellyRuntime() {
  if (typeof window === "undefined" || typeof document === "undefined")
    return;
  await loadJellyRuntimeForRoot(loadBrowserJellyRuntime, document.documentElement);
}
function applyJellyThemeMode(runtime, mode) {
  runtime.setThemeMode(mode);
}
async function setJellyThemeMode(mode) {
  if (typeof window === "undefined" || typeof document === "undefined")
    return false;
  const request = ++themeRequest;
  return synchronizeJellyThemeMode(document, mode, loadBrowserJellyRuntime, () => request === themeRequest);
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
  ...props4
}, forwardedRef) {
  const hostRef = useRef3(null);
  const activePointer = useRef3(null);
  const activeReleaseListeners = useRef3(null);
  const setHost = useCallback2((host) => {
    hostRef.current = host;
    assignRef(surfaceRef, host);
    assignRef(forwardedRef, host);
  }, [forwardedRef, surfaceRef]);
  const release = useCallback2(() => {
    activeReleaseListeners.current?.();
    activeReleaseListeners.current = null;
    activePointer.current = null;
    const host = hostRef.current;
    host?.removeAttribute("data-pressed");
    host?.releaseBody?.();
  }, []);
  useEffect4(() => {
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
    ...props4,
    className: cn8("hraness-design-jelly-surface", className),
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
  cn as cn9
} from "@hraness/ui";
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
function NavigationRail({
  "aria-label": ariaLabel = "Primary navigation",
  children,
  className,
  footer,
  header,
  ...props4
}) {
  return /* @__PURE__ */ jsxs8("aside", {
    ...props4,
    "aria-label": ariaLabel,
    className: cn9("hraness-design-navigation-rail", className),
    children: [
      header === undefined ? null : /* @__PURE__ */ jsx10("header", {
        className: "hraness-design-navigation-rail__header",
        children: header
      }),
      /* @__PURE__ */ jsx10("nav", {
        "aria-label": ariaLabel,
        className: "hraness-design-navigation-rail__navigation",
        children
      }),
      footer === undefined ? null : /* @__PURE__ */ jsx10("footer", {
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
  ...props4
}) {
  const Heading = titleAs;
  return /* @__PURE__ */ jsxs8("section", {
    ...props4,
    className: cn9("hraness-design-rail-section", className),
    children: [
      title === undefined ? null : /* @__PURE__ */ jsx10(Heading, {
        className: "hraness-design-rail-section__title",
        children: title
      }),
      /* @__PURE__ */ jsx10("div", {
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
  ...props4
}) {
  return /* @__PURE__ */ jsxs8(Link, {
    ...props4,
    "aria-current": isActive ? "page" : undefined,
    className: cn9("hraness-design-rail-item", className),
    href,
    children: [
      icon === undefined ? null : /* @__PURE__ */ jsx10("span", {
        "aria-hidden": "true",
        className: "hraness-design-rail-item__icon",
        children: icon
      }),
      /* @__PURE__ */ jsxs8("span", {
        className: "hraness-design-rail-item__copy",
        children: [
          /* @__PURE__ */ jsx10("span", {
            className: "hraness-design-rail-item__label",
            children: label
          }),
          description === undefined ? null : /* @__PURE__ */ jsx10("span", {
            className: "hraness-design-rail-item__description",
            children: description
          })
        ]
      }),
      badge === undefined ? null : /* @__PURE__ */ jsx10("span", {
        className: "hraness-design-rail-item__badge",
        children: badge
      })
    ]
  });
}

// src/react/playback-transport.tsx
import { PlayIcon, StopIcon } from "@hugeicons/core-free-icons";
import { Icon as Icon2, IconButton as IconButton2, Spinner, Toolbar, cn as cn10 } from "@hraness/ui";
import * as stylex4 from "@stylexjs/stylex";

// src/react/playback-transport.stylex.ts
var playbackTransportStyles = {
  glyph: {
    kLWsYc: "xkl2xug",
    kULEZF: "xsta65m",
    $$css: true
  },
  root: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kwnvtZ: "x1a02dak",
    kOIVth: "xmgkybt",
    $$css: true
  }
};

// src/react/playback-transport.tsx
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
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
  const rootPresentation = stylex4.props(playbackTransportStyles.root);
  const glyphPresentation = stylex4.props(playbackTransportStyles.glyph);
  return /* @__PURE__ */ jsxs9(Toolbar, {
    ...accessibleName,
    className: cn10("hraness-design-playback-transport", rootPresentation.className, className),
    "data-playback-status": status,
    children: [
      /* @__PURE__ */ jsx11(IconButton2, {
        "aria-busy": isPending || undefined,
        "aria-label": commandLabel,
        ...buttonAriaKeyShortcuts === undefined ? {} : {
          "aria-keyshortcuts": buttonAriaKeyShortcuts
        },
        ...buttonId === undefined ? {} : {
          id: buttonId
        },
        ...buttonRef === undefined ? {} : {
          buttonRef
        },
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
        children: isPending ? /* @__PURE__ */ jsx11(Spinner, {
          ...glyphPresentation
        }) : /* @__PURE__ */ jsx11(Icon2, {
          ...glyphPresentation.className === undefined ? {} : {
            className: glyphPresentation.className
          },
          icon: isIdle ? PlayIcon : StopIcon,
          size: 24
        })
      }),
      trailingControls
    ]
  });
}

// src/react/production-data-preview-notice.tsx
import * as stylex5 from "@stylexjs/stylex";

// src/react/production-data-preview-notice.stylex.ts
var productionDataPreviewNoticeStyles = {
  emphasis: {
    k63SB2: "x1yotnlr",
    kb6lSQ: "x1vyo3qp",
    kP9fke: "xtvhhri",
    $$css: true
  },
  root: {
    kGNEyG: "x6s0dn4",
    kWkggS: "x1gq7pca",
    kL6WhQ: "x9ap2lz",
    kfdmCh: "x1q0q8m5",
    kt9PQ7: "xlxy82",
    kGVxlE: "xlmpfgd",
    kMwMTN: "xam1lc8",
    k1xSpc: "x78zum5",
    kwnvtZ: "x1a02dak",
    kMv6JI: "xumcc2o",
    kGuDYH: "xj8twjj",
    kOIVth: "x5kxhqv",
    k87sOh: "x13vifvy",
    kjj79g: "xl56j7k",
    kLWn49: "x1xfvgam",
    kAzted: "xe8gcm",
    k8WAf4: "x2d8rr9",
    kg3NbH: "x1yt8f57",
    kVAEAm: "x7wzq59",
    k9WMMc: "x2b8uid",
    kzqmXN: "xh8yej3",
    kY2c9j: "x1qhe1ue",
    $$css: true
  }
};

// src/react/production-data-preview-notice.tsx
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
function ProductionDataPreviewNotice({
  surfaceOrigin
}) {
  if (surfaceOrigin === undefined || surfaceOrigin === "")
    return null;
  const noticePresentation = stylex5.props(productionDataPreviewNoticeStyles.root);
  const emphasisPresentation = stylex5.props(productionDataPreviewNoticeStyles.emphasis);
  return /* @__PURE__ */ jsxs10("aside", {
    ...noticePresentation,
    "aria-label": "Production data preview warning",
    className: `hraness-design-production-data-preview-notice ${noticePresentation.className}`,
    role: "alert",
    children: [
      /* @__PURE__ */ jsx12("strong", {
        ...emphasisPresentation,
        children: "Production data preview"
      }),
      /* @__PURE__ */ jsx12("span", {
        children: "This preview uses production data. Actions are real and affect production."
      })
    ]
  });
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
  "animated rail stage",
  "application shells",
  "charts",
  "dither surface",
  "fader",
  "foil card surface",
  "layout surfaces",
  "Jelly presentation",
  "playback transport",
  "plain site and publication grammar",
  "Nebula Sans typography",
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
var foilDeckExamples = [
  { label: "Corner frame", ornament: "corners", preset: "prism" },
  { label: "Rail frame", ornament: "rails", preset: "etched" },
  { label: "Circuit frame", ornament: "circuit", preset: "fast" },
  { label: "Radial frame", ornament: "radial", preset: "aurora" },
  { label: "Facet frame", ornament: "facets", preset: "max" }
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
    "data-design-gallery-nested": isNestedInMain ? "true" : "false",
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
          /* @__PURE__ */ jsx13(WrappingRow, {
            children: /* @__PURE__ */ jsx13(SegmentedControl, {
              "aria-label": "Gallery density",
              items: [
                { id: "compact", label: "Compact" },
                { id: "default", label: "Default" }
              ],
              onChange: setDensity,
              size: "compact",
              value: density
            })
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
              /* @__PURE__ */ jsxs11(Card, {
                children: [
                  /* @__PURE__ */ jsxs11(CardHeader, {
                    children: [
                      /* @__PURE__ */ jsx13(CardTitle, {
                        children: "Typography roles"
                      }),
                      /* @__PURE__ */ jsx13(CardDescription, {
                        children: "Nebula Sans for proportional text; mono stays explicit."
                      })
                    ]
                  }),
                  /* @__PURE__ */ jsx13(CardContent, {
                    children: /* @__PURE__ */ jsxs11("div", {
                      className: "design-gallery__type-specimen",
                      children: [
                        /* @__PURE__ */ jsx13("p", {
                          "data-gallery-font": "proportional",
                          children: "More shape, less noise."
                        }),
                        /* @__PURE__ */ jsx13("code", {
                          "data-gallery-font": "mono",
                          children: 'const role = "mono";'
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
              bottomBar: /* @__PURE__ */ jsx13(BottomBar, {
                actions: /* @__PURE__ */ jsx13("span", {
                  children: "Synced"
                }),
                "data-gallery-layout-bottom-bar": "",
                leading: /* @__PURE__ */ jsx13("span", {
                  children: "Ready"
                }),
                children: "Reference footer"
              }),
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
                "data-gallery-layout-top-bar": "",
                title: "Reference workspace"
              }),
              children: /* @__PURE__ */ jsx13(PageCanvas, {
                as: "div",
                "data-gallery-layout-page-canvas": "",
                children: /* @__PURE__ */ jsx13(AnimatedRailStage, {
                  className: "design-gallery__animated-rail-stage",
                  stageKey: density,
                  children: /* @__PURE__ */ jsxs11(DitherSurface, {
                    as: "section",
                    "data-gallery-dither": "",
                    density: density === "compact" ? "fine" : "medium",
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
          }),
          /* @__PURE__ */ jsxs11("div", {
            className: "design-gallery__docked-footer-preview",
            "data-gallery-layout-docked-frame": "",
            children: [
              /* @__PURE__ */ jsx13("p", {
                children: "Docked commands remain inside their positioning owner."
              }),
              /* @__PURE__ */ jsx13(DockedFooter, {
                "data-gallery-layout-docked-footer": "",
                density: "compact",
                position: "absolute",
                children: "Reference commands"
              })
            ]
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
                    "data-gallery-fader": "vertical",
                    density: "default",
                    label: "Level",
                    labelAccessory: /* @__PURE__ */ jsx13("span", {
                      "data-gallery-fader-accessory": "",
                      children: "dB"
                    }),
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
                    "data-gallery-fader": "horizontal",
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
                    buttonAriaKeyShortcuts: "Space",
                    buttonId: "design-gallery-playback-command",
                    className: "design-gallery__playback-transport",
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
          /* @__PURE__ */ jsx13(FoilCardDeck, {
            "aria-label": "Delegated foil ornament examples",
            className: "design-gallery__foil-deck",
            children: foilDeckExamples.map((example) => /* @__PURE__ */ jsx13(FoilCardSurface, {
              className: "design-gallery__foil-example",
              intensity: "standard",
              ornament: example.ornament,
              preset: example.preset,
              renderMode: "interactive",
              seed: `public-gallery-foil-${example.ornament}`,
              children: /* @__PURE__ */ jsxs11("article", {
                className: "design-gallery__foil-card",
                children: [
                  /* @__PURE__ */ jsx13(Tag, {
                    variant: "outline",
                    children: example.label
                  }),
                  /* @__PURE__ */ jsxs11("div", {
                    children: [
                      /* @__PURE__ */ jsx13("h3", {
                        children: "Semantic card content"
                      }),
                      /* @__PURE__ */ jsx13("p", {
                        children: "One deck controller decorates ordinary articles."
                      })
                    ]
                  })
                ]
              })
            }, example.ornament))
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
import { useCallback as useCallback3, useEffect as useEffect5 } from "react";
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
  return useCallback3(async (feedback = "press") => enabled ? await triggerHapticFeedback(feedback) : false, [enabled]);
}
// src/react/keyboard-shortcuts.ts
import { useEffect as useEffect6, useRef as useRef4 } from "react";
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
  const latestRef = useRef4({ bindings, isDisabled: options.isDisabled ?? false });
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
import { useEffect as useEffect8, useId as useId2 } from "react";

// src/react/theme.tsx
import {
  AppearanceIcon,
  IconButton as IconButton3,
  Menu,
  MenuItem,
  MenuTrigger,
  SegmentedControl as SegmentedControl2,
  cn as cn11
} from "@hraness/ui";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import {
  useEffect as useEffect7,
  useRef as useRef5,
  useSyncExternalStore
} from "react";

// src/browser/theme-color-sync.ts
var themeColorSyncActiveAttribute = "data-hraness-design-theme-color-sync-active";
var themeColorSyncDisabledAttribute = "data-hraness-design-theme-color-sync-disabled";
var managersByDocument = new WeakMap;
var ownerSequence = 0;
function exactThemeColorMetas(manager) {
  return Array.from(manager.document.head.querySelectorAll("meta[name]")).filter((meta) => meta.name === manager.metaName);
}
function currentRegisteredColor(manager) {
  let color;
  for (const registeredColor of manager.registrations.values())
    color = registeredColor;
  if (color === undefined)
    throw new Error("Theme color synchronization has no active owner.");
  return color;
}
function restoreDisabledMeta(meta, original) {
  if (original.media === null)
    meta.removeAttribute("media");
  else
    meta.setAttribute("media", original.media);
  meta.removeAttribute(themeColorSyncDisabledAttribute);
}
function createActiveMeta(manager) {
  const meta = manager.document.createElement("meta");
  meta.name = manager.metaName;
  meta.content = currentRegisteredColor(manager);
  meta.setAttribute(themeColorSyncActiveAttribute, manager.owner);
  manager.activeMetas.add(meta);
  const first = exactThemeColorMetas(manager).find((candidate) => candidate.parentElement === manager.document.head);
  manager.document.head.insertBefore(meta, first ?? null);
  return meta;
}
function activeMetaIsOwned(manager) {
  const active = manager.activeMeta;
  return active !== null && active.parentElement === manager.document.head && active.name === manager.metaName && !active.hasAttribute("media") && active.getAttribute(themeColorSyncActiveAttribute) === manager.owner;
}
function disableCompetingMeta(manager, meta) {
  if (manager.disabledMetas.has(meta)) {
    if (meta.getAttribute(themeColorSyncDisabledAttribute) !== manager.owner) {
      meta.setAttribute(themeColorSyncDisabledAttribute, manager.owner);
    }
    if (meta.getAttribute("media") !== "not all")
      meta.setAttribute("media", "not all");
    return;
  }
  const ownedBy = meta.getAttribute(themeColorSyncDisabledAttribute);
  if (ownedBy !== null || meta.getAttribute("media")?.trim().toLowerCase() === "not all") {
    return;
  }
  manager.disabledMetas.set(meta, { media: meta.getAttribute("media") });
  meta.setAttribute(themeColorSyncDisabledAttribute, manager.owner);
  meta.setAttribute("media", "not all");
}
function reconcileThemeColorMetas(manager) {
  if (manager.registrations.size === 0)
    return;
  for (const [meta, original] of manager.disabledMetas) {
    if (!manager.document.head.contains(meta) || meta.name !== manager.metaName) {
      restoreDisabledMeta(meta, original);
      manager.disabledMetas.delete(meta);
    }
  }
  if (!activeMetaIsOwned(manager))
    manager.activeMeta = createActiveMeta(manager);
  const active = manager.activeMeta;
  if (active === null)
    return;
  const metas = exactThemeColorMetas(manager);
  const first = metas.find((meta) => meta.parentElement === manager.document.head);
  if (first !== undefined && first !== active)
    manager.document.head.insertBefore(active, first);
  const color = currentRegisteredColor(manager);
  if (active.content !== color)
    active.content = color;
  for (const meta of metas) {
    if (meta !== active)
      disableCompetingMeta(manager, meta);
  }
}
function observeThemeColorMetas(manager) {
  const Observer = manager.document.defaultView?.MutationObserver;
  if (Observer === undefined)
    return;
  manager.observer = new Observer(() => reconcileThemeColorMetas(manager));
  manager.observer.observe(manager.document.head, {
    attributeFilter: [
      "content",
      "media",
      "name",
      themeColorSyncActiveAttribute,
      themeColorSyncDisabledAttribute
    ],
    attributes: true,
    childList: true,
    subtree: true
  });
}
function destroyThemeColorManager(manager) {
  manager.observer?.disconnect();
  manager.observer = null;
  for (const meta of manager.activeMetas)
    meta.remove();
  for (const [meta, original] of manager.disabledMetas) {
    restoreDisabledMeta(meta, original);
  }
  manager.activeMetas.clear();
  manager.disabledMetas.clear();
  manager.activeMeta = null;
  const documentManagers = managersByDocument.get(manager.document);
  if (documentManagers?.get(manager.metaName) === manager) {
    documentManagers.delete(manager.metaName);
  }
}
function acquireThemeColorMeta(document2, metaName, registrationId, color) {
  let documentManagers = managersByDocument.get(document2);
  if (documentManagers === undefined) {
    documentManagers = new Map;
    managersByDocument.set(document2, documentManagers);
  }
  let manager = documentManagers.get(metaName);
  if (manager === undefined) {
    ownerSequence += 1;
    manager = {
      activeMeta: null,
      activeMetas: new Set,
      disabledMetas: new Map,
      document: document2,
      metaName,
      observer: null,
      owner: String(ownerSequence),
      registrations: new Map
    };
    documentManagers.set(metaName, manager);
  }
  manager.registrations.set(registrationId, color);
  reconcileThemeColorMetas(manager);
  if (manager.observer === null)
    observeThemeColorMetas(manager);
  let released = false;
  return {
    release: () => {
      if (released)
        return;
      released = true;
      manager.registrations.delete(registrationId);
      if (manager.registrations.size === 0)
        destroyThemeColorManager(manager);
      else
        reconcileThemeColorMetas(manager);
    },
    update: (nextColor) => {
      if (released || !manager.registrations.has(registrationId))
        return;
      manager.registrations.set(registrationId, nextColor);
      reconcileThemeColorMetas(manager);
    }
  };
}

// src/react/theme.tsx
import { jsx as jsx14, jsxs as jsxs12, Fragment as Fragment2 } from "react/jsx-runtime";
var concreteThemes = ["light", "dark"];
var emptySubscribe = () => () => {
  return;
};
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
function themeStorageGuardScript(storageKey) {
  const serializedKey = JSON.stringify(storageKey).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
  return `(()=>{try{const key=${serializedKey};const value=localStorage.getItem(key);if(value!==null&&value!=="light"&&value!=="dark"&&value!=="system")localStorage.setItem(key,"${defaultDesignTheme}")}catch{}})();`;
}
function PersistedThemeNormalizer() {
  const { setTheme, theme } = useTheme();
  useEffect7(() => {
    if (theme !== undefined && !isDesignTheme(theme))
      setTheme(defaultDesignTheme);
  }, [setTheme, theme]);
  return null;
}
function JellyThemeSync() {
  const { resolvedTheme } = useTheme();
  useEffect7(() => {
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
  return /* @__PURE__ */ jsx14(DesignPortalThemeProvider, {
    theme: portalTheme,
    children
  });
}
function DesignThemeProvider({
  children,
  forcedTheme,
  nonce,
  storageKey = designThemeStorageKey
}) {
  return /* @__PURE__ */ jsxs12(Fragment2, {
    children: [
      forcedTheme === undefined ? /* @__PURE__ */ jsx14("script", {
        ...nonce === undefined ? {} : { nonce },
        "data-hraness-design-theme-guard": "",
        dangerouslySetInnerHTML: { __html: themeStorageGuardScript(storageKey) },
        suppressHydrationWarning: true
      }) : null,
      /* @__PURE__ */ jsxs12(NextThemeProvider, {
        ...nonce === undefined ? {} : { nonce },
        attribute: "data-theme",
        defaultTheme: forcedTheme ?? defaultDesignTheme,
        disableTransitionOnChange: true,
        enableSystem: forcedTheme === undefined,
        forcedTheme,
        storageKey,
        themes: [...concreteThemes],
        children: [
          forcedTheme === undefined ? /* @__PURE__ */ jsx14(PersistedThemeNormalizer, {}) : null,
          /* @__PURE__ */ jsx14(JellyThemeSync, {}),
          /* @__PURE__ */ jsx14(PortalThemeBridge, {
            forcedTheme,
            children
          })
        ]
      })
    ]
  });
}
function themeToggleLabel(id, labels) {
  return designThemeLabel(id, labels);
}
function themeToggleItems(labels) {
  return [
    { id: "light", label: themeToggleLabel("light", labels) },
    { id: "dark", label: themeToggleLabel("dark", labels) },
    { id: "system", label: themeToggleLabel("system", labels) }
  ];
}
function themeToggleIcon(id) {
  return /* @__PURE__ */ jsx14(AppearanceIcon, {
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
  display,
  labels,
  onChange,
  presentation,
  size = "compact",
  value: controlledValue
}) {
  const hydrated = useHydrated();
  const { setTheme, theme } = useTheme();
  const controlled = controlledValue !== undefined;
  const ready = controlled || hydrated;
  const value = controlledValue ?? (hydrated ? normalizeDesignTheme(theme) : defaultDesignTheme);
  const resolvedPresentation = presentation ?? (display === undefined ? "menu" : "segmented");
  const resolvedDisplay = display ?? "icons";
  const items = resolvedDisplay === "icons" ? themeToggleIconItems(labels) : themeToggleItems(labels);
  const changeTheme = (nextTheme) => {
    if (controlled)
      onChange?.(nextTheme);
    else
      setTheme(nextTheme);
  };
  const currentLabel = themeToggleLabel(value, labels);
  return /* @__PURE__ */ jsx14("div", {
    "aria-busy": !ready || undefined,
    className: cn11("hraness-design-theme-toggle", className),
    "data-display": resolvedPresentation === "menu" ? "icons" : resolvedDisplay,
    "data-hraness-appearance-menu": resolvedPresentation === "menu" ? "" : undefined,
    "data-presentation": resolvedPresentation,
    "data-ready": ready ? "true" : "false",
    "data-theme-value": value,
    children: resolvedPresentation === "menu" ? /* @__PURE__ */ jsxs12(MenuTrigger, {
      children: [
        /* @__PURE__ */ jsx14(IconButton3, {
          "aria-label": `${ariaLabel}: ${currentLabel}`,
          controlClassName: "hraness-design-theme-toggle__trigger",
          isDisabled: !ready,
          size,
          tooltip: `${ariaLabel}: ${currentLabel}`,
          children: themeToggleIcon(value)
        }),
        /* @__PURE__ */ jsx14(Menu, {
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
          children: designThemes.map((id) => /* @__PURE__ */ jsx14(MenuItem, {
            className: "hraness-design-theme-toggle__item",
            "data-theme-value": id,
            id,
            leading: themeToggleIcon(id),
            textValue: themeToggleLabel(id, labels),
            children: themeToggleLabel(id, labels)
          }, id))
        })
      ]
    }) : /* @__PURE__ */ jsx14(SegmentedControl2, {
      "aria-label": ariaLabel,
      isDisabled: !ready,
      items,
      onChange: changeTheme,
      size,
      value
    })
  });
}
function ThemeMenuButton(props6) {
  return /* @__PURE__ */ jsx14(ThemeToggle, {
    ...props6,
    presentation: "menu"
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
  const registrationId = useRef5(Symbol("hraness-design-theme-color"));
  const registration = useRef5(null);
  const resolvedColor = resolvedTheme === "light" || resolvedTheme === "dark" ? themeColorFor(resolvedTheme, { dark: darkColor, light: lightColor }) : undefined;
  const hasResolvedColor = resolvedColor !== undefined;
  const latestColor = useRef5(resolvedColor);
  latestColor.current = resolvedColor;
  useEffect7(() => {
    if (!hasResolvedColor || latestColor.current === undefined)
      return;
    const current = acquireThemeColorMeta(document, metaName, registrationId.current, latestColor.current);
    registration.current = current;
    return () => {
      if (registration.current === current)
        registration.current = null;
      current.release();
    };
  }, [hasResolvedColor, metaName]);
  useEffect7(() => {
    if (resolvedColor !== undefined)
      registration.current?.update(resolvedColor);
  }, [resolvedColor]);
  return null;
}

// src/react/route-state.tsx
import { jsx as jsx15, jsxs as jsxs13, Fragment as Fragment3 } from "react/jsx-runtime";
function RouteActions({ children }) {
  return /* @__PURE__ */ jsx15("div", {
    className: "hraness-design-route-state__actions",
    children
  });
}
function RouteNotFoundPage({
  canvasAs = "main",
  showThemeToggle = false,
  titleAs = "h1"
} = {}) {
  return /* @__PURE__ */ jsxs13(PageCanvas, {
    as: canvasAs,
    className: "hraness-design-route-state",
    children: [
      showThemeToggle ? /* @__PURE__ */ jsx15("header", {
        className: "hraness-design-route-state__header",
        children: /* @__PURE__ */ jsx15(ThemeMenuButton, {})
      }) : null,
      /* @__PURE__ */ jsx15("div", {
        className: "hraness-design-route-state__content",
        children: /* @__PURE__ */ jsx15(EmptyState, {
          action: /* @__PURE__ */ jsx15(LinkButton2, {
            href: "/",
            variant: "primary",
            children: "Return home"
          }),
          description: "The address may be out of date, or this page may have moved.",
          icon: /* @__PURE__ */ jsx15("span", {
            "aria-hidden": "true",
            children: "404"
          }),
          title: "Page not found",
          titleAs
        })
      })
    ]
  });
}
function RouteErrorPage({
  announce = true,
  autoFocus = true,
  canvasAs = "main",
  error,
  reset,
  showThemeToggle = false,
  titleAs = "h1"
}) {
  const focusId = `${useId2()}-route-error`;
  useEffect8(() => {
    if (autoFocus)
      document.getElementById(focusId)?.focus();
  }, [autoFocus, error, focusId]);
  return /* @__PURE__ */ jsxs13(PageCanvas, {
    "aria-label": "This view could not load",
    "aria-live": announce ? "assertive" : undefined,
    as: canvasAs,
    className: "hraness-design-route-state",
    id: focusId,
    tabIndex: -1,
    children: [
      showThemeToggle ? /* @__PURE__ */ jsx15("header", {
        className: "hraness-design-route-state__header",
        children: /* @__PURE__ */ jsx15(ThemeMenuButton, {})
      }) : null,
      /* @__PURE__ */ jsx15("div", {
        className: "hraness-design-route-state__content",
        children: /* @__PURE__ */ jsx15(EmptyState, {
          action: /* @__PURE__ */ jsxs13(RouteActions, {
            children: [
              /* @__PURE__ */ jsx15(Button3, {
                onPress: reset,
                variant: "primary",
                children: "Try again"
              }),
              /* @__PURE__ */ jsx15(LinkButton2, {
                href: "/",
                children: "Return home"
              })
            ]
          }),
          description: "Retry this view, or return home and continue from there.",
          icon: /* @__PURE__ */ jsx15("span", {
            "aria-hidden": "true",
            children: "!"
          }),
          title: "This view could not load",
          titleAs
        })
      })
    ]
  });
}
function RouteLoadingPage({
  announce = true,
  canvasAs = "main"
} = {}) {
  return /* @__PURE__ */ jsx15(PageCanvas, {
    "aria-busy": announce ? "true" : undefined,
    as: canvasAs,
    className: "hraness-design-route-state",
    children: /* @__PURE__ */ jsxs13("section", {
      className: "hraness-design-route-state__loading",
      role: announce ? "status" : undefined,
      children: [
        /* @__PURE__ */ jsxs13("div", {
          className: "hraness-design-route-state__loading-title",
          children: [
            /* @__PURE__ */ jsx15(Spinner2, {}),
            /* @__PURE__ */ jsx15("strong", {
              children: "Loading page"
            })
          ]
        }),
        /* @__PURE__ */ jsxs13("div", {
          "aria-hidden": "true",
          className: "hraness-design-route-state__skeletons",
          children: [
            /* @__PURE__ */ jsx15(Skeleton, {
              height: "1rem",
              isText: true,
              width: "88%"
            }),
            /* @__PURE__ */ jsx15(Skeleton, {
              height: "1rem",
              isText: true,
              width: "64%"
            }),
            /* @__PURE__ */ jsx15(Skeleton, {
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
  darkColor = colors.dark.background,
  diagnostics,
  lightColor = colors.light.background,
  theme = defaultDesignTheme,
  ...props6
}) {
  const content = /* @__PURE__ */ jsxs13(Fragment3, {
    children: [
      diagnostics,
      /* @__PURE__ */ jsx15(RouteErrorPage, {
        ...props6,
        showThemeToggle: false
      })
    ]
  });
  return /* @__PURE__ */ jsxs13("html", {
    "data-theme": theme === "system" ? "light" : theme,
    lang: "en",
    suppressHydrationWarning: true,
    children: [
      /* @__PURE__ */ jsxs13("head", {
        children: [
          /* @__PURE__ */ jsx15("meta", {
            content: theme === "system" ? "light dark" : theme,
            name: "color-scheme"
          }),
          theme === "system" ? /* @__PURE__ */ jsxs13(Fragment3, {
            children: [
              /* @__PURE__ */ jsx15("meta", {
                content: lightColor,
                media: "(prefers-color-scheme: light)",
                name: "theme-color"
              }),
              /* @__PURE__ */ jsx15("meta", {
                content: darkColor,
                media: "(prefers-color-scheme: dark)",
                name: "theme-color"
              })
            ]
          }) : /* @__PURE__ */ jsx15("meta", {
            content: theme === "dark" ? darkColor : lightColor,
            name: "theme-color"
          })
        ]
      }),
      /* @__PURE__ */ jsx15("body", {
        className: bodyClassName,
        children: theme === "system" ? /* @__PURE__ */ jsxs13(DesignThemeProvider, {
          children: [
            /* @__PURE__ */ jsx15(ThemeColorSync, {
              darkColor,
              lightColor
            }),
            content
          ]
        }) : content
      })
    ]
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
  hashFoilCardSeed,
  hapticInputForFeedback,
  foilCardRenderModes,
  foilCardPresets,
  foilCardOrnaments,
  foilCardIntensities,
  disposeHapticFeedback,
  designThemes,
  designThemeStorageKey,
  designGalleryTouchKinds,
  designGallerySections,
  designGalleryRecipeCoverage,
  defaultDesignTheme,
  decideKeyboardShortcut,
  createProceduralBackdropRecipe,
  createParticleHaloRecipe,
  createHapticFeedbackController,
  createFoilCardSeedPose,
  createFoilCardPointerPose,
  composeJellyCapture,
  cancelHapticFeedback,
  bindJellyPointerRelease,
  TopBar,
  ThemeToggle,
  ThemeMenuButton,
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
  FoilCardSurface,
  FoilCardDeck,
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
