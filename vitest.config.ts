import { defineConfig, mergeConfig } from "vitest/config";
import { getResolvedViteConfig } from 'viteup/pure';

export default mergeConfig(
	getResolvedViteConfig(),
	defineConfig({
		test: {
			include: ["./src/__tests__/*.spec.ts"],
		},
	}),
);
