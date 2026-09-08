// This explicit application entry is served as a synchronous external head
// script. The shared browser package remains inert until the initializer runs.
// @ts-expect-error The built runtime borrows its types from the public source entry.
import * as builtRuntime from "../dist/browser/index.js";
import type * as sourceRuntime from "../src/browser/index.js";

const { initDesignPalette } = builtRuntime as typeof sourceRuntime;
document.addEventListener("securitypolicyviolation", () => {
  document.documentElement.dataset.cspViolations = String(Number(document.documentElement.dataset.cspViolations ?? "0") + 1);
});
const denied = new URL(location.href).searchParams.has("denied");
const controller = initDesignPalette({
  legacyStorageKey: null,
  ...(denied ? { storage: {
    getItem: () => { throw new Error("Storage denied by fixture"); },
    setItem: () => { throw new Error("Storage denied by fixture"); },
  } } : {}),
});
document.documentElement.dataset.bootstrapPalette = controller.getSnapshot().preference.palette;
document.documentElement.dataset.bootstrapMode = controller.getSnapshot().resolvedMode;
