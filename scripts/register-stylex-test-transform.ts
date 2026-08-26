import stylex from "@stylexjs/unplugin";
import { extname, resolve } from "node:path";

import { stylexCompilerOptions } from "./stylex-config.js";

const repository = process.cwd();
const sourceRoot = resolve(repository, "src");
const escapedSourceRoot = sourceRoot.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const plugin = stylex.raw(
  stylexCompilerOptions(repository),
  { framework: "rollup" },
);
const transform =
  typeof plugin.transform === "function"
    ? plugin.transform
    : plugin.transform?.handler;

if (transform === undefined) {
  throw new Error("StyleX test transform is unavailable");
}

Bun.plugin({
  name: "hraness-design-kit-stylex-test-transform",
  setup(build) {
    build.onLoad(
      {
        filter: new RegExp(
          `^${escapedSourceRoot}/.*\\.[cm]?[jt]sx?$`,
          "u",
        ),
      },
      async ({ path }) => {
        const source = await Bun.file(path).text();
        const result = await transform.call(
          {} as ThisParameterType<typeof transform>,
          source,
          path,
        );
        const contents =
          typeof result === "string" ? result : (result?.code ?? source);
        const extension = extname(path);
        const loader = extension === ".tsx"
          ? "tsx"
          : extension === ".ts"
            ? "ts"
            : extension === ".jsx"
              ? "jsx"
              : "js";

        return { contents, loader };
      },
    );
  },
});
