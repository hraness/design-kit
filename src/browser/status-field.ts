/**
 * The status-page glyph drawn as a field of dots. On load the dots gather into
 * the glyph; the pointer pushes them aside and a click scatters them, and they
 * light up in the accent color while they move. The simulation stops as soon
 * as every dot is at rest, so an idle page requests no frames. Reduced motion
 * draws the settled glyph once. Without WebGL, or in forced colors, the text
 * glyph underneath stays visible.
 */

const MAX_DOTS = 5200;
const STRIDE = 4; // x, y, heat, tone
const SPRING = 0.034;
const DAMPING = 0.86;
const PUSH = 5.5;
const BURST = 24;
const REST_DISTANCE = 0.08;
const ACCENT_SHARE = 0.14;

const VERTEX = `
attribute vec2 a_position;
attribute float a_heat;
attribute float a_tone;
uniform vec2 u_size;
uniform float u_point;
varying float v_mix;
void main() {
  vec2 clip = a_position / u_size * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = u_point * (1.0 + a_heat * 0.55);
  v_mix = clamp(max(a_tone * 0.85, a_heat), 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform vec3 u_ink;
uniform vec3 u_accent;
uniform float u_alpha;
varying float v_mix;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.18, d) * u_alpha;
  gl_FragColor = vec4(mix(u_ink, u_accent, v_mix) * a, a);
}`;

type Rgba = readonly [number, number, number, number];

export type StatusFieldOptions = Readonly<{
  /** Called once the canvas has painted, and again with false if it stops. */
  onLive?: (live: boolean) => void;
  /** Deterministic seed for the dot layout and intro scatter. */
  seed?: number;
}>;

function random(seed: number): () => number {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state ^= state << 13; state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5; state >>>= 0;
    return state / 0x1_0000_0000;
  };
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

/**
 * Attach the dot field to a `.hraness-status-page__code` element that holds
 * the text glyph and a canvas. Returns the cleanup function.
 */
export function attachStatusField(code: HTMLElement, options: StatusFieldOptions = {}): () => void {
  const document = code.ownerDocument;
  const view = document.defaultView;
  const canvas = code.querySelector<HTMLCanvasElement>("canvas");
  const glyph = code.querySelector<HTMLElement>(".hraness-status-page__glyph");
  if (!view || !canvas || !glyph || typeof view.matchMedia !== "function"
    || typeof view.requestAnimationFrame !== "function"
    || typeof view.ResizeObserver !== "function") return () => {};
  if (view.matchMedia("(forced-colors: active)").matches) return () => {};
  const motion = view.matchMedia("(prefers-reduced-motion: reduce)");

  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, premultipliedAlpha: true, preserveDrawingBuffer: false, stencil: false });
  } catch { gl = null; }
  if (!gl || gl.isContextLost()) return () => {};
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return () => {};
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => {};
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const attribute = (name: string, size: number, offset: number) => {
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, STRIDE * 4, offset * 4);
  };
  attribute("a_position", 2, 0);
  attribute("a_heat", 1, 2);
  attribute("a_tone", 1, 3);
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const uSize = uniform("u_size");
  const uPoint = uniform("u_point");
  const uInk = uniform("u_ink");
  const uAccent = uniform("u_accent");
  const uAlpha = uniform("u_alpha");
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const next = random(options.seed ?? 404);
  let homes = new Float32Array(0);
  let velocity = new Float32Array(0);
  let vertices = new Float32Array(0);
  let count = 0;
  let width = 0;
  let height = 0;
  let pointSize = 2;
  let pointer: { x: number; y: number } | undefined;
  let frame: number | undefined;
  let previous: number | undefined;
  let introStart: number | undefined;
  let delays = new Float32Array(0);
  let live = false;
  let disposed = false;
  let lost = false;

  const probe = document.createElement("canvas");
  probe.width = 1; probe.height = 1;
  const probeContext = probe.getContext("2d", { willReadFrequently: true });
  const rgba = (value: string): Rgba => {
    if (!probeContext) return [0.5, 0.5, 0.5, 1];
    probeContext.clearRect(0, 0, 1, 1);
    probeContext.fillStyle = "#808080";
    probeContext.fillStyle = value;
    probeContext.fillRect(0, 0, 1, 1);
    // ImageData is unpremultiplied, so the channels are the color itself.
    const [r = 128, g = 128, b = 128, a = 255] = probeContext.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255, a / 255];
  };
  const readColors = () => {
    const ink = rgba(view.getComputedStyle(glyph).color);
    const accent = rgba(view.getComputedStyle(canvas).color);
    gl.uniform3f(uInk, ink[0], ink[1], ink[2]);
    gl.uniform3f(uAccent, accent[0], accent[1], accent[2]);
    gl.uniform1f(uAlpha, Math.max(0.35, ink[3]));
  };

  const sample = (): boolean => {
    // The canvas overhangs the glyph box so scattered dots are not clipped.
    const bounds = canvas.getBoundingClientRect();
    const box = code.getBoundingClientRect();
    const centerX = box.left - bounds.left + box.width / 2;
    const centerY = box.top - bounds.top + box.height / 2;
    width = Math.round(bounds.width);
    height = Math.round(bounds.height);
    if (width < 8 || height < 8) return false;
    const ratio = Math.min(2, view.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uSize, width, height);

    const style = view.getComputedStyle(glyph);
    const fontSize = Number.parseFloat(style.fontSize) || 96;
    const mask = document.createElement("canvas");
    mask.width = width; mask.height = height;
    const context = mask.getContext("2d", { willReadFrequently: true });
    if (!context) return false;
    context.font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    const text = glyph.textContent ?? "";
    const metrics = context.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.7;
    const descent = metrics.actualBoundingBoxDescent || 0;
    context.fillStyle = "#000";
    context.fillText(text, centerX, centerY + (ascent - descent) / 2);
    const pixels = context.getImageData(0, 0, width, height).data;

    let gap = Math.max(3, Math.min(8, fontSize / 30));
    let points: number[] = [];
    for (let attempt = 0; attempt < 6; attempt++) {
      points = [];
      const rowHeight = gap * 0.866;
      for (let row = 0, y = rowHeight / 2; y < height; row++, y += rowHeight) {
        for (let x = (row % 2 ? gap : gap / 2); x < width; x += gap) {
          if ((pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] ?? 0) >= 128) points.push(x, y);
        }
      }
      if (points.length / 2 <= MAX_DOTS) break;
      gap *= 1.2;
    }
    const nextCount = points.length / 2;
    const nextHomes = Float32Array.from(points);
    const nextVertices = new Float32Array(nextCount * STRIDE);
    const nextVelocity = new Float32Array(nextCount * 2);
    const nextDelays = new Float32Array(nextCount);
    const intro = count === 0 && !motion.matches;
    for (let index = 0; index < nextCount; index++) {
      const base = index * STRIDE;
      const hx = (nextHomes[index * 2] ?? 0);
      const hy = (nextHomes[index * 2 + 1] ?? 0);
      if (index < count) {
        nextVertices[base] = (vertices[index * STRIDE] ?? 0);
        nextVertices[base + 1] = (vertices[index * STRIDE + 1] ?? 0);
        nextVertices[base + 3] = (vertices[index * STRIDE + 3] ?? 0);
      } else {
        const angle = next() * Math.PI * 2;
        const reach = intro ? (0.25 + next() * 0.6) * Math.max(width, height) * 0.5 : 0;
        nextVertices[base] = hx + Math.cos(angle) * reach;
        nextVertices[base + 1] = hy + Math.sin(angle) * reach * 0.6;
        nextVertices[base + 3] = next() < ACCENT_SHARE ? 1 : 0;
        nextDelays[index] = intro ? next() * 420 : 0;
      }
    }
    homes = nextHomes; vertices = nextVertices; velocity = nextVelocity; delays = nextDelays; count = nextCount;
    pointSize = gap * 0.6 * ratio;
    gl.uniform1f(uPoint, pointSize);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    if (intro) introStart = undefined;
    return count > 0;
  };

  const draw = () => {
    if (disposed || lost) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    gl.drawArrays(gl.POINTS, 0, count);
    if (!live) { live = true; options.onLive?.(true); }
  };

  const settle = () => {
    for (let index = 0; index < count; index++) {
      vertices[index * STRIDE] = (homes[index * 2] ?? 0);
      vertices[index * STRIDE + 1] = (homes[index * 2 + 1] ?? 0);
      vertices[index * STRIDE + 2] = 0;
      velocity[index * 2] = 0;
      velocity[index * 2 + 1] = 0;
    }
  };

  const step = (time: number) => {
    frame = undefined;
    if (disposed || lost) return;
    if (document.hidden) { previous = undefined; return; }
    introStart ??= time;
    const dt = previous === undefined ? 1 : Math.max(0.25, Math.min(2, (time - previous) / 16.67));
    previous = time;
    const since = time - introStart;
    const radius = Math.max(72, width * 0.16);
    const damping = DAMPING ** dt;
    let moving = false;
    for (let index = 0; index < count; index++) {
      const base = index * STRIDE;
      if (since < (delays[index] ?? 0)) { moving = true; continue; }
      let x = (vertices[base] ?? 0);
      let y = (vertices[base + 1] ?? 0);
      let vx = (velocity[index * 2] ?? 0);
      let vy = (velocity[index * 2 + 1] ?? 0);
      let ax = ((homes[index * 2] ?? 0) - x) * SPRING;
      let ay = ((homes[index * 2 + 1] ?? 0) - y) * SPRING;
      if (pointer) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < radius) {
          const force = (1 - distance / radius) ** 2 * PUSH / Math.max(distance, 0.5);
          ax += dx * force;
          ay += dy * force;
        }
      }
      vx = (vx + ax * dt) * damping;
      vy = (vy + ay * dt) * damping;
      x += vx * dt;
      y += vy * dt;
      vertices[base] = x;
      vertices[base + 1] = y;
      velocity[index * 2] = vx;
      velocity[index * 2 + 1] = vy;
      const speed = Math.hypot(vx, vy);
      vertices[base + 2] = Math.max((vertices[base + 2] ?? 0) * 0.93 ** dt, Math.min(1, speed / 2));
      if (speed > REST_DISTANCE * 0.5 || (vertices[base + 2] ?? 0) > 0.02
        || (!pointer && Math.abs((homes[index * 2] ?? 0) - x) + Math.abs((homes[index * 2 + 1] ?? 0) - y) > REST_DISTANCE)) moving = true;
    }
    if (!moving && !pointer) settle();
    draw();
    if (moving) frame = view.requestAnimationFrame(step);
    else previous = undefined;
  };

  const wake = () => {
    if (disposed || lost || motion.matches || frame !== undefined) return;
    frame = view.requestAnimationFrame(step);
  };

  const paintStill = () => {
    if (disposed || lost) return;
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    frame = undefined;
    settle();
    draw();
  };

  const rebuild = () => {
    if (disposed || lost) return;
    if (!sample()) return;
    readColors();
    if (motion.matches) paintStill();
    else { draw(); wake(); }
  };

  const local = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };
  const onMove = (event: PointerEvent) => {
    if (motion.matches) return;
    pointer = local(event);
    wake();
  };
  const onLeave = () => { pointer = undefined; wake(); };
  const onDown = (event: PointerEvent) => {
    if (motion.matches) return;
    const origin = local(event);
    const reach = Math.max(120, width * 0.34);
    for (let index = 0; index < count; index++) {
      const dx = (vertices[index * STRIDE] ?? 0) - origin.x;
      const dy = (vertices[index * STRIDE + 1] ?? 0) - origin.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= reach) continue;
      const force = (1 - distance / reach) * BURST / Math.max(distance, 0.5);
      velocity[index * 2] = (velocity[index * 2] ?? 0) + dx * force;
      velocity[index * 2 + 1] = (velocity[index * 2 + 1] ?? 0) + dy * force;
    }
    if (event.pointerType !== "mouse") pointer = undefined;
    wake();
  };
  // The pointer area is the whole status page, so the dots react before the
  // cursor reaches the glyph. The listeners never block scrolling or clicks.
  const area = code.closest<HTMLElement>(".hraness-status-page") ?? code;
  area.addEventListener("pointermove", onMove, { passive: true });
  area.addEventListener("pointerleave", onLeave, { passive: true });
  area.addEventListener("pointerdown", onDown, { passive: true });

  const onVisibility = () => { if (!document.hidden) wake(); };
  document.addEventListener("visibilitychange", onVisibility);
  const onMotion = () => { if (motion.matches) paintStill(); else wake(); };
  motion.addEventListener?.("change", onMotion);
  const scheme = view.matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => {
    if (disposed || lost) return;
    readColors();
    if (frame === undefined) draw();
  };
  scheme.addEventListener?.("change", onScheme);
  // Theme menus switch palettes through root attributes; repaint with the new ink.
  const themeObserver = typeof view.MutationObserver === "function"
    ? new view.MutationObserver(onScheme) : undefined;
  themeObserver?.observe(document.documentElement, { attributeFilter: ["class", "data-theme", "data-palette", "style"], attributes: true });
  let resizeFrame: number | undefined;
  const resizeObserver = new view.ResizeObserver(() => {
    if (resizeFrame !== undefined) view.cancelAnimationFrame(resizeFrame);
    resizeFrame = view.requestAnimationFrame(() => { resizeFrame = undefined; rebuild(); });
  });
  // A lost context is not restored: the text glyph takes over for good.
  const onLost = () => {
    lost = true;
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    frame = undefined;
    if (live) { live = false; options.onLive?.(false); }
  };
  canvas.addEventListener("webglcontextlost", onLost);

  // Draw with the site's display face once it has loaded, and again if a
  // late font swap changes the glyph.
  const fonts = document.fonts;
  const onFonts = () => rebuild();
  let started = false;
  const start = () => {
    if (started || disposed) return;
    started = true;
    resizeObserver.observe(code);
    rebuild();
  };
  if (fonts?.ready) {
    void fonts.ready.then(start, start);
    fonts.addEventListener?.("loadingdone", onFonts);
  } else start();

  return () => {
    if (disposed) return;
    disposed = true;
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    if (resizeFrame !== undefined) view.cancelAnimationFrame(resizeFrame);
    area.removeEventListener("pointermove", onMove);
    area.removeEventListener("pointerleave", onLeave);
    area.removeEventListener("pointerdown", onDown);
    document.removeEventListener("visibilitychange", onVisibility);
    motion.removeEventListener?.("change", onMotion);
    scheme.removeEventListener?.("change", onScheme);
    fonts?.removeEventListener?.("loadingdone", onFonts);
    themeObserver?.disconnect();
    resizeObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", onLost);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (live) options.onLive?.(false);
    // Free the context once the canvas has left the document, so repeated
    // client-side 404s do not pile up contexts. A canvas that is still
    // attached (React StrictMode re-runs effects on it) keeps its context.
    const release = () => {
      if (!canvas.isConnected && !gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    release();
    view.setTimeout(release, 0);
  };
}
