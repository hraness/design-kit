import { createStylexTransformCollector } from "@hraness/ui/stylex-build";
import { extname, resolve } from "node:path";

const repository = process.cwd();
const sourceRoot = resolve(repository, "src");
const escapedSourceRoot = sourceRoot.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const collector = createStylexTransformCollector(repository);

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
        const contents = (await collector.transform(source, path)).code;
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
