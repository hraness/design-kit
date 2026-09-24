// src/react/hero-backdrop.tsx
import { createElement, useEffect, useRef, version } from "react";
import * as stylex from "@stylexjs/stylex";

// src/browser/hero-light.ts
var inputs = ["--hraness-hero-light-x", "--hraness-hero-light-y", "--hraness-hero-drift-x", "--hraness-hero-drift-y"];
function attachHeroLight(root) {
  const document = root.ownerDocument;
  const view = document.defaultView;
  if (!view?.matchMedia || !view.requestAnimationFrame || !view.cancelAnimationFrame)
    return () => {};
  const media = view.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)");
  const original = inputs.map((name) => [name, root.style.getPropertyValue(name), root.style.getPropertyPriority(name)]);
  const proximityProperty = "--hraness-hero-proximity";
  const items = [...root.querySelectorAll("[data-hraness-hero-item]")].slice(0, 48).map((element) => ({
    element,
    value: 0,
    original: element.style.getPropertyValue(proximityProperty),
    priority: element.style.getPropertyPriority(proximityProperty)
  }));
  let visible = true;
  let disposed = false;
  let frame;
  let point;
  let light = {
    x: 68,
    y: 32
  };
  let previousTime;
  let painted = false;
  const reset = () => {
    if (frame !== undefined)
      view.cancelAnimationFrame(frame);
    frame = undefined;
    point = undefined;
    previousTime = undefined;
    light = {
      x: 68,
      y: 32
    };
    if (!painted)
      return;
    for (const [name, value, priority] of original) {
      if (value)
        root.style.setProperty(name, value, priority);
      else
        root.style.removeProperty(name);
    }
    for (const item of items) {
      if (item.original)
        item.element.style.setProperty(proximityProperty, item.original, item.priority);
      else
        item.element.style.removeProperty(proximityProperty);
      item.value = 0;
    }
    painted = false;
  };
  const paint = (time) => {
    frame = undefined;
    if (disposed || !visible || !media.matches || document.hidden || !root.isConnected || !point) {
      reset();
      return;
    }
    const pointer = point;
    const bounds = root.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0 || bounds.bottom <= 0 || bounds.top >= view.innerHeight) {
      reset();
      return;
    }
    const goal = {
      x: Math.max(12, Math.min(88, (point.x - bounds.left) / bounds.width * 100)),
      y: Math.max(12, Math.min(88, (point.y - bounds.top) / bounds.height * 100))
    };
    const distances = items.map(({
      element
    }) => {
      const box = element.getBoundingClientRect();
      return element.isConnected ? Math.max(0, 1 - Math.hypot(pointer.x - box.left - box.width / 2, pointer.y - box.top - box.height / 2) / 280) : 0;
    });
    const elapsed = previousTime === undefined ? 16 : Math.max(0, Math.min(64, time - previousTime));
    previousTime = time;
    const blend = 1 - Math.exp(-elapsed / 110);
    let moving = Math.abs(goal.x - light.x) + Math.abs(goal.y - light.y) > 0.08;
    light = moving ? {
      x: light.x + (goal.x - light.x) * blend,
      y: light.y + (goal.y - light.y) * blend
    } : goal;
    const values = [light.x, light.y, (light.x - 50) / 38 * 8, (light.y - 50) / 38 * 6];
    inputs.forEach((name, index) => root.style.setProperty(name, `${(values[index] ?? 0).toFixed(2)}${index < 2 ? "%" : "px"}`));
    items.forEach((item, index) => {
      const target = distances[index] ?? 0;
      if (Math.abs(target - item.value) > 0.002) {
        item.value += (target - item.value) * blend;
        moving = true;
      } else
        item.value = target;
      item.element.style.setProperty(proximityProperty, item.value.toFixed(3));
    });
    painted = true;
    if (moving)
      frame = view.requestAnimationFrame(paint);
    else
      previousTime = undefined;
  };
  const move = (event) => {
    if (!media.matches || document.hidden || !visible || event.pointerType === "touch") {
      reset();
      return;
    }
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY))
      return;
    point = {
      x: event.clientX,
      y: event.clientY
    };
    if (frame === undefined)
      frame = view.requestAnimationFrame(paint);
  };
  const observer = typeof view.IntersectionObserver === "function" ? new view.IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.target === root && entry.isIntersecting);
    if (!visible)
      reset();
  }) : undefined;
  observer?.observe(root);
  root.addEventListener("pointermove", move, {
    passive: true
  });
  root.addEventListener("pointerleave", reset);
  root.addEventListener("pointercancel", reset);
  media.addEventListener("change", reset);
  document.addEventListener("visibilitychange", reset);
  view.addEventListener("blur", reset);
  return () => {
    if (disposed)
      return;
    disposed = true;
    reset();
    observer?.disconnect();
    root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerleave", reset);
    root.removeEventListener("pointercancel", reset);
    media.removeEventListener("change", reset);
    document.removeEventListener("visibilitychange", reset);
    view.removeEventListener("blur", reset);
  };
}

// src/react/hero-backdrop.stylex.ts
var heroBackdropStyles = {
  root: {
    k1xSpc: "x19iy2gg",
    kVAEAm: "x10l6tqk",
    kpwlN0: "x10a8y8t",
    kY2c9j: "x8knxv4",
    kVQacm: "x7giv3",
    kfzvcC: "x47corl",
    kfSwDN: "x87ps6o",
    ktR8K2: "x16qrkmw",
    kSiTet: "x14f51jl",
    "--_hraness-hero-backdrop-opacity": "xkbz0ap x1tsymki x1ksytfy",
    kX1K2I: "xne3dcs",
    $$css: true
  },
  atmosphere: {
    kVAEAm: "x10l6tqk",
    kpwlN0: "x1p0kdj6",
    kSiTet: "x19pb5yz",
    k3aq6I: "x1bmltzs",
    kKwaWg: "xo15lgq",
    $$css: true
  },
  center: {
    k1YJky: "xztyhrg",
    $$css: true
  },
  east: {
    k1YJky: "xnrbl37",
    kgSjnq: "xsn25oj",
    $$css: true
  },
  west: {
    k1YJky: "xn69r17",
    kgSjnq: "x86xhs0",
    $$css: true
  },
  light: {
    kVAEAm: "x10l6tqk",
    kpwlN0: "x10a8y8t",
    kKwaWg: "xlzqqbi",
    $$css: true
  }
};

// src/react/hero-backdrop.tsx
import { jsx } from "react/jsx-runtime";
function HeroBackdrop({
  seed,
  children
}) {
  const variation = [...seed].reduce((value, character) => Math.imul(value, 31) + character.charCodeAt(0) >>> 0, 0) % 3;
  const variationName = variation === 1 ? "east" : variation === 2 ? "west" : "center";
  const ref = useRef(null);
  useEffect(() => {
    const hero = ref.current?.parentElement;
    if (hero)
      return attachHeroLight(hero);
    return;
  }, []);
  return createElement("div", {
    className: ["hraness-marketing-hero-backdrop", stylex.props(heroBackdropStyles.root).className].filter(Boolean).join(" "),
    ref,
    "aria-hidden": true,
    inert: version.startsWith("18.") ? "" : true,
    "data-hraness-hero-backdrop": ""
  }, children ?? /* @__PURE__ */ jsx("div", {
    "data-variation": variationName,
    className: ["hraness-marketing-hero-backdrop__atmosphere", stylex.props(heroBackdropStyles.atmosphere, variation === 1 ? heroBackdropStyles.east : variation === 2 ? heroBackdropStyles.west : heroBackdropStyles.center).className].filter(Boolean).join(" ")
  }), /* @__PURE__ */ jsx("span", {
    className: ["hraness-marketing-hero-backdrop__light", stylex.props(heroBackdropStyles.light).className].filter(Boolean).join(" ")
  }));
}

export { HeroBackdrop };
