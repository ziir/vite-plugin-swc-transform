import type { JscConfig } from "@swc/core";
import type { Params } from "./types.js";

export function getTransformOptions({
	swcOptions,
	jsc,
	legacyDecorator,
}: {
	swcOptions: NonNullable<Params["swcOptions"]>;
	jsc: JscConfig | null;
	legacyDecorator: boolean;
}) {
	return {
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
