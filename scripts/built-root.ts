// Browser proofs consume the released JavaScript graph, including compiled
// theme recipes. The source import supplies types without executing StyleX.
// @ts-expect-error The compiled JavaScript intentionally has no colocated declarations.
import * as builtRuntime from "../dist/index.js";
import type * as sourceRuntime from "../src/index.js";

export const builtDesignKit = builtRuntime as typeof sourceRuntime;
