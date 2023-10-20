import { createFilter } from "@rollup/pluginutils";
import { transform } from "@swc/core";

const EMPTY_OBJECT = Object.freeze({});

let _config;
let _swcOptions = EMPTY_OBJECT;

function transformFile(
  id,
  code,
  swcOptions,
  suppressLegacyDecoratorNoExplicitUDFCFWarning
) {
  const [filepath] = id.split("?", 1);

  if (_swcOptions === EMPTY_OBJECT) {
    const jsc = swcOptions.jsc ?? null;
    const legacyDecorator = jsc
      ? jsc.transform?.legacyDecorator === true
      : false;

    if (legacyDecorator) {
      const legacyDecoratorNoExplicitUDFCF = !(
        "useDefineForClassFields" in jsc.transform
      );

      if (
        legacyDecoratorNoExplicitUDFCF &&
        !suppressLegacyDecoratorNoExplicitUDFCFWarning
      ) {
        console.warn(
          "[vite-plugin-swc-transform] SWC option 'jsc.transform.legacyDecorator' enabled without an explicit 'jsc.transform.useDefineForClassFields' value.\n" +
            "To remove this warning, either:\n" +
            " - unset or disable SWC option 'jsc.transform.legacyDecorator' if not needed\n" +
            " - set an explicit value for SWC option 'jsc.transform.useDefineForClassFields: boolean'\n" +
            " - pass vite-plugin-swc-transform option 'suppressLegacyDecoratorNoExplicitUDFCFWarning: true'"
        );
      }
    }

    _swcOptions = {
      swcrc: false,
      configFile: false,
      inputSourceMap: false,
      sourceMaps: true,
      ...swcOptions,
      ...(jsc && {
        jsc: legacyDecorator
          ? {
              ...jsc,
              keepClassNames: true,
              parser: {
                decorators: true,
                decoratorsBeforeExport: true,
                syntax: "typescript",
                ...jsc.parser,
              },
            }
          : jsc,
      }),
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
  suppressLegacyDecoratorNoExplicitUDFCFWarning = false,
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
      return transformFile(
        id,
        code,
        swcOptions ?? EMPTY_OBJECT,
        suppressLegacyDecoratorNoExplicitUDFCFWarning
      );
    },
  };
}
