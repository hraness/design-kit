/**
 * @deprecated Retired with the Quiet marketing direction. Marketing heroes no
 * longer have a pointer-driven light field, drift, or `data-hraness-hero-item`
 * proximity. The function stays exported so existing callers compile; it
 * attaches no listeners, writes no styles, schedules no frames, and returns an
 * idempotent disposer. Remove the call when convenient.
 */
export function attachHeroLight(root: HTMLElement): () => void {
  void root;
  return () => {};
}
