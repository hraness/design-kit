"use client";
import {
  colors,
  defaultDesignPalettePreference,
  defaultDesignTheme,
  designPaletteLabels,
  designPaletteStorageKey,
  designPalettes,
  designThemeLabel,
  designThemeStorageKey,
  designThemes,
  getDesignPaletteTheme,
  isDesignTheme,
  motion,
  normalizeDesignPalettePreference,
  normalizeDesignTheme,
  parseDesignPalettePreference,
  resolveDesignPalettePreference
} from "../chunk-x957htqa.js";
import {
  BarListChart,
  RadarProfileChart,
  RangePlotChart
} from "../chunk-y6dcd8h8.js";
import {
  BottomBar,
  DitherSurface,
  DockedFooter,
  MarketingCallToAction,
  MarketingFacts,
  MarketingFlow,
  MarketingInstallPanel,
  MarketingInterfaceGrid,
  MarketingMaker,
  MarketingPage,
  MarketingPillars,
  MarketingPricing,
  MarketingPrimitives,
  MarketingProofFrame,
  MarketingQuestionList,
  MarketingQuoteGrid,
  MarketingSection,
  MarketingSectionLabel,
  MarketingSiteHeader,
  MarketingStatStrip,
  MarketingTrustBoundary,
  PageCanvas,
  ParticleHalo,
  ProceduralBackdrop,
  ProductHero,
  SyntaxCode,
  TopBar,
  createParticleHaloRecipe,
  createProceduralBackdropRecipe,
  effectsStyles,
  proceduralBackdropVariants,
  proceduralRecipeVersion
} from "../chunk-516rk56h.js";
import"../chunk-jey98bgc.js";
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
import * as stylex2 from "@stylexjs/stylex";
import { useEffect, useState } from "react";

// src/react/app-shell.stylex.ts
var appShellStyles = {
  bottom: {
    kJuA4N: "x5qop9b",
    kdYMnH: "xesnm00",
    $$css: true
  },
  drawer: {
    kLWsYc: "xuxy95z",
    $$css: true
  },
  mobileTrigger: {
    k4V0xq: "xh0wz1u",
    krFJ6x: "x8l168h",
    kP1A0P: "x1eeafzw",
    k1xSpc: "x1s85apg xhhrn6j",
    kJuA4N: "x1u8reri",
    kmVPX3: "x1bmall5",
    kgQiWS: "x1e98eu2",
    $$css: true
  },
  page: {
    kJuA4N: "x3jjhf5",
    kVQ08L: "x159srwy",
    kdYMnH: "xesnm00",
    kVQacm: "xysyzu8",
    $$css: true
  },
  rail: {
    ku1ltF: "xcrev8p",
    kHypHr: "x1tzqu68",
    kKwaWg: "xhobzj1",
    kl9DO0: "xzln6ae",
    k1YJky: "x2c5uud",
    kz484i: "x1pjo12s",
    kgSjnq: "x1ug5rqp",
    kWkggS: "x9yvj25",
    kpvK8V: "x108usdd",
    k4V0xq: "x14bdpvh",
    kEreRy: "xjslfuv",
    kffDkL: "x1j8yxcv x1x0u81l",
    kgBrHk: "x18b5jzi",
    k7sjHc: "x1lun4ml",
    k1xSpc: "x8iw86j",
    kJuA4N: "x1c6xfxh",
    kVQ08L: "x159srwy",
    kdYMnH: "xesnm00",
    $$css: true
  },
  root: {
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x103pssi",
    kWkggS: "x11gw9ax",
    kLWsYc: "xuxy95z",
    k1xSpc: "xrvj5dj",
    k52YG4: "x17vz68e x5m4t22",
    kULEZF: "xiuoait",
    kVQ08L: "x159srwy",
    kdYMnH: "xesnm00",
    $$css: true
  },
  top: {
    kJuA4N: "x1njhr7p",
    kdYMnH: "xesnm00",
    $$css: true
  }
};

// src/react/app-shell.tsx
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
  const rootPresentation = stylex2.props(appShellStyles.root);
  const topPresentation = stylex2.props(appShellStyles.top);
  const railPresentation = stylex2.props(appShellStyles.rail);
  const mobileTriggerPresentation = stylex2.props(appShellStyles.mobileTrigger);
  const drawerPresentation = stylex2.props(appShellStyles.drawer);
  const pagePresentation = stylex2.props(appShellStyles.page);
  const bottomPresentation = stylex2.props(appShellStyles.bottom);
  useEffect(() => {
    setMobileOpen(false);
  }, [navigationKey]);
  return /* @__PURE__ */ jsxs("div", {
    ...rootPresentation,
    className: cn2("hraness-design-app-shell", rootPresentation.className, className),
    children: [
      /* @__PURE__ */ jsx2("div", {
        ...topPresentation,
        className: cn2("hraness-design-app-shell__top", topPresentation.className),
        children: topBar
      }),
      /* @__PURE__ */ jsx2("div", {
        ...railPresentation,
        className: cn2("hraness-design-app-shell__rail", railPresentation.className),
        children: rail
      }),
      /* @__PURE__ */ jsx2("div", {
        ...mobileTriggerPresentation,
        className: cn2("hraness-design-app-shell__mobile-trigger", mobileTriggerPresentation.className),
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
              className: cn2("hraness-design-app-shell__drawer", drawerPresentation.className),
              size: "small",
              title: mobileNavigationLabel,
              children: rail
            })
          ]
        })
      }),
      /* @__PURE__ */ jsx2("div", {
        ...pagePresentation,
        className: cn2("hraness-design-app-shell__page", pagePresentation.className),
        children
      }),
      bottomBar === undefined ? null : /* @__PURE__ */ jsx2("div", {
        ...bottomPresentation,
        className: cn2("hraness-design-app-shell__bottom", bottomPresentation.className),
        children: bottomBar
      })
    ]
  });
}
// src/react/aurora-dots-background.tsx
import { cn as cn4 } from "@hraness/ui";
import * as stylex4 from "@stylexjs/stylex";

// src/react/phaser-dots.tsx
import { useEffect as useEffect2, useRef } from "react";
import { cn as cn3 } from "@hraness/ui";
import * as stylex3 from "@stylexjs/stylex";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var DOT_PATTERN = "hraness-design-phaser-dots__static";
var INERT_PROPS = {
  inert: true
};
function PhaserDots({
  className,
  fadeDirection = "none",
  mouseGlow = false,
  dotClassName,
  trailClassName,
  style,
  ...props4
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
    const ctx = canvas.getContext("2d", {
      alpha: true
    });
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
    const CLICK_TRAIL_STAMP = [{
      dx: 0,
      dy: 0
    }, {
      dx: DOT_STEP,
      dy: 0
    }, {
      dx: -DOT_STEP,
      dy: 0
    }, {
      dx: 0,
      dy: DOT_STEP
    }, {
      dx: 0,
      dy: -DOT_STEP
    }];
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
      hoverBrush.push({
        x,
        y,
        t: performance.now()
      });
      if (hoverBrush.length > MAX_HOVER_POINTS) {
        hoverBrush.splice(0, hoverBrush.length - MAX_HOVER_POINTS);
      }
      lastHoverPoint = {
        x,
        y
      };
    };
    const pushTrailPoint = (x, y) => {
      const now = performance.now();
      if (!lastPoint) {
        trail.push({
          x,
          y,
          t: now
        });
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
          trail.push({
            x: px,
            y: py,
            t: now
          });
        }
      }
      if (trail.length > MAX_TRAIL_POINTS) {
        trail.splice(0, trail.length - MAX_TRAIL_POINTS);
      }
      lastPoint = {
        x,
        y
      };
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
      pendingMove = {
        x: e.clientX,
        y: e.clientY
      };
      if (!raf)
        raf = requestAnimationFrame(tick);
    };
    const handleDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0)
        return;
      pendingDown = {
        x: e.clientX,
        y: e.clientY
      };
      if (!raf)
        raf = requestAnimationFrame(tick);
    };
    const handleUp = () => {
      lastPoint = null;
    };
    const passive = {
      passive: true
    };
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
    WebkitMaskImage: maskGradient,
    maskImage: maskGradient,
    ...style
  } : style;
  const rootPresentation = stylex3.props(effectsStyles.phaserSlot, effectsStyles.phaserRoot);
  const staticPresentation = stylex3.props(effectsStyles.phaserSlot, effectsStyles.phaserStatic, !dotClassName && effectsStyles.phaserStaticDefault);
  const trailPresentation = stylex3.props(effectsStyles.phaserSlot, effectsStyles.phaserTrail, !trailClassName && effectsStyles.phaserTrailDefault);
  return /* @__PURE__ */ jsxs2("div", {
    ...props4,
    ...INERT_PROPS,
    ref: containerRef,
    role: "presentation",
    "aria-hidden": "true",
    className: cn3("hraness-design-phaser-dots", rootPresentation.className, className),
    style: mergedStyle,
    children: [
      /* @__PURE__ */ jsx3("div", {
        className: cn3(DOT_PATTERN, staticPresentation.className, dotClassName)
      }),
      mouseGlow && /* @__PURE__ */ jsx3("canvas", {
        ref: canvasRef,
        className: cn3("hraness-design-phaser-dots__trail", trailPresentation.className, trailClassName)
      })
    ]
  });
}

// src/react/aurora-dots-background.tsx
import { jsx as jsx4, jsxs as jsxs3, Fragment } from "react/jsx-runtime";
function AuroraDotsBackground() {
  const backgroundPresentation = stylex4.props(effectsStyles.auroraBackground);
  const dotsPresentation = stylex4.props(effectsStyles.auroraDots);
  return /* @__PURE__ */ jsxs3(Fragment, {
    children: [
      /* @__PURE__ */ jsx4("div", {
        "aria-hidden": "true",
        className: cn4("hraness-design-aurora-background", backgroundPresentation.className)
      }),
      /* @__PURE__ */ jsx4("div", {
        "aria-hidden": "true",
        className: cn4("hraness-design-aurora-dots", dotsPresentation.className),
        children: /* @__PURE__ */ jsx4(PhaserDots, {
          mouseGlow: true
        })
      })
    ]
  });
}
// src/react/chat.tsx
import { Button, TextAreaField, cn as cn5 } from "@hraness/ui";
import * as stylex5 from "@stylexjs/stylex";

// src/react/chat.stylex.ts
var chatStyles = {
  composer: {
    kGNEyG: "xpqajaz",
    k1xSpc: "xrvj5dj",
    kOIVth: "xmgkybt",
    kumcoG: "xju1xpo x19m6iyc",
    $$css: true
  },
  message: {
    k1xSpc: "xrvj5dj",
    kOIVth: "x96y02u",
    kumcoG: "x1rkzygb",
    $$css: true
  },
  messageHeader: {
    kMwMTN: "x17j02y5",
    kGuDYH: "xaasd0c",
    klAkkO: "x1wf7w3r",
    $$css: true
  },
  messageMinInline: {
    kdYMnH: "xesnm00",
    $$css: true
  },
  messageRow: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kwnvtZ: "x1a02dak",
    kOIVth: "xmgkybt",
    $$css: true
  }
};

// src/react/chat.tsx
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function ChatMessage({
  actions,
  avatar,
  children,
  className,
  meta,
  name,
  role
}) {
  const messagePresentation = stylex5.props(chatStyles.message);
  const minInlinePresentation = stylex5.props(chatStyles.messageMinInline);
  const rowPresentation = stylex5.props(chatStyles.messageRow);
  const headerPresentation = stylex5.props(chatStyles.messageRow, chatStyles.messageHeader);
  return /* @__PURE__ */ jsxs4("article", {
    ...messagePresentation,
    className: cn5("hraness-design-chat-message", messagePresentation.className, className),
    "data-role": role,
    children: [
      avatar === undefined ? null : /* @__PURE__ */ jsx5("div", {
        className: "hraness-design-chat-message__avatar",
        children: avatar
      }),
      /* @__PURE__ */ jsxs4("div", {
        ...minInlinePresentation,
        className: cn5("hraness-design-chat-message__content", minInlinePresentation.className),
        children: [
          name === undefined && meta === undefined ? null : /* @__PURE__ */ jsxs4("header", {
            ...headerPresentation,
            className: cn5("hraness-design-chat-message__header", headerPresentation.className),
            children: [
              name === undefined ? null : /* @__PURE__ */ jsx5("strong", {
                children: name
              }),
              meta === undefined ? null : /* @__PURE__ */ jsx5("span", {
                children: meta
              })
            ]
          }),
          /* @__PURE__ */ jsx5("div", {
            ...minInlinePresentation,
            className: cn5("hraness-design-chat-message__body", minInlinePresentation.className),
            children
          }),
          actions === undefined ? null : /* @__PURE__ */ jsx5("footer", {
            ...rowPresentation,
            className: cn5("hraness-design-chat-message__actions", rowPresentation.className),
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
  ...props6
}) {
  const presentation = stylex5.props(chatStyles.composer);
  const handleSubmit = (event) => {
    event.preventDefault();
    if (isDisabled || isPending || value.trim().length === 0)
      return;
    onSubmit();
  };
  return /* @__PURE__ */ jsxs4("form", {
    ...presentation,
    ...props6,
    className: cn5("hraness-design-chat-composer", presentation.className, className),
    onSubmit: handleSubmit,
    children: [
      /* @__PURE__ */ jsx5(TextAreaField, {
        ...placeholder === undefined ? {} : {
          placeholder
        },
        className: "hraness-design-chat-composer__field",
        isDisabled,
        label,
        onChange: onValueChange,
        showLabel: false,
        surface: "pane",
        textAreaProps: {
          rows: 2
        },
        value
      }),
      /* @__PURE__ */ jsx5(Button, {
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
import { jsx as jsx6 } from "react/jsx-runtime";
var DesignThemeContext = createContext({});
function DesignPortalThemeProvider({
  children,
  portalClassName,
  theme
}) {
  const value = useMemo(() => ({
    ...portalClassName === undefined ? {} : {
      portalClassName
    },
    ...theme === undefined ? {} : {
      theme
    }
  }), [portalClassName, theme]);
  return /* @__PURE__ */ jsx6(DesignThemeContext.Provider, {
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
// src/react/design-palette.tsx
import { AppearanceIcon, cn as cn6 } from "@hraness/ui";
import * as stylex6 from "@stylexjs/stylex";
import { createContext as createContext2, useContext as useContext2, useEffect as useEffect3, useId, useMemo as useMemo2, useRef as useRef2, useState as useState2, useSyncExternalStore } from "react";

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
  manager.disabledMetas.set(meta, {
    media: meta.getAttribute("media")
  });
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
    attributeFilter: ["content", "media", "name", themeColorSyncActiveAttribute, themeColorSyncDisabledAttribute],
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

// src/browser/design-palette.ts
var installationKey = Symbol.for("hraness.design-palette.controller.v1");
var darkQuery = "(prefers-color-scheme: dark)";
function designPaletteSnapshot(preference, systemPrefersDark, isForced = false) {
  const resolved = resolveDesignPalettePreference(preference, systemPrefersDark);
  const theme = getDesignPaletteTheme(resolved.palette, resolved.mode);
  return Object.freeze({
    preference: Object.freeze({
      ...preference
    }),
    resolvedMode: resolved.mode,
    className: theme.className,
    background: theme.background,
    isForced
  });
}
function readStorage(storage, key) {
  try {
    return storage?.getItem(key);
  } catch {
    return;
  }
}
function writeStorage(storage, key, preference) {
  try {
    storage?.setItem(key, JSON.stringify(preference));
  } catch {}
}
function initDesignPalette(options = {}) {
  const document2 = options.document ?? globalThis.document;
  if (document2 === undefined || document2.documentElement === null || document2.head === null) {
    throw new Error("initDesignPalette requires an HTML document with a head.");
  }
  const view = document2.defaultView;
  const root = document2.documentElement;
  const storageKey = options.storageKey ?? designPaletteStorageKey;
  const legacyStorageKey = options.legacyStorageKey === undefined ? designThemeStorageKey : options.legacyStorageKey;
  if (storageKey.trim() === "" || legacyStorageKey?.trim() === "")
    throw new Error("Appearance storage keys must not be blank.");
  const fallback = normalizeDesignPalettePreference(options.defaultPreference);
  const forced = options.forcedPreference === undefined ? null : parseDesignPalettePreference(options.forcedPreference);
  if (options.forcedPreference !== undefined && (forced === null || forced.mode === "system")) {
    throw new Error("A forced palette requires a valid palette and a light or dark mode.");
  }
  const configuration = JSON.stringify({
    storageKey,
    legacyStorageKey,
    fallback,
    forced
  });
  const ownerDocument = document2;
  const previous = ownerDocument[installationKey];
  if (previous !== undefined) {
    if (previous.version !== 1 || previous.configuration !== configuration) {
      throw new Error("This document already has a different palette configuration.");
    }
    return previous.acquire();
  }
  let storage = options.storage ?? null;
  const usesDefaultStorage = options.storage === undefined;
  if (usesDefaultStorage && forced === null) {
    try {
      storage = view?.localStorage ?? null;
    } catch {}
  }
  let media = null;
  try {
    media = view?.matchMedia?.(darkQuery) ?? null;
  } catch {}
  const readPreference = () => {
    if (forced !== null)
      return forced;
    const raw = readStorage(storage, storageKey);
    const saved = parseDesignPalettePreference(raw);
    if (saved !== null)
      return saved;
    if ((raw === null || raw === undefined) && legacyStorageKey !== null) {
      const legacy = readStorage(storage, legacyStorageKey);
      if (isDesignTheme(legacy))
        return Object.freeze({
          palette: fallback.palette,
          mode: legacy
        });
    }
    return fallback;
  };
  let snapshot = designPaletteSnapshot(readPreference(), media?.matches ?? false, forced !== null);
  const listeners = new Set;
  const ownedClasses = new Set(designPalettes.flatMap((palette) => ["light", "dark"].flatMap((mode) => getDesignPaletteTheme(palette, mode).className.split(/\s+/u))));
  const themeColor = acquireThemeColorMeta(document2, "theme-color", Symbol("palette-theme-color"), snapshot.background);
  const apply = () => {
    const nextClasses = new Set(snapshot.className.split(/\s+/u).filter(Boolean));
    for (const token of ownedClasses)
      if (token !== "" && !nextClasses.has(token))
        root.classList.remove(token);
    for (const token of nextClasses)
      root.classList.add(token);
    root.setAttribute("data-palette", snapshot.preference.palette);
    root.setAttribute("data-theme", snapshot.resolvedMode);
    themeColor.update(snapshot.background);
  };
  const update = (preference) => {
    const next = designPaletteSnapshot(preference, media?.matches ?? false, forced !== null);
    if (next.preference.palette === snapshot.preference.palette && next.preference.mode === snapshot.preference.mode && next.resolvedMode === snapshot.resolvedMode)
      return false;
    snapshot = next;
    apply();
    for (const listener of listeners)
      listener();
    return true;
  };
  const onMedia = () => {
    update(snapshot.preference);
  };
  const onStorage = (event) => {
    if (forced !== null || event.key !== storageKey && event.key !== null)
      return;
    if (usesDefaultStorage && event.storageArea !== null && event.storageArea !== undefined && event.storageArea !== storage)
      return;
    update(readPreference());
  };
  apply();
  if (forced === null) {
    writeStorage(storage, storageKey, snapshot.preference);
    view?.addEventListener("storage", onStorage);
    media?.addEventListener("change", onMedia);
  }
  let owners = 0;
  const installation = {
    version: 1,
    configuration,
    acquire: () => {
      owners += 1;
      let disposed = false;
      const subscriptions = new Set;
      return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
          if (disposed)
            return () => {
              return;
            };
          const subscription = () => {
            listener();
          };
          subscriptions.add(subscription);
          listeners.add(subscription);
          return () => {
            subscriptions.delete(subscription);
            listeners.delete(subscription);
          };
        },
        setPreference: (value) => {
          if (disposed || forced !== null)
            return false;
          const preference = parseDesignPalettePreference(value);
          if (preference === null)
            throw new Error("Choose a supported palette and appearance mode.");
          writeStorage(storage, storageKey, preference);
          return update(preference);
        },
        dispose: () => {
          if (disposed)
            return;
          disposed = true;
          for (const listener of subscriptions)
            listeners.delete(listener);
          subscriptions.clear();
          owners -= 1;
          if (owners !== 0)
            return;
          view?.removeEventListener("storage", onStorage);
          media?.removeEventListener("change", onMedia);
          themeColor.release();
          if (ownerDocument[installationKey] === installation)
            Reflect.deleteProperty(ownerDocument, installationKey);
        }
      };
    }
  };
  ownerDocument[installationKey] = installation;
  return installation.acquire();
}

// src/react/design-palette.stylex.ts
var paletteMenuStyles = {
  icon: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x3nfvp2",
    kjj79g: "xl56j7k",
    kLWn49: "x14ju556",
    $$css: true
  },
  root: {
    k1xSpc: "x3nfvp2",
    kVAEAm: "x1n2onr6",
    kdYMnH: "xesnm00",
    $$css: true
  },
  trigger: {
    kGNEyG: "x6s0dn4",
    kWkggS: "x17tv4j5",
    kVAM5u: "x1w4nuvj",
    kaIpWk: "xyz7jqb",
    ksu8eU: "x1y0btm7",
    kMzoRj: "xmkeg23",
    kMwMTN: "xm06a53",
    kkrTdU: "x1ypdohk",
    k1xSpc: "x3nfvp2",
    kjj79g: "xl56j7k",
    kH6xsr: "x3ct3a4",
    kVQ08L: "x1qwoi4t",
    kdYMnH: "x9hh0qe",
    kjBf7l: "x1mixbcr",
    kInvED: "x1ewu8gn",
    k8WAf4: "x18g2hj5",
    kg3NbH: "xvpgqt4",
    kfSwDN: "x87ps6o",
    $$css: true
  },
  triggerDefault: {
    kVQ08L: "x1j3ipif",
    kdYMnH: "xz1t8dp",
    $$css: true
  },
  panel: {
    kWkggS: "x1awrtuo",
    kVAM5u: "x1w4nuvj",
    kaIpWk: "xvy3trx",
    ksu8eU: "x1y0btm7",
    kMzoRj: "xmkeg23",
    kGVxlE: "xl8zne6",
    kMwMTN: "xxfsttr",
    k1xSpc: "xrvj5dj",
    kOIVth: "x8233eu",
    kUvb1J: "x1g9am0e",
    k7w2rI: "xtijo5x",
    kULEZF: "x1052wsp",
    kLO5vc: "xwnj3u5",
    kVQacm: "xysyzu8",
    k8WAf4: "xo0yzjp",
    kg3NbH: "x1ryrjj2",
    kVAEAm: "x10l6tqk",
    kVCA4M: "x1guzgd5",
    $$css: true
  },
  group: {
    kMzoRj: "xc342km",
    k1xSpc: "xrvj5dj",
    kOIVth: "x1enigpx",
    kqGvvJ: "x10im51j",
    kUOVxO: "xrxpjvj",
    kdYMnH: "xesnm00",
    k8WAf4: "xt970qd",
    kg3NbH: "xnjsko4",
    $$css: true
  },
  legend: {
    kMwMTN: "x12x9krh",
    kGuDYH: "xkpwil5",
    k63SB2: "xh88oxj",
    kLWn49: "x1evy7pa",
    k1K539: "x18jvhmb",
    kg3NbH: "x97vtpp",
    $$css: true
  },
  choice: {
    kGNEyG: "x6s0dn4",
    kaIpWk: "xyz7jqb",
    kkrTdU: "x1ypdohk",
    k1xSpc: "x78zum5",
    kGuDYH: "x1jchvi3",
    kOIVth: "xb6y1gh",
    kLWn49: "x37zpob",
    kVQ08L: "x4q3qzj",
    k8WAf4: "x1bilvtl",
    kg3NbH: "x97vtpp",
    $$css: true
  },
  radio: {
    keaTxX: "x1vgqp62",
    kmuXW: "x2lah0s",
    kLWsYc: "x38bysi",
    kULEZF: "x1milg1j",
    kqGvvJ: "x10im51j",
    kUOVxO: "xrxpjvj",
    $$css: true
  }
};

// src/react/design-palette.tsx
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
import { createElement } from "react";
var DesignPaletteContext = createContext2(null);
var noSubscribe = () => () => {
  return;
};
function isNode(target) {
  return target !== null && "nodeType" in target;
}
function DesignPaletteProvider({
  children,
  defaultPreference = defaultDesignPalettePreference,
  forcedPreference,
  storageKey,
  legacyStorageKey
}) {
  const fallback = useMemo2(() => normalizeDesignPalettePreference(defaultPreference), [defaultPreference.palette, defaultPreference.mode]);
  const forced = useMemo2(() => forcedPreference === undefined ? undefined : {
    ...forcedPreference
  }, [forcedPreference?.palette, forcedPreference?.mode]);
  const serverSnapshot = useMemo2(() => designPaletteSnapshot(forced ?? fallback, false, forced !== undefined), [fallback, forced]);
  const [controller, setController] = useState2(null);
  useEffect3(() => {
    const current = initDesignPalette({
      defaultPreference: fallback,
      ...forced === undefined ? {} : {
        forcedPreference: forced
      },
      ...storageKey === undefined ? {} : {
        storageKey
      },
      ...legacyStorageKey === undefined ? {} : {
        legacyStorageKey
      }
    });
    setController(current);
    return () => {
      current.dispose();
    };
  }, [fallback, forced, storageKey, legacyStorageKey]);
  const snapshot = useSyncExternalStore(controller?.subscribe ?? noSubscribe, controller?.getSnapshot ?? (() => serverSnapshot), () => serverSnapshot);
  const value = useMemo2(() => ({
    ...snapshot,
    ready: controller !== null,
    setPreference: (preference) => {
      controller?.setPreference(preference);
    },
    setPalette: (palette) => {
      controller?.setPreference({
        ...controller.getSnapshot().preference,
        palette
      });
    },
    setMode: (mode) => {
      controller?.setPreference({
        ...controller.getSnapshot().preference,
        mode
      });
    }
  }), [snapshot, controller]);
  return /* @__PURE__ */ jsx7(DesignPaletteContext.Provider, {
    value,
    children: /* @__PURE__ */ jsx7(DesignPortalThemeProvider, {
      portalClassName: snapshot.className,
      theme: snapshot.resolvedMode,
      children
    })
  });
}
function useDesignPalette() {
  return useContext2(DesignPaletteContext);
}
function DesignPaletteMenuButton({
  "aria-label": ariaLabel = "Appearance",
  className,
  labels,
  size = "compact",
  onChange,
  value: controlledMode
}) {
  const palette = useDesignPalette();
  const detailsRef = useRef2(null);
  const groupId = useId();
  useEffect3(() => {
    const details = detailsRef.current;
    if (details === null)
      return;
    const document2 = details.ownerDocument;
    const outside = (event) => {
      if (details.open && isNode(event.target) && !details.contains(event.target))
        details.open = false;
    };
    const escape = (event) => {
      if (event.key !== "Escape" || !details.open)
        return;
      event.preventDefault();
      details.open = false;
      details.querySelector("summary")?.focus();
    };
    document2.addEventListener("pointerdown", outside);
    details.addEventListener("keydown", escape);
    return () => {
      document2.removeEventListener("pointerdown", outside);
      details.removeEventListener("keydown", escape);
    };
  }, []);
  if (palette === null)
    throw new Error("DesignPaletteMenuButton requires DesignPaletteProvider.");
  const mode = controlledMode ?? palette.preference.mode;
  const ready = palette.ready && !palette.isForced;
  const title = `${ariaLabel}: ${designPaletteLabels[palette.preference.palette]}, ${designThemeLabel(mode, labels)}`;
  return /* @__PURE__ */ jsxs5("details", {
    ...stylex6.props(paletteMenuStyles.root),
    className: cn6("hraness-design-theme-toggle", "hraness-design-palette-menu", stylex6.props(paletteMenuStyles.root).className, className),
    "data-hraness-appearance-menu": "",
    "data-presentation": "menu",
    "data-ready": ready ? "true" : "false",
    ref: detailsRef,
    onBlur: (event) => {
      if (isNode(event.relatedTarget) && !event.currentTarget.contains(event.relatedTarget))
        event.currentTarget.open = false;
    },
    children: [
      /* @__PURE__ */ jsx7("summary", {
        ...stylex6.props(paletteMenuStyles.trigger, size === "default" && paletteMenuStyles.triggerDefault),
        "aria-disabled": !ready || undefined,
        "aria-label": title,
        onClick: (event) => {
          if (!ready)
            event.preventDefault();
        },
        tabIndex: ready ? 0 : -1,
        title,
        children: /* @__PURE__ */ jsx7(AppearanceIcon, {
          name: mode,
          xstyle: paletteMenuStyles.icon
        })
      }),
      /* @__PURE__ */ jsxs5("div", {
        ...stylex6.props(paletteMenuStyles.panel),
        children: [
          /* @__PURE__ */ jsxs5("fieldset", {
            ...stylex6.props(paletteMenuStyles.group),
            disabled: !ready,
            children: [
              /* @__PURE__ */ jsx7("legend", {
                ...stylex6.props(paletteMenuStyles.legend),
                children: "Theme"
              }),
              designPalettes.map((id) => /* @__PURE__ */ createElement("label", {
                ...stylex6.props(paletteMenuStyles.choice),
                key: id
              }, /* @__PURE__ */ jsx7("input", {
                ...stylex6.props(paletteMenuStyles.radio),
                checked: palette.preference.palette === id,
                name: `${groupId}-palette`,
                onChange: () => palette.setPalette(id),
                type: "radio",
                value: id
              }), /* @__PURE__ */ jsx7("span", {
                children: designPaletteLabels[id]
              })))
            ]
          }),
          /* @__PURE__ */ jsxs5("fieldset", {
            ...stylex6.props(paletteMenuStyles.group),
            disabled: !ready,
            children: [
              /* @__PURE__ */ jsx7("legend", {
                ...stylex6.props(paletteMenuStyles.legend),
                children: "Appearance"
              }),
              designThemes.map((id) => /* @__PURE__ */ createElement("label", {
                ...stylex6.props(paletteMenuStyles.choice),
                key: id
              }, /* @__PURE__ */ jsx7("input", {
                ...stylex6.props(paletteMenuStyles.radio),
                checked: mode === id,
                name: `${groupId}-mode`,
                onChange: () => {
                  if (onChange === undefined)
                    palette.setMode(id);
                  else
                    onChange(id);
                },
                type: "radio",
                value: id
              }), /* @__PURE__ */ jsx7("span", {
                children: designThemeLabel(id, labels)
              })))
            ]
          })
        ]
      })
    ]
  });
}
// src/react/design-gallery.tsx
import { Badge, Button as Button2, Card, CardContent, CardDescription, CardHeader, CardTitle, Icon as Icon3, LinkButton, SegmentedControl, Slider, Tag, ViewportFrame, WrappingRow } from "@hraness/ui";
import { Chart01Icon, CodeIcon, DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import { useState as useState3 } from "react";

// src/react/fader.tsx
import { Label, Slider as AriaSlider, SliderFill, SliderOutput, SliderThumb, SliderTrack } from "react-aria-components";
import * as stylex7 from "@stylexjs/stylex";
import { cn as cn7 } from "@hraness/ui";

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
  ...props8
}) {
  const rootPresentation = stylex7.props(faderStyles.root, density === "compact" && faderStyles.compact, orientation === "horizontal" && faderStyles.horizontalRoot);
  const labelRowPresentation = stylex7.props(faderStyles.labelRow);
  const captionPresentation = stylex7.props(faderStyles.caption);
  const trackPresentation = stylex7.props(faderStyles.track, orientation === "horizontal" && faderStyles.horizontalTrack);
  const trackRailPresentation = stylex7.props(faderStyles.rail, faderStyles.trackRail);
  const fillRailPresentation = stylex7.props(faderStyles.rail, faderStyles.fillRail);
  return /* @__PURE__ */ jsxs6(AriaSlider, {
    ...props8,
    className: cn7("hraness-design-fader", rootPresentation.className, className),
    "data-density": density,
    orientation,
    ref: faderRef,
    children: [
      showLabel && labelAccessory !== undefined ? /* @__PURE__ */ jsxs6("div", {
        className: cn7("hraness-design-fader__label-row", labelRowPresentation.className),
        children: [
          /* @__PURE__ */ jsx8(Label, {
            className: cn7("hraness-design-fader__label", captionPresentation.className),
            children: label
          }),
          /* @__PURE__ */ jsx8("span", {
            className: "hraness-design-fader__label-accessory",
            children: labelAccessory
          })
        ]
      }) : showLabel ? /* @__PURE__ */ jsx8(Label, {
        className: cn7("hraness-design-fader__label", captionPresentation.className),
        children: label
      }) : /* @__PURE__ */ jsx8(Label, {
        className: "hraness-design-visually-hidden",
        children: label
      }),
      showOutput ? /* @__PURE__ */ jsx8(SliderOutput, {
        className: cn7("hraness-design-fader__output", captionPresentation.className)
      }) : null,
      /* @__PURE__ */ jsxs6(SliderTrack, {
        className: cn7("hraness-design-fader__track", trackPresentation.className),
        children: [
          /* @__PURE__ */ jsx8("span", {
            "aria-hidden": "true",
            className: cn7("hraness-design-fader__track-rail", trackRailPresentation.className)
          }),
          /* @__PURE__ */ jsx8(SliderFill, {
            className: "hraness-design-fader__fill",
            children: /* @__PURE__ */ jsx8("span", {
              "aria-hidden": "true",
              className: cn7("hraness-design-fader__fill-rail", fillRailPresentation.className)
            })
          }),
          /* @__PURE__ */ jsx8(SliderThumb, {
            className: ({
              isFocusVisible
            }) => {
              const thumbPresentation = stylex7.props(faderStyles.thumb, isFocusVisible && faderStyles.focusVisible);
              return cn7("hraness-design-fader__thumb", thumbPresentation.className);
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
import * as stylex8 from "@stylexjs/stylex";
import { cn as cn8 } from "@hraness/ui";
import { createContext as createContext3, useCallback, useContext as useContext3, useEffect as useEffect4, useMemo as useMemo3, useRef as useRef3 } from "react";

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
var FoilDeckContext = createContext3(null);
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
  ...props9
}) {
  const rootRef = useRef3(null);
  const registrations = useRef3(new Map);
  const activeElement = useRef3(null);
  const focusedElement = useRef3(null);
  const pointerElement = useRef3(null);
  const activeBounds = useRef3(null);
  const pendingInteraction = useRef3(null);
  const frame = useRef3(null);
  const resizeObserver = useRef3(null);
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
  const contextValue = useMemo3(() => ({
    register
  }), [register]);
  useEffect4(() => {
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
      ...props9,
      className: cn8("hraness-design-foil-card-deck", className),
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
  const deck = useContext3(FoilDeckContext);
  const rootRef = useRef3(null);
  const seedPose = useMemo3(() => createFoilCardSeedPose(seed), [seed]);
  const seededStyle = poseStyle(seedPose, intensity);
  const selectedPreset = presetStyles[preset];
  const selectedIntensity = intensityStyles[intensity];
  const rootPresentation = stylex8.props(foilCardSurfaceStyles.base, renderMode === "interactive" ? foilCardSurfaceStyles.interactive : foilCardSurfaceStyles.static);
  const basePresentation = stylex8.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.baseLayer, selectedPreset.base, selectedIntensity.base);
  const spectrumPresentation = stylex8.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.spectrumLayer, selectedPreset.spectrum, selectedIntensity.spectrum);
  const sheenPresentation = stylex8.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.sheenLayer, selectedIntensity.sheen);
  const texturePresentation = stylex8.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.textureLayer, selectedPreset.texture, selectedIntensity.texture);
  const ornamentPresentation = stylex8.props(foilCardSurfaceStyles.layer, foilCardSurfaceStyles.ornamentLayer, ornamentStyles[ornament], selectedIntensity.ornament);
  const contentPresentation = stylex8.props(foilCardSurfaceStyles.content);
  const activePresentation = stylex8.props(foilCardSurfaceStyles.active);
  useEffect4(() => {
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
    className: cn8("hraness-design-foil-card-surface", rootPresentation.className, className),
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
import { createElement as createElement2, forwardRef, useCallback as useCallback2, useEffect as useEffect5, useRef as useRef4 } from "react";
import * as stylex9 from "@stylexjs/stylex";
import { cn as cn9 } from "@hraness/ui";

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

// src/react/jelly-surface.stylex.ts
var jellySurfaceStyles = {
  root: {
    kawU7v: "x1cfjbvc",
    k5BUTg: "x1a4igh8",
    kqOd84: "xsdpl10",
    kzPi7L: "x1sz4vi2",
    kEz803: "x4aylkk",
    "--jelly-card-padding-block": "x1bbk1wc",
    "--jelly-card-padding-inline": "xhowent",
    "--jelly-card-font-size": "xwi17fr",
    "--jelly-radius": "x317v68",
    "--jelly-fill": "x138r0kg",
    "--jelly-label": "xf4onzy",
    "--jelly-color-border-default": "x1kr16q7",
    kVAEAm: "x1n2onr6",
    kHBbk8: "xc8icb0",
    k1xSpc: "x1lliihq",
    kB7OPa: "x9f619",
    kaIpWk: "x16gy7dz",
    kMwMTN: "x1eebzld xs5hli",
    kMv6JI: "xjb2p0i",
    kV0H8L: "x10rt0pk",
    krGR0G: "xvmqkbn",
    kqBzK6: "x1rcybi7",
    kHiXq7: "x61gc8y",
    kC21eY: "xd4aj15",
    ka26j: "xkyhvkk",
    kGuDYH: "x1qlqyl8",
    kKX8nH: "x1t35e8",
    k63SB2: "x1pd3egz",
    kjAs5C: "x1aazh3f",
    kQqvRs: "x1xh6y1q",
    kLWn49: "x15bjb6t",
    kWkggS: "x9yvj25",
    kVAM5u: "x1w1tqly",
    ksu8eU: "xx61lck",
    kMzoRj: "x13rsnn2",
    kGVxlE: "xwaqzdf",
    k1ekBW: "x4wkmsb",
    $$css: true
  },
  primary: {
    "--jelly-fill": "x1va3v6u",
    "--jelly-label": "x3o2ea9",
    $$css: true
  },
  quiet: {
    "--jelly-fill": "x152g019",
    "--jelly-label": "x183l2pk",
    $$css: true
  },
  danger: {
    "--jelly-fill": "x13ywtpv",
    "--jelly-label": "xbz0pe5",
    $$css: true
  },
  field: {
    "--jelly-fill": "x16wb4my",
    "--jelly-radius": "xve0zjm",
    $$css: true
  },
  overlay: {
    "--jelly-fill": "x19km55x",
    "--jelly-label": "xek99g9",
    "--jelly-radius": "xrfn3cn",
    $$css: true
  },
  neutralHovered: {
    "--jelly-fill": "x138r0kg x8rjkku",
    $$css: true
  },
  primaryHovered: {
    "--jelly-fill": "x1va3v6u xm3mlto",
    $$css: true
  },
  disabled: {
    "--jelly-fill": "x1vynlns x1tre9y0",
    "--jelly-label": "x1ng5emh",
    kkrTdU: "x1h6gzvc",
    $$css: true
  },
  selectableText: {
    kfSwDN: "x1hx0egp",
    $$css: true
  }
};

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
  ...props10
}, forwardedRef) {
  const hostRef = useRef4(null);
  const activePointer = useRef4(null);
  const activeReleaseListeners = useRef4(null);
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
  useEffect5(() => {
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
  return createElement2(JellyCard, {
    ...props10,
    className: cn9("hraness-design-jelly-surface", stylex9.props(jellySurfaceStyles.root, tone === "danger" && jellySurfaceStyles.danger, tone === "field" && jellySurfaceStyles.field, tone === "overlay" && jellySurfaceStyles.overlay, tone === "primary" && jellySurfaceStyles.primary, tone === "quiet" && jellySurfaceStyles.quiet, tone === "neutral" && jellySurfaceStyles.neutralHovered, tone === "primary" && jellySurfaceStyles.primaryHovered, (isDisabled || isPending) && jellySurfaceStyles.disabled, interaction !== "press" && jellySurfaceStyles.selectableText).className, className),
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
import { Link, cn as cn10 } from "@hraness/ui";
import * as stylex10 from "@stylexjs/stylex";

// src/react/navigation-rail.stylex.ts
var navigationRailStyles = {
  item: {
    kGNEyG: "x6s0dn4",
    kaIpWk: "x1c6t507",
    kMwMTN: "x17j02y5",
    k1xSpc: "xrvj5dj",
    kOIVth: "xmgkybt",
    kumcoG: "xx9t13c",
    kVQ08L: "x3adhqr",
    kmVPX3: "x15skzh0",
    kybGjl: "x1hl2dhg",
    $$css: true
  },
  itemActive: {
    ku1ltF: "x1fdtg7e x852r0y",
    kHypHr: "x1u7o2vf x1yjm9pw",
    kKwaWg: "x18o3ruo x1aysnjn",
    kl9DO0: "x12koezg x1w7rtzm",
    k1YJky: "x1y4qj14 x123h4s9",
    kz484i: "x182nak8 x1xqmp8",
    kgSjnq: "x103pssi xontfw7",
    kWkggS: "x1ut2sa4 xx8mfso",
    kMwMTN: "x154ywzv x89zja",
    $$css: true
  },
  itemCopy: {
    k1xSpc: "xrvj5dj",
    kOIVth: "x1enigpx",
    kdYMnH: "xesnm00",
    $$css: true
  },
  itemDescription: {
    kMwMTN: "x17j02y5",
    kGuDYH: "xaasd0c",
    kHjlTd: "xj0a0fe",
    $$css: true
  },
  itemIcon: {
    k1xSpc: "xwz0xwf",
    kgQiWS: "x1ku5rj1",
    $$css: true
  },
  itemLabel: {
    k63SB2: "x1e4wzip",
    kHjlTd: "xj0a0fe",
    $$css: true
  },
  itemNativeInteractionFallbacks: {
    ku1ltF: "x852r0y",
    kHypHr: "x1yjm9pw",
    kKwaWg: "x1aysnjn",
    kl9DO0: "x1w7rtzm",
    k1YJky: "x123h4s9",
    kz484i: "x1xqmp8",
    kgSjnq: "xontfw7",
    kWkggS: "x18e72hl",
    kMwMTN: "x11ffpz8",
    kjBf7l: "x2bii8l",
    kInvED: "xecyca2",
    k3XXqK: "xq2elj",
    kMeerF: "x1g4ssbw",
    $$css: true
  },
  navigation: {
    kfiyM8: "x10ukxgv",
    k1xSpc: "xrvj5dj",
    kUk6DE: "x12lumcd",
    kOIVth: "xzci21y",
    kVQ08L: "x159srwy",
    kVQacm: "xysyzu8",
    kmVPX3: "xg94cu2",
    $$css: true
  },
  rail: {
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x103pssi",
    kWkggS: "xuvt9l",
    kLWsYc: "xuxy95z",
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kVQ08L: "x159srwy",
    $$css: true
  },
  railEdge: {
    kUk6DE: "x3psx0u",
    kmVPX3: "xyz91iy",
    $$css: true
  },
  section: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xmgkybt",
    $$css: true
  },
  sectionItems: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xm15xud",
    $$css: true
  },
  sectionTitle: {
    kMwMTN: "x17j02y5",
    kGuDYH: "xaasd0c",
    k63SB2: "x1e4wzip",
    kb6lSQ: "x1vyo3qp",
    kogj98: "x1ghz6dp",
    kJVvJu: "xv2ckdy",
    kP9fke: "xtvhhri",
    $$css: true
  }
};

// src/react/navigation-rail.tsx
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
function NavigationRail({
  "aria-label": ariaLabel = "Primary navigation",
  children,
  className,
  footer,
  header,
  ...props11
}) {
  const rootPresentation = stylex10.props(navigationRailStyles.rail);
  const edgePresentation = stylex10.props(navigationRailStyles.railEdge);
  const navigationPresentation = stylex10.props(navigationRailStyles.navigation);
  return /* @__PURE__ */ jsxs8("aside", {
    ...rootPresentation,
    ...props11,
    "aria-label": ariaLabel,
    className: cn10("hraness-design-navigation-rail", rootPresentation.className, className),
    children: [
      header === undefined ? null : /* @__PURE__ */ jsx10("header", {
        ...edgePresentation,
        className: cn10("hraness-design-navigation-rail__header", edgePresentation.className),
        children: header
      }),
      /* @__PURE__ */ jsx10("nav", {
        ...navigationPresentation,
        "aria-label": ariaLabel,
        className: cn10("hraness-design-navigation-rail__navigation", navigationPresentation.className),
        children
      }),
      footer === undefined ? null : /* @__PURE__ */ jsx10("footer", {
        ...edgePresentation,
        className: cn10("hraness-design-navigation-rail__footer", edgePresentation.className),
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
  ...props11
}) {
  const Heading = titleAs;
  const rootPresentation = stylex10.props(navigationRailStyles.section);
  const titlePresentation = stylex10.props(navigationRailStyles.sectionTitle);
  const itemsPresentation = stylex10.props(navigationRailStyles.sectionItems);
  return /* @__PURE__ */ jsxs8("section", {
    ...rootPresentation,
    ...props11,
    className: cn10("hraness-design-rail-section", rootPresentation.className, className),
    children: [
      title === undefined ? null : /* @__PURE__ */ jsx10(Heading, {
        ...titlePresentation,
        className: cn10("hraness-design-rail-section__title", titlePresentation.className),
        children: title
      }),
      /* @__PURE__ */ jsx10("div", {
        ...itemsPresentation,
        className: cn10("hraness-design-rail-section__items", itemsPresentation.className),
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
  xstyle,
  ...props11
}) {
  const iconPresentation = stylex10.props(navigationRailStyles.itemIcon);
  const copyPresentation = stylex10.props(navigationRailStyles.itemCopy);
  const labelPresentation = stylex10.props(navigationRailStyles.itemLabel);
  const descriptionPresentation = stylex10.props(navigationRailStyles.itemDescription);
  return /* @__PURE__ */ jsxs8(Link, {
    ...props11,
    "aria-current": isActive ? "page" : undefined,
    className: cn10("hraness-design-rail-item", className),
    href,
    xstyle: [navigationRailStyles.item, navigationRailStyles.itemNativeInteractionFallbacks, isActive && navigationRailStyles.itemActive, xstyle],
    children: [
      icon === undefined ? null : /* @__PURE__ */ jsx10("span", {
        ...iconPresentation,
        "aria-hidden": "true",
        className: cn10("hraness-design-rail-item__icon", iconPresentation.className),
        children: icon
      }),
      /* @__PURE__ */ jsxs8("span", {
        ...copyPresentation,
        className: cn10("hraness-design-rail-item__copy", copyPresentation.className),
        children: [
          /* @__PURE__ */ jsx10("span", {
            ...labelPresentation,
            className: cn10("hraness-design-rail-item__label", labelPresentation.className),
            children: label
          }),
          description === undefined ? null : /* @__PURE__ */ jsx10("span", {
            ...descriptionPresentation,
            className: cn10("hraness-design-rail-item__description", descriptionPresentation.className),
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
import { Icon as Icon2, IconButton as IconButton2, Spinner, Toolbar, cn as cn11 } from "@hraness/ui";
import * as stylex11 from "@stylexjs/stylex";

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
  const rootPresentation = stylex11.props(playbackTransportStyles.root);
  const glyphPresentation = stylex11.props(playbackTransportStyles.glyph);
  return /* @__PURE__ */ jsxs9(Toolbar, {
    ...accessibleName,
    className: cn11("hraness-design-playback-transport", rootPresentation.className, className),
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
import * as stylex12 from "@stylexjs/stylex";

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
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    k4V0xq: "x1djed8t",
    krFJ6x: "xn5uptl",
    kP1A0P: "xhjnd2s",
    kGVxlE: "xlmpfgd",
    kMwMTN: "xam1lc8",
    k1xSpc: "x78zum5",
    kwnvtZ: "x1a02dak",
    kMv6JI: "xumcc2o",
    kGuDYH: "xj8twjj",
    kOIVth: "x5kxhqv",
    kUvb1J: "xlb5a52",
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
  const noticePresentation = stylex12.props(productionDataPreviewNoticeStyles.root);
  const emphasisPresentation = stylex12.props(productionDataPreviewNoticeStyles.emphasis);
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
var designGallerySections = [{
  id: "foundation",
  label: "Foundation"
}, {
  id: "marketing",
  label: "Marketing"
}, {
  id: "shells",
  label: "Shells"
}, {
  id: "data",
  label: "Data"
}, {
  id: "effects",
  label: "Effects"
}, {
  id: "syntax",
  label: "Syntax"
}];
var designGalleryTouchKinds = ["button", "link", "radio", "range"];
var designGalleryRecipeCoverage = ["@hraness/ui primitives", "animated rail stage", "application shells", "charts", "chat message and composer", "dither surface", "fader", "foil card surface", "layout surfaces", "Jelly presentation", "playback transport", "plain site and publication grammar", "product-marketing grammar", "Nebula Sans typography", "procedural effects", "production preview notice", "syntax highlighting"];
function resolveGalleryTheme(theme, prefersDark) {
  return theme === "system" ? prefersDark ? "dark" : "light" : theme;
}
var barData = [{
  id: "alpha",
  label: "Alpha",
  value: 72,
  detail: "72 requests"
}, {
  id: "beta",
  label: "Beta",
  value: 48,
  detail: "48 requests"
}, {
  id: "gamma",
  label: "Gamma",
  value: 31,
  detail: "31 requests"
}];
var rangeData = [{
  id: "north",
  label: "North",
  minimum: 24,
  median: 51,
  maximum: 78
}, {
  id: "south",
  label: "South",
  minimum: 38,
  median: 64,
  maximum: 82
}];
var foilDeckExamples = [{
  label: "Corner frame",
  ornament: "corners",
  preset: "prism"
}, {
  label: "Rail frame",
  ornament: "rails",
  preset: "etched"
}, {
  label: "Circuit frame",
  ornament: "circuit",
  preset: "fast"
}, {
  label: "Radial frame",
  ornament: "radial",
  preset: "aurora"
}, {
  label: "Facet frame",
  ornament: "facets",
  preset: "max"
}];
function DesignSystemGallery({
  isNestedInMain = false
}) {
  const [density, setDensity] = useState3("default");
  const [chatDraft, setChatDraft] = useState3("Review the presentation contract");
  const [chatSubmission, setChatSubmission] = useState3("");
  const [faderValue, setFaderValue] = useState3(64);
  const [playbackStatus, setPlaybackStatus] = useState3("idle");
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
              items: [{
                id: "compact",
                label: "Compact"
              }, {
                id: "default",
                label: "Default"
              }],
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
        id: "marketing",
        children: [
          /* @__PURE__ */ jsx13("h2", {
            children: "Product-marketing grammar"
          }),
          /* @__PURE__ */ jsxs11(MarketingPage, {
            className: "design-gallery__marketing",
            children: [
              /* @__PURE__ */ jsx13(MarketingSiteHeader, {
                action: {
                  href: "#gallery-install",
                  label: "Install Relay"
                },
                brand: "Relay",
                sticky: false,
                links: [{
                  current: true,
                  href: "#marketing",
                  label: "How it works"
                }, {
                  href: "#gallery-install",
                  label: "Install"
                }, {
                  href: "#shells",
                  label: "Docs"
                }]
              }),
              /* @__PURE__ */ jsx13(ProductHero, {
                actions: [{
                  href: "#gallery-install",
                  label: "Install Relay"
                }, {
                  href: "#shells",
                  label: "See the workspace"
                }],
                boundary: "Free for local use on macOS and Linux · version 1.2.3",
                className: "design-gallery__marketing-hero",
                example: "Ask your agent to run the nightly job and show you the receipt.",
                eyebrow: "A reference developer tool",
                facts: [{
                  detail: "One exact source.",
                  label: "Input",
                  value: "Repository"
                }, {
                  detail: "One inspectable result.",
                  label: "Output",
                  value: "Receipt"
                }, {
                  detail: "Terminal and typed code.",
                  label: "Interfaces",
                  value: "CLI + SDK"
                }],
                factsColumns: 3,
                frame: /* @__PURE__ */ jsx13(MarketingProofFrame, {
                  caption: "Receipt produced by the checked example.",
                  credit: "Captured 5 September 2026",
                  title: "relay run job-01",
                  children: /* @__PURE__ */ jsx13("pre", {
                    className: "design-gallery__marketing-command",
                    children: /* @__PURE__ */ jsx13("code", {
                      children: '{"status":"complete","job":"job-01","durationMs":412}'
                    })
                  })
                }),
                heading: "Move one job across every interface",
                headingId: "design-gallery-marketing-title",
                headingLevel: 3,
                name: "Relay",
                notice: /* @__PURE__ */ jsx13("p", {
                  "data-gallery-marketing-slot": "notice",
                  children: "This example release runs locally."
                }),
                summary: "Relay runs the same job from a terminal, typed code, or a coding agent, and hands back one receipt you can read."
              }),
              /* @__PURE__ */ jsx13(MarketingPillars, {
                ariaLabel: "Relay in three points",
                columns: 3,
                pillars: [{
                  label: "Fast",
                  summary: "Runs locally with no service in the loop."
                }, {
                  label: "Legible",
                  summary: "Every run leaves a receipt you can open."
                }, {
                  label: "Yours",
                  summary: "Source files and credentials stay on your machine."
                }]
              }),
              /* @__PURE__ */ jsxs11(MarketingInstallPanel, {
                eyebrow: "Local release",
                heading: "Install the verified tool.",
                headingId: "design-gallery-install-title",
                headingLevel: 3,
                id: "gallery-install",
                note: /* @__PURE__ */ jsx13("p", {
                  "data-gallery-marketing-slot": "note",
                  children: "Requires Bun 1.3.14."
                }),
                children: [
                  /* @__PURE__ */ jsx13("pre", {
                    className: "design-gallery__marketing-command",
                    children: /* @__PURE__ */ jsx13("code", {
                      children: "bun add --global relay@1.2.3"
                    })
                  }),
                  /* @__PURE__ */ jsx13(MarketingFlow, {
                    ariaLabel: "First Relay job",
                    steps: [{
                      code: "relay init",
                      detail: "Create one workspace.",
                      label: "Initialize"
                    }, {
                      code: "relay run job-01",
                      detail: "Run the named job.",
                      label: "Execute"
                    }, {
                      code: "relay inspect job-01",
                      detail: "Read the resulting receipt.",
                      label: "Inspect"
                    }]
                  })
                ]
              }),
              /* @__PURE__ */ jsx13(MarketingPrimitives, {
                heading: "Small building blocks for serious workflows.",
                headingId: "design-gallery-primitives-title",
                headingLevel: 3,
                items: [{
                  label: "Jobs",
                  summary: "A named unit of work with declared inputs and outputs."
                }, {
                  label: "Receipts",
                  summary: "The durable record of one run, readable by people and agents."
                }, {
                  label: "Schedules",
                  summary: "Run a job on a cadence without another daemon."
                }],
                label: "Primitives",
                summary: "Relay gives agents a few durable objects to compose around the work in front of them."
              }),
              /* @__PURE__ */ jsxs11(MarketingSection, {
                heading: "One durable object.",
                headingId: "gallery-marketing-section",
                headingLevel: 3,
                label: "Workflow",
                layout: "split-reverse",
                summary: "Interfaces share the same identity.",
                children: [
                  /* @__PURE__ */ jsx13(MarketingSectionLabel, {
                    size: "body",
                    children: "Reference"
                  }),
                  /* @__PURE__ */ jsxs11("p", {
                    children: [
                      "Consumer-owned content can include ",
                      /* @__PURE__ */ jsx13("a", {
                        href: "#gallery-install",
                        children: "links"
                      }),
                      " and ",
                      /* @__PURE__ */ jsx13("code", {
                        children: "inline code"
                      }),
                      "."
                    ]
                  })
                ]
              }),
              /* @__PURE__ */ jsx13(MarketingInterfaceGrid, {
                heading: "Choose your interface.",
                headingId: "gallery-marketing-interfaces",
                headingLevel: 3,
                label: "Interfaces",
                interfaces: [{
                  label: "CLI",
                  summary: "Run a named job.",
                  example: /* @__PURE__ */ jsx13("pre", {
                    children: /* @__PURE__ */ jsx13("code", {
                      children: "relay run job-01"
                    })
                  })
                }, {
                  label: "SDK",
                  summary: "Use typed application code."
                }]
              }),
              /* @__PURE__ */ jsx13(MarketingTrustBoundary, {
                heading: "Keep authority visible.",
                headingId: "gallery-marketing-trust",
                headingLevel: 3,
                label: "Boundary",
                items: [{
                  label: "Local",
                  detail: "Source files and credentials."
                }, {
                  label: "Shared",
                  detail: "Only the chosen receipt."
                }]
              }),
              /* @__PURE__ */ jsx13(MarketingStatStrip, {
                ariaLabel: "Relay usage",
                columns: 3,
                source: "Counted from the public example repository on 5 September 2026.",
                stats: [{
                  label: "Example jobs",
                  value: "12"
                }, {
                  label: "Interfaces",
                  detail: "CLI, SDK, Agent Skill",
                  value: "3"
                }, {
                  label: "Accounts required",
                  value: "0"
                }]
              }),
              /* @__PURE__ */ jsx13(MarketingQuoteGrid, {
                heading: "From the people building with it.",
                headingId: "design-gallery-quotes-title",
                headingLevel: 3,
                label: "Quotes",
                quotes: [{
                  name: "A. Example",
                  quote: "A placeholder quote for the gallery only. Product sites render real, attributed quotes or none.",
                  role: "@example"
                }]
              }),
              /* @__PURE__ */ jsx13(MarketingPricing, {
                heading: "Free for local use.",
                headingId: "design-gallery-pricing-title",
                headingLevel: 3,
                label: "Pricing",
                plans: [{
                  action: {
                    href: "#gallery-install",
                    label: "Install Relay"
                  },
                  emphasis: "primary",
                  features: ["Every feature", "Unlimited local jobs", "All future updates"],
                  name: "Local",
                  period: "forever",
                  price: "$0",
                  summary: "Full-featured, with no trial or expiration."
                }, {
                  action: {
                    href: "#shells",
                    label: "Read about sync"
                  },
                  features: ["Everything in Local", "Encrypted sync", "Priority email support"],
                  name: "Sync",
                  note: "Cancel any time.",
                  period: "per year",
                  price: "$49",
                  summary: "Keep receipts in step across your machines."
                }]
              }),
              /* @__PURE__ */ jsx13(MarketingQuestionList, {
                heading: "Questions before installing.",
                headingId: "design-gallery-questions-title",
                headingLevel: 3,
                label: "Questions",
                questions: [{
                  answer: /* @__PURE__ */ jsx13("p", {
                    children: "No. The local workflow works without one."
                  }),
                  question: "Does it require an account?"
                }, {
                  answer: /* @__PURE__ */ jsx13("p", {
                    children: "Nothing leaves your machine unless you turn on sync."
                  }),
                  question: "Does it phone home?"
                }]
              }),
              /* @__PURE__ */ jsx13(MarketingMaker, {
                heading: "Built by a reference maker.",
                headingId: "design-gallery-maker-title",
                headingLevel: 3,
                label: "Built by",
                linkClassName: "design-gallery__maker-link",
                links: [{
                  href: "#marketing",
                  label: "Personal site"
                }],
                children: /* @__PURE__ */ jsx13("p", {
                  children: "A short, plain-words bio: who made it, what they did before, where they are, and why this product exists."
                })
              }),
              /* @__PURE__ */ jsx13(MarketingCallToAction, {
                actions: [{
                  href: "#gallery-install",
                  label: "Install Relay"
                }],
                footnote: "Free for local use on macOS and Linux.",
                heading: "Give every job the same room to run in.",
                headingId: "design-gallery-cta-title",
                headingLevel: 3
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
          }),
          /* @__PURE__ */ jsxs11("div", {
            className: "design-gallery__chat",
            "data-gallery-chat": "",
            "data-gallery-chat-submission": chatSubmission,
            children: [
              /* @__PURE__ */ jsx13(ChatMessage, {
                actions: /* @__PURE__ */ jsx13(Button2, {
                  variant: "quiet",
                  children: "Copy response"
                }),
                avatar: /* @__PURE__ */ jsx13("span", {
                  "aria-hidden": "true",
                  className: "design-gallery__chat-avatar",
                  children: "AI"
                }),
                className: "design-gallery__chat-message",
                meta: "Now",
                name: "Assistant",
                role: "assistant",
                children: /* @__PURE__ */ jsx13("p", {
                  children: "A complete message keeps its ordinary article and slot semantics."
                })
              }),
              /* @__PURE__ */ jsx13(ChatMessage, {
                role: "user",
                children: /* @__PURE__ */ jsx13("p", {
                  children: "Responsive composition belongs to the extracted package recipe."
                })
              }),
              /* @__PURE__ */ jsx13(ChatComposer, {
                action: "/gallery-chat-submit",
                "aria-label": "Gallery message composer",
                className: "design-gallery__chat-composer",
                onSubmit: () => {
                  setChatSubmission(chatDraft);
                  setChatDraft("");
                },
                onValueChange: setChatDraft,
                placeholder: "Write a message",
                sendLabel: "Send message",
                value: chatDraft
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
import { useCallback as useCallback3, useEffect as useEffect6 } from "react";
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
    environment.document.dispatchEvent(new environment.window.CustomEvent(HAPTIC_FEEDBACK_EVENT_NAME, {
      detail
    }));
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
    const pendingEngine = loadModule().then(({
      WebHaptics
    }) => {
      if (!isHapticBrowserEnvironment(environment))
        return null;
      const candidate = new WebHaptics({
        debug: false,
        showSwitch: false
      });
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
        dispatchHapticFeedbackEvent(environment, {
          feedback,
          input
        });
        return true;
      } catch {
        return false;
      }
    }
  };
}
var browserHaptics = createHapticFeedbackController(globalThis, async () => {
  const {
    WebHaptics
  } = await import("web-haptics");
  return {
    WebHaptics
  };
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
  useEffect6(() => {
    if (enabled)
      prepareHapticFeedback();
  }, [enabled]);
  return useCallback3(async (feedback = "press") => enabled ? await triggerHapticFeedback(feedback) : false, [enabled]);
}
// src/react/keyboard-shortcuts.ts
import { useEffect as useEffect7, useRef as useRef5 } from "react";
var interactiveTargetSelector = ["a[href]", "area[href]", "button", "input", "select", "summary", "textarea", "[contenteditable]:not([contenteditable='false'])", "[role='button']", "[role='checkbox']", "[role='combobox']", "[role='gridcell']", "[role='link']", "[role='menuitem']", "[role='option']", "[role='radio']", "[role='slider']", "[role='spinbutton']", "[role='switch']", "[role='tab']", "[role='textbox']", "[tabindex]:not([tabindex='-1'])"].join(",");
var textEntryTargetSelector = ["input:not([type='button']):not([type='checkbox']):not([type='color']):not([type='file']):not([type='hidden']):not([type='image']):not([type='radio']):not([type='range']):not([type='reset']):not([type='submit'])", "select", "textarea", "[contenteditable]:not([contenteditable='false'])", "[role='combobox']", "[role='textbox']"].join(",");
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
    return {
      kind: "ignore",
      reason: "disabled"
    };
  if (event.defaultPrevented)
    return {
      kind: "ignore",
      reason: "default-prevented"
    };
  if (event.isComposing)
    return {
      kind: "ignore",
      reason: "composing"
    };
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
    return {
      bindingId: shortcut.id,
      bindingIndex,
      kind: "handle"
    };
  }
  return {
    kind: "ignore",
    reason: suppressedReason ?? "no-match"
  };
}
function isNode2(target) {
  return target !== null && typeof Node !== "undefined" && target instanceof Node;
}
function useKeyboardShortcuts(bindings, options = {}) {
  const latestRef = useRef5({
    bindings,
    isDisabled: options.isDisabled ?? false
  });
  latestRef.current = {
    bindings,
    isDisabled: options.isDisabled ?? false
  };
  const scopeRef = options.scopeRef;
  useEffect7(() => {
    const onKeyDown = (event) => {
      if (scopeRef !== undefined) {
        const scope = scopeRef.current;
        if (scope === null || !isNode2(event.target) || !scope.contains(event.target))
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
import { Button as Button3, EmptyState, LinkButton as LinkButton2, Skeleton, Spinner as Spinner2, cn as cn13 } from "@hraness/ui";
import * as stylex14 from "@stylexjs/stylex";
import { useEffect as useEffect9, useId as useId2 } from "react";

// src/react/route-state.stylex.ts
var routeStateStyles = {
  content: {
    k1xSpc: "xrvj5dj",
    kbNqZ1: "x7sv70a",
    kVQ08L: "x159srwy",
    kgQiWS: "x1ku5rj1",
    $$css: true
  },
  header: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kjj79g: "x13a6bvl",
    kdYMnH: "xesnm00",
    kmVPX3: "xjhuplf",
    $$css: true
  },
  loading: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xzci21y",
    kULEZF: "x64rcuh",
    $$css: true
  },
  root: {
    k1xSpc: "xrvj5dj",
    k9llMU: "x16p6thf",
    kVQ08L: "x1ljpu7r",
    $$css: true
  },
  row: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kwnvtZ: "x1a02dak",
    kOIVth: "xmgkybt",
    $$css: true
  },
  skeletons: {
    k1xSpc: "xrvj5dj",
    kOIVth: "xmgkybt",
    $$css: true
  }
};

// src/react/theme.tsx
import { AppearanceIcon as AppearanceIcon2, IconButton as IconButton3, Menu, MenuItem, MenuTrigger, SegmentedControl as SegmentedControl2, cn as cn12 } from "@hraness/ui";
import * as stylex13 from "@stylexjs/stylex";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { useEffect as useEffect8, useRef as useRef6, useSyncExternalStore as useSyncExternalStore2 } from "react";

// src/react/theme.stylex.ts
var themeStyles = {
  item: {
    kGNEyG: "x6s0dn4",
    ku1ltF: "x1whfoju",
    kHypHr: "xa5e7qe",
    kKwaWg: "xhhc4os",
    kl9DO0: "x1tr436z",
    k1YJky: "x1hv131x",
    kz484i: "x1par0v0",
    kgSjnq: "xroyn9c",
    kWkggS: "xffqgfc",
    kaIpWk: "xyz7jqb",
    kMwMTN: "xlrt3vh xu0bq9",
    kkrTdU: "xt0e3qv",
    k1xSpc: "xrvj5dj",
    kGuDYH: "xj8twjj",
    kOIVth: "x8233eu",
    kumcoG: "x1rkzygb",
    kLWn49: "x132q4wb",
    kVQ08L: "x3uqqqp x9me654",
    k3XXqK: "x1t137rt",
    k8WAf4: "x18g2hj5",
    kg3NbH: "x1ryrjj2",
    kfSwDN: "x87ps6o",
    $$css: true
  },
  itemSelected: {
    ku1ltF: "x1whfoju xcrev8p",
    kHypHr: "xa5e7qe x1tzqu68",
    kKwaWg: "xhhc4os xhobzj1",
    kl9DO0: "x1tr436z xzln6ae",
    k1YJky: "x1hv131x x2c5uud",
    kz484i: "x1par0v0 x1pjo12s",
    kgSjnq: "xroyn9c x1ug5rqp",
    kWkggS: "xffqgfc x1jzqe4",
    kMwMTN: "xlrt3vh xu0bq9 x1k5gbb1",
    k63SB2: "x6ynj9m",
    $$css: true
  },
  menu: {
    k1xSpc: "xrvj5dj",
    kLO5vc: "xn0k27n",
    k3XXqK: "x1t137rt",
    kVQacm: "xysyzu8",
    k8WAf4: "x1o5vn8x",
    kg3NbH: "xllzysa",
    $$css: true
  },
  menuRoot: {
    "--hraness-appearance-accent": "xwhnx5i",
    "--hraness-appearance-accent-foreground": "x1gxadoi",
    "--hraness-appearance-control-background": "xuwnfk3",
    "--hraness-appearance-control-border": "xg6mmvg",
    "--hraness-appearance-control-foreground": "x1q0riu",
    "--hraness-appearance-focus": "x14tw958",
    "--hraness-appearance-popover-background": "x15khpru",
    "--hraness-appearance-popover-foreground": "xtuecvg",
    kMwMTN: "x13y0b37",
    kVAEAm: "x1n2onr6",
    $$css: true
  },
  notReady: {
    kSiTet: "xmu36h7",
    $$css: true
  },
  popover: {
    kawU7v: "x18sabzy",
    k5BUTg: "x1jleocg",
    kqOd84: "x1pjjote",
    kzPi7L: "x1e53mt7",
    kEz803: "xgkqhyc",
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x103pssi",
    kWkggS: "x141cw3e",
    kVAM5u: "x1r32107 x1w1tqly",
    kaIpWk: "xvy3trx",
    ksu8eU: "x1y0btm7",
    kMzoRj: "xmkeg23",
    kGVxlE: "xl8zne6",
    kMwMTN: "xlrt3vh",
    k1xSpc: "xvgho8r",
    kAXs8y: "xr5dkdi",
    k2kXS: "x1ljtl1n",
    k3XXqK: "x1t137rt",
    kVQacm: "xb3r6kr",
    kULEZF: "x2grt4k",
    kVCA4M: "x1guzgd5",
    $$css: true
  },
  root: {
    k1xSpc: "x3nfvp2",
    kdYMnH: "xesnm00",
    $$css: true
  },
  trigger: {
    kawU7v: "x18sabzy",
    k5BUTg: "x1jleocg",
    kqOd84: "x1pjjote",
    kzPi7L: "x1e53mt7",
    kEz803: "xgkqhyc",
    ku1ltF: "x1fdtg7e x852r0y",
    kHypHr: "x1u7o2vf x1yjm9pw",
    kKwaWg: "x18o3ruo x1aysnjn",
    kl9DO0: "x12koezg x1w7rtzm",
    k1YJky: "x1y4qj14 x123h4s9",
    kz484i: "x182nak8 x1xqmp8",
    kgSjnq: "x103pssi xontfw7",
    kWkggS: "x12dugtb x6j457c",
    kVAM5u: "x1r32107 x1w1tqly",
    kaIpWk: "xyz7jqb",
    ksu8eU: "x1y0btm7",
    kMzoRj: "xmkeg23",
    kGVxlE: "x1tc5apr xwaqzdf",
    kMwMTN: "x2pn0fd x15kafvc",
    kkrTdU: "x1ypdohk x1s07b3s",
    k1xSpc: "xwz0xwf",
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
    kAXs8y: "xr5dkdi",
    kULEZF: "x130h922 xqnxffv",
    kLWn49: "x15bjb6t",
    kVQ08L: "xd0akbl x9me654",
    kdYMnH: "x1o8ym9z x11je3w3",
    kSiTet: "xijokvz",
    kjBf7l: "xybcfi5 x1x84bn5",
    kInvED: "xecyca2",
    k3XXqK: "x1t137rt xq2elj",
    kMeerF: "x19beueo",
    k8WAf4: "xt970qd",
    kg3NbH: "xnjsko4",
    kgQiWS: "x1ku5rj1",
    kFalU9: "xggy1nq",
    k3aq6I: "x1rpfuv1",
    kIr0Dl: "x1545fc0",
    kIyJzY: "x19wcyzb xsagj69",
    k1ekBW: "xv65o4f",
    kAMwcw: "x8rfmps",
    $$css: true
  }
};

// src/react/theme.tsx
import { jsx as jsx14, jsxs as jsxs12, Fragment as Fragment2 } from "react/jsx-runtime";
var concreteThemes = ["light", "dark"];
var emptySubscribe = () => () => {
  return;
};
function useHydrated() {
  return useSyncExternalStore2(emptySubscribe, () => true, () => false);
}
function themeStorageGuardScript(storageKey) {
  const serializedKey = JSON.stringify(storageKey).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
  return `(()=>{try{const key=${serializedKey};const value=localStorage.getItem(key);if(value!==null&&value!=="light"&&value!=="dark"&&value!=="system")localStorage.setItem(key,"${defaultDesignTheme}")}catch{}})();`;
}
function PersistedThemeNormalizer() {
  const {
    setTheme,
    theme
  } = useTheme();
  useEffect8(() => {
    if (theme !== undefined && !isDesignTheme(theme))
      setTheme(defaultDesignTheme);
  }, [setTheme, theme]);
  return null;
}
function JellyThemeSync() {
  const {
    resolvedTheme
  } = useTheme();
  useEffect8(() => {
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
  const {
    resolvedTheme
  } = useTheme();
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
        ...nonce === undefined ? {} : {
          nonce
        },
        "data-hraness-design-theme-guard": "",
        dangerouslySetInnerHTML: {
          __html: themeStorageGuardScript(storageKey)
        },
        suppressHydrationWarning: true
      }) : null,
      /* @__PURE__ */ jsxs12(NextThemeProvider, {
        ...nonce === undefined ? {} : {
          nonce
        },
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
  return [{
    id: "light",
    label: themeToggleLabel("light", labels)
  }, {
    id: "dark",
    label: themeToggleLabel("dark", labels)
  }, {
    id: "system",
    label: themeToggleLabel("system", labels)
  }];
}
function themeToggleIcon(id) {
  return /* @__PURE__ */ jsx14(AppearanceIcon2, {
    name: id
  });
}
function themeToggleIconItems(labels) {
  return [{
    ariaLabel: themeToggleLabel("light", labels),
    id: "light",
    label: themeToggleIcon("light")
  }, {
    ariaLabel: themeToggleLabel("dark", labels),
    id: "dark",
    label: themeToggleIcon("dark")
  }, {
    ariaLabel: themeToggleLabel("system", labels),
    id: "system",
    label: themeToggleIcon("system")
  }];
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
  const portalClassName = useDesignPortalClassName();
  const hydrated = useHydrated();
  const {
    setTheme,
    theme
  } = useTheme();
  const controlled = controlledValue !== undefined;
  const ready = controlled || hydrated;
  const value = controlledValue ?? (hydrated ? normalizeDesignTheme(theme) : defaultDesignTheme);
  const resolvedPresentation = presentation ?? (display === undefined ? "menu" : "segmented");
  const resolvedDisplay = display ?? "icons";
  const items = resolvedDisplay === "icons" ? themeToggleIconItems(labels) : themeToggleItems(labels);
  const presentationStyles = stylex13.props(themeStyles.root, resolvedPresentation === "menu" && themeStyles.menuRoot, !ready && themeStyles.notReady);
  const changeTheme = (nextTheme) => {
    if (controlled)
      onChange?.(nextTheme);
    else
      setTheme(nextTheme);
  };
  const currentLabel = themeToggleLabel(value, labels);
  return /* @__PURE__ */ jsx14("div", {
    ...presentationStyles,
    "aria-busy": !ready || undefined,
    className: cn12("hraness-design-theme-toggle", presentationStyles.className, className),
    "data-display": resolvedPresentation === "menu" ? "icons" : resolvedDisplay,
    "data-hraness-appearance-menu": resolvedPresentation === "menu" ? "" : undefined,
    "data-hraness-theme-toggle-stylex": "",
    "data-presentation": resolvedPresentation,
    "data-ready": ready ? "true" : "false",
    "data-theme-value": value,
    children: resolvedPresentation === "menu" ? /* @__PURE__ */ jsxs12(MenuTrigger, {
      children: [
        /* @__PURE__ */ jsx14(IconButton3, {
          "aria-label": `${ariaLabel}: ${currentLabel}`,
          controlClassName: "hraness-design-theme-toggle__trigger",
          controlXstyle: themeStyles.trigger,
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
          popoverClassName: cn12("hraness-design-theme-toggle__popover", portalClassName),
          popoverXstyle: themeStyles.popover,
          selectedKeys: [value],
          selectionMode: "single",
          xstyle: themeStyles.menu,
          children: designThemes.map((id) => /* @__PURE__ */ jsx14(MenuItem, {
            className: "hraness-design-theme-toggle__item",
            "data-theme-value": id,
            id,
            leading: themeToggleIcon(id),
            textValue: themeToggleLabel(id, labels),
            xstyle: [themeStyles.item, id === value && themeStyles.itemSelected],
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
function ThemeMenuButton(props14) {
  const palette = useDesignPalette();
  if (palette !== null)
    return /* @__PURE__ */ jsx14(DesignPaletteMenuButton, {
      ...props14
    });
  return /* @__PURE__ */ jsx14(ThemeToggle, {
    ...props14,
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
  const palette = useDesignPalette();
  const {
    resolvedTheme
  } = useTheme();
  const registrationId = useRef6(Symbol("hraness-design-theme-color"));
  const registration = useRef6(null);
  const resolvedColor = palette !== null ? metaName !== "theme-color" && palette.ready ? palette.background : undefined : resolvedTheme === "light" || resolvedTheme === "dark" ? themeColorFor(resolvedTheme, {
    dark: darkColor,
    light: lightColor
  }) : undefined;
  const hasResolvedColor = resolvedColor !== undefined;
  const latestColor = useRef6(resolvedColor);
  latestColor.current = resolvedColor;
  useEffect8(() => {
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
  useEffect8(() => {
    if (resolvedColor !== undefined)
      registration.current?.update(resolvedColor);
  }, [resolvedColor]);
  return null;
}

// src/react/route-state.tsx
import { jsx as jsx15, jsxs as jsxs13, Fragment as Fragment3 } from "react/jsx-runtime";
function RouteActions({
  children
}) {
  const presentation = stylex14.props(routeStateStyles.row);
  return /* @__PURE__ */ jsx15("div", {
    ...presentation,
    className: cn13("hraness-design-route-state__actions", presentation.className),
    children
  });
}
function RouteNotFoundPage({
  canvasAs = "main",
  showThemeToggle = false,
  titleAs = "h1"
} = {}) {
  const rootPresentation = stylex14.props(routeStateStyles.root);
  const headerPresentation = stylex14.props(routeStateStyles.header);
  const contentPresentation = stylex14.props(routeStateStyles.content);
  return /* @__PURE__ */ jsxs13(PageCanvas, {
    as: canvasAs,
    className: cn13("hraness-design-route-state", rootPresentation.className),
    children: [
      showThemeToggle ? /* @__PURE__ */ jsx15("header", {
        ...headerPresentation,
        className: cn13("hraness-design-route-state__header", headerPresentation.className),
        children: /* @__PURE__ */ jsx15(ThemeMenuButton, {})
      }) : null,
      /* @__PURE__ */ jsx15("div", {
        ...contentPresentation,
        className: cn13("hraness-design-route-state__content", contentPresentation.className),
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
  const rootPresentation = stylex14.props(routeStateStyles.root);
  const headerPresentation = stylex14.props(routeStateStyles.header);
  const contentPresentation = stylex14.props(routeStateStyles.content);
  useEffect9(() => {
    if (autoFocus)
      document.getElementById(focusId)?.focus();
  }, [autoFocus, error, focusId]);
  return /* @__PURE__ */ jsxs13(PageCanvas, {
    "aria-label": "This view could not load",
    "aria-live": announce ? "assertive" : undefined,
    as: canvasAs,
    className: cn13("hraness-design-route-state", rootPresentation.className),
    id: focusId,
    tabIndex: -1,
    children: [
      showThemeToggle ? /* @__PURE__ */ jsx15("header", {
        ...headerPresentation,
        className: cn13("hraness-design-route-state__header", headerPresentation.className),
        children: /* @__PURE__ */ jsx15(ThemeMenuButton, {})
      }) : null,
      /* @__PURE__ */ jsx15("div", {
        ...contentPresentation,
        className: cn13("hraness-design-route-state__content", contentPresentation.className),
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
  const rootPresentation = stylex14.props(routeStateStyles.root);
  const loadingPresentation = stylex14.props(routeStateStyles.loading);
  const titlePresentation = stylex14.props(routeStateStyles.row);
  const skeletonPresentation = stylex14.props(routeStateStyles.skeletons);
  return /* @__PURE__ */ jsx15(PageCanvas, {
    "aria-busy": announce ? "true" : undefined,
    as: canvasAs,
    className: cn13("hraness-design-route-state", rootPresentation.className),
    children: /* @__PURE__ */ jsxs13("section", {
      ...loadingPresentation,
      className: cn13("hraness-design-route-state__loading", loadingPresentation.className),
      role: announce ? "status" : undefined,
      children: [
        /* @__PURE__ */ jsxs13("div", {
          ...titlePresentation,
          className: cn13("hraness-design-route-state__loading-title", titlePresentation.className),
          children: [
            /* @__PURE__ */ jsx15(Spinner2, {}),
            /* @__PURE__ */ jsx15("strong", {
              children: "Loading page"
            })
          ]
        }),
        /* @__PURE__ */ jsxs13("div", {
          ...skeletonPresentation,
          "aria-hidden": "true",
          className: cn13("hraness-design-route-state__skeletons", skeletonPresentation.className),
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
  ...props15
}) {
  const content = /* @__PURE__ */ jsxs13(Fragment3, {
    children: [
      diagnostics,
      /* @__PURE__ */ jsx15(RouteErrorPage, {
        ...props15,
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
  useDesignPalette,
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
  ProductHero,
  ProceduralBackdrop,
  PlaybackTransport,
  PhaserDots,
  ParticleHalo,
  PageCanvas,
  NavigationRail,
  MarketingTrustBoundary,
  MarketingStatStrip,
  MarketingSiteHeader,
  MarketingSectionLabel,
  MarketingSection,
  MarketingQuoteGrid,
  MarketingQuestionList,
  MarketingProofFrame,
  MarketingPrimitives,
  MarketingPricing,
  MarketingPillars,
  MarketingPage,
  MarketingMaker,
  MarketingInterfaceGrid,
  MarketingInstallPanel,
  MarketingFlow,
  MarketingFacts,
  MarketingCallToAction,
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
  DesignPaletteProvider,
  DesignPaletteMenuButton,
  ChatMessage,
  ChatComposer,
  BottomBar,
  BarListChart,
  AuroraDotsBackground,
  AppShell,
  AnimatedRailStage
};
