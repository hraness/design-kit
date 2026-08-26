// Browser evidence executes the freshly compiled artifact while borrowing the
// public source entry only for its TypeScript surface.
// @ts-expect-error The built JavaScript intentionally has no colocated declarations.
import * as builtRuntime from "../dist/react/index.js";
import type * as sourceRuntime from "../src/react/index.js";

export const builtDesignKitReact =
  builtRuntime as typeof sourceRuntime;
