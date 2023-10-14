# vite-plugin-swc-transform [![npm](https://img.shields.io/npm/v/vite-plugin-swc-transform)](https://www.npmjs.com/package/vite-plugin-swc-transform)

Transform your TypeScript / JavaScript source files with [SWC](https://swc.rs) within your [Vite](vitejs.dev/) build process.

- Sane defaults for [TypeScript's legacy / experimental decorators & metadata](https://www.typescriptlang.org/docs/handbook/decorators.html).
- Full control over the rest of [SWC's configuration](https://swc.rs/docs/configuration).

Read blog post of the story which led to the creation of this plugin: [TypeScript Legacy Experimental Decorators with Type Metadata in 2023](https://timtech.blog/posts/transform-typescript-legacy-decorators-vite-swc-plugin/).

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

_Note:_ the plugin will default to the following options:

```js
{
  include: /\.tsx?$/,
  exclude: /node_modules/,
  swcOptions: {
    swcrc: false,
    configFile: false,
    inputSourceMap: false,
    sourceMaps: true,
    jsc: {
      keepClassNames: false,
      parser: {
        decorators: false,
        decoratorsBeforeExport: false,
        exportDefaultFrom: false,
        syntax: 'ecmascript'
      },
      transform: { legacyDecorator: false }
    }
  },
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
          },
          // externalHelpers: true,
        },
      },
    }),
  ],
});
```

**Notes:**

- should be used alongside `"compilerOptions.experimentalDecorators": false` & `"compilerOptions.emitDecoratorMetadata": false` in your `tsconfig.json`.
- [`swcOptions.jsc.externalHelpers: true`](https://swc.rs/docs/configuration/compilation#jscexternalhelpers) is recommended when transforming TypeScript Legacy / Experimental Decorators with Metadata.
- adding the `@swc/helpers` dependency is then necessary.

The above (without external helpers) will yield the following SWC transfrom options:

```js
{
  swcrc: false,
  configFile: false,
  inputSourceMap: false,
  sourceMaps: true,
  jsc: {
    target: 'es2022',
    transform: { legacyDecorator: true, decoratorMetadata: true },
    keepClassNames: true,
    parser: {
      decorators: true,
      decoratorsBeforeExport: true,
      exportDefaultFrom: true,
      syntax: 'typescript'
    }
  }
}
```

### Notes

- This plugin does not read, validate or infer from your `tsconfig.json` configuration.
- This plugin is intended to be used with an inlined `swcOptions` SWC configuration object.
