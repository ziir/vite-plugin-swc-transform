import { afterEach, describe, expect, it, vi } from "vitest";
import { checkSwcOptionsOnce } from "../check-options-once.js";
import { getTransformOptions } from "../get-transform-options.js";
import { default as createViteSWCTransformPlugin } from "../index.js";

describe("createViteSWCTransformPlugin", () => {
  it("returns an object matching the Vite Plugin interface", () => {
    const plugin = createViteSWCTransformPlugin();

    expect(plugin).toMatchObject({
      name: "swc-transform",
      enforce: "pre",
    });

    const config = {};

    expect(plugin.config).toBeTypeOf("function");
    if (typeof plugin.config !== "function") {
      throw new Error("plugin.config() must be a function");
    }

    plugin.config(config, { command: "build", mode: "production" });
    expect(config).toStrictEqual({
      esbuild: false,
      build: {
        target: "esnext",
      },
    });

    expect(createViteSWCTransformPlugin().transform).toBeTypeOf("function");
  });
});

describe("getTransformOptions", () => {
  it("computes SWC transform options from defaults", () => {
    expect(
      getTransformOptions({
        swcOptions: {},
        jsc: null,
        legacyDecorator: false,
      }),
    ).toStrictEqual({
      configFile: false,
      inputSourceMap: false,
      sourceMaps: true,
      swcrc: false,
    });
  });

  it("merges SWC transform options - legacyDecorator = true", () => {
    expect(
      getTransformOptions({
        swcOptions: {
          minify: false,
        },
        jsc: {
          loose: false,
        },
        legacyDecorator: true,
      }),
    ).toStrictEqual({
      configFile: false,
      inputSourceMap: false,
      jsc: {
        keepClassNames: true,
        loose: false,
        parser: {
          decorators: true,
          syntax: "typescript",
        },
      },
      minify: false,
      sourceMaps: true,
      swcrc: false,
    });
  });

  it("merges SWC transform options - legacyDecorator = false", () => {
    expect(
      getTransformOptions({
        swcOptions: {
          minify: false,
        },
        jsc: {
          loose: false,
        },
        legacyDecorator: false,
      }),
    ).toStrictEqual({
      configFile: false,
      inputSourceMap: false,
      jsc: {
        loose: false,
      },
      minify: false,
      sourceMaps: true,
      swcrc: false,
    });
  });

  it("ignores swcOptions.jsc - jsc provided", () => {
    expect(
      getTransformOptions({
        swcOptions: {
          minify: false,
          jsc: {
            loose: true,
          },
        },
        jsc: {
          loose: false,
        },
        legacyDecorator: false,
      }).jsc,
    ).toStrictEqual({
      loose: false,
    });
  });

  it("respects swcOptions.jsc - jsc not provided", () => {
    expect(
      getTransformOptions({
        swcOptions: {
          minify: false,
          jsc: {
            loose: true,
          },
        },
        jsc: null,
        legacyDecorator: false,
      }).jsc,
    ).toStrictEqual({ loose: true });
  });
});

describe("checkSwcOptionsOnce", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("checks provided SWC options for potential issues - jsc.transform.useDefineForClassFields not provided", () => {
    const spy = vi.spyOn(console, "warn");
    spy.mockImplementationOnce(() => {});

    expect(
      checkSwcOptionsOnce({
        swcOptions: {
          jsc: {
            transform: {
              legacyDecorator: true,
            },
          },
        },
        suppressLegacyDecoratorNoExplicitUDFCFWarning: false,
      }),
    );

    expect(spy).toHaveBeenCalledWith(
      "[vite-plugin-swc-transform] SWC option 'jsc.transform.legacyDecorator' enabled without an explicit 'jsc.transform.useDefineForClassFields' value.\n" +
        "To remove this warning, either:\n" +
        " - unset or disable SWC option 'jsc.transform.legacyDecorator' if not needed\n" +
        " - set an explicit value for SWC option 'jsc.transform.useDefineForClassFields: boolean'\n" +
        " - pass vite-plugin-swc-transform option 'suppressLegacyDecoratorNoExplicitUDFCFWarning: true'",
    );
  });

  it("doesn't warn if jsc.transform.useDefineForClassFields is provided", () => {
    const spy = vi.spyOn(console, "warn");

    expect(
      checkSwcOptionsOnce({
        swcOptions: {
          jsc: {
            transform: {
              legacyDecorator: true,
              useDefineForClassFields: true,
            },
          },
        },
        suppressLegacyDecoratorNoExplicitUDFCFWarning: false,
      }),
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it("respects 'suppressLegacyDecoratorNoExplicitUDFCFWarning'", () => {
    const spy = vi.spyOn(console, "warn");

    expect(
      checkSwcOptionsOnce({
        swcOptions: {
          jsc: {
            transform: {
              legacyDecorator: true,
            },
          },
        },
        suppressLegacyDecoratorNoExplicitUDFCFWarning: true,
      }),
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it("defaults jsc, legacyDecorator", () => {
    expect(
      checkSwcOptionsOnce({
        swcOptions: {},
        suppressLegacyDecoratorNoExplicitUDFCFWarning: false,
      }),
    ).toStrictEqual({
      jsc: null,
      legacyDecorator: false,
    });
  });
});
