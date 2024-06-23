import {
	type FilterPattern as RollupFilterPattern,
	createFilter,
} from "@rollup/pluginutils";
import { type Options as SWCOptions, transform } from "@swc/core";
import type { Plugin } from "vite";

import { checkSwcOptionsOnce } from "./check-options-once.js";
import { getTransformOptions } from "./get-transform-options.js";
import type { Params } from "./types.js";

const EMPTY_OBJECT = Object.freeze({});

let _swcOptions = EMPTY_OBJECT;

function transformFile(
	id: string,
	code: string,
	swcOptions: NonNullable<Params["swcOptions"]>,
	suppressLegacyDecoratorNoExplicitUDFCFWarning: NonNullable<
		Params["suppressLegacyDecoratorNoExplicitUDFCFWarning"]
	>,
) {
	const [filepath] = id.split("?", 1);

	if (_swcOptions === EMPTY_OBJECT) {
		const { jsc, legacyDecorator } = checkSwcOptionsOnce({
			swcOptions,
			suppressLegacyDecoratorNoExplicitUDFCFWarning,
		});
		_swcOptions = getTransformOptions({ swcOptions, jsc, legacyDecorator });
	}

	const transformOptions: SWCOptions = Object.assign(
		{
			filename: id,
			sourceFileName: filepath,
		},
		_swcOptions,
	);

	return transform(code, transformOptions);
}

export default function createViteSWCTransformPlugin({
	include,
	exclude,
	suppressLegacyDecoratorNoExplicitUDFCFWarning = false,
	swcOptions,
}: Params = {}) {
	const filter = createFilter(include ?? /\.tsx?$/, exclude ?? /node_modules/);
	return {
		name: "swc-transform",
		enforce: "pre",
		config() {
			return {
				esbuild: false,
				target: "esnext",
			};
		},
		configResolved(resolvedConfig) {},
		transform(code, id) {
			if (!filter(id)) return null;
			return transformFile(
				id,
				code,
				swcOptions ?? EMPTY_OBJECT,
				suppressLegacyDecoratorNoExplicitUDFCFWarning,
			);
		},
	} satisfies Plugin;
}

export type { Params, RollupFilterPattern, SWCOptions };
