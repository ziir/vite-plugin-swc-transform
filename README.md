# vite-plugin-swc-transform [![npm](https://img.shields.io/npm/v/vite-plugin-swc-transform)](https://www.npmjs.com/package/vite-plugin-swc-transform)

Transform your TypeScript / JavaScript source files with [SWC](https://swc.rs) within your [Vite](vitejs.dev/) **build** process.

- Sane defaults for [TypeScript's legacy / experimental decorators & metadata](https://www.typescriptlang.org/docs/handbook/decorators.html).
- Full control over the rest of [SWC's configuration](https://swc.rs/docs/configuration).

Read the blog post relating the story which led to the creation of this plugin: [TypeScript Legacy Experimental Decorators with Type Metadata in 2023](https://timtech.blog/posts/transform-typescript-legacy-decorators-vite-swc-plugin/).

## Installation

```sh
npm i --save-dev vite-plugin-swc-transform
```

## Usage

_Note:_ This package is **ESM-only**.

### Default [SWC](https://swc.rs/docs/configuration) transform options

```js
import { defineConfig } from "vite";
import swc from "vite-plugin-swc-transform";

export default defineConfig({
  plugins: [swc()],
});
```

The plugin will default to the following options:

```js
{
  include: /\.tsx?$/,
  exclude: /node_modules/,

  swcOptions: {
    {
      swcrc: false,
      configFile: false,
      inputSourceMap: false,
      sourceMaps: true
    }
  },

  suppressLegacyDecoratorNoExplicitUDFCFWarning: false
}
```

### Transform TypeScript Legacy / Experimental Decorators with Metadata

Example use case: build a package leveraging [Nest](https://docs.nestjs.com/providers) style **dependency injection** with [Reflect.metadata](https://github.com/rbuckton/reflect-metadata).

```js
import { defineConfig } from "vite";
import swc from "vite-plugin-swc-transform";

export default defineConfig({
  plugins: [
    swc({
      swcOptions: {
        jsc: {
          target: "es2022",
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
            useDefineForClassFields: false,
          },
          // externalHelpers: true,
        },
      },
    }),
  ],
});
```

**Notes:**

- should be used alongside `"compilerOptions.experimentalDecorators": true` & `"compilerOptions.emitDecoratorMetadata": true` in your `tsconfig.json`.
- [`swcOptions.jsc.externalHelpers: true`](https://swc.rs/docs/configuration/compilation#jscexternalhelpers) is recommended when transforming TypeScript Legacy / Experimental Decorators with Metadata to avoid helpers duplication & limit bundle size impact.
  - adding the `@swc/helpers` dependency is then necessary.

The above (without external helpers) will yield the following SWC transform options:

```js
{
  swcrc: false,
  configFile: false,
  inputSourceMap: false,
  sourceMaps: true,
  jsc: {
    target: 'es2022',
    transform: {
      legacyDecorator: true,
      decoratorMetadata: true,
      useDefineForClassFields: false
    },
    keepClassNames: true,
    parser: {
      decorators: true,
      decoratorsBeforeExport: true,
      syntax: 'typescript'
    }
  }
}
```

### Notes

- This plugin does not read, validate or infer from the project's `tsconfig.json` configuration.
- This plugin is intended to be used with an inlined `swcOptions` SWC configuration object.

### 'useDefineForClassFields' warning

```
[vite-plugin-swc-transform] SWC option 'jsc.transform.legacyDecorator' enabled without an explicit 'jsc.transform.useDefineForClassFields' value.
To remove this warning, either:
 - unset or disable SWC option 'jsc.transform.legacyDecorator' if not needed
 - set an explicit value for SWC option 'jsc.transform.useDefineForClassFields: boolean'
 - pass vite-plugin-swc-transform option 'suppressLegacyDecoratorNoExplicitUDFCFWarning: true'
```

[Learn more](https://twitter.com/tpillard/status/1714545623813218388);

Please open an issue if you think this is incorrect or should be improved.
