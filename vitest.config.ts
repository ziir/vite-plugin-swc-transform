import type { UserConfig } from "vite";
import { defineConfig, mergeConfig } from "vitest/config";
import { getResolvedViteConfig } from 'viteup/pure';

const config: UserConfig = mergeConfig(
	getResolvedViteConfig(),
	defineConfig({
		test: {
			include: ["./src/__tests__/*.spec.ts"],
		},
	})
);
export default config;
