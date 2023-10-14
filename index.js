import { createFilter } from "@rollup/pluginutils";
import { transform } from "@swc/core";

const EMPTY_OBJECT = Object.freeze({});

let _config;
let _swcOptions = EMPTY_OBJECT;

function transformFile(id, code, swcOptions) {
  const [filepath] = id.split("?", 1);

  if (_swcOptions === EMPTY_OBJECT) {
    const jsc = swcOptions.jsc ?? EMPTY_OBJECT;
    const legacyDecorator = !!jsc.transform?.legacyDecorator;

    _swcOptions = {
      swcrc: false,
      configFile: false,
      inputSourceMap: false,
      sourceMaps: true,
      ...swcOptions,
      jsc: {
        ...jsc,
        keepClassNames: legacyDecorator,
        parser: {
          decorators: legacyDecorator,
          decoratorsBeforeExport: legacyDecorator,
          exportDefaultFrom: legacyDecorator,
          ...jsc.parser,
          syntax: legacyDecorator
            ? "typescript"
            : jsc.parser?.syntax || "ecmascript",
        },
        transform: {
          ...jsc.transform,
          legacyDecorator,
        },
      },
    };
  }

  const transformOptions = Object.assign(
    {
      filename: id,
      sourceFileName: filepath,
    },
    _swcOptions
  );

  return transform(code, transformOptions);
}

export default function createViteSWCTransformPlugin({
  include,
  exclude,
  swcOptions,
} = {}) {
  const filter = createFilter(include ?? /\.tsx?$/, exclude ?? /node_modules/);
  return {
    name: "swc-transform",
    enforce: "pre",
    config() {
      return {
        esbuild: false,
      };
    },
    configResolved(resolvedConfig) {
      _config = resolvedConfig;
    },
    transform(code, id) {
      if (!filter(id)) return null;
      return transformFile(id, code, swcOptions ?? EMPTY_OBJECT);
    },
  };
}
