const inputs = ["--hraness-hero-light-x", "--hraness-hero-light-y", "--hraness-hero-drift-x", "--hraness-hero-drift-y"] as const;
type Point = Readonly<{ x: number; y: number }>;

/** A bounded light field. The page stays still; only its decorative light moves.
 * No idle loop, global pointer listener, storage, or touch interception. */
export function attachHeroLight(root: HTMLElement): () => void {
  const document = root.ownerDocument;
  const view = document.defaultView;
  if (!view?.matchMedia || !view.requestAnimationFrame || !view.cancelAnimationFrame) return () => {};
  const media = view.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)");
  const original = inputs.map((name) => [name, root.style.getPropertyValue(name), root.style.getPropertyPriority(name)] as const);
  const proximityProperty = "--hraness-hero-proximity";
  // Product artwork opts in explicitly. Bound work even on a malformed page.
  const items = [...root.querySelectorAll<HTMLElement>("[data-hraness-hero-item]")].slice(0, 48).map((element) => ({
    element, value: 0, original: element.style.getPropertyValue(proximityProperty), priority: element.style.getPropertyPriority(proximityProperty),
  }));
  let visible = true;
  let disposed = false;
  let frame: number | undefined;
  let point: Point | undefined;
  let light: Point = { x: 68, y: 32 };
  let previousTime: number | undefined;
  let painted = false;

  const reset = () => {
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    frame = undefined;
    point = undefined;
    previousTime = undefined;
    light = { x: 68, y: 32 };
    if (!painted) return;
    for (const [name, value, priority] of original) {
      if (value) root.style.setProperty(name, value, priority);
      else root.style.removeProperty(name);
    }
    for (const item of items) {
      if (item.original) item.element.style.setProperty(proximityProperty, item.original, item.priority);
      else item.element.style.removeProperty(proximityProperty);
      item.value = 0;
    }
    painted = false;
  };

  const paint = (time: number) => {
    frame = undefined;
    if (disposed || !visible || !media.matches || document.hidden || !root.isConnected || !point) { reset(); return; }
    const pointer = point;
    const bounds = root.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0 || bounds.bottom <= 0 || bounds.top >= view.innerHeight) { reset(); return; }
    const goal = {
      x: Math.max(12, Math.min(88, (point.x - bounds.left) / bounds.width * 100)),
      y: Math.max(12, Math.min(88, (point.y - bounds.top) / bounds.height * 100)),
    };
    // Batch layout reads before paint; artwork never changes the document flow.
    const distances = items.map(({ element }) => {
      const box = element.getBoundingClientRect();
      return element.isConnected ? Math.max(0, 1 - Math.hypot(pointer.x - box.left - box.width / 2, pointer.y - box.top - box.height / 2) / 280) : 0;
    });
    const elapsed = previousTime === undefined ? 16 : Math.max(0, Math.min(64, time - previousTime));
    previousTime = time;
    const blend = 1 - Math.exp(-elapsed / 110);
    let moving = Math.abs(goal.x - light.x) + Math.abs(goal.y - light.y) > 0.08;
    light = moving ? { x: light.x + (goal.x - light.x) * blend, y: light.y + (goal.y - light.y) * blend } : goal;
    const values = [light.x, light.y, (light.x - 50) / 38 * 8, (light.y - 50) / 38 * 6];
    inputs.forEach((name, index) => root.style.setProperty(name, `${(values[index] ?? 0).toFixed(2)}${index < 2 ? "%" : "px"}`));
    items.forEach((item, index) => {
      const target = distances[index] ?? 0;
      if (Math.abs(target - item.value) > 0.002) {
        item.value += (target - item.value) * blend;
        moving = true;
      } else item.value = target;
      item.element.style.setProperty(proximityProperty, item.value.toFixed(3));
    });
    painted = true;
    if (moving) frame = view.requestAnimationFrame(paint);
    else previousTime = undefined;
  };
  const move = (event: PointerEvent) => {
    if (!media.matches || document.hidden || !visible || event.pointerType === "touch") { reset(); return; }
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    point = { x: event.clientX, y: event.clientY };
    if (frame === undefined) frame = view.requestAnimationFrame(paint);
  };
  const observer = typeof view.IntersectionObserver === "function"
    ? new view.IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.target === root && entry.isIntersecting);
      if (!visible) reset();
    })
    : undefined;
  observer?.observe(root);
  root.addEventListener("pointermove", move, { passive: true });
  root.addEventListener("pointerleave", reset);
  root.addEventListener("pointercancel", reset);
  media.addEventListener("change", reset);
  document.addEventListener("visibilitychange", reset);
  view.addEventListener("blur", reset);
  return () => {
    if (disposed) return;
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
