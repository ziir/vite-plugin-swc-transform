import type { JscConfig, TransformConfig } from "@swc/core";
import type { SWCOptions } from "./index.js";

export function checkSwcOptionsOnce({
	swcOptions,
	suppressLegacyDecoratorNoExplicitUDFCFWarning,
}: {
	swcOptions: SWCOptions;
	suppressLegacyDecoratorNoExplicitUDFCFWarning: boolean;
}) {
	const jsc = swcOptions.jsc ?? null;
	const legacyDecorator = jsc ? jsc.transform?.legacyDecorator === true : false;

	if (legacyDecorator) {
		const legacyDecoratorNoExplicitUDFCF = !(
			"useDefineForClassFields" in
			((jsc as JscConfig).transform as TransformConfig)
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
					" - pass vite-plugin-swc-transform option 'suppressLegacyDecoratorNoExplicitUDFCFWarning: true'",
			);
		}
	}

	return { jsc, legacyDecorator };
}
